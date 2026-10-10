# JSE API reference (v2.72)

Base URL

| Environment | API |
|---|---|
| Production | `https://br-lingering-sun-azzfzwj1-jse.compute.c-3.ap-southeast-1.aws.neon.tech` |
| Staging | `https://br-lingering-sun-azzfzwj1-jsestage.compute.c-3.ap-southeast-1.aws.neon.tech` |
| Local | same origin as the dev server (`http://127.0.0.1:8788`) |

All endpoints live under `/api/`. Requests and responses are JSON (`Content-Type: application/json`), except the CSV and Excel downloads.

## Conventions

**Authentication.** `POST /api/login` returns an opaque session token. Send it as `Authorization: Bearer <token>`. Sessions last 16 hours, are stored hashed in the database and are revoked by sign-out, password changes and password resets. Permissions are enforced twice: by the API (`need(...)`) and again inside every database function (`jse_require_role`).

**Roles.** `ADMIN` (Chief Stock Exchange Controller), `EXCHANGE` (Exchange operator), `BANK` (Bank operator), `BROKER` (pit manager / broker desk), `INSTITUTIONAL` (institutional desk), `PARTICIPANT` (team login, sees only its own team), `VIEWER` (faculty, read-only). "Staff" below means every role except `PARTICIPANT`.

**Errors.** Every failure is structured JSON and never a raw database error:

```json
{ "success": false, "error": "Short selling is not allowed: TEAM-003 holds 0 TCS.", "code": "SHORT_SELLING_NOT_ALLOWED" }
```

| HTTP | Meaning | Typical `code` values |
|---|---|---|
| 400 | Invalid input | `INVALID_LOT`, `INVALID_PRICE_TICK`, `INVALID_QUANTITY`, `PRICE_LIMIT`, `ORDER_VALUE_LIMIT`, `IDEMPOTENCY_KEY_REQUIRED`, `WEAK_PASSWORD`, `ALLOTMENT_ERRORS`, `LISTING_ERRORS` |
| 401 | Not signed in / bad credentials | `UNAUTHENTICATED`, `INVALID_CREDENTIALS` |
| 403 | Role not allowed | `FORBIDDEN`, `PARTICIPANT_ENTRY_DISABLED` |
| 404 | Unknown team, order, security, endpoint | `TEAM_NOT_FOUND`, `ORDER_NOT_FOUND`, `NOT_FOUND` |
| 409 | Rule or state conflict | `EVENT_NOT_LIVE`, `ALREADY_SETTLED`, `ORDER_NOT_PENDING`, `SHORT_SELL_CONFIRM_REQUIRED`, `OPEN_ORDERS`, `UNSAFE_UNDO`, `DUPLICATE`, `RULE_VIOLATION`, `LOAN_LIMIT`, `OWN_MONEY_FIRST` |
| 423 | Account locked for 5 minutes after 10 failed sign-ins | `ACCOUNT_LOCKED` |
| 429 | Too many actions (writes: 15/s per user, burst 40; sign-in limits) | `TOO_MANY_REQUESTS`, `TOO_MANY_ATTEMPTS` |
| 500/503 | Server or database busy; safe to retry reads | `SERVER_ERROR`, `SERVICE_UNAVAILABLE`, `TIMEOUT` |

A Bank settlement that fails a rule is **not** an HTTP error: the call returns `200` with `"status": "BANK_REJECTED"` and the reason (`SHORT_SELLING_NOT_ALLOWED`, `INSUFFICIENT_BALANCE`, `PRICE_LIMIT`, …), because the rejection itself is a recorded outcome.

**Idempotency.** `POST /api/orders` and `POST /api/institutional-order` require `idempotency_key` (any unique string, e.g. a UUID). Re-sending the same key returns the original order with `"replayed": true` instead of creating a second one. Settlement is protected by a unique index on active settlements, row locks and an atomic status transition, so a second SETTLE always answers `409 ALREADY_SETTLED`.

**Caching.** Public reads are cached for about one second per server process and carry an `ETag`; send `If-None-Match` to get `304 Not Modified` when nothing changed. Responses over 1 KB are gzip-compressed when the client accepts it.

## Public (no sign-in)

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Service and database status: `{ success, version, db, db_ms, uptime_s }`. |
| GET | `/api/market` | Market page feed: `status`, `index` (CMS INDEX value, base, change %), `breadth`, `ipos[]`, `stocks[]` (each `symbol, name, type EQUITY/IPO, price, previous_price, base_price, change_pct, day_change_pct, lot_size, trade_count, listed`). |
| GET | `/api/event-status` | Event status, configuration, counts (teams, stocks, IPOs, brokers, pending/settled/rejected orders) and the index. |
| GET | `/api/insights` | Market Intelligence: index, breadth, top gainers/losers, most traded, net-worth statistics, totals, winner pool, winner, top-10 leaderboard, latest news, institutional activity, trade tape. |
| GET | `/api/market-news?limit=30` | Latest Market News items (mood, applied %, previous → new price). |
| GET | `/api/cms50` | CMS INDEX summary only. |

