from flask import Blueprint, jsonify, request

from services.payment_service import (

    get_all_payments,
    get_payment,
    create_payment,
    update_payment,
    delete_payment

)

payments_bp = Blueprint("payments", __name__)


@payments_bp.route("/payments", methods=["GET"])
def payments():

    return jsonify(get_all_payments())


@payments_bp.route("/payments/<int:payment_id>", methods=["GET"])
def payment(payment_id):

    data = get_payment(payment_id)

    if data is None:

        return jsonify({

            "message":"Payment not found"

        }),404

    return jsonify(data)


@payments_bp.route("/payments", methods=["POST"])
def add_payment():

    data = request.get_json()

    payment = create_payment(data)

    return jsonify({

        "message":"Payment created successfully",

        "payment":payment

    }),201


@payments_bp.route("/payments/<int:payment_id>", methods=["PUT"])
def edit_payment(payment_id):

    data = request.get_json()

    updated = update_payment(payment_id,data)

    if updated == 0:

        return jsonify({

            "message":"Payment not found"

        }),404

    return jsonify({

        "message":"Payment updated successfully"

    })


@payments_bp.route("/payments/<int:payment_id>", methods=["DELETE"])
def remove_payment(payment_id):

    deleted = delete_payment(payment_id)

    if deleted == 0:

        return jsonify({

            "message":"Payment not found"

        }),404

    return jsonify({

        "message":"Payment deleted successfully"

    })