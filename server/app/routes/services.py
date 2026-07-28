import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.service import Service
from app.models.location import City, Area
from app.models.availability import Availability
from app.models.booking import Booking
from app.models.review import Review
from datetime import datetime

services_bp = Blueprint("services", __name__)


@services_bp.route("", methods=["GET"])
def get_services():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 12, type=int)
    service_type = request.args.get("type", "chef")
    city_param = request.args.get("city")
    area_id = request.args.get("area", type=int)
    cuisine = request.args.get("cuisine")
    event_type = request.args.get("event_type")
    search = request.args.get("q", "")
    min_price = request.args.get("min_price", type=float)
    max_price = request.args.get("max_price", type=float)
    min_rating = request.args.get("min_rating", type=float)
    serves_veg = request.args.get("veg", type=str)
    guests = request.args.get("guests", type=int)
    verified_only = request.args.get("verified", type=str)
    available_date = request.args.get("available_date")
    sort_by = request.args.get("sort", "rating")
    sort_order = request.args.get("order", "desc")

    city_id = None
    if city_param:
        if city_param.isdigit():
            city_id = int(city_param)
        else:
            city = City.query.filter(City.name.ilike(city_param)).first()
            if city:
                city_id = city.id

    query = Service.query.filter_by(is_active=True, service_type=service_type)

    if city_id:
        query = query.filter_by(city_id=city_id)

    if area_id:
        query = query.filter_by(area_id=area_id)

    if cuisine:
        query = query.filter(Service.cuisine_types.contains(f'"{cuisine}"'))

    if event_type:
        query = query.filter(Service.event_types.contains(f'"{event_type}"'))

    if min_price is not None:
        query = query.filter(Service.price_per_event >= min_price)

    if max_price is not None:
        query = query.filter(Service.price_per_event <= max_price)

    if min_rating is not None:
        query = query.filter(Service.rating >= min_rating)

    if serves_veg == "true":
        query = query.filter_by(serves_veg=True)
    elif serves_veg == "false":
        query = query.filter_by(serves_non_veg=True)

    if guests is not None:
        query = query.filter(Service.min_guests <= guests, Service.max_guests >= guests)

    if verified_only == "true":
        query = query.filter_by(is_verified=True)

    if available_date:
        try:
            date_obj = datetime.strptime(available_date, "%Y-%m-%d").date()
            available_service_ids = (
                db.session.query(Availability.service_id)
                .filter(
                    Availability.date == date_obj, Availability.is_available == True
                )
                .distinct()
                .all()
            )
            available_service_ids = [sid[0] for sid in available_service_ids]
            if available_service_ids:
                query = query.filter(Service.id.in_(available_service_ids))
            else:
                query = query.filter(Service.id == -1)
        except ValueError:
            pass

    if search:
        search_term = f"%{search}%"
        query = query.join(User, Service.user_id == User.id).filter(
            db.or_(
                Service.title.ilike(search_term),
                Service.description.ilike(search_term),
                User.full_name.ilike(search_term),
                Service.cuisine_types.ilike(search_term),
            )
        )

    sort_column = {
        "rating": Service.rating,
        "price": Service.price_per_event,
        "reviews": Service.total_reviews,
        "newest": Service.created_at,
        "experience": Service.experience_years,
    }.get(sort_by, Service.rating)

    if sort_order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    services = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify(
        {
            "services": [s.to_dict() for s in services.items],
            "total": services.total,
            "pages": services.pages,
            "current_page": page,
            "has_next": services.has_next,
            "has_prev": services.has_prev,
        }
    ), 200


@services_bp.route("/<int:service_id>", methods=["GET"])
def get_service(service_id):
    service = Service.query.get(service_id)

    if not service:
        return jsonify({"message": "Service not found"}), 404

    return jsonify({"service": service.to_dict()}), 200


@services_bp.route("", methods=["POST"])
@jwt_required()
def create_service():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    if user.role not in ["chef", "caterer", "decorator", "admin"]:
        return jsonify({"message": "Only service providers can create listings"}), 403

    data = request.get_json()

    if not data:
        return jsonify({"message": "No data provided"}), 400

    required_fields = ["title"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"message": f"{field} is required"}), 400

    service = Service(
        user_id=user_id,
        title=data.get("title"),
        description=data.get("description"),
        service_type=data.get("service_type", "chef"),
        experience_years=data.get("experience_years", 0),
        price_per_event=data.get("price_per_event"),
        price_unit=data.get("price_unit", "per_event"),
        serves_veg=data.get("serves_veg", True),
        serves_non_veg=data.get("serves_non_veg", False),
        min_guests=data.get("min_guests", 10),
        max_guests=data.get("max_guests", 500),
        city_id=data.get("city_id"),
        area_id=data.get("area_id"),
        is_active=data.get("is_active", True),
    )

    if data.get("cuisine_types"):
        if isinstance(data.get("cuisine_types"), list):
            service.set_cuisine_types(data.get("cuisine_types"))
        else:
            service.set_cuisine_types(json.loads(data.get("cuisine_types")))

    if data.get("event_types"):
        if isinstance(data.get("event_types"), list):
            service.set_event_types(data.get("event_types"))
        else:
            service.set_event_types(json.loads(data.get("event_types")))

    if data.get("images"):
        if isinstance(data.get("images"), list):
            service.set_images(data.get("images"))
        else:
            service.set_images(json.loads(data.get("images")))

    db.session.add(service)
    db.session.commit()

    return jsonify(
        {"message": "Service created successfully", "service": service.to_dict()}
    ), 201


