from db_pool import transaction
from services import matching_service
from services.embedding_service import embed

WAVES = [
    {"radius_km": 2, "count": 3, "ttl_seconds": 20},
    {"radius_km": 4, "count": 5, "ttl_seconds": 20},
    {"radius_km": 6, "count": 8, "ttl_seconds": 25},
]

DEFAULT_BUDGET = 500.00  # placeholder until real on-site quote negotiation ships


class OfferExpired(Exception):
    pass


def _dispatch_wave(cur, request_id, lat, lng, category_hint, wave_index, embedding):
    cur.execute(
        "SELECT worker_id FROM job_offer WHERE request_id = %s", (request_id,)
    )
    already_offered = [r["worker_id"] for r in cur.fetchall()]

    wave = WAVES[wave_index]
    candidates = matching_service.shortlist_workers_for_request(
        cur, embedding, lat, lng, wave["radius_km"], already_offered, limit=wave["count"]
    )
    if not candidates:
        return []

    offers = []
    for c in candidates:
        cur.execute(
            """
            INSERT INTO job_offer (request_id, worker_id, wave_no, expires_at)
            VALUES (%s, %s, %s, now() + (%s * interval '1 second'))
            RETURNING offer_id, worker_id, wave_no, expires_at
            """,
            (request_id, c["worker_id"], wave_index + 1, wave["ttl_seconds"]),
        )
        offers.append(cur.fetchone())
    return offers


def create_service_request(data):
    raw_text = data["raw_text"]
    embedding = embed(raw_text)

    with transaction() as cur:
        cur.execute(
            """
            INSERT INTO service_request
                (customer_id, raw_text, embedding, category_hint, urgency, lat, lng, status, wave_no)
            VALUES (%s, %s, %s::vector, %s, %s, %s, %s, 'SEARCHING', 1)
            RETURNING request_id
            """,
            (
                data["customer_id"],
                raw_text,
                _vec_literal(embedding),
                data.get("category_hint"),
                data.get("urgency", "normal"),
                data["lat"],
                data["lng"],
            ),
        )
        request_id = cur.fetchone()["request_id"]

        offers = _dispatch_wave(cur, request_id, data["lat"], data["lng"], data.get("category_hint"), 0, embedding)
        if offers:
            cur.execute(
                "UPDATE service_request SET status = 'OFFERED' WHERE request_id = %s", (request_id,)
            )

        return {"request_id": request_id, "offers": offers}


def _vec_literal(embedding):
    from services.embedding_service import to_pgvector_literal
    return to_pgvector_literal(embedding)


def get_service_request(request_id):
    with transaction() as cur:
        cur.execute("SELECT * FROM service_request WHERE request_id = %s", (request_id,))
        req = cur.fetchone()
        if req is None:
            return None

        if req["status"] in ("SEARCHING", "OFFERED"):
            _expire_stale_offers(cur, request_id)
            req = _maybe_advance_wave(cur, req)

        cur.execute(
            "SELECT offer_id, worker_id, wave_no, offered_at, expires_at, status "
            "FROM job_offer WHERE request_id = %s ORDER BY offer_id", (request_id,)
        )
        offers = cur.fetchall()
        return {**req, "offers": offers}


def _expire_stale_offers(cur, request_id):
    cur.execute(
        """
        UPDATE job_offer SET status = 'EXPIRED'
        WHERE request_id = %s AND status = 'PENDING' AND expires_at < now()
        """,
        (request_id,),
    )


def _maybe_advance_wave(cur, req):
    cur.execute(
        "SELECT COUNT(*) AS n FROM job_offer WHERE request_id = %s AND status = 'PENDING'",
        (req["request_id"],),
    )
    if cur.fetchone()["n"] > 0:
        return req  # current wave still has live offers

    next_wave_index = req["wave_no"]  # wave_no is 1-based; index of the *next* wave
    if next_wave_index >= len(WAVES):
        cur.execute(
            "UPDATE service_request SET status = 'EXPIRED' WHERE request_id = %s AND status IN ('SEARCHING','OFFERED') RETURNING *",
            (req["request_id"],),
        )
        return cur.fetchone() or req

    embedding = _refetch_embedding_as_list(cur, req["request_id"])
    offers = _dispatch_wave(
        cur, req["request_id"], req["lat"], req["lng"], req["category_hint"], next_wave_index, embedding
    )
    cur.execute(
        "UPDATE service_request SET wave_no = %s, status = %s WHERE request_id = %s RETURNING *",
        (next_wave_index + 1, "OFFERED" if offers else "SEARCHING", req["request_id"]),
    )
    return cur.fetchone()


def _refetch_embedding_as_list(cur, request_id):
    cur.execute("SELECT embedding FROM service_request WHERE request_id = %s", (request_id,))
    raw = cur.fetchone()["embedding"]
    # pgvector comes back as a string like '[0.1,0.2,...]' without registering
    # a type adapter; parse it back into floats for reuse in the next wave query.
    return [float(x) for x in raw.strip("[]").split(",")]


