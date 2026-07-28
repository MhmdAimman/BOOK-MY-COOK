from flask import Blueprint, jsonify
from app.models.location import City, Area

locations_bp = Blueprint("locations", __name__)


@locations_bp.route("/cities", methods=["GET"])
def get_cities():
    cities = City.query.order_by(City.name).all()
    return jsonify({"cities": [city.to_dict() for city in cities]}), 200


@locations_bp.route("/cities/<int:city_id>/areas", methods=["GET"])
def get_areas_by_city(city_id):
    city = City.query.get(city_id)

    if not city:
        return jsonify({"message": "City not found"}), 404

    areas = Area.query.filter_by(city_id=city_id).order_by(Area.name).all()

    return jsonify(
        {"city": city.to_dict(), "areas": [area.to_dict() for area in areas]}
    ), 200
