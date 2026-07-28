import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

SECURITY_ENABLED = os.environ.get('SECURITY_ENABLED', 'true').lower() == 'true'


def create_app(config_name="default"):
    app = Flask(__name__)

    app.config["SECRET_KEY"] = os.environ.get(
        "SECRET_KEY", "dev-secret-key-change-in-production"
    )
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        basedir = os.path.abspath(os.path.dirname(__file__))
        database_url = f"sqlite:///{os.path.join(basedir, '..', 'bookmycook.db')}"
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.environ.get(
        "JWT_SECRET_KEY", "jwt-secret-key-change-in-production"
    )
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 24 * 60 * 60

    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    jwt.init_app(app)

    if SECURITY_ENABLED:
        from app.utils.rate_limiter import init_rate_limiter
        init_rate_limiter(app)

    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.locations import locations_bp
    from app.routes.services import services_bp
    from app.routes.upload import upload_bp
    from app.routes.bookings import bookings_bp
    from app.routes.availability import availability_bp
    from app.routes.dishes import dishes_bp
    from app.routes.history import history_bp
    from app.routes.payments import payments_bp
    from app.routes.reviews import reviews_bp
    from app.routes.messages import messages_bp
    from app.routes.notifications import notifications_bp
    from app.routes.admin import admin_bp
    from app.routes.chat import chat_bp
    from app.routes.two_factor import two_factor_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(locations_bp, url_prefix="/api")
    app.register_blueprint(services_bp, url_prefix="/api/services")
    app.register_blueprint(upload_bp, url_prefix="/api/upload")
    app.register_blueprint(bookings_bp, url_prefix="/api/bookings")
    app.register_blueprint(availability_bp, url_prefix="/api/availability")
    app.register_blueprint(dishes_bp, url_prefix="/api/dishes")
    app.register_blueprint(history_bp, url_prefix="/api/history")
    app.register_blueprint(payments_bp, url_prefix="/api/payments")
    app.register_blueprint(reviews_bp, url_prefix="/api/reviews")
    app.register_blueprint(messages_bp, url_prefix="/api/messages")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(chat_bp, url_prefix="/api/chat")
    app.register_blueprint(two_factor_bp, url_prefix="/api/2fa")

    upload_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
    os.makedirs(os.path.join(upload_folder, "services"), exist_ok=True)
    os.makedirs(os.path.join(upload_folder, "profiles"), exist_ok=True)

    from flask import send_from_directory

    @app.route("/uploads/<path:filename>")
    def serve_upload(filename):
        return send_from_directory(upload_folder, filename)

    @app.route("/api/health")
    def health_check():
        return {"status": "healthy", "message": "BOOKMYCOOK API is running"}

    @app.route("/favicon.ico")
    def favicon():
        return "", 204

    @app.cli.command("seed-db")
    def seed_db():
        from app.models.location import City, Area
        from app.utils.seed_data import (
            TAMIL_NADU_CITIES,
            CHENNAI_AREAS,
            COIMBATORE_AREAS,
            MADURAI_AREAS,
            TRICHY_AREAS,
            SALEM_AREAS,
        )

        if City.query.first():
            print("Database already seeded.")
            return

        print("Seeding database...")

        city_map = {}
        for name, district in TAMIL_NADU_CITIES:
            city = City(name=name, district=district)
            db.session.add(city)
            city_map[name] = city

        db.session.commit()

        for name, pincode in CHENNAI_AREAS:
            area = Area(city_id=city_map["Chennai"].id, name=name, pincode=pincode)
            db.session.add(area)

        for name, pincode in COIMBATORE_AREAS:
            area = Area(city_id=city_map["Coimbatore"].id, name=name, pincode=pincode)
            db.session.add(area)

        for name, pincode in MADURAI_AREAS:
            area = Area(city_id=city_map["Madurai"].id, name=name, pincode=pincode)
            db.session.add(area)

        for name, pincode in TRICHY_AREAS:
            area = Area(
                city_id=city_map["Tiruchirappalli"].id, name=name, pincode=pincode
            )
            db.session.add(area)

        for name, pincode in SALEM_AREAS:
            area = Area(city_id=city_map["Salem"].id, name=name, pincode=pincode)
            db.session.add(area)

        db.session.commit()
        print("Database seeded successfully!")

    @app.cli.command("seed-dummy")
    def seed_dummy():
        from datetime import datetime, date, time
        import bcrypt
        from app.models.location import City, Area
        from app.models.user import User, Profile
        from app.models.service import Service
        from app.models.booking import Booking
        from app.models.signature_dish import SignatureDish
        from app.models.event_history import EventHistory
        from app.models.review import Review
        from app.models.availability import Availability
        from app.utils.seed_dummy_data import (
            DUMMY_USERS,
            CHEF_SERVICES,
            CATERER_SERVICES,
            DECORATOR_SERVICES,
            EVENT_HISTORY_DATA,
            SAMPLE_BOOKINGS,
            SAMPLE_REVIEWS,
            AVAILABILITY_DATA,
        )

        if User.query.first():
            print("Dummy data already exists. Skipping...")
            return

        print("Seeding dummy data...")

        city_map = {c.name: c for c in City.query.all()}
        area_map = {}
        for city in City.query.all():
            for area in Area.query.filter_by(city_id=city.id).all():
                area_map[f"{city.name}_{area.name}"] = area

        users = {}
        for user_data in DUMMY_USERS:
            password_hash = bcrypt.hashpw(
                "password123".encode("utf-8"), bcrypt.gensalt()
            ).decode("utf-8")
            user = User(
                email=user_data["email"],
                password_hash=password_hash,
                full_name=user_data["full_name"],
                phone=user_data["phone"],
                role=user_data["role"],
                is_verified=True,
                is_active=True,
            )
            db.session.add(user)
            db.session.flush()
            users[user_data["email"]] = user

            city = city_map.get(user_data["city"])
            area = area_map.get(f"{user_data['city']}_{user_data['area']}")
            profile = Profile(
                user_id=user.id,
                profile_image=user_data["profile_image"],
                bio=user_data["bio"],
                city_id=city.id if city else None,
                area_id=area.id if area else None,
            )
            db.session.add(profile)

        db.session.commit()
        print(f"Created {len(users)} users")

        services = []
        all_service_data = CHEF_SERVICES + CATERER_SERVICES + DECORATOR_SERVICES

        for idx, service_data in enumerate(all_service_data):
            user = users[service_data["user_email"]]
            city = city_map.get(
                user.profile.city.name
                if user.profile and user.profile.city
                else "Chennai"
            )
            area = None
            if user.profile and user.profile.area:
                area = area_map.get(
                    f"{user.profile.city.name}_{user.profile.area.name}"
                )

            service = Service(
                user_id=user.id,
                title=service_data["title"],
                description=service_data["description"],
                service_type=service_data["service_type"],
                experience_years=service_data["experience_years"],
                price_per_event=service_data["price_per_event"],
                serves_veg=service_data["serves_veg"],
                serves_non_veg=service_data["serves_non_veg"],
                min_guests=service_data["min_guests"],
                max_guests=service_data["max_guests"],
                city_id=city.id if city else None,
                area_id=area.id if area else None,
                is_active=True,
                is_verified=True,
            )
            service.set_cuisine_types(service_data["cuisine_types"])
            service.set_event_types(service_data["event_types"])
            service.set_images(service_data.get("images", []))

            db.session.add(service)
            db.session.flush()
            services.append(service)

            if "dishes" in service_data:
                for dish_idx, dish_data in enumerate(service_data["dishes"]):
                    dish = SignatureDish(
                        service_id=service.id,
                        name=dish_data["name"],
                        description=dish_data["description"],
                        image_url=dish_data["image_url"],
                        cuisine_type=dish_data["cuisine_type"],
                        is_veg=dish_data["is_veg"],
                        display_order=dish_idx + 1,
                    )
                    db.session.add(dish)

        db.session.commit()
        print(
            f"Created {len(services)} services ({len(CHEF_SERVICES)} chefs, {len(CATERER_SERVICES)} caterers, {len(DECORATOR_SERVICES)} decorators)"
        )

        for event_data in EVENT_HISTORY_DATA:
            service = services[event_data["service_index"]]
            event = EventHistory(
                service_id=service.id,
                event_date=datetime.strptime(
                    event_data["event_date"], "%Y-%m-%d"
                ).date(),
                event_type=event_data["event_type"],
                number_of_guests=event_data["number_of_guests"],
                venue=event_data["venue"],
                customer_name=event_data["customer_name"],
                customer_testimonial=event_data["customer_testimonial"],
                is_featured=event_data["is_featured"],
            )
            event.set_cuisine_types(event_data["cuisine_types"])
            event.set_photos(event_data.get("photos", []))
            db.session.add(event)

        db.session.commit()
        print("Created event history")

        bookings = []
        for booking_data in SAMPLE_BOOKINGS:
            customer = users[booking_data["customer_email"]]
            service = services[booking_data["service_index"]]
            city = city_map.get(booking_data["city"])
            area = area_map.get(f"{booking_data['city']}_{booking_data['area']}")

            booking = Booking(
                service_id=service.id,
                customer_id=customer.id,
                provider_id=service.user_id,
                event_date=datetime.strptime(
                    booking_data["event_date"], "%Y-%m-%d"
                ).date(),
                event_time=datetime.strptime(
                    booking_data["event_time"], "%H:%M"
                ).time(),
                event_type=booking_data["event_type"],
                event_address=booking_data["event_address"],
                city_id=city.id if city else None,
                area_id=area.id if area else None,
                number_of_guests=booking_data["number_of_guests"],
                special_requirements=booking_data["special_requirements"],
                base_amount=booking_data["base_amount"],
                total_amount=booking_data["total_amount"],
                status=booking_data["status"],
            )
            db.session.add(booking)
            db.session.flush()
            bookings.append(booking)

        db.session.commit()
        print(f"Created {len(bookings)} bookings")

        for review_data in SAMPLE_REVIEWS:
            booking = bookings[review_data["booking_index"]]
            review = Review(
                booking_id=booking.id,
                service_id=booking.service_id,
                user_id=booking.customer_id,
                rating=review_data["rating"],
                comment=review_data["comment"],
                is_visible=True,
            )
            db.session.add(review)

            service = Service.query.get(booking.service_id)
            if service:
                service.total_reviews += 1
                total_rating = (
                    db.session.query(db.func.sum(Review.rating))
                    .filter_by(service_id=service.id, is_visible=True)
                    .scalar()
                    or 0
                )
                service.rating = round(total_rating / service.total_reviews, 2)

        db.session.commit()
        print("Created reviews")

        for avail_data in AVAILABILITY_DATA:
            if avail_data["service_index"] < len(services):
                service = services[avail_data["service_index"]]
                avail = Availability(
                    service_id=service.id,
                    date=datetime.strptime(avail_data["date"], "%Y-%m-%d").date(),
                    start_time=datetime.strptime(
                        avail_data["start_time"], "%H:%M"
                    ).time(),
                    end_time=datetime.strptime(avail_data["end_time"], "%H:%M").time(),
                    is_available=avail_data["is_available"],
                )
                db.session.add(avail)

        db.session.commit()
        print(f"Created {len(AVAILABILITY_DATA)} availability slots")

        print("Dummy data seeded successfully!")
        print("\nTest accounts (password: password123):")
        for email in [
            "customer1@example.com",
            "chef1@example.com",
            "caterer1@example.com",
            "decorator1@example.com",
        ]:
            print(f"  - {email}")

    return app
