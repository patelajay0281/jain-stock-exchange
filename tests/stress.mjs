// Financial-engine stress test: thousands of orders through Exchange and Bank by concurrent desks,
// with duplicate-settlement and replay attempts mixed in, followed by a full integrity audit.
//   BASE=http://127.0.0.1:8788 ORDERS=8000 WORKERS=32 node tests/stress.mjs
// On staging the GitHub workflow signs in with OIDC (see tests/lib/client.mjs).
import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { BASE, signIn, Stats, call } from "./lib/client.mjs";
import { audit } from "./lib/audit.mjs";

const ORDERS = Number(process.env.ORDERS || 3000);
const WORKERS = Number(process.env.WORKERS || 24);
const OUT = process.env.OUT || "";
const stats = new Stats();
const tok = {};
const brokers = Array.from({ length: 10 }, (_, i) => "PIT-" + String(i + 1).padStart(2, "0"));
const exchanges = ["EXCHANGE-01", "EXCHANGE-02", "EXCHANGE-03", "EXCHANGE-04"];
const banks = ["BANK-01", "BANK-02", "BANK-03", "BANK-04"];
const teams = Array.from({ length: 100 }, (_, i) => "TEAM-" + String(i + 1).padStart(3, "0"));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const rnd = (a, b) => a + Math.random() * (b - a);
const N = Number;

const tally = { rate_limited: 0, created: 0, replays_checked: 0, replay_mismatch: 0, approved: 0, exch_rejected: 0, settled: 0, bank_rejected: {}, dup_attempts: 0,
  dup_extra_success: 0, create_rejected: {}, http_errors: 0 };
const held = new Map();   // team -> Map(symbol -> qty) as seen by this client (settled results)
let prices = new Map();   // symbol -> latest market price
let securities = [];

async function adm(path, body) {
  const r = await call(stats, "admin " + path, "POST", path, { token: tok.ADMIN, body });
  if (r.status !== 200) throw new Error(path + " failed: " + r.status + " " + JSON.stringify(r.data).slice(0, 300));
  return r.data;
}
async function refreshMarket() {
  const r = await call(stats, "GET /api/market", "GET", "/api/market");
  if (r.status === 200) { securities = [...r.data.ipos, ...r.data.stocks]; prices = new Map(securities.map((s) => [s.symbol, N(s.price)])); }
}

function makeOrder() {
  const team = pick(teams);
  const mine = held.get(team);
  const owned = mine ? [...mine].filter(([, q]) => q >= 50) : [];
  let side = "BUY", sec = pick(securities), qty;
  const shortTry = Math.random() < 0.03;
  if (shortTry) { side = "SELL"; qty = 50 * Math.ceil(rnd(1, 6)); }
  else if (owned.length && Math.random() < 0.42) {
    const [sym, q] = pick(owned);
    sec = securities.find((s) => s.symbol === sym); side = "SELL";
    qty = 50 * Math.max(1, Math.floor(rnd(0.3, 1) * (q / 50)));
  } else {
    const p = prices.get(sec.symbol);
    qty = 50 * Math.max(1, Math.floor(rnd(0.2, 1) * Math.max(1, Math.floor(250000 / (p * 50)))));
  }
  const p0 = prices.get(sec.symbol);
  const price = Math.max(1, Math.round(p0 * (1 + rnd(-0.07, 0.07))));
  return { team, symbol: sec.symbol, side, quantity: qty, price, idempotency_key: randomUUID() };
}

function count(obj, key) { obj[key] = (obj[key] || 0) + 1; }

// desks retry when the per-user write limit answers 429, as an operator would after the warning
async function desk(name, method, path, opts) {
  for (let attempt = 0; ; attempt++) {
    const r = await call(stats, name, method, path, opts);
    if (r.status !== 429 || attempt >= 12) return r;
    tally.rate_limited++;
    await new Promise((res) => setTimeout(res, 120 + Math.random() * 380 * (1 + attempt / 3)));
  }
}

