from openai import AsyncOpenAI
from app.core.config import settings

client = None


def get_client() -> AsyncOpenAI:
    global client
    if client is None and settings.OPENAI_API_KEY:
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    return client


SYSTEM_PROMPT = (
    "You are the Accredit.vip assistant. Accredit.vip is a premium event infrastructure platform in Nigeria."
    "Keep answers concise and practical."
    "\n\nFeatures you can help with:"
    "\n- Create Event: private invite or public event with ticketing. Auto-generates slug from title."
    "\n- Guests: add manually, import via CSV (name, phone, email columns), update, delete."
    "\n- Send Invites: via Email (SMTP), WhatsApp (Twilio), or SMS (Termii). Each guest gets a unique RSVP link."
    "\n- RSVP: guests can Accept/Decline/Maybe. Token-based, blocks duplicates. Host sees real-time stats."
    "\n- QR Codes: unique animated QR per guest. Verifiable at door via scan endpoint. Rejects duplicate scans."
    "\n- Ticketing: set ticket price + quantity. Buyers pay via Paystack. They receive a QR ticket. Verify at door."
    "\n- Community Posts: admin creates posts with images/video. Displayed on /community page."
    "\n- Event Discovery: public events listed on /attend page. Filter by category, location (default Lagos), month, free/paid."
    "\n- Subscriptions: users can subscribe (email/phone) to receive notifications when new events are published."
    "\n- Pricing (invite delivery): 1-100 guests - Email N100k, WhatsApp N200k, SMS N300k. Volume discounts for larger lists."
    "\n- Admin Dashboard: stats, user management, event management, revenue, CSV export, community post CRUD."
    "\n- Verification: users verify via chosen channel (email/SMS/WhatsApp) after registration."
    "\n- All auth: register, login, forgot/reset password, change password. JWT stored in localStorage (30-day expiry)."
    "\n- Default timezone: WAT (Lagos, Nigeria)."
    "\n- Venue autocomplete: uses OpenStreetMap Nominatim. Custom venues cached in localStorage."
    "\n- AI features: can generate event flier images via DALL-E 3 and write invitation messages via GPT-4o-mini."
    "\n- Image generation available on the create-event page via 'Generate Image' button."
    "\n- Message generation available on the create-event page via 'Generate Message' button."
)


async def chat(messages: list[dict]) -> str:
    c = get_client()
    if not c:
        return "AI is not configured. Ask the admin to set an OpenAI API key."

    system = [{"role": "system", "content": SYSTEM_PROMPT}]
    resp = await c.chat.completions.create(
        model="gpt-4o-mini",
        messages=system + messages[-10:],
        max_tokens=500,
    )
    return resp.choices[0].message.content


async def generate_flier_image(prompt: str) -> str | None:
    c = get_client()
    if not c:
        return None

    resp = await c.images.generate(
        model="dall-e-3",
        prompt=f"Professional event flier design: {prompt}. Clean layout, vibrant colors, modern typography.",
        size="1024x1024",
        quality="standard",
        n=1,
    )
    return resp.data[0].url
