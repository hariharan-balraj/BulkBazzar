import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
import aiosqlite

from database import get_db
from deps import get_current_user_id
from schemas import ListingCreate, ListingUpdate

router = APIRouter(prefix="/listings", tags=["listings"])


def _row_to_dict(row) -> dict:
    d = dict(row)
    try:
        d["media_urls"] = json.loads(d.get("media_urls_json", "[]"))
    except Exception:
        d["media_urls"] = []
    return d


# NOTE: /my-listings must be defined before /{listing_id} to avoid route conflict
@router.get("/my-listings")
async def my_listings(
    user_id: int = Depends(get_current_user_id),
    db: aiosqlite.Connection = Depends(get_db),
):
    async with db.execute(
        """SELECT l.*,
            (SELECT COUNT(*) FROM events WHERE listing_id = l.id AND event_type = 'view') as view_count,
            (SELECT COUNT(*) FROM events WHERE listing_id = l.id AND event_type = 'contact') as contact_count
           FROM listings l
           WHERE l.seller_id = ? AND l.status != 'deleted'
           ORDER BY l.created_at DESC""",
        (user_id,),
    ) as cur:
        rows = await cur.fetchall()
    return [_row_to_dict(r) for r in rows]


@router.get("")
async def get_listings(
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: aiosqlite.Connection = Depends(get_db),
):
    offset = (page - 1) * limit
    if category and category.lower() != "all":
        sql = (
            "SELECT l.*, u.name as seller_name, u.phone as seller_phone, "
            "u.subscription_status as seller_subscription "
            "FROM listings l JOIN users u ON l.seller_id = u.id "
            "WHERE l.status = 'active' AND l.category = ? "
            "ORDER BY l.created_at DESC LIMIT ? OFFSET ?"
        )
        params = (category, limit, offset)
    else:
        sql = (
            "SELECT l.*, u.name as seller_name, u.phone as seller_phone, "
            "u.subscription_status as seller_subscription "
            "FROM listings l JOIN users u ON l.seller_id = u.id "
            "WHERE l.status = 'active' "
            "ORDER BY l.created_at DESC LIMIT ? OFFSET ?"
        )
        params = (limit, offset)

    async with db.execute(sql, params) as cur:
        rows = await cur.fetchall()
    return [_row_to_dict(r) for r in rows]


@router.get("/{listing_id}")
async def get_listing(listing_id: int, db: aiosqlite.Connection = Depends(get_db)):
    async with db.execute(
        "SELECT l.*, u.name as seller_name, u.phone as seller_phone, "
        "u.subscription_status as seller_subscription "
        "FROM listings l JOIN users u ON l.seller_id = u.id WHERE l.id = ?",
        (listing_id,),
    ) as cur:
        row = await cur.fetchone()
    if not row:
        raise HTTPException(404, "Listing not found")
    return _row_to_dict(row)


@router.post("")
async def create_listing(
    body: ListingCreate,
    user_id: int = Depends(get_current_user_id),
    db: aiosqlite.Connection = Depends(get_db),
):
    async with db.execute("SELECT role FROM users WHERE id = ?", (user_id,)) as cur:
        user = await cur.fetchone()
    if not user:
        raise HTTPException(404, "User not found")
    if user["role"] != "seller":
        raise HTTPException(403, "Only sellers can create listings")

    media_json = json.dumps(body.media_urls or [])
    async with db.execute(
        """INSERT INTO listings
           (seller_id, title, description, category, price, unit,
            quantity, location_lat, location_lng, location_name, media_urls_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            user_id, body.title, body.description, body.category,
            body.price, body.unit, body.quantity,
            body.location_lat, body.location_lng, body.location_name, media_json,
        ),
    ) as cur:
        listing_id = cur.lastrowid
    await db.commit()
    return {"id": listing_id, "message": "Listing created"}


@router.put("/{listing_id}")
async def update_listing(
    listing_id: int,
    body: ListingUpdate,
    user_id: int = Depends(get_current_user_id),
    db: aiosqlite.Connection = Depends(get_db),
):
    async with db.execute("SELECT seller_id FROM listings WHERE id = ?", (listing_id,)) as cur:
        listing = await cur.fetchone()
    if not listing:
        raise HTTPException(404, "Listing not found")
    if listing["seller_id"] != user_id:
        raise HTTPException(403, "Not your listing")

    data = {k: v for k, v in body.dict().items() if v is not None}
    if "media_urls" in data:
        data["media_urls_json"] = json.dumps(data.pop("media_urls"))
    if not data:
        raise HTTPException(400, "No data to update")

    set_sql = ", ".join(f"{k} = ?" for k in data)
    await db.execute(
        f"UPDATE listings SET {set_sql} WHERE id = ?", (*data.values(), listing_id)
    )
    await db.commit()
    return {"message": "Updated"}


@router.delete("/{listing_id}")
async def delete_listing(
    listing_id: int,
    user_id: int = Depends(get_current_user_id),
    db: aiosqlite.Connection = Depends(get_db),
):
    async with db.execute("SELECT seller_id FROM listings WHERE id = ?", (listing_id,)) as cur:
        listing = await cur.fetchone()
    if not listing:
        raise HTTPException(404, "Listing not found")
    if listing["seller_id"] != user_id:
        raise HTTPException(403, "Not your listing")

    await db.execute("UPDATE listings SET status = 'deleted' WHERE id = ?", (listing_id,))
    await db.commit()
    return {"message": "Deleted"}
