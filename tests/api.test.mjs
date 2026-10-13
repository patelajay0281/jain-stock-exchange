// End-to-end API tests for the Hatchable rules (v3.13):
//   Create Order (broker / Pit Manager) → Exchange review → Bank settlement → market / cash updated;
//   prices change only through Market News (Event Admin and the Institutional desk).
// Run against a server with known test passwords (tests/test-passwords.sql) or, on staging, GitHub OIDC sign-in:
//   BASE=http://127.0.0.1:8788 node --test --test-concurrency=1 tests/api.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { zipSync, unzipSync, strToU8 } from "fflate";
import { signIn, Stats } from "./lib/client.mjs";
import { audit } from "./lib/audit.mjs";

const BASE = (process.env.BASE || "http://127.0.0.1:8788").replace(/\/$/, "");
const CI = !!(process.env.ACTIONS_ID_TOKEN_REQUEST_URL || process.env.CI_OIDC_TOKEN);   // CI sessions are exempt from the password dialog
const A = { admin_password: process.env.PW_ADMIN || "admin-pass-1" };
const BROKERS = Array.from({ length: 10 }, (_, i) => "BROKER-" + String(i + 1).padStart(2, "0"));
const USERS = ["ADMIN", "PIT-01", "PIT-02", "EXCHANGE-01", "BANK-01", "INST-01", "TEAM-001", "TEAM-002", "FACULTY-01", ...BROKERS];
const ISSUE = { VOLTRA: 890, BLUEAI: 780, SHREEB: 620, AAROGYA: 710 };
const tok = {};
const S = {};          // state shared by the tests below (they run in order)
const brokerOf = {};   // team → broker code (teams.broker_id is the one canonical assignment)
const num = Number;
const key = () => randomUUID();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const round2 = (x) => Math.round(x * 100) / 100;

async function api(method, path, body, who, opts = {}) {
  for (let attempt = 0; ; attempt++) {
    const headers = { accept: "application/json" };
    if (body !== undefined) headers["content-type"] = "application/json";
    if (who) headers.authorization = "Bearer " + tok[who];
    const r = await fetch(BASE + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), redirect: opts.redirect || "follow" });
    const ct = r.headers.get("content-type") || "";
    const data = ct.includes("json") ? await r.json() : opts.text ? await r.text() : new Uint8Array(await r.arrayBuffer());
    // the per-user write limiter and the platform's concurrency limiter: wait and retry, like a desk operator
    if (r.status === 429 && attempt < 12 && (!ct.includes("json") || data.code === "TOO_MANY_REQUESTS")) { await sleep(250 + attempt * 250); continue; }
    return { status: r.status, data, headers: r.headers };
  }
}
const GET = (p, who, o) => api("GET", p, undefined, who, o);
const POST = (p, b, who, o) => api("POST", p, b, who, o);
const ok = (r, msg) => assert.equal(r.status, 200, (msg ? msg + ": " : "") + JSON.stringify(r.data).slice(0, 600));

async function market() { return (await GET("/api/market")).data; }
async function sec(symbol) { const m = await market(); return [...m.stocks, ...m.ipos].find((s) => s.symbol === symbol); }
async function price(symbol) { return num((await sec(symbol)).price); }
async function detail(team) { const r = await GET("/api/portfolio-details?team=" + team, "ADMIN"); ok(r, "detail " + team); return r.data; }
const holding = (d, sym) => (d.holdings.find((h) => h.symbol === sym) || { quantity: 0 }).quantity;

/** broker submission at the canonical market price (the broker's screen shows the price → expected_price) */
async function submit(team, symbol, side, quantity, { as, ...extra } = {}) {
  const s = await sec(symbol);
  return POST("/api/orders", { team, symbol, side, quantity, expected_price: s.price, idempotency_key: key(), ...extra }, as || brokerOf[team]);
}
// there is no separate Pit Manager step any more: a created order goes straight to the Exchange
const execute = async (id) => ({ status: 200, data: { status: "EXCHANGE_PENDING", id } });
const approve = (id, extra = {}) => POST("/api/exchange", { order_id: id, action: "APPROVE", ...extra }, "EXCHANGE-01");
const settle = (id, who = "BANK-01") => POST("/api/bank", { order_id: id, action: "SETTLE" }, who);
async function fullTrade(team, symbol, side, quantity) {
  const o = await submit(team, symbol, side, quantity); ok(o, "submit " + team + " " + side + " " + symbol);
  const id = o.data.order.id;
  const x = await execute(id); ok(x, "execute");
  const a = await approve(id, { confirm_short_sell: true }); ok(a, "approve");
  const s = await settle(id); ok(s, "settle");
  return { id, order: o.data.order, settle: s.data };
}

/** a minimal .xlsx workbook (inline strings) for the Excel import tests */
function xlsxBase64(rows) {
  const col = (i) => String.fromCharCode(65 + i);
  const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const cells = rows.map((r, ri) => `<row r="${ri + 1}">` + r.map((v, ci) => typeof v === "number"
    ? `<c r="${col(ci)}${ri + 1}"><v>${v}</v></c>` : `<c r="${col(ci)}${ri + 1}" t="inlineStr"><is><t>${esc(v)}</t></is></c>`).join("") + "</row>").join("");
  const x = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  const files = {
    "[Content_Types].xml": x + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    "_rels/.rels": x + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    "xl/workbook.xml": x + '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Import" sheetId="1" r:id="rId1"/></sheets></workbook>',
    "xl/_rels/workbook.xml.rels": x + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
    "xl/worksheets/sheet1.xml": x + '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' + cells + "</sheetData></worksheet>",
  };
  return Buffer.from(zipSync(Object.fromEntries(Object.entries(files).map(([k, v]) => [k, strToU8(v)])))).toString("base64");
}

// ---------------------------------------------------------------------------------------------------------------
test("sign in every role", async () => {
  for (const u of USERS) tok[u] = await signIn(u);
  assert.equal((await POST("/api/login", { username: "ADMIN", password: "definitely-wrong" })).status, 401);
  const me = await GET("/api/me", "TEAM-001");
  assert.equal(me.data.user.role, "PARTICIPANT");
  assert.ok(me.data.user.team_name, "the participant's session carries its team name");
});

test("clean event with the standard v311 rules", async () => {
  const st = (await GET("/api/event-status")).data;
  S.origStart = st.config.event_start_at;
  if (st.status === "LIVE" || st.status === "SETTLEMENT_ONLY") {
    ok(await POST("/api/reject-open-orders", { ...A }, "ADMIN")); ok(await POST("/api/event", { action: "CLOSE", ...A }, "ADMIN"));
  }
  ok(await POST("/api/reset-event", { confirm: "RESET", keep_allotments: false, ...A }, "ADMIN"), "reset");
  ok(await POST("/api/ipo-listing", { action: "CLEAR", ...A }, "ADMIN"));                 // IPOs list at their issue prices in this suite
  ok(await POST("/api/config", { brokerage_rate: 0.005, loan_interest_rate: 0.02, initial_capital: 2000000, loan_max_principal: 500000,
    min_order_value: 0, max_order_value: 2500000, cash_rule_limit: 50000, min_buy_trades: 5, min_sell_trades: 5, max_price_move_pct: 10,
    ipo_application_hours: 24, loans_enabled: true, auto_loan_on_settlement: true, loan_repayment_required: true, auto_list_ipos: true,
    ...A }, "ADMIN"), "standard rules");
  const r = await POST("/api/reset-event", { confirm: "RESET", keep_allotments: false, ...A }, "ADMIN");
  ok(r); assert.equal(r.data.status, "NOT_STARTED");
});

test("reference data: 100 teams with brokers, 50 equities, 4 IPOs, 10 brokers", async () => {
  const s = (await GET("/api/event-status")).data;
  assert.deepEqual([s.counts.teams, s.counts.stocks, s.counts.ipos, s.counts.brokers], [100, 50, 4, 10]);
  assert.equal(num(s.config.brokerage_rate), 0.005); assert.equal(num(s.config.max_order_value), 2500000); assert.equal(num(s.config.min_order_value), 0);
  assert.equal(num(s.config.initial_capital), 2000000); assert.equal(num(s.config.loan_max_principal), 500000);
  const m = await market();
  assert.deepEqual(Object.fromEntries(m.ipos.map((x) => [x.symbol, num(x.price)])), ISSUE);
  assert.deepEqual(m.ipos.map((x) => x.ipo_code), ["IPO-01", "IPO-02", "IPO-03", "IPO-04"]);
  assert.ok(m.stocks.every((x) => x.type === "EQUITY" && x.lot_size === 50) && m.ipos.every((x) => x.type === "IPO" && !x.listed));
  const names = (await GET("/api/team-names", "ADMIN")).data;
  assert.equal(names.teams.length, 100);
  assert.deepEqual(names.teams.map((t) => t.team), Array.from({ length: 100 }, (_, i) => "TEAM-" + String(i + 1).padStart(3, "0")));
  for (const t of names.teams) { assert.ok(t.broker, t.team + " has a broker"); brokerOf[t.team] = t.broker; }
  const per = {}; for (const b of Object.values(brokerOf)) per[b] = (per[b] || 0) + 1;
  assert.deepEqual(Object.keys(per).sort(), BROKERS); assert.ok(Object.values(per).every((n) => n === 10), JSON.stringify(per));
  const p = (await GET("/api/portfolios", "ADMIN")).data;
  assert.ok(p.teams.every((t) => num(t.cash) === 2000000 && num(t.net_worth) === 2000000));
});

