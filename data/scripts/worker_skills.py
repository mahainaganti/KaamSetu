import pandas as pd
import random

# =====================================================
# FILE PATHS
# =====================================================

workers_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\workers.csv"

skills_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\skills.csv"

output_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\worker_skills.csv"

# =====================================================
# READ FILES
# =====================================================

workers_df = pd.read_csv(workers_file)
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
# GENERATE WORKER SKILLS
# =====================================================

rows = []

worker_skill_id = 1

for worker_id in workers_df["worker_id"]:

    # Choose ONE profession/category
    category = random.choice(list(category_groups.keys()))

    skill_list = category_groups[category]

    # Worker gets 2–4 skills from that category
    num_skills = min(len(skill_list), random.randint(2, 4))

    selected_skills = random.sample(skill_list, num_skills)

    for skill in selected_skills:

        rows.append([
            worker_skill_id,
            worker_id,
            skill
        ])

        worker_skill_id += 1

# =====================================================
# SAVE
# =====================================================

worker_skills_df = pd.DataFrame(
    rows,
    columns=[
        "worker_skill_id",
        "worker_id",
        "skill_id"
    ]
)

worker_skills_df.to_csv(output_file, index=False)

print("worker_skills.csv created successfully!")
print(worker_skills_df.head())