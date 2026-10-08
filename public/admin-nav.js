(() => {
  if (window.__JSE_ADMIN_NAV_BOOTED) return;
  window.__JSE_ADMIN_NAV_BOOTED = true;
  const RULES = {
    "/order": ["PIT_MANAGER","ADMIN"],
    "/orders": ["PIT_MANAGER","EXCHANGE","BANK","ADMIN","ASSOCIATE_ADMIN"],
    "/exchange": ["EXCHANGE","ADMIN"],
    "/bank": ["BANK","ADMIN"],
    "/institutional": ["INSTITUTION","ADMIN"],
    "/commissions": ["PIT_MANAGER","BANK","EXCHANGE","ADMIN","ASSOCIATE_ADMIN"],
    "/portfolios": ["PIT_MANAGER","EXCHANGE","BANK","ADMIN","ASSOCIATE_ADMIN"],
    "/admin": ["ADMIN","ASSOCIATE_ADMIN"],
    "/audit": ["PIT_MANAGER","BANK","EXCHANGE","ADMIN","ASSOCIATE_ADMIN"],
    "/cash": ["PIT_MANAGER","BANK","EXCHANGE","ADMIN","ASSOCIATE_ADMIN"],
    "/certificates": ["PIT_MANAGER","BANK","EXCHANGE","INSTITUTION","ADMIN","ASSOCIATE_ADMIN"],
    "/insights": ["PIT_MANAGER","BANK","EXCHANGE","INSTITUTION","ADMIN","ASSOCIATE_ADMIN"],
    "/member-accounts": ["ADMIN"],
    "/load-test": ["ADMIN"]
  };
  const pathFor = href => {
    try { return new URL(href, location.origin).pathname.replace(/\/$/,"") || "/"; }
    catch (_) { return ""; }
  };
  const keyFor = path => Object.keys(RULES).find(k =>
    path === k || path === k + ".html" || path.startsWith(k + "/") || path.startsWith(k + "-")
  );

  function apply(member) {
    const role = member?.role || "";
    const loggedIn = !!member;

    document.querySelectorAll("nav a[href]").forEach(a => {
      const p = pathFor(a.getAttribute("href"));
      const key = keyFor(p);
      if (!key) return;
      const allowed = RULES[key] || [];
      // Until authentication is confirmed, hide all protected desks.
      // Once authenticated, show only the desks permitted to the current role.
      a.hidden = !loggedIn || !allowed.includes(role);
    });

    let access = document.getElementById("jse-access-link");
    if (!access) {
      const nav = document.querySelector("nav");
      if (!nav) return;
      access = document.createElement("a");
      access.id = "jse-access-link";
      access.style.cssText = "font-weight:850";
      nav.appendChild(access);
    }

    if (member) {
      access.textContent = "LOG OUT";
      access.href = "#";
      access.onclick = e => {
        e.preventDefault();
        localStorage.removeItem("jse_token");
        localStorage.removeItem("jse_member");
        location.replace("/login");
      };
      access.title = "Sign out of JSE";
    } else {
      access.textContent = "STAFF LOGIN";
      access.href = "/login?next=" + encodeURIComponent(location.pathname + location.search + location.hash);
      access.onclick = null;
      access.title = "Sign in to your JSE operating desk";
    }
  }

  window.addEventListener("jse-auth-ready", e => apply(e.detail || window.JSE_MEMBER));
  apply(window.JSE_MEMBER || null);

})();