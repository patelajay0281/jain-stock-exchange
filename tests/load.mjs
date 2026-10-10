// Open-loop load generator modelled on Dalal Street traffic: hundreds of screens polling the market,
// participants checking portfolios, desks polling queues, and a steady stream of orders going
// through Exchange and Bank.
//   BASE=http://127.0.0.1:8788 RPS=850 DURATION=60 WRITE_RPS=1 node tests/load.mjs
//   (DURATION in seconds; OUT=path.json writes the summary; AUDIT=1 checks the ledger at the end)
import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { BASE, signIn, Stats, call } from "./lib/client.mjs";

const RPS = Number(process.env.RPS || 850);
const DURATION = Number(process.env.DURATION || 60);
const WRITE_RPS = Number(process.env.WRITE_RPS || 1);
const VIEWERS = Number(process.env.VIEWERS || 600);
const MAX_INFLIGHT = Number(process.env.MAX_INFLIGHT || 3000);
const OUT = process.env.OUT || "";
const RESET = process.env.RESET !== "0";
const stats = new Stats();
const N = Number;
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const tok = {};
const teams = Array.from({ length: 100 }, (_, i) => "TEAM-" + String(i + 1).padStart(3, "0"));
const brokers = Array.from({ length: 10 }, (_, i) => "PIT-" + String(i + 1).padStart(2, "0"));
const exchanges = ["EXCHANGE-01", "EXCHANGE-02", "EXCHANGE-03", "EXCHANGE-04"], banks = ["BANK-01", "BANK-02", "BANK-03", "BANK-04"];
const viewerTags = new Array(VIEWERS).fill(null);
let prices = new Map(), symbols = [];

// weighted read mix (per request)
const MIX = [
  [62, "GET market", () => { const v = Math.floor(Math.random() * VIEWERS); return ["/api/market", null, v]; }],
  [12, "GET event-status", () => ["/api/event-status", null]],
  [4, "GET insights", () => ["/api/insights", null]],
  [3, "GET market-news", () => ["/api/market-news?limit=15", null]],
  [6, "GET portfolio-details", () => { const t = pick(teams); return ["/api/portfolio-details", tok[t]]; }],
  [4, "GET tracking", () => ["/api/tracking?page_size=50", tok[pick(brokers)]]],
  [3, "GET exchange queue", () => ["/api/exchange", tok[pick(exchanges)]]],
  [3, "GET bank queue", () => ["/api/bank", tok[pick(banks)]]],
  [3, "GET portfolios", () => ["/api/portfolios", tok.ADMIN]],
];
const WSUM = MIX.reduce((s, m) => s + m[0], 0);
function chooseRead() { let r = Math.random() * WSUM; for (const m of MIX) { if ((r -= m[0]) < 0) return m; } return MIX[0]; }

let inflight = 0, sent = 0, skipped = 0;
async function fireRead() {
  const [, name, build] = chooseRead();
  const [path, token, viewer] = build();
  inflight++; sent++;
  try {
    const r = await call(stats, name, "GET", path, { token, etag: viewer !== undefined ? viewerTags[viewer] : undefined });
    if (viewer !== undefined && r.etag) viewerTags[viewer] = r.etag;
    if (name === "GET market" && r.status === 200 && r.data?.stocks) { const all = [...r.data.ipos, ...r.data.stocks]; prices = new Map(all.map((s) => [s.symbol, N(s.price)])); symbols = all.map((s) => s.symbol); }
  } finally { inflight--; }
}

const flow = { pipelines: 0, settled: 0, rejected: 0, failed: 0 };
async function firePipeline() {
  if (!symbols.length) return;
  flow.pipelines++;
  const sym = pick(symbols), team = pick(teams), p = prices.get(sym) || 100;
  const side = Math.random() < 0.7 ? "BUY" : "SELL";
  const qty = 50 * (1 + Math.floor(Math.random() * Math.max(1, Math.min(4, Math.floor(150000 / (p * 50))))));
  const body = { team, symbol: sym, side, quantity: qty, price: Math.max(1, Math.round(p * (1 + (Math.random() - 0.5) * 0.08))), idempotency_key: randomUUID() };
  inflight++;
  try {
    const o = await call(stats, "POST orders", "POST", "/api/orders", { token: tok[pick(brokers)], body });
    if (o.status !== 200) { if (o.status >= 500 || o.status === 0) flow.failed++; return; }
    const a = await call(stats, "POST exchange", "POST", "/api/exchange", { token: tok[pick(exchanges)], body: { order_id: o.data.order.id, action: "APPROVE", confirm_short_sell: true } });
    if (a.status !== 200) { if (a.status >= 500 || a.status === 0) flow.failed++; return; }
    const b = await call(stats, "POST bank", "POST", "/api/bank", { token: tok[pick(banks)], body: { order_id: o.data.order.id, action: "SETTLE" } });
    if (b.status === 200 && b.data.status === "BANK_SETTLED") flow.settled++; else if (b.status === 200) flow.rejected++; else flow.failed++;
  } finally { inflight--; }
}

