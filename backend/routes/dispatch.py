from flask import Blueprint, jsonify, request

from config import Config
from services import dispatch_service
from services.dispatch_service import OfferExpired

dispatch_bp = Blueprint("dispatch", __name__)


@dispatch_bp.route("/worker-status/<int:worker_id>/duty", methods=["POST"])
def toggle_duty(worker_id):
    data = request.get_json() or {}
    duty_status = data.get("duty_status")
    if duty_status not in ("online", "offline"):
        return jsonify({"error": "duty_status must be 'online' or 'offline'"}), 400
    status = dispatch_service.set_duty_status(worker_id, duty_status, data.get("lat"), data.get("lng"))
    return jsonify(status)


@dispatch_bp.route("/worker-status/<int:worker_id>/ping", methods=["POST"])
def ping_location(worker_id):
    data = request.get_json() or {}
    status = dispatch_service.ping_location(worker_id, data.get("lat"), data.get("lng"))
    if status is None:
        return jsonify({"error": "worker is not on duty"}), 404
    return jsonify(status)


@dispatch_bp.route("/service-requests", methods=["POST"])
def create_service_request():
    data = request.get_json() or {}
    for field in ("customer_id", "raw_text", "lat", "lng"):
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    result = dispatch_service.create_service_request(data)
    return jsonify(result), 201


@dispatch_bp.route("/service-requests/<int:request_id>", methods=["GET"])
def get_service_request(request_id):
    result = dispatch_service.get_service_request(request_id)
    if result is None:
        return jsonify({"error": "Service request not found"}), 404
    return jsonify(result)


@dispatch_bp.route("/workers/<int:worker_id>/offers", methods=["GET"])
def worker_offers(worker_id):
    return jsonify(dispatch_service.worker_pending_offers(worker_id))


@dispatch_bp.route("/job-offers/<int:offer_id>/accept", methods=["POST"])
def accept_offer(offer_id):
    data = request.get_json() or {}
    if "worker_id" not in data:
        return jsonify({"error": "Missing required field: worker_id"}), 400
    try:
        result = dispatch_service.accept_offer(offer_id, data["worker_id"])
    except OfferExpired:
        return jsonify({"won": False, "reason": "offer_expired"}), 409
    status_code = 200 if result["won"] else 409
    return jsonify(result), status_code


@dispatch_bp.route("/job-offers/<int:offer_id>/decline", methods=["POST"])
def decline_offer(offer_id):
    data = request.get_json() or {}
    if "worker_id" not in data:
        return jsonify({"error": "Missing required field: worker_id"}), 400
    declined = dispatch_service.decline_offer(offer_id, data["worker_id"])
    if not declined:
        return jsonify({"error": "Offer not found or not pending"}), 404
    return jsonify({"declined": True})


@dispatch_bp.route("/jobs/<int:job_id>/matches", methods=["GET"])
def job_matches(job_id):
    matches = dispatch_service.job_matches(job_id)
    if matches is None:
        return jsonify({"error": "Job not found or has no description"}), 404
    return jsonify(matches)


@dispatch_bp.route("/dispatch/admin", methods=["GET"])
def dispatch_admin():
    if request.headers.get("X-Admin-Passcode") != Config.ADMIN_PASSCODE or not Config.ADMIN_PASSCODE:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify(dispatch_service.admin_dispatch_board())
