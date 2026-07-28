from datetime import datetime, date
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.service import Service
from app.models.booking import Booking
from app.models.availability import Availability
from app.models.location import City, Area
from app.models.notification import Notification

bookings_bp = Blueprint("bookings", __name__)


@bookings_bp.route("", methods=["GET"])
@jwt_required()
def get_bookings():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    status = request.args.get("status")
    role = request.args.get("role")

    if user.role == "admin":
        query = Booking.query
    elif role == "provider" or user.role in ["chef", "caterer", "decorator"]:
        query = Booking.query.filter_by(provider_id=user_id)
    else:
        query = Booking.query.filter_by(customer_id=user_id)

    if status:
        query = query.filter_by(status=status)

    bookings = query.order_by(Booking.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify(
        {
            "bookings": [b.to_dict() for b in bookings.items],
            "total": bookings.total,
            "pages": bookings.pages,
            "current_page": page,
            "has_next": bookings.has_next,
            "has_prev": bookings.has_prev,
        }
    ), 200


@bookings_bp.route("/<int:booking_id>", methods=["GET"])
@jwt_required()
def get_booking(booking_id):
    user_id = int(get_jwt_identity())
    booking = Booking.query.get(booking_id)

    if not booking:
        return jsonify({"message": "Booking not found"}), 404

    if booking.customer_id != user_id and booking.provider_id != user_id:
        return jsonify({"message": "Access denied"}), 403

    return jsonify({"booking": booking.to_dict()}), 200


@bookings_bp.route("", methods=["POST"])
@jwt_required()
def create_booking():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json()

    if not data:
        return jsonify({"message": "No data provided"}), 400

    service_id = data.get("service_id")
    service = Service.query.get(service_id)

    if not service or not service.is_active:
        return jsonify({"message": "Service not found or inactive"}), 404

    if service.user_id == user_id:
        return jsonify({"message": "Cannot book your own service"}), 400

    event_date = data.get("event_date")
    event_time = data.get("event_time")

    if not event_date or not event_time:
        return jsonify({"message": "Event date and time are required"}), 400

    try:
        event_date = datetime.strptime(event_date, "%Y-%m-%d").date()
        try:
            event_time = datetime.strptime(event_time, "%H:%M:%S").time()
        except ValueError:
            event_time = datetime.strptime(event_time, "%H:%M").time()
    except ValueError:
        return jsonify({"message": "Invalid date or time format"}), 400

    if event_date < date.today():
        return jsonify({"message": "Cannot book for past dates"}), 400

    availability_slot_id = data.get("availability_id")
    if availability_slot_id:
        availability = Availability.query.filter_by(
            id=availability_slot_id,
            service_id=service_id,
            date=event_date,
            is_available=True,
        ).first()
        if not availability:
            return jsonify({"message": "Selected time slot is not available"}), 400
    else:
        availability = Availability.query.filter_by(
            service_id=service_id, date=event_date, is_available=True
        ).first()

    number_of_guests = data.get("number_of_guests", 50)
    if number_of_guests < service.min_guests or number_of_guests > service.max_guests:
        return jsonify(
            {
                "message": f"Guests must be between {service.min_guests} and {service.max_guests}"
            }
        ), 400

    existing = Booking.query.filter(
        Booking.service_id == service_id,
        Booking.event_date == event_date,
        Booking.status.in_(["pending", "confirmed", "payment_pending", "paid"]),
    ).first()

    if existing:
        return jsonify(
            {"message": "This date is already booked or has a pending request"}
        ), 400

    base_amount = service.price_per_event or 0
    total_amount = base_amount + (data.get("extra_charges", 0) or 0)

    booking = Booking(
        service_id=service_id,
        customer_id=user_id,
        provider_id=service.user_id,
        event_date=event_date,
        event_time=event_time,
        event_type=data.get("event_type"),
        event_address=data.get("event_address"),
        city_id=data.get("city_id"),
        area_id=data.get("area_id"),
        number_of_guests=number_of_guests,
        special_requirements=data.get("special_requirements"),
        base_amount=base_amount,
        extra_charges=data.get("extra_charges", 0) or 0,
        total_amount=total_amount,
        status=Booking.STATUS_PENDING,
    )

    if availability:
        availability.is_available = False
        booking.availability.append(availability)

    db.session.add(booking)
    db.session.flush()

    notification = Notification(
        user_id=service.user_id,
        type="new_booking",
        title="New Booking Request",
        message=f"{user.full_name} has requested to book your service '{service.title}' for {event_date.strftime('%d %b %Y')}.",
        booking_id=booking.id,
    )
    db.session.add(notification)

    db.session.commit()

    return jsonify(
        {"message": "Booking created successfully", "booking": booking.to_dict()}
    ), 201


@bookings_bp.route("/<int:booking_id>/confirm", methods=["PUT"])
@jwt_required()
def confirm_booking(booking_id):
    user_id = int(get_jwt_identity())
    booking = Booking.query.get(booking_id)

    if not booking:
        return jsonify({"message": "Booking not found"}), 404

    if booking.provider_id != user_id:
        return jsonify({"message": "Only provider can confirm booking"}), 403

    if not booking.can_transition_to(Booking.STATUS_CONFIRMED):
        return jsonify(
            {"message": f"Cannot confirm booking in {booking.status} state"}
        ), 400

    booking.status = Booking.STATUS_CONFIRMED

    notification = Notification(
        user_id=booking.customer_id,
        type="booking_confirmed",
        title="Booking Confirmed",
        message=f"Your booking for '{booking.service.title}' on {booking.event_date.strftime('%d %b %Y')} has been confirmed!",
        booking_id=booking.id,
    )
    db.session.add(notification)

    db.session.commit()

    return jsonify(
        {"message": "Booking confirmed successfully", "booking": booking.to_dict()}
    ), 200


@bookings_bp.route("/<int:booking_id>/reject", methods=["PUT"])
@jwt_required()
def reject_booking(booking_id):
    user_id = int(get_jwt_identity())
    booking = Booking.query.get(booking_id)

    if not booking:
        return jsonify({"message": "Booking not found"}), 404

    if booking.provider_id != user_id:
        return jsonify({"message": "Only provider can reject booking"}), 403

    if not booking.can_transition_to(Booking.STATUS_REJECTED):
        return jsonify(
            {"message": f"Cannot reject booking in {booking.status} state"}
        ), 400

    data = request.get_json() or {}
    booking.status = Booking.STATUS_REJECTED
    booking.rejection_reason = data.get("reason")

    if booking.availability:
        for slot in booking.availability:
            slot.is_available = True
            slot.booking_id = None

    notification = Notification(
        user_id=booking.customer_id,
        type="booking_rejected",
        title="Booking Rejected",
        message=f"Your booking for '{booking.service.title}' on {booking.event_date.strftime('%d %b %Y')} has been rejected.",
        booking_id=booking.id,
    )
    db.session.add(notification)

    db.session.commit()

    return jsonify({"message": "Booking rejected", "booking": booking.to_dict()}), 200


@bookings_bp.route("/<int:booking_id>/cancel", methods=["PUT"])
@jwt_required()
def cancel_booking(booking_id):
    user_id = int(get_jwt_identity())
    booking = Booking.query.get(booking_id)

    if not booking:
        return jsonify({"message": "Booking not found"}), 404

    if booking.customer_id != user_id and booking.provider_id != user_id:
        return jsonify({"message": "Access denied"}), 403

    if not booking.can_transition_to(Booking.STATUS_CANCELLED):
        return jsonify(
            {"message": f"Cannot cancel booking in {booking.status} state"}
        ), 400

    data = request.get_json() or {}
    booking.status = Booking.STATUS_CANCELLED
    booking.cancelled_by = user_id
    booking.cancellation_reason = data.get("reason")

    if booking.availability:
        for slot in booking.availability:
            slot.is_available = True
            slot.booking_id = None

    notify_user_id = (
        booking.provider_id if user_id == booking.customer_id else booking.customer_id
    )
    notification = Notification(
        user_id=notify_user_id,
        type="booking_cancelled",
        title="Booking Cancelled",
        message=f"The booking for '{booking.service.title}' on {booking.event_date.strftime('%d %b %Y')} has been cancelled.",
        booking_id=booking.id,
    )
    db.session.add(notification)

    db.session.commit()

    return jsonify(
        {"message": "Booking cancelled successfully", "booking": booking.to_dict()}
    ), 200


@bookings_bp.route("/<int:booking_id>/complete", methods=["PUT"])
@jwt_required()
def complete_booking(booking_id):
    user_id = int(get_jwt_identity())
    booking = Booking.query.get(booking_id)

    if not booking:
        return jsonify({"message": "Booking not found"}), 404

    if booking.provider_id != user_id:
        return jsonify({"message": "Only provider can mark booking as completed"}), 403

    if not booking.can_transition_to(Booking.STATUS_COMPLETED):
        return jsonify(
            {
                "message": f"Cannot complete booking in {booking.status} state. Booking must be paid first."
            }
        ), 400

    booking.status = Booking.STATUS_COMPLETED

    notification = Notification(
        user_id=booking.customer_id,
        type="review_request",
        title="Event Completed - Leave a Review",
        message=f"Your event with '{booking.service.title}' is completed! Please share your experience by leaving a review.",
        booking_id=booking.id,
    )
    db.session.add(notification)

    db.session.commit()

    return jsonify(
        {"message": "Booking marked as completed", "booking": booking.to_dict()}
    ), 200


@bookings_bp.route("/<int:booking_id>/status", methods=["PUT"])
@jwt_required()
def update_booking_status(booking_id):
    user_id = int(get_jwt_identity())
    booking = Booking.query.get(booking_id)

    if not booking:
        return jsonify({"message": "Booking not found"}), 404

    data = request.get_json()
    new_status = data.get("status")

    if not new_status:
        return jsonify({"message": "Status is required"}), 400

    if not booking.can_transition_to(new_status):
        return jsonify(
            {"message": f"Cannot transition from {booking.status} to {new_status}"}
        ), 400

    booking.status = new_status
    db.session.commit()

    return jsonify(
        {"message": "Booking status updated", "booking": booking.to_dict()}
    ), 200


@bookings_bp.route("/service/<int:service_id>", methods=["GET"])
@jwt_required()
def get_service_bookings(service_id):
    user_id = int(get_jwt_identity())
    service = Service.query.get(service_id)

    if not service:
        return jsonify({"message": "Service not found"}), 404

    if service.user_id != user_id:
        return jsonify({"message": "Access denied"}), 403

    bookings = (
        Booking.query.filter_by(service_id=service_id)
        .order_by(Booking.event_date)
        .all()
    )

    return jsonify({"bookings": [b.to_dict() for b in bookings]}), 200
