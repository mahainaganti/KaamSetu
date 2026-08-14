import pandas as pd
import random
import uuid
from datetime import timedelta

# =====================================================
# FILE PATHS
# =====================================================

bookings_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\bookings.csv"

output_file = r"C:\Users\Mahallakshmi\OneDrive\Documents\S5_projects\DBMS\Dataset\processed\payments.csv"

# =====================================================
# READ BOOKINGS
# =====================================================

bookings_df = pd.read_csv(bookings_file)

# =====================================================
# PAYMENT METHODS
# =====================================================

payment_methods = [
    "UPI",
    "Credit Card",
    "Debit Card",
    "Cash",
    "Net Banking"
]

# =====================================================
# GENERATE PAYMENTS
# =====================================================

rows = []

payment_id = 1

for _, booking in bookings_df.iterrows():

    booking_status = booking["booking_status"]

    # -----------------------------
    # Payment Status
    # -----------------------------
    if booking_status == "Completed":
        payment_status = "Paid"

    elif booking_status == "Accepted":
        payment_status = "Paid"

    elif booking_status == "Pending":
        payment_status = "Pending"

    else:   # Cancelled
        payment_status = random.choice(["Refunded", "Pending"])

    # -----------------------------
    # Payment Date
    # -----------------------------
    if payment_status == "Paid":

        payment_date = pd.to_datetime(
            booking["scheduled_date"]
        ) + timedelta(days=random.randint(0,2))

    else:

        payment_date = None

    # -----------------------------
    # Transaction ID
    # -----------------------------
    transaction_id = "TXN-" + uuid.uuid4().hex[:10].upper()

    rows.append([

        payment_id,

        booking["booking_id"],

        booking["final_price"],

        random.choice(payment_methods),

        payment_status,

        transaction_id,

        payment_date

    ])

    payment_id += 1

# =====================================================
# SAVE
# =====================================================

payments_df = pd.DataFrame(rows, columns=[

    "payment_id",

    "booking_id",

    "amount",

    "payment_method",

    "payment_status",

    "transaction_id",

    "payment_date"

])

payments_df.to_csv(output_file, index=False)

print(payments_df.head())

print(f"\nPayments Created : {len(payments_df)}")