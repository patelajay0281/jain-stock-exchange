"""Browser smoke tests for every page (Playwright + Chromium).
Runs against the local dev server: BASE=http://127.0.0.1:8788 python3 tests/ui_smoke.py
Saves screenshots to .local/shots/."""
import base64, json, os, sys, time, urllib.request

from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE", "http://127.0.0.1:8788")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.path.join(ROOT, ".local", "shots")
os.makedirs(SHOTS, exist_ok=True)
FONTDIR = os.environ.get("FONTDIR", "")
PW = {"ADMIN": "admin-pass-1", "PIT-01": "pit-pass-01", "EXCHANGE-01": "exch-pass-01", "BANK-01": "bank-pass-01",
      "INST-01": "inst-pass-01", "TEAM-001": "team-pass-001", "FACULTY-01": "faculty-pass-1"}

FONT_CSS = ""
if FONTDIR and os.path.isdir(FONTDIR):
    faces = []
    for w in (400, 600, 700, 800, 900):
        p = os.path.join(FONTDIR, f"noto-sans-latin-{w}-normal.woff2")
        if os.path.exists(p):
            faces.append('@font-face{font-family:"Segoe UI";font-weight:%d;src:url(data:font/woff2;base64,%s) format("woff2");}' % (w, base64.b64encode(open(p, "rb").read()).decode()))
    FONT_CSS = "\n".join(faces)

results = []
def check(name, ok, detail=""):
    results.append((name, bool(ok)))
    print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail else ""), flush=True)

def api(method, path, body=None, token=None):
    req = urllib.request.Request(BASE + path, method=method, data=None if body is None else json.dumps(body).encode(),
                                 headers={"content-type": "application/json", **({"authorization": "Bearer " + token} if token else {})})
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return json.loads(e.read())

admin = api("POST", "/api/login", {"username": "ADMIN", "password": PW["ADMIN"]})["token"]
st = api("GET", "/api/event-status")["status"]
if st in ("LIVE", "SETTLEMENT_ONLY"):
    api("POST", "/api/reject-open-orders", {}, admin)
    api("POST", "/api/event", {"action": "CLOSE"}, admin)
r = api("POST", "/api/reset-event", {"confirm": "RESET", "keep_allotments": False}, admin)
check("reset for UI run", r.get("success"), str(r)[:200])
api("POST", "/api/ipo-allotments", {"rows": [{"team": "TEAM-001", "ipo": "VOLTRA", "lots": 2}]}, admin)
r = api("POST", "/api/event", {"action": "START"}, admin)
check("event started", r.get("status") == "LIVE", str(r)[:200])

