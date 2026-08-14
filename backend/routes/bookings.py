from flask import Blueprint, jsonify, request

from services.booking_service import (

    get_all_bookings,
    get_booking,
    create_booking,
    update_booking,
    delete_booking

)

bookings_bp = Blueprint("bookings", __name__)


@bookings_bp.route("/bookings", methods=["GET"])
def bookings():

    return jsonify(get_all_bookings())


@bookings_bp.route("/bookings/<int:booking_id>", methods=["GET"])
def booking(booking_id):

    data = get_booking(booking_id)

    if data is None:

        return jsonify({

            "message":"Booking not found"

        }),404

    return jsonify(data)


@bookings_bp.route("/bookings", methods=["POST"])
def add_booking():

    data = request.get_json()

    booking = create_booking(data)

    return jsonify({

        "message":"Booking created successfully",

        "booking":booking

    }),201


@bookings_bp.route("/bookings/<int:booking_id>", methods=["PUT"])
def edit_booking(booking_id):

    data = request.get_json()

    updated = update_booking(booking_id,data)

    if updated == 0:

        return jsonify({

            "message":"Booking not found"

        }),404

    return jsonify({

        "message":"Booking updated successfully"

    })


@bookings_bp.route("/bookings/<int:booking_id>", methods=["DELETE"])
def remove_booking(booking_id):

    deleted = delete_booking(booking_id)

    if deleted == 0:

        return jsonify({

            "message":"Booking not found"

        }),404

    return jsonify({

        "message":"Booking deleted successfully"

    })