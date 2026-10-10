/* JAIN STOCK EXCHANGE (JSE) v272 — shared browser library.
   API client (bearer sessions, retries, timeouts), page shell + role-aware navigation, live status
   ticker, visibility-aware polling, formatting (Indian rupees, IST), dialogs and toasts. */
(function () {
  "use strict";
  var CFG = window.JSE_CONFIG || { api: "" };
  var BASE = (CFG.api || "").replace(/\/$/, "");
  var NS = BASE || location.origin;
  var TOKEN_KEY = "jse_token:" + NS, USER_KEY = "jse_user:" + NS;

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} },
  };

  // ------------------------------------------------------------------ formatting
  var TZ = "Asia/Kolkata";
  var nf0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
  var nf2 = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var nfAuto = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  function toNum(v) { var n = typeof v === "number" ? v : parseFloat(v); return isFinite(n) ? n : 0; }
  var fmt = {
    num: function (v) { return nf0.format(toNum(v)); },
    /** ₹ with Indian grouping; decimals only when the value has paise (or force with {dp:2}) */
    money: function (v, o) {
      if (v === null || v === undefined || v === "") return "—";
      var n = toNum(v), abs = Math.abs(n), dp = o && o.dp;
      var s = dp === 2 ? nf2.format(abs) : dp === 0 ? nf0.format(abs) : (Math.round(abs * 100) % 100 === 0 ? nf0.format(abs) : nf2.format(abs));
      return (n < 0 ? "−" : "") + "₹" + s;
    },
    signedMoney: function (v) { var n = toNum(v); return (n > 0 ? "+" : "") + fmt.money(n); },
    price: function (v) { return v === null || v === undefined ? "—" : "₹" + nfAuto.format(toNum(v)); },
    /** compact lakh / crore for headline numbers */
    short: function (v) {
      var n = toNum(v), a = Math.abs(n), s = n < 0 ? "−" : "";
      if (a >= 1e7) return s + "₹" + (a / 1e7).toFixed(2).replace(/\.?0+$/, "") + " Cr";
      if (a >= 1e5) return s + "₹" + (a / 1e5).toFixed(2).replace(/\.?0+$/, "") + " L";
      return s + "₹" + nfAuto.format(a);
    },
    pct: function (v, o) {
      var n = toNum(v), d = o && o.dp !== undefined ? o.dp : 2;
      var sign = o && o.sign === false ? "" : n > 0 ? "+" : n < 0 ? "−" : "";
      return sign + Math.abs(n).toFixed(d) + "%";
    },
    arrowPct: function (v) { var n = toNum(v); return (n > 0 ? "▲ " : n < 0 ? "▼ " : "■ ") + Math.abs(n).toFixed(2) + "%"; },
    dir: function (v) { var n = toNum(v); return n > 0 ? "up" : n < 0 ? "down" : "flat"; },
    time: function (ts) { if (!ts) return "—"; var d = new Date(ts); return isNaN(d) ? "—" : d.toLocaleTimeString("en-IN", { timeZone: TZ, hour12: false }); },
    datetime: function (ts) {
      if (!ts) return "—"; var d = new Date(ts); if (isNaN(d)) return "—";
      return d.toLocaleDateString("en-IN", { timeZone: TZ, day: "2-digit", month: "short" }) + ", " + d.toLocaleTimeString("en-IN", { timeZone: TZ, hour12: false });
    },
    ago: function (ts) {
      if (!ts) return "—"; var s = Math.max(0, Math.round((Date.now() - new Date(ts).getTime()) / 1000));
      if (s < 60) return s + "s ago"; if (s < 3600) return Math.floor(s / 60) + "m ago"; return Math.floor(s / 3600) + "h " + Math.floor((s % 3600) / 60) + "m ago";
    },
    age: function (sec) { sec = toNum(sec); if (sec < 60) return Math.round(sec) + "s"; return Math.floor(sec / 60) + "m " + Math.round(sec % 60) + "s"; },
    statusText: function (s) { return String(s || "").replace(/_/g, " "); },
  };
  function esc(s) { return String(s === null || s === undefined ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  // ------------------------------------------------------------------ API client
  function ApiError(message, status, code, data) { var e = new Error(message); e.name = "ApiError"; e.status = status; e.code = code; e.data = data; return e; }
  var online = true, lastOk = 0;
  function setConn(ok) {
    online = ok; if (ok) lastOk = Date.now();
    document.dispatchEvent(new CustomEvent("jse:conn", { detail: { ok: ok, lastOk: lastOk } }));
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  async function request(method, path, body, opts) {
    opts = opts || {};
    var tries = method === "GET" ? (opts.retries === undefined ? 2 : opts.retries) : 0;
    for (var attempt = 0; ; attempt++) {
      var ctl = new AbortController(), timer = setTimeout(function () { ctl.abort(); }, opts.timeout || 15000);
      var headers = { Accept: "application/json" };
      var tok = store.get(TOKEN_KEY);
      if (tok) headers.Authorization = "Bearer " + tok;
      if (body !== undefined) headers["Content-Type"] = "application/json";
      var res, data;
      try {
        res = await fetch(BASE + path, { method: method, headers: headers, body: body === undefined ? undefined : JSON.stringify(body),
          cache: method === "GET" ? "no-cache" : "no-store", signal: ctl.signal, credentials: "omit" });
      } catch (e) {
        clearTimeout(timer);
        if (attempt < tries) { await sleep(600 * (attempt + 1)); continue; }
        setConn(false);
        throw ApiError(e.name === "AbortError" ? "The server took too long to respond. Please retry." : "Cannot reach the trading service. Check the internet connection and retry.", 0, "NETWORK");
      }
      clearTimeout(timer);
      if ((res.status === 502 || res.status === 503 || res.status === 504) && attempt < tries) { await sleep(700 * (attempt + 1)); continue; }
      var ct = res.headers.get("content-type") || "";
      // The hosting platform's concurrency limiter answers 429 with a plain-text body before the API runs, so the
      // request had no effect. A desk action (POST) is sent again after a short random pause; polling reads are
      // not retried here — the next poll comes soon and poll() backs off, which keeps load low when the platform is busy.
      if (res.status === 429 && ct.indexOf("json") < 0 && method !== "GET" && attempt < 2) {
        var ra = parseFloat(res.headers.get("retry-after") || "0");
        await sleep(Math.min(2500, (ra > 0 ? ra * 1000 : 500) * (0.5 + Math.random())));
        continue;
      }
      if (res.status === 429 && ct.indexOf("json") < 0) { setConn(false); throw ApiError("The trading service is busy. Please retry in a moment.", 429, "SERVICE_BUSY"); }
      if (opts.raw) {
        if (!res.ok) { try { data = await res.json(); } catch (e) { data = {}; } throw ApiError(data.error || "Download failed", res.status, data.code, data); }
        setConn(true); return res;
      }
      try { data = ct.indexOf("json") >= 0 ? await res.json() : { success: res.ok, error: await res.text() }; } catch (e) { data = { success: false, error: "Unexpected response from the server." }; }
      if (res.status >= 500) setConn(false); else setConn(true);
      if (res.status === 401 && tok) { clearSession(); document.dispatchEvent(new CustomEvent("jse:signedout")); }
      if (!res.ok || data.success === false) throw ApiError(data.error || ("Request failed (" + res.status + ")"), res.status, data.code, data);
      return data;
    }
  }
  var api = {
    get: function (path, params, opts) {
      var qs = "";
      if (params) { var u = new URLSearchParams(); Object.keys(params).forEach(function (k) { var v = params[k]; if (v !== undefined && v !== null && v !== "") u.set(k, v); }); qs = u.toString(); }
      return request("GET", path + (qs ? (path.indexOf("?") >= 0 ? "&" : "?") + qs : ""), undefined, opts);
    },
    post: function (path, body, opts) { return request("POST", path, body || {}, opts); },
  };

  // ------------------------------------------------------------------ session
  function getUser() { try { return JSON.parse(store.get(USER_KEY) || "null"); } catch (e) { return null; } }
  function clearSession() { store.del(TOKEN_KEY); store.del(USER_KEY); }
  var session = {
    get user() { return store.get(TOKEN_KEY) ? getUser() : null; },
    get token() { return store.get(TOKEN_KEY); },
    is: function () { var u = session.user; if (!u) return false; for (var i = 0; i < arguments.length; i++) if (u.role === arguments[i]) return true; return false; },
    login: async function (username, password) {
      var r = await api.post("/api/login", { username: username, password: password });
      store.set(TOKEN_KEY, r.token); store.set(USER_KEY, JSON.stringify(r.user));
      return r.user;
    },
    logout: async function () {
      try { await api.post("/api/logout", {}); } catch (e) {}
      clearSession(); location.href = "/";
    },
    refresh: async function () {
      if (!store.get(TOKEN_KEY)) return null;
      try { var r = await api.get("/api/me"); if (r.user) { store.set(USER_KEY, JSON.stringify(r.user)); return r.user; } clearSession(); return null; }
      catch (e) { if (e.status === 401) { clearSession(); return null; } return getUser(); }
    },
  };

  // ------------------------------------------------------------------ pages & navigation
  var STAFF = ["ADMIN", "EXCHANGE", "BANK", "BROKER", "INSTITUTIONAL", "VIEWER"];
  var PAGES = [
    { id: "market", href: "/", label: "Market", roles: "*" },
    { id: "order", href: "/order.html", label: "Create Order", roles: ["ADMIN", "BROKER"] },
    { id: "exchange", href: "/exchange.html", label: "Exchange", roles: ["ADMIN", "EXCHANGE", "VIEWER"] },
    { id: "bank", href: "/bank.html", label: "Bank", roles: ["ADMIN", "BANK", "VIEWER"] },
    { id: "orders", href: "/orders.html", label: "Order Tracking", roles: STAFF.concat(["PARTICIPANT"]) },
    { id: "institutional", href: "/institutional.html", label: "Institutional", roles: ["ADMIN", "INSTITUTIONAL", "VIEWER"] },
    { id: "commissions", href: "/commissions.html", label: "Broker Commission", roles: STAFF },
    { id: "portfolios", href: "/portfolios.html", label: "Portfolios", roles: STAFF.concat(["PARTICIPANT"]), labelFor: { PARTICIPANT: "My Portfolio" } },
    { id: "admin", href: "/admin.html", label: "Event Admin", roles: ["ADMIN", "VIEWER"] },
    { id: "audit", href: "/audit.html", label: "Audit Log", roles: ["ADMIN", "VIEWER", "EXCHANGE", "BANK"] },
    { id: "cash", href: "/cash.html", label: "Cash Ledger", roles: ["ADMIN", "BANK", "VIEWER", "EXCHANGE", "PARTICIPANT"] },
    { id: "insights", href: "/insights.html", label: "Market Intelligence", roles: "*" },
    { id: "certificates", href: "/certificates.html", label: "Certificates", roles: ["ADMIN", "VIEWER"] },
  ];
  function allowed(page, user) {
    if (page.roles === "*") return true;
    return !!user && page.roles.indexOf(user.role) >= 0;
  }
  var ROLE_LABEL = { ADMIN: "Administrator", EXCHANGE: "Exchange Operator", BANK: "Bank Operator", BROKER: "Broker / Pit Manager",
    INSTITUTIONAL: "Institutional Investor", PARTICIPANT: "Participant", VIEWER: "Faculty Viewer" };
  var STATUS = {
    NOT_STARTED: { cls: "not-started", text: "Not started" }, LIVE: { cls: "live", text: "Market live" },
    SETTLEMENT_ONLY: { cls: "settlement", text: "Settlement only" }, CLOSED: { cls: "closed", text: "Market closed" },
    FINALIZED: { cls: "finalized", text: "Finalized" },
  };

  function el(html) { var t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; }

  var shellState = { status: null, index: null, statusCbs: [] };
  function renderShell(opts) {
    var user = session.user;
    var pages = PAGES.filter(function (p) { return allowed(p, user); });
    var nav = pages.map(function (p) {
      var label = (p.labelFor && user && p.labelFor[user.role]) || p.label;
      return '<a href="' + p.href + '"' + (p.id === opts.page ? ' aria-current="page"' : "") + ">" + esc(label) + "</a>";
    }).join("");
    var right = user
      ? '<div class="tb-user"><div class="who"><b>' + esc(user.name || user.username) + "</b><span>" + esc(ROLE_LABEL[user.role] || user.role) +
        (user.team ? " · " + esc(user.team) : "") + '</span></div><button class="tb-btn tb-pw" type="button" id="jsePw" title="Change your password">Password</button>' +
        '<button class="tb-btn" type="button" id="jseLogout">Sign out</button></div>'
      : '<a class="tb-btn" href="/login.html?next=' + encodeURIComponent(location.pathname + location.search) + '">Sign in</a>';
    var envTag = CFG.env === "staging" ? ' <span class="pill settlement env-pill" title="Staging data">Staging</span>' : CFG.env === "local" ? ' <span class="pill not-started env-pill">Local</span>' : "";
    var top = el('<header class="topbar"><div class="topbar-in">' +
      '<a class="brand" href="/" aria-label="JAIN STOCK EXCHANGE home"><span class="brand-mark">JSE</span><span><span class="brand-name">JAIN STOCK EXCHANGE</span><br><span class="brand-sub">Dalal Street 2026</span></span></a>' + envTag +
      '<div class="topbar-mid">' +
        '<div class="tb-index" id="jseTbIndex"><span class="lbl">CMS INDEX</span><span class="val" id="jseTbIdx">—</span><span class="chg flat" id="jseTbChg">—</span></div>' +
        '<span class="pill closed" id="jseTbPill"><span class="dot"></span><span id="jseTbPillText">Connecting…</span></span>' +
        '<span class="tb-clock" id="jseTbClock"></span>' + right +
      "</div></div></header>");
    var navEl = el('<nav class="nav" aria-label="Main"><div class="nav-in">' + nav + "</div></nav>");
    document.body.insertBefore(navEl, document.body.firstChild);
    document.body.insertBefore(top, document.body.firstChild);
    document.body.insertBefore(el('<a class="skip" href="#main">Skip to content</a>'), document.body.firstChild);
    var lo = document.getElementById("jseLogout");
    if (lo) lo.addEventListener("click", function () { session.logout(); });
    var pw = document.getElementById("jsePw");
    if (pw) pw.addEventListener("click", function () { changePassword(); });
    if (!document.querySelector(".toasts")) document.body.appendChild(el('<div class="toasts" role="status" aria-live="polite"></div>'));
    var cur = document.querySelector('.nav a[aria-current="page"]');
    if (cur && cur.scrollIntoView) { try { cur.scrollIntoView({ block: "nearest", inline: "center" }); } catch (e) {} }
    tickClock(); setInterval(tickClock, 1000);
  }
  function tickClock() {
    var c = document.getElementById("jseTbClock");
    if (c) c.textContent = new Date().toLocaleTimeString("en-IN", { timeZone: TZ, hour12: false }) + " IST";
  }
  function applyStatus(s, index) {
    var meta = STATUS[s] || { cls: "closed", text: fmt.statusText(s) };
    var pill = document.getElementById("jseTbPill"), t = document.getElementById("jseTbPillText");
    if (pill) { pill.className = "pill " + meta.cls; t.textContent = meta.text; }
    if (index) {
      var v = document.getElementById("jseTbIdx"), c = document.getElementById("jseTbChg");
      if (v) v.textContent = nf2.format(toNum(index.value));
      if (c) { c.textContent = fmt.arrowPct(index.change_pct); c.className = "chg " + fmt.dir(index.change_pct); }
    }
    var changed = shellState.status !== s;
    shellState.status = s; shellState.index = index;
    if (changed) shellState.statusCbs.forEach(function (cb) { try { cb(s); } catch (e) {} });
  }
  function offlinePill() {
    var pill = document.getElementById("jseTbPill"), t = document.getElementById("jseTbPillText");
    if (pill) { pill.className = "pill offline"; t.textContent = "Reconnecting"; }
  }

  // ------------------------------------------------------------------ polling
  /** Calls fn() now and every `ms` while the tab is visible; backs off on errors. */
  function poll(fn, ms, opts) {
    opts = opts || {};
    var timer = null, stopped = false, running = false, failures = 0;
    async function tick() {
      if (stopped) return;
      if (document.hidden && !opts.background) { schedule(ms); return; }
      if (running) return;
      running = true;
      try { await fn(); failures = 0; } catch (e) { failures++; if (opts.onError) opts.onError(e); }
      running = false;
      schedule(failures ? Math.min(ms * Math.pow(2, failures), 30000) : ms);
    }
    function schedule(d) { clearTimeout(timer); if (!stopped) timer = setTimeout(tick, d); }
    function onVis() { if (!document.hidden) { clearTimeout(timer); tick(); } }
    document.addEventListener("visibilitychange", onVis);
    if (opts.immediate === false) schedule(ms); else tick();
    return { stop: function () { stopped = true; clearTimeout(timer); document.removeEventListener("visibilitychange", onVis); }, now: function () { clearTimeout(timer); return tick(); } };
  }

  // ------------------------------------------------------------------ toasts & dialogs
  function toast(msg, type, ms) {
    var box = document.querySelector(".toasts") || document.body.appendChild(el('<div class="toasts" role="status" aria-live="polite"></div>'));
    var t = el('<div class="toast ' + (type || "") + '"><span>' + esc(msg) + '</span><button type="button" aria-label="Dismiss">×</button></div>');
    t.querySelector("button").onclick = function () { t.remove(); };
    box.appendChild(t);
    setTimeout(function () { t.remove(); }, ms || (type === "bad" ? 9000 : 5000));
  }
  /** Modal dialog. Resolves to true / input value, or false when cancelled. */
  function dialog(o) {
    return new Promise(function (resolve) {
      var inputHtml = o.input ? '<div class="field" style="margin-top:12px"><label for="jseDlgIn">' + esc(o.input.label || "") + '</label>' +
        (o.input.multiline ? '<textarea class="input" id="jseDlgIn" rows="3" placeholder="' + esc(o.input.placeholder || "") + '"></textarea>'
                           : '<input class="input" id="jseDlgIn" autocomplete="off" placeholder="' + esc(o.input.placeholder || "") + '">') +
        (o.input.hint ? '<span class="hint">' + esc(o.input.hint) + "</span>" : "") + "</div>" : "";
      var back = el('<div class="modal-back" role="dialog" aria-modal="true" aria-labelledby="jseDlgH"><div class="modal' + (o.wide ? " wide" : "") + '">' +
        '<div class="modal-h" id="jseDlgH">' + esc(o.title || "Confirm") + '</div><div class="modal-b">' + (o.html || esc(o.text || "")) + inputHtml + "</div>" +
        '<div class="modal-f">' + (o.cancel === false ? "" : '<button class="btn" type="button" data-x="cancel">' + esc(o.cancelText || "Cancel") + "</button>") +
        '<button class="btn ' + (o.danger ? "bad" : "primary") + '" type="button" data-x="ok">' + esc(o.confirmText || "Confirm") + "</button></div></div></div>");
      var prev = document.activeElement;
      function close(v) { back.remove(); document.removeEventListener("keydown", onKey); if (prev && prev.focus) prev.focus(); resolve(v); }
      function ok() {
        if (o.input) {
          var v = back.querySelector("#jseDlgIn").value.trim();
          if (o.input.required && !v) { back.querySelector("#jseDlgIn").focus(); return; }
          if (o.input.match && v !== o.input.match) { back.querySelector("#jseDlgIn").focus(); toast("Type " + o.input.match + " exactly to confirm.", "warn"); return; }
          close(v || true);
        } else close(true);
      }
      function onKey(e) { if (e.key === "Escape") close(false); if (e.key === "Enter" && !(e.target && e.target.tagName === "TEXTAREA")) { e.preventDefault(); ok(); } }
      back.addEventListener("click", function (e) { var x = e.target.getAttribute && e.target.getAttribute("data-x"); if (x === "cancel" || e.target === back) close(false); if (x === "ok") ok(); });
      document.addEventListener("keydown", onKey);
      document.body.appendChild(back);
      var f = back.querySelector("#jseDlgIn") || back.querySelector('[data-x="ok"]'); if (f) f.focus();
    });
  }

  /** Change-password dialog. opts.required: no Cancel (first sign-in); opts.oldPassword pre-fills the current one. */
  function changePassword(opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      var back = el('<div class="modal-back" role="dialog" aria-modal="true" aria-labelledby="jsePwH"><form class="modal" novalidate>' +
        '<div class="modal-h" id="jsePwH">' + esc(opts.title || "Change password") + '</div><div class="modal-b">' +
        (opts.note ? '<p class="muted" style="margin-top:0">' + esc(opts.note) + "</p>" : "") +
        '<div class="alert bad hidden" id="jsePwErr" role="alert"></div>' +
        '<div class="field"><label for="jsePwOld">Current password</label><input class="input" id="jsePwOld" type="password" autocomplete="current-password"></div>' +
        '<div class="field" style="margin-top:10px"><label for="jsePwNew">New password (at least 8 characters)</label><input class="input" id="jsePwNew" type="password" autocomplete="new-password"></div>' +
        '<div class="field" style="margin-top:10px"><label for="jsePwNew2">Repeat the new password</label><input class="input" id="jsePwNew2" type="password" autocomplete="new-password"></div>' +
        '</div><div class="modal-f">' + (opts.required ? "" : '<button class="btn" type="button" data-x="cancel">Cancel</button>') +
        '<button class="btn primary" type="submit" id="jsePwGo">Save new password</button></div></form></div>');
      var form = back.querySelector("form"), err = back.querySelector("#jsePwErr");
      function close(v) { back.remove(); document.removeEventListener("keydown", onKey); resolve(v); }
      function onKey(e) { if (e.key === "Escape" && !opts.required) close(false); }
      function showErr(m) { err.textContent = m; err.classList.remove("hidden"); }
      back.addEventListener("click", function (e) { if (e.target.getAttribute && e.target.getAttribute("data-x") === "cancel") close(false); });
      form.addEventListener("submit", async function (e) {
        e.preventDefault();
        var o = back.querySelector("#jsePwOld").value, n = back.querySelector("#jsePwNew").value, n2 = back.querySelector("#jsePwNew2").value;
        if (!o || !n) return showErr("Fill in your current and new password.");
        if (n.length < 8) return showErr("Use at least 8 characters for the new password.");
        if (n !== n2) return showErr("The two new passwords do not match.");
        if (n === o) return showErr("Choose a password different from the current one.");
        var go = back.querySelector("#jsePwGo"); go.disabled = true;
        try {
          await api.post("/api/change-password", { old_password: o, new_password: n });
          var u = getUser(); if (u) { u.must_change_password = false; store.set(USER_KEY, JSON.stringify(u)); }
          toast("Password changed.", "good");
          close(true);
        } catch (ex) { go.disabled = false; showErr(ex.message); }
      });
      document.addEventListener("keydown", onKey);
      document.body.appendChild(back);
      if (opts.oldPassword) back.querySelector("#jsePwOld").value = opts.oldPassword;
      back.querySelector(opts.oldPassword ? "#jsePwNew" : "#jsePwOld").focus();
    });
  }

  // ------------------------------------------------------------------ badges
  var STATUS_BADGE = { EXCHANGE_PENDING: "s-pending", EXCHANGE_APPROVED: "s-approved", BANK_PENDING: "s-bank", BANK_SETTLED: "s-settled", EXCHANGE_REJECTED: "s-rejected", BANK_REJECTED: "s-rejected" };
  var badge = {
    status: function (s) { return '<span class="badge ' + (STATUS_BADGE[s] || "prov") + '">' + esc(fmt.statusText(s)) + "</span>"; },
    side: function (s) { return '<span class="badge ' + (s === "BUY" ? "buy" : "sell") + '">' + esc(s) + "</span>"; },
    kind: function (k) { return k === "IPO" ? '<span class="badge ipo">IPO</span>' : '<span class="badge equity">Equity</span>'; },
    rule: function (met, status) {
      if (status === "PROVISIONAL") return '<span class="badge ' + (met ? "ok" : "warn") + '" title="Provisional until the market closes">' + (met ? "Satisfied" : "Not satisfied") + " · prov.</span>";
      return met ? '<span class="badge ok">Satisfied</span>' : '<span class="badge no">Not satisfied</span>';
    },
    access: function (a) { return '<span class="badge ' + (a === "ELIGIBLE" ? "ok" : a === "LOCKED" ? "no" : "prov") + '">' + esc(a) + "</span>"; },
  };

  // ------------------------------------------------------------------ misc
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    var b = new Uint8Array(16); crypto.getRandomValues(b); b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var h = Array.prototype.map.call(b, function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
    return h.slice(0, 8) + "-" + h.slice(8, 12) + "-" + h.slice(12, 16) + "-" + h.slice(16, 20) + "-" + h.slice(20);
  }
  function debounce(fn, ms) { var t; return function () { var a = arguments, s = this; clearTimeout(t); t = setTimeout(function () { fn.apply(s, a); }, ms); }; }
  async function download(path, fallbackName) {
    var res = await request("GET", path, undefined, { raw: true, timeout: 120000, retries: 0 });
    var name = fallbackName, cd = res.headers.get("content-disposition") || "", m = /filename="([^"]+)"/.exec(cd);
    if (m) name = m[1];
    var blob = await res.blob(), url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = name || "download"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }
  function teamSort(a, b) { return parseInt(String(a).replace(/\D/g, ""), 10) - parseInt(String(b).replace(/\D/g, ""), 10); }
  function teamCodes() { var out = []; for (var i = 1; i <= 100; i++) out.push("TEAM-" + ("00" + i).slice(-3)); return out; }

  // ------------------------------------------------------------------ page bootstrap
  /**
   * JSE.page({ id, roles, wide }) renders the shell and resolves to the signed-in user
   * (or null on public pages). When access is denied it renders a message and resolves false.
   */
  async function page(o) {
    o = o || {};
    var cfg = PAGES.filter(function (p) { return p.id === o.id; })[0] || { roles: "*" };
    var roles = o.roles || cfg.roles;
    var user = session.user;
    if (user) { var fresh = await session.refresh(); user = fresh; }
    renderShell({ page: o.id });
    document.addEventListener("jse:signedout", function () { if (roles !== "*") location.href = "/login.html?expired=1&next=" + encodeURIComponent(location.pathname + location.search); });
    startStatusTicker(o.statusFromPage);
    if (user && user.must_change_password && o.id !== "login") {
      changePassword({ required: true, title: "Choose a new password", note: "This account was given a temporary password. Choose your own before continuing." });
    }
    var main = document.getElementById("main");
    if (roles !== "*" && (!user || roles.indexOf(user.role) < 0)) {
      if (main) {
        main.innerHTML = '<div class="noaccess card"><div class="card-b" style="padding:28px">' +
          (user ? '<h2 style="margin:0 0 6px;color:var(--navy)">No access</h2><p class="muted">Your role (' + esc(ROLE_LABEL[user.role] || user.role) + ") cannot open this page.</p>"
                : '<h2 style="margin:0 0 6px;color:var(--navy)">Sign in required</h2><p class="muted">This desk is for event staff. Please sign in with your desk account.</p>' +
                  '<a class="btn primary" href="/login.html?next=' + encodeURIComponent(location.pathname + location.search) + '">Sign in</a>') +
          "</div></div>";
      }
      return false;
    }
    return user || null;
  }
  var ticker = null;
  function startStatusTicker(fromPage) {
    if (fromPage) return; // page feeds status itself (market page)
    ticker = poll(async function () {
      var s = await api.get("/api/event-status", null, { retries: 1, timeout: 10000 });
      applyStatus(s.status, s.index);
    }, 5000, { onError: offlinePill });
  }

  window.JSE = {
    config: CFG, api: api, session: session, fmt: fmt, esc: esc, el: el, poll: poll, toast: toast, dialog: dialog, badge: badge,
    uuid: uuid, debounce: debounce, download: download, page: page, applyStatus: applyStatus, offline: offlinePill, changePassword: changePassword,
    onStatus: function (cb) { shellState.statusCbs.push(cb); if (shellState.status) cb(shellState.status); },
    get status() { return shellState.status; }, teamSort: teamSort, teamCodes: teamCodes, ROLE_LABEL: ROLE_LABEL, STATUS: STATUS, toNum: toNum,
  };
})();
