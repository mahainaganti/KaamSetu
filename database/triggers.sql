--triggers.

-- =====================================================
-- TRIGGERS.SQL
-- KaamSetu Database Triggers
-- =====================================================

--------------------------------------------------------
-- Trigger Function 1
-- Automatically set completion date
--------------------------------------------------------

CREATE OR REPLACE FUNCTION set_completion_date()
RETURNS TRIGGER AS
$$
BEGIN
    IF NEW.booking_status='Completed'
       AND OLD.booking_status<>'Completed' THEN

        NEW.completion_date := CURRENT_DATE;

    END IF;

    RETURN NEW;
END;
$$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_completion_date ON bookings;

CREATE TRIGGER trg_completion_date
BEFORE UPDATE
ON bookings
FOR EACH ROW
EXECUTE FUNCTION set_completion_date();

--------------------------------------------------------
-- Trigger Function 2
-- Automatically update worker availability
--------------------------------------------------------

CREATE OR REPLACE FUNCTION update_worker_availability()
RETURNS TRIGGER AS
$$
BEGIN

    IF NEW.booking_status='Completed'
    OR NEW.booking_status='Cancelled' THEN

        UPDATE workers
        SET availability_status='Available'
        WHERE worker_id=NEW.worker_id;

    END IF;

    RETURN NEW;

END;
$$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_worker_available ON bookings;

CREATE TRIGGER trg_worker_available
AFTER UPDATE
ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_worker_availability();

--------------------------------------------------------
-- Trigger Function 3
-- Automatically mark worker busy
--------------------------------------------------------

CREATE OR REPLACE FUNCTION worker_busy_after_booking()
RETURNS TRIGGER AS
$$
BEGIN

    UPDATE workers
    SET availability_status='Busy'
    WHERE worker_id=NEW.worker_id;

    RETURN NEW;

END;
$$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_worker_busy ON bookings;

CREATE TRIGGER trg_worker_busy
AFTER INSERT
ON bookings
FOR EACH ROW
EXECUTE FUNCTION worker_busy_after_booking();

--------------------------------------------------------
-- Trigger Function 4
-- Automatically create payment notification
--------------------------------------------------------

CREATE OR REPLACE FUNCTION payment_notification()
RETURNS TRIGGER AS
$$
BEGIN

INSERT INTO notifications
(
notification_id,
booking_id,
recipient_type,
recipient_id,
notification_type,
message,
is_read,
created_at
)

VALUES
(
(SELECT COALESCE(MAX(notification_id),0)+1 FROM notifications),
NEW.booking_id,
'Employer',
1,
'Payment',
'Payment Successful',
FALSE,
CURRENT_DATE
);

RETURN NEW;

END;
$$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_payment_notification ON payments;

CREATE TRIGGER trg_payment_notification
AFTER INSERT
ON payments
FOR EACH ROW
EXECUTE FUNCTION payment_notification();

--------------------------------------------------------
-- Trigger Function 5
-- Automatically create rating notification
--------------------------------------------------------

CREATE OR REPLACE FUNCTION rating_notification()
RETURNS TRIGGER AS
$$
BEGIN

INSERT INTO notifications
(
notification_id,
booking_id,
recipient_type,
recipient_id,
notification_type,
message,
is_read,
created_at
)

VALUES
(
(SELECT COALESCE(MAX(notification_id),0)+1 FROM notifications),
NEW.booking_id,
'Worker',
NEW.worker_id,
'Rating',
'You received a new rating.',
FALSE,
CURRENT_DATE
);

RETURN NEW;

END;
$$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_rating_notification ON ratings;

CREATE TRIGGER trg_rating_notification
AFTER INSERT
ON ratings
FOR EACH ROW
EXECUTE FUNCTION rating_notification();

--------------------------------------------------------
-- Trigger Function 6
-- Automatically create dispute notification
--------------------------------------------------------

CREATE OR REPLACE FUNCTION dispute_notification()
RETURNS TRIGGER AS
$$
BEGIN

INSERT INTO notifications
(
notification_id,
booking_id,
recipient_type,
recipient_id,
notification_type,
message,
is_read,
created_at
)

VALUES
(
(SELECT COALESCE(MAX(notification_id),0)+1 FROM notifications),
NEW.booking_id,
'Employer',
NEW.employer_id,
'Dispute',
'Your dispute has been registered.',
FALSE,
CURRENT_DATE
);

RETURN NEW;

END;
$$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_dispute_notification ON disputes;

CREATE TRIGGER trg_dispute_notification
AFTER INSERT
ON disputes
FOR EACH ROW
EXECUTE FUNCTION dispute_notification();

SELECT completion_date
FROM bookings
WHERE booking_id=5;

