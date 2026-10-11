# JSE API reference (v3.13)

Base URL

| Environment | API |
|---|---|
| Production (after cutover) | `https://br-lingering-sun-azzfzwj1-jse.compute.c-3.ap-southeast-1.aws.neon.tech` |
| Staging | `https://br-lingering-sun-azzfzwj1-jsestage.compute.c-3.ap-southeast-1.aws.neon.tech` |
| Local | same origin as the dev server (`http://127.0.0.1:8788`) |

All endpoints live under `/api/`. Requests and responses are JSON (`Content-Type: application/json`), except the CSV, Excel, JSON-file and PDF downloads.

## Conventions

**Authentication.** `POST /api/login` returns an opaque session token. Send it as `Authorization: Bearer <token>`. Sessions last 16 hours, are stored hashed in the database and are revoked by sign-out, password changes and password resets. Permissions are enforced twice: by the API (`need(...)`) and again inside every database function (`jse_require_role`).

**Roles.**

| Role | Accounts | Desk |
|---|---|---|
| `ADMIN` | `ADMIN`, `ASSOC-ADMIN` | Event Admin (Chief Stock Exchange Controller): lifecycle, Market News, configuration, accounts, reports |
| `BROKER` | `BROKER-01…10` | Create Order for the broker's own teams (each team has exactly one broker) |
| `PIT_MANAGER` | `PIT-01…10` | Records trades in Create Order for any team |
| `EXCHANGE` | `EXCHANGE-01…04` | Exchange Settlement: approve / reject executed orders |
| `BANK` | `BANK-01…04` | Bank Settlement: settle / reject, loans |
| `INSTITUTIONAL` | `INST-01…04` | Institutional Investors transaction desk (counterparty mechanism) and Market News |
| `PARTICIPANT` | `TEAM-001…100` | Own orders, portfolio and cash ledger — participant self entry is disabled |
| `VIEWER` | `FACULTY-01…02` | Read-only |

**Material admin actions** (lifecycle, reset, Market News, configuration, listing, allotments, imports, accounts, undo/redo, reject open orders) need `admin_password` in the body: the administrator's own password, re-checked by the engine (`ADMIN_PASSWORD_REQUIRED` / `ADMIN_PASSWORD_INVALID`; 5 wrong attempts lock re-authentication for a few minutes).

**Errors.** Every failure is structured JSON and never a raw database error:

```json
{ "success": false, "error": "Short selling is not allowed: TEAM-003 holds 0 TCS.", "code": "SHORT_SELLING_NOT_ALLOWED" }
```

| HTTP | Meaning | Typical `code` values |
|---|---|---|
| 400 | Invalid input | `INVALID_LOT`, `INVALID_QUANTITY`, `ORDER_VALUE_LIMIT`, `IDEMPOTENCY_KEY_REQUIRED`, `REASON_REQUIRED`, `WEAK_PASSWORD`, `ALLOTMENT_ERRORS`, `LISTING_ERRORS`, `MISSING_HEADERS` |
| 401 | Not signed in / bad credentials | `UNAUTHENTICATED`, `INVALID_CREDENTIALS`, `ADMIN_PASSWORD_INVALID` |
| 403 | Role or team not allowed | `FORBIDDEN`, `NOT_YOUR_TEAM`, `PARTICIPANT_ENTRY_DISABLED` |
| 404 | Unknown team, order, security, endpoint | `TEAM_NOT_FOUND`, `ORDER_NOT_FOUND`, `NOT_FOUND` |
| 409 | Rule or state conflict | `EVENT_NOT_LIVE`, `PRICE_CHANGED`, `PRICE_STALE`, `ORDER_NOT_PENDING`, `ALREADY_SETTLED`, `SHORT_SELL_CONFIRM_REQUIRED`, `IPO_NOT_LISTED`, `IPO_WINDOW_CLOSED`, `OPEN_ORDERS`, `UNSAFE_UNDO`, `LOAN_LIMIT` |
| 423 | Account locked for 5 minutes after 10 failed sign-ins | `ACCOUNT_LOCKED` |
| 429 | Too many actions (writes: 15/s per user, burst 40; sign-in limits) | `TOO_MANY_REQUESTS`, `TOO_MANY_ATTEMPTS` |
| 500/503 | Server or database busy; safe to retry reads | `SERVER_ERROR`, `SERVICE_UNAVAILABLE`, `TIMEOUT` |

