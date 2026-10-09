// Local development / test server: serves public/ and routes /api/* to the bundled API.
// Usage: DATABASE_URL=postgres://postgres@127.0.0.1:5433/jse PORT=8788 node scripts/dev-server.mjs
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = new URL("..", import.meta.url).pathname;
const PUBLIC = join(ROOT, "public");
const BUNDLE = process.env.API_BUNDLE || join(ROOT, "backend/dist/app.mjs");
const PORT = Number(process.env.PORT || 8788);
const app = (await import(pathToFileURL(BUNDLE).href + "?t=" + Date.now())).default;
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".webp": "image/webp", ".woff2": "font/woff2", ".txt": "text/plain" };

async function serveStatic(req, res, pathname) {
  let p = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  if (p.endsWith("/")) p += "index.html";
  let file = join(PUBLIC, p);
  try { if ((await stat(file)).isDirectory()) file = join(file, "index.html"); } catch {
    try { await stat(file + ".html"); file += ".html"; } catch {}
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream", "cache-control": "no-store" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" }); res.end("Not found");
  }
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (!url.pathname.startsWith("/api/")) return serveStatic(req, res, url.pathname);
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) if (v !== undefined) headers.set(k, Array.isArray(v) ? v.join(", ") : v);
  headers.set("x-forwarded-for", req.socket.remoteAddress || "127.0.0.1");
  const request = new Request(url, { method: req.method, headers, body: ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks) });
  try {
    const r = await app.fetch(request);
    const h = {};
    r.headers.forEach((v, k) => { h[k] = v; });
    res.writeHead(r.status, h);
    res.end(Buffer.from(await r.arrayBuffer()));
  } catch (e) {
    res.writeHead(500, { "content-type": "application/json" });
    res.end(JSON.stringify({ success: false, error: String(e?.message || e) }));
  }
}).listen(PORT, "127.0.0.1", () => console.log(`JSE dev server on http://127.0.0.1:${PORT}`));
