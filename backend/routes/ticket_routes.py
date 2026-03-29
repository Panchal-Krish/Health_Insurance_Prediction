from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
import uuid

from database import tickets_collection
from utils import token_required

ticket_bp = Blueprint('ticket_bp', __name__)

@ticket_bp.route("/create-ticket", methods=["POST"])
@token_required
def create_ticket():
    try:
        data       = request.json
        user_id    = request.current_user.get('user_id')
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
            "user_id":          user_id,
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


@ticket_bp.route("/my-tickets", methods=["GET"])
@token_required
def get_user_tickets():
    try:
        user_id = request.current_user.get('user_id')
        tickets = list(
            tickets_collection.find({"user_id": user_id}, {"_id": 0})
            .sort("created_at", -1)
        )
        for ticket in tickets:
            ticket["created_at"] = ticket["created_at"].isoformat()
        return jsonify(tickets), 200
    except Exception as e:
        print(f"Get tickets error: {e}")
        return jsonify({"message": "Server error fetching tickets"}), 500