A Bank settlement that fails a rule is **not** an HTTP error: the call returns `200` with `"status": "BANK_REJECTED"` and the reason (`SHORT_SELLING_NOT_ALLOWED`, `INSUFFICIENT_BALANCE`, …), because the rejection itself is a recorded outcome.

**Idempotency.** `POST /api/orders`, `POST /api/institutional-order` and participant instructions require `idempotency_key` (any unique string, e.g. a UUID). Re-sending the same key returns the original order with `"replayed": true`. Settlement is protected by a unique index on active settlements, row locks and an atomic status transition, so a second SETTLE always answers `409 ALREADY_SETTLED`.

**Caching.** Reads are cached for about one second per server process and carry an `ETag`; send `If-None-Match` to get `304 Not Modified` when nothing changed. Responses over 1 KB are gzip-compressed when the client accepts it.

## Order workflow and statuses

```
Create Order (broker / Pit Manager) ─▶ EXCHANGE_PENDING ─▶ Exchange APPROVE ─▶ EXCHANGE_APPROVED ─▶ Bank SETTLE ─▶ SETTLED (market / cash updated)
                                        │ EXCHANGE_REJECTED                     │ BANK_REJECTED
```

Tracking shows the four steps *Order Created → Exchange Review → Bank Settlement → Market / Cash Updated*, with the stage `EXCHANGE`, `BANK`, `COMPLETE` or `REJECTED`. Order numbers are `ORD-<n>` (institutional `INS-<n>`) and restart at RESET.

- **Price.** An order is always at the current market price; there is no manual price. The screen sends `expected_price`; if Market News moved the price in between, creation fails with `PRICE_CHANGED`.
- **Market price changed.** When Market News moves a price, every open order created at the old price is closed (`EXCHANGE_REJECTED` or `BANK_REJECTED`, code `PRICE_STALE`, "MARKET PRICE CHANGED"); the Exchange and the Bank re-check too. An order never settles at an obsolete price.
- **Prices move only** through Market News, IPO listing and their undo / redo — never through orders, Exchange approval or Bank settlement. Market News moves are priced to the paisa.

## Public (no sign-in)

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Service and database status: `{ success, version, db, db_ms, uptime_s }`. |
| GET | `/api/market` | Market wall: `status`, `index` (CMS 50 value, base, change, components), `breadth`, `stocks[]` and `ipos[]` (`symbol, name, sector, price, base_price, change_pct, day_change, lot_size, listed`), latest news. |
| GET | `/api/event-status` | Event status, configuration (brokerage, loans, limits, institutional spread, IPO window), counts, the IPO window and the index. |
| GET | `/api/market-news?limit=30` | Latest Market News items (severity, headline, applied %, previous → new price). |
| GET | `/api/cms50` | CMS 50 summary only: value, change, 50 equity components + listed IPO components. |

