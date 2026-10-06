import { handleApi, serveSite } from "./router.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return handleApi(request, env);
    return serveSite(request, env);
  }
};
