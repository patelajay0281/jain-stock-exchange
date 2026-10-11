// IPO listing (IPO market → listed market and CMS INDEX, exactly once), password change and console bootstrap.
//   BASE=http://127.0.0.1:8788 [PGURL=postgres://postgres@127.0.0.1:5433/jse] node --test tests/listing.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { signIn } from "./lib/client.mjs";

const BASE = (process.env.BASE || "http://127.0.0.1:8788").replace(/\/$/, "");
const PGURL = process.env.PGURL || "";
const CI = !!(process.env.ACTIONS_ID_TOKEN_REQUEST_URL || process.env.CI_OIDC_TOKEN);   // staging: OIDC sign-in, no known passwords
const A = { admin_password: process.env.PW_ADMIN || "admin-pass-1" };
const USERS = ["ADMIN", "PIT-01", "EXCHANGE-01", "BANK-01", "FACULTY-01", "TEAM-002"];
const tok = {};
const brokerOf = {};
const randomPw = () => "t-" + randomUUID().slice(0, 18);
async function api(method, path, body, who) {
  const headers = { accept: "application/json" };
  if (body !== undefined) headers["content-type"] = "application/json";
  if (who) headers.authorization = "Bearer " + tok[who];
  const r = await fetch(BASE + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: r.status, data: await r.json() };
}
const GET = (p, w) => api("GET", p, undefined, w);
const POST = (p, b, w) => api("POST", p, b, w);
const ok = (r, msg) => assert.equal(r.status, 200, (msg ? msg + ": " : "") + JSON.stringify(r.data).slice(0, 500));
const num = Number;
const ipo = async (sym) => (await GET("/api/market")).data.ipos.find((x) => x.symbol === sym);
const listing = async (who = "ADMIN") => (await GET("/api/admin-state", who)).data.ipo_listing;
async function submit(team, sym, side, qty, extra = {}) {
  const s = await ipo(sym);
  return POST("/api/orders", { team, symbol: sym, side, quantity: qty, expected_price: s.price, idempotency_key: randomUUID(), ...extra }, brokerOf[team]);
}
async function trade(team, sym, side, qty) {
  const o = await submit(team, sym, side, qty); ok(o, "submit");
  ok(await POST("/api/pit", { order_id: o.data.order.id, action: "EXECUTE" }, "PIT-01"), "execute");
  ok(await POST("/api/exchange", { order_id: o.data.order.id, action: "APPROVE", confirm_short_sell: true }, "EXCHANGE-01"), "approve");
  const s = await POST("/api/bank", { order_id: o.data.order.id, action: "SETTLE" }, "BANK-01");
  assert.equal(s.data.status, "BANK_SETTLED", JSON.stringify(s.data));
  return s.data;
}

test("sign in and start from a clean event", async () => {
  for (const u of USERS) tok[u] = await signIn(u);
  const names = (await GET("/api/team-names", "ADMIN")).data.teams;
  for (const t of names) brokerOf[t.team] = t.broker;
  for (const b of new Set(["TEAM-020", "TEAM-021"].map((t) => brokerOf[t]))) tok[b] = await signIn(b);
  const st = (await GET("/api/event-status")).data.status;
  if (st === "LIVE" || st === "SETTLEMENT_ONLY") { await POST("/api/reject-open-orders", { ...A }, "ADMIN"); await POST("/api/event", { action: "CLOSE", ...A }, "ADMIN"); }
  ok(await POST("/api/reset-event", { confirm: "RESET", keep_allotments: false, ...A }, "ADMIN"));
  ok(await POST("/api/ipo-listing", { action: "CLEAR", ...A }, "ADMIN"));
  ok(await POST("/api/config", { auto_list_ipos: true, ...A }, "ADMIN"));
});

