# Event-day desk guide — DALAL STREET 2026

Site: https://jain-stock-exchange.pages.dev (after the production switch) · rehearsal/staging: https://v272.jse-live.pages.dev
Sign in from the **Sign in** button (top right). Everyone can change their password with the **Password** button.

**No fixed start time:** the market opens when the Controller presses **START EVENT** (IPOs list and join the CMS 50 at that moment).

**Closing cash rule:** At market closing, each team can hold a maximum of 5% of the initial virtual capital (₹50,000 out of ₹20 lakh) as cash in their portfolio. Cash generated from profits earned during trading is exempt from this limit. *Example:* if a team earns a profit of ₹5 lakh and holds ₹4 lakh in cash from the profits earned, this amount will not be counted under the 5% cash limit, provided the initial virtual capital has been fully invested.

## Before the event (Chief Stock Exchange Controller, ADMIN)

Material actions ask for your administrator password again.

1. **Rules & Configuration**: check brokerage 0.50%, ±10% Market News cap, loan ₹5,00,000 at 2%, 5 BUY + 5 SELL, ₹50,000 closing cash criterion → *Save configuration*.
2. **Teams / Brokers**: *Randomize names* from the Indian Knowledge System pool (then *Lock names*), or import the roster (Excel/CSV: Team, Team Name, Section, Broker, Members · Broker Code, Broker Name, Contact, Desk). Every team has exactly one broker.
3. **IPO allotments**: load the lucky-draw result (`team,ipo,lots` — Excel or CSV) → *Validate only*, then *Validate & import*. Nothing is loaded unless every row is valid; cash is taken at the issue price, no brokerage, and allotments do not count toward the 5 + 5.
4. **IPO listing**: at START EVENT every IPO lists at its issue price and joins the CMS 50.
5. **Account controls**: for each role choose it and press *Issue new passwords for this role…*. Each CSV downloads once — print the slips.
6. **Rehearsal**: START EVENT → a few orders through Create Order → Exchange → Bank → CLOSE EVENT → **Reset event** with *Keep loaded IPO allotments* ticked.
7. Projector: open `https://jain-stock-exchange.pages.dev/?tv=1` and press F11.

## During the event

| Desk | Page | What to do |
|---|---|---|
| Controller (ADMIN) | Event Admin | **START EVENT** when you are ready (IPOs list and join the CMS 50). Market News: choose company, headline and severity → *Publish news*. Negotiated matched trades update the price only after both legs settle. **PAUSE · SETTLEMENT ONLY** stops new orders while queues clear. Market Intelligence and alerts show waiting orders and risk. |
| Brokers (BROKER-01…10) / Pit Managers (PIT-01…10, any team) | Create Order | Choose one of your teams, BUY or SELL, the stock / listed IPO and the quantity (multiples of 50). Standard orders use the current market price; a negotiated team-to-team price is entered as a matched pair by a Pit Manager; brokerage 0.50% and the cash or holding check are shown before *Submit*. If Market News moves the price first, the order is not submitted — review it with the team and submit again. |
| Exchange (EXCHANGE-01…04) | Exchange Settlement | Review created orders (holding, free cash and risk are pre-checked) → *Approve* or *Reject* with a reason. A short-selling warning needs **APPROVE ANYWAY**. Approval never moves cash, holdings or prices. |
| Bank (BANK-01…04) | Bank Settlement | *Settle* or *Reject*. The Bank re-checks everything; settlement moves cash and holdings at the order price and charges 0.50% brokerage; a warning card asks for **APPROVE ANYWAY**. Loan repayment: *Bank loan repayment* panel (interest first). A BUY short of cash draws a loan for exactly the shortfall (2% interest, ₹5,00,000 limit); beyond that the order is rejected for insufficient balance. |
| Institutional (INST-01…04) | Institutional Investors | When a team cannot find a counterparty: choose the team, side, security and quantity. The participant **buys at market + the configured spread** or **sells at market − the configured spread**; the order goes through the Exchange and Bank like any other, with normal brokerage to the team's broker. The desk can also apply Market News (random move inside the mood band). |
| Participants (TEAM-001…100) | Order Tracking · Participant Portfolios · Cash Ledger | Ask your broker to create orders; follow the four-step tracking, cash, holdings, Net Worth, assessment (5 BUY + 5 SELL), loan and the ₹50,000 closing cash criterion. |
| Faculty (FACULTY-01, 02) | all pages | Read-only. |

## Closing

1. **PAUSE / RESUME** (settlement only) and let the Exchange and Bank clear their queues.
2. **CLOSE EVENT** — the closing cash limit is applied: at most ₹50,000 (5% of ₹20 lakh) cash per team; cash generated from trading profits is exempt, provided the initial capital has been fully invested.
3. **Reject open orders** if anything is still waiting.
4. **FINALIZE EVENT** — exactly one Winner and one Runner-Up among eligible teams (highest Net Worth).
5. **Final Event CSV** (one file: Winner, Net Worth, all transactions, all orders, cash ledger, price changes, Market News, audit log), **Final Event Excel** (27 sheets), **JSON Archive** and **Winner / Net Worth CSV** from Reports & Exports.

## If something goes wrong

- A page shows **Reconnecting**: wait — it retries by itself (backing off up to 30 seconds). Data is never lost; every action is one database transaction.
- **Wrong settlement or news**: Event Admin → **UNDO LAST SETTLEMENT**, or *Recovery · Undo / Redo* → *Undo* on that row (allowed only if nothing later changed that stock or that team's loan).
- **Forgotten password**: ADMIN → *Account controls* → *New password* on that row.
- **Administrator locked out**: Neon Console → SQL editor on database `jse` → `SELECT jse_bootstrap_password('ADMIN');`
- **Is the service up?** Open `https://br-lingering-sun-azzfzwj1-jse.compute.c-3.ap-southeast-1.aws.neon.tech/api/health` — `"db": "ok"` means everything is running.


## Negotiated team-to-team trade
Teams may negotiate a price directly with another team. The Pit Manager records a matched BUY and SELL at the same whole-rupee agreed price using **Create Order → Negotiated Team-to-Team Trade**. Both legs pass through Exchange review and Bank settlement. The Market page price changes to the agreed price only after both matched legs have settled successfully; if one leg is rejected or fails settlement, the market price is not updated. The price change is recorded in price history and stale open orders are handled by the existing price-change control.

## Institutional price
Institutional counterparty orders use the configured spread from the current Market price: the participant buys from the institution at market plus spread, or sells to it at market minus spread. Brokerage and participant-side cash/holdings checks still apply. The Event Admin and Institutional desk can publish Market News; moves use the selected mood band and the shared price engine.

## Closing cash fallback at finalisation
When the Event Admin finalises a closed event, if fewer than two teams qualify only because of the closing-cash cap, the system may raise the cap to the minimum level that admits the top two otherwise-qualified teams. The new limit applies uniformly and is audit-logged. Teams must still satisfy settled BUY/SELL and loan-repayment criteria. If fewer than two teams satisfy those other criteria, finalisation is blocked rather than fabricating an awardee.
