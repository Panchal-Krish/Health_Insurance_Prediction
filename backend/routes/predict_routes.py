from flask import Blueprint, request, jsonify
from datetime import datetime, timezone

from database import prediction_logs
from utils import token_required
from ml_service import predict_premium_ml

predict_bp = Blueprint('predict_bp', __name__)

@predict_bp.route("/predict-premium", methods=["POST"])
@token_required
def predict_premium():
    try:
        data = request.json
        if not all(k in data for k in ["age", "sex", "bmi", "children", "smoker", "region"]):
            return jsonify({"message": "Missing required fields"}), 400

        try:
            age = int(data["age"])
            bmi = float(data["bmi"])
            children = int(data["children"])
            smoker = int(data["smoker"])
            sex = int(data["sex"])
            region = str(data["region"])
            prediction_for = str(data.get("prediction_for", "self"))
            beneficiary_name = data.get("beneficiary_name") or None
        except (ValueError, TypeError):
            return jsonify({"message": "Invalid input format"}), 400
        
        if not isinstance(age, int) or not (18 <= age <= 100):
            return jsonify({"message": "Age must be an integer between 18 and 100"}), 400

        if not isinstance(bmi, (int, float)) or not (10 <= bmi <= 60):
            return jsonify({"message": "BMI must be a number between 10 and 60"}), 400

        if not isinstance(children, int) or not (0 <= children <= 10):
            return jsonify({"message": "Children must be an integer between 0 and 10"}), 400

        if smoker not in [0, 1]:
            return jsonify({"message": "Smoker must be 0 or 1"}), 400

        if sex not in [0, 1]:
            return jsonify({"message": "Sex must be 0 (female) or 1 (male)"}), 400

        if region not in ['northeast', 'northwest', 'southeast', 'southwest']:
            return jsonify({"message": "Invalid region"}), 400

        if prediction_for not in ['self', 'other']:
            return jsonify({"message": "prediction_for must be 'self' or 'other'"}), 400

        if prediction_for == 'other':
            if not beneficiary_name or len(beneficiary_name.strip()) < 2:
                return jsonify({"message": "Beneficiary name is required when predicting for someone else"}), 400
            beneficiary_name = beneficiary_name.strip()[:100]

        premium    = predict_premium_ml(age=age, sex=sex, bmi=bmi, children=children, smoker=smoker, region=region)
        user_id    = request.current_user.get('user_id')
        user_email = request.current_user.get('email')
        now        = datetime.now(timezone.utc)

        record = {
            "user_id":           user_id,
            "email":             user_email,
            "prediction_for":    prediction_for,
            "beneficiary_name":  beneficiary_name,
            "age":               age,
            "gender":            "male" if sex == 1 else "female",
            "bmi":               bmi,
            "children":          children,
            "smoker":            smoker == 1,
            "region":            region,
            "predicted_premium": premium,
            "last_checked_at":   now
        }

        prediction_logs.insert_one(record)

        return jsonify({"predicted_premium": premium}), 200

    except Exception as e:
        print(f"Premium prediction error: {e}")
        return jsonify({"message": "Server error during prediction"}), 500


@predict_bp.route("/premium-history", methods=["GET"])
@token_required
def premium_history():
    try:
        user_id = request.current_user.get('user_id')
        record = prediction_logs.find_one(
            {"user_id": user_id}, 
            {"_id": 0},
            sort=[("last_checked_at", -1)]
        )
        if not record:
            return jsonify(None), 200
        if "last_checked_at" in record:
            dt = record["last_checked_at"]
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            record["last_checked_at"] = dt.isoformat()
        return jsonify(record), 200
    except Exception as e:
        print(f"Premium history error: {e}")
        return jsonify({"message": "Server error fetching history"}), 500


@predict_bp.route("/my-predictions", methods=["GET"])
@token_required
def my_predictions():
    try:
        user_id = request.current_user.get('user_id')
        logs = list(
            prediction_logs.find({"user_id": user_id}, {"_id": 0})
            .sort("last_checked_at", -1).limit(20)
        )
        for log in logs:
            if "last_checked_at" in log:
                dt = log["last_checked_at"]
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                log["last_checked_at"] = dt.isoformat()
        return jsonify(logs), 200
    except Exception as e:
        print(f"Prediction logs error: {e}")
        return jsonify({"message": "Server error fetching prediction history"}), 500