test("listing prices are validated all-or-nothing and need the administrator password", async () => {
  const bad = await POST("/api/ipo-listing", { action: "SET", rows: [
    { ipo: "VOLTRA", listing_price: 1100 }, { ipo: "SHREEB", listing_price: 2000 }, { ipo: "BLUEAI", listing_price: "800.5" }, { ipo: "NOPE", listing_price: 10 }], ...A }, "ADMIN");
  assert.equal(bad.status, 400); assert.equal(bad.data.code, "LISTING_ERRORS"); assert.equal(bad.data.errors.length, 3, JSON.stringify(bad.data.errors));
  assert.ok((await listing()).every((x) => !x.listing_saved), "nothing saved after a failed upload");
  assert.equal((await POST("/api/ipo-listing", { action: "SET", rows: [{ ipo: "VOLTRA", listing_price: 1100 }], ...A }, "BANK-01")).status, 403);
  if (!CI) assert.equal((await POST("/api/ipo-listing", { action: "SET", rows: [{ ipo: "VOLTRA", listing_price: 1100 }] }, "ADMIN")).data.code, "ADMIN_PASSWORD_REQUIRED");
});

test("saved listing prices stay confidential until listing", async () => {
  const r = await POST("/api/ipo-listing", { action: "SET", rows: [
    { ipo: "VOLTRA", listing_price: 1100 }, { ipo: "BLUEAI", listing_price: 800 }, { ipo: "SHREEB", listing_price: "" }, { ipo: "AAROGYA", listing_price: 650 }], ...A }, "ADMIN");
  ok(r);
  const admin = Object.fromEntries((await listing()).map((x) => [x.symbol, x]));
  assert.equal(num(admin.VOLTRA.listing_price), 1100); assert.equal(num(admin.VOLTRA.gain_pct), 23.6); assert.equal(admin.SHREEB.listing_saved, false);
  const viewer = Object.fromEntries((await listing("FACULTY-01")).map((x) => [x.symbol, x]));
  assert.equal(viewer.VOLTRA.listing_saved, true); assert.equal(viewer.VOLTRA.listing_price, null, "viewer must not see the saved price");
  const market = JSON.stringify((await GET("/api/market")).data), page = JSON.stringify((await GET("/api/ipo")).data);
  assert.ok(!market.includes("1100") && !page.includes("1100"), "public feeds must not leak listing prices");
  assert.equal(num((await ipo("VOLTRA")).price), 890);
  const audit = (await GET("/api/audit?action=IPO_LISTING_PRICES_SAVED", "ADMIN")).data.rows[0];
  assert.ok(audit && !JSON.stringify(audit).includes("1100"), "the audit trail does not reveal the price before listing");
});

test("START lists every IPO once (saved price, else issue price); CMS INDEX grows to 54 without a jump", async () => {
  const r = await POST("/api/event", { action: "START", ...A }, "ADMIN");
  ok(r);
  assert.deepEqual(Object.fromEntries(r.data.listed.map((x) => [x.symbol, num(x.listing_price)])), { VOLTRA: 1100, BLUEAI: 800, SHREEB: 620, AAROGYA: 650 });
  const v = await ipo("VOLTRA");
  assert.equal(num(v.price), 1100); assert.equal(num(v.previous_price), 890); assert.equal(v.listed, true); assert.equal(v.stage, "LISTED");
  assert.equal(num((await ipo("SHREEB")).price), 620, "an IPO without a listing price lists at its issue price");
  const m = (await GET("/api/market")).data;
  assert.equal(m.index.components, 54); assert.equal(m.index.ipo_components, 4); assert.equal(num(m.index.change), 0);
  assert.equal(new Set(m.board.listed_market).size, 54); assert.deepEqual(m.board.ipo_market, []);
  const prices = (await GET("/api/export?sheet=prices&format=json", "ADMIN")).data;
  assert.ok(prices.rows.some((row) => row[1] === "VOLTRA" && row[2] === "LISTING" && num(row[4]) === 1100));
  assert.equal((await GET("/api/audit?action=IPO_LISTED", "ADMIN")).data.rows.length, 4, "the IPO → market transition is audited");
  assert.equal((await POST("/api/ipo-listing", { action: "APPLY", at_issue_price: true, ...A }, "ADMIN")).data.code, "NOTHING_TO_LIST", "no IPO is listed twice");
  assert.equal((await POST("/api/ipo-listing", { action: "SET", rows: [{ ipo: "VOLTRA", listing_price: 1000 }], ...A }, "ADMIN")).status, 400, "a listed IPO cannot be re-priced");
});

