from app.database import db

# Association table for saved opportunities (many-to-many)
# Must be defined before User because User.saved references it directly
saved_opportunities = db.Table(
    "saved_opportunities",
    db.Column("user_id", db.Integer, db.ForeignKey("users.id"), primary_key=True),
    db.Column(
        "opportunity_id",
        db.String(36),
        db.ForeignKey("opportunities.id"),
        primary_key=True,
    ),
    db.Column("saved_at", db.DateTime, server_default=db.func.now()),
)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="student")
    title = db.Column(db.String(100), nullable=True)
    departments = db.Column(db.JSON, nullable=False, default=list)
    office = db.Column(db.String(100), nullable=True)
    website = db.Column(db.String(200), nullable=True)
    research_interests = db.Column(db.JSON, nullable=False, default=list)
    profile_picture = db.Column(db.Text, nullable=True)
    is_admin = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    opportunities = db.relationship(
        "Opportunity", back_populates="creator", lazy="dynamic"
    )

    saved = db.relationship(
        "Opportunity",
        secondary=saved_opportunities,
        lazy="dynamic",
        backref=db.backref("saved_by_users", lazy="dynamic"),
    )

    @property
    def is_professor(self):
        return self.role == "professor" or self.is_admin

    @property
    def can_create_opportunities(self):
        return self.role == "professor" or self.is_admin

    def to_dict(self, include_opportunities=False, include_saved=False):
        data = {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "role": self.role,
            "is_admin": self.is_admin,
            "title": self.title,
            "departments": self.departments or [],
            "office": self.office,
            "website": self.website,
            "research_interests": self.research_interests or [],
            "profile_picture": self.profile_picture,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_opportunities:
            data["opportunities"] = [opp.to_dict() for opp in self.opportunities]
        if include_saved:
            data["saved_opportunities"] = [opp.to_dict() for opp in self.saved]
        return data
