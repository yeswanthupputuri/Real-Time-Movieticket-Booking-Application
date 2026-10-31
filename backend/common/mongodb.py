from common.firebase import *
import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

try:
    client = MongoClient(MONGO_URI)
    # Force a connection
    client.admin.command("ping")
    db = client[MONGO_DB_NAME]
    print("✅ MongoDB Atlas Connected Successfully")

except Exception as e:
    print("❌ MongoDB Connection Failed")
    print(e)