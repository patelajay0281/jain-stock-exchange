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

## Targeted v272 roster and IPO administration update (2026-10-13)

Scope is limited to the existing Admin page's roster importer and IPO administration. Existing teams/brokers/manual allotment import options are retained.

### Files changed
- `public/admin.html`: added Team/Broker Assignment roster import option and three separate IPO panels (random allotment/issuance, company/base-price import, issue-size/inventory management); added previews, status display, export and admin-confirmed actions.
- `backend/src/server.ts`: added `POST /api/ipo-admin`; added import definitions for `roster_assignments` and `companies`; raised the roster-only row ceiling to 10,000 with an explicit technical-limit message.
- `backend/src/db.ts`: registered additive migration `011_roster_ipo` and marked it replayable/idempotent.
- `backend/dist/app.mjs`: synchronized the runtime bundle with the migration and routes. Syntax checked after patching.
- `db/migrations/011_roster_ipo.sql` (new): stores persistent random draws/items; maps the uploaded official broker number/code/name to existing internal broker desks without changing internal broker codes; implements validated roster assignment import, company/base-price import, issue-size updates, draw, verify, approve and atomic/idempotent final issuance.
- `IMPLEMENTATION_PROGRESS.md`: this record.

### Backups
Exact originals are stored under `backups/v272-2026-10-13-before-roster-ipo/`. See `RESTORE_MANIFEST.md` for paths and original blob SHAs. The new migration had no original file; remove it to revert the code addition, but do not drop database objects after use without reviewing data first.

### Validation completed
- Inline JavaScript in `public/admin.html` parsed successfully.
- Updated `backend/dist/app.mjs` parsed successfully after stripping its ESM imports/exports for syntax-only validation.
- Migration was applied inside a database savepoint on staging `jse_stage`; state returned four IPOs.
- Roster dry-run passed for `TEAM-001` with official broker assignment `6 / Arohan / Aman`; no data was committed.
- Company/base-price dry-run passed for existing ticker `VOLTRA`; no data was committed.
- Full IPO draw/verify/approve/finalize flow was exercised transactionally with four temporary applications and a five-lot inventory: generated a saved 1.2x draw, verified 5 lots/250 shares, approved it, finalized 250 shares, then rolled the entire test back.
- Issue-size update from 100,000 to 110,000 shares was exercised inside a savepoint and rolled back.
- Post-test check confirmed staging remained `LIVE`, `VOLTRA` issue size remained 100,000, with zero applied IPO applications and zero active allotments. No persistent financial records were changed by these tests.

### Important live/staging state
The existing staging database currently reports event status `LIVE`. This was not changed. The random draw and issue-size/company write actions are server-blocked until the event is in the appropriate pre-start/application-closed state; roster assignment import follows the existing team editor's broker-assignment policy. Dry-run previews remain available.

### Deployment
Source and runtime bundle are committed on branch `v272`. Redeploy only the staging Neon Function `jsestage` using the current `backend/dist/app.mjs` checksum and staging environment (`DB_NAME=jse_stage`, staging OIDC values). Do not deploy the production function `jse` as part of this task.

### Deployment verification update
- Cloudflare Pages preview deployment for commit `da77ec797167fada9838f642e3783be78b976b78` completed successfully; the `v272.jse-live.pages.dev` alias now contains all three new IPO panels and the five-column roster import option.
- Neon staging function `jsestage` deployed as deployment ID `15` using the versioned runtime bundle and `DB_NAME=jse_stage`. Production function `jse` was not changed.
- Staging API health returned `success=true`, `db=ok`, version `3.14.0`.
- The migration is now applied to `jse_stage`; the three new tables/alias mapping and migration record were verified. Read-only live dry-runs succeeded for roster assignment and company/base-price import.
- The actual staging event status remains `LIVE`; this was deliberately not reset. IPO draw and issue-size/company write actions remain safely blocked by server-side pre-start/window guards until the existing event state is appropriate. Roster assignment import is available and changes only `teams.broker_id`.

## Order accuracy, team isolation and reconciliation (21 Oct 2026)

