from flask import Blueprint, request, jsonify

from database import tickets_collection
from utils import token_required, role_required

manager_bp = Blueprint('manager_bp', __name__)

@manager_bp.route("/manager/my-tickets", methods=["GET"])
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


@manager_bp.route("/manager/update-ticket/<ticket_id>", methods=["PUT"])
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
