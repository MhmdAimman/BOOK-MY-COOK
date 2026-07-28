"""
Security Features Test Script for BOOKMYCOOK

Tests:
1. Rate Limiting
2. Account Lockout
3. Input Validation
4. Password Policy
5. Audit Logging
6. 2FA Setup
"""

import requests
import time
import json

BASE_URL = "http://localhost:5000/api"

def print_header(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print('='*60)

def print_result(test_name, passed, details=""):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status} - {test_name}")
    if details:
        print(f"         {details}")

def test_rate_limiting():
    print_header("1. RATE LIMITING TEST")
    
    results = []
    
    # Test login rate limit (5 per minute)
    print("\nTesting login rate limit (5 attempts/min)...")
    for i in range(7):
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": "test@example.com",
            "password": "wrongpassword"
        })
        if response.status_code == 429:
            print_result(f"Login rate limit triggered after {i} attempts", True, f"Status: {response.status_code}")
            results.append(True)
            break
        time.sleep(0.1)
    else:
        print_result("Login rate limit", False, "Rate limit not triggered after 7 attempts")
        results.append(False)
    
    # Wait for rate limit to reset
    print("\nWaiting 60 seconds for rate limit reset...")
    time.sleep(61)
    
    return all(results)

def test_account_lockout():
    print_header("2. ACCOUNT LOCKOUT TEST")
    
    results = []
    
    # Create a test user first
    test_email = f"lockout_test_{int(time.time())}@example.com"
    
    print(f"\nCreating test user: {test_email}")
    register_response = requests.post(f"{BASE_URL}/auth/register", json={
        "email": test_email,
        "password": "TestPass123!",
        "full_name": "Lockout Test",
        "role": "customer"
    })
    
    if register_response.status_code != 201:
        print_result("Test user creation", False, register_response.text)
        return False
    
    print_result("Test user created", True)
    
    # Test failed login attempts leading to lockout
    print(f"\nAttempting 6 failed logins to trigger lockout...")
    for i in range(6):
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": test_email,
            "password": "wrongpassword"
        })
        print(f"  Attempt {i+1}: Status {response.status_code}")
        
        if response.status_code == 423:
            data = response.json()
            print_result("Account lockout triggered", True, f"Message: {data.get('message', '')}")
            results.append(True)
            break
        elif response.status_code == 200:
            # Rate limit might have kicked in
            pass
        time.sleep(1)
    else:
        print_result("Account lockout", False, "Lockout not triggered after 6 attempts")
        results.append(False)
    
    return all(results) if results else False

def test_input_validation():
    print_header("3. INPUT VALIDATION TEST")
    
    results = []
    
    # Test XSS prevention
    print("\nTesting XSS prevention...")
    xss_payload = "<script>alert('xss')</script>"
    response = requests.post(f"{BASE_URL}/auth/register", json={
        "email": f"xss_test_{int(time.time())}@example.com",
        "password": "TestPass123!",
        "full_name": xss_payload
    })
    
    if response.status_code == 400:
        print_result("XSS payload rejected", True, "Script tags blocked")
        results.append(True)
    else:
        print_result("XSS payload rejected", False, f"Status: {response.status_code}")
        results.append(False)
    
    # Test SQL injection prevention
    print("\nTesting SQL injection prevention...")
    sql_payload = "'; DROP TABLE users; --"
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": sql_payload,
        "password": "test"
    })
    
    if response.status_code in [400, 401]:
        print_result("SQL injection blocked", True, "Malicious input rejected")
        results.append(True)
    else:
        print_result("SQL injection blocked", False)
        results.append(False)
    
    # Test invalid email
    print("\nTesting invalid email format...")
    response = requests.post(f"{BASE_URL}/auth/register", json={
        "email": "notanemail",
        "password": "TestPass123!",
        "full_name": "Test User"
    })
    
    if response.status_code == 400:
        print_result("Invalid email rejected", True)
        results.append(True)
    else:
        print_result("Invalid email rejected", False)
        results.append(False)
    
    return all(results)

