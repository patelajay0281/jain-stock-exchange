"""Browser tests of the v311 workflow through the real pages (Playwright + Chromium), against the local dev server:
participant instruction → broker submission → Pit Manager execution (trading slip) → Exchange → Bank, role-aware
navigation, the IPO market before START, START from Event Admin with the password dialog, Market News, Rules &
Configuration, and a JS-error sweep of every page for every role.
    BASE=http://127.0.0.1:8788 python3 tests/ui_smoke.py          (screenshots in .local/shots/)"""
import json, os, sys, time, urllib.request

from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE", "http://127.0.0.1:8788")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.path.join(ROOT, ".local", "shots")
os.makedirs(SHOTS, exist_ok=True)
KNOWN = {"ADMIN": "admin-pass-1", "BROKER-01": "broker-pass-01", "PIT-01": "pit-pass-01", "EXCHANGE-01": "exch-pass-01", "BANK-01": "bank-pass-01",
         "INST-01": "inst-pass-01", "TEAM-001": "team-pass-001", "TEAM-002": "team-pass-002", "FACULTY-01": "faculty-pass-1"}
pw = lambda u: KNOWN.get(u, u.lower() + "-pw")
A = {"admin_password": KNOWN["ADMIN"]}
NAV = {
    "PARTICIPANT": ["Market", "Order Tracking", "Participant Portfolios", "Cash Ledger"],
    "BROKER": ["Market", "Create Order", "Order Tracking", "Broker Commission"],
    "PIT_MANAGER": ["Market", "Create Order", "Order Tracking"],
    "EXCHANGE": ["Market", "Exchange Settlement", "Order Tracking"],
    "BANK": ["Market", "Bank Settlement", "Order Tracking", "Cash Ledger"],
    "INSTITUTIONAL": ["Market", "Order Tracking", "Institutional Investors"],
}
ADMIN_NAV = ["Market", "Create Order", "Exchange Settlement", "Bank Settlement", "Order Tracking", "Institutional Investors",
             "Broker Commission", "Participant Portfolios", "Event Admin", "Audit Log", "Cash Ledger"]
results = []


def check(name, ok, detail=""):
    results.append((name, bool(ok)))
    print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail and not ok else ""), flush=True)


def api(method, path, body=None, token=None):
    req = urllib.request.Request(BASE + path, method=method, data=None if body is None else json.dumps(body).encode(),
                                 headers={"content-type": "application/json", **({"authorization": "Bearer " + token} if token else {})})
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return json.loads(e.read())


# ---- setup through the API: clean event, one IPO allotment, not started ----
admin = api("POST", "/api/login", {"username": "ADMIN", "password": KNOWN["ADMIN"]})["token"]
st = api("GET", "/api/event-status")["status"]
if st in ("LIVE", "SETTLEMENT_ONLY"):
    api("POST", "/api/reject-open-orders", dict(A), admin)
    api("POST", "/api/event", {"action": "CLOSE", **A}, admin)
r = api("POST", "/api/reset-event", {"confirm": "RESET", "keep_allotments": False, **A}, admin)
check("setup: reset", r.get("success"), str(r)[:200])
api("POST", "/api/ipo-listing", {"action": "CLEAR", **A}, admin)
api("POST", "/api/config", {"auto_list_ipos": True, "brokerage_rate": 0.005, **A}, admin)
r = api("POST", "/api/ipo-allotments", {"rows": [{"team": "TEAM-001", "ipo": "VOLTRA", "lots": 2}], **A}, admin)
check("setup: IPO allotment for TEAM-001", r.get("success"), str(r)[:200])
names = api("GET", "/api/team-names", token=admin)["teams"]
broker_of = {t["team"]: t["broker"] for t in names}
team_name = {t["team"]: t["name"] for t in names}
B1 = broker_of["TEAM-001"]
SECOND = next(t["team"] for t in names if t["broker"] == B1 and t["team"] != "TEAM-001")

