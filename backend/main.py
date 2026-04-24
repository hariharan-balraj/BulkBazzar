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

app = FastAPI(title="Source Discovery Marketplace", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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


@app.on_event("startup")
async def startup():
    await init_db()


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
