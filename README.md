# JAIN STOCK EXCHANGE (JSE) — v3.12 (branch v272)

Educational stock-market trading simulation for **DALAL STREET 2026** (JAIN (Deemed-to-be University), CMS Business School):
100 participant teams, 50 stocks, 4 IPOs, 10 brokers, an institutional counterparty desk, and a Broker → Pit Manager → Exchange → Bank
workflow with one trading slip per executed order, the CMS 50 index, Market News as the only price engine, portfolios, loans, the
5 BUY + 5 SELL assessment, the ₹50,000 closing cash criterion, Winner and Runner-Up, audit trail, cash ledger, broker commission,
share certificates, reports and Excel export.

The look follows the existing Hatchable application: Inter, a white horizontal tab bar with the active tab in dark navy, navy
hero bands on the desks, white cards on #F4F6F9, primary blue #155EEF, green #16803C / red #C62828 for gains and losses.

Every financial rule is enforced in the database: one API call = one PostgreSQL transaction with row locks, so balances,
holdings, brokerage, prices, loans and the winner are never calculated in the browser.

## Architecture

```
Browser (16 static pages, Cloudflare Pages)
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
| Database | `db/migrations/` | `001_schema` tables and constraints · `001a_upgrades` additive changes · `002_core` auth, orders, Exchange, Bank settlement · `003_ops` institutional, loans, Market News, event control, IPO allotment and listing, reset, undo/redo, admin · `004_reads` read models · `005_exports` 30 export sheets · `006_seed` teams, brokers, securities, accounts · `007_tuning` timeouts · `008_v311` v311 data changes. Applied automatically by the API on first request (advisory-locked, replayable files re-applied when they change). |
| Tests | `tests/` | API end-to-end (`api.test.mjs`, `listing.test.mjs`), browser smoke tests of all pages (`ui_smoke.py` local, `ui_staging.py` deployed site), stress test with integrity audit (`stress.mjs`), load generator (`load.mjs`), staging CI runner (`ci/`). |

**Live updates: polling, not SSE.** The master prompt prefers WebSocket/SSE "if practical". On Neon Functions every open SSE/WebSocket
stream holds one function invocation, and an account is limited to about 100 concurrent invocations, so 500 open market screens cannot
each hold a stream. The pages therefore poll with ETags (market every 2.5 s, desks every 2.5–5 s, only while the tab is visible, backing
off on errors); unchanged data comes back as a tiny `304`, and the API answers market reads from a ~1 s in-memory cache.

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
npm test                    # API end-to-end suites (43 tests)
npm run test:ui             # browser smoke test of every page (80 checks, screenshots in .local/shots)
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
3. The first request after the release applies any new migrations. Release before or after the event, not during trading: a migration briefly locks the tables it changes.
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
3. Accounts: `ADMIN`, `ASSOC-ADMIN` (administrators) · `BROKER-01…10` (Create Order) · `PIT-01…10` (Pit Managers) · `EXCHANGE-01…04` ·
   `BANK-01…04` · `INST-01…04` (institutional desk) · `FACULTY-01…02` (read-only viewers) · `TEAM-001…TEAM-100` (participants, see only
   their own team).
5. Material administrator actions (START / PAUSE / CLOSE / FINALIZE, reset, Market News, configuration, listing, imports, accounts,
   undo / redo) ask for the administrator's password again.
4. Anyone signed in can change their password from the *Password* button in the top bar.

## Event-day runbook

Event day timing (shown on the Market, IPO and sign-in pages): **12:45 PM onwards** participant lobby · **by 1:00 PM** Guest of Honour ·
**1:15 PM SHARP** event begins, IPO reveal, market goes live.

Before the event: the IPO application window opens exactly 48 hours before the event start (24 hours long). After it closes, the organisers
run the allotment and load it (Event Admin → IPO allotments, `team,ipo,lots`), optionally save confidential listing prices, issue passwords
per role, then **Reset** with *Keep loaded IPO allotments* after the rehearsal. Put `https://…/?tv=1` on the projector.

