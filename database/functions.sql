--functions.sql

-- =====================================================
-- FUNCTIONS.SQL
-- KaamSetu Database Functions
-- =====================================================

--------------------------------------------------------
-- Function 1 : Total Workers
--------------------------------------------------------

CREATE OR REPLACE FUNCTION get_total_workers()
RETURNS INTEGER AS
$$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM workers
    );
END;
$$
LANGUAGE plpgsql;


--------------------------------------------------------
-- Function 2 : Total Employers
--------------------------------------------------------

CREATE OR REPLACE FUNCTION get_total_employers()
RETURNS INTEGER AS
$$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM employers
    );
END;
$$
LANGUAGE plpgsql;


--------------------------------------------------------
-- Function 3 : Total Jobs
--------------------------------------------------------

CREATE OR REPLACE FUNCTION get_total_jobs()
RETURNS INTEGER AS
$$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM job_posts
    );
END;
$$
LANGUAGE plpgsql;


--------------------------------------------------------
-- Function 4 : Total Bookings
--------------------------------------------------------

CREATE OR REPLACE FUNCTION get_total_bookings()
RETURNS INTEGER AS
$$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM bookings
    );
END;
$$
LANGUAGE plpgsql;


--------------------------------------------------------
-- Function 5 : Total Revenue
--------------------------------------------------------

CREATE OR REPLACE FUNCTION get_total_revenue()
RETURNS NUMERIC AS
$$
BEGIN
    RETURN (
        SELECT COALESCE(SUM(amount),0)
        FROM payments
        WHERE payment_status='Paid'
    );
END;
$$
LANGUAGE plpgsql;


--------------------------------------------------------
-- Function 6 : Average Worker Rating
--------------------------------------------------------

CREATE OR REPLACE FUNCTION get_average_worker_rating()
RETURNS NUMERIC AS
$$
BEGIN
    RETURN (
        SELECT ROUND(AVG(average_rating),2)
        FROM workers
    );
END;
$$
LANGUAGE plpgsql;


--------------------------------------------------------
-- Function 7 : Completed Jobs By Worker
--------------------------------------------------------

CREATE OR REPLACE FUNCTION get_completed_jobs(worker INT)
RETURNS INTEGER AS
$$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM bookings
        WHERE worker_id=worker
        AND booking_status='Completed'
    );
END;
$$
LANGUAGE plpgsql;


--------------------------------------------------------
-- Function 8 : Total Earnings By Worker
--------------------------------------------------------

CREATE OR REPLACE FUNCTION get_worker_earnings(worker INT)
RETURNS NUMERIC AS
$$
BEGIN
    RETURN (
        SELECT COALESCE(SUM(final_price),0)
        FROM bookings
        WHERE worker_id=worker
        AND booking_status='Completed'
    );
END;
$$
LANGUAGE plpgsql;


--------------------------------------------------------
-- Function 9 : Employer Total Bookings
--------------------------------------------------------

CREATE OR REPLACE FUNCTION get_employer_bookings(emp INT)
RETURNS INTEGER AS
$$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM job_posts
        WHERE employer_id=emp
    );
END;
$$
LANGUAGE plpgsql;


--------------------------------------------------------
-- Function 10 : Available Workers
--------------------------------------------------------

CREATE OR REPLACE FUNCTION get_available_workers()
RETURNS INTEGER AS
$$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM workers
        WHERE availability_status='Available'
    );
END;
$$
LANGUAGE plpgsql;


--------------------------------------------------------
-- Function 11 : Pending Payments
--------------------------------------------------------

CREATE OR REPLACE FUNCTION get_pending_payments()
RETURNS INTEGER AS
$$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM payments
        WHERE payment_status='Pending'
    );
END;
$$
LANGUAGE plpgsql;


--------------------------------------------------------
-- Function 12 : Total Notifications
--------------------------------------------------------

CREATE OR REPLACE FUNCTION get_total_notifications()
RETURNS INTEGER AS
$$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM notifications
    );
END;
$$
LANGUAGE plpgsql;

SELECT get_total_workers();

SELECT get_total_employers();

SELECT get_total_jobs();

SELECT get_total_bookings();

SELECT get_total_revenue();

SELECT get_average_worker_rating();

SELECT get_completed_jobs(15);

SELECT get_worker_earnings(15);

SELECT get_employer_bookings(20);

SELECT get_available_workers();

SELECT get_pending_payments();

SELECT get_total_notifications();