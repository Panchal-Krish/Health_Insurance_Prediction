from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from zoneinfo import ZoneInfo
import uuid

app = Flask(__name__)
CORS(app)

# ==============================
# MongoDB Connection
# ==============================
MONGO_URI = "mongodb+srv://user:user123@cluster0.cmu27ib.mongodb.net/"
client = MongoClient(MONGO_URI)

db = client["insurance_data"]
users_collection = db["customers"]
premium_collection = db["premium_history"]
tickets_collection = db["support_tickets"]

premium_collection.create_index("email", unique=True)

# ==============================
# Premium Calculation Logic
# ==============================
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

# ==============================
# SIGNUP
# ==============================
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
        "password": generate_password_hash(password),
        "role": "user"
    })

    return jsonify({"message": "Signup successful"}), 201

# ==============================
# LOGIN
# ==============================
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = users_collection.find_one({"email": email})

    if not user or not check_password_hash(user["password"], password):
        return jsonify({"message": "Invalid email or password"}), 401

    return jsonify({
        "message": "Login successful",
        "email": email,
        "role": user.get("role", "user")
    }), 200

# ==============================
# PREDICT PREMIUM
# ==============================
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

# ==============================
# PREMIUM HISTORY
# ==============================
@app.route("/premium-history/<email>", methods=["GET"])
def premium_history(email):
    record = premium_collection.find_one({"email": email}, {"_id": 0})

    if not record:
        return jsonify(None), 200

    if "last_checked_at" in record:
        record["last_checked_at"] = record["last_checked_at"].isoformat()

    return jsonify(record), 200

# ====================================================
#                HELP DESK SYSTEM
# ====================================================

# CREATE TICKET
@app.route("/create-ticket", methods=["POST"])
def create_ticket():
    data = request.json

    ticket = {
        "ticket_id": "TICK-" + str(uuid.uuid4())[:6],
        "email": data.get("email"),
        "subject": data.get("subject"),
        "description": data.get("description"),
        "category": data.get("category"),
        "priority": data.get("priority"),

        "status": "Open",

        "assigned_to": None,
        "assigned_role": None,

        "admin_response": "",

        "created_at": datetime.now(ZoneInfo("Asia/Kolkata"))
    }

    tickets_collection.insert_one(ticket)

    return jsonify({
        "message": "Ticket created successfully",
        "ticket_id": ticket["ticket_id"]
    }), 201

# GET USER TICKETS
@app.route("/my-tickets/<email>", methods=["GET"])
def get_user_tickets(email):

    tickets = list(
        tickets_collection.find({"email": email}, {"_id": 0})
    )

    for ticket in tickets:
        ticket["created_at"] = ticket["created_at"].isoformat()

    return jsonify(tickets)

# ADMIN: GET ALL TICKETS
@app.route("/admin/all-tickets", methods=["GET"])
def admin_all_tickets():

    tickets = list(
        tickets_collection.find({}, {"_id": 0})
    )

    for ticket in tickets:
        ticket["created_at"] = ticket["created_at"].isoformat()

    return jsonify(tickets)

# ADMIN: ASSIGN TICKET
@app.route("/admin/assign-ticket", methods=["POST"])
def assign_ticket():

    data = request.json

    tickets_collection.update_one(
        {"ticket_id": data["ticket_id"]},
        {
            "$set": {
                "assigned_to": data["assigned_to"],
                "assigned_role": data["assigned_role"]
            }
        }
    )

    return jsonify({"message": "Ticket assigned successfully"})

# ADMIN: UPDATE TICKET STATUS / RESPONSE
@app.route("/admin/update-ticket/<ticket_id>", methods=["PUT"])
def admin_update_ticket(ticket_id):

    data = request.json

    tickets_collection.update_one(
        {"ticket_id": ticket_id},
        {
            "$set": {
                "status": data.get("status"),
                "admin_response": data.get("admin_response")
            }
        }
    )

    return jsonify({"message": "Ticket updated successfully"})

# ADMIN: CREATE MANAGER ACCOUNT
@app.route("/admin/create-manager", methods=["POST"])
def create_manager():

    data = request.json

    if users_collection.find_one({"email": data["email"]}):
        return jsonify({"message": "User already exists"}), 400

    users_collection.insert_one({
        "fullName": data["fullName"],
        "email": data["email"],
        "password": generate_password_hash(data["password"]),
        "role": "manager"
    })

    return jsonify({"message": "Manager account created"})

# MANAGER: VIEW ASSIGNED TICKETS
@app.route("/manager/my-tickets/<email>", methods=["GET"])
def manager_tickets(email):

    tickets = list(
        tickets_collection.find(
            {"assigned_to": email},
            {"_id": 0}
        )
    )

    for ticket in tickets:
        ticket["created_at"] = ticket["created_at"].isoformat()

    return jsonify(tickets)

@app.route("/manager/my-tickets/<email>", methods=["GET"])
def manager_my_tickets(email):

    tickets = list(
        tickets_collection.find(
            {"assigned_to": email},
            {"_id": 0}
        )
    )

    for ticket in tickets:
        ticket["created_at"] = ticket["created_at"].isoformat()

    return jsonify(tickets)

@app.route("/manager/update-ticket/<ticket_id>", methods=["PUT"])
def manager_update_ticket(ticket_id):

    data = request.json

    tickets_collection.update_one(
        {"ticket_id": ticket_id},
        {
            "$set": {
                "status": data.get("status"),
                "manager_response": data.get("manager_response")
            }
        }
    )

    return jsonify({"message": "Ticket updated by manager"})


# ==============================
# GET ALL MANAGERS (ADMIN)
# ==============================
@app.route("/admin/managers", methods=["GET"])
def get_managers():

    managers = list(
        users_collection.find(
            {"role": "manager"},
            {"_id": 0, "email": 1, "fullName": 1}
        )
    )

    return jsonify(managers), 200

# ==============================
# RUN SERVER
# ==============================
if __name__ == "__main__":
    app.run(debug=True) 