test("broker details are available in advance and a participant sees only its own team and broker", async () => {
  const st = (await GET("/api/admin-state", "ADMIN")).data;
  assert.equal(st.brokers.length, 10); assert.ok(st.brokers.every((b) => b.code && b.name && num(b.teams) === 10));
  assert.equal(st.unassigned_teams, 0);
  const own = await GET("/api/portfolio-details?team=TEAM-002", "TEAM-001");      // the team parameter is ignored for participants
  ok(own); assert.equal(own.data.identity.code, "TEAM-001");
  assert.equal(own.data.broker.code, brokerOf["TEAM-001"]); assert.ok(own.data.broker.name);
  assert.ok(own.data.identity.name && own.data.identity.name !== "TEAM-001", "team name shown");
  assert.equal((await GET("/api/portfolios", "TEAM-001")).status, 403);
  assert.equal((await GET("/api/broker-desk", "TEAM-001")).status, 403);
  assert.equal((await GET("/api/pit", "TEAM-001")).status, 404, "no Pit Manager desk on Hatchable");
  assert.equal((await GET("/api/exchange", "TEAM-001")).status, 403);
  assert.equal((await GET("/api/bank", "TEAM-001")).status, 403);
  assert.equal((await GET("/api/audit", "TEAM-001")).status, 403);
  assert.equal((await GET("/api/insights", "TEAM-001")).status, 403, "Market Intelligence lives in Event Admin only");
  assert.equal((await GET("/api/commissions", "TEAM-001")).status, 403);
  const exp = await api("GET", "/api/export-event-excel", undefined, "TEAM-001");
  assert.equal(exp.status, 403);
});

test("security: unauthenticated and wrong-role calls are refused server-side", async () => {
  for (const p of ["/api/portfolios", "/api/admin-state", "/api/insights", "/api/audit", "/api/cash", "/api/team-names"]) assert.equal((await GET(p)).status, 401, p);
  assert.equal((await POST("/api/event", { action: "START" })).status, 401);
  assert.equal((await POST("/api/event", { action: "START", ...A }, "PIT-01")).status, 403);
  assert.equal((await POST("/api/bank", { order_id: 1, action: "SETTLE" }, "EXCHANGE-01")).status, 403);
  for (const p of ["/api/pit", "/api/slips", "/api/instructions", "/api/ipo", "/api/certificates"]) assert.equal((await GET(p, "ADMIN")).status, 404, p + " is not part of the Hatchable application");
  assert.equal((await POST("/api/exchange", { order_id: 1, action: "APPROVE" }, "PIT-01")).status, 403);
  for (const who of ["BANK-01", "BROKER-01", "PIT-01", "EXCHANGE-01", "TEAM-001", "FACULTY-01"]) {
    assert.equal((await POST("/api/market-news", { symbol: "TCS", mood: "POSITIVE", headline: "x" }, who)).status, 403, who + " cannot publish Market News");
  }
  assert.equal((await POST("/api/config", { brokerage_rate: 0.01, ...A }, "FACULTY-01")).status, 403);
  assert.equal((await GET("/api/export?sheet=orders", "PIT-01")).status, 403);
  assert.equal((await GET("/api/admin-state", "BROKER-01")).status, 403);
  assert.equal((await GET("/api/portfolios", "INST-01")).status, 403);
  assert.equal((await GET("/api/set-price")).status, 404, "there is no manual price endpoint");
});

test("Rules & Configuration save needs the administrator password", { skip: CI && "staging CI sessions have no password" }, async () => {
  const no = await POST("/api/config", { brokerage_rate: 0.006 }, "ADMIN");
  assert.equal(no.status, 403); assert.equal(no.data.code, "ADMIN_PASSWORD_REQUIRED");
  const bad = await POST("/api/config", { brokerage_rate: 0.006, admin_password: "wrong-password" }, "ADMIN");
  assert.equal(bad.status, 403); assert.equal(bad.data.code, "ADMIN_PASSWORD_INVALID");
  assert.equal(num((await GET("/api/event-status")).data.config.brokerage_rate), 0.005, "nothing changed");
  const yes = await POST("/api/config", { brokerage_rate_pct: 0.6, ...A }, "ADMIN");
  ok(yes); assert.equal(num(yes.data.config.brokerage_rate), 0.006);
  ok(await POST("/api/config", { brokerage_rate: 0.005, ...A }, "ADMIN"));
  const aud = (await GET("/api/audit?action=CONFIGURATION_UPDATED", "ADMIN")).data.rows[0];
  assert.ok(aud && aud.details.changed.includes("brokerage_rate"));
  const invalid = await POST("/api/config", { max_price_move_pct: 15, ...A }, "ADMIN");
  assert.equal(invalid.status, 400, "the ±10% cap cannot be exceeded");
});

test("CMS INDEX starts with the 50 listed equities; IPOs wait in the IPO market", async () => {
  const m = await market();
  assert.equal(m.index.components, 50); assert.equal(m.index.equity_components, 50); assert.equal(m.index.ipo_components, 0);
  assert.equal(num(m.index.change), 0);
  assert.deepEqual(m.board.ipo_market, ["VOLTRA", "BLUEAI", "SHREEB", "AAROGYA"]);
  assert.equal(m.board.listed_market.length, 50); assert.equal(new Set(m.board.listed_market).size, 50);
  assert.ok(m.ipos.every((i) => i.stage !== "LISTED" && !i.in_index));
  const cms = (await GET("/api/cms50")).data;
  assert.equal(cms.components, 50);
});

test("team names: unique IKS names, randomly but reproducibly assigned before LIVE", async () => {
  let st = (await GET("/api/team-names", "ADMIN")).data;
  assert.ok(st.pool_size >= 100, "pool of at least 100 names");
  const poolNames = new Set(st.pool.map((p) => p.name.toLowerCase()));
  assert.equal(new Set(st.teams.map((t) => t.name.toLowerCase())).size, 100, "names are unique");
  assert.ok(st.teams.every((t) => poolNames.has(t.name.toLowerCase())), "every name comes from the IKS pool");
  const original = st.teams.map((t) => t.name), seed0 = st.seed;
  if (st.locked) ok(await POST("/api/team-names", { action: "UNLOCK", ...A }, "ADMIN"), "unlock before the event");
  const ra = await POST("/api/team-names", { action: "RANDOMIZE", seed: "JSE-TEST-A", ...A }, "ADMIN"); ok(ra);
  const a = ra.data.teams.map((t) => t.name);
  const rb = await POST("/api/team-names", { action: "RANDOMIZE", seed: "JSE-TEST-B", ...A }, "ADMIN"); ok(rb);
  const b = rb.data.teams.map((t) => t.name);
  assert.notDeepEqual(a, b, "a different seed gives a different assignment");
  assert.equal(new Set(b.map((x) => x.toLowerCase())).size, 100);
  const ra2 = await POST("/api/team-names", { action: "RANDOMIZE", seed: "JSE-TEST-A", ...A }, "ADMIN"); ok(ra2);
  assert.deepEqual(ra2.data.teams.map((t) => t.name), a, "same seed + same pool → same names");
  if (!CI) assert.equal((await POST("/api/team-names", { action: "RANDOMIZE", seed: "X" }, "ADMIN")).data.code, "ADMIN_PASSWORD_REQUIRED");
  assert.equal((await POST("/api/team-names", { action: "RANDOMIZE", seed: "X", ...A }, "FACULTY-01")).status, 403);
  // put the event's assignment back: its seed, then the exact names (they may have been edited through the roster import)
  if (seed0) ok(await POST("/api/team-names", { action: "RANDOMIZE", seed: seed0, ...A }, "ADMIN"));
  const now = (await GET("/api/team-names", "ADMIN")).data.teams.map((t) => t.name);
  if (JSON.stringify(now) !== JSON.stringify(original)) {
    ok(await POST("/api/teams", { rows: st.teams.map((t, i) => ({ team: t.team, name: original[i] })), ...A }, "ADMIN"), "restore the original names");
  }
  st = (await GET("/api/team-names", "ADMIN")).data;
  assert.deepEqual(st.teams.map((t) => t.name), original, "the event's team names are back");
  const me = await GET("/api/portfolio-details", "TEAM-001");
  assert.equal(me.data.identity.name, original[0]);
});

