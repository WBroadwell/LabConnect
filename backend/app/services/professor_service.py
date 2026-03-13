from app.database import db
from app.exceptions import NotFoundError
from app.models import User


def list_professors(group_by_department: bool = False):
    """Return all professors. If group_by_department, returns a grouped dict."""
    professors = User.query.filter_by(role="professor").all()

    if group_by_department:
        departments: dict[str, list] = {}
        for prof in professors:
            for dept in prof.departments or []:
                if dept not in departments:
                    departments[dept] = []
                departments[dept].append(prof.to_dict())
        return {"departments": departments}

    return professors


def get_professor(professor_id: int) -> User:
    """Return a professor by ID. Raises NotFoundError if not found or not a professor."""
    professor = db.session.get(User, professor_id)
    if not professor:
        raise NotFoundError("Professor not found")
    if not professor.is_professor:
        raise NotFoundError("User is not a professor")
    return professor
