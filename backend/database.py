import os
import sqlite3

# Store the database file next to this code, so it's the same file
# no matter which folder you start the server from
DB_FILE = os.path.join(os.path.dirname(__file__), "kisanpool.db")


def get_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row  # lets us read columns by name: row["crop"]
    return conn


def create_tables():
    conn = get_connection()
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS farmers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        village TEXT NOT NULL,
        lat REAL,
        lng REAL
    );

    CREATE TABLE IF NOT EXISTS lots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        crop TEXT NOT NULL,
        village TEXT NOT NULL,
        center_lat REAL,
        center_lng REAL,
        harvest_date TEXT NOT NULL,
        threshold_kg INTEGER NOT NULL DEFAULT 2000,
        status TEXT NOT NULL DEFAULT 'OPEN'
    );

    CREATE TABLE IF NOT EXISTS listings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        farmer_id INTEGER NOT NULL REFERENCES farmers(id),
        lot_id INTEGER REFERENCES lots(id),
        crop TEXT NOT NULL,
        quantity_kg INTEGER NOT NULL,
        harvest_date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS buyers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lot_id INTEGER NOT NULL REFERENCES lots(id),
        buyer_id INTEGER REFERENCES buyers(id),
        status TEXT NOT NULL DEFAULT 'ORDER_PLACED',
        otp TEXT
    );
    """)
    conn.commit()
    conn.close()