from datetime import date
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

import orders
from database import get_connection, create_tables
from pooling import add_listing, VILLAGES

create_tables()  # runs once when the server starts; does nothing if tables exist

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",  # Vite moves to 5174 when 5173 is busy
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temporary fixed price range per crop (min, max).
# Member 4's price model replaces this later.
PRICE_RANGES = {"Tomato": (20, 24), "Onion": (18, 22), "Potato": (14, 18)}


class Listing(BaseModel):
    # Literal means: only these exact crop names are accepted
    crop: Literal["Tomato", "Onion", "Potato"]
    # Field(gt=0) means: must be greater than 0; le is the upper limit
    quantityKg: int = Field(gt=0, le=100000)
    location: str
    harvestDate: str

    @field_validator("harvestDate")
    @classmethod
    def check_date(cls, v):
        # Raises an error (HTTP 422) unless the date looks like YYYY-MM-DD
        date.fromisoformat(v)
        return v


class OrderBody(BaseModel):
    lotId: int


class OtpBody(BaseModel):
    # Exactly 4 digits, otherwise the request is refused with 422
    otp: str = Field(pattern=r"^\d{4}$")


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
    # Reject villages we have no coordinates for, instead of silently
    # treating them as Coimbatore
    if listing.location.strip().lower() not in VILLAGES:
        known = ", ".join(v.title() for v in VILLAGES)
        raise HTTPException(status_code=422, detail=f"Unknown village. Choose one of: {known}")

    conn = get_connection()
    result = add_listing(
        conn, listing.crop, listing.quantityKg, listing.location, listing.harvestDate
    )
    conn.close()
    return {"success": True, **result}


# The three order endpoints. The real work happens in orders.py.
# try/finally makes sure the database connection is closed even when
# orders.py raises an error (404, 409, ...).
@app.post("/orders")
def place_order(body: OrderBody):
    conn = get_connection()
    try:
        return orders.create_order(conn, body.lotId)
    finally:
        conn.close()


@app.post("/orders/{order_id}/confirm")
def confirm_delivery(order_id: int, body: OtpBody):
    conn = get_connection()
    try:
        return orders.confirm_delivery(conn, order_id, body.otp)
    finally:
        conn.close()


@app.get("/orders/{order_id}")
def get_order(order_id: int):
    conn = get_connection()
    try:
        return orders.get_order(conn, order_id)
    finally:
        conn.close()