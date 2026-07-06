"""Nomba payment integration routes — sits alongside Paystack/Flutterwave"""

import secrets
import json
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.wallet import Wallet, WalletTransaction, DEFAULT_BALANCES
from app.services.nomba_service import (
    create_checkout_order,
    verify_transaction,
    transfer_to_bank,
    verify_webhook_signature,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/nomba", tags=["Nomba"])


class NombaCheckoutRequest(BaseModel):
    amount: float
    currency: str = "NGN"
    description: Optional[str] = None
    sub_account_id: Optional[str] = None


class NombaWithdrawRequest(BaseModel):
    bank_code: str
    account_number: str
    account_name: str
    amount: float


async def get_or_create_wallet(user: User, db: AsyncSession) -> Wallet:
    result = await db.execute(select(Wallet).where(Wallet.user_id == user.id))
    wallet = result.scalar_one_or_none()
    if not wallet:
        wallet = Wallet(user_id=user.id, balance=0.0, balances=dict(DEFAULT_BALANCES))
        db.add(wallet)
        await db.commit()
        await db.refresh(wallet)
    elif not wallet.balances or wallet.balances == {}:
        wallet.balances = dict(DEFAULT_BALANCES)
        await db.commit()
        await db.refresh(wallet)
    return wallet


@router.post("/checkout")
async def nomba_checkout(
    req: NombaCheckoutRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a Nomba checkout order for wallet funding or ticket purchase."""
    if req.currency != "NGN":
        raise HTTPException(status_code=400, detail="Nomba currently supports NGN only")

    if not settings.NOMBA_CLIENT_ID:
        raise HTTPException(status_code=503, detail="Nomba payment is not configured")

    order_reference = f"NMB-{secrets.token_hex(8).upper()}"
    callback_url = f"{settings.FRONTEND_URL}/dashboard/wallet?reference={order_reference}&provider=nomba"

    result = await create_checkout_order(
        amount=req.amount,
        currency=req.currency,
        customer_email=user.email,
        order_reference=order_reference,
        callback_url=callback_url,
    )

    if not result or not result.get("data"):
        logger.error(f"Nomba checkout failed: {result}")
        raise HTTPException(status_code=502, detail="Failed to create Nomba checkout order")

    data = result["data"]

    wallet = await get_or_create_wallet(user, db)
    tx = WalletTransaction(
        wallet_id=wallet.id,
        amount=req.amount,
        currency=req.currency,
        type="credit",
        reference=order_reference,
        description=f"Wallet top-up via Nomba ({req.currency})",
        status="pending",
    )
    db.add(tx)
    await db.commit()

    checkout_link = data.get("checkoutLink")
    if not checkout_link:
        logger.error(f"Nomba checkout response missing checkoutLink: {result}")
        raise HTTPException(status_code=502, detail="No payment URL returned")

    return {
        "authorization_url": checkout_link,
        "order_reference": order_reference,
        "checkout_link": checkout_link,
    }


@router.post("/webhook")
async def nomba_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Receive and process Nomba webhook events."""
    body = await request.body()
    payload_str = body.decode()
    payload = json.loads(payload_str)

    signature = request.headers.get("nomba-signature", "")
    timestamp = request.headers.get("nomba-timestamp", "")

    if not signature or not timestamp:
        logger.warning("[Nomba Webhook] Missing signature headers")
        return {"status": "accepted"}

    if not verify_webhook_signature(signature, timestamp, settings.NOMBA_WEBHOOK_SECRET, payload_str):
        logger.warning("[Nomba Webhook] Invalid signature")
        return {"status": "accepted"}

    event_type = payload.get("event_type", "")
    data = payload.get("data", {})

    logger.info(f"[Nomba Webhook] Event: {event_type}")

    if event_type == "payment_success" or event_type == "charge.success":
        reference = data.get("merchant_ref") or data.get("orderReference") or data.get("reference", "")
        amount = float(data.get("transactionAmount", data.get("amount", 0)))

        if reference:
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
                    cur = tx.currency or "NGN"
                    balances = wallet.balances or dict(DEFAULT_BALANCES)
                    balances[cur] = balances.get(cur, 0.0) + tx.amount
                    wallet.balances = balances
                await db.commit()
                logger.info(f"[Nomba Webhook] Wallet credited: ref={reference}, amount={amount}")

    return {"status": "ok"}


@router.get("/verify/{reference}")
async def nomba_verify(
    reference: str,
    db: AsyncSession = Depends(get_db),
):
    """Verify a Nomba transaction status by order reference."""
    tx_result = await db.execute(
        select(WalletTransaction).where(WalletTransaction.reference == reference)
    )
    tx = tx_result.scalar_one_or_none()

    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return {
        "status": tx.status,
        "reference": reference,
        "amount": tx.amount,
        "currency": tx.currency,
    }


@router.post("/withdraw")
async def nomba_withdraw(
    req: NombaWithdrawRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Withdraw funds from wallet to bank via Nomba Transfers API."""
    if not settings.NOMBA_CLIENT_ID:
        raise HTTPException(status_code=503, detail="Nomba not configured")

    wallet = await get_or_create_wallet(user, db)
    balances = wallet.balances or dict(DEFAULT_BALANCES)
    current_balance = balances.get("NGN", 0.0)

    if req.amount > current_balance:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    reference = f"NMBW-{secrets.token_hex(8).upper()}"

    balances["NGN"] -= req.amount
    wallet.balances = balances

    tx = WalletTransaction(
        wallet_id=wallet.id,
        amount=req.amount,
        currency="NGN",
        type="debit",
        reference=reference,
        description=f"Withdrawal via Nomba to {req.account_name}",
        status="pending",
    )
    db.add(tx)
    await db.commit()

    try:
        result = await transfer_to_bank(
            bank_code=req.bank_code,
            account_number=req.account_number,
            account_name=req.account_name,
            amount=req.amount,
            merchant_tx_ref=reference,
            narration=f"Wallet withdrawal by {user.full_name or user.email}",
        )
        tx_status = (result or {}).get("data", {}).get("status", "")
        if result and tx_status in ("SUCCESS", "PENDING_BILLING"):
            tx.status = "completed" if tx_status == "SUCCESS" else "pending"
            await db.commit()
        else:
            balances["NGN"] += req.amount
            wallet.balances = balances
            tx.status = "failed"
            await db.commit()
            logger.error(f"Nomba transfer failed: {result}")
            raise HTTPException(status_code=502, detail="Transfer failed")
    except HTTPException:
        raise
    except Exception as e:
        balances["NGN"] += req.amount
        wallet.balances = balances
        tx.status = "failed"
        await db.commit()
        logger.error(f"Nomba withdrawal error: {e}")
        raise HTTPException(status_code=502, detail="Transfer failed")

    return {
        "status": "completed",
        "reference": reference,
        "amount": req.amount,
        "currency": "NGN",
        "message": "Withdrawal initiated",
    }
