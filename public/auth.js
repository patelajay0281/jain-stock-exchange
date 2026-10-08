(() => {
  if (window.__JSE_AUTH_BOOTED) return;
  window.__JSE_AUTH_BOOTED = true;

  const RULES = [
    { match: p => /^\/order(?:-live[^/]*)?(?:\.html)?\/?$/.test(p), roles: ["PIT_MANAGER","ADMIN"] },
    { match: p => /^\/orders(?:-live[^/]*)?(?:\.html)?\/?$/.test(p), roles: ["PIT_MANAGER","EXCHANGE","BANK","ADMIN","ASSOCIATE_ADMIN"] },
    { match: p => /^\/exchange(?:-live[^/]*)?(?:\.html)?\/?$/.test(p), roles: ["EXCHANGE","ADMIN"] },
    { match: p => /^\/bank(?:-live[^/]*)?(?:\.html)?\/?$/.test(p), roles: ["BANK","ADMIN"] },
    { match: p => /^\/institutional(?:-live[^/]*)?(?:\.html)?\/?$/.test(p), roles: ["INSTITUTION","ADMIN"] },
    { match: p => /^\/portfolios(?:-live[^/]*)?(?:\.html)?\/?$/.test(p), roles: ["PIT_MANAGER","ADMIN"] },
    { match: p => /^\/cash(?:-live[^/]*)?(?:\.html)?\/?$/.test(p), roles: ["PIT_MANAGER","BANK","EXCHANGE","ADMIN","ASSOCIATE_ADMIN"] },
    { match: p => /^\/audit(?:-live[^/]*)?(?:\.html)?\/?$/.test(p), roles: ["PIT_MANAGER","BANK","EXCHANGE","ADMIN","ASSOCIATE_ADMIN"] },
    { match: p => /^\/commissions(?:-live[^/]*)?(?:\.html)?\/?$/.test(p), roles: ["PIT_MANAGER","BANK","EXCHANGE","ADMIN","ASSOCIATE_ADMIN"] },
    { match: p => /^\/certificates(?:-live[^/]*)?(?:\.html)?\/?$/.test(p), roles: ["PIT_MANAGER","BANK","EXCHANGE","INSTITUTION","ADMIN","ASSOCIATE_ADMIN"] },
    { match: p => /^\/insights(?:-live[^/]*)?(?:\.html)?\/?$/.test(p), roles: ["PIT_MANAGER","BANK","EXCHANGE","INSTITUTION","ADMIN","ASSOCIATE_ADMIN"] },
    { match: p => /^\/member-accounts(?:-live[^/]*)?(?:\.html)?\/?$/.test(p), roles: ["ADMIN"] },
    { match: p => /^\/admin(?:-live[^/]*)?(?:\.html)?\/?$/.test(p), roles: ["ADMIN","ASSOCIATE_ADMIN"] },
    { match: p => /^\/load-test(?:-live[^/]*)?(?:\.html)?\/?$/.test(p), roles: ["ADMIN"] },
    { match: p => /^\/loan(?:-live[^/]*)?(?:\.html)?\/?$/.test(p), roles: ["PIT_MANAGER","BANK","EXCHANGE","ADMIN"] }
  ];

  const path = location.pathname;
  const rule = RULES.find(r => r.match(path));
  const nextUrl = () => path + location.search + location.hash;
  const goLogin = (extra = "") => {
    const next = encodeURIComponent(nextUrl());
    location.replace("/login?next=" + next + extra);
  };

  window.JSE_AUTH = {
    getToken: () => localStorage.getItem("jse_token") || "",
    logout: () => { localStorage.removeItem("jse_token"); localStorage.removeItem("jse_member"); location.replace("/login"); }
  };

  if (!rule) return;

  const token = localStorage.getItem("jse_token");
  if (!token) { goLogin(); return; }

  fetch("/api/member-me", {
    headers: { "Authorization": "Bearer " + token, "Accept": "application/json" },
    cache: "no-store"
  }).then(async r => {
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.member) {
      localStorage.removeItem("jse_token");
      localStorage.removeItem("jse_member");
      goLogin();
      return;
    }
    localStorage.setItem("jse_member", JSON.stringify(d.member));
    if (d.member.needs_password_change) {
      goLogin("&force=1");
      return;
    }
    if (!rule.roles.includes(d.member.role)) {
      goLogin("&denied=1");
      return;
    }
    window.JSE_MEMBER = d.member;
    window.dispatchEvent(new CustomEvent("jse-auth-ready", { detail: d.member }));
  }).catch(() => {
    // Let the page render its own retry/error state if the network is temporarily unavailable.
  });
})();