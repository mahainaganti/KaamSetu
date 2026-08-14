from flask import Blueprint, jsonify, request

from services.rating_service import (
    get_all_ratings,
    get_rating,
    create_rating,
    update_rating,
    delete_rating
)

from validators import validate_rating

ratings_bp = Blueprint("ratings", __name__)


@ratings_bp.route("/ratings", methods=["GET"])
def ratings():

    return jsonify(get_all_ratings())


@ratings_bp.route("/ratings/<int:rating_id>", methods=["GET"])
def rating(rating_id):

    data = get_rating(rating_id)

    if data is None:
        return jsonify({"message": "Rating not found"}), 404

    return jsonify(data)


@ratings_bp.route("/ratings", methods=["POST"])
def add_rating():

    data = request.get_json()

    valid, message = validate_rating(data)

    if not valid:
        return jsonify({"error": message}), 400

    rating = create_rating(data)

    return jsonify({
        "message": "Rating created successfully",
        "rating": rating
    }), 201


@ratings_bp.route("/ratings/<int:rating_id>", methods=["PUT"])
def edit_rating(rating_id):

    data = request.get_json()

    valid, message = validate_rating(data)

    if not valid:
        return jsonify({"error": message}), 400

    updated = update_rating(rating_id, data)

    if updated == 0:
        return jsonify({"message": "Rating not found"}), 404

    return jsonify({"message": "Rating updated successfully"})


@ratings_bp.route("/ratings/<int:rating_id>", methods=["DELETE"])
def remove_rating(rating_id):

    deleted = delete_rating(rating_id)

    if deleted == 0:
        return jsonify({"message": "Rating not found"}), 404

    return jsonify({"message": "Rating deleted successfully"})
