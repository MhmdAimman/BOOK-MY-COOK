"""
Data Encryption Utilities for BOOKMYCOOK

This module provides encryption for sensitive data at rest using:
- AES-256 symmetric encryption via Fernet
- Secure key management
- Field-level encryption for sensitive data

Usage:
    from app.utils.encryption import encrypt_field, decrypt_field
    
    encrypted = encrypt_field("sensitive_data")
    decrypted = decrypt_field(encrypted)
"""

import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

ENCRYPTION_KEY = os.environ.get('ENCRYPTION_KEY')

_fernet_instance = None


def get_fernet():
    """
    Get or create Fernet instance for encryption.
    
    Returns:
        Fernet instance for encryption/decryption
    """
    global _fernet_instance
    
    if _fernet_instance:
        return _fernet_instance
    
    if not ENCRYPTION_KEY:
        raise RuntimeError(
            "ENCRYPTION_KEY environment variable is required for encryption. "
            "Generate one with: python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\""
        )
    
    try:
        key = ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY
        _fernet_instance = Fernet(key)
        return _fernet_instance
    except Exception as e:
        raise RuntimeError(f"Invalid ENCRYPTION_KEY: {e}")


def generate_encryption_key():
    """
    Generate a new Fernet encryption key.
    
    Returns:
        Base64-encoded encryption key string
    """
    return Fernet.generate_key().decode()


def encrypt_field(plaintext):
    """
    Encrypt a field value.
    
    Args:
        plaintext: String value to encrypt
        
    Returns:
        Encrypted string (base64-encoded)
    """
    if not plaintext:
        return None
    
    if isinstance(plaintext, str):
        plaintext = plaintext.encode('utf-8')
    
    fernet = get_fernet()
    encrypted = fernet.encrypt(plaintext)
    return encrypted.decode('utf-8')


def decrypt_field(ciphertext):
    """
    Decrypt a field value.
    
    Args:
        ciphertext: Encrypted string (base64-encoded)
        
    Returns:
        Decrypted string
    """
    if not ciphertext:
        return None
    
    if isinstance(ciphertext, str):
        ciphertext = ciphertext.encode('utf-8')
    
    fernet = get_fernet()
    decrypted = fernet.decrypt(ciphertext)
    return decrypted.decode('utf-8')


def encrypt_dict(data, fields_to_encrypt):
    """
    Encrypt specific fields in a dictionary.
    
    Args:
        data: Dictionary containing data
        fields_to_encrypt: List of field names to encrypt
        
    Returns:
        Dictionary with specified fields encrypted
    """
    result = data.copy()
    for field in fields_to_encrypt:
        if field in result and result[field]:
            result[field] = encrypt_field(result[field])
    return result


def decrypt_dict(data, fields_to_decrypt):
    """
    Decrypt specific fields in a dictionary.
    
    Args:
        data: Dictionary containing encrypted data
        fields_to_decrypt: List of field names to decrypt
        
    Returns:
        Dictionary with specified fields decrypted
    """
    result = data.copy()
    for field in fields_to_decrypt:
        if field in result and result[field]:
            result[field] = decrypt_field(result[field])
    return result


class EncryptedField:
    """
    Descriptor for encrypted model fields.
    
    Usage in SQLAlchemy model:
        phone_encrypted = db.Column(db.String(500))
        phone = EncryptedField('phone_encrypted')
    """
    
    def __init__(self, encrypted_column):
        self.encrypted_column = encrypted_column
    
    def __get__(self, instance, owner):
        if instance is None:
            return self
        encrypted_value = getattr(instance, self.encrypted_column)
        return decrypt_field(encrypted_value) if encrypted_value else None
    
    def __set__(self, instance, value):
        encrypted_value = encrypt_field(value) if value else None
        setattr(instance, self.encrypted_column, encrypted_value)


SENSITIVE_FIELDS = {
    'payment': ['card_number', 'cvv', 'card_holder_name'],
    'user': ['phone', 'address'],
    'booking': ['event_address', 'special_requirements'],
}


def encrypt_sensitive_data(resource_type, data):
    """
    Encrypt all sensitive fields for a resource type.
    
    Args:
        resource_type: Type of resource ('payment', 'user', 'booking')
        data: Dictionary of data
        
    Returns:
        Data with sensitive fields encrypted
    """
    fields = SENSITIVE_FIELDS.get(resource_type, [])
    return encrypt_dict(data, fields)


def decrypt_sensitive_data(resource_type, data):
    """
    Decrypt all sensitive fields for a resource type.
    
    Args:
        resource_type: Type of resource ('payment', 'user', 'booking')
        data: Dictionary of data with encrypted fields
        
    Returns:
        Data with sensitive fields decrypted
    """
    fields = SENSITIVE_FIELDS.get(resource_type, [])
    return decrypt_dict(data, fields)
