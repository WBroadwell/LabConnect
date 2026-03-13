from flask import Blueprint, jsonify

from app.exceptions import AppError

api_bp = Blueprint("api", __name__, url_prefix="/api")


@api_bp.errorhandler(AppError)
def handle_app_error(error: AppError):
    return jsonify({"error": error.message}), error.status_code


# Import route modules AFTER api_bp is defined so they can register routes on it
from app.api.routes import (  # noqa: E402, F401
    admin,
    auth,
    departments,
    health,
    opportunities,
    professors,
    saved,
    users,
)
