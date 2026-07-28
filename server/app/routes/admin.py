from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User, Profile
from app.models.service import Service
from app.models.booking import Booking
from app.models.location import City, Area
from app.models.review import Review

admin_bp = Blueprint("admin", __name__)


def admin_required(fn):
    from functools import wraps

    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user or user.role != "admin":
            return jsonify({"message": "Admin access required"}), 403
        return fn(*args, **kwargs)

    return wrapper


@admin_bp.route("/dashboard", methods=["GET"])
@jwt_required()
@admin_required
def get_dashboard():
    total_users = User.query.count()
    total_providers = User.query.filter(
        User.role.in_(["chef", "caterer", "decorator"])
    ).count()
    total_customers = User.query.filter_by(role="customer").count()
    total_services = Service.query.count()
    total_bookings = Booking.query.count()
    total_reviews = Review.query.count()

    pending_bookings = Booking.query.filter_by(status="pending").count()
    confirmed_bookings = Booking.query.filter_by(status="confirmed").count()
    completed_bookings = Booking.query.filter_by(status="completed").count()

    total_revenue = (
        db.session.query(db.func.sum(Booking.total_amount))
        .filter(Booking.status.in_(["paid", "completed"]))
        .scalar()
        or 0
    )

    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    new_users_30d = User.query.filter(User.created_at >= thirty_days_ago).count()
    new_bookings_30d = Booking.query.filter(
        Booking.created_at >= thirty_days_ago
    ).count()

    recent_bookings = Booking.query.order_by(Booking.created_at.desc()).limit(5).all()
    recent_users = User.query.order_by(User.created_at.desc()).limit(5).all()

    services_by_type = (
        db.session.query(Service.service_type, db.func.count(Service.id))
        .group_by(Service.service_type)
        .all()
    )

    bookings_by_status = (
        db.session.query(Booking.status, db.func.count(Booking.id))
        .group_by(Booking.status)
        .all()
    )

    return jsonify(
        {
            "stats": {
                "total_users": total_users,
                "total_providers": total_providers,
                "total_customers": total_customers,
                "total_services": total_services,
                "total_bookings": total_bookings,
                "total_reviews": total_reviews,
                "total_revenue": float(total_revenue),
                "pending_bookings": pending_bookings,
                "confirmed_bookings": confirmed_bookings,
                "completed_bookings": completed_bookings,
                "new_users_30d": new_users_30d,
                "new_bookings_30d": new_bookings_30d,
            },
            "charts": {
                "services_by_type": [
                    {"type": t, "count": c} for t, c in services_by_type
                ],
                "bookings_by_status": [
                    {"status": s, "count": c} for s, c in bookings_by_status
                ],
            },
            "recent_bookings": [b.to_dict() for b in recent_bookings],
            "recent_users": [u.to_dict() for u in recent_users],
        }
    ), 200


@admin_bp.route("/users", methods=["GET"])
@jwt_required()
@admin_required
def get_users():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    role = request.args.get("role")
    status = request.args.get("status")
    search = request.args.get("q", "")

    query = User.query

    if role:
        query = query.filter_by(role=role)

    if status == "active":
        query = query.filter_by(is_active=True)
    elif status == "inactive":
        query = query.filter_by(is_active=False)

    if status == "verified":
        query = query.filter_by(is_verified=True)
    elif status == "unverified":
        query = query.filter_by(is_verified=False)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            db.or_(
                User.full_name.ilike(search_term),
                User.email.ilike(search_term),
                User.phone.ilike(search_term),
            )
        )

    users = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify(
        {
            "users": [u.to_dict() for u in users.items],
            "total": users.total,
            "pages": users.pages,
            "current_page": page,
        }
    ), 200


@admin_bp.route("/users/<int:user_id>", methods=["GET"])
@jwt_required()
@admin_required
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    services = Service.query.filter_by(user_id=user_id).all()
    customer_bookings = Booking.query.filter_by(customer_id=user_id).count()
    provider_bookings = Booking.query.filter_by(provider_id=user_id).count()
    reviews = Review.query.filter_by(user_id=user_id).count()

    return jsonify(
        {
            "user": user.to_dict(),
            "stats": {
                "services": len(services),
                "customer_bookings": customer_bookings,
                "provider_bookings": provider_bookings,
                "reviews": reviews,
            },
            "services": [s.to_dict() for s in services],
        }
    ), 200


