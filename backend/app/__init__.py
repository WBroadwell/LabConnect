import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env BEFORE importing config (which reads env vars at class definition time)
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

from flask import Flask  # noqa: E402
from flask_cors import CORS  # noqa: E402
from flask_jwt_extended import JWTManager  # noqa: E402

from app.config import config  # noqa: E402
from app.database import db  # noqa: E402

jwt = JWTManager()


def create_app(config_name=None):
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "default")

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # CORS configuration - allow credentials for JWT cookies
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": app.config.get("FRONTEND_URL", "http://localhost:3000")
            }
        },
        supports_credentials=True,
        allow_headers=["Content-Type", "X-User-Id", "X-CSRF-TOKEN"],
    )

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)

    from app.api import api_bp
    from app.saml_routes import saml_bp

    app.register_blueprint(api_bp)
    app.register_blueprint(saml_bp)

    with app.app_context():
        if os.getenv("RESET_DB", "").lower() == "true":
            with db.engine.begin() as conn:
                db.metadata.drop_all(conn, checkfirst=True)
        db.create_all()
        _seed_admin()

    return app


def _seed_admin():
    """Create a local admin user for bypassing SSO in development."""
    from app.models import User

    admin_email = os.getenv("ADMIN_EMAIL", "admin@rpi.edu")
    if not User.query.filter_by(email=admin_email).first():
        db.session.add(
            User(
                email=admin_email,
                name="Admin",
                role="professor",
                is_admin=True,
                departments=[],
            )
        )
        db.session.commit()
