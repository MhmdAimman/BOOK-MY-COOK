"""
Security Features Unit Test for BOOKMYCOOK
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db

def run_tests():
    app = create_app()
    with app.app_context():
        print("\n" + "="*60)
        print("  BOOKMYCOOK SECURITY UNIT TESTS")
        print("="*60)
        
        passed = 0
        failed = 0
        
        # Test 1: Password Policy
        print("\n1. PASSWORD POLICY")
        from app.utils.password_policy import validate_password
        is_valid, errors = validate_password("password")
        if not is_valid:
            print("   PASS - Weak password 'password' rejected")
            passed += 1
        else:
            print("   FAIL - Weak password accepted")
            failed += 1
            
        is_valid, errors = validate_password("Str0ngP@ss!")
        if is_valid:
            print("   PASS - Strong password accepted")
            passed += 1
        else:
            print("   FAIL - Strong password rejected")
            failed += 1
        
        # Test 2: Input Validation
        print("\n2. INPUT VALIDATION")
        from app.utils.validators import sanitize_html, validate_request, UserLoginSchema
        sanitized = sanitize_html("<script>alert('xss')</script>")
        if "<script>" not in sanitized:
            print("   PASS - XSS payload sanitized")
            passed += 1
        else:
            print("   FAIL - XSS not sanitized")
            failed += 1
        
        is_valid, _ = validate_request(UserLoginSchema, {"email": "notanemail", "password": "test"})
        if not is_valid:
            print("   PASS - Invalid email rejected")
            passed += 1
        else:
            print("   FAIL - Invalid email accepted")
            failed += 1
        
        # Test 3: Account Lockout
        print("\n3. ACCOUNT LOCKOUT")
        from app.utils.account_lockout import is_account_locked, record_failed_attempt, clear_failed_attempts, FailedLoginAttempt
        
        # Clean up
        FailedLoginAttempt.query.filter_by(email="test_lock@example.com").delete()
        db.session.commit()
        
        is_locked, _, remaining = is_account_locked("test_lock@example.com")
        if not is_locked:
            print("   PASS - New account not locked")
            passed += 1
        else:
            print("   FAIL - New account locked")
            failed += 1
        
        # Trigger lockout
        for i in range(5):
            is_now_locked, _ = record_failed_attempt("test_lock@example.com")
            if is_now_locked:
                print(f"   PASS - Account locked after {i+1} attempts")
                passed += 1
                break
        else:
            print("   FAIL - Account not locked after 5 attempts")
            failed += 1
        
        clear_failed_attempts("test_lock@example.com")
        
        # Test 4: 2FA Module
        print("\n4. TWO-FACTOR AUTH")
        from app.utils.totp import generate_secret, verify_code, generate_backup_codes
        import pyotp
        
        secret = generate_secret()
        if len(secret) > 0:
            print("   PASS - TOTP secret generated")
            passed += 1
        else:
            print("   FAIL - Secret not generated")
            failed += 1
        
        codes = generate_backup_codes(10)
        if len(codes) == 10:
            print("   PASS - Backup codes generated")
            passed += 1
        else:
            print("   FAIL - Backup codes not generated")
            failed += 1
        
        test_secret = pyotp.random_base32()
        totp = pyotp.TOTP(test_secret)
        valid_code = totp.now()
        if verify_code(test_secret, valid_code):
            print("   PASS - TOTP code verified")
            passed += 1
        else:
            print("   FAIL - TOTP verification failed")
            failed += 1
        
        # Test 5: Rate Limiter
        print("\n5. RATE LIMITER")
        from app.utils.rate_limiter import get_rate_limit, RATE_LIMITS
        
        if len(RATE_LIMITS) > 0:
            print(f"   PASS - {len(RATE_LIMITS)} rate limits configured")
            passed += 1
        else:
            print("   FAIL - No rate limits")
            failed += 1
        
        login_limit = get_rate_limit("auth_login")
        if login_limit == "5 per minute":
            print("   PASS - Login rate limit: 5/min")
            passed += 1
        else:
            print("   FAIL - Wrong login limit")
            failed += 1
        
        # Test 6: Audit Logging
        print("\n6. AUDIT LOGGING")
        from app.utils.audit import AuditEventType, log_event, AuditLog
        
        event_types = [AuditEventType.LOGIN_SUCCESS, AuditEventType.LOGIN_FAILURE]
        if len(event_types) == 2:
            print("   PASS - Audit event types defined")
            passed += 1
        else:
            print("   FAIL - Event types missing")
            failed += 1
        
        log_event(action=AuditEventType.LOGIN_FAILURE, details={"test": True})
        log = AuditLog.query.filter_by(action=AuditEventType.LOGIN_FAILURE).first()
        if log:
            print("   PASS - Audit log created")
            passed += 1
        else:
            print("   FAIL - Audit log not created")
            failed += 1
        
        # Test 7: Session Manager
        print("\n7. SESSION MANAGER")
        from app.utils.session_manager import generate_device_fingerprint
        
        with app.test_request_context():
            fingerprint = generate_device_fingerprint()
            if len(fingerprint) == 64:
                print("   PASS - Device fingerprint generated")
                passed += 1
            else:
                print("   FAIL - Fingerprint not generated")
                failed += 1
        
        # Summary
        print("\n" + "="*60)
        print(f"  RESULTS: {passed} passed, {failed} failed")
        print("="*60)
        
        if failed == 0:
            print("\n  All security features working correctly!")
        else:
            print("\n  Some tests failed. Review above.")
        
        return failed == 0

if __name__ == "__main__":
    run_tests()
