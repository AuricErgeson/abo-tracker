# Abo Tracker — PRD

## Original problem statement
Build a full-stack subscription tracker SaaS app called "Abo Tracker" using React + Supabase + Tailwind CSS. Email/password + magic link auth, dashboard with renewals/spend stats and color-coded urgency, add/edit subscription modal, profile page with account-data deletion. RLS-secured, mobile-first, minimal humanised aesthetic (Fraunces + DM Sans, warm off-white, deep green accent).

## Architecture
- **Frontend**: React 18 (CRA) + react-router-dom v6 + Tailwind CSS, served via supervisor on port 3000.
- **Auth & Data**: Supabase (`@supabase/supabase-js`) — direct from the browser using the anon key. RLS enforced server-side.
- **Backend**: A trivial FastAPI stub at `/api/health` (this app does not require server business logic; Supabase handles auth, storage and reminder scheduling via future Edge Functions).

## User personas
- **The forgetful subscriber**: lots of trials and recurring charges, hates surprise renewals.
- **The household budgeter**: wants a calm at-a-glance view of monthly burn.

## Core requirements (static)
1. Email/password + magic-link auth on `/auth`.
2. Auto-create a `profiles` row on first login if it doesn't exist.
3. `/dashboard` with: monthly-spend stat (normalised across weekly/monthly/yearly), active count, expiring-in-4-days count, warning banner, sorted list with color-coded left border (red ≤4d / amber ≤10d / none).
4. Add/edit modal with name, category, price, cycle, type, renewal_date, optional notes. Editing a sub whose renewal_date changes resets `reminder_sent` to false.
5. `/profile` to edit full_name, timezone, `notify_by_email`, log out, and delete account data.
6. Protected routes redirect logged-out users to `/auth`; logged-in `/` redirects to `/dashboard`.
7. All Supabase queries use the authenticated client — RLS prevents cross-tenant reads.

## What's been implemented (2026-06-04)
- Full auth flow (sign-in, sign-up, magic-link) with friendly inline errors.
- Auto-create profile via `AuthContext.ensureProfile` on first login.
- Dashboard: 3 summary cards, urgent-banner, 7+ category filter chips, sort-by-renewal-date list, urgency colour bar, trial badge, empty state with warm copy.
- Add/edit modal with validation; renewal-date change resets `reminder_sent`.
- Subscription cards with edit + delete (confirm dialog).
- Profile page with name / timezone / email-toggle save, logout, hard-delete (purges `reminder_logs` → `subscriptions` → `profiles` → sign-out; auth.users row is left orphaned since the anon key cannot delete it).
- Design system per spec: Fraunces + DM Sans, warm off-white surface, accent #2D6A4F, 10px radius cards, tag pills, 150ms transitions, dark-mode tokens defined in Tailwind config.
- Tested end-to-end by testing_agent_v3 — 21/22 scenarios pass; no functional bugs found.

## Prioritised backlog
**P1**
- Supabase Edge Function for daily renewal-reminder emails (writes `reminder_logs`, flips `reminder_sent`). Requires Resend/SendGrid integration.
- Dark-mode toggle in NavBar (tokens already wired in Tailwind).

**P2**
- Multi-currency support per subscription (currently EUR-only formatter).
- CSV import / export.
- Charts: spend over time, category breakdown donut.
- Pause / archive (use existing `is_active=false`) with a separate "Archived" tab.

**P3**
- Shared family plans (multiple users on one subscription).
- Browser extension to one-click capture a subscription from any signup confirmation page.
