from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User, Profile
from app.models.location import City, Area

users_bp = Blueprint("users", __name__)


@users_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({"user": user.to_dict()}), 200


@users_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json()

    if "full_name" in data:
        user.full_name = data["full_name"]
    if "phone" in data:
        existing = User.query.filter(
            User.phone == data["phone"], User.id != user_id
        ).first()
        if existing:
            return jsonify({"message": "Phone number already in use"}), 400
        user.phone = data["phone"]

    if not user.profile:
        user.profile = Profile(user_id=user.id)

    profile = user.profile
    if "bio" in data:
        profile.bio = data["bio"]
    if "address" in data:
        profile.address = data["address"]
    if "profile_image" in data:
        profile.profile_image = data["profile_image"]
    if "city_id" in data:
        city = City.query.get(data["city_id"])
        if city:
            profile.city_id = city.id
    if "area_id" in data:
        area = Area.query.get(data["area_id"])
        if area:
            profile.area_id = area.id

    db.session.commit()

    return jsonify(
        {"message": "Profile updated successfully", "user": user.to_dict()}
    ), 200


@users_bp.route("/password", methods=["PUT"])
@jwt_required()
def update_password():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json()

    import bcrypt

    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not all([current_password, new_password]):
        return jsonify({"message": "Current and new password are required"}), 400

    if not bcrypt.checkpw(
        current_password.encode("utf-8"), user.password_hash.encode("utf-8")
    ):
        return jsonify({"message": "Current password is incorrect"}), 400

    if len(new_password) < 8:
        return jsonify({"message": "Password must be at least 8 characters"}), 400

    user.password_hash = bcrypt.hashpw(
        new_password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")
    db.session.commit()

    return jsonify({"message": "Password updated successfully"}), 200
