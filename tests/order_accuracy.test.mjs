// Order accuracy, team isolation and reconciliation — runs against a COPY of the live database (Neon test branch).
// It reopens the market and trades, so it refuses to run against the live event API.
//   BASE=https://<test function> ALLOW_MUTATION=1 node --test tests/order_accuracy.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { BASE, signIn } from "./lib/client.mjs";

const LIVE = /jsestage\.compute|-jse\.compute/;
if (process.env.ALLOW_MUTATION !== "1" || LIVE.test(BASE)) {
  test("refuses to mutate the live event database", () => { assert.ok(true); });
  process.exit(0);
}
const tok = {};
const N = (x) => Number(x || 0);
const r2 = (x) => Math.round(x * 100 + 1e-6) / 100;
async function api(method, path, body, who) {
  if (who && !tok[who]) tok[who] = await signIn(who);
  const r = await fetch(BASE + path, { method, headers: { "content-type": "application/json", ...(who ? { authorization: "Bearer " + tok[who] } : {}) }, body: body ? JSON.stringify(body) : undefined });
  let data = {}; try { data = await r.json(); } catch {}
  return { status: r.status, data };
}
const GET = (p, w) => api("GET", p, undefined, w), POST = (p, b, w) => api("POST", p, b, w);
const ok = (r, m) => assert.equal(r.status, 200, (m ? m + ": " : "") + JSON.stringify(r.data).slice(0, 500));

let U, ADMIN, EXCH, BANK, INST, PIT, broker, T1, T2, P1, S, mkt, baseline;
const price = async (sym) => N(((await GET("/api/market")).data.stocks.concat((await GET("/api/market")).data.ipos)).find((s) => s.symbol === sym).price);
const detail = async (team) => { const r = await GET("/api/portfolio-details?team=" + team, ADMIN); ok(r, "detail " + team); return r.data; };
const holding = (d, sym) => N((d.holdings.find((h) => h.symbol === sym) || {}).quantity);
const opened = [];
const track = (r) => { if (r.status === 200) { if (r.data.order) opened.push(r.data.order.id); for (const l of r.data.legs || []) opened.push(l.order.id); } return r; };
const submit = async (team, side, qty, extra = {}) => track(await POST("/api/orders", { team, symbol: S, side, quantity: qty, expected_price: mkt, idempotency_key: randomUUID(), ...extra }, extra.as || broker));
async function cleanup() {   // reject this run's orders that are still waiting at the Exchange
  for (const id of opened.splice(0)) {
    const od = (await GET("/api/order?id=" + id, ADMIN)).data.order;
    if (od && od.status === "EXCHANGE_PENDING") await POST("/api/exchange", { order_id: id, action: "REJECT", reason: "test cleanup" }, EXCH);
    if (od && od.status === "EXCHANGE_APPROVED") await POST("/api/bank", { order_id: id, action: "REJECT", reason: "test cleanup" }, BANK);
  }
}
const approve = (id) => POST("/api/exchange", { order_id: id, action: "APPROVE" }, EXCH);
const settle = (id) => POST("/api/bank", { order_id: id, action: "SETTLE" }, BANK);
async function full(team, side, qty) { const o = await submit(team, side, qty); ok(o, "submit " + side); ok(await approve(o.data.order.id), "approve"); const s = await settle(o.data.order.id); ok(s, "settle"); assert.equal(s.data.status, "BANK_SETTLED", JSON.stringify(s.data)); return { o: o.data.order, s: s.data }; }

test("setup: discover accounts on the copied database and open the market", async () => {
  ADMIN = "ADMIN";
  U = (await GET("/api/users", ADMIN)).data.users;
  const first = (role) => U.find((u) => u.role === role && u.active)?.username;
  EXCH = first("EXCHANGE"); BANK = first("BANK"); INST = first("INSTITUTIONAL"); PIT = first("PIT_MANAGER");
  assert.ok(EXCH && BANK && INST && PIT, "desk accounts exist");
  const st = (await GET("/api/event-status")).data.status;
  if (st === "CLOSED" || st === "FINALIZED") ok(await POST("/api/event", { action: "REOPEN" }, ADMIN), "reopen");
  else if (st === "NOT_STARTED") ok(await POST("/api/event", { action: "START" }, ADMIN), "start");
  else if (st === "SETTLEMENT_ONLY") ok(await POST("/api/event", { action: "RESUME" }, ADMIN), "resume");
  // a broker with two participant teams that have enough cash
  const pf = (await GET("/api/portfolios", ADMIN)).data.teams.filter((t) => N(t.cash) > 400000 && t.broker);
  const byBroker = {}; for (const t of pf) (byBroker[t.broker] = byBroker[t.broker] || []).push(t);
  const [bcode, teams] = Object.entries(byBroker).find(([, ts]) => ts.length >= 2);
  broker = U.find((u) => u.role === "BROKER" && u.broker === bcode && u.active).username;
  T1 = teams[0].code; T2 = teams[1].code;
  P1 = U.find((u) => u.role === "PARTICIPANT" && u.team === T1 && u.active)?.username;
  const m = (await GET("/api/market")).data;
  const cand = m.stocks.filter((s) => N(s.price) >= 100 && N(s.price) <= 1500 && N(s.base_price || s.price) > 0)
    .filter((s) => !pf.find((t) => t.code === T1)?.holdings?.some?.((h) => h.symbol === s.symbol));
  S = cand[0].symbol; mkt = N(cand[0].price);
  baseline = (await GET("/api/reconcile", ADMIN)).data;
  assert.equal(baseline.success, true);
});