test("IPO master: four IPOs at their issue prices, lots of 50, shares on offer; no IPO application portal", async () => {
  const st = (await GET("/api/admin-state", "ADMIN")).data;
  assert.deepEqual(st.ipo_admin.map((i) => i.ipo_code), ["IPO-01", "IPO-02", "IPO-03", "IPO-04"]);
  assert.deepEqual(Object.fromEntries(st.ipo_admin.map((i) => [i.symbol, num(i.price)])), ISSUE);
  assert.deepEqual(Object.fromEntries(st.ipo_admin.map((i) => [i.symbol, i.offered])), { VOLTRA: 100000, BLUEAI: 80000, SHREEB: 120000, AAROGYA: 60000 });
  assert.ok(st.ipo_admin.every((i) => i.remaining === i.offered && !i.listed));
  assert.equal((await GET("/api/ipo-applications", "ADMIN")).status, 404);
  assert.equal((await POST("/api/ipo-applications", { ipo: "VOLTRA", lots: 1 }, "TEAM-001")).status, 404);
});

test("Excel / CSV imports: allotments (Team, IPO, Lots, Shares, Amount), teams and brokers — all-or-nothing", async () => {
  const csv = "Team,IPO,Lots,Shares,Amount\nTEAM-005,VOLTRA,2,100,89000\nTEAM-005,IPO-02,1,50,39000\nTEAM-006,AAROGYA,4,200,142000\n";
  const dry = await POST("/api/import", { kind: "allotments", filename: "allotments.csv", csv_text: csv, dry_run: true }, "ADMIN");
  ok(dry, "dry run (no password needed)"); assert.equal(dry.data.rows, 3); assert.equal(num(dry.data.total_amount), 270000);
  assert.equal(num((await detail("TEAM-005")).team.cash), 2000000, "a dry run changes nothing");
  const bad = await POST("/api/import", { kind: "allotments", filename: "bad.csv", csv_text: "Team,IPO,Lots,Shares,Amount\nTEAM-005,VOLTRA,2,100,90000\nTEAM-999,VOLTRA,1,,\n", ...A }, "ADMIN");
  assert.equal(bad.status, 400); assert.equal(bad.data.code, "ALLOTMENT_ERRORS"); assert.equal(bad.data.errors.length, 2, JSON.stringify(bad.data));
  if (!CI) assert.equal((await POST("/api/import", { kind: "allotments", filename: "a.csv", csv_text: csv }, "ADMIN")).data.code, "ADMIN_PASSWORD_REQUIRED");
  const load = await POST("/api/import", { kind: "allotments", filename: "allotments.xlsx",
    data_base64: xlsxBase64([["Team", "IPO", "Lots", "Shares", "Amount"], ["TEAM-005", "VOLTRA", 2, 100, 89000], ["TEAM-005", "IPO-02", 1, 50, 39000], ["TEAM-006", "AAROGYA", 4, 200, 142000]]), ...A }, "ADMIN");
  ok(load, "xlsx import"); assert.equal(load.data.rows, 3);
  const d5 = await detail("TEAM-005");
  assert.equal(num(d5.team.cash), 2000000 - 89000 - 39000, "IPO allotment: cash at the issue price, no brokerage");
  assert.equal(holding(d5, "VOLTRA"), 100); assert.equal(holding(d5, "BLUEAI"), 50);
  assert.equal(d5.assessment.buy, 0, "IPO allotments are not assessment trades");
  assert.equal(await price("VOLTRA"), 890, "allotments never move prices");
  const dup = await POST("/api/ipo-allotments", { rows: [{ team: "TEAM-005", ipo: "VOLTRA", lots: 1 }], ...A }, "ADMIN");
  assert.equal(dup.status, 400, "the same team / IPO twice needs replace");
  // teams roster (.xlsx): the row must keep IKS names; teams.broker_id stays the one assignment
  const names = (await GET("/api/team-names", "ADMIN")).data.teams;
  const t1 = names[0];
  const tdry = await POST("/api/import", { kind: "teams", filename: "teams.xlsx", dry_run: true,
    data_base64: xlsxBase64([["Team", "Team Name", "Section", "Broker", "Members"], [t1.team, t1.name, "Section A", t1.broker, "Member One, Member Two"]]) }, "ADMIN");
  ok(tdry); assert.equal(tdry.data.rows, 1);
  const tbad = await POST("/api/import", { kind: "teams", filename: "teams.csv", dry_run: true, csv_text: "Team,Team Name,Broker\nTEAM-001,Not An IKS Name,BROKER-01\nTEAM-002,,BROKER-77\n" }, "ADMIN");
  assert.equal(tbad.status, 400); assert.equal(tbad.data.code, "ROSTER_ERRORS"); assert.equal(tbad.data.errors.length, 2);
  const missing = await POST("/api/import", { kind: "teams", filename: "t.csv", dry_run: true, csv_text: "Name,Section\nX,Y\n" }, "ADMIN");
  assert.equal(missing.data.code, "MISSING_HEADERS");
  const bdry = await POST("/api/import", { kind: "brokers", filename: "brokers.csv", dry_run: true, csv_text: "Broker Code,Broker Name\nBROKER-01,Broker 01\n" }, "ADMIN");
  ok(bdry); assert.equal(bdry.data.rows, 1);
  assert.equal((await POST("/api/import", { kind: "brokers", filename: "b.csv", dry_run: true, csv_text: "Broker Code,Broker Name\nBROKER-99,X\n" }, "ADMIN")).data.code, "ROSTER_ERRORS");
});

test("orders are refused before START", async () => {
  const r = await submit("TEAM-001", "TCS", "BUY", 50);
  assert.equal(r.status, 409); assert.equal(r.data.code, "EVENT_NOT_LIVE");
});

test("START (administrator password) lists all four IPOs once; CMS INDEX 54 components; team names lock", async () => {
  if (!CI) {
    const no = await POST("/api/event", { action: "START" }, "ADMIN");
    assert.equal(no.status, 403); assert.equal(no.data.code, "ADMIN_PASSWORD_REQUIRED");
    assert.equal((await GET("/api/event-status")).data.status, "NOT_STARTED");
  }
  const r = await POST("/api/event", { action: "START", ...A }, "ADMIN");
  ok(r); assert.equal(r.data.status, "LIVE");
  assert.deepEqual(r.data.listed.map((x) => x.symbol), ["VOLTRA", "BLUEAI", "SHREEB", "AAROGYA"]);
  assert.ok(r.data.listed.every((x) => num(x.listing_price) === ISSUE[x.symbol] && x.at_issue_price));
  const m = await market();
  assert.equal(m.index.components, 54); assert.equal(m.index.equity_components, 50); assert.equal(m.index.ipo_components, 4);
  assert.deepEqual([...m.index.ipos_included].sort(), ["AAROGYA", "BLUEAI", "SHREEB", "VOLTRA"]);
  assert.equal(num(m.index.change), 0, "listing at the component base does not jump the index");
  assert.deepEqual(m.board.ipo_market, []); assert.equal(m.board.listed_market.length, 54); assert.equal(new Set(m.board.listed_market).size, 54);
  assert.ok(m.ipos.every((i) => i.listed && i.stage === "LISTED" && i.in_index));
  assert.equal((await GET("/api/team-names", "ADMIN")).data.locked, true, "names lock when the event starts");
  const again = await POST("/api/ipo-listing", { action: "APPLY", at_issue_price: true, ...A }, "ADMIN");
  assert.equal(again.data.code, "NOTHING_TO_LIST", "no IPO is listed twice");
  assert.equal((await POST("/api/ipo-allotments", { rows: [{ team: "TEAM-007", ipo: "VOLTRA", lots: 1 }], ...A }, "ADMIN")).status, 409, "allotments locked after START");
  const st = (await GET("/api/admin-state", "ADMIN")).data;
  assert.equal(st.consistency.ok, true, JSON.stringify(st.consistency));
});

