from datetime import datetime
from app import db


class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey("services.id"), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    provider_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    event_date = db.Column(db.Date, nullable=False)
    event_time = db.Column(db.Time, nullable=False)
    event_type = db.Column(db.String(100))
    event_address = db.Column(db.Text)
    city_id = db.Column(db.Integer, db.ForeignKey("cities.id"))
    area_id = db.Column(db.Integer, db.ForeignKey("areas.id"))
    number_of_guests = db.Column(db.Integer, default=50)
    special_requirements = db.Column(db.Text)

    base_amount = db.Column(db.Float)
    extra_charges = db.Column(db.Float, default=0.0)
    total_amount = db.Column(db.Float)

    status = db.Column(db.String(20), default="pending")
    rejection_reason = db.Column(db.Text)
    cancelled_by = db.Column(db.Integer, db.ForeignKey("users.id"))
    cancellation_reason = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    service = db.relationship("Service", backref="bookings")
    customer = db.relationship(
        "User", foreign_keys=[customer_id], backref="customer_bookings"
    )
    provider = db.relationship(
        "User", foreign_keys=[provider_id], backref="provider_bookings"
    )
    city = db.relationship("City", backref="bookings")
    area = db.relationship("Area", backref="bookings")
    canceller = db.relationship("User", foreign_keys=[cancelled_by])

    STATUS_PENDING = "pending"
    STATUS_CONFIRMED = "confirmed"
    STATUS_REJECTED = "rejected"
    STATUS_PAYMENT_PENDING = "payment_pending"
    STATUS_PAID = "paid"
    STATUS_COMPLETED = "completed"
    STATUS_CANCELLED = "cancelled"

    VALID_TRANSITIONS = {
        STATUS_PENDING: [STATUS_CONFIRMED, STATUS_REJECTED, STATUS_CANCELLED],
        STATUS_CONFIRMED: [STATUS_PAYMENT_PENDING, STATUS_CANCELLED],
        STATUS_PAYMENT_PENDING: [STATUS_PAID, STATUS_CANCELLED],
        STATUS_PAID: [STATUS_COMPLETED, STATUS_CANCELLED],
        STATUS_REJECTED: [],
        STATUS_COMPLETED: [],
        STATUS_CANCELLED: [],
    }

    def can_transition_to(self, new_status):
        return new_status in self.VALID_TRANSITIONS.get(self.status, [])

    def to_dict(self):
        return {
            "id": self.id,
            "service_id": self.service_id,
            "service": self.service.to_dict() if self.service else None,
            "customer_id": self.customer_id,
            "customer": {
                "id": self.customer.id,
                "name": self.customer.full_name,
                "email": self.customer.email,
                "phone": self.customer.phone,
            }
            if self.customer
            else None,
            "provider_id": self.provider_id,
            "provider": {
                "id": self.provider.id,
                "name": self.provider.full_name,
                "email": self.provider.email,
                "phone": self.provider.phone,
            }
            if self.provider
            else None,
            "event_date": self.event_date.isoformat() if self.event_date else None,
            "event_time": self.event_time.isoformat() if self.event_time else None,
            "event_type": self.event_type,
            "event_address": self.event_address,
            "city": self.city.name if self.city else None,
            "city_id": self.city_id,
            "area": self.area.name if self.area else None,
            "area_id": self.area_id,
            "number_of_guests": self.number_of_guests,
            "special_requirements": self.special_requirements,
            "base_amount": self.base_amount,
            "extra_charges": self.extra_charges,
            "total_amount": self.total_amount,
            "status": self.status,
            "rejection_reason": self.rejection_reason,
            "cancellation_reason": self.cancellation_reason,
            "cancelled_by": self.cancelled_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
