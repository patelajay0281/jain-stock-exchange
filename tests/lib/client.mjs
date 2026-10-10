// Shared HTTP client for the stress and load tools: sign-in helpers (password locally,
// GitHub OIDC on staging) and latency bookkeeping. Node's fetch keeps connections alive.

export const BASE = (process.env.BASE || "http://127.0.0.1:8788").replace(/\/$/, "");

/** Local test databases use known passwords (tests/test-passwords.sql); staging uses CI sign-in. */
export function localPassword(username) {
  const known = { ADMIN: "admin-pass-1", "PIT-01": "pit-pass-01", "EXCHANGE-01": "exch-pass-01", "BANK-01": "bank-pass-01",
    "INST-01": "inst-pass-01", "TEAM-001": "team-pass-001", "TEAM-002": "team-pass-002", "FACULTY-01": "faculty-pass-1" };
  return known[username] || username.toLowerCase() + "-pw";
}

let oidc = null;
async function oidcToken() {
  if (process.env.CI_OIDC_TOKEN) return process.env.CI_OIDC_TOKEN;
  const url = process.env.ACTIONS_ID_TOKEN_REQUEST_URL, bearer = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
  if (!url || !bearer) return null;
  if (oidc && Date.now() - oidc.at < 4 * 60_000) return oidc.token;
  const r = await fetch(url + "&audience=" + encodeURIComponent(process.env.CI_OIDC_AUDIENCE || "jse-staging"), { headers: { authorization: "Bearer " + bearer } });
  if (!r.ok) throw new Error("could not get a GitHub OIDC token: " + r.status);
  oidc = { token: (await r.json()).value, at: Date.now() };
  return oidc.token;
}

/** Returns a bearer token for `username`. */
export async function signIn(username) {
  const t = await oidcToken();
  const r = t
    ? await fetch(BASE + "/api/ci-login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token: t, username }) })
    : await fetch(BASE + "/api/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ username, password: localPassword(username) }) });
  const d = await r.json();
  if (!r.ok || !d.token) throw new Error("sign-in failed for " + username + ": " + r.status + " " + JSON.stringify(d).slice(0, 200));
  return d.token;
}

export class Stats {
  constructor() { this.by = new Map(); this.codes = new Map(); this.errors = new Map(); this.total = 0; this.failed = 0; }
  add(name, ms, status, ok) {
    let e = this.by.get(name); if (!e) { e = { n: 0, fail: 0, lat: [] }; this.by.set(name, e); }
    e.n++; this.total++; if (!ok) { e.fail++; this.failed++; }
    if (e.lat.length < 400_000) e.lat.push(ms); else e.lat[Math.floor(Math.random() * e.lat.length)] = ms;   // reservoir
    this.codes.set(status, (this.codes.get(status) || 0) + 1);
  }
  err(key) { this.errors.set(key, (this.errors.get(key) || 0) + 1); }
  static pct(arr, p) { if (!arr.length) return 0; const s = Float64Array.from(arr).sort(); return s[Math.min(s.length - 1, Math.floor((s.length - 1) * p))]; }
  summary() {
    const endpoints = {};
    const all = [];
    for (const [k, e] of this.by) {
      all.push(...e.lat.slice(0, 50_000));
      endpoints[k] = { requests: e.n, failed: e.fail, p50_ms: +Stats.pct(e.lat, 0.5).toFixed(1), p95_ms: +Stats.pct(e.lat, 0.95).toFixed(1),
        p99_ms: +Stats.pct(e.lat, 0.99).toFixed(1), max_ms: +Math.max(0, ...e.lat.slice(0, 200_000)).toFixed(1) };
    }
    return { requests: this.total, failed: this.failed, status_codes: Object.fromEntries([...this.codes].sort()), errors: Object.fromEntries(this.errors),
      p50_ms: +Stats.pct(all, 0.5).toFixed(1), p95_ms: +Stats.pct(all, 0.95).toFixed(1), p99_ms: +Stats.pct(all, 0.99).toFixed(1), endpoints };
  }
}

const PLATFORM_RETRIES = Number(process.env.RETRY_429 ?? 4);
export const counters = { platform429: 0 };

/**
 * One API call with timing. Returns { status, data, ms, etag }.
 * Like the browser client, a plain-text 429 from the hosting platform's concurrency limiter (the API never ran)
 * is retried after Retry-After; the recorded latency includes those waits. RETRY_429=0 disables this.
 */
export async function call(stats, name, method, path, { token, body, etag, timeout = 20_000, extra } = {}) {
  const headers = { accept: "application/json", "accept-encoding": "gzip" };
  if (token) headers.authorization = "Bearer " + token;
  if (body !== undefined) headers["content-type"] = "application/json";
  if (etag) headers["if-none-match"] = etag;
  const t0 = performance.now();
  let status = 0, data = null, tag = null;
  for (let attempt = 0; ; attempt++) {
    status = 0; data = null; tag = null;
    let platform = false, retryAfter = 0;
    try {
      const r = await fetch(BASE + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(timeout) });
      status = r.status; tag = r.headers.get("etag");
      const ct = r.headers.get("content-type") || "";
      platform = status === 429 && !ct.includes("json");
      retryAfter = parseFloat(r.headers.get("retry-after") || "0");
      if (status !== 304) { const txt = await r.text(); try { data = JSON.parse(txt); } catch { data = { raw: txt.slice(0, 200) }; } }
    } catch (e) {
      data = { error: String(e?.cause?.code || e?.name || e) };
    }
    if (platform && attempt < PLATFORM_RETRIES) {
      counters.platform429++;
      if (stats) stats.err("platform 429 (retried)");
      await sleep(Math.min(3000, (retryAfter > 0 ? retryAfter * 1000 : 400) * (0.6 + Math.random() * 0.8) + 250 * attempt));
      continue;
    }
    break;
  }
  const ms = performance.now() - t0;
  const ok = status === 200 || status === 304;
  for (const st of [stats, extra]) {
    if (!st) continue;
    st.add(name, ms, status, ok || (status >= 400 && status < 500 && status !== 429));
    if (status === 0) st.err(name + ": " + data.error);
  }
  return { status, data, ms, etag: tag };
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
