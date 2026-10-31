from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from common.auth import firebase_auth_required
from .serializers import HoldSeatSerializer

from .services import (
    get_show_seats, hold_seats,
)

@api_view(["GET"])
def list_show_seats(request, show_id):
    seats = get_show_seats(show_id)
    return Response(seats)


@api_view(["POST"])
@firebase_auth_required
def hold_seats_view(request):
    serializer = HoldSeatSerializer(
        data=request.data
    )

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    firebase_uid = request.firebase_user["uid"]

    success, message = hold_seats(
        serializer.validated_data["show_id"],
        serializer.validated_data["seat_numbers"],
        firebase_uid,
    )

    if not success:
        return Response(
            {
                "message": message
            },
            status=status.HTTP_409_CONFLICT,
        )

    return Response(
        {
            "message": message
        }
    )