"""
Data Loss Prevention (DLP) for BOOKMYCOOK

This module provides data loss prevention features:
- Detect and block sensitive data in user inputs
- Mask sensitive information in logs
- Prevent credit card and phone number leaks
"""

import re
from typing import Tuple, List

SENSITIVE_PATTERNS = {
    'credit_card': {
        'pattern': r'\b(?:\d[ -]*?){13,16}\b',
        'description': 'Credit card number detected',
        'mask': '****-****-****-XXXX',
    },
    'cvv': {
        'pattern': r'\b(?:cvv|cvc|security\s*code)[\s:]*\d{3,4}\b',
        'description': 'CVV/CVC detected',
        'mask': '***',
    },
    'indian_phone': {
        'pattern': r'\b(?:\+91|91)?[ -]?\d{3}[ -]?\d{3}[ -]?\d{4}\b',
        'description': 'Phone number detected',
        'mask': '+91 XXXXX XXXXX',
    },
    'email': {
        'pattern': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        'description': 'Email address detected',
        'mask': '****@****.***',
    },
    'aadhaar': {
        'pattern': r'\b\d{4}[ -]?\d{4}[ -]?\d{4}\b',
        'description': 'Aadhaar number detected',
        'mask': 'XXXX-XXXX-XXXX',
    },
    'pan': {
        'pattern': r'\b[A-Z]{5}\d{4}[A-Z]\b',
        'description': 'PAN number detected',
        'mask': 'XXXXXXXXXXX',
    },
}

BLOCKED_PATTERNS = [
    r'\b(?:cvv|cvc|security\s*code)\b',
    r'\b(?:password|passwd|pwd)\s*[=:]\s*\S+',
]


def detect_sensitive_data(text: str) -> Tuple[bool, List[dict]]:
    """
    Detect sensitive data in text.
    
    Args:
        text: Text to analyze
        
    Returns:
        Tuple of (has_sensitive, list of detected items)
    """
    if not text:
        return False, []
    
    detected = []
    
    for data_type, config in SENSITIVE_PATTERNS.items():
        matches = re.findall(config['pattern'], text, re.IGNORECASE)
        if matches:
            detected.append({
                'type': data_type,
                'description': config['description'],
                'count': len(matches),
                'mask': config['mask'],
            })
    
    return len(detected) > 0, detected


def mask_sensitive_data(text: str) -> str:
    """
    Mask sensitive data in text.
    
    Args:
        text: Text to mask
        
    Returns:
        Text with sensitive data masked
    """
    if not text:
        return text
    
    masked_text = text
    
    for data_type, config in SENSITIVE_PATTERNS.items():
        masked_text = re.sub(
            config['pattern'],
            config['mask'],
            masked_text,
            flags=re.IGNORECASE
        )
    
    return masked_text


def contains_blocked_content(text: str) -> Tuple[bool, str]:
    """
    Check if text contains blocked content.
    
    Args:
        text: Text to check
        
    Returns:
        Tuple of (is_blocked, reason)
    """
    if not text:
        return False, None
    
    for pattern in BLOCKED_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return True, f"Content matches blocked pattern: {pattern}"
    
    return False, None


def validate_message_content(message: str) -> Tuple[bool, str]:
    """
    Validate message content for DLP compliance.
    
    Args:
        message: Message to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not message:
        return True, None
    
    is_blocked, reason = contains_blocked_content(message)
    if is_blocked:
        return False, f"Message contains blocked content: {reason}"
    
    has_sensitive, detected = detect_sensitive_data(message)
    if has_sensitive:
        types = [d['type'] for d in detected]
        return False, f"Message contains sensitive data: {', '.join(types)}"
    
    return True, None


def sanitize_for_logging(data: dict) -> dict:
    """
    Sanitize data for safe logging.
    
    Args:
        data: Dictionary to sanitize
        
    Returns:
        Sanitized dictionary safe for logging
    """
    if not data:
        return data
    
    sanitized = {}
    
    for key, value in data.items():
        if isinstance(value, str):
            sanitized[key] = mask_sensitive_data(value)
        elif isinstance(value, dict):
            sanitized[key] = sanitize_for_logging(value)
        elif isinstance(value, list):
            sanitized[key] = [
                sanitize_for_logging(item) if isinstance(item, dict)
                else mask_sensitive_data(item) if isinstance(item, str)
                else item
                for item in value
            ]
        else:
            sanitized[key] = value
    
    return sanitized


def check_upload_content(content: str, filename: str = None) -> Tuple[bool, List[str]]:
    """
    Check uploaded content for sensitive data.
    
    Args:
        content: Content to check
        filename: Optional filename
        
    Returns:
        Tuple of (is_safe, list of warnings)
    """
    warnings = []
    
    has_sensitive, detected = detect_sensitive_data(content)
    
    if has_sensitive:
        for item in detected:
            warnings.append(f"Detected {item['type']}: {item['description']}")
    
    if filename:
        has_sensitive_name, name_detected = detect_sensitive_data(filename)
        if has_sensitive_name:
            warnings.append(f"Filename contains sensitive data: {', '.join(d['type'] for d in name_detected)}")
    
    return len(warnings) == 0, warnings


class DLPFilter:
    """
    DLP Filter for real-time content filtering.
    """
    
    def __init__(self, strict_mode=False):
        self.strict_mode = strict_mode
    
    def filter(self, text: str) -> dict:
        """
        Filter text and return result.
        
        Args:
            text: Text to filter
            
        Returns:
            Dictionary with filter results
        """
        is_valid, error = validate_message_content(text)
        has_sensitive, detected = detect_sensitive_data(text)
        
        return {
            'is_valid': is_valid,
            'error': error,
            'has_sensitive_data': has_sensitive,
            'detected_types': [d['type'] for d in detected] if detected else [],
            'masked_content': mask_sensitive_data(text) if has_sensitive else text,
            'should_block': not is_valid and self.strict_mode,
        }
