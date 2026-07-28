import json
import uuid
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.chat_message import ChatMessage
from app.models.user import User
from app.services.recommendation_engine import RecommendationEngine

chat_bp = Blueprint("chat", __name__)
recommendation_engine = RecommendationEngine()


@chat_bp.route("/message", methods=["POST"])
def send_message():
    data = request.get_json()
    message = data.get("message", "").strip()
    session_id = data.get("session_id")

    if not message:
        return jsonify({"message": "Message is required"}), 400

    if not session_id:
        session_id = str(uuid.uuid4())

    user_id = None
    user_context = None

    # Try to get user from JWT if available
    try:
        from flask_jwt_extended import verify_jwt_in_request

        verify_jwt_in_request(optional=True)
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if user:
            user_context = {
                "id": user.id,
                "name": user.full_name,
                "role": user.role,
                "city": user.profile.city if user.profile else None,
            }
    except:
        pass

    # Save user message
    user_message = ChatMessage(
        user_id=user_id, session_id=session_id, message=message, is_bot=False
    )
    db.session.add(user_message)
    db.session.flush()

    # Get bot response
    response = recommendation_engine.get_recommendations(message, user_context)

    # Save bot message
    bot_message = ChatMessage(
        user_id=user_id,
        session_id=session_id,
        message=response["message"],
        is_bot=True,
        recommendations=json.dumps(response.get("recommendations"))
        if response.get("recommendations")
        else None,
    )
    db.session.add(bot_message)
    db.session.commit()

    return jsonify(
        {
            "session_id": session_id,
            "message": response["message"],
            "recommendations": response.get("recommendations"),
            "bot_name": "Cheffy",
        }
    ), 200


@chat_bp.route("/history/<session_id>", methods=["GET"])
def get_history(session_id):
    messages = (
        ChatMessage.query.filter_by(session_id=session_id)
        .order_by(ChatMessage.created_at)
        .all()
    )

    return jsonify(
        {"messages": [m.to_dict() for m in messages], "bot_name": "Cheffy"}
    ), 200


@chat_bp.route("/similar/<int:service_id>", methods=["GET"])
def get_similar(service_id):
    response = recommendation_engine.get_similar_providers(service_id)

    return jsonify(
        {
            "message": response["message"],
            "recommendations": response.get("recommendations"),
            "bot_name": "Cheffy",
        }
    ), 200
