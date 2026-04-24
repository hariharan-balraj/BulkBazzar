import os
import random
import time
from datetime import datetime, timedelta
from typing import Optional

import jwt
from jwt import InvalidTokenError

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production-please")
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))

_otp_store: dict[str, tuple[str, float]] = {}


def generate_otp(phone: str) -> str:
    otp = f"{random.randint(100000, 999999)}"
    _otp_store[phone] = (otp, time.time() + 300)
    return otp


def verify_otp(phone: str, otp: str) -> bool:
    if phone not in _otp_store:
        return False
    stored_otp, expires_at = _otp_store[phone]
    if time.time() > expires_at:
        _otp_store.pop(phone, None)
        return False
    if stored_otp != otp:
        return False
    _otp_store.pop(phone, None)
    return True


def create_access_token(user_id: int, phone: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": str(user_id), "phone": phone, "exp": expire},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except InvalidTokenError:
        return None
