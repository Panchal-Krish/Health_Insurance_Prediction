from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from zoneinfo import ZoneInfo

app = Flask(__name__)
CORS(app)

# MongoDB connection
MONGO_URI = "mongodb+srv://user:user123@cluster0.cmu27ib.mongodb.net/"
client = MongoClient(MONGO_URI)

db = client["insurance_data"]
users_collection = db["customers"]
premium_collection = db["premium_history"]

# Create unique index (run once safely)
premium_collection.create_index("email", unique=True)

# ---------------- PREMIUM CALCULATION LOGIC ----------------
def calculate_premium(data):
    premium = 5000
    premium += data["age"] * 120
    premium += data["bmi"] * 150
    premium += data["children"] * 800

    if data["smoker"]:
        premium += 10000

    if data["pre_existing_diseases"]:
        premium += 7000

    if data["annual_income"] > 1000000:
        premium += 5000

    return int(premium)

# ---------------- SIGNUP ----------------
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    full_name = data.get("fullName")
    email = data.get("email")
    password = data.get("password")

    if users_collection.find_one({"email": email}):
        return jsonify({"message": "User already exists"}), 400

    users_collection.insert_one({
        "fullName": full_name,
        "email": email,
        "password": generate_password_hash(password)
    })

    return jsonify({"message": "Signup successful"}), 201

# ---------------- LOGIN ----------------
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = users_collection.find_one({"email": email})

    if not user or not check_password_hash(user["password"], password):
        return jsonify({"message": "Invalid email or password"}), 401

    return jsonify({"message": "Login successful"}), 200

# ---------------- PREDICT PREMIUM ----------------
@app.route("/predict-premium", methods=["POST"])
def predict_premium():
    data = request.json
    premium = calculate_premium(data)

    record = {
        "age": data["age"],
        "gender": data["gender"],
        "bmi": data["bmi"],
        "children": data["children"],
        "smoker": data["smoker"],
        "region": data["region"],
        "pre_existing_diseases": data["pre_existing_diseases"],
        "annual_income": data["annual_income"],
        "predicted_premium": premium,
        "last_checked_at": datetime.now(ZoneInfo("Asia/Kolkata"))
    }

    premium_collection.update_one(
        {"email": data["email"]},
        {
            "$set": record,
            "$setOnInsert": {"email": data["email"]}
        },
        upsert=True
    )

    return jsonify({"predicted_premium": premium}), 200

# ---------------- FETCH PREMIUM HISTORY ----------------
@app.route("/premium-history/<email>", methods=["GET"])
def premium_history(email):
    record = premium_collection.find_one(
        {"email": email},
        {"_id": 0}
    )

    if not record:
        return jsonify(None), 200

    if "last_checked_at" in record:
        record["last_checked_at"] = record["last_checked_at"].isoformat()

    return jsonify(record), 200

if __name__ == "__main__":
    app.run(debug=True)
