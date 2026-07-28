from datetime import datetime
from app import db


class Conversation(db.Model):
    __tablename__ = "conversations"

    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey("services.id"), nullable=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    provider_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    last_message_at = db.Column(db.DateTime, default=datetime.utcnow)

    service = db.relationship("Service", backref="conversations")
    customer = db.relationship(
        "User", foreign_keys=[customer_id], backref="customer_conversations"
    )
    provider = db.relationship(
        "User", foreign_keys=[provider_id], backref="provider_conversations"
    )
    messages = db.relationship(
        "Message",
        backref="conversation",
        cascade="all, delete-orphan",
        order_by="Message.created_at",
    )

    def to_dict(self, current_user_id=None):
        other_user = (
            self.provider if current_user_id == self.customer_id else self.customer
        )
        unread_count = 0
        if current_user_id:
            unread_count = (
                Message.query.filter_by(conversation_id=self.id, is_read=False)
                .filter(Message.sender_id != current_user_id)
                .count()
            )

        last_message = (
            Message.query.filter_by(conversation_id=self.id)
            .order_by(Message.created_at.desc())
            .first()
        )

        return {
            "id": self.id,
            "service_id": self.service_id,
            "service_title": self.service.title if self.service else None,
            "customer_id": self.customer_id,
            "provider_id": self.provider_id,
            "other_user": {
                "id": other_user.id,
                "name": other_user.full_name,
                "role": other_user.role,
            },
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_message": last_message.to_dict() if last_message else None,
            "unread_count": unread_count,
        }


class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(
        db.Integer, db.ForeignKey("conversations.id"), nullable=False
    )
    sender_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    sender = db.relationship("User", backref="messages")

    def to_dict(self):
        return {
            "id": self.id,
            "conversation_id": self.conversation_id,
            "sender_id": self.sender_id,
            "sender_name": self.sender.full_name if self.sender else None,
            "content": self.content,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
