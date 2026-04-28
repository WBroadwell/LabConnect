from app.database import db
from app.exceptions import NotFoundError
from app.models import User, Opportunity


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


def add_co_professor_to_opportunity(opportunity_id: int, professor_id: int):
    # Add a professor as a co-professor on an opportunity.

    professor = get_professor(professor_id)

    opportunity = db.session.get(Opportunity, opportunity_id)
    if not opportunity:
        raise NotFoundError("Opportunity not found")

    if professor not in opportunity.co_professors:
        opportunity.co_professors.append(professor)
        db.session.commit()

    return opportunity


def remove_co_professor_from_opportunity(opportunity_id: int, professor_id: int):
    # Remove a co-professor from an opportunity.

    professor = get_professor(professor_id)

    opportunity = db.session.get(Opportunity, opportunity_id)
    if not opportunity:
        raise NotFoundError("Opportunity not found")

    if professor in opportunity.co_professors:
        opportunity.co_professors.remove(professor)
        db.session.commit()

    return opportunity
