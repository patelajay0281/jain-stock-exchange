// Runs the suites named in tests/ci/run.json against a deployed environment and writes one
// results file to tests/ci/results/. Used by .github/workflows/staging-tests.yml.
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const cfg = JSON.parse(readFileSync(process.env.RUN_CONFIG || new URL("./run.json", import.meta.url), "utf8"));
const BASE = cfg.base.replace(/\/$/, "");
process.env.BASE = BASE;   // tests/lib/client.mjs (signIn) reads it when first imported
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const runId = process.env.GITHUB_RUN_ID || "local";
mkdirSync("tests/ci/results", { recursive: true });
const results = { base: BASE, started_at: new Date().toISOString(), run_id: runId, commit: process.env.GITHUB_SHA || null, config: cfg, suites: {} };

function run(name, cmd, args, env = {}, timeoutMin = 30) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const child = spawn(cmd, args, { env: { ...process.env, BASE, ...env }, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    const keep = (d) => { out += d; if (out.length > 400_000) out = out.slice(-300_000); process.stdout.write(d); };
    child.stdout.on("data", keep); child.stderr.on("data", keep);
    const timer = setTimeout(() => child.kill("SIGTERM"), timeoutMin * 60_000);
    child.on("close", (code) => {
      clearTimeout(timer);
      const passM = out.match(/^# pass (\d+)/m), failM = out.match(/^# fail (\d+)/m);
      const failures = [...out.matchAll(/^not ok \d+ - (.+)$/gm)].map((m) => m[1]);
      results.suites[name] = { exit_code: code, duration_s: Math.round((Date.now() - t0) / 1000),
        pass: passM ? Number(passM[1]) : undefined, fail: failM ? Number(failM[1]) : undefined, failures: failures.length ? failures : undefined,
        tail: out.split("\n").slice(-40).join("\n") };
      resolve(code);
    });
  });
}

// leave staging clean: market closed and reset, no saved IPO listing prices
async function cleanup() {
  const { signIn } = await import("../lib/client.mjs");
  const token = await signIn("ADMIN");
  const post = async (path, body) => {
    const r = await fetch(BASE + path, { method: "POST", headers: { "content-type": "application/json", authorization: "Bearer " + token }, body: JSON.stringify(body) });
    return { status: r.status, data: await r.json() };
  };
  const st = (await (await fetch(BASE + "/api/event-status")).json()).status;
  const steps = {};
  const pw = { admin_password: "ci-session" };   // CI sessions are exempt from the administrator password; the field keeps the real request shape
  if (st === "LIVE" || st === "SETTLEMENT_ONLY") { steps.reject = (await post("/api/reject-open-orders", pw)).status; steps.close = (await post("/api/event", { action: "CLOSE", ...pw })).status; }
  steps.reset = (await post("/api/reset-event", { confirm: "RESET", keep_allotments: false, ...pw })).status;
  steps.clear_listing = (await post("/api/ipo-listing", { action: "CLEAR", ...pw })).status;
  steps.clear_applications = (await post("/api/ipo-applications", { action: "CLEAR", ...pw })).status;
  results.suites.cleanup = steps;
}

async function health() {
  const t0 = Date.now();
  const r = await fetch(BASE + "/api/health");
  const d = await r.json();
  results.suites.health = { status: r.status, body: d, ms: Date.now() - t0 };
}

