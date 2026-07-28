from datetime import datetime
from app import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(15))
    role = db.Column(db.String(20), nullable=False, default="customer")
    is_verified = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    profile = db.relationship("Profile", backref="user", uselist=False, lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "phone": self.phone,
            "role": self.role,
            "is_verified": self.is_verified,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "profile": self.profile.to_dict() if self.profile else None,
        }


class Profile(db.Model):
    __tablename__ = "profiles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    profile_image = db.Column(db.String(255))
    bio = db.Column(db.Text)
    address = db.Column(db.Text)
    city_id = db.Column(db.Integer, db.ForeignKey("cities.id"))
    area_id = db.Column(db.Integer, db.ForeignKey("areas.id"))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    city = db.relationship("City", backref="profiles")
    area = db.relationship("Area", backref="profiles")

    def to_dict(self):
        return {
            "id": self.id,
            "profile_image": self.profile_image,
            "bio": self.bio,
            "address": self.address,
            "city": self.city.name if self.city else None,
            "area": self.area.name if self.area else None,
            "city_id": self.city_id,
            "area_id": self.area_id,
        }
