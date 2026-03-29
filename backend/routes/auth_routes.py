from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone

from database import users_collection
from utils import generate_token

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route("/signup", methods=["POST"])
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


@auth_bp.route("/login", methods=["POST"])
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
        user_id = str(user["_id"])
        token = generate_token(user_id, email, role)
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
