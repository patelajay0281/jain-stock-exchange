# JSE v272 — test, stress and load report

Date: 10–11 October 2026. Code: branch `v272`. API bundle SHA-256 `8fab060c…7025016` (staging and production run the same bundle).

## Summary

| Test | Where | Result |
|---|---|---|
| API end-to-end: full order workflow and every rule (22 tests) | local · staging | **22/22 · 22/22** |
| IPO listing prices, password change, console bootstrap, CI sign-in (11 tests) | local · staging | **11/11 · 10/10** (bootstrap test is local-only) |
| Browser smoke test, all 13 pages (63 checks) | local | **63/63** |
| Browser test of the **deployed** site (Cloudflare Pages + Neon Function), CSP enforced (42 checks) | staging | **42/42** |
| Stress: 8,000 orders through Exchange and Bank, 32 concurrent desks, duplicate-settlement and replay attacks, integrity audit | local | **13/13 integrity checks, 0 server errors** |
| Stress: 1,500 orders | staging | **13/13 integrity checks, 0 server errors** |
| Load: 850 requests/s for 60 s | local | 852 req/s achieved, **0 failures**, p95 12 ms |
| Soak: 900 requests/s for 4 hours (≈ 13 million requests) | local | see [Soak test](#soak-test-4-hours) |
| Load from a US cloud runner: 300 / 500 / 850 requests/s | staging (Singapore) | 100% / 99.63% / 92.65% success — every failure was the hosting platform's concurrency limiter (HTTP 429), none from the application |

Environments: **local** = 2 vCPU / 7 GB sandbox, Node.js 22, PostgreSQL 16, API and database on the same machine as the load generator.
**Staging** = Neon Function `jsestage` (Node.js 24) + Neon Postgres 18 database `jse_stage` (AWS Singapore, Free plan, autoscaling up to 2 CU), website https://v272.jse-live.pages.dev; tests run from GitHub Actions runners in the US (≈ 215 ms round trip to Singapore). Staging results are committed by the workflow to `tests/ci/results/`.

## Functional coverage (acceptance tests of the master prompt)

`tests/api.test.mjs` and `tests/listing.test.mjs` exercise the rules against the running API:

- 100 teams, 50 stocks, 4 IPOs (₹890 / ₹780 / ₹620 / ₹710), 10 brokers; portfolios TEAM-001 … TEAM-100 in numeric order.
- Public callers and wrong roles are rejected server-side (401/403) on every protected endpoint; participants only see their own team.
- IPO allotment upload before START (no brokerage, no price change; all-or-nothing validation; locked after START).
- Orders refused before START; lots of 50; whole rupees; 10% price band; ₹50,00,000 order value limit; idempotent replays.
- Order creation and Exchange approval move neither prices nor cash.
- BUY → Exchange → Bank: cash down by trade value + exactly 0.5% brokerage, holdings up, market price = trade price, CMS INDEX moves.
- Duplicate settlement: 12 concurrent SETTLE calls → exactly one succeeds, 11 get 409.
- SELL: cash up by trade value − brokerage, holdings down, realised P/L correct to the paisa.
- Short selling recorded at creation, Exchange confirmation required, Bank rejects; one attempt per order with history.
- Cash shortfall attempt and insufficient-balance rejection recorded; cash untouched.
- Automatic loan at settlement keeps exactly ₹20,000; 2% interest; ₹5,00,000 limit; own money first; repayment pays interest first and never goes below ₹20,000.
- Market News stays inside the mood band, logs MARKET_NEWS, ±10% cap.
- Institutional orders with a counterparty team, both directions.
- Undo/redo of a settlement restores cash, holdings and price.
- Concurrent settlements for one team never break the balance; cash ledger reconciles for all 100 teams.
- ₹50K closing cash rule (PROVISIONAL while live, ELIGIBLE/LOCKED after close, portfolios still visible) and winner = highest Net Worth in the pool, ties to the lower code; loans not deducted.
- FINALIZE refused while orders are open; Excel (23 sheets) and CSV exports.
- Reset restores the clean state and keeps IPO allotments.
- IPO listing: prices validated all-or-nothing, hidden from viewers, the public feed and the audit trail until listing; START lists them (source LISTING); the 10% band then applies from the listing price; undo/redo until the IPO trades; reset restores issue prices and keeps the saved prices; manual "List IPOs now".
- Password change rules, forced change after a console bootstrap, CI sign-in absent locally and rejecting forged tokens on staging.

`tests/ui_smoke.py` (local) and `tests/ui_staging.py` (deployed site) drive the real pages in Chromium: 8 tiles per row, 15 px bold names, CMS INDEX and status, no "Market Wall" strip, no yellow text, no horizontal scroll on a phone, broker order form (including the paired buyer/seller ticket), Exchange approval and Bank settlement from the queues, participant portfolio, every page as administrator without JavaScript errors, Market News from Event Admin, IPO listing card, password dialog, read-only faculty view. On staging the market and admin pages ran with the production Content-Security-Policy enforced and showed no CORS/CSP errors.

## Stress test (financial integrity under concurrency)

`tests/stress.mjs` resets the event, starts it and pushes orders for random teams and securities through 10 broker, 4 Exchange and 4 Bank accounts at once. Every 20th order is submitted twice simultaneously with the same idempotency key, and every 20th approved order is settled by three Bank desks at the same instant. Desks retry when the per-user write limit (15 actions/s) answers 429, as an operator would. Afterwards it audits the database through the export API.

| | Local (8,000 orders, 32 workers) | Staging (1,500 orders, 16 workers) |
|---|---|---|
| Orders created / settled | 7,942 / 6,569 | 1,489 / 1,405 |
| Bank rejections (correct outcomes) | 857 insufficient balance, 243 short sell, 200 price band | 60 short sell, 22 price band, 2 insufficient balance |
| Rejected at creation (price band) | 58 | 11 |
| Duplicate-settlement attacks → extra settlements | 397 → **0** | 75 → **0** |
| Idempotent replays → duplicate orders | 400 → **0** | 75 → **0** |
| API calls / duration | 35,329 in 150.7 s (234 calls/s) | 4,737 in 65 s |
| Server errors (5xx / network) | **0** | **0** |
| Latency p50 / p95 / p99 | Bank settlement 2.8 / 12.3 / 58.2 ms | all calls 209 / 239 / 685 ms (includes the ≈ 215 ms network round trip) |

Integrity checks (all passed in both runs): cash ledger reconciles with every team balance · one settlement per settled order · no order settled twice · one broker commission per settlement · brokerage exactly 0.5% on every trade · trade value = quantity × price · holdings equal Σ settled buys − Σ settled sells for every team and security · no negative holdings · no negative cash · each trade starts from the previous trade's price on that security (no lost updates) · market price equals the last settled trade price · loan principal ≤ ₹5,00,000 · loan interest = 2% of each draw.

(73 of the local orders gave up after 12 rate-limited retries and were rejected by "Reject all open orders" at the end; that is the test client, not the engine.)

## Load tests

`tests/load.mjs` is an open-loop generator modelled on event traffic: 62% market polls by up to 600 simulated screens (each keeps its own ETag, like a browser), 12% status, 6% participant portfolio, 4% insights, 3% market news, 4% order tracking, 3% Exchange queue, 3% Bank queue, 3% all portfolios — plus a steady stream of orders going through Exchange and Bank (1 per second), and a ledger reconciliation at the end.

### Local

| Rate | Duration | Requests | Achieved | Failures | p50 / p95 / p99 | Ledger |
|---|---|---|---|---|---|---|
| 850 req/s | 60 s | 51,170 | 852.1 req/s | **0** | 1.7 / 12.1 / 32.9 ms | reconciles |

### Soak test (4 hours)

900 requests/second for 14,400 seconds against a fresh database (`jse_soak`), with orders flowing through Exchange and Bank every second, server memory and database size sampled every 5 minutes (`.local/soak-mon.log`).

_Results are added when the run finishes._

### Staging (from GitHub Actions, US → Singapore)

| Run | Rate | Requests | Success | HTTP 429 (platform) | p50 / p95 / p99 | Ledger |
|---|---|---|---|---|---|---|
| 3 | 300 req/s, 90 s | 24,232 | **100%** | 0 | 217 / 243 / 906 ms | reconciles |
| 3 | 500 req/s, 75 s | 33,952 | 99.63% | 126 | 218 / 456 / 1,122 ms | reconciles |
| 1 | 850 req/s, 90 s | 76,745 (849.8 req/s) | 92.65% | 5,640 | 228 / 755 / 1,860 ms | reconciles |

Every failed request was an HTTP 429 with the plain-text body of Neon's **account-wide concurrency limiter** (default ≈ 100 concurrent function invocations), spread evenly across all endpoints — no application error, no 5xx, and the ledger reconciled after every run. The latency floor is the ≈ 215 ms network round trip from the US runner.

The pattern matches *concurrent invocations ≈ request rate × round-trip time*: 300 req/s × 0.22 s ≈ 65 (no throttling), 500 × 0.22 ≈ 110 (0.4% throttled), 850 × 0.23 ≈ 195 (7% throttled). Participants at the venue are much closer to the Singapore region than the US runner, so the same rate needs far fewer concurrent invocations; this is an estimate — the test machines could not run from India.

Run 2 (850 req/s with the test client retrying every 429 up to four times) showed what a retry storm does: success fell to 77% and latency to seconds. The browser client was changed accordingly: polling reads are never retried on a platform 429 (the poller backs off from 2.5 s up to 30 s and shows "Reconnecting"), and desk actions (POST) are retried at most twice after a random pause — safe because the platform rejected them before the API ran.

## Issues found and fixed during testing

| Found by | Issue | Fix |
|---|---|---|
| listing tests | New IPO_LISTING journal entries violated the journal's action check constraint | `001a_upgrades.sql` extends the constraint |
| staging run 1 | Test expected the CI sign-in route to be absent on staging | Test now expects a forged token to be rejected (401) on staging and the route to be absent locally |
| staging run 2 | Retrying platform 429s amplified throttling (retry storm) | Browser and test clients: no retry for polls, at most 2 for desk actions |
| staging run 3 | CI cleanup signed in against the wrong URL | Runner exports the target URL before signing in |
| staging run 4 | Playwright's eval-based waits are blocked by the site's CSP | Harness waits with CSP bypass only for interactive steps; market and admin checks keep CSP enforced |
| local tests | A failed password test could leave a changed test password | Password test restores state in `finally` |
| function logs | pg printed an SSL-mode deprecation warning on every new instance | Connection string states `sslmode=verify-full` explicitly |

## Hosting limits that matter for 15 October

Neon **Free** plan (current): 1 million function invocations and 5 GB data transfer per month, 100 CU-hours of database compute, about 100 concurrent function invocations per account.

- Event estimate: ~500 screens polling the market every 2.5 s for ~3 h ≈ 2–3 million requests (plus desks) — above the Free allowance. A 4-hour test at 800+ requests/second ≈ 11.5 million requests.
- **Recommendation:** move the Neon organisation to the **Launch** plan before the event (pay as you go: $0.60 per million invocations, $0.10 per active capacity-hour, $0.106 per database CU-hour, 500 GB transfer included), optionally ask Neon support to raise the concurrency limit, then run the 4-hour hosted test with `tests/ci/run.json` (`"loads": [{ "rps": 850, "duration": 14400, "ramp": 120 }]`).
- The tests in this report used roughly 0.25 million of the monthly Free invocations.

## How to reproduce

```bash
npm run db:local && npm run build && npm run dev        # terminal 1
npm run db:local -- testpw
PGURL=postgres://postgres@127.0.0.1:5433/jse npm test   # 33 API tests
npm run test:ui                                          # 63 browser checks
ORDERS=8000 WORKERS=32 npm run stress
RPS=850 DURATION=60 AUDIT=1 npm run load
```

Staging: edit `tests/ci/run.json` on the `v272` branch (suites `health, api, listing, stress, load, ui, prod_warm, cleanup`); the workflow signs in with GitHub OIDC, runs them against staging and commits the results to `tests/ci/results/`.
