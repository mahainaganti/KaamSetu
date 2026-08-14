--procedures.sql

-- =====================================================
-- PROCEDURES.SQL
-- KaamSetu Stored Procedures
-- =====================================================

--------------------------------------------------------
-- Procedure 1 : Add New Worker
--------------------------------------------------------

CREATE OR REPLACE PROCEDURE add_worker(
    p_worker_id INT,
    p_full_name VARCHAR,
    p_phone VARCHAR,
    p_gender VARCHAR,
    p_language VARCHAR,
    p_experience INT,
    p_radius INT,
    p_rating NUMERIC,
    p_verification VARCHAR,
    p_availability VARCHAR,
    p_location INT,
    p_created DATE,
    p_updated DATE
)
LANGUAGE plpgsql
AS
$$
BEGIN
    INSERT INTO workers
    VALUES (
        p_worker_id,
        p_full_name,
        p_phone,
        p_gender,
        p_language,
        p_experience,
        p_radius,
        p_rating,
        p_verification,
        p_availability,
        p_location,
        p_created,
        p_updated
    );
END;
$$;

--------------------------------------------------------
-- Procedure 2 : Update Worker Availability
--------------------------------------------------------

CREATE OR REPLACE PROCEDURE update_worker_status(
    p_worker_id INT,
    p_status VARCHAR
)
LANGUAGE plpgsql
AS
$$
BEGIN
    UPDATE workers
    SET availability_status = p_status
    WHERE worker_id = p_worker_id;
END;
$$;

--------------------------------------------------------
-- Procedure 3 : Update Worker Rating
--------------------------------------------------------

CREATE OR REPLACE PROCEDURE update_worker_rating(
    p_worker_id INT,
    p_rating NUMERIC
)
LANGUAGE plpgsql
AS
$$
BEGIN
    UPDATE workers
    SET average_rating = p_rating
    WHERE worker_id = p_worker_id;
END;
$$;

--------------------------------------------------------
-- Procedure 4 : Create Payment
--------------------------------------------------------

CREATE OR REPLACE PROCEDURE make_payment(
    p_payment_id INT,
    p_booking_id INT,
    p_amount NUMERIC,
    p_method VARCHAR,
    p_status VARCHAR,
    p_transaction VARCHAR,
    p_date DATE
)
LANGUAGE plpgsql
AS
$$
BEGIN
    INSERT INTO payments(
        payment_id,
        booking_id,
        amount,
        payment_method,
        payment_status,
        transaction_id,
        payment_date
    )
    VALUES(
        p_payment_id,
        p_booking_id,
        p_amount,
        p_method,
        p_status,
        p_transaction,
        p_date
    );
END;
$$;

--------------------------------------------------------
-- Procedure 5 : Cancel Booking
--------------------------------------------------------

CREATE OR REPLACE PROCEDURE cancel_booking(
    p_booking_id INT
)
LANGUAGE plpgsql
AS
$$
BEGIN
    UPDATE bookings
    SET booking_status='Cancelled'
    WHERE booking_id=p_booking_id;
END;
$$;

--------------------------------------------------------
-- Procedure 6 : Mark Booking Completed
--------------------------------------------------------

CREATE OR REPLACE PROCEDURE complete_booking(
    p_booking_id INT
)
LANGUAGE plpgsql
AS
$$
BEGIN
    UPDATE bookings
    SET booking_status='Completed',
        completion_date=CURRENT_DATE
    WHERE booking_id=p_booking_id;
END;
$$;

--------------------------------------------------------
-- Procedure 7 : Resolve Dispute
--------------------------------------------------------

CREATE OR REPLACE PROCEDURE resolve_dispute(
    p_dispute_id INT
)
LANGUAGE plpgsql
AS
$$
BEGIN
    UPDATE disputes
    SET dispute_status='Resolved',
        resolved_at=CURRENT_DATE
    WHERE dispute_id=p_dispute_id;
END;
$$;

--------------------------------------------------------
-- Procedure 8 : Mark Notification Read
--------------------------------------------------------

CREATE OR REPLACE PROCEDURE mark_notification_read(
    p_notification_id INT
)
LANGUAGE plpgsql
AS
$$
BEGIN
    UPDATE notifications
    SET is_read=TRUE
    WHERE notification_id=p_notification_id;
END;
$$;

CALL update_worker_status(10,'Busy');

CALL update_worker_rating(10,4.95);

CALL complete_booking(25);

CALL cancel_booking(40);

CALL resolve_dispute(3);