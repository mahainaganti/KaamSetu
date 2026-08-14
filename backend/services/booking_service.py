from psycopg2.extras import RealDictCursor
from database import get_connection


def get_all_bookings():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            booking_id,
            job_id,
            worker_id,
            booking_date,
            scheduled_date,
            booking_status,
            final_price,
            completion_date
        FROM bookings
        ORDER BY booking_id;
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    bookings = []

    for row in rows:

        bookings.append({

            "booking_id": row[0],
            "job_id": row[1],
            "worker_id": row[2],
            "booking_date": str(row[3]) if row[3] else None,
            "scheduled_date": str(row[4]),
            "booking_status": row[5],
            "final_price": float(row[6]) if row[6] else None,
            "completion_date": str(row[7]) if row[7] else None

        })

    return bookings


def get_booking(booking_id):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM bookings
        WHERE booking_id=%s;
    """, (booking_id,))

    row = cursor.fetchone()

    cursor.close()
    conn.close()

    if row is None:
        return None

    return {

        "booking_id": row[0],
        "job_id": row[1],
        "worker_id": row[2],
        "booking_date": str(row[3]) if row[3] else None,
        "scheduled_date": str(row[4]),
        "booking_status": row[5],
        "final_price": float(row[6]) if row[6] else None,
        "completion_date": str(row[7]) if row[7] else None

    }


def create_booking(data):

    conn = get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    cursor.execute("""

        INSERT INTO bookings(

            booking_id,
            job_id,
            worker_id,
            booking_date,
            scheduled_date,
            booking_status,
            final_price,
            completion_date

        )

        VALUES(

            (SELECT COALESCE(MAX(booking_id),0)+1 FROM bookings),
            %s,
            %s,
            CURRENT_DATE,
            %s,
            %s,
            %s,
            %s

        )

        RETURNING booking_id;

    """,(

        data["job_id"],
        data["worker_id"],
        data["scheduled_date"],
        data["booking_status"],
        data["final_price"],
        data["completion_date"]

    ))

    booking = cursor.fetchone()

    conn.commit()

    cursor.close()
    conn.close()

    return booking


def update_booking(booking_id,data):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""

        UPDATE bookings
        SET

            job_id=%s,
            worker_id=%s,
            scheduled_date=%s,
            booking_status=%s,
            final_price=%s,
            completion_date=%s

        WHERE booking_id=%s;

    """,(

        data["job_id"],
        data["worker_id"],
        data["scheduled_date"],
        data["booking_status"],
        data["final_price"],
        data["completion_date"],
        booking_id

    ))

    conn.commit()

    updated = cursor.rowcount

    cursor.close()
    conn.close()

    return updated


def delete_booking(booking_id):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""

        DELETE FROM bookings
        WHERE booking_id=%s;

    """,(booking_id,))

    conn.commit()

    deleted = cursor.rowcount

    cursor.close()
    conn.close()

    return deleted