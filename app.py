from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import uuid
import jwt
import os
from functools import wraps
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# ==============================
# Configuration
# ==============================
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-change-this-in-production')
app.config['JWT_EXPIRATION_HOURS'] = 24

# Configure CORS properly
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# ==============================
# MongoDB Connection
# ==============================
MONGO_URI = os.getenv('MONGO_URI', 'mongodb+srv://user:user123@cluster0.cmu27ib.mongodb.net/')

try:
    client = MongoClient(MONGO_URI)
    db = client["insurance_data"]
    users_collection = db["customers"]
    premium_collection = db["premium_history"]
    tickets_collection = db["support_tickets"]
    
    # Create indexes
    premium_collection.create_index("email", unique=True)
    users_collection.create_index("email", unique=True)
    
    print("✅ Database connected successfully")
except Exception as e:
    print(f"❌ Database connection failed: {e}")
    exit(1)

# ==============================
# JWT Token Generation & Verification
# ==============================
def generate_token(email, role):
    """Generate JWT token for authenticated user"""
    try:
        payload = {
            'email': email,
            'role': role,
            'exp': datetime.utcnow() + timedelta(hours=app.config['JWT_EXPIRATION_HOURS']),
            'iat': datetime.utcnow()
        }
        token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
        return token
    except Exception as e:
        return None

def decode_token(token):
    """Decode and verify JWT token"""
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# ==============================
# Authentication Decorator
# ==============================
def token_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check if Authorization header exists
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                # Format: "Bearer <token>"
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        # Verify token
        payload = decode_token(token)
        if not payload:
            return jsonify({'message': 'Token is invalid or expired'}), 401
        
        # Add user info to request context
        request.current_user = payload
        return f(*args, **kwargs)
    
    return decorated

