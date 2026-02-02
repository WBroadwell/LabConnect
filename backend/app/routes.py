import uuid
from functools import wraps

from flask import Blueprint, jsonify, request

from app.database import db
from app.models import Opportunity, User

api_bp = Blueprint("api", __name__, url_prefix="/api")


def require_auth(f):
    """Decorator to require authentication for a route."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get user_id from request header (will be set by auth middleware with RPI SSO)
        user_id = request.headers.get("X-User-Id")
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401

        user = db.session.get(User, int(user_id))
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Attach user to request context for use in route
        request.current_user = user
        return f(*args, **kwargs)
    return decorated_function


def require_opportunity_creator(f):
    """Decorator to require professor or admin role for creating opportunities."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get user_id from request header (will be set by auth middleware with RPI SSO)
        user_id = request.headers.get("X-User-Id")
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401

        user = db.session.get(User, int(user_id))
        if not user:
            return jsonify({"error": "User not found"}), 404

        if not user.can_create_opportunities:
            return jsonify({"error": "Professor or admin role required"}), 403

        # Attach user to request context for use in route
        request.current_user = user
        return f(*args, **kwargs)
    return decorated_function


def get_current_user():
    """Get the current user from request header if authenticated."""
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        return None
    return db.session.get(User, int(user_id))


@api_bp.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy"})


@api_bp.route("/auth/me", methods=["GET"])
def get_current_user_info():
    """Get the current authenticated user's info."""
    user = get_current_user()
    if not user:
        return jsonify({"authenticated": False, "user": None})
    return jsonify({
        "authenticated": True,
        "user": {
            **user.to_dict(),
            "can_create_opportunities": user.can_create_opportunities,
        }
    })


@api_bp.route("/users", methods=["GET"])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])


@api_bp.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()

    if not data or not data.get("email") or not data.get("name"):
        return jsonify({"error": "email and name are required"}), 400

    role = data.get("role", "student")
    if role not in ("student", "professor", "admin"):
        return jsonify({"error": "role must be 'student', 'professor', or 'admin'"}), 400

    user = User(
        email=data["email"],
        name=data["name"],
        role=role,
        title=data.get("title"),
        departments=data.get("departments", []),
        office=data.get("office"),
        website=data.get("website"),
        research_interests=data.get("research_interests", []),
    )
    db.session.add(user)
    db.session.commit()

    return jsonify(user.to_dict()), 201


@api_bp.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict())


@api_bp.route("/professors", methods=["GET"])
def get_professors():
    """Get all professors, optionally grouped by department."""
    professors = User.query.filter_by(role="professor").all()

    # Check if client wants grouped by department
    group_by_dept = request.args.get("group_by_department", "false").lower() == "true"

    if group_by_dept:
        # Group professors by their departments
        departments = {}
        for prof in professors:
            for dept in (prof.departments or []):
                if dept not in departments:
                    departments[dept] = []
                departments[dept].append(prof.to_dict())
        return jsonify({"departments": departments})

    return jsonify([prof.to_dict() for prof in professors])


@api_bp.route("/professors/<int:professor_id>", methods=["GET"])
def get_professor(professor_id):
    """Get a specific professor with their opportunities."""
    professor = db.session.get(User, professor_id)
    if not professor:
        return jsonify({"error": "Professor not found"}), 404
    if not professor.is_professor:
        return jsonify({"error": "User is not a professor"}), 404
    return jsonify(professor.to_dict(include_opportunities=True))


@api_bp.route("/opportunities", methods=["GET"])
def get_opportunities():
    opportunities = Opportunity.query.all()
    return jsonify([opp.to_dict() for opp in opportunities])


@api_bp.route("/opportunities", methods=["POST"])
@require_opportunity_creator
def create_opportunity():
    """Create a new opportunity. Requires professor or admin role."""
    data = request.get_json()

    required_fields = ["name", "title", "application_due", "type", "location"]
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
        description=data.get("description", ""),
        recommended_experience=data.get("recommended_experience", ""),
        location=data["location"],
        years=data.get("years", []),
        created_by_id=request.current_user.id,  # Link to professor who created it
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
