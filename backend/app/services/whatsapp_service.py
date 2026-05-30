import httpx
from app.core.config import settings


async def send_whatsapp(to: str, message: str) -> bool:
    if not settings.TWILIO_ACCOUNT_SID:
        print(f"[WhatsApp Mock] To: {to}, Message: {message[:50]}...")
        return True

    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json",
            auth=(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN),
            data={
                "From": f"whatsapp:{settings.TWILIO_WHATSAPP_FROM}",
                "To": f"whatsapp:{to}",
                "Body": message,
            },
        )
        return res.is_success