## Sign-in and account

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/api/login` | `{ username, password }` | Returns `{ token, user, expires_at }`. `user.must_change_password` is `true` after a temporary password. |
| POST | `/api/logout` | — | Revokes the current session. |
| GET | `/api/me` | — | The signed-in user (or `authenticated: false`). |
| POST | `/api/change-password` | `{ old_password, new_password }` | At least 8 characters; signs out the account's other sessions. |
| POST | `/api/ci-login` | `{ token, username }` | **Staging only** (exists only when the function has `CI_OIDC_REPOSITORY`): session for automated tests from a GitHub Actions OIDC token of this repository. 404 in production. |

## Orders, Exchange, Bank

| Method | Path | Roles | Description |
|---|---|---|---|
| GET | `/api/broker-desk?broker=` | BROKER (own), PIT_MANAGER (all teams), ADMIN, VIEWER (`broker=ALL` for all teams) | Create Order desk: teams (cash, loan room, holdings), recent orders. |
| POST | `/api/orders` | BROKER (own teams), PIT_MANAGER, ADMIN | `{ team, symbol \| security_id, side: BUY\|SELL, quantity, expected_price, idempotency_key }` → `EXCHANGE_PENDING`. Quantity in multiples of 50 (stocks and listed IPOs); order value within the configured maximum. Short-sell and cash-shortfall attempts are recorded and returned as `warnings`. Paired ticket (buyer and seller teams): `{ legs: [{team, side:"BUY"}, {team, side:"SELL"}], symbol, quantity, expected_price, idempotency_key }`. Participants are refused (`PARTICIPANT_ENTRY_DISABLED`) — they ask their broker. |
| GET | `/api/tracking` (alias GET `/api/orders`) | Signed in | Order tracking with filters `team, status (OPEN\|PENDING\|REJECTED\|<status>), side, kind (STOCK\|IPO), account (TEAM\|INSTITUTION), q, page, page_size`; KPIs (awaiting Pit / Exchange / Bank, settled, rejected) follow the filter. Participants see only their team, brokers their teams. |
| GET | `/api/order?order_no=` | Signed in | One order with its four-step flow, timeline, settlement, risk events and audit trail. |
| GET | `/api/exchange` | ADMIN, EXCHANGE, VIEWER | Exchange queue (created orders) with pre-checks (holding, free cash, short-sell / cash risk, institutional counterparty) and statistics. |
| POST | `/api/exchange` | ADMIN, EXCHANGE | `{ order_id, action: APPROVE\|REJECT, reason?, confirm_short_sell? }`. Approving a flagged short sell needs `confirm_short_sell: true` (audited as `SHORT_SELLING_APPROVED`). Never changes cash, holdings or prices. |
| GET | `/api/bank` | ADMIN, BANK, VIEWER | Bank queue with cash, holding, required amount and loan room per order; buy / sell request counts, warnings; recent settlements. |
| POST | `/api/bank` | ADMIN, BANK | `{ order_id, action: SETTLE\|REJECT\|CLAIM\|RELEASE, reason? }`. SETTLE revalidates everything in one transaction (including the market price), moves cash and holdings at the order price, charges brokerage (0.50%) and records the broker commission. A BUY short of cash draws an automatic loan for exactly the shortfall (2% interest, ₹5,00,000 limit); if even that is not enough the order is `BANK_REJECTED` (`INSUFFICIENT_BALANCE`). |
| GET / POST | `/api/loan` | ADMIN, BANK (GET also VIEWER) | Loans: principal, interest, liability, remaining limit. `{ team, action: DRAW\|REPAY, amount }`; repayment pays interest first. |

## Institutional Investors (counterparty mechanism)

| Method | Path | Roles | Description |
|---|---|---|---|
| GET | `/api/institutional-portfolio` | ADMIN, INSTITUTIONAL, VIEWER | Transaction desk: rules (spread 2%), current market with the participant BUY price (market + 2%) and SELL price (market − 2%) per security, teams with their brokers, transaction history, statistics. No institutional cash or holdings dashboard. |
| POST | `/api/institutional-order` | ADMIN, INSTITUTIONAL | `{ counterparty_team, symbol, side, quantity, expected_price?, notes?, idempotency_key }`. `side` is the institution's side: `SELL` = the participant **buys** at market + 2%, `BUY` = the participant **sells** at market − 2%. The order belongs to the team's broker and goes through the normal Exchange → Bank workflow. No institutional cash or holdings restriction; the participant pays the normal 0.50% brokerage, earned by its broker (shown in Broker Commission); the settled trade counts toward the team's 5 BUY + 5 SELL. Audited as `INSTITUTIONAL_ORDER_SUBMITTED`. |

## Participants, ledgers, audit, commissions

| Method | Path | Roles | Description |
|---|---|---|---|
| GET | `/api/portfolios` | ADMIN, VIEWER | All 100 teams with cash, holdings value, Net Worth, P/L, return %, assessment (settled BUY / SELL), loan repaid, ₹50K closing rule, eligibility, rank; Winner and Runner-Up. |
| GET | `/api/portfolio-details?team=` | ADMIN, VIEWER, BROKER (own teams), PARTICIPANT (own) | One team: capital (base ₹20,00,000, loan sanctioned ₹5,00,000, base money left, loan available), metrics, holdings, sold stocks / IPOs with realised P/L, IPO allotments, loan and transactions, risk histories, orders and ledger. |
| GET | `/api/cash?team=&type=&q=&page=&page_size=` | ADMIN, BANK, VIEWER, PARTICIPANT (own) | Cash ledger with summary (total debit, total credit, net movement, current cash, entries, by type) and a reconciliation of every team balance. |
| GET | `/api/audit?action=&team=&role=&group=ORDERS\|EXCHANGE\|EVENT&risk=true&q=&page=&page_size=` | ADMIN, VIEWER | Append-only audit log: actor, role, order, team, security, action (`ORDER_CREATED`, `PIT_EXECUTED`, `ORDER_PRICE_STALE`, `EXCHANGE_APPROVED`, `SHORT_SELLING_APPROVED`, `BANK_SETTLED`, `INSUFFICIENT_BALANCE_SETTLED`, `LOAN_DRAW`, `INSTITUTIONAL_ORDER_SUBMITTED`, `MARKET_NEWS_PRICE_MOVE`, `IPO_LISTED`, `CONFIGURATION_UPDATED`, `EVENT_RESET`, …), details, before / after, risk indicator (SHORT SELLING, INSUFFICIENT BALANCE, LOAN USED, PRICE STALE, …) and `risk_count`. |
| GET | `/api/commissions?broker=` | ADMIN, VIEWER, BROKER (own) | Broker ranking and commission report (trade value, rate 0.50%, commission, status), institutional brokerage total, reconciliation with settled brokerage. |

## IPO allotments and listing

| Method | Path | Roles | Description |
|---|---|---|---|
| POST | `/api/ipo-allotments` | ADMIN | `{ rows: [{ team, ipo, lots }], replace?, dry_run? }` or `{ clear: true }` (before START only): all-or-nothing validation, shares = lots × 50, amount = shares × issue price, no brokerage; allotments do not count toward the assessment. Event Admin shows the IPO master (IPO code, name, symbol, price, status, remaining = shares offered − allotted). |
| POST | `/api/ipo-listing` | ADMIN | `{ action: SET\|CLEAR\|APPLY }`. START EVENT lists every IPO (saved price, otherwise the issue price) and adds it to the CMS 50 once; listed IPOs trade in Create Order (asset type IPO). |

## Event administration (ADMIN unless noted)

| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/api/admin-state` | — | ADMIN, VIEWER. Status, counts, statistics, configuration, undo/redo journal, IPO round, brokers, account counts. |
| GET | `/api/insights` | — | ADMIN, VIEWER. Market Intelligence: sentiment, breadth, net flow, institutional signal, gainers / losers, buy / sell pressure, sector analysis, participant performance, provisional Winner / Runner-Up, alerts. |
| POST | `/api/event` | `{ action: START\|PAUSE\|RESUME\|CLOSE\|REOPEN\|FINALIZE }` | NOT_STARTED → LIVE ⇄ SETTLEMENT_ONLY → CLOSED → FINALIZED. START lists the IPOs. FINALIZE is refused while orders are open. |
| POST | `/api/reject-open-orders` | `{ reason? }` | Rejects every order still waiting at the Exchange or Bank. |
| POST | `/api/market-news` | `{ symbol \| security_id, mood, headline? }` (ADMIN and INSTITUTIONAL) | The only price engine; a headline is generated when none is given. Severities: VERY SEVERE (−10 to −7.5%), SEVERE (−7.49 to −5%), NEGATIVE (−4.99 to −1%), NORMAL (±0.99%), POSITIVE (+1 to +4.99%), VERY POSITIVE (+5 to +7.49%), SUPER POSITIVE (+7.5 to +10%). A random move inside the band, capped at the configured maximum (±10%). Open orders created at the old price are closed as MARKET PRICE CHANGED. |
| POST | `/api/undo-redo` | `{ action: UNDO\|REDO, journal_id? }` | Undo / redo of settlements, rejections, Market News, IPO listing and status changes, only when nothing later depends on them. |
| POST | `/api/reset-event` | `{ confirm: "RESET", keep_allotments }` | Clean starting state (₹20,00,000 per team, base prices, IPOs back to pre-market, order numbers restart); clears orders, settlements, holdings, ledgers, commissions, news, price history, loans and counters; archives the audit log (`EVENT_RESET`). Not allowed while LIVE. |
| POST | `/api/config` | `brokerage_rate_pct, max_price_move_pct, max_order_value, min_order_value, cash_rule_limit, initial_capital, loan_max_principal, loan_interest_rate_pct, min_buy_trades, min_sell_trades, event_name, event_start_at, ipo_application_hours, loans_enabled, auto_loan_on_settlement, loan_repayment_required, auto_list_ipos` | Audited as `CONFIGURATION_UPDATED`. Starting capital changes only before START. |
| POST | `/api/teams` · `/api/brokers` | `{ rows: [...] }` | Team details (name from the team-name pool, section, broker, members) and broker roster (code, name, contact, desk). |
| GET / POST | `/api/team-names` | `{ action: RANDOMIZE\|LOCK\|UNLOCK, seed? }` | Indian Knowledge System team-name pool and the reproducible random assignment. |
| POST | `/api/import` | `{ kind: teams\|brokers\|allotments, filename, data_base64 \| csv_text, dry_run?, replace? }` | Excel (.xlsx) or CSV import, validated row by row, applied atomically. |
| GET / POST | `/api/users` | `{ action: RESET_PASSWORD, username, password? }` · `{ action: SET_ACTIVE, username, active }` · `{ action: RESET_ROLE_PASSWORDS, role }` | New passwords are returned once (never stored in clear). |

