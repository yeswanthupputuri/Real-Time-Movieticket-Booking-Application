import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()
uri = os.getenv("MONGO_URI")
print("Connecting...")
client = MongoClient(uri)
client.admin.command("ping")
print("Connected Successfully!")