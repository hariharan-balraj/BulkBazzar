import os
import aiosqlite

DB_PATH = os.getenv("DB_PATH", "app.db")

_SCHEMA = [
    """CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT UNIQUE NOT NULL,
        role TEXT DEFAULT 'buyer',
        name TEXT DEFAULT '',
        location_lat REAL DEFAULT 0.0,
        location_lng REAL DEFAULT 0.0,
        subscription_status TEXT DEFAULT 'free',
        created_at TEXT DEFAULT (datetime('now'))
    )""",
    """CREATE TABLE IF NOT EXISTS listings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        seller_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        category TEXT NOT NULL,
        price REAL NOT NULL,
        unit TEXT NOT NULL DEFAULT 'kg',
        quantity REAL DEFAULT 0.0,
        location_lat REAL DEFAULT 0.0,
        location_lng REAL DEFAULT 0.0,
        location_name TEXT DEFAULT '',
        media_urls_json TEXT DEFAULT '[]',
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (seller_id) REFERENCES users(id)
    )""",
    """CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        listing_id INTEGER NOT NULL,
        event_type TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (listing_id) REFERENCES listings(id)
    )""",
    "CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)",
    "CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_id, created_at)",
    "CREATE INDEX IF NOT EXISTS idx_listings_cat ON listings(category, status, created_at)",
    "CREATE INDEX IF NOT EXISTS idx_events_listing ON events(listing_id, created_at)",
    """CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        razorpay_subscription_id TEXT,
        plan_type TEXT NOT NULL,
        upi_id TEXT DEFAULT '',
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )""",
]


async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("PRAGMA journal_mode=WAL")
        for stmt in _SCHEMA:
            await db.execute(stmt)
        await db.commit()


async def get_db():
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA journal_mode=WAL")
    try:
        yield db
    finally:
        await db.close()
