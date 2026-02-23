from flask import jsonify, request

from app.api import api_bp
from app.api.decorators import require_auth, require_opportunity_creator
from app.services import opportunity_service


@api_bp.route("/opportunities", methods=["GET"])
def get_opportunities():
    opportunities = opportunity_service.list_opportunities()
    return jsonify([opp.to_dict() for opp in opportunities])


@api_bp.route("/opportunities", methods=["POST"])
@require_opportunity_creator
def create_opportunity():
    """Create a new opportunity. Requires professor or admin role."""
    data = request.get_json()
    opportunity = opportunity_service.create_opportunity(data, request.current_user)
    return jsonify(opportunity.to_dict()), 201


@api_bp.route("/opportunities/<string:opportunity_id>", methods=["GET"])
def get_opportunity(opportunity_id):
    opportunity = opportunity_service.get_opportunity(opportunity_id)
    return jsonify(opportunity.to_dict())


@api_bp.route("/opportunities/<string:opportunity_id>", methods=["PUT"])
@require_auth
def update_opportunity(opportunity_id):
    """Update an opportunity. Only the creator or admin can update."""
    data = request.get_json()
    opportunity = opportunity_service.update_opportunity(
        opportunity_id, data, request.current_user
    )
    return jsonify(opportunity.to_dict())


@api_bp.route("/opportunities/<string:opportunity_id>", methods=["DELETE"])
@require_auth
def delete_opportunity(opportunity_id):
    """Delete an opportunity. Only the creator or admin can delete."""
    opportunity_service.delete_opportunity(opportunity_id, request.current_user)
    return jsonify({"message": "Opportunity deleted successfully"})


@api_bp.route("/users/<int:user_id>/opportunities", methods=["GET"])
def get_user_opportunities(user_id):
    """Get all opportunities created by a specific user."""
    opportunities = opportunity_service.get_user_opportunities(user_id)
    return jsonify([opp.to_dict() for opp in opportunities])
