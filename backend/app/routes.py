import uuid
from datetime import datetime, timedelta
from functools import wraps
from uuid import uuid4

from flask import Blueprint, current_app, jsonify, make_response, redirect, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
    set_access_cookies,
    set_refresh_cookies,
    unset_jwt_cookies,
    verify_jwt_in_request,
)

from app.database import db
from app.helpers import prepare_flask_request
from app.models import AuthCode, Opportunity, ProfessorCode, User

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


# =============================================================================
# Authentication Helpers
# =============================================================================

def generate_auth_code(user_email: str, registered: bool) -> str:
    """Generate a temporary authentication code for the callback flow."""
    code = str(uuid4())
    expires_at = datetime.now() + timedelta(seconds=30)

    auth_code = AuthCode(
        code=code,
        email=user_email,
        registered=registered,
        expires_at=expires_at,
    )
    db.session.add(auth_code)
    db.session.commit()
    return code


def validate_auth_code(code: str) -> tuple[str | None, bool | None]:
    """Validate a temporary auth code and return the user email if valid."""
    auth_code = AuthCode.query.filter_by(code=code).first()
    if not auth_code:
        return None, None

    if auth_code.expires_at < datetime.now():
        db.session.delete(auth_code)
        db.session.commit()
        return None, None

    email = auth_code.email
    registered = auth_code.registered
    db.session.delete(auth_code)
    db.session.commit()
    return email, registered


def get_current_user():
    """Get the current user from JWT or X-User-Id header (for dev/testing)."""
    # First try JWT authentication
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        if identity:
            return User.query.filter_by(email=identity).first()
    except Exception:
        pass

    # Fall back to X-User-Id header for development/testing
    if current_app.config.get("TESTING"):
        user_id = request.headers.get("X-User-Id")
        if user_id:
            return db.session.get(User, int(user_id))

    return None


def require_auth(f):
    """Decorator to require authentication for a route."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"error": "Authentication required"}), 401

        request.current_user = user
        return f(*args, **kwargs)
    return decorated_function


def require_opportunity_creator(f):
    """Decorator to require professor or admin role for creating opportunities."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"error": "Authentication required"}), 401

        if not user.can_create_opportunities:
            return jsonify({"error": "Professor or admin role required"}), 403

        request.current_user = user
        return f(*args, **kwargs)
    return decorated_function


# =============================================================================
# Authentication Routes
# =============================================================================

