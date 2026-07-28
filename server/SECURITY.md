# Security Documentation - BOOKMYCOOK

This document outlines the security measures implemented in the BOOKMYCOOK application.

## Table of Contents

1. [Overview](#overview)
2. [Authentication Security](#authentication-security)
3. [Rate Limiting](#rate-limiting)
4. [Account Lockout](#account-lockout)
5. [Two-Factor Authentication](#two-factor-authentication)
6. [Input Validation](#input-validation)
7. [Password Policy](#password-policy)
8. [Data Encryption](#data-encryption)
9. [Session Management](#session-management)
10. [Audit Logging](#audit-logging)
11. [Admin IP Whitelist](#admin-ip-whitelist)
12. [Data Loss Prevention](#data-loss-prevention)
13. [Environment Configuration](#environment-configuration)

---

## Overview

BOOKMYCOOK implements enterprise-grade security measures to protect user data and prevent common attack vectors. All security features can be enabled/disabled via environment variables.

### Security Features Status

| Feature | Status | Default |
|---------|--------|---------|
| Rate Limiting | ✅ Enabled | On |
| Account Lockout | ✅ Enabled | On |
| Two-Factor Auth | ✅ Available | Optional |
| Input Validation | ✅ Enabled | On |
| Password Policy | ✅ Enabled | On |
| Data Encryption | ✅ Enabled | On |
| Session Management | ✅ Enabled | On |
| Audit Logging | ✅ Enabled | On |
| Admin IP Whitelist | ⚙️ Configurable | Off |
| DLP | ✅ Enabled | On |

---

## Authentication Security

### JWT Token Security

- Tokens expire after 24 hours (configurable)
- Tokens are stored in sessionStorage on the client (cleared on browser close)
- Token invalidation on logout

### Login Flow

1. User submits email and password
2. Rate limiter checks request frequency
3. Account lockout status is verified
4. Password is verified using bcrypt
5. If 2FA is enabled, verification code is required
6. Session is created and logged

---

## Rate Limiting

Rate limiting protects against brute force attacks and API abuse.

### Default Limits

| Endpoint Type | Rate Limit |
|--------------|------------|
| Login | 5 per minute |
| Registration | 3 per hour |
| Password Change | 3 per hour |
| File Upload | 20 per minute |
| Chat | 30 per minute |
| Search | 60 per minute |
| Booking | 10 per minute |
| Payment | 10 per minute |
| Admin | 50 per minute |
| Default API | 100 per minute |

### Configuration

```env
RATE_LIMIT_STORAGE_URL=memory://
# For production, use Redis:
# RATE_LIMIT_STORAGE_URL=redis://localhost:6379
```

---

## Account Lockout

Protects against brute force password attacks.

### Settings

| Setting | Default | Description |
|---------|---------|-------------|
| MAX_LOGIN_ATTEMPTS | 5 | Maximum failed attempts before lockout |
| LOCKOUT_DURATION_MINUTES | 15 | Lockout duration in minutes |

### Behavior

1. After 5 failed login attempts, account is locked for 15 minutes
2. Lockout is tracked per email address
3. Successful login clears failed attempt counter
4. Lockout automatically expires after duration

### Configuration

```env
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
```

---

## Two-Factor Authentication

TOTP-based 2FA using authenticator apps (Google Authenticator, Authy, etc.).

### Features

- QR code generation for easy setup
- 10 backup codes generated on setup
- Backup codes are one-time use
- Support for both TOTP codes and backup codes

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/2fa/setup` | POST | Generate 2FA secret and QR code |
| `/api/2fa/enable` | POST | Enable 2FA after verification |
| `/api/2fa/disable` | POST | Disable 2FA |
| `/api/2fa/verify` | POST | Verify 2FA code during login |
| `/api/2fa/status` | GET | Check 2FA status |
| `/api/2fa/regenerate-backup-codes` | POST | Generate new backup codes |

### Setup Flow

1. User calls `/api/2fa/setup`
2. Response includes secret, QR code, and backup codes
3. User scans QR code with authenticator app
4. User calls `/api/2fa/enable` with the current TOTP code
5. 2FA is now enabled for the account

### Login Flow with 2FA

1. User logs in with email/password
2. If 2FA is enabled, response includes `requires_2fa: true` and a temporary token
3. User calls `/api/2fa/verify` with the TOTP code
4. On success, full access token is issued

---

## Input Validation

All user inputs are validated and sanitized using Marshmallow schemas.

### Protection Against

- SQL Injection (via SQLAlchemy parameterized queries)
- Cross-Site Scripting (XSS) via HTML escaping
- Invalid data types and formats
- Buffer overflow attacks (length limits)

### Validation Schemas

| Schema | Purpose |
|--------|---------|
| UserRegistrationSchema | User registration |
| UserLoginSchema | User login |
| ProfileUpdateSchema | Profile updates |
| ServiceCreateSchema | Service creation |
| BookingCreateSchema | Booking creation |
| ReviewCreateSchema | Review creation |
| MessageCreateSchema | Message creation |
| PasswordChangeSchema | Password changes |
| ContactFormSchema | Contact form |

### Sanitization Functions

```python
sanitize_string(value)  # HTML escape and trim
sanitize_html(value)    # Remove HTML tags and escape
validate_phone(phone)   # Validate Indian phone format
validate_email_address(email)  # Validate email format
```

---

## Password Policy

Enforces strong password requirements.

### Requirements

| Requirement | Minimum |
|-------------|---------|
| Length | 8 characters |
| Uppercase | 1 letter |
| Lowercase | 1 letter |
| Numbers | 1 digit |
| Special Characters | 1 character |

### Password Hashing

- Algorithm: bcrypt
- Work factor: 12 rounds (default)
- Quantum-resistant: Yes (bcrypt is quantum-resistant)

---

## Data Encryption

Sensitive data is encrypted using AES-256 (Fernet).

### Encrypted Data

- Payment information
- Personal identification numbers
- Sensitive profile data

### Configuration

```env
ENCRYPTION_KEY=<fernet-key>
```

Generate a key:
```python
from cryptography.fernet import Fernet
print(Fernet.generate_key())
```

---

## Session Management

Track and manage user sessions.

### Features

- Track active sessions per user
- Device fingerprinting
- Session expiration
- Maximum concurrent sessions limit
- Session invalidation

### Settings

| Setting | Default | Description |
|---------|---------|-------------|
| SESSION_LIFETIME | 86400 | Session lifetime in seconds (24 hours) |
| MAX_CONCURRENT_SESSIONS | 5 | Maximum sessions per user |

### Session Tracking

Each session records:
- User ID
- Session token (hashed)
- Device fingerprint
- IP address
- User agent
- Creation time
- Last activity
- Expiration time

---

## Audit Logging

Comprehensive logging of security events.

### Logged Events

| Category | Events |
|----------|--------|
| Authentication | Login success/failure, logout, register |
| Account | Password change, account locked/unlocked |
| 2FA | Enable, disable, verify, failed |
| Profile | Update, image update |
| Service | Create, update, delete |
| Booking | Create, confirm, reject, cancel, complete |
| Payment | Initiated, success, failure, refund |
| Admin | User view/update/delete, service approve/reject |
| Security | Rate limit exceeded, suspicious activity |

### Log Entry Fields

- User ID
- Action type
- Resource type and ID
- IP address
- User agent
- Additional details (JSON)
- Status (success/failure)
- Timestamp

### Querying Audit Logs

```python
from app.utils.audit import get_user_audit_logs, get_recent_security_events

# Get user's audit history
logs = get_user_audit_logs(user_id, limit=50)

# Get recent security events
events = get_recent_security_events(hours=24, limit=100)
```

---

## Admin IP Whitelist

Restrict admin panel access to specific IP addresses.

### Configuration

```env
ADMIN_IP_WHITELIST=192.168.1.100,10.0.0.0/8
```

### Usage

```python
from app.utils.ip_whitelist import admin_ip_required

@app.route('/admin/sensitive')
@admin_ip_required
def admin_sensitive():
    ...
```

---

## Data Loss Prevention

Detect and prevent sensitive data leakage.

### Detection Patterns

| Pattern | Description |
|---------|-------------|
| Credit Card | 16-digit card numbers |
| Phone Numbers | Indian phone formats |
| Email Addresses | Email patterns |
| Custom Patterns | Configurable regex |

### Usage

```python
from app.utils.dlp import scan_for_sensitive_data, redact_sensitive_data

# Scan text for sensitive data
findings = scan_for_sensitive_data(text)

# Redact sensitive data
redacted = redact_sensitive_data(text)
```

---

## Environment Configuration

### Required Environment Variables

```env
# Core Security
SECRET_KEY=<your-secret-key>
JWT_SECRET_KEY=<your-jwt-secret>
SECURITY_ENABLED=true

# Rate Limiting
RATE_LIMIT_STORAGE_URL=memory://

# Account Lockout
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15

# Encryption
ENCRYPTION_KEY=<fernet-key>

# Session
SESSION_LIFETIME=86400
MAX_CONCURRENT_SESSIONS=5

# Audit
AUDIT_LOGGING_ENABLED=true

# Admin IP Whitelist (optional)
ADMIN_IP_WHITELIST=

# 2FA
OTP_ISSUER=BOOKMYCOOK
```

### Production Checklist

- [ ] Set strong SECRET_KEY (32+ random characters)
- [ ] Set strong JWT_SECRET_KEY (32+ random characters)
- [ ] Use Redis for rate limiting storage
- [ ] Enable HTTPS
- [ ] Configure ADMIN_IP_WHITELIST
- [ ] Set up log aggregation for audit logs
- [ ] Configure backup for encryption keys
- [ ] Review and test all security settings

---

## Security Best Practices

### For Developers

1. Never commit `.env` files to version control
2. Use parameterized queries (SQLAlchemy handles this)
3. Always validate and sanitize user input
4. Use HTTPS in production
5. Keep dependencies updated
6. Review audit logs regularly

### For Users

1. Enable 2FA on your account
2. Use strong, unique passwords
3. Keep backup codes secure
4. Log out from shared devices
5. Report suspicious activity

---

## Incident Response

### If a security breach is suspected:

1. **Immediate Actions**
   - Disable affected user accounts
   - Revoke all active sessions
   - Enable maintenance mode if necessary

2. **Investigation**
   - Review audit logs
   - Check for unusual patterns
   - Identify affected users

3. **Remediation**
   - Force password reset for affected users
   - Update compromised credentials
   - Patch vulnerabilities

4. **Communication**
   - Notify affected users
   - Document the incident
   - Update security measures

---

## Contact

For security concerns, contact: security@bookmycook.com

---

*Last updated: April 2026*
