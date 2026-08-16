from flask import Blueprint, jsonify, request

from services import call_service
from services.telephony_service import NoVirtualNumberAvailable

calls_bp = Blueprint("calls", __name__)


@calls_bp.route("/bookings/<int:booking_id>/call-session", methods=["POST"])
def create_call_session(booking_id):
    try:
        session = call_service.create_call_session(booking_id)
    except NoVirtualNumberAvailable as e:
        return jsonify({"error": str(e)}), 503
    if session is None:
        return jsonify({"error": "Booking not found"}), 404
    return jsonify(session), 201


@calls_bp.route("/call-sessions/<int:session_id>/logs", methods=["GET"])
def call_logs(session_id):
    return jsonify(call_service.get_call_logs(session_id))


@calls_bp.route("/calls/twiml", methods=["POST"])
def twiml_webhook():
    """Twilio's inbound-call webhook. Register this route's public URL
    (TWILIO_BRIDGE_TWIML_URL) as the Voice webhook for every number in
    VIRTUAL_NUMBER_POOL in the Twilio console.
    """
    to_number = request.form.get("To", "")
    from_number = request.form.get("From", "")
    twiml = call_service.resolve_twiml_for_inbound(to_number, from_number)
    if twiml is None:
        return (
            '<?xml version="1.0" encoding="UTF-8"?><Response><Say>'
            "This number is not currently connected to an active job."
            "</Say><Hangup/></Response>"
        ), 200, {"Content-Type": "text/xml"}
    return twiml, 200, {"Content-Type": "text/xml"}
