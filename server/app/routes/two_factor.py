from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from app import db
from app.models.user import User
from app.utils.totp import (
    setup_2fa,
    enable_2fa,
    disable_2fa,
    verify_2fa,
    is_2fa_enabled,
)
from app.utils.rate_limiter import limiter, get_rate_limit
from app.utils.audit import AuditEventType, log_auth_event
from app.utils.session_manager import create_session

two_factor_bp = Blueprint("two_factor", __name__)


@two_factor_bp.route("/setup", methods=["POST"])
@jwt_required()
def setup():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    if is_2fa_enabled(user_id):
        return jsonify({"message": "2FA is already enabled"}), 400

    result = setup_2fa(user_id)

    log_auth_event(
        AuditEventType.TWO_FA_ENABLED,
        user_id=user_id,
        success=True
    )

    return jsonify({
        "message": "2FA setup initiated. Verify with the code from your authenticator app.",
        "secret": result["secret"],
        "qr_code": result["qr_code"],
        "backup_codes": result["backup_codes"]
    }), 200


@two_factor_bp.route("/enable", methods=["POST"])
@jwt_required()
def enable():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"message": "No data provided"}), 400

    code = data.get("code")
    if not code:
        return jsonify({"message": "Verification code is required"}), 400

    if enable_2fa(user_id, code):
        log_auth_event(
            AuditEventType.TWO_FA_VERIFIED,
            user_id=user_id,
            success=True
        )
        return jsonify({"message": "2FA enabled successfully"}), 200

    log_auth_event(
        AuditEventType.TWO_FA_FAILED,
        user_id=user_id,
        success=False
    )
    return jsonify({"message": "Invalid verification code"}), 400


@two_factor_bp.route("/disable", methods=["POST"])
@jwt_required()
def disable():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"message": "No data provided"}), 400

    code = data.get("code")
    backup_code = data.get("backup_code")

    if not code and not backup_code:
        return jsonify({"message": "Verification code or backup code is required"}), 400

    if disable_2fa(user_id, code=code, backup_code=backup_code):
        log_auth_event(
            AuditEventType.TWO_FA_DISABLED,
            user_id=user_id,
            success=True
        )
        return jsonify({"message": "2FA disabled successfully"}), 200

    log_auth_event(
        AuditEventType.TWO_FA_FAILED,
        user_id=user_id,
        success=False,
        details={"action": "disable"}
    )
    return jsonify({"message": "Invalid verification code or backup code"}), 400


@two_factor_bp.route("/verify", methods=["POST"])
@jwt_required()
@limiter.limit(get_rate_limit("auth_login"))
def verify():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"message": "No data provided"}), 400

    code = data.get("code")
    if not code:
        return jsonify({"message": "Verification code is required"}), 400

    if verify_2fa(user_id, code):
        access_token = create_access_token(identity=str(user.id))
        create_session(user.id, access_token)

        log_auth_event(
            AuditEventType.TWO_FA_VERIFIED,
            user_id=user_id,
            success=True
        )

        return jsonify({
            "message": "2FA verification successful",
            "token": access_token,
            "user": user.to_dict()
        }), 200

    log_auth_event(
        AuditEventType.TWO_FA_FAILED,
        user_id=user_id,
        success=False
    )
    return jsonify({"message": "Invalid verification code"}), 401


@two_factor_bp.route("/status", methods=["GET"])
@jwt_required()
def status():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({
        "is_2fa_enabled": is_2fa_enabled(user_id)
    }), 200


@two_factor_bp.route("/regenerate-backup-codes", methods=["POST"])
@jwt_required()
def regenerate_backup_codes():
    from app.utils.totp import generate_backup_codes, hash_backup_codes, TwoFactorAuth

    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    if not is_2fa_enabled(user_id):
        return jsonify({"message": "2FA is not enabled"}), 400

    data = request.get_json()
    if not data:
        return jsonify({"message": "No data provided"}), 400

    code = data.get("code")
    if not code or not verify_2fa(user_id, code):
        return jsonify({"message": "Invalid verification code"}), 401

    backup_codes = generate_backup_codes()
    hashed_codes = hash_backup_codes(backup_codes)

    two_fa = TwoFactorAuth.query.filter_by(user_id=user_id).first()
    two_fa.backup_codes = hashed_codes
    db.session.commit()

    return jsonify({
        "message": "Backup codes regenerated successfully",
        "backup_codes": backup_codes
    }), 200
