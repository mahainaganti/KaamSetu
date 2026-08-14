import pandas as pd

df = pd.read_csv(r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\raw\archive\indian_cities.csv")

df.insert(0, "location_id", range(1, len(df) + 1))

df.to_csv(r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\locations.csv", index=False)