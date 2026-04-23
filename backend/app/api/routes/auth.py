from flask import jsonify, make_response, request
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
from app.models import User
from app.services import auth_service


@api_bp.route("/token", methods=["POST"])
def exchange_code_for_token():
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
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    response = make_response({"msg": "Token refreshed"})
    set_access_cookies(response, access_token)
    return response


@api_bp.route("/logout", methods=["POST"])
def logout():
    response = make_response({"msg": "Logout successful"})
    unset_jwt_cookies(response)
    return response


@api_bp.route("/register", methods=["POST"])
@jwt_required()
def register_user():
    email = get_jwt_identity()
    data = request.get_json()
    user = auth_service.register_user(email, data)
    return jsonify(user.to_dict()), 201
