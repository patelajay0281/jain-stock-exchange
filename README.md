# JAIN STOCK EXCHANGE (JSE) — v272

Educational stock-market trading simulation for **DALAL STREET 2026** (JAIN (Deemed-to-be University), CMS Business School):
100 participant teams, 50 stocks, 4 IPOs, 10 brokers, an institutional desk, and an Exchange → Bank settlement workflow with
live prices, portfolios, loans, Market News, audit trail, cash ledger, broker commission, reports and Excel export.

Every financial rule is enforced in the database: one API call = one PostgreSQL transaction with row locks, so balances,
holdings, brokerage, prices, loans and the winner are never calculated in the browser.

## Architecture

```
Browser (13 static pages, Cloudflare Pages)
   │  HTTPS + JSON, bearer session token, polling with ETag (market every 2.5 s while visible)
   ▼
JSE API — Neon Function (Node.js 24, TypeScript bundle, per-process caches, rate limits)
   │  one call = SELECT jse_<action>(actor, params)   (pg pool → Neon pooler)
   ▼
Neon Postgres 18 — PL/pgSQL financial engine (db/migrations), append-only ledgers and audit log
```

| Part | Where | Notes |
|---|---|---|
| Frontend | `public/` | Plain HTML/CSS/JS on a shared library (`assets/jse.js`, `assets/jse.css`). `assets/config.js` picks the API: production pages → production API, `*.jse-live.pages.dev` previews → staging API, localhost → same origin. |
| API | `backend/src/` | `server.ts` routes and permissions, `db.ts` pool, error mapping and auto-migrations, `xlsx.ts` Excel writer, `oidc.ts` staging-only CI sign-in. Built to `backend/dist/app.mjs`. |
| Loader | `backend/loader/index.mjs` | What is deployed to Neon Functions: downloads the API bundle named by `APP_URL` (GitHub raw, jsDelivr mirror), verifies `APP_SHA256`, caches it. A release = change two environment variables. |
| Database | `db/migrations/` | `001_schema` tables and constraints · `001a_upgrades` additive changes · `002_core` auth, orders, Exchange, Bank settlement · `003_ops` institutional, loans, Market News, event control, IPO allotment and listing, reset, undo/redo, admin · `004_reads` read models · `005_exports` 23 export sheets · `006_seed` teams, brokers, securities, accounts · `007_tuning` timeouts. Applied automatically by the API on first request (advisory-locked, replayable files re-applied when they change). |
| Tests | `tests/` | API end-to-end (`api.test.mjs`, `listing.test.mjs`), browser smoke test of all pages (`ui_smoke.py`), stress test with integrity audit (`stress.mjs`), load generator (`load.mjs`), staging CI runner (`ci/`). |

## Environments and URLs

| | Website | API (Neon Function) | Database |
|---|---|---|---|
| Staging | https://v272.jse-live.pages.dev | `jsestage` → https://br-lingering-sun-azzfzwj1-jsestage.compute.c-3.ap-southeast-1.aws.neon.tech | `jse_stage` |
| Production (after cutover) | https://jain-stock-exchange.pages.dev | `jse` → https://br-lingering-sun-azzfzwj1-jse.compute.c-3.ap-southeast-1.aws.neon.tech | `jse` |

Neon project `JAIN STOCK EXCHANGE` (`late-feather-44184945`, AWS Singapore), branch `br-lingering-sun-azzfzwj1`.
Cloudflare Pages projects: `jse-live` (previews of every branch) and `jain-stock-exchange` (production branch `live`).
Any page accepts `?api=stage`, `?api=prod` or `?api=local` to point at another backend for the browser session.

## Local setup

Requirements: Node.js 22+, PostgreSQL 16+ binaries (`initdb`, `pg_ctl`, `psql`), Python 3 + Playwright (only for the UI test).

```bash
npm install
npm run db:local            # creates and starts a local cluster on 127.0.0.1:5433 and database "jse"
npm run build               # bundles the API to backend/dist/app.mjs
npm run dev                 # http://127.0.0.1:8788 — serves public/ and /api/* (migrations + seed run on first request)
npm run db:local -- testpw  # LOCAL ONLY: known test passwords (tests/test-passwords.sql)
npm test                    # API end-to-end suites (33 tests)
npm run test:ui             # browser smoke test of every page (63 checks, screenshots in .local/shots)
ORDERS=8000 npm run stress  # 8,000-order stress test + integrity audit
RPS=850 DURATION=60 npm run load
```

`npm run db:local -- reset` recreates the database; `scripts/restart-dev.sh` restarts the dev server in the background.

## Deployment

**Frontend.** Cloudflare Pages builds `public/` straight from GitHub (no build command). Pushing a branch publishes a preview at
`https://<branch>.jse-live.pages.dev`; the `jain-stock-exchange` project serves the `live` branch at the production URL.
Commits whose message contains `[skip ci]` do not trigger a Pages build.

**API release.**
1. `npm run build` and commit `backend/dist/app.mjs` (the build prints its SHA-256).
2. Redeploy the Neon Function with the new environment (Neon Console → Functions → `jsestage` or `jse`, or the API/MCP `deploy_function`):
   - `APP_URL` = `https://raw.githubusercontent.com/patelajay0281/jain-stock-exchange/<commit>/backend/dist/app.mjs https://cdn.jsdelivr.net/gh/patelajay0281/jain-stock-exchange@<commit>/backend/dist/app.mjs`
   - `APP_SHA256` = the printed checksum
   - `DB_NAME` = `jse_stage` (staging) or `jse` (production)
   - staging only: `CI_OIDC_REPOSITORY=patelajay0281/jain-stock-exchange`, `CI_OIDC_REFS=refs/heads/v272`, `CI_OIDC_AUDIENCE=jse-staging`
   - optional: `DB_POOL_MAX` (default 8), `CORS_ORIGINS` (extra allowed origins, comma separated)
