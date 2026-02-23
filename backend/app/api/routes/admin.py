from flask import jsonify, request

from app.api import api_bp
from app.api.decorators import require_auth
from app.services import auth_service


@api_bp.route("/admin/professor-codes", methods=["POST"])
@require_auth
def generate_professor_code():
    """Generate a new professor confirmation code. Requires admin role."""
    code = auth_service.generate_professor_code(request.current_user)
    return jsonify({"code": code}), 201


@api_bp.route("/admin/professor-codes", methods=["GET"])
@require_auth
def list_professor_codes():
    """List all professor confirmation codes. Requires admin role."""
    from app.exceptions import AuthorizationError

    if not request.current_user.is_admin:
        raise AuthorizationError("Admin access required")

    return jsonify(auth_service.list_professor_codes())