for (const s of cfg.suites) {
  try {
    if (s === "health") await health();
    else if (s === "prod_warm") {
      // first request to the production API: applies migrations + seed on a fresh database (read-only call)
      const t0 = Date.now();
      const r = await fetch(cfg.prod_base.replace(/\/$/, "") + "/api/event-status");
      const d = await r.json().catch(() => ({}));
      results.suites.prod_warm = { status: r.status, ms: Date.now() - t0, event_status: d.status, counts: d.counts, version: r.headers.get("x-jse-version") };
    }
    else if (s === "cleanup") await cleanup();
    else if (s === "probe") {
      // in-region load: the "jseprobe" Neon Function (same region as the API) generates the requests
      results.suites.probe = { runs: [] };
      for (const P of cfg.probes || []) {
        const r = await fetch(process.env.ACTIONS_ID_TOKEN_REQUEST_URL + "&audience=jse-staging", { headers: { authorization: "Bearer " + process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN } });
        const token = (await r.json()).value;
        const t0 = Date.now();
        const res = await fetch(cfg.probe_url, { method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ token, target: BASE, rps: P.rps, seconds: P.seconds, viewers: P.viewers || 600 }), signal: AbortSignal.timeout((P.seconds + 120) * 1000) });
        const text = await res.text();
        let report; try { report = JSON.parse(text); } catch { report = { raw: text.slice(0, 500) }; }
        results.suites.probe.runs.push({ config: P, http: res.status, wall_s: Math.round((Date.now() - t0) / 1000), report });
        console.log("[probe]", JSON.stringify({ rps: P.rps, http: res.status, achieved: report.achieved_rps, success: report.success_rate_pct, codes: report.status_codes, p95: report.p95_ms }));
        if (P.pause_s) await new Promise((x) => setTimeout(x, P.pause_s * 1000));
      }
    }
    else if (s === "ui") {
      const { signIn } = await import("../lib/client.mjs");
      const tokens = {};
      for (const u of ["ADMIN", "PIT-01", "EXCHANGE-01", "BANK-01", "TEAM-031"]) tokens[u] = await signIn(u);
      // the broker assigned to TEAM-031 (teams.broker_id) drives the Broker Desk part of the browser test
      const names = await (await fetch(BASE + "/api/team-names", { headers: { authorization: "Bearer " + tokens.ADMIN } })).json();
      tokens.BROKER = await signIn(names.teams.find((t) => t.team === "TEAM-031").broker);
      await run("ui", "python3", ["tests/ui_staging.py"], { SITE: cfg.site, API: BASE, UI_TOKENS: JSON.stringify(tokens) }, 20);
    }
    else if (s === "api") await run("api", "node", ["--test", "--test-concurrency=1", "tests/api.test.mjs"]);
    else if (s === "listing") await run("listing", "node", ["--test", "--test-concurrency=1", "tests/listing.test.mjs"]);
    else if (s === "stress") {
      const out = join(tmpdir(), "jse-stress.json");
      await run("stress", "node", ["tests/stress.mjs"], { ORDERS: String(cfg.stress?.orders || 1500), WORKERS: String(cfg.stress?.workers || 16), OUT: out }, 40);
      if (existsSync(out)) { const d = JSON.parse(readFileSync(out, "utf8")); delete d.http?.endpoints; results.suites.stress.report = d; }
    } else if (s === "load") {
      results.suites.load = { runs: [] };
      for (const [i, L] of (cfg.loads || [cfg.load || {}]).entries()) {
        const out = join(tmpdir(), "jse-load-" + i + ".json");
        await run("load_" + i, "node", ["tests/load.mjs"], { RPS: String(L.rps || 850), DURATION: String(L.duration || 90), WRITE_RPS: String(L.write_rps ?? 1),
          VIEWERS: String(L.viewers || 600), RAMP: String(L.ramp || 0), RETRY_429: String(L.retry_429 ?? 2), AUDIT: "1", OUT: out }, Math.ceil((L.duration || 90) / 60) + 20);
        const entry = { config: L, exit_code: results.suites["load_" + i].exit_code };
        if (existsSync(out)) entry.report = JSON.parse(readFileSync(out, "utf8"));
        results.suites.load.runs.push(entry);
        delete results.suites["load_" + i];
        if (L.pause_s) await new Promise((r) => setTimeout(r, L.pause_s * 1000));
      }
    }
  } catch (e) {
    results.suites[s] = { ...(results.suites[s] || {}), error: String(e?.stack || e) };
  }
}
results.finished_at = new Date().toISOString();
const file = `tests/ci/results/${stamp}-${runId}.json`;
writeFileSync(file, JSON.stringify(results, null, 2));
console.log("results written to " + file);
