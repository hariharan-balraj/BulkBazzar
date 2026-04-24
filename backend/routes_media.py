import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from deps import get_current_user_id

MEDIA_DIR = "media"
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"}

router = APIRouter(prefix="/upload", tags=["media"])


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    user_id: int = Depends(get_current_user_id),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
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


@router.post("/video")
async def upload_video(
    file: UploadFile = File(...),
    user_id: int = Depends(get_current_user_id),
):
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(400, "Only MP4, MOV, WebM, or AVI videos are allowed")

    ext = (file.filename or "video.mp4").rsplit(".", 1)[-1].lower()
    if ext not in ("mp4", "mov", "webm", "avi"):
        ext = "mp4"

    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(MEDIA_DIR, filename)

    content = await file.read()
    if len(content) > 200 * 1024 * 1024:
        raise HTTPException(400, "Video too large (max 200 MB)")

    with open(path, "wb") as f:
        f.write(content)

    return {"url": f"/media/{filename}"}