@admin_bp.route("/users/<int:user_id>/verify", methods=["PUT"])
@jwt_required()
@admin_required
def verify_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    user.is_verified = True
    db.session.commit()

    return jsonify(
        {"message": "User verified successfully", "user": user.to_dict()}
    ), 200


@admin_bp.route("/users/<int:user_id>/unverify", methods=["PUT"])
@jwt_required()
@admin_required
def unverify_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    user.is_verified = False
    db.session.commit()

    return jsonify(
        {"message": "User unverified successfully", "user": user.to_dict()}
    ), 200


@admin_bp.route("/users/<int:user_id>/activate", methods=["PUT"])
@jwt_required()
@admin_required
def activate_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    user.is_active = True
    db.session.commit()

    return jsonify(
        {"message": "User activated successfully", "user": user.to_dict()}
    ), 200


@admin_bp.route("/users/<int:user_id>/deactivate", methods=["PUT"])
@jwt_required()
@admin_required
def deactivate_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    user.is_active = False
    db.session.commit()

    return jsonify(
        {"message": "User deactivated successfully", "user": user.to_dict()}
    ), 200


@admin_bp.route("/services", methods=["GET"])
@jwt_required()
@admin_required
def get_all_services():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    service_type = request.args.get("type")
    status = request.args.get("status")
    city_id = request.args.get("city", type=int)
    search = request.args.get("q", "")

    query = Service.query

    if service_type:
        query = query.filter_by(service_type=service_type)

    if status == "active":
        query = query.filter_by(is_active=True)
    elif status == "inactive":
        query = query.filter_by(is_active=False)

    if status == "verified":
        query = query.filter_by(is_verified=True)
    elif status == "unverified":
        query = query.filter_by(is_verified=False)

    if city_id:
        query = query.filter_by(city_id=city_id)

    if search:
        search_term = f"%{search}%"
        query = query.join(User).filter(
            db.or_(
                Service.title.ilike(search_term),
                Service.description.ilike(search_term),
                User.full_name.ilike(search_term),
            )
        )

    services = query.order_by(Service.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify(
        {
            "services": [s.to_dict() for s in services.items],
            "total": services.total,
            "pages": services.pages,
            "current_page": page,
        }
    ), 200


@admin_bp.route("/services/<int:service_id>/verify", methods=["PUT"])
@jwt_required()
@admin_required
def verify_service(service_id):
    service = Service.query.get(service_id)
    if not service:
        return jsonify({"message": "Service not found"}), 404

    service.is_verified = True
    db.session.commit()

    return jsonify(
        {"message": "Service verified successfully", "service": service.to_dict()}
    ), 200


@admin_bp.route("/services/<int:service_id>/unverify", methods=["PUT"])
@jwt_required()
@admin_required
def unverify_service(service_id):
    service = Service.query.get(service_id)
    if not service:
        return jsonify({"message": "Service not found"}), 404

    service.is_verified = False
    db.session.commit()

    return jsonify(
        {"message": "Service unverified successfully", "service": service.to_dict()}
    ), 200


@admin_bp.route("/services/<int:service_id>/activate", methods=["PUT"])
@jwt_required()
@admin_required
def activate_service(service_id):
    service = Service.query.get(service_id)
    if not service:
        return jsonify({"message": "Service not found"}), 404

    service.is_active = True
    db.session.commit()

    return jsonify(
        {"message": "Service activated successfully", "service": service.to_dict()}
    ), 200


@admin_bp.route("/services/<int:service_id>/deactivate", methods=["PUT"])
@jwt_required()
@admin_required
def deactivate_service(service_id):
    service = Service.query.get(service_id)
    if not service:
        return jsonify({"message": "Service not found"}), 404

    service.is_active = False
    db.session.commit()

    return jsonify(
        {"message": "Service deactivated successfully", "service": service.to_dict()}
    ), 200


@admin_bp.route("/bookings", methods=["GET"])
@jwt_required()
@admin_required
def get_all_bookings():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    status = request.args.get("status")
    service_type = request.args.get("service_type")
    city_id = request.args.get("city", type=int)
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    query = Booking.query.join(Service)

    if status:
        query = query.filter(Booking.status == status)

    if service_type:
        query = query.filter(Service.service_type == service_type)

    if city_id:
        query = query.filter(Booking.city_id == city_id)

    if start_date:
        query = query.filter(
            Booking.event_date >= datetime.strptime(start_date, "%Y-%m-%d").date()
        )

    if end_date:
        query = query.filter(
            Booking.event_date <= datetime.strptime(end_date, "%Y-%m-%d").date()
        )

    bookings = query.order_by(Booking.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify(
        {
            "bookings": [b.to_dict() for b in bookings.items],
            "total": bookings.total,
            "pages": bookings.pages,
            "current_page": page,
        }
    ), 200


@admin_bp.route("/bookings/<int:booking_id>", methods=["GET"])
@jwt_required()
@admin_required
def get_booking_detail(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"message": "Booking not found"}), 404

    return jsonify({"booking": booking.to_dict()}), 200


@admin_bp.route("/bookings/<int:booking_id>/status", methods=["PUT"])
@jwt_required()
@admin_required
def update_booking_status(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"message": "Booking not found"}), 404

    data = request.get_json()
    new_status = data.get("status")

    if new_status not in [
        "pending",
        "confirmed",
        "rejected",
        "payment_pending",
        "paid",
        "completed",
        "cancelled",
    ]:
        return jsonify({"message": "Invalid status"}), 400

    booking.status = new_status
    booking.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify(
        {"message": "Booking status updated", "booking": booking.to_dict()}
    ), 200


