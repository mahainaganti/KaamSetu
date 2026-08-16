"""Two-stage semantic matching: pgvector cosine-similarity shortlist,
then a SQL re-filter/rank on distance, availability and reputation.
Shared by instant dispatch (dispatch_service) and posted-job worker
suggestions (GET /jobs/<id>/matches).

Callers pass in an open cursor (from db_pool.transaction()) so this
module never owns connection/transaction boundaries itself.
"""

from services.embedding_service import to_pgvector_literal

SEMANTIC_WEIGHT = 0.5
PROXIMITY_WEIGHT = 0.3
REPUTATION_WEIGHT = 0.2

_HAVERSINE_KM = """
    6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
            cos(radians(%(lat)s)) * cos(radians(ws.cur_lat))
            * cos(radians(ws.cur_lng) - radians(%(lng)s))
            + sin(radians(%(lat)s)) * sin(radians(ws.cur_lat))
        ))
    )
"""


def shortlist_workers_for_request(cur, embedding: list[float], lat: float, lng: float,
                                   radius_km: float, exclude_worker_ids: list[int],
                                   limit: int = 5):
    """Stage A (pgvector shortlist over worker_profiles) fused with
    Stage B (duty/freshness/distance/no-overlap SQL filters) into one
    query — cheap enough at course-project data volumes, and it keeps
    the ranking weights in one place.
    """
    embedding_literal = to_pgvector_literal(embedding)
    cur.execute(
        f"""
        SELECT w.worker_id, w.full_name, w.average_rating,
               (wp.embedding <=> %(emb)s::vector) AS sem_dist,
               ({_HAVERSINE_KM}) AS dist_km
        FROM worker_profiles wp
        JOIN workers w ON w.worker_id = wp.worker_id
        JOIN worker_status ws ON ws.worker_id = w.worker_id
        WHERE ws.duty_status = 'online'
          AND ws.last_ping > now() - interval '3 minutes'
          AND w.worker_id != ALL(%(exclude)s)
          AND wp.embedding IS NOT NULL
          AND ws.cur_lat IS NOT NULL AND ws.cur_lng IS NOT NULL
          AND NOT EXISTS (
              SELECT 1 FROM bookings b
              WHERE b.worker_id = w.worker_id
                AND b.booking_status NOT IN ('Cancelled', 'Completed')
                AND b.start_ts IS NOT NULL AND b.end_ts IS NOT NULL
                AND tsrange(b.start_ts, b.end_ts) && tsrange(now()::timestamp, (now() + interval '2 hours')::timestamp)
          )
        ORDER BY wp.embedding <=> %(emb)s::vector
        LIMIT 50
        """,
        {"emb": embedding_literal, "lat": lat, "lng": lng, "exclude": exclude_worker_ids or [-1]},
    )
    candidates = cur.fetchall()

    within_radius = [c for c in candidates if c["dist_km"] is not None and c["dist_km"] <= radius_km]

    if not within_radius:
        return []

    max_sem_dist = max(c["sem_dist"] for c in within_radius) or 1.0
    max_dist_km = max(c["dist_km"] for c in within_radius) or 1.0

    def score(c):
        sem_score = 1 - (c["sem_dist"] / max_sem_dist)
        proximity_score = 1 - (c["dist_km"] / max_dist_km)
        rating_score = float(c["average_rating"] or 0) / 5.0
        return (
            SEMANTIC_WEIGHT * sem_score
            + PROXIMITY_WEIGHT * proximity_score
            + REPUTATION_WEIGHT * rating_score
        )

    ranked = sorted(within_radius, key=score, reverse=True)
    return ranked[:limit]


def shortlist_workers_for_job(cur, embedding: list[float], limit: int = 10):
    """Posted-job mode: no live duty/distance requirement, just semantic
    similarity + reputation over all verified workers with a profile.
    """
    embedding_literal = to_pgvector_literal(embedding)
    cur.execute(
        """
        SELECT w.worker_id, w.full_name, w.average_rating,
               (wp.embedding <=> %(emb)s::vector) AS sem_dist
        FROM worker_profiles wp
        JOIN workers w ON w.worker_id = wp.worker_id
        WHERE wp.embedding IS NOT NULL
          AND w.verification_status = 'Verified'
        ORDER BY wp.embedding <=> %(emb)s::vector
        LIMIT %(limit)s
        """,
        {"emb": embedding_literal, "limit": limit},
    )
    return cur.fetchall()
