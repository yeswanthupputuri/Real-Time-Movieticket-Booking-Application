from bson import ObjectId
from datetime import datetime
from common.mongodb import db

bookings_collection = db["bookings"]
movies_collection = db["movies"]
shows_collection = db["shows"]
seats_collection = db["seats"]


def create_booking(data, firebase_uid, payment_id=None):
    show_id = data["show_id"]
    seat_numbers = data["seats"]

    if payment_id:
        existing_booking = bookings_collection.find_one(
            {"payment_id": payment_id}
        )
        if existing_booking:
            return str(existing_booking["_id"]), None

    booking_reference = payment_id or str(ObjectId())

    try:
        show_object_id = ObjectId(show_id)
    except Exception:
        return None, "Invalid show ID"

    show = shows_collection.find_one({"_id": show_object_id})

    if not show:
        return None, "Show not found"

    movie_id = show["movie_id"]
    amount = show["price"] * len(seat_numbers)
    now = datetime.utcnow()

    seats_collection.update_many(
        {
            "show_id": show_id,
            "status": "held",
            "lock_expiry": {"$lte": now},
        },
        {
            "$set": {
                "status": "available",
                "locked_by": None,
                "lock_expiry": None,
            }
        },
    )

    held_count = seats_collection.count_documents(
        {
            "show_id": show_id,
            "seat_number": {"$in": seat_numbers},
            "status": "held",
            "locked_by": firebase_uid,
            "lock_expiry": {"$gt": now},
        }
    )

    if held_count != len(seat_numbers):
        return None, "One or more selected seats are no longer reserved"

    update_result = seats_collection.update_many(
        {
            "show_id": show_id,
            "seat_number": {"$in": seat_numbers},
            "status": "held",
            "locked_by": firebase_uid,
            "lock_expiry": {"$gt": now},
        },
        {
            "$set": {
                "status": "booked",
                "lock_expiry": None,
                "booking_ref": booking_reference,
            },
            "$unset": {
                "locked_by": "",
            },
        },
    )

    # Roll back ONLY the seats claimed by this operation.
    if update_result.modified_count != len(seat_numbers):
        seats_collection.update_many(
            {
                "show_id": show_id,
                "seat_number": {"$in": seat_numbers},
                "status": "booked",
                "booking_ref": booking_reference,
            },
            {
                "$set": {
                    "status": "available",
                    "locked_by": None,
                    "lock_expiry": None,
                },
                "$unset": {
                    "booking_ref": "",
                },
            },
        )

        return None, "Unable to confirm selected seats"

    booking = {
        "firebase_uid": firebase_uid,
        "show_id": show_id,
        "movie_id": movie_id,
        "seats": seat_numbers,
        "amount": amount,
        "status": "confirmed",
        "booked_at": datetime.utcnow(),
    }

    # Link the booking to its payment when called from the webhook.
    if payment_id:
        booking["payment_id"] = payment_id
    try:
        result = bookings_collection.insert_one(booking)
    except Exception:
        # Release only the seats claimed by this operation.
        seats_collection.update_many(
            {
                "show_id": show_id,
                "seat_number": {"$in": seat_numbers},
                "status": "booked",
                "booking_ref": booking_reference,
            },
            {
                "$set": {
                    "status": "available",
                    "locked_by": None,
                    "lock_expiry": None,
                },
                "$unset": {
                    "booking_ref": "",
                },
            },
        )
        raise
    return str(result.inserted_id), None


def get_user_bookings(firebase_uid):
    bookings = list(
        bookings_collection.find(
            {
                "firebase_uid": firebase_uid
            }
        ).sort( "booked_at", -1 )
    )

    results = []
    for booking in bookings:
        movie = movies_collection.find_one(
            {
                "_id": ObjectId(
                    booking["movie_id"]
                )
            }
        )
        show = shows_collection.find_one(
            {
                "_id": ObjectId(
                    booking["show_id"]
                )
            }

        )

        # Skip invalid/orphaned bookings
        if not movie or not show:
            continue
        results.append(
            {
                "_id": str(
                    booking["_id"]
                ),
                "movie": {
                    "title": movie["title"],
                    "poster": movie["poster"],
                    "language": movie["language"],
                    "genre": movie["genre"],
                    "duration": movie["duration"],
                },
                "show": {
                    "theatre": show["theatre"],
                    "city": show["city"],
                    "screen": show["screen"],
                    "date": show["show_date"],
                    "time": show["show_time"],
                    "price": show["price"],
                },
                "seats": booking["seats"],
                "amount": booking["amount"],
                "status": booking["status"],
                "booked_at": booking["booked_at"],
            }
        )
    return results