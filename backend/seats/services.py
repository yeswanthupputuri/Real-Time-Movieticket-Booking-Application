from datetime import datetime, timedelta
from bson import ObjectId
from common.mongodb import db

seats_collection = db["seats"]

ROWS = ["A", "B", "C", "D", "E"]
COLS = range(1, 9)

def initialize_seats(show_id):
    existing = seats_collection.count_documents(
        {
            "show_id": show_id
        }
    )
    if existing > 0:
        return
    seats = []

    for row in ROWS:
        for col in COLS:
            seats.append(
                {
                    "show_id": show_id,
                    "seat_number": f"{row}{col}",
                    "status": "available",
                    "locked_by": None,
                    "lock_expiry": None,
                }
            )
    seats_collection.insert_many(seats)


def release_expired_holds():

    now = datetime.utcnow()
    seats_collection.update_many(
        {
            "status": "held",
            "lock_expiry": {
                "$lte": now
            }
        },
        {
            "$set": {
                "status": "available",
                "locked_by": None,
                "lock_expiry": None,
            }
        }
    )


def get_show_seats(show_id):

    release_expired_holds()
    seats = list(
        seats_collection.find(
            {
                "show_id": show_id
            }
        )
    )

    for seat in seats:
        seat["_id"] = str(seat["_id"])

    seats.sort(
        key=lambda x: (
            x["seat_number"][0],
            int(x["seat_number"][1:])
        )
    )
    return seats

def hold_seats(
    show_id,
    seat_numbers,
    firebase_uid,
):
    expiry = datetime.utcnow() + timedelta(minutes=10)
    release_expired_holds()
    held_seats = []

    for seat_number in seat_numbers:
        seat = seats_collection.find_one_and_update(
            {
                "show_id": show_id,
                "seat_number": seat_number,
                "status": "available",
            },
            {
                "$set": {
                    "status": "held",
                    "locked_by": firebase_uid,
                    "lock_expiry": expiry,
                }
            },
            return_document=True,
        )

        if not seat:
            if held_seats:
                seats_collection.update_many(
                    {
                        "show_id": show_id,
                        "seat_number": {
                            "$in": held_seats
                        },
                        "locked_by": firebase_uid,
                        "status": "held",
                    },
                    {
                        "$set": {
                            "status": "available",
                            "locked_by": None,
                            "lock_expiry": None,
                        }
                    }
                )
            return False, f"{seat_number} is no longer available"
        held_seats.append(seat_number)
    return True, "Seats Held Successfully"