-- Query 1

SELECT *
FROM workers;

-- Query 2

SELECT
    full_name,
    phone,
    average_rating
FROM workers;

-- Query 3

SELECT *
FROM workers
WHERE verification_status='Verified';

-- Query 4

SELECT *
FROM workers
WHERE availability_status='Available';

-- Query 5

SELECT *
FROM workers
WHERE experience_years > 5;

-- Query 6

SELECT *
FROM workers
WHERE preferred_language='Telugu';

-- Query 7

SELECT *
FROM workers
WHERE average_rating > 4.5;

-- Query 8

SELECT
    full_name,
    average_rating
FROM workers
ORDER BY average_rating DESC;

-- Query 9

SELECT
    full_name,
    average_rating
FROM workers
ORDER BY average_rating DESC
LIMIT 10;

-- Query 10

SELECT COUNT(*) AS total_workers
FROM workers;
