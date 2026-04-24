import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from deps import get_current_user_id

MEDIA_DIR = "media"
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}

router = APIRouter(prefix="/upload", tags=["media"])


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    user_id: int = Depends(get_current_user_id),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Only JPEG, PNG, WebP, or GIF images are allowed")

    ext = (file.filename or "image.jpg").rsplit(".", 1)[-1].lower()
    if ext not in ("jpg", "jpeg", "png", "webp", "gif"):
        ext = "jpg"

    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(MEDIA_DIR, filename)

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(400, "File too large (max 10 MB)")

    with open(path, "wb") as f:
        f.write(content)

    return {"url": f"/media/{filename}"}
