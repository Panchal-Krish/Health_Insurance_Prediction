import sys
from pymongo import MongoClient
from config import Config

if not Config.MONGO_URI:
    raise RuntimeError("MONGO_URI is not set in .env")

try:
    client              = MongoClient(Config.MONGO_URI)
    db                  = client["insurance_data"]
    users_collection    = db["customers"]
    prediction_logs     = db["prediction_logs"]
    tickets_collection  = db["support_tickets"]
    contacts_collection = db["contacts"]
    email_tokens_collection = db["email_tokens"]

    users_collection.create_index("email", unique=True)
    prediction_logs.create_index("user_id")
    tickets_collection.create_index("user_id")
    contacts_collection.create_index("created_at")
    email_tokens_collection.create_index("expires_at", expireAfterSeconds=0)

    print("Database connected successfully")
except Exception as e:
    print(f"Database connection failed: {e}")
    sys.exit(1)