test("a participant cannot create an order (self entry disabled); its broker creates it → Exchange Pending", async () => {
  const direct = await POST("/api/orders", { team: "TEAM-001", symbol: "INFY", side: "BUY", quantity: 100, idempotency_key: key() }, "TEAM-001");
  assert.equal(direct.status, 403); assert.equal(direct.data.code, "PARTICIPANT_ENTRY_DISABLED");
  const o = await POST("/api/orders", { team: "TEAM-001", symbol: "INFY", side: "BUY", quantity: 100, expected_price: 900, idempotency_key: key() }, brokerOf["TEAM-001"]);
  ok(o, "broker creates the order");
  assert.equal(o.data.order.status, "EXCHANGE_PENDING", "Create Order → Exchange review (no Pit Manager step)");
  assert.equal(num(o.data.order.price), 900); assert.equal(num(o.data.order.brokerage_rate), 0.005);
  assert.match(o.data.order.order_no, /^ORD-\d+$/, "Hatchable order numbers: ORD-<n>");
  S.o1 = o.data.order;
  // the Pit Manager records trades in Create Order for any team
  const pitDesk = (await GET("/api/broker-desk", "PIT-01")).data;
  assert.equal(pitDesk.teams.length, 100); assert.equal(pitDesk.all_teams, true);
});

test("a broker sees only its assigned teams and cannot submit for another broker's team", async () => {
  const b = brokerOf["TEAM-001"];
  const desk = (await GET("/api/broker-desk", b)).data;
  assert.equal(desk.broker.code, b); assert.equal(desk.teams.length, 10);
  const mine = Object.entries(brokerOf).filter(([, x]) => x === b).map(([t]) => t).sort();
  assert.deepEqual(desk.teams.map((t) => t.code).sort(), mine);
  const foreign = Object.keys(brokerOf).find((t) => brokerOf[t] !== b);
  const r = await submit(foreign, "TCS", "BUY", 50, { as: b });
  assert.equal(r.status, 403); assert.equal(r.data.code, "NOT_YOUR_TEAM");
  assert.equal((await GET("/api/portfolio-details?team=" + foreign, b)).status, 403);
  assert.equal((await GET("/api/portfolio-details?team=TEAM-001", b)).status, 200);
  const trk = (await GET("/api/orders?page_size=200", b)).data;
  assert.ok(trk.rows.every((o) => o.broker === b), "a broker's tracking shows only its own teams' orders");
});

test("submission is at the canonical market price; validation; idempotency; no price or cash change", async () => {
  const lot = await submit("TEAM-002", "TCS", "BUY", 75);
  assert.equal(lot.data.code, "INVALID_LOT");
  const big = await submit("TEAM-002", "MARUTI", "BUY", 200);        // 26.4 L > ₹25 L
  assert.equal(big.status, 400); assert.equal(big.data.code, "ORDER_VALUE_LIMIT");
  const moved = await submit("TEAM-002", "TCS", "BUY", 50, { expected_price: 1 });
  assert.equal(moved.status, 409); assert.equal(moved.data.code, "PRICE_CHANGED");
  const manual = await POST("/api/orders", { team: "TEAM-002", symbol: "TCS", side: "BUY", quantity: 50, price: 1, idempotency_key: key() }, brokerOf["TEAM-002"]);
  ok(manual); assert.equal(num(manual.data.order.price), 1864, "a typed price is ignored: orders use the market price");
  assert.equal(num(manual.data.order.trade_value), 93200); assert.equal(num(manual.data.order.brokerage), 466);
  const k = key();
  const a = await POST("/api/orders", { team: "TEAM-002", symbol: "INFY", side: "BUY", quantity: 50, idempotency_key: k }, brokerOf["TEAM-002"]);
  const b = await POST("/api/orders", { team: "TEAM-002", symbol: "INFY", side: "BUY", quantity: 50, idempotency_key: k }, brokerOf["TEAM-002"]);
  assert.equal(a.data.order.id, b.data.order.id); assert.equal(b.data.replayed, true);
  S.o2 = a.data.order;
  assert.equal(await price("TCS"), 1864); assert.equal(num((await detail("TEAM-002")).team.cash), 2000000);
  // clean-up: the Exchange rejects the TCS order with a reason
  const rj = await POST("/api/exchange", { order_id: manual.data.order.id, action: "REJECT", reason: "Participant withdrew" }, "EXCHANGE-01");
  ok(rj); assert.equal(rj.data.status, "EXCHANGE_REJECTED");
});

test("orders reach the Exchange queue directly; a concurrent double approval approves once", async () => {
  const ex = (await GET("/api/exchange", "EXCHANGE-01")).data;
  assert.ok(ex.pending.some((o) => o.id === S.o1.id) && ex.pending.some((o) => o.id === S.o2.id));
  const res = await Promise.all(Array.from({ length: 6 }, () => approve(S.o2.id)));
  assert.equal(res.filter((r) => r.status === 200).length, 1, res.map((r) => r.status + ":" + (r.data.code || "")).join(","));
});

test("Exchange receives the executed order; the Bank settles it — cash, holdings, brokerage; the price is not touched", async () => {
  const before = await sec("INFY"), idx0 = (await market()).index;
  const ex = (await GET("/api/exchange", "EXCHANGE-01")).data;
  const row = ex.pending.find((o) => o.id === S.o1.id);
  assert.ok(row, "the created order is in the Exchange queue");
  const a = await approve(S.o1.id); ok(a); assert.equal(a.data.status, "EXCHANGE_APPROVED");
  assert.ok((await GET("/api/bank", "BANK-01")).data.pending.some((o) => o.id === S.o1.id), "the Bank receives Exchange-approved orders");
  const s = await settle(S.o1.id); ok(s);
  assert.equal(s.data.status, "BANK_SETTLED"); assert.equal(num(s.data.trade_value), 90000); assert.equal(num(s.data.brokerage), 450);
  assert.equal(num(s.data.cash_before), 2000000); assert.equal(num(s.data.cash_after), 1909550); assert.equal(num(s.data.market_price), 900);
  const d = await detail("TEAM-001");
  assert.equal(num(d.team.cash), 1909550); assert.equal(holding(d, "INFY"), 100); assert.equal(num(d.team.brokerage_paid), 450);
  assert.equal(d.assessment.buy, 1);
  const after = await sec("INFY"), idx1 = (await market()).index;
  assert.equal(num(after.price), num(before.price)); assert.equal(num(after.previous_price), num(before.previous_price));
  assert.equal(num(idx1.value), num(idx0.value), "settlement never moves the market");
  // the same transaction everywhere: tracking (four steps), commission, cash ledger, audit log
  const det = (await GET("/api/order?id=" + S.o1.id, "TEAM-001")).data;
  assert.deepEqual(det.flow.map((f) => f.step), ["ORDER_CREATED", "EXCHANGE_REVIEW", "BANK_SETTLEMENT", "UPDATES"]);
  assert.ok(det.flow.every((f) => f.state === "DONE" && f.at), JSON.stringify(det.flow.map((f) => f.step + ":" + f.state)));
  assert.equal(det.assessment.counts, true);
  const trk = (await GET("/api/orders", "TEAM-001")).data;
  assert.ok(trk.rows.find((o) => o.id === S.o1.id && o.status === "BANK_SETTLED"));
  const com = (await GET("/api/commissions?page_size=50", "ADMIN")).data;
  const c = com.transactions.find((t) => t.order_no === S.o1.order_no);
  assert.ok(c); assert.equal(c.broker, brokerOf["TEAM-001"]); assert.equal(num(c.amount), 450); assert.equal(num(c.rate), 0.005); assert.equal(c.status, "SETTLED");
  assert.equal(com.reconciliation.ok, true);
  const led = (await GET("/api/cash?team=TEAM-001", "ADMIN")).data.rows.filter((x) => x.order_no === S.o1.order_no);
  assert.deepEqual(led.map((x) => x.type).sort(), ["BROKERAGE", "BUY"]);
  const aud = (await GET("/api/audit?page_size=100&q=" + S.o1.order_no, "ADMIN")).data.rows.map((x) => x.action);
  for (const want of ["ORDER_CREATED", "EXCHANGE_APPROVED", "BANK_SETTLED"]) assert.ok(aud.includes(want), want + " in " + aud.join(","));
  const tab = (await GET("/api/audit?group=EXCHANGE&page_size=200", "ADMIN")).data.rows;
  assert.ok(tab.length && tab.every((x) => /EXCHANGE|SHORT_SELLING_APPROVED/.test(x.action) || x.role === "EXCHANGE"), "Exchange tab");
});

test("duplicate settlement is blocked (sequential and concurrent)", async () => {
  const res = await Promise.all(Array.from({ length: 12 }, () => settle(S.o2.id)));
  assert.equal(res.filter((r) => r.status === 200 && r.data.status === "BANK_SETTLED").length, 1, res.map((r) => r.status + ":" + (r.data.code || "")).join(","));
  assert.ok(res.filter((r) => r.status === 409).length === 11);
  const d = await detail("TEAM-002");
  assert.equal(holding(d, "INFY"), 50); assert.equal(num(d.team.cash), 2000000 - 45000 - 225);
});

