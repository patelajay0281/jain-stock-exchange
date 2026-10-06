import { handleApi, serveSite } from "./router.js";
// Production JSE build marker: synced Hatchable v243 behavior with Neon/Cloudflare backend.

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return handleApi(request, env);
    return serveSite(request, env);
  }
};
