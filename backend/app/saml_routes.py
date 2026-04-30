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
            values_iter = iter(user_info.values())
            raw_name = next(values_iter)[0]
            rcsid = next(values_iter)[0]
            role_raw = next(values_iter)[0]

            if ", " in raw_name:
                last, first = raw_name.split(", ", 1)
                name = f"{first} {last}"
            else:
                name = raw_name
            role = "professor" if role_raw == "faculty" else "student"
            email = rcsid + "@rpi.edu"

            user = User.query.filter_by(email=email).first()
            if user is None:
                user = auth_service.register_user_from_saml(email, name, role)

            code = auth_service.generate_auth_code(email, registered=True)
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
