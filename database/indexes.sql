--indexes.sql

-- =====================================================
-- INDEXES.SQL
-- KaamSetu Database Indexes
-- =====================================================

--------------------------------------------------------
-- WORKERS
--------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_workers_location
ON workers(location_id);

CREATE INDEX IF NOT EXISTS idx_workers_language
ON workers(preferred_language);

CREATE INDEX IF NOT EXISTS idx_workers_availability
ON workers(availability_status);

CREATE INDEX IF NOT EXISTS idx_workers_rating
ON workers(average_rating DESC);

CREATE INDEX IF NOT EXISTS idx_workers_verification
ON workers(verification_status);

--------------------------------------------------------
-- EMPLOYERS
--------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_employers_location
ON employers(location_id);

CREATE INDEX IF NOT EXISTS idx_employers_type
ON employers(employer_type);

--------------------------------------------------------
-- JOB POSTS
--------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_jobs_employer
ON job_posts(employer_id);

CREATE INDEX IF NOT EXISTS idx_jobs_location
ON job_posts(location_id);

CREATE INDEX IF NOT EXISTS idx_jobs_status
ON job_posts(status);

CREATE INDEX IF NOT EXISTS idx_jobs_budget
ON job_posts(budget);

--------------------------------------------------------
-- BOOKINGS
--------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_bookings_worker
ON bookings(worker_id);

CREATE INDEX IF NOT EXISTS idx_bookings_job
ON bookings(job_id);

CREATE INDEX IF NOT EXISTS idx_bookings_status
ON bookings(booking_status);

CREATE INDEX IF NOT EXISTS idx_bookings_date
ON bookings(scheduled_date);

--------------------------------------------------------
-- PAYMENTS
--------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_payments_status
ON payments(payment_status);

CREATE INDEX IF NOT EXISTS idx_payments_date
ON payments(payment_date);

--------------------------------------------------------
-- RATINGS
--------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_ratings_worker
ON ratings(worker_id);

CREATE INDEX IF NOT EXISTS idx_ratings_employer
ON ratings(employer_id);

--------------------------------------------------------
-- DISPUTES
--------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_disputes_status
ON disputes(dispute_status);

--------------------------------------------------------
-- NOTIFICATIONS
--------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_notifications_type
ON notifications(notification_type);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient
ON notifications(recipient_type, recipient_id);

--------------------------------------------------------
-- WORKER SKILLS
--------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_worker_skills_worker
ON worker_skills(worker_id);

CREATE INDEX IF NOT EXISTS idx_worker_skills_skill
ON worker_skills(skill_id);

--------------------------------------------------------
-- JOB SKILLS
--------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_job_skills_job
ON job_skills(job_id);

CREATE INDEX IF NOT EXISTS idx_job_skills_skill
ON job_skills(skill_id);

SELECT *
FROM workers
WHERE preferred_language='Telugu';

SELECT *
FROM workers
WHERE availability_status='Available';