@admin_bp.route("/locations/cities", methods=["GET"])
@jwt_required()
@admin_required
def get_cities():
    cities = City.query.order_by(City.name).all()
    return jsonify(
        {
            "cities": [
                {"id": c.id, "name": c.name, "district": c.district} for c in cities
            ]
        }
    ), 200


@admin_bp.route("/locations/cities", methods=["POST"])
@jwt_required()
@admin_required
def create_city():
    data = request.get_json()
    name = data.get("name")
    district = data.get("district")

    if not name:
        return jsonify({"message": "City name is required"}), 400

    existing = City.query.filter_by(name=name).first()
    if existing:
        return jsonify({"message": "City already exists"}), 400

    city = City(name=name, district=district or name)
    db.session.add(city)
    db.session.commit()

    return jsonify(
        {
            "message": "City created successfully",
            "city": {"id": city.id, "name": city.name},
        }
    ), 201


@admin_bp.route("/locations/cities/<int:city_id>", methods=["PUT"])
@jwt_required()
@admin_required
def update_city(city_id):
    city = City.query.get(city_id)
    if not city:
        return jsonify({"message": "City not found"}), 404

    data = request.get_json()
    if data.get("name"):
        city.name = data["name"]
    if data.get("district"):
        city.district = data["district"]

    db.session.commit()

    return jsonify(
        {
            "message": "City updated successfully",
            "city": {"id": city.id, "name": city.name},
        }
    ), 200


