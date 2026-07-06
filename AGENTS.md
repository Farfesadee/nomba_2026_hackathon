# Accredit.vip — AI Agent Guide

## Project Overview

Accredit.vip is an event management platform (RSVP, ticketing, payments, wallet, invitations) using:
- **Frontend:** Next.js 14 (App Router, TypeScript, Tailwind CSS) at `frontend/`
- **Backend:** FastAPI (Python 3.11+, SQLAlchemy async) at `backend/`
- **Server:** Namecheap VPS (203.161.60.171), Ubuntu 24.04, nginx reverse proxy

## Dashboard Architecture & Isolation Rule (CRITICAL)

### The Golden Rule
**Every dashboard page file and its component tree is 100% independent.**  
Modifying one dashboard must NEVER break another dashboard.

### How Isolation is Achieved

1. **Dashboard pages do NOT share a layout.** Each page under `frontend/src/app/dashboard/` is standalone — it renders its own sidebar, topbar, and content inline. There is no shared `layout.tsx` that wraps all dashboard pages.

2. **Components in `components/dashboard/` and `components/wallet/` are SHARED.**  
   If you modify ANY of these files, you MUST verify ALL pages that import them still work.

### Shared Components Registry (DO NOT MODIFY Lightly)

| File | Used By |
|---|---|
| `components/dashboard/sidebar.tsx` | `dashboard/page.tsx`, `dashboard/events/page.tsx`, `dashboard/events/[id]/page.tsx`, `dashboard/events/[id]/edit/page.tsx`, `dashboard/events/[id]/report/page.tsx` |
| `components/dashboard/topbar.tsx` | Same 5 pages as above |
| `components/dashboard/event-card.tsx` | `dashboard/page.tsx`, `dashboard/events/page.tsx` |
| `components/wallet/*` (6 files) | `dashboard/wallet/page.tsx` only |
| `components/shared/toast.tsx` | `dashboard/wallet/page.tsx`, `dashboard/events/[id]/page.tsx` |

**Before editing any shared component:** Search all imports to find every consumer, then test all of them.

### Safe Pattern for Custom Dashboards

When creating a NEW dashboard page that looks/behaves differently:

1. **Create a new directory** under `frontend/src/app/dashboard/` (e.g., `dashboard/custom-feature/`)
2. **Build the sidebar and topbar inline** in your page (copy from `dashboard/page.tsx` if needed)
3. **DO NOT modify** the shared `DashboardSidebar` or `DashboardTopbar` components to accommodate your custom layout
4. **DO NOT add** your custom feature's navigation links to the shared sidebar's `NAV_ITEMS` array — that array is a shared constant. Add a separate link section in your page's own sidebar copy if needed.
5. **Your page is completely independent** — no other page imports it, and it should not import other pages' components.

### File Tree Reference

```
frontend/src/app/dashboard/
├── page.tsx                        (Overview — uses shared sidebar/topbar)
├── create/page.tsx                 (Create event — standalone)
├── change-password/page.tsx        (Standalone)
├── payment-callback/page.tsx       (Standalone)
├── wallet/page.tsx                 (Wallet — builds own sidebar inline, uses wallet components)
├── events/
│   ├── page.tsx                    (Events list — uses shared sidebar/topbar)
│   ├── manage/page.tsx             (Standalone)
│   └── [id]/
│       ├── page.tsx                (Event detail — uses shared sidebar/topbar)
│       ├── edit/page.tsx           (Uses shared sidebar/topbar)
│       ├── report/page.tsx         (Uses shared sidebar/topbar)
│       ├── questions/page.tsx      (Standalone)
│       ├── reminders/page.tsx      (Standalone)
│       ├── coupons/page.tsx        (Standalone)
│       ├── templates/page.tsx      (Standalone)
│       └── waitlist/page.tsx       (Standalone)
└── invites/[eventId]/send/page.tsx (Redirects)
    invites/[eventId]/manage/page.tsx (Redirects)
    invites/[eventId]/edit/page.tsx   (Redirects)

frontend/src/app/events/
└── [id]/page.tsx                   (Public event page — NOT a dashboard)

frontend/src/components/
├── dashboard/
│   ├── sidebar.tsx                 (SHARED — 5 consumers)
│   ├── topbar.tsx                  (SHARED — 5 consumers)
│   └── event-card.tsx              (SHARED — 2 consumers)
├── wallet/
│   ├── wallet-dashboard.tsx
│   ├── bank-account-manager.tsx
│   ├── add-bank-account-form.tsx
│   ├── withdrawal-form.tsx
│   ├── currency-selector.tsx
│   └── transaction-history.tsx
├── events/                         (Tab content components)
│   ├── GuestsTabContent.tsx
│   ├── QuestionsTabContent.tsx
│   └── ...
└── shared/                         (Generic reusable UI)
    ├── toast.tsx
    ├── error-boundary.tsx
    ├── confirm-dialog.tsx
    └── loading-skeleton.tsx
```

### Sidebar Navigation (shared `DashboardSidebar`)

The `NAV_ITEMS` array in `sidebar.tsx` defines:
1. `/dashboard` — Dashboard (LayoutGrid)
2. `/dashboard/events` — Events (CalendarDays)
3. `/dashboard/create` — Create Event (Plus)
4. `/dashboard/wallet` — Wallet (Wallet2)

**NEVER add custom feature links to this array.** If your custom page needs navigation links, render them in your page's own sidebar copy.

## Sidebar Inline Pattern (Wallet Example)

The wallet page (`dashboard/wallet/page.tsx`) demonstrates the correct pattern for a custom dashboard: it builds its own sidebar JSX inline rather than importing `DashboardSidebar`. This means changes to the shared sidebar never affect the wallet, and vice versa.

## Build & Test

- Frontend build: `npm run build` (in `frontend/`)
- Backend: `uvicorn app.main:app` (in `backend/`)
- After frontend build on server, browser needs hard refresh (Ctrl+Shift+R) to clear cached chunks
