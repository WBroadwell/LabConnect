import random
import string
from datetime import datetime, timedelta
from uuid import uuid4

from app.database import db
from app.exceptions import ConflictError, ValidationError
from app.models import AuthCode, ProfessorCode, User


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
    """Validate a temporary auth code and return (email, registered) if valid."""
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


def register_user(email: str, data: dict) -> User:
    """Register a new user. Raises ConflictError if already registered, ValidationError on bad input."""
    existing = User.query.filter_by(email=email).first()
    if existing:
        raise ConflictError("User already registered")

    if not data:
        raise ValidationError("Missing request body")

    role = data.get("role", "student")
    if role not in ("student", "professor"):
        role = "student"

    if role == "professor":
        professor_code = data.get("professor_code")
        if not professor_code:
            raise ValidationError("Professor registration requires a confirmation code")

        code_record = ProfessorCode.query.filter_by(
            code=professor_code.upper(), used=False
        ).first()
        if not code_record:
            raise ValidationError("Invalid or already used confirmation code")

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
    return user


def generate_professor_code(requesting_user: User) -> str:
    """Generate a new professor confirmation code. Requires admin role."""
    from app.exceptions import AuthorizationError

    if not requesting_user.is_admin:
        raise AuthorizationError("Admin access required")

    code = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
    professor_code = ProfessorCode(
        code=code,
        created_by_id=requesting_user.id,
    )
    db.session.add(professor_code)
    db.session.commit()
    return code


def list_professor_codes() -> list[dict]:
    """Return all professor codes as dicts."""
    codes = ProfessorCode.query.order_by(ProfessorCode.created_at.desc()).all()
    return [
        {
            "id": c.id,
            "code": c.code,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "used": c.used,
            "used_by_email": c.used_by_email,
            "used_at": c.used_at.isoformat() if c.used_at else None,
        }
        for c in codes
    ]