## Reports, certificates, exports (ADMIN, VIEWER unless noted)

| Method | Path | Description |
|---|---|---|
| GET | `/api/reports` | Event, portfolio statistics, commissions, insights and ledger reconciliation in one document. |
| GET | `/api/export?sheet=<key>&format=csv\|json` | One sheet: `winner, assessment, teams, participants, broker_roster, brokers, cash, holdings, sold_stocks, sold_ipos, networth, loans, cash_rule, short_sell, cash_shortfall, insufficient_balance, orders, rejected, trades, ledger, commission, institutional, ipo_allotments, news, prices, journal, audit`. |
| GET | `/api/export-event-excel` | The final event report: one .xlsx workbook with all 27 sheets. |
| GET | `/api/export-event-json` | The same data as one JSON file. |
| GET | `/api/export-event-csv` | Final Event CSV: one file with Winner, Net Worth, every settled transaction, every order, the cash ledger, price changes, Market News and the full audit log, one section after another. |

## Database functions

Every endpoint is a single call to one PL/pgSQL function (`SELECT jse_<name>(actor, params)`), so every financial action is exactly one database transaction. The functions live in `db/migrations/002_core.sql` (auth, orders, Pit Manager, Exchange, Bank settlement), `003_ops.sql` (institutional orders, loans, Market News, event control, IPO round, reset, undo/redo, administration), `004_reads.sql` (read models), `005_exports.sql` (export sheets) and `008_v311.sql` and `009_hatchable.sql` (one-time data changes).
