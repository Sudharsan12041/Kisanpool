import math
from datetime import date

RADIUS_KM = 15      # farmers must be within this distance of the lot's center
WINDOW_DAYS = 3     # harvest dates must be within this many days of the lot's date

# Demo-only lookup: the form sends a place name, not coordinates.
# Keys are lowercase. Add more villages here as needed.
VILLAGES = {
    "coimbatore": (11.0168, 76.9558),
    "peelamedu": (11.0285, 77.0270),
    "singanallur": (10.9993, 77.0287),
    "vadavalli": (11.0260, 76.9040),
    "saravanampatti": (11.0780, 77.0000),
    "mettupalayam": (11.2998, 76.9366),
    "pollachi": (10.6609, 77.0048),
    "tiruppur": (11.1085, 77.3411),
}
DEFAULT_LOCATION = "coimbatore"  # used when the typed place isn't in the list above


def haversine_km(lat1, lng1, lat2, lng2):
    """Straight-line distance in km between two latitude/longitude points."""
    r = 6371  # Earth's radius in km
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = p2 - p1
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def lookup_coords(location):
    return VILLAGES.get(location.strip().lower(), VILLAGES[DEFAULT_LOCATION])


def add_listing(conn, crop, quantity_kg, location, harvest_date):
    lat, lng = lookup_coords(location)
    village = location.strip().title()

    # 1. Create a farmer row. There is no login yet, so each submission
    #    becomes a new "Farmer N". Real accounts would replace this.
    n = conn.execute("SELECT COUNT(*) FROM farmers").fetchone()[0] + 1
    farmer = conn.execute(
        "INSERT INTO farmers (name, village, lat, lng) VALUES (?, ?, ?, ?)",
        (f"Farmer {n}", village, lat, lng),
    )
    farmer_id = farmer.lastrowid

    # 2. Look for an OPEN lot of the same crop that is close enough and
    #    has a harvest date within the window
    lot_id = None
    open_lots = conn.execute(
        "SELECT * FROM lots WHERE crop = ? AND status = 'OPEN'", (crop,)
    ).fetchall()

    for lot in open_lots:
        distance = haversine_km(lat, lng, lot["center_lat"], lot["center_lng"])
        days_apart = abs(
            (date.fromisoformat(harvest_date) - date.fromisoformat(lot["harvest_date"])).days
        )
        if distance <= RADIUS_KM and days_apart <= WINDOW_DAYS:
            lot_id = lot["id"]
            break  # first match wins

    # 3. No match: start a new lot centered on this farmer
    if lot_id is None:
        cur = conn.execute(
            "INSERT INTO lots (crop, village, center_lat, center_lng, harvest_date) "
            "VALUES (?, ?, ?, ?, ?)",
            (crop, village, lat, lng, harvest_date),
        )
        lot_id = cur.lastrowid

    # 4. Attach the listing to the lot
    conn.execute(
        "INSERT INTO listings (farmer_id, lot_id, crop, quantity_kg, harvest_date) "
        "VALUES (?, ?, ?, ?, ?)",
        (farmer_id, lot_id, crop, quantity_kg, harvest_date),
    )

    # 5. Re-count the lot's total and mark it READY once it reaches the truckload target
    total = conn.execute(
        "SELECT COALESCE(SUM(quantity_kg), 0) FROM listings WHERE lot_id = ?", (lot_id,)
    ).fetchone()[0]
    threshold = conn.execute(
        "SELECT threshold_kg FROM lots WHERE id = ?", (lot_id,)
    ).fetchone()[0]
    status = "READY" if total >= threshold else "OPEN"
    conn.execute("UPDATE lots SET status = ? WHERE id = ?", (status, lot_id))

    conn.commit()
    return {"lotId": lot_id, "totalKg": total, "status": status}