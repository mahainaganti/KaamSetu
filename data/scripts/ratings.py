import pandas as pd
import random
from datetime import timedelta

# =====================================================
# FILE PATHS
# =====================================================

bookings_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\bookings.csv"

jobs_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\job_posts.csv"

output_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\ratings.csv"

# =====================================================
# READ DATA
# =====================================================

bookings_df = pd.read_csv(bookings_file)
jobs_df = pd.read_csv(jobs_file)

# =====================================================
# REVIEW TEMPLATES
# =====================================================

positive_reviews = [
    "Excellent service.",
    "Very professional.",
    "Highly recommended.",
    "Completed the work perfectly.",
    "Arrived on time and did a great job.",
    "Very satisfied with the service.",
    "Skilled and polite worker.",
    "Will definitely hire again.",
    "Good quality work.",
    "Finished before the expected time."
]

average_reviews = [
    "Work was satisfactory.",
    "Good service overall.",
    "Could have been better.",
    "Completed the job with minor issues.",
    "Average experience."
]

poor_reviews = [
    "Work was delayed.",
    "Not satisfied with the quality.",
    "Poor communication.",
    "Job was incomplete.",
    "Needs improvement."
]

# =====================================================
# CREATE JOB -> EMPLOYER LOOKUP
# =====================================================

job_to_employer = jobs_df.set_index("job_id")["employer_id"].to_dict()

# =====================================================
# GENERATE RATINGS
# =====================================================

rows = []

rating_id = 1

completed = bookings_df[
    bookings_df["booking_status"] == "Completed"
]

for _, booking in completed.iterrows():

    employer_id = job_to_employer[booking["job_id"]]

    rating = random.choices(
        [5,4,3,2,1],
        weights=[40,30,15,10,5]
    )[0]

    if rating >= 4:
        review = random.choice(positive_reviews)

    elif rating == 3:
        review = random.choice(average_reviews)

    else:
        review = random.choice(poor_reviews)

    rated_at = pd.to_datetime(
        booking["completion_date"]
    ) + timedelta(days=random.randint(0,3))

    rows.append([
        rating_id,
        booking["booking_id"],
        employer_id,
        booking["worker_id"],
        rating,
        review,
        rated_at
    ])

    rating_id += 1

# =====================================================
# SAVE
# =====================================================

ratings_df = pd.DataFrame(rows, columns=[
    "rating_id",
    "booking_id",
    "employer_id",
    "worker_id",
    "rating",
    "review",
    "rated_at"
])

ratings_df.to_csv(output_file, index=False)

print(ratings_df.head())
print(f"\nRatings Created : {len(ratings_df)}")