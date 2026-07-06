# Accredit.vip — Nomba Hackathon 2026

**Track:** Payments & Financial Inclusion

**Live Demo:** [https://accredit.vip](https://accredit.vip)
**Test Account:** `demo@accredit.vip` / `demo1234`

A premium event infrastructure platform with **Nomba** as a primary payment gateway for wallet funding, ticket purchases, and automated bank transfers. Built for the DevCareer x Nomba Hackathon 2026.

---

## Nomba Integration

| Feature | Endpoint | Status |
|---------|----------|--------|
| Checkout Order | `POST /api/v1/nomba/checkout` | ✅ Live |
| Transaction Verification | `GET /api/v1/nomba/verify/{reference}` | ✅ Live |
| Bank Transfer (Withdrawal) | `POST /api/v1/nomba/withdraw` | ✅ Live |
| Webhook Processing | `POST /api/v1/nomba/webhook` | ✅ Live |
| Wallet Deposit via Nomba | `POST /api/v1/wallet/fund` (with `provider: "nomba"`) | ✅ Live |

### How It Works

1. **Deposit** — User selects "Nomba" as payment method on the Wallet page → backend creates a Nomba checkout order → user is redirected to Nomba's secure checkout → on success, the wallet is credited via webhook
2. **Withdraw** — User requests a withdrawal → backend initiates a Nomba transfer to the user's bank account → wallet is debited atomically
3. **Ticket Purchase** — Event tickets can be paid for via Nomba checkout (same flow as wallet deposit)
4. **Webhook Security** — All Nomba webhooks are verified using HMAC-SHA256 signature verification

### Nomba API Reference

See `test_nomba.sh` and `test_verify.sh` for sandbox test commands.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, TailwindCSS v4, ShadCN UI |
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0 (async), Pydantic v2 |
| Database | Supabase PostgreSQL |
| Payments | **Nomba** (primary), Paystack (fallback), Flutterwave (fallback) |
| Email | SMTP, SendGrid, Resend |
| SMS/WhatsApp | Twilio, WhatsApp Cloud API, Termii, Africa's Talking |
| AI | OpenAI (GPT-4o, DALL-E 3) |
| Auth | Supabase Auth, Google OAuth, bcrypt |
| Server | nginx → uvicorn (API) + Next.js standalone (web) on Ubuntu 24.04 |

---

## Directory Structure

```
backend/                          # FastAPI backend (port 8000)
├── app/
│   ├── api/
│   │   ├── nomba_api.py          # Nomba payment routes (checkout, webhook, verify, withdraw)
│   │   ├── wallet_api.py         # Wallet operations (fund, pay, multi-currency)
│   │   ├── withdrawals.py        # AML-compliant withdrawal management
│   │   ├── payments.py           # Paystack/Flutterwave payment processing
│   │   └── ...                   # Event, guest, QR, RSVP, etc.
│   ├── services/
│   │   ├── nomba_service.py      # Nomba HTTP client (auth, checkout, transfer, verify)
│   │   └── ...                   # Email, QR, messaging, AI services
│   ├── core/config.py            # All env vars including NOMBA_*
│   ├── models/wallet.py          # Wallet, WalletTransaction, BankAccount, Withdrawal
│   └── main.py                   # FastAPI app entry point (nomba_api mounted)
├── uploads/                      # QRs, fliers, event images
├── requirements.txt
└── .env.example

frontend/                         # Next.js frontend (port 3000)
├── src/
│   ├── app/dashboard/wallet/     # Wallet page with Nomba/Paystack payment method selection
│   └── components/wallet/        # Wallet dashboard, deposit, withdrawal, bank account UI
└── package.json
```

---

## Features

### Payment & Wallet (Nomba Focus)
- **Multi-Currency Wallet** — 10 currencies (NGN, USD, GBP, EUR, KES, GHS, ZAR, RWF, UGX, TZS)
- **Deposit via Nomba** — Select Nomba as payment method, redirected to Nomba checkout
- **Deposit via Paystack** — Fallback payment provider
- **Auto-Withdraw to Bank** — Nomba Transfers API for instant bank payouts
- **AML Compliance** — Name verification, daily limits, velocity checks on withdrawals
- **Transaction History** — Full audit trail of deposits, withdrawals, and payments

### Event Management
- **Create Event** — Public or private; flier upload, ticket tiers, lineup, after-party toggle
- **Post Event** — One-click publish with admin review workflow
- **AI Flier Parsing** — Upload a flier image, AI extracts title, date, venue, lineup, ticket info
- **AI Flier Generation** — Generate event fliers from text description (DALL-E 3)

### Guest & Invitation Management
- **Guest Import** — CSV upload with column mapping
- **Multi-Channel Invitations** — Email, WhatsApp, SMS
- **QR Accreditation** — Per-guest animated QR GIFs, single-use validation
- **RSVP** — Token-based accept/decline/maybe with live stats

### Ticketing & Check-in
- **Ticket Sales** — Paystack/Nomba checkout with PDF ticket generation
- **QR Check-in** — Staff scanning with duplicate detection, real-time activity feed

### Public Discovery
- **Browse Events** (`/attend`) — Filter by location, category, date, price
- **Near Me** — Geolocation-based proximity sorting (Haversine)

### Admin Panel
- Dashboard, Event Moderation, User Management, Payment Management
- Withdrawal Management, Fraud Detection, Audience Data Marketplace
- Admin Account Management (super_admin only)

---

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env              # edit with your Nomba sandbox keys
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                       # runs on :3000
```

### Test Nomba Integration

```bash
# Test sandbox auth + checkout
bash test_nomba.sh

# Test transaction requery
bash test_verify.sh
```

---

## Environment Variables (Nomba)

| Variable | Description |
|----------|-------------|
| `NOMBA_ACCOUNT_ID` | Nomba account UUID |
| `NOMBA_CLIENT_ID` | Nomba client ID for OAuth |
| `NOMBA_CLIENT_SECRET` | Nomba client secret |
| `NOMBA_BASE_URL` | `https://sandbox.nomba.com` (sandbox) or `https://api.nomba.com` (production) |
| `NOMBA_WEBHOOK_SECRET` | Secret for HMAC webhook verification |

---

## Deployment

The application runs on a Namecheap VPS (Ubuntu 24.04) behind nginx with Let's Encrypt SSL.

**Infrastructure:**
- API (port 8000) — `uvicorn` via systemd
- Web (port 3000) — `next start` via systemd
- nginx — reverse proxies `/api/v1/` → 8000, `/` → 3000

---

## Project Status

Live in production at [accredit.vip](https://accredit.vip). Submitted for **DevCareer x Nomba Hackathon 2026** — Payments & Financial Inclusion Track.
