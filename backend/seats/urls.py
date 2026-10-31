from django.urls import path

from .views import (
    list_show_seats, hold_seats_view,
)

urlpatterns = [
    path( "show/<str:show_id>/", list_show_seats, name="show_seats", ),
    path( "hold/", hold_seats_view, name="hold_seats",),
]