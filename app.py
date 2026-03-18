from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta, timezone
from bson import ObjectId
import uuid
import jwt
import os
import joblib
import numpy as np
import pandas as pd
from functools import wraps
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# ==============================
# Configuration
# ==============================
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['JWT_EXPIRATION_HOURS'] = 24

if not app.config['SECRET_KEY']:
    raise RuntimeError("SECRET_KEY is not set in .env")

CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# ==============================
# MongoDB
# ==============================
MONGO_URI = os.getenv('MONGO_URI')
if not MONGO_URI:
    raise RuntimeError("MONGO_URI is not set in .env")

try:
    client              = MongoClient(MONGO_URI)
    db                  = client["insurance_data"]
    users_collection    = db["customers"]
    premium_collection  = db["premium_history"]
    prediction_logs     = db["prediction_logs"]
    tickets_collection  = db["support_tickets"]
    contacts_collection = db["contacts"]

    users_collection.create_index("email", unique=True)
    premium_collection.create_index("email", unique=True)
    prediction_logs.create_index("email")
    contacts_collection.create_index("created_at")

    print("✅ Database connected successfully")
except Exception as e:
    print(f"❌ Database connection failed: {e}")
    exit(1)

# ==============================
# ML Model — load once at startup
# ==============================
MODEL_PATH = os.getenv('MODEL_PATH', 'insurance_extra_trees_model.pkl')

try:
    ml_model = joblib.load(MODEL_PATH)
    print(f"✅ ML model loaded from {MODEL_PATH}")
except Exception as e:
    ml_model = None
    print(f"⚠️  ML model not loaded ({e}) — fallback formula will be used")

# ==============================
# ML Prediction
# ==============================
def predict_premium_ml(age, sex, bmi, children, smoker, region):
    """
    Feature order (matches training exactly):
    age, sex, bmi, children, smoker,
    region_northwest (bool), region_southeast (bool), region_southwest (bool),
    age_bmi, age_smoker, bmi_smoker, children_smoker, bmi_sq, age_sq

    Encoding:
      sex    — male=1, female=0
      smoker — yes=1,  no=0
      region — one-hot, northeast is base (all three False)

    Output: USD (model returns log1p value, reversed with expm1)
    """
    if ml_model is not None:
        region_northwest = (region == 'northwest')
        region_southeast = (region == 'southeast')
        region_southwest = (region == 'southwest')

        features = pd.DataFrame([{
            'age':              age,
            'sex':              sex,
            'bmi':              bmi,
            'children':         children,
            'smoker':           smoker,
            'region_northwest': region_northwest,
            'region_southeast': region_southeast,
            'region_southwest': region_southwest,
            'age_bmi':          float(age * bmi),
            'age_smoker':       int(age * smoker),
            'bmi_smoker':       float(bmi * smoker),
            'children_smoker':  int(children * smoker),
            'bmi_sq':           float(bmi ** 2),
            'age_sq':           int(age ** 2)
        }])

        log_pred = ml_model.predict(features)[0]
        return round(float(np.expm1(log_pred)), 2)

    # Fallback formula — only used if model file is missing
    print("⚠️  Using fallback formula — model not loaded")
    if bmi < 18.5:    bmi_p = 1000
    elif bmi < 25:    bmi_p = 0
    elif bmi < 30:    bmi_p = 1500
    else:             bmi_p = 3000

    region_p = {'northeast': 0, 'northwest': 500, 'southeast': 1000, 'southwest': 1500}.get(region, 0)
    return round(3000 + age*250 + bmi_p + children*500 + (20000 if smoker else 0) + (500 if sex else 0) + region_p, 2)


# ==============================
# JWT Helpers
# ==============================
def generate_token(email, role):
    try:
        payload = {
            'email': email,
            'role':  role,
            'exp':   datetime.now(timezone.utc) + timedelta(hours=app.config['JWT_EXPIRATION_HOURS']),
            'iat':   datetime.now(timezone.utc)
        }
        return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
    except Exception:
        return None

def decode_token(token):
    try:
        return jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

