from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.service import Service
from app.models.message import Conversation, Message
from datetime import datetime

messages_bp = Blueprint("messages", __name__)


@messages_bp.route("/conversations", methods=["GET"])
@jwt_required()
def get_conversations():
    user_id = int(get_jwt_identity())

    conversations = (
        Conversation.query.filter(
            (Conversation.customer_id == user_id)
            | (Conversation.provider_id == user_id)
        )
        .order_by(Conversation.last_message_at.desc())
        .all()
    )

    return jsonify(
        {"conversations": [c.to_dict(current_user_id=user_id) for c in conversations]}
    ), 200


@messages_bp.route("/conversations/<int:conversation_id>", methods=["GET"])
@jwt_required()
def get_conversation(conversation_id):
    user_id = int(get_jwt_identity())

    conversation = Conversation.query.get(conversation_id)

    if not conversation:
        return jsonify({"message": "Conversation not found"}), 404

    if conversation.customer_id != user_id and conversation.provider_id != user_id:
        return jsonify({"message": "Access denied"}), 403

    Message.query.filter_by(conversation_id=conversation_id, is_read=False).filter(
        Message.sender_id != user_id
    ).update({"is_read": True})
    db.session.commit()

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 50, type=int)

    messages = (
        Message.query.filter_by(conversation_id=conversation_id)
        .order_by(Message.created_at.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )

    return jsonify(
        {
            "conversation": conversation.to_dict(current_user_id=user_id),
            "messages": [m.to_dict() for m in reversed(messages.items)],
            "total": messages.total,
            "pages": messages.pages,
            "current_page": page,
        }
    ), 200


@messages_bp.route("/conversations", methods=["POST"])
@jwt_required()
def create_conversation():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data:
        return jsonify({"message": "No data provided"}), 400

    service_id = data.get("service_id")
    provider_id = data.get("provider_id")
    initial_message = data.get("message", "")

    if not provider_id:
        return jsonify({"message": "Provider ID is required"}), 400

    provider = User.query.get(provider_id)
    if not provider or provider.role not in ["chef", "caterer", "decorator"]:
        return jsonify({"message": "Invalid provider"}), 400

    if provider_id == user_id:
        return jsonify({"message": "Cannot start conversation with yourself"}), 400

    existing = Conversation.query.filter_by(
        customer_id=user_id, provider_id=provider_id, service_id=service_id
    ).first()

    if existing:
        if initial_message:
            message = Message(
                conversation_id=existing.id, sender_id=user_id, content=initial_message
            )
            db.session.add(message)
            existing.last_message_at = datetime.utcnow()
            db.session.commit()

        return jsonify(
            {
                "message": "Conversation already exists",
                "conversation": existing.to_dict(current_user_id=user_id),
            }
        ), 200

    conversation = Conversation(
        service_id=service_id, customer_id=user_id, provider_id=provider_id
    )
    db.session.add(conversation)
    db.session.flush()

    if initial_message:
        message = Message(
            conversation_id=conversation.id, sender_id=user_id, content=initial_message
        )
        db.session.add(message)

    db.session.commit()

    return jsonify(
        {
            "message": "Conversation created",
            "conversation": conversation.to_dict(current_user_id=user_id),
        }
    ), 201


@messages_bp.route("/conversations/<int:conversation_id>/messages", methods=["POST"])
@jwt_required()
def send_message(conversation_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data or not data.get("content"):
        return jsonify({"message": "Message content is required"}), 400

    conversation = Conversation.query.get(conversation_id)

    if not conversation:
        return jsonify({"message": "Conversation not found"}), 404

    if conversation.customer_id != user_id and conversation.provider_id != user_id:
        return jsonify({"message": "Access denied"}), 403

    message = Message(
        conversation_id=conversation_id, sender_id=user_id, content=data["content"]
    )
    db.session.add(message)

    conversation.last_message_at = datetime.utcnow()
    db.session.commit()

    return jsonify({"message": "Message sent", "data": message.to_dict()}), 201


@messages_bp.route("/unread-count", methods=["GET"])
@jwt_required()
def get_unread_count():
    user_id = int(get_jwt_identity())

    conversation_ids = (
        db.session.query(Conversation.id)
        .filter(
            (Conversation.customer_id == user_id)
            | (Conversation.provider_id == user_id)
        )
        .all()
    )
    conversation_ids = [c[0] for c in conversation_ids]

    unread_count = Message.query.filter(
        Message.conversation_id.in_(conversation_ids),
        Message.sender_id != user_id,
        Message.is_read == False,
    ).count()

    return jsonify({"unread_count": unread_count}), 200