@api_bp.route("/login", methods=["GET"])
def saml_login():
    """Initiate SAML login or bypass for development."""
    frontend_url = current_app.config.get("FRONTEND_URL", "http://localhost:3000")

    # In testing/development mode, allow test login bypass
    if current_app.config.get("TESTING"):
        test_email = request.args.get("email", "test@rpi.edu")
        user = User.query.filter_by(email=test_email).first()
        registered = user is not None
        code = generate_auth_code(test_email, registered)
        return redirect(f"{frontend_url}/callback?code={code}")

    # Production: Use SAML authentication
    try:
        from onelogin.saml2.auth import OneLogin_Saml2_Auth
        req = prepare_flask_request(request)
        auth = OneLogin_Saml2_Auth(req, custom_base_path=current_app.config["SAML_CONFIG"])
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
        auth = OneLogin_Saml2_Auth(req, custom_base_path=current_app.config["SAML_CONFIG"])
        auth.process_response()
        errors = auth.get_errors()

        if not errors:
            user_info = auth.get_attributes()
            # Extract email from SAML attributes (adjust based on your IdP)
            user_id = next(iter(user_info.values()))[0] + "@rpi.edu"

            user = User.query.filter_by(email=user_id).first()
            registered = user is not None

            code = generate_auth_code(user_id, registered)
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

    email, registered = validate_auth_code(data["code"])
    if not email:
        return jsonify({"error": "Invalid or expired code"}), 400

    # Create JWT tokens
    access_token = create_access_token(identity=email)
    refresh_token = create_refresh_token(identity=email)

    # Get user info if registered
    user = User.query.filter_by(email=email).first()
    user_data = user.to_dict() if user else None

    response = make_response({
        "registered": registered,
        "user": user_data,
    })
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

    # Check if user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "User already registered"}), 400

    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing request body"}), 400

    role = data.get("role", "student")
    if role not in ("student", "professor"):
        role = "student"

    # Professor registration requires a valid confirmation code
    if role == "professor":
        professor_code = data.get("professor_code")
        if not professor_code:
            return jsonify({"error": "Professor registration requires a confirmation code"}), 400

        # Validate the code
        code_record = ProfessorCode.query.filter_by(code=professor_code.upper(), used=False).first()
        if not code_record:
            return jsonify({"error": "Invalid or already used confirmation code"}), 400

        # Mark code as used
        code_record.used = True
        code_record.used_by_email = email
        code_record.used_at = datetime.now()

    user = User(
        email=email,
        name=data.get("name", email.split("@")[0]),
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


@api_bp.route("/admin/professor-codes", methods=["POST"])
@require_auth
def generate_professor_code():
    """Generate a new professor confirmation code. Requires admin role."""
    if not request.current_user.is_admin:
        return jsonify({"error": "Admin access required"}), 403

    import random
    import string

    # Generate a random 8-character alphanumeric code
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

    professor_code = ProfessorCode(
        code=code,
        created_by_id=request.current_user.id,
    )
    db.session.add(professor_code)
    db.session.commit()

    return jsonify({"code": code}), 201


@api_bp.route("/admin/professor-codes", methods=["GET"])
@require_auth
def list_professor_codes():
    """List all professor confirmation codes. Requires admin role."""
    if not request.current_user.is_admin:
        return jsonify({"error": "Admin access required"}), 403

    codes = ProfessorCode.query.order_by(ProfessorCode.created_at.desc()).all()
    return jsonify([
        {
            "id": c.id,
            "code": c.code,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "used": c.used,
            "used_by_email": c.used_by_email,
            "used_at": c.used_at.isoformat() if c.used_at else None,
        }
        for c in codes
    ])


@api_bp.route("/metadata", methods=["GET"])
def saml_metadata():
    """Return SAML SP metadata for IdP configuration."""
    try:
        from onelogin.saml2.auth import OneLogin_Saml2_Auth
        req = prepare_flask_request(request)
        auth = OneLogin_Saml2_Auth(req, custom_base_path=current_app.config["SAML_CONFIG"])
        settings = auth.get_settings()
        metadata = settings.get_sp_metadata()
        errors = settings.validate_metadata(metadata)

        if len(errors) == 0:
            response = make_response(metadata, 200)
            response.headers["Content-Type"] = "text/xml"
            return response
        else:
            return make_response(", ".join(errors), 500)
    except Exception as e:
        return jsonify({"error": f"Metadata error: {str(e)}"}), 500


# =============================================================================
# General Routes
# =============================================================================

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
    for dept in DEPARTMENT_DESCRIPTIONS:
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
        created_by_id=request.current_user.id,
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

    if opportunity.created_by_id != request.current_user.id and not request.current_user.is_admin:
        return jsonify({"error": "Not authorized to edit this opportunity"}), 403

    data = request.get_json()

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
    if request.current_user.id != user_id:
        return jsonify({"error": "Not authorized"}), 403

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    opportunity = db.session.get(Opportunity, opportunity_id)
    if not opportunity:
        return jsonify({"error": "Opportunity not found"}), 404

    if opportunity in user.saved:
        return jsonify({"message": "Opportunity already saved"}), 200

    user.saved.append(opportunity)
    db.session.commit()
    return jsonify({"message": "Opportunity saved successfully"}), 201


@api_bp.route("/users/<int:user_id>/saved-opportunities/<string:opportunity_id>", methods=["DELETE"])
@require_auth
def unsave_opportunity(user_id, opportunity_id):
    """Remove a saved opportunity for a user."""
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
    if request.current_user.id != user_id and not request.current_user.is_admin:
        return jsonify({"error": "Not authorized"}), 403

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()

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

    saved_ids = [opp.id for opp in user.saved]
    return jsonify({
        **user.to_dict(),
        "can_create_opportunities": user.can_create_opportunities,
        "saved_opportunity_ids": saved_ids,
    })