with sync_playwright() as pwr:
    browser = pwr.chromium.launch()

    def new_page(w=1500, h=1000, scale=1, user=None):
        ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=scale)
        page = ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append("pageerror: " + str(e)))
        page.on("console", lambda m: errors.append("console: " + m.text) if m.type == "error" and "status of 4" not in m.text else None)
        if user:
            page.goto(BASE + "/login.html")
            page.fill("#u", user); page.fill("#p", pw(user)); page.click("#go")
            page.wait_for_load_state("networkidle")
        return ctx, page, errors

    def nav(page):
        return page.eval_on_selector_all(".nav a", "els => els.map(e => e.textContent.trim())")

    def confirm_password(page):
        page.wait_for_selector("#jseAcP")
        page.fill("#jseAcP", KNOWN["ADMIN"])
        page.click(".modal button[type=submit]")

    # ---- 1. Market before START: the IPO market sits on top, the CMS INDEX has the 50 equities ----
    ctx, page, errors = new_page(1920, 1080)
    page.goto(BASE + "/"); page.wait_for_selector("#grid .tile"); time.sleep(0.8)
    page.screenshot(path=os.path.join(SHOTS, "market-before-start.png"), full_page=True)
    check("market (pre-START): 54 tiles — 50 equities + 4 IPOs", page.locator("#grid .tile").count() == 54, str(page.locator("#grid .tile").count()))
    check("market (pre-START): IPO tiles marked IPO", page.locator("#grid .tile .tile-kind", has_text="IPO").count() == 4)
    check("market (pre-START): CMS INDEX of 50 components", "50" in page.inner_text("#idxComp"), page.inner_text("#idxComp"))
    check("market: no JS errors (pre-START)", not errors, "; ".join(errors)[:300])
    ctx.close()

    # ---- 2. Event Admin starts the market (one password dialog) ----
    ctx, page, errors = new_page(user="ADMIN")
    check("admin lands on Event Admin", page.url.endswith("/admin.html"), page.url)
    page.wait_for_selector("[data-ev=START]:not([disabled])")
    page.click("[data-ev=START]"); confirm_password(page)
    page.wait_for_function("document.getElementById('stText').textContent.toLowerCase().includes('live')", timeout=15000)
    check("START from Event Admin → market LIVE", api("GET", "/api/event-status")["status"] == "LIVE")
    check("admin: Market Intelligence embedded", page.locator("#intelligence").count() == 1)
    check("admin page: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()

    # ---- 3. Market after START: 54 listed tiles, IPO section gone, 8 per row ----
    ctx, page, errors = new_page(1920, 1080)
    page.goto(BASE + "/"); page.wait_for_selector("#grid .tile"); time.sleep(0.8)
    page.screenshot(path=os.path.join(SHOTS, "market-desktop.png"), full_page=True)
    n = page.locator("#grid .tile").count()
    check("market (LIVE): 54 listed tiles (50 equities + 4 listed IPOs), each once", n == 54 and
          len(set(page.eval_on_selector_all("#grid .tile", "els => els.map(e => e.dataset.sym)"))) == 54, str(n))
    check("market (LIVE): CMS INDEX of 54 components", "54" in page.inner_text("#idxComp"), page.inner_text("#idxComp"))
    cols = page.evaluate("getComputedStyle(document.getElementById('grid')).gridTemplateColumns.split(' ').length")
    check("market: 8 tiles per row on a projector", cols == 8, str(cols))
    check("market: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()
    ctx, page, errors = new_page(390, 844, 2)
    page.goto(BASE + "/"); page.wait_for_selector("#grid .tile"); time.sleep(0.4)
    page.screenshot(path=os.path.join(SHOTS, "market-mobile.png"))
    check("market mobile: no horizontal scroll", page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"))
    ctx.close()

    # ---- 4. logged out: staff pages ask for sign-in ----
    ctx, page, errors = new_page()
    page.goto(BASE + "/exchange.html"); page.wait_for_selector(".noaccess")
    check("staff page asks for sign-in when logged out", "Sign in required" in page.inner_text(".noaccess"))
    ctx.close()

    # ---- 5. participant: own identity and broker; no order entry ----
    ctx, page, errors = new_page(user="TEAM-001")
    check("participant lands on Participant Portfolios", page.url.endswith("/portfolios.html"), page.url)
    check("participant navigation: Hatchable pages for a team", nav(page) == NAV["PARTICIPANT"], str(nav(page)))
    page.wait_for_selector("#detail:not(.hidden)")
    det = page.inner_text("#detail")
    check("participant sees its team name and code", team_name["TEAM-001"] in det and "TEAM-001" in det)
    check("participant sees its assigned broker", B1 in det)
    check("IPO allotment held but not counted (BUY 0 / 5)", "VOLTRA" in det and "BUY 0 / 5" in det.upper())
    check("official winner criterion shown", "OFFICIAL WINNER CRITERION" in page.inner_text("#rules").upper())
    page.screenshot(path=os.path.join(SHOTS, "participant-portfolio.png"), full_page=True)
    page.goto(BASE + "/order.html"); page.wait_for_selector(".noaccess")
    check("participant cannot open Create Order (self entry disabled)", page.locator(".noaccess").count() == 1)
    page.goto(BASE + "/admin.html"); page.wait_for_selector(".noaccess")
    check("participant cannot open Event Admin", page.locator(".noaccess").count() == 1)
    check("participant pages: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()

    # ---- 6. broker: only its teams; creates orders at the market price → Exchange ----
    ctx, page, errors = new_page(user=B1)
    check("broker lands on Create Order", page.url.endswith("/order.html"), page.url)
    check("broker navigation", nav(page) == NAV["BROKER"], str(nav(page)))
    page.wait_for_function("document.querySelectorAll('#team option').length > 1")
    opts = page.eval_on_selector_all("#team option", "els => els.map(e => e.value).filter(Boolean)")
    check("broker ticket lists only its 10 assigned teams", len(opts) == 10 and all(broker_of[t] == B1 for t in opts), str(opts))
    page.select_option("#team", "TEAM-001")
    page.wait_for_function("document.querySelectorAll('#sec option').length > 50")
    page.select_option("#sec", "INFY"); page.fill("#qty", "100"); page.dispatch_event("#qty", "input")
    page.click("#submit"); page.wait_for_selector("#result .done", timeout=10000)
    txt = page.inner_text("#result")
    check("broker creates an order → Exchange Pending", "ORD-" in txt and "Infosys" in txt and "exchange pending" in txt.lower(), txt[:200])
    ord1 = [w for w in txt.split() if w.startswith("ORD-")][0]
    page.select_option("#team", SECOND)
    page.select_option("#sec", "RELIANCE"); page.fill("#qty", "100"); page.dispatch_event("#qty", "input")
    page.wait_for_function("document.getElementById('pvTv').textContent.includes('2,89,000')")
    check("settlement preview: total shares, trade value, brokerage, total required",
          page.inner_text("#pvSh") == "100" and "1,445" in page.inner_text("#pvBrk") and "2,90,445" in page.inner_text("#pvAmt"),
          page.inner_text("#pvBrk") + " " + page.inner_text("#pvAmt"))
    check("price per share is locked to the market price", page.get_attribute("#mp", "readonly") is not None and page.input_value("#mp").replace("\u20b9", "").replace(",", "") == "2890")
    page.screenshot(path=os.path.join(SHOTS, "create-order.png"), full_page=True)
    page.click("#submit"); page.wait_for_function("document.querySelector('#result .done') && document.querySelector('#result').innerText.includes('Reliance')", timeout=10000)
    ord2 = [w for w in page.inner_text("#result").split() if w.startswith("ORD-")][0]
    check("second order created", ord2 != ord1)
    check("broker pages: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()

    # ---- 7. Pit Manager records trades through Create Order for any team ----
    ctx, page, errors = new_page(user="PIT-01")
    check("Pit Manager lands on Create Order", page.url.endswith("/order.html"), page.url)
    check("Pit Manager navigation", nav(page) == NAV["PIT_MANAGER"], str(nav(page)))
    page.wait_for_function("document.querySelectorAll('#team option').length > 100")
    check("Pit Manager sees all 100 teams", page.locator("#team option").count() == 101)
    check("pit page: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()

    # ---- 8. Exchange approves, Bank settles ----
    ctx, page, errors = new_page(user="EXCHANGE-01")
    check("Exchange navigation", nav(page) == NAV["EXCHANGE"], str(nav(page)))
    for o in (ord1, ord2):
        page.wait_for_selector(f"#rows .txn:has-text('{o}') button[data-a=APPROVE]")
        page.locator("#rows .txn", has_text=o).locator("button[data-a=APPROVE]").click()
        page.wait_for_function(f"!document.getElementById('rows').innerText.includes('{o}')", timeout=10000)
    check("Exchange approves the created orders", True)
    check("exchange page: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()
    ctx, page, errors = new_page(user="BANK-01")
    check("Bank navigation", nav(page) == NAV["BANK"], str(nav(page)))
    page.wait_for_selector(f"#rows .txn:has-text('{ord1}') button[data-a=SETTLE]")
    page.locator("#rows .txn", has_text=ord1).locator("button[data-a=SETTLE]").click()
    if page.locator(".modal-h.review").count(): page.click(".modal [data-x=ok]")
    page.wait_for_selector(".toast.good", timeout=10000)
    t = page.inner_text(".toasts")
    check("Bank settlement toast: cash, holding, price unchanged", "settled" in t and "market price unchanged" in t, t[:200])
    page.wait_for_selector(f"#rows .txn:has-text('{ord2}') button[data-a=SETTLE]")
    page.locator("#rows .txn", has_text=ord2).locator("button[data-a=SETTLE]").click()
    time.sleep(0.3)
    if page.locator(".modal-h.review").count(): page.click(".modal [data-x=ok]")
    page.wait_for_function(f"!document.getElementById('rows').innerText.includes('{ord2}')", timeout=10000)
    check("bank page: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()
    m = api("GET", "/api/market")
    check("settlement did not move the price (INFY ₹900, RELIANCE ₹2,890)",
          [float(s["price"]) for s in m["stocks"] if s["symbol"] in ("INFY", "RELIANCE")] == [2890.0, 900.0] or
          sorted(float(s["price"]) for s in m["stocks"] if s["symbol"] in ("INFY", "RELIANCE")) == [900.0, 2890.0])

    # ---- 9. participant: four-step tracking, portfolio, cash ledger ----
    ctx, page, errors = new_page(user="TEAM-001")
    page.goto(BASE + "/orders.html?order=" + ord1); page.wait_for_selector(".flow", timeout=10000)
    flow = page.inner_text(".flow")
    check("tracking shows the four-step flow", all(k.lower() in flow.lower() for k in
          ["Order Created", "Exchange Review", "Bank Settlement", "Market / Cash Updated"]), flow[:300])
    page.screenshot(path=os.path.join(SHOTS, "tracking.png"), full_page=True)
    page.goto(BASE + "/portfolios.html"); page.wait_for_selector("#detail:not(.hidden)")
    det = page.inner_text("#detail").upper()
    check("portfolio: INFY holding and BUY 1 / 5", "INFY" in det and "BUY 1 / 5" in det)
    page.goto(BASE + "/cash.html"); page.wait_for_selector("#rows tr"); time.sleep(0.8)
    check("participant cash ledger shows its BUY", ord1 in page.inner_text("#rows"))
    check("participant follow-up pages: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()

    # ---- 10. Event Admin: Market News, Rules & Configuration (password), every page ----
    ctx, page, errors = new_page(user="ADMIN")
    page.wait_for_function("document.querySelectorAll('#nSec option').length > 50")
    tcs = page.evaluate("[...document.querySelectorAll('#nSec option')].find(o => o.textContent.startsWith('TCS')).value")
    page.select_option("#nSec", tcs); page.click("[data-mood=POSITIVE]")
    check("Market News has no headline field", page.locator("#nHead").count() == 0)
    page.click("#nGo")
    page.wait_for_selector(".modal .btn.primary"); page.click(".modal .btn.primary")
    page.wait_for_function("document.querySelector('.toasts').innerText.includes('TCS')", timeout=10000)
    check("Market News published from Event Admin", True)
    check("the latest changed security tops the board", api("GET", "/api/market")["board"]["listed_market"][0] == "TCS")
    page.fill("[data-cfg=brokerage_rate]", "0.6"); page.click("#cfgSave"); confirm_password(page)
    page.wait_for_function("document.querySelector('.toasts').innerText.includes('Configuration saved')", timeout=10000)
    check("Rules & Configuration saved with the password (brokerage 0.60%)", abs(float(api("GET", "/api/event-status")["config"]["brokerage_rate"]) - 0.006) < 1e-9)
    page.wait_for_selector("[data-cfg=brokerage_rate]"); time.sleep(0.5)
    page.fill("[data-cfg=brokerage_rate]", "0.5"); page.click("#cfgSave"); confirm_password(page)
    page.wait_for_function("[...document.querySelectorAll('.toast')].filter(t => t.innerText.includes('Configuration saved')).length >= 1", timeout=10000)
    time.sleep(0.5)
    check("brokerage back to 0.50%", abs(float(api("GET", "/api/event-status")["config"]["brokerage_rate"]) - 0.005) < 1e-9)
    page.screenshot(path=os.path.join(SHOTS, "admin.png"), full_page=True)
    for p in ["/", "/order.html", "/exchange.html", "/bank.html", "/orders.html", "/institutional.html",
              "/commissions.html", "/portfolios.html", "/admin.html", "/audit.html", "/cash.html"]:
        errors.clear()
        page.goto(BASE + p); page.wait_for_load_state("networkidle"); time.sleep(1.0)
        check(f"admin opens {p} without errors", page.locator(".noaccess").count() == 0 and not errors, "; ".join(errors)[:300])
    labels = nav(page)
    check("admin navigation: the 11 Hatchable pages in order", labels == ADMIN_NAV, str(labels))
    ctx.close()

    # ---- 11. faculty viewer is read-only; institution has no price controls ----
    ctx, page, errors = new_page(user="FACULTY-01")
    page.goto(BASE + "/exchange.html"); page.wait_for_load_state("networkidle"); time.sleep(0.8)
    check("viewer sees no approve buttons", page.locator("button[data-a=APPROVE]").count() == 0)
    page.goto(BASE + "/admin.html"); page.wait_for_selector("[data-ev=START]", state="attached"); time.sleep(0.8)
    check("viewer: event controls hidden or disabled", page.evaluate("[...document.querySelectorAll('[data-ev]')].every(b => b.disabled || !b.offsetParent)"))
    check("viewer can read the embedded Market Intelligence", page.is_visible("#intelligence"))
    ctx.close()
    ctx, page, errors = new_page(user="INST-01")
    check("institution lands on its desk", page.url.endswith("/institutional.html"), page.url)
    check("institution navigation", nav(page) == NAV["INSTITUTIONAL"], str(nav(page)))
    page.wait_for_selector("#mktPrice"); time.sleep(0.8)
    check("institutional desk: Market News → Automatic Price Impact, ticket, live market, history",
          page.locator("#nSec").count() == 1 and page.locator("#moods [data-mood]").count() == 7 and page.locator("[data-side]").count() == 2 and page.locator("input#price").count() == 0)
    page.screenshot(path=os.path.join(SHOTS, "institutional.png"), full_page=True)
    check("institution page: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()
    browser.close()

# ---- cleanup ----
api("POST", "/api/reject-open-orders", dict(A), admin)
api("POST", "/api/event", {"action": "CLOSE", **A}, admin)
api("POST", "/api/reset-event", {"confirm": "RESET", "keep_allotments": False, **A}, admin)

fails = [r for r in results if not r[1]]
print(f"\n{len(results) - len(fails)}/{len(results)} UI checks passed")
sys.exit(1 if fails else 0)
