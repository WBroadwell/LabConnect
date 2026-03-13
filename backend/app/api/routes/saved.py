from flask import jsonify, request

from app.api import api_bp
from app.api.decorators import require_auth
from app.services import saved_service


@api_bp.route("/users/<int:user_id>/saved-opportunities", methods=["GET"])
@require_auth
def get_saved_opportunities(user_id):
    """Get all saved opportunities for a user."""
    opportunities = saved_service.get_saved_opportunities(user_id, request.current_user)
    return jsonify([opp.to_dict() for opp in opportunities])


@api_bp.route(
    "/users/<int:user_id>/saved-opportunities/<string:opportunity_id>", methods=["POST"]
)
@require_auth
def save_opportunity(user_id, opportunity_id):
    """Save an opportunity for a user."""
    result, status_code = saved_service.save_opportunity(
        user_id, opportunity_id, request.current_user
    )
    return jsonify(result), status_code


@api_bp.route(
    "/users/<int:user_id>/saved-opportunities/<string:opportunity_id>",
    methods=["DELETE"],
)
@require_auth
def unsave_opportunity(user_id, opportunity_id):
    """Remove a saved opportunity for a user."""
    result = saved_service.unsave_opportunity(
        user_id, opportunity_id, request.current_user
    )
    return jsonify(result)