def accept_offer(offer_id, worker_id):
    """The crown-jewel transaction: exactly one concurrent acceptance
    wins. The conditional UPDATE ... WHERE status IN (...) is the
    atomic test-and-set — see docs referenced in the project plan.
    """
    with transaction() as cur:
        cur.execute(
            "SELECT * FROM job_offer WHERE offer_id = %s AND worker_id = %s", (offer_id, worker_id)
        )
        offer = cur.fetchone()
        if offer is None:
            return {"won": False, "reason": "offer_not_found"}

        request_id = offer["request_id"]

        cur.execute(
            """
            UPDATE service_request
            SET status = 'ASSIGNED', assigned_worker = %s, assigned_at = now()
            WHERE request_id = %s AND status IN ('SEARCHING', 'OFFERED')
            RETURNING *
            """,
            (worker_id, request_id),
        )
        req = cur.fetchone()
        if req is None:
            cur.execute(
                "UPDATE job_offer SET status = 'LOST' WHERE offer_id = %s AND status = 'PENDING'",
                (offer_id,),
            )
            return {"won": False, "reason": "already_taken"}

        cur.execute(
            """
            UPDATE job_offer SET status = 'ACCEPTED'
            WHERE offer_id = %s AND status = 'PENDING' AND expires_at > now()
            RETURNING offer_id
            """,
            (offer_id,),
        )
        if cur.fetchone() is None:
            raise OfferExpired(f"offer {offer_id} expired before it could be accepted")

        job_id, booking_id = _create_job_and_booking(cur, req, worker_id)

        cur.execute(
            "UPDATE service_request SET job_id = %s WHERE request_id = %s", (job_id, request_id)
        )
        cur.execute(
            "UPDATE job_offer SET status = 'LOST' WHERE request_id = %s AND status = 'PENDING'",
            (request_id,),
        )

        return {"won": True, "job_id": job_id, "booking_id": booking_id, "request_id": request_id}


def _create_job_and_booking(cur, req, worker_id):
    cur.execute(
        "SELECT location_id FROM locations ORDER BY ((latitude - %s)^2 + (longitude - %s)^2) LIMIT 1",
        (req["lat"], req["lng"]),
    )
    location_row = cur.fetchone()
    location_id = location_row["location_id"] if location_row else None

    cur.execute("SELECT pg_advisory_xact_lock(hashtext('job_posts_pk'))")
    cur.execute(
        """
        INSERT INTO job_posts (job_id, employer_id, title, description, budget, status, location_id, posted_at)
        VALUES ((SELECT COALESCE(MAX(job_id),0)+1 FROM job_posts), %s, %s, %s, %s, 'Assigned', %s, CURRENT_DATE)
        RETURNING job_id
        """,
        (req["customer_id"], "Instant request", req["raw_text"], DEFAULT_BUDGET, location_id),
    )
    job_id = cur.fetchone()["job_id"]

    cur.execute("SELECT pg_advisory_xact_lock(hashtext('bookings_pk'))")
    cur.execute(
        """
        INSERT INTO bookings
            (booking_id, job_id, worker_id, booking_date, scheduled_date, booking_status,
             final_price, completion_date, start_ts, end_ts)
        VALUES
            ((SELECT COALESCE(MAX(booking_id),0)+1 FROM bookings), %s, %s, CURRENT_DATE, CURRENT_DATE,
             'Accepted', NULL, NULL, now(), now() + interval '2 hours')
        RETURNING booking_id
        """,
        (job_id, worker_id),
    )
    booking_id = cur.fetchone()["booking_id"]
    return job_id, booking_id


def decline_offer(offer_id, worker_id):
    with transaction() as cur:
        cur.execute(
            """
            UPDATE job_offer SET status = 'DECLINED'
            WHERE offer_id = %s AND worker_id = %s AND status = 'PENDING'
            RETURNING offer_id
            """,
            (offer_id, worker_id),
        )
        return cur.fetchone() is not None


def set_duty_status(worker_id, duty_status, lat=None, lng=None):
    with transaction() as cur:
        cur.execute(
            """
            INSERT INTO worker_status (worker_id, duty_status, cur_lat, cur_lng, last_ping, updated_at)
            VALUES (%s, %s, %s, %s, now(), now())
            ON CONFLICT (worker_id) DO UPDATE SET
                duty_status = EXCLUDED.duty_status,
                cur_lat = COALESCE(EXCLUDED.cur_lat, worker_status.cur_lat),
                cur_lng = COALESCE(EXCLUDED.cur_lng, worker_status.cur_lng),
                last_ping = now(),
                updated_at = now()
            RETURNING *
            """,
            (worker_id, duty_status, lat, lng),
        )
        return cur.fetchone()


def ping_location(worker_id, lat, lng):
    with transaction() as cur:
        cur.execute(
            """
            UPDATE worker_status SET cur_lat = %s, cur_lng = %s, last_ping = now(), updated_at = now()
            WHERE worker_id = %s
            RETURNING *
            """,
            (lat, lng, worker_id),
        )
        return cur.fetchone()


def job_matches(job_id, limit=10):
    """Semantic worker suggestions for a posted job (embeds the
    description on demand rather than requiring a backfilled
    job_posts.embedding column).
    """
    with transaction() as cur:
        cur.execute("SELECT job_id, description FROM job_posts WHERE job_id = %s", (job_id,))
        job = cur.fetchone()
        if job is None or not job["description"]:
            return None
        embedding = embed(job["description"])
        return matching_service.shortlist_workers_for_job(cur, embedding, limit=limit)


def admin_dispatch_board():
    with transaction() as cur:
        cur.execute(
            """
            SELECT sr.request_id, sr.status, sr.wave_no, sr.category_hint, sr.created_at,
                   sr.assigned_worker, sr.job_id,
                   COUNT(jo.offer_id) FILTER (WHERE jo.status = 'PENDING') AS pending_offers
            FROM service_request sr
            LEFT JOIN job_offer jo ON jo.request_id = sr.request_id
            GROUP BY sr.request_id
            ORDER BY sr.created_at DESC
            LIMIT 100
            """
        )
        return cur.fetchall()
