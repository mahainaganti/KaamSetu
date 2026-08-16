from datetime import datetime, timedelta

from db_pool import transaction
from services import telephony_service
from services.telephony_service import NoVirtualNumberAvailable


def _lookup_parties(cur, booking_id):
    cur.execute(
        """
        SELECT b.booking_id, b.worker_id, w.phone AS worker_phone,
               jp.employer_id AS customer_id, e.phone AS customer_phone
        FROM bookings b
        JOIN workers w ON w.worker_id = b.worker_id
        JOIN job_posts jp ON jp.job_id = b.job_id
        JOIN employers e ON e.employer_id = jp.employer_id
        WHERE b.booking_id = %s
        """,
        (booking_id,),
    )
    return cur.fetchone()


def create_call_session(booking_id):
    with transaction() as cur:
        parties = _lookup_parties(cur, booking_id)
        if parties is None:
            return None

        active_until = datetime.utcnow() + timedelta(hours=2)
        session = None
        for virtual_number in telephony_service.virtual_number_pool():
            cur.execute(
                """
                INSERT INTO call_session
                    (booking_id, virtual_number, customer_id, worker_id, active_until, status)
                VALUES (%s, %s, %s, %s, %s, 'active')
                ON CONFLICT (virtual_number) WHERE status = 'active' DO NOTHING
                RETURNING *
                """,
                (booking_id, virtual_number, parties["customer_id"], parties["worker_id"], active_until),
            )
            session = cur.fetchone()
            if session:
                break

        if session is None:
            raise NoVirtualNumberAvailable("every virtual number is currently in an active session")

        telephony_service.place_bridge_call(session["virtual_number"], parties["worker_phone"])
        return session


def log_call(session_id, direction, duration_seconds=None):
    with transaction() as cur:
        cur.execute(
            """
            INSERT INTO call_log (session_id, direction, duration_seconds)
            VALUES (%s, %s, %s)
            RETURNING *
            """,
            (session_id, direction, duration_seconds),
        )
        return cur.fetchone()


def get_call_logs(session_id):
    with transaction() as cur:
        cur.execute("SELECT * FROM call_log WHERE session_id = %s ORDER BY started_at", (session_id,))
        return cur.fetchall()


def resolve_twiml_for_inbound(to_number, from_number):
    """Called by the /calls/twiml webhook when Twilio receives an inbound
    call to one of our virtual numbers. Looks up the active session on
    that number and bridges to whichever party didn't place the call.
    """
    with transaction() as cur:
        cur.execute(
            "SELECT cs.*, w.phone AS worker_phone, e.phone AS customer_phone "
            "FROM call_session cs "
            "JOIN workers w ON w.worker_id = cs.worker_id "
            "JOIN employers e ON e.employer_id = cs.customer_id "
            "WHERE cs.virtual_number = %s AND cs.status = 'active'",
            (to_number,),
        )
        session = cur.fetchone()
        if session is None:
            return None

        is_customer_calling = from_number == session["customer_phone"]
        counterpart = session["worker_phone"] if is_customer_calling else session["customer_phone"]
        return telephony_service.bridge_twiml(is_customer_calling, counterpart)
