# KaamSetu

KaamSetu is a web-based service marketplace platform that connects skilled blue-collar and domestic workers with employers seeking services.

## Overview

KaamSetu provides an end-to-end management system for hiring, scheduling, paying, and rating service workers. The application features a Next.js (TypeScript) frontend that communicates with a Flask REST API backend, which interfaces directly with a PostgreSQL database.

---

## Technology Stack

* **Frontend**: Next.js 16 (React 19, TypeScript, TailwindCSS v4, PostCSS)
* **Backend**: Python 3.10+, Flask, Flask-CORS, `psycopg2`
* **Database**: PostgreSQL (Relational schema with custom functions, triggers, views, and indexes)

---

## Project Structure

```text
DBMS/
├── backend/
│   ├── app.py                # Flask application entry point & CORS configuration
│   ├── config.py             # Environment configuration loader
│   ├── database.py           # PostgreSQL connection management
│   ├── errors.py             # Centralized API error handling
│   ├── validators.py         # Request body validation logic
│   ├── .env.example          # Backend environment variables template
│   ├── API_DOCUMENTATION.md  # Detailed API endpoint reference
│   ├── routes/               # API Blueprint route definitions
│   └── services/             # Core business & SQL query logic
├── frontend/
│   ├── app/                  # Next.js App Router (pages and layouts)
│   ├── components/           # Reusable UI components (Navbar, Sidebar)
│   ├── lib/                  # Client utilities (API fetcher)
│   ├── .env.example          # Frontend environment variables template
│   └── package.json          # Frontend dependencies & scripts
├── database/
│   ├── schema.sql            # Table definitions & schema DDL
│   ├── functions.sql         # SQL stored functions
│   ├── procedures.sql        # SQL stored procedures
│   ├── triggers.sql         # SQL triggers and automated routines
│   ├── views.sql            # Database views for analytics and reports
│   └── indexes.sql          # Performance optimization indexes
└── data/                     # Raw dataset and generation scripts
```

---

## Features

The implemented core modules include:

* **Workers**: Register, view, search, update, and delete worker profiles (including skill sets, experience, location, and rating details).
* **Employers**: Manage employer profiles (individuals, households, or businesses).
* **Jobs**: Post, update, view, and remove job listings with budget allocation and location tracking.
* **Bookings**: Schedule and track service bookings between employers and workers.
* **Payments**: Manage transaction records (UPI, Credit/Debit Card, Net Banking, Cash) linked to completed bookings.
* **Ratings**: Submit ratings and reviews (1-5 scale) for completed bookings.

---

## Database

The PostgreSQL database manages relational data across 13 core entities:

* **`locations`**: Cities, states, and geographical coordinates.
* **`workers`**: Worker biographical data, ratings, verification, and availability status.
* **`employers`**: Employer types, contact info, and location links.
* **`skills`**: Master list of trade skills and categories.
* **`worker_profiles`**: Extended text descriptions and embedding data.
* **`worker_skills`**: Junction table mapping workers to skills.
* **`job_posts`**: Job requirements, budgets, and status lifecycle.
* **`job_skills`**: Junction table mapping jobs to required skills.
* **`bookings`**: Job assignment, scheduling dates, and completion status.
* **`payments`**: Transaction records, amounts, payment methods, and statuses.
* **`ratings`**: Scores and text reviews for completed bookings.
* **`disputes`**: Conflict resolution tracking between employers and workers.
* **`notifications`**: System alerts for booking and payment status updates.

---

## Backend Setup

### Prerequisites
* Python 3.10+
* PostgreSQL server running locally

### Installation & Execution

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # Linux/macOS:
   source venv/bin/activate
   ```

3. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your local database credentials:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` with your PostgreSQL database parameters (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`).*

5. Run the Flask development server:
   ```bash
   python app.py
   ```
   The backend API will start on `http://127.0.0.1:5000`.

---

## Frontend Setup

### Prerequisites
* Node.js 18+
* npm or yarn

### Installation & Execution

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env.local` file in the `frontend/` directory (refer to `.env.example`):
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The web frontend will start on `http://localhost:3000`.

---

## API Modules

Base URL: `http://127.0.0.1:5000`

### Workers
* `GET /workers` - Fetch all worker summary records
* `GET /workers/<id>` - Fetch detailed profile for a worker
* `GET /workers/search?language=<lang>` - Filter workers by preferred language
* `POST /workers` - Create a new worker record
* `PUT /workers/<id>` - Update worker profile details
* `DELETE /workers/<id>` - Remove a worker record

### Employers
* `GET /employers` - Fetch all employer records
* `GET /employers/<id>` - Fetch a single employer record
* `POST /employers` - Create a new employer record
* `PUT /employers/<id>` - Update employer details
* `DELETE /employers/<id>` - Remove an employer record

### Jobs
* `GET /jobs` - List all job postings
* `GET /jobs/<id>` - Get specific job details
* `POST /jobs` - Post a new job
* `PUT /jobs/<id>` - Edit job posting
* `DELETE /jobs/<id>` - Cancel/remove a job posting

### Bookings
* `GET /bookings` - Retrieve all bookings
* `GET /bookings/<id>` - Get booking details by ID
* `POST /bookings` - Create a new booking
* `PUT /bookings/<id>` - Update booking status or date
* `DELETE /bookings/<id>` - Delete a booking

### Payments
* `GET /payments` - Retrieve payment records
* `GET /payments/<id>` - Get payment by ID
* `POST /payments` - Record a new payment
* `PUT /payments/<id>` - Update payment status
* `DELETE /payments/<id>` - Remove a payment record

### Ratings
* `GET /ratings` - List all ratings
* `GET /ratings/<id>` - Get single rating entry
* `POST /ratings` - Submit a worker/employer rating
* `PUT /ratings/<id>` - Update a review or score
* `DELETE /ratings/<id>` - Delete a rating entry

---

## Deployment Architecture (Target Architecture)

> **Note**: Cloud deployment has **NOT** yet been performed. The application is currently operating in a local development environment.

The planned future production setup is:

```text
[ Client Web Browser ]
         │
         ▼
[ Next.js Frontend ] ──► Hosted on Vercel
         │
         ▼ (HTTPS / REST)
[ Flask API Backend ] ──► Hosted on Render / Railway
         │
         ▼ (PostgreSQL Connection Pool)
[ Managed Database ]  ──► Cloud PostgreSQL (Neon / AWS RDS / Supabase)
```
