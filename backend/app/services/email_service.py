import httpx
from app.core.config import settings


async def send_email(to: str, subject: str, html: str) -> bool:
    if not settings.RESEND_API_KEY:
        print(f"[Email Mock] To: {to}, Subject: {subject}")
        return True

    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
            json={
                "from": "Accredit.vip <invites@accredit.vip>",
                "to": [to],
                "subject": subject,
                "html": html,
            },
        )
        return res.is_success