# ==============================
# Decorators
# ==============================
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            try:
                token = request.headers['Authorization'].split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401

        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        payload = decode_token(token)
        if not payload:
            return jsonify({'message': 'Token is invalid or expired'}), 401

        request.current_user = payload
        return f(*args, **kwargs)
    return decorated

def role_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(request, 'current_user'):
                return jsonify({'message': 'Unauthorized'}), 401
            if request.current_user.get('role') not in allowed_roles:
                return jsonify({'message': f'Access denied. Required role: {", ".join(allowed_roles)}'}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator


# ======================================================
#                   AUTH ROUTES
# ======================================================

@app.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.json
        if not all(k in data for k in ["fullName", "email", "password"]):
            return jsonify({"message": "Missing required fields"}), 400

        full_name = data.get("fullName", "").strip()
        email     = data.get("email", "").lower().strip()
        password  = data.get("password", "")

        if len(full_name) < 2:
            return jsonify({"message": "Full name must be at least 2 characters"}), 400
        if len(password) < 6:
            return jsonify({"message": "Password must be at least 6 characters"}), 400
        if users_collection.find_one({"email": email}):
            return jsonify({"message": "User already exists"}), 400

        users_collection.insert_one({
            "fullName":   full_name,
            "email":      email,
            "password":   generate_password_hash(password),
            "role":       "user",
            "created_at": datetime.now(timezone.utc)
        })
        return jsonify({"message": "Signup successful"}), 201

    except Exception as e:
        print(f"Signup error: {e}")
        return jsonify({"message": "Server error during signup"}), 500


@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        if not data or not data.get("email") or not data.get("password"):
            return jsonify({"message": "Email and password required"}), 400

        email    = data["email"].lower().strip()
        password = data["password"]

        user = users_collection.find_one({"email": email})
        if not user or not check_password_hash(user["password"], password):
            return jsonify({"message": "Invalid email or password"}), 401

        role  = user.get("role", "user")
        token = generate_token(email, role)
        if not token:
            return jsonify({"message": "Failed to generate token"}), 500

        return jsonify({
            "message":  "Login successful",
            "token":    token,
            "email":    email,
            "role":     role,
            "fullName": user.get("fullName")
        }), 200

    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({"message": "Server error during login"}), 500


# ======================================================
#                   PREDICTION ROUTES
# ======================================================

@app.route("/predict-premium", methods=["POST"])
@token_required
def predict_premium():
    try:
        data = request.json
        if not all(k in data for k in ["age", "sex", "bmi", "children", "smoker", "region"]):
            return jsonify({"message": "Missing required fields"}), 400

        age = data["age"]
        if not isinstance(age, int) or not (18 <= age <= 100):
            return jsonify({"message": "Age must be an integer between 18 and 100"}), 400

        bmi = data["bmi"]
        if not isinstance(bmi, (int, float)) or not (10 <= bmi <= 60):
            return jsonify({"message": "BMI must be a number between 10 and 60"}), 400

        children = data["children"]
        if not isinstance(children, int) or not (0 <= children <= 10):
            return jsonify({"message": "Children must be an integer between 0 and 10"}), 400

        smoker = data["smoker"]
        if smoker not in [0, 1]:
            return jsonify({"message": "Smoker must be 0 or 1"}), 400

        sex = data["sex"]
        if sex not in [0, 1]:
            return jsonify({"message": "Sex must be 0 (female) or 1 (male)"}), 400

        region = data["region"]
        if region not in ['northeast', 'northwest', 'southeast', 'southwest']:
            return jsonify({"message": "Invalid region"}), 400

        premium    = predict_premium_ml(age=age, sex=sex, bmi=bmi, children=children, smoker=smoker, region=region)
        user_email = request.current_user.get('email')
        now        = datetime.now(timezone.utc)

        # Removed annual_income and pre_existing_diseases — not used by model
        record = {
            "age":               age,
            "gender":            "male" if sex == 1 else "female",
            "bmi":               bmi,
            "children":          children,
            "smoker":            smoker == 1,
            "region":            region,
            "predicted_premium": premium,
            "last_checked_at":   now
        }

        # Latest snapshot for dashboard
        premium_collection.update_one(
            {"email": user_email},
            {"$set": record, "$setOnInsert": {"email": user_email}},
            upsert=True
        )

        # Full history log
        prediction_logs.insert_one({"email": user_email, **record})

        return jsonify({"predicted_premium": premium}), 200

    except Exception as e:
        print(f"Premium prediction error: {e}")
        return jsonify({"message": "Server error during prediction"}), 500


@app.route("/premium-history", methods=["GET"])
@token_required
def premium_history():
    try:
        user_email = request.current_user.get('email')
        record     = premium_collection.find_one({"email": user_email}, {"_id": 0})
        if not record:
            return jsonify(None), 200
        if "last_checked_at" in record:
            record["last_checked_at"] = record["last_checked_at"].isoformat()
        return jsonify(record), 200
    except Exception as e:
        print(f"Premium history error: {e}")
        return jsonify({"message": "Server error fetching history"}), 500


@app.route("/my-predictions", methods=["GET"])
@token_required
def my_predictions():
    try:
        user_email = request.current_user.get('email')
        logs = list(
            prediction_logs.find({"email": user_email}, {"_id": 0})
            .sort("last_checked_at", -1).limit(20)
        )
        for log in logs:
            if "last_checked_at" in log:
                log["last_checked_at"] = log["last_checked_at"].isoformat()
        return jsonify(logs), 200
    except Exception as e:
        print(f"Prediction logs error: {e}")
        return jsonify({"message": "Server error fetching prediction history"}), 500


# ======================================================
#               CONTACT ROUTE
# ======================================================

@app.route("/contact", methods=["POST"])
def contact():
    try:
        data = request.json
        if not all(k in data for k in ["name", "email", "subject", "message"]):
            return jsonify({"message": "Missing required fields"}), 400

        name    = data["name"].strip()
        email   = data["email"].strip().lower()
        subject = data["subject"].strip()
        message = data["message"].strip()

        if len(name) < 3 or len(name) > 100:
            return jsonify({"message": "Name must be between 3 and 100 characters"}), 400
        if len(subject) < 5 or len(subject) > 100:
            return jsonify({"message": "Subject must be between 5 and 100 characters"}), 400
        if len(message) < 20 or len(message) > 1000:
            return jsonify({"message": "Message must be between 20 and 1000 characters"}), 400

        contacts_collection.insert_one({
            "name":       name,
            "email":      email,
            "subject":    subject,
            "message":    message,
            "status":     "unread",
            "created_at": datetime.now(timezone.utc)
        })
        return jsonify({"message": "Message received. We'll get back to you within 24-48 hours."}), 201

    except Exception as e:
        print(f"Contact error: {e}")
        return jsonify({"message": "Server error. Please try again."}), 500


# ======================================================
#                   HELPDESK ROUTES
# ======================================================

@app.route("/create-ticket", methods=["POST"])
@token_required
def create_ticket():
    try:
        data       = request.json
        user_email = request.current_user.get('email')

        if not all(k in data for k in ["subject", "description", "category", "priority"]):
            return jsonify({"message": "Missing required fields"}), 400

        subject     = data["subject"].strip()
        description = data["description"].strip()
        category    = data["category"].strip()
        priority    = data["priority"].strip()

        if len(subject) < 5 or len(subject) > 100:
            return jsonify({"message": "Subject must be between 5 and 100 characters"}), 400
        if len(description) < 10 or len(description) > 1000:
            return jsonify({"message": "Description must be between 10 and 1000 characters"}), 400
        if category not in ["Model Issue", "Prediction Error", "Technical Problem", "Account Problem", "Other"]:
            return jsonify({"message": "Invalid category"}), 400
        if priority not in ["Low", "Medium", "High"]:
            return jsonify({"message": "Priority must be Low, Medium, or High"}), 400

        ticket = {
            "ticket_id":        "TICK-" + str(uuid.uuid4())[:8].upper(),
            "email":            user_email,
            "subject":          subject,
            "description":      description,
            "category":         category,
            "priority":         priority,
            "status":           "Open",
            "assigned_to":      None,
            "assigned_role":    None,
            "admin_response":   "",
            "manager_response": "",
            "created_at":       datetime.now(timezone.utc)
        }

        tickets_collection.insert_one(ticket)
        return jsonify({"message": "Ticket created successfully", "ticket_id": ticket["ticket_id"]}), 201

    except Exception as e:
        print(f"Create ticket error: {e}")
        return jsonify({"message": "Server error creating ticket"}), 500


@app.route("/my-tickets", methods=["GET"])
@token_required
def get_user_tickets():
    try:
        user_email = request.current_user.get('email')
        tickets    = list(
            tickets_collection.find({"email": user_email}, {"_id": 0})
            .sort("created_at", -1)
        )
        for ticket in tickets:
            ticket["created_at"] = ticket["created_at"].isoformat()
        return jsonify(tickets), 200
    except Exception as e:
        print(f"Get tickets error: {e}")
        return jsonify({"message": "Server error fetching tickets"}), 500


# ======================================================
#                   ADMIN ROUTES
# ======================================================

@app.route("/admin/all-tickets", methods=["GET"])
@token_required
@role_required(['admin'])
def admin_all_tickets():
    try:
        tickets = list(tickets_collection.find({}, {"_id": 0}).sort("created_at", -1))
        for ticket in tickets:
            ticket["created_at"] = ticket["created_at"].isoformat()
        return jsonify(tickets), 200
    except Exception as e:
        print(f"Admin get tickets error: {e}")
        return jsonify({"message": "Server error fetching tickets"}), 500


@app.route("/admin/assign-ticket", methods=["POST"])
@token_required
@role_required(['admin'])
def assign_ticket():
    try:
        data = request.json
        if not all(k in data for k in ["ticket_id", "assigned_to", "assigned_role"]):
            return jsonify({"message": "Missing required fields"}), 400

        result = tickets_collection.update_one(
            {"ticket_id": data["ticket_id"]},
            {"$set": {"assigned_to": data["assigned_to"], "assigned_role": data["assigned_role"]}}
        )
        if result.matched_count == 0:
            return jsonify({"message": "Ticket not found"}), 404
        return jsonify({"message": "Ticket assigned successfully"}), 200
    except Exception as e:
        print(f"Assign ticket error: {e}")
        return jsonify({"message": "Server error assigning ticket"}), 500


@app.route("/admin/update-ticket/<ticket_id>", methods=["PUT"])
@token_required
@role_required(['admin'])
def admin_update_ticket(ticket_id):
    try:
        data          = request.json
        update_fields = {}

        if "status" in data:
            update_fields["status"] = data["status"]
        if "admin_response" in data:
            response_text = data["admin_response"].strip()
            if len(response_text) < 10:
                return jsonify({"message": "Response must be at least 10 characters"}), 400
            update_fields["admin_response"] = response_text

        if not update_fields:
            return jsonify({"message": "No fields to update"}), 400

        result = tickets_collection.update_one({"ticket_id": ticket_id}, {"$set": update_fields})
        if result.matched_count == 0:
            return jsonify({"message": "Ticket not found"}), 404
        return jsonify({"message": "Ticket updated successfully"}), 200
    except Exception as e:
        print(f"Update ticket error: {e}")
        return jsonify({"message": "Server error updating ticket"}), 500


@app.route("/admin/create-manager", methods=["POST"])
@token_required
@role_required(['admin'])
def create_manager():
    try:
        data = request.json
        if not all(k in data for k in ["fullName", "email", "password"]):
            return jsonify({"message": "Missing required fields"}), 400

        full_name = data["fullName"].strip()
        email     = data["email"].lower().strip()
        password  = data["password"]

        if len(full_name) < 3:
            return jsonify({"message": "Full name must be at least 3 characters"}), 400
        if len(password) < 6:
            return jsonify({"message": "Password must be at least 6 characters"}), 400
        if users_collection.find_one({"email": email}):
            return jsonify({"message": "User already exists"}), 400

        users_collection.insert_one({
            "fullName":   full_name,
            "email":      email,
            "password":   generate_password_hash(password),
            "role":       "manager",
            "created_at": datetime.now(timezone.utc)
        })
        return jsonify({"message": "Manager account created"}), 201
    except Exception as e:
        print(f"Create manager error: {e}")
        return jsonify({"message": "Server error creating manager"}), 500


@app.route("/admin/managers", methods=["GET"])
@token_required
@role_required(['admin'])
def get_managers():
    try:
        managers = list(users_collection.find({"role": "manager"}, {"_id": 0, "email": 1, "fullName": 1}))
        return jsonify(managers), 200
    except Exception as e:
        print(f"Get managers error: {e}")
        return jsonify({"message": "Server error fetching managers"}), 500


@app.route("/admin/contacts", methods=["GET"])
@token_required
@role_required(['admin'])
def admin_contacts():
    try:
        messages = list(
            contacts_collection.find(
                {},
                {"_id": 1, "name": 1, "email": 1, "subject": 1, "message": 1, "status": 1, "created_at": 1}
            ).sort("created_at", -1)
        )
        for msg in messages:
            msg["_id"]        = str(msg["_id"])
            msg["created_at"] = msg["created_at"].isoformat()
        return jsonify(messages), 200
    except Exception as e:
        print(f"Admin contacts error: {e}")
        return jsonify({"message": "Server error fetching contacts"}), 500


@app.route("/admin/contacts/<contact_id>/read", methods=["PUT"])
@token_required
@role_required(['admin'])
def mark_contact_read(contact_id):
    try:
        result = contacts_collection.update_one(
            {"_id": ObjectId(contact_id)},
            {"$set": {"status": "read"}}
        )
        if result.matched_count == 0:
            return jsonify({"message": "Message not found"}), 404
        return jsonify({"message": "Marked as read"}), 200
    except Exception as e:
        print(f"Mark contact read error: {e}")
        return jsonify({"message": "Server error"}), 500


# ======================================================
#                   MANAGER ROUTES
# ======================================================

@app.route("/manager/my-tickets", methods=["GET"])
@token_required
@role_required(['manager', 'admin'])
def manager_tickets():
    try:
        user_email   = request.current_user.get('email')
        user_role    = request.current_user.get('role')
        target_email = request.args.get('email', user_email)

        if user_role == 'manager' and target_email != user_email:
            return jsonify({"message": "Unauthorized access"}), 403

        tickets = list(
            tickets_collection.find({"assigned_to": target_email}, {"_id": 0})
            .sort("created_at", -1)
        )
        for ticket in tickets:
            ticket["created_at"] = ticket["created_at"].isoformat()
        return jsonify(tickets), 200
    except Exception as e:
        print(f"Manager tickets error: {e}")
        return jsonify({"message": "Server error fetching tickets"}), 500


@app.route("/manager/update-ticket/<ticket_id>", methods=["PUT"])
@token_required
@role_required(['manager', 'admin'])
def manager_update_ticket(ticket_id):
    try:
        data          = request.json
        update_fields = {}

        if "status" in data:
            update_fields["status"] = data["status"]
        if "manager_response" in data:
            response_text = data["manager_response"].strip()
            if len(response_text) < 10:
                return jsonify({"message": "Response must be at least 10 characters"}), 400
            update_fields["manager_response"] = response_text

        if not update_fields:
            return jsonify({"message": "No fields to update"}), 400

        result = tickets_collection.update_one({"ticket_id": ticket_id}, {"$set": update_fields})
        if result.matched_count == 0:
            return jsonify({"message": "Ticket not found"}), 404
        return jsonify({"message": "Ticket updated by manager"}), 200
    except Exception as e:
        print(f"Manager update error: {e}")
        return jsonify({"message": "Server error updating ticket"}), 500


# ==============================
# HEALTH CHECK
# ==============================
@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status":       "healthy",
        "message":      "API is running",
        "model_loaded": ml_model is not None
    }), 200


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)