async function processOne(i) {
  const o = makeOrder();
  const broker = pick(brokers);
  let created;
  if (i % 20 === 7) {
    // idempotent replay: the same ticket submitted twice at once must create one order
    const [a, b] = await Promise.all([1, 2].map(() => desk("POST /api/orders", "POST", "/api/orders", { token: tok[broker], body: o })));
    tally.replays_checked++;
    if (a.status === 200 && b.status === 200 && a.data.order.id !== b.data.order.id) tally.replay_mismatch++;
    created = a.status === 200 ? a : b;
  } else {
    created = await desk("POST /api/orders", "POST", "/api/orders", { token: tok[broker], body: o });
  }
  if (created.status !== 200) { count(tally.create_rejected, created.data?.code || String(created.status)); if (created.status >= 500 || created.status === 0) tally.http_errors++; return; }
  tally.created++;
  const id = created.data.order.id;
  const ap = await desk("POST /api/exchange", "POST", "/api/exchange", { token: tok[pick(exchanges)], body: { order_id: id, action: "APPROVE", confirm_short_sell: true } });
  if (ap.status !== 200) { tally.exch_rejected++; if (ap.status >= 500 || ap.status === 0) tally.http_errors++; return; }
  tally.approved++;
  let results;
  if (i % 20 === 3) {
    // duplicate settlement attack: three Bank desks press SETTLE on the same order together
    tally.dup_attempts++;
    results = await Promise.all(banks.slice(0, 3).map((b) => desk("POST /api/bank", "POST", "/api/bank", { token: tok[b], body: { order_id: id, action: "SETTLE" } })));
    const okSettled = results.filter((r) => r.status === 200 && r.data.status === "BANK_SETTLED").length;
    if (okSettled > 1) tally.dup_extra_success += okSettled - 1;
  } else {
    results = [await desk("POST /api/bank", "POST", "/api/bank", { token: tok[pick(banks)], body: { order_id: id, action: "SETTLE" } })];
  }
  const res = results.find((r) => r.status === 200) || results[0];
  if (res.status !== 200) { if (res.status >= 500 || res.status === 0) tally.http_errors++; count(tally.bank_rejected, "HTTP_" + res.status + "_" + (res.data?.code || "")); return; }
  if (res.data.status === "BANK_SETTLED") {
    tally.settled++;
    prices.set(o.symbol, N(o.price));
    const m = held.get(o.team) || new Map(); held.set(o.team, m);
    m.set(o.symbol, (m.get(o.symbol) || 0) + (o.side === "BUY" ? o.quantity : -o.quantity));
  } else count(tally.bank_rejected, res.data.code || res.data.status);
}

async function main() {
  const started = Date.now();
  for (const u of ["ADMIN", ...brokers, ...exchanges, ...banks]) tok[u] = await signIn(u);
  const st = (await call(null, "", "GET", "/api/event-status")).data.status;
  if (st === "LIVE" || st === "SETTLEMENT_ONLY") { await adm("/api/reject-open-orders", {}); await adm("/api/event", { action: "CLOSE" }); }
  await adm("/api/reset-event", { confirm: "RESET", keep_allotments: false });
  await adm("/api/ipo-listing", { action: "CLEAR" });
  await adm("/api/event", { action: "START" });
  await refreshMarket();
  const ticker = setInterval(refreshMarket, 3000);
  let next = 0, done = 0;
  const t0 = Date.now();
  const progress = setInterval(() => {
    const s = (Date.now() - t0) / 1000;
    console.log(`[stress] ${done}/${ORDERS} orders · ${tally.settled} settled · ${(stats.total / s).toFixed(0)} calls/s · ${tally.http_errors} server errors`);
  }, 10_000);
  await Promise.all(Array.from({ length: WORKERS }, async () => {
    for (;;) { const i = next++; if (i >= ORDERS) return; await processOne(i); done++; }
  }));
  clearInterval(ticker); clearInterval(progress);
  const secs = (Date.now() - t0) / 1000;
  await adm("/api/reject-open-orders", {});
  const { checks } = await audit(stats, tok.ADMIN);
  const out = {
    tool: "tests/stress.mjs", base: BASE, at: new Date().toISOString(), orders_requested: ORDERS, workers: WORKERS,
    duration_s: +secs.toFixed(1), calls: stats.total, calls_per_s: +(stats.total / secs).toFixed(1),
    orders_per_s: +(tally.created / secs).toFixed(1), settlements_per_s: +(tally.settled / secs).toFixed(1),
    tally, integrity: checks, all_checks_passed: checks.every((c) => c.pass) && tally.dup_extra_success === 0 && tally.replay_mismatch === 0,
    http: stats.summary(), total_runtime_s: +((Date.now() - started) / 1000).toFixed(1),
  };
  console.log(JSON.stringify({ ...out, http: { ...out.http, endpoints: undefined } }, null, 2));
  for (const c of checks) console.log((c.pass ? "PASS " : "FAIL ") + c.name + (c.pass ? "" : "  [" + c.detail + "]"));
  if (OUT) { mkdirSync(dirname(OUT), { recursive: true }); writeFileSync(OUT, JSON.stringify(out, null, 2)); }
  process.exit(out.all_checks_passed && tally.http_errors === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(2); });
