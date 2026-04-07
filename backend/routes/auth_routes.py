from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone, timedelta
import uuid

from database import users_collection, email_tokens_collection
from utils import generate_token
from email_service import send_transactional_email
from config import Config

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
            "is_verified": False,
            "is_deleted": False,
            "created_at": datetime.now(timezone.utc)
        })
        
        # Make Verification Token
        verification_token = uuid.uuid4().hex
        email_tokens_collection.insert_one({
            "email": email,
            "token": verification_token,
            "type": "verify",
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=24)
        })
        
        # Send Email
        verify_link = f"{Config.FRONTEND_URL}/verify-email/{verification_token}"
        html_content = f"""
        <h2>Welcome to Health Insurance Predictor!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="{verify_link}">Verify Email</a>
        <p>This link expires in 24 hours.</p>
        """
        send_transactional_email(email, "Verify Your Email", html_content, full_name)
        
        return jsonify({"message": "Signup successful. Please check your email to verify your account."}), 201

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

        user = users_collection.find_one({"email": email, "is_deleted": {"$ne": True}})
        if not user or not check_password_hash(user["password"], password):
            return jsonify({"message": "Invalid email or password"}), 401
            
        if not user.get("is_verified", False):
            return jsonify({"message": "Please verify your email before logging in"}), 403

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


@auth_bp.route("/verify-email/<token>", methods=["GET"])
def verify_email(token):
    try:
        token_doc = email_tokens_collection.find_one({"token": token, "type": "verify"})
        if not token_doc:
            return jsonify({"message": "Invalid or expired token"}), 400
            
        users_collection.update_one(
            {"email": token_doc["email"]},
            {"$set": {"is_verified": True}}
        )
        email_tokens_collection.delete_one({"_id": token_doc["_id"]})
        
        return jsonify({"message": "Email verified successfully"}), 200
    except Exception as e:
        print(f"Verify error: {e}")
        return jsonify({"message": "Server error during verification"}), 500


@auth_bp.route("/request-password-reset", methods=["POST"])
def request_password_reset():
    try:
        data = request.json
        email = data.get("email", "").lower().strip()
        
        user = users_collection.find_one({"email": email, "is_deleted": {"$ne": True}})
        if not user:
            # Return 200 anyway to prevent email enumeration
            return jsonify({"message": "If that email exists, a reset link has been sent."}), 200
            
        reset_token = uuid.uuid4().hex
        email_tokens_collection.insert_one({
            "email": email,
            "token": reset_token,
            "type": "reset",
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=1)
        })
        
        reset_link = f"{Config.FRONTEND_URL}/reset-password/{reset_token}"
        html_content = f"""
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Click the link below to set a new password:</p>
        <a href="{reset_link}">Reset Password</a>
        <p>If you didn't request this, you can safely ignore this email. This link expires in 1 hour.</p>
        """
        send_transactional_email(email, "Password Reset Request", html_content, user.get("fullName"))
        
        return jsonify({"message": "If that email exists, a reset link has been sent."}), 200
    except Exception as e:
        print(f"Reset request error: {e}")
        return jsonify({"message": "Server error during reset request"}), 500


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    try:
        data = request.json
        token = data.get("token")
        new_password = data.get("password", "")
        
        if not token or len(new_password) < 6:
            return jsonify({"message": "Valid token and new password (min 6 chars) required"}), 400
            
        token_doc = email_tokens_collection.find_one({"token": token, "type": "reset"})
        if not token_doc:
            return jsonify({"message": "Invalid or expired reset token"}), 400
            
        users_collection.update_one(
            {"email": token_doc["email"]},
            {"$set": {"password": generate_password_hash(new_password)}}
        )
        email_tokens_collection.delete_one({"_id": token_doc["_id"]})
        
        return jsonify({"message": "Password reset successful"}), 200
    except Exception as e:
        print(f"Reset password error: {e}")
        return jsonify({"message": "Server error during password reset"}), 500
