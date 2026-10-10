"""Browser test of the DEPLOYED site (Cloudflare Pages + Neon Function): pages, CORS, CSP, config routing and the
order workflow through the real UI. Sessions are injected from tokens obtained by tests/ci/run.mjs (GitHub OIDC),
so no passwords are needed.
  SITE=https://v272.jse-live.pages.dev API=https://...jsestage... UI_TOKENS='{"ADMIN":"…",…}' python3 tests/ui_staging.py
"""
import json, os, sys, time, urllib.request

from playwright.sync_api import sync_playwright

SITE = os.environ["SITE"].rstrip("/")
API = os.environ["API"].rstrip("/")
TOK = json.loads(os.environ["UI_TOKENS"])
SHOTS = os.environ.get("SHOTS", "")
results = []


def check(name, ok, detail=""):
    results.append((name, bool(ok)))
    print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail else ""), flush=True)


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
    api("POST", "/api/reject-open-orders", {}, "ADMIN")
    api("POST", "/api/event", {"action": "CLOSE"}, "ADMIN")
check("reset", api("POST", "/api/reset-event", {"confirm": "RESET", "keep_allotments": False}, "ADMIN").get("success"))
api("POST", "/api/ipo-listing", {"action": "CLEAR"}, "ADMIN")
check("event started", api("POST", "/api/event", {"action": "START"}, "ADMIN").get("status") == "LIVE")

with sync_playwright() as pw:
    browser = pw.chromium.launch()

    def new_page(who=None, w=1600, h=1000, enforce_csp=False):
        # Playwright's wait_for_function polls with eval, which the site's CSP (no 'unsafe-eval') blocks, so the
        # interactive checks run with bypass_csp; the market check keeps the real CSP to prove the site works under it.
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

    # public market page on the projector size
    ctx, page, errors = new_page(None, 1920, 1080, enforce_csp=True)
    page.goto(SITE + "/")
    page.wait_for_selector(".tile", timeout=30000)
    time.sleep(1.5)
    check("market: 54 tiles from the staging API", page.locator(".tile").count() == 54, str(page.locator(".tile").count()))
    cols = page.evaluate("getComputedStyle(document.getElementById('grid')).gridTemplateColumns.split(' ').length")
    check("market: 8 tiles per row", cols == 8, str(cols))
    check("market: CMS INDEX and LIVE status", page.locator("#idxVal").inner_text() not in ("", "—") and "live" in page.locator("#mPillText").inner_text().lower())
    check("market: staging badge shown", page.locator(".env-pill").count() == 1)
    check("market: no JS / CORS / CSP errors (CSP enforced)", not errors, "; ".join(errors)[:300])
    shot(page, "staging-market")
    ctx.close()

    # broker creates an order through the form
    ctx, page, errors = new_page("PIT-01")
    page.goto(SITE + "/order.html")
    page.wait_for_function("document.querySelectorAll('#team option').length > 50", timeout=30000)
    page.wait_for_function("document.querySelectorAll('#sec option').length > 50", timeout=30000)
    page.select_option("#team", "TEAM-031")
    rel = page.evaluate("[...document.querySelectorAll('#sec option')].find(o=>o.textContent.startsWith('INFY')).value")
    page.select_option("#sec", rel)
    page.fill("#qty", "100"); page.fill("#price", "910")
    page.click("#submit")
    page.wait_for_selector("#result .done", timeout=20000)
    txt = page.inner_text("#result")
    check("broker: order created from the form", "ORD-" in txt, txt[:120])
    order_no = [w for w in txt.split() if w.startswith("ORD-")][0] if "ORD-" in txt else ""
    check("broker pages: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()

    # Exchange approves, Bank settles through the UI
    ctx, page, errors = new_page("EXCHANGE-01")
    page.goto(SITE + "/exchange.html")
    page.wait_for_selector(f"text={order_no}", timeout=20000)
    page.locator("tr", has_text=order_no).locator("button[data-a=APPROVE]").click()
    page.wait_for_function(f"!document.getElementById('rows').innerText.includes('{order_no}')", timeout=20000)
    check("exchange: approved from the queue", True)
    check("exchange page: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()
    ctx, page, errors = new_page("BANK-01")
    page.goto(SITE + "/bank.html")
    page.wait_for_selector(f"text={order_no}", timeout=20000)
    page.locator("tr", has_text=order_no).locator("button[data-a=SETTLE]").click()
    page.wait_for_selector(".toast.good", timeout=20000)
    check("bank: settled from the queue", "settled" in page.inner_text(".toast.good"), page.inner_text(".toast.good")[:120])
    check("bank page: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()
    m = api("GET", "/api/market")
    infy = [s for s in m["stocks"] if s["symbol"] == "INFY"][0]
    check("market price follows the settled trade", float(infy["price"]) == 910.0, str(infy["price"]))

    # participant sees own portfolio
    ctx, page, errors = new_page("TEAM-031")
    page.goto(SITE + "/portfolios.html")
    page.wait_for_selector("#detail:not(.hidden)", timeout=20000)
    check("participant: own holdings visible", "INFY" in page.inner_text("#detail"))
    check("participant: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()

    # administrator opens every page with the real CSP enforced (no eval-based waits here)
    ctx, page, errors = new_page("ADMIN", enforce_csp=True)
    for p in ["/", "/order.html", "/exchange.html", "/bank.html", "/orders.html", "/institutional.html", "/commissions.html",
              "/portfolios.html", "/admin.html", "/audit.html", "/cash.html", "/insights.html", "/certificates.html"]:
        errors.clear()
        page.goto(SITE + p)
        page.wait_for_load_state("networkidle", timeout=30000)
        time.sleep(1.0)
        check(f"admin opens {p}", page.locator(".noaccess").count() == 0)
        check(f"{p}: no JS errors", not errors, "; ".join(errors)[:300])
        if p == "/admin.html":
            shot(page, "staging-admin")
    ctx.close()
    browser.close()

api("POST", "/api/reject-open-orders", {}, "ADMIN")
fails = [r for r in results if not r[1]]
print(f"\n{len(results) - len(fails)}/{len(results)} staging UI checks passed")
sys.exit(1 if fails else 0)
