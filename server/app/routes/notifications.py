from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.notification import Notification

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.route("", methods=["GET"])
@jwt_required()
def get_notifications():
    user_id = int(get_jwt_identity())
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    unread_only = request.args.get("unread", "false").lower() == "true"

    query = Notification.query.filter_by(user_id=user_id)

    if unread_only:
        query = query.filter_by(is_read=False)

    notifications = query.order_by(Notification.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify(
        {
            "notifications": [n.to_dict() for n in notifications.items],
            "total": notifications.total,
            "pages": notifications.pages,
            "current_page": page,
            "has_next": notifications.has_next,
            "has_prev": notifications.has_prev,
        }
    ), 200


@notifications_bp.route("/unread-count", methods=["GET"])
@jwt_required()
def get_unread_count():
    user_id = int(get_jwt_identity())

    count = Notification.query.filter_by(user_id=user_id, is_read=False).count()

    return jsonify({"unread_count": count}), 200


@notifications_bp.route("/<int:notification_id>/read", methods=["PUT"])
@jwt_required()
def mark_as_read(notification_id):
    user_id = int(get_jwt_identity())

    notification = Notification.query.get(notification_id)

    if not notification:
        return jsonify({"message": "Notification not found"}), 404

    if notification.user_id != user_id:
        return jsonify({"message": "Access denied"}), 403

    notification.is_read = True
    db.session.commit()

    return jsonify(
        {
            "message": "Notification marked as read",
            "notification": notification.to_dict(),
        }
    ), 200


@notifications_bp.route("/read-all", methods=["PUT"])
@jwt_required()
def mark_all_as_read():
    user_id = int(get_jwt_identity())

    Notification.query.filter_by(user_id=user_id, is_read=False).update(
        {"is_read": True}
    )
    db.session.commit()

    return jsonify({"message": "All notifications marked as read"}), 200


@notifications_bp.route("/<int:notification_id>", methods=["DELETE"])
@jwt_required()
def delete_notification(notification_id):
    user_id = int(get_jwt_identity())

    notification = Notification.query.get(notification_id)

    if not notification:
        return jsonify({"message": "Notification not found"}), 404

    if notification.user_id != user_id:
        return jsonify({"message": "Access denied"}), 403

    db.session.delete(notification)
    db.session.commit()

    return jsonify({"message": "Notification deleted"}), 200


def create_notification(user_id, type, title, message=None, booking_id=None):
    notification = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        booking_id=booking_id,
    )
    db.session.add(notification)
    db.session.commit()
    return notification
