-- =====================================================
-- MIGRATION_DISPATCH.SQL
-- Instant-request dispatch, masked calling, semantic matching.
-- Additive to schema.sql — run after it. Idempotent (IF NOT EXISTS
-- / DROP ... IF EXISTS everywhere) so it can be re-run safely.
-- =====================================================

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ---------- 1. Semantic embeddings ----------

-- worker_profiles.embedding was a placeholder TEXT column; retype to a
-- real vector. Safe: the column has never been populated by app code.
ALTER TABLE worker_profiles
    ALTER COLUMN embedding TYPE vector(384) USING NULL;

ALTER TABLE job_posts
    ADD COLUMN IF NOT EXISTS embedding vector(384);

CREATE INDEX IF NOT EXISTS idx_worker_profiles_embedding
    ON worker_profiles USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_job_posts_embedding
    ON job_posts USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ---------- 2. Live worker duty state ----------

CREATE TABLE IF NOT EXISTS worker_status (
    worker_id INT PRIMARY KEY REFERENCES workers(worker_id) ON DELETE CASCADE,
    duty_status VARCHAR(20) NOT NULL DEFAULT 'offline'
        CHECK (duty_status IN ('offline', 'online', 'offered', 'engaged')),
    cur_lat DECIMAL(9,6),
    cur_lng DECIMAL(9,6),
    last_ping TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------- 3. Instant service requests ----------

CREATE TABLE IF NOT EXISTS service_request (
    request_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES employers(employer_id) ON DELETE CASCADE,
    raw_text TEXT NOT NULL,
    embedding vector(384),
    category_hint VARCHAR(50),
    urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high')),
    lat DECIMAL(9,6) NOT NULL,
    lng DECIMAL(9,6) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SEARCHING'
        CHECK (status IN ('SEARCHING', 'OFFERED', 'ASSIGNED', 'IN_PROGRESS',
                           'COMPLETED', 'CANCELLED', 'EXPIRED')),
    wave_no INT NOT NULL DEFAULT 1,
    assigned_worker INT REFERENCES workers(worker_id),
    job_id INT REFERENCES job_posts(job_id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    assigned_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_service_request_status ON service_request(status);

-- ---------- 4. Wave-dispatched offers ----------

CREATE TABLE IF NOT EXISTS job_offer (
    offer_id SERIAL PRIMARY KEY,
    request_id INT NOT NULL REFERENCES service_request(request_id) ON DELETE CASCADE,
    worker_id INT NOT NULL REFERENCES workers(worker_id) ON DELETE CASCADE,
    wave_no INT NOT NULL,
    offered_at TIMESTAMP NOT NULL DEFAULT now(),
    expires_at TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'LOST')),
    UNIQUE (request_id, worker_id)
);

CREATE INDEX IF NOT EXISTS idx_job_offer_pending
    ON job_offer(status) WHERE status = 'PENDING';

-- ---------- 5. Overlap-free booking (instant + posted) ----------

ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS start_ts TIMESTAMP,
    ADD COLUMN IF NOT EXISTS end_ts TIMESTAMP;

-- Only enforced once a booking actually carries a time range (instant
-- bookings populate these; legacy posted-job rows may leave them null
-- and are unaffected).
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_no_overlap;
ALTER TABLE bookings
    ADD CONSTRAINT bookings_no_overlap
    EXCLUDE USING gist (
        worker_id WITH =,
        tsrange(start_ts, end_ts) WITH &&
    ) WHERE (start_ts IS NOT NULL AND end_ts IS NOT NULL
             AND booking_status NOT IN ('Cancelled', 'Completed'));

-- ---------- 6. Masked call bridge ----------

CREATE TABLE IF NOT EXISTS call_session (
    session_id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    virtual_number VARCHAR(20) NOT NULL,
    customer_id INT NOT NULL REFERENCES employers(employer_id),
    worker_id INT NOT NULL REFERENCES workers(worker_id),
    active_from TIMESTAMP NOT NULL DEFAULT now(),
    active_until TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired'))
);

-- At most one active session per virtual number at a time.
CREATE UNIQUE INDEX IF NOT EXISTS idx_call_session_active_number
    ON call_session(virtual_number) WHERE status = 'active';

CREATE TABLE IF NOT EXISTS call_log (
    log_id SERIAL PRIMARY KEY,
    session_id INT NOT NULL REFERENCES call_session(session_id) ON DELETE CASCADE,
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('customer_to_worker', 'worker_to_customer')),
    started_at TIMESTAMP NOT NULL DEFAULT now(),
    duration_seconds INT
);
