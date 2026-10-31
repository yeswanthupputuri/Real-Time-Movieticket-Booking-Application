from django.urls import path
from .webhook_views import stripe_webhook

from .views import (
    create_booking_view,
    my_bookings,
    create_payment_session,
    get_payment_status,
)

urlpatterns = [
    # POST /api/bookings/create/
    path(
        "create/",
        create_booking_view,
        name="create_booking",
    ),

    # GET /api/bookings/
    path(
        "my/",
        my_bookings,
        name="my_bookings",
    ),
    path(
        "payment/create-session/",
        create_payment_session,
        name="create_payment_session",
    ),
    path("stripe-webhook/", stripe_webhook, name="stripe_webhook"),
    
    path(
        "payment/status/",
        get_payment_status,
        name="get_payment_status",
    ),

]