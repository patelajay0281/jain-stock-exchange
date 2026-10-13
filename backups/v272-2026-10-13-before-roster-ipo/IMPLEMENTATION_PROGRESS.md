<!-- Backup of IMPLEMENTATION_PROGRESS.md on branch v272 before roster/IPO changes. Original blob SHA: 41e16978a26288979e0706c69741b5036495a829 -->
# IMPLEMENTATION_PROGRESS — JAIN STOCK EXCHANGE (v3.14 master brief, 13 Oct 2026)

Objective: implement the "COMPLETE MASTER EXECUTION PROMPT" (P0–P7) on the existing app without rebuilding or resetting data.

## Architecture (where things are)
- Backend: `backend/src/server.ts` (routes) → Postgres functions in `db/migrations/*.sql`. Bundle `backend/dist/app.mjs` (`npm run build`).
- Replayable migrations (re-applied every deploy): 001a, 002, 003, 004, 005, 007, 008. One-time: 006, 009, **010_safety** (registered in `backend/src/db.ts`).
- Frontend: `public/*.html` + `public/assets/jse.js` (Cloudflare Pages project `jse-live`, branch `v272` → https://v272.jse-live.pages.dev).
- Staging API: Neon Function `jsestage` (project late-feather-44184945, branch br-lingering-sun-azzfzwj1, DB `jse_stage`). Deploy = `deploy_function` with APP_URL (raw.githubusercontent + jsdelivr at the commit) + APP_SHA256 of `backend/dist/app.mjs`, DB_NAME=jse_stage, CI_OIDC_* (see README).
- Production (`jse` function / jain-stock-exchange.pages.dev) is NOT switched; needs the owner's go-ahead.
- Local test: `bash scripts/local-db.sh start; bash scripts/restart-dev.sh; npm test; npm run test:ui`.
- Checkpoint = git. Last known-good before this brief: commit `c6e1826` (v3.13.2). v3.14 commit: see `git log`.

## Done and tested (v3.14.0)
P0 — order safety (`db/migrations/002_core.sql` jse_place_order, jse_check_company_limit; `003_ops.sql` institutional order)
- Team row locked (FOR UPDATE) per order → no double-selling / double-committing cash under concurrency (tested: 5 parallel SELLs on 100 shares → 2 accepted; 10 parallel BUYs never exceed cash).
- SELL > (holding − open sell orders) refused: SHORT_SELL_NOT_ALLOWED with the exact brief wording. Also for institutional counterparties.
- BUY > free cash (cash − open BUY reservations, incl. 0.5% brokerage) refused: INSUFFICIENT_BALANCE with the exact dynamic wording.
- Per-company limit: `event_config.max_company_pct` (default 25). Committed in one company (holding cost + open BUYs + order) ≤ 25% × (cash + cost of all holdings). Checked at creation and again at Bank settlement. IPO securities exempt.
- Whole-rupee prices: 010_safety sets price_tick = 1 and rounds any paise prices once (recorded as ADMIN price change). Orders refuse non-whole prices. Quantity multiples of 50 (existing).
- Create Order page shows available cash + shares available to sell, shows the warnings and blocks submit.
P1 — loans: `loan_requests` table (001a), `jse_loan_request / jse_loan_decide / jse_loan_requests` (003), routes GET/POST `/api/loan-requests`.
- Request (broker for own team, bank, admin, participant) → no cash. Bank APPROVE (approved ≤ requested, whole rupees, ≤ ₹5 L limit) credits cash in the same transaction via the existing Bank draw (ledger + interest + audit), status DISBURSED with disbursement_ref; repeated approve is a no-op replay. Reject supported. Exact success wording. One pending request per team.
- Automatic loan at settlement switched OFF (010). Bank page has a Loan requests panel; Create Order has "Request a bank loan".
P3 (part) — `jse_rename_entity` + POST `/api/rename` (admin password): bank name (`event_config.bank_name`, shown on Bank page) and institutional investor name (same institutions row). Audited with old/new/reason. Admin card "Bank & Institutional Investor Management".
Tests: `npm test` 44/44, `npm run test:ui` 72/72 (local).

Account controls (13 Oct, commit a9aae19): Event Admin → Account controls → "Add an account" (any role; a new broker code creates a new broker desk; participant needs an existing TEAM code; password shown once) and Edit (name / email). API actions CREATE_USER / UPDATE_USER in jse_admin_users. Tests 45/45 + 72/72. Staging deployment 14.

## Pending (in priority order)
1. P4 IPO round 1 (TIME-CRITICAL: applications 13 Oct 1:15 PM → 14 Oct 1:15 PM, allotment 14 Oct 7 PM):
   applications table (team, ipo, lots 0–10, ₹15,000 per lot, ≤ ₹1.5 L per IPO, ≤ ₹6 L total, one per team, immutable),
   CSV import of applications (from the Team Leader email/Google Form), randomized round-robin draw persisted (seeded, stored order + rounds),
   Bank verify → approve → issue (reuse existing allotment import `/api/ipo-allotments` for issuance; no brokerage). Lot share quantity must come from config (ipo_lot_size) — ask owner how many shares per ₹15,000 lot.
2. P3 IPO issue-size editor (securities.ipo_shares_offered exists) with "not below allotted" check + audit.
3. P2 roster import with real roster file (NOT received yet — ask owner to upload). Broker codes Prajna…Suvarna / names given in brief; 73 teams (8/8/8 + 7×7). Changing broker usernames affects logins — decide with owner.
4. P6 Undo for renames/config (action_journal), version history panel.
5. Institutional prices are market ±2% and can have paise (brief says no decimals) — decide rounding with owner.
6. Deploy: staging done when listed below; production switch needs go-ahead.

## Deployment log
- 13 Oct 2026 22:00 IST: v3.14.0 (commit eb235d7) deployed to staging `jsestage` deployment 13; CI health run 38430902270 → version 3.14.0, db ok; staging DB verified: 010_safety applied, price_tick 1, auto loan off, max_company_pct 25, loan_requests present. Pages auto-deployed from v272.
