from common.mongodb import db

movies_collection = db["movies"]
shows_collection = db["shows"]
bookings_collection = db["bookings"]
seats_collection = db["seats"]


def dashboard_statistics(
    firebase_uid
):
    admin_movies = list(
        movies_collection.find(
            {
                "admin_uid": firebase_uid
            },
            {
                "_id": 1
            }
        )
    )

    movie_ids = [
        str(movie["_id"])
        for movie in admin_movies
    ]

    total_movies = len(movie_ids)
    admin_shows = list(
        shows_collection.find(
            {
                "movie_id": {
                    "$in": movie_ids
                }
            },
            {
                "_id": 1
            }
        )
    )

    show_ids = [
        str(show["_id"])
        for show in admin_shows
    ]

    total_shows = len( show_ids)

    # Bookings belonging to admin's movies
    booking_filter = {
        "movie_id": {
            "$in": movie_ids
        }
    }

    total_bookings = (
        bookings_collection.count_documents(
            booking_filter
        )
    )

    confirmed_booking_filter = {
        "movie_id": {
            "$in": movie_ids
        },
        "status": "confirmed",
    }

    confirmed_bookings = (
        bookings_collection.count_documents(
            confirmed_booking_filter
        )
    )

    # Revenue
    revenue_result = list(
        bookings_collection.aggregate(
            [
                {
                    "$match": confirmed_booking_filter
                },
                {
                    "$group": {
                        "_id": None,
                        "total": {
                            "$sum": "$amount"
                        },
                    }
                },
            ]
        )
    )

    total_revenue = 0
    if revenue_result:
        total_revenue = (
            revenue_result[0].get(
                "total", 0
            )
        )

    # Seats
    if show_ids:
        total_seats = (
            seats_collection.count_documents(
                {
                    "show_id": {
                        "$in": show_ids
                    }
                }
            )
        )

        booked_seats = (
            seats_collection.count_documents(
                {
                    "show_id": {
                        "$in": show_ids
                    },
                    "status": "booked",
                }
            )
        )

        held_seats = (
            seats_collection.count_documents(
                {
                    "show_id": {
                        "$in": show_ids
                    },
                    "status": "held",
                }
            )
        )

        available_seats = (
            seats_collection.count_documents(
                {
                    "show_id": {
                        "$in": show_ids
                    },
                    "status": "available",
                }
            )
        )

    else:
        total_seats = 0
        booked_seats = 0
        held_seats = 0
        available_seats = 0

    # Return Dashboard
    return {

        "total_movies": total_movies,
        "total_shows": total_shows,
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed_bookings,
        "total_revenue": total_revenue,
        "total_seats": total_seats,
        "booked_seats": booked_seats,
        "held_seats": held_seats,
        "available_seats": available_seats,

    }