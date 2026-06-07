import secrets
import hmac
import hashlib
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
import httpx

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.wallet import Wallet, WalletTransaction

router = APIRouter()


class FundRequest(BaseModel):
    amount: float


class WalletPayRequest(BaseModel):
    amount: float
    description: str


async def get_or_create_wallet(user: User, db: AsyncSession) -> Wallet:
    result = await db.execute(select(Wallet).where(Wallet.user_id == user.id))
    wallet = result.scalar_one_or_none()
    if not wallet:
        wallet = Wallet(user_id=user.id, balance=0.0)
        db.add(wallet)
        await db.commit()
        await db.refresh(wallet)
    return wallet


@router.get("/wallet")
async def get_wallet(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    wallet = await get_or_create_wallet(user, db)
    txns = await db.execute(
        select(WalletTransaction).where(
            WalletTransaction.wallet_id == wallet.id
        ).order_by(WalletTransaction.created_at.desc()).limit(50)
    )
    return {
        "id": wallet.id,
        "balance": wallet.balance,
        "currency": wallet.currency,
        "transactions": txns.scalars().all(),
    }


@router.post("/wallet/fund")
async def fund_wallet(
    req: FundRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if req.amount < 100:
        raise HTTPException(status_code=400, detail="Minimum funding amount is ₦100")

    wallet = await get_or_create_wallet(user, db)
    reference = f"WAL-{secrets.token_hex(8).upper()}"

    tx = WalletTransaction(
        wallet_id=wallet.id,
        amount=req.amount,
        type="credit",
        reference=reference,
        description="Wallet top-up",
        status="pending",
    )
    db.add(tx)
    await db.commit()

    paystack_url = None
    if settings.PAYSTACK_SECRET_KEY:
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://api.paystack.co/transaction/initialize",
                    json={
                        "email": user.email,
                        "amount": int(req.amount * 100),
                        "reference": reference,
                        "callback_url": f"{settings.FRONTEND_URL}/dashboard/wallet?reference={reference}",
                    },
                    headers={
                        "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
                        "Content-Type": "application/json",
                    },
                )
                data = resp.json()
                if data.get("status"):
                    paystack_url = data["data"]["authorization_url"]
        except Exception:
            pass

    return {
        "reference": reference,
        "amount": req.amount,
        "authorization_url": paystack_url,
    }


@router.post("/wallet/pay")
async def pay_with_wallet(
    req: WalletPayRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    wallet = await get_or_create_wallet(user, db)
    if wallet.balance < req.amount:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")

    reference = f"WPD-{secrets.token_hex(8).upper()}"
    wallet.balance -= req.amount

    tx = WalletTransaction(
        wallet_id=wallet.id,
        amount=-req.amount,
        type="debit",
        reference=reference,
        description=req.description,
        status="completed",
    )
    db.add(tx)
    await db.commit()

    return {
        "reference": reference,
        "amount": req.amount,
        "balance": wallet.balance,
    }


@router.post("/wallet/webhook/{provider}")
async def wallet_webhook(
    provider: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    body = await request.body()
    payload = json.loads(body)

    if provider == "paystack":
        signature = request.headers.get("x-paystack-signature", "")
        expected = hmac.new(
            settings.PAYSTACK_SECRET_KEY.encode(),
            body,
            hashlib.sha512,
        ).hexdigest()
        if not hmac.compare_digest(signature, expected):
            raise HTTPException(status_code=400, detail="Invalid signature")

        if payload.get("event") != "charge.success":
            return {"status": "ignored"}

        data = payload.get("data", {})
        if data.get("status") != "success":
            return {"status": "ignored"}

        reference = data.get("reference")
        if not reference or not reference.startswith("WAL-"):
            return {"status": "ignored"}

        result = await db.execute(
            select(WalletTransaction).where(WalletTransaction.reference == reference)
        )
        tx = result.scalar_one_or_none()
        if tx and tx.status == "pending":
            tx.status = "completed"

            wallet_result = await db.execute(
                select(Wallet).where(Wallet.id == tx.wallet_id)
            )
            wallet = wallet_result.scalar_one_or_none()
            if wallet:
                wallet.balance += tx.amount

            await db.commit()

    return {"status": "ok"}
