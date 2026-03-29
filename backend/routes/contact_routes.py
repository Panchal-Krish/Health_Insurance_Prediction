from flask import Blueprint, request, jsonify
from datetime import datetime, timezone

from database import contacts_collection

contact_bp = Blueprint('contact_bp', __name__)

@contact_bp.route("/contact", methods=["POST"])
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
