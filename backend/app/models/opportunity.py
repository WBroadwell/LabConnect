from app.database import db


class Opportunity(db.Model):
    __tablename__ = "opportunities"

    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    application_due = db.Column(db.String(50), nullable=True)
    type = db.Column(db.String(50), nullable=False)
    hourly_pay = db.Column(db.Float, nullable=False, default=0)
    credits = db.Column(db.JSON, nullable=False, default=list)
    description = db.Column(db.Text, nullable=False)
    recommended_experience = db.Column(db.Text, nullable=True)
    recommended_majors = db.Column(db.JSON, nullable=False, default=list)
    location = db.Column(db.String(200), nullable=False)
    years = db.Column(db.JSON, nullable=False, default=list)
    start_date = db.Column(db.String(50), nullable=True)
    end_date = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    created_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    creator = db.relationship("User", back_populates="opportunities")
    status = db.Column(db.String(20), nullable=False, default="active")

    def to_dict(self, include_creator=True):
        data = {
            "id": self.id,
            "name": self.name,
            "title": self.title,
            "application_due": self.application_due or "",
            "type": self.type,
            "hourlyPay": self.hourly_pay,
            "credits": self.credits or [],
            "description": self.description,
            "recommended_experience": self.recommended_experience or "",
            "recommended_majors": self.recommended_majors or [],
            "location": self.location,
            "years": self.years or [],
            "start_date": self.start_date or "",
            "end_date": self.end_date or "",
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "created_by_id": self.created_by_id,
        }
        if include_creator and self.creator:
            data["creator"] = {
                "id": self.creator.id,
                "name": self.creator.name,
                "email": self.creator.email,
                "title": self.creator.title,
                "departments": self.creator.departments or [],
            }
        return data
