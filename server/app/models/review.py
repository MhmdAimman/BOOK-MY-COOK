from datetime import datetime
from app import db


class Review(db.Model):
    __tablename__ = "reviews"

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey("bookings.id"))
    service_id = db.Column(db.Integer, db.ForeignKey("services.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
    is_visible = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    booking = db.relationship("Booking", backref="review")
    service = db.relationship("Service", backref="reviews")
    user = db.relationship("User", backref="reviews")

    def to_dict(self):
        return {
            "id": self.id,
            "booking_id": self.booking_id,
            "service_id": self.service_id,
            "user_id": self.user_id,
            "rating": self.rating,
            "comment": self.comment,
            "is_visible": self.is_visible,
            "user": {"id": self.user.id, "name": self.user.full_name}
            if self.user
            else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
