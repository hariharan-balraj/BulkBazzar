from fastapi import APIRouter, Depends
import aiosqlite

from database import get_db
from schemas import EventCreate

router = APIRouter(prefix="/events", tags=["events"])


@router.post("/view")
async def track_view(body: EventCreate, db: aiosqlite.Connection = Depends(get_db)):
    await db.execute(
        "INSERT INTO events (listing_id, event_type) VALUES (?, 'view')", (body.listing_id,)
    )
    await db.commit()
    return {"ok": True}


@router.post("/contact")
async def track_contact(body: EventCreate, db: aiosqlite.Connection = Depends(get_db)):
    await db.execute(
        "INSERT INTO events (listing_id, event_type) VALUES (?, 'contact')", (body.listing_id,)
    )
    await db.commit()
    return {"ok": True}
