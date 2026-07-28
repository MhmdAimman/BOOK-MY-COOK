"""
Test to verify service_type is correctly set based on user role
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.user import User
from app.models.service import Service
import json

def test_service_type():
    app = create_app()
    app.config['TESTING'] = True
    
    with app.app_context():
        print("\n" + "="*60)
        print("  SERVICE TYPE FIX VERIFICATION")
        print("="*60)
        
        # Check existing services and their types
        services = Service.query.all()
        
        print(f"\nTotal services: {len(services)}")
        print("\nServices by type:")
        
        type_counts = {}
        for s in services:
            st = s.service_type
            type_counts[st] = type_counts.get(st, 0) + 1
        
        for st, count in sorted(type_counts.items()):
            print(f"  {st}: {count}")
        
        # Check users and their roles vs their services
        print("\nUser roles vs their services:")
        providers = User.query.filter(User.role.in_(['chef', 'caterer', 'decorator'])).all()
        
        for user in providers[:10]:  # Show first 10
            user_services = Service.query.filter_by(user_id=user.id).all()
            service_types = [s.service_type for s in user_services]
            match = all(st == user.role for st in service_types) if service_types else True
            status = "MATCH" if match else "MISMATCH"
            print(f"  {user.email} (role: {user.role}) -> services: {service_types} [{status}]")
        
        print("\n" + "="*60)
        print("  Verification complete!")
        print("="*60)

if __name__ == "__main__":
    test_service_type()
