from database import get_connection
from psycopg2.extras import RealDictCursor

def get_all_workers():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            worker_id,
            full_name,
            preferred_language,
            average_rating,
            availability_status
        FROM workers
        ORDER BY worker_id;
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    workers = []

    for row in rows:

        workers.append({

            "worker_id": row[0],
            "full_name": row[1],
            "preferred_language": row[2],
            "average_rating": float(row[3]),
            "availability_status": row[4]

        })

    return workers


def get_worker(worker_id):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            worker_id,
            full_name,
            phone,
            gender,
            preferred_language,
            experience_years,
            travel_radius_km,
            average_rating,
            verification_status,
            availability_status,
            location_id,
            created_at,
            updated_at
        FROM workers
        WHERE worker_id=%s;
    """, (worker_id,))

    row = cursor.fetchone()

    cursor.close()
    conn.close()

    if row is None:
        return None

    return {

        "worker_id": row[0],
        "full_name": row[1],
        "phone": row[2],
        "gender": row[3],
        "preferred_language": row[4],
        "experience_years": row[5],
        "travel_radius_km": row[6],
        "average_rating": float(row[7]),
        "verification_status": row[8],
        "availability_status": row[9],
        "location_id": row[10],
        "created_at": str(row[11]),
        "updated_at": str(row[12])

    }


def search_workers(language=None, location_id=None, average_rating=None):

    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT
            worker_id,
            full_name,
            preferred_language,
            average_rating,
            availability_status
        FROM workers
    """

    conditions = []
    params = []

    if language is not None and str(language).strip() != "":
        conditions.append("preferred_language=%s")
        params.append(language)

    if location_id is not None and str(location_id).strip() != "":
        conditions.append("location_id=%s")
        params.append(location_id)

    if average_rating is not None and str(average_rating).strip() != "":
        conditions.append("average_rating=%s")
        params.append(average_rating)

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    query += " ORDER BY average_rating DESC;"

    cursor.execute(query, tuple(params))

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    workers = []

    for row in rows:

        workers.append({

            "worker_id": row[0],
            "full_name": row[1],
            "preferred_language": row[2],
            "average_rating": float(row[3]),
            "availability_status": row[4]

        })

    return workers


def create_worker(data):

    conn = get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    cursor.execute("""

        INSERT INTO workers(
                   
            worker_id,
            full_name,
            phone,
            gender,
            preferred_language,
            experience_years,
            travel_radius_km,
            average_rating,
            verification_status,
            availability_status,
            location_id,
            created_at,
            updated_at

        )

        VALUES(
            (SELECT COALESCE(MAX(worker_id),0)+1 FROM workers),
            %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
            CURRENT_DATE,
            CURRENT_DATE

        )

        RETURNING worker_id;

    """,(

        data["full_name"],
        data["phone"],
        data["gender"],
        data["preferred_language"],
        data["experience_years"],
        data["travel_radius_km"],
        data["average_rating"],
        data["verification_status"],
        data["availability_status"],
        data["location_id"]

    ))

    worker = cursor.fetchone()

    conn.commit()

    cursor.close()
    conn.close()

    return worker

def update_worker(worker_id, data):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""

        UPDATE workers
        SET
            full_name=%s,
            phone=%s,
            gender=%s,
            preferred_language=%s,
            experience_years=%s,
            travel_radius_km=%s,
            average_rating=%s,
            verification_status=%s,
            availability_status=%s,
            location_id=%s,
            updated_at=CURRENT_DATE

        WHERE worker_id=%s;

    """, (

        data["full_name"],
        data["phone"],
        data["gender"],
        data["preferred_language"],
        data["experience_years"],
        data["travel_radius_km"],
        data["average_rating"],
        data["verification_status"],
        data["availability_status"],
        data["location_id"],
        worker_id

    ))

    conn.commit()

    updated = cursor.rowcount

    cursor.close()
    conn.close()

    return updated

def delete_worker(worker_id):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        DELETE FROM workers
        WHERE worker_id=%s;
    """, (worker_id,))

    conn.commit()

    deleted = cursor.rowcount

    cursor.close()
    conn.close()

    return deleted