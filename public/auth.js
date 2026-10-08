(() => {
  if (window.__JSE_AUTH_BOOTED) return;
  window.__JSE_AUTH_BOOTED = true;

  // Temporary event mode: no staff/member login is required.
  // The API provides an open-access ADMIN session server-side.
  const guest = {
    username: "OPEN_ACCESS",
    display_name: "JSE Open Access",
    role: "ADMIN",
    team_id: null,
    institution_id: null,
    needs_password_change: false
  };

  window.JSE_MEMBER = guest;
  window.JSE_AUTH = {
    getToken: () => localStorage.getItem("jse_token") || "",
    logout: () => {
      localStorage.removeItem("jse_token");
      localStorage.removeItem("jse_member");
      window.JSE_MEMBER = guest;
      window.dispatchEvent(new CustomEvent("jse-auth-ready", { detail: guest }));
    }
  };

  localStorage.setItem("jse_member", JSON.stringify(guest));
  window.dispatchEvent(new CustomEvent("jse-auth-ready", { detail: guest }));
})();
