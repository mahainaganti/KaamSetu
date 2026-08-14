# KaamSetu REST API Documentation

## Base URL

```
http://127.0.0.1:5000
```

---

# Workers

## Get All Workers

GET /workers

Response

```json
[
  {
    "worker_id":1,
    "full_name":"Aakash",
    "average_rating":4.8
  }
]
```

---

## Get Worker

GET /workers/<worker_id>

Example

GET /workers/1

---

## Search Workers

GET /workers/search?language=Telugu

Example

GET /workers/search?language=Tamil

---

## Create Worker

POST /workers

Body

```json
{
    "full_name":"Rahul",
    "phone":"9876543210",
    "gender":"Male",
    "preferred_language":"Telugu",
    "experience_years":4,
    "travel_radius_km":20,
    "average_rating":4.8,
    "verification_status":"Verified",
    "availability_status":"Available",
    "location_id":10
}
```

---

## Update Worker

PUT /workers/6486

Body

Same as POST

---

## Delete Worker

DELETE /workers/6486

---

# Employers

GET /employers

GET /employers/{id}

POST /employers

PUT /employers/{id}

DELETE /employers/{id}

POST Body

```json
{
    "full_name":"ABC Industries",
    "phone":"9876543211",
    "email":"abc@gmail.com",
    "employer_type":"Business",
    "verification_status":"Verified",
    "location_id":5
}
```

---

# Jobs

GET /jobs

GET /jobs/{id}

POST /jobs

PUT /jobs/{id}

DELETE /jobs/{id}

POST Body

```json
{
    "employer_id":1,
    "title":"Electrician Required",
    "description":"Need wiring work",
    "budget":3500,
    "status":"Open",
    "location_id":15
}
```

---

# Bookings

GET /bookings

GET /bookings/{id}

POST /bookings

PUT /bookings/{id}

DELETE /bookings/{id}

POST Body

```json
{
    "job_id":1,
    "worker_id":10,
    "scheduled_date":"2026-07-25",
    "booking_status":"Pending",
    "final_price":2500,
    "completion_date":null
}
```

---

# Payments

GET /payments

GET /payments/{id}

POST /payments

PUT /payments/{id}

DELETE /payments/{id}

POST Body

```json
{
    "booking_id":2001,
    "amount":2500,
    "payment_method":"UPI",
    "payment_status":"Paid",
    "transaction_id":"TXN999999"
}
```

---

# Status Codes

200 OK

201 Created

400 Bad Request

404 Not Found

500 Internal Server Error

---

# Backend Stack

Python 3.10

Flask

PostgreSQL

psycopg2

REST API

JSON