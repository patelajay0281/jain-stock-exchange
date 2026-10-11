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
    "PARTICIPANT": ["Market", "IPO", "My Orders", "My Trading Slips", "My Portfolio"],
    "BROKER": ["Market", "IPO", "Broker Desk", "Order Tracking", "Broker Commission"],
    "PIT_MANAGER": ["Market", "IPO", "Pit Manager", "Order Tracking", "Trading Slips"],
    "EXCHANGE": ["Market", "IPO", "Exchange Settlement", "Order Tracking"],
    "BANK": ["Market", "IPO", "Bank Settlement", "Order Tracking", "Cash Ledger"],
    "INSTITUTIONAL": ["Market", "IPO", "Order Tracking", "Institutional Investors"],
}
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
api("POST", "/api/ipo-applications", {"action": "CLEAR", **A}, admin)
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
    check("market (pre-START): IPO Market section shown first", page.is_visible("#ipoSection") and
          page.evaluate("document.getElementById('ipoSection').getBoundingClientRect().top < document.getElementById('grid').getBoundingClientRect().top"))
    check("market (pre-START): 4 IPOs in the IPO market", page.locator("#ipoGrid > *").count() == 4, str(page.locator("#ipoGrid > *").count()))
    check("market (pre-START): 50 listed equity tiles", page.locator("#grid .tile").count() == 50, str(page.locator("#grid .tile").count()))
    check("market (pre-START): CMS INDEX of 50 components", "50" in page.inner_text("#idxComp"), page.inner_text("#idxComp"))
    check("market: rumour / not-advice disclaimer shown", "not real investment advice" in page.inner_text("#disc"))
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
    check("market (LIVE): IPO section hidden after listing", not page.is_visible("#ipoSection"))
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
    page.goto(BASE + "/pit.html"); page.wait_for_selector(".noaccess")
    check("staff page asks for sign-in when logged out", "Sign in required" in page.inner_text(".noaccess"))
    ctx.close()

    # ---- 5. participant: own identity and broker, instruction to the broker ----
    ctx, page, errors = new_page(user="TEAM-001")
    check("participant lands on My Portfolio", page.url.endswith("/portfolios.html"), page.url)
    check("participant navigation: only its five pages", nav(page) == NAV["PARTICIPANT"], str(nav(page)))
    page.wait_for_selector("#detail:not(.hidden)")
    det = page.inner_text("#detail")
    check("participant sees its team name and code", team_name["TEAM-001"] in det and "TEAM-001" in det)
    check("participant sees its assigned broker", B1 in det)
    check("IPO allotment held but not counted (BUY 0 / 5)", "VOLTRA" in det and "BUY 0 / 5" in det.upper())
    page.screenshot(path=os.path.join(SHOTS, "participant-portfolio.png"), full_page=True)
    page.goto(BASE + "/orders.html"); page.wait_for_function("document.querySelectorAll('#insSec option').length > 50")
    page.select_option("#insSec", "INFY"); page.fill("#insQty", "100"); page.fill("#insNote", "Buy before results")
    page.click("#insGo"); page.wait_for_selector(".toast.good", timeout=10000)
    toast = page.inner_text(".toasts")
    check("participant sends an instruction to its broker", "REQ-" in toast and "sent to your broker" in toast, toast[:160])
    ins_no = [w for w in toast.replace(",", " ").split() if w.startswith("REQ-")][0]
    page.goto(BASE + "/admin.html"); page.wait_for_selector(".noaccess")
    check("participant cannot open Event Admin", page.locator(".noaccess").count() == 1)
    check("participant pages: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()

    # ---- 6. broker: only its teams; submits the instruction and a manual ticket at the market price ----
    ctx, page, errors = new_page(user=B1)
    check("broker lands on Broker Desk", page.url.endswith("/order.html"), page.url)
    check("broker navigation", nav(page) == NAV["BROKER"], str(nav(page)))
    page.wait_for_function("document.querySelectorAll('#team option').length > 1")
    opts = page.eval_on_selector_all("#team option", "els => els.map(e => e.value).filter(Boolean)")
    check("broker ticket lists only its 10 assigned teams", len(opts) == 10 and all(broker_of[t] == B1 for t in opts), str(opts))
    page.wait_for_selector(f"[data-load='{ins_no}']")
    page.click(f"[data-load='{ins_no}']")
    page.wait_for_function("!document.getElementById('fromIns').classList.contains('hidden')")
    page.click("#submit"); page.wait_for_selector("#result .done", timeout=10000)
    txt = page.inner_text("#result")
    check("broker submits the participant's instruction", "ORD-" in txt and "INFY" in txt and "awaiting pit manager" in txt.lower(), txt[:200])
    ord1 = [w for w in txt.split() if w.startswith("ORD-")][0]
    page.select_option("#team", SECOND)
    page.wait_for_function("document.querySelectorAll('#sec option').length > 50")
    rel = page.evaluate("[...document.querySelectorAll('#sec option')].find(o => o.textContent.startsWith('RELIANCE')).value")
    page.select_option("#sec", rel); page.fill("#qty", "100"); page.dispatch_event("#qty", "input")
    page.wait_for_function("document.getElementById('pvTv').textContent.includes('2,89,000')")
    check("ticket preview: market price × qty, brokerage shown as 0.50%",
          page.inner_text("#pvBrkK").endswith("0.50%") and "1,445" in page.inner_text("#pvBrk") and "2,90,445" in page.inner_text("#pvAmt"),
          page.inner_text("#pvBrkK") + " " + page.inner_text("#pvAmt"))
    check("broker cannot type a price", page.locator("input#price").count() == 0)
    page.screenshot(path=os.path.join(SHOTS, "broker-desk.png"), full_page=True)
    page.click("#submit"); page.wait_for_function("document.querySelector('#result .done') && document.querySelector('#result').innerText.includes('RELIANCE')", timeout=10000)
    ord2 = [w for w in page.inner_text("#result").split() if w.startswith("ORD-")][0]
    check("broker manual ticket submitted", ord2 != ord1)
    check("broker pages: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()

    # ---- 7. Pit Manager executes both orders (one trading slip each) ----
    ctx, page, errors = new_page(user="PIT-01")
    check("Pit Manager lands on the execution queue", page.url.endswith("/pit.html"), page.url)
    check("Pit Manager navigation", nav(page) == NAV["PIT_MANAGER"], str(nav(page)))
    for o in (ord1, ord2):
        page.wait_for_selector(f"#rows tr:has-text('{o}') [data-exec]")
        page.locator("#rows tr", has_text=o).locator("[data-exec]").click()
        page.wait_for_function(f"document.getElementById('last').innerText.includes('{o}')", timeout=10000)
    check("execution shows the trading slip", "TS-" in page.inner_text("#last"))
    page.screenshot(path=os.path.join(SHOTS, "pit.png"), full_page=True)
    check("pit page: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()

    # ---- 8. Exchange approves, Bank settles ----
    ctx, page, errors = new_page(user="EXCHANGE-01")
    check("Exchange navigation", nav(page) == NAV["EXCHANGE"], str(nav(page)))
    for o in (ord1, ord2):
        page.wait_for_selector(f"#rows tr:has-text('{o}') button[data-a=APPROVE]")
        page.locator("#rows tr", has_text=o).locator("button[data-a=APPROVE]").click()
        page.wait_for_function(f"!document.getElementById('rows').innerText.includes('{o}')", timeout=10000)
    check("Exchange approves the executed orders", True)
    check("exchange page: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()
    ctx, page, errors = new_page(user="BANK-01")
    check("Bank navigation", nav(page) == NAV["BANK"], str(nav(page)))
    page.wait_for_selector(f"#rows tr:has-text('{ord1}') button[data-a=SETTLE]")
    page.locator("#rows tr", has_text=ord1).locator("button[data-a=SETTLE]").click()
    page.wait_for_selector(".toast.good", timeout=10000)
    t = page.inner_text(".toasts")
    check("Bank settlement toast: cash, holding, price unchanged", "settled" in t and "market price unchanged" in t, t[:200])
    page.wait_for_selector(f"#rows tr:has-text('{ord2}') button[data-a=SETTLE]")
    page.locator("#rows tr", has_text=ord2).locator("button[data-a=SETTLE]").click()
    page.wait_for_function(f"!document.getElementById('rows').innerText.includes('{ord2}')", timeout=10000)
    check("bank page: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()
    m = api("GET", "/api/market")
    check("settlement did not move the price (INFY ₹900, RELIANCE ₹2,890)",
          [float(s["price"]) for s in m["stocks"] if s["symbol"] in ("INFY", "RELIANCE")] == [2890.0, 900.0] or
          sorted(float(s["price"]) for s in m["stocks"] if s["symbol"] in ("INFY", "RELIANCE")) == [900.0, 2890.0])

    # ---- 9. participant: trading slip, six-step tracking, portfolio ----
    ctx, page, errors = new_page(user="TEAM-001")
    page.goto(BASE + "/slips.html"); page.wait_for_selector("#rows a.mono")
    check("participant sees its trading slip", ord1 in page.inner_text("#rows"))
    page.locator("#rows a.mono").first.click(); page.wait_for_selector("#slip .slip-no")
    slip = page.inner_text("#slip")
    check("slip shows order, broker, price, brokerage %, Exchange and Bank status",
          all(k in slip for k in [ord1, B1, "₹900", "0.50%", "APPROVED", "SETTLED"]), slip[:300])
    page.screenshot(path=os.path.join(SHOTS, "slip.png"), full_page=True)
    page.goto(BASE + "/orders.html?order=" + ord1); page.wait_for_selector(".flow", timeout=10000)
    flow = page.inner_text(".flow")
    check("tracking shows the six-step flow", all(k.lower() in flow.lower() for k in
          ["Participant Instruction", "Broker Submission", "Pit Manager Execution", "Exchange Review", "Bank Settlement", "Holdings Updated"]), flow[:300])
    page.screenshot(path=os.path.join(SHOTS, "tracking.png"), full_page=True)
    page.goto(BASE + "/portfolios.html"); page.wait_for_selector("#detail:not(.hidden)")
    det = page.inner_text("#detail").upper()
    check("portfolio: INFY holding and BUY 1 / 5", "INFY" in det and "BUY 1 / 5" in det)
    page.goto(BASE + "/certificates.html"); page.wait_for_selector(".cert")
    check("participant share certificates (INFY, VOLTRA)", "INFY" in page.inner_text("#certs") and "VOLTRA" in page.inner_text("#certs"))
    check("participant follow-up pages: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()

    # ---- 10. Event Admin: Market News, Rules & Configuration (password), every page ----
    ctx, page, errors = new_page(user="ADMIN")
    page.wait_for_function("document.querySelectorAll('#nSec option').length > 50")
    tcs = page.evaluate("[...document.querySelectorAll('#nSec option')].find(o => o.textContent.startsWith('TCS')).value")
    page.select_option("#nSec", tcs); page.fill("#nHead", "TCS wins a large cloud deal"); page.click("[data-mood=POSITIVE]"); page.click("#nGo")
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
    for p in ["/", "/ipo.html", "/order.html", "/pit.html", "/exchange.html", "/bank.html", "/orders.html", "/slips.html", "/institutional.html",
              "/commissions.html", "/portfolios.html", "/admin.html", "/audit.html", "/cash.html", "/certificates.html", "/certificates.html?tab=award"]:
        errors.clear()
        page.goto(BASE + p); page.wait_for_load_state("networkidle"); time.sleep(1.0)
        check(f"admin opens {p} without errors", page.locator(".noaccess").count() == 0 and not errors, "; ".join(errors)[:300])
    labels = nav(page)
    check("admin navigation: one item per page, no duplicates", len(labels) == len(set(labels)) == 15, str(labels))
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
    check("institutional desk has no Market News or price controls",
          page.locator("#nSec, #moods, #nGo, input#price").count() == 0 and "Market News control" not in page.content())
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
