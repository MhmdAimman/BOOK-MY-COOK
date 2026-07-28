"""
Session Management for BOOKMYCOOK

This module provides advanced session management:
- Track active sessions per user
- Detect multiple sessions
- Invalidate sessions
- Device fingerprinting
"""

import os
import hashlib
from datetime import datetime, timedelta
from flask import request
from app import db

SESSION_LIFETIME = int(os.environ.get('SESSION_LIFETIME', 86400))
MAX_CONCURRENT_SESSIONS = int(os.environ.get('MAX_CONCURRENT_SESSIONS', 5))


class UserSession(db.Model):
    """Track user sessions."""
    
    __tablename__ = 'user_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    session_token = db.Column(db.String(64), nullable=False, unique=True)
    device_fingerprint = db.Column(db.String(64), nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_activity = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    
    user = db.relationship('User', backref=db.backref('sessions', lazy='dynamic'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_activity': self.last_activity.isoformat() if self.last_activity else None,
            'is_active': self.is_active,
            'is_current': False,
        }


def generate_device_fingerprint():
    """
    Generate a device fingerprint from request headers.
    
    Returns:
        Hash string identifying the device
    """
    components = []
    
    if request:
        components.append(request.headers.get('User-Agent', ''))
        components.append(request.headers.get('Accept-Language', ''))
        components.append(request.headers.get('Accept-Encoding', ''))
        components.append(str(request.accept_languages))
    
    fingerprint = '|'.join(components)
    return hashlib.sha256(fingerprint.encode()).hexdigest()


def create_session(user_id, session_token):
    """
    Create a new session record.
    
    Args:
        user_id: User's ID
        session_token: JWT token or session identifier
        
    Returns:
        Created UserSession instance
    """
    enforce_session_limit(user_id)
    
    token_hash = hashlib.sha256(session_token.encode()).hexdigest()
    fingerprint = generate_device_fingerprint()
    
    ip_address = None
    user_agent = None
    
    if request:
        if request.headers.get('X-Forwarded-For'):
            ip_address = request.headers.get('X-Forwarded-For').split(',')[0].strip()
        else:
            ip_address = request.remote_addr
        user_agent = request.headers.get('User-Agent', '')[:500]
    
    session = UserSession(
        user_id=user_id,
        session_token=token_hash,
        device_fingerprint=fingerprint,
        ip_address=ip_address,
        user_agent=user_agent,
        expires_at=datetime.utcnow() + timedelta(seconds=SESSION_LIFETIME),
    )
    
    db.session.add(session)
    db.session.commit()
    
    return session


def get_active_sessions(user_id):
    """
    Get all active sessions for a user.
    
    Args:
        user_id: User's ID
        
    Returns:
        List of active UserSession instances
    """
    return UserSession.query.filter_by(
        user_id=user_id,
        is_active=True
    ).filter(
        UserSession.expires_at > datetime.utcnow()
    ).order_by(UserSession.last_activity.desc()).all()


def enforce_session_limit(user_id):
    """
    Enforce maximum concurrent sessions limit.
    
    Invalidates oldest sessions if limit is exceeded.
    
    Args:
        user_id: User's ID
    """
    active_sessions = get_active_sessions(user_id)
    
    while len(active_sessions) >= MAX_CONCURRENT_SESSIONS:
        oldest = active_sessions.pop(0)
        oldest.is_active = False
        db.session.commit()


def invalidate_session(session_token):
    """
    Invalidate a specific session.
    
    Args:
        session_token: Session token to invalidate
        
    Returns:
        True if session was found and invalidated
    """
    token_hash = hashlib.sha256(session_token.encode()).hexdigest()
    
    session = UserSession.query.filter_by(
        session_token=token_hash,
        is_active=True
    ).first()
    
    if session:
        session.is_active = False
        db.session.commit()
        return True
    
    return False


def invalidate_all_sessions(user_id, except_token=None):
    """
    Invalidate all sessions for a user except the current one.
    
    Args:
        user_id: User's ID
        except_token: Current session token to keep active
        
    Returns:
        Number of sessions invalidated
    """
    query = UserSession.query.filter_by(
        user_id=user_id,
        is_active=True
    )
    
    if except_token:
        token_hash = hashlib.sha256(except_token.encode()).hexdigest()
        query = query.filter(UserSession.session_token != token_hash)
    
    count = query.update({'is_active': False})
    db.session.commit()
    
    return count


def update_session_activity(session_token):
    """
    Update last activity timestamp for a session.
    
    Args:
        session_token: Session token to update
    """
    token_hash = hashlib.sha256(session_token.encode()).hexdigest()
    
    UserSession.query.filter_by(
        session_token=token_hash,
        is_active=True
    ).update({
        'last_activity': datetime.utcnow(),
        'expires_at': datetime.utcnow() + timedelta(seconds=SESSION_LIFETIME)
    })
    
    db.session.commit()


def cleanup_expired_sessions():
    """
    Remove expired sessions from database.
    
    Returns:
        Number of sessions cleaned up
    """
    count = UserSession.query.filter(
        UserSession.expires_at < datetime.utcnow()
    ).delete()
    
    db.session.commit()
    return count


def detect_multiple_sessions(user_id, current_token):
    """
    Detect if user has multiple active sessions from different devices.
    
    Args:
        user_id: User's ID
        current_token: Current session token
        
    Returns:
        Dictionary with session information
    """
    sessions = get_active_sessions(user_id)
    current_hash = hashlib.sha256(current_token.encode()).hexdigest()
    
    current_session = None
    other_sessions = []
    
    for session in sessions:
        if session.session_token == current_hash:
            current_session = session
        else:
            other_sessions.append(session)
    
    return {
        'current_session': current_session,
        'other_sessions': other_sessions,
        'total_sessions': len(sessions),
        'has_multiple': len(sessions) > 1,
        'different_devices': len(set(s.device_fingerprint for s in sessions)) > 1,
    }
