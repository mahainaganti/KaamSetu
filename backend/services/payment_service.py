from psycopg2.extras import RealDictCursor
from database import get_connection


def get_all_payments():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            payment_id,
            booking_id,
            amount,
            payment_method,
            payment_status,
            transaction_id,
            payment_date
        FROM payments
        ORDER BY payment_id;
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    payments = []

    for row in rows:

        payments.append({

            "payment_id": row[0],
            "booking_id": row[1],
            "amount": float(row[2]),
            "payment_method": row[3],
            "payment_status": row[4],
            "transaction_id": row[5],
            "payment_date": str(row[6]) if row[6] else None

        })

    return payments


def get_payment(payment_id):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM payments
        WHERE payment_id=%s;
    """, (payment_id,))

    row = cursor.fetchone()

    cursor.close()
    conn.close()

    if row is None:
        return None

    return {

        "payment_id": row[0],
        "booking_id": row[1],
        "amount": float(row[2]),
        "payment_method": row[3],
        "payment_status": row[4],
        "transaction_id": row[5],
        "payment_date": str(row[6]) if row[6] else None

    }


def create_payment(data):

    conn = get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    cursor.execute("""

        INSERT INTO payments(

            payment_id,
            booking_id,
            amount,
            payment_method,
            payment_status,
            transaction_id,
            payment_date

        )

        VALUES(

            (SELECT COALESCE(MAX(payment_id),0)+1 FROM payments),
            %s,
            %s,
            %s,
            %s,
            %s,
            CURRENT_DATE

        )

        RETURNING payment_id;

    """,(

        data["booking_id"],
        data["amount"],
        data["payment_method"],
        data["payment_status"],
        data["transaction_id"]

    ))

    payment = cursor.fetchone()

    conn.commit()

    cursor.close()
    conn.close()

    return payment


def update_payment(payment_id,data):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""

        UPDATE payments
        SET

            booking_id=%s,
            amount=%s,
            payment_method=%s,
            payment_status=%s,
            transaction_id=%s,
            payment_date=CURRENT_DATE

        WHERE payment_id=%s;

    """,(

        data["booking_id"],
        data["amount"],
        data["payment_method"],
        data["payment_status"],
        data["transaction_id"],
        payment_id

    ))

    conn.commit()

    updated = cursor.rowcount

    cursor.close()
    conn.close()

    return updated


def delete_payment(payment_id):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""

        DELETE FROM payments
        WHERE payment_id=%s;

    """,(payment_id,))

    conn.commit()

    deleted = cursor.rowcount

    cursor.close()
    conn.close()

    return deleted