test("SELL: cash up, holding down, brokerage, realised P/L", async () => {
  const { settle: s } = await fullTrade("TEAM-001", "INFY", "SELL", 50);
  assert.equal(num(s.trade_value), 45000); assert.equal(num(s.brokerage), 225);
  assert.equal(num(s.realized_pnl), -450, "cost of 50 of 100 shares incl. brokerage 45,225 vs proceeds 44,775");
  const d = await detail("TEAM-001");
  assert.equal(num(d.team.cash), 1909550 + 45000 - 225); assert.equal(holding(d, "INFY"), 50);
  assert.equal(d.assessment.sell, 1); assert.equal(d.sold.length, 1); assert.equal(num(d.sold[0].net_proceeds), 44775);
});

test("P0 short selling is refused at submission (holdings and open sell orders), also under concurrency", async () => {
  const o = await submit("TEAM-003", "TCS", "SELL", 100);
  assert.equal(o.status, 409); assert.equal(o.data.code, "SHORT_SELL_NOT_ALLOWED");
  assert.match(o.data.error, /^Short selling is not allowed\. You can sell only the shares available in your portfolio\. Please reduce the quantity or check your holdings\./);
  // 50 shares held: one SELL 50 is accepted; a second SELL 50 while the first is open is refused (reserved shares)
  ok(await fullTrade("TEAM-003", "ITC", "BUY", 50).then((x) => ({ status: x.settle.status === "BANK_SETTLED" ? 200 : 500, data: x })));
  const s1 = await submit("TEAM-003", "ITC", "SELL", 50); ok(s1);
  const s2 = await submit("TEAM-003", "ITC", "SELL", 50);
  assert.equal(s2.data.code, "SHORT_SELL_NOT_ALLOWED", "shares in an open sell order cannot be sold again");
  ok(await approve(s1.data.order.id)); assert.equal((await settle(s1.data.order.id)).data.status, "BANK_SETTLED");
  // concurrency: holding 100, five simultaneous SELL 50 orders → exactly two accepted
  await fullTrade("TEAM-003", "ITC", "BUY", 100);
  const res = await Promise.all([1, 2, 3, 4, 5].map(() => submit("TEAM-003", "ITC", "SELL", 50)));
  assert.equal(res.filter((r) => r.status === 200).length, 2, res.map((r) => r.status + ":" + (r.data.code || "")).join(","));
  const d = await detail("TEAM-003");
  assert.equal(num(d.team.cash) >= 0, true); assert.ok(d.holdings.every((h) => h.quantity >= 0));
});

test("P0 insufficient balance and per-company 25% limit are refused at submission with live amounts", async () => {
  const p = await price("LT");
  const o = await submit("TEAM-004", "LT", "BUY", 200);          // ≈ ₹5.8 L > 25% of ₹20 L
  assert.equal(o.status, 409); assert.equal(o.data.code, "COMPANY_LIMIT"); assert.match(o.data.error, /Per-company limit: a team may invest at most 25%/);
  // build up to the cash limit across companies, then one more BUY is refused with the exact message
  const m = await market(); const syms = m.stocks.filter((s) => num(s.price) > 0).slice(0, 12);
  let accepted = 0;
  for (const s of syms) {
    const q = Math.floor(450000 / num(s.price) / 50) * 50; if (q < 50) continue;
    const r = await submit("TEAM-004", s.symbol, "BUY", q);
    if (r.status === 200) accepted++;
    else { assert.equal(r.data.code, "INSUFFICIENT_BALANCE", JSON.stringify(r.data));
           assert.match(r.data.error, /^Insufficient balance! Your available cash is ₹[\d,.]+, but this order requires ₹[\d,.]+, including applicable charges\. Please reduce the order quantity or obtain an approved loan before placing this order\.$/);
           break; }
  }
  assert.ok(accepted >= 3 && accepted <= 4, "pending BUY orders reserve cash: " + accepted);
  assert.equal(num((await detail("TEAM-004")).team.cash), 2000000, "nothing moves before the Bank settles");
  assert.ok(p > 0);
});

test("P0 concurrent BUY orders for one team never commit the same cash twice", async () => {
  const m = await market(); const syms = m.stocks.filter((s) => num(s.price) <= 3000).slice(10, 20);
  const res = await Promise.all(syms.map((s) => submit("TEAM-015", s.symbol, "BUY", Math.max(50, Math.floor(300000 / num(s.price) / 50) * 50))));
  const ok200 = res.filter((r) => r.status === 200);
  const reserved = ok200.reduce((a, r) => a + num(r.data.order.settlement_amount), 0);
  assert.ok(reserved <= 2000000, "reserved " + reserved); assert.ok(ok200.length >= 5 && ok200.length < syms.length, String(ok200.length));
  assert.ok(res.filter((r) => r.status !== 200).every((r) => r.data.code === "INSUFFICIENT_BALANCE"));
  ok(await POST("/api/reject-open-orders", { ...A, reason: "test cleanup" }, "ADMIN"));
});

test("P1 loan request → Bank Desk approval releases the approved amount once", async () => {
  const before = num((await detail("TEAM-008")).team.cash);
  const rq = await POST("/api/loan-requests", { action: "REQUEST", team: "TEAM-008", amount: 100000, reason: "buy more" }, brokerOf["TEAM-008"]);
  ok(rq); assert.match(rq.data.request_no, /^LR-\d+$/);
  assert.equal(num((await detail("TEAM-008")).team.cash), before, "a request does not credit cash");
  assert.equal((await POST("/api/loan-requests", { action: "REQUEST", team: "TEAM-008", amount: 5000 }, "BANK-01")).data.code, "LOAN_REQUEST_PENDING");
  assert.equal((await POST("/api/loan-requests", { action: "APPROVE", request_id: rq.data.id }, "EXCHANGE-01")).status, 403);
  const ap = await POST("/api/loan-requests", { action: "APPROVE", request_id: rq.data.id, approved_amount: 80000 }, "BANK-01");
  ok(ap); assert.equal(ap.data.message, "Loan approved and released successfully. ₹80,000 has been credited to Team TEAM-008's account.");
  const again = await POST("/api/loan-requests", { action: "APPROVE", request_id: rq.data.id, approved_amount: 80000 }, "BANK-01");
  ok(again); assert.equal(again.data.replayed, true);
  const d = await detail("TEAM-008");
  assert.equal(num(d.team.cash), before + 80000, "credited exactly once"); assert.equal(num(d.loan.original_principal), 80000);
  const led = (await GET("/api/cash?team=TEAM-008", "ADMIN")).data;
  assert.equal(led.rows.filter((x) => x.type === "LOAN_DRAW").length, 1); assert.equal(led.reconciliation.ok, true);
  const list = (await GET("/api/loan-requests", "BANK-01")).data.requests.find((r) => r.id === rq.data.id);
  assert.equal(list.status, "DISBURSED"); assert.equal(num(list.approved_amount), 80000); assert.ok(list.disbursement_ref);
  assert.equal((await POST("/api/loan-requests", { action: "REQUEST", team: "TEAM-008", amount: 500000 }, "BANK-01")).data.code, "LOAN_LIMIT");
  // repayment still works (interest first) and clears the loan
  const due = num(d.loan.total_liability);
  ok(await POST("/api/loan", { team: "TEAM-008", action: "REPAY", amount: due }, "BANK-01"));
  assert.equal(num((await detail("TEAM-008")).loan.total_liability), 0);
});

test("P3 bank and institutional investor names are editable; IDs and balances unchanged", async () => {
  const inst0 = (await GET("/api/institutional-portfolio", "INST-01")).data.institution;
  if (!CI) assert.equal((await POST("/api/rename", { kind: "BANK", name: "X" }, "ADMIN")).data.code, "ADMIN_PASSWORD_REQUIRED");
  assert.equal((await POST("/api/rename", { kind: "BANK", name: "X", ...A }, "BANK-01")).status, 403);
  assert.equal((await POST("/api/rename", { kind: "BANK", name: "  ", ...A }, "ADMIN")).data.code, "INVALID_NAME");
  ok(await POST("/api/rename", { kind: "BANK", name: "Dalal Cooperative Bank", reason: "sponsor", ...A }, "ADMIN"));
  assert.equal((await GET("/api/loan-requests", "BANK-01")).data.bank_name, "Dalal Cooperative Bank");
  ok(await POST("/api/rename", { kind: "INSTITUTION", id: inst0.id, name: "Temp Funds " + Date.now(), reason: "temp", ...A }, "ADMIN"));
  ok(await POST("/api/rename", { kind: "INSTITUTION", id: inst0.id, name: "Nalanda Funds Ltd", reason: "official name", ...A }, "ADMIN"));
  const inst1 = (await GET("/api/institutional-portfolio", "INST-01")).data.institution;
  assert.equal(inst1.id, inst0.id); assert.equal(inst1.name, "Nalanda Funds Ltd");
  const aud = (await GET("/api/audit?action=INSTITUTION_RENAMED", "ADMIN")).data.rows[0];
  assert.ok(aud && aud.details.reason === "official name", JSON.stringify(aud));
});

