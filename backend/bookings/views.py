
from bson import ObjectId
from django.conf import settings

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from common.auth import firebase_auth_required
from .serializers import BookingSerializer

from common.mongodb import db
from .payment_service import create_checkout_session

from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP

import stripe


from .services import (
    create_booking,
    get_user_bookings,
)

@api_view(["POST"])
@firebase_auth_required
def create_booking_view(request):

    serializer = BookingSerializer(
        data=request.data
    )

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    booking_id, error_message = create_booking(
        serializer.validated_data,
        request.firebase_user["uid"],
    )

    if error_message:
        return Response(
            {
                "message": error_message
            },
            status=status.HTTP_409_CONFLICT,
        )

    return Response(
        {
            "message": "Booking Confirmed",
            "booking_id": booking_id,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@firebase_auth_required
def my_bookings(request):

    bookings = get_user_bookings(
        request.firebase_user["uid"]
    )

    return Response(bookings)

@api_view(["POST"])
@firebase_auth_required
def create_payment_session(request):
    show_id = request.data.get("show_id")
    seat_numbers = request.data.get("seats")

    if not show_id or not isinstance(seat_numbers, list) or not seat_numbers:
        return Response(
            {"message": "show_id and seats are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Reject duplicate seat numbers.
    if len(seat_numbers) != len(set(seat_numbers)):
        return Response(
            {"message": "Duplicate seat numbers are not allowed"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not all(isinstance(seat, str) and seat for seat in seat_numbers):
        return Response(
            {"message": "Invalid seat numbers"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        show_object_id = ObjectId(show_id)
    except Exception:
        return Response(
            {"message": "Invalid show ID"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    firebase_uid = request.firebase_user["uid"]

    shows_collection = db["shows"]
    seats_collection = db["seats"]
    payments_collection = db["payments"]

    show = shows_collection.find_one({"_id": show_object_id})

    if not show:
        return Response(
            {"message": "Show not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    now = datetime.utcnow()

    # All requested seats must still be held by this user.
    held_count = seats_collection.count_documents({
        "show_id": show_id,
        "seat_number": {"$in": seat_numbers},
        "status": "held",
        "locked_by": firebase_uid,
        "lock_expiry": {"$gt": now},
    })

    if held_count != len(seat_numbers):
        return Response(
            {"message": "Some seat reservations have expired or are invalid"},
            status=status.HTTP_409_CONFLICT,
        )

    # Calculate the price from the database, not the frontend.
    try:
        price_in_paise = int(
            (Decimal(str(show["price"])) * 100).quantize(
                Decimal("1"),
                rounding=ROUND_HALF_UP,
            )
        )
    except Exception:
        return Response(
            {"message": "Invalid show price"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    if price_in_paise <= 0:
        return Response(
            {"message": "Show price must be positive"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    total_in_paise = price_in_paise * len(seat_numbers)

    # Create a persistent payment attempt before contacting Stripe.
    payment = {
        "firebase_uid": firebase_uid,
        "show_id": show_id,
        "seats": seat_numbers,
        "amount": total_in_paise,
        "currency": "inr",
        "status": "pending",
        "created_at": now,
        "stripe_session_id": None,
    }

    payment_result = payments_collection.insert_one(payment)
    payment_id = str(payment_result.inserted_id)

    try:
        session_data = create_checkout_session(
            booking_reference=payment_id,
            show=show,
            seat_numbers=seat_numbers,
            firebase_uid=firebase_uid,
        )

        payments_collection.update_one(
            {"_id": payment_result.inserted_id},
            {
                "$set": {
                    "stripe_session_id": session_data["session_id"],
                }
            },
        )

    except (stripe.StripeError, ValueError) as exc:
        payments_collection.update_one(
            {"_id": payment_result.inserted_id},
            {"$set": {"status": "session_creation_failed"}},
        )

        return Response(
            {"message": "Unable to start payment. Please try again."},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    return Response(
        {
            "payment_id": payment_id,
            "checkout_url": session_data["checkout_url"],
        },
        status=status.HTTP_201_CREATED,
    )
    

@api_view(["GET"])
@firebase_auth_required
def get_payment_status(request):
    from common.mongodb import db

    session_id = request.query_params.get("session_id", "").strip()

    if not session_id:
        return Response(
            {"error": "Stripe session_id is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    firebase_uid = request.firebase_user["uid"]

    payment = db["payments"].find_one({
        "stripe_session_id": session_id,
        "firebase_uid": firebase_uid,
    })

    if not payment:
        return Response(
            {"error": "Payment not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    payment_status = payment.get("status", "pending")

    status_messages = {
        "pending": "Payment is awaiting confirmation.",
        "processing": "Payment received; booking confirmation is in progress.",
        "paid": "Payment successful and booking confirmed.",
        "failed": "Payment failed.",
        "expired": "The checkout session expired.",
        "verification_failed": "Payment verification failed. Please contact support.",
        "paid_booking_failed": (
            "Payment succeeded, but booking confirmation failed. "
            "Please contact support."
        ),
        "session_creation_failed": "Unable to create the checkout session.",
    }

    return Response({
        "payment_status": payment_status,
        "message": status_messages.get(
            payment_status,
            "Payment status is being checked.",
        ),
        "booking_id": payment.get("booking_id"),
    }, status=status.HTTP_200_OK)
