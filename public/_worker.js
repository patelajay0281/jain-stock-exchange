const API="https://yxmztxtbgqkvardwgrak.supabase.co/functions/v1/jse-api";
const RAW_BASE="https://raw.githubusercontent.com/patelajay0281/jain-stock-exchange/live/public";
const ALIASES={
  "/":"/market-v3.html","/login":"/login.html","/login.html":"/login.html",
  "/admin":"/admin-live-v14.html","/admin.html":"/admin-live-v14.html",
  "/member-accounts":"/member-accounts-v2.html","/member-accounts.html":"/member-accounts-v2.html",
  "/order":"/order-live-v8.html","/order.html":"/order-live-v8.html",
  "/exchange":"/exchange-live-v5.html","/exchange.html":"/exchange-live-v5.html",
  "/bank":"/bank-live-v7.html","/bank.html":"/bank-live-v7.html",
  "/orders":"/orders-live-v3.html","/orders.html":"/orders-live-v3.html",
  "/institutional":"/institutional-live-v5.html","/institutional.html":"/institutional-live-v5.html",
  "/commissions":"/commissions-live-v5.html","/commissions.html":"/commissions-live-v5.html",
  "/portfolios":"/portfolios-live-v4.html","/portfolios.html":"/portfolios-live-v4.html",
  "/audit":"/audit-live-v4.html","/audit.html":"/audit-live-v4.html",
  "/cash":"/cash-live-v4.html","/cash.html":"/cash-live-v4.html",
  "/certificates":"/certificates-v2.html","/certificates.html":"/certificates-v2.html",
  "/insights":"/insights-live-v4.html","/insights.html":"/insights-live-v4.html",
  "/load-test":"/load-test-v2.html","/load-test.html":"/load-test-v2.html"
};
const NO_CACHE={"cache-control":"no-store","x-content-type-options":"nosniff","referrer-policy":"no-referrer"};
function copyHeaders(r,extra={}){const h=new Headers(r.headers);for(const [k,v] of Object.entries(extra))h.set(k,v);return h;}
async function forward(req,u){
  const x=new URL(API);x.pathname=x.pathname.replace(/\/$/,"")+(u.pathname.slice(4)||"/");x.search=u.search;
  const h=new Headers(req.headers);h.delete("host");h.delete("content-length");
  const o={method:req.method,headers:h,redirect:"manual"};
  if(req.method!=="GET"&&req.method!=="HEAD"&&req.method!=="OPTIONS")o.body=req.body;
  let r;
  for(let i=0;i<3;i++){
    try{r=await fetch(x,o);}catch(e){if(i===2)throw e;await new Promise(s=>setTimeout(s,120*(i+1)));continue;}
    if(req.method!=="GET"||![502,503,504].includes(r.status)||i===2)break;
    await new Promise(s=>setTimeout(s,120*(i+1)));
  }
  const h2=copyHeaders(r,{"x-jse-api":"supabase-edge-function","cache-control":"no-store"});
  if(req.method==="GET"&&["/api/market","/api/realtime"].includes(u.pathname))h2.set("cache-control","public,max-age=1,s-maxage=1,stale-while-revalidate=2");
  return new Response(r.body,{status:r.status,statusText:r.statusText,headers:h2});
}
async function fetchAsset(env,req,path){
  const clean=String(path||"/").replace(/^\/+/, "");
  if(!clean||clean.includes("..")||clean.includes("\\")||clean.startsWith("."))return new Response("Not Found",{status:404,headers:NO_CACHE});
  const assetUrl=new URL("/"+clean,req.url);
  let r=await env.ASSETS.fetch(new Request(assetUrl,req));
  if(r.status===404){
    const raw=await fetch(RAW_BASE+"/"+clean,{headers:{"Accept":"*/*"}});
    if(raw.ok)r=raw;
  }
  return r;
}
async function servePage(env,req,path){
  const u=new URL(req.url);
  const target=new URL(path,req.url);
  const r=await fetchAsset(env,new Request(target,req),target.pathname);
  if(r.status===404)return new Response("JSE page not found",{status:404,headers:NO_CACHE});
  const ct=r.headers.get("content-type")||"";
  if(!ct.includes("text/html"))return r;
  const h=copyHeaders(r,NO_CACHE);
  h.set("content-type","text/html; charset=utf-8");
  let rw=new HTMLRewriter().on("head",{element(e){
    e.append('<link rel="stylesheet" href="/readability.css?v=20261008-3"><script src="/auth.js"></script><script src="/admin-nav.js"></script>',{html:true});
    if(target.pathname==="/order-live-v8.html")e.append('<script src="/order-hatchable.js"></script>',{html:true});
  }});
  return rw.transform(new Response(r.body,{status:r.status,statusText:r.statusText,headers:h}));
}
export default{async fetch(req,env){
  const u=new URL(req.url);
  try{
    if(u.pathname==="/api"||u.pathname.startsWith("/api/"))return await forward(req,u);
    const path=ALIASES[u.pathname]||u.pathname;
    return await servePage(env,req,path);
  }catch(e){
    return new Response("JSE temporarily unavailable",{status:502,headers:{...NO_CACHE,"content-type":"text/plain; charset=utf-8"}});
  }
}};