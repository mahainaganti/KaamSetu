from flask import Blueprint, jsonify, request

from services.job_service import (

    get_all_jobs,
    get_job,
    create_job,
    update_job,
    delete_job

)

jobs_bp = Blueprint("jobs", __name__)


@jobs_bp.route("/jobs", methods=["GET"])
def jobs():

    return jsonify(get_all_jobs())


@jobs_bp.route("/jobs/<int:job_id>", methods=["GET"])
def job(job_id):

    data = get_job(job_id)

    if data is None:

        return jsonify({

            "message":"Job not found"

        }),404

    return jsonify(data)


@jobs_bp.route("/jobs", methods=["POST"])
def add_job():

    data = request.get_json()

    job = create_job(data)

    return jsonify({

        "message":"Job created successfully",

        "job":job

    }),201


@jobs_bp.route("/jobs/<int:job_id>", methods=["PUT"])
def edit_job(job_id):

    data = request.get_json()

    updated = update_job(job_id,data)

    if updated == 0:

        return jsonify({

            "message":"Job not found"

        }),404

    return jsonify({

        "message":"Job updated successfully"

    })


@jobs_bp.route("/jobs/<int:job_id>", methods=["DELETE"])
def remove_job(job_id):

    deleted = delete_job(job_id)

    if deleted == 0:

        return jsonify({

            "message":"Job not found"

        }),404

    return jsonify({

        "message":"Job deleted successfully"

    })