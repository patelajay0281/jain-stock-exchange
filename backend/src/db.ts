// Database access: one pg pool per process, every API call is a single SQL function call
// (`SELECT fn($1::jsonb, $2::jsonb)`) so each financial action is exactly one transaction.
import pg from "pg";
import m001 from "../../db/migrations/001_schema.sql";
import m001a from "../../db/migrations/001a_upgrades.sql";
import m002 from "../../db/migrations/002_core.sql";
import m003 from "../../db/migrations/003_ops.sql";
import m004 from "../../db/migrations/004_reads.sql";
import m005 from "../../db/migrations/005_exports.sql";
import m006 from "../../db/migrations/006_seed.sql";
import m007 from "../../db/migrations/007_tuning.sql";
import m008 from "../../db/migrations/008_v311.sql";

export const MIGRATIONS: Array<[string, string]> = [
  ["001_schema", m001], ["001a_upgrades", m001a], ["002_core", m002], ["003_ops", m003], ["004_reads", m004],
  ["005_exports", m005], ["006_seed", m006], ["007_tuning", m007], ["008_v311", m008],
];
// Files whose content may be re-applied safely (idempotent / CREATE OR REPLACE only) when their text changes.
const REPLAYABLE = new Set(["001a_upgrades", "002_core", "003_ops", "004_reads", "005_exports", "007_tuning", "008_v311"]);

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public extra?: Record<string, unknown>) {
    super(message);
  }
}

function connectionString(): string {
  const raw = process.env.DATABASE_URL || "postgres://postgres@127.0.0.1:5433/jse";
  const url = new URL(raw);
  if (process.env.DB_NAME) url.pathname = "/" + process.env.DB_NAME;
  // pg already verifies the certificate for sslmode=require; say so explicitly (silences its deprecation warning)
  const mode = url.searchParams.get("sslmode");
  if (mode === "require" || mode === "prefer" || mode === "verify-ca") url.searchParams.set("sslmode", "verify-full");
  return url.toString();
}

let pool: pg.Pool | null = null;
export function getPool(): pg.Pool {
  if (!pool) {
    // keep numerics exact as strings and convert in JSON (functions already return jsonb)
    pool = new pg.Pool({
      connectionString: connectionString(),
      max: Number(process.env.DB_POOL_MAX || 8),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      allowExitOnIdle: false,
    });
    pool.on("error", (e) => console.warn("[db] idle client error:", e.message));
  }
  return pool;
}

const TRANSIENT = new Set(["40001", "40P01", "57P01", "08006", "08003", "08000", "53300"]);

export async function rawQuery<T extends pg.QueryResultRow = any>(text: string, params: unknown[] = []): Promise<pg.QueryResult<T>> {
  let attempt = 0;
  for (;;) {
    try {
      return await getPool().query<T>(text, params);
    } catch (e: any) {
      attempt++;
      const transient = TRANSIENT.has(e?.code) || /Connection terminated|ECONNRESET|timeout exceeded when trying to connect/i.test(String(e?.message));
      if (transient && attempt < 3) {
        await new Promise((r) => setTimeout(r, 120 * attempt + Math.random() * 120));
        continue;
      }
      throw e;
    }
  }
}

/** Calls `fn(actor, params)` or `fn(params)` and returns its jsonb result, mapping JSE errors to ApiError. */
export async function call(fn: string, actor: unknown, params?: unknown, opts: { noActor?: boolean } = {}): Promise<any> {
  if (!/^jse_[a-z0-9_]+$/.test(fn)) throw new Error("bad function name");
  try {
    let r;
    if (opts.noActor) r = await rawQuery(`SELECT ${fn}($1::jsonb) AS r`, [JSON.stringify(params ?? {})]);
    else if (params === undefined) r = await rawQuery(`SELECT ${fn}() AS r`);
    else r = await rawQuery(`SELECT ${fn}($1::jsonb, $2::jsonb) AS r`, [JSON.stringify(actor ?? {}), JSON.stringify(params ?? {})]);
    const out = r.rows[0]?.r;
    if (out && out.success === false) {
      throw new ApiError(Number(out.http) || 400, out.code || "REQUEST_FAILED", out.error || "Request failed", out.errors ? { errors: out.errors } : undefined);
    }
    return out;
  } catch (e: any) {
    if (e instanceof ApiError) throw e;
    if (e?.code === "JSE01") {
      throw new ApiError(Number(e.hint) || 400, e.detail || "REQUEST_FAILED", e.message);
    }
    if (e?.code === "23505") throw new ApiError(409, "DUPLICATE", "This action was already recorded (duplicate request blocked).");
    if (e?.code === "23514") throw new ApiError(409, "RULE_VIOLATION", "The request would break a financial rule (for example negative cash or holdings) and was blocked.");
    if (e?.code === "57014") throw new ApiError(503, "TIMEOUT", "The database took too long to respond. Please retry.");
    throw e;
  }
}

let migrated: Promise<void> | null = null;
/** Applies pending migrations once per process, serialised across isolates by an advisory lock. */
export function ensureMigrated(): Promise<void> {
  if (process.env.SKIP_MIGRATIONS === "1") return Promise.resolve();
  if (!migrated) {
    migrated = runMigrations().catch((e) => {
      migrated = null;
      throw e;
    });
  }
  return migrated;
}

async function sha(text: string): Promise<string> {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}

async function runMigrations(): Promise<void> {
  const client = await getPool().connect();
  try {
    // one transaction: the transaction-level advisory lock works through Neon's pooled (PgBouncer) connection
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(727272)");
    await client.query("CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now(), checksum text)");
    const done = new Map<string, string | null>(
      (await client.query("SELECT version, checksum FROM schema_migrations")).rows.map((r: any) => [r.version, r.checksum]),
    );
    const log: string[] = [];
    for (const [version, sql] of MIGRATIONS) {
      const sum = await sha(sql);
      const applied = done.has(version);
      if (applied && (done.get(version) === sum || !REPLAYABLE.has(version))) continue;
      const body = applied ? sql.replace(/INSERT INTO schema_migrations\(version\) VALUES \('[^']+'\);/g, "") : sql;
      await client.query("SAVEPOINT m");
      try {
        await client.query(body);
      } catch (e) {
        throw new Error(`migration ${version} failed: ${(e as Error).message}`);
      }
      await client.query(
        "INSERT INTO schema_migrations(version, checksum) VALUES ($1, $2) ON CONFLICT (version) DO UPDATE SET checksum = EXCLUDED.checksum, applied_at = now()",
        [version, sum],
      );
      await client.query("RELEASE SAVEPOINT m");
      log.push(`${version} ${applied ? "re-applied" : "applied"}`);
    }
    await client.query("COMMIT");
    if (log.length) console.log("[db] migrations: " + log.join(", "));
  } catch (e) {
    try { await client.query("ROLLBACK"); } catch {}
    throw e;
  } finally {
    client.release();
  }
}
