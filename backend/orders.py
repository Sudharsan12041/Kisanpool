import secrets

from fastapi import HTTPException

# Which status may follow which. Grading (Member 3) and escrow release
# (Member 4) will use this same table in later steps.
ALLOWED_NEXT = {
    "ESCROW_HELD": ["PICKUP_SCHEDULED", "DELIVERED"],
    "PICKUP_SCHEDULED": ["DELIVERED"],
    "DELIVERED": ["GRADED"],
    "GRADED": ["PAYMENT_RELEASED"],
    "PAYMENT_RELEASED": [],
}


def _get_order_row(conn, order_id):
    row = conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return row


def set_status(conn, order_id, new_status):
    """Move an order to new_status, but only if that move is allowed."""
    order = _get_order_row(conn, order_id)
    if new_status not in ALLOWED_NEXT.get(order["status"], []):
        raise HTTPException(
            status_code=409,
            detail=f"Cannot move order from {order['status']} to {new_status}",
        )
    conn.execute("UPDATE orders SET status = ? WHERE id = ?", (new_status, order_id))
    conn.commit()


def create_order(conn, lot_id):
    lot = conn.execute("SELECT * FROM lots WHERE id = ?", (lot_id,)).fetchone()
    if lot is None:
        raise HTTPException(status_code=404, detail="Lot not found")
    if lot["status"] != "READY":
        raise HTTPException(
            status_code=409,
            detail=f"Lot is {lot['status']}; only READY lots can be ordered",
        )

    # 4-digit OTP, e.g. "0427". secrets is safer than random for codes like this.
    otp = f"{secrets.randbelow(10000):04d}"

    # The escrow hold is simulated: the order starts as ESCROW_HELD.
    # Member 4's escrow module will replace this later.
    cur = conn.execute(
        "INSERT INTO orders (lot_id, status, otp) VALUES (?, 'ESCROW_HELD', ?)",
        (lot_id, otp),
    )
    # Mark the lot as taken so nobody else can order it
    conn.execute("UPDATE lots SET status = 'ORDERED' WHERE id = ?", (lot_id,))
    conn.commit()
    return {"orderId": cur.lastrowid, "status": "ESCROW_HELD", "otp": otp}


def confirm_delivery(conn, order_id, otp):
    order = _get_order_row(conn, order_id)
    if otp != order["otp"]:
        raise HTTPException(status_code=400, detail="Wrong OTP")
    set_status(conn, order_id, "DELIVERED")
    return {"status": "DELIVERED"}


def get_order(conn, order_id):
    order = _get_order_row(conn, order_id)
    # DEMO ONLY: there is no login yet, so the OTP is returned here so the
    # buyer screen can show it. In production, only the buyer may see it.
    return {
        "orderId": order["id"],
        "lotId": order["lot_id"],
        "status": order["status"],
        "otp": order["otp"],
    }