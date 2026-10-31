from decimal import Decimal, ROUND_HALF_UP

import stripe
from django.conf import settings


def create_checkout_session(
    booking_reference,
    show,
    seat_numbers,
    firebase_uid,
):
    if not settings.STRIPE_SECRET_KEY:
        raise ValueError("Stripe secret key is not configured")

    stripe.api_key = settings.STRIPE_SECRET_KEY

    price_in_paise = int(
        (Decimal(str(show["price"])) * 100).quantize(
            Decimal("1"),
            rounding=ROUND_HALF_UP,
        )
    )

    if price_in_paise <= 0:
        raise ValueError("Ticket price must be greater than zero")

    if not seat_numbers:
        raise ValueError("At least one seat is required")

    total_in_paise = price_in_paise * len(seat_numbers)

    session = stripe.checkout.Session.create(
        mode="payment",
        currency="inr",
        line_items=[
            {
                "price_data": {
                    "currency": "inr",
                    "product_data": {
                        "name": "Movie ticket",
                        "description": (
                            f"Seats: {', '.join(seat_numbers)}"
                        ),
                    },
                    "unit_amount": price_in_paise,
                },
                "quantity": len(seat_numbers),
            }
        ],
        client_reference_id=booking_reference,
        metadata={
            "payment_id": booking_reference,
            "firebase_uid": firebase_uid,
            "show_id": str(show["_id"]),
            "seat_numbers": ",".join(seat_numbers),
            "amount_paise": str(total_in_paise),
        },
        payment_intent_data={
            "metadata": {
                "payment_id": booking_reference,
                "firebase_uid": firebase_uid,
            }
        },
        success_url=(
            f"{settings.FRONTEND_URL}/payment-result"
            "?session_id={CHECKOUT_SESSION_ID}"
        ),
        cancel_url=(
            f"{settings.FRONTEND_URL}/checkout"
            "?payment=cancelled"
        ),
    )

    return {
        "session_id": session.id,
        "checkout_url": session.url,
    }