from app.database import db
from app.exceptions import AuthorizationError, NotFoundError
from app.models import Opportunity, User


def get_saved_opportunities(user_id: int, requesting_user: User) -> list[Opportunity]:
    """Return saved opportunities for a user. Raises AuthorizationError or NotFoundError."""
    if requesting_user.id != user_id and not requesting_user.is_admin:
        raise AuthorizationError("Not authorized")

    user = db.session.get(User, user_id)
    if not user:
        raise NotFoundError("User not found")

    return list(user.saved)


def save_opportunity(
    user_id: int, opportunity_id: str, requesting_user: User
) -> tuple[dict, int]:
    """Save an opportunity for a user. Returns (message_dict, status_code)."""
    if requesting_user.id != user_id:
        raise AuthorizationError("Not authorized")

    user = db.session.get(User, user_id)
    if not user:
        raise NotFoundError("User not found")

    opportunity = db.session.get(Opportunity, opportunity_id)
    if not opportunity:
        raise NotFoundError("Opportunity not found")

    if opportunity in user.saved:
        return {"message": "Opportunity already saved"}, 200

    user.saved.append(opportunity)
    db.session.commit()
    return {"message": "Opportunity saved successfully"}, 201


def unsave_opportunity(
    user_id: int, opportunity_id: str, requesting_user: User
) -> dict:
    """Remove a saved opportunity for a user."""
    if requesting_user.id != user_id:
        raise AuthorizationError("Not authorized")

    user = db.session.get(User, user_id)
    if not user:
        raise NotFoundError("User not found")

    opportunity = db.session.get(Opportunity, opportunity_id)
    if not opportunity:
        raise NotFoundError("Opportunity not found")

    if opportunity not in user.saved:
        return {"message": "Opportunity was not saved"}

    user.saved.remove(opportunity)
    db.session.commit()
    return {"message": "Opportunity unsaved successfully"}
