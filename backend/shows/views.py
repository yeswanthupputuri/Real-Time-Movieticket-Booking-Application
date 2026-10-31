
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from common.auth import admin_required
from .serializers import ShowSerializer
from .services import (
    create_show,
    get_movie_shows,
    get_show,
    update_show,
    cancel_show,
)


@api_view(["POST"])
@admin_required
def create_show_view(request):
    serializer = ShowSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    show_id, error = create_show(
        serializer.validated_data,
        request.firebase_user["uid"],
    )

    if error:
        return Response(
            {"message": error},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        {
            "message": "Show Created Successfully",
            "show_id": show_id,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["PUT"])
@admin_required
def update_show_view(request, show_id):
    serializer = ShowSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    updated_show, error = update_show(
        show_id,
        request.firebase_user["uid"],
        serializer.validated_data,
    )

    if error:
        if error == "Show not found":
            return Response(
                {"message": error},
                status=status.HTTP_404_NOT_FOUND,
            )

        if error == "You are not authorized to edit this show":
            return Response(
                {"message": error},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(
            {"message": error},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        {
            "message": "Show updated successfully",
            "show": updated_show,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
def list_movie_shows(request, movie_id):
    include_cancelled = (
        request.query_params.get("include_cancelled") == "true"
    )

    shows = get_movie_shows(
        movie_id,
        include_cancelled=include_cancelled,
    )
    return Response(shows)

@api_view(["GET"])
def show_detail(request, show_id):
    show = get_show(show_id)

    if not show:
        return Response(
            {"message": "Show Not Found"},
            status=status.HTTP_404_NOT_FOUND,
        )
    return Response(show)

@api_view(["POST"])
@admin_required
def cancel_show_view(request, show_id):
    result, error = cancel_show(
        show_id,
        request.firebase_user["uid"],
    )

    if error:
        if error == "Show not found":
            return Response(
                {"message": error},
                status=status.HTTP_404_NOT_FOUND,
            )

        if error == "You are not authorized to cancel this show":
            return Response(
                {"message": error},
                status=status.HTTP_403_FORBIDDEN,
            )

        if error == "This show is already cancelled":
            return Response(
                {"message": error},
                status=status.HTTP_409_CONFLICT,
            )

        return Response(
            {"message": error},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        {
            "message": "Show cancelled successfully",
            **result,
        },
        status=status.HTTP_200_OK,
    )

