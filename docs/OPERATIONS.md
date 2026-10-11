# Event-day desk guide — DALAL STREET 2026

Site: https://jain-stock-exchange.pages.dev (after the production switch) · rehearsal/staging: https://v272.jse-live.pages.dev
Sign in from the **Sign in** button (top right). Everyone can change their password with the **Password** button.

**Event day timing:** 12:45 PM onwards — participant lobby · by 1:00 PM — Guest of Honour · **1:15 PM SHARP — event begins, IPO reveal, market goes live.**

## Before the event (Chief Stock Exchange Controller, ADMIN)

Material actions ask for your administrator password again.

1. **Rules & Configuration**: check event start (15 Oct, 1:15 PM IST), brokerage 0.50%, ±10% Market News cap, loan ₹5,00,000 at 2%, 5 BUY + 5 SELL, ₹50,000 closing cash criterion → *Save configuration*.
2. **Teams / Brokers**: *Randomize names* from the Indian Knowledge System pool (then *Lock names*), or import the roster (Excel/CSV: Team, Team Name, Section, Broker, Members · Broker Code, Broker Name, Contact, Desk). Every team has exactly one broker.
3. **IPO round**: publish each prospectus (sections and/or PDF). The application window opens exactly 48 hours before the event start and stays open 24 hours; participants apply in lots of 50 on the IPO page.
4. **IPO allotments**: after the window closes, load the result (`team,ipo,lots` — Excel or CSV) → *Validate only*, then *Validate & import*. Nothing is loaded unless every row is valid; cash is taken at the issue price, no brokerage, and allotments do not count toward the 5 + 5.
5. **IPO listing** (optional): save confidential listing prices; otherwise each IPO lists at its issue price. Keep *List IPOs automatically at START EVENT* ticked.
6. **Account controls**: for each role choose it and press *Issue new passwords for this role…*. Each CSV downloads once — print the slips.
7. **Rehearsal**: START EVENT → a few orders through Create Order → Pit Manager → Exchange → Bank → CLOSE EVENT → **Reset event** with *Keep loaded IPO allotments* ticked.
8. Projector: open `https://jain-stock-exchange.pages.dev/?tv=1` and press F11.

## During the event

| Desk | Page | What to do |
|---|---|---|
| Controller (ADMIN) | Event Admin | **START EVENT** at 1:15 PM sharp (IPOs list and join the CMS 50). Market News: choose company, headline and severity → *Publish news* — the only way prices move. **PAUSE · SETTLEMENT ONLY** stops new orders while queues clear. Market Intelligence and alerts show waiting orders and risk. |
| Brokers (BROKER-01…10) | Create Order | Choose one of your teams, BUY or SELL, the stock / listed IPO and the quantity (multiples of 50). The price is always the current market price; brokerage 0.50% and the cash or holding check are shown before *Submit*. If Market News moves the price first, the order is not submitted — review it with the team and submit again. Participant instructions appear on the desk. |
| Pit Managers (PIT-01…10) | Pit Manager | Check each slip — team, broker, security, side, quantity, price — then **EXECUTE ORDER** (issues the one trading slip) or **Reject** with a reason. A slip whose market price changed is **PRICE STALE** and cannot be executed. |
| Exchange (EXCHANGE-01…04) | Exchange Settlement | Review executed orders (holding, free cash and risk are pre-checked) → *Approve* or *Reject* with a reason. A short-sell flag needs explicit confirmation. Approval never moves cash, holdings or prices. |
| Bank (BANK-01…04) | Bank Settlement | *Settle* or *Reject*. The Bank re-checks everything; settlement moves cash and holdings at the slip price and charges 0.50% brokerage. A BUY short of cash draws a loan for exactly the shortfall (2% interest, ₹5,00,000 limit); beyond that the order is rejected for insufficient balance. |
| Institutional (INST-01…04) | Institutional Investors | When a team cannot find a counterparty: choose the team, side, security and quantity. The participant **buys at market + 2%** or **sells at market − 2%**; the order goes through the Pit Manager, Exchange and Bank like any other, with normal brokerage to the team's broker. |
| Participants (TEAM-001…100) | My Orders · My Trading Slips · My Portfolio · IPO | Ask your broker to place orders; follow the six-step tracking, slips, cash, holdings, Net Worth, assessment (5 BUY + 5 SELL), loan and the ₹50,000 closing cash criterion. |
| Faculty (FACULTY-01, 02) | all pages | Read-only. |

## Closing

1. **PAUSE · SETTLEMENT ONLY** and let the Pit Manager, Exchange and Bank clear their queues.
2. **CLOSE EVENT** — the ₹50,000 closing cash criterion is applied (a closing eligibility condition, not a cash floor during trading).
3. **Reject open orders** if anything is still waiting.
4. **FINALIZE EVENT** — exactly one Winner and one Runner-Up among eligible teams (highest Net Worth).
5. **Final Event Excel** (30 sheets) / **Final Event JSON**, then print from **Certificates** (award and share certificates).

## If something goes wrong

- A page shows **Reconnecting**: wait — it retries by itself (backing off up to 30 seconds). Data is never lost; every action is one database transaction.
- **Wrong settlement or news**: Event Admin → *Recovery · Undo / Redo* → *Undo* on that row (allowed only if nothing later changed that stock or that team's loan).
- **Forgotten password**: ADMIN → *Account controls* → *New password* on that row.
- **Administrator locked out**: Neon Console → SQL editor on database `jse` → `SELECT jse_bootstrap_password('ADMIN');`
- **Is the service up?** Open `https://br-lingering-sun-azzfzwj1-jse.compute.c-3.ap-southeast-1.aws.neon.tech/api/health` — `"db": "ok"` means everything is running.
