// JAIN STOCK EXCHANGE (JSE) v272 — API server (Neon Functions / Node.js 24).
// Default export is a fetch handler: { fetch(request): Promise<Response> }.
import { createHash, randomUUID } from "node:crypto";
import { gzipSync } from "node:zlib";
import { ApiError, call, ensureMigrated, rawQuery } from "./db";
import { buildXlsx, toCsv, type Sheet } from "./xlsx";

export const VERSION = "2.72.0";
const STARTED = Date.now();

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
type Role = "ADMIN" | "EXCHANGE" | "BANK" | "BROKER" | "INSTITUTIONAL" | "PARTICIPANT" | "VIEWER";
interface User {
  id: number; username: string; name: string; email?: string | null; role: Role;
  team_id?: number | null; team?: string | null; broker_id?: number | null; broker?: string | null;
  institution_id?: number | null; institution?: string | null; session?: string; must_change_password?: boolean;
}
interface Ctx {
  req: Request; url: URL; method: string; ip: string; ua: string; origin: string | null;
  token: string | null; user: User | null; body: any; started: number; reqId: string;
}

const STAFF: Role[] = ["ADMIN", "EXCHANGE", "BANK", "BROKER", "INSTITUTIONAL", "VIEWER"];

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
    h["access-control-expose-headers"] = "ETag, X-JSE-Version, X-Request-Id, Content-Disposition";
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
    "cache-control": cacheSeconds > 0 ? `public, max-age=${cacheSeconds}, must-revalidate` : "no-store",
    etag: payload.etag, ...corsHeaders(ctx), ...extra,
  };
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
    // serve stale data for up to 30 s if the database hiccups
    if (entry.value && Date.now() - entry.at < 30_000) return entry.value;
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
    session: u?.session ?? null, ip: ctx.ip, ua: ctx.ua,
  };
}

function need(ctx: Ctx, ...roles: Role[]): User {
  if (!ctx.user) throw new ApiError(401, "UNAUTHENTICATED", "Please sign in to continue.");
  if (roles.length && !roles.includes(ctx.user.role)) {
    throw new ApiError(403, "FORBIDDEN", `Your role (${ctx.user.role}) cannot do this.`);
  }
  return ctx.user;
}

// ---------------------------------------------------------------------------
// Simple rate limiting (per process): login attempts and write bursts per client
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
const routes = new Map<string, Handler>();
const get = (p: string, h: Handler) => routes.set("GET " + p, h);
const post = (p: string, h: Handler) => routes.set("POST " + p, h);
const q = (ctx: Ctx, k: string) => (ctx.url.searchParams.get(k) || "").trim();

// mutation helper: call the engine, then clear caches that could now be stale
async function mutate(ctx: Ctx, fn: string, params: unknown, clear?: string[]): Promise<Response> {
  if (!rateLimit("w:" + (ctx.user?.id ?? ctx.ip), 15, 40)) {
    throw new ApiError(429, "TOO_MANY_REQUESTS", "Too many actions in a short time. Please wait a moment.");
  }
  const out = await call(fn, actor(ctx), params);
  invalidate(clear);
  return json(ctx, out);
}

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
get("/api/insights", async (ctx) => respond(ctx, 200, await cached("pub:insights", 2500, () => call("jse_insights", null)), {}, 2));
get("/api/market-news", async (ctx) => {
  const limit = Math.min(200, Math.max(1, Number(q(ctx, "limit")) || 30));
  return respond(ctx, 200, await cached("pub:news:" + limit, 1500, () => call("jse_news_list", null, { limit }, { noActor: true })), {}, 1);
});
get("/api/cms50", async (ctx) => {
  const m = JSON.parse((await cached("pub:market", 900, () => call("jse_market", null))).body);
  return json(ctx, { success: true, name: "CMS INDEX", status: m.status, ...m.index, stock_count: m.stocks.length, ipo_count: m.ipos.length });
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
  const out = await call("jse_change_password", actor(ctx), ctx.body || {});
  sessions.clear();
  return json(ctx, out);
});

// ---- portfolios ----
get("/api/portfolios", async (ctx) => {
  need(ctx, ...STAFF);
  return respond(ctx, 200, await cached("staff:portfolios", 1800, () => call("jse_portfolios", actor(ctx), {})));
});
get("/api/portfolio-details", async (ctx) => {
  const u = need(ctx);
  const team = (u.role === "PARTICIPANT" ? u.team : q(ctx, "team")) || "";
  if (!team) throw new ApiError(400, "TEAM_REQUIRED", "Choose a team.");
  return respond(ctx, 200, await cached("pd:" + team.toUpperCase() + ":" + (u.role === "PARTICIPANT" ? u.id : "staff"), 1500,
    () => call("jse_portfolio_detail", actor(ctx), { team })));
});

