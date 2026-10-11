// End-to-end API tests for the v311 rules:
//   participant instruction → broker submission → Pit Manager execution (one trading slip) → Exchange review
//   → Bank settlement → cash / holdings updated; prices change only through Event Admin Market News.
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
const execute = (id, who = "PIT-01") => POST("/api/pit", { order_id: id, action: "EXECUTE" }, who);
const approve = (id, extra = {}) => POST("/api/exchange", { order_id: id, action: "APPROVE", ...extra }, "EXCHANGE-01");
const settle = (id, who = "BANK-01") => POST("/api/bank", { order_id: id, action: "SETTLE" }, who);
async function fullTrade(team, symbol, side, quantity) {
  const o = await submit(team, symbol, side, quantity); ok(o, "submit " + team + " " + side + " " + symbol);
  const id = o.data.order.id;
  const x = await execute(id); ok(x, "execute");
  const a = await approve(id, { confirm_short_sell: true }); ok(a, "approve");
  const s = await settle(id); ok(s, "settle");
  return { id, order: o.data.order, slip: x.data.slip_no, settle: s.data };
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
  ok(await POST("/api/ipo-applications", { action: "CLEAR", ...A }, "ADMIN"));
  ok(await POST("/api/config", { brokerage_rate: 0.005, loan_interest_rate: 0.02, initial_capital: 2000000, loan_max_principal: 500000,
    min_order_value: 0, max_order_value: 2500000, cash_rule_limit: 50000, min_buy_trades: 5, min_sell_trades: 5, max_price_move_pct: 10,
    ipo_application_hours: 24, loans_enabled: true, auto_loan_on_settlement: true, loan_repayment_required: true, auto_list_ipos: true,
    institution_overdraft: true, institution_brokerage: false, ...A }, "ADMIN"), "standard rules");
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
  assert.equal((await GET("/api/pit", "TEAM-001")).status, 403);
  assert.equal((await GET("/api/exchange", "TEAM-001")).status, 403);
  assert.equal((await GET("/api/bank", "TEAM-001")).status, 403);
  assert.equal((await GET("/api/audit", "TEAM-001")).status, 403);
  assert.equal((await GET("/api/insights", "TEAM-001")).status, 403, "Market Intelligence lives in Event Admin only");
  assert.equal((await GET("/api/commissions", "TEAM-001")).status, 403);
  const exp = await api("GET", "/api/export-event-excel", undefined, "TEAM-001");
  assert.equal(exp.status, 403);
});

