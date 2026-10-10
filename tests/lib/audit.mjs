// Financial integrity audit through the export API: ledger reconciliation, one settlement per settled order,
// brokerage, holdings vs trades, no negative cash/holdings, price continuity, loans. Used by stress.mjs and audit.mjs.
import { call } from "./client.mjs";
const N = Number;

export async function audit(stats, adminToken) {
  const exportSheet = async (sheet) => {
    const r = await call(stats, "GET /api/export", "GET", "/api/export?format=json&sheet=" + sheet, { token: adminToken, timeout: 180_000 });
    if (r.status !== 200) throw new Error("export " + sheet + " failed: " + r.status);
    return r.data.rows;
  };
  const checks = [];
  const ok = (name, pass, detail = "") => { checks.push({ name, pass: !!pass, detail: String(detail).slice(0, 300) }); };
  const cash = (await call(stats, "GET /api/cash", "GET", "/api/cash?page_size=10", { token: adminToken, timeout: 60_000 })).data;
  ok("cash ledger reconciles with every team balance", cash.reconciliation.ok && cash.reconciliation.teams_checked === 100, JSON.stringify(cash.reconciliation));
  const [trades, holdings, orders, commission, networth, loans] = await Promise.all(["trades", "holdings", "orders", "commission", "networth", "loans"].map(exportSheet));
  const settledOrders = orders.filter((r) => r[13] === "BANK_SETTLED");
  ok("one settlement per settled order", settledOrders.length === trades.length, settledOrders.length + " settled orders, " + trades.length + " settlements");
  ok("no order settled twice", new Set(trades.map((t) => t[1])).size === trades.length);
  ok("one broker commission per settlement", commission.length === trades.length, commission.length + " commission rows");
  ok("brokerage is exactly 0.5% of trade value on every trade", trades.every((t) => Math.abs(N(t[10]) - Math.round(N(t[9]) * 0.005 * 100) / 100) < 0.006));
  ok("trade value = quantity × price on every trade", trades.every((t) => Math.abs(N(t[9]) - N(t[7]) * N(t[8])) < 0.006));
  const pos = new Map();
  for (const t of trades) {
    const k = t[3] + "|" + t[5];
    const teamBuys = (t[2] === "TEAM" && t[6] === "BUY") || (t[2] === "INSTITUTION" && t[6] === "SELL");
    pos.set(k, (pos.get(k) || 0) + (teamBuys ? N(t[7]) : -N(t[7])));
  }
  const allot = await exportAllotments(stats, adminToken);
  for (const [k, q] of allot) pos.set(k, (pos.get(k) || 0) + q);
  const hold = new Map(holdings.map((h) => [h[0] + "|" + h[1], N(h[4])]));
  let mism = 0; const examples = [];
  for (const [k, q] of pos) if ((hold.get(k) || 0) !== q) { mism++; if (examples.length < 5) examples.push(k + " expected " + q + " got " + (hold.get(k) || 0)); }
  for (const [k, q] of hold) if (!pos.has(k) && q !== 0) { mism++; examples.push(k + " unexplained " + q); }
  ok("holdings match settled trades (and IPO allotments) exactly", mism === 0, mism + " mismatches " + examples.join("; "));
  ok("no negative holdings", [...pos.values()].every((q) => q >= 0) && holdings.every((h) => N(h[4]) > 0));
  ok("no negative cash", networth.every((r) => N(r[4]) >= 0));
  const last = new Map(); let breaks = 0; const bex = [];
  for (const t of trades) {
    const s = t[5];
    if (last.has(s) && Math.abs(N(t[14]) - last.get(s)) > 0.001) { breaks++; if (bex.length < 5) bex.push(s + " " + t[1]); }
    if (Math.abs(N(t[15]) - N(t[8])) > 0.001) { breaks++; if (bex.length < 5) bex.push(s + " price_after≠price " + t[1]); }
    last.set(s, N(t[15]));
  }
  const news = await exportSheetSafe(stats, adminToken, "news");
  ok("market price follows every settlement in order (no lost updates)" + (news.length ? " — skipped: Market News also moved prices" : ""), news.length > 0 || breaks === 0, breaks + " breaks " + bex.join("; "));
  const m = (await call(stats, "GET /api/market", "GET", "/api/market")).data;
  const prices = new Map([...m.ipos, ...m.stocks].map((s) => [s.symbol, N(s.price)]));
  let stale = 0; for (const [s, p] of last) if (Math.abs(prices.get(s) - p) > 0.001) stale++;
  ok("market price equals the last settled trade price" + (news.length ? " — skipped: Market News also moved prices" : ""), news.length > 0 || stale === 0, stale + " securities differ");
  ok("loan principal never above ₹5,00,000", loans.every((l) => N(l[1]) <= 500000));
  ok("loan interest is 2% of each draw", loans.every((l) => Math.abs(N(l[4]) - N(l[1]) * 0.02) <= 0.01 * Math.max(1, N(l[8])) + 0.001));
  return { checks, counts: { orders: orders.length, settled: settledOrders.length, trades: trades.length, holdings_rows: holdings.length } };
}

async function exportSheetSafe(stats, token, sheet) {
  const r = await call(stats, "GET /api/export", "GET", "/api/export?format=json&sheet=" + sheet, { token, timeout: 120_000 });
  return r.status === 200 ? r.data.rows.filter((row) => row[8] !== true) : [];   // news: drop reversed items
}
// IPO allotments add holdings without a trade: read them from the cash ledger (type IPO_ALLOTMENT, not reversed)
async function exportAllotments(stats, token) {
  const out = new Map();
  const r = await call(stats, "GET /api/export", "GET", "/api/export?format=json&sheet=ledger", { token, timeout: 180_000 });
  if (r.status !== 200) return out;
  for (const row of r.data.rows) {
    if (row[3] !== "IPO_ALLOTMENT" && !(row[3] === "REVERSAL" && /IPO allotment reversed/.test(row[7] || ""))) continue;
    const mm = /(\d+) ([A-Z0-9_&-]+) @|reversed: (\d+) ([A-Z0-9_&-]+)/.exec(row[7] || "");
    if (!mm) continue;
    const q = Number(mm[1] || mm[3]), sym = mm[2] || mm[4];
    const k = row[1] + "|" + sym;
    out.set(k, (out.get(k) || 0) + (row[3] === "IPO_ALLOTMENT" ? q : -q));
  }
  return out;
}
