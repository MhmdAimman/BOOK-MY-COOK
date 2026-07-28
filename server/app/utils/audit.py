"""
Audit Logging System for BOOKMYCOOK

This module provides comprehensive audit logging for security events:
- User authentication events
- Account changes
- Booking and payment events
- Admin actions
- Security incidents

All logs are stored in the database for compliance and investigation.
"""

import os
import json
from datetime import datetime
from flask import request, g
from app import db

AUDIT_LOGGING_ENABLED = os.environ.get('AUDIT_LOGGING_ENABLED', 'true').lower() == 'true'


class AuditLog(db.Model):
    """Model for storing audit log entries."""
    
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    action = db.Column(db.String(100), nullable=False)
    resource_type = db.Column(db.String(50), nullable=True)
    resource_id = db.Column(db.Integer, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.String(500), nullable=True)
    details = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='success')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='audit_logs')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action': self.action,
            'resource_type': self.resource_type,
            'resource_id': self.resource_id,
            'ip_address': self.ip_address,
            'status': self.status,
            'details': json.loads(self.details) if self.details else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class AuditEventType:
    """Constants for audit event types."""
    
    # Authentication events
    LOGIN_SUCCESS = 'LOGIN_SUCCESS'
    LOGIN_FAILURE = 'LOGIN_FAILURE'
    LOGOUT = 'LOGOUT'
    REGISTER = 'REGISTER'
    PASSWORD_CHANGE = 'PASSWORD_CHANGE'
    PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST'
    ACCOUNT_LOCKED = 'ACCOUNT_LOCKED'
    ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED'
    
    # Two-factor authentication
    TWO_FA_ENABLED = 'TWO_FA_ENABLED'
    TWO_FA_DISABLED = 'TWO_FA_DISABLED'
    TWO_FA_VERIFIED = 'TWO_FA_VERIFIED'
    TWO_FA_FAILED = 'TWO_FA_FAILED'
    
    # Profile events
    PROFILE_UPDATE = 'PROFILE_UPDATE'
    PROFILE_IMAGE_UPDATE = 'PROFILE_IMAGE_UPDATE'
    
    # Service events
    SERVICE_CREATE = 'SERVICE_CREATE'
    SERVICE_UPDATE = 'SERVICE_UPDATE'
    SERVICE_DELETE = 'SERVICE_DELETE'
    
    # Booking events
    BOOKING_CREATE = 'BOOKING_CREATE'
    BOOKING_CONFIRM = 'BOOKING_CONFIRM'
    BOOKING_REJECT = 'BOOKING_REJECT'
    BOOKING_CANCEL = 'BOOKING_CANCEL'
    BOOKING_COMPLETE = 'BOOKING_COMPLETE'
    
    # Payment events
    PAYMENT_INITIATED = 'PAYMENT_INITIATED'
    PAYMENT_SUCCESS = 'PAYMENT_SUCCESS'
    PAYMENT_FAILURE = 'PAYMENT_FAILURE'
    PAYMENT_REFUND = 'PAYMENT_REFUND'
    CASH_PAYMENT_RECEIVED = 'CASH_PAYMENT_RECEIVED'
    
    # Review events
    REVIEW_CREATE = 'REVIEW_CREATE'
    REVIEW_UPDATE = 'REVIEW_UPDATE'
    REVIEW_DELETE = 'REVIEW_DELETE'
    
    # Admin events
    ADMIN_USER_VIEW = 'ADMIN_USER_VIEW'
    ADMIN_USER_UPDATE = 'ADMIN_USER_UPDATE'
    ADMIN_USER_DELETE = 'ADMIN_USER_DELETE'
    ADMIN_SERVICE_APPROVE = 'ADMIN_SERVICE_APPROVE'
    ADMIN_SERVICE_REJECT = 'ADMIN_SERVICE_REJECT'
    
    # Security events
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
    SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY'
    UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS'


def get_client_ip():
    """Get client IP address from request."""
    if request:
        if request.headers.get('X-Forwarded-For'):
            return request.headers.get('X-Forwarded-For').split(',')[0].strip()
        return request.remote_addr
    return None


def get_user_agent():
    """Get user agent from request."""
    if request:
        return request.headers.get('User-Agent', '')[:500]
    return None


def log_event(action, user_id=None, resource_type=None, resource_id=None, 
             details=None, status='success'):
    """
    Log an audit event.
    
    Args:
        action: Event type from AuditEventType
        user_id: ID of user performing action (optional)
        resource_type: Type of resource affected (optional)
        resource_id: ID of resource affected (optional)
        details: Additional details as dict (optional)
        status: 'success' or 'failure' (default: 'success')
    """
    if not AUDIT_LOGGING_ENABLED:
        return
    
    try:
        log = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=get_client_ip(),
            user_agent=get_user_agent(),
            details=json.dumps(details) if details else None,
            status=status,
        )
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Audit log error: {e}")


def log_auth_event(action, user_id=None, email=None, success=True, details=None):
    """Log authentication-related events."""
    event_details = details or {}
    if email:
        event_details['email'] = email
    
    log_event(
        action=action,
        user_id=user_id,
        resource_type='user',
        resource_id=user_id,
        details=event_details,
        status='success' if success else 'failure',
    )


def log_booking_event(action, booking_id, user_id, details=None):
    """Log booking-related events."""
    log_event(
        action=action,
        user_id=user_id,
        resource_type='booking',
        resource_id=booking_id,
        details=details,
    )


def log_payment_event(action, payment_id, user_id, amount=None, details=None):
    """Log payment-related events."""
    event_details = details or {}
    if amount:
        event_details['amount'] = amount
    
    log_event(
        action=action,
        user_id=user_id,
        resource_type='payment',
        resource_id=payment_id,
        details=event_details,
    )


def log_admin_event(action, admin_id, resource_type, resource_id, details=None):
    """Log admin actions."""
    log_event(
        action=action,
        user_id=admin_id,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
    )


def log_security_event(action, user_id=None, details=None):
    """Log security-related events."""
    log_event(
        action=action,
        user_id=user_id,
        resource_type='security',
        details=details,
        status='warning',
    )


def get_user_audit_logs(user_id, limit=50):
    """Get audit logs for a specific user."""
    return AuditLog.query.filter_by(user_id=user_id).order_by(
        AuditLog.created_at.desc()
    ).limit(limit).all()


def get_recent_security_events(hours=24, limit=100):
    """Get recent security events."""
    from datetime import timedelta
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    
    security_actions = [
        AuditEventType.LOGIN_FAILURE,
        AuditEventType.ACCOUNT_LOCKED,
        AuditEventType.RATE_LIMIT_EXCEEDED,
        AuditEventType.SUSPICIOUS_ACTIVITY,
        AuditEventType.UNAUTHORIZED_ACCESS,
        AuditEventType.TWO_FA_FAILED,
    ]
    
    return AuditLog.query.filter(
        AuditLog.action.in_(security_actions),
        AuditLog.created_at >= cutoff
    ).order_by(AuditLog.created_at.desc()).limit(limit).all()
