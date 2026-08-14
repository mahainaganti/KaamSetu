import pandas as pd

skills = [

# Electrical
("Electrician","Electrical"),
("House Wiring","Electrical"),
("Fan Installation","Electrical"),
("Light Installation","Electrical"),
("Switch Repair","Electrical"),

# Plumbing
("Plumber","Plumbing"),
("Pipe Repair","Plumbing"),
("Leak Detection","Plumbing"),
("Bathroom Fitting","Plumbing"),
("Water Tank Installation","Plumbing"),

# Carpentry
("Carpenter","Carpentry"),
("Furniture Assembly","Carpentry"),
("Door Repair","Carpentry"),
("Wood Polishing","Carpentry"),

# Painting
("Painter","Painting"),
("Wall Painting","Painting"),
("Interior Painting","Painting"),
("Exterior Painting","Painting"),

# Masonry
("Mason","Construction"),
("Tile Installation","Construction"),
("Concrete Work","Construction"),
("Brick Work","Construction"),

# Cleaning
("House Cleaning","Cleaning"),
("Deep Cleaning","Cleaning"),
("Bathroom Cleaning","Cleaning"),
("Kitchen Cleaning","Cleaning"),

# HVAC
("AC Technician","HVAC"),
("AC Installation","HVAC"),
("AC Repair","HVAC"),
("Refrigerator Repair","HVAC"),

# Appliances
("Washing Machine Repair","Home Appliances"),
("TV Repair","Home Appliances"),
("Microwave Repair","Home Appliances"),

# Gardening
("Gardener","Gardening"),
("Lawn Maintenance","Gardening"),
("Tree Trimming","Gardening"),

# Beauty
("Beautician","Beauty"),
("Hair Stylist","Beauty"),
("Makeup Artist","Beauty"),

# Tailoring
("Tailor","Tailoring"),
("Cloth Stitching","Tailoring"),
("Alteration","Tailoring"),

# Cooking
("Cook","Cooking"),
("Catering","Cooking"),

# Driving
("Driver","Driving"),

# Security
("Security Guard","Security"),

# Moving
("Packers","Moving Services"),
("Movers","Moving Services")

]

df = pd.DataFrame(skills, columns=["skill_name","category"])

df.insert(0,"skill_id",range(1,len(df)+1))

output_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\skills.csv"

df.to_csv(output_file,index=False)

print(df.head())
print(f"\nTotal Skills : {len(df)}")