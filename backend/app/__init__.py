import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env BEFORE importing config (which reads env vars at class definition time)
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

from flask import Flask
from flask_cors import CORS

from app.config import config
from app.database import db


def create_app(config_name=None):
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "default")

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    CORS(app, resources={r"/api/*": {"origins": "*", "allow_headers": ["Content-Type", "X-User-Id"]}})
    db.init_app(app)

    from app.routes import api_bp

    app.register_blueprint(api_bp)

    with app.app_context():
        # Drop and recreate all tables for clean dev state
        db.drop_all()
        db.create_all()
        _create_default_admin()

    return app


def _create_default_admin():
    """Create default test users for development if they don't exist."""
    from sqlalchemy.exc import ProgrammingError
    from app.models import User

    admin_email = os.getenv("ADMIN_EMAIL", "admin@rpi.edu")

    try:
        existing_admin = User.query.filter_by(email=admin_email).first()

        if not existing_admin:
            # Create admin user (ID: 1)
            admin = User(
                email=admin_email,
                name="Admin User",
                role="admin",
                title="System Administrator",
                departments=["Computer Science"],
            )
            db.session.add(admin)

            # Create test professor (ID: 2)
            professor = User(
                email="professor@rpi.edu",
                name="Dr. Jane Smith",
                role="professor",
                title="Associate Professor",
                departments=["Computer Science"],
                office="Amos Eaton 123",
                research_interests=["Machine Learning", "Data Science"],
            )
            db.session.add(professor)

            # Create test student (ID: 3)
            student = User(
                email="student@rpi.edu",
                name="John Doe",
                role="student",
                departments=["Computer Science"],
            )
            db.session.add(student)

            db.session.commit()
            print(f"Created default admin user: {admin_email} (ID: {admin.id})")
            print(f"Created test professor: professor@rpi.edu (ID: {professor.id})")
            print(f"Created test student: student@rpi.edu (ID: {student.id})")
    except ProgrammingError as e:
        db.session.rollback()
        if "column" in str(e).lower() and "does not exist" in str(e).lower():
            print("\n" + "=" * 60)
            print("DATABASE SCHEMA OUT OF DATE")
            print("=" * 60)
            print("The database schema doesn't match the models.")
            print("Run the following command to reset the database:")
            print("\n    python reset_db.py\n")
            print("=" * 60 + "\n")
            raise SystemExit(1)
        raise
