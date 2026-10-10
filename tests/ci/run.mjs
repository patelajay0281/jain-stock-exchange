// Runs the suites named in tests/ci/run.json against a deployed environment and writes one
// results file to tests/ci/results/. Used by .github/workflows/staging-tests.yml.
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const cfg = JSON.parse(readFileSync(process.env.RUN_CONFIG || new URL("./run.json", import.meta.url), "utf8"));
const BASE = cfg.base.replace(/\/$/, "");
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
  if (st === "LIVE" || st === "SETTLEMENT_ONLY") { steps.reject = (await post("/api/reject-open-orders", {})).status; steps.close = (await post("/api/event", { action: "CLOSE" })).status; }
  steps.reset = (await post("/api/reset-event", { confirm: "RESET", keep_allotments: false })).status;
  steps.clear_listing = (await post("/api/ipo-listing", { action: "CLEAR" })).status;
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
    else if (s === "cleanup") await cleanup();
    else if (s === "ui") {
      const { signIn } = await import("../lib/client.mjs");
      const tokens = {};
      for (const u of ["ADMIN", "PIT-01", "EXCHANGE-01", "BANK-01", "TEAM-031"]) tokens[u] = await signIn(u);
      await run("ui", "python3", ["tests/ui_staging.py"], { SITE: cfg.site, API: BASE, UI_TOKENS: JSON.stringify(tokens) }, 20);
    }
    else if (s === "api") await run("api", "node", ["--test", "--test-concurrency=1", "tests/api.test.mjs"]);
    else if (s === "listing") await run("listing", "node", ["--test", "--test-concurrency=1", "tests/listing.test.mjs"]);
    else if (s === "stress") {
      const out = join(tmpdir(), "jse-stress.json");
      await run("stress", "node", ["tests/stress.mjs"], { ORDERS: String(cfg.stress?.orders || 1500), WORKERS: String(cfg.stress?.workers || 16), OUT: out }, 40);
      if (existsSync(out)) { const d = JSON.parse(readFileSync(out, "utf8")); delete d.http?.endpoints; results.suites.stress.report = d; }
    } else if (s === "load") {
      const out = join(tmpdir(), "jse-load.json");
      const L = cfg.load || {};
      await run("load", "node", ["tests/load.mjs"], { RPS: String(L.rps || 850), DURATION: String(L.duration || 90), WRITE_RPS: String(L.write_rps ?? 1),
        VIEWERS: String(L.viewers || 600), RAMP: String(L.ramp || 0), AUDIT: "1", OUT: out }, Math.ceil((L.duration || 90) / 60) + 20);
      if (existsSync(out)) results.suites.load.report = JSON.parse(readFileSync(out, "utf8"));
    }
  } catch (e) {
    results.suites[s] = { ...(results.suites[s] || {}), error: String(e?.stack || e) };
  }
}
results.finished_at = new Date().toISOString();
const file = `tests/ci/results/${stamp}-${runId}.json`;
writeFileSync(file, JSON.stringify(results, null, 2));
console.log("results written to " + file);
