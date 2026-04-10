import uuid

from app.database import db
from app.exceptions import AuthorizationError, NotFoundError, ValidationError
from app.models import Opportunity, User


# def list_opportunities() -> list[Opportunity]:
# return Opportunity.query.all()


def list_opportunities() -> list[Opportunity]:
    return (
        Opportunity.query.filter_by(status="active")
        .filter(Opportunity.status != "deleted")
        .all()
    )


def create_opportunity(data: dict, creator: User) -> Opportunity:
    """Create a new opportunity. Raises ValidationError on missing required fields."""
    required_fields = ["name", "title", "type", "location"]
    for field in required_fields:
        if not data.get(field):
            raise ValidationError(f"{field} is required")

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
        recommended_majors=data.get("recommended_majors", []),
        location=data["location"],
        years=data.get("years", []),
        start_date=data.get("start_date", ""),
        end_date=data.get("end_date", ""),
        created_by_id=creator.id,
        status="active",
    )

    db.session.add(opportunity)
    db.session.commit()
    return opportunity


def get_opportunity(opportunity_id: str) -> Opportunity:
    """Return an opportunity by ID. Raises NotFoundError if not found."""
    opportunity = db.session.get(Opportunity, opportunity_id)
    if not opportunity:
        raise NotFoundError("Opportunity not found")
    if opportunity.status == "deleted":
        raise NotFoundError("Opportunity previously deleted")
    return opportunity


def update_opportunity(
    opportunity_id: str, data: dict, requesting_user: User
) -> Opportunity:
    """Update an opportunity. Raises NotFoundError or AuthorizationError as appropriate."""
    opportunity = db.session.get(Opportunity, opportunity_id)
    if not opportunity:
        raise NotFoundError("Opportunity not found")

    if opportunity.created_by_id != requesting_user.id and not requesting_user.is_admin:
        raise AuthorizationError("Not authorized to edit this opportunity")

    if opportunity.status == "deleted":
        raise ValidationError("Cannot edit a deleted opportunity")

    field_map = {
        "name": "name",
        "title": "title",
        "application_due": "application_due",
        "type": "type",
        "hourlyPay": "hourly_pay",
        "credits": "credits",
        "description": "description",
        "recommended_experience": "recommended_experience",
        "recommended_majors": "recommended_majors",
        "location": "location",
        "years": "years",
        "start_date": "start_date",
        "end_date": "end_date",
    }
    for key, attr in field_map.items():
        if key in data:
            setattr(opportunity, attr, data[key])

    db.session.commit()
    return opportunity


def delete_opportunity(opportunity_id: str, requesting_user: User) -> None:
    """Delete an opportunity. Raises NotFoundError or AuthorizationError as appropriate."""
    opportunity = db.session.get(Opportunity, opportunity_id)
    if not opportunity:
        raise NotFoundError("Opportunity not found")

    if opportunity.created_by_id != requesting_user.id and not requesting_user.is_admin:
        raise AuthorizationError("Not authorized to delete this opportunity")

    opportunity.status = "deleted"

    db.session.commit()


def get_user_opportunities(user_id: int) -> list[Opportunity]:
    """Return all opportunities created by a user.  NotFoundError if user not found."""
    from app.database import db
    from app.models import User

    user = db.session.get(User, user_id)
    if not user:
        raise NotFoundError("User not found")

    # return Opportunity.query.filter_by(created_by_id=user_id).all()
    # return (
    # Opportunity.query.filter_by(created_by_id=user_id, status="active")
    # .query.filter(Opportunity.status != "deleted")
    # .all()
    # )
    # return Opportunity.query.filter(Opportunity.created_by_id == user_id, Opportunity.status != "deleted").all()

    return Opportunity.query.filter_by(created_by_id=user_id, status="active").all()


def archive_opportunity(opportunity_id: str, requesting_user: User) -> Opportunity:
    opportunity = get_opportunity(opportunity_id)

    if opportunity.created_by_id != requesting_user.id and not requesting_user.is_admin:
        raise AuthorizationError("Not authorized")

    if opportunity.status == "deleted":
        raise ValidationError("Cannot archive deleted opportunity")

    opportunity.status = "past"
    db.session.commit()
    return opportunity


def reopen_opportunity(opportunity_id: str, requesting_user: User) -> Opportunity:
    opportunity = get_opportunity(opportunity_id)

    if opportunity.created_by_id != requesting_user.id and not requesting_user.is_admin:
        raise AuthorizationError("Not authorized")

    if opportunity.status == "deleted":
        raise ValidationError("Cannot reopen deleted opportunity")

    opportunity.status = "active"
    db.session.commit()
    return opportunity


def permanent_delete_opportunity(opportunity_id: str, requesting_user: User) -> None:
    opportunity = get_opportunity(opportunity_id)

    if opportunity.created_by_id != requesting_user.id and not requesting_user.is_admin:
        raise AuthorizationError("Not authorized")

    db.session.delete(opportunity)
    db.session.commit()


def get_past_opportunities(user_id: int) -> list[Opportunity]:
    return Opportunity.query.filter_by(created_by_id=user_id, status="past").all()


def auto_archive_expired():
    opportunities = Opportunity.query.filter_by(status="active").all()
    for opp in opportunities:
        if opp.end_date and opp.end_date < datetime.now().isoformat():
            opp.status = "past"
    db.session.commit()
