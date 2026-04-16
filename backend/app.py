from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()
from config import Config

def create_app():
    # Path to the React build output
    FRONTEND_BUILD = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'build'))

    # Do NOT set static_folder here — we handle static files ourselves
    # static_folder=None disables Flask's default /static/ endpoint which would
    # intercept React's JS/CSS bundles and return 404 before our catch-all runs.
    app = Flask(__name__, static_folder=None)
    app.config.from_object(Config)

    # Allow all origins (frontend & backend share the same domain in production)
    CORS(app, resources={
        r"/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Initialize components
    import database  # Executes connection setup
    import ml_service  # Executes model load

    # Register Blueprints
    from routes.auth_routes import auth_bp
    from routes.predict_routes import predict_bp
    from routes.contact_routes import contact_bp
    from routes.ticket_routes import ticket_bp
    from routes.admin_routes import admin_bp
    from routes.manager_routes import manager_bp
    from routes.stats_routes import stats_bp

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(predict_bp, url_prefix='/api')
    app.register_blueprint(contact_bp, url_prefix='/api')
    app.register_blueprint(ticket_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api')
    app.register_blueprint(manager_bp, url_prefix='/api')
    app.register_blueprint(stats_bp, url_prefix='/api')

    @app.route("/api/health", methods=["GET"])
    def health_check():
        from ml_service import ml_model
        return jsonify({
            "status":       "healthy",
            "message":      "API is running",
            "model_loaded": ml_model is not None
        }), 200

    # === Single catch-all: serves static files OR index.html for React SPA routes ===
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        # API routes are handled by blueprints — if they hit here it's a real 404
        if path.startswith('api'):
            return jsonify({"message": "Not found"}), 404

        # Try to serve a real static asset (JS, CSS, images, etc.)
        full_path = os.path.join(FRONTEND_BUILD, path)
        if path and os.path.isfile(full_path):
            return send_from_directory(FRONTEND_BUILD, path)

        # Fall back to index.html — let React Router handle the URL
        return send_from_directory(FRONTEND_BUILD, 'index.html')

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)