import uuid
from functools import wraps

from flask import Blueprint, jsonify, request

from app.database import db
from app.models import Opportunity, User

api_bp = Blueprint("api", __name__, url_prefix="/api")

# Department descriptions for RPI schools/departments
DEPARTMENT_DESCRIPTIONS = {
    "Biomedical Engineering": "Applying engineering principles to medicine and biology for healthcare advancements, including medical devices, tissue engineering, and biomaterials.",
    "Chemical and Biological Engineering": "Designing processes for chemical production and biological systems, spanning pharmaceuticals, energy, and sustainable manufacturing.",
    "Civil and Environmental Engineering": "Building sustainable infrastructure and protecting our environment through innovative design and engineering solutions.",
    "Computer Science": "Advancing computing theory and practice, from algorithms and systems to artificial intelligence and software engineering.",
    "Electrical, Computer, and Systems Engineering": "Pioneering innovations in electronics, computing systems, and complex system design for modern technology.",
    "Industrial and Systems Engineering": "Optimizing complex systems and processes to improve efficiency in manufacturing, logistics, and operations.",
    "Materials Science and Engineering": "Discovering and developing new materials that enable technological advances across industries.",
    "Mechanical, Aerospace, and Nuclear Engineering": "Engineering mechanical systems, aircraft, spacecraft, and nuclear technologies for the future.",
    "Mathematics": "Exploring pure and applied mathematics, providing foundations for science, engineering, and data analysis.",
    "Physics, Applied Physics, and Astronomy": "Investigating the fundamental laws of nature and applying physics to solve real-world problems.",
    "Chemistry and Chemical Biology": "Understanding matter at the molecular level and developing new chemical processes and compounds.",
    "Biology": "Studying living organisms and life processes, from molecular biology to ecology and evolution.",
    "Earth and Environmental Sciences": "Researching Earth systems, climate, geology, and environmental processes for a sustainable future.",
    "Cognitive Science": "Exploring the nature of mind and intelligence through interdisciplinary research in psychology, neuroscience, and AI.",
    "Economics": "Analyzing economic systems, markets, and policy to understand resource allocation and decision-making.",
    "Science and Technology Studies": "Examining the social, cultural, and political dimensions of science and technology.",
    "Architecture": "Designing buildings and spaces that shape how we live, work, and interact with our environment.",
    "Arts": "Fostering creativity and expression through visual arts, music, and digital media.",
    "Communication and Media": "Studying communication processes and media systems in the digital age.",
}


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
    # Include saved opportunity IDs for quick reference
    saved_ids = [opp.id for opp in user.saved]
    return jsonify({
        "authenticated": True,
        "user": {
            **user.to_dict(),
            "can_create_opportunities": user.can_create_opportunities,
            "saved_opportunity_ids": saved_ids,
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


@api_bp.route("/departments", methods=["GET"])
def get_departments():
    """Get all departments that have at least one professor, with descriptions."""
    professors = User.query.filter_by(role="professor").all()

    # Count professors per department
    department_counts = {}
    for prof in professors:
        for dept in (prof.departments or []):
            department_counts[dept] = department_counts.get(dept, 0) + 1

    # Build response with only departments that have professors
    departments = []
    for dept_name, count in sorted(department_counts.items()):
        departments.append({
            "name": dept_name,
            "description": DEPARTMENT_DESCRIPTIONS.get(dept_name, ""),
            "professor_count": count,
        })

    return jsonify(departments)


@api_bp.route("/departments/<path:department_name>", methods=["GET"])
def get_department(department_name):
    """Get a specific department with its professors."""
    # URL decode and normalize the department name
    import urllib.parse
    decoded_name = urllib.parse.unquote(department_name)

    # Find matching department (case-insensitive)
    matching_dept = None
    for dept in DEPARTMENT_DESCRIPTIONS.keys():
        if dept.lower() == decoded_name.lower():
            matching_dept = dept
            break

    if not matching_dept:
        return jsonify({"error": "Department not found"}), 404

    # Get professors in this department
    professors = User.query.filter_by(role="professor").all()
    dept_professors = [
        prof.to_dict() for prof in professors
        if matching_dept in (prof.departments or [])
    ]

    return jsonify({
        "name": matching_dept,
        "description": DEPARTMENT_DESCRIPTIONS.get(matching_dept, ""),
        "professors": dept_professors,
    })


@api_bp.route("/opportunities", methods=["GET"])
def get_opportunities():
    opportunities = Opportunity.query.all()
    return jsonify([opp.to_dict() for opp in opportunities])


@api_bp.route("/opportunities", methods=["POST"])
@require_opportunity_creator
def create_opportunity():
    """Create a new opportunity. Requires professor or admin role."""
    data = request.get_json()

    required_fields = ["name", "title", "type", "location"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    opportunity = Opportunity(
        id=str(uuid.uuid4()),
        name=data["name"],
        title=data["title"],
        application_due=data.get("application_due", ""),
        type=data["type"],
        hourly_pay=data.get("hourlyPay", 0),
        credits=data.get("credits", []),
        description=data.get("description", ""),
        recommended_experience=data.get("recommended_experience", ""),
        location=data["location"],
        years=data.get("years", []),
        start_date=data.get("start_date", ""),
        end_date=data.get("end_date", ""),
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


@api_bp.route("/opportunities/<string:opportunity_id>", methods=["PUT"])
@require_auth
def update_opportunity(opportunity_id):
    """Update an opportunity. Only the creator or admin can update."""
    opportunity = db.session.get(Opportunity, opportunity_id)
    if not opportunity:
        return jsonify({"error": "Opportunity not found"}), 404

    # Check if user is the creator or an admin
    if opportunity.created_by_id != request.current_user.id and not request.current_user.is_admin:
        return jsonify({"error": "Not authorized to edit this opportunity"}), 403

    data = request.get_json()

    # Update fields if provided
    if "name" in data:
        opportunity.name = data["name"]
    if "title" in data:
        opportunity.title = data["title"]
    if "application_due" in data:
        opportunity.application_due = data["application_due"]
    if "type" in data:
        opportunity.type = data["type"]
    if "hourlyPay" in data:
        opportunity.hourly_pay = data["hourlyPay"]
    if "credits" in data:
        opportunity.credits = data["credits"]
    if "description" in data:
        opportunity.description = data["description"]
    if "recommended_experience" in data:
        opportunity.recommended_experience = data["recommended_experience"]
    if "location" in data:
        opportunity.location = data["location"]
    if "years" in data:
        opportunity.years = data["years"]
    if "start_date" in data:
        opportunity.start_date = data["start_date"]
    if "end_date" in data:
        opportunity.end_date = data["end_date"]

    db.session.commit()
    return jsonify(opportunity.to_dict())


@api_bp.route("/opportunities/<string:opportunity_id>", methods=["DELETE"])
@require_auth
def delete_opportunity(opportunity_id):
    """Delete an opportunity. Only the creator or admin can delete."""
    opportunity = db.session.get(Opportunity, opportunity_id)
    if not opportunity:
        return jsonify({"error": "Opportunity not found"}), 404

    # Check if user is the creator or an admin
    if opportunity.created_by_id != request.current_user.id and not request.current_user.is_admin:
        return jsonify({"error": "Not authorized to delete this opportunity"}), 403

    db.session.delete(opportunity)
    db.session.commit()
    return jsonify({"message": "Opportunity deleted successfully"})


@api_bp.route("/users/<int:user_id>/opportunities", methods=["GET"])
def get_user_opportunities(user_id):
    """Get all opportunities created by a specific user."""
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    opportunities = Opportunity.query.filter_by(created_by_id=user_id).all()
    return jsonify([opp.to_dict() for opp in opportunities])


@api_bp.route("/users/<int:user_id>/saved-opportunities", methods=["GET"])
@require_auth
def get_saved_opportunities(user_id):
    """Get all saved opportunities for a user."""
    # Users can only view their own saved opportunities
    if request.current_user.id != user_id and not request.current_user.is_admin:
        return jsonify({"error": "Not authorized"}), 403

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify([opp.to_dict() for opp in user.saved])


@api_bp.route("/users/<int:user_id>/saved-opportunities/<string:opportunity_id>", methods=["POST"])
@require_auth
def save_opportunity(user_id, opportunity_id):
    """Save an opportunity for a user."""
    # Users can only save opportunities for themselves
    if request.current_user.id != user_id:
        return jsonify({"error": "Not authorized"}), 403

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    opportunity = db.session.get(Opportunity, opportunity_id)
    if not opportunity:
        return jsonify({"error": "Opportunity not found"}), 404

    # Check if already saved
    if opportunity in user.saved:
        return jsonify({"message": "Opportunity already saved"}), 200

    user.saved.append(opportunity)
    db.session.commit()
    return jsonify({"message": "Opportunity saved successfully"}), 201


@api_bp.route("/users/<int:user_id>/saved-opportunities/<string:opportunity_id>", methods=["DELETE"])
@require_auth
def unsave_opportunity(user_id, opportunity_id):
    """Remove a saved opportunity for a user."""
    # Users can only unsave opportunities for themselves
    if request.current_user.id != user_id:
        return jsonify({"error": "Not authorized"}), 403

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    opportunity = db.session.get(Opportunity, opportunity_id)
    if not opportunity:
        return jsonify({"error": "Opportunity not found"}), 404

    if opportunity not in user.saved:
        return jsonify({"message": "Opportunity was not saved"}), 200

    user.saved.remove(opportunity)
    db.session.commit()
    return jsonify({"message": "Opportunity unsaved successfully"})


@api_bp.route("/users/<int:user_id>/profile", methods=["PUT"])
@require_auth
def update_profile(user_id):
    """Update user profile (name, departments, profile picture)."""
    # Users can only update their own profile
    if request.current_user.id != user_id and not request.current_user.is_admin:
        return jsonify({"error": "Not authorized"}), 403

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()

    # Update allowed fields
    if "name" in data:
        user.name = data["name"]
    if "departments" in data:
        user.departments = data["departments"]
    if "profile_picture" in data:
        user.profile_picture = data["profile_picture"]
    if "title" in data and user.is_professor:
        user.title = data["title"]
    if "office" in data:
        user.office = data["office"]
    if "website" in data:
        user.website = data["website"]
    if "research_interests" in data:
        user.research_interests = data["research_interests"]

    db.session.commit()

    # Return updated user with saved opportunity IDs
    saved_ids = [opp.id for opp in user.saved]
    return jsonify({
        **user.to_dict(),
        "can_create_opportunities": user.can_create_opportunities,
        "saved_opportunity_ids": saved_ids,
    })
