from app.extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Opportunity(db.Model):
    __tablename__ = "opportunities"

    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    application_due = db.Column(db.String(50), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    hourly_pay = db.Column(db.Float, nullable=False, default=0)
    credits = db.Column(db.JSON, nullable=False, default=list)
    description = db.Column(db.Text, nullable=False)
    recommended_experience = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(200), nullable=False)
    years = db.Column(db.JSON, nullable=False, default=list)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "title": self.title,
            "application_due": self.application_due,
            "type": self.type,
            "hourlyPay": self.hourly_pay,
            "credits": self.credits or [],
            "description": self.description,
            "recommended_experience": self.recommended_experience or "",
            "location": self.location,
            "years": self.years or [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
