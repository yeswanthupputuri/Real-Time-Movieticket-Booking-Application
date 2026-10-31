from rest_framework.decorators import (
    api_view,
    parser_classes,
)

from rest_framework.parsers import (
    MultiPartParser,
    FormParser,
)

from rest_framework.response import Response
from rest_framework import status
from common.auth import admin_required


from .serializers import (
    MovieSerializer,
    MovieUpdateSerializer,
)

from .services import (
    create_movie,
    get_all_movies,
    get_movie,
    get_admin_movies,
    update_movie,
)


@api_view(["POST"])
@parser_classes([
    MultiPartParser,
    FormParser,
])
@admin_required
def create_movie_view(request):

    print( "========== CREATE MOVIE REQUEST ==========" )

    print(
        "FILES:", request.FILES
    )

    print(
        "DATA:", request.data
    )

    serializer = MovieSerializer(
        data=request.data
    )

    if not serializer.is_valid():
        
        print("Serializer Errors:")
        print( serializer.errors)
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    admin_uid = request.firebase_user["uid"]

    movie_id = create_movie(
        serializer.validated_data,
        request.FILES.get(
            "poster"
        ),
        admin_uid,
    )

    return Response(
        {
            "message": "Movie Created Successfully",
            "movie_id": movie_id,
        },
        status=status.HTTP_201_CREATED
    )


@api_view(["GET"])
def list_movies(request):
    movies = get_all_movies()
    return Response(
        movies
    )


@api_view(["GET"])
def movie_detail(
    request,
    movie_id
):
    movie = get_movie(
        movie_id
    )

    if movie is None:
        return Response(
            {
                "message":
                    "Movie Not Found"
            },
            status=status.HTTP_404_NOT_FOUND
        )

    return Response(
        movie
    )

# ADMIN MOVIES

@api_view(["GET"])
@admin_required
def admin_movies(request):

    admin_uid = request.firebase_user["uid"]
    movies = get_admin_movies(
        admin_uid
    )
    return Response(
        movies
    )

# UPDATE MOVIE

@api_view(["PATCH"])
@parser_classes([
    MultiPartParser,
    FormParser,
])
@admin_required
def update_movie_view(request, movie_id):

    serializer = MovieUpdateSerializer(
        data=request.data,
        partial=True,
    )

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not serializer.validated_data:
        return Response(
            {"message": "No fields provided for update."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    admin_uid = request.firebase_user["uid"]

    updated_movie = update_movie(
        movie_id=movie_id,
        admin_uid=admin_uid,
        data=serializer.validated_data,
        poster_file=request.FILES.get("poster"),
    )

    if updated_movie is None:
        return Response(
            {
                "message": (
                    "Movie not found or you do not have "
                    "permission to edit this movie."
                )
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    return Response(
        {
            "message": "Movie Updated Successfully",
            "movie": updated_movie,
        },
        status=status.HTTP_200_OK,
    )
