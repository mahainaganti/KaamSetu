import pandas as pd
import random

# =====================================================
# FILE PATHS
# =====================================================

jobs_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\job_posts.csv"

skills_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\skills.csv"

output_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\job_skills.csv"

# =====================================================
# READ DATA
# =====================================================

jobs_df = pd.read_csv(jobs_file)
skills_df = pd.read_csv(skills_file)

# =====================================================
# GROUP SKILLS BY CATEGORY
# =====================================================

category_groups = {}

for category in skills_df["category"].unique():
    category_groups[category] = skills_df[
        skills_df["category"] == category
    ]["skill_id"].tolist()

# =====================================================
# MAP JOB TITLE TO CATEGORY
# =====================================================

def get_category(title):

    title = title.lower()

    if "electric" in title:
        return "Electrical"

    elif "plumber" in title or "pipe" in title:
        return "Plumbing"

    elif "carpenter" in title or "wood" in title:
        return "Carpentry"

    elif "paint" in title:
        return "Painting"

    elif "mason" in title or "tile" in title:
        return "Construction"

    elif "clean" in title:
        return "Cleaning"

    elif "ac" in title or "refrigerator" in title:
        return "HVAC"

    elif "washing" in title or "tv" in title or "microwave" in title:
        return "Home Appliances"

    elif "garden" in title:
        return "Gardening"

    elif "beaut" in title or "hair" in title or "makeup" in title:
        return "Beauty"

    elif "tailor" in title or "cloth" in title:
        return "Tailoring"

    elif "cook" in title or "catering" in title:
        return "Cooking"

    elif "driver" in title:
        return "Driving"

    elif "security" in title:
        return "Security"

    elif "packer" in title or "mover" in title:
        return "Moving Services"

    else:
        return random.choice(list(category_groups.keys()))

# =====================================================
# GENERATE JOB SKILLS
# =====================================================

rows = []

job_skill_id = 1

for _, job in jobs_df.iterrows():

    category = get_category(job["title"])

    skills = category_groups[category]

    num = min(len(skills), random.randint(2,4))

    selected = random.sample(skills, num)

    for skill in selected:

        rows.append([
            job_skill_id,
            job["job_id"],
            skill
        ])

        job_skill_id += 1

# =====================================================
# SAVE
# =====================================================

job_skills_df = pd.DataFrame(
    rows,
    columns=[
        "job_skill_id",
        "job_id",
        "skill_id"
    ]
)

job_skills_df.to_csv(output_file, index=False)

print(job_skills_df.head())

print("job_skills.csv created successfully!")