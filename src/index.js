import { neon } from "@neondatabase/serverless";

const json = (data, status = 200) =>
  Response.json(data, {
    status,
    headers: { "cache-control": "no-store" }
  });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      try {
        if (!env.DATABASE_URL) {
          return json({
            status: "error",
            service: "JAIN STOCK EXCHANGE",
            database: "secret_missing"
          }, 500);
        }

        const sql = neon(env.DATABASE_URL);
        const result = await sql(
          "SELECT NOW() AS server_time, current_database() AS database_name"
        );

        return json({
          status: "ok",
          service: "JAIN STOCK EXCHANGE",
          database: "connected",
          server_time: result[0].server_time,
          database_name: result[0].database_name
        });
      } catch (error) {
        return json({
          status: "error",
          service: "JAIN STOCK EXCHANGE",
          database: "connection_failed",
          message: error instanceof Error ? error.message : String(error)
        }, 500);
      }
    }

    return env.ASSETS.fetch(request);
  }
};
