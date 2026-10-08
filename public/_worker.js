const API="https://yxmztxtbgqkvardwgrak.supabase.co/functions/v1/jse-api";
const RAW="https://raw.githubusercontent.com/patelajay0281/jain-stock-exchange/live/public/";
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
const NC={"cache-control":"no-store","x-content-type-options":"nosniff","referrer-policy":"no-referrer"};
function cloneHeaders(r,extra={}){const h=new Headers(r.headers);for(const [k,v] of Object.entries(extra))h.set(k,v);return h;}
async function forward(req,url){
 const target=new URL(API);target.pathname=target.pathname.replace(/\/$/,"")+(url.pathname.slice(4)||"/");target.search=url.search;
 const h=new Headers(req.headers);h.delete("host");h.delete("content-length");
 const init={method:req.method,headers:h,redirect:"manual"};if(req.method!=="GET"&&req.method!=="HEAD"&&req.method!=="OPTIONS")init.body=req.body;
 let r;
 for(let i=0;i<3;i++){try{r=await fetch(target,init)}catch(e){if(i===2)throw e;await new Promise(s=>setTimeout(s,120*(i+1)));continue}
  if(req.method!=="GET"||![502,503,504].includes(r.status)||i===2)break;await new Promise(s=>setTimeout(s,120*(i+1)));
 }
 return new Response(r.body,{status:r.status,statusText:r.statusText,headers:cloneHeaders(r,{"x-jse-api":"supabase-edge-function","cache-control":"no-store"})});
}
async function rawPage(path){
 const name=String(path||"").replace(/^\/+/, "");
 if(!name||name.includes("..")||name.includes("\\")||name.startsWith("."))return new Response("Not Found",{status:404,headers:NC});
 const r=await fetch(RAW+name,{headers:{"accept":"text/html,*/*"}});
 if(!r.ok)return new Response("JSE page not found",{status:404,headers:NC});
 return r;
}
async function rawAsset(path){
 const name=String(path||"").replace(/^\/+/, "");
 if(!name||name.includes(".."))return new Response("Not Found",{status:404,headers:NC});
 return fetch(RAW+name,{headers:{"accept":"*/*"}});
}
async function page(req,path){
 const r=await rawPage(path);
 if(r.status!==200)return r;
 const h=cloneHeaders(r,NC);h.set("content-type","text/html; charset=utf-8");
 const special=path==="/order-live-v8.html"?' on="head"':"";
 const rw=new HTMLRewriter().on("head",{element(e){
   e.append('<link rel="stylesheet" href="/readability.css?v=20261008-4"><script src="/auth.js"></script><script src="/admin-nav.js"></script>',{html:true});
   if(path==="/order-live-v8.html")e.append('<script src="/order-hatchable.js"></script>',{html:true});
 }});
 return rw.transform(new Response(r.body,{status:r.status,statusText:r.statusText,headers:h}));
}
export default{async fetch(req){
 const url=new URL(req.url);
 try{
   if(url.pathname==="/api"||url.pathname.startsWith("/api/"))return await forward(req,url);
   const mapped=ALIASES[url.pathname];
   if(mapped)return await page(req,mapped);
   // Serve shared static files directly from the live branch.
   return await rawAsset(url.pathname);
 }catch(e){
   return new Response("JSE temporarily unavailable",{status:502,headers:{...NC,"content-type":"text/plain; charset=utf-8"}});
 }
}};