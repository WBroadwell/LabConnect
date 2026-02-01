import uuid

from flask import Blueprint, jsonify, request

from app.database import db
from app.models import Opportunity, User

api_bp = Blueprint("api", __name__, url_prefix="/api")


@api_bp.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy"})


@api_bp.route("/users", methods=["GET"])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])


@api_bp.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()

    if not data or not data.get("email") or not data.get("name"):
        return jsonify({"error": "email and name are required"}), 400

    user = User(email=data["email"], name=data["name"])
    db.session.add(user)
    db.session.commit()

    return jsonify(user.to_dict()), 201


@api_bp.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict())


@api_bp.route("/opportunities", methods=["GET"])
def get_opportunities():
    opportunities = Opportunity.query.all()
    return jsonify([opp.to_dict() for opp in opportunities])


@api_bp.route("/opportunities", methods=["POST"])
def create_opportunity():
    data = request.get_json()

    required_fields = ["name", "title", "application_due", "type", "description", "location"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    opportunity = Opportunity(
        id=str(uuid.uuid4()),
        name=data["name"],
        title=data["title"],
        application_due=data["application_due"],
        type=data["type"],
        hourly_pay=data.get("hourlyPay", 0),
        credits=data.get("credits", []),
        description=data["description"],
        recommended_experience=data.get("recommended_experience", ""),
        location=data["location"],
        years=data.get("years", []),
    )
    db.session.add(opportunity)
    db.session.commit()

    return jsonify(opportunity.to_dict()), 201


@api_bp.route("/opportunities/<string:opportunity_id>", methods=["GET"])
def get_opportunity(opportunity_id):
    opportunity = db.session.get(Opportunity, opportunity_id)
    if not opportunity:
        return jsonify({"error": "Opportunity not found"}), 404
    return jsonify(opportunity.to_dict())