test("account controls: add a second broker login and a bank account, edit, sign in, duplicates refused", async () => {
  const sfx = String(Date.now()).slice(-6), bu = "BRK-" + sfx, ku = "BANK-" + sfx;
  const b = await POST("/api/users", { action: "CREATE_USER", role: "BROKER", username: bu.toLowerCase(), display_name: "Desk 1 relief", broker: "BROKER-01", password: "relief-pass-01", ...A }, "ADMIN");
  ok(b); assert.equal(b.data.username, bu);
  assert.equal((await POST("/api/users", { action: "CREATE_USER", role: "BROKER", username: bu, broker: "BROKER-01", ...A }, "ADMIN")).data.code, "USERNAME_TAKEN");
  assert.equal((await POST("/api/users", { action: "CREATE_USER", role: "BANK", username: ku, ...A }, "BANK-01")).status, 403);
  const k = await POST("/api/users", { action: "CREATE_USER", role: "BANK", username: ku, ...A }, "ADMIN"); ok(k); assert.ok(k.data.password.length >= 8);
  assert.equal((await POST("/api/users", { action: "CREATE_USER", role: "PARTICIPANT", username: "TEAM-X" + sfx, team: "TEAM-999", ...A }, "ADMIN")).data.code, "TEAM_NOT_FOUND");
  ok(await POST("/api/users", { action: "UPDATE_USER", username: ku, display_name: "Bank Desk 5", email: "bank5@example.com", ...A }, "ADMIN"));
  const list = (await GET("/api/users", "ADMIN")).data.users;
  assert.ok(list.some((u) => u.username === ku && u.name === "Bank Desk 5" && u.email === "bank5@example.com"));
  const li = await POST("/api/login", { username: bu, password: "relief-pass-01" });
  ok(li); assert.equal(li.data.user.role, "BROKER"); assert.equal(li.data.user.broker, "BROKER-01");
});

test("market price changed: Market News closes open orders created at the old price; settlement never writes a price", async () => {
  const o = await submit("TEAM-009", "HDFCBANK", "BUY", 50);
  ok(o); assert.equal(num(o.data.order.price), 719);
  const n = await POST("/api/market-news", { symbol: "HDFCBANK", mood: "VERY_SEVERE", headline: "HDFC Bank faces a regulatory penalty" }, "ADMIN");
  ok(n); assert.ok(n.data.stale_orders >= 1);
  const det = (await GET("/api/order?id=" + o.data.order.id, "ADMIN")).data.order;
  assert.equal(det.status, "EXCHANGE_REJECTED"); assert.equal(det.reject_code, "PRICE_STALE"); assert.match(det.reject_reason, /^MARKET PRICE CHANGED/);
  assert.equal((await approve(o.data.order.id)).status, 409, "a closed order cannot be approved");
  // an Exchange-approved order is closed at the Bank stage too — never settled at an obsolete price
  const e = await submit("TEAM-010", "SBIN", "BUY", 50);
  ok(e); ok(await approve(e.data.order.id));
  const n2 = await POST("/api/market-news", { symbol: "SBIN", mood: "POSITIVE", headline: "SBI posts record profit" }, "ADMIN");
  ok(n2); assert.equal(n2.data.stale_orders, 1);
  const ed = (await GET("/api/order?id=" + e.data.order.id, "ADMIN")).data.order;
  assert.equal(ed.status, "BANK_REJECTED"); assert.equal(ed.reject_code, "PRICE_STALE");
  // a fresh order at the new price settles at it
  const f = await submit("TEAM-010", "SBIN", "BUY", 50);
  ok(f); ok(await approve(f.data.order.id));
  const s = await settle(f.data.order.id);
  assert.equal(s.data.status, "BANK_SETTLED"); assert.equal(num(s.data.trade_value), round2(50 * num(n2.data.new_price)));
  assert.equal(await price("SBIN"), num(n2.data.new_price), "the Bank does not create a competing price change");
  const ph = (await GET("/api/export?sheet=prices&format=json", "ADMIN")).data.rows;
  assert.ok(ph.length > 0 && ph.every((r) => ["MARKET_NEWS", "LISTING", "UNDO", "REDO"].includes(r[2])), "no price history from trades");
});

test("Market News: severity bands, ±10% cap, headline, random within band, board order", async () => {
  const BANDS = { VERY_SEVERE: [-10, -7.5], SEVERE: [-7.49, -5], NEGATIVE: [-4.99, -1], NORMAL: [-0.99, 0.99], POSITIVE: [1, 4.99], VERY_POSITIVE: [5, 7.49], SUPER_POSITIVE: [7.5, 10] };
  for (const [mood, [lo, hi]] of Object.entries(BANDS)) {
    const before = await price("BEL");
    const r = await POST("/api/market-news", { symbol: "BEL", mood, headline: "BEL " + mood.toLowerCase() + " test", price: 1, new_price: 99999 }, "ADMIN");
    ok(r, mood);
    assert.ok(num(r.data.requested_pct) >= lo && num(r.data.requested_pct) <= hi, mood + " requested " + r.data.requested_pct);
    assert.ok(Math.abs(num(r.data.applied_pct)) <= 10 + 1e-9, mood + " capped");
    assert.equal(num(r.data.previous_price), before);
    assert.equal(await price("BEL"), num(r.data.new_price), "the typed price is ignored; the engine sets it");
    assert.equal(r.data.headline, "BEL " + mood.toLowerCase() + " test");
    const m = await market();
    assert.equal(m.board.listed_market[0], "BEL", "the latest changed security moves to the top");
  }
  const feed = (await GET("/api/market-news?limit=5")).data.news;
  assert.equal(feed[0].symbol, "BEL"); assert.ok(feed[0].headline);
  const aud = (await GET("/api/audit?action=MARKET_NEWS_PRICE_MOVE", "ADMIN")).data.rows[0];
  assert.equal(aud.details.source, "MARKET_NEWS"); assert.ok(aud.details.headline);
  assert.equal((await POST("/api/market-news", { symbol: "BEL", mood: "HUGE" }, "ADMIN")).data.code, "INVALID_MOOD");
});

