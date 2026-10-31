
import logging

import stripe
from bson import ObjectId

from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from common.mongodb import db
from .services import create_booking

logger = logging.getLogger(__name__)

@csrf_exempt
@require_POST
def stripe_webhook(request):
    webhook_secret = settings.STRIPE_WEBHOOK_SECRET

    if not webhook_secret:
        return HttpResponse(
            "Webhook signing secret is not configured",
            status=500,
        )

    signature = request.headers.get("Stripe-Signature", "")

    try:
        event = stripe.Webhook.construct_event(
            request.body,
            signature,
            webhook_secret,
        )
    except (ValueError, stripe.SignatureVerificationError):
        return HttpResponse("Invalid webhook", status=400)

    event_type = event["type"]

    supported_events = {
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
        "checkout.session.async_payment_failed",
        "checkout.session.expired",
    }

    if event_type not in supported_events:
        return HttpResponse(status=200)

    session = event["data"]["object"].to_dict()
    metadata = session.get("metadata") or {}
    payment_id = metadata.get("payment_id")

    if not payment_id:
        return HttpResponse("Missing payment reference", status=400)

    try:
        payment_object_id = ObjectId(payment_id)
    except Exception:
        return HttpResponse("Invalid payment reference", status=400)

    payments = db["payments"]
    payment = payments.find_one({"_id": payment_object_id})

    if not payment:
        return HttpResponse("Payment record not found", status=404)

    if payment.get("stripe_session_id") != session.get("id"):
        return HttpResponse("Checkout Session mismatch", status=400)

    # Verify that the session metadata matches our payment record.
    if (
        metadata.get("firebase_uid") != payment.get("firebase_uid")
        or metadata.get("show_id") != payment.get("show_id")
    ):
        return HttpResponse("Payment metadata mismatch", status=400)

    expected_seats = sorted(payment.get("seats", []))
    metadata_seats = sorted(
        seat
        for seat in metadata.get("seat_numbers", "").split(",")
        if seat
    )

    if expected_seats != metadata_seats:
        return HttpResponse("Seat metadata mismatch", status=400)

    # Handle sessions that expired or asynchronous payments that failed.
    if event_type == "checkout.session.expired":
        payments.update_one(
            {
                "_id": payment_object_id,
                "status": {"$in": ["pending", "session_creation_failed"]},
            },
            {
                "$set": {
                    "status": "expired",
                }
            },
        )
        return HttpResponse(status=200)

    if event_type == "checkout.session.async_payment_failed":
        payments.update_one(
            {
                "_id": payment_object_id,
                "status": {"$in": ["pending", "session_creation_failed"]},
            },
            {
                "$set": {
                    "status": "failed",
                }
            },
        )
        return HttpResponse(status=200)

    if session.get("payment_status") != "paid":
        return HttpResponse(status=200)

    expected_amount = payment.get("amount")
    actual_amount = session.get("amount_total")
    actual_currency = (session.get("currency") or "").lower()

    if (
        not isinstance(expected_amount, int)
        or actual_amount != expected_amount
        or actual_currency != "inr"
        or metadata.get("amount_paise") != str(expected_amount)
    ):
        logger.error(
            "Payment verification failed for payment %s",
            payment_id,
        )
        payments.update_one(
            {"_id": payment_object_id},
            {
                "$set": {
                    "status": "verification_failed",
                }
            },
        )
        return HttpResponse("Payment verification failed", status=400)

    # If a booking already exists for this payment, don't create another.
    existing_booking = db["bookings"].find_one(
        {"payment_id": payment_id}
    )

    if existing_booking:
        db["payments"].update_one(
            {"_id": payment_object_id},
            {
                "$set": {
                    "status": "paid",
                    "booking_id": str(existing_booking["_id"]),
                }
            },
        )
        return HttpResponse(status=200)

    claim_result = payments.update_one(
        {
            "_id": payment_object_id,
            "status": "pending",
        },
        {
            "$set": {
                "status": "processing",
            }
        },
    )

    if claim_result.modified_count != 1:
        latest_payment = payments.find_one(
            {"_id": payment_object_id}
        )

        if latest_payment and latest_payment.get("status") == "paid":
            return HttpResponse(status=200)

        if latest_payment and latest_payment.get("status") == "processing":
            return HttpResponse(
                "Payment is being processed",
                status=500,
            )

        return HttpResponse(status=200)

    # Only now, after verifying payment, attempt to confirm the booking.
    booking_data = {
        "show_id": payment["show_id"],
        "seats": payment["seats"],
    }

    try:
        booking_id, error = create_booking(
            booking_data,
            payment["firebase_uid"],
            payment_id=payment_id,
        )

    except Exception:
        logger.exception(
            "Booking creation failed for payment %s",
            payment_id,
        )

        payments.update_one(
            {
                "_id": payment_object_id,
                "status": "processing",
            },
            {
                "$set": {
                    "status": "pending",
                }
            },
        )
        return HttpResponse(
            "Unable to complete booking",
            status=500,
        )

    if not booking_id:
        logger.error(
            "Payment %s succeeded but booking failed: %s",
            payment_id,
            error,
        )

        payments.update_one(
            {
                "_id": payment_object_id,
                "status": "processing",
            },
            {
                "$set": {
                    "status": "paid_booking_failed",
                    "booking_error": error,
                }
            },
        )

        return HttpResponse(status=200)

    # Store the confirmed booking ID on the payment record.
    payments.update_one(
        {
            "_id": payment_object_id,
            "status": "processing",
        },
        {
            "$set": {
                "status": "paid",
                "booking_id": booking_id,
            }
        },
    )

    # Record the Stripe event for debugging and auditing.
    db["stripe_webhook_events"].update_one(
        {"_id": event["id"]},
        {
            "$setOnInsert": {
                "event_type": event_type,
                "payment_id": payment_id,
            }
        },
        upsert=True,
    )

    return HttpResponse(status=200)
