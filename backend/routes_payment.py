import os
import hmac
import hashlib
import json
import razorpay
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from database import get_db
from deps import get_current_user_id

router = APIRouter(prefix="/payment", tags=["payment"])

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

PLAN_IDS = {
    "verified_seller": os.getenv("RAZORPAY_PLAN_VERIFIED_SELLER", ""),
    "unlimited_buyer": os.getenv("RAZORPAY_PLAN_UNLIMITED_BUYER", ""),
    "contact_pack": os.getenv("RAZORPAY_PLAN_CONTACT_PACK", ""),
}


def get_razorpay_client():
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=503, detail="Payment gateway not configured yet. Enjoy free access during the launch offer!")
    return razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


class SubscriptionRequest(BaseModel):
    plan_type: str
    upi_id: str


@router.post("/create-subscription")
async def create_subscription(
    body: SubscriptionRequest,
    user_id: int = Depends(get_current_user_id),
    db=Depends(get_db),
):
    if body.plan_type not in PLAN_IDS:
        raise HTTPException(status_code=400, detail="Invalid plan type")

    client = get_razorpay_client()
    plan_id = PLAN_IDS[body.plan_type]
    if not plan_id:
        raise HTTPException(status_code=503, detail="Plan not configured. Enjoy free access during the launch offer!")

    try:
        subscription = client.subscription.create({
            "plan_id": plan_id,
            "customer_notify": 1,
            "total_count": 12,
            "notes": {
                "user_id": str(user_id),
                "upi_id": body.upi_id,
                "plan_type": body.plan_type,
            },
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment gateway error: {str(e)}")

    async with db.execute(
        "INSERT INTO subscriptions (user_id, razorpay_subscription_id, plan_type, upi_id, status) VALUES (?, ?, ?, ?, 'pending')",
        (user_id, subscription["id"], body.plan_type, body.upi_id),
    ):
        await db.commit()

    return {
        "subscription_id": subscription["id"],
        "key_id": RAZORPAY_KEY_ID,
        "plan_type": body.plan_type,
    }


@router.post("/webhook")
async def payment_webhook(request: Request, db=Depends(get_db)):
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")

    if RAZORPAY_KEY_SECRET:
        expected = hmac.new(RAZORPAY_KEY_SECRET.encode(), body, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, signature):
            raise HTTPException(status_code=400, detail="Invalid webhook signature")

    event = json.loads(body)
    event_type = event.get("event", "")

    if event_type == "subscription.activated":
        sub = event["payload"]["subscription"]["entity"]
        sub_id = sub["id"]
        notes = sub.get("notes", {})
        user_id = notes.get("user_id")
        plan_type = notes.get("plan_type", "")

        if user_id:
            if plan_type == "verified_seller":
                await db.execute(
                    "UPDATE users SET subscription_status = 'verified' WHERE id = ?",
                    (user_id,),
                )
            elif plan_type in ("unlimited_buyer", "contact_pack"):
                await db.execute(
                    "UPDATE users SET subscription_status = ? WHERE id = ?",
                    (plan_type, user_id),
                )
            await db.execute(
                "UPDATE subscriptions SET status = 'active' WHERE razorpay_subscription_id = ?",
                (sub_id,),
            )
            await db.commit()

    elif event_type == "subscription.cancelled":
        sub_id = event["payload"]["subscription"]["entity"]["id"]
        notes = event["payload"]["subscription"]["entity"].get("notes", {})
        user_id = notes.get("user_id")
        if user_id:
            await db.execute(
                "UPDATE users SET subscription_status = 'free' WHERE id = ?",
                (user_id,),
            )
            await db.execute(
                "UPDATE subscriptions SET status = 'cancelled' WHERE razorpay_subscription_id = ?",
                (sub_id,),
            )
            await db.commit()

    return {"status": "ok"}


@router.get("/config")
async def get_payment_config():
    return {
        "razorpay_configured": bool(RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET),
        "key_id": RAZORPAY_KEY_ID if RAZORPAY_KEY_ID else None,
    }