test("1/7 two teams of one broker buy the same company; each account shows only its own records", async () => {
  const a = await full(T1, "BUY", 50), b = await full(T2, "BUY", 50);
  assert.equal(a.o.team, T1); assert.equal(b.o.team, T2);
  if (P1) {
    const mine = (await GET("/api/orders?page_size=200", P1)).data.rows;
    assert.ok(mine.length > 0 && mine.every((o) => o.team === T1), "participant sees only its own orders");
    assert.equal((await GET("/api/order?id=" + b.o.id, P1)).status, 403, "another team's order is refused");
    const pd = (await GET("/api/portfolio-details?team=" + T2, P1)).data;
    assert.equal(pd.team.code, T1, "the team comes from the session, not the request");
    const cash = (await GET("/api/cash?team=" + T2 + "&page_size=200", P1)).data;
    assert.ok((cash.rows || []).every((x) => !x.team || x.team === T1), "cash ledger is the participant's own");
  }
  const adm = (await GET("/api/orders?page_size=50&team=" + T2, ADMIN)).data.rows;
  assert.ok(adm.some((o) => o.order_no === b.o.order_no) && adm.every((o) => o.team === T2), "admin can inspect any single team");
});

test("2/3/8 buy and sell update cash, holdings, portfolio and brokerage exactly", async () => {
  const before = await detail(T1);
  const { o, s } = await full(T1, "BUY", 100);
  const tv = 100 * N(o.price), brk = r2(tv * N(o.brokerage_rate));
  assert.equal(N(s.trade_value), tv); assert.equal(N(s.brokerage), brk);
  let d = await detail(T1);
  assert.equal(N(d.team.cash), r2(N(before.team.cash) - tv - brk));
  assert.equal(holding(d, S), holding(before, S) + 100);
  const mv = d.holdings.reduce((a, h) => a + N(h.quantity) * N(h.current_price), 0);
  assert.ok(d.holdings.every((h) => Math.abs(N(h.market_value) - N(h.quantity) * N(h.current_price)) < 0.01), "market value = quantity × current price");
  assert.ok(Math.abs(N(d.team.net_worth) - (N(d.team.cash) + mv)) < 1, "net worth = cash + market value");
  const sell = await full(T1, "SELL", 50);
  const stv = 50 * N(sell.o.price), sbrk = r2(stv * N(sell.o.brokerage_rate));
  const d2 = await detail(T1);
  assert.equal(N(d2.team.cash), r2(N(d.team.cash) + stv - sbrk)); assert.equal(holding(d2, S), holding(d, S) - 50);
  const led = (await GET("/api/cash?team=" + T1 + "&page_size=500", ADMIN)).data;
  assert.ok(led.rows.some((x) => x.order_no === sell.o.order_no), "ledger has the sale");
});

test("4/5 short selling refused; concurrent sells and double settlement cannot oversell or double-pay", async () => {
  const h = holding(await detail(T2), S);
  const bad = await submit(T2, "SELL", h + 50);
  assert.equal(bad.status, 409); assert.equal(bad.data.code, "SHORT_SELL_NOT_ALLOWED");
  await full(T2, "BUY", 50);   // now holds h + 50
  const res = await Promise.all([1, 2, 3, 4, 5].map(() => submit(T2, "SELL", 50)));
  const okN = res.filter((r) => r.status === 200).length;
  assert.equal(okN, Math.floor((h + 50) / 50) >= 5 ? 5 : Math.floor((h + 50) / 50), res.map((r) => r.status).join(","));
  const id = res.find((r) => r.status === 200).data.order.id;
  ok(await approve(id));
  const two = await Promise.all([settle(id), settle(id)]);
  assert.equal(two.filter((r) => r.data.status === "BANK_SETTLED" && !r.data.replayed).length, 1, "settled once: " + JSON.stringify(two.map((r) => r.data.code || r.data.status)));
  await cleanup();
  assert.ok(holding(await detail(T2), S) >= 0);
});

