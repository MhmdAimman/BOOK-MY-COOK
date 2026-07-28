from datetime import datetime
from app import db


class Service(db.Model):
    __tablename__ = "services"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    service_type = db.Column(db.String(20), nullable=False, default="chef")

    cuisine_types = db.Column(db.Text)
    event_types = db.Column(db.Text)
    experience_years = db.Column(db.Integer, default=0)

    price_per_event = db.Column(db.Float)
    price_unit = db.Column(db.String(50), default="per_event")

    serves_veg = db.Column(db.Boolean, default=True)
    serves_non_veg = db.Column(db.Boolean, default=False)
    min_guests = db.Column(db.Integer, default=10)
    max_guests = db.Column(db.Integer, default=500)

    city_id = db.Column(db.Integer, db.ForeignKey("cities.id"))
    area_id = db.Column(db.Integer, db.ForeignKey("areas.id"))

    images = db.Column(db.Text)

    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    rating = db.Column(db.Float, default=0.0)
    total_reviews = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    user = db.relationship("User", backref="services")
    city = db.relationship("City", backref="services")
    area = db.relationship("Area", backref="services")

    def get_cuisine_types(self):
        if self.cuisine_types:
            import json

            return json.loads(self.cuisine_types)
        return []

    def set_cuisine_types(self, value):
        import json

        self.cuisine_types = json.dumps(value)

    def get_event_types(self):
        if self.event_types:
            import json

            return json.loads(self.event_types)
        return []

    def set_event_types(self, value):
        import json

        self.event_types = json.dumps(value)

    def get_images(self):
        if self.images:
            import json

            return json.loads(self.images)
        return []

    def set_images(self, value):
        import json

        self.images = json.dumps(value)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "description": self.description,
            "service_type": self.service_type,
            "cuisine_types": self.get_cuisine_types(),
            "event_types": self.get_event_types(),
            "experience_years": self.experience_years,
            "price_per_event": self.price_per_event,
            "price_unit": self.price_unit,
            "serves_veg": self.serves_veg,
            "serves_non_veg": self.serves_non_veg,
            "min_guests": self.min_guests,
            "max_guests": self.max_guests,
            "city": self.city.name if self.city else None,
            "city_id": self.city_id,
            "area": self.area.name if self.area else None,
            "area_id": self.area_id,
            "images": self.get_images(),
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "rating": self.rating,
            "total_reviews": self.total_reviews,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "provider": {
                "id": self.user.id,
                "name": self.user.full_name,
                "email": self.user.email,
                "phone": self.user.phone,
                "role": self.user.role,
            }
            if self.user
            else None,
        }
