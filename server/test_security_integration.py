"""
Security Integration Test - Auth Endpoints
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.user import User
import json

def run_tests():
    app = create_app()
    app.config['TESTING'] = True
    
    with app.test_client() as client:
        print("\n" + "="*60)
        print("  SECURITY INTEGRATION TESTS")
        print("="*60)
        
        passed = 0
        failed = 0
        
        # Test 1: Registration with weak password
        print("\n1. REGISTRATION - Weak Password Rejection")
        response = client.post('/api/auth/register', json={
            "email": "weakpwd@example.com",
            "password": "password",
            "full_name": "Weak Pwd User"
        })
        if response.status_code == 400:
            data = response.get_json()
            print(f"   PASS - Status: {response.status_code}")
            print(f"         Message: {data.get('message', '')[:50]}")
            passed += 1
        else:
            print(f"   FAIL - Status: {response.status_code}")
            failed += 1
        
        # Test 2: Registration with strong password
        print("\n2. REGISTRATION - Strong Password Acceptance")
        response = client.post('/api/auth/register', json={
            "email": "strongpwd@example.com",
            "password": "Str0ngP@ss!",
            "full_name": "Strong Pwd User"
        })
        if response.status_code == 201:
            data = response.get_json()
            print(f"   PASS - Status: {response.status_code}")
            print(f"         User: {data.get('user', {}).get('email')}")
            passed += 1
        else:
            print(f"   FAIL - Status: {response.status_code}")
            print(f"         Response: {response.get_json()}")
            failed += 1
        
        # Test 3: Login with correct credentials
        print("\n3. LOGIN - Correct Credentials")
        response = client.post('/api/auth/login', json={
            "email": "strongpwd@example.com",
            "password": "Str0ngP@ss!"
        })
        if response.status_code == 200:
            data = response.get_json()
            token = data.get('token')
            print(f"   PASS - Status: {response.status_code}")
            print(f"         Token received: {token[:20]}...")
            passed += 1
        else:
            print(f"   FAIL - Status: {response.status_code}")
            failed += 1
        
        # Test 4: Login with wrong password
        print("\n4. LOGIN - Wrong Password")
        response = client.post('/api/auth/login', json={
            "email": "strongpwd@example.com",
            "password": "wrongpassword"
        })
        if response.status_code == 401:
            data = response.get_json()
            print(f"   PASS - Status: {response.status_code}")
            print(f"         Message: {data.get('message', '')[:50]}")
            passed += 1
        else:
            print(f"   FAIL - Status: {response.status_code}")
            failed += 1
        
        # Test 5: Invalid email format
        print("\n5. VALIDATION - Invalid Email Format")
        response = client.post('/api/auth/register', json={
            "email": "notanemail",
            "password": "Str0ngP@ss!",
            "full_name": "Test User"
        })
        if response.status_code == 400:
            print(f"   PASS - Status: {response.status_code}")
            passed += 1
        else:
            print(f"   FAIL - Status: {response.status_code}")
            failed += 1
        
        # Test 6: XSS in name field
        print("\n6. VALIDATION - XSS Payload in Name")
        response = client.post('/api/auth/register', json={
            "email": "xss_test@example.com",
            "password": "Str0ngP@ss!",
            "full_name": "<script>alert('xss')</script>"
        })
        if response.status_code == 400:
            print(f"   PASS - XSS rejected (Status: {response.status_code})")
            passed += 1
        else:
            print(f"   FAIL - XSS accepted (Status: {response.status_code})")
            failed += 1
        
        # Test 7: 2FA Status endpoint
        print("\n7. 2FA - Status Endpoint")
        # First login to get token
        login_resp = client.post('/api/auth/login', json={
            "email": "customer1@example.com",
            "password": "password123"
        })
        if login_resp.status_code == 200:
            token = login_resp.get_json().get('token')
            response = client.get('/api/2fa/status', 
                headers={"Authorization": f"Bearer {token}"})
            if response.status_code == 200:
                data = response.get_json()
                print(f"   PASS - Status: {response.status_code}")
                print(f"         2FA enabled: {data.get('is_2fa_enabled')}")
                passed += 1
            else:
                print(f"   FAIL - Status: {response.status_code}")
                failed += 1
        else:
            print("   SKIP - Could not login with test user")
        
        # Test 8: Password change endpoint
        print("\n8. PASSWORD CHANGE - Endpoint Test")
        if login_resp.status_code == 200:
            token = login_resp.get_json().get('token')
            response = client.post('/api/auth/change-password',
                headers={"Authorization": f"Bearer {token}"},
                json={
                    "current_password": "password123",
                    "new_password": "NewStr0ngP@ss!",
                    "confirm_password": "NewStr0ngP@ss!"
                })
            if response.status_code == 200:
                print(f"   PASS - Status: {response.status_code}")
                passed += 1
                # Change back
                client.post('/api/auth/change-password',
                    headers={"Authorization": f"Bearer {token}"},
                    json={
                        "current_password": "NewStr0ngP@ss!",
                        "new_password": "password123",
                        "confirm_password": "password123"
                    })
            else:
                print(f"   FAIL - Status: {response.status_code}")
                print(f"         Response: {response.get_json()}")
                failed += 1
        
        # Summary
        print("\n" + "="*60)
        print(f"  RESULTS: {passed} passed, {failed} failed")
        print("="*60)
        
        if failed == 0:
            print("\n  All integration tests passed!")
        else:
            print("\n  Some tests failed. Review above.")
        
        return failed == 0

if __name__ == "__main__":
    run_tests()
