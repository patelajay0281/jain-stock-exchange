"""Browser test of the DEPLOYED site (Cloudflare Pages + Neon Function), v311 workflow through the real pages:
Create Order (broker) → Exchange → Bank on the deployed site, role-aware navigation and every page with the real CSP.
navigation, CSP / CORS / config routing. Sessions are injected from tokens obtained by tests/ci/run.mjs (GitHub OIDC),
so no passwords are needed (CI sessions are exempt from the administrator password dialog on staging).
  SITE=https://v272.jse-live.pages.dev API=https://...jsestage... UI_TOKENS='{"ADMIN":"…","BROKER":"…",…}' python3 tests/ui_staging.py
"""
import json, os, sys, time, urllib.request

from playwright.sync_api import sync_playwright

SITE = os.environ["SITE"].rstrip("/")
API = os.environ["API"].rstrip("/")
TOK = json.loads(os.environ["UI_TOKENS"])        # ADMIN, BROKER (the broker of TEAM-031), PIT-01, EXCHANGE-01, BANK-01, TEAM-031
SHOTS = os.environ.get("SHOTS", "")
CI_PW = {"admin_password": os.environ.get("ADMIN_PW", "ci-session")}   # ignored for CI sessions (ADMIN_PW only for a local dry run)
results = []


def check(name, ok, detail=""):
    results.append((name, bool(ok)))
    print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail and not ok else ""), flush=True)


def api(method, path, body=None, who=None):
    req = urllib.request.Request(API + path, method=method, data=None if body is None else json.dumps(body).encode(),
                                 headers={"content-type": "application/json", **({"authorization": "Bearer " + TOK[who]} if who else {})})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return json.loads(e.read())


st = api("GET", "/api/event-status")["status"]
if st in ("LIVE", "SETTLEMENT_ONLY"):
    api("POST", "/api/reject-open-orders", dict(CI_PW), "ADMIN")
    api("POST", "/api/event", {"action": "CLOSE", **CI_PW}, "ADMIN")
check("reset", api("POST", "/api/reset-event", {"confirm": "RESET", "keep_allotments": False, **CI_PW}, "ADMIN").get("success"))
api("POST", "/api/ipo-listing", {"action": "CLEAR", **CI_PW}, "ADMIN")
check("event started (all four IPOs listed)", len(api("POST", "/api/event", {"action": "START", **CI_PW}, "ADMIN").get("listed", [])) == 4)

