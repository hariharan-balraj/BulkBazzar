# SourceDirect — B2B Source Discovery Marketplace

Mobile-first platform connecting buyers directly with farms, manufacturers, and wholesalers.

## Stack
- **Frontend**: React + Vite (port 3000)
- **Backend**: FastAPI + Python (port 8000)
- **Database**: SQLite (`backend/app.db`)
- **Auth**: OTP + JWT (SMS simulated in dev mode)

## Quick Start

### 1. Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env        # edit SECRET_KEY
uvicorn main:app --reload
```
Backend runs at http://localhost:8000
API docs at http://localhost:8000/docs

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at http://localhost:3000

---
Or use the provided `start.bat` to launch both at once (Windows).

## Features (MVP)
- OTP login via mobile number (dev: OTP shown on screen)
- Role selection: Buyer or Seller
- **Buyer**: Browse listings by category, view details, WhatsApp / Call seller
- **Seller**: Create listings with images, price, quantity, location; view dashboard with view & contact metrics
- Categories: Agriculture, Livestock & Food, Textile, Manufacturing
- Image upload (stored in `backend/media/`)

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/request-otp | Send OTP |
| POST | /auth/verify-otp | Verify OTP → JWT |
| GET | /auth/me | Get current user |
| PUT | /auth/me | Update profile |
| GET | /listings | Browse listings (filter by category) |
| POST | /listings | Create listing (seller) |
| GET | /listings/{id} | Get single listing |
| PUT | /listings/{id} | Update listing |
| DELETE | /listings/{id} | Delete listing |
| GET | /listings/my-listings | Seller's own listings |
| POST | /events/view | Track listing view |
| POST | /events/contact | Track contact click |
| POST | /upload/image | Upload image |
