from functools import wraps

from flask import current_app, jsonify, request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from app.database import db
from app.models import User


def get_current_user():
    """Get the current user from JWT or X-User-Id header (for dev/testing)."""
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        if identity:
            return User.query.filter_by(email=identity).first()
    except Exception:
        pass

    if current_app.config.get("TESTING"):
        user_id = request.headers.get("X-User-Id")
        if user_id:
            return db.session.get(User, int(user_id))

    return None


def require_auth(f):
    """Decorator to require authentication for a route."""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"error": "Authentication required"}), 401
        request.current_user = user
        return f(*args, **kwargs)

    return decorated_function


def require_opportunity_creator(f):
    """Decorator to require professor or admin role for creating opportunities."""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"error": "Authentication required"}), 401
        if not user.can_create_opportunities:
            return jsonify({"error": "Professor or admin access required"}), 403
        request.current_user = user
        return f(*args, **kwargs)

    return decorated_function
