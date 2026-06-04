# Test Credentials — Abo Tracker

Supabase project: https://ynajpaefoovvfvbexqih.supabase.co  
Email confirmation: DISABLED (test users can sign in immediately after sign-up)

## Pre-created test account (already exists, no profile row yet)
- Email: `abotest2@mailinator.com`
- Password: `TestPass123!`

## Recommended testing flow
For each run, the test agent SHOULD create a fresh user via the "Create account" tab on `/auth` using a unique email (e.g. `abo+<timestamp>@mailinator.com`) and password `TestPass123!`. This guarantees a clean state with no pre-existing subscriptions and forces the AuthContext to auto-create a `profiles` row on first sign-in.

If reusing the pre-created account, expect prior subscriptions and a pre-existing profile row.
