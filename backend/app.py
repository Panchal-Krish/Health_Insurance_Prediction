from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Initialize components
    import database # Executes connection setup
    import ml_service # Executes model load

    # Register Blueprints
    from routes.auth_routes import auth_bp
    from routes.predict_routes import predict_bp
    from routes.contact_routes import contact_bp
    from routes.ticket_routes import ticket_bp
    from routes.admin_routes import admin_bp
    from routes.manager_routes import manager_bp
    from routes.stats_routes import stats_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(predict_bp)
    app.register_blueprint(contact_bp)
    app.register_blueprint(ticket_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(manager_bp)
    app.register_blueprint(stats_bp)

    @app.route("/health", methods=["GET"])
    def health_check():
        from ml_service import ml_model
        return jsonify({
            "status":       "healthy",
            "message":      "API is running",
            "model_loaded": ml_model is not None
        }), 200

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)