// IPO listing prices, password change and console bootstrap.
//   BASE=http://127.0.0.1:8788 [PGURL=postgres://postgres@127.0.0.1:5433/jse] node --test tests/listing.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { signIn } from "./lib/client.mjs";

const BASE = process.env.BASE || "http://127.0.0.1:8788";
const PGURL = process.env.PGURL || "";
const PW = { ADMIN: process.env.PW_ADMIN || "admin-pass-1", "PIT-01": "pit-pass-01", "EXCHANGE-01": "exch-pass-01", "BANK-01": "bank-pass-01",
  "FACULTY-01": "faculty-pass-1", "TEAM-002": "team-pass-002" };
const tok = {};
const CI = !!(process.env.ACTIONS_ID_TOKEN_REQUEST_URL || process.env.CI_OIDC_TOKEN);   // staging: OIDC sign-in, no known passwords
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
const num = Number;
const ipo = async (sym) => (await GET("/api/market")).data.ipos.find((x) => x.symbol === sym);
const listing = async (who = "ADMIN") => (await GET("/api/admin-state", who)).data.ipo_listing;
async function trade(team, sym, side, qty, price) {
  const o = await POST("/api/orders", { team, symbol: sym, side, quantity: qty, price, idempotency_key: randomUUID() }, "PIT-01");
  assert.equal(o.status, 200, JSON.stringify(o.data));
  assert.equal((await POST("/api/exchange", { order_id: o.data.order.id, action: "APPROVE", confirm_short_sell: true }, "EXCHANGE-01")).status, 200);
  const s = await POST("/api/bank", { order_id: o.data.order.id, action: "SETTLE" }, "BANK-01");
  assert.equal(s.data.status, "BANK_SETTLED", JSON.stringify(s.data));
  return s.data;
}

test("sign in and start from a clean event", async () => {
  for (const u of Object.keys(PW)) tok[u] = await signIn(u);
  const st = (await GET("/api/event-status")).data.status;
  if (st === "LIVE" || st === "SETTLEMENT_ONLY") await POST("/api/event", { action: "CLOSE" }, "ADMIN");
  assert.equal((await POST("/api/reset-event", { confirm: "RESET", keep_allotments: false }, "ADMIN")).status, 200);
  await POST("/api/ipo-listing", { action: "CLEAR" }, "ADMIN");
  await POST("/api/config", { auto_list_ipos: true }, "ADMIN");
});

test("listing prices are validated all-or-nothing", async () => {
  const bad = await POST("/api/ipo-listing", { action: "SET", rows: [
    { ipo: "VOLTRA", listing_price: 1100 }, { ipo: "SHREEB", listing_price: 2000 }, { ipo: "BLUEAI", listing_price: "800.5" }, { ipo: "NOPE", listing_price: 10 }] }, "ADMIN");
  assert.equal(bad.status, 400);
  assert.equal(bad.data.code, "LISTING_ERRORS");
  assert.equal(bad.data.errors.length, 3, JSON.stringify(bad.data.errors));
  assert.ok((await listing()).every((x) => !x.listing_saved), "nothing saved after a failed upload");
  assert.equal((await POST("/api/ipo-listing", { action: "SET", rows: [{ ipo: "VOLTRA", listing_price: 1100 }] }, "BANK-01")).status, 403);
});

test("saved listing prices stay confidential", async () => {
  const r = await POST("/api/ipo-listing", { action: "SET", rows: [
    { ipo: "VOLTRA", listing_price: 1100 }, { ipo: "BLUEAI", listing_price: 800 }, { ipo: "SHREEB", listing_price: "" }, { ipo: "AAROGYA", listing_price: 650 }] }, "ADMIN");
  assert.equal(r.status, 200, JSON.stringify(r.data));
  const admin = Object.fromEntries((await listing()).map((x) => [x.symbol, x]));
  assert.equal(num(admin.VOLTRA.listing_price), 1100);
  assert.equal(num(admin.VOLTRA.gain_pct), 23.6);
  assert.equal(admin.SHREEB.listing_saved, false);
  const viewer = Object.fromEntries((await listing("FACULTY-01")).map((x) => [x.symbol, x]));
  assert.equal(viewer.VOLTRA.listing_saved, true);
  assert.equal(viewer.VOLTRA.listing_price, null, "viewer must not see the saved price");
  const market = JSON.stringify((await GET("/api/market")).data);
  assert.ok(!market.includes("1100") && !market.includes("listing_price"), "public market feed must not leak listing prices");
  assert.equal(num((await ipo("VOLTRA")).price), 890);
  const audit = (await GET("/api/audit?action=IPO_LISTING_PRICES_SAVED", "ADMIN")).data.rows[0];
  assert.ok(audit && !JSON.stringify(audit).includes("1100"), "audit trail does not reveal the price before listing");
});

