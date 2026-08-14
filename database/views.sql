-- =====================================================
-- KAAMSETU
-- VIEWS.SQL
-- =====================================================

-- =====================================================
-- VIEW 1
-- VERIFIED WORKERS
-- =====================================================

CREATE OR REPLACE VIEW verified_workers AS

SELECT
    worker_id,
    full_name,
    phone,
    preferred_language,
    experience_years,
    average_rating,
    availability_status
FROM workers
WHERE verification_status = 'Verified';


-- Test
SELECT * FROM verified_workers;



-- =====================================================
-- VIEW 2
-- AVAILABLE WORKERS
-- =====================================================

CREATE OR REPLACE VIEW available_workers AS

SELECT
    worker_id,
    full_name,
    phone,
    average_rating,
    location_id
FROM workers
WHERE availability_status = 'Available';


-- Test
SELECT * FROM available_workers;



-- =====================================================
-- VIEW 3
-- WORKER COMPLETE PROFILE
-- =====================================================

CREATE OR REPLACE VIEW worker_complete_profile AS

SELECT

    w.worker_id,

    w.full_name,

    w.phone,

    w.gender,

    w.preferred_language,

    w.experience_years,

    w.travel_radius_km,

    w.average_rating,

    wp.raw_description,

    l.city,

    l.state

FROM workers w

JOIN worker_profiles wp

ON w.worker_id = wp.worker_id

JOIN locations l

ON w.location_id = l.location_id;


-- Test
SELECT * FROM worker_complete_profile;



-- =====================================================
-- VIEW 4
-- EMPLOYERS WITH LOCATION
-- =====================================================

CREATE OR REPLACE VIEW employer_details AS

SELECT

    e.employer_id,

    e.full_name,

    e.phone,

    e.email,

    e.employer_type,

    l.city,

    l.state

FROM employers e

JOIN locations l

ON e.location_id = l.location_id;


-- Test
SELECT * FROM employer_details;



-- =====================================================
-- VIEW 5
-- OPEN JOBS
-- =====================================================

CREATE OR REPLACE VIEW open_jobs AS

SELECT

    j.job_id,

    e.full_name AS employer,

    j.title,

    j.budget,

    l.city,

    l.state,

    j.posted_at

FROM job_posts j

JOIN employers e

ON j.employer_id = e.employer_id

JOIN locations l

ON j.location_id = l.location_id

WHERE j.status = 'Open';


-- Test
SELECT * FROM open_jobs;



-- =====================================================
-- VIEW 6
-- BOOKING DETAILS
-- =====================================================

CREATE OR REPLACE VIEW booking_details AS

SELECT

    b.booking_id,

    w.full_name AS worker,

    e.full_name AS employer,

    j.title,

    b.booking_status,

    b.final_price,

    b.scheduled_date

FROM bookings b

JOIN workers w

ON b.worker_id = w.worker_id

JOIN job_posts j

ON b.job_id = j.job_id

JOIN employers e

ON j.employer_id = e.employer_id;


-- Test
SELECT * FROM booking_details;



-- =====================================================
-- VIEW 7
-- PAYMENT SUMMARY
-- =====================================================

CREATE OR REPLACE VIEW payment_summary AS

SELECT

    p.payment_id,

    b.booking_id,

    p.amount,

    p.payment_method,

    p.payment_status,

    p.payment_date

FROM payments p

JOIN bookings b

ON p.booking_id = b.booking_id;


-- Test
SELECT * FROM payment_summary;



-- =====================================================
-- VIEW 8
-- WORKER RATINGS
-- =====================================================

CREATE OR REPLACE VIEW worker_ratings AS

SELECT

    w.worker_id,

    w.full_name,

    r.rating,

    r.review,

    r.rated_at

FROM ratings r

JOIN workers w

ON r.worker_id = w.worker_id;


-- Test
SELECT * FROM worker_ratings;



-- =====================================================
-- VIEW 9
-- ACTIVE DISPUTES
-- =====================================================

CREATE OR REPLACE VIEW active_disputes AS

SELECT

    d.dispute_id,

    w.full_name AS worker,

    e.full_name AS employer,

    d.dispute_reason,

    d.dispute_status,

    d.created_at

FROM disputes d

JOIN workers w

ON d.worker_id = w.worker_id

JOIN employers e

ON d.employer_id = e.employer_id

WHERE d.dispute_status IN ('Open','In Review');


-- Test
SELECT * FROM active_disputes;



-- =====================================================
-- VIEW 10
-- NOTIFICATION HISTORY
-- =====================================================

CREATE OR REPLACE VIEW notification_history AS

SELECT

    notification_id,

    recipient_type,

    recipient_id,

    notification_type,

    message,

    is_read,

    created_at

FROM notifications;


-- Test
SELECT * FROM notification_history;