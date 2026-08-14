import pandas as pd
import random
from datetime import datetime, timedelta

# =====================================================
# FILE PATHS
# =====================================================

employers_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\employers.csv"

locations_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\locations.csv"

skills_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\skills.csv"

output_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\job_posts.csv"

# =====================================================
# READ FILES
# =====================================================

employers_df = pd.read_csv(employers_file)
locations_df = pd.read_csv(locations_file)
skills_df = pd.read_csv(skills_file)

# =====================================================
# NUMBER OF JOB POSTS
# =====================================================

n_jobs = 2000

# =====================================================
# STATUS
# =====================================================

statuses = ["Open", "Assigned", "Completed", "Cancelled"]

# =====================================================
# CREATE JOBS
# =====================================================

rows = []

base_date = datetime(2025,1,1)

for job_id in range(1, n_jobs + 1):

    employer = employers_df.sample(1).iloc[0]

    skill = skills_df.sample(1).iloc[0]

    title = f"Need {skill['skill_name']}"

    description = (
        f"Looking for an experienced {skill['skill_name'].lower()} "
        f"to provide {skill['category'].lower()} services."
    )

    budget = random.randint(500,10000)

    status = random.choices(
        statuses,
        weights=[40,20,35,5]
    )[0]

    location = random.choice(locations_df["location_id"].tolist())

    posted = base_date + timedelta(days=random.randint(0,365))

    rows.append([
        job_id,
        employer["employer_id"],
        title,
        description,
        budget,
        status,
        location,
        posted
    ])

# =====================================================
# SAVE
# =====================================================

job_posts_df = pd.DataFrame(rows, columns=[
    "job_id",
    "employer_id",
    "title",
    "description",
    "budget",
    "status",
    "location_id",
    "posted_at"
])

job_posts_df.to_csv(output_file, index=False)

print(job_posts_df.head())

print("job_posts.csv created successfully!")