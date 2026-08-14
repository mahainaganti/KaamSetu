from psycopg2.extras import RealDictCursor
from database import get_connection


def get_all_jobs():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            job_id,
            employer_id,
            title,
            budget,
            status,
            location_id,
            posted_at
        FROM job_posts
        ORDER BY job_id;
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    jobs = []

    for row in rows:

        jobs.append({

            "job_id": row[0],
            "employer_id": row[1],
            "title": row[2],
            "budget": float(row[3]),
            "status": row[4],
            "location_id": row[5],
            "posted_at": str(row[6])

        })

    return jobs


def get_job(job_id):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM job_posts
        WHERE job_id=%s;
    """, (job_id,))

    row = cursor.fetchone()

    cursor.close()
    conn.close()

    if row is None:
        return None

    return {

        "job_id": row[0],
        "employer_id": row[1],
        "title": row[2],
        "description": row[3],
        "budget": float(row[4]),
        "status": row[5],
        "location_id": row[6],
        "posted_at": str(row[7])

    }


def create_job(data):

    conn = get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    cursor.execute("""

        INSERT INTO job_posts(

            job_id,
            employer_id,
            title,
            description,
            budget,
            status,
            location_id,
            posted_at

        )

        VALUES(

            (SELECT COALESCE(MAX(job_id),0)+1 FROM job_posts),
            %s,%s,%s,%s,%s,%s,
            CURRENT_DATE

        )

        RETURNING job_id;

    """,(

        data["employer_id"],
        data["title"],
        data["description"],
        data["budget"],
        data["status"],
        data["location_id"]

    ))

    job = cursor.fetchone()

    conn.commit()

    cursor.close()
    conn.close()

    return job


def update_job(job_id,data):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""

        UPDATE job_posts
        SET

            employer_id=%s,
            title=%s,
            description=%s,
            budget=%s,
            status=%s,
            location_id=%s

        WHERE job_id=%s;

    """,(

        data["employer_id"],
        data["title"],
        data["description"],
        data["budget"],
        data["status"],
        data["location_id"],
        job_id

    ))

    conn.commit()

    updated = cursor.rowcount

    cursor.close()
    conn.close()

    return updated


def delete_job(job_id):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""

        DELETE FROM job_posts
        WHERE job_id=%s;

    """,(job_id,))

    conn.commit()

    deleted = cursor.rowcount

    cursor.close()
    conn.close()

    return deleted