"""
IP Whitelist for Admin Access Control

This module restricts admin panel access to whitelisted IP addresses
for enhanced security.

IPs are configured via the ADMIN_ALLOWED_IPS environment variable
as a comma-separated list.
"""

import os
from flask import request, jsonify
from functools import wraps

ADMIN_ALLOWED_IPS = []

_raw_ips = os.environ.get('ADMIN_ALLOWED_IPS', '')
if _raw_ips:
    ADMIN_ALLOWED_IPS = [ip.strip() for ip in _raw_ips.split(',') if ip.strip()]


def get_client_ip():
    """Get client IP address from request."""
    if request:
        if request.headers.get('X-Forwarded-For'):
            return request.headers.get('X-Forwarded-For').split(',')[0].strip()
        return request.remote_addr
    return None


def is_ip_allowed(ip_address=None):
    """
    Check if an IP address is in the whitelist.
    
    Args:
        ip_address: IP to check (uses current request IP if not provided)
        
    Returns:
        True if IP is allowed or whitelist is empty
    """
    if not ADMIN_ALLOWED_IPS:
        return True
    
    ip = ip_address or get_client_ip()
    
    if not ip:
        return False
    
    return ip in ADMIN_ALLOWED_IPS


def ip_whitelist_required(f):
    """
    Decorator to require IP whitelist for admin routes.
    
    Usage:
        @app.route('/admin/sensitive')
        @jwt_required()
        @ip_whitelist_required
        def sensitive_admin_route():
            ...
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not is_ip_allowed():
            client_ip = get_client_ip()
            return jsonify({
                'message': 'Access denied. Your IP address is not authorized for admin access.',
                'ip': client_ip,
            }), 403
        return f(*args, **kwargs)
    return decorated_function


def get_allowed_ips():
    """Get list of allowed IPs."""
    return ADMIN_ALLOWED_IPS.copy()


def add_allowed_ip(ip_address):
    """
    Add an IP to the whitelist (runtime only).
    
    Note: This does not persist across restarts.
    To permanently add an IP, update the ADMIN_ALLOWED_IPS environment variable.
    """
    global ADMIN_ALLOWED_IPS
    if ip_address and ip_address not in ADMIN_ALLOWED_IPS:
        ADMIN_ALLOWED_IPS.append(ip_address)


def remove_allowed_ip(ip_address):
    """
    Remove an IP from the whitelist (runtime only).
    
    Note: This does not persist across restarts.
    """
    global ADMIN_ALLOWED_IPS
    if ip_address in ADMIN_ALLOWED_IPS:
        ADMIN_ALLOWED_IPS.remove(ip_address)
