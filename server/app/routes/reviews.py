from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.service import Service
from app.models.booking import Booking
from app.models.review import Review

reviews_bp = Blueprint("reviews", __name__)


@reviews_bp.route("/service/<int:service_id>", methods=["GET"])
def get_service_reviews(service_id):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    reviews = (
        Review.query.filter_by(service_id=service_id, is_visible=True)
        .order_by(Review.created_at.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )

    total_rating = (
        db.session.query(db.func.sum(Review.rating), db.func.count(Review.id))
        .filter_by(service_id=service_id, is_visible=True)
        .first()
    )

    avg_rating = 0
    if total_rating[1] > 0:
        avg_rating = round(total_rating[0] / total_rating[1], 1)

    return jsonify(
        {
            "reviews": [r.to_dict() for r in reviews.items],
            "total": reviews.total,
            "pages": reviews.pages,
            "current_page": page,
            "average_rating": avg_rating,
        }
    ), 200


@reviews_bp.route("", methods=["POST"])
@jwt_required()
def create_review():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    booking_id = data.get("booking_id")
    booking = Booking.query.get(booking_id)

    if not booking:
        return jsonify({"message": "Booking not found"}), 404

    if booking.customer_id != user_id:
        return jsonify({"message": "Only the customer can review"}), 403

    if booking.status != "completed":
        return jsonify({"message": "Can only review completed bookings"}), 400

    existing = Review.query.filter_by(booking_id=booking_id).first()
    if existing:
        return jsonify({"message": "Review already exists for this booking"}), 400

    rating = data.get("rating")
    if not rating or rating < 1 or rating > 5:
        return jsonify({"message": "Rating must be between 1 and 5"}), 400

    review = Review(
        booking_id=booking_id,
        service_id=booking.service_id,
        user_id=user_id,
        rating=rating,
        comment=data.get("comment"),
        is_visible=True,
    )

    db.session.add(review)

    service = Service.query.get(booking.service_id)
    if service:
        total_reviews = Review.query.filter_by(
            service_id=service.id, is_visible=True
        ).count()
        total_rating = (
            db.session.query(db.func.sum(Review.rating))
            .filter_by(service_id=service.id, is_visible=True)
            .scalar()
            or 0
        )

        service.total_reviews = total_reviews + 1
        service.rating = round((total_rating + rating) / (total_reviews + 1), 2)

    db.session.commit()

    return jsonify(
        {"message": "Review created successfully", "review": review.to_dict()}
    ), 201


@reviews_bp.route("/<int:review_id>", methods=["PUT"])
@jwt_required()
def update_review(review_id):
    user_id = int(get_jwt_identity())
    review = Review.query.get(review_id)

    if not review:
        return jsonify({"message": "Review not found"}), 404

    if review.user_id != user_id:
        return jsonify({"message": "Access denied"}), 403

    data = request.get_json()

    old_rating = review.rating

    if "rating" in data:
        rating = data.get("rating")
        if rating < 1 or rating > 5:
            return jsonify({"message": "Rating must be between 1 and 5"}), 400
        review.rating = rating

    if "comment" in data:
        review.comment = data["comment"]

    if "rating" in data and review.rating != old_rating:
        service = Service.query.get(review.service_id)
        if service:
            total_rating = (
                db.session.query(db.func.sum(Review.rating))
                .filter_by(service_id=service.id, is_visible=True)
                .scalar()
                or 0
            )

            new_total = total_rating - old_rating + review.rating
            service.rating = (
                round(new_total / service.total_reviews, 2)
                if service.total_reviews > 0
                else 0
            )

    db.session.commit()

    return jsonify(
        {"message": "Review updated successfully", "review": review.to_dict()}
    ), 200


@reviews_bp.route("/<int:review_id>", methods=["DELETE"])
@jwt_required()
def delete_review(review_id):
    user_id = int(get_jwt_identity())
    review = Review.query.get(review_id)

    if not review:
        return jsonify({"message": "Review not found"}), 404

    if review.user_id != user_id:
        return jsonify({"message": "Access denied"}), 403

    service = Service.query.get(review.service_id)
    if service and review.is_visible:
        total_rating = (
            db.session.query(db.func.sum(Review.rating))
            .filter_by(service_id=service.id, is_visible=True)
            .scalar()
            or 0
        )

        new_total = total_rating - review.rating
        service.total_reviews = max(0, service.total_reviews - 1)
        service.rating = (
            round(new_total / service.total_reviews, 2)
            if service.total_reviews > 0
            else 0
        )

    db.session.delete(review)
    db.session.commit()

    return jsonify({"message": "Review deleted successfully"}), 200


@reviews_bp.route("/can-review/<int:booking_id>", methods=["GET"])
@jwt_required()
def can_review(booking_id):
    user_id = int(get_jwt_identity())
    booking = Booking.query.get(booking_id)

    if not booking:
        return jsonify({"can_review": False, "message": "Booking not found"}), 404

    if booking.customer_id != user_id:
        return jsonify({"can_review": False, "message": "Not your booking"}), 403

    if booking.status != "completed":
        return jsonify({"can_review": False, "message": "Booking not completed"}), 200

    existing = Review.query.filter_by(booking_id=booking_id).first()
    if existing:
        return jsonify({"can_review": False, "message": "Already reviewed"}), 200

    return jsonify({"can_review": True, "message": "Can submit review"}), 200
