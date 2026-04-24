import os

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import init_db
from routes_auth import router as auth_router
from routes_listings import router as listings_router
from routes_events import router as events_router
from routes_media import router as media_router
from routes_payment import router as payment_router

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:5173,https://bulkbazaar.in,https://www.bulkbazaar.in"
).split(",")

app = FastAPI(title="BulkBazaar API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("media", exist_ok=True)
app.mount("/media", StaticFiles(directory="media"), name="media")

app.include_router(auth_router)
app.include_router(listings_router)
app.include_router(events_router)
app.include_router(media_router)
app.include_router(payment_router)


@app.on_event("startup")
async def startup():
    await init_db()
    await _auto_seed()


async def _auto_seed():
    import asyncio
    import aiosqlite
    import seed as seed_module
    async with aiosqlite.connect("app.db") as db:
        cur = await db.execute("SELECT COUNT(*) FROM listings")
        count = (await cur.fetchone())[0]
    if count == 0:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, seed_module.main)
        print("Auto-seeded 30 demo listings")


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
