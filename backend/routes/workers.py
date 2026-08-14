from flask import Blueprint, jsonify, request

from services.worker_service import (
    get_all_workers,
    get_worker,
    search_workers,
    create_worker,
    update_worker,
    delete_worker
)

from validators import validate_worker

workers_bp = Blueprint("workers", __name__)


@workers_bp.route("/workers", methods=["GET"])
def workers():

    return jsonify(get_all_workers())


@workers_bp.route("/workers/<int:worker_id>", methods=["GET"])
def worker(worker_id):

    data = get_worker(worker_id)

    if data is None:
        return jsonify({"message": "Worker not found"}),404

    return jsonify(data)


@workers_bp.route("/workers/search", methods=["GET"])
def search():

    language = request.args.get("language")

    return jsonify(search_workers(language))

@workers_bp.route("/workers", methods=["POST"])
def add_worker():

    data = request.get_json()

    valid, message = validate_worker(data)

    if not valid:

        return jsonify({

            "error": message

        }),400

    worker = create_worker(data)

    return jsonify({

        "message":"Worker created successfully",

        "worker":worker

    }),201

@workers_bp.route("/workers/<int:worker_id>", methods=["PUT"])
def edit_worker(worker_id):

    data = request.get_json()

    valid, message = validate_worker(data)

    if not valid:

        return jsonify({

            "error": message

        }),400

    updated = update_worker(worker_id,data)

    if updated == 0:

        return jsonify({

            "message":"Worker not found"

        }),404

    return jsonify({

        "message":"Worker updated successfully"

    })

@workers_bp.route("/workers/<int:worker_id>", methods=["DELETE"])
def remove_worker(worker_id):

    deleted = delete_worker(worker_id)

    if deleted == 0:

        return jsonify({
            "message": "Worker not found"
        }), 404

    return jsonify({
        "message": "Worker deleted successfully"
    })

