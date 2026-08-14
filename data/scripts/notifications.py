import pandas as pd
import random
from datetime import timedelta

# =====================================================
# FILE PATHS
# =====================================================

bookings_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\bookings.csv"

jobs_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\job_posts.csv"

disputes_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\disputes.csv"

output_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\notifications.csv"

# =====================================================
# READ DATA
# =====================================================

bookings_df = pd.read_csv(bookings_file)
jobs_df = pd.read_csv(jobs_file)
disputes_df = pd.read_csv(disputes_file)

# =====================================================
# JOB -> EMPLOYER LOOKUP
# =====================================================

job_to_employer = jobs_df.set_index("job_id")["employer_id"].to_dict()

# =====================================================
# CREATE NOTIFICATIONS
# =====================================================

rows = []

notification_id = 1

for _, booking in bookings_df.iterrows():

    booking_id = booking["booking_id"]

    employer_id = job_to_employer[booking["job_id"]]

    worker_id = booking["worker_id"]

    status = booking["booking_status"]

    created = pd.to_datetime(booking["booking_date"])

    # -------------------------------------------------
    # Worker Notification
    # -------------------------------------------------

    if status == "Pending":
        worker_msg = "A new booking request is waiting for your response."

    elif status == "Accepted":
        worker_msg = "You have accepted a new booking."

    elif status == "Completed":
        worker_msg = "Job completed successfully. Payment will be processed shortly."

    else:
        worker_msg = "The booking has been cancelled."

    rows.append([
        notification_id,
        booking_id,
        "Worker",
        worker_id,
        "Booking",
        worker_msg,
        random.choice([True, False]),
        created
    ])

    notification_id += 1

    # -------------------------------------------------
    # Employer Notification
    # -------------------------------------------------

    if status == "Pending":
        employer_msg = "Your booking request is pending."

    elif status == "Accepted":
        employer_msg = "A worker has accepted your booking."

    elif status == "Completed":
        employer_msg = "Your service has been completed. Please rate the worker."

    else:
        employer_msg = "Your booking has been cancelled."

    rows.append([
        notification_id,
        booking_id,
        "Employer",
        employer_id,
        "Booking",
        employer_msg,
        random.choice([True, False]),
        created
    ])

    notification_id += 1

# =====================================================
# DISPUTE NOTIFICATIONS
# =====================================================

for _, dispute in disputes_df.iterrows():

    created = pd.to_datetime(dispute["created_at"])

    rows.append([
        notification_id,
        dispute["booking_id"],
        "Employer",
        dispute["employer_id"],
        "Dispute",
        f"Your dispute is currently '{dispute['dispute_status']}'.",
        random.choice([True, False]),
        created
    ])

    notification_id += 1

    rows.append([
        notification_id,
        dispute["booking_id"],
        "Worker",
        dispute["worker_id"],
        "Dispute",
        "A dispute has been raised regarding one of your completed jobs.",
        random.choice([True, False]),
        created,
    ])

    notification_id += 1

# =====================================================
# SAVE
# =====================================================

notifications_df = pd.DataFrame(rows, columns=[

    "notification_id",

    "booking_id",

    "recipient_type",

    "recipient_id",

    "notification_type",

    "message",

    "is_read",

    "created_at"

])

notifications_df.to_csv(output_file,index=False)

print(notifications_df.head())

print(f"\nNotifications Created : {len(notifications_df)}")