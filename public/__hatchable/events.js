(() => {
  const API = "https://yxmztxtbgqkvardwgrak.supabase.co/functions/v1/jse-api";
  const channels = new Map();
  let started = false;
  let timer = null;
  let previous = null;
  let originalFetch = window.fetch.bind(window);

  const jsonHeaders = (init) => {
    const h = new Headers(init?.headers || {});
    const token = localStorage.getItem("jse_token");
    if (token) h.set("Authorization", "Bearer " + token);
    if (!h.has("Content-Type") && init?.body && typeof init.body === "string") h.set("Content-Type", "application/json");
    if ((init?.method || "GET").toUpperCase() === "POST" && !h.has("Idempotency-Key")) {
      h.set("Idempotency-Key", crypto.randomUUID());
    }
    return h;
  };

  function normalizeUrl(input) {
    let raw = typeof input === "string" ? input : input?.url || "";
    if (!raw) return raw;
    if (raw.startsWith("/api/")) return API + raw.slice(4);
    return raw;
  }

  window.fetch = async function(input, init = {}) {
    const raw = typeof input === "string" ? input : input?.url || "";
    const rewritten = normalizeUrl(raw);
    if (!rewritten) return originalFetch(input, init);

    const next = {...init, headers: jsonHeaders(init)};
    if (typeof input !== "string" && input instanceof Request) {
      next.method = init.method || input.method;
      next.headers = jsonHeaders(init.headers || input.headers);
      if (init.body === undefined) next.body = input.body;
    }

    const res = await originalFetch(rewritten, next);
    if (/\/member-login$|\/admin-login$/.test(rewritten) && res.ok) {
      try {
        const copy = res.clone();
        const data = await copy.json();
        if (data.token) localStorage.setItem("jse_token", data.token);
      } catch (_) {}
    }
    if (/\/member-logout$/.test(rewritten)) localStorage.removeItem("jse_token");
    return res;
  };

  function emit(channel, event, payload) {
    const set = channels.get(channel + "::" + event) || [];
    for (const fn of set) {
      try { fn({payload}); } catch (_) {}
    }
  }

  async function pull() {
    try {
      const r = await fetch(API + "/realtime", {cache:"no-store"});
      if (!r.ok) return;
      const next = await r.json();
      const prev = previous;
      previous = next;
      if (!prev) return;

      if (Number(next.max_order_id || 0) > Number(prev.max_order_id || 0)) {
        emit("market", "order_created", next);
      }
      if (Number(next.max_approved_order_id || 0) > Number(prev.max_approved_order_id || 0)) {
        emit("market", "order_approved", next);
      }
      if (String(next.stock_updated_at) !== String(prev.stock_updated_at) ||
          String(next.ipo_updated_at) !== String(prev.ipo_updated_at)) {
        emit("market", "price_updated", next);
      }
    } catch (_) {}
  }

  function start() {
    if (started) return;
    started = true;
    pull();
    timer = setInterval(pull, 3000);
  }

  window.__HATCHABLE__ = window.__HATCHABLE__ || {};
  window.__HATCHABLE__.api = API;
  window.hatchable = window.__HATCHABLE__;
  window.hatchable.events = {
    connect() {
      return {
        channel(name) {
          return {
            on(event, fn) {
              const key = name + "::" + event;
              if (!channels.has(key)) channels.set(key, []);
              channels.get(key).push(fn);
              start();
              return this;
            }
          };
        }
      };
    }
  };
})();