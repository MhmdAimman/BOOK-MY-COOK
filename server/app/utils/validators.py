"""
Input Validation Schemas for BOOKMYCOOK

This module provides comprehensive input validation using Marshmallow schemas.
All user inputs are validated and sanitized before processing to prevent:
- SQL Injection attacks
- Cross-Site Scripting (XSS)
- Invalid data processing
- Data integrity issues
"""

import re
import html
from marshmallow import Schema, fields, validate, validates, validates_schema, ValidationError
from email_validator import validate_email, EmailNotValidError


def sanitize_string(value):
    """Sanitize string input to prevent XSS attacks."""
    if not value:
        return value
    if isinstance(value, str):
        return html.escape(value.strip())
    return value


def sanitize_html(value):
    """Remove HTML tags and sanitize input."""
    if not value:
        return value
    if isinstance(value, str):
        clean = re.sub(r'<[^>]+>', '', value)
        return html.escape(clean.strip())
    return value


def validate_phone(phone):
    """Validate Indian phone number format."""
    if not phone:
        return None
    clean_phone = re.sub(r'[\s\-\(\)]', '', phone)
    if not re.match(r'^(\+91|91)?[6-9]\d{9}$', clean_phone):
        raise ValidationError('Invalid Indian phone number format')
    return clean_phone


def validate_email_address(email):
    """Validate email address format."""
    if not email:
        raise ValidationError('Email is required')
    try:
        validated = validate_email(email)
        return validated.email.lower()
    except EmailNotValidError as e:
        raise ValidationError(str(e))


class UserRegistrationSchema(Schema):
    """Schema for user registration validation."""
    
    email = fields.Email(required=True, validate=validate.Length(max=255))
    password = fields.Str(required=True, validate=validate.Length(min=8, max=128))
    full_name = fields.Str(required=True, validate=validate.Length(min=2, max=255))
    phone = fields.Str(validate=validate.Length(max=15))
    role = fields.Str(validate=validate.OneOf(['customer', 'chef', 'caterer', 'decorator']))
    
    @validates('full_name')
    def validate_full_name(self, value, **kwargs):
        if not re.match(r'^[a-zA-Z\s]+$', value):
            raise ValidationError('Name can only contain letters and spaces')
        return sanitize_string(value)
    
    @validates('phone')
    def validate_phone_field(self, value, **kwargs):
        if value:
            return validate_phone(value)
        return value


class UserLoginSchema(Schema):
    """Schema for user login validation."""
    
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=1))


class ProfileUpdateSchema(Schema):
    """Schema for profile update validation."""
    
    full_name = fields.Str(validate=validate.Length(min=2, max=255))
    phone = fields.Str(validate=validate.Length(max=15))
    bio = fields.Str(validate=validate.Length(max=1000))
    address = fields.Str(validate=validate.Length(max=500))
    city_id = fields.Int()
    area_id = fields.Int()
    profile_image = fields.Str(validate=validate.Length(max=500))
    
    @validates('full_name')
    def validate_full_name(self, value, **kwargs):
        if value and not re.match(r'^[a-zA-Z\s]+$', value):
            raise ValidationError('Name can only contain letters and spaces')
        return sanitize_string(value) if value else value
    
    @validates('bio')
    def validate_bio(self, value, **kwargs):
        return sanitize_html(value) if value else value


class ServiceCreateSchema(Schema):
    """Schema for service creation validation."""
    
    title = fields.Str(required=True, validate=validate.Length(min=3, max=255))
    description = fields.Str(required=True, validate=validate.Length(min=10, max=2000))
    service_type = fields.Str(required=True, validate=validate.OneOf(['chef', 'caterer', 'decorator']))
    experience_years = fields.Int(validate=validate.Range(min=0, max=50))
    price_per_event = fields.Float(required=True, validate=validate.Range(min=100, max=1000000))
    min_guests = fields.Int(validate=validate.Range(min=1, max=10000))
    max_guests = fields.Int(validate=validate.Range(min=1, max=10000))
    city_id = fields.Int(required=True)
    area_id = fields.Int()
    cuisine_types = fields.List(fields.Str())
    event_types = fields.List(fields.Str())
    serves_veg = fields.Bool()
    serves_non_veg = fields.Bool()
    
    @validates('title')
    def validate_title(self, value, **kwargs):
        return sanitize_string(value)
    
    @validates('description')
    def validate_description(self, value, **kwargs):
        return sanitize_html(value)
    
    @validates_schema
    def validate_guests(self, data, **kwargs):
        if 'min_guests' in data and 'max_guests' in data:
            if data['min_guests'] > data['max_guests']:
                raise ValidationError('Minimum guests cannot exceed maximum guests')


class BookingCreateSchema(Schema):
    """Schema for booking creation validation."""
    
    event_date = fields.Date(required=True)
    event_time = fields.Str(required=True)
    event_type = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    number_of_guests = fields.Int(required=True, validate=validate.Range(min=1, max=10000))
    event_address = fields.Str(required=True, validate=validate.Length(min=5, max=500))
    city_id = fields.Int()
    area_id = fields.Int()
    special_requirements = fields.Str(validate=validate.Length(max=1000))
    
    @validates('event_type')
    def validate_event_type(self, value, **kwargs):
        return sanitize_string(value)
    
    @validates('event_address')
    def validate_address(self, value, **kwargs):
        return sanitize_string(value)
    
    @validates('special_requirements')
    def validate_requirements(self, value, **kwargs):
        return sanitize_html(value) if value else value


class ReviewCreateSchema(Schema):
    """Schema for review creation validation."""
    
    rating = fields.Int(required=True, validate=validate.Range(min=1, max=5))
    comment = fields.Str(validate=validate.Length(min=10, max=1000))
    
    @validates('comment')
    def validate_comment(self, value, **kwargs):
        return sanitize_html(value) if value else value


class MessageCreateSchema(Schema):
    """Schema for message creation validation."""
    
    content = fields.Str(required=True, validate=validate.Length(min=1, max=5000))
    
    @validates('content')
    def validate_content(self, value, **kwargs):
        return sanitize_html(value)


class PasswordChangeSchema(Schema):
    """Schema for password change validation."""
    
    current_password = fields.Str(required=True)
    new_password = fields.Str(required=True, validate=validate.Length(min=8, max=128))
    confirm_password = fields.Str(required=True)
    
    @validates_schema
    def validate_passwords(self, data, **kwargs):
        if data.get('new_password') != data.get('confirm_password'):
            raise ValidationError('New passwords do not match')


class ContactFormSchema(Schema):
    """Schema for contact form validation."""
    
    name = fields.Str(required=True, validate=validate.Length(min=2, max=255))
    email = fields.Email(required=True)
    phone = fields.Str(validate=validate.Length(max=15))
    subject = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    message = fields.Str(required=True, validate=validate.Length(min=10, max=2000))
    
    @validates('name')
    def validate_name(self, value, **kwargs):
        return sanitize_string(value)
    
    @validates('message')
    def validate_message(self, value, **kwargs):
        return sanitize_html(value)


def validate_request(schema_class, data):
    """
    Validate request data against a schema.
    
    Args:
        schema_class: Marshmallow schema class
        data: Dictionary of request data
        
    Returns:
        tuple: (is_valid, validated_data_or_errors)
    """
    schema = schema_class()
    try:
        validated = schema.load(data)
        return True, validated
    except ValidationError as e:
        return False, e.messages
