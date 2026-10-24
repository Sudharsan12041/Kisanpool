from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import get_connection, create_tables
from pooling import add_listing

create_tables()  # runs once when the server starts; does nothing if tables exist

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temporary fixed price range per crop (min, max).
# Member 4's price model replaces this later.
PRICE_RANGES = {"Tomato": (20, 24), "Onion": (18, 22), "Potato": (14, 18)}


class Listing(BaseModel):
    crop: str
    quantityKg: int
    location: str
    harvestDate: str

class OrderBody(BaseModel):
    lotId: int

class OtpBody(BaseModel):
    otp: str


@app.get("/lots")
def get_lots():
    conn = get_connection()
    # Join each lot with its listings, then total the kg and count the farmers
    rows = conn.execute("""
        SELECT lots.id, lots.crop, lots.village, lots.threshold_kg, lots.status,
               COALESCE(SUM(listings.quantity_kg), 0) AS total_kg,
               COUNT(DISTINCT listings.farmer_id) AS farmers
        FROM lots
        LEFT JOIN listings ON listings.lot_id = lots.id
        GROUP BY lots.id
    """).fetchall()
    conn.close()

    result = []
    for r in rows:
        low, high = PRICE_RANGES.get(r["crop"], (0, 0))
        result.append({
            "id": r["id"],
            "crop": r["crop"],
            "totalKg": r["total_kg"],
            "farmers": r["farmers"],
            "village": r["village"],
            "thresholdKg": r["threshold_kg"],
            "status": r["status"],
            "priceMin": low,
            "priceMax": high,
        })
    return result


@app.post("/listings")
def create_listing(listing: Listing):
    conn = get_connection()
    result = add_listing(
        conn, listing.crop, listing.quantityKg, listing.location, listing.harvestDate
    )
    conn.close()
    return {"success": True, **result}


# The endpoints below are still dummy; we replace them in the next step
@app.post("/orders")
def place_order(body: OrderBody):
    return {"orderId": 101, "status": "ESCROW_HELD"}


@app.post("/orders/{order_id}/confirm")
def confirm_delivery(order_id: int, body: OtpBody):
    return {"status": "DELIVERED"}


@app.get("/orders/{order_id}")
def get_order(order_id: int):
    return {"orderId": order_id, "status": "ESCROW_HELD"}