// ---- orders / tracking ----
function trackingParams(ctx: Ctx) {
  const p: Record<string, string> = {};
  for (const k of ["team", "status", "side", "kind", "account", "q", "page", "page_size"]) { const v = q(ctx, k); if (v) p[k] = v; }
  return p;
}
const trackingHandler: Handler = async (ctx) => {
  const u = need(ctx);
  const p = trackingParams(ctx);
  const key = "trk:" + (u.role === "PARTICIPANT" ? "p" + u.team_id : "s") + ":" + JSON.stringify(p);
  return respond(ctx, 200, await cached(key, 1200, () => call("jse_tracking", actor(ctx), p)));
};
get("/api/tracking", trackingHandler);
get("/api/orders", trackingHandler);
get("/api/order", async (ctx) => {
  need(ctx);
  return json(ctx, await call("jse_order_detail", actor(ctx), { order_id: q(ctx, "id") || undefined, order_no: q(ctx, "order_no") || undefined }));
});
post("/api/orders", async (ctx) => {
  need(ctx, "ADMIN", "BROKER", "PARTICIPANT");
  const b = ctx.body || {};
  if (Array.isArray(b.legs)) {
    // paired buyer/seller ticket: two linked orders created in one transaction
    return mutate(ctx, "jse_place_pair", b, ["trk:", "staff:", "pd:", "q:"]);
  }
  return mutate(ctx, "jse_place_order", b, ["trk:", "staff:", "pd:", "q:"]);
});

// ---- exchange ----
get("/api/exchange", async (ctx) => {
  need(ctx, "ADMIN", "EXCHANGE", "VIEWER");
  return respond(ctx, 200, await cached("q:exchange", 900, () => call("jse_exchange_queue", actor(ctx), {})));
});
post("/api/exchange", async (ctx) => {
  need(ctx, "ADMIN", "EXCHANGE");
  return mutate(ctx, "jse_exchange_decide", ctx.body || {}, ["q:", "trk:", "staff:", "pd:", "pub:status"]);
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
  return mutate(ctx, fn, { ...b, release: action === "RELEASE" }, action === "CLAIM" || action === "RELEASE" ? ["q:bank"] : undefined);
});

// ---- loans ----
get("/api/loan", async (ctx) => {
  need(ctx, "ADMIN", "BANK", "VIEWER");
  return respond(ctx, 200, await cached("q:loans", 1500, () => call("jse_loans", actor(ctx), {})));
});
post("/api/loan", async (ctx) => { need(ctx, "ADMIN", "BANK"); return mutate(ctx, "jse_loan_action", ctx.body || {}); });

// ---- ledgers, audit, commissions ----
get("/api/cash", async (ctx) => {
  const u = need(ctx, "ADMIN", "BANK", "VIEWER", "PARTICIPANT", "EXCHANGE");
  const p: Record<string, string> = {};
  for (const k of ["team", "type", "q", "page", "page_size"]) { const v = q(ctx, k); if (v) p[k] = v; }
  return respond(ctx, 200, await cached("cash:" + (u.role === "PARTICIPANT" ? u.team_id : "s") + ":" + JSON.stringify(p), 1500,
    () => call("jse_cash", actor(ctx), p)));
});
get("/api/audit", async (ctx) => {
  need(ctx, "ADMIN", "VIEWER", "EXCHANGE", "BANK");
  const p: Record<string, string> = {};
  for (const k of ["action", "team", "q", "page", "page_size"]) { const v = q(ctx, k); if (v) p[k] = v; }
  return respond(ctx, 200, await cached("audit:" + JSON.stringify(p), 1500, () => call("jse_audit_log", actor(ctx), p)));
});
get("/api/commissions", async (ctx) => {
  need(ctx, ...STAFF);
  return respond(ctx, 200, await cached("staff:commissions", 2000, () => call("jse_commissions", actor(ctx), {})));
});

// ---- institutional ----
get("/api/institutional-portfolio", async (ctx) => {
  need(ctx, "ADMIN", "INSTITUTIONAL", "VIEWER");
  const id = q(ctx, "institution_id");
  return respond(ctx, 200, await cached("inst:" + (id || ctx.user?.institution_id || "default"), 1500,
    () => call("jse_institutional", actor(ctx), id ? { institution_id: id } : {})));
});
post("/api/institutional-order", async (ctx) => {
  need(ctx, "ADMIN", "INSTITUTIONAL");
  return mutate(ctx, "jse_place_institutional_order", ctx.body || {}, ["inst:", "trk:", "q:", "staff:"]);
});

// ---- market news ----
post("/api/market-news", async (ctx) => { need(ctx, "ADMIN"); return mutate(ctx, "jse_market_news", ctx.body || {}); });

