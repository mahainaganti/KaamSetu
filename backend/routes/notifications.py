from flask import Blueprint, jsonify, request

from services.notification_service import (
    get_all_notifications,
    get_notification
)

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.route("/notifications", methods=["GET"])
def notifications():
    return jsonify(get_all_notifications())


@notifications_bp.route("/notifications/<int:notification_id>", methods=["GET"])
def notification(notification_id):
    data = get_notification(notification_id)

    if data is None:
        return jsonify({"message": "Notification not found"}), 404

    return jsonify(data)
