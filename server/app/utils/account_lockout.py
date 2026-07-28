"""
Account Lockout System for BOOKMYCOOK

This module provides brute-force protection by locking accounts after
multiple failed login attempts.

Features:
- Configurable attempt threshold
- Time-based lockout duration
- Automatic unlock after lockout period
- Manual unlock capability
"""

import os
from datetime import datetime, timedelta
from flask import request
from app import db

MAX_LOGIN_ATTEMPTS = int(os.environ.get('MAX_LOGIN_ATTEMPTS', 5))
LOCKOUT_DURATION_MINUTES = int(os.environ.get('LOCKOUT_DURATION_MINUTES', 15))


class FailedLoginAttempt(db.Model):
    """Track failed login attempts."""
    
    __tablename__ = 'failed_login_attempts'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), nullable=False, index=True)
    ip_address = db.Column(db.String(45), nullable=True)
    attempt_count = db.Column(db.Integer, default=1)
    last_attempt = db.Column(db.DateTime, default=datetime.utcnow)
    locked_until = db.Column(db.DateTime, nullable=True)
    
    @classmethod
    def get_by_email(cls, email):
        """Get failed attempt record by email."""
        return cls.query.filter_by(email=email.lower()).first()
    
    @classmethod
    def cleanup_expired(cls):
        """Remove expired lockout records."""
        cutoff = datetime.utcnow() - timedelta(hours=1)
        cls.query.filter(cls.last_attempt < cutoff).delete()
        db.session.commit()


def is_account_locked(email):
    """
    Check if an account is locked due to too many failed attempts.
    
    Args:
        email: User's email address
        
    Returns:
        Tuple of (is_locked, lockout_end_time, remaining_attempts)
    """
    record = FailedLoginAttempt.get_by_email(email)
    
    if not record:
        return False, None, MAX_LOGIN_ATTEMPTS
    
    if record.locked_until and record.locked_until > datetime.utcnow():
        remaining_time = record.locked_until - datetime.utcnow()
        return True, record.locked_until, 0
    
    if record.locked_until and record.locked_until <= datetime.utcnow():
        db.session.delete(record)
        db.session.commit()
        return False, None, MAX_LOGIN_ATTEMPTS
    
    remaining = MAX_LOGIN_ATTEMPTS - record.attempt_count
    return False, None, max(0, remaining)


def record_failed_attempt(email):
    """
    Record a failed login attempt.
    
    Args:
        email: User's email address
        
    Returns:
        Tuple of (is_now_locked, remaining_attempts)
    """
    email = email.lower()
    record = FailedLoginAttempt.get_by_email(email)
    
    if record:
        if record.locked_until and record.locked_until <= datetime.utcnow():
            db.session.delete(record)
            db.session.commit()
            record = None
    
    if record:
        record.attempt_count += 1
        record.last_attempt = datetime.utcnow()
        record.ip_address = request.remote_addr if request else None
        
        if record.attempt_count >= MAX_LOGIN_ATTEMPTS:
            record.locked_until = datetime.utcnow() + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
            db.session.commit()
            return True, 0
    else:
        record = FailedLoginAttempt(
            email=email,
            ip_address=request.remote_addr if request else None,
            attempt_count=1,
        )
        db.session.add(record)
    
    db.session.commit()
    remaining = MAX_LOGIN_ATTEMPTS - record.attempt_count
    return False, max(0, remaining)


def clear_failed_attempts(email):
    """
    Clear failed login attempts after successful login.
    
    Args:
        email: User's email address
    """
    record = FailedLoginAttempt.get_by_email(email)
    if record:
        db.session.delete(record)
        db.session.commit()


def get_lockout_remaining_time(email):
    """
    Get remaining lockout time in minutes.
    
    Args:
        email: User's email address
        
    Returns:
        Remaining minutes or 0 if not locked
    """
    record = FailedLoginAttempt.get_by_email(email)
    
    if not record or not record.locked_until:
        return 0
    
    if record.locked_until <= datetime.utcnow():
        return 0
    
    remaining = record.locked_until - datetime.utcnow()
    return max(1, int(remaining.total_seconds() / 60))


def unlock_account(email):
    """
    Manually unlock an account.
    
    Args:
        email: User's email address
        
    Returns:
        True if account was unlocked, False if not locked
    """
    record = FailedLoginAttempt.get_by_email(email)
    if record:
        db.session.delete(record)
        db.session.commit()
        return True
    return False