test("institutional counterparty: participant buys at market +2%, sells at market −2%; brokerage to its broker; counts toward the 5+5", async () => {
  const p = await price("INFY");                                                  // ₹900
  const bad = await POST("/api/institutional-order", { counterparty_team: "TEAM-001", symbol: "INFY", side: "BUY", quantity: 50, expected_price: p + 1, idempotency_key: key() }, "INST-01");
  assert.equal(bad.data.code, "PRICE_CHANGED"); assert.match(bad.data.error, /^MARKET PRICE CHANGED/);
  // the institution BUYS from TEAM-001 → TEAM-001 SELLS 50 INFY at 900 × 0.98 = ₹882 (a typed price is ignored)
  const o = await POST("/api/institutional-order", { counterparty_team: "TEAM-001", symbol: "INFY", side: "BUY", quantity: 50, price: 1, expected_price: p, idempotency_key: key() }, "INST-01");
  ok(o); const ord = o.data.order;
  assert.equal(ord.status, "EXCHANGE_PENDING"); assert.match(ord.order_no, /^INS-\d+$/); assert.equal(ord.team_side, "SELL");
  assert.equal(num(ord.price), round2(p * 0.98)); assert.equal(num(ord.reference_price), p);
  assert.equal(num(ord.trade_value), round2(50 * p * 0.98)); assert.equal(num(ord.brokerage), round2(50 * p * 0.98 * 0.005));
  assert.equal(num(ord.brokerage_rate), 0.005); assert.equal(ord.broker, brokerOf["TEAM-001"], "the team's own broker handles it");
  assert.equal(num(ord.settlement_amount), round2(50 * p * 0.98 * 0.995));
  ok(await approve(ord.id));
  const cashBefore = num((await detail("TEAM-001")).team.cash);
  const s = await settle(ord.id);
  assert.equal(s.data.status, "BANK_SETTLED", JSON.stringify(s.data)); assert.equal(num(s.data.brokerage), round2(50 * p * 0.98 * 0.005));
  const d1 = await detail("TEAM-001");
  assert.equal(holding(d1, "INFY"), 0); assert.equal(num(d1.team.cash), round2(cashBefore + 50 * p * 0.98 * 0.995));
  assert.equal(d1.assessment.sell, 2, "a settled institutional trade counts as the team's SELL");
  assert.equal(d1.sold[0].counterparty, "Institutional investor");
  const com = (await GET("/api/commissions?page_size=50", "ADMIN")).data;
  const c = com.transactions.find((t) => t.order_no === ord.order_no);
  assert.ok(c && c.broker === brokerOf["TEAM-001"] && c.side === "SELL" && c.account_type === "INSTITUTION" && num(c.amount) === round2(50 * p * 0.98 * 0.005), JSON.stringify(c));
  assert.equal(com.reconciliation.ok, true, JSON.stringify(com.reconciliation));
  // the desk: ticket inputs, current market with institutional prices, history — no institutional cash or holdings dashboard
  const desk = (await GET("/api/institutional-portfolio", "INST-01")).data;
  assert.equal(num(desk.rules.spread_pct), 2); assert.equal(num(desk.rules.brokerage_rate), 0.005);
  const mk = desk.market.find((m) => m.symbol === "INFY");
  assert.equal(num(mk.participant_buy_price), round2(p * 1.02)); assert.equal(num(mk.participant_sell_price), round2(p * 0.98));
  assert.ok(desk.teams.length === 100 && desk.teams[0].code === "TEAM-001" && desk.teams[0].broker, "counterparty list: code, name, broker");
  assert.equal(desk.account, undefined); assert.equal(desk.holdings, undefined);
  assert.ok(desk.orders.some((r) => r.order_no === ord.order_no)); assert.equal(desk.stats.settled, 1);
  // the institution SELLS to TEAM-002 → TEAM-002 BUYS 50 INFY at 900 × 1.02 = ₹918, paying trade value + brokerage
  const before2 = await detail("TEAM-002");
  const o2 = await POST("/api/institutional-order", { counterparty_team: "TEAM-002", symbol: "INFY", side: "SELL", quantity: 50, expected_price: p, idempotency_key: key() }, "INST-01");
  ok(o2); assert.equal(num(o2.data.order.price), round2(p * 1.02)); assert.equal(o2.data.order.team_side, "BUY");
  ok(await execute(o2.data.order.id)); ok(await approve(o2.data.order.id));
  assert.equal((await settle(o2.data.order.id)).data.status, "BANK_SETTLED");
  const d2 = await detail("TEAM-002");
  assert.equal(holding(d2, "INFY"), 100); assert.equal(num(d2.team.cash), round2(num(before2.team.cash) - 50 * p * 1.02 * 1.005));
  assert.equal(d2.assessment.buy, before2.assessment.buy + 1, "a settled institutional trade counts as the team's BUY");
  // no institutional holdings restriction (the institution sold shares it never bought); the participant cannot short-sell
  const sh = await POST("/api/institutional-order", { counterparty_team: "TEAM-030", symbol: "TCS", side: "BUY", quantity: 100, expected_price: await price("TCS"), idempotency_key: key() }, "INST-01");
  assert.equal(sh.status, 409); assert.equal(sh.data.code, "SHORT_SELL_NOT_ALLOWED", "the participant cannot short-sell to the institution");
  // stale-price rule uses the market price the institutional price was derived from
  const st = await POST("/api/institutional-order", { counterparty_team: "TEAM-030", symbol: "NTPC", side: "SELL", quantity: 50, expected_price: await price("NTPC"), idempotency_key: key() }, "INST-01");
  ok(st);
  ok(await POST("/api/market-news", { symbol: "NTPC", mood: "POSITIVE", headline: "NTPC commissions a new plant" }, "ADMIN"));
  const sd = (await GET("/api/order?id=" + st.data.order.id, "ADMIN")).data.order;
  assert.equal(sd.status, "EXCHANGE_REJECTED"); assert.equal(sd.reject_code, "PRICE_STALE");
  // the Institutional desk can publish Market News too (as on Hatchable)
  ok(await POST("/api/market-news", { symbol: "NTPC", mood: "NORMAL" }, "INST-01"), "institutional Market News");
  const aud = (await GET("/api/audit?action=INSTITUTIONAL_ORDER_SUBMITTED&q=" + ord.order_no, "ADMIN")).data.rows[0];
  assert.ok(aud && num(aud.details.spread_pct) === 2 && num(aud.details.market_price) === p, JSON.stringify(aud));
  const trk = (await GET("/api/orders?page_size=100", "INST-01")).data;
  assert.ok(trk.rows.length >= 3 && trk.rows.every((r) => r.account_type === "INSTITUTION"));
  assert.equal(num(await price("INFY")), p, "institutional trades never change prices");
});

test("assessment counts only settled listed-stock BUY and SELL trades; exactly one Winner and one Runner-Up", async () => {
  for (const team of ["TEAM-011", "TEAM-012", "TEAM-013"]) {
    for (let i = 0; i < 5; i++) await fullTrade(team, "ITC", "BUY", 50);
    for (let i = 0; i < 5; i++) await fullTrade(team, "ITC", "SELL", 50);
  }
  // deploy the capital (at most 25% per company) so that each team's closing cash ends under ₹50,000 (lots of 50 shares)
  const deploy = async (team, syms) => {
    for (const sym of syms) {
      const cash = num((await detail(team)).team.cash); if (cash < 50000) break;
      const q = Math.floor(Math.min(cash - 1000, 490000) / (await price(sym) * 1.005) / 50) * 50;
      if (q >= 50) await fullTrade(team, sym, "BUY", q);
    }
  };
  await deploy("TEAM-011", ["LT", "INFY", "HDFCBANK", "SBIN", "WIPRO", "ITC", "NTPC"]);
  await deploy("TEAM-012", ["TITAN", "TCS", "BEL", "SBIN", "WIPRO", "ITC", "NTPC"]);
  await deploy("TEAM-013", ["RELIANCE", "INFY", "HDFCBANK", "NTPC", "WIPRO", "ITC", "SBIN"]);
  const d = await detail("TEAM-011");
  assert.ok(d.assessment.buy >= 9); assert.equal(d.assessment.sell, 5); assert.equal(d.assessment.met, true);
  assert.ok(num(d.team.cash) <= 50000, "cash " + d.team.cash);
  assert.equal((await detail("TEAM-005")).assessment.buy, 0, "IPO allotments never count");
  ok(await POST("/api/market-news", { symbol: "TITAN", mood: "SUPER_POSITIVE", headline: "Titan wins a global luxury deal" }, "ADMIN"));
  const p = (await GET("/api/portfolios", "ADMIN")).data;
  const eligible = p.teams.filter((t) => t.eligible).sort((a, b) => num(b.net_worth) - num(a.net_worth) || a.code.localeCompare(b.code));
  assert.deepEqual(eligible.map((t) => t.code).sort(), ["TEAM-011", "TEAM-012", "TEAM-013"]);
  assert.equal(p.teams.filter((t) => t.award === "WINNER").length, 1); assert.equal(p.teams.filter((t) => t.award === "RUNNER_UP").length, 1);
  assert.equal(p.winner.code, eligible[0].code); assert.equal(p.runner_up.code, eligible[1].code);
  assert.equal(p.winner.code, "TEAM-012");
  const win = (await GET("/api/export?sheet=winner&format=json", "ADMIN")).data;
  assert.ok(win.rows.length >= 2, "Winner / Net Worth export");
});

test("undo / redo: settlement restores cash and holdings (never prices); Market News undo restores the price", async () => {
  const pW = await price("WIPRO");
  const t = await fullTrade("TEAM-014", "WIPRO", "BUY", 100);
  assert.equal(num(t.settle.cash_after), 2000000 - 32000 - 160);
  const j = (await GET("/api/admin-state", "ADMIN")).data.journal.find((x) => x.action === "BANK_SETTLE" && x.summary.startsWith(t.order.order_no));
  assert.ok(j && j.state === "ACTIVE");
  if (!CI) assert.equal((await POST("/api/undo-redo", { action: "UNDO", journal_id: j.id }, "ADMIN")).data.code, "ADMIN_PASSWORD_REQUIRED");
  ok(await POST("/api/undo-redo", { action: "UNDO", journal_id: j.id, ...A }, "ADMIN"));
  let d = await detail("TEAM-014");
  assert.equal(num(d.team.cash), 2000000); assert.equal(holding(d, "WIPRO"), 0); assert.equal(await price("WIPRO"), pW);
  ok(await POST("/api/undo-redo", { action: "REDO", journal_id: j.id, ...A }, "ADMIN"));
  d = await detail("TEAM-014");
  assert.equal(holding(d, "WIPRO"), 100); assert.equal(num(d.team.cash), 2000000 - 32160); assert.equal(await price("WIPRO"), pW);
  const n = await POST("/api/market-news", { symbol: "DLF", mood: "NEGATIVE", headline: "DLF project delayed" }, "ADMIN"); ok(n);
  const jn = (await GET("/api/admin-state", "ADMIN")).data.journal.find((x) => x.action === "MARKET_NEWS" && x.summary.startsWith("DLF"));
  ok(await POST("/api/undo-redo", { action: "UNDO", journal_id: jn.id, ...A }, "ADMIN"));
  assert.equal(await price("DLF"), num(n.data.previous_price));
  ok(await POST("/api/undo-redo", { action: "REDO", journal_id: jn.id, ...A }, "ADMIN"));
  assert.equal(await price("DLF"), num(n.data.new_price));
});

