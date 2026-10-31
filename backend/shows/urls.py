from django.urls import path

from .views import (
    create_show_view, 
    update_show_view,
    list_movie_shows, 
    show_detail,
    cancel_show_view,
)

urlpatterns = [
    path( "create/", create_show_view, name="create_show"),
    path( "<str:show_id>/update/", update_show_view, name="update_show",),
    path( "movie/<str:movie_id>/", list_movie_shows, name="movie_shows",),
    path( "<str:show_id>/", show_detail, name="show_detail"),
    path( "<str:show_id>/cancel/", cancel_show_view, name="cancel_show", ),
]
