// JAIN STOCK EXCHANGE (JSE) v311 — API server (Neon Functions / Node.js 24).
// Default export is a fetch handler: { fetch(request): Promise<Response> }.
// Every financial rule lives in the database (db/migrations); this layer authenticates, routes, caches reads,
// rate-limits writes and turns exports into CSV / Excel / JSON.
import { createHash, randomUUID } from "node:crypto";
import { gzipSync } from "node:zlib";
import { ApiError, call, ensureMigrated, rawQuery } from "./db";
import { verifyGithubOidc } from "./oidc";
import { buildXlsx, readCsv, readXlsx, toCsv, type Sheet } from "./xlsx";

export const VERSION = "3.14.0";
const STARTED = Date.now();

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
type Role = "ADMIN" | "EXCHANGE" | "BANK" | "BROKER" | "PIT_MANAGER" | "INSTITUTIONAL" | "PARTICIPANT" | "VIEWER";
interface User {
  id: number; username: string; name: string; email?: string | null; role: Role;
  team_id?: number | null; team?: string | null; team_name?: string | null; broker_id?: number | null; broker?: string | null;
  institution_id?: number | null; institution?: string | null; session?: string; session_kind?: string; must_change_password?: boolean;
}
interface Ctx {
  req: Request; url: URL; method: string; ip: string; ua: string; origin: string | null;
  token: string | null; user: User | null; body: any; started: number; reqId: string;
}

const ALL: Role[] = ["ADMIN", "EXCHANGE", "BANK", "BROKER", "PIT_MANAGER", "INSTITUTIONAL", "PARTICIPANT", "VIEWER"];

function sha256(s: string): string { return createHash("sha256").update(s).digest("hex"); }