async function main() {
  const users = ["ADMIN", ...brokers, ...exchanges, ...banks, ...teams];
  for (let i = 0; i < users.length; i += 10) await Promise.all(users.slice(i, i + 10).map(async (u) => { tok[u] = await signIn(u); }));
  if (RESET) {
    const adm = (path, body) => call(stats, "admin", "POST", path, { token: tok.ADMIN, body });
    const st = (await call(null, "", "GET", "/api/event-status")).data.status;
    if (st === "LIVE" || st === "SETTLEMENT_ONLY") { await adm("/api/reject-open-orders", {}); await adm("/api/event", { action: "CLOSE" }); }
    await adm("/api/reset-event", { confirm: "RESET", keep_allotments: false });
    await adm("/api/ipo-listing", { action: "CLEAR" });
    await adm("/api/event", { action: "START" });
  }
  await fireRead();
  console.log(`[load] ${BASE} · target ${RPS} req/s for ${DURATION}s · ${WRITE_RPS} order pipelines/s · ${VIEWERS} market screens`);
  const t0 = performance.now();
  let lastLog = t0, lastTotal = 0, writesDue = 0;
  const minute = [];
  await new Promise((resolve) => {
    const timer = setInterval(() => {
      const now = performance.now(), el = (now - t0) / 1000;
      if (el >= DURATION) { clearInterval(timer); resolve(); return; }
      const due = Math.floor(el * RPS) - sent;
      for (let i = 0; i < due; i++) { if (inflight >= MAX_INFLIGHT) { skipped++; sent++; continue; } fireRead(); }
      writesDue += WRITE_RPS * 0.005;
      while (writesDue >= 1) { writesDue -= 1; firePipeline(); }
      if (now - lastLog >= 60_000) {
        const done = stats.total - lastTotal;
        const line = { t_min: Math.round(el / 60), rps: +(done / ((now - lastLog) / 1000)).toFixed(1), inflight, failed_total: stats.failed, skipped, settled: flow.settled };
        minute.push(line); console.log("[load] " + JSON.stringify(line));
        lastLog = now; lastTotal = stats.total;
      }
    }, 5);
  });
  while (inflight > 0) await new Promise((r) => setTimeout(r, 50));
  const secs = (performance.now() - t0) / 1000;
  let audit = null;
  if (process.env.AUDIT === "1") {
    const c = await call(null, "", "GET", "/api/cash?page_size=10", { token: tok.ADMIN });
    audit = c.data?.reconciliation;
  }
  const h = stats.summary();
  const out = { tool: "tests/load.mjs", base: BASE, at: new Date().toISOString(), target_rps: RPS, duration_s: +secs.toFixed(1),
    achieved_rps: +(h.requests / secs).toFixed(1), requests: h.requests, failed: h.failed, skipped_at_cap: skipped,
    success_rate_pct: +(100 * (h.requests - h.failed) / Math.max(1, h.requests)).toFixed(3), p50_ms: h.p50_ms, p95_ms: h.p95_ms, p99_ms: h.p99_ms,
    status_codes: h.status_codes, errors: h.errors, order_flow: flow, ledger_reconciliation: audit, per_minute: minute, endpoints: h.endpoints };
  console.log(JSON.stringify({ ...out, per_minute: undefined, endpoints: undefined }, null, 2));
  if (OUT) { mkdirSync(dirname(OUT), { recursive: true }); writeFileSync(OUT, JSON.stringify(out, null, 2)); }
  process.exit(h.failed === 0 && skipped === 0 && (!audit || audit.ok) ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(2); });
