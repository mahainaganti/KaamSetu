import pandas as pd
import random
from datetime import datetime, timedelta

# =====================================================
# FILE PATHS
# =====================================================

names_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\raw\indian_names.csv"

locations_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\locations.csv"

output_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\employers.csv"

# =====================================================
# READ FILES
# =====================================================

names_df = pd.read_csv(names_file)
locations_df = pd.read_csv(locations_file)

# =====================================================
# NUMBER OF EMPLOYERS
# =====================================================

# Choose how many employers you want
n = 500

# Pick unique names
random_names = names_df["Name"].sample(n=n, replace=False).reset_index(drop=True)

# =====================================================
# CREATE DATAFRAME
# =====================================================

employer_df = pd.DataFrame()

employer_df["employer_id"] = range(1, n + 1)
employer_df["full_name"] = random_names

# =====================================================
# PHONE NUMBERS
# =====================================================

phones = []

for _ in range(n):
    first = random.choice([6, 7, 8, 9])
    phone = str(first) + "".join(str(random.randint(0, 9)) for _ in range(9))
    phones.append(phone)

employer_df["phone"] = phones

# =====================================================
# EMAIL
# =====================================================

emails = []

for name in employer_df["full_name"]:

    username = name.lower().replace(" ", ".")

    number = random.randint(100,999)

    emails.append(f"{username}{number}@gmail.com")

employer_df["email"] = emails

# =====================================================
# EMPLOYER TYPE
# =====================================================

employer_df["employer_type"] = [

    random.choices(
        ["Individual", "Household", "Business"],
        weights=[60, 20, 20]
    )[0]

    for _ in range(n)

]

# =====================================================
# VERIFICATION STATUS
# =====================================================

employer_df["verification_status"] = [

    random.choices(
        ["Verified", "Pending"],
        weights=[80,20]
    )[0]

    for _ in range(n)

]

# =====================================================
# LOCATION
# =====================================================

location_ids = locations_df["location_id"].tolist()

employer_df["location_id"] = [

    random.choice(location_ids)

    for _ in range(n)

]

# =====================================================
# CREATED / UPDATED
# =====================================================

base = datetime(2025,1,1)

dates = []

for _ in range(n):

    d = base + timedelta(days=random.randint(0,365))

    dates.append(d)

employer_df["created_at"] = dates
employer_df["updated_at"] = dates

# =====================================================
# SAVE
# =====================================================

employer_df.to_csv(output_file,index=False)

print("employers.csv created successfully!")

print(employer_df.head())
