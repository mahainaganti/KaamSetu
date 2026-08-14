import pandas as pd
import random
from datetime import timedelta

# =====================================================
# FILE PATHS
# =====================================================

bookings_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\bookings.csv"

jobs_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\job_posts.csv"

output_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\disputes.csv"

# =====================================================
# READ DATA
# =====================================================

bookings_df = pd.read_csv(bookings_file)
jobs_df = pd.read_csv(jobs_file)

# =====================================================
# JOB -> EMPLOYER LOOKUP
# =====================================================

job_to_employer = jobs_df.set_index("job_id")["employer_id"].to_dict()

# =====================================================
# DISPUTE REASONS
# =====================================================

reasons = [
    "Worker did not arrive",
    "Poor quality of work",
    "Incomplete work",
    "Overcharged",
    "Damaged property",
    "Late arrival",
    "Payment disagreement",
    "Incorrect service provided",
    "Unprofessional behaviour",
    "Job took longer than expected"
]

statuses = [
    "Open",
    "In Review",
    "Resolved",
    "Rejected"
]

# =====================================================
# GENERATE DISPUTES
# =====================================================

rows = []

dispute_id = 1

for _, booking in bookings_df.iterrows():

    create_dispute = False

    if booking["booking_status"] == "Completed":

        # 10% completed bookings
        create_dispute = random.random() < 0.10

    elif booking["booking_status"] == "Cancelled":

        # 50% cancelled bookings
        create_dispute = random.random() < 0.50

    if not create_dispute:
        continue

    employer_id = job_to_employer[booking["job_id"]]

    created_at = pd.to_datetime(
        booking["booking_date"]
    ) + timedelta(days=random.randint(1,7))

    dispute_status = random.choices(
        statuses,
        weights=[15,20,55,10]
    )[0]

    if dispute_status == "Resolved":

        resolved_at = created_at + timedelta(days=random.randint(2,14))

    else:

        resolved_at = None

    rows.append([

        dispute_id,

        booking["booking_id"],

        employer_id,

        booking["worker_id"],

        random.choice(reasons),

        dispute_status,

        created_at,

        resolved_at

    ])

    dispute_id += 1

# =====================================================
# SAVE
# =====================================================

disputes_df = pd.DataFrame(rows, columns=[

    "dispute_id",

    "booking_id",

    "employer_id",

    "worker_id",

    "dispute_reason",

    "dispute_status",

    "created_at",

    "resolved_at"

])

disputes_df.to_csv(output_file, index=False)

print(disputes_df.head())

print(f"\nDisputes Created : {len(disputes_df)}")