#loades your service accout json and intialize the firebase admin sdk
#prevents duplicate initinalization when django reloads during development


import firebase_admin

from firebase_admin import credentials

from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent

SERVICE_ACCOUNT_PATH = (
    BASE_DIR / "firebase" / "serviceAccountKey.json"
)


if not firebase_admin._apps:
    cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
    firebase_admin.initialize_app(cred)

print("✅ Firebase Admin Initialized")