// ---- event administration ----
get("/api/admin-state", async (ctx) => {
  need(ctx, "ADMIN", "VIEWER");
  return respond(ctx, 200, await cached("admin:state", 1500, () => call("jse_admin_state", actor(ctx), {})));
});
post("/api/event", async (ctx) => { need(ctx, "ADMIN"); return mutate(ctx, "jse_event_action", ctx.body || {}); });
post("/api/reset-event", async (ctx) => {
  need(ctx, "ADMIN");
  const out = await call("jse_reset_event", actor(ctx), ctx.body || {});
  invalidate();
  return json(ctx, out);
});
post("/api/undo-redo", async (ctx) => { need(ctx, "ADMIN"); return mutate(ctx, "jse_undo_redo", ctx.body || {}); });
post("/api/reject-open-orders", async (ctx) => { need(ctx, "ADMIN"); return mutate(ctx, "jse_reject_open_orders", ctx.body || {}); });
post("/api/ipo-allotments", async (ctx) => {
  need(ctx, "ADMIN");
  const b = ctx.body || {};
  return mutate(ctx, b.clear ? "jse_ipo_allot_clear" : "jse_ipo_allot", b);
});
post("/api/teams", async (ctx) => { need(ctx, "ADMIN"); return mutate(ctx, "jse_update_teams", ctx.body || {}); });
post("/api/brokers", async (ctx) => { need(ctx, "ADMIN"); return mutate(ctx, "jse_update_brokers", ctx.body || {}); });
post("/api/config", async (ctx) => { need(ctx, "ADMIN"); return mutate(ctx, "jse_update_config", ctx.body || {}); });
get("/api/users", async (ctx) => { need(ctx, "ADMIN"); return json(ctx, await call("jse_admin_users", actor(ctx), { action: "LIST" })); });
post("/api/users", async (ctx) => {
  need(ctx, "ADMIN");
  const out = await call("jse_admin_users", actor(ctx), ctx.body || {});
  sessions.clear();
  return json(ctx, out);
});

// ---- reports, certificates, exports ----
get("/api/reports", async (ctx) => {
  need(ctx, "ADMIN", "VIEWER");
  return respond(ctx, 200, await cached("staff:reports", 3000, () => call("jse_reports", actor(ctx), {})));
});
get("/api/certificates", async (ctx) => {
  need(ctx, "ADMIN", "VIEWER");
  return respond(ctx, 200, await cached("staff:certificates", 3000, () => call("jse_certificates", actor(ctx), {})));
});

const SHEETS: Array<[string, string]> = [
  ["winner", "Winner"], ["teams", "Team Details"], ["participants", "Participant Details"], ["brokers", "Broker Details"],
  ["cash", "Cash"], ["holdings", "Holdings"], ["sold_stocks", "Sold Stocks"], ["sold_ipos", "Sold IPOs"],
  ["networth", "Net Worth & PL"], ["loans", "Loans & Interest"], ["cash_rule", "Cash Rule"],
  ["short_sell", "Short Selling Attempts"], ["cash_shortfall", "Cash Shortfall Attempts"], ["insufficient_balance", "Insufficient Balance Rejections"],
  ["orders", "Order Tracking"], ["rejected", "Rejected Orders"], ["trades", "Trade History"], ["ledger", "Cash Ledger"],
  ["commission", "Broker Commission"], ["institutional", "Institutional Investors"], ["news", "Market News"],
  ["prices", "Price History"], ["audit", "Audit Logs"],
];
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
  for (const [key, title] of SHEETS) {
    const out = await call("jse_export", actor(ctx), { sheet: key });
    sheets.push({ name: title, columns: out.columns, rows: out.rows });
  }
  const bytes = buildXlsx(sheets, "JAIN STOCK EXCHANGE — Final Event Report");
  await call("jse_audit_note", actor(ctx), { action: "EXPORT_EVENT_EXCEL", sheets: sheets.length }).catch(() => null);
  return new Response(bytes, { status: 200, headers: {
    "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "content-disposition": `attachment; filename="JSE_Final_Event_Report_${stamp()}.xlsx"`, "cache-control": "no-store", ...corsHeaders(ctx) } });
});

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
async function readBody(req: Request): Promise<any> {
  const len = Number(req.headers.get("content-length") || 0);
  if (len > 2_000_000) throw new ApiError(413, "TOO_LARGE", "The request is too large.");
  const text = await req.text();
  if (text.length > 2_000_000) throw new ApiError(413, "TOO_LARGE", "The request is too large.");
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
    if (ctx.method === "POST") ctx.body = await readBody(req);
    return await route(ctx);
  } catch (e) {
    return fail(ctx, e);
  }
}

export default { fetch: handle };
