from flask import Blueprint, jsonify, request

from services.employer_service import (

    get_all_employers,
    get_employer,
    create_employer,
    update_employer,
    delete_employer

)

employers_bp = Blueprint("employers", __name__)


@employers_bp.route("/employers", methods=["GET"])
def employers():

    return jsonify(get_all_employers())


@employers_bp.route("/employers/<int:employer_id>", methods=["GET"])
def employer(employer_id):

    data = get_employer(employer_id)

    if data is None:

        return jsonify({

            "message":"Employer not found"

        }),404

    return jsonify(data)


@employers_bp.route("/employers", methods=["POST"])
def add_employer():

    data = request.get_json()

    employer = create_employer(data)

    return jsonify({

        "message":"Employer created successfully",

        "employer": employer

    }),201


@employers_bp.route("/employers/<int:employer_id>", methods=["PUT"])
def edit_employer(employer_id):

    data = request.get_json()

    updated = update_employer(employer_id,data)

    if updated == 0:

        return jsonify({

            "message":"Employer not found"

        }),404

    return jsonify({

        "message":"Employer updated successfully"

    })


@employers_bp.route("/employers/<int:employer_id>", methods=["DELETE"])
def remove_employer(employer_id):

    deleted = delete_employer(employer_id)

    if deleted == 0:

        return jsonify({

            "message":"Employer not found"

        }),404

    return jsonify({

        "message":"Employer deleted successfully"

    })