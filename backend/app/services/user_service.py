from app.database import db
from app.exceptions import AuthorizationError, NotFoundError, ValidationError
from app.models import User


def list_users() -> list[User]:
    return User.query.all()


def get_user(user_id: int) -> User:
    """Return a user by ID. Raises NotFoundError if not found."""
    user = db.session.get(User, user_id)
    if not user:
        raise NotFoundError("User not found")
    return user


def create_user(data: dict) -> User:
    """Create a new user. Raises ValidationError on bad input."""
    if not data or not data.get("email") or not data.get("name"):
        raise ValidationError("email and name are required")

    role = data.get("role", "student")
    if role not in ("student", "professor", "admin"):
        raise ValidationError("role must be 'student', 'professor', or 'admin'")

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
    return user


def update_profile(user_id: int, requesting_user: User, data: dict) -> dict:
    """Update a user's profile. Raises AuthorizationError or NotFoundError as appropriate."""
    if requesting_user.id != user_id and not requesting_user.is_admin:
        raise AuthorizationError("Not authorized")

    user = db.session.get(User, user_id)
    if not user:
        raise NotFoundError("User not found")

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
    return {
        **user.to_dict(),
        "can_create_opportunities": user.can_create_opportunities,
        "saved_opportunity_ids": saved_ids,
    }
