from flask import jsonify, request

from app.api import api_bp
from app.api.decorators import require_auth
from app.exceptions import ValidationError
from app.services import auth_service


@api_bp.route("/admin/professor-codes", methods=["POST"])
@require_auth
def generate_professor_code():
    """Generate a professor confirmation code for a specific RCSID. Requires admin."""
    data = request.get_json() or {}
    rcsid = data.get("rcsid", "").strip().lower()
    if not rcsid:
        raise ValidationError("rcsid is required")
    code = auth_service.generate_professor_code(request.current_user, rcsid)
    return jsonify({"code": code, "for_rcsid": rcsid}), 201


@api_bp.route("/admin/professor-codes", methods=["GET"])
@require_auth
def list_professor_codes():
    """List all professor confirmation codes. Requires admin."""
    from app.exceptions import AuthorizationError

    if not request.current_user.is_admin:
        raise AuthorizationError("Admin access required")

    return jsonify(auth_service.list_professor_codes())
