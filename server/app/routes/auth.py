from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models.user import User, Profile
from app.utils.rate_limiter import limiter, get_rate_limit
from app.utils.account_lockout import (
    is_account_locked,
    record_failed_attempt,
    clear_failed_attempts,
    get_lockout_remaining_time,
)
from app.utils.audit import (
    AuditEventType,
    log_auth_event,
    log_security_event,
)
from app.utils.validators import UserRegistrationSchema, UserLoginSchema, validate_request
from app.utils.password_policy import validate_password
from app.utils.session_manager import create_session, invalidate_session
import bcrypt
import os

auth_bp = Blueprint("auth", __name__)

SECURITY_ENABLED = os.environ.get('SECURITY_ENABLED', 'true').lower() == 'true'


@auth_bp.route("/register", methods=["POST"])
@limiter.limit(get_rate_limit("auth_register"))
def register():
    data = request.get_json()

    if not data:
        return jsonify({"message": "No data provided"}), 400

    if SECURITY_ENABLED:
        is_valid, result = validate_request(UserRegistrationSchema, data)
        if not is_valid:
            return jsonify({"message": "Validation error", "errors": result}), 400
        data = result

    email = data.get("email")
    password = data.get("password")
    full_name = data.get("full_name")
    phone = data.get("phone")
    role = data.get("role", "customer")

    if not all([email, password, full_name]):
        return jsonify({"message": "Email, password, and full name are required"}), 400

    if SECURITY_ENABLED:
        is_strong, password_errors = validate_password(password)
        if not is_strong:
            return jsonify({"message": "Password does not meet requirements", "errors": password_errors}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already registered"}), 400

    if phone and User.query.filter_by(phone=phone).first():
        return jsonify({"message": "Phone number already registered"}), 400

    valid_roles = ["customer", "chef", "caterer", "decorator"]
    if role not in valid_roles:
        return jsonify({"message": "Invalid role"}), 400

    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode(
        "utf-8"
    )

    user = User(
        email=email,
        password_hash=password_hash,
        full_name=full_name,
        phone=phone,
        role=role,
    )

    db.session.add(user)
    db.session.flush()

    profile = Profile(user_id=user.id)
    db.session.add(profile)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))

    if SECURITY_ENABLED:
        log_auth_event(
            AuditEventType.REGISTER,
            user_id=user.id,
            email=email,
            success=True,
            details={"role": role}
        )
        create_session(user.id, access_token)

    return jsonify(
        {
            "message": "User registered successfully",
            "token": access_token,
            "user": user.to_dict(),
        }
    ), 201


@auth_bp.route("/login", methods=["POST"])
@limiter.limit(get_rate_limit("auth_login"))
def login():
    data = request.get_json()

    if not data:
        return jsonify({"message": "No data provided"}), 400

    if SECURITY_ENABLED:
        is_valid, result = validate_request(UserLoginSchema, data)
        if not is_valid:
            return jsonify({"message": "Validation error", "errors": result}), 400
        data = result

    email = data.get("email")
    password = data.get("password")

    if not all([email, password]):
        return jsonify({"message": "Email and password are required"}), 400

    if SECURITY_ENABLED:
        is_locked, locked_until, remaining_attempts = is_account_locked(email)
        if is_locked:
            remaining_time = get_lockout_remaining_time(email)
            log_security_event(
                AuditEventType.ACCOUNT_LOCKED,
                details={"email": email, "remaining_minutes": remaining_time}
            )
            return jsonify({
                "message": f"Account is temporarily locked. Try again in {remaining_time} minutes.",
                "locked": True,
                "remaining_minutes": remaining_time
            }), 423

    user = User.query.filter_by(email=email).first()

    if not user or not bcrypt.checkpw(
        password.encode("utf-8"), user.password_hash.encode("utf-8")
    ):
        if SECURITY_ENABLED:
            is_now_locked, remaining = record_failed_attempt(email)
            log_auth_event(
                AuditEventType.LOGIN_FAILURE,
                email=email,
                success=False,
                details={"remaining_attempts": remaining}
            )
            if is_now_locked:
                return jsonify({
                    "message": "Account locked due to too many failed attempts. Try again in 15 minutes.",
                    "locked": True
                }), 423
            return jsonify({
                "message": f"Invalid email or password. {remaining} attempts remaining.",
                "remaining_attempts": remaining
            }), 401
        return jsonify({"message": "Invalid email or password"}), 401

    if not user.is_active:
        return jsonify({"message": "Account is deactivated"}), 403

    if SECURITY_ENABLED:
        from app.utils.totp import is_2fa_enabled
        if is_2fa_enabled(user.id):
            temp_token = create_access_token(identity=str(user.id))
            return jsonify({
                "message": "2FA required",
                "requires_2fa": True,
                "temp_token": temp_token,
                "user": {"id": user.id, "email": user.email}
            }), 200

    access_token = create_access_token(identity=str(user.id))

    if SECURITY_ENABLED:
        clear_failed_attempts(email)
        log_auth_event(
            AuditEventType.LOGIN_SUCCESS,
            user_id=user.id,
            email=email,
            success=True
        )
        create_session(user.id, access_token)

    return jsonify(
        {"message": "Login successful", "token": access_token, "user": user.to_dict()}
    ), 200


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    user_id = int(get_jwt_identity())

    if SECURITY_ENABLED and token:
        invalidate_session(token)
        log_auth_event(AuditEventType.LOGOUT, user_id=user_id, success=True)

    return jsonify({"message": "Logged out successfully"}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({"user": user.to_dict()}), 200


@auth_bp.route("/verify", methods=["POST"])
@jwt_required()
def verify():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    user.is_verified = True
    db.session.commit()

    return jsonify(
        {"message": "User verified successfully", "user": user.to_dict()}
    ), 200


@auth_bp.route("/change-password", methods=["POST"])
@jwt_required()
@limiter.limit(get_rate_limit("auth_password"))
def change_password():
    from app.utils.validators import PasswordChangeSchema

    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"message": "No data provided"}), 400

    if SECURITY_ENABLED:
        is_valid, result = validate_request(PasswordChangeSchema, data)
        if not is_valid:
            return jsonify({"message": "Validation error", "errors": result}), 400
        data = result

    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not bcrypt.checkpw(current_password.encode("utf-8"), user.password_hash.encode("utf-8")):
        return jsonify({"message": "Current password is incorrect"}), 401

    if SECURITY_ENABLED:
        is_strong, password_errors = validate_password(new_password)
        if not is_strong:
            return jsonify({"message": "Password does not meet requirements", "errors": password_errors}), 400

    password_hash = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    user.password_hash = password_hash
    db.session.commit()

    if SECURITY_ENABLED:
        log_auth_event(
            AuditEventType.PASSWORD_CHANGE,
            user_id=user_id,
            success=True
        )

    return jsonify({"message": "Password changed successfully"}), 200
