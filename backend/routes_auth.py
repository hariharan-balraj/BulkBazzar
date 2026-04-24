from fastapi import APIRouter, Depends, HTTPException
import aiosqlite

from database import get_db
from auth_utils import generate_otp, verify_otp, create_access_token
from deps import get_current_user_id
from schemas import OTPRequest, OTPVerify, UserUpdate

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/request-otp")
async def request_otp(body: OTPRequest, db: aiosqlite.Connection = Depends(get_db)):
    phone = body.phone.strip()
    if not phone or len(phone) < 10:
        raise HTTPException(400, "Valid phone number required")
    otp = generate_otp(phone)
    return {"message": "OTP sent", "otp_dev": otp}


@router.post("/verify-otp")
async def verify_otp_route(body: OTPVerify, db: aiosqlite.Connection = Depends(get_db)):
    phone = body.phone.strip()
    if not verify_otp(phone, body.otp):
        raise HTTPException(400, "Invalid or expired OTP")

    async with db.execute("SELECT id, role, name FROM users WHERE phone = ?", (phone,)) as cur:
        user = await cur.fetchone()

    is_new = user is None
    if is_new:
        role = body.role or "buyer"
        name = body.name or ""
        await db.execute(
            "INSERT INTO users (phone, role, name) VALUES (?, ?, ?)",
            (phone, role, name),
        )
        await db.commit()
        async with db.execute("SELECT id, role, name FROM users WHERE phone = ?", (phone,)) as cur:
            user = await cur.fetchone()

    token = create_access_token(user["id"], phone)
    return {
        "token": token,
        "user": {"id": user["id"], "phone": phone, "role": user["role"], "name": user["name"]},
        "is_new_user": is_new,
    }


@router.get("/me")
async def get_me(
    user_id: int = Depends(get_current_user_id),
    db: aiosqlite.Connection = Depends(get_db),
):
    async with db.execute("SELECT * FROM users WHERE id = ?", (user_id,)) as cur:
        user = await cur.fetchone()
    if not user:
        raise HTTPException(404, "User not found")
    return dict(user)


@router.put("/me")
async def update_me(
    body: UserUpdate,
    user_id: int = Depends(get_current_user_id),
    db: aiosqlite.Connection = Depends(get_db),
):
    data = {k: v for k, v in body.dict().items() if v is not None}
    if not data:
        raise HTTPException(400, "No data to update")
    set_sql = ", ".join(f"{k} = ?" for k in data)
    await db.execute(f"UPDATE users SET {set_sql} WHERE id = ?", (*data.values(), user_id))
    await db.commit()
    return {"message": "Updated"}