@admin_bp.route("/locations/cities/<int:city_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_city(city_id):
    city = City.query.get(city_id)
    if not city:
        return jsonify({"message": "City not found"}), 404

    Area.query.filter_by(city_id=city_id).delete()
    db.session.delete(city)
    db.session.commit()

    return jsonify({"message": "City deleted successfully"}), 200


@admin_bp.route("/locations/areas", methods=["GET"])
@jwt_required()
@admin_required
def get_areas():
    city_id = request.args.get("city_id", type=int)
    query = Area.query

    if city_id:
        query = query.filter_by(city_id=city_id)

    areas = query.order_by(Area.name).all()
    return jsonify(
        {
            "areas": [
                {"id": a.id, "name": a.name, "pincode": a.pincode, "city_id": a.city_id}
                for a in areas
            ]
        }
    ), 200


@admin_bp.route("/locations/areas", methods=["POST"])
@jwt_required()
@admin_required
def create_area():
    data = request.get_json()
    name = data.get("name")
    city_id = data.get("city_id")
    pincode = data.get("pincode")

    if not name or not city_id:
        return jsonify({"message": "Name and city_id are required"}), 400

    area = Area(name=name, city_id=city_id, pincode=pincode)
    db.session.add(area)
    db.session.commit()

    return jsonify(
        {
            "message": "Area created successfully",
            "area": {"id": area.id, "name": area.name},
        }
    ), 201


@admin_bp.route("/locations/areas/<int:area_id>", methods=["PUT"])
@jwt_required()
@admin_required
def update_area(area_id):
    area = Area.query.get(area_id)
    if not area:
        return jsonify({"message": "Area not found"}), 404

    data = request.get_json()
    if data.get("name"):
        area.name = data["name"]
    if data.get("pincode"):
        area.pincode = data["pincode"]
    if data.get("city_id"):
        area.city_id = data["city_id"]

    db.session.commit()

    return jsonify(
        {
            "message": "Area updated successfully",
            "area": {"id": area.id, "name": area.name},
        }
    ), 200


@admin_bp.route("/locations/areas/<int:area_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_area(area_id):
    area = Area.query.get(area_id)
    if not area:
        return jsonify({"message": "Area not found"}), 404

    db.session.delete(area)
    db.session.commit()

    return jsonify({"message": "Area deleted successfully"}), 200


@admin_bp.route("/analytics", methods=["GET"])
@jwt_required()
@admin_required
def get_analytics():
    period = request.args.get("period", "30d")

    if period == "7d":
        days = 7
    elif period == "30d":
        days = 30
    elif period == "90d":
        days = 90
    else:
        days = 30

    start_date = datetime.utcnow() - timedelta(days=days)

    daily_bookings = (
        db.session.query(
            db.func.date(Booking.created_at).label("date"),
            db.func.count(Booking.id).label("count"),
        )
        .filter(Booking.created_at >= start_date)
        .group_by(db.func.date(Booking.created_at))
        .all()
    )

    daily_revenue = (
        db.session.query(
            db.func.date(Booking.created_at).label("date"),
            db.func.sum(Booking.total_amount).label("revenue"),
        )
        .filter(
            Booking.created_at >= start_date, Booking.status.in_(["paid", "completed"])
        )
        .group_by(db.func.date(Booking.created_at))
        .all()
    )

    daily_users = (
        db.session.query(
            db.func.date(User.created_at).label("date"),
            db.func.count(User.id).label("count"),
        )
        .filter(User.created_at >= start_date)
        .group_by(db.func.date(User.created_at))
        .all()
    )

    top_services = (
        db.session.query(
            Service.id, Service.title, db.func.count(Booking.id).label("bookings")
        )
        .join(Booking)
        .filter(Booking.created_at >= start_date)
        .group_by(Service.id)
        .order_by(db.func.count(Booking.id).desc())
        .limit(10)
        .all()
    )

    top_cities = (
        db.session.query(City.name, db.func.count(Booking.id).label("bookings"))
        .join(Booking)
        .filter(Booking.created_at >= start_date)
        .group_by(City.id)
        .order_by(db.func.count(Booking.id).desc())
        .limit(10)
        .all()
    )

    return jsonify(
        {
            "period": period,
            "daily_bookings": [{"date": str(d), "count": c} for d, c in daily_bookings],
            "daily_revenue": [
                {"date": str(d), "revenue": float(r or 0)} for d, r in daily_revenue
            ],
            "daily_users": [{"date": str(d), "count": c} for d, c in daily_users],
            "top_services": [
                {"id": i, "title": t, "bookings": b} for i, t, b in top_services
            ],
            "top_cities": [{"city": c, "bookings": b} for c, b in top_cities],
        }
    ), 200