# ==============================
# Role-Based Authorization Decorator
# ==============================
def role_required(allowed_roles):
    """Decorator to require specific roles"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(request, 'current_user'):
                return jsonify({'message': 'Unauthorized'}), 401
            
            user_role = request.current_user.get('role')
            if user_role not in allowed_roles:
                return jsonify({'message': f'Access denied. Required role: {", ".join(allowed_roles)}'}), 403
            
            return f(*args, **kwargs)
        return decorated
    return decorator

# ==============================
# Premium Calculation Logic
# ==============================
def calculate_premium(data):
    """Calculate insurance premium based on user data"""
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
    try:
        data = request.json
        
        # Validate required fields
        if not all(k in data for k in ["fullName", "email", "password"]):
            return jsonify({"message": "Missing required fields"}), 400
        
        full_name = data.get("fullName")
        email = data.get("email").lower().strip()
        password = data.get("password")
        
        # Validate password strength
        if len(password) < 6:
            return jsonify({"message": "Password must be at least 6 characters"}), 400
        
        # Check if user exists
        if users_collection.find_one({"email": email}):
            return jsonify({"message": "User already exists"}), 400
        
        # Create user
        users_collection.insert_one({
            "fullName": full_name,
            "email": email,
            "password": generate_password_hash(password),
            "role": "user",
            "created_at": datetime.now()
        })
        
        return jsonify({"message": "Signup successful"}), 201
        
    except Exception as e:
        print(f"Signup error: {e}")
        return jsonify({"message": "Server error during signup"}), 500

# ==============================
# LOGIN
# ==============================
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        
        if not data or not data.get("email") or not data.get("password"):
            return jsonify({"message": "Email and password required"}), 400
        
        email = data.get("email").lower().strip()
        password = data.get("password")
        
        # Find user
        user = users_collection.find_one({"email": email})
        
        if not user or not check_password_hash(user["password"], password):
            return jsonify({"message": "Invalid email or password"}), 401
        
        # Generate JWT token
        role = user.get("role", "user")
        token = generate_token(email, role)
        
        if not token:
            return jsonify({"message": "Failed to generate token"}), 500
        
        return jsonify({
            "message": "Login successful",
            "token": token,
            "email": email,
            "role": role,
            "fullName": user.get("fullName")
        }), 200
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({"message": "Server error during login"}), 500

# ==============================
# PREDICT PREMIUM
# ==============================
@app.route("/predict-premium", methods=["POST"])
@token_required
def predict_premium():
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ["age", "gender", "bmi", "children", "smoker", 
                          "region", "pre_existing_diseases", "annual_income"]
        
        if not all(k in data for k in required_fields):
            return jsonify({"message": "Missing required fields"}), 400
        
        # Validate data ranges
        if not (0 < data["age"] < 120):
            return jsonify({"message": "Invalid age"}), 400
        
        if not (10 < data["bmi"] < 60):
            return jsonify({"message": "Invalid BMI"}), 400
        
        if data["children"] < 0:
            return jsonify({"message": "Invalid number of children"}), 400
        
        if data["annual_income"] < 0:
            return jsonify({"message": "Invalid income"}), 400
        
        # Calculate premium
        premium = calculate_premium(data)
        
        # Get user email from token
        user_email = request.current_user.get('email')
        
        # Store prediction
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
            "last_checked_at": datetime.now()
        }
        
        premium_collection.update_one(
            {"email": user_email},
            {
                "$set": record,
                "$setOnInsert": {"email": user_email}
            },
            upsert=True
        )
        
        return jsonify({"predicted_premium": premium}), 200
        
    except Exception as e:
        print(f"Premium prediction error: {e}")
        return jsonify({"message": "Server error during prediction"}), 500

# ==============================
# PREMIUM HISTORY
# ==============================
@app.route("/premium-history/<email>", methods=["GET"])
@token_required
def premium_history(email):
    try:
        # Users can only access their own history
        user_email = request.current_user.get('email')
        user_role = request.current_user.get('role')
        
        # Only allow user to see their own data (or admin can see anyone's)
        if user_role != 'admin' and user_email != email:
            return jsonify({"message": "Unauthorized access"}), 403
        
        record = premium_collection.find_one({"email": email}, {"_id": 0})
        
        if not record:
            return jsonify(None), 200
        
        if "last_checked_at" in record:
            record["last_checked_at"] = record["last_checked_at"].isoformat()
        
        return jsonify(record), 200
        
    except Exception as e:
        print(f"Premium history error: {e}")
        return jsonify({"message": "Server error fetching history"}), 500

# ====================================================
#                HELP DESK SYSTEM
# ====================================================

# CREATE TICKET
@app.route("/create-ticket", methods=["POST"])
@token_required
def create_ticket():
    try:
        data = request.json
        user_email = request.current_user.get('email')
        
        # Validate required fields
        if not all(k in data for k in ["subject", "description", "category", "priority"]):
            return jsonify({"message": "Missing required fields"}), 400
        
        ticket = {
            "ticket_id": "TICK-" + str(uuid.uuid4())[:8].upper(),
            "email": user_email,  # Use authenticated email
            "subject": data.get("subject"),
            "description": data.get("description"),
            "category": data.get("category"),
            "priority": data.get("priority"),
            "status": "Open",
            "assigned_to": None,
            "assigned_role": None,
            "admin_response": "",
            "manager_response": "",  # ✅ FIXED: Initialize manager_response
            "created_at": datetime.now()
        }
        
        tickets_collection.insert_one(ticket)
        
        return jsonify({
            "message": "Ticket created successfully",
            "ticket_id": ticket["ticket_id"]
        }), 201
        
    except Exception as e:
        print(f"Create ticket error: {e}")
        return jsonify({"message": "Server error creating ticket"}), 500

# GET USER TICKETS
@app.route("/my-tickets/<email>", methods=["GET"])
@token_required
def get_user_tickets(email):
    try:
        user_email = request.current_user.get('email')
        
        # Users can only see their own tickets
        if user_email != email:
            return jsonify({"message": "Unauthorized access"}), 403
        
        tickets = list(
            tickets_collection.find({"email": email}, {"_id": 0})
        )
        
        for ticket in tickets:
            ticket["created_at"] = ticket["created_at"].isoformat()
        
        return jsonify(tickets), 200
        
    except Exception as e:
        print(f"Get tickets error: {e}")
        return jsonify({"message": "Server error fetching tickets"}), 500

# ====================================================
#                ADMIN ROUTES
# ====================================================

# ADMIN: GET ALL TICKETS
@app.route("/admin/all-tickets", methods=["GET"])
@token_required
@role_required(['admin'])
def admin_all_tickets():
    try:
        tickets = list(
            tickets_collection.find({}, {"_id": 0}).sort("created_at", -1)
        )
        
        for ticket in tickets:
            ticket["created_at"] = ticket["created_at"].isoformat()
        
        return jsonify(tickets), 200
        
    except Exception as e:
        print(f"Admin get tickets error: {e}")
        return jsonify({"message": "Server error fetching tickets"}), 500

# ADMIN: ASSIGN TICKET
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
            {
                "$set": {
                    "assigned_to": data["assigned_to"],
                    "assigned_role": data["assigned_role"]
                }
            }
        )
        
        if result.matched_count == 0:
            return jsonify({"message": "Ticket not found"}), 404
        
        return jsonify({"message": "Ticket assigned successfully"}), 200
        
    except Exception as e:
        print(f"Assign ticket error: {e}")
        return jsonify({"message": "Server error assigning ticket"}), 500

# ADMIN: UPDATE TICKET STATUS / RESPONSE
@app.route("/admin/update-ticket/<ticket_id>", methods=["PUT"])
@token_required
@role_required(['admin'])
def admin_update_ticket(ticket_id):
    try:
        data = request.json
        
        update_fields = {}
        if "status" in data:
            update_fields["status"] = data["status"]
        if "admin_response" in data:
            update_fields["admin_response"] = data["admin_response"]
        
        if not update_fields:
            return jsonify({"message": "No fields to update"}), 400
        
        result = tickets_collection.update_one(
            {"ticket_id": ticket_id},
            {"$set": update_fields}
        )
        
        if result.matched_count == 0:
            return jsonify({"message": "Ticket not found"}), 404
        
        return jsonify({"message": "Ticket updated successfully"}), 200
        
    except Exception as e:
        print(f"Update ticket error: {e}")
        return jsonify({"message": "Server error updating ticket"}), 500

# ADMIN: CREATE MANAGER ACCOUNT
@app.route("/admin/create-manager", methods=["POST"])
@token_required
@role_required(['admin'])
def create_manager():
    try:
        data = request.json
        
        if not all(k in data for k in ["fullName", "email", "password"]):
            return jsonify({"message": "Missing required fields"}), 400
        
        email = data["email"].lower().strip()
        
        if users_collection.find_one({"email": email}):
            return jsonify({"message": "User already exists"}), 400
        
        users_collection.insert_one({
            "fullName": data["fullName"],
            "email": email,
            "password": generate_password_hash(data["password"]),
            "role": "manager",
            "created_at": datetime.now()
        })
        
        return jsonify({"message": "Manager account created"}), 201
        
    except Exception as e:
        print(f"Create manager error: {e}")
        return jsonify({"message": "Server error creating manager"}), 500

# ADMIN: GET ALL MANAGERS
@app.route("/admin/managers", methods=["GET"])
@token_required
@role_required(['admin'])
def get_managers():
    try:
        managers = list(
            users_collection.find(
                {"role": "manager"},
                {"_id": 0, "email": 1, "fullName": 1}
            )
        )
        
        return jsonify(managers), 200
        
    except Exception as e:
        print(f"Get managers error: {e}")
        return jsonify({"message": "Server error fetching managers"}), 500

# ====================================================
#                MANAGER ROUTES
# ====================================================

# MANAGER: VIEW ASSIGNED TICKETS
# ✅ FIXED: Removed duplicate route - kept only one
@app.route("/manager/my-tickets/<email>", methods=["GET"])
@token_required
@role_required(['manager', 'admin'])
def manager_tickets(email):
    try:
        user_email = request.current_user.get('email')
        user_role = request.current_user.get('role')
        
        # Managers can only see their own tickets, admins can see anyone's
        if user_role == 'manager' and user_email != email:
            return jsonify({"message": "Unauthorized access"}), 403
        
        tickets = list(
            tickets_collection.find(
                {"assigned_to": email},
                {"_id": 0}
            ).sort("created_at", -1)
        )
        
        for ticket in tickets:
            ticket["created_at"] = ticket["created_at"].isoformat()
        
        return jsonify(tickets), 200
        
    except Exception as e:
        print(f"Manager tickets error: {e}")
        return jsonify({"message": "Server error fetching tickets"}), 500

# MANAGER: UPDATE TICKET
@app.route("/manager/update-ticket/<ticket_id>", methods=["PUT"])
@token_required
@role_required(['manager', 'admin'])
def manager_update_ticket(ticket_id):
    try:
        data = request.json
        
        update_fields = {}
        if "status" in data:
            update_fields["status"] = data["status"]
        if "manager_response" in data:
            update_fields["manager_response"] = data["manager_response"]
        
        if not update_fields:
            return jsonify({"message": "No fields to update"}), 400
        
        result = tickets_collection.update_one(
            {"ticket_id": ticket_id},
            {"$set": update_fields}
        )
        
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
    return jsonify({"status": "healthy", "message": "API is running"}), 200

# ==============================
# RUN SERVER
# ==============================
if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)