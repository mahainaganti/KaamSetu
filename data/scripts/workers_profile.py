import pandas as pd
import random
from datetime import datetime, timedelta

# =====================================================
# FILE PATHS
# =====================================================

workers_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\workers.csv"

skills_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\skills.csv"

output_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\worker_profiles.csv"

# =====================================================
# READ FILES
# =====================================================

workers_df = pd.read_csv(workers_file)
skills_df = pd.read_csv(skills_file)

# =====================================================
# DESCRIPTION GENERATION
# =====================================================

descriptions = []

for _, worker in workers_df.iterrows():

    skill = random.choice(skills_df["skill_name"].tolist())

    desc = (
        f"Experienced {skill.lower()} with "
        f"{worker['experience_years']} years of experience. "
        f"Speaks {worker['preferred_language']}. "
        f"Available to travel up to {worker['travel_radius_km']} km. "
        f"Current rating is {worker['average_rating']}."
    )

    descriptions.append(desc)

# =====================================================
# CREATED DATE
# =====================================================

base = datetime(2025,1,1)

created = []

for _ in range(len(workers_df)):
    created.append(base + timedelta(days=random.randint(0,365)))

# =====================================================
# CREATE DATAFRAME
# =====================================================

profiles_df = pd.DataFrame()

profiles_df["profile_id"] = range(1, len(workers_df)+1)

profiles_df["worker_id"] = workers_df["worker_id"]

profiles_df["raw_description"] = descriptions

# Leave embeddings empty for now
profiles_df["embedding"] = ""

profiles_df["created_at"] = created

# =====================================================
# SAVE
# =====================================================

profiles_df.to_csv(output_file, index=False)

print("worker_profiles.csv created successfully!")
print(profiles_df.head())