with sync_playwright() as pw:
    browser = pw.chromium.launch()

    def new_page(w=1600, h=1000, scale=1, user=None):
        ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=scale)
        page = ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append("pageerror: " + str(e)))
        page.on("console", lambda m: errors.append("console: " + m.text) if m.type == "error" and "status of 4" not in m.text else None)
        if FONT_CSS:
            page.add_init_script("document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent=%s;document.head.appendChild(s);});" % json.dumps(FONT_CSS))
        if user:
            page.goto(BASE + "/login.html")
            page.fill("#u", user); page.fill("#p", PW[user]); page.click("#go")
            page.wait_for_load_state("networkidle")
        return ctx, page, errors

    # ---- Market page, desktop projector size ----
    ctx, page, errors = new_page(1920, 1080)
    page.goto(BASE + "/")
    page.wait_for_selector(".tile")
    time.sleep(0.8)
    page.screenshot(path=os.path.join(SHOTS, "market-desktop.png"), full_page=True)
    n = page.locator(".tile").count()
    check("market: 54 tiles (4 IPOs + 50 stocks)", n == 54, str(n))
    cols = page.evaluate("getComputedStyle(document.getElementById('grid')).gridTemplateColumns.split(' ').length")
    check("market: exactly 8 tiles per row on desktop", cols == 8, str(cols))
    fs = page.evaluate("(()=>{const e=document.querySelector('.tile-name');const c=getComputedStyle(e);return c.fontSize+' '+c.fontWeight})()")
    check("market: company names 15px bold", fs.startswith("15px") and int(fs.split()[1]) >= 700, fs)
    check("market: first tile is an IPO", "IPO" in page.locator(".tile").first.inner_text())
    check("market: CMS INDEX + status visible", page.locator("#idxVal").inner_text() not in ("", "—") and "live" in page.locator("#mPillText").inner_text().lower())
    check("market: no 'Market Wall' heading", "market wall" not in page.content().lower())
    yellow = page.evaluate("[...document.querySelectorAll('.tile *')].some(e=>{const c=getComputedStyle(e).color;return c==='rgb(255, 255, 0)'||c==='rgb(255, 215, 0)'})")
    check("market: no yellow information text", not yellow)
    check("market: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()

    ctx, page, errors = new_page(390, 844, 2)
    page.goto(BASE + "/"); page.wait_for_selector(".tile"); time.sleep(0.4)
    page.screenshot(path=os.path.join(SHOTS, "market-mobile.png"), full_page=False)
    check("market mobile: no horizontal scroll", page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"))
    ctx.close()

    # ---- logged-out access to a staff page ----
    ctx, page, errors = new_page()
    page.goto(BASE + "/admin.html"); page.wait_for_selector(".noaccess")
    check("staff page asks for sign-in when logged out", "Sign in required" in page.inner_text(".noaccess"))
    ctx.close()

    # ---- Broker desk creates an order through the form ----
    ctx, page, errors = new_page(user="PIT-01")
    check("broker lands on Create Order", page.url.endswith("/order.html"), page.url)
    page.wait_for_function("document.querySelectorAll('#team option').length > 50")
    page.wait_for_function("document.querySelectorAll('#sec option').length > 50")
    page.select_option("#team", "TEAM-012")
    rel = page.evaluate("[...document.querySelectorAll('#sec option')].find(o=>o.textContent.startsWith('RELIANCE')).value")
    page.select_option("#sec", rel)
    page.fill("#qty", "100"); page.fill("#price", "2930")
    page.wait_for_function("document.getElementById('pvTv').textContent.includes('2,93,000')")
    check("order preview: trade value + 0.5% brokerage", "1,465" in page.inner_text("#pvBrk") and "2,94,465" in page.inner_text("#pvAmt"), page.inner_text("#pvAmt"))
    page.screenshot(path=os.path.join(SHOTS, "order-ticket.png"), full_page=True)
    page.click("#submit")
    page.wait_for_selector("#result .done", timeout=10000)
    txt = page.inner_text("#result")
    check("order submitted from the form", "ORD-" in txt and "EXCHANGE PENDING" in txt.upper(), txt[:160])
    order_no = [w for w in txt.split() if w.startswith("ORD-")][0]
    # paired buyer + seller ticket (TEAM-001 holds 100 VOLTRA from the allotment)
    page.click('[data-mode="pair"]')
    page.select_option("#buyer", "TEAM-013"); page.select_option("#seller", "TEAM-001")
    vol = page.evaluate("[...document.querySelectorAll('#sec option')].find(o=>o.textContent.startsWith('VOLTRA')).value")
    page.select_option("#sec", vol); page.fill("#qty", "50"); page.fill("#price", "900")
    page.click("#submit"); page.wait_for_function("document.querySelectorAll('#result .done > div').length >= 2", timeout=10000)
    check("paired buyer/seller ticket creates two linked orders", page.locator("#result .done b").count() == 2, page.inner_text("#result")[:200])
    check("broker pages: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()

    # ---- Exchange approves via the UI ----
    ctx, page, errors = new_page(user="EXCHANGE-01")
    check("exchange lands on Exchange page", page.url.endswith("/exchange.html"), page.url)
    page.wait_for_selector(f"text={order_no}")
    page.screenshot(path=os.path.join(SHOTS, "exchange.png"), full_page=True)
    row = page.locator("tr", has_text=order_no)
    row.locator("button[data-a=APPROVE]").click()
    page.wait_for_function(f"!document.getElementById('rows').innerText.includes('{order_no}')", timeout=10000)
    check("exchange approval removes it from the queue", True)
    # approve the paired legs too
    for _ in range(2):
        page.wait_for_selector("#rows button[data-a=APPROVE]", timeout=10000)
        page.locator("#rows button[data-a=APPROVE]").first.click()
        time.sleep(0.8)
    check("exchange page: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()

    # ---- Bank settles via the UI ----
    ctx, page, errors = new_page(user="BANK-01")
    check("bank lands on Bank page", page.url.endswith("/bank.html"), page.url)
    page.wait_for_selector(f"text={order_no}")
    page.screenshot(path=os.path.join(SHOTS, "bank.png"), full_page=True)
    page.locator("tr", has_text=order_no).locator("button[data-a=SETTLE]").click()
    page.wait_for_selector(".toast.good", timeout=10000)
    check("bank settlement toast", "settled" in page.inner_text(".toast.good"), page.inner_text(".toast.good")[:160])
    for _ in range(2):
        page.wait_for_selector("#rows button[data-a=SETTLE]", timeout=10000)
        page.locator("#rows button[data-a=SETTLE]").first.click()
        time.sleep(0.9)
    check("bank page: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()

    # ---- Market reflects the trade ----
    m = api("GET", "/api/market")
    relp = [s for s in m["stocks"] if s["symbol"] == "RELIANCE"][0]["price"]
    check("market price moved to the settled trade price", float(relp) == 2930.0, str(relp))
    pd = api("GET", "/api/portfolio-details?team=TEAM-013", token=admin)
    check("paired BUY leg settled into TEAM-013", any(h["symbol"] == "VOLTRA" and h["quantity"] == 50 for h in pd["holdings"]), json.dumps(pd["holdings"])[:200])

    # ---- Participant sees own portfolio ----
    tok = api("POST", "/api/login", {"username": "ADMIN", "password": PW["ADMIN"]})["token"]
    ctx, page, errors = new_page(user="TEAM-001")
    check("participant lands on My Portfolio", page.url.endswith("/portfolios.html"), page.url)
    page.wait_for_selector("#detail:not(.hidden)")
    check("participant sees own holdings (VOLTRA)", "VOLTRA" in page.inner_text("#detail"))
    page.screenshot(path=os.path.join(SHOTS, "participant.png"), full_page=True)
    check("participant: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()

    # ---- Admin visits every page ----
    ctx, page, errors = new_page(user="ADMIN")
    pages = ["/", "/order.html", "/exchange.html", "/bank.html", "/orders.html", "/institutional.html", "/commissions.html",
             "/portfolios.html", "/admin.html", "/audit.html", "/cash.html", "/insights.html", "/certificates.html"]
    for p in pages:
        errors.clear()
        page.goto(BASE + p)
        page.wait_for_load_state("networkidle")
        time.sleep(1.2)
        name = "page" + p.replace("/", "-").replace(".html", "") if p != "/" else "page-market"
        page.screenshot(path=os.path.join(SHOTS, name + ".png"), full_page=True)
        noaccess = page.locator(".noaccess").count()
        check(f"admin can open {p}", noaccess == 0)
        check(f"{p}: no JS errors", not errors, "; ".join(errors)[:300])
    # Order tracking expand row shows workflow
    page.goto(BASE + "/orders.html"); page.wait_for_selector("tr.row-main")
    page.locator("tr.row-main", has_text=order_no).click()
    page.wait_for_selector(".flow", timeout=10000)
    flow = page.inner_text(".flow")
    check("tracking shows the 4-step workflow", all(k.lower() in flow.lower() for k in ["Order created", "Exchange review", "Bank settlement", "Market / cash updated"]), flow[:200])
    page.screenshot(path=os.path.join(SHOTS, "tracking-expanded.png"), full_page=True)
    # Portfolios: numeric team order and detail
    page.goto(BASE + "/portfolios.html"); page.wait_for_selector("tr[data-team]")
    codes = page.evaluate("[...document.querySelectorAll('tr[data-team]')].map(r=>r.dataset.team)")
    check("portfolios: TEAM-001 … TEAM-100 numeric order", codes[:10] == [f"TEAM-{i:03d}" for i in range(1, 11)] and codes[-1] == "TEAM-100" and len(codes) == 100, str(codes[:12]))
    page.locator("tr[data-team='TEAM-012']").click(); page.wait_for_selector("#detail:not(.hidden)")
    check("portfolio detail opens", "TEAM-012" in page.inner_text("#detail") and "RELIANCE" in page.inner_text("#detail"))
    page.screenshot(path=os.path.join(SHOTS, "portfolio-detail.png"), full_page=True)
    # Admin market news through the UI
    page.goto(BASE + "/admin.html"); page.wait_for_function("document.querySelectorAll('#nSec option').length > 50")
    tcs = page.evaluate("[...document.querySelectorAll('#nSec option')].find(o=>o.textContent.startsWith('TCS')).value")
    page.select_option("#nSec", tcs); page.click("[data-mood=POSITIVE]"); page.click("#nGo")
    page.wait_for_selector(".modal .btn.primary"); page.click(".modal .btn.primary")
    page.wait_for_selector(".toast", timeout=10000)
    check("market news published from admin page", "TCS" in page.inner_text(".toasts"), page.inner_text(".toasts")[:160])
    check("admin pages: no JS errors", not errors, "; ".join(errors)[:300])
    ctx.close()

    # ---- Viewer (faculty) is read-only ----
    ctx, page, errors = new_page(user="FACULTY-01")
    page.goto(BASE + "/exchange.html"); page.wait_for_load_state("networkidle"); time.sleep(0.8)
    check("viewer sees no approve buttons", page.locator("button[data-a=APPROVE]").count() == 0)
    ctx.close()
    browser.close()

fails = [r for r in results if not r[1]]
print(f"\n{len(results) - len(fails)}/{len(results)} UI checks passed")
sys.exit(1 if fails else 0)