### What the live system is
- The event ran on the **staging stack**: site `v272.jse-live.pages.dev` / `jse-live.pages.dev` (Pages project `jse-live`, branch `v272`) → Neon Function `jsestage` → database **`jse_stage`** (branch br-lingering-sun-azzfzwj1). 537 orders, 528 settlements, event CLOSED 15 Oct 15:33 IST.
- `jain-stock-exchange.pages.dev` (branch `live`, 9 Oct) → function `jse` → database `jse` is empty (NOT_STARTED); it was never used.
- During the event, migrations 022–030 were applied partly by direct SQL; function deployment 41 (14 Oct) predates most of them. The 16 Oct branch `fix/event-rules-2026-10-16` (migration 030: negotiated pair trades, market-price institutional trades, admin-only news) was applied to the DB on 16 Oct but never merged — now merged into v272.

### Root causes found
1. **Source ≠ database.** Files up to 030 no longer rebuild the live functions (011 had a literal `\n`, 012/025/026 lacked `;` after function dumps, 027 fails on a fresh DB, 024–026 were never applied by the runner). A normal deploy would have re-applied old function text and reverted event-day rules.
2. **Market News band regression.** 030 re-created `jse_market_news` with the old daily baseline, undoing 028 (permanent ±15% band from the base price).
3. **No reconciliation tool**, no ±15% limit on negotiated prices, institutional inventory unlimited with no admin control.

### Changes (branch `fix/order-accuracy-2026-10-21`, fast-forwarded into `v272`)
- `backend/src/db.ts`: live-baseline guard — on a DB that has 029/030 recorded, migrations up to 030 are never applied or replayed; only 031+ run. Registered 030 and 031.
- `db/migrations/031_order_accuracy.sql` (replayable, idempotent, no data changes): restores the base-price news band (text patch on the live function); negotiated price must be within ±15% of the market price (`NEGOTIATED_PRICE_OUT_OF_BAND`); `institutional_inventory` table + triggers (order guard incl. reservations by open orders; settlement/undo updates inventory in the same transaction; negative blocked) + `jse_institution_inventory` (LIST/SET/UNLIMITED, audited, cannot go below open orders); `jse_reconcile` (16 checks, read-only) and `jse_reconcile_correct` (ledger-only correction for cash-vs-ledger gaps; reason + admin password + audit; never changes cash).
- `backend/src/server.ts`: GET/POST `/api/reconcile`, GET/POST `/api/institution-inventory`.
- `public/admin.html`: Reconciliation card and Institutional inventory card. `public/order.html`: negotiated ticket shows and checks the ±15% range.
- Source fixes: 011 literal `\n`, missing semicolons in 012/025/026.
- `tests/order_accuracy.test.mjs` + CI suite `order_accuracy` (refuses to run against the live API). CI results now commit back to the branch that ran (a branch run could previously push to v272).

### Tests
- CI run 39610638258 against function `jsetest` on Neon branch `recon-test-2026-10-21` (br-old-grass-azvo6hbo, a copy of the event data): **10/10 pass** — isolation (participant sees only its team; other team's order 403; team taken from session), buy/sell cash + holdings + brokerage + net worth, short selling refused, 5 concurrent sells, double settlement settles once, idempotent retry, price change closes pending order, news band ±15% from base, negotiated ±15%, institutional inventory + holdings, reconciliation shows no new issues.
- Live after deployment 42 (commit a1cf9de bundle sha f793c981…): health OK (CI run 39611338418); DB verified read-only: 031 applied, orders 537 / settlements 528 unchanged, event still CLOSED.

### Live reconciliation result (3 pre-existing items, not auto-corrected)
- TEAM-001 (BIG BULL): cash ₹41,41,683 vs ledger sum −₹38,58,317 → ₹80,00,000 top-up to the ₹1 crore special balance was never written to the cash ledger. Fix: Event Admin → Reconciliation → "Record ledger correction" (ledger only). Note: its P/L (₹79.4 L, 397%) is measured against ₹20 L starting capital; it is not eligible for awards.
- ORD-536 (TEAM-003, EXCHANGE_APPROVED) and ORD-537 (TEAM-016, EXCHANGE_PENDING) were still open when the market closed. Fix: Event Admin → Reject open orders (with a reason).

### Backups
- Neon branch `backup-before-031-2026-10-21` (br-lively-block-azehiulj): live data right before deployment 42. Test branch `recon-test-2026-10-21` holds test trades — delete when no longer needed.
- Saved unfinished 13 Oct IPO patch (superseded by 011): scratchpad only.
