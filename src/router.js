import adminState from "../api/admin-state.js";
import audit from "../api/audit.js";
import bank from "../api/bank.js";
import cash from "../api/cash.js";
import certificates from "../api/certificates.js";
import cms50 from "../api/cms50.js";
import event from "../api/event.js";
import eventStatus from "../api/event-status.js";
import exchange from "../api/exchange.js";
import exportApi from "../api/export.js";
import exportEvent from "../api/export-event.js";
import exportEventExcel from "../api/export-event-excel.js";
import exportPortfoliosExcel from "../api/export-portfolios-excel.js";
import insights from "../api/insights.js";
import institutionalOrder from "../api/institutional-order.js";
import institutionalPortfolio from "../api/institutional-portfolio.js";
import ipo from "../api/ipo.js";
import loadTestOrders from "../api/load-test-orders.js";
import loan from "../api/loan.js";
import market from "../api/market.js";
import marketState from "../api/market-state.js";
import orders from "../api/orders.js";
import portfolioDetails from "../api/portfolio-details.js";
import reports from "../api/reports.js";
import resetEvent from "../api/reset-event.js";
import tracking from "../api/tracking.js";
import undoRedo from "../api/undo-redo.js";
import { configureRuntime, db } from "./hatchable-compat.js";

const routes = {
  "/api/admin-state": adminState,
  "/api/audit": audit,
  "/api/bank": bank,
  "/api/cash": cash,
  "/api/certificates": certificates,
  "/api/cms50": cms50,
  "/api/event": event,
  "/api/event-status": eventStatus,
  "/api/exchange": exchange,
  "/api/export": exportApi,
  "/api/export-event": exportEvent,
  "/api/export-event-excel": exportEventExcel,
  "/api/export-portfolios-excel": exportPortfoliosExcel,
  "/api/insights": insights,
  "/api/institutional-order": institutionalOrder,
  "/api/institutional-portfolio": institutionalPortfolio,
  "/api/ipo": ipo,
  "/api/load-test-orders": loadTestOrders,
  "/api/loan": loan,
  "/api/market": market,
  "/api/market-state": marketState,
  "/api/orders": orders,
  "/api/portfolio-details": portfolioDetails,
  "/api/reports": reports,
  "/api/reset-event": resetEvent,
  "/api/tracking": tracking,
  "/api/undo-redo": undoRedo
};

function cookies(header = "") {
  const out = {};
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

async function requestData(request) {
  const url = new URL(request.url);
  const headers = {};
  request.headers.forEach((v,k)=>{headers[k.toLowerCase()]=v});
  let body = undefined;
  if (!["GET","HEAD"].includes(request.method)) {
    const type = request.headers.get("content-type") || "";
    if (type.includes("application/json")) {
      body = await request.json().catch(()=>null);
    } else if (type.includes("application/x-www-form-urlencoded")) {
      body = Object.fromEntries((await request.formData()).entries());
    } else {
      body = await request.text().catch(()=>"");
    }
  }
  return {
    method: request.method,
    params: {},
    query: Object.fromEntries(url.searchParams.entries()),
    headers,
    cookies: cookies(headers.cookie || ""),
    body,
    member: null,
    user: null,
    request
  };
}

class ResponseAdapter {
  constructor() {
    this.code = 200;
    this.headers = new Headers();
    this.body = null;
    this.written = false;
  }
  status(code) { this.code = code; return this; }
  setHeader(name, value) { this.headers.set(name, String(value)); return this; }
  json(value) {
    this.body = JSON.stringify(value);
    this.headers.set("content-type", "application/json; charset=utf-8");
    this.written = true;
    return this;
  }
  send(value) {
    this.body = value;
    this.written = true;
    return this;
  }
  redirect(url, code = 302) {
    this.headers.set("location", url);
    this.code = code;
    this.body = "";
    this.written = true;
    return this;
  }
  toResponse() {
    if (this.body && typeof this.body !== "string" && !(this.body instanceof Uint8Array) && !(this.body instanceof ArrayBuffer)) {
      this.body = String(this.body);
    }
    return new Response(this.body ?? "", {status:this.code,headers:this.headers});
  }
}

function adminAllowed(req) {
  const key = req.headers?.["x-jse-admin-key"] || "";
  const expected = globalThis.process?.env?.EVENT_ADMIN_PASSWORD || "";
  return req.cookies?.jse_admin === "1" || (expected && key === expected);
}

export async function handleApi(request, env) {
  configureRuntime(env);
  const url = new URL(request.url);

  if (url.pathname === "/api/health") {
    try {
      const result = await db.query("SELECT NOW() AS server_time, current_database() AS database_name");
      return Response.json({
        status: "ok",
        service: "JAIN STOCK EXCHANGE",
        database: "connected",
        server_time: result.rows[0].server_time,
        database_name: result.rows[0].database_name
      }, {headers: {"cache-control": "no-store"}});
    } catch (error) {
      return Response.json({
        status: "error",
        service: "JAIN STOCK EXCHANGE",
        database: "connection_failed",
        message: error instanceof Error ? error.message : String(error)
      }, {status: 500, headers: {"cache-control": "no-store"}});
    }
  }

  const handler = routes[url.pathname];
  if (!handler) return new Response("Not Found", {status:404});

  const access = handler.access || "public";
  if (access === "scheduler") return new Response("Not Found", {status:404});
  const req = await requestData(request);

  // Admin endpoints are protected once the admin credential is configured.
  if (access === "admin" && !adminAllowed(req)) {
    return Response.json({error:"Administrator access required"},{status:403});
  }

  if (Array.isArray(handler.methods) && !handler.methods.includes(request.method)) {
    return Response.json({error:"Method not allowed"},{status:405});
  }

  const res = new ResponseAdapter();
  try {
    const result = await handler(req, res);
    if (result instanceof Response) return result;
    if (result === res || res.written) return res.toResponse();
    if (result !== undefined) return Response.json(result);
    return new Response("");
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : String(error)
    }, {status:500});
  }
}

export async function serveSite(request, env) {
  const response = await env.ASSETS.fetch(request);
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  return new HTMLRewriter()
    .on("head", {
      element(element) {
        element.prepend(
          '<script>window.__HATCHABLE__={api:"/api"};</script>',
          {html:true}
        );
      }
    })
    .transform(response);
}