test("a listed IPO trades at its market price like any listed stock", async () => {
  const o = await submit("TEAM-020", "VOLTRA", "BUY", 50);
  ok(o); assert.equal(num(o.data.order.price), 1100);
  const stale = await submit("TEAM-020", "VOLTRA", "BUY", 50, { expected_price: 1200 });
  assert.equal(stale.data.code, "PRICE_CHANGED");
  ok(await POST("/api/pit", { order_id: o.data.order.id, action: "REJECT", reason: "test clean-up" }, "PIT-01"));
});

test("listing can be undone and redone until the IPO has orders or trades", async () => {
  const j = (await GET("/api/admin-state", "ADMIN")).data.journal.find((x) => x.summary.startsWith("BLUEAI listed"));
  assert.ok(j, "journal entry for the BLUEAI listing");
  ok(await POST("/api/undo-redo", { action: "UNDO", journal_id: j.id, ...A }, "ADMIN"));
  let b = await ipo("BLUEAI");
  assert.equal(num(b.price), 780); assert.equal(b.listed, false);
  assert.equal((await GET("/api/market")).data.index.components, 53, "undoing a listing removes it from the CMS INDEX");
  ok(await POST("/api/undo-redo", { action: "REDO", journal_id: j.id, ...A }, "ADMIN"));
  b = await ipo("BLUEAI");
  assert.equal(num(b.price), 800); assert.equal(b.listed, true);
  assert.equal((await GET("/api/market")).data.index.components, 54);
  await trade("TEAM-021", "VOLTRA", "BUY", 50);
  const jv = (await GET("/api/admin-state", "ADMIN")).data.journal.find((x) => x.summary.startsWith("VOLTRA listed"));
  assert.equal((await POST("/api/undo-redo", { action: "UNDO", journal_id: jv.id, ...A }, "ADMIN")).data.code, "UNSAFE_UNDO");
});

test("reset returns IPOs to the IPO market (issue prices) and keeps saved listing prices; manual listing", async () => {
  ok(await POST("/api/reject-open-orders", { ...A }, "ADMIN"));
  ok(await POST("/api/event", { action: "CLOSE", ...A }, "ADMIN"));
  ok(await POST("/api/reset-event", { confirm: "RESET", keep_allotments: false, ...A }, "ADMIN"));
  const m = (await GET("/api/market")).data;
  assert.deepEqual(Object.fromEntries(m.ipos.map((x) => [x.symbol, num(x.price)])), { VOLTRA: 890, BLUEAI: 780, SHREEB: 620, AAROGYA: 710 });
  assert.ok(m.ipos.every((x) => x.listed === false)); assert.equal(m.index.components, 50);
  assert.deepEqual(m.board.ipo_market, ["VOLTRA", "BLUEAI", "SHREEB", "AAROGYA"], "the IPO section starts on top again");
  assert.equal(num(Object.fromEntries((await listing()).map((x) => [x.symbol, x])).VOLTRA.listing_price), 1100, "saved price kept for the real event");
  // automatic listing off: START leaves the IPOs in the IPO market; "List now" lists only the named IPO
  ok(await POST("/api/config", { auto_list_ipos: false, ...A }, "ADMIN"));
  const s = await POST("/api/event", { action: "START", ...A }, "ADMIN");
  ok(s); assert.equal(s.data.listed.length, 0);
  assert.equal((await submit("TEAM-020", "VOLTRA", "BUY", 50)).data.code, "IPO_NOT_LISTED");
  assert.equal((await GET("/api/market")).data.index.components, 50);
  const a = await POST("/api/ipo-listing", { action: "APPLY", symbols: ["VOLTRA"], ...A }, "ADMIN");
  ok(a); assert.equal(num((await ipo("VOLTRA")).price), 1100); assert.equal(num((await ipo("BLUEAI")).price), 780, "only the named IPO is listed");
  assert.equal((await GET("/api/market")).data.index.components, 51);
  ok(await POST("/api/config", { auto_list_ipos: true, ...A }, "ADMIN"));
});

