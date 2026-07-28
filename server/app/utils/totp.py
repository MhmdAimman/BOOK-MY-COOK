"""
Two-Factor Authentication (TOTP) for BOOKMYCOOK

This module provides Time-based One-Time Password (TOTP) implementation
for two-factor authentication using authenticator apps like Google Authenticator.

Features:
- Generate TOTP secrets
- Verify TOTP codes
- Generate backup codes
- QR code generation for authenticator apps
"""

import os
import io
import base64
import secrets
import pyotp
import qrcode
from datetime import datetime
from app import db

OTP_ISSUER = os.environ.get('OTP_ISSUER', 'BOOKMYCOOK')


class TwoFactorAuth(db.Model):
    """Model for storing 2FA configuration."""
    
    __tablename__ = 'two_factor_auth'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    secret = db.Column(db.String(32), nullable=False)
    backup_codes = db.Column(db.Text, nullable=True)
    is_enabled = db.Column(db.Boolean, default=False)
    verified_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('two_factor', uselist=False))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'is_enabled': self.is_enabled,
            'verified_at': self.verified_at.isoformat() if self.verified_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


def generate_secret():
    """
    Generate a new TOTP secret.
    
    Returns:
        Base32-encoded secret string
    """
    return pyotp.random_base32()


def get_totp(secret):
    """
    Get TOTP instance for a secret.
    
    Args:
        secret: Base32-encoded secret
        
    Returns:
        pyotp.TOTP instance
    """
    return pyotp.TOTP(secret)


def verify_code(secret, code, valid_window=1):
    """
    Verify a TOTP code.
    
    Args:
        secret: Base32-encoded secret
        code: 6-digit code from authenticator app
        valid_window: Number of time windows to accept (default: 1)
        
    Returns:
        True if code is valid
    """
    if not secret or not code:
        return False
    
    code = str(code).strip().replace(' ', '')
    
    if len(code) != 6 or not code.isdigit():
        return False
    
    totp = get_totp(secret)
    return totp.verify(code, valid_window=valid_window)


def generate_backup_codes(count=10):
    """
    Generate backup codes.
    
    Args:
        count: Number of backup codes to generate
        
    Returns:
        List of backup code strings
    """
    codes = []
    for _ in range(count):
        code = secrets.token_hex(4).upper()
        formatted = f"{code[:4]}-{code[4:]}"
        codes.append(formatted)
    return codes


def hash_backup_codes(codes):
    """
    Hash backup codes for storage.
    
    Args:
        codes: List of backup code strings
        
    Returns:
        JSON string of hashed codes
    """
    import json
    import bcrypt
    
    hashed = []
    for code in codes:
        code_bytes = code.replace('-', '').encode('utf-8')
        hashed.append(bcrypt.hashpw(code_bytes, bcrypt.gensalt()).decode('utf-8'))
    
    return json.dumps(hashed)


def verify_backup_code(hashed_codes_json, code):
    """
    Verify a backup code.
    
    Args:
        hashed_codes_json: JSON string of hashed codes
        code: Backup code to verify
        
    Returns:
        Tuple of (is_valid, remaining_codes_json)
    """
    import json
    import bcrypt
    
    if not hashed_codes_json or not code:
        return False, hashed_codes_json
    
    try:
        hashed_codes = json.loads(hashed_codes_json)
    except:
        return False, hashed_codes_json
    
    code_bytes = code.replace('-', '').encode('utf-8')
    
    for i, hashed in enumerate(hashed_codes):
        if bcrypt.checkpw(code_bytes, hashed.encode('utf-8')):
            remaining = hashed_codes[:i] + hashed_codes[i+1:]
            return True, json.dumps(remaining)
    
    return False, hashed_codes_json


def generate_qr_code(email, secret):
    """
    Generate QR code for authenticator app setup.
    
    Args:
        email: User's email address
        secret: TOTP secret
        
    Returns:
        Base64-encoded PNG image data URL
    """
    totp = get_totp(secret)
    provisioning_uri = totp.provisioning_uri(
        name=email,
        issuer_name=OTP_ISSUER
    )
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(provisioning_uri)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{img_base64}"


def setup_2fa(user_id):
    """
    Setup 2FA for a user.
    
    Args:
        user_id: User's ID
        
    Returns:
        Dictionary with secret, QR code, and backup codes
    """
    secret = generate_secret()
    backup_codes = generate_backup_codes()
    hashed_codes = hash_backup_codes(backup_codes)
    
    two_fa = TwoFactorAuth.query.filter_by(user_id=user_id).first()
    
    if two_fa:
        two_fa.secret = secret
        two_fa.backup_codes = hashed_codes
        two_fa.is_enabled = False
        two_fa.verified_at = None
    else:
        two_fa = TwoFactorAuth(
            user_id=user_id,
            secret=secret,
            backup_codes=hashed_codes,
            is_enabled=False,
        )
        db.session.add(two_fa)
    
    db.session.commit()
    
    user = two_fa.user
    
    return {
        'secret': secret,
        'qr_code': generate_qr_code(user.email, secret),
        'backup_codes': backup_codes,
    }


def enable_2fa(user_id, code):
    """
    Enable 2FA after verifying the setup code.
    
    Args:
        user_id: User's ID
        code: Verification code from authenticator app
        
    Returns:
        True if 2FA was enabled successfully
    """
    two_fa = TwoFactorAuth.query.filter_by(user_id=user_id).first()
    
    if not two_fa:
        return False
    
    if not verify_code(two_fa.secret, code):
        return False
    
    two_fa.is_enabled = True
    two_fa.verified_at = datetime.utcnow()
    db.session.commit()
    
    return True


def disable_2fa(user_id, code=None, backup_code=None):
    """
    Disable 2FA for a user.
    
    Args:
        user_id: User's ID
        code: TOTP code (optional)
        backup_code: Backup code (optional)
        
    Returns:
        True if 2FA was disabled
    """
    two_fa = TwoFactorAuth.query.filter_by(user_id=user_id).first()
    
    if not two_fa:
        return False
    
    if code and verify_code(two_fa.secret, code):
        pass
    elif backup_code:
        is_valid, _ = verify_backup_code(two_fa.backup_codes, backup_code)
        if not is_valid:
            return False
    else:
        return False
    
    db.session.delete(two_fa)
    db.session.commit()
    
    return True


def verify_2fa(user_id, code):
    """
    Verify 2FA code for login.
    
    Args:
        user_id: User's ID
        code: TOTP code or backup code
        
    Returns:
        True if verification successful
    """
    two_fa = TwoFactorAuth.query.filter_by(user_id=user_id).first()
    
    if not two_fa or not two_fa.is_enabled:
        return True
    
    if verify_code(two_fa.secret, code):
        return True
    
    is_valid, remaining_codes = verify_backup_code(two_fa.backup_codes, code)
    if is_valid:
        two_fa.backup_codes = remaining_codes
        db.session.commit()
        return True
    
    return False


def is_2fa_enabled(user_id):
    """Check if 2FA is enabled for a user."""
    two_fa = TwoFactorAuth.query.filter_by(user_id=user_id).first()
    return two_fa is not None and two_fa.is_enabled
