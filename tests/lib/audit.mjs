// Financial integrity audit through the export API (v311): ledger reconciliation, one settlement and one trading slip
// per order, settlements at the executed slip price, brokerage at each order's configured rate, one broker commission per
// brokerage-bearing settlement, holdings = settled trades + IPO allotments, no negative cash or holdings, prices moved only
// by Market News / listing / undo-redo (never by settlement), Market News inside its severity band, loans within the limit,
// assessment = settled TEAM trades only, exactly one Winner and one Runner-Up, staged CMS INDEX.
// Used by tests/stress.mjs, tests/api.test.mjs and tests/audit.mjs.
import { call } from "./client.mjs";
const N = Number;
const BANDS = { "VERY SEVERE": [-10, -7.5], SEVERE: [-7.49, -5], NEGATIVE: [-4.99, -1], NORMAL: [-0.99, 0.99], POSITIVE: [1, 4.99], "VERY POSITIVE": [5, 7.49], "SUPER POSITIVE": [7.5, 10] };

export async function audit(stats, adminToken) {
  const sheet = async (name) => {
    const r = await call(stats, "GET /api/export", "GET", "/api/export?format=json&sheet=" + name, { token: adminToken, timeout: 180_000 });
    if (r.status !== 200) throw new Error("export " + name + " failed: " + r.status + " " + JSON.stringify(r.data).slice(0, 200));
    return r.data.rows;
  };
  const checks = [];
  const ok = (name, pass, detail = "") => { checks.push({ name, pass: !!pass, detail: String(detail).slice(0, 400) }); };
  const status = (await call(stats, "GET /api/event-status", "GET", "/api/event-status")).data;
  const cfg = status.config;
  const cash = (await call(stats, "GET /api/cash", "GET", "/api/cash?page_size=10", { token: adminToken, timeout: 60_000 })).data;
  ok("cash ledger reconciles with every team balance", cash.reconciliation.ok && cash.reconciliation.teams_checked === status.counts.teams, JSON.stringify(cash.reconciliation));

  const [trades, holdings, orders, slips, commission, networth, loans, prices, news, allot, assessment, winner] = await Promise.all(
    ["trades", "holdings", "orders", "slips", "commission", "networth", "loans", "prices", "news", "ipo_allotments", "assessment", "winner"].map(sheet));
  // orders: 0 Order ID · 1 Account · 2 Team · 9 Side · 10 Qty · 11 Price · 12 Trade Value · 13 Brokerage % · 14 Brokerage · 16 Status · 25 Executed At · 26 Slip No
  const byOrder = new Map(orders.map((o) => [o[0], o]));
  const settled = orders.filter((o) => o[16] === "BANK_SETTLED");
  ok("one settlement per settled order", settled.length === trades.length, settled.length + " settled orders, " + trades.length + " settlements");
  ok("no order settled twice", new Set(trades.map((t) => t[1])).size === trades.length);
  const executed = orders.filter((o) => o[25]);
  ok("one trading slip per executed order", slips.length === executed.length && new Set(slips.map((s) => s[1])).size === slips.length,
    slips.length + " slips, " + executed.length + " executed orders");
  ok("every settled order has its trading slip", settled.every((o) => o[26]));
  const slipPrice = new Map(slips.map((s) => [s[1], N(s[13])]));
  ok("settlements use the executed (slip) price", trades.every((t) => slipPrice.get(t[1]) === N(t[8])),
    trades.filter((t) => slipPrice.get(t[1]) !== N(t[8])).slice(0, 5).map((t) => t[1]).join(", "));
  // trades: 1 Order · 2 Account · 3 Team · 5 Security · 6 Side · 7 Qty · 8 Price · 9 Trade Value · 10 Brokerage · 17 Market Price
  ok("trade value = quantity × price on every settlement", trades.every((t) => Math.abs(N(t[9]) - N(t[7]) * N(t[8])) < 0.006));
  const badBrk = trades.filter((t) => { const o = byOrder.get(t[1]); return Math.abs(N(t[10]) - Math.round(N(t[9]) * N(o[13]) / 100 * 100) / 100) > 0.006; });
  ok("brokerage = the order's configured rate × trade value", badBrk.length === 0, badBrk.slice(0, 5).map((t) => t[1]).join(", "));
  // commission: 3 Order · 12 Commission · 13 Status
  const comm = new Map(commission.filter((c) => c[13] === "SETTLED").map((c) => [c[3], N(c[12])]));
  const brkTrades = trades.filter((t) => t[2] === "TEAM" && N(t[10]) > 0);
  ok("one broker commission per brokerage-bearing settlement", comm.size === brkTrades.length && brkTrades.every((t) => Math.abs(comm.get(t[1]) - N(t[10])) < 0.006),
    comm.size + " commissions, " + brkTrades.length + " brokerage-bearing settlements");
  // holdings = settled trades + IPO allotments (not reversed)
  const pos = new Map();
  for (const t of trades) {
    const k = t[3] + "|" + t[5];
    const teamBuys = (t[2] === "TEAM" && t[6] === "BUY") || (t[2] === "INSTITUTION" && t[6] === "SELL");
    pos.set(k, (pos.get(k) || 0) + (teamBuys ? N(t[7]) : -N(t[7])));
  }
  for (const a of allot) if (a[11] !== true) pos.set(a[0] + "|" + a[1], (pos.get(a[0] + "|" + a[1]) || 0) + N(a[3]));
  const hold = new Map(holdings.map((h) => [h[0] + "|" + h[2], N(h[5])]));
  let mism = 0; const ex = [];
  for (const [k, q] of pos) if ((hold.get(k) || 0) !== q) { mism++; if (ex.length < 5) ex.push(k + " expected " + q + " got " + (hold.get(k) || 0)); }
  for (const [k, q] of hold) if (!pos.has(k) && q !== 0) { mism++; ex.push(k + " unexplained " + q); }
  ok("holdings match settled trades and IPO allotments exactly", mism === 0, mism + " mismatches " + ex.join("; "));
  ok("no negative holdings", [...pos.values()].every((q) => q >= 0) && holdings.every((h) => N(h[5]) > 0));
  ok("no negative cash", networth.every((r) => N(r[4]) >= 0));
  // prices: 1 Security · 2 Source · 3 Previous · 4 New
  const sources = new Set(prices.map((p) => p[2]));
  ok("market prices change only through Market News, IPO listing or undo / redo (never settlement)",
    [...sources].every((s) => ["MARKET_NEWS", "LISTING", "UNDO", "REDO"].includes(s)), [...sources].join(","));
  const m = (await call(stats, "GET /api/market", "GET", "/api/market")).data;
  const secs = [...m.stocks, ...m.ipos];
  const last = new Map(); for (const p of prices) last.set(p[1], N(p[4]));
  const off = secs.filter((s) => Math.abs(N(s.price) - (last.has(s.symbol) ? last.get(s.symbol) : N(s.base_price))) > 0.001);
  ok("every market price equals its last recorded price change (or the base price)", off.length === 0, off.slice(0, 5).map((s) => s.symbol).join(", "));
  // news: 3 Severity · 5 Requested % · 6 Applied % · 9 Reversed
  const badNews = news.filter((n) => { const b = BANDS[n[3]]; return !b || N(n[5]) < b[0] - 1e-9 || N(n[5]) > b[1] + 1e-9 || Math.abs(N(n[6])) > 10 + 1e-9; });
  ok("every Market News move stays inside its severity band and the ±10% cap", badNews.length === 0, badNews.slice(0, 3).map((n) => n[2] + " " + n[3] + " " + n[5]).join("; "));
  // loans: 1 Original · 2 Current · 3 Interest outstanding · 4 Interest charged · 7 Liability
  ok("loan principal never above the configured limit", loans.every((l) => N(l[1]) <= N(cfg.loan_max_principal) + 0.001));
  ok("interest charged is at least the configured rate on every draw", loans.every((l) => N(l[4]) + 0.01 * Math.max(1, N(l[8])) >= N(l[1]) * N(cfg.loan_interest_rate)));
  ok("loan liability = principal + interest outstanding", loans.every((l) => Math.abs(N(l[7]) - N(l[2]) - N(l[3])) < 0.006));
  // assessment: 0 Team · 3 Settled BUY · 5 Settled SELL — settled TEAM trades only (IPO allotments and institutional trades excluded)
  const cnt = new Map();
  for (const t of trades) if (t[2] === "TEAM") { const c = cnt.get(t[3]) || { b: 0, s: 0 }; t[6] === "BUY" ? c.b++ : c.s++; cnt.set(t[3], c); }
  const badA = assessment.filter((a) => { const c = cnt.get(a[0]) || { b: 0, s: 0 }; return N(a[3]) !== c.b || N(a[5]) !== c.s; });
  ok("assessment counts only settled participant BUY / SELL trades", badA.length === 0, badA.slice(0, 5).map((a) => a[0]).join(", "));
  const w = winner.filter((r) => r[0] === "WINNER").length, ru = winner.filter((r) => r[0] === "RUNNER-UP").length;
  const eligible = winner.filter((r) => /^ELIGIBLE/.test(r[15])).length;
  ok("exactly one Winner and one Runner-Up (among eligible teams)", w === Math.min(1, eligible) && ru === Math.min(1, Math.max(0, eligible - 1)), `winner ${w}, runner-up ${ru}, eligible ${eligible}`);
  const listedIpos = m.ipos.filter((i) => i.listed).length;
  ok("CMS INDEX = active equities + listed IPOs, each once", m.index.equity_components === m.stocks.length && m.index.ipo_components === listedIpos &&
    new Set(m.index.ipos_included).size === listedIpos, JSON.stringify({ components: m.index.components, ipos: m.index.ipos_included }));
  return { checks, counts: { orders: orders.length, settled: settled.length, trades: trades.length, slips: slips.length, holdings_rows: holdings.length, news: news.length } };
}
