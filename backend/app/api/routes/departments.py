from flask import jsonify

from app.api import api_bp
from app.services import department_service


@api_bp.route("/departments", methods=["GET"])
def get_departments():
    """Get all departments that have at least one professor, with descriptions."""
    return jsonify(department_service.list_departments())


@api_bp.route("/departments/<path:department_name>", methods=["GET"])
def get_department(department_name):
    """Get a specific department with its professors."""
    result = department_service.get_department(department_name)
    return jsonify(result)