with sync_playwright() as pw:
    browser = pw.chromium.launch()

    def new_page(who=None, w=1600, h=1000, enforce_csp=False):
        # Playwright's wait_for_function polls with eval, which the site's CSP (no 'unsafe-eval') blocks, so the
        # interactive checks run with bypass_csp; the market and admin sweeps keep the real CSP to prove the site works under it.
        ctx = browser.new_context(viewport={"width": w, "height": h}, bypass_csp=not enforce_csp)
        if who:
            ctx.add_init_script("try{localStorage.setItem(%s,%s);localStorage.setItem(%s,%s)}catch(e){}" % (
                json.dumps("jse_token:" + API), json.dumps(TOK[who]), json.dumps("jse_user:" + API), json.dumps(json.dumps({"username": who, "role": "?"}))))
        page = ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append("pageerror: " + str(e)))
        page.on("console", lambda m: errors.append("console: " + m.text) if m.type == "error" and "status of 4" not in m.text else None)
        return ctx, page, errors

    def shot(page, name):
        if SHOTS:
            os.makedirs(SHOTS, exist_ok=True)
            page.screenshot(path=os.path.join(SHOTS, name + ".png"), full_page=False)

    def nav(page):
        return page.eval_on_selector_all(".nav a", "els => els.map(e => e.textContent.trim())")

    # public market page on the projector size, real CSP
    ctx, page, errors = new_page(None, 1920, 1080, enforce_csp=True)
    page.goto(SITE + "/")
    page.wait_for_selector("#grid .tile", timeout=30000)
    time.sleep(1.5)
    check("market: 54 listed tiles from the staging API", page.locator("#grid .tile").count() == 54, str(page.locator("#grid .tile").count()))
    check("market: CMS INDEX of 54 components and LIVE status", "54" in page.inner_text("#idxComp") and "live" in page.locator("#mPillText").inner_text().lower())
    check("market: staging badge shown", page.locator(".env-pill").count() == 1)
    check("market: no JS / CORS / CSP errors (CSP enforced)", not errors, "; ".join(errors)[:300])
    shot(page, "staging-market")
    ctx.close()

    # participant: Hatchable navigation, no order entry
    ctx, page, errors = new_page("TEAM-031")
    page.goto(SITE + "/portfolios.html")
    page.wait_for_selector("#detail:not(.hidden)", timeout=30000)
    check("participant navigation", nav(page) == ["Market", "Order Tracking", "Participant Portfolios", "Cash Ledger"], str(nav(page)))
    check("participant pages: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()

    # broker creates the order (Create Order → Exchange)
    ctx, page, errors = new_page("BROKER")
    page.goto(SITE + "/order.html")
    page.wait_for_function("document.querySelectorAll('#team option').length > 1", timeout=30000)
    page.select_option("#team", "TEAM-031")
    page.wait_for_function("document.querySelectorAll('#sec option').length > 50", timeout=30000)
    page.select_option("#sec", "INFY"); page.fill("#qty", "100"); page.dispatch_event("#qty", "input")
    page.click("#submit"); page.wait_for_selector("#result .done", timeout=20000)
    txt = page.inner_text("#result")
    check("broker: order created → Exchange Pending", "ORD-" in txt and "exchange pending" in txt.lower(), txt[:160])
    order_no = [w for w in txt.split() if w.startswith("ORD-")][0] if "ORD-" in txt else ""
    check("broker pages: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()

    ctx, page, errors = new_page("EXCHANGE-01")
    page.goto(SITE + "/exchange.html")
    page.wait_for_selector(f"#rows .txn:has-text('{order_no}') button[data-a=APPROVE]", timeout=30000)
    page.locator("#rows .txn", has_text=order_no).locator("button[data-a=APPROVE]").click()
    page.wait_for_function(f"!document.getElementById('rows').innerText.includes('{order_no}')", timeout=20000)
    check("exchange: approved from the queue", True)
    check("exchange page: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()
    ctx, page, errors = new_page("BANK-01")
    page.goto(SITE + "/bank.html")
    page.wait_for_selector(f"#rows .txn:has-text('{order_no}') button[data-a=SETTLE]", timeout=30000)
    page.locator("#rows .txn", has_text=order_no).locator("button[data-a=SETTLE]").click()
    time.sleep(0.5)
    if page.locator(".modal-h.review").count(): page.click(".modal [data-x=ok]")
    page.wait_for_selector(".toast.good", timeout=20000)
    check("bank: settled, market price unchanged", "settled" in page.inner_text(".toasts") and "unchanged" in page.inner_text(".toasts"), page.inner_text(".toasts")[:160])
    check("bank page: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()
    infy = [s for s in api("GET", "/api/market")["stocks"] if s["symbol"] == "INFY"][0]
    check("settlement does not move the market price", float(infy["price"]) == 900.0, str(infy["price"]))

    # participant: four-step tracking
    ctx, page, errors = new_page("TEAM-031")
    page.goto(SITE + "/orders.html?order=" + order_no)
    page.wait_for_selector(".flow", timeout=30000)
    flow = page.inner_text(".flow").lower()
    check("participant: four-step flow", all(k in flow for k in ["order created", "exchange review", "bank settlement", "market / cash updated"]), flow[:200])
    check("participant follow-up pages: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()

    # administrator opens every page with the real CSP enforced (no eval-based waits here)
    ctx, page, errors = new_page("ADMIN", enforce_csp=True)
    for p in ["/", "/order.html", "/exchange.html", "/bank.html", "/orders.html", "/institutional.html",
              "/commissions.html", "/portfolios.html", "/admin.html", "/audit.html", "/cash.html"]:
        errors.clear()
        page.goto(SITE + p)
        page.wait_for_load_state("networkidle", timeout=30000)
        time.sleep(1.0)
        check(f"admin opens {p} (CSP enforced, no errors)", page.locator(".noaccess").count() == 0 and not errors, "; ".join(errors)[:300])
        if p == "/admin.html":
            shot(page, "staging-admin")
    if "127.0.0.1" not in SITE and "localhost" not in SITE:      # Cloudflare Pages applies public/_redirects
        page.goto(SITE + "/insights.html"); page.wait_for_load_state("networkidle", timeout=30000)
        # Cloudflare Pages serves /admin.html at the pretty URL /admin
        check("old insights page redirects to Market Intelligence in Event Admin", "/admin" in page.url and "intelligence" in page.url, page.url)
    ctx.close()
    browser.close()

api("POST", "/api/reject-open-orders", dict(CI_PW), "ADMIN")
fails = [r for r in results if not r[1]]
print(f"\n{len(results) - len(fails)}/{len(results)} staging UI checks passed")
sys.exit(1 if fails else 0)
