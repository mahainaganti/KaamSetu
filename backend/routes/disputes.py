from flask import Blueprint, jsonify, request

from services.dispute_service import (
    get_all_disputes,
    get_dispute
)

disputes_bp = Blueprint("disputes", __name__)


@disputes_bp.route("/disputes", methods=["GET"])
def disputes():
    return jsonify(get_all_disputes())


@disputes_bp.route("/disputes/<int:dispute_id>", methods=["GET"])
def dispute(dispute_id):
    data = get_dispute(dispute_id)

    if data is None:
        return jsonify({"message": "Dispute not found"}), 404

    return jsonify(data)
