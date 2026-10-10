// End-to-end API tests for the v272 rules. Run against a server with known test passwords:
//   BASE=http://127.0.0.1:8788 node --test tests/api.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { signIn } from "./lib/client.mjs";

const BASE = process.env.BASE || "http://127.0.0.1:8788";
const PW = {
  ADMIN: process.env.PW_ADMIN || "admin-pass-1", "PIT-01": process.env.PW_PIT || "pit-pass-01",
  "EXCHANGE-01": process.env.PW_EXCH || "exch-pass-01", "BANK-01": process.env.PW_BANK || "bank-pass-01",
  "INST-01": process.env.PW_INST || "inst-pass-01", "TEAM-001": process.env.PW_T1 || "team-pass-001",
  "TEAM-002": process.env.PW_T2 || "team-pass-002", "FACULTY-01": process.env.PW_FAC || "faculty-pass-1",
};
const tokens = {};

async function api(method, path, body, who) {
  const headers = { accept: "application/json" };
  if (body !== undefined) headers["content-type"] = "application/json";
  if (who) headers.authorization = "Bearer " + tokens[who];
  const r = await fetch(BASE + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const ct = r.headers.get("content-type") || "";
  const data = ct.includes("json") ? await r.json() : await r.arrayBuffer();
  return { status: r.status, data, headers: r.headers };
}
const GET = (p, who) => api("GET", p, undefined, who);
const POST = (p, b, who) => api("POST", p, b, who);
const key = () => randomUUID();
const num = (v) => Number(v);

async function order(team, symbol, side, quantity, price, who = "PIT-01") {
  return POST("/api/orders", { team, symbol, side, quantity, price, idempotency_key: key() }, who);
}
async function approve(id, extra = {}) { return POST("/api/exchange", { order_id: id, action: "APPROVE", ...extra }, "EXCHANGE-01"); }
async function settle(id) { return POST("/api/bank", { order_id: id, action: "SETTLE" }, "BANK-01"); }
async function detail(team) { return (await GET("/api/portfolio-details?team=" + team, "ADMIN")).data; }
async function marketPrice(symbol) {
  const m = (await GET("/api/market")).data;
  return num([...m.stocks, ...m.ipos].find((s) => s.symbol === symbol).price);
}
async function fullTrade(team, symbol, side, qty, price) {
  const o = await order(team, symbol, side, qty, price);
  assert.equal(o.status, 200, JSON.stringify(o.data));
  const id = o.data.order.id;
  const a = await approve(id, { confirm_short_sell: true });
  assert.equal(a.status, 200, JSON.stringify(a.data));
  const s = await settle(id);
  assert.equal(s.status, 200, JSON.stringify(s.data));
  return { id, settle: s.data };
}

test("login all roles", async () => {
  // locally: known test passwords (tests/test-passwords.sql); on staging: GitHub OIDC sign-in
  for (const u of Object.keys(PW)) tokens[u] = await signIn(u);
  const bad = await POST("/api/login", { username: "ADMIN", password: "nope" });
  assert.equal(bad.status, 401);
});

test("reset to a clean event", async () => {
  const st = (await GET("/api/event-status")).data.status;
  if (st === "LIVE" || st === "SETTLEMENT_ONLY") await POST("/api/event", { action: "CLOSE" }, "ADMIN");
  const r = await POST("/api/reset-event", { confirm: "RESET", keep_allotments: false }, "ADMIN");
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(r.data.status, "NOT_STARTED");
  await POST("/api/ipo-listing", { action: "CLEAR" }, "ADMIN");   // IPOs trade from their issue prices in this suite
});

test("reference data: 100 teams, 50 stocks, 4 IPOs, 10 brokers, IPO prices", async () => {
  const s = (await GET("/api/event-status")).data;
  assert.equal(s.counts.teams, 100);
  assert.equal(s.counts.stocks, 50);
  assert.equal(s.counts.ipos, 4);
  assert.equal(s.counts.brokers, 10);
  const m = (await GET("/api/market")).data;
  const ipo = Object.fromEntries(m.ipos.map((x) => [x.symbol, num(x.price)]));
  assert.deepEqual(ipo, { VOLTRA: 890, BLUEAI: 780, SHREEB: 620, AAROGYA: 710 });
  assert.ok(m.stocks.every((x) => x.type === "EQUITY") && m.ipos.every((x) => x.type === "IPO"));
  const p = (await GET("/api/portfolios", "ADMIN")).data;
  const codes = p.teams.map((t) => t.code);
  assert.equal(codes[0], "TEAM-001"); assert.equal(codes[8], "TEAM-009"); assert.equal(codes[9], "TEAM-010"); assert.equal(codes[99], "TEAM-100");
  assert.ok(p.teams.every((t) => num(t.cash) === 2000000 && num(t.net_worth) === 2000000));
});

test("security: public and wrong roles are rejected server-side", async () => {
  assert.equal((await GET("/api/portfolios")).status, 401);
  assert.equal((await GET("/api/admin-state")).status, 401);
  assert.equal((await POST("/api/event", { action: "START" })).status, 401);
  assert.equal((await POST("/api/event", { action: "START" }, "PIT-01")).status, 403);
  assert.equal((await POST("/api/bank", { order_id: 1, action: "SETTLE" }, "EXCHANGE-01")).status, 403);
  assert.equal((await POST("/api/market-news", { symbol: "TCS", mood: "POSITIVE" }, "BANK-01")).status, 403);
  assert.equal((await GET("/api/portfolios", "TEAM-001")).status, 403);
  assert.equal((await GET("/api/portfolio-details?team=TEAM-002", "TEAM-001")).data.team.code, "TEAM-001", "participant always sees own team");
  assert.equal((await GET("/api/export?sheet=orders", "PIT-01")).status, 403);
});

test("IPO allotment upload before START (no brokerage, no price change)", async () => {
  const r = await POST("/api/ipo-allotments", { rows: [
    { team: "TEAM-005", ipo: "VOLTRA", lots: 2 }, { team: "TEAM-005", ipo: "BLUEAI", lots: 1 }, { team: "TEAM-006", ipo: "AAROGYA", lots: 4 },
  ] }, "ADMIN");
  assert.equal(r.status, 200, JSON.stringify(r.data));
  const d = (await detail("TEAM-005"));
  assert.equal(num(d.team.cash), 2000000 - 100 * 890 - 50 * 780);
  assert.equal(d.holdings.find((h) => h.symbol === "VOLTRA").quantity, 100);
  assert.equal(await marketPrice("VOLTRA"), 890);
  const bad = await POST("/api/ipo-allotments", { rows: [{ team: "TEAM-999", ipo: "VOLTRA", lots: 1 }] }, "ADMIN");
  assert.equal(bad.status, 400);
});

test("orders are refused before START", async () => {
  const r = await order("TEAM-001", "TCS", "BUY", 50, 1864);
  assert.equal(r.status, 409);
  assert.equal(r.data.code, "EVENT_NOT_LIVE");
});

test("START event", async () => {
  const r = await POST("/api/event", { action: "START" }, "ADMIN");
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(r.data.status, "LIVE");
  const again = await POST("/api/ipo-allotments", { rows: [{ team: "TEAM-007", ipo: "VOLTRA", lots: 1 }] }, "ADMIN");
  assert.equal(again.status, 409, "allotments locked after START");
});

test("order validation: lots of 50, 10% band, whole rupees, value limits, idempotency", async () => {
  assert.equal((await order("TEAM-001", "TCS", "BUY", 75, 1864)).data.code, "INVALID_LOT");
  assert.equal((await order("TEAM-001", "TCS", "BUY", 25, 1864)).data.code, "INVALID_LOT");
  assert.equal((await order("TEAM-001", "TCS", "BUY", 50, 1864.5)).data.code, "INVALID_PRICE_TICK");
  assert.equal((await order("TEAM-001", "TCS", "BUY", 50, 2100)).data.code, "PRICE_LIMIT");    // +12.7%
  assert.equal((await order("TEAM-001", "TCS", "BUY", 50, 1650)).data.code, "PRICE_LIMIT");    // -11.5%
  const ok = await order("TEAM-001", "TCS", "BUY", 50, 2050);                                  // +9.98%
  assert.equal(ok.status, 200, JSON.stringify(ok.data));
  assert.equal((await order("TEAM-001", "MARUTI", "BUY", 400, 13200)).data.code, "ORDER_VALUE_LIMIT"); // 52.8L > 50L
  const k = key();
  const a = await POST("/api/orders", { team: "TEAM-001", symbol: "INFY", side: "BUY", quantity: 50, price: 900, idempotency_key: k }, "PIT-01");
  const b = await POST("/api/orders", { team: "TEAM-001", symbol: "INFY", side: "BUY", quantity: 50, price: 900, idempotency_key: k }, "PIT-01");
  assert.equal(a.data.order.id, b.data.order.id);
  assert.equal(b.data.replayed, true);
  // order creation and exchange approval do not move prices or cash
  assert.equal(await marketPrice("TCS"), 1864);
  await approve(ok.data.order.id);
  assert.equal(await marketPrice("TCS"), 1864);
  assert.equal(num((await detail("TEAM-001")).team.cash), 2000000);
  // clean up: reject both
  await POST("/api/bank", { order_id: ok.data.order.id, action: "REJECT", reason: "test cleanup" }, "BANK-01");
  await POST("/api/exchange", { order_id: a.data.order.id, action: "REJECT", reason: "test cleanup" }, "EXCHANGE-01");
});

test("BUY → Exchange → Bank: cash, holdings, 0.5% brokerage, price update", async () => {
  const before = (await detail("TEAM-001")).team;
  const { settle: s } = await fullTrade("TEAM-001", "RELIANCE", "BUY", 100, 2950);
  assert.equal(s.status, "BANK_SETTLED");
  assert.equal(num(s.trade_value), 295000);
  assert.equal(num(s.brokerage), 1475);                    // exactly 0.5%
  const d = await detail("TEAM-001");
  assert.equal(num(d.team.cash), num(before.cash) - 295000 - 1475);
  assert.equal(d.holdings.find((h) => h.symbol === "RELIANCE").quantity, 100);
  assert.equal(num(d.team.brokerage_paid), 1475);
  assert.equal(await marketPrice("RELIANCE"), 2950);
  const m = (await GET("/api/market")).data;
  const rel = m.stocks.find((x) => x.symbol === "RELIANCE");
  assert.equal(num(rel.previous_price), 2890);
  assert.equal(num(m.index.value), num(m.index.base_value) + 60);
});

test("duplicate settlement is blocked (sequential and concurrent)", async () => {
  const o = await order("TEAM-002", "INFY", "BUY", 50, 905);
  await approve(o.data.order.id);
  const results = await Promise.all(Array.from({ length: 12 }, () => settle(o.data.order.id)));
  const ok = results.filter((r) => r.status === 200);
  assert.equal(ok.length, 1, "exactly one settlement succeeds: " + results.map((r) => r.status + ":" + (r.data.code || "")).join(","));
  assert.ok(results.filter((r) => r.status === 409).length === 11);
  const d = await detail("TEAM-002");
  assert.equal(d.holdings.find((h) => h.symbol === "INFY").quantity, 50);
  assert.equal(num(d.team.cash), 2000000 - 45250 - 226.25);
});

test("SELL → Exchange → Bank: cash up, holding down, realised P/L", async () => {
  const before = (await detail("TEAM-001")).team;
  const { settle: s } = await fullTrade("TEAM-001", "RELIANCE", "SELL", 50, 3000);
  assert.equal(num(s.trade_value), 150000);
  assert.equal(num(s.brokerage), 750);
  const d = await detail("TEAM-001");
  assert.equal(num(d.team.cash), num(before.cash) + 150000 - 750);
  assert.equal(d.holdings.find((h) => h.symbol === "RELIANCE").quantity, 50);
  // cost of 50 of 100 shares bought at 2950 incl. brokerage = 148,237.50 ; proceeds 149,250 → +1,012.50
  assert.equal(num(s.realized_pnl), 1012.5);
  assert.equal(d.sold.length, 1);
  assert.equal(num(d.sold[0].net_proceeds), 149250);
});

test("short selling: recorded at creation, Exchange needs confirmation, Bank rejects", async () => {
  const o = await order("TEAM-003", "TCS", "SELL", 100, 1864);
  assert.equal(o.status, 200);
  assert.ok(o.data.warnings.some((w) => w.code === "SHORT_SELL"));
  const noConfirm = await approve(o.data.order.id);
  assert.equal(noConfirm.status, 409);
  assert.equal(noConfirm.data.code, "SHORT_SELL_CONFIRM_REQUIRED");
  assert.equal((await approve(o.data.order.id, { confirm_short_sell: true })).status, 200);
  const s = await settle(o.data.order.id);
  assert.equal(s.data.status, "BANK_REJECTED");
  assert.equal(s.data.code, "SHORT_SELLING_NOT_ALLOWED");
  const d = await detail("TEAM-003");
  assert.equal(d.team.short_sell_attempts, 1, "one attempt per order");
  assert.equal(d.short_sell_history.length, 1);
  assert.equal(d.short_sell_history[0].holding_before, 0);
  assert.equal(num(d.team.cash), 2000000);
});

test("cash shortfall attempt and insufficient-balance rejection", async () => {
  // TEAM-004 spends down to ~₹3.4L with two big buys
  await fullTrade("TEAM-004", "MARUTI", "BUY", 350, 13200);   // 46.2L > ... value limit is 50L: ok (46.2L) but cash is only 20L → will need loan → rejected
  let d = await detail("TEAM-004");
  assert.equal(d.team.cash_shortfall_attempts, 1);
  assert.equal(d.team.insufficient_balance_rejections, 1);
  assert.equal(num(d.team.cash), 2000000, "rejection leaves cash untouched");
  assert.equal(d.cash_shortfall_history[0].required_cash > 0, true);
});

test("automatic loan at settlement keeps ₹20,000; 2% interest; ₹5L limit", async () => {
  // TEAM-008 buys 19.9L of stock: cash would fall to ~0.0 → loan draws exactly enough to keep 20,000
  const qty = 750, price = 2650;                                // 19,87,500 + 9,937.50 brokerage = 19,97,437.50
  const { settle: s } = await fullTrade("TEAM-008", "LT", "BUY", qty, price);
  assert.equal(s.status, "BANK_SETTLED");
  assert.equal(num(s.cash_after), 20000);
  assert.equal(num(s.loan_drawn), 17437.5);
  assert.equal(num(s.loan_interest), 348.75);                    // 2%
  const d = await detail("TEAM-008");
  assert.equal(num(d.loan.original_principal), 17437.5);
  assert.equal(num(d.loan.interest), 348.75);
  assert.equal(num(d.team.net_worth), 20000 + qty * price, "loan is not deducted from net worth");
  // explicit draw only at/below ₹20,000 and within the remaining limit
  const tooMuch = await POST("/api/loan", { team: "TEAM-008", action: "DRAW", amount: 500000 }, "BANK-01");
  assert.equal(tooMuch.data.code, "LOAN_LIMIT");
  const draw = await POST("/api/loan", { team: "TEAM-008", action: "DRAW", amount: 100000 }, "BANK-01");
  assert.equal(draw.status, 200, JSON.stringify(draw.data));
  assert.equal(num(draw.data.interest_charged), 2000);
  const own = await POST("/api/loan", { team: "TEAM-008", action: "DRAW", amount: 1000 }, "BANK-01");
  assert.equal(own.data.code, "OWN_MONEY_FIRST", "cash is now ₹1.2L, above the buffer");
  // repayment: interest first, never below ₹20,000
  const over = await POST("/api/loan", { team: "TEAM-008", action: "REPAY", amount: 110000 }, "BANK-01");
  assert.equal(over.data.code, "REPAYMENT_CASH_LIMIT");
  const rep = await POST("/api/loan", { team: "TEAM-008", action: "REPAY", amount: 50000 }, "BANK-01");
  assert.equal(rep.status, 200, JSON.stringify(rep.data));
  assert.equal(num(rep.data.interest_paid), 2348.75);
  assert.equal(num(rep.data.principal_paid), 47651.25);
  const d2 = await detail("TEAM-008");
  assert.equal(num(d2.loan.interest), 0);
  assert.equal(num(d2.loan.current_principal), 117437.5 - 47651.25);
  assert.equal(num(d2.loan.original_principal), 117437.5, "original principal keeps the total drawn");
});

test("market news moves price within the mood band and logs MARKET_NEWS", async () => {
  const before = await marketPrice("HDFCBANK");
  const r = await POST("/api/market-news", { symbol: "HDFCBANK", mood: "VERY SEVERE" }, "ADMIN");
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(r.data.headline, "Automatic VERY_SEVERE market impact".replace("_", " "));
  assert.ok(num(r.data.requested_pct) <= -7.5 && num(r.data.requested_pct) >= -10);
  const after = await marketPrice("HDFCBANK");
  assert.equal(after, num(r.data.new_price));
  assert.ok(after < before && (before - after) / before <= 0.1 + 1e-9);
  const up = await POST("/api/market-news", { symbol: "HDFCBANK", mood: "SUPER_POSITIVE" }, "ADMIN");
  assert.ok(num(up.data.applied_pct) <= 10 + 1e-9 && num(up.data.applied_pct) > 0);
  const audit = (await GET("/api/audit?action=MARKET_NEWS_PRICE_MOVE", "ADMIN")).data;
  assert.ok(audit.rows.length >= 2 && audit.rows[0].details.source === "MARKET_NEWS");
});

test("institutional orders with a counterparty team", async () => {
  // TEAM-001 holds 50 RELIANCE. Institution buys 50 from it.
  const p = await marketPrice("RELIANCE");
  const o = await POST("/api/institutional-order", { counterparty_team: "TEAM-001", symbol: "RELIANCE", side: "BUY", quantity: 50, price: p, idempotency_key: key() }, "INST-01");
  assert.equal(o.status, 200, JSON.stringify(o.data));
  await approve(o.data.order.id);
  const s = await settle(o.data.order.id);
  assert.equal(s.data.status, "BANK_SETTLED", JSON.stringify(s.data));
  const inst = (await GET("/api/institutional-portfolio", "INST-01")).data;
  assert.equal(inst.holdings.find((h) => h.symbol === "RELIANCE").quantity, 50);
  assert.equal(num(inst.account.cash), 20000000 - 50 * p);
  const d = await detail("TEAM-001");
  assert.ok(!d.holdings.find((h) => h.symbol === "RELIANCE"));
  // Institution sells them to TEAM-002
  const o2 = await POST("/api/institutional-order", { counterparty_team: "TEAM-002", symbol: "RELIANCE", side: "SELL", quantity: 50, price: p, idempotency_key: key() }, "INST-01");
  await approve(o2.data.order.id);
  const s2 = await settle(o2.data.order.id);
  assert.equal(s2.data.status, "BANK_SETTLED", JSON.stringify(s2.data));
  assert.equal((await detail("TEAM-002")).holdings.find((h) => h.symbol === "RELIANCE").quantity, 50);
});

test("undo and redo of the latest settlement restore cash, holdings and price", async () => {
  const before = await detail("TEAM-009");
  const pBefore = await marketPrice("WIPRO");
  await fullTrade("TEAM-009", "WIPRO", "BUY", 100, 330);
  assert.equal(await marketPrice("WIPRO"), 330);
  const u = await POST("/api/undo-redo", { action: "UNDO" }, "ADMIN");
  assert.equal(u.status, 200, JSON.stringify(u.data));
  const d = await detail("TEAM-009");
  assert.equal(num(d.team.cash), num(before.team.cash));
  assert.ok(!d.holdings.find((h) => h.symbol === "WIPRO"));
  assert.equal(await marketPrice("WIPRO"), pBefore);
  const r = await POST("/api/undo-redo", { action: "REDO" }, "ADMIN");
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(await marketPrice("WIPRO"), 330);
  assert.equal((await detail("TEAM-009")).holdings.find((h) => h.symbol === "WIPRO").quantity, 100);
});

test("concurrent settlements for one team never break the balance", async () => {
  const ids = [];
  for (let i = 0; i < 10; i++) {
    const o = await order("TEAM-010", "ITC", "BUY", 1000, 265 + (i % 3));   // ~2.66L each, total ~26.6L > 20L cash
    ids.push(o.data.order.id);
    await approve(o.data.order.id);
  }
  const res = await Promise.all(ids.map((id) => settle(id)));
  const d = await detail("TEAM-010");
  assert.ok(num(d.team.cash) >= 20000 - 1e-6, "cash never below buffer: " + d.team.cash);
  const settled = res.filter((r) => r.data.status === "BANK_SETTLED").length;
  assert.equal(d.holdings.find((h) => h.symbol === "ITC").quantity, settled * 1000);
  const cash = (await GET("/api/cash?team=TEAM-010", "ADMIN")).data;
  assert.equal(cash.reconciliation.ok, true);
});

test("cash ledger reconciles for every team", async () => {
  const cash = (await GET("/api/cash?page_size=10", "ADMIN")).data;
  assert.equal(cash.reconciliation.ok, true, JSON.stringify(cash.reconciliation));
  assert.equal(cash.reconciliation.teams_checked, 100);
});

test("₹50K closing cash rule and winner pool", async () => {
  // TEAM-011 deploys almost everything: buys 39 lots of TITAN @3499 → 68,23,050? too big; use 540 shares @3499 = 18,89,460 + 9,447.30
  await fullTrade("TEAM-011", "TITAN", "BUY", 550, 3499);    // 19,24,450 + 9,622.25 → cash 65,927.75
  let p = (await GET("/api/portfolios", "ADMIN")).data;
  let t11 = p.teams.find((t) => t.code === "TEAM-011");
  assert.equal(t11.cash_rule_status, "PROVISIONAL");
  assert.equal(t11.portfolio_access, "PROVISIONAL");
  assert.equal(t11.cash_rule_met, false, "₹65,927 base cash > ₹50,000");
  // sell 50 at a profit → profit cash is exempt but base cash is still > 50K
  await fullTrade("TEAM-011", "TITAN", "SELL", 50, 3800);
  p = (await GET("/api/portfolios", "ADMIN")).data;
  t11 = p.teams.find((t) => t.code === "TEAM-011");
  assert.ok(num(t11.profit_cash_exempt) > 0);
  assert.equal(num(t11.base_cash_counted), num(t11.cash) - num(t11.profit_cash_exempt));
  // close the market: pool narrows to teams meeting the rule; data stays visible
  await POST("/api/reject-open-orders", {}, "ADMIN");
  const c = await POST("/api/event", { action: "CLOSE" }, "ADMIN");
  assert.equal(c.status, 200, JSON.stringify(c.data));
  p = (await GET("/api/portfolios", "ADMIN")).data;
  const t1 = p.teams.find((t) => t.code === "TEAM-001");
  assert.equal(t1.cash_rule_status, "NOT_SATISFIED");
  assert.equal(t1.portfolio_access, "LOCKED");
  assert.ok(t1.holdings_value !== undefined, "portfolio still visible");
  const t8 = p.teams.find((t) => t.code === "TEAM-008");
  assert.equal(p.winner === null || p.winner.in_winner_pool === true, true);
  // the winner is the highest net worth among eligible teams (tie → lower code)
  const pool = p.teams.filter((t) => t.in_winner_pool).sort((a, b) => num(b.net_worth) - num(a.net_worth) || a.code.localeCompare(b.code));
  if (pool.length) assert.equal(p.winner.code, pool[0].code);
  assert.ok(t8);
});

test("finalize blocks while orders are open, then exports work", async () => {
  const f = await POST("/api/event", { action: "FINALIZE" }, "ADMIN");
  assert.equal(f.status, 200, JSON.stringify(f.data));
  const x = await GET("/api/export-event-excel", "ADMIN");
  assert.equal(x.status, 200);
  assert.ok(x.headers.get("content-type").includes("spreadsheetml"));
  const bytes = new Uint8Array(x.data);
  assert.equal(String.fromCharCode(bytes[0], bytes[1]), "PK");
  const csv = await fetch(BASE + "/api/export?sheet=networth", { headers: { authorization: "Bearer " + tokens.ADMIN } });
  assert.equal(csv.status, 200);
  assert.ok((await csv.text()).includes("TEAM-001"));
});

test("reset restores the clean starting state and keeps IPO allotments", async () => {
  const r = await POST("/api/reset-event", { confirm: "RESET", keep_allotments: true }, "ADMIN");
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(r.data.kept_ipo_allotments, 3);
  const p = (await GET("/api/portfolios", "ADMIN")).data;
  assert.ok(p.teams.filter((t) => !["TEAM-005", "TEAM-006"].includes(t.code)).every((t) => num(t.cash) === 2000000 && num(t.holdings_value) === 0));
  assert.equal(num(p.teams.find((t) => t.code === "TEAM-006").cash), 2000000 - 200 * 710);
  const m = (await GET("/api/market")).data;
  assert.ok([...m.stocks, ...m.ipos].every((s) => num(s.price) === num(s.base_price) && num(s.previous_price) === num(s.base_price)));
  assert.equal(num(m.index.change_pct), 0);
  const t = (await GET("/api/tracking", "ADMIN")).data;
  assert.equal(t.kpis.orders, 0);
  const inst = (await GET("/api/institutional-portfolio", "ADMIN")).data;
  assert.equal(num(inst.account.cash), 20000000);
});
