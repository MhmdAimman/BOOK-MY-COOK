import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.service import Service
from app.models.notification import Notification

payments_bp = Blueprint("payments", __name__)


@payments_bp.route("/create-order", methods=["POST"])
@jwt_required()
def create_order():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    booking_id = data.get("booking_id")
    booking = Booking.query.get(booking_id)

    if not booking:
        return jsonify({"message": "Booking not found"}), 404

    if booking.customer_id != user_id:
        return jsonify({"message": "Access denied"}), 403

    if booking.status not in ["confirmed", "payment_pending"]:
        return jsonify({"message": "Booking not ready for payment"}), 400

    existing_payment = Payment.query.filter_by(
        booking_id=booking_id, status="paid"
    ).first()
    if existing_payment:
        return jsonify({"message": "Payment already completed"}), 400

    order_id = f"ORDER_{uuid.uuid4().hex[:12].upper()}"

    payment = Payment(
        booking_id=booking_id,
        user_id=user_id,
        order_id=order_id,
        amount=booking.total_amount,
        currency="INR",
        status="pending",
        payment_method=Payment.METHOD_ONLINE,
    )

    db.session.add(payment)
    db.session.commit()

    return jsonify(
        {
            "message": "Order created successfully",
            "order": {
                "order_id": order_id,
                "amount": booking.total_amount,
                "currency": "INR",
                "booking_id": booking_id,
            },
        }
    ), 201


@payments_bp.route("/verify", methods=["POST"])
@jwt_required()
def verify_payment():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    order_id = data.get("order_id")
    payment_id = data.get("payment_id")
    signature = data.get("signature")

    payment = Payment.query.filter_by(order_id=order_id).first()

    if not payment:
        return jsonify({"message": "Payment not found"}), 404

    if payment.user_id != user_id:
        return jsonify({"message": "Access denied"}), 403

    payment.payment_id = payment_id or f"PAY_{uuid.uuid4().hex[:12].upper()}"
    payment.signature = signature or "mock_signature"
    payment.status = Payment.STATUS_PAID
    payment.payment_method = Payment.METHOD_ONLINE

    booking = Booking.query.get(payment.booking_id)
    if booking:
        booking.status = Booking.STATUS_PAID
        booking.updated_at = datetime.utcnow()

        notification = Notification(
            user_id=booking.provider_id,
            type="payment_received",
            title="Payment Received",
            message=f"Payment of ₹{booking.total_amount} received for '{booking.service.title}' from {booking.customer.full_name}.",
            booking_id=booking.id,
        )
        db.session.add(notification)

    db.session.commit()

    return jsonify(
        {"message": "Payment verified successfully", "payment": payment.to_dict()}
    ), 200


@payments_bp.route("/<int:payment_id>", methods=["GET"])
@jwt_required()
def get_payment(payment_id):
    user_id = int(get_jwt_identity())
    payment = Payment.query.get(payment_id)

    if not payment:
        return jsonify({"message": "Payment not found"}), 404

    if payment.user_id != user_id and payment.booking.provider_id != user_id:
        return jsonify({"message": "Access denied"}), 403

    return jsonify({"payment": payment.to_dict()}), 200


@payments_bp.route("/booking/<int:booking_id>", methods=["GET"])
@jwt_required()
def get_booking_payments(booking_id):
    user_id = int(get_jwt_identity())
    booking = Booking.query.get(booking_id)

    if not booking:
        return jsonify({"message": "Booking not found"}), 404

    if booking.customer_id != user_id and booking.provider_id != user_id:
        return jsonify({"message": "Access denied"}), 403

    payments = Payment.query.filter_by(booking_id=booking_id).all()

    return jsonify({"payments": [p.to_dict() for p in payments]}), 200


@payments_bp.route("/mock-success/<order_id>", methods=["POST"])
@jwt_required()
def mock_payment_success(order_id):
    user_id = int(get_jwt_identity())
    payment = Payment.query.filter_by(order_id=order_id).first()

    if not payment:
        return jsonify({"message": "Payment not found"}), 404

    if payment.user_id != user_id:
        return jsonify({"message": "Access denied"}), 403

    payment.payment_id = f"PAY_{uuid.uuid4().hex[:12].upper()}"
    payment.signature = "mock_signature_verified"
    payment.status = Payment.STATUS_PAID
    payment.payment_method = Payment.METHOD_ONLINE

    booking = Booking.query.get(payment.booking_id)
    if booking:
        booking.status = Booking.STATUS_PAID

        notification = Notification(
            user_id=booking.provider_id,
            type="payment_received",
            title="Payment Received",
            message=f"Payment of ₹{booking.total_amount} received for '{booking.service.title}' from {booking.customer.full_name}.",
            booking_id=booking.id,
        )
        db.session.add(notification)

    db.session.commit()

    return jsonify(
        {"message": "Mock payment successful", "payment": payment.to_dict()}
    ), 200


@payments_bp.route("/cash/<int:booking_id>", methods=["POST"])
@jwt_required()
def mark_cash_payment(booking_id):
    user_id = int(get_jwt_identity())
    booking = Booking.query.get(booking_id)

    if not booking:
        return jsonify({"message": "Booking not found"}), 404

    if booking.provider_id != user_id:
        return jsonify({"message": "Only provider can mark cash payment"}), 403

    if booking.status not in ["confirmed", "payment_pending"]:
        return jsonify({"message": "Booking not ready for payment"}), 400

    existing = Payment.query.filter_by(booking_id=booking_id, status="paid").first()
    if existing:
        return jsonify({"message": "Payment already marked as paid"}), 400

    payment = Payment(
        booking_id=booking_id,
        user_id=user_id,
        order_id=f"CASH_{uuid.uuid4().hex[:12].upper()}",
        amount=booking.total_amount,
        currency="INR",
        status=Payment.STATUS_PAID,
        payment_method=Payment.METHOD_CASH,
    )

    db.session.add(payment)

    booking.status = Booking.STATUS_PAID

    notification = Notification(
        user_id=booking.customer_id,
        type="payment_received",
        title="Payment Received",
        message=f"Your cash payment of ₹{booking.total_amount} for '{booking.service.title}' has been confirmed by the provider.",
        booking_id=booking.id,
    )
    db.session.add(notification)

    db.session.commit()

    return jsonify(
        {"message": "Cash payment recorded successfully", "payment": payment.to_dict()}
    ), 200
