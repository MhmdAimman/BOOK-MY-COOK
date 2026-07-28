from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.service import Service
from app.models.signature_dish import SignatureDish

dishes_bp = Blueprint("dishes", __name__)


@dishes_bp.route("/<int:service_id>", methods=["GET"])
def get_dishes(service_id):
    dishes = (
        SignatureDish.query.filter_by(service_id=service_id)
        .order_by(SignatureDish.display_order)
        .all()
    )
    return jsonify({"dishes": [d.to_dict() for d in dishes]}), 200


@dishes_bp.route("/<int:service_id>", methods=["POST"])
@jwt_required()
def add_dish(service_id):
    user_id = int(get_jwt_identity())
    service = Service.query.get(service_id)

    if not service:
        return jsonify({"message": "Service not found"}), 404

    if service.user_id != user_id:
        return jsonify({"message": "Access denied"}), 403

    existing_count = SignatureDish.query.filter_by(service_id=service_id).count()
    if existing_count >= 3:
        return jsonify({"message": "Maximum 3 signature dishes allowed"}), 400

    data = request.get_json()

    dish = SignatureDish(
        service_id=service_id,
        name=data.get("name"),
        description=data.get("description"),
        image_url=data.get("image_url"),
        cuisine_type=data.get("cuisine_type"),
        is_veg=data.get("is_veg", True),
        display_order=existing_count + 1,
    )

    db.session.add(dish)
    db.session.commit()

    return jsonify({"message": "Dish added successfully", "dish": dish.to_dict()}), 201


@dishes_bp.route("/<int:dish_id>", methods=["PUT"])
@jwt_required()
def update_dish(dish_id):
    user_id = int(get_jwt_identity())
    dish = SignatureDish.query.get(dish_id)

    if not dish:
        return jsonify({"message": "Dish not found"}), 404

    if dish.service.user_id != user_id:
        return jsonify({"message": "Access denied"}), 403

    data = request.get_json()

    if "name" in data:
        dish.name = data["name"]
    if "description" in data:
        dish.description = data["description"]
    if "image_url" in data:
        dish.image_url = data["image_url"]
    if "cuisine_type" in data:
        dish.cuisine_type = data["cuisine_type"]
    if "is_veg" in data:
        dish.is_veg = data["is_veg"]

    db.session.commit()

    return jsonify(
        {"message": "Dish updated successfully", "dish": dish.to_dict()}
    ), 200


@dishes_bp.route("/<int:dish_id>", methods=["DELETE"])
@jwt_required()
def delete_dish(dish_id):
    user_id = int(get_jwt_identity())
    dish = SignatureDish.query.get(dish_id)

    if not dish:
        return jsonify({"message": "Dish not found"}), 404

    if dish.service.user_id != user_id:
        return jsonify({"message": "Access denied"}), 403

    db.session.delete(dish)
    db.session.commit()

    return jsonify({"message": "Dish deleted successfully"}), 200
