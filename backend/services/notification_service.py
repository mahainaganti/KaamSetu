from database import get_connection


def get_all_notifications():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            notification_id,
            booking_id,
            recipient_type,
            recipient_id,
            notification_type,
            message,
            is_read,
            created_at
        FROM notifications
        ORDER BY notification_id DESC;
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    notifications = []

    for row in rows:
        notifications.append({
            "notification_id": row[0],
            "booking_id": row[1],
            "recipient_type": row[2],
            "recipient_id": row[3],
            "notification_type": row[4],
            "message": row[5],
            "is_read": bool(row[6]),
            "created_at": str(row[7]) if row[7] else None
        })

    return notifications


def get_notification(notification_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            notification_id,
            booking_id,
            recipient_type,
            recipient_id,
            notification_type,
            message,
            is_read,
            created_at
        FROM notifications
        WHERE notification_id=%s;
    """, (notification_id,))

    row = cursor.fetchone()

    cursor.close()
    conn.close()

    if row is None:
        return None

    return {
        "notification_id": row[0],
        "booking_id": row[1],
        "recipient_type": row[2],
        "recipient_id": row[3],
        "notification_type": row[4],
        "message": row[5],
        "is_read": bool(row[6]),
        "created_at": str(row[7]) if row[7] else None
    }
