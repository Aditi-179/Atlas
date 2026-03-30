from pymongo import MongoClient
import os
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

if not MONGO_URI:
	raise ValueError("MONGO_URI is missing in environment")

uri_db_name = urlparse(MONGO_URI).path.lstrip("/")
db_name = MONGO_DB_NAME or uri_db_name or "aegis_db"

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client[db_name]

# Collections
predictions_collection = db["predictions"]