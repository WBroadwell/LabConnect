from flask import jsonify, request

from app.api import api_bp
from app.api.decorators import get_current_user, require_auth
from app.services import user_service


@api_bp.route("/auth/me", methods=["GET"])
def get_current_user_info():
    """Get the current authenticated user's info."""
    user = get_current_user()
    if not user:
        return jsonify({"authenticated": False, "user": None})

    saved_ids = [opp.id for opp in user.saved]
    return jsonify(
        {
            "authenticated": True,
            "user": {
                **user.to_dict(),
                "can_create_opportunities": user.can_create_opportunities,
                "saved_opportunity_ids": saved_ids,
            },
        }
    )


@api_bp.route("/users", methods=["GET"])
def get_users():
    users = user_service.list_users()
    return jsonify([u.to_dict() for u in users])


@api_bp.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()
    user = user_service.create_user(data)
    return jsonify(user.to_dict()), 201


@api_bp.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = user_service.get_user(user_id)
    return jsonify(user.to_dict())


@api_bp.route("/users/<int:user_id>/profile", methods=["PUT"])
@require_auth
def update_profile(user_id):
    """Update user profile (name, departments, profile picture)."""
    data = request.get_json()
    result = user_service.update_profile(user_id, request.current_user, data)
    return jsonify(result)
