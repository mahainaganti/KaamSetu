from flask import Blueprint, jsonify
from services.dashboard_service import get_dashboard_stats

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/dashboard/stats", methods=["GET"])
def dashboard_stats():
    try:
        data = get_dashboard_stats()
        return jsonify(data)
    except Exception as e:
        return jsonify({
            "error": "Failed to fetch dashboard statistics",
            "details": str(e)
        }), 500
