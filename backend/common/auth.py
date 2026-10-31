from functools import wraps

from firebase_admin import auth

from rest_framework.response import Response
from rest_framework import status

from common.mongodb import db


users_collection = db["users"]


def verify_firebase_token(request):

    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return None, Response(
            {
                "error": "Authorization header missing"
            },
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not auth_header.startswith("Bearer "):
        return None, Response(
            {
                "error": "Invalid Authorization header"
            },
            status=status.HTTP_401_UNAUTHORIZED
        )

    id_token = auth_header.split(
        "Bearer ",
        1
    )[1]

    try:

        decoded_token = auth.verify_id_token(
            id_token
        )

        return decoded_token, None

    except Exception:

        return None, Response(
            {
                "error": "Invalid Firebase Token"
            },
            status=status.HTTP_401_UNAUTHORIZED
        )


def firebase_auth_required(view_func):

    @wraps(view_func)
    def wrapper(request, *args, **kwargs):

        decoded_token, error_response = (
            verify_firebase_token(request)
        )

        if error_response:

            return error_response

        request.firebase_user = decoded_token

        return view_func(
            request,
            *args,
            **kwargs
        )

    return wrapper


def admin_required(view_func):

    @wraps(view_func)
    def wrapper(request, *args, **kwargs):

        # First verify Firebase authentication
        decoded_token, error_response = (
            verify_firebase_token(request)
        )

        if error_response:

            return error_response

        firebase_uid = decoded_token.get("uid")

        if not firebase_uid:

            return Response(
                {
                    "error": "Invalid Firebase user"
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Find the corresponding user in MongoDB
        user = users_collection.find_one(
            {
                "firebase_uid": firebase_uid
            }
        )

        if not user:

            return Response(
                {
                    "error": "User profile not found"
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        user_role = str( user.get("role", "") ).strip().lower()
        
        
        # Check role
        if user_role != "admin":

            return Response(
                {
                    "error": "Admin access required"
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Store Firebase user information
        request.firebase_user = decoded_token

        # Store MongoDB user information
        request.user_profile = user

        return view_func(
            request,
            *args,
            **kwargs
        )

    return wrapper