function allowedOrigin(origin: string | null): string | null {
  if (!origin) return null;
  const extra = (process.env.CORS_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (extra.includes(origin)) return origin;
  try {
    const u = new URL(origin);
    const h = u.hostname;
    if (h === "localhost" || h === "127.0.0.1") return origin;
    if (u.protocol === "https:" && (h === "jain-stock-exchange.pages.dev" || h.endsWith(".jain-stock-exchange.pages.dev")
        || h === "jse-live.pages.dev" || h.endsWith(".jse-live.pages.dev"))) return origin;
  } catch {}
  return null;
}

function corsHeaders(ctx: Pick<Ctx, "origin">): Record<string, string> {
  const o = allowedOrigin(ctx.origin);
  const h: Record<string, string> = { vary: "Origin, Accept-Encoding" };
  if (o) {
    h["access-control-allow-origin"] = o;
    h["access-control-allow-methods"] = "GET, POST, OPTIONS";
    h["access-control-allow-headers"] = "Authorization, Content-Type, X-Request-Id";
    h["access-control-expose-headers"] = "ETag, X-JSE-Version, X-Request-Id, Content-Disposition, Date";
    h["access-control-max-age"] = "7200";
  }
  return h;
}

function acceptsGzip(req: Request): boolean { return /\bgzip\b/.test(req.headers.get("accept-encoding") || ""); }

interface Payload { body: string; etag: string; gz?: Uint8Array }
function makePayload(obj: unknown): Payload {
  const body = JSON.stringify(obj);
  return { body, etag: 'W/"' + sha256(body).slice(0, 24) + '"' };
}

function respond(ctx: Ctx, status: number, payload: Payload, extra: Record<string, string> = {}, cacheSeconds = 0): Response {
  const headers: Record<string, string> = {
    "content-type": "application/json; charset=utf-8",
    "x-jse-version": VERSION, "x-request-id": ctx.reqId,
    // public reads: shared 1 s cache; signed-in reads: the browser keeps a private copy and revalidates every poll with
    // If-None-Match, so an unchanged queue / desk / portfolio costs a ~200-byte 304 instead of the full body (data budget)
    "cache-control": cacheSeconds > 0 ? `public, max-age=${cacheSeconds}, must-revalidate`
      : status === 200 && ctx.method === "GET" ? "private, no-cache" : "no-store",
    etag: payload.etag, ...corsHeaders(ctx), ...extra,
  };
  if (cacheSeconds === 0) headers.vary = (headers.vary ? headers.vary + ", " : "") + "Authorization";
  if (status === 200 && ctx.method === "GET" && ctx.req.headers.get("if-none-match") === payload.etag) {
    delete headers["content-type"];
    return new Response(null, { status: 304, headers });
  }
  if (payload.body.length > 1024 && acceptsGzip(ctx.req)) {
    if (!payload.gz) payload.gz = gzipSync(payload.body, { level: 5 });
    headers["content-encoding"] = "gzip";
    return new Response(payload.gz, { status, headers });
  }
  return new Response(payload.body, { status, headers });
}

const json = (ctx: Ctx, obj: unknown, status = 200, cacheSeconds = 0) => respond(ctx, status, makePayload(obj), {}, cacheSeconds);

function fail(ctx: Ctx, e: unknown): Response {
  if (e instanceof ApiError) {
    return json(ctx, { success: false, error: e.message, code: e.code, ...(e.extra || {}) }, e.status);
  }
  const err = e as any;
  console.error(`[api] ${ctx.reqId} ${ctx.method} ${ctx.url.pathname} failed:`, err?.code || "", err?.message || err);
  const unavailable = /ECONNREFUSED|ENOTFOUND|Connection terminated|timeout|too many|remaining connection/i.test(String(err?.message));
  return json(ctx, {
    success: false, code: unavailable ? "SERVICE_UNAVAILABLE" : "SERVER_ERROR", ref: ctx.reqId,
    error: unavailable ? "The trading service is busy or reconnecting. Please retry in a moment." : "Something went wrong while processing this request. Please retry; if it keeps failing, tell the event desk (ref " + ctx.reqId + ").",
  }, unavailable ? 503 : 500);
}

// ---------------------------------------------------------------------------
// Per-process caches (single-flight, TTL). Mutations clear this process's caches;
// other processes converge within one TTL.
// ---------------------------------------------------------------------------
interface CacheEntry { at: number; ttl: number; value?: Payload; pending?: Promise<Payload> }
const cache = new Map<string, CacheEntry>();
async function cached(key: string, ttlMs: number, load: () => Promise<unknown>): Promise<Payload> {
  const now = Date.now();
  const hit = cache.get(key);
  if (hit?.value && now - hit.at < hit.ttl) return hit.value;
  if (hit?.pending) return hit.pending;
  const entry: CacheEntry = hit || { at: 0, ttl: ttlMs };
  entry.ttl = ttlMs;
  entry.pending = load().then((v) => {
    entry.value = makePayload(v); entry.at = Date.now(); entry.pending = undefined;
    return entry.value;
  }).catch((e) => {
    entry.pending = undefined;
    // serve stale data for up to 30 s if the database hiccups (never for errors the engine reported)
    if (!(e instanceof ApiError) && entry.value && Date.now() - entry.at < 30_000) return entry.value;
    throw e;
  });
  cache.set(key, entry);
  if (cache.size > 2000) {
    for (const [k, v] of cache) if (!v.pending && now - v.at > 60_000) cache.delete(k);
  }
  return entry.pending;
}
function invalidate(prefixes?: string[]) {
  if (!prefixes) { cache.clear(); return; }
  for (const k of [...cache.keys()]) if (prefixes.some((p) => k.startsWith(p))) cache.delete(k);
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------
const sessions = new Map<string, { user: User | null; at: number }>();
async function resolveUser(token: string | null): Promise<User | null> {
  if (!token || token.length < 32 || token.length > 128) return null;
  const h = sha256(token);
  const hit = sessions.get(h);
  if (hit && Date.now() - hit.at < 30_000) return hit.user;
  const r = await rawQuery("SELECT jse_session($1) AS u", [h]);
  const user = (r.rows[0]?.u as User) || null;
  sessions.set(h, { user, at: Date.now() });
  if (sessions.size > 5000) { for (const [k, v] of sessions) if (Date.now() - v.at > 120_000) sessions.delete(k); }
  return user;
}

function actor(ctx: Ctx): Record<string, unknown> {
  const u = ctx.user;
  return {
    id: u?.id ?? null, username: u?.username ?? "anonymous", name: u?.name ?? null, email: u?.email ?? null, role: u?.role ?? null,
    team_id: u?.team_id ?? null, broker_id: u?.broker_id ?? null, institution_id: u?.institution_id ?? null,
    session: u?.session ?? null, session_kind: u?.session_kind ?? null, ip: ctx.ip, ua: ctx.ua,
  };
}

function need(ctx: Ctx, ...roles: Role[]): User {
  if (!ctx.user) throw new ApiError(401, "UNAUTHENTICATED", "Please sign in to continue.");
  if (roles.length && !roles.includes(ctx.user.role)) {
    throw new ApiError(403, "FORBIDDEN", `Your role (${ctx.user.role.replace(/_/g, " ")}) cannot do this.`);
  }
  return ctx.user;
}

// ---------------------------------------------------------------------------
// Simple rate limiting (per process): login attempts, admin-password confirmations and write bursts
// ---------------------------------------------------------------------------
const buckets = new Map<string, { tokens: number; at: number }>();
function rateLimit(key: string, perSecond: number, burst: number): boolean {
  const now = Date.now();
  const b = buckets.get(key) || { tokens: burst, at: now };
  b.tokens = Math.min(burst, b.tokens + ((now - b.at) / 1000) * perSecond);
  b.at = now;
  if (b.tokens < 1) { buckets.set(key, b); return false; }
  b.tokens -= 1;
  buckets.set(key, b);
  if (buckets.size > 20000) buckets.clear();
  return true;
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
type Handler = (ctx: Ctx) => Promise<Response>;
const routes = new Map<string, { h: Handler; maxBody?: number }>();
const get = (p: string, h: Handler) => routes.set("GET " + p, { h });
const post = (p: string, h: Handler, maxBody?: number) => routes.set("POST " + p, { h, maxBody });
const q = (ctx: Ctx, k: string) => (ctx.url.searchParams.get(k) || "").trim();
function params(ctx: Ctx, keys: string[]): Record<string, string> {
  const p: Record<string, string> = {};
  for (const k of keys) { const v = q(ctx, k); if (v) p[k] = v; }
  return p;
}

/** true while the bucket still has a token (does not consume one) */
function hasTokens(key: string, perSecond: number, burst: number): boolean {
  const b = buckets.get(key);
  if (!b) return true;
  return Math.min(burst, b.tokens + ((Date.now() - b.at) / 1000) * perSecond) >= 1;
}
// wrong administrator passwords: 8 attempts, then one more every 20 seconds (per account, per process)
const ADMIN_PW_FAIL = { perSecond: 0.05, burst: 8 };

// mutation helper: call the engine, then clear caches that could now be stale
async function mutate(ctx: Ctx, fn: string, body: unknown, clear?: string[]): Promise<Response> {
  if (!rateLimit("w:" + (ctx.user?.id ?? ctx.ip), 15, 40)) {
    throw new ApiError(429, "TOO_MANY_REQUESTS", "Too many actions in a short time. Please wait a moment.");
  }
  const failKey = ctx.user ? "adminpw-fail:" + ctx.user.id : "";
  if (failKey && body && typeof body === "object" && "admin_password" in (body as any)
      && !hasTokens(failKey, ADMIN_PW_FAIL.perSecond, ADMIN_PW_FAIL.burst)) {
    throw new ApiError(429, "TOO_MANY_ATTEMPTS", "Too many incorrect administrator passwords. Wait a minute and try again.");
  }
  try {
    const out = await call(fn, actor(ctx), body);
    invalidate(clear);
    return json(ctx, out);
  } catch (e) {
    // engine results that commit before reporting a problem (e.g. PRICE STALE) still change state
    if (e instanceof ApiError && (e.code === "PRICE_STALE")) invalidate(clear);
    if (failKey && e instanceof ApiError && e.code === "ADMIN_PASSWORD_INVALID") rateLimit(failKey, ADMIN_PW_FAIL.perSecond, ADMIN_PW_FAIL.burst);
    throw e;
  }
}
const ORDER_CACHES = ["trk:", "staff:", "pd:", "q:", "bd:", "ins:", "slips:", "pub:status", "admin:", "audit:", "inst:"];

// ---- public ----
get("/api/health", async (ctx) => {
  const t0 = Date.now();
  let db = "ok";
  try { await rawQuery("SELECT 1"); } catch (e: any) { db = "error: " + String(e?.message).slice(0, 120); }
  return json(ctx, { success: db === "ok", service: "JAIN STOCK EXCHANGE API", version: VERSION, db, db_ms: Date.now() - t0,
    uptime_s: Math.round((Date.now() - STARTED) / 1000), node: process.version, time: new Date().toISOString() }, db === "ok" ? 200 : 503);
});
get("/api/market", async (ctx) => respond(ctx, 200, await cached("pub:market", 900, () => call("jse_market", null)), {}, 1));
get("/api/event-status", async (ctx) => respond(ctx, 200, await cached("pub:status", 900, () => call("jse_event_status", null)), {}, 1));
get("/api/market-news", async (ctx) => {
  const limit = Math.min(200, Math.max(1, Number(q(ctx, "limit")) || 30));
  return respond(ctx, 200, await cached("pub:news:" + limit, 1500, () => call("jse_news_list", null, { limit }, { noActor: true })), {}, 1);
});
get("/api/cms50", async (ctx) => {
  const m = JSON.parse((await cached("pub:market", 900, () => call("jse_market", null))).body);
  return json(ctx, { success: true, status: m.status, ...m.index, market_stock_count: m.stocks.length, ipo_count: m.ipos.length });
});

// ---- authentication ----
post("/api/login", async (ctx) => {
  const username = String(ctx.body?.username || "").trim();
  const password = String(ctx.body?.password || "");
  // many desks share one venue IP, so the per-IP allowance is generous; per-account attempts are tighter
  if (!rateLimit("login-ip:" + ctx.ip, 5, 150) || !rateLimit("login-user:" + username.toLowerCase(), 0.2, 12)) {
    throw new ApiError(429, "TOO_MANY_ATTEMPTS", "Too many sign-in attempts. Wait a minute and try again.");
  }
  if (!username || !password) throw new ApiError(400, "MISSING_CREDENTIALS", "Enter your username and password.");
  const out = await call("jse_login", null, { username, password, ip: ctx.ip, ua: ctx.ua }, { noActor: true });
  return json(ctx, out);
});
post("/api/logout", async (ctx) => {
  if (ctx.token) {
    const h = sha256(ctx.token);
    await rawQuery("SELECT jse_logout($1)", [h]);
    sessions.delete(h);
  }
  return json(ctx, { success: true });
});
get("/api/me", async (ctx) => {
  if (!ctx.user) return json(ctx, { success: true, authenticated: false, user: null });
  return json(ctx, { success: true, authenticated: true, user: ctx.user });
});
post("/api/change-password", async (ctx) => {
  need(ctx);
  if (!rateLimit("pw:" + ctx.user!.id, 0.2, 6)) throw new ApiError(429, "TOO_MANY_ATTEMPTS", "Too many attempts. Wait a minute and try again.");
  const out = await call("jse_change_password", actor(ctx), ctx.body || {});
  sessions.clear();
  return json(ctx, out);
});
// Staging only: automated tests sign in with a GitHub Actions OIDC token instead of a password.
post("/api/ci-login", async (ctx) => {
  const repository = process.env.CI_OIDC_REPOSITORY;
  if (!repository) throw new ApiError(404, "NOT_FOUND", "Unknown API endpoint: /api/ci-login");
  if (!rateLimit("ci-login:" + ctx.ip, 10, 300)) throw new ApiError(429, "TOO_MANY_ATTEMPTS", "Too many sign-in attempts.");
  let claims;
  try {
    claims = await verifyGithubOidc(String(ctx.body?.token || ""), {
      repository, audience: process.env.CI_OIDC_AUDIENCE || "jse-staging",
      refs: (process.env.CI_OIDC_REFS || "").split(",").map((s) => s.trim()).filter(Boolean),
    });
  } catch (e) {
    throw new ApiError(401, "INVALID_CI_TOKEN", "CI token rejected: " + (e as Error).message);
  }
  const out = await call("jse_ci_session", null, { username: String(ctx.body?.username || ""), ip: ctx.ip, ua: ctx.ua,
    subject: claims.sub, run_id: claims.run_id, workflow: claims.workflow }, { noActor: true });
  return json(ctx, out);
});

// ---- portfolios ----
get("/api/portfolios", async (ctx) => {
  need(ctx, "ADMIN", "VIEWER");
  return respond(ctx, 200, await cached("staff:portfolios", 1800, () => call("jse_portfolios", actor(ctx), {})));
});
get("/api/portfolio-details", async (ctx) => {
  const u = need(ctx, "ADMIN", "VIEWER", "BROKER", "PARTICIPANT");
  const team = (u.role === "PARTICIPANT" ? u.team : q(ctx, "team")) || "";
  if (!team) throw new ApiError(400, "TEAM_REQUIRED", "Choose a team.");
  const scope = u.role === "PARTICIPANT" ? "p" + u.id : u.role === "BROKER" ? "b" + u.broker_id : "staff";
  return respond(ctx, 200, await cached("pd:" + team.toUpperCase() + ":" + scope, 1500, () => call("jse_portfolio_detail", actor(ctx), { team })));
});

// ---- orders / tracking ----
function scopeKey(u: User): string {
  return u.role === "PARTICIPANT" ? "p" + u.team_id : u.role === "BROKER" ? "b" + u.broker_id : u.role === "INSTITUTIONAL" ? "i" + u.institution_id : "s";
}
const trackingHandler: Handler = async (ctx) => {
  const u = need(ctx, ...ALL);
  const p = params(ctx, ["team", "status", "side", "kind", "account", "q", "page", "page_size"]);
  return respond(ctx, 200, await cached("trk:" + scopeKey(u) + ":" + JSON.stringify(p), 1200, () => call("jse_tracking", actor(ctx), p)));
};
get("/api/tracking", trackingHandler);
get("/api/orders", trackingHandler);
get("/api/order", async (ctx) => {
  need(ctx, ...ALL);
  return json(ctx, await call("jse_order_detail", actor(ctx),
    { order_id: q(ctx, "id") || undefined, order_no: q(ctx, "order_no") || undefined, slip_no: q(ctx, "slip_no") || undefined }));
});
// Broker submission (participants are refused by the engine with an explanation)
post("/api/orders", async (ctx) => {
  need(ctx, ...ALL);
  const b = ctx.body || {};
  if (Array.isArray(b.legs)) return mutate(ctx, "jse_place_pair", b, ORDER_CACHES);
  return mutate(ctx, "jse_place_order", b, ORDER_CACHES);
});

// ---- broker desk ----
get("/api/broker-desk", async (ctx) => {
  const u = need(ctx, "BROKER", "PIT_MANAGER", "ADMIN", "VIEWER");
  const broker = u.role === "BROKER" ? String(u.broker || "") : u.role === "PIT_MANAGER" ? "ALL" : q(ctx, "broker");
  return respond(ctx, 200, await cached("bd:" + (u.role === "BROKER" ? "own" + u.broker_id : broker || "first"), 1200,
    () => call("jse_broker_desk", actor(ctx), broker ? { broker } : {})));
});

// ---- exchange ----
get("/api/exchange", async (ctx) => {
  need(ctx, "ADMIN", "EXCHANGE", "VIEWER");
  return respond(ctx, 200, await cached("q:exchange", 900, () => call("jse_exchange_queue", actor(ctx), {})));
});
post("/api/exchange", async (ctx) => {
  need(ctx, "ADMIN", "EXCHANGE");
  return mutate(ctx, "jse_exchange_decide", ctx.body || {}, ORDER_CACHES);
});

// ---- bank ----
get("/api/bank", async (ctx) => {
  need(ctx, "ADMIN", "BANK", "VIEWER");
  return respond(ctx, 200, await cached("q:bank", 900, () => call("jse_bank_queue", actor(ctx), {})));
});
post("/api/bank", async (ctx) => {
  need(ctx, "ADMIN", "BANK");
  const b = ctx.body || {};
  const action = String(b.action || "SETTLE").toUpperCase();
  const fn = action === "SETTLE" || action === "APPROVE" ? "jse_bank_settle"
    : action === "REJECT" ? "jse_bank_reject"
    : action === "CLAIM" ? "jse_bank_claim"
    : action === "RELEASE" ? "jse_bank_claim" : "";
  if (!fn) throw new ApiError(400, "INVALID_ACTION", "Use SETTLE, REJECT, CLAIM or RELEASE.");
  return mutate(ctx, fn, { ...b, release: action === "RELEASE" }, action === "CLAIM" || action === "RELEASE" ? ["q:bank"] : ORDER_CACHES.concat(["cash:", "q:loans"]));
});

// ---- loans ----
get("/api/loan", async (ctx) => {
  need(ctx, "ADMIN", "BANK", "VIEWER");
  return respond(ctx, 200, await cached("q:loans", 1500, () => call("jse_loans", actor(ctx), {})));
});
post("/api/loan", async (ctx) => { need(ctx, "ADMIN", "BANK"); return mutate(ctx, "jse_loan_action", ctx.body || {}, ["q:", "staff:", "pd:", "cash:", "bd:"]); });
// v3.14 loan requests: request (broker / bank / admin / participant) → Bank Desk approve = cash released at once
get("/api/loan-requests", async (ctx) => {
  need(ctx, "ADMIN", "BANK", "VIEWER", "BROKER", "PIT_MANAGER", "PARTICIPANT");
  return json(ctx, await call("jse_loan_requests", actor(ctx), {}));
});
post("/api/loan-requests", async (ctx) => {
  const b = ctx.body || {};
  if (String(b.action || "").toUpperCase() === "REQUEST") {
    need(ctx, "ADMIN", "BANK", "BROKER", "PIT_MANAGER", "PARTICIPANT");
    return mutate(ctx, "jse_loan_request", b, ["q:", "bd:"]);
  }
  need(ctx, "ADMIN", "BANK");
  return mutate(ctx, "jse_loan_decide", b, ["q:", "staff:", "pd:", "cash:", "bd:"]);
});
post("/api/rename", async (ctx) => { need(ctx, "ADMIN"); return mutate(ctx, "jse_rename_entity", ctx.body || {}, ["q:", "staff:", "inst:", "admin:", "pub:"]); });
// 031: reconciliation (read-only) and ledger-only corrections; institutional inventory
get("/api/reconcile", async (ctx) => { need(ctx, "ADMIN", "VIEWER"); return json(ctx, await call("jse_reconcile", actor(ctx), {})); });
post("/api/reconcile", async (ctx) => { need(ctx, "ADMIN"); return mutate(ctx, "jse_reconcile_correct", ctx.body || {}, ["cash:", "pd:", "staff:", "admin:"]); });
get("/api/institution-inventory", async (ctx) => { need(ctx, "ADMIN", "VIEWER", "INSTITUTIONAL"); return json(ctx, await call("jse_institution_inventory", actor(ctx), { action: "LIST" })); });
post("/api/institution-inventory", async (ctx) => { need(ctx, "ADMIN"); return mutate(ctx, "jse_institution_inventory", ctx.body || {}, ["inst:", "admin:"]); });

// ---- ledgers, audit, commissions ----
get("/api/cash", async (ctx) => {
  const u = need(ctx, "ADMIN", "BANK", "VIEWER", "PARTICIPANT");
  const p = params(ctx, ["team", "type", "q", "page", "page_size"]);
  return respond(ctx, 200, await cached("cash:" + (u.role === "PARTICIPANT" ? u.team_id : "s") + ":" + JSON.stringify(p), 1500,
    () => call("jse_cash", actor(ctx), p)));
});
get("/api/audit", async (ctx) => {
  need(ctx, "ADMIN", "VIEWER");
  const p = params(ctx, ["action", "team", "role", "risk", "group", "q", "page", "page_size"]);
  return respond(ctx, 200, await cached("audit:" + JSON.stringify(p), 1500, () => call("jse_audit_log", actor(ctx), p)));
});
get("/api/commissions", async (ctx) => {
  const u = need(ctx, "ADMIN", "BROKER", "VIEWER");
  const p = params(ctx, ["broker", "page", "page_size"]);
  return respond(ctx, 200, await cached("staff:commissions:" + (u.role === "BROKER" ? "b" + u.broker_id : "s") + ":" + JSON.stringify(p), 2000,
    () => call("jse_commissions", actor(ctx), p)));
});

// ---- institutional ----
get("/api/institutional-portfolio", async (ctx) => {
  const u = need(ctx, "ADMIN", "INSTITUTIONAL", "VIEWER");
  const id = u.role === "INSTITUTIONAL" ? "" : q(ctx, "institution_id");
  return respond(ctx, 200, await cached("inst:" + (id || u.institution_id || "default"), 1500,
    () => call("jse_institutional", actor(ctx), id ? { institution_id: id } : {})));
});
post("/api/institutional-order", async (ctx) => {
  need(ctx, "ADMIN", "INSTITUTIONAL");
  return mutate(ctx, "jse_place_institutional_order", ctx.body || {}, ORDER_CACHES.concat(["inst:"]));
});

// ---- market news (Event Admin and the Institutional desk, as on Hatchable: the one price engine) ----
post("/api/market-news", async (ctx) => { need(ctx, "ADMIN", "INSTITUTIONAL"); return mutate(ctx, "jse_market_news", ctx.body || {}, ORDER_CACHES.concat(["pub:market", "pub:news:"])); });

// ---- event administration ----
get("/api/events", async (ctx) => {
  need(ctx, "ADMIN", "VIEWER");
  return json(ctx, await call("jse_event_registry_action", actor(ctx), { action: "STATE" }));
});
post("/api/events", async (ctx) => {
  need(ctx, "ADMIN");
  const out = await mutate(ctx, "jse_event_registry_action", ctx.body || {});
  // User/team identities are event-scoped; force every desk to revalidate sessions after a switch/create.
  if (["ACTIVATE", "CREATE"].includes(String(ctx.body?.action || "").toUpperCase())) sessions.clear();
  return out;
});
get("/api/event-controls", async (ctx) => {
  need(ctx, "ADMIN", "VIEWER");
  return json(ctx, await call("jse_event_controls", actor(ctx), { action: "STATE" }));
});
post("/api/event-controls", async (ctx) => {
  need(ctx, "ADMIN");
  return mutate(ctx, "jse_event_controls", ctx.body || {});
});
get("/api/pricing-method", async (ctx) => {
  need(ctx, "ADMIN", "VIEWER");
  return json(ctx, await call("jse_pricing_method", actor(ctx), { action: "STATE" }));
});
post("/api/pricing-method", async (ctx) => {
  need(ctx, "ADMIN");
  return mutate(ctx, "jse_pricing_method", ctx.body || {});
});
post("/api/manual-price", async (ctx) => {
  need(ctx, "ADMIN");
  return mutate(ctx, "jse_manual_set_market_price", ctx.body || {}, ORDER_CACHES.concat(["pub:market", "pub:news:"]));
});

get("/api/admin-state", async (ctx) => {
  const u = need(ctx, "ADMIN", "VIEWER");
  // per role: saved IPO listing prices are visible to administrators only
  return respond(ctx, 200, await cached("admin:state:" + u.role, 1500, () => call("jse_admin_state", actor(ctx), {})));
});
// Market Intelligence is embedded in Event Admin (administrators and faculty only)

get("/api/admin-analytics", async (ctx) => {
  need(ctx, "ADMIN", "VIEWER");
  const symbol = (q(ctx, "symbol") || "").trim().toUpperCase().slice(0, 24);
  const requestedHours = Number(q(ctx, "range_hours") || 720);
  const hours = [1, 6, 24, 72, 168, 720].includes(requestedHours) ? requestedHours : 24;
  const sql = [
    "WITH args AS (SELECT $1::text AS symbol,$2::integer AS hours,now()-($2::text||' hours')::interval AS since_at),",
    "stock_list AS (SELECT s.id,s.symbol,s.name,s.price,coalesce(s.index_base_price,s.base_price) AS base_price,coalesce(s.sector,'Other') AS sector,s.kind,s.listed_at,s.display_order,s.traded_value FROM securities s WHERE s.active AND (s.kind='EQUITY' OR s.listed_at IS NOT NULL)),",
    "picked AS (SELECT sl.id,sl.symbol,sl.name,sl.price FROM stock_list sl CROSS JOIN args a WHERE (a.symbol<>'' AND sl.symbol=a.symbol) OR (a.symbol='' AND sl.symbol=(SELECT symbol FROM stock_list ORDER BY traded_value DESC NULLS LAST,display_order,symbol LIMIT 1)) ORDER BY CASE WHEN sl.symbol=a.symbol THEN 0 ELSE 1 END LIMIT 1),",
    "price_data AS (SELECT coalesce(jsonb_agg(x ORDER BY x.at),'[]'::jsonb) AS data,count(*)::bigint AS n FROM (SELECT ph.created_at AS at,ph.created_at,ph.previous_price,ph.new_price,ph.change_pct,ph.source FROM price_history ph JOIN picked p ON p.id=ph.security_id CROSS JOIN args a WHERE ph.created_at>=a.since_at ORDER BY ph.created_at DESC,ph.id DESC LIMIT 300) x),",
    "index_events AS (SELECT DISTINCT date_trunc('minute',ph.created_at) AS at FROM price_history ph CROSS JOIN args a WHERE ph.created_at>=a.since_at ORDER BY date_trunc('minute',ph.created_at) DESC LIMIT 120),",
    "index_points AS (SELECT e.at,(SELECT coalesce(sum(coalesce((SELECT ph2.new_price FROM price_history ph2 WHERE ph2.security_id=ss.id AND ph2.created_at<=e.at ORDER BY ph2.created_at DESC,ph2.id DESC LIMIT 1),coalesce(ss.index_base_price,ss.base_price))),0) FROM securities ss WHERE ss.active AND (ss.kind='EQUITY' OR ss.listed_at<=e.at))::numeric(18,2) AS index_value FROM index_events e),",
    "portfolio_raw AS (SELECT ss.symbol AS label,sum(h.quantity*ss.price)::numeric(18,2) AS value FROM holdings h JOIN securities ss ON ss.id=h.security_id JOIN teams t ON t.id=h.team_id WHERE t.active AND h.quantity>0 AND (ss.kind='EQUITY' OR ss.listed_at IS NOT NULL) GROUP BY ss.symbol UNION ALL SELECT 'Participant cash',coalesce(sum(t.cash),0)::numeric(18,2) FROM teams t WHERE t.active),",
    "portfolio_ranked AS (SELECT label,value,row_number() OVER(ORDER BY value DESC) AS rn FROM portfolio_raw WHERE value>0),",
    "risk_rows AS (SELECT CASE kind WHEN 'SHORT_SELL_ATTEMPT' THEN 'Short-selling attempts' WHEN 'CASH_SHORTFALL_ATTEMPT' THEN 'Cash shortfalls' WHEN 'INSUFFICIENT_BALANCE_REJECTION' THEN 'Insufficient balance' ELSE kind END AS label,count(*)::bigint AS value FROM risk_events GROUP BY 1 UNION ALL SELECT 'Stale-price rejections',count(*)::bigint FROM orders WHERE reject_code='PRICE_STALE' OR reject_reason ILIKE '%PRICE STALE%' UNION ALL SELECT 'Company exposure rejections',count(*)::bigint FROM orders WHERE reject_code='COMPANY_LIMIT' OR reject_reason ILIKE '%company limit%'),",
    "cashflow_rows AS (SELECT date_trunc('hour',cl.created_at) AS at,sum(cl.credit-cl.debit)::numeric(18,2) AS net_flow FROM cash_ledger cl CROSS JOIN args a WHERE cl.created_at>=a.since_at GROUP BY 1),",
    "settlement_rows AS (SELECT date_trunc('hour',coalesce(o.bank_at,o.updated_at,o.created_at)) AS at,count(*) FILTER(WHERE o.status='BANK_SETTLED')::bigint AS settled,count(*) FILTER(WHERE o.status IN ('PIT_REJECTED','EXCHANGE_REJECTED','BANK_REJECTED'))::bigint AS rejected FROM orders o CROSS JOIN args a WHERE coalesce(o.bank_at,o.updated_at,o.created_at)>=a.since_at GROUP BY 1),",
    "broker_rows AS (SELECT b.code AS broker,b.name,coalesce(c.total,0)::numeric(18,2) AS commissions,coalesce(c.n,0)::bigint AS settled_orders FROM brokers b LEFT JOIN (SELECT broker_id,sum(amount) AS total,count(*) AS n FROM broker_commissions WHERE reversed_at IS NULL GROUP BY broker_id) c ON c.broker_id=b.id WHERE b.active),",
    "sector_rows AS (SELECT coalesce(sector,'Other') AS sector,round(avg((price-coalesce(index_base_price,base_price))*100/nullif(coalesce(index_base_price,base_price),0)),2) AS avg_change_pct,sum(traded_value)::numeric(18,2) AS traded_value,count(*)::bigint AS securities FROM securities WHERE active AND (kind='EQUITY' OR listed_at IS NOT NULL) GROUP BY coalesce(sector,'Other')),",
    "news_rows AS (SELECT s.symbol,s.name,replace(n.mood,'_',' ') AS mood,n.headline,n.requested_pct,round((n.new_price-n.previous_price)*100/nullif(n.previous_price,0),2) AS actual_pct,n.previous_price,n.new_price,n.reversed_at IS NOT NULL AS reversed,n.created_at FROM (SELECT * FROM market_news ORDER BY created_at DESC,id DESC LIMIT 15) n JOIN securities s ON s.id=n.security_id)",
    "SELECT jsonb_build_object('success',true,'generated_at',now(),'selected_symbol',(SELECT symbol FROM picked),'stocks',(SELECT coalesce(jsonb_agg(jsonb_build_object('symbol',symbol,'name',name) ORDER BY display_order,symbol),'[]'::jsonb) FROM stock_list),'price_history',(SELECT data FROM price_data),'index_history',(SELECT coalesce(jsonb_agg(jsonb_build_object('at',at,'index_value',index_value) ORDER BY at),'[]'::jsonb) FROM index_points),'order_status',(SELECT coalesce(jsonb_agg(jsonb_build_object('label',label,'value',value) ORDER BY value DESC),'[]'::jsonb) FROM (SELECT CASE WHEN status='PIT_PENDING' THEN 'Pit pending' WHEN status='EXCHANGE_PENDING' THEN 'Exchange pending' WHEN status IN ('EXCHANGE_APPROVED','BANK_PENDING') THEN 'Bank pending' WHEN status='BANK_SETTLED' THEN 'Settled' WHEN status IN ('PIT_REJECTED','EXCHANGE_REJECTED','BANK_REJECTED') THEN 'Rejected' ELSE 'Other / closed' END AS label,count(*)::bigint AS value FROM orders GROUP BY 1) q),'breadth',(SELECT jsonb_build_object('advances',count(*) FILTER(WHERE price>base_price),'declines',count(*) FILTER(WHERE price<base_price),'unchanged',count(*) FILTER(WHERE price=base_price)) FROM stock_list),'portfolio',(SELECT coalesce(jsonb_agg(jsonb_build_object('label',label,'value',value) ORDER BY value DESC),'[]'::jsonb) FROM (SELECT label,value FROM portfolio_ranked WHERE rn<=8 UNION ALL SELECT 'Other securities',sum(value) FROM portfolio_ranked WHERE rn>8 HAVING sum(value)>0) q),'risk',(SELECT coalesce(jsonb_agg(jsonb_build_object('label',label,'value',value) ORDER BY value DESC),'[]'::jsonb) FROM risk_rows WHERE value>0),'cashflow',(SELECT coalesce(jsonb_agg(jsonb_build_object('at',at,'net_flow',net_flow) ORDER BY at),'[]'::jsonb) FROM cashflow_rows),'settlement_trend',(SELECT coalesce(jsonb_agg(jsonb_build_object('at',at,'settled',settled,'rejected',rejected) ORDER BY at),'[]'::jsonb) FROM settlement_rows),'brokers',(SELECT coalesce(jsonb_agg(to_jsonb(b) ORDER BY commissions DESC),'[]'::jsonb) FROM broker_rows b),'sectors',(SELECT coalesce(jsonb_agg(to_jsonb(z) ORDER BY avg_change_pct DESC),'[]'::jsonb) FROM sector_rows z),'participant_performance',(SELECT coalesce(jsonb_agg(jsonb_build_object('team',code,'name',name,'broker',broker,'cash',cash,'holdings_value',holdings_value,'net_worth',net_worth,'pnl',pnl,'realized_pnl',realized_pnl,'unrealized_pnl',unrealized_pnl,'buys',settled_buys,'sells',settled_sells,'loan_liability',loan_liability) ORDER BY net_worth DESC),'[]'::jsonb) FROM (SELECT * FROM jse_team_metrics WHERE active ORDER BY net_worth DESC LIMIT 12) t),'news',(SELECT coalesce(jsonb_agg(to_jsonb(n) ORDER BY created_at DESC),'[]'::jsonb) FROM news_rows n),'summary',jsonb_build_object('active_teams',(SELECT count(*) FROM teams WHERE active),'price_history_points',(SELECT n FROM price_data))) AS data"
  ].join(" ");
  const result = await rawQuery<{data: unknown}>(sql, [symbol, hours]);
  return json(ctx, result.rows[0]?.data || {success:false,error:"Analytics snapshot unavailable."});
});
get("/api/insights", async (ctx) => {
  need(ctx, "ADMIN", "VIEWER");
  return respond(ctx, 200, await cached("staff:insights", 2500, () => call("jse_insights", null)));
});
post("/api/ipo-listing", async (ctx) => { need(ctx, "ADMIN"); return mutate(ctx, "jse_ipo_listing", ctx.body || {}); });
post("/api/event", async (ctx) => { need(ctx, "ADMIN"); return mutate(ctx, "jse_event_action", ctx.body || {}); });
post("/api/reset-event", async (ctx) => { need(ctx, "ADMIN"); return mutate(ctx, "jse_reset_event", ctx.body || {}); });
post("/api/undo-redo", async (ctx) => { need(ctx, "ADMIN"); return mutate(ctx, "jse_undo_redo", ctx.body || {}); });
post("/api/reject-open-orders", async (ctx) => { need(ctx, "ADMIN"); return mutate(ctx, "jse_reject_open_orders", ctx.body || {}); });
post("/api/ipo-allotments", async (ctx) => {
  need(ctx, "ADMIN");
  const b = ctx.body || {};
  return mutate(ctx, b.clear ? "jse_ipo_allot_clear" : "jse_ipo_allot", b);
});
post("/api/ipo-admin", async (ctx) => {
  need(ctx, "ADMIN");
  return mutate(ctx, "jse_ipo_admin_tool", ctx.body || {}, ["admin:", "staff:", "pub:"]);
});
post("/api/big-bull", async (ctx) => {
  need(ctx, "ADMIN");
  return mutate(ctx, "jse_big_bull_admin", ctx.body || {}, ["admin:", "staff:", "pub:"]);
});
post("/api/teams", async (ctx) => { need(ctx, "ADMIN"); return mutate(ctx, "jse_update_teams", ctx.body || {}); });
post("/api/brokers", async (ctx) => { need(ctx, "ADMIN"); return mutate(ctx, "jse_update_brokers", ctx.body || {}); });
post("/api/config", async (ctx) => { need(ctx, "ADMIN"); return mutate(ctx, "jse_update_config", ctx.body || {}); });
get("/api/team-names", async (ctx) => {
  need(ctx, "ADMIN", "VIEWER");
  return respond(ctx, 200, await cached("admin:team-names", 2000, () => call("jse_team_names", actor(ctx), { action: "STATE" })));
});
post("/api/team-names", async (ctx) => {
  need(ctx, "ADMIN");
  const out = await mutate(ctx, "jse_team_names", ctx.body || {});
  sessions.clear();
  return out;
});
get("/api/users", async (ctx) => { need(ctx, "ADMIN"); return json(ctx, await call("jse_admin_users", actor(ctx), { action: "LIST" })); });
post("/api/users", async (ctx) => {
  need(ctx, "ADMIN");
  const out = await mutate(ctx, "jse_admin_users", ctx.body || {}, []);
  sessions.clear();
  return out;
});

// Excel / CSV imports: Teams (Team, Team Name, Section, Broker, Members) · Brokers (Broker Code, Broker Name[, Contact, Desk])
// · IPO allotments (Team, IPO, Lots, Shares, Amount). The file is parsed here; the engine validates every row atomically.
const IMPORTS: Record<string, { fn: string; required: string[]; map: Record<string, string> }> = {
  roster_assignments: { fn: "jse_import_roster_assignments", required: ["team_number", "team_code", "broker_number", "broker_code", "broker_name"], map: { "team number": "team_number", "team no": "team_number", "team code": "team_code", "broker number": "broker_number", "broker no": "broker_number", "broker code": "broker_code", "broker name": "broker_name" } },
  dalal_roster: { fn: "jse_import_dalal_roster", required: ["team", "broker_code"], map: { "team name": "team", "team code": "team", "broker code": "broker_code", "section combination": "section_combination", "section 1": "section1", "section 2": "section2", "participant 1": "participant1", "contact number 1": "phone1", "usn 1": "usn1", "email 1": "email1", "participant 2": "participant2", "contact number 2": "phone2", "usn 2": "usn2", "email 2": "email2" } },
  companies: { fn: "jse_import_companies", required: ["name", "ticker", "base_price"], map: { "company name": "name", name: "name", company: "name", ticker: "ticker", symbol: "ticker", "base price": "base_price", "base_price": "base_price", price: "base_price" } },
  teams: { fn: "jse_update_teams", required: ["team"], map: { team: "team", "team code": "team", "team name": "name", name: "name", section: "section", broker: "broker", "broker code": "broker", members: "members", "participant members": "members" } },
  brokers: { fn: "jse_update_brokers", required: ["broker"], map: { "broker code": "broker", broker: "broker", code: "broker", "broker name": "name", name: "name", contact: "contact", "broker contact": "contact", desk: "desk", "broker desk": "desk" } },
  allotments: { fn: "jse_ipo_allot", required: ["team", "ipo", "lots"], map: { team: "team", "team code": "team", ipo: "ipo", "ipo code": "ipo", symbol: "ipo", lots: "lots", shares: "shares", quantity: "shares", amount: "amount" } },
};
post("/api/import", async (ctx) => {
  need(ctx, "ADMIN");
  const b = ctx.body || {};
  const spec = IMPORTS[String(b.kind || "")];
  if (!spec) throw new ApiError(400, "INVALID_IMPORT", "Choose what to import: roster assignments, companies, teams, brokers or allotments.");
  let rows: string[][];
  try {
    if (typeof b.csv_text === "string") rows = readCsv(b.csv_text);
    else {
      const bytes = Buffer.from(String(b.data_base64 || ""), "base64");
      if (!bytes.length) throw new Error("The file is empty.");
      rows = /\.csv$/i.test(String(b.filename || "")) ? readCsv(bytes.toString("utf8")) : readXlsx(new Uint8Array(bytes));
    }
  } catch (e) {
    throw new ApiError(400, "UNREADABLE_FILE", (e as Error).message || "The file could not be read.");
  }
  const headerRow = rows.findIndex((r) => r.some((c) => spec.map[c.trim().toLowerCase()]));
  if (headerRow < 0) throw new ApiError(400, "MISSING_HEADERS", "The first row must contain the column names (" + Object.keys(spec.map).slice(0, 5).join(", ") + ").");
  const header = rows[headerRow].map((c) => spec.map[c.trim().toLowerCase()] || "");
  const missing = spec.required.filter((k) => !header.includes(k));
  if (missing.length) throw new ApiError(400, "MISSING_HEADERS", "Missing column(s): " + missing.join(", ") + ".");
  let data = rows.slice(headerRow + 1).filter((r) => r.some((c) => c !== "")).map((r) => {
    const o: Record<string, string> = {};
    header.forEach((k, i) => { if (k && r[i] !== undefined && r[i] !== "") o[k] = r[i]; });
    return o;
  });
  if (!data.length) throw new ApiError(400, "NO_ROWS", "The file has no data rows.");
  if (String(b.kind) === "dalal_roster") {
    const clean = (v: unknown) => String(v ?? "").trim();
    data = data.map((r) => {
      const section = clean(r.section_combination) || [clean(r.section1), clean(r.section2)].filter(Boolean).join(" + ");
      const participant = (n: "1" | "2") => [
        clean(r["participant" + n]),
        clean(r["usn" + n]) ? "USN: " + clean(r["usn" + n]) : "",
        clean(r["phone" + n]) ? "Mobile: " + clean(r["phone" + n]) : "",
        clean(r["email" + n]) ? "Email: " + clean(r["email" + n]) : "",
      ].filter(Boolean).join(" | ");
      return { team: clean(r.team), broker_code: clean(r.broker_code), section,
        members: [participant("1"), participant("2")].filter(Boolean).join(" ; ") };
    });
  }
  if (data.length > (String(b.kind) === "roster_assignments" ? 10000 : 2000)) throw new ApiError(400, "TOO_MANY_ROWS", String(b.kind) === "roster_assignments" ? "At most 10,000 roster rows per upload; split a larger file into validated batches." : "At most 2,000 rows per import.");
  return mutate(ctx, spec.fn, { rows: data, admin_password: b.admin_password, dry_run: !!b.dry_run, replace: !!b.replace, batch_id: b.filename ? String(b.filename).slice(0, 60) : undefined });
}, 3_000_000);

// ---- reports, certificates, exports ----
get("/api/reports", async (ctx) => {
  need(ctx, "ADMIN", "VIEWER");
  return respond(ctx, 200, await cached("staff:reports", 3000, () => call("jse_reports", actor(ctx), {})));
});

let SHEETS: Array<[string, string]> | null = null;
async function sheetList(): Promise<Array<[string, string]>> {
  if (!SHEETS) SHEETS = (await rawQuery("SELECT jse_export_sheets() AS s")).rows[0].s as Array<[string, string]>;
  return SHEETS;
}
function stamp(): string {
  const t = new Date(Date.now() + 5.5 * 3600 * 1000).toISOString();
  return t.slice(0, 10) + "_" + t.slice(11, 16).replace(":", "");
}
get("/api/export", async (ctx) => {
  need(ctx, "ADMIN", "VIEWER");
  const sheet = q(ctx, "sheet") || "networth";
  const format = (q(ctx, "format") || "csv").toLowerCase();
  const out = await call("jse_export", actor(ctx), { sheet });
  if (format === "json") return json(ctx, out);
  const csv = toCsv(out.columns, out.rows);
  return new Response(csv, { status: 200, headers: {
    "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="JSE_${sheet}_${stamp()}.csv"`,
    "cache-control": "no-store", ...corsHeaders(ctx) } });
});
get("/api/export-event-excel", async (ctx) => {
  need(ctx, "ADMIN", "VIEWER");
  const sheets: Sheet[] = [];
  for (const [key, title] of await sheetList()) {
    const out = await call("jse_export", actor(ctx), { sheet: key });
    sheets.push({ name: title, columns: out.columns, rows: out.rows });
  }
  const bytes = buildXlsx(sheets, "JAIN STOCK EXCHANGE — Final Event Report");
  await call("jse_audit_note", actor(ctx), { action: "EXPORT_EVENT_EXCEL", sheets: sheets.length }).catch(() => null);
  return new Response(bytes, { status: 200, headers: {
    "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "content-disposition": `attachment; filename="JSE_Final_Event_Report_${stamp()}.xlsx"`, "cache-control": "no-store", ...corsHeaders(ctx) } });
});
// One CSV file for the whole event: every section stacked one after another (title row, header row, data rows, blank line).
const EVENT_CSV_SECTIONS: Array<[string, string]> = [
  ["winner", "WINNER & RUNNER-UP"], ["networth", "NET WORTH & P/L"],
  ["trades", "ALL TRANSACTIONS (SETTLED TRADES)"], ["orders", "ALL ORDERS (INCLUDING REJECTED)"],
  ["ledger", "CASH LEDGER"], ["prices", "PRICE CHANGES"], ["news", "MARKET NEWS"], ["audit", "AUDIT LOG"],
];
get("/api/export-event-csv", async (ctx) => {
  need(ctx, "ADMIN", "VIEWER");
  const event = await call("jse_event_status", null).catch(() => null);
  const parts: string[] = [
    toCsv(["JAIN STOCK EXCHANGE — FINAL EVENT CSV"], [
      ["Event: " + (event?.event_name || "DALAL STREET 2026")],
      ["Status: " + String(event?.status || "").replace(/_/g, " ")],
      ["Generated (IST): " + stamp().replace("_", " ").replace(/(\d\d)(\d\d)$/, "$1:$2")],
      ["Sections: " + EVENT_CSV_SECTIONS.map(([, t]) => t).join(" | ")],
    ]),
  ];
  for (const [key, title] of EVENT_CSV_SECTIONS) {
    const out = await call("jse_export", actor(ctx), { sheet: key });
    parts.push(toCsv([title + " (" + out.rows.length + " rows)"], []) + toCsv(out.columns, out.rows));
  }
  const body = "\ufeff" + parts.map((x) => x.replace(/\ufeff/g, "")).join("\r\n");
  await call("jse_audit_note", actor(ctx), { action: "EXPORT_EVENT_CSV", sheets: EVENT_CSV_SECTIONS.length }).catch(() => null);
  return new Response(body, { status: 200, headers: {
    "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="JSE_Final_Event_${stamp()}.csv"`,
    "cache-control": "no-store", ...corsHeaders(ctx) } });
});
get("/api/export-event-json", async (ctx) => {
  need(ctx, "ADMIN", "VIEWER");
  const sheets: Record<string, unknown> = {};
  for (const [key, title] of await sheetList()) {
    const out = await call("jse_export", actor(ctx), { sheet: key });
    sheets[key] = { title, columns: out.columns, rows: out.rows };
  }
  const event = await call("jse_event_status", null);
  const body = JSON.stringify({ success: true, service: "JAIN STOCK EXCHANGE", version: VERSION, generated_at: new Date().toISOString(), event, sheets });
  await call("jse_audit_note", actor(ctx), { action: "EXPORT_EVENT_JSON", sheets: Object.keys(sheets).length }).catch(() => null);
  return new Response(body, { status: 200, headers: {
    "content-type": "application/json; charset=utf-8", "content-disposition": `attachment; filename="JSE_Final_Event_${stamp()}.json"`,
    "cache-control": "no-store", ...corsHeaders(ctx) } });
});

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
async function readBody(req: Request, max = 2_000_000): Promise<any> {
  const len = Number(req.headers.get("content-length") || 0);
  if (len > max) throw new ApiError(413, "TOO_LARGE", "The request is too large.");
  const text = await req.text();
  if (text.length > max) throw new ApiError(413, "TOO_LARGE", "The request is too large.");
  if (!text.trim()) return {};
  try { return JSON.parse(text); } catch { throw new ApiError(400, "INVALID_JSON", "The request body is not valid JSON."); }
}

function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  return (req.headers.get("cf-connecting-ip") || (xf ? xf.split(",")[0].trim() : "") || req.headers.get("x-real-ip") || "").slice(0, 64);
}

export async function handle(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const ctx: Ctx = {
    req, url, method: req.method.toUpperCase(), ip: clientIp(req), ua: (req.headers.get("user-agent") || "").slice(0, 300),
    origin: req.headers.get("origin"), token: null, user: null, body: null, started: Date.now(),
    reqId: (req.headers.get("x-request-id") || randomUUID()).slice(0, 36),
  };
  if (ctx.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(ctx) });
  let path = url.pathname.replace(/\/+$/, "") || "/";
  if (!path.startsWith("/api")) path = "/api" + (path === "/" ? "/health" : path);
  try {
    const route = routes.get(ctx.method + " " + path);
    if (!route) {
      const other = routes.has((ctx.method === "GET" ? "POST " : "GET ") + path);
      throw new ApiError(other ? 405 : 404, other ? "METHOD_NOT_ALLOWED" : "NOT_FOUND", other ? "Method not allowed." : "Unknown API endpoint: " + path);
    }
    await ensureMigrated();
    const auth = req.headers.get("authorization") || "";
    ctx.token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : null;
    ctx.user = await resolveUser(ctx.token);
    if (ctx.method === "POST") ctx.body = await readBody(req, route.maxBody);
    return await route.h(ctx);
  } catch (e) {
    return fail(ctx, e);
  }
}

export default { fetch: handle };
