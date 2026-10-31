from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from common.auth import (
    firebase_auth_required,
)

from .serializers import (
    UserRegisterSerializer,
    UserUpdateSerializer,
)

from .services import (
    create_user,
    get_user_by_firebase_uid,
    update_user_name,
)

@api_view(["POST"])
def register_user(request):

    serializer = UserRegisterSerializer(
        data=request.data
    )

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    created = create_user(
        serializer.validated_data
    )

    if not created:
        return Response(
            {
                "message": "User already exists"
            },
            status=status.HTTP_409_CONFLICT
        )

    return Response(
        {
            "message": "User Created Successfully"
        },
        status=status.HTTP_201_CREATED
    )

# Current User : GET  -> Get current user ||  PATCH -> Update current username

@api_view(["GET", "PATCH"])
@firebase_auth_required
def current_user(request):
    firebase_uid = request.firebase_user["uid"]

    if request.method == "GET":
        user = get_user_by_firebase_uid(
            firebase_uid
        )
        if not user:
            return Response(
                {
                    "message": "User profile not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(
            {
                "uid": firebase_uid,
                "email": user.get("email"),
                "name": user.get("name"),
                "role": user.get("role"),
            }
        )

    if request.method == "PATCH":
        serializer = UserUpdateSerializer(
            data=request.data
        )
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        updated_user = update_user_name(
            firebase_uid,
            serializer.validated_data["name"]
        )

        if not updated_user:
            return Response(
                {
                    "message": "User profile not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(
            {
                "message": "Username updated successfully",
                "uid": firebase_uid,
                "email": updated_user.get("email"),
                "name": updated_user.get("name"),
                "role": updated_user.get("role"),
            },
            status=status.HTTP_200_OK
        )