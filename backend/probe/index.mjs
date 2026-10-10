// In-region load probe (Neon Function "jseprobe", same region as the API).
// Measures the API's capacity without the long internet round trip of an external load generator:
// POST { token: <GitHub Actions OIDC token>, target, rps, seconds, viewers } → JSON summary.
// Only public GET endpoints are exercised, only against the JSE API host prefix, and only for callers
// holding a valid OIDC token from this repository (same check as the staging CI sign-in).
import { createPublicKey, verify } from "node:crypto";

const ISSUER = "https://token.actions.githubusercontent.com";
const REPO = process.env.PROBE_REPOSITORY || "patelajay0281/jain-stock-exchange";
const ALLOWED = /^https:\/\/br-lingering-sun-azzfzwj1-[a-z0-9]+\.compute\.c-3\.ap-southeast-1\.aws\.neon\.tech$/;
let jwks = null;
const b64 = (s) => Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");

async function checkToken(token) {
  const [h, p, s] = String(token || "").split(".");
  if (!s) throw new Error("malformed token");
  const header = JSON.parse(b64(h)), claims = JSON.parse(b64(p));
  if (!jwks || Date.now() - jwks.at > 3600e3) jwks = { at: Date.now(), keys: (await (await fetch(ISSUER + "/.well-known/jwks")).json()).keys };
  const jwk = jwks.keys.find((k) => k.kid === header.kid);
  if (!jwk || header.alg !== "RS256") throw new Error("unknown key");
  if (!verify("RSA-SHA256", Buffer.from(h + "." + p), createPublicKey({ key: jwk, format: "jwk" }), b64(s))) throw new Error("bad signature");
  const aud = [].concat(claims.aud);
  if (claims.iss !== ISSUER || !aud.includes("jse-staging") || claims.repository !== REPO || claims.exp < Date.now() / 1000) throw new Error("claims rejected");
}

function pct(a, q) { if (!a.length) return 0; const s = Float64Array.from(a).sort(); return +s[Math.min(s.length - 1, Math.floor((s.length - 1) * q))].toFixed(1); }

async function run(target, rps, seconds, viewers) {
  const tags = new Array(viewers).fill(null), lat = [], codes = {};
  let sent = 0, inflight = 0, maxInflight = 0, errors = 0;
  const mix = [[70, () => { const v = Math.floor(Math.random() * viewers); return ["/api/market", v]; }], [20, () => ["/api/event-status"]], [5, () => ["/api/insights"]], [5, () => ["/api/market-news?limit=15"]]];
  const one = async () => {
    let r = Math.random() * 100, pick = mix[0][1];
    for (const m of mix) { if ((r -= m[0]) < 0) { pick = m[1]; break; } }
    const [path, v] = pick();
    inflight++; if (inflight > maxInflight) maxInflight = inflight;
    const t0 = performance.now();
    try {
      const res = await fetch(target + path, { headers: { "accept-encoding": "gzip", ...(v !== undefined && tags[v] ? { "if-none-match": tags[v] } : {}) }, signal: AbortSignal.timeout(15000) });
      if (v !== undefined && res.headers.get("etag")) tags[v] = res.headers.get("etag");
      await res.arrayBuffer();
      codes[res.status] = (codes[res.status] || 0) + 1;
    } catch { errors++; codes[0] = (codes[0] || 0) + 1; }
    if (lat.length < 300000) lat.push(performance.now() - t0);
    inflight--;
  };
  const t0 = performance.now();
  await new Promise((done) => {
    const timer = setInterval(() => {
      const el = (performance.now() - t0) / 1000;
      if (el >= seconds) { clearInterval(timer); done(); return; }
      const due = Math.floor(el * rps) - sent;
      for (let i = 0; i < due; i++) { sent++; if (inflight < 2000) one(); else codes.skipped = (codes.skipped || 0) + 1; }
    }, 5);
  });
  while (inflight > 0) await new Promise((r) => setTimeout(r, 20));
  const secs = (performance.now() - t0) / 1000, ok = (codes[200] || 0) + (codes[304] || 0);
  return { target, target_rps: rps, seconds: +secs.toFixed(1), requests: sent, achieved_rps: +(sent / secs).toFixed(1), success: ok,
    success_rate_pct: +(100 * ok / Math.max(1, sent)).toFixed(3), status_codes: codes, errors, max_inflight: maxInflight,
    p50_ms: pct(lat, 0.5), p95_ms: pct(lat, 0.95), p99_ms: pct(lat, 0.99), max_ms: +Math.max(0, ...lat.slice(0, 100000)).toFixed(1) };
}

export default {
  async fetch(req) {
    if (req.method !== "POST") return new Response("POST { token, target, rps, seconds }", { status: 405 });
    let body;
    try { body = await req.json(); await checkToken(body.token); } catch (e) { return Response.json({ success: false, error: String(e.message || e) }, { status: 403 }); }
    const target = String(body.target || "").replace(/\/$/, "");
    if (!ALLOWED.test(target)) return Response.json({ success: false, error: "target not allowed" }, { status: 400 });
    const rps = Math.max(1, Math.min(1500, body.rps | 0)), seconds = Math.max(1, Math.min(300, body.seconds | 0)), viewers = Math.max(1, Math.min(2000, body.viewers | 0 || 600));
    return Response.json({ success: true, region: process.env.NEON_REGION || null, ...(await run(target, rps, seconds, viewers)) });
  },
};
