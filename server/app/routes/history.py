import json
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.service import Service
from app.models.event_history import EventHistory

history_bp = Blueprint("history", __name__)


@history_bp.route("/<int:service_id>", methods=["GET"])
def get_event_history(service_id):
    featured = request.args.get("featured", "false").lower() == "true"

    query = EventHistory.query.filter_by(service_id=service_id)

    if featured:
        query = query.filter_by(is_featured=True)

    events = query.order_by(
        EventHistory.display_order, EventHistory.event_date.desc()
    ).all()

    return jsonify({"events": [e.to_dict() for e in events]}), 200


@history_bp.route("/<int:service_id>", methods=["POST"])
@jwt_required()
def add_event_history(service_id):
    user_id = int(get_jwt_identity())
    service = Service.query.get(service_id)

    if not service:
        return jsonify({"message": "Service not found"}), 404

    if service.user_id != user_id:
        return jsonify({"message": "Access denied"}), 403

    data = request.get_json()

    event = EventHistory(
        service_id=service_id,
        booking_id=data.get("booking_id"),
        event_date=datetime.strptime(data.get("event_date"), "%Y-%m-%d").date()
        if data.get("event_date")
        else None,
        event_type=data.get("event_type"),
        number_of_guests=data.get("number_of_guests"),
        venue=data.get("venue"),
        document_url=data.get("document_url"),
        customer_name=data.get("customer_name"),
        customer_testimonial=data.get("customer_testimonial"),
        is_featured=False,
    )

    if data.get("cuisine_types"):
        event.set_cuisine_types(data.get("cuisine_types"))

    if data.get("photos"):
        event.set_photos(data.get("photos"))

    db.session.add(event)
    db.session.commit()

    return jsonify({"message": "Event added to history", "event": event.to_dict()}), 201


@history_bp.route("/<int:event_id>", methods=["PUT"])
@jwt_required()
def update_event_history(event_id):
    user_id = int(get_jwt_identity())
    event = EventHistory.query.get(event_id)

    if not event:
        return jsonify({"message": "Event not found"}), 404

    if event.service.user_id != user_id:
        return jsonify({"message": "Access denied"}), 403

    data = request.get_json()

    if "event_date" in data:
        event.event_date = datetime.strptime(data["event_date"], "%Y-%m-%d").date()
    if "event_type" in data:
        event.event_type = data["event_type"]
    if "number_of_guests" in data:
        event.number_of_guests = data["number_of_guests"]
    if "venue" in data:
        event.venue = data["venue"]
    if "document_url" in data:
        event.document_url = data["document_url"]
    if "customer_name" in data:
        event.customer_name = data["customer_name"]
    if "customer_testimonial" in data:
        event.customer_testimonial = data["customer_testimonial"]
    if "cuisine_types" in data:
        event.set_cuisine_types(data["cuisine_types"])
    if "photos" in data:
        event.set_photos(data["photos"])

    db.session.commit()

    return jsonify(
        {"message": "Event updated successfully", "event": event.to_dict()}
    ), 200


@history_bp.route("/<int:event_id>", methods=["DELETE"])
@jwt_required()
def delete_event_history(event_id):
    user_id = int(get_jwt_identity())
    event = EventHistory.query.get(event_id)

    if not event:
        return jsonify({"message": "Event not found"}), 404

    if event.service.user_id != user_id:
        return jsonify({"message": "Access denied"}), 403

    db.session.delete(event)
    db.session.commit()

    return jsonify({"message": "Event deleted successfully"}), 200


@history_bp.route("/<int:event_id>/feature", methods=["PUT"])
@jwt_required()
def set_featured(event_id):
    user_id = int(get_jwt_identity())
    event = EventHistory.query.get(event_id)

    if not event:
        return jsonify({"message": "Event not found"}), 404

    if event.service.user_id != user_id:
        return jsonify({"message": "Access denied"}), 403

    featured_count = EventHistory.query.filter_by(
        service_id=event.service_id, is_featured=True
    ).count()

    if featured_count >= 5 and not event.is_featured:
        return jsonify({"message": "Maximum 5 featured events allowed"}), 400

    event.is_featured = True
    db.session.commit()

    return jsonify(
        {"message": "Event marked as featured", "event": event.to_dict()}
    ), 200


@history_bp.route("/<int:event_id>/unfeature", methods=["PUT"])
@jwt_required()
def unset_featured(event_id):
    user_id = int(get_jwt_identity())
    event = EventHistory.query.get(event_id)

    if not event:
        return jsonify({"message": "Event not found"}), 404

    if event.service.user_id != user_id:
        return jsonify({"message": "Access denied"}), 403

    event.is_featured = False
    db.session.commit()

    return jsonify(
        {"message": "Event removed from featured", "event": event.to_dict()}
    ), 200
