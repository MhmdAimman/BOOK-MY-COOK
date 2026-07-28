import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.user import User, Profile
from app.models.location import City, Area
from app.models.service import Service
from app.models.booking import Booking
from app.models.availability import Availability
from app.models.signature_dish import SignatureDish
from app.models.event_history import EventHistory
from app.models.payment import Payment
from app.models.review import Review
from app.utils.audit import AuditLog
from app.utils.account_lockout import FailedLoginAttempt
from app.utils.totp import TwoFactorAuth
from app.utils.session_manager import UserSession
from app.utils.seed_data import (
    TAMIL_NADU_CITIES,
    CHENNAI_AREAS,
    COIMBATORE_AREAS,
    MADURAI_AREAS,
    TRICHY_AREAS,
    SALEM_AREAS,
)

app = create_app()

with app.app_context():
    print("Creating tables...")
    db.create_all()

    if City.query.first():
        print("Database already seeded.")
    else:
        print("Seeding Tamil Nadu cities...")

        city_map = {}
        for name, district in TAMIL_NADU_CITIES:
            city = City(name=name, district=district)
            db.session.add(city)
            city_map[name] = city

        db.session.commit()

        print("Seeding areas...")

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

    print("\nDatabase initialization complete!")
    print(f"Total cities: {City.query.count()}")
    print(f"Total areas: {Area.query.count()}")
