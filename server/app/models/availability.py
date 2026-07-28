from datetime import datetime
from app import db


class Availability(db.Model):
    __tablename__ = "availability"

    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey("services.id"), nullable=False)
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    is_available = db.Column(db.Boolean, default=True)
    booking_id = db.Column(db.Integer, db.ForeignKey("bookings.id"))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    service = db.relationship("Service", backref="availability_slots")
    booking = db.relationship("Booking", backref="availability")

    def to_dict(self):
        return {
            "id": self.id,
            "service_id": self.service_id,
            "date": self.date.isoformat() if self.date else None,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "is_available": self.is_available,
            "booking_id": self.booking_id,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def overlaps(self, other):
        if self.date != other.date:
            return False
        return not (
            self.end_time <= other.start_time or self.start_time >= other.end_time
        )
