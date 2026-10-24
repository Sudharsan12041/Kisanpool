from database import get_connection, create_tables

create_tables()
conn = get_connection()

# Do nothing if the test data was already added
count = conn.execute("SELECT COUNT(*) FROM lots").fetchone()[0]
if count > 0:
    print("Data already exists, skipping.")
else:
    # Create one tomato lot. lastrowid gives us the new row's id.
    cur = conn.execute(
        "INSERT INTO lots (crop, village, center_lat, center_lng, harvest_date) "
        "VALUES (?, ?, ?, ?, ?)",
        ("Tomato", "Coimbatore", 11.0168, 76.9558, "2026-10-28"),
    )
    lot_id = cur.lastrowid

    farmers = [("Murugan", 250), ("Lakshmi", 300), ("Selvam", 150),
               ("Kavitha", 280), ("Ravi", 220)]

    for name, kg in farmers:
        f = conn.execute(
            "INSERT INTO farmers (name, village, lat, lng) VALUES (?, ?, ?, ?)",
            (name, "Coimbatore", 11.0168, 76.9558),
        )
        conn.execute(
            "INSERT INTO listings (farmer_id, lot_id, crop, quantity_kg, harvest_date) "
            "VALUES (?, ?, ?, ?, ?)",
            (f.lastrowid, lot_id, "Tomato", kg, "2026-10-28"),
        )

    conn.commit()
    print("Test data added: 1 lot, 5 farmers, 1200 kg.")

conn.close()