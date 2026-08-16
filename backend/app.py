import os
from flask import Flask
from flask_cors import CORS

from database import get_connection

from routes.workers import workers_bp
from routes.employers import employers_bp
from routes.jobs import jobs_bp
from routes.bookings import bookings_bp
from routes.payments import payments_bp
from routes.ratings import ratings_bp
from routes.dashboard import dashboard_bp
from routes.disputes import disputes_bp
from routes.notifications import notifications_bp

from errors import register_error_handlers


app = Flask(__name__)


# Allow requests from the Next.js frontend
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url and frontend_url not in allowed_origins:
    allowed_origins.append(frontend_url)

CORS(
    app,
    origins=allowed_origins
)


# Register API routes
app.register_blueprint(workers_bp)
app.register_blueprint(employers_bp)
app.register_blueprint(jobs_bp)
app.register_blueprint(bookings_bp)
app.register_blueprint(payments_bp)
app.register_blueprint(ratings_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(disputes_bp)
app.register_blueprint(notifications_bp)


# Register error handlers
register_error_handlers(app)


# Home
@app.route("/")
def home():

    return {
        "message": "Welcome to KaamSetu API"
    }


# Database connection test
@app.route("/test-db")
def test_db():

    try:

        conn = get_connection()

        cursor = conn.cursor()

        cursor.execute("SELECT version();")

        version = cursor.fetchone()

        cursor.close()
        conn.close()

        return {
            "status": "Connected Successfully",
            "postgres_version": version[0]
        }

    except Exception as e:

        return {
            "status": "Connection Failed",
            "error": str(e)
        }


if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
