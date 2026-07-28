from datetime import datetime
from app import db


class EventHistory(db.Model):
    __tablename__ = "event_history"

    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey("services.id"), nullable=False)
    booking_id = db.Column(db.Integer, db.ForeignKey("bookings.id"))

    event_date = db.Column(db.Date)
    event_type = db.Column(db.String(100))
    number_of_guests = db.Column(db.Integer)
    cuisine_types = db.Column(db.Text)
    venue = db.Column(db.String(255))

    document_url = db.Column(db.String(255))
    photos = db.Column(db.Text)

    is_featured = db.Column(db.Boolean, default=False)
    display_order = db.Column(db.Integer, default=0)

    customer_name = db.Column(db.String(255))
    customer_testimonial = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    service = db.relationship("Service", backref="event_history")
    booking = db.relationship("Booking", backref="event_history")

    def get_cuisine_types(self):
        if self.cuisine_types:
            import json

            return json.loads(self.cuisine_types)
        return []

    def set_cuisine_types(self, value):
        import json

        self.cuisine_types = json.dumps(value)

    def get_photos(self):
        if self.photos:
            import json

            return json.loads(self.photos)
        return []

    def set_photos(self, value):
        import json

        self.photos = json.dumps(value)

    def to_dict(self):
        return {
            "id": self.id,
            "service_id": self.service_id,
            "booking_id": self.booking_id,
            "event_date": self.event_date.isoformat() if self.event_date else None,
            "event_type": self.event_type,
            "number_of_guests": self.number_of_guests,
            "cuisine_types": self.get_cuisine_types(),
            "venue": self.venue,
            "document_url": self.document_url,
            "photos": self.get_photos(),
            "is_featured": self.is_featured,
            "display_order": self.display_order,
            "customer_name": self.customer_name,
            "customer_testimonial": self.customer_testimonial,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
