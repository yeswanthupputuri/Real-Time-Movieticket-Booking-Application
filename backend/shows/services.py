
from datetime import datetime

from bson import ObjectId
from common.mongodb import db
from seats.services import initialize_seats


# MongoDB collections
shows_collection = db["shows"]
movies_collection = db["movies"]
bookings_collection = db["bookings"]
seats_collection = db["seats"]


def valid_object_id(value):
    try:
        return ObjectId(value)
    except (TypeError, ValueError):
        return None


def create_show(data, admin_uid):
    movie_object_id = valid_object_id(data["movie_id"])

    if movie_object_id is None:
        return None, "Invalid movie ID"

    movie = movies_collection.find_one({
        "_id": movie_object_id,
        "admin_uid": admin_uid,
    })

    if not movie:
        return None, "Movie not found or you do not own this movie"

    now = datetime.utcnow()

    show = {
        "movie_id": str(movie["_id"]),
        "theatre": data["theatre"],
        "city": data["city"],
        "screen": data["screen"],
        "show_date": str(data["show_date"]),
        "show_time": str(data["show_time"]),
        "price": data["price"],
        "status": "scheduled",
        "created_at": now,
        "updated_at": now,
    }

    result = shows_collection.insert_one(show)
    show_id = str(result.inserted_id)
    initialize_seats(show_id)
    return show_id, None


def get_movie_shows(movie_id, include_cancelled=False):
    query = {
        "movie_id": movie_id,
    }

    if not include_cancelled:
        query["status"] = {"$ne": "cancelled"}

    shows = list(shows_collection.find(query))

    for show in shows:
        show["_id"] = str(show["_id"])
        show.setdefault("status", "scheduled")
    return shows


def get_show(show_id):

    show_object_id = valid_object_id(show_id)

    if show_object_id is None:
        return None

    show = shows_collection.find_one({
        "_id": show_object_id,
    })

    if not show:
        return None

    movie_object_id = valid_object_id(show.get("movie_id", ""))

    if movie_object_id:
        movie = movies_collection.find_one({
            "_id": movie_object_id,
        })

        if movie:
            show["movie"] = {
                "_id": str(movie["_id"]),
                "title": movie.get("title", ""),
                "description": movie.get("description", ""),
                "genre": movie.get("genre", ""),
                "language": movie.get("language", ""),
                "duration": movie.get("duration", 0),
                "poster": movie.get("poster", ""),
            }

    show["_id"] = str(show["_id"])

    # Older show documents without a status are considered scheduled.
    show.setdefault("status", "scheduled")
    return show


def update_show(show_id, admin_uid, data):

    show_object_id = valid_object_id(show_id)

    if show_object_id is None:
        return None, "Invalid show ID"

    show = shows_collection.find_one({
        "_id": show_object_id,
    })

    if not show:
        return None, "Show not found"

    movie_object_id = valid_object_id(show.get("movie_id", ""))

    if movie_object_id is None:
        return None, "The show's movie reference is invalid"

    movie = movies_collection.find_one({
        "_id": movie_object_id,
        "admin_uid": admin_uid,
    })

    if not movie:
        return None, "You are not authorized to edit this show"

    if show.get("status") == "cancelled":
        return None, "Cancelled shows cannot be edited"

    # Do not modify a show after a booking is confirmed.
    confirmed_booking = bookings_collection.find_one({
        "show_id": str(show_object_id),
        "status": "confirmed",
    })

    if confirmed_booking:
        return None, (
            "This show has confirmed bookings and cannot be edited."
        )

    # Also protect seats that are booked or temporarily held.
    occupied_seat = seats_collection.find_one({
        "show_id": str(show_object_id),
        "status": {"$in": ["booked", "held"]},
    })

    if occupied_seat:
        return None, (
            "This show has booked or held seats and cannot be edited."
        )

    updated_fields = {
        "theatre": data["theatre"],
        "city": data["city"],
        "screen": data["screen"],
        "show_date": str(data["show_date"]),
        "show_time": str(data["show_time"]),
        "price": data["price"],
        "updated_at": datetime.utcnow(),
    }

    shows_collection.update_one(
        {"_id": show_object_id},
        {"$set": updated_fields},
    )

    return get_show(show_id), None


def cancel_show(show_id, admin_uid):
    show_object_id = valid_object_id(show_id)

    if show_object_id is None:
        return None, "Invalid show ID"

    show = shows_collection.find_one({
        "_id": show_object_id,
    })

    if not show:
        return None, "Show not found"

    movie_object_id = valid_object_id(show.get("movie_id", ""))

    if movie_object_id is None:
        return None, "Invalid movie reference"

    # Verify ownership through the movie associated with this show.
    movie = movies_collection.find_one({
        "_id": movie_object_id,
        "admin_uid": admin_uid,
    })

    if not movie:
        return None, "You are not authorized to cancel this show"

    if show.get("status") == "cancelled":
        return None, "This show is already cancelled"

    # Do not cancel while confirmed bookings exist.
    confirmed_booking = bookings_collection.find_one({
        "show_id": str(show_object_id),
        "status": "confirmed",
    })

    if confirmed_booking:
        return None, (
            "This show has confirmed bookings. "
            "Handle customer cancellations and refunds first."
        )

    # Protect booked or temporarily held seats.
    occupied_seat = seats_collection.find_one({
        "show_id": str(show_object_id),
        "status": {"$in": ["booked", "held"]},
    })

    if occupied_seat:
        return None, (
            "This show has booked or held seats and cannot be "
            "cancelled yet."
        )

    # Soft cancellation: retain the show document and its history.
    shows_collection.update_one(
        {"_id": show_object_id},
        {
            "$set": {
                "status": "cancelled",
                "updated_at": datetime.utcnow(),
            }
        },
    )
    return {
        "show_id": str(show_object_id),
        "status": "cancelled",
    }, None