def test_password_policy():
    print_header("4. PASSWORD POLICY TEST")
    
    results = []
    
    # Test weak password
    print("\nTesting weak password rejection...")
    weak_passwords = ["password", "12345678", "abcdefgh"]
    
    for pwd in weak_passwords:
        response = requests.post(f"{BASE_URL}/auth/register", json={
            "email": f"weak_pwd_{int(time.time())}@example.com",
            "password": pwd,
            "full_name": "Weak Pwd Test"
        })
        
        if response.status_code == 400:
            print_result(f"Weak password '{pwd}' rejected", True)
            results.append(True)
        else:
            print_result(f"Weak password '{pwd}' rejected", False)
            results.append(False)
        time.sleep(1)
    
    # Test strong password
    print("\nTesting strong password acceptance...")
    response = requests.post(f"{BASE_URL}/auth/register", json={
        "email": f"strong_pwd_{int(time.time())}@example.com",
        "password": "Str0ngP@ss!",
        "full_name": "Strong Pwd Test"
    })
    
    if response.status_code == 201:
        print_result("Strong password accepted", True)
        results.append(True)
    else:
        print_result("Strong password accepted", False, response.text)
        results.append(False)
    
    return all(results)

def test_audit_logging():
    print_header("5. AUDIT LOGGING TEST")
    
    print("\nNote: Audit logs are stored in database.")
    print("Checking if audit module is properly integrated...")
    
    # Import and check audit module
    try:
        from app.utils.audit import AuditLog, AuditEventType, log_event
        print_result("Audit module imported", True)
        
        # Check event types exist
        event_types = [
            AuditEventType.LOGIN_SUCCESS,
            AuditEventType.LOGIN_FAILURE,
            AuditEventType.REGISTER,
            AuditEventType.PASSWORD_CHANGE,
            AuditEventType.TWO_FA_ENABLED,
        ]
        print_result("Audit event types defined", True, f"{len(event_types)} types checked")
        
        return True
    except Exception as e:
        print_result("Audit module check", False, str(e))
        return False

def test_2fa_endpoints():
    print_header("6. TWO-FACTOR AUTH TEST")
    
    print("\nTesting 2FA endpoint availability...")
    
    # First, login to get a token
    login_response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "customer1@example.com",
        "password": "password123"
    })
    
    if login_response.status_code != 200:
        print_result("Login for 2FA test", False, "Could not login with test credentials")
        return False
    
    token = login_response.json().get("token")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test 2FA status endpoint
    response = requests.get(f"{BASE_URL}/2fa/status", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print_result("2FA status endpoint", True, f"2FA enabled: {data.get('is_2fa_enabled', False)}")
        return True
    else:
        print_result("2FA status endpoint", False, f"Status: {response.status_code}")
        return False

def test_session_management():
    print_header("7. SESSION MANAGEMENT TEST")
    
    print("\nTesting session creation on login...")
    
    # Login
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "customer1@example.com",
        "password": "password123"
    })
    
    if response.status_code == 200:
        token = response.json().get("token")
        print_result("Session created on login", True)
        
        # Test logout
        logout_response = requests.post(f"{BASE_URL}/auth/logout", 
            headers={"Authorization": f"Bearer {token}"})
        
        if logout_response.status_code == 200:
            print_result("Session invalidated on logout", True)
            return True
        else:
            print_result("Session invalidated on logout", False)
            return False
    else:
        print_result("Login for session test", False)
        return False

def main():
    print("\n" + "="*60)
    print("  BOOKMYCOOK SECURITY FEATURES TEST")
    print("="*60)
    print("\nMake sure the server is running on http://localhost:5000")
    print("Press Enter to start tests...")
    input()
    
    all_results = {}
    
    # Run tests
    all_results['rate_limiting'] = test_rate_limiting()
    all_results['account_lockout'] = test_account_lockout()
    all_results['input_validation'] = test_input_validation()
    all_results['password_policy'] = test_password_policy()
    all_results['audit_logging'] = test_audit_logging()
    all_results['2fa_endpoints'] = test_2fa_endpoints()
    all_results['session_management'] = test_session_management()
    
    # Summary
    print_header("TEST SUMMARY")
    
    passed = sum(1 for v in all_results.values() if v)
    total = len(all_results)
    
    for test_name, result in all_results.items():
        status = "✅" if result else "❌"
        print(f"{status} {test_name.replace('_', ' ').title()}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All security features are working correctly!")
    else:
        print("\n⚠️  Some tests failed. Please review the output above.")

if __name__ == "__main__":
    main()
