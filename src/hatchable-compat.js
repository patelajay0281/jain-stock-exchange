import { neon, Client } from "@neondatabase/serverless";

let configuredUrl = null;
let httpSql = null;

function normalizeDatabaseUrl(connectionString) {
  if (!connectionString) throw new Error("DATABASE_URL is not configured");
  try {
    const u = new URL(connectionString);
    // The Neon serverless HTTP driver does not need libpq-only connection
    // parameters such as channel_binding/sslmode; keep only the URI itself.
    u.search = "";
    u.hash = "";
    return u.toString();
  } catch {
    throw new Error("DATABASE_URL is not a valid PostgreSQL URL");
  }
}

function configure(connectionString) {
  const normalized = normalizeDatabaseUrl(connectionString);
  if (configuredUrl !== normalized) {
    configuredUrl = normalized;
    httpSql = neon(normalized);
  }
}

function parseCookie(header = "") {
  const out = {};
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export function configureRuntime(env) {
  configure(env.DATABASE_URL);
  globalThis.__JSE_ENV = env;
  globalThis.process = globalThis.process || { env: {} };
  globalThis.process.env = {
    ...globalThis.process.env,
    EVENT_ADMIN_PASSWORD: env.EVENT_ADMIN_PASSWORD || "",
    RESET_PASSWORD: env.RESET_PASSWORD || ""
  };
}

export const db = {
  async query(sql, params = []) {
    configureRuntime(globalThis.__JSE_ENV);
    const result = await httpSql.query(sql, params);
    return { rows: result, rowCount: result.length };
  },
  async transaction(statements = []) {
    configureRuntime(globalThis.__JSE_ENV);
    const client = new Client(configuredUrl);
    await client.connect();
    try {
      await client.query("BEGIN");
      const results = [];
      for (const item of statements) {
        const result = await client.query(item.sql, item.params || []);
        results.push({ rows: result.rows || [], rowCount: result.rowCount || 0 });
      }
      await client.query("COMMIT");
      return { results };
    } catch (error) {
      try { await client.query("ROLLBACK"); } catch (_) {}
      throw error;
    } finally {
      try { await client.end(); } catch (_) {}
    }
  }
};

function adminAuthorized(req) {
  const cookies = parseCookie(req.headers?.cookie || "");
  const key = req.headers?.["x-jse-admin-key"] || "";
  const expected = globalThis.process?.env?.EVENT_ADMIN_PASSWORD || "";
  return cookies.jse_admin === "1" || (expected && key === expected);
}

export const admin = {
  check: adminAuthorized,
  async require(req, res) {
    if (adminAuthorized(req)) return true;
    res.status(403).json({ error: "Administrator access required" });
    return false;
  },
  profile() {
    return adminAuthorized({headers:{}}) ? { handle: "JSE Admin", email: "admin" } : null;
  }
};

export const auth = {
  async getUser() { return null; },
  async requireUser(_req, res) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }
};

export const events = {
  publish: async () => undefined,
  grant: async () => ({ token: "jse-noop" })
};

export const config = {
  async get(key) {
    return globalThis.__JSE_ENV?.[key] ?? null;
  }
};

export const storage = {
  async put() { throw new Error("Storage is not configured for JSE"); },
  async get() { throw new Error("Storage is not configured for JSE"); },
  async url() { throw new Error("Storage is not configured for JSE"); }
};

export const email = { send: async () => undefined };
export const scheduler = { at: async () => undefined, cancel: async () => undefined };
export const browser = {};
export const ai = {};
export const knowledge = {};
