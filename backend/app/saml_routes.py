from flask import Blueprint, current_app, jsonify, make_response, redirect, request

from app.helpers import prepare_flask_request
from app.models import User
from app.services import auth_service

saml_bp = Blueprint("saml", __name__)


@saml_bp.route("/callback", methods=["POST"])
def saml_callback():
    frontend_url = current_app.config.get("FRONTEND_URL", "http://localhost:3000")

    try:
        from onelogin.saml2.auth import OneLogin_Saml2_Auth

        req = prepare_flask_request(request)
        auth = OneLogin_Saml2_Auth(
            req, custom_base_path=current_app.config["SAML_CONFIG"]
        )
        auth.process_response()
        errors = auth.get_errors()

        if not errors:
            user_info = auth.get_attributes()
            user_id = next(iter(user_info.values()))[0] + "@rpi.edu"
            user = User.query.filter_by(email=user_id).first()
            registered = user is not None
            code = auth_service.generate_auth_code(user_id, registered)
            return redirect(f"{frontend_url}/callback?code={code}")

        error_reason = auth.get_last_error_reason()
        return make_response({"errors": errors, "error_reason": error_reason}, 500)
    except Exception as e:
        return jsonify({"error": f"SAML processing error: {str(e)}"}), 500


@saml_bp.route("/metadata", methods=["GET"])
def saml_metadata():
    try:
        from onelogin.saml2.auth import OneLogin_Saml2_Auth

        req = prepare_flask_request(request)
        auth = OneLogin_Saml2_Auth(
            req, custom_base_path=current_app.config["SAML_CONFIG"]
        )
        settings = auth.get_settings()
        metadata = settings.get_sp_metadata()
        errors = settings.validate_metadata(metadata)

        if len(errors) == 0:
            response = make_response(metadata, 200)
            response.headers["Content-Type"] = "text/xml"
            return response
        return make_response(", ".join(errors), 500)
    except Exception as e:
        return jsonify({"error": f"Metadata error: {str(e)}"}), 500
