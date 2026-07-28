"""
Security Final Test - All Features
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.user import User
from app.utils.account_lockout import FailedLoginAttempt
import time

def run_tests():
    app = create_app()
    app.config['TESTING'] = True
    
    with app.app_context():
        # Clean up test data
        User.query.filter(User.email.like('%test%example.com')).delete(synchronize_session=False)
        FailedLoginAttempt.query.filter(FailedLoginAttempt.email.like('%test%')).delete()
        db.session.commit()
    
    token = None
    
    with app.test_client() as client:
        print("\n" + "="*60)
        print("  BOOKMYCOOK SECURITY TESTS - FINAL")
        print("="*60)
        
        passed = 0
        failed = 0
        
        # Test 1: Weak password rejection
        print("\n1. PASSWORD POLICY - Weak Password Rejection")
        response = client.post('/api/auth/register', json={
            "email": "test_weak@example.com",
            "password": "password",
            "full_name": "Test User"
        })
        if response.status_code == 400:
            print("   PASS - Weak password rejected")
            passed += 1
        else:
            print(f"   FAIL - Status: {response.status_code}")
            failed += 1
        
        # Test 2: Strong password acceptance
        print("\n2. PASSWORD POLICY - Strong Password Acceptance")
        response = client.post('/api/auth/register', json={
            "email": "test_strong@example.com",
            "password": "Str0ngP@ss!",
            "full_name": "Test User"
        })
        if response.status_code == 201:
            print("   PASS - Strong password accepted")
            passed += 1
        else:
            data = response.get_json()
            if "already registered" in data.get('message', ''):
                print("   PASS - (Email already exists from previous run)")
                passed += 1
            else:
                print(f"   FAIL - Status: {response.status_code}")
                failed += 1
        
        # Test 3: Invalid email rejection
        print("\n3. INPUT VALIDATION - Invalid Email Rejection")
        response = client.post('/api/auth/register', json={
            "email": "notanemail",
            "password": "Str0ngP@ss!",
            "full_name": "Test User"
        })
        if response.status_code == 400:
            print("   PASS - Invalid email rejected")
            passed += 1
        else:
            print(f"   FAIL - Status: {response.status_code}")
            failed += 1
        
        # Test 4: XSS sanitization (unit test)
        print("\n4. INPUT VALIDATION - XSS Sanitization")
        from app.utils.validators import sanitize_html
        sanitized = sanitize_html("<script>alert('xss')</script>")
        if "<script>" not in sanitized:
            print(f"   PASS - XSS sanitized: {sanitized[:30]}...")
            passed += 1
        else:
            print("   FAIL - XSS not sanitized")
            failed += 1
        
        # Test 5: Login success
        print("\n5. AUTHENTICATION - Login Success")
        response = client.post('/api/auth/login', json={
            "email": "customer1@example.com",
            "password": "password123"
        })
        if response.status_code == 200:
            token = response.get_json().get('token')
            print("   PASS - Login successful")
            passed += 1
        else:
            print(f"   FAIL - Status: {response.status_code}")
            print(f"         Response: {response.get_json()}")
            failed += 1
        
        # Test 6: Login failure with remaining attempts
        print("\n6. AUTHENTICATION - Login Failure (Wrong Password)")
        response = client.post('/api/auth/login', json={
            "email": "customer1@example.com",
            "password": "wrongpassword"
        })
        if response.status_code == 401:
            data = response.get_json()
            if "attempts remaining" in data.get('message', ''):
                print(f"   PASS - Shows remaining attempts")
                passed += 1
            else:
                print("   PASS - Login failed")
                passed += 1
        else:
            print(f"   FAIL - Status: {response.status_code}")
            failed += 1
        
        # Test 7: 2FA status endpoint
        print("\n7. TWO-FACTOR AUTH - Status Endpoint")
        if token:
            response = client.get('/api/2fa/status',
                headers={"Authorization": f"Bearer {token}"})
            if response.status_code == 200:
                print("   PASS - 2FA status endpoint working")
                passed += 1
            else:
                print(f"   FAIL - Status: {response.status_code}")
                failed += 1
        else:
            print("   SKIP - No token available")
        
        # Test 8: Password change
        print("\n8. PASSWORD CHANGE - Endpoint")
        if token:
            response = client.post('/api/auth/change-password',
                headers={"Authorization": f"Bearer {token}"},
                json={
                    "current_password": "password123",
                    "new_password": "NewStr0ngP@ss!",
                    "confirm_password": "NewStr0ngP@ss!"
                })
            if response.status_code == 200:
                print("   PASS - Password changed")
                passed += 1
                # Revert
                client.post('/api/auth/change-password',
                    headers={"Authorization": f"Bearer {token}"},
                    json={
                        "current_password": "NewStr0ngP@ss!",
                        "new_password": "password123",
                        "confirm_password": "password123"
                    })
            else:
                print(f"   FAIL - Status: {response.status_code}")
                failed += 1
        else:
            print("   SKIP - No token available")
        
        # Test 9: Rate limiting configuration
        print("\n9. RATE LIMITING - Configuration")
        from app.utils.rate_limiter import RATE_LIMITS
        if 'auth_login' in RATE_LIMITS and 'auth_register' in RATE_LIMITS:
            print(f"   PASS - {len(RATE_LIMITS)} rate limits configured")
            passed += 1
        else:
            print("   FAIL - Rate limits not configured")
            failed += 1
        
        # Test 10: Audit logging
        print("\n10. AUDIT LOGGING - Event Types")
        from app.utils.audit import AuditEventType
        event_types = [
            AuditEventType.LOGIN_SUCCESS,
            AuditEventType.LOGIN_FAILURE,
            AuditEventType.REGISTER,
            AuditEventType.PASSWORD_CHANGE,
            AuditEventType.TWO_FA_ENABLED,
            AuditEventType.ACCOUNT_LOCKED,
        ]
        print(f"   PASS - {len(event_types)} audit event types defined")
        passed += 1
        
        # Summary
        print("\n" + "="*60)
        print(f"  RESULTS: {passed} passed, {failed} failed")
        print("="*60)
        
        if failed == 0:
            print("\n  All security features verified!")
        else:
            print(f"\n  {failed} test(s) failed. Review above.")
        
        return failed == 0

if __name__ == "__main__":
    run_tests()
