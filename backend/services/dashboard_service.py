from database import get_connection

def get_dashboard_stats():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            (SELECT COUNT(*) FROM workers) AS total_workers,
            (SELECT COUNT(*) FROM workers WHERE availability_status = 'Available') AS available_workers,
            (SELECT COUNT(*) FROM job_posts WHERE status = 'Open') AS open_jobs,
            (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'Paid') AS total_revenue,
            (SELECT COUNT(*) FROM employers) AS total_employers,
            (SELECT COUNT(*) FROM bookings) AS total_bookings,
            (SELECT COUNT(*) FROM payments WHERE payment_status = 'Pending') AS pending_payments,
            (SELECT COUNT(*) FROM disputes WHERE dispute_status IN ('Open', 'In Review')) AS active_disputes,
            (SELECT COUNT(*) FROM ratings) AS total_ratings,
            (SELECT COALESCE(ROUND(AVG(rating), 2), 0) FROM ratings) AS average_rating;
    """)

    stats_row = cursor.fetchone()

    stats = {
        "total_workers": int(stats_row[0]) if stats_row[0] is not None else 0,
        "available_workers": int(stats_row[1]) if stats_row[1] is not None else 0,
        "open_jobs": int(stats_row[2]) if stats_row[2] is not None else 0,
        "total_revenue": float(stats_row[3]) if stats_row[3] is not None else 0.0,
        "total_employers": int(stats_row[4]) if stats_row[4] is not None else 0,
        "total_bookings": int(stats_row[5]) if stats_row[5] is not None else 0,
        "pending_payments": int(stats_row[6]) if stats_row[6] is not None else 0,
        "active_disputes": int(stats_row[7]) if stats_row[7] is not None else 0,
        "total_ratings": int(stats_row[8]) if stats_row[8] is not None else 0,
        "average_rating": float(stats_row[9]) if stats_row[9] is not None else 0.0
    }

    cursor.execute("""
        SELECT
            b.booking_id,
            w.full_name AS worker_name,
            j.title AS job_title,
            b.booking_status,
            COALESCE(b.final_price, p.amount, j.budget, 0) AS amount
        FROM bookings b
        JOIN workers w ON b.worker_id = w.worker_id
        JOIN job_posts j ON b.job_id = j.job_id
        LEFT JOIN payments p ON b.booking_id = p.booking_id
        ORDER BY b.booking_id DESC
        LIMIT 5;
    """)

    recent_rows = cursor.fetchall()

    cursor.close()
    conn.close()

    recent_bookings = []
    for row in recent_rows:
        recent_bookings.append({
            "booking_id": row[0],
            "worker_name": row[1],
            "job_title": row[2],
            "booking_status": row[3],
            "amount": float(row[4]) if row[4] is not None else 0.0
        })

    return {
        "stats": stats,
        "recent_bookings": recent_bookings
    }
