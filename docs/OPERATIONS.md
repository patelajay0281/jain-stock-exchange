# Event-day desk guide — DALAL STREET 2026

Site: https://jain-stock-exchange.pages.dev (after the production switch) · rehearsal/staging: https://v272.jse-live.pages.dev
Sign in from the **Sign in** button (top right). Everyone can change their password with the **Password** button.

## Night before (Chief Stock Exchange Controller, ADMIN)

1. **Event Admin → Reset event** (untick *Keep loaded IPO allotments* for a completely fresh start) and type `RESET`.
2. *Optional* **Teams & brokers**: paste `team,name,section,broker,members` rows → *Update teams*.
3. **IPO allotments**: paste the lucky-draw result `team,ipo,lots` (or choose the CSV file) → *Validate & load allotments*. Nothing is loaded unless every row is valid; cash is taken at the issue price, no brokerage.
4. **IPO listing prices**: type the four listing prices → *Save listing prices*. Only administrators can see them. Keep *List automatically when START EVENT is pressed* ticked.
5. **Accounts & passwords**: for each role choose it and press *Issue new passwords for this role…* (type `ISSUE`). Each CSV downloads once — print the slips. Participant teams: role *Participant teams (100)*.
6. **Rehearsal**: START EVENT → place and settle a few orders → CLOSE EVENT → Reset event with *Keep loaded IPO allotments* ticked. Saved listing prices are kept.
7. Projector: open `https://jain-stock-exchange.pages.dev/?tv=1` and press F11.

## During the event

| Desk | Page | What to do |
|---|---|---|
| Controller (ADMIN) | Event Admin | **START EVENT** at 1:15 PM (IPOs list at their saved prices). Market News: choose company + mood → *Publish news*. **PAUSE · SETTLEMENT ONLY** stops new orders while queues clear. *Undo last action* / journal *Undo* only when safe. |
| Broker / pit manager (PIT-01…10) | Create Order | Choose the team, BUY or SELL, stock/IPO, quantity (multiples of 50) and the agreed price (the allowed ±10% range is shown under the box) → *Submit order to Exchange*. Use **Buyer + Seller** when two teams trade with each other (two linked orders). Follow orders on *Order Tracking*. |
| Exchange (EXCHANGE-01…04) | Exchange | Review the queue (holding, free cash, price difference are pre-checked) → *Approve* or *Reject* with a reason. A short-sell flag needs confirmation; the Bank will still refuse it. Approval never moves cash or prices. |
| Bank (BANK-01…04) | Bank | *Settle* or *Reject*. The Bank re-checks everything; settlement moves cash and holdings, charges 0.5% brokerage and sets the market price. If a team needs cash, a loan is drawn automatically to keep ₹20,000 (2% interest, ₹5,00,000 limit). The *Loans* panel draws or repays on request. |
| Institutional (INST-01…04) | Institutional | Order ticket with a counterparty team (same Exchange → Bank flow), live tape, portfolio, Market News control. |
| Participants (TEAM-001…100) | My Portfolio | Cash, holdings, Net Worth, P/L, ₹50K rule status, loans, risk history, own orders and ledger. |
| Faculty (FACULTY-01, 02) | all pages | Read-only. |

## Closing

1. **PAUSE · SETTLEMENT ONLY** and let the Exchange and Bank clear their queues.
2. **CLOSE EVENT** — the ₹50K closing cash rule becomes active (portfolios stay visible: ELIGIBLE / LOCKED).
3. **Reject all open orders** if anything is still waiting.
4. **FINALIZE EVENT**.
5. **Download final event report (Excel)** (23 sheets) and print from **Certificates**.

## If something goes wrong

- A page shows **Reconnecting**: wait — it retries by itself (backing off up to 30 seconds). Data is never lost; every action is one database transaction.
- **Wrong settlement or news**: Event Admin → *Undo / Redo journal* → *Undo* on that row (allowed only if nothing later changed that stock or that team's loan).
- **Forgotten password**: ADMIN → *Accounts & passwords* → *New password* on that row (participants: issue for the role, or ask an administrator).
- **Administrator locked out**: Neon Console → SQL editor on database `jse` → `SELECT jse_bootstrap_password('ADMIN');`
- **Is the service up?** Open `https://br-lingering-sun-azzfzwj1-jse.compute.c-3.ap-southeast-1.aws.neon.tech/api/health` — `"db": "ok"` means everything is running.
