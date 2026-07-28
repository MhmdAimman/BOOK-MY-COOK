from datetime import datetime
from app import db


class SignatureDish(db.Model):
    __tablename__ = "signature_dishes"

    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey("services.id"), nullable=False)

    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(255))
    cuisine_type = db.Column(db.String(100))
    is_veg = db.Column(db.Boolean, default=True)
    display_order = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    service = db.relationship("Service", backref="signature_dishes")

    def to_dict(self):
        return {
            "id": self.id,
            "service_id": self.service_id,
            "name": self.name,
            "description": self.description,
            "image_url": self.image_url,
            "cuisine_type": self.cuisine_type,
            "is_veg": self.is_veg,
            "display_order": self.display_order,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
