from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()
from config import Config

def create_app():
    frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'build'))
    app = Flask(__name__, static_folder=frontend_dir, static_url_path='/')
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

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)