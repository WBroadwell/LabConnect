from flask import jsonify, request

from app.api import api_bp
from app.services import professor_service


@api_bp.route("/professors", methods=["GET"])
def get_professors():
    """Get all professors, optionally grouped by department."""
    group_by_dept = request.args.get("group_by_department", "false").lower() == "true"
    result = professor_service.list_professors(group_by_department=group_by_dept)

    if group_by_dept:
        return jsonify(result)
    return jsonify([prof.to_dict() for prof in result])


@api_bp.route("/professors/<int:professor_id>", methods=["GET"])
def get_professor(professor_id):
    """Get a specific professor with their opportunities."""
    professor = professor_service.get_professor(professor_id)
    return jsonify(professor.to_dict(include_opportunities=True))
