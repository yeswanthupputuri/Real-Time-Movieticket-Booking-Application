from datetime import datetime

from common.mongodb import db

users_collection = db["users"]

def create_user(data):
    existing = users_collection.find_one(
        {
            "firebase_uid": data["firebase_uid"]
        }
    )

    if existing:
        return False

    user = {
        "firebase_uid": data["firebase_uid"],
        "name": data["name"],
        "email": data["email"],
        "role": data["role"],
        "created_at": datetime.utcnow(),
    }

    users_collection.insert_one(user)
    return True


def get_user_by_firebase_uid(
    firebase_uid
):

    user = users_collection.find_one(
        {
            "firebase_uid": firebase_uid
        }
    )
    return user


def update_user_name(
    firebase_uid, name
):

    result = users_collection.update_one(
        {
            "firebase_uid": firebase_uid
        },
        {
            "$set": {
                "name": name
            }
        }
    )

    if result.matched_count == 0:
        return None

    return get_user_by_firebase_uid(
        firebase_uid
    )