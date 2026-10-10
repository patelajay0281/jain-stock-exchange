// JSE API loader for Neon Functions.
// Downloads the versioned API bundle named by APP_URL, checks it against APP_SHA256,
// caches it in /tmp and delegates every request to it. Deploying a new API version
// only changes these environment variables. APP_URL may list several mirrors separated
// by spaces or commas (for example GitHub raw and jsDelivr); they are tried in order.
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

let ready = null;

async function download(urls, sha) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    for (const url of urls) {
      try {
        const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(15000) });
        if (!res.ok) throw new Error("bundle download failed: HTTP " + res.status + " from " + url);
        const buf = Buffer.from(await res.arrayBuffer());
        const got = createHash("sha256").update(buf).digest("hex");
        if (got !== sha) throw new Error("bundle integrity mismatch from " + url + ": " + got);
        return buf;
      } catch (e) {
        lastError = e;
      }
    }
    await new Promise((r) => setTimeout(r, 300 * attempt));
  }
  throw lastError;
}

async function load() {
  const urls = String(process.env.APP_URL || "").split(/[\s,]+/).filter(Boolean);
  const sha = String(process.env.APP_SHA256 || "").toLowerCase();
  if (!urls.length || !/^[0-9a-f]{64}$/.test(sha)) throw new Error("APP_URL / APP_SHA256 not configured");
  const file = "/tmp/jse-api-" + sha.slice(0, 20) + ".mjs";
  let code = null;
  try {
    code = await readFile(file);
    if (createHash("sha256").update(code).digest("hex") !== sha) code = null;
  } catch {}
  if (!code) {
    code = await download(urls, sha);
    try {
      await writeFile(file, code);
    } catch {}
  }
  let mod;
  try {
    mod = await import(pathToFileURL(file).href);
  } catch (e) {
    mod = await import("data:text/javascript;base64," + code.toString("base64"));
  }
  const app = mod.default;
  if (!app || typeof app.fetch !== "function") throw new Error("bundle has no fetch handler");
  return app;
}

export default {
  async fetch(request) {
    if (!ready) ready = load().catch((e) => { ready = null; throw e; });
    try {
      const app = await ready;
      return await app.fetch(request);
    } catch (e) {
      console.error("[loader]", (e && e.message) || e);
      return new Response(JSON.stringify({ success: false, error: "The trading service is starting. Please retry in a moment.", code: "SERVICE_STARTING" }), {
        status: 503,
        headers: { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": request.headers.get("origin") || "*", "vary": "origin", "retry-after": "2", "cache-control": "no-store" },
      });
    }
  },
};
