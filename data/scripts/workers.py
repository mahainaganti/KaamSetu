import pandas as pd
import random
from datetime import datetime, timedelta

# ===========================
# FILE PATHS
# ===========================

names_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\raw\indian_names.csv"

locations_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\locations.csv"

output_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\workers.csv"

# ===========================
# READ DATA
# ===========================

names_df = pd.read_csv(names_file)
names_df = names_df.dropna(subset=["Name"])
names_df = names_df[names_df["Name"].str.strip() != ""]

locations_df = pd.read_csv(locations_file)

# Rename Name -> full_name
names_df.rename(columns={"Name": "full_name"}, inplace=True)

# Worker IDs
names_df.insert(0, "worker_id", range(1, len(names_df) + 1))

# ===========================
# RANDOM DATA
# ===========================

languages = [
    "English",
    "Hindi",
    "Telugu",
    "Tamil",
    "Kannada",
    "Malayalam"
]

verification = [
    "Verified",
    "Pending"
]

availability = [
    "Available",
    "Busy",
    "Offline"
]

# Available location IDs
location_ids = locations_df["location_id"].tolist()

# ===========================
# GENERATE PHONE NUMBERS
# ===========================

phones = []

for _ in range(len(names_df)):
    phone = random.choice([6,7,8,9])
    phone = str(phone) + "".join(str(random.randint(0,9)) for _ in range(9))
    phones.append(phone)

names_df["phone"] = phones

# ===========================
# GENDER
# ===========================

names_df["gender"] = [
    random.choice(["Male","Female"])
    for _ in range(len(names_df))
]

# ===========================
# LANGUAGE
# ===========================

names_df["preferred_language"] = [
    random.choice(languages)
    for _ in range(len(names_df))
]

# ===========================
# EXPERIENCE
# ===========================

names_df["experience_years"] = [
    random.randint(0,20)
    for _ in range(len(names_df))
]

# ===========================
# TRAVEL RADIUS
# ===========================

names_df["travel_radius_km"] = [
    random.randint(5,50)
    for _ in range(len(names_df))
]

# ===========================
# RATING
# ===========================

names_df["average_rating"] = [
    round(random.uniform(3.5,5.0),2)
    for _ in range(len(names_df))
]

# ===========================
# VERIFICATION
# ===========================

names_df["verification_status"] = [
    random.choice(verification)
    for _ in range(len(names_df))
]

# ===========================
# AVAILABILITY
# ===========================

names_df["availability_status"] = [
    random.choice(availability)
    for _ in range(len(names_df))
]

# ===========================
# LOCATION
# ===========================

names_df["location_id"] = [
    random.choice(location_ids)
    for _ in range(len(names_df))
]

# ===========================
# CREATED & UPDATED
# ===========================

base_date = datetime(2025,1,1)

created = []

for _ in range(len(names_df)):
    d = base_date + timedelta(days=random.randint(0,365))
    created.append(d)

names_df["created_at"] = created
names_df["updated_at"] = created

# ===========================
# SAVE
# ===========================

names_df.to_csv(output_file,index=False)

print("workers.csv created successfully!")
print(names_df.head())

