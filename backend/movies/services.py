import os

from bson import ObjectId
from datetime import datetime

from common.mongodb import db

movies_collection = db["movies"]


def create_movie(data, poster_file, admin_uid):
    poster_directory = "media/posters"

    os.makedirs(
        poster_directory, exist_ok=True
    )

    poster_path = os.path.join(
        poster_directory, poster_file.name
    )

    with open(
        poster_path, "wb+"
    ) as destination:

        for chunk in poster_file.chunks():
            destination.write(chunk)


    movie = {

        "title": data["title"],
        "description": data["description"],
        "genre": data["genre"],
        "language": data["language"],
        "duration": data["duration"],
        "poster": poster_path.replace(
            "\\",
            "/"
        ),

        # Admin who created this movie
        "admin_uid": admin_uid,
        "created_at": datetime.utcnow(),

    }

    result = movies_collection.insert_one(
        movie
    )
    return str(
        result.inserted_id
    )

def get_all_movies():
    movies = list(
        movies_collection.find({})
    )

    for movie in movies:
        movie["_id"] = str(
            movie["_id"]
        )
        movie.pop(
            "admin_uid",
            None
        )
    return movies


def get_movie(movie_id):
    movie = movies_collection.find_one(
        {
            "_id": ObjectId(movie_id)
        }
    )

    if movie:
        movie["_id"] = str(
            movie["_id"]
        )

        # Do not expose admin UID
        movie.pop(
            "admin_uid",
            None
        )
    return movie


def get_admin_movies(admin_uid):
    movies = list(
        movies_collection.find(
            {
                "admin_uid": admin_uid
            }
        )
    )

    for movie in movies:
        movie["_id"] = str(
            movie["_id"]
        )
        movie.pop(
            "admin_uid",
            None
        )
    return movies

def update_movie(
    movie_id,
    admin_uid,
    data,
    poster_file=None,
):
    try:
        object_id = ObjectId(movie_id)
    except Exception:
        return None

    movie = movies_collection.find_one({
        "_id": object_id,
        "admin_uid": admin_uid,
    })

    if not movie:
        return None

    update_data = {}

    allowed_fields = [
        "title",
        "description",
        "genre",
        "language",
        "duration",
    ]

    for field in allowed_fields:
        if field in data:
            update_data[field] = data[field]

    if poster_file:
        poster_directory = "media/posters"
        os.makedirs(poster_directory, exist_ok=True)

        # Avoid collisions between uploaded poster filenames.
        import uuid

        extension = os.path.splitext(poster_file.name)[1]
        filename = f"{uuid.uuid4().hex}{extension}"
        poster_path = os.path.join(
            poster_directory,
            filename,
        )

        with open(poster_path, "wb+") as destination:
            for chunk in poster_file.chunks():
                destination.write(chunk)

        update_data["poster"] = poster_path.replace("\\", "/")

    if not update_data:
        return None

    update_data["updated_at"] = datetime.utcnow()

    movies_collection.update_one(
        {
            "_id": object_id,
            "admin_uid": admin_uid,
        },
        {"$set": update_data},
    )

    updated_movie = movies_collection.find_one({
        "_id": object_id,
        "admin_uid": admin_uid,
    })

    if updated_movie:
        updated_movie["_id"] = str(updated_movie["_id"])
        updated_movie.pop("admin_uid", None)

    return updated_movie