3. The first request after the release applies any new migrations.
The loader zip is `backend/loader/index.mjs` zipped as `index.mjs`; it only needs redeploying when the loader itself changes.

**Production cutover (needs the organiser's go-ahead).** Create database `jse` and function `jse` (same loader, `DB_NAME=jse`, no `CI_OIDC_*`),
bootstrap the administrator, then make the production site serve this code: merge `v272` into `live` (or set the Pages production branch to `v272`).
Rolling back is the reverse merge / branch switch; the old Supabase-backed site keeps working until then.

## Administrator credentials

No password is stored in the repository. Every account starts with a random unknown password.

1. **First administrator password** — in the Neon Console SQL editor, on the right database (`jse_stage` or `jse`):
   ```sql
   SELECT jse_bootstrap_password('ADMIN');           -- returns a random password once
   -- or: SELECT jse_bootstrap_password('ADMIN', 'your-own-password');
   ```
   The administrator must choose a new password at the first sign-in (the site asks automatically). This also unlocks a locked account.
2. **Everyone else** — sign in as ADMIN → Event Admin → *Accounts & passwords* → choose a role → *Issue new passwords for this role…*
   (type ISSUE). A CSV with `username, password` downloads once; hand the slips to the desks. Single accounts: *New password* on the row.
3. Accounts: `ADMIN`, `ASSOC-ADMIN` (administrators) · `EXCHANGE-01…04` · `BANK-01…04` · `PIT-01…10` (brokers) · `INST-01…04` (institutional) ·
   `FACULTY-01…02` (read-only viewers) · `TEAM-001…TEAM-100` (participants, see only their own team).
4. Anyone signed in can change their password from the *Password* button in the top bar.

## Event-day runbook

Before the event (night of 14 Oct): **Reset** (Event Admin) → load the lucky-draw **IPO allotments** CSV (`team,ipo,lots`) → save the confidential
**IPO listing prices** → check *List automatically when START EVENT is pressed* → issue passwords per role → put `https://…/?tv=1` on the projector.

15 Oct, 1:15 PM: **START EVENT** (IPOs with saved prices list at that moment; orders open). Brokers create orders → Exchange approves →
Bank settles. Market News from Event Admin or the Institutional page. **PAUSE · SETTLEMENT ONLY** stops new orders while queues clear.
At the end: **CLOSE EVENT** (₹50K closing cash rule becomes active) → **Reject all open orders** (or settle them) → **FINALIZE EVENT** →
*Download final event report (Excel)* and print certificates. Mistakes: *Undo last action* (only when safe), or the journal row's Undo.

## Rules implemented

| Rule | Value |
|---|---|
| Starting capital / institutional cash | ₹20,00,000 per team / ₹2,00,00,000 |
| Winner | Highest Net Worth = liquid cash + Σ(quantity × current price); loans not deducted; tie → lower team code |
| Closing cash rule | Base cash counted ≤ ₹50,000 at CLOSED/FINALIZED (profit cash exempt); PROVISIONAL while live; portfolios always visible (ELIGIBLE / LOCKED) |
| Lots and prices | Stocks in multiples of 50, IPOs in lots of 50; whole rupees; order value ₹1 – ₹50,00,000; ±10% of market price per order |
| Brokerage | 0.5%: BUY pays trade value + brokerage, SELL receives trade value − brokerage |
| Prices move only on | Bank settlement (trade price) and Market News (random % in the mood band, max ±10%); IPO listing once |
| Loans | ₹5,00,000 max original principal, 2% interest per draw, ₹20,000 minimum cash buffer, own money first, interest repaid first |
| Risk tracking | Short-sell attempts, cash-shortfall attempts, insufficient-balance rejections (per order, with history) |
| Statuses | NOT_STARTED · LIVE · SETTLEMENT_ONLY · CLOSED · FINALIZED; orders EXCHANGE_PENDING → EXCHANGE_APPROVED/REJECTED → BANK_SETTLED/REJECTED |
| Reset | ₹20,00,000 per team, base prices (IPOs ₹890 / ₹780 / ₹620 / ₹710), clears trading data, archives the audit log |

The master prompt lists both 50 and 70 stocks; this build follows the revised headline figure of **50 stocks** (the current catalogue).

## Capacity and hosting plan

The engine sustained 900 requests/second locally with zero errors (see `docs/TEST-REPORT.md`). On Neon the binding limits are the plan's
quotas, not the code: the **Free** plan includes 1 million function invocations and 5 GB of data transfer per month, while 500 screens polling
the market every 2.5 s for a 3-hour event make about 2–3 million requests (a 4-hour test at 800 requests/second is about 11.5 million).
Run the event and the full-length load test on the **Launch** plan (pay as you go). Neon also limits an account to about 100 concurrent
function invocations by default; the API answers cached reads in a few milliseconds, so 800+ requests/second stays well below that.

## Documentation

- `docs/API.md` — every endpoint, roles, inputs and errors
- `docs/TEST-REPORT.md` — test, stress and load results