test("ledger, commissions and exports reconcile with the live records", async () => {
  const cash = (await GET("/api/cash?page_size=10", "ADMIN")).data;
  assert.equal(cash.reconciliation.ok, true, JSON.stringify(cash.reconciliation)); assert.equal(cash.reconciliation.teams_checked, 100);
  const one = (await GET("/api/cash?team=TEAM-001&page_size=10", "ADMIN")).data.summary;
  assert.equal(round2(num(one.net_movement)), round2(num(one.credits) - num(one.debits)));
  assert.equal(num(one.current_cash), num((await detail("TEAM-001")).team.cash), "net movement of the whole ledger = current cash");
  assert.equal(round2(num(one.net_movement)), num(one.current_cash));
  assert.equal((await GET("/api/commissions?page_size=10", "ADMIN")).data.reconciliation.ok, true);
  const { checks } = await audit(new Stats(), tok.ADMIN);
  for (const c of checks) assert.ok(c.pass, c.name + " — " + c.detail);
  const trk = (await GET("/api/tracking?page_size=10", "ADMIN")).data.kpis;
  const orders = (await GET("/api/export?sheet=orders&format=json", "ADMIN")).data.rows;
  assert.equal(orders.length, trk.orders);
});

test("CLOSE (password): ₹50K closing cash rule decides eligibility; Winner and Runner-Up final", async () => {
  ok(await POST("/api/reject-open-orders", { ...A }, "ADMIN"));
  const c = await POST("/api/event", { action: "CLOSE", ...A }, "ADMIN");
  ok(c); assert.equal(c.data.status, "CLOSED");
  const p = (await GET("/api/portfolios", "ADMIN")).data;
  assert.equal(p.final, true);
  const t1 = p.teams.find((t) => t.code === "TEAM-001");
  assert.equal(t1.cash_rule_status, "NOT_SATISFIED"); assert.equal(t1.eligibility_status, "NOT ELIGIBLE");
  for (const code of ["TEAM-011", "TEAM-012", "TEAM-013"]) {
    const t = p.teams.find((x) => x.code === code);
    assert.equal(t.cash_rule_status, "SATISFIED", code); assert.equal(t.eligibility_status, "ELIGIBLE", code);
  }
  assert.equal(p.teams.filter((t) => t.award === "WINNER").length, 1); assert.equal(p.teams.filter((t) => t.award === "RUNNER_UP").length, 1);
  assert.equal(p.winner.code, "TEAM-012");
  assert.equal((await submit("TEAM-020", "TCS", "BUY", 50)).data.code, "EVENT_NOT_LIVE");
  assert.equal((await POST("/api/market-news", { symbol: "TCS", mood: "POSITIVE", headline: "x" }, "ADMIN")).data.code, "EVENT_CLOSED");
  assert.equal((await POST("/api/loan", { team: "TEAM-015", action: "DRAW", amount: 1000 }, "BANK-01")).data.code, "EVENT_NOT_OPEN", "no new loans after close");
});

test("FINALIZE and the final exports: Event Excel, Event JSON, Winner CSV, IPO allotments", async () => {
  const f = await POST("/api/event", { action: "FINALIZE", ...A }, "ADMIN");
  ok(f); assert.equal(f.data.status, "FINALIZED");
  const sheets = (await GET("/api/export?sheet=winner&format=json", "ADMIN")).data;
  assert.equal(sheets.rows.filter((r) => r[0] === "WINNER").length, 1); assert.equal(sheets.rows.filter((r) => r[0] === "RUNNER-UP").length, 1);
  const x = await GET("/api/export-event-excel", "ADMIN");
  assert.equal(x.status, 200); assert.ok(x.headers.get("content-type").includes("spreadsheetml"));
  const files = unzipSync(x.data);
  const ws = Object.keys(files).filter((k) => /^xl\/worksheets\/sheet\d+\.xml$/.test(k));
  assert.equal(ws.length, 27, "every report sheet in one workbook");
  const j = await GET("/api/export-event-json", "ADMIN");
  assert.equal(j.status, 200);
  for (const k of ["winner", "assessment", "teams", "broker_roster", "commission", "ipo_allotments", "news", "audit"]) assert.ok(j.data.sheets[k], k);
  const ev = await GET("/api/export-event-csv", "ADMIN", { text: true });
  assert.equal(ev.status, 200); assert.ok(ev.headers.get("content-type").includes("text/csv"));
  for (const t of ["FINAL EVENT CSV", "WINNER & RUNNER-UP", "ALL TRANSACTIONS (SETTLED TRADES)", "ALL ORDERS (INCLUDING REJECTED)", "CASH LEDGER", "PRICE CHANGES", "MARKET NEWS", "AUDIT LOG"])
    assert.ok(ev.data.includes(t), "final event CSV section " + t);
  const nTrades = (await GET("/api/export?sheet=trades&format=json", "ADMIN")).data.rows.length;
  assert.ok(nTrades > 0 && ev.data.includes("ALL TRANSACTIONS (SETTLED TRADES) (" + nTrades + " rows)"), "every settled trade is in the final event CSV");
  assert.equal((await GET("/api/export-event-csv", "TEAM-001")).status, 403, "participants cannot download the final event CSV");
  const csv = await GET("/api/export?sheet=winner", "ADMIN", { text: true });
  assert.equal(csv.status, 200); assert.ok(csv.data.includes("WINNER") && csv.data.includes("RUNNER-UP"));
  const allot = (await GET("/api/export?sheet=ipo_allotments&format=json", "ADMIN")).data;
  assert.deepEqual(allot.columns.slice(0, 5), ["Team", "IPO", "Lots", "Shares", "Amount"]);
  assert.ok(allot.rows.some((r) => r[0] === "TEAM-005" && r[1] === "VOLTRA" && r[2] === 2 && r[3] === 100 && num(r[4]) === 89000));
  // the market can be reopened even after FINALIZE, and finalized again
  const ro = await POST("/api/event", { action: "REOPEN", ...A }, "ADMIN"); ok(ro); assert.equal(ro.data.status, "LIVE", "REOPEN after FINALIZE");
  const pf = (await GET("/api/portfolios", "ADMIN")).data;
  assert.ok(JSON.stringify(pf).includes("PROVISIONAL"), "results are provisional again after reopening");
  ok(await POST("/api/event", { action: "CLOSE", ...A }, "ADMIN"));
  const f2 = await POST("/api/event", { action: "FINALIZE", ...A }, "ADMIN"); ok(f2); assert.equal(f2.data.status, "FINALIZED");
  tok["TEAM-012"] = await signIn("TEAM-012");
});

test("reset restores the clean starting state, keeps IPO allotments, returns IPOs to the pre-market stage", async () => {
  const r = await POST("/api/reset-event", { confirm: "RESET", keep_allotments: true, ...A }, "ADMIN");
  ok(r); assert.equal(r.data.kept_ipo_allotments, 3);
  const p = (await GET("/api/portfolios", "ADMIN")).data;
  assert.ok(p.teams.filter((t) => !["TEAM-005", "TEAM-006"].includes(t.code)).every((t) => num(t.cash) === 2000000 && num(t.holdings_value) === 0));
  assert.equal(num(p.teams.find((t) => t.code === "TEAM-006").cash), 2000000 - 200 * 710);
  const m = await market();
  assert.ok([...m.stocks, ...m.ipos].every((s) => num(s.price) === num(s.base_price)));
  assert.ok(m.ipos.every((i) => !i.listed)); assert.equal(m.index.components, 50); assert.equal(num(m.index.change_pct), 0);
  assert.deepEqual(m.board.ipo_market, ["VOLTRA", "BLUEAI", "SHREEB", "AAROGYA"]);
  assert.equal((await GET("/api/tracking", "ADMIN")).data.kpis.orders, 0);
  assert.equal((await GET("/api/tracking", "ADMIN")).data.kpis.orders, 0);
  assert.equal((await GET("/api/institutional-portfolio", "ADMIN")).data.stats.transactions, 0);
});

test("cleanup: clean event, no allotments, original event start", async () => {
  if (S.origStart) ok(await POST("/api/config", { event_start_at: S.origStart, ...A }, "ADMIN"));
  ok(await POST("/api/reset-event", { confirm: "RESET", keep_allotments: false, ...A }, "ADMIN"));
  assert.equal((await GET("/api/event-status")).data.status, "NOT_STARTED");
});
