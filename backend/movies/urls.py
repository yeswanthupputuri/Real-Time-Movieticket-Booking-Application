from django.urls import path

from .views import (
    create_movie_view,
    list_movies,
    movie_detail,
    admin_movies,
    update_movie_view,
)


urlpatterns = [

    path(
        "",
        list_movies,
        name="list_movies",
    ),

    path(
        "create/",
        create_movie_view,
        name="create_movie",
    ),

    path(
        "admin/",
        admin_movies,
        name="admin_movies",
    ),

    path(
        "<str:movie_id>/",
        movie_detail,
        name="movie_detail",
    ),

    path(
        "<str:movie_id>/update/",
        update_movie_view,
        name="update_movie",
    ),

]