test("password change: wrong current password, weak password, success", async () => {
  const p1 = randomPw(), p2 = randomPw();
  try {
    ok(await POST("/api/users", { action: "RESET_PASSWORD", username: "TEAM-002", password: p1, ...A }, "ADMIN"));
    const s = await POST("/api/login", { username: "TEAM-002", password: p1 });
    ok(s); tok.T2 = s.data.token;
    assert.equal((await POST("/api/change-password", { old_password: "nope", new_password: "something-new" }, "T2")).data.code, "INVALID_CREDENTIALS");
    assert.equal((await POST("/api/change-password", { old_password: p1, new_password: "short" }, "T2")).data.code, "WEAK_PASSWORD");
    ok(await POST("/api/change-password", { old_password: p1, new_password: p2 }, "T2"));
    assert.equal((await POST("/api/login", { username: "TEAM-002", password: p1 })).status, 401);
    assert.equal((await POST("/api/login", { username: "TEAM-002", password: p2 })).status, 200);
  } finally {
    // locally the known test password comes back; on staging the account ends with an unknown random password
    ok(await POST("/api/users", { action: "RESET_PASSWORD", username: "TEAM-002", password: CI ? randomPw() : "team-pass-002", ...A }, "ADMIN"));
  }
});

test("console bootstrap forces a password change at next sign-in", { skip: !PGURL && "set PGURL to run (local database only)" }, async () => {
  const pw = execFileSync("psql", [PGURL, "-tAc", "SELECT jse_bootstrap_password('FACULTY-02')"], { encoding: "utf8" }).trim();
  assert.ok(pw.length >= 10);
  const r = await POST("/api/login", { username: "FACULTY-02", password: pw });
  ok(r); assert.equal(r.data.user.must_change_password, true);
  tok.F2 = r.data.token;
  ok(await POST("/api/change-password", { old_password: pw, new_password: "faculty-two-own-pw" }, "F2"));
  assert.equal((await GET("/api/me", "F2")).data.user.must_change_password, false);
  const audit = (await GET("/api/audit?action=PASSWORD_BOOTSTRAP", "ADMIN")).data.rows;
  assert.ok(audit.length >= 1 && audit[0].actor === "DATABASE CONSOLE");
});

test("CI sign-in: absent locally, rejects forged tokens on staging", async () => {
  const forged = Buffer.from(JSON.stringify({ alg: "RS256", kid: "x" })).toString("base64url") + "." +
    Buffer.from(JSON.stringify({ iss: "https://token.actions.githubusercontent.com", aud: "jse-staging", repository: "patelajay0281/jain-stock-exchange",
      ref: "refs/heads/v272", exp: Math.floor(Date.now() / 1000) + 300 })).toString("base64url") + ".c2lnbmF0dXJl";
  const r = await POST("/api/ci-login", { token: forged, username: "ADMIN" });
  if (CI) { assert.equal(r.status, 401); assert.equal(r.data.code, "INVALID_CI_TOKEN"); }
  else assert.equal(r.status, 404);
});

test("cleanup: closed, reset and no saved listing prices", async () => {
  await POST("/api/reject-open-orders", { ...A }, "ADMIN");
  const st = (await GET("/api/event-status")).data.status;
  if (st === "LIVE" || st === "SETTLEMENT_ONLY") ok(await POST("/api/event", { action: "CLOSE", ...A }, "ADMIN"));
  ok(await POST("/api/reset-event", { confirm: "RESET", keep_allotments: false, ...A }, "ADMIN"));
  ok(await POST("/api/ipo-listing", { action: "CLEAR", ...A }, "ADMIN"));
  assert.ok((await listing()).every((x) => !x.listing_saved && !x.listed));
});
