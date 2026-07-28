from datetime import datetime, date, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.service import Service
from app.models.availability import Availability

availability_bp = Blueprint("availability", __name__)

TIME_SLOTS = [
    {
        "id": 1,
        "label": "Morning (6:00 AM - 10:00 AM)",
        "start": "06:00",
        "end": "10:00",
    },
    {
        "id": 2,
        "label": "Mid-Morning (10:00 AM - 2:00 PM)",
        "start": "10:00",
        "end": "14:00",
    },
    {
        "id": 3,
        "label": "Afternoon (2:00 PM - 6:00 PM)",
        "start": "14:00",
        "end": "18:00",
    },
    {
        "id": 4,
        "label": "Evening (6:00 PM - 10:00 PM)",
        "start": "18:00",
        "end": "22:00",
    },
    {
        "id": 5,
        "label": "Full Day (6:00 AM - 10:00 PM)",
        "start": "06:00",
        "end": "22:00",
    },
]


@availability_bp.route("/slots", methods=["GET"])
def get_time_slots():
    return jsonify({"slots": TIME_SLOTS}), 200


@availability_bp.route("/<int:service_id>", methods=["GET"])
@jwt_required()
def get_availability(service_id):
    user_id = int(get_jwt_identity())
    service = Service.query.get(service_id)

    if not service:
        return jsonify({"message": "Service not found"}), 404

    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    if not start_date:
        start_date = date.today()
    else:
        start_date = datetime.strptime(start_date, "%Y-%m-%d").date()

    if not end_date:
        end_date = start_date + timedelta(days=30)
    else:
        end_date = datetime.strptime(end_date, "%Y-%m-%d").date()

    slots = (
        Availability.query.filter(
            Availability.service_id == service_id,
            Availability.date >= start_date,
            Availability.date <= end_date,
        )
        .order_by(Availability.date, Availability.start_time)
        .all()
    )

    return jsonify({"availability": [s.to_dict() for s in slots]}), 200


@availability_bp.route("/<int:service_id>", methods=["POST"])
@jwt_required()
def set_availability(service_id):
    user_id = int(get_jwt_identity())
    service = Service.query.get(service_id)

    if not service:
        return jsonify({"message": "Service not found"}), 404

    if service.user_id != user_id:
        return jsonify({"message": "Access denied"}), 403

    data = request.get_json()

    if not data:
        return jsonify({"message": "No data provided"}), 400

    slots_data = data.get("slots", [])
    created_slots = []

    for slot_data in slots_data:
        slot_date = datetime.strptime(slot_data.get("date"), "%Y-%m-%d").date()
        start_time = datetime.strptime(slot_data.get("start_time"), "%H:%M").time()
        end_time = datetime.strptime(slot_data.get("end_time"), "%H:%M").time()

        existing = Availability.query.filter_by(
            service_id=service_id,
            date=slot_date,
            start_time=start_time,
            end_time=end_time,
        ).first()

        if existing:
            continue

        slot = Availability(
            service_id=service_id,
            date=slot_date,
            start_time=start_time,
            end_time=end_time,
            is_available=True,
            notes=slot_data.get("notes"),
        )

        db.session.add(slot)
        created_slots.append(slot)

    db.session.commit()

    return jsonify(
        {
            "message": f"{len(created_slots)} availability slots created",
            "slots": [s.to_dict() for s in created_slots],
        }
    ), 201


@availability_bp.route("/<int:service_id>/slots/<int:slot_id>", methods=["DELETE"])
@jwt_required()
def delete_availability_slot(service_id, slot_id):
    user_id = int(get_jwt_identity())
    service = Service.query.get(service_id)

    if not service:
        return jsonify({"message": "Service not found"}), 404

    if service.user_id != user_id:
        return jsonify({"message": "Access denied"}), 403

    slot = Availability.query.get(slot_id)

    if not slot or slot.service_id != service_id:
        return jsonify({"message": "Slot not found"}), 404

    if not slot.is_available:
        return jsonify({"message": "Cannot delete booked slot"}), 400

    db.session.delete(slot)
    db.session.commit()

    return jsonify({"message": "Slot deleted successfully"}), 200


@availability_bp.route("/<int:service_id>/available", methods=["GET"])
def get_available_slots(service_id):
    service = Service.query.get(service_id)

    if not service:
        return jsonify({"message": "Service not found"}), 404

    target_date = request.args.get("date")

    if not target_date:
        return jsonify({"message": "Date is required"}), 400

    try:
        target_date = datetime.strptime(target_date, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"message": "Invalid date format"}), 400

    if target_date < date.today():
        return jsonify({"available_slots": []}), 200

    available = (
        Availability.query.filter_by(
            service_id=service_id, date=target_date, is_available=True
        )
        .order_by(Availability.start_time)
        .all()
    )

    if not available:
        return jsonify({"available_slots": [], "default_slots": TIME_SLOTS}), 200

    return jsonify({"available_slots": [s.to_dict() for s in available]}), 200


@availability_bp.route("/<int:service_id>/calendar", methods=["GET"])
def get_availability_calendar(service_id):
    service = Service.query.get(service_id)

    if not service:
        return jsonify({"message": "Service not found"}), 404

    month = request.args.get("month", type=int)
    year = request.args.get("year", type=int)

    if not month or not year:
        today = date.today()
        month = today.month
        year = today.year

    first_day = date(year, month, 1)
    if month == 12:
        last_day = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        last_day = date(year, month + 1, 1) - timedelta(days=1)

    slots = Availability.query.filter(
        Availability.service_id == service_id,
        Availability.date >= first_day,
        Availability.date <= last_day,
    ).all()

    calendar = {}
    for slot in slots:
        date_str = slot.date.isoformat()
        if date_str not in calendar:
            calendar[date_str] = {"available": 0, "booked": 0}

        if slot.is_available:
            calendar[date_str]["available"] += 1
        else:
            calendar[date_str]["booked"] += 1

    return jsonify({"month": month, "year": year, "calendar": calendar}), 200
