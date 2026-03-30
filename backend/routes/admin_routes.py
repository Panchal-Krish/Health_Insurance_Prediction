from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from bson import ObjectId
from werkzeug.security import generate_password_hash

from database import tickets_collection, users_collection, contacts_collection
from utils import token_required, role_required

admin_bp = Blueprint('admin_bp', __name__)

@admin_bp.route("/admin/all-tickets", methods=["GET"])
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


@admin_bp.route("/admin/assign-ticket", methods=["POST"])
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


@admin_bp.route("/admin/update-ticket/<ticket_id>", methods=["PUT"])
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


@admin_bp.route("/admin/create-manager", methods=["POST"])
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


@admin_bp.route("/admin/managers", methods=["GET"])
@token_required
@role_required(['admin'])
def get_managers():
    try:
        managers = list(users_collection.find({"role": "manager"}, {"_id": 0, "email": 1, "fullName": 1}))
        return jsonify(managers), 200
    except Exception as e:
        print(f"Get managers error: {e}")
        return jsonify({"message": "Server error fetching managers"}), 500


@admin_bp.route("/api/contacts", methods=["GET"])
@token_required
@role_required(['admin', 'manager'])
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


@admin_bp.route("/api/contacts/<contact_id>/read", methods=["PUT"])
@token_required
@role_required(['admin', 'manager'])
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
