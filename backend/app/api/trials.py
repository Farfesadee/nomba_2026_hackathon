import hashlib
import json

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.trial_usage import TrialUsage

router = APIRouter()

ALLOWED_TRIAL_TYPES = {"invite", "event"}


class TrialCheckRequest(BaseModel):
    trial_type: str = Field(pattern="^(invite|event)$")
    fingerprint: str = Field(min_length=16, max_length=256)


class TrialUseRequest(TrialCheckRequest):
    payload: dict = Field(default_factory=dict)


def _hash(value: str) -> str:
    return hashlib.sha256(f"{settings.SECRET_KEY}:{value}".encode("utf-8")).hexdigest()


def _client_hash(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    ip = forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else "unknown")
    ua = request.headers.get("user-agent", "unknown")
    return _hash(f"{ip}:{ua}")


def _payload_summary(payload: dict) -> str:
    safe = {
        "title": payload.get("title"),
        "host_name": payload.get("host_name"),
        "delivery_channel": payload.get("delivery_channel"),
        "delivery_channels": payload.get("delivery_channels"),
        "guest_count": payload.get("guest_count"),
        "guest_range": payload.get("guest_range"),
        "guest_count_range": payload.get("guest_count_range"),
        "estimated_price": payload.get("estimated_price"),
        "pricing_units": payload.get("pricing_units"),
        "qr_included": payload.get("qr_included"),
    }
    return json.dumps(safe, sort_keys=True)


@router.post("/check")
async def check_trial(
    req: TrialCheckRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    fingerprint_hash = _hash(req.fingerprint)
    client_hash = _client_hash(request)
    result = await db.execute(
        select(TrialUsage).where(
            TrialUsage.trial_type == req.trial_type,
            (TrialUsage.fingerprint_hash == fingerprint_hash) | (TrialUsage.client_hash == client_hash),
        )
    )
    used = result.scalar_one_or_none() is not None
    return {"allowed": not used, "used": used}


@router.post("/use")
async def use_trial(
    req: TrialUseRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    if req.trial_type not in ALLOWED_TRIAL_TYPES:
        raise HTTPException(status_code=400, detail="Invalid trial type")

    fingerprint_hash = _hash(req.fingerprint)
    client_hash = _client_hash(request)
    result = await db.execute(
        select(TrialUsage).where(
            TrialUsage.trial_type == req.trial_type,
            (TrialUsage.fingerprint_hash == fingerprint_hash) | (TrialUsage.client_hash == client_hash),
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=409,
            detail="You have already tested this feature. Create an account to continue.",
        )

    usage = TrialUsage(
        trial_type=req.trial_type,
        fingerprint_hash=fingerprint_hash,
        client_hash=client_hash,
        summary=_payload_summary(req.payload),
    )
    db.add(usage)
    await db.commit()
    return {
        "allowed": False,
        "message": "Trial used. Create an account to continue with this event.",
    }
