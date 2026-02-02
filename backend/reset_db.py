"""Reset the database - drops all tables and recreates them."""

import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

from flask import Flask
from app.config import config
from app.database import db
from app import models  # Import models so SQLAlchemy knows about them

if __name__ == "__main__":
    # Create a minimal app without the admin user creation
    config_name = os.getenv("FLASK_ENV", "default")
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    db.init_app(app)

    with app.app_context():
        print("Dropping all tables...")
        db.drop_all()
        print("Creating all tables...")
        db.create_all()
        print("Database reset complete!")
        print("\nNow run 'python run.py' to start the server (admin user will be created).")
