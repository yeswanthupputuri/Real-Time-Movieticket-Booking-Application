from django.contrib import admin
from django.urls import include, path

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [

    path("admin/", admin.site.urls),

    path("api/", include("common.urls")),


    path("api/users/", include("users.urls")),
    path("api/admin/", include("adminpanel.urls")),
    path("api/movies/", include("movies.urls")),
    path("api/seats/", include("seats.urls")),
    path("api/shows/", include("shows.urls")), 
    path("api/bookings/", include("bookings.urls")),
]   

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )