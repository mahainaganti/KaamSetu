from psycopg2.extras import RealDictCursor
from database import get_connection


def get_all_employers():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            employer_id,
            full_name,
            phone,
            email,
            employer_type,
            verification_status,
            location_id
        FROM employers
        ORDER BY employer_id;
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    employers = []

    for row in rows:

        employers.append({

            "employer_id": row[0],
            "full_name": row[1],
            "phone": row[2],
            "email": row[3],
            "employer_type": row[4],
            "verification_status": row[5],
            "location_id": row[6]

        })

    return employers


def get_employer(employer_id):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM employers
        WHERE employer_id=%s;
    """, (employer_id,))

    row = cursor.fetchone()

    cursor.close()
    conn.close()

    if row is None:
        return None

    return {

        "employer_id": row[0],
        "full_name": row[1],
        "phone": row[2],
        "email": row[3],
        "employer_type": row[4],
        "verification_status": row[5],
        "location_id": row[6],
        "created_at": str(row[7]),
        "updated_at": str(row[8])

    }


def create_employer(data):

    conn = get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    cursor.execute("""

        INSERT INTO employers(

            employer_id,
            full_name,
            phone,
            email,
            employer_type,
            verification_status,
            location_id,
            created_at,
            updated_at

        )

        VALUES(

            (SELECT COALESCE(MAX(employer_id),0)+1 FROM employers),
            %s,%s,%s,%s,%s,%s,
            CURRENT_DATE,
            CURRENT_DATE

        )

        RETURNING employer_id;

    """, (

        data["full_name"],
        data["phone"],
        data["email"],
        data["employer_type"],
        data["verification_status"],
        data["location_id"]

    ))

    employer = cursor.fetchone()

    conn.commit()

    cursor.close()
    conn.close()

    return employer


def update_employer(employer_id, data):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""

        UPDATE employers
        SET

            full_name=%s,
            phone=%s,
            email=%s,
            employer_type=%s,
            verification_status=%s,
            location_id=%s,
            updated_at=CURRENT_DATE

        WHERE employer_id=%s;

    """, (

        data["full_name"],
        data["phone"],
        data["email"],
        data["employer_type"],
        data["verification_status"],
        data["location_id"],
        employer_id

    ))

    conn.commit()

    updated = cursor.rowcount

    cursor.close()
    conn.close()

    return updated


def delete_employer(employer_id):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""

        DELETE FROM employers
        WHERE employer_id=%s;

    """, (employer_id,))

    conn.commit()

    deleted = cursor.rowcount

    cursor.close()
    conn.close()

    return deleted