test("START lists IPOs at the saved prices (source LISTING)", async () => {
  const r = await POST("/api/event", { action: "START" }, "ADMIN");
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.deepEqual(r.data.listed.map((x) => x.symbol).sort(), ["AAROGYA", "BLUEAI", "VOLTRA"]);
  const v = await ipo("VOLTRA");
  assert.equal(num(v.price), 1100); assert.equal(num(v.previous_price), 890); assert.equal(num(v.change_pct), 23.6); assert.equal(v.listed, true);
  assert.equal(num((await ipo("SHREEB")).price), 620, "IPO without a listing price trades from its issue price");
  const prices = (await GET("/api/export?sheet=prices&format=json", "ADMIN")).data;
  assert.ok(prices.rows.some((row) => row[1] === "VOLTRA" && row[2] === "LISTING" && num(row[4]) === 1100));
  const audit = (await GET("/api/audit?action=IPO_LISTED", "ADMIN")).data.rows;
  assert.equal(audit.length, 3);
  assert.equal((await POST("/api/ipo-listing", { action: "APPLY" }, "ADMIN")).data.code, "NOTHING_TO_LIST");
  assert.equal((await POST("/api/ipo-listing", { action: "SET", rows: [{ ipo: "VOLTRA", listing_price: 1000 }] }, "ADMIN")).status, 400, "listed IPO cannot be re-priced");
});

test("the 10% order band applies from the listing price", async () => {
  const ok = await POST("/api/orders", { team: "TEAM-020", symbol: "VOLTRA", side: "BUY", quantity: 50, price: 1200, idempotency_key: randomUUID() }, "PIT-01");
  assert.equal(ok.status, 200, JSON.stringify(ok.data));
  const far = await POST("/api/orders", { team: "TEAM-020", symbol: "VOLTRA", side: "BUY", quantity: 50, price: 1250, idempotency_key: randomUUID() }, "PIT-01");
  assert.equal(far.data.code, "PRICE_LIMIT");
  await POST("/api/exchange", { order_id: ok.data.order.id, action: "REJECT", reason: "test" }, "EXCHANGE-01");
});

test("listing can be undone and redone until the IPO trades", async () => {
  const j = (await GET("/api/admin-state", "ADMIN")).data.journal.find((x) => x.summary.startsWith("BLUEAI listed"));
  assert.ok(j, "journal entry for the BLUEAI listing");
  const u = await POST("/api/undo-redo", { action: "UNDO", journal_id: j.id }, "ADMIN");
  assert.equal(u.status, 200, JSON.stringify(u.data));
  let b = await ipo("BLUEAI");
  assert.equal(num(b.price), 780); assert.equal(b.listed, false);
  const rd = await POST("/api/undo-redo", { action: "REDO", journal_id: j.id }, "ADMIN");
  assert.equal(rd.status, 200, JSON.stringify(rd.data));
  b = await ipo("BLUEAI");
  assert.equal(num(b.price), 800); assert.equal(b.listed, true);
  // after a trade the listing is locked in
  await trade("TEAM-021", "VOLTRA", "BUY", 50, 1150);
  const jv = (await GET("/api/admin-state", "ADMIN")).data.journal.find((x) => x.summary.startsWith("VOLTRA listed"));
  const no = await POST("/api/undo-redo", { action: "UNDO", journal_id: jv.id }, "ADMIN");
  assert.equal(no.data.code, "UNSAFE_UNDO");
});

