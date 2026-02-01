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

    CORS(app)
    db.init_app(app)

    from app.routes import api_bp

    app.register_blueprint(api_bp)

    with app.app_context():
        db.create_all()

    return app
