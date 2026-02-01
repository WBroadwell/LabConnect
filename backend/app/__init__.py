import os

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

from app.config import config
from app.extensions import db

load_dotenv()


def create_app(config_name=None):
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "default")

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    CORS(app)
    db.init_app(app)

    from app.api import api_bp

    app.register_blueprint(api_bp)

    with app.app_context():
        db.create_all()

    return app
