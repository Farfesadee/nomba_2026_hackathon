from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
from pydantic import BaseModel

from app.core.database import get_db
from app.models.qr_code import QRCode
from app.models.checkin import CheckIn
from app.models.guest import Guest
from app.models.event import Event

router = APIRouter()


class ScanRequest(BaseModel):
    token: str


@router.post("/verify")
async def verify_qr(req: ScanRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(QRCode).where(QRCode.token == req.token))
    qr = result.scalar_one_or_none()

    if not qr:
        raise HTTPException(status_code=404, detail="Invalid QR code")

    if qr.is_used:
        raise HTTPException(status_code=400, detail="QR code already used")

    if qr.expires_at and qr.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="QR code has expired")

    guest_result = await db.execute(select(Guest).where(Guest.id == qr.guest_id))
    guest = guest_result.scalar_one_or_none()

    event_result = await db.execute(select(Event).where(Event.id == qr.event_id))
    event = event_result.scalar_one_or_none()

    return {
        "valid": True,
        "guest": {
            "id": guest.id,
            "name": guest.name,
            "phone": guest.phone,
            "email": guest.email,
        } if guest else None,
        "event": {
            "id": event.id,
            "title": event.title,
            "event_date": str(event.event_date),
        } if event else None,
    }


@router.post("/scan")
async def scan_qr(req: ScanRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(QRCode).where(QRCode.token == req.token))
    qr = result.scalar_one_or_none()

    if not qr:
        raise HTTPException(status_code=404, detail="Invalid QR code")

    if qr.is_used:
        raise HTTPException(status_code=400, detail="QR code already used")

    if qr.expires_at and qr.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="QR code has expired")

    qr.is_used = True
    checkin = CheckIn(guest_id=qr.guest_id, event_id=qr.event_id)
    db.add(checkin)
    await db.commit()

    return {"status": "approved", "message": "Check-in successful"}