1:15 PM: **START EVENT** — every IPO lists (saved price, otherwise its issue price) and joins the CMS 50 (50 → 54 components); orders open.
Participants tell their broker → the broker uses **Create Order** → the **Pit Manager** executes it (one trading slip) → **Exchange** approves →
**Bank** settles. Market News from Event Admin is the only way prices move. **PAUSE · SETTLEMENT ONLY** stops new orders while queues clear.
At the end: **CLOSE EVENT** (the ₹50,000 closing cash criterion is applied) → **Reject open orders** (or settle them) → **FINALIZE EVENT** →
*Final Event Excel* and certificates. Mistakes: *Undo last settlement* (only when safe), or the journal row's Undo.

## Rules implemented

| Rule | Value |
|---|---|
| Capital | ₹20,00,000 per team; loan sanctioned up to ₹5,00,000 (2% interest per draw, drawn automatically by the Bank only for the exact shortfall of a BUY) |
| Orders | Placed only by the team's broker, always at the current market price; quantity in multiples of 50; one trading slip per executed order |
| Stale price | An order waiting for the Pit Manager whose market price changed is PRICE STALE and cannot be executed |
| Prices move only on | Market News (random % inside the severity band, max ±10%), IPO listing, and their undo / redo — never on orders or settlement |
| Brokerage | 0.50% on every settled trade (shown as “0.50%”): BUY pays trade value + brokerage, SELL receives trade value − brokerage; earned by the team's broker |
| Institutional counterparty | Participant BUY from the institution = market + 2%, SELL to it = market − 2%; normal workflow and brokerage; no institutional cash or holdings restriction |
| Assessment | At least 5 settled BUY and 5 settled SELL trades (IPO allotments, pending or rejected orders do not count) |
| ₹50,000 closing cash criterion | At the close, the cash counted against a team's starting capital must not exceed ₹50,000 — a closing eligibility audit condition, not a starting requirement, not a minimum cash buffer and not a permanent floor (the old ₹20,000 buffer does not apply); trading profit cash is not counted |
| Winner | Exactly one Winner and one Runner-Up: highest and second-highest Net Worth (cash + Σ quantity × closing price) among eligible teams; ties → lower team code |
| CMS 50 | Sum of the 50 listed equity prices plus each IPO once listed (base = its listing price) |
| Statuses | Event NOT_STARTED · LIVE · SETTLEMENT_ONLY · CLOSED · FINALIZED; orders PIT_PENDING → EXCHANGE_PENDING → EXCHANGE_APPROVED → SETTLED, or PIT_REJECTED / EXCHANGE_REJECTED / BANK_REJECTED |
| Reset | ₹20,00,000 per team, base prices, IPOs back to pre-market, trading data cleared, audit log archived (`EVENT_RESET`) |

## Capacity and hosting plan

The engine sustained 900 requests/second locally with zero errors, and the deployed staging API served 850 requests/second from inside its
region for 60 s with 100% success (p95 98 ms; ceiling between 850 and 1,200 on the current plan) — see `docs/TEST-REPORT.md`. On Neon the binding limits are the plan's
quotas, not the code: the **Free** plan includes 1 million function invocations and 5 GB of data transfer per month, while 500 screens polling
the market every 2.5 s for a 3-hour event make about 2–3 million requests (a 4-hour test at 800 requests/second is about 11.5 million).
Run the event and the full-length load test on the **Launch** plan (pay as you go). Neon also limits an account to about 100 concurrent
function invocations by default; the API answers cached reads in a few milliseconds, so 800+ requests/second stays well below that.

## Documentation

- `docs/API.md` — every endpoint, roles, inputs and errors
- `docs/TEST-REPORT.md` — test, stress and load results
- `docs/OPERATIONS.md` — event-day desk guide
