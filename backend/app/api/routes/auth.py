from flask import current_app, jsonify, make_response, redirect, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
    set_access_cookies,
    set_refresh_cookies,
    unset_jwt_cookies,
)

from app.api import api_bp
from app.helpers import prepare_flask_request
from app.models import User
from app.services import auth_service


@api_bp.route("/login", methods=["GET"])
def saml_login():
    """Initiate SAML login or bypass for development."""
    frontend_url = current_app.config.get("FRONTEND_URL", "http://localhost:3000")

    if current_app.config.get("TESTING"):
        test_email = request.args.get("email", "test@rpi.edu")
        user = User.query.filter_by(email=test_email).first()
        registered = user is not None
        code = auth_service.generate_auth_code(test_email, registered)
        return redirect(f"{frontend_url}/callback?code={code}")

    try:
        from onelogin.saml2.auth import OneLogin_Saml2_Auth

        req = prepare_flask_request(request)
        auth = OneLogin_Saml2_Auth(
            req, custom_base_path=current_app.config["SAML_CONFIG"]
        )
        return redirect(auth.login())
    except Exception as e:
        return jsonify({"error": f"SAML configuration error: {str(e)}"}), 500


@api_bp.route("/callback", methods=["POST"])
def saml_callback():
    """Process SAML response from IdP."""
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


@api_bp.route("/token", methods=["POST"])
def exchange_code_for_token():
    """Exchange temporary auth code for JWT tokens."""
    data = request.get_json()
    if not data or not data.get("code"):
        return jsonify({"error": "Missing code in request"}), 400

    email, registered = auth_service.validate_auth_code(data["code"])
    if not email:
        return jsonify({"error": "Invalid or expired code"}), 400

    access_token = create_access_token(identity=email)
    refresh_token = create_refresh_token(identity=email)

    user = User.query.filter_by(email=email).first()
    user_data = user.to_dict() if user else None

    response = make_response({"registered": registered, "user": user_data})
    set_access_cookies(response, access_token)
    set_refresh_cookies(response, refresh_token)
    return response


@api_bp.route("/token/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh_token():
    """Refresh an expired access token."""
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    response = make_response({"msg": "Token refreshed"})
    set_access_cookies(response, access_token)
    return response


@api_bp.route("/logout", methods=["POST"])
def logout():
    """Clear JWT cookies to log out."""
    response = make_response({"msg": "Logout successful"})
    unset_jwt_cookies(response)
    return response


@api_bp.route("/register", methods=["POST"])
@jwt_required()
def register_user():
    """Register a new user after SAML authentication."""
    email = get_jwt_identity()
    data = request.get_json()
    user = auth_service.register_user(email, data)
    return jsonify(user.to_dict()), 201


@api_bp.route("/metadata", methods=["GET"])
def saml_metadata():
    """Return SAML SP metadata for IdP configuration."""
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
