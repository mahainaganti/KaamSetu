from psycopg2.extras import RealDictCursor
from database import get_connection


def get_all_ratings():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            rating_id,
            booking_id,
            employer_id,
            worker_id,
            rating,
            review,
            rated_at
        FROM ratings
        ORDER BY rating_id;
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    ratings = []

    for row in rows:

        ratings.append({

            "rating_id": row[0],
            "booking_id": row[1],
            "employer_id": row[2],
            "worker_id": row[3],
            "rating": row[4],
            "review": row[5],
            "rated_at": str(row[6]) if row[6] else None

        })

    return ratings


def get_rating(rating_id):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM ratings
        WHERE rating_id=%s;
    """, (rating_id,))

    row = cursor.fetchone()

    cursor.close()
    conn.close()

    if row is None:
        return None

    return {

        "rating_id": row[0],
        "booking_id": row[1],
        "employer_id": row[2],
        "worker_id": row[3],
        "rating": row[4],
        "review": row[5],
        "rated_at": str(row[6]) if row[6] else None

    }


def create_rating(data):

    conn = get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    cursor.execute("""
        INSERT INTO ratings(
            rating_id,
            booking_id,
            employer_id,
            worker_id,
            rating,
            review,
            rated_at
        )
        VALUES(
            (SELECT COALESCE(MAX(rating_id),0)+1 FROM ratings),
            %s,%s,%s,%s,%s,
            CURRENT_DATE
        )
        RETURNING rating_id;
    """, (
        data["booking_id"],
        data["employer_id"],
        data["worker_id"],
        data["rating"],
        data.get("review")
    ))

    rating = cursor.fetchone()

    conn.commit()

    cursor.close()
    conn.close()

    return rating


def update_rating(rating_id, data):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE ratings
        SET
            booking_id=%s,
            employer_id=%s,
            worker_id=%s,
            rating=%s,
            review=%s
        WHERE rating_id=%s;
    """, (
        data["booking_id"],
        data["employer_id"],
        data["worker_id"],
        data["rating"],
        data.get("review"),
        rating_id
    ))

    conn.commit()

    updated = cursor.rowcount

    cursor.close()
    conn.close()

    return updated


def delete_rating(rating_id):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        DELETE FROM ratings
        WHERE rating_id=%s;
    """, (rating_id,))

    conn.commit()

    deleted = cursor.rowcount

    cursor.close()
    conn.close()

    return deleted
