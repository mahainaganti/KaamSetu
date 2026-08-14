from flask import jsonify
from psycopg2 import IntegrityError


def register_error_handlers(app):

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "error": "Resource not found"
        }), 404


    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            "error": "Bad request"
        }), 400


    @app.errorhandler(IntegrityError)
    def integrity_error(error):
        return jsonify({
            "error": "Database constraint violation.",
            "details": str(error.orig)
        }), 400


    @app.errorhandler(Exception)
    def internal_error(error):
        return jsonify({
            "error": "Internal Server Error",
            "details": str(error)
        }), 500