"""
Password Policy Enforcement for BOOKMYCOOK

This module enforces strong password policies to protect user accounts:
- Minimum length requirements
- Character complexity requirements
- Common password blacklist
- Password strength scoring
"""

import os
import re
from typing import Tuple, List

COMMON_PASSWORDS = {
    'password', 'password123', 'password1', '123456', '12345678', '123456789',
    'qwerty', 'abc123', 'monkey', 'letmein', 'dragon', 'master', 'admin',
    'login', 'welcome', 'password1234', 'iloveyou', 'sunshine', 'princess',
    'football', 'baseball', 'soccer', 'hockey', 'batman', 'superman',
    'trustno1', 'shadow', 'ashley', 'michael', 'jennifer', 'thomas',
    'charlie', 'robert', 'jordan', 'hunter', 'ranger', 'harley', 'daniel',
    'andrew', 'joshua', 'matthew', 'david', 'james', 'john', 'joseph',
    'bookmycook', 'bookmycook123', 'tamilnadu', 'chennai', 'india',
}


class PasswordPolicy:
    """Enforce password security policies."""
    
    def __init__(self):
        self.min_length = int(os.environ.get('PASSWORD_MIN_LENGTH', 8))
        self.require_uppercase = os.environ.get('PASSWORD_REQUIRE_UPPERCASE', 'true').lower() == 'true'
        self.require_lowercase = os.environ.get('PASSWORD_REQUIRE_LOWERCASE', 'true').lower() == 'true'
        self.require_numbers = os.environ.get('PASSWORD_REQUIRE_NUMBERS', 'true').lower() == 'true'
        self.require_special = os.environ.get('PASSWORD_REQUIRE_SPECIAL', 'true').lower() == 'true'
    
    def validate(self, password: str) -> Tuple[bool, List[str]]:
        """
        Validate password against all policy requirements.
        
        Args:
            password: Password string to validate
            
        Returns:
            Tuple of (is_valid, list of error messages)
        """
        errors = []
        
        if not password:
            return False, ['Password is required']
        
        if len(password) < self.min_length:
            errors.append(f'Password must be at least {self.min_length} characters long')
        
        if self.require_uppercase and not re.search(r'[A-Z]', password):
            errors.append('Password must contain at least one uppercase letter')
        
        if self.require_lowercase and not re.search(r'[a-z]', password):
            errors.append('Password must contain at least one lowercase letter')
        
        if self.require_numbers and not re.search(r'\d', password):
            errors.append('Password must contain at least one number')
        
        if self.require_special and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append('Password must contain at least one special character')
        
        if password.lower() in COMMON_PASSWORDS:
            errors.append('Password is too common. Please choose a stronger password')
        
        for common in COMMON_PASSWORDS:
            if common in password.lower() and len(common) >= 4:
                errors.append('Password contains a common pattern. Please choose a stronger password')
                break
        
        return len(errors) == 0, errors
    
    def get_strength_score(self, password: str) -> int:
        """
        Calculate password strength score (0-100).
        
        Args:
            password: Password string to evaluate
            
        Returns:
            Strength score from 0 (weak) to 100 (very strong)
        """
        if not password:
            return 0
        
        score = 0
        
        score += min(len(password) * 4, 40)
        
        if re.search(r'[A-Z]', password):
            score += 10
        if re.search(r'[a-z]', password):
            score += 10
        if re.search(r'\d', password):
            score += 10
        if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            score += 15
        
        if len(re.findall(r'[A-Z]', password)) > 1:
            score += 5
        if len(re.findall(r'\d', password)) > 1:
            score += 5
        if len(re.findall(r'[!@#$%^&*(),.?":{}|<>]', password)) > 1:
            score += 5
        
        if password.lower() in COMMON_PASSWORDS:
            score = max(0, score - 50)
        
        return min(score, 100)
    
    def get_strength_label(self, password: str) -> str:
        """Get human-readable strength label."""
        score = self.get_strength_score(password)
        if score < 30:
            return 'Very Weak'
        elif score < 50:
            return 'Weak'
        elif score < 70:
            return 'Fair'
        elif score < 90:
            return 'Strong'
        else:
            return 'Very Strong'


password_policy = PasswordPolicy()


def validate_password(password: str) -> Tuple[bool, List[str]]:
    """
    Validate password against policy.
    
    Args:
        password: Password to validate
        
    Returns:
        Tuple of (is_valid, error_messages)
    """
    return password_policy.validate(password)


def get_password_strength(password: str) -> dict:
    """
    Get password strength information.
    
    Args:
        password: Password to evaluate
        
    Returns:
        Dictionary with score and label
    """
    return {
        'score': password_policy.get_strength_score(password),
        'label': password_policy.get_strength_label(password),
    }