test("security: unauthenticated and wrong-role calls are refused server-side", async () => {
  for (const p of ["/api/portfolios", "/api/admin-state", "/api/insights", "/api/pit", "/api/audit", "/api/cash", "/api/team-names"]) assert.equal((await GET(p)).status, 401, p);
  assert.equal((await POST("/api/event", { action: "START" })).status, 401);
  assert.equal((await POST("/api/event", { action: "START", ...A }, "PIT-01")).status, 403);
  assert.equal((await POST("/api/bank", { order_id: 1, action: "SETTLE" }, "EXCHANGE-01")).status, 403);
  assert.equal((await POST("/api/pit", { order_id: 1, action: "EXECUTE" }, "BROKER-01")).status, 403);
  assert.equal((await POST("/api/exchange", { order_id: 1, action: "APPROVE" }, "PIT-01")).status, 403);
  for (const who of ["BANK-01", "INST-01", "BROKER-01", "PIT-01", "EXCHANGE-01", "TEAM-001", "FACULTY-01"]) {
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
  const aud = (await GET("/api/audit?action=CONFIG_UPDATED", "ADMIN")).data.rows[0];
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

test("IPO window opens exactly 48 hours before the event start; applications, prospectus", async () => {
  let ipo = (await GET("/api/ipo")).data;
  assert.equal(new Date(ipo.window.opens_at).getTime(), new Date(ipo.event_start_at).getTime() - 48 * 3600e3, "opens 48 h before the event start");
  // open the window now: event start in 47 hours
  const start = new Date(Date.now() + 47 * 3600e3).toISOString();
  ok(await POST("/api/config", { event_start_at: start, ...A }, "ADMIN"));
  ipo = (await GET("/api/ipo")).data;
  assert.equal(ipo.window.phase, "OPEN");
  assert.equal(new Date(ipo.window.opens_at).getTime(), new Date(start).getTime() - 48 * 3600e3);
  assert.ok(ipo.ipos.every((i) => i.stage === "APPLICATION_OPEN"), JSON.stringify(ipo.ipos.map((i) => i.stage)));
  assert.equal(ipo.ipos.length, 4); assert.ok(ipo.ipos.every((i) => i.lot_size === 50 && num(i.issue_price) === ISSUE[i.symbol]));
  // prospectus: public read, administrator edit (organiser content only; the test restores what it touches)
  const target = ipo.ipos.find((i) => !i.prospectus.has_document && !i.prospectus.document_url &&
    ["company_description", "issue_details", "business_overview", "financial_information", "risk_factors", "use_of_proceeds", "promoters_management", "other_information"].every((f) => !i.prospectus[f]));
  if (target) {
    const pdf = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n").toString("base64");
    ok(await POST("/api/ipo-prospectus", { ipo: target.symbol, company_description: "Test description (automated test)", document: { name: "test.pdf", data_base64: pdf } }, "ADMIN"));
    assert.equal((await POST("/api/ipo-prospectus", { ipo: target.symbol, company_description: "x" }, "TEAM-001")).status, 403);
    const pub = (await GET("/api/ipo")).data.ipos.find((i) => i.symbol === target.symbol);
    assert.equal(pub.prospectus.company_description, "Test description (automated test)"); assert.equal(pub.prospectus.has_document, true);
    const doc = await GET("/api/ipo-document?symbol=" + target.symbol);
    assert.equal(doc.status, 200); assert.equal(Buffer.from(doc.data).subarray(0, 5).toString(), "%PDF-");
    assert.equal((await POST("/api/ipo-prospectus", { ipo: target.symbol, document: { name: "x.pdf", data_base64: Buffer.from("not a pdf").toString("base64") } }, "ADMIN")).data.code, "NOT_A_PDF");
    ok(await POST("/api/ipo-prospectus", { ipo: target.symbol, company_description: "", remove_document: true }, "ADMIN"), "restore the prospectus");
    assert.equal((await GET("/api/ipo-document?symbol=" + target.symbol)).status, 404);
  }
  // participant applications (IPO lots are separate from the CMS stock lots)
  const ap = await POST("/api/ipo-applications", { ipo: "VOLTRA", lots: 2 }, "TEAM-001");
  ok(ap); assert.equal(num(ap.data.application.amount), 2 * 50 * 890);
  ok(await POST("/api/ipo-applications", { ipo: "IPO-02", lots: 1 }, "TEAM-002"));
  assert.equal((await POST("/api/ipo-applications", { ipo: "VOLTRA", lots: 1000 }, "TEAM-001")).data.code, "APPLICATION_CASH");
  const mine = (await GET("/api/ipo-mine", "TEAM-001")).data.items.find((i) => i.symbol === "VOLTRA");
  assert.equal(mine.application.lots, 2);
  const sum = (await GET("/api/ipo-applications", "ADMIN")).data.summary.find((x) => x.symbol === "VOLTRA");
  assert.equal(sum.teams, 1); assert.equal(sum.lots, 2);
  // with portal applications, an allotment cannot exceed what the team applied for
  const over = await POST("/api/ipo-allotments", { rows: [{ team: "TEAM-001", ipo: "VOLTRA", lots: 3 }], dry_run: true }, "ADMIN");
  assert.equal(over.status, 400); assert.equal(over.data.code, "ALLOTMENT_ERRORS");
  // window not open yet (event start 72 h away) → applications refused
  ok(await POST("/api/config", { event_start_at: new Date(Date.now() + 72 * 3600e3).toISOString(), ...A }, "ADMIN"));
  const closed = await POST("/api/ipo-applications", { ipo: "VOLTRA", lots: 1 }, "TEAM-001");
  assert.equal(closed.status, 409); assert.equal(closed.data.code, "IPO_WINDOW_CLOSED");
  ok(await POST("/api/config", { event_start_at: S.origStart, ...A }, "ADMIN"), "restore the event start");
  ok(await POST("/api/ipo-applications", { action: "CLEAR", ...A }, "ADMIN"));
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

test("a participant cannot place an exchange order; it instructs its assigned broker", async () => {
  const direct = await POST("/api/orders", { team: "TEAM-001", symbol: "INFY", side: "BUY", quantity: 100, idempotency_key: key() }, "TEAM-001");
  assert.equal(direct.status, 403); assert.equal(direct.data.code, "PARTICIPANT_ENTRY_DISABLED");
  const ins = await POST("/api/instructions", { symbol: "INFY", side: "BUY", quantity: 100, note: "Buy before the results", idempotency_key: key() }, "TEAM-001");
  ok(ins); S.ins = ins.data.instruction.instruction_no;
  assert.match(S.ins, /^REQ-\d{6}$/);
  const desk = (await GET("/api/broker-desk", brokerOf["TEAM-001"])).data;
  assert.ok(desk.instructions.some((i) => i.instruction_no === S.ins && i.status === "OPEN"));
  const other = BROKERS.find((b) => b !== brokerOf["TEAM-001"]);
  assert.ok(!(await GET("/api/broker-desk", other)).data.instructions.some((i) => i.instruction_no === S.ins), "other brokers do not see it");
  const steal = await POST("/api/orders", { instruction_no: S.ins, idempotency_key: key() }, other);
  assert.equal(steal.status, 403); assert.equal(steal.data.code, "NOT_YOUR_TEAM");
  const mismatch = await POST("/api/orders", { instruction_no: S.ins, quantity: 50, idempotency_key: key() }, brokerOf["TEAM-001"]);
  assert.equal(mismatch.data.code, "INSTRUCTION_MISMATCH");
  const o = await POST("/api/orders", { instruction_no: S.ins, expected_price: 900, idempotency_key: key() }, brokerOf["TEAM-001"]);
  ok(o, "broker submits the instruction");
  assert.equal(o.data.order.status, "PIT_PENDING"); assert.equal(num(o.data.order.price), 900); assert.equal(o.data.order.instruction_no, S.ins);
  assert.equal(num(o.data.order.brokerage_rate), 0.005);
  assert.match(o.data.order.order_no, /^ORD-\d{6}$/);
  S.o1 = o.data.order;
  const list = (await GET("/api/instructions", "TEAM-001")).data;
  assert.equal((list.instructions || list.rows || []).find((i) => i.instruction_no === S.ins).status, "SUBMITTED");
  assert.equal((await POST("/api/orders", { instruction_no: S.ins, idempotency_key: key() }, brokerOf["TEAM-001"])).data.code, "INSTRUCTION_NOT_OPEN");
  // the participant can cancel an open instruction; the broker can decline one (with a reason)
  const i2 = await POST("/api/instructions", { symbol: "TCS", side: "BUY", quantity: 50, idempotency_key: key() }, "TEAM-001"); ok(i2);
  ok(await POST("/api/instructions", { action: "CANCEL", instruction_no: i2.data.instruction.instruction_no }, "TEAM-001"));
  const i3 = await POST("/api/instructions", { symbol: "TCS", side: "BUY", quantity: 50, idempotency_key: key() }, "TEAM-001"); ok(i3);
  assert.equal((await POST("/api/instructions", { action: "DECLINE", instruction_no: i3.data.instruction.instruction_no }, brokerOf["TEAM-001"])).data.code, "REASON_REQUIRED");
  ok(await POST("/api/instructions", { action: "DECLINE", instruction_no: i3.data.instruction.instruction_no, reason: "Price moved; call me" }, brokerOf["TEAM-001"]));
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
  // clean-up: the Pit Manager rejects the TCS order (a reason is required)
  assert.equal((await POST("/api/pit", { order_id: manual.data.order.id, action: "REJECT" }, "PIT-01")).data.code, "REASON_REQUIRED");
  const rj = await POST("/api/pit", { order_id: manual.data.order.id, action: "REJECT", reason: "Participant withdrew at the pit" }, "PIT-01");
  ok(rj); assert.equal(rj.data.status, "PIT_REJECTED");
});

test("Pit Manager execution: one immutable trading slip per order", async () => {
  const q = (await GET("/api/pit", "PIT-01")).data;
  assert.ok(q.pending.some((o) => o.id === S.o1.id && o.stale === false));
  assert.equal((await approve(S.o1.id)).data.code, "NOT_EXECUTED", "the Exchange cannot act before execution");
  const x = await execute(S.o1.id);
  ok(x); assert.equal(x.data.status, "EXCHANGE_PENDING"); assert.match(x.data.slip_no, /^TS-\d{6}$/);
  S.slip1 = x.data.slip_no;
  const again = await execute(S.o1.id, "PIT-02");
  assert.equal(again.status, 409); assert.equal(again.data.code, "ORDER_NOT_PENDING"); assert.ok(again.data.error.includes(S.slip1));
  // two Pit Managers pressing EXECUTE together on the same order: exactly one slip
  const res = await Promise.all(Array.from({ length: 6 }, (_, i) => execute(S.o2.id, i % 2 ? "PIT-02" : "PIT-01")));
  assert.equal(res.filter((r) => r.status === 200).length, 1, res.map((r) => r.status + ":" + (r.data.code || "")).join(","));
  const slip = (await GET("/api/slip?order_no=" + S.o2.order_no, "ADMIN")).data.slip;
  assert.equal(slip.order_no, S.o2.order_no);
  const all = (await GET("/api/slips?q=" + S.o2.order_no, "ADMIN")).data;
  assert.equal(all.total, 1, "one slip for the order");
  // the participant sees its own slip; another team does not
  const s1 = (await GET("/api/slip?slip_no=" + S.slip1, "TEAM-001")).data.slip;
  assert.equal(s1.team, "TEAM-001"); assert.equal(s1.broker, brokerOf["TEAM-001"]); assert.equal(num(s1.price), 900); assert.equal(s1.quantity, 100);
  assert.equal(num(s1.trade_value), 90000); assert.equal(num(s1.brokerage_rate), 0.005); assert.equal(num(s1.brokerage), 450); assert.equal(num(s1.settlement_value), 90450);
  assert.equal(s1.executed_by, "PIT-01"); assert.equal(s1.instruction_no, S.ins); assert.equal(s1.exchange_status, "PENDING"); assert.equal(s1.bank_status, "WAITING");
  assert.equal((await GET("/api/slip?slip_no=" + S.slip1, "TEAM-002")).status, 403);
  assert.ok((await GET("/api/slips", "TEAM-001")).data.rows.every((r) => r.team === "TEAM-001"));
});

test("Exchange receives the executed order; the Bank settles it — cash, holdings, brokerage; the price is not touched", async () => {
  const before = await sec("INFY"), idx0 = (await market()).index;
  const ex = (await GET("/api/exchange", "EXCHANGE-01")).data;
  const row = ex.pending.find((o) => o.id === S.o1.id);
  assert.ok(row, "the executed order is in the Exchange queue"); assert.equal(row.slip_no, S.slip1); assert.equal(row.executed_by, "PIT-01");
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
  // the same transaction everywhere: tracking (six steps), slip, commission, cash ledger, audit log
  const det = (await GET("/api/order?id=" + S.o1.id, "TEAM-001")).data;
  assert.deepEqual(det.flow.map((f) => f.step), ["INSTRUCTION", "BROKER_SUBMISSION", "PIT_EXECUTION", "EXCHANGE_REVIEW", "BANK_SETTLEMENT", "UPDATES"]);
  assert.ok(det.flow.every((f) => f.state === "DONE" && f.at), JSON.stringify(det.flow.map((f) => f.step + ":" + f.state)));
  assert.equal(det.assessment.counts, true);
  const trk = (await GET("/api/orders", "TEAM-001")).data;
  assert.ok(trk.rows.find((o) => o.id === S.o1.id && o.status === "BANK_SETTLED" && o.slip_no === S.slip1));
  const slip = (await GET("/api/slip?slip_no=" + S.slip1, "TEAM-001")).data.slip;
  assert.equal(slip.exchange_status, "APPROVED"); assert.equal(slip.bank_status, "SETTLED");
  const com = (await GET("/api/commissions?page_size=50", "ADMIN")).data;
  const c = com.transactions.find((t) => t.order_no === S.o1.order_no);
  assert.ok(c); assert.equal(c.broker, brokerOf["TEAM-001"]); assert.equal(num(c.amount), 450); assert.equal(num(c.rate), 0.005); assert.equal(c.status, "SETTLED");
  assert.equal(com.reconciliation.ok, true);
  const led = (await GET("/api/cash?team=TEAM-001", "ADMIN")).data.rows.filter((x) => x.order_no === S.o1.order_no);
  assert.deepEqual(led.map((x) => x.type).sort(), ["BROKERAGE", "BUY"]);
  const aud = (await GET("/api/audit?page_size=100&q=" + S.o1.order_no, "ADMIN")).data.rows.map((x) => x.action);
  for (const want of ["ORDER_SUBMITTED", "PIT_EXECUTED", "EXCHANGE_APPROVED", "BANK_SETTLED"]) assert.ok(aud.includes(want), want + " in " + aud.join(","));
  const insAudit = (await GET("/api/audit?action=INSTRUCTION_CREATED&q=" + S.ins, "ADMIN")).data.rows;
  assert.equal(insAudit.length, 1);
});

test("duplicate settlement is blocked (sequential and concurrent)", async () => {
  ok(await approve(S.o2.id));
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

test("short selling: flagged at submission, Exchange confirmation, Bank rejects", async () => {
  const o = await submit("TEAM-003", "TCS", "SELL", 100);
  ok(o); assert.ok(o.data.warnings.some((w) => w.code === "SHORT_SELL"));
  ok(await execute(o.data.order.id));
  const no = await approve(o.data.order.id);
  assert.equal(no.status, 409); assert.equal(no.data.code, "SHORT_SELL_CONFIRM_REQUIRED");
  ok(await approve(o.data.order.id, { confirm_short_sell: true }));
  const s = await settle(o.data.order.id);
  ok(s); assert.equal(s.data.status, "BANK_REJECTED"); assert.equal(s.data.code, "SHORT_SELLING_NOT_ALLOWED");
  const d = await detail("TEAM-003");
  assert.equal(d.team.short_sell_attempts, 1, "one attempt per order"); assert.equal(d.short_sell_history.length, 1);
  assert.equal(num(d.team.cash), 2000000); assert.equal(d.assessment.sell, 0, "rejected orders do not count");
});

test("cash shortfall attempt and insufficient-balance rejection", async () => {
  // 9,400 ITC = ₹24,91,000 + ₹12,455 brokerage > ₹20 L cash + ₹5 L loan room
  const o = await submit("TEAM-004", "ITC", "BUY", 9400);
  ok(o); assert.ok(o.data.warnings.some((w) => w.code === "CASH_SHORTFALL"), JSON.stringify(o.data.warnings));
  ok(await execute(o.data.order.id)); ok(await approve(o.data.order.id));
  const s = await settle(o.data.order.id);
  assert.equal(s.data.status, "BANK_REJECTED"); assert.equal(s.data.code, "INSUFFICIENT_BALANCE");
  const d = await detail("TEAM-004");
  assert.equal(d.team.cash_shortfall_attempts, 1); assert.equal(d.team.insufficient_balance_rejections, 1);
  assert.equal(num(d.team.cash), 2000000); assert.equal(num(d.loan?.original_principal || 0), 0, "no loan drawn for a rejected order");
});

test("loans: shortfall-only automatic draw, 2% interest, ₹5 L limit, interest first, fresh interest, full repayment", async () => {
  // 700 LT = ₹20,28,600 + ₹10,143 → shortfall ₹38,743 borrowed automatically; interest 2% = ₹774.86
  const { settle: s } = await fullTrade("TEAM-008", "LT", "BUY", 700);
  assert.equal(s.status, "BANK_SETTLED"); assert.equal(num(s.loan_drawn), 38743); assert.equal(num(s.loan_interest), 774.86); assert.equal(num(s.cash_after), 0);
  let d = await detail("TEAM-008");
  assert.equal(num(d.loan.original_principal), 38743); assert.equal(num(d.loan.interest), 774.86);
  assert.equal(num(d.team.net_worth), 700 * 2898, "loans are not deducted from Net Worth");
  assert.ok(d.eligibility.gaps.includes("Loan not fully repaid"));
  const led = (await GET("/api/cash?team=TEAM-008", "ADMIN")).data.rows.map((x) => x.type);
  assert.ok(led.includes("LOAN_DRAW") && led.includes("INTEREST_CHARGE"));
  // Bank draw within the limit (no cash buffer rule), then over the limit
  const draw = await POST("/api/loan", { team: "TEAM-008", action: "DRAW", amount: 100000 }, "BANK-01");
  ok(draw); assert.equal(num(draw.data.interest_charged), 2000); assert.equal(num(draw.data.cash), 100000);
  const tooMuch = await POST("/api/loan", { team: "TEAM-008", action: "DRAW", amount: 400000 }, "BANK-01");
  assert.equal(tooMuch.status, 409); assert.equal(tooMuch.data.code, "LOAN_LIMIT");
  assert.equal((await POST("/api/loan", { team: "TEAM-008", action: "REPAY", amount: 110000 }, "BANK-01")).data.code, "REPAYMENT_CASH_LIMIT");
  assert.equal((await POST("/api/loan", { team: "TEAM-008", action: "DRAW", amount: 1000 }, "EXCHANGE-01")).status, 403);
  // partial repayment: interest first (774.86 + 2,000), then principal; fresh 2% on the principal that remains
  const rep = await POST("/api/loan", { team: "TEAM-008", action: "REPAY", amount: 50000 }, "BANK-01");
  ok(rep);
  assert.equal(num(rep.data.interest_paid), 2774.86); assert.equal(num(rep.data.principal_paid), 47225.14);
  assert.equal(num(rep.data.fresh_interest), round2((138743 - 47225.14) * 0.02));
  d = await detail("TEAM-008");
  assert.equal(num(d.loan.current_principal), round2(138743 - 47225.14)); assert.equal(num(d.loan.interest), round2((138743 - 47225.14) * 0.02));
  assert.equal(num(d.loan.original_principal), 138743, "original principal keeps the total drawn");
  // raise cash by selling, then repay the whole liability → eligible on the loan rule
  await fullTrade("TEAM-008", "LT", "SELL", 100);
  d = await detail("TEAM-008");
  const due = num(d.loan.total_liability);
  const full = await POST("/api/loan", { team: "TEAM-008", action: "REPAY", amount: due }, "BANK-01");
  ok(full); assert.equal(num(full.data.fresh_interest), 0);
  d = await detail("TEAM-008");
  assert.equal(num(d.loan.total_liability), 0); assert.equal(d.loan.repayment_status, "REPAID");
  assert.ok(!d.eligibility.gaps.includes("Loan not fully repaid"));
  assert.equal((await POST("/api/loan", { team: "TEAM-008", action: "REPAY", amount: 10 }, "BANK-01")).data.code, "NO_LOAN");
});

test("stale-price rule: Market News after submission makes the order PRICE STALE; settlement never writes a price", async () => {
  const o = await submit("TEAM-009", "HDFCBANK", "BUY", 50);
  ok(o); assert.equal(num(o.data.order.price), 719);
  const n = await POST("/api/market-news", { symbol: "HDFCBANK", mood: "VERY_SEVERE", headline: "HDFC Bank faces a regulatory penalty" }, "ADMIN");
  ok(n); assert.ok(n.data.stale_orders >= 1);
  const det = (await GET("/api/order?id=" + o.data.order.id, "ADMIN")).data.order;
  assert.equal(det.status, "PIT_REJECTED"); assert.equal(det.reject_code, "PRICE_STALE");
  const x = await execute(o.data.order.id);
  assert.equal(x.status, 409, "a stale order cannot be executed at the old price");
  // an order already executed keeps its executed price; Market News in between does not change it
  const e = await submit("TEAM-010", "SBIN", "BUY", 50);
  ok(e); ok(await execute(e.data.order.id));
  const n2 = await POST("/api/market-news", { symbol: "SBIN", mood: "POSITIVE", headline: "SBI posts record profit" }, "ADMIN");
  ok(n2); assert.equal(n2.data.stale_orders, 0, "executed orders are not stale");
  ok(await approve(e.data.order.id));
  const s = await settle(e.data.order.id);
  assert.equal(s.data.status, "BANK_SETTLED"); assert.equal(num(s.data.trade_value), 50 * 962);
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

test("institutional orders: counterparty team, market price, Pit Manager → Exchange → Bank, slip issued", async () => {
  const p = await price("INFY");
  const bad = await POST("/api/institutional-order", { counterparty_team: "TEAM-001", symbol: "INFY", side: "BUY", quantity: 50, expected_price: p + 1, idempotency_key: key() }, "INST-01");
  assert.equal(bad.data.code, "PRICE_CHANGED");
  const o = await POST("/api/institutional-order", { counterparty_team: "TEAM-001", symbol: "INFY", side: "BUY", quantity: 50, price: 1, expected_price: p, idempotency_key: key() }, "INST-01");
  ok(o); assert.equal(o.data.order.status, "PIT_PENDING"); assert.equal(num(o.data.order.price), p); assert.match(o.data.order.order_no, /^INS-/);
  const x = await execute(o.data.order.id); ok(x); assert.ok(x.data.slip_no);
  ok(await approve(o.data.order.id));
  const s = await settle(o.data.order.id);
  assert.equal(s.data.status, "BANK_SETTLED", JSON.stringify(s.data)); assert.equal(num(s.data.brokerage), 0);
  const inst = (await GET("/api/institutional-portfolio", "INST-01")).data;
  assert.equal(inst.holdings.find((h) => h.symbol === "INFY").quantity, 50); assert.equal(num(inst.account.cash), 20000000 - 50 * p);
  assert.ok(inst.teams.length === 100 && inst.teams[0].code === "TEAM-001", "counterparty list (code and name only)");
  const d1 = await detail("TEAM-001");
  assert.equal(holding(d1, "INFY"), 0); assert.equal(d1.assessment.sell, 1, "institutional trades do not count for the team");
  const o2 = await POST("/api/institutional-order", { counterparty_team: "TEAM-002", symbol: "INFY", side: "SELL", quantity: 50, expected_price: p, idempotency_key: key() }, "INST-01");
  ok(o2); ok(await execute(o2.data.order.id)); ok(await approve(o2.data.order.id));
  assert.equal((await settle(o2.data.order.id)).data.status, "BANK_SETTLED");
  assert.equal(holding(await detail("TEAM-002"), "INFY"), 100);
  const trk = (await GET("/api/orders?page_size=100", "INST-01")).data;
  assert.ok(trk.rows.length >= 2 && trk.rows.every((r) => r.account_type === "INSTITUTION"));
  assert.equal(num((await price("INFY"))), p, "institutions never change prices");
});

test("assessment counts only settled listed-stock BUY and SELL trades; exactly one Winner and one Runner-Up", async () => {
  for (const team of ["TEAM-011", "TEAM-012", "TEAM-013"]) {
    for (let i = 0; i < 5; i++) await fullTrade(team, "ITC", "BUY", 50);
    for (let i = 0; i < 5; i++) await fullTrade(team, "ITC", "SELL", 50);
  }
  // deploy the capital so that each team's closing cash ends under ₹50,000 (lots of 50 shares)
  await fullTrade("TEAM-011", "LT", "BUY", 650); await fullTrade("TEAM-011", "ITC", "BUY", 250);
  await fullTrade("TEAM-012", "TITAN", "BUY", 550); await fullTrade("TEAM-012", "ITC", "BUY", 100);
  await fullTrade("TEAM-013", "RELIANCE", "BUY", 650); await fullTrade("TEAM-013", "ITC", "BUY", 300);
  const d = await detail("TEAM-011");
  assert.equal(d.assessment.buy, 7); assert.equal(d.assessment.sell, 5); assert.equal(d.assessment.met, true);
  assert.equal(num(d.team.cash), round2(2000000 - 5 * 132.5 - (650 * 2898 * 1.005) - (250 * 265 * 1.005)));
  assert.ok(num(d.team.cash) <= 50000);
  assert.equal((await detail("TEAM-005")).assessment.buy, 0, "IPO allotments never count");
  ok(await POST("/api/market-news", { symbol: "TITAN", mood: "SUPER_POSITIVE", headline: "Titan wins a global luxury deal" }, "ADMIN"));
  const p = (await GET("/api/portfolios", "ADMIN")).data;
  const eligible = p.teams.filter((t) => t.eligible).sort((a, b) => num(b.net_worth) - num(a.net_worth) || a.code.localeCompare(b.code));
  assert.deepEqual(eligible.map((t) => t.code).sort(), ["TEAM-011", "TEAM-012", "TEAM-013"]);
  assert.equal(p.teams.filter((t) => t.award === "WINNER").length, 1); assert.equal(p.teams.filter((t) => t.award === "RUNNER_UP").length, 1);
  assert.equal(p.winner.code, eligible[0].code); assert.equal(p.runner_up.code, eligible[1].code);
  assert.equal(p.winner.code, "TEAM-012");
  const cert = (await GET("/api/certificates", "ADMIN")).data.ranking;
  assert.equal(cert.filter((r) => r.award === "WINNER").length, 1); assert.equal(cert.filter((r) => r.award === "RUNNER_UP").length, 1);
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

test("concurrent settlements for one team: loans drawn exactly as needed, balance never breaks", async () => {
  const ids = [];
  for (let i = 0; i < 10; i++) {
    const o = await submit("TEAM-015", "ITC", "BUY", 1000);            // ₹2,65,000 + ₹1,325 each
    ok(o); ids.push(o.data.order.id);
  }
  for (const id of ids) ok(await execute(id));
  for (const id of ids) ok(await approve(id));
  const res = await Promise.all(ids.map((id, i) => settle(id, i % 2 ? "BANK-01" : "BANK-01")));
  const settled = res.filter((r) => r.data.status === "BANK_SETTLED").length;
  assert.equal(settled, 9, res.map((r) => r.data.status + ":" + (r.data.code || "")).join(","));
  const d = await detail("TEAM-015");
  assert.equal(holding(d, "ITC"), 9000); assert.ok(num(d.team.cash) >= 0);
  assert.equal(num(d.loan.original_principal), 9 * 266325 - 2000000); assert.equal(num(d.loan.interest), round2((9 * 266325 - 2000000) * 0.02));
  const cash = (await GET("/api/cash?team=TEAM-015", "ADMIN")).data;
  assert.equal(cash.reconciliation.ok, true);
});

test("ledger, commissions and exports reconcile with the live records", async () => {
  const cash = (await GET("/api/cash?page_size=10", "ADMIN")).data;
  assert.equal(cash.reconciliation.ok, true, JSON.stringify(cash.reconciliation)); assert.equal(cash.reconciliation.teams_checked, 100);
  assert.equal((await GET("/api/commissions?page_size=10", "ADMIN")).data.reconciliation.ok, true);
  const { checks } = await audit(new Stats(), tok.ADMIN);
  for (const c of checks) assert.ok(c.pass, c.name + " — " + c.detail);
  const trk = (await GET("/api/tracking?page_size=10", "ADMIN")).data.kpis;
  const orders = (await GET("/api/export?sheet=orders&format=json", "ADMIN")).data.rows;
  assert.equal(orders.length, trk.orders);
  const slips = (await GET("/api/export?sheet=slips&format=json", "ADMIN")).data.rows;
  assert.equal(slips.length, trk.executed);
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
  assert.equal(ws.length, 30, "every report sheet in one workbook");
  const j = await GET("/api/export-event-json", "ADMIN");
  assert.equal(j.status, 200);
  for (const k of ["winner", "assessment", "teams", "broker_roster", "slips", "instructions", "commission", "ipo_allotments", "ipo_applications", "news", "audit"]) assert.ok(j.data.sheets[k], k);
  const csv = await GET("/api/export?sheet=winner", "ADMIN", { text: true });
  assert.equal(csv.status, 200); assert.ok(csv.data.includes("WINNER") && csv.data.includes("RUNNER-UP"));
  const allot = (await GET("/api/export?sheet=ipo_allotments&format=json", "ADMIN")).data;
  assert.deepEqual(allot.columns.slice(0, 5), ["Team", "IPO", "Lots", "Shares", "Amount"]);
  assert.ok(allot.rows.some((r) => r[0] === "TEAM-005" && r[1] === "VOLTRA" && r[2] === 2 && r[3] === 100 && num(r[4]) === 89000));
  tok["TEAM-012"] = await signIn("TEAM-012");
  const sc = (await GET("/api/share-certificates?team=TEAM-001", "TEAM-012")).data;          // a participant always gets its own team
  assert.equal(sc.team.code, "TEAM-012"); assert.ok(sc.certificates.some((c) => c.symbol === "TITAN" && c.quantity === 550));
  assert.equal((await GET("/api/share-certificates?team=TEAM-012", brokerOf["TEAM-001"] === brokerOf["TEAM-012"] ? BROKERS.find((b) => b !== brokerOf["TEAM-012"]) : brokerOf["TEAM-001"])).status, 403);
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
  assert.equal((await GET("/api/slips", "ADMIN")).data.total, 0);
  assert.equal(num((await GET("/api/institutional-portfolio", "ADMIN")).data.account.cash), 20000000);
});

test("cleanup: clean event, no allotments, original event start", async () => {
  if (S.origStart) ok(await POST("/api/config", { event_start_at: S.origStart, ...A }, "ADMIN"));
  ok(await POST("/api/reset-event", { confirm: "RESET", keep_allotments: false, ...A }, "ADMIN"));
  assert.equal((await GET("/api/event-status")).data.status, "NOT_STARTED");
});