@services_bp.route("/<int:service_id>", methods=["PUT"])
@jwt_required()
def update_service(service_id):
    user_id = int(get_jwt_identity())
    service = Service.query.get(service_id)

    if not service:
        return jsonify({"message": "Service not found"}), 404

    if service.user_id != user_id:
        return jsonify({"message": "You can only update your own listings"}), 403

    data = request.get_json()

    if not data:
        return jsonify({"message": "No data provided"}), 400

    if "title" in data:
        service.title = data["title"]
    if "description" in data:
        service.description = data["description"]
    if "experience_years" in data:
        service.experience_years = data["experience_years"]
    if "price_per_event" in data:
        service.price_per_event = data["price_per_event"]
    if "price_unit" in data:
        service.price_unit = data["price_unit"]
    if "serves_veg" in data:
        service.serves_veg = data["serves_veg"]
    if "serves_non_veg" in data:
        service.serves_non_veg = data["serves_non_veg"]
    if "min_guests" in data:
        service.min_guests = data["min_guests"]
    if "max_guests" in data:
        service.max_guests = data["max_guests"]
    if "city_id" in data:
        service.city_id = data["city_id"]
    if "area_id" in data:
        service.area_id = data["area_id"]
    if "is_active" in data:
        service.is_active = data["is_active"]

    if "cuisine_types" in data:
        if isinstance(data["cuisine_types"], list):
            service.set_cuisine_types(data["cuisine_types"])
        else:
            service.set_cuisine_types(json.loads(data["cuisine_types"]))

    if "event_types" in data:
        if isinstance(data["event_types"], list):
            service.set_event_types(data["event_types"])
        else:
            service.set_event_types(json.loads(data["event_types"]))

    if "images" in data:
        if isinstance(data["images"], list):
            service.set_images(data["images"])
        else:
            service.set_images(json.loads(data["images"]))

    db.session.commit()

    return jsonify(
        {"message": "Service updated successfully", "service": service.to_dict()}
    ), 200


@services_bp.route("/<int:service_id>", methods=["DELETE"])
@jwt_required()
def delete_service(service_id):
    user_id = int(get_jwt_identity())
    service = Service.query.get(service_id)

    if not service:
        return jsonify({"message": "Service not found"}), 404

    if service.user_id != user_id:
        return jsonify({"message": "You can only delete your own listings"}), 403

    db.session.delete(service)
    db.session.commit()

    return jsonify({"message": "Service deleted successfully"}), 200


@services_bp.route("/my", methods=["GET"])
@jwt_required()
def get_my_services():
    user_id = int(get_jwt_identity())

    services = (
        Service.query.filter_by(user_id=user_id)
        .order_by(Service.created_at.desc())
        .all()
    )

    return jsonify({"services": [s.to_dict() for s in services]}), 200


@services_bp.route("/<int:service_id>/recent-events", methods=["GET"])
def get_recent_events(service_id):
    service = Service.query.get(service_id)

    if not service:
        return jsonify({"message": "Service not found"}), 404

    completed_bookings = (
        Booking.query.filter_by(service_id=service_id, status="completed")
        .order_by(Booking.event_date.desc())
        .limit(5)
        .all()
    )

    events = []
    for booking in completed_bookings:
        review = Review.query.filter_by(booking_id=booking.id).first()

        event_data = {
            "id": booking.id,
            "event_date": booking.event_date.isoformat()
            if booking.event_date
            else None,
            "event_type": booking.event_type,
            "number_of_guests": booking.number_of_guests,
            "venue": booking.event_address,
            "city": booking.city.name if booking.city else None,
            "customer_name": booking.customer.full_name
            if booking.customer
            else "Anonymous",
            "rating": review.rating if review else None,
            "review_comment": review.comment if review else None,
            "review_date": review.created_at.isoformat()
            if review and review.created_at
            else None,
        }
        events.append(event_data)

    return jsonify({"events": events}), 200
