-- =====================================================
-- KaamSetu DB : SCHEMA + CSV LOAD SCRIPT
-- Run this in psql (or pgAdmin's Query Tool if paths are
-- reachable by the SERVER — see note at the bottom).
-- =====================================================

-- ---------- 1. SCHEMA ----------

CREATE TABLE IF NOT EXISTS locations (
    location_id INT PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL
);

CREATE TABLE IF NOT EXISTS workers (
    worker_id INT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(10) UNIQUE NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male','Female','Other')),
    preferred_language VARCHAR(50),
    experience_years INT NOT NULL CHECK (experience_years >= 0),
    travel_radius_km INT CHECK (travel_radius_km >= 0),
    average_rating DECIMAL(3,2) CHECK (average_rating >= 0 AND average_rating <= 5),
    verification_status VARCHAR(20) NOT NULL CHECK (verification_status IN ('Verified','Pending')),
    availability_status VARCHAR(20) NOT NULL CHECK (availability_status IN ('Available','Busy','Offline')),
    location_id INT NOT NULL,
    created_at DATE,
    updated_at DATE,
    CONSTRAINT fk_worker_location FOREIGN KEY (location_id) REFERENCES locations(location_id)
);

CREATE TABLE IF NOT EXISTS employers (
    employer_id INT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(10) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    employer_type VARCHAR(20) NOT NULL CHECK (employer_type IN ('Individual','Household','Business')),
    verification_status VARCHAR(20) NOT NULL CHECK (verification_status IN ('Verified','Pending')),
    location_id INT NOT NULL,
    created_at DATE,
    updated_at DATE,
    CONSTRAINT fk_employer_location FOREIGN KEY (location_id) REFERENCES locations(location_id)
);

CREATE TABLE IF NOT EXISTS skills (
    skill_id INT PRIMARY KEY,
    skill_name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS worker_profiles (
    profile_id INT PRIMARY KEY,
    worker_id INT UNIQUE NOT NULL,
    raw_description TEXT,
    embedding TEXT,
    created_at DATE,
    CONSTRAINT fk_profile_worker FOREIGN KEY (worker_id) REFERENCES workers(worker_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS worker_skills (
    worker_skill_id INT PRIMARY KEY,
    worker_id INT NOT NULL,
    skill_id INT NOT NULL,
    CONSTRAINT fk_ws_worker FOREIGN KEY (worker_id) REFERENCES workers(worker_id) ON DELETE CASCADE,
    CONSTRAINT fk_ws_skill FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS job_posts (
    job_id INT PRIMARY KEY,
    employer_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    budget DECIMAL(10,2) NOT NULL CHECK (budget > 0),
    status VARCHAR(20) NOT NULL CHECK (status IN ('Open','Assigned','Completed','Cancelled')),
    location_id INT NOT NULL,
    posted_at DATE,
    CONSTRAINT fk_job_employer FOREIGN KEY (employer_id) REFERENCES employers(employer_id) ON DELETE CASCADE,
    CONSTRAINT fk_job_location FOREIGN KEY (location_id) REFERENCES locations(location_id)
);

CREATE TABLE IF NOT EXISTS job_skills (
    job_skill_id INT PRIMARY KEY,
    job_id INT NOT NULL,
    skill_id INT NOT NULL,
    CONSTRAINT fk_js_job FOREIGN KEY (job_id) REFERENCES job_posts(job_id) ON DELETE CASCADE,
    CONSTRAINT fk_js_skill FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT PRIMARY KEY,
    job_id INT NOT NULL,
    worker_id INT NOT NULL,
    booking_date DATE,
    scheduled_date DATE NOT NULL,
    booking_status VARCHAR(20) NOT NULL CHECK (booking_status IN ('Pending','Accepted','Completed','Cancelled')),
    final_price DECIMAL(10,2) CHECK (final_price >= 0),
    completion_date DATE,
    CONSTRAINT fk_booking_job FOREIGN KEY (job_id) REFERENCES job_posts(job_id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_worker FOREIGN KEY (worker_id) REFERENCES workers(worker_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
    payment_id INT PRIMARY KEY,
    booking_id INT UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('UPI','Credit Card','Debit Card','Cash','Net Banking')),
    payment_status VARCHAR(20) NOT NULL CHECK (payment_status IN ('Paid','Pending','Refunded')),
    transaction_id VARCHAR(30) UNIQUE NOT NULL,
    payment_date DATE,
    CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ratings (
    rating_id INT PRIMARY KEY,
    booking_id INT UNIQUE NOT NULL,
    employer_id INT NOT NULL,
    worker_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    rated_at DATE,
    CONSTRAINT fk_rating_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT fk_rating_employer FOREIGN KEY (employer_id) REFERENCES employers(employer_id),
    CONSTRAINT fk_rating_worker FOREIGN KEY (worker_id) REFERENCES workers(worker_id)
);

CREATE TABLE IF NOT EXISTS disputes (
    dispute_id INT PRIMARY KEY,
    booking_id INT UNIQUE NOT NULL,
    employer_id INT NOT NULL,
    worker_id INT NOT NULL,
    dispute_reason TEXT NOT NULL,
    dispute_status VARCHAR(20) NOT NULL CHECK (dispute_status IN ('Open','In Review','Resolved','Rejected')),
    created_at DATE,
    resolved_at DATE,
    CONSTRAINT fk_dispute_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT fk_dispute_employer FOREIGN KEY (employer_id) REFERENCES employers(employer_id),
    CONSTRAINT fk_dispute_worker FOREIGN KEY (worker_id) REFERENCES workers(worker_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT PRIMARY KEY,
    booking_id INT NOT NULL,
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('Worker','Employer')),
    recipient_id INT NOT NULL,
    notification_type VARCHAR(20) NOT NULL CHECK (notification_type IN ('Booking','Payment','Rating','Dispute')),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATE,
    CONSTRAINT fk_notification_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
);

-- ---------- 3. SANITY CHECK ----------
SELECT 'locations' t, COUNT(*) FROM locations
UNION ALL SELECT 'skills', COUNT(*) FROM skills
UNION ALL SELECT 'workers', COUNT(*) FROM workers
UNION ALL SELECT 'employers', COUNT(*) FROM employers
UNION ALL SELECT 'worker_profiles', COUNT(*) FROM worker_profiles
UNION ALL SELECT 'worker_skills', COUNT(*) FROM worker_skills
UNION ALL SELECT 'job_posts', COUNT(*) FROM job_posts
UNION ALL SELECT 'job_skills', COUNT(*) FROM job_skills
UNION ALL SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL SELECT 'payments', COUNT(*) FROM payments
UNION ALL SELECT 'ratings', COUNT(*) FROM ratings
UNION ALL SELECT 'disputes', COUNT(*) FROM disputes
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications;