## Sign-in and account

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/api/login` | `{ username, password }` | Returns `{ token, user, expires_at }`. `user.must_change_password` is `true` after a temporary password. |
| POST | `/api/logout` | — | Revokes the current session. |
| GET | `/api/me` | — | The signed-in user (or `authenticated: false`). |
| POST | `/api/change-password` | `{ old_password, new_password }` | At least 8 characters; signs out the account's other sessions. |
| POST | `/api/ci-login` | `{ token, username }` | **Staging only** (exists only when the function has `CI_OIDC_REPOSITORY`): session for automated tests from a GitHub Actions OIDC token of this repository. Returns 404 in production. |

## Participants and portfolios

| Method | Path | Roles | Description |
|---|---|---|---|
| GET | `/api/portfolios` | Staff | All 100 teams in numeric order (TEAM-001 … TEAM-100) with cash, holdings value, Net Worth, P/L, return %, base cash counted, profit cash exempt, ₹50K rule, portfolio access, attempt counters, rank, winner flag; statistics; the winner. |
| GET | `/api/portfolio-details?team=TEAM-001` | Signed in | One team's full detail: metrics, holdings (avg price, cost incl. brokerage, current price, market value, unrealised P/L), sold stocks/IPOs with realised P/L, bought trades, IPO allotments, loan and loan transactions, short-sell / cash-shortfall / insufficient-balance histories, recent orders and ledger. Participants always get their own team. |

## Orders and workflow

| Method | Path | Roles | Description |
|---|---|---|---|
| POST | `/api/orders` | ADMIN, BROKER (PARTICIPANT when enabled in configuration) | Create an order: `{ team, symbol \| security_id, side: BUY\|SELL, quantity, price, idempotency_key }`. Status `EXCHANGE_PENDING`; no cash, holding or price changes. Paired ticket (buyer and seller teams in one step): `{ legs: [{team, side:"BUY"}, {team, side:"SELL"}], symbol, quantity, price, idempotency_key }`. Rules: stock quantity in multiples of 50, IPO quantity in IPO lots, whole-rupee price, order value ₹1 – ₹50,00,000, price within ±10% of the market price. Short-sell and cash-shortfall attempts are recorded and returned as `warnings`. |
| GET | `/api/tracking` (alias `/api/orders`) | Signed in | Order tracking with filters `team, status (OPEN\|PENDING\|REJECTED\|<status>), side, kind (STOCK\|IPO), account (TEAM\|INSTITUTION), q, page, page_size`; KPIs follow the filter. Participants see only their team. |
| GET | `/api/order?id=…` or `?order_no=ORD-000123` | Signed in | One order with its event timeline, settlement, risk events and audit trail. |
| GET | `/api/exchange` | ADMIN, EXCHANGE, VIEWER | Exchange queue with independent pre-checks (holding, free cash, price difference, short-sell/cash risk) and recent decisions. |
| POST | `/api/exchange` | ADMIN, EXCHANGE | `{ order_id, action: APPROVE\|REJECT, reason?, confirm_short_sell? }`. Approving a flagged short sell needs `confirm_short_sell: true`. Never changes cash, holdings or prices. |
| GET | `/api/bank` | ADMIN, BANK, VIEWER | Bank queue with cash, holding, required amount, price-band check and loan room per order; recent settlements; statistics. |
| POST | `/api/bank` | ADMIN, BANK | `{ order_id, action: SETTLE\|REJECT\|CLAIM\|RELEASE, reason? }`. SETTLE revalidates everything (status, duplicate, team, security, quantity, side, price band, cash, holdings, brokerage, loan rules) in one transaction, then moves cash and holdings, records 0.5% brokerage and the broker commission, draws an automatic loan if needed to keep ₹20,000, and sets the market price to the trade price. |
| GET | `/api/loan` | ADMIN, BANK, VIEWER | Loans: principal, interest, liability, remaining limit, draw/repay eligibility. |
| POST | `/api/loan` | ADMIN, BANK | `{ team, action: DRAW\|REPAY, amount }`. Draw only when cash ≤ ₹20,000, within the ₹5,00,000 original-principal limit, 2% interest per draw. Repayment pays interest first and never takes cash below ₹20,000. |

## Ledgers, audit, commissions

| Method | Path | Roles | Description |
|---|---|---|---|
| GET | `/api/cash?team=&type=&q=&page=&page_size=` | ADMIN, BANK, EXCHANGE, VIEWER, PARTICIPANT (own team) | Cash ledger (initial capital, buy, sell, brokerage, loan draw, interest, loan repayment, IPO allotment, reversal) with totals by type and a reconciliation of every team balance against its ledger. |
| GET | `/api/audit?action=&team=&q=&page=&page_size=` | ADMIN, VIEWER, EXCHANGE, BANK | Append-only audit log: user, email, role, action, entity, before/after state, details, IP, session. |
| GET | `/api/commissions` | Staff | Broker commission ranking: orders, buy/sell volume, total trade value, brokerage earned, pending orders. |

## Institutional desk

| Method | Path | Roles | Description |
|---|---|---|---|
| GET | `/api/institutional-portfolio?institution_id=` | ADMIN, INSTITUTIONAL, VIEWER | Institutional account (₹2,00,00,000 start), holdings, orders, ledger, statistics. |
| POST | `/api/institutional-order` | ADMIN, INSTITUTIONAL | `{ counterparty_team, symbol, side, quantity, price, idempotency_key }`. Goes through the same Exchange → Bank workflow; the counterparty team takes the opposite side. |

## Event administration (ADMIN unless noted)

| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/api/admin-state` | — | ADMIN, VIEWER. Status, counts, statistics, configuration, undo/redo journal, IPO allotments, IPO listing state (saved listing prices visible to ADMIN only), brokers, account counts. |
| POST | `/api/event` | `{ action: START\|PAUSE\|RESUME\|CLOSE\|REOPEN\|FINALIZE }` | NOT_STARTED → LIVE → SETTLEMENT_ONLY ↔ LIVE → CLOSED → FINALIZED. START lists IPOs that have saved listing prices (when automatic listing is on). FINALIZE is refused while orders are open. |
| POST | `/api/reject-open-orders` | `{ reason? }` | Rejects every order still waiting at the Exchange or Bank. |
| POST | `/api/market-news` | `{ security_id \| symbol, mood }` | Moods: VERY SEVERE (−10 to −7.5%), SEVERE (−7.49 to −5%), NEGATIVE (−4.99 to −1%), NORMAL (±0.99%), POSITIVE (+1 to +4.99%), VERY POSITIVE (+5 to +7.49%), SUPER POSITIVE (+7.5 to +10%). A random percentage inside the band, capped at ±10%, headline "Automatic … market impact", source MARKET_NEWS, advisory-locked per security. |
| POST | `/api/undo-redo` | `{ action: UNDO\|REDO, journal_id? }` | Undo/redo of Exchange decisions, Bank settlements/rejections, Market News, IPO listings and status changes, only when it is safe. |
| POST | `/api/reset-event` | `{ confirm: "RESET", keep_allotments }` | Clean starting state: ₹20,00,000 per team, ₹2,00,00,000 institutional cash, base prices (IPOs ₹890/₹780/₹620/₹710); clears orders, settlements, holdings, ledgers, commissions, news, price history, loans, counters; archives the audit log. Not allowed while LIVE. |
| POST | `/api/ipo-allotments` | `{ rows: [{ team, ipo, lots }], replace? }` or `{ clear: true, team? }` | Pre-event IPO allotment upload (before START only): all-or-nothing validation, lots × lot size at the issue price, no brokerage. |
| POST | `/api/ipo-listing` | `{ action: SET, rows: [{ ipo, listing_price }] }` · `{ action: CLEAR }` · `{ action: APPLY, symbols? }` | Confidential IPO listing prices (whole rupees, 50%–200% of the issue price). APPLY lists now; START lists automatically when `auto_list_ipos` is on. An IPO can no longer be listed once it has traded or moved on Market News. |
| POST | `/api/config` | any of `event_name, max_price_move_pct, brokerage_rate, min_order_value, max_order_value, min_cash_buffer, cash_rule_limit, loan_max_principal, loan_interest_rate, initial_capital, institutional_cash, loans_enabled, auto_loan_on_settlement, participant_order_entry, institution_overdraft, auto_list_ipos` | Starting capital can change only before START. |
| POST | `/api/teams` | `{ rows: [{ team, name, section, broker, members, active }] }` | Team details and broker assignment. |
| POST | `/api/brokers` | `{ rows: [{ broker, name }] }` | Broker names. |
| GET | `/api/users` | — | All accounts. |
| POST | `/api/users` | `{ action: RESET_PASSWORD, username, password? }` · `{ action: SET_ACTIVE, username, active }` · `{ action: RESET_ROLE_PASSWORDS, role }` | New passwords are returned once (never stored in clear). |

## Reports and exports (ADMIN, VIEWER)

| Method | Path | Description |
|---|---|---|
| GET | `/api/reports` | Event, portfolio statistics, commissions, insights and ledger reconciliation in one document. |
| GET | `/api/certificates` | Final ranking (winner pool first) and top brokers for certificates. |
| GET | `/api/export?sheet=<key>&format=csv\|json` | One sheet: `winner, teams, participants, brokers, cash, holdings, sold_stocks, sold_ipos, networth, loans, cash_rule, short_sell, cash_shortfall, insufficient_balance, orders, rejected, trades, ledger, commission, institutional, news, prices, audit`. |
| GET | `/api/export-event-excel` | The final event report: one .xlsx workbook with all 23 sheets. |

## Database functions

Every endpoint is a single call to one PL/pgSQL function (`SELECT jse_<name>(actor, params)`), so every financial action is exactly one database transaction. The functions live in `db/migrations/002_core.sql` (auth, orders, Exchange, Bank settlement), `003_ops.sql` (institutional orders, loans, Market News, event control, IPO allotment and listing, reset, undo/redo, administration), `004_reads.sql` (read models) and `005_exports.sql` (export sheets).
