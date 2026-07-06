import hmac
import hashlib
import logging
import httpx
from datetime import datetime, timezone

from app.core.config import settings

logger = logging.getLogger(__name__)

NOMBA_AUTH_URL = f"{settings.NOMBA_BASE_URL}/v1/auth/token/issue"
NOMBA_CHECKOUT_URL = f"{settings.NOMBA_BASE_URL}/v1/checkout/order"
NOMBA_REQUERY_URL = f"{settings.NOMBA_BASE_URL}/v1/transaction/requery"
NOMBA_TRANSFER_BANK_URL = f"{settings.NOMBA_BASE_URL}/v2/transfers/bank"


async def get_access_token() -> str | None:
    if not settings.NOMBA_CLIENT_ID or not settings.NOMBA_CLIENT_SECRET:
        logger.error("Nomba not configured: missing client_id or client_secret")
        return None
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                NOMBA_AUTH_URL,
                headers={
                    "Content-Type": "application/json",
                    "accountId": settings.NOMBA_ACCOUNT_ID,
                },
                json={
                    "grant_type": "client_credentials",
                    "client_id": settings.NOMBA_CLIENT_ID,
                    "client_secret": settings.NOMBA_CLIENT_SECRET,
                },
            )
            data = resp.json()
            token = data.get("data", {}).get("access_token")
            if not token:
                logger.error(f"Nomba auth failed: {data}")
            return token
    except Exception as e:
        logger.error(f"Nomba auth error: {e}")
        return None


async def create_checkout_order(
    amount: float,
    currency: str,
    customer_email: str,
    order_reference: str,
    callback_url: str,
) -> dict | None:
    token = await get_access_token()
    if not token:
        return None
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                NOMBA_CHECKOUT_URL,
                headers={
                    "Content-Type": "application/json",
                    "accountId": settings.NOMBA_ACCOUNT_ID,
                    "Authorization": f"Bearer {token}",
                },
                json={
                    "order": {
                        "orderReference": order_reference,
                        "amount": f"{amount:.2f}",
                        "currency": currency,
                        "customerEmail": customer_email,
                        "callbackUrl": callback_url,
                    }
                },
            )
            data = resp.json()
            logger.info(f"Nomba checkout response: {data}")
            return data
    except Exception as e:
        logger.error(f"Nomba checkout error: {e}")
        return None


async def get_checkout_status(order_reference: str) -> dict | None:
    """Query Nomba checkout status by orderReference."""
    token = await get_access_token()
    if not token:
        return None
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{settings.NOMBA_BASE_URL}/v1/checkout/transaction",
                params={"idType": "orderReference", "id": order_reference},
                headers={
                    "accountId": settings.NOMBA_ACCOUNT_ID,
                    "Authorization": f"Bearer {token}",
                },
            )
            data = resp.json()
            logger.info(f"Nomba checkout status response: {data}")
            return data
    except Exception as e:
        logger.error(f"Nomba checkout status error: {e}")
        return None


async def verify_transaction(session_id: str) -> dict | None:
    token = await get_access_token()
    if not token:
        return None
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{NOMBA_REQUERY_URL}/{session_id}",
                headers={
                    "accountId": settings.NOMBA_ACCOUNT_ID,
                    "Authorization": f"Bearer {token}",
                },
            )
            data = resp.json()
            logger.info(f"Nomba verify response: {data}")
            return data
    except Exception as e:
        logger.error(f"Nomba verify error: {e}")
        return None


async def transfer_to_bank(
    bank_code: str,
    account_number: str,
    account_name: str,
    amount: float,
    merchant_tx_ref: str,
    narration: str = "Wallet withdrawal",
) -> dict | None:
    token = await get_access_token()
    if not token:
        return None
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                NOMBA_TRANSFER_BANK_URL,
                headers={
                    "Content-Type": "application/json",
                    "accountId": settings.NOMBA_ACCOUNT_ID,
                    "Authorization": f"Bearer {token}",
                },
                json={
                    "amount": amount,
                    "accountNumber": account_number,
                    "accountName": account_name,
                    "bankCode": bank_code,
                    "merchantTxRef": merchant_tx_ref,
                    "narration": narration,
                },
            )
            data = resp.json()
            logger.info(f"Nomba transfer response: {data}")
            return data
    except Exception as e:
        logger.error(f"Nomba transfer error: {e}")
        return None


def verify_webhook_signature(
    signature: str,
    timestamp: str,
    secret: str,
    payload: str,
) -> bool:
    if not signature or not timestamp or not secret:
        return False
    message = f"{timestamp}.{payload}".encode()
    expected = hmac.new(secret.encode(), message, hashlib.sha256).hexdigest()
    return hmac.compare_digest(signature, expected)
