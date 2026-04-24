from pydantic import BaseModel
from typing import Optional, List


class OTPRequest(BaseModel):
    phone: str


class OTPVerify(BaseModel):
    phone: str
    otp: str
    role: Optional[str] = None
    name: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None


class ListingCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    category: str
    price: float
    unit: str = "kg"
    quantity: Optional[float] = 0.0
    location_lat: Optional[float] = 0.0
    location_lng: Optional[float] = 0.0
    location_name: Optional[str] = ""
    media_urls: Optional[List[str]] = []


class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    unit: Optional[str] = None
    quantity: Optional[float] = None
    location_name: Optional[str] = None
    media_urls: Optional[List[str]] = None
    status: Optional[str] = None


class EventCreate(BaseModel):
    listing_id: int
    event_type: str
