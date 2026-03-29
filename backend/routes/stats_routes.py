from flask import Blueprint, jsonify
from database import prediction_logs

stats_bp = Blueprint('stats', __name__)

# Real model accuracy from 5-fold cross-validation on the insurance dataset
# ExtraTreesRegressor with 800 estimators: R² = 0.8118
MODEL_ACCURACY = 81.2

@stats_bp.route('/public-stats', methods=['GET'])
def get_public_stats():
    """Return public-facing stats for the home page (no auth required)."""
    try:
        total_predictions = prediction_logs.count_documents({})

        # Round down to nearest 10
        rounded = (total_predictions // 10) * 10

        return jsonify({
            'prediction_count': total_predictions,
            'prediction_count_display': f"{rounded}+" if rounded > 0 else "0",
            'model_accuracy': MODEL_ACCURACY
        }), 200

    except Exception as e:
        return jsonify({
            'prediction_count': 0,
            'prediction_count_display': '0',
            'model_accuracy': MODEL_ACCURACY
        }), 200