test("10 a retried submission (same request key) creates one order", async () => {
  const key = randomUUID();
  const a = await submit(T1, "BUY", 50, { idempotency_key: key }), b = await submit(T1, "BUY", 50, { idempotency_key: key });
  ok(a); ok(b); assert.equal(b.data.replayed, true); assert.equal(a.data.order.id, b.data.order.id);
  await cleanup();
});

test("6 a price change while an order is pending: the order is closed, never settled at the old price", async () => {
  const o = await submit(T1, "BUY", 50); ok(o);
  ok(await POST("/api/market-news", { symbol: S, mood: "POSITIVE", headline: "test move" }, ADMIN), "news");
  const od = (await GET("/api/order?id=" + o.data.order.id, ADMIN)).data.order;
  assert.notEqual(od.status, "BANK_SETTLED"); assert.equal(od.reject_code, "PRICE_STALE");
  mkt = await price(S);
});

test("Market News stays inside the permanent ±15% band from the base price", async () => {
  const m = (await GET("/api/market")).data.stocks.find((s) => s.symbol === S);
  const base = N(m.base_price);
  for (let i = 0; i < 6; i++) await POST("/api/market-news", { symbol: S, mood: "SUPER_POSITIVE", headline: "band test" }, ADMIN);
  const p = await price(S);
  assert.ok(p <= Math.floor(base * 1.15) + 1, `price ${p} within base ${base} +15%`);
  for (let i = 0; i < 8; i++) await POST("/api/market-news", { symbol: S, mood: "VERY_SEVERE", headline: "band test" }, ADMIN);
  assert.ok(await price(S) >= Math.ceil(base * 0.85) - 1, "lower band");
  mkt = await price(S);
});

test("negotiated pair price must be within ±15% of the market price", async () => {
  const pair = async (p) => track(await POST("/api/orders", { idempotency_key: randomUUID(), legs: [
    { team: T1, symbol: S, side: "BUY", quantity: 50, expected_price: mkt, negotiated_price: p },
    { team: T2, symbol: S, side: "SELL", quantity: 50, expected_price: mkt, negotiated_price: p }] }, PIT));
  const far = await pair(Math.round(mkt * 1.3));
  assert.equal(far.status, 409); assert.equal(far.data.code, "NEGOTIATED_PRICE_OUT_OF_BAND");
  const near = await pair(Math.round(mkt * 1.05)); ok(near, "inside the band");
  await cleanup();
});

test("9 institutional inventory and team holdings move together", async () => {
  ok(await POST("/api/institution-inventory", { action: "SET", symbol: S, quantity: 100, reason: "test" }, ADMIN));
  const io = async (side, qty, team = T1) => track(await POST("/api/institutional-order", { counterparty_team: team, symbol: S, side, quantity: qty, expected_price: mkt, idempotency_key: randomUUID() }, INST));
  const tooMany = await io("SELL", 150);
  assert.equal(tooMany.status, 409); assert.equal(tooMany.data.code, "INSTITUTION_INVENTORY");
  const h0 = holding(await detail(T1), S);
  const o = await io("SELL", 100); ok(o);
  const o2 = await io("SELL", 50); assert.equal(o2.data.code, "INSTITUTION_INVENTORY", "reserved by the open order");
  ok(await approve(o.data.order.id)); const s = await settle(o.data.order.id); assert.equal(s.data.status, "BANK_SETTLED", JSON.stringify(s.data));
  let inv = (await GET("/api/institution-inventory", ADMIN)).data.items.find((x) => x.symbol === S);
  assert.equal(inv.quantity, 0); assert.equal(holding(await detail(T1), S), h0 + 100);
  const b = await io("BUY", 50); ok(b); ok(await approve(b.data.order.id)); assert.equal((await settle(b.data.order.id)).data.status, "BANK_SETTLED");
  inv = (await GET("/api/institution-inventory", ADMIN)).data.items.find((x) => x.symbol === S);
  assert.equal(inv.quantity, 50); assert.equal(holding(await detail(T1), S), h0 + 50);
  await cleanup();
  ok(await POST("/api/institution-inventory", { action: "UNLIMITED", symbol: S, reason: "test done" }, ADMIN));
});

test("11/12 reconciliation: no new issues from any of these trades; records intact", async () => {
  const now = (await GET("/api/reconcile", ADMIN)).data;
  const key = (x) => x.check + "|" + (x.order || "") + "|" + (x.team || "");
  const before = new Set(baseline.issues.map(key));
  const fresh = now.issues.filter((x) => !before.has(key(x)) && x.check !== "OPEN_AFTER_CLOSE");
  assert.deepEqual(fresh, [], "new reconciliation issues: " + JSON.stringify(fresh).slice(0, 800));
  assert.ok(now.summary.orders > baseline.summary.orders, "old orders kept, new ones added");
  assert.equal((await GET("/api/reconcile", P1 || BANK)).status, 403, "reconciliation is admin/faculty only");
});
