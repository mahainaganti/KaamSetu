from database import get_connection


def get_all_disputes():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            d.dispute_id,
            d.booking_id,
            d.employer_id,
            d.worker_id,
            d.dispute_reason,
            d.dispute_status,
            d.created_at,
            d.resolved_at,
            e.full_name AS employer_name,
            w.full_name AS worker_name
        FROM disputes d
        LEFT JOIN employers e ON d.employer_id = e.employer_id
        LEFT JOIN workers w ON d.worker_id = w.worker_id
        ORDER BY d.dispute_id;
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    disputes = []

    for row in rows:
        disputes.append({
            "dispute_id": row[0],
            "booking_id": row[1],
            "employer_id": row[2],
            "worker_id": row[3],
            "dispute_reason": row[4],
            "dispute_status": row[5],
            "created_at": str(row[6]) if row[6] else None,
            "resolved_at": str(row[7]) if row[7] else None,
            "employer_name": row[8],
            "worker_name": row[9]
        })

    return disputes


def get_dispute(dispute_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            d.dispute_id,
            d.booking_id,
            d.employer_id,
            d.worker_id,
            d.dispute_reason,
            d.dispute_status,
            d.created_at,
            d.resolved_at,
            e.full_name AS employer_name,
            w.full_name AS worker_name
        FROM disputes d
        LEFT JOIN employers e ON d.employer_id = e.employer_id
        LEFT JOIN workers w ON d.worker_id = w.worker_id
        WHERE d.dispute_id=%s;
    """, (dispute_id,))

    row = cursor.fetchone()

    cursor.close()
    conn.close()

    if row is None:
        return None

    return {
        "dispute_id": row[0],
        "booking_id": row[1],
        "employer_id": row[2],
        "worker_id": row[3],
        "dispute_reason": row[4],
        "dispute_status": row[5],
        "created_at": str(row[6]) if row[6] else None,
        "resolved_at": str(row[7]) if row[7] else None,
        "employer_name": row[8],
        "worker_name": row[9]
    }
