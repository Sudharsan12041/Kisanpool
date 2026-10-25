"""Reset the database and load the demo data.

WARNING: this ERASES everything in kisanpool.db and starts again.
Run it before every demo or rehearsal:   python seed_demo.py
"""
from database import get_connection, create_tables
from pooling import add_listing

create_tables()
conn = get_connection()

# 1. Wipe every table and restart the id counters, so ids are predictable
#    (lot 1 = Tomato, lot 2 = Onion, lot 3 = Potato, first order = 1)
for table in ["orders", "listings", "lots", "buyers", "farmers"]:
    conn.execute(f"DELETE FROM {table}")
conn.execute("DELETE FROM sqlite_sequence")
conn.commit()

# 2. The farmers: (name, crop, kg, village, harvest date).
#    We do NOT create lots by hand. Each listing goes through the real
#    pooling logic, so the lots below are made by the algorithm itself.
FARMERS = [
    # Tomato lot around Coimbatore: 1700 kg, still OPEN (needs 300 kg more)
    ("Murugan",  "Tomato", 300, "Coimbatore",    "2026-10-28"),
    ("Lakshmi",  "Tomato", 350, "Peelamedu",     "2026-10-29"),
    ("Selvam",   "Tomato", 400, "Singanallur",   "2026-10-28"),
    ("Kavitha",  "Tomato", 280, "Vadavalli",     "2026-10-27"),
    ("Ravi",     "Tomato", 370, "Saravanampatti", "2026-10-29"),
    # Onion lot at Tiruppur: 2200 kg, READY to order
    ("Palani",   "Onion",  900, "Tiruppur",      "2026-10-30"),
    ("Meena",    "Onion",  700, "Tiruppur",      "2026-10-31"),
    ("Karthik",  "Onion",  600, "Tiruppur",      "2026-10-30"),
    # Potato lot at Mettupalayam: 800 kg, OPEN (far from full)
    ("Anbu",     "Potato", 450, "Mettupalayam",  "2026-11-02"),
    ("Devi",     "Potato", 350, "Mettupalayam",  "2026-11-03"),
]

for name, crop, kg, village, harvest in FARMERS:
    add_listing(conn, crop, kg, village, harvest)
    # add_listing names every new farmer "Farmer N". The farmer it just
    # created has the highest id, so give that one the real name.
    conn.execute(
        "UPDATE farmers SET name = ? WHERE id = (SELECT MAX(id) FROM farmers)",
        (name,),
    )
conn.commit()

# 3. The buyers
BUYERS = ["Kovai Fresh Wholesale", "Annapoorna Catering Supplies", "Southern Harvest Exports"]
for b in BUYERS:
    conn.execute("INSERT INTO buyers (name) VALUES (?)", (b,))
conn.commit()

# 4. Print what was created
print("Demo data loaded.\n")
print(f"{'lot':<4}{'crop':<8}{'village':<14}{'kg':<7}{'farmers':<9}status")
rows = conn.execute("""
    SELECT lots.id, lots.crop, lots.village, lots.status,
           SUM(listings.quantity_kg) AS kg, COUNT(*) AS n
    FROM lots JOIN listings ON listings.lot_id = lots.id
    GROUP BY lots.id
""").fetchall()
for r in rows:
    print(f"{r['id']:<4}{r['crop']:<8}{r['village']:<14}{r['kg']:<7}{r['n']:<9}{r['status']}")
print(f"\n{len(FARMERS)} farmers, {len(BUYERS)} buyers.")
conn.close()