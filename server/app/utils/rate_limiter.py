"""
Rate Limiting Configuration for BOOKMYCOOK

This module provides rate limiting functionality to protect against:
- Brute force attacks on authentication endpoints
- API abuse and DDoS attacks
- Resource exhaustion

Rate limits are configured per endpoint type and can be adjusted via environment variables.
"""

import os
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per minute"],
    storage_uri=os.environ.get("RATE_LIMIT_STORAGE_URL", "memory://"),
)

RATE_LIMITS = {
    "auth_login": "5 per minute",
    "auth_register": "3 per hour",
    "auth_password": "3 per hour",
    "upload": "20 per minute",
    "chat": "30 per minute",
    "search": "60 per minute",
    "booking": "10 per minute",
    "payment": "10 per minute",
    "api_default": "100 per minute",
    "admin": "50 per minute",
}


def get_rate_limit(limit_type):
    """Get rate limit string for a given limit type."""
    return RATE_LIMITS.get(limit_type, RATE_LIMITS["api_default"])


def init_rate_limiter(app):
    """Initialize rate limiter with the Flask app."""
    limiter.init_app(app)
    return limiter
