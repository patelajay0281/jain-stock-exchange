import pg from "pg";
const url = new URL(process.env.DATABASE_URL || "postgres://localhost/jse");
if (process.env.DB_NAME) url.pathname = "/" + process.env.DB_NAME;
const pool = new pg.Pool({ connectionString: url.toString(), max: 5, idleTimeoutMillis: 20000 });
pool.on("error", () => {});
const started = Date.now();
export default {
  async fetch(request: Request): Promise<Response> {
    const u = new URL(request.url);
    const origin = request.headers.get("origin") || "*";
    const h = { "content-type": "application/json", "access-control-allow-origin": origin };
    if (u.pathname.endsWith("/health")) {
      const t0 = Date.now();
      const r = await pool.query("select current_database() db, now() t, version() v");
      return new Response(JSON.stringify({ success: true, spike: true, db: r.rows[0].db, pg: String(r.rows[0].v).slice(0, 40), db_ms: Date.now() - t0, up_s: Math.round((Date.now() - started) / 1000), node: process.version, region: process.env.AWS_REGION || null, branch: process.env.NEON_BRANCH || null, tmp_writable: true }), { headers: h });
    }
    return new Response(JSON.stringify({ success: false, error: "Not found", path: u.pathname }), { status: 404, headers: h });
  },
};
