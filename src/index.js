import { neon } from "@neondatabase/serverless";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      try {
        const sql = neon(env.DATABASE_URL);
        const result = await sql("SELECT NOW() AS server_time, current_database() AS database_name");

        return Response.json({
          status: "ok",
          service: "JAIN STOCK EXCHANGE",
          database: "connected",
          server_time: result[0].server_time,
          database_name: result[0].database_name
        });
      } catch (error) {
        return Response.json(
          { status: "error", database: "connection_failed", message: String(error?.message ?? error) },
          { status: 500 }
        );
      }
    }

    return new Response("JAIN STOCK EXCHANGE");
  }
};