test("reset restores issue prices and keeps saved listing prices", async () => {
  await POST("/api/reject-open-orders", {}, "ADMIN");
  await POST("/api/event", { action: "CLOSE" }, "ADMIN");
  const r = await POST("/api/reset-event", { confirm: "RESET", keep_allotments: false }, "ADMIN");
  assert.equal(r.status, 200);
  const m = (await GET("/api/market")).data;
  assert.deepEqual(Object.fromEntries(m.ipos.map((x) => [x.symbol, num(x.price)])), { VOLTRA: 890, BLUEAI: 780, SHREEB: 620, AAROGYA: 710 });
  assert.ok(m.ipos.every((x) => x.listed === false));
  const l = Object.fromEntries((await listing()).map((x) => [x.symbol, x]));
  assert.equal(num(l.VOLTRA.listing_price), 1100, "saved price kept for the real event");
  // automatic listing off: START leaves issue prices; "List IPOs now" applies them while LIVE
  await POST("/api/config", { auto_list_ipos: false }, "ADMIN");
  const s = await POST("/api/event", { action: "START" }, "ADMIN");
  assert.equal(s.data.listed.length, 0);
  assert.equal(num((await ipo("VOLTRA")).price), 890);
  const a = await POST("/api/ipo-listing", { action: "APPLY", symbols: ["VOLTRA"] }, "ADMIN");
  assert.equal(a.status, 200, JSON.stringify(a.data));
  assert.equal(num((await ipo("VOLTRA")).price), 1100);
  assert.equal(num((await ipo("BLUEAI")).price), 780, "only the named IPO is listed");
  await POST("/api/config", { auto_list_ipos: true }, "ADMIN");
});

test("password change: wrong current password, weak password, success", async () => {
  const p1 = randomPw(), p2 = randomPw();
  try {
    assert.equal((await POST("/api/users", { action: "RESET_PASSWORD", username: "TEAM-002", password: p1 }, "ADMIN")).status, 200);
    const s = await POST("/api/login", { username: "TEAM-002", password: p1 });
    assert.equal(s.status, 200, JSON.stringify(s.data));
    tok.T2 = s.data.token;
    assert.equal((await POST("/api/change-password", { old_password: "nope", new_password: "something-new" }, "T2")).data.code, "INVALID_CREDENTIALS");
    assert.equal((await POST("/api/change-password", { old_password: p1, new_password: "short" }, "T2")).data.code, "WEAK_PASSWORD");
    const ok = await POST("/api/change-password", { old_password: p1, new_password: p2 }, "T2");
    assert.equal(ok.status, 200, JSON.stringify(ok.data));
    assert.equal((await POST("/api/login", { username: "TEAM-002", password: p1 })).status, 401);
    assert.equal((await POST("/api/login", { username: "TEAM-002", password: p2 })).status, 200);
  } finally {
    // locally the known test password comes back; on staging the account ends with an unknown random password
    const r = await POST("/api/users", { action: "RESET_PASSWORD", username: "TEAM-002", password: CI ? randomPw() : PW["TEAM-002"] }, "ADMIN");
    assert.equal(r.status, 200, JSON.stringify(r.data));
  }
});

test("console bootstrap forces a password change at next sign-in", { skip: !PGURL && "set PGURL to run (local database only)" }, async () => {
  const pw = execFileSync("psql", [PGURL, "-tAc", "SELECT jse_bootstrap_password('FACULTY-02')"], { encoding: "utf8" }).trim();
  assert.ok(pw.length >= 10);
  const r = await POST("/api/login", { username: "FACULTY-02", password: pw });
  assert.equal(r.status, 200);
  assert.equal(r.data.user.must_change_password, true);
  tok.F2 = r.data.token;
  assert.equal((await POST("/api/change-password", { old_password: pw, new_password: "faculty-two-own-pw" }, "F2")).status, 200);
  const me = await GET("/api/me", "F2");
  assert.equal(me.data.user.must_change_password, false);
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
  await POST("/api/reject-open-orders", {}, "ADMIN");
  const st = (await GET("/api/event-status")).data.status;
  if (st === "LIVE" || st === "SETTLEMENT_ONLY") await POST("/api/event", { action: "CLOSE" }, "ADMIN");
  assert.equal((await POST("/api/reset-event", { confirm: "RESET", keep_allotments: false }, "ADMIN")).status, 200);
  assert.equal((await POST("/api/ipo-listing", { action: "CLEAR" }, "ADMIN")).status, 200);
  assert.ok((await listing()).every((x) => !x.listing_saved && !x.listed));
});
