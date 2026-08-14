import pandas as pd
import random
from datetime import datetime, timedelta

# =====================================================
# FILE PATHS
# =====================================================

workers_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\workers.csv"

jobs_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\job_posts.csv"

worker_skills_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\worker_skills.csv"

job_skills_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\job_skills.csv"

output_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\bookings.csv"

# =====================================================
# READ FILES
# =====================================================

workers_df = pd.read_csv(workers_file)
jobs_df = pd.read_csv(jobs_file)
worker_skills_df = pd.read_csv(worker_skills_file)
job_skills_df = pd.read_csv(job_skills_file)

# =====================================================
# BUILD LOOKUPS
# =====================================================

worker_skill_map = worker_skills_df.groupby("skill_id")["worker_id"].apply(list).to_dict()

job_skill_map = job_skills_df.groupby("job_id")["skill_id"].apply(list).to_dict()

# =====================================================
# STATUS
# =====================================================

statuses = ["Completed", "Accepted", "Pending", "Cancelled"]

# =====================================================
# GENERATE BOOKINGS
# =====================================================

rows = []

booking_id = 1

base_date = datetime(2025,1,1)

for _, job in jobs_df.iterrows():

    job_id = job["job_id"]

    required_skills = job_skill_map.get(job_id, [])

    eligible_workers = set()

    for skill in required_skills:

        if skill in worker_skill_map:

            eligible_workers.update(worker_skill_map[skill])

    # If no matching worker exists, skip the job
    if len(eligible_workers) == 0:
        continue

    worker = random.choice(list(eligible_workers))

    booking_date = base_date + timedelta(days=random.randint(0,365))

    scheduled_date = booking_date + timedelta(days=random.randint(1,7))

    status = random.choices(
        statuses,
        weights=[60,20,15,5]
    )[0]

    price = random.randint(500,10000)

    if status == "Completed":

        completion_date = scheduled_date + timedelta(days=random.randint(0,2))

    else:

        completion_date = None

    rows.append([
        booking_id,
        job_id,
        worker,
        booking_date,
        scheduled_date,
        status,
        price,
        completion_date
    ])

    booking_id += 1

# =====================================================
# SAVE
# =====================================================

bookings_df = pd.DataFrame(rows, columns=[
    "booking_id",
    "job_id",
    "worker_id",
    "booking_date",
    "scheduled_date",
    "booking_status",
    "final_price",
    "completion_date"
])

bookings_df.to_csv(output_file,index=False)

print(bookings_df.head())

print(f"\nBookings Created : {len(bookings_df)}")