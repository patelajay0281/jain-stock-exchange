import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

let marketCache:any = null;
let marketCacheAt = 0;
let realtimeCache:any = null;
let realtimeCacheAt = 0;
const MARKET_CACHE_MS = 1500;
const REALTIME_CACHE_MS = 900;

const PROTECTED_ADMIN_ACTIONS = new Set(["PAUSE","RESUME","CLOSE","FINALIZE","RESET"]);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, idempotency-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const te = new TextEncoder();
const td = new TextDecoder();

function b64u(input: Uint8Array | string): string {
  const bytes = typeof input === "string" ? te.encode(input) : input;
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replaceAll("+","-").replaceAll("/","_").replaceAll("=","");
}
function unb64u(s: string): Uint8Array {
  const pad = s.length % 4 ? "=".repeat(4 - (s.length % 4)) : "";
  const raw = atob(s.replaceAll("-","+").replaceAll("_","/")+pad);
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}
async function hmac(data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", te.encode(SERVICE_KEY), {name:"HMAC",hash:"SHA-256"}, false, ["sign","verify"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, te.encode(data)));
}
async function issueToken(user: any): Promise<string> {
  const header = b64u(JSON.stringify({alg:"HS256",typ:"JSE"}));
  const payload = b64u(JSON.stringify({uid:user.user_id,role:user.role,team_id:user.team_id||null,institution_id:user.institution_id||null,username:user.username,needs_password_change:Boolean(user.needs_password_change),exp:Math.floor(Date.now()/1000)+4*60*60}));
  const body = header+"."+payload;
  return body+"."+b64u(await hmac(body));
}
async function verifyToken(token: string): Promise<any|null> {
  const parts = token.split(".");
  if (parts.length!==3) return null;
  const expected = await hmac(parts[0]+"."+parts[1]);
  const got = unb64u(parts[2]);
  if (expected.length!==got.length) return null;
  let diff=0; for(let i=0;i<expected.length;i++) diff |= expected[i]^got[i];
  if(diff!==0) return null;
  try {
    const p = JSON.parse(td.decode(unb64u(parts[1])));
    if (!p.exp || p.exp < Math.floor(Date.now()/1000)) return null;
    return p;
  } catch { return null; }
}
function response(body:any,status=200,headers:Record<string,string>={}) {
  return new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json; charset=utf-8","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer",...CORS,...headers}});
}
function error(message:string,status=400,extra:any={}) { return response({error:message,...extra},status); }
function wholeRupeePrice(value:any): number {
  const n=Number(value);
  if(!Number.isFinite(n) || !Number.isInteger(n) || n<=0) throw new Error("Share price must be a whole number greater than ₹0.");
  return n;
}
function csvResponse(rows:any[],filename:string){
  const data=Array.isArray(rows)?rows:[];
  const cols=[...new Set(data.flatMap(r=>Object.keys(r||{})))];
  const escCsv=(v:any)=>'"'+String(v??"").replaceAll('"','""')+'"';
  const text=[cols.map(escCsv).join(","),...data.map(r=>cols.map(c=>escCsv(r?.[c])).join(","))].join("\n");
  return new Response(text,{status:200,headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":`attachment; filename="${filename}"`,...CORS}});
}
async function bodyJson(req:Request){ try{return await req.json();}catch{return {};}}
async function auth(req:Request): Promise<any|null> {
  const h=req.headers.get("authorization")||"";
  if(!h.toLowerCase().startsWith("bearer ")) return null;
  return await verifyToken(h.slice(7).trim());
}
function need(user:any, roles:string[]){ return !!user && !user.needs_password_change && roles.includes(user.role); }
function needAdmin(user:any){ return !!user && !user.needs_password_change && user.role==="ADMIN"; }
function generateTemporaryPassword(): string {
  const raw = new Uint8Array(18);
  crypto.getRandomValues(raw);
  return "JSE-" + b64u(raw).slice(0,20) + "!";
}
async function verifyAdminControlPassword(value:string): Promise<boolean> {
  if (!value) return false;
  const {data,error}=await db.rpc("jse_verify_admin_control_password",{p_password:value});
  return !error && data===true;
}


async function maps(ids:any[], table:string, key:string, fields:string) {
  if(!ids.length) return new Map<string,any>();
  const {data,error}=await db.from(table).select(fields).in("id",ids);
  if(error) throw error;
  return new Map((data||[]).map((x:any)=>[String(x[key]),x]));
}

async function market() {
  if (marketCache && Date.now() - marketCacheAt < MARKET_CACHE_MS) return marketCache;
  const [{data:assets,error:aerr},{data:state,error:serr},{data:settings,error:sterr}]=await Promise.all([
    db.from("assets").select("id,symbol,name,type,current_price_paise,previous_price_paise,base_price_paise,lot_size,display_order").eq("is_active",true).order("display_order"),
    db.from("event_state").select("status,topper_team_id,topper_realized_profit_paise,finalization_note,started_at,updated_at").eq("id",1).single(),
    db.from("event_settings").select("cms_index_base_value_hundredths").eq("id",1).single()
  ]);
  if(aerr||serr||sterr) throw aerr||serr||sterr;
  const listed=(assets||[]).filter((x:any)=>x.type==="LISTED_STOCK").map((x:any)=>({
    id:x.id,symbol:x.symbol,name:x.name,price:Number(x.current_price_paise)/100,previous_price:Number(x.previous_price_paise)/100,
    change_pct:x.previous_price_paise?((Number(x.current_price_paise)-Number(x.previous_price_paise))*100/Number(x.previous_price_paise)):0,lot_size:x.lot_size
  }));
  const ipos=(assets||[]).filter((x:any)=>x.type==="IPO").map((x:any)=>({
    id:x.id,symbol:x.symbol,name:x.name,price:Number(x.current_price_paise)/100,previous_price:Number(x.previous_price_paise)/100,
    change_pct:x.previous_price_paise?((Number(x.current_price_paise)-Number(x.previous_price_paise))*100/Number(x.previous_price_paise)):0,lot_size:x.lot_size
  }));
  const baseSum=(assets||[]).filter((x:any)=>x.type==="LISTED_STOCK").reduce((s:number,x:any)=>s+Number(x.base_price_paise),0);
  const curSum=(assets||[]).filter((x:any)=>x.type==="LISTED_STOCK").reduce((s:number,x:any)=>s+Number(x.current_price_paise),0);
  const baseIndex=Number(settings.cms_index_base_value_hundredths)/100;
  const value=baseSum?baseIndex*(curSum/baseSum):baseIndex;
  marketCache={status:state.status,index:{base_value:baseIndex,value,change_pct:baseIndex?((value-baseIndex)*100/baseIndex):0},
    stocks:listed,ipos};
  marketCacheAt=Date.now();
  return marketCache;
}

async function realtimeSnapshot(){
  if (realtimeCache && Date.now() - realtimeCacheAt < REALTIME_CACHE_MS) return realtimeCache;
  const {data,error}=await db.rpc("jse_realtime_snapshot");
  if(error) throw error;
  realtimeCache=data||{};
  realtimeCacheAt=Date.now();
  return realtimeCache;
}

async function summarizeOrders(user:any, filters:any={}) {
  let teamId=filters.team_id?Number(filters.team_id):null;
  const status=String(filters.status||"");
  const query=String(filters.q||"");
  const assetId=filters.asset_id?Number(filters.asset_id):null;
  if(user.role==="PARTICIPANT") teamId=Number(user.team_id||0)||null;
  const {data,error}=await db.rpc("jse_order_summary_v2",{
    p_team_id:teamId,
    p_status:status||null,
    p_query:query||null,
    p_asset_id:assetId
  });
  if(error) throw error;
  const summary=typeof data==="string"?JSON.parse(data):data||{};
  return {
    total:Number(summary.total||0),
    pending:Number(summary.pending||0),
    exchange_approved:Number(summary.exchange_approved||0),
    settled:Number(summary.settled||0),
    exchange_rejected:Number(summary.exchange_rejected||0),
    bank_rejected:Number(summary.bank_rejected||0),
    trade_value:Number(summary.trade_value||0),
    brokerage:Number(summary.brokerage||0)
  };
}
async function orderList(user:any, page=1, limit=50, filters:any={}){
  const safeLimit=Math.max(1,Math.min(100,Number(limit)||50)); const from=(Math.max(1,Number(page)||1)-1)*safeLimit;
  let q=db.from("orders").select("id,order_code,status,source,team_id,broker_id,asset_id,side,quantity,price_paise,trade_value_paise,brokerage_paise,amount_paise,is_short_sale,created_at", {count:"exact"}).order("created_at",{ascending:false}).order("id",{ascending:false}).range(from,from+safeLimit-1);
  if(user.role==="PARTICIPANT") q=q.eq("team_id",user.team_id);
  if(filters.status) q=q.eq("status",filters.status);
  if(filters.team_id) q=q.eq("team_id",filters.team_id);
  if(filters.asset_id) q=q.eq("asset_id",filters.asset_id);
  const search=String(filters.q||"").trim();
  if(search){
    const normalized=search.replace(/&/g,"_").replace(/[^A-Za-z0-9_. -]/g,"");
    const like="%"+normalized+"%";
    const [{data:teamMatches,error:te},{data:assetMatches,error:ae}]=await Promise.all([
      db.from("teams").select("id").ilike("code",like).limit(500),
      db.from("assets").select("id").or("name.ilike."+like+",symbol.ilike."+like).limit(500)
    ]);
    if(te||ae)throw te||ae;
    const clauses=["order_code.ilike."+like];
    if((teamMatches||[]).length)clauses.push("team_id.in.("+(teamMatches||[]).map((x:any)=>x.id).join(",")+")");
    if((assetMatches||[]).length)clauses.push("asset_id.in.("+(assetMatches||[]).map((x:any)=>x.id).join(",")+")");
    q=q.or(clauses.join(","));
  }
  const {data,error,count}=await q; if(error)throw error;
  const rows=data||[];
  const [teams,brokers,assets]=await Promise.all([
    maps([...new Set(rows.map((x:any)=>x.team_id))],"teams","id","id,code"),
    maps([...new Set(rows.map((x:any)=>x.broker_id))],"brokers","id","id,code,display_name"),
    maps([...new Set(rows.map((x:any)=>x.asset_id))],"assets","id","id,name,symbol,type")
  ]);
  const out=rows.map((x:any)=>({id:x.id,order_code:x.order_code,status:x.status,kind:x.source,team:teams.get(String(x.team_id))?.code||"",
    broker:brokers.get(String(x.broker_id))?.code||"",stock:assets.get(String(x.asset_id))?.name||"",symbol:assets.get(String(x.asset_id))?.symbol||"",
    side:x.side,quantity:x.quantity,price:Number(x.price_paise)/100,trade_value:Number(x.trade_value_paise)/100,
    brokerage:Number(x.brokerage_paise)/100,amount:Number(x.amount_paise)/100,short_selling:x.is_short_sale,created_at:x.created_at}));
  const summary=await summarizeOrders(user,filters);
  return {rows:out,pagination:{page:Math.max(1,Number(page)||1),limit:safeLimit,total:count||0,pages:Math.max(1,Math.ceil((count||0)/safeLimit))},
    summary,
    filters:{teams:(await db.from("teams").select("code").order("code").then(r=>(r.data||[]).map((x:any)=>x.code))),}};
}

async function transactionQueue(kind:string) {
  const wanted=kind==="exchange"?"PENDING_EXCHANGE":"EXCHANGE_APPROVED";
  const {data:orders,error}=await db.from("orders").select("id,order_code,status,source,team_id,institution_id,broker_id,asset_id,side,quantity,price_paise,trade_value_paise,amount_paise,is_short_sale,created_at").eq("status",wanted).order("created_at",{ascending:true}).order("id",{ascending:true}).limit(100);
  if(error)throw error;
  const rows=orders||[];
  const [teams,brokers,assets,institutions]=await Promise.all([
    maps([...new Set(rows.map((x:any)=>x.team_id).filter(Boolean))],"teams","id","id,code,cash_paise,broker_id"),
    maps([...new Set(rows.map((x:any)=>x.broker_id).filter(Boolean))],"brokers","id","id,code,display_name"),
    maps([...new Set(rows.map((x:any)=>x.asset_id).filter(Boolean))],"assets","id","id,name,symbol,type,current_price_paise"),
    maps([...new Set(rows.map((x:any)=>x.institution_id).filter(Boolean))],"institutions","id","id,code,name,cash_paise")
  ]);
  const holdingKeys=rows.filter((x:any)=>x.side==="SELL").map((x:any)=>[x.team_id,x.asset_id]);
  const holdingQ=new Map<string,number>();
  if(holdingKeys.length){
    const teamIds=[...new Set(holdingKeys.map(x=>x[0]))],assetIds=[...new Set(holdingKeys.map(x=>x[1]))];
    const {data:h}=await db.from("holdings").select("team_id,asset_id,quantity").in("team_id",teamIds).in("asset_id",assetIds);
    for(const x of h||[]) holdingQ.set(String(x.team_id)+":"+String(x.asset_id),Number(x.quantity));
  }
  return rows.map((x:any)=>{
    const t=teams.get(String(x.team_id)); const a=assets.get(String(x.asset_id));
    const inst=institutions.get(String((x as any).institution_id));
    const payer=x.source==="INSTITUTION" ? (x.side==="BUY" ? inst : t) : t;
    const payerCash=Number(payer?.cash_paise||0)/100;
    const required=Number(x.amount_paise||0)/100;
    const unlimitedInstitutionBuy=x.source==="INSTITUTION" && x.side==="BUY";
    const minimumCash=unlimitedInstitutionBuy?0:20000;
    const cashAfter=payerCash-required;
    const absoluteInsufficient=unlimitedInstitutionBuy?false:payerCash<required;
    const minimumWarning=!unlimitedInstitutionBuy && !absoluteInsufficient && cashAfter<minimumCash;
    return {id:x.id,kind:x.source,order_code:x.order_code,team:t?.code||"",investor:inst?.code||"",broker:brokers.get(String(x.broker_id))?.code||"",
      stock:a?.name||"",symbol:a?.symbol||"",side:x.side,quantity:x.quantity,price:Number(x.price_paise)/100,
      trade_value:Number(x.trade_value_paise)/100,required_cash:required,available_cash:payerCash,cash_after:cashAfter,
      payer:x.source==="INSTITUTION"?(x.side==="BUY"?"INSTITUTION":"CUSTOMER_TEAM"):"CUSTOMER_TEAM",
      no_balance:absoluteInsufficient,minimum_cash:minimumCash,minimum_cash_warning:minimumWarning,
      short_selling:!!x.is_short_sale,holding_qty:holdingQ.get(String(x.team_id)+":"+String(x.asset_id))||0,created_at:x.created_at};
  });
}

async function teamPortfolio(user:any) {
  let teamIds:any[]=[];
  if(user.role==="PARTICIPANT") teamIds=[user.team_id];
  else { const {data}=await db.from("teams").select("id"); teamIds=(data||[]).map((x:any)=>x.id); }
  if(!teamIds.length) return {teams:[]};

  const [{data:teams,error:te},{data:brokers,error:be},{data:holdings,error:he},{data:assets,error:ae},
    {data:loans,error:le},{data:orders,error:oe},{data:commissions,error:ce}]=await Promise.all([
    db.from("teams").select("id,code,broker_id,cash_paise,base_capital_paise,minimum_cash_paise,realized_profit_paise,peak_own_capital_used_paise,short_sale_count").in("id",teamIds),
    db.from("brokers").select("id,code").order("code"),
    db.from("holdings").select("team_id,asset_id,quantity,average_price_paise,cost_basis_paise").in("team_id",teamIds),
    db.from("assets").select("id,name,symbol,type,current_price_paise").eq("is_active",true),
    db.from("loans").select("team_id,principal_paise,principal_outstanding_paise,interest_rate_bps,interest_due_paise,interest_paid_paise,status").in("team_id",teamIds).order("id",{ascending:false}),
    db.from("orders").select("id,order_code,team_id,asset_id,side,quantity,price_paise,trade_value_paise,brokerage_paise,status,is_short_sale,source,created_at").in("team_id",teamIds).order("created_at",{ascending:false}).order("id",{ascending:false}).limit(15000),
    db.from("broker_commissions").select("team_id,commission_paise,status").in("team_id",teamIds)
  ]);
  if(te||be||he||ae||le||oe||ce) throw te||be||he||ae||le||oe||ce;

  const bmap=new Map((brokers||[]).map((x:any)=>[String(x.id),x.code]));
  const amap=new Map((assets||[]).map((x:any)=>[String(x.id),x]));
  const tmap=new Map((teams||[]).map((x:any)=>[String(x.id),x.code]));
  const loanMap=new Map<string,any>();
  for(const l of loans||[]){const k=String(l.team_id);if(!loanMap.has(k))loanMap.set(k,l);}
  const holdingsByTeam=new Map<number,any[]>();
  for(const h of holdings||[]){const k=Number(h.team_id);const arr=holdingsByTeam.get(k)||[];arr.push(h);holdingsByTeam.set(k,arr);}
  const brokerageByTeam=new Map<number,number>();
  for(const bc of commissions||[]) if(bc.status==="APPLIED") brokerageByTeam.set(Number(bc.team_id),(brokerageByTeam.get(Number(bc.team_id))||0)+Number(bc.commission_paise||0));
  const hs=holdings||[], ord=orders||[];

  const teamRows=(teams||[]).map((t:any)=>{
    const l=loanMap.get(String(t.id));
    const hrows=holdingsByTeam.get(Number(t.id))||[];
    const holdingsValue=hrows.reduce((s:number,h:any)=>s+Number(h.quantity)*Number(amap.get(String(h.asset_id))?.current_price_paise||0),0)/100;
    const cash=Number(t.cash_paise)/100, base=Number(t.base_capital_paise)/100;
    const liability=l?Number(l.principal_outstanding_paise+l.interest_due_paise)/100:0;
    const currentValue=cash+holdingsValue;
    const loanWithdrawn=l?Number(l.principal_paise)/100:0;
    const brokeragePaid=Number(brokerageByTeam.get(Number(t.id))||0)/100;
    const eligible=Number(t.peak_own_capital_used_paise)>=Number(t.base_capital_paise)-Number(t.minimum_cash_paise)
      && cash>=Number(t.minimum_cash_paise)/100 && Number(t.short_sale_count)===0 && liability===0;
    return {
      id:t.id,team:t.code,broker:bmap.get(String(t.broker_id))||"",available_cash:cash,holdings_value:holdingsValue,
      current_value:currentValue,pnl:currentValue-base-liability,realized_pl:Number(t.realized_profit_paise)/100,
      return_pct:base?(currentValue-base-liability)/base*100:0,loan_withdrawn:loanWithdrawn,
      loan_money_left:Math.max(0,500000-loanWithdrawn),original_principal:loanWithdrawn,
      principal_due:l?Number(l.principal_outstanding_paise)/100:0,principal_paid:l?Number(l.principal_paise-l.principal_outstanding_paise)/100:0,
      interest_rate:l?Number(l.interest_rate_bps)/10000:0,interest_due:l?Number(l.interest_due_paise)/100:0,
      interest_paid:l?Number(l.interest_paid_paise)/100:0,loan_status:l?.status?.toString()||"NONE",
      base_money_left:Math.max(0,base-Number(t.peak_own_capital_used_paise)/100),
      brokerage_paid:brokeragePaid,short_sale_count:t.short_sale_count,topper_eligible:eligible
    };
  });

  const holdingRows=hs.map((h:any)=>{
    const a=amap.get(String(h.asset_id)), current=Number(h.quantity)*Number(a?.current_price_paise||0)/100, invested=Number(h.cost_basis_paise||0)/100;
    return {team:tmap.get(String(h.team_id))||"",stock:a?.name||"",symbol:a?.symbol||"",type:a?.type||"",
      quantity:Number(h.quantity),average_price:Number(h.average_price_paise)/100,current_price:Number(a?.current_price_paise||0)/100,
      invested_value:invested,current_value:current,market_value:current,unrealized_pl:current-invested};
  });

  const soldOrders=ord.filter((o:any)=>o.status==="SETTLED"&&((o.source==="PARTICIPANT"&&o.side==="SELL")||(o.source==="INSTITUTION"&&o.side==="BUY"))&&!o.is_short_sale);
  const soldOrderIds=soldOrders.map((o:any)=>o.id);
  const {data:sets}=soldOrderIds.length?await db.from("settlements").select("order_id,team_position_before_avg_paise").in("order_id",soldOrderIds):{data:[]};
  const smap=new Map((sets||[]).map((x:any)=>[String(x.order_id),x]));
  const soldMap=new Map<string,any>();
  for(const o of soldOrders){
    const a=amap.get(String(o.asset_id)), s=smap.get(String(o.id)), avg=Number(s?.team_position_before_avg_paise||0)/100;
    const gross=Number(o.trade_value_paise)/100, cost=avg*Number(o.quantity), brokerage=Number(o.brokerage_paise)/100;
    const key=String(o.team_id)+":"+String(o.asset_id), row=soldMap.get(key)||{team:teams?.find((t:any)=>t.id===o.team_id)?.code||"",stock:a?.name||"",quantity:0,gross_proceeds:0,cost_basis:0,brokerage:0,realized_gross_pl:0,realized_pl:0,qty_value:0};
    row.quantity+=Number(o.quantity);row.gross_proceeds+=gross;row.cost_basis+=cost;row.brokerage+=brokerage;
    row.realized_gross_pl+=gross-cost;row.realized_pl+=gross-cost-brokerage;row.qty_value+=Number(o.quantity);soldMap.set(key,row);
  }
  const soldRows=[...soldMap.values()].map((x:any)=>({...x,average_sale_price:x.qty_value?x.gross_proceeds/x.qty_value:0}));

  const attempts=ord.map((o:any)=>({team:tmap.get(String(o.team_id))||"",order_code:o.order_code,status:o.status,
    attempt_result:o.status==="SETTLED"?"SETTLED":(o.status==="BANK_REJECTED"||o.status==="EXCHANGE_REJECTED"?"REJECTED":"PENDING"),
    side:o.side,quantity:o.quantity,price:Number(o.price_paise)/100,asset:amap.get(String(o.asset_id))?.name||"",created_at:o.created_at}));

  const eligible=teamRows.filter((x:any)=>x.topper_eligible).sort((a:any,b:any)=>b.realized_pl-a.realized_pl);
  const topLosers=teamRows.filter((x:any)=>x.realized_pl<0).sort((a:any,b:any)=>a.realized_pl-b.realized_pl).slice(0,10);
  const {data:state}=await db.from("event_state").select("status,topper_team_id,topper_realized_profit_paise,finalization_note").eq("id",1).single();
  const finalTop=state?.status==="FINALIZED"?teamRows.find((x:any)=>x.id===state.topper_team_id):null;
  return {teams:teamRows,holdings:holdingRows,sold_holdings:soldRows,attempts,top_gainers:eligible.slice(0,10),top_losers:topLosers,
    topper:finalTop||eligible[0]||null,topper_selection_mode:state?.status==="FINALIZED"?"FINALIZED RESULT":"LIVE ELIGIBILITY PREVIEW",
    event_status:state?.status||"NOT_STARTED"};
}

async function cashLedger(user:any,url:URL) {
  let q=db.from("cash_ledger").select("id,team_id,order_id,entry_type,debit_paise,credit_paise,balance_after_paise,note,created_at,orders(order_code)").order("created_at",{ascending:false}).order("id",{ascending:false});
  if(user.role==="PARTICIPANT")q=q.eq("team_id",user.team_id);
  if(url.searchParams.get("team")){const {data:t}=await db.from("teams").select("id").eq("code",url.searchParams.get("team")).single();if(t)q=q.eq("team_id",t.id);}
  if(url.searchParams.get("entry_type"))q=q.eq("entry_type",url.searchParams.get("entry_type"));
  const {data:rows0,error}=await q.limit(50000);if(error)throw error;let rows=rows0||[];
  const search=(url.searchParams.get("q")||"").trim().toLowerCase();
  if(search)rows=rows.filter((x:any)=>String(x.note||"").toLowerCase().includes(search)||String(x.entry_type||"").toLowerCase().includes(search)||String(x.orders?.order_code||"").toLowerCase().includes(search));
  const page=Math.max(1,Number(url.searchParams.get("page")||1)),limit=Math.min(100,Math.max(1,Number(url.searchParams.get("limit")||50))),total=rows.length,paged=rows.slice((page-1)*limit,page*limit);
  const teams=await maps([...new Set(paged.map((x:any)=>x.team_id))],"teams","id","id,code,cash_paise");
  const allTeams=(await db.from("teams").select("id,code,cash_paise").order("code")).data||[],types=(await db.from("cash_ledger").select("entry_type").limit(1000)).data||[];
  const debit=rows.reduce((s:number,x:any)=>s+Number(x.debit_paise||0),0)/100,credit=rows.reduce((s:number,x:any)=>s+Number(x.credit_paise||0),0)/100;
  const currentCash=user.role==="PARTICIPANT"?Number(allTeams.find((x:any)=>x.id===user.team_id)?.cash_paise||0)/100:allTeams.reduce((s:number,x:any)=>s+Number(x.cash_paise||0),0)/100;
  return {summary:{entries:total,total_debit:debit,total_credit:credit,net_movement:credit-debit,current_cash:currentCash},filters:{teams:allTeams.map((x:any)=>x.code),types:[...new Set(types.map((x:any)=>x.entry_type))]},
    rows:paged.map((x:any)=>({...x,team:teams.get(String(x.team_id))?.code||"",order_code:x.orders?.order_code||"",debit:Number(x.debit_paise||0)/100,credit:Number(x.credit_paise||0)/100,balance_after:Number(x.balance_after_paise||0)/100})),
    pagination:{page,limit,total,pages:Math.max(1,Math.ceil(total/limit))}};
}
async function audit(user:any,url:URL) {
  let q=db.from("audit_log").select("id,actor_user_id,actor_email,actor_role,action,order_id,team_id,asset_id,side,quantity,trade_value_paise,risk_status,what_happened,details_json,created_at",{count:"exact"}).order("created_at",{ascending:false});
  if(user.role==="PARTICIPANT") q=q.eq("team_id",user.team_id);
  const page=Math.max(1,Number(url.searchParams.get("page")||1)),limit=Math.min(100,Math.max(1,Number(url.searchParams.get("limit")||50)));
  const {data,error,count}=await q.range((page-1)*limit,page*limit-1);if(error)throw error;
  const rows=data||[];
  const users=await maps([...new Set(rows.map((x:any)=>x.actor_user_id).filter(Boolean))],"users","id","id,username,email,display_name,role");
  const teams=await maps([...new Set(rows.map((x:any)=>x.team_id).filter(Boolean))],"teams","id","id,code");
  const assets=await maps([...new Set(rows.map((x:any)=>x.asset_id).filter(Boolean))],"assets","id,name,symbol,type");
  const orders=await maps([...new Set(rows.map((x:any)=>x.order_id).filter(Boolean))],"orders","id,order_code");
  const labels:any={ORDER_CREATED:"Order Created",ORDER_SETTLED:"Order Settled",EXCHANGE_APPROVED:"Exchange Approved",EXCHANGE_REJECTED:"Exchange Rejected",BANK_REJECTED:"Bank Rejected",
    EVENT_START:"Event Started",EVENT_PAUSE:"Event Paused",EVENT_RESUME:"Event Resumed",EVENT_CLOSE:"Event Closed",EVENT_FINALIZE:"Event Finalized",EVENT_RESET:"Event Reset",
    LOAN_DRAW:"Loan Draw",LOAN_REPAYMENT:"Loan Repayment",SETTLEMENT_UNDO:"Settlement Undo",SETTLEMENT_REDO:"Settlement Redo",INSTITUTIONAL_ORDER_CREATED:"Institutional Order Created",INSTITUTIONAL_ORDER_SETTLED:"Institutional Order Settled"};
  const out=rows.map((x:any)=>{
    const u=users.get(String(x.actor_user_id)),t=teams.get(String(x.team_id)),a=assets.get(String(x.asset_id)),o=orders.get(String(x.order_id)),risk=String(x.risk_status||"");
    return {id:x.id,actor_name:u?.display_name||u?.username||x.actor_email||"SYSTEM",actor_username:u?.username||"",actor_email:x.actor_email||u?.email||"",actor_role:x.actor_role||u?.role||"",
      action:x.action,action_label:labels[x.action]||x.action,order_code:o?.order_code||"",team_code:t?.code||"",asset_name:a?.name||"",asset_symbol:a?.symbol||"",asset_type:a?.type||"",
      side:x.side,quantity:x.quantity,trade_value:Number(x.trade_value_paise||0)/100,risk_label:risk&&risk!=="CLEAR"?risk:"",risk_level:/SHORT|REJECT|BANK/i.test(risk)?"danger":"warning",
      what_happened:x.what_happened||"",details:x.details_json||{},created_at:x.created_at};
  });
  return {rows:out,pagination:{page,limit,total:count||0,pages:Math.max(1,Math.ceil((count||0)/limit))}};
}

async function adminState(){
  const [{data:s},{data:c},{data:teams}]=await Promise.all([
    db.from("event_state").select("*").eq("id",1).single(),
    db.from("event_settings").select("*").eq("id",1).single(),
    db.from("teams").select("id,code,cash_paise,realized_profit_paise,peak_own_capital_used_paise,short_sale_count").order("code")
  ]);
  return {status:s?.status||"NOT_STARTED",event:s,settings:c,
    teams:(teams||[]).map((t:any)=>({...t,cash:Number(t.cash_paise)/100,realized_profit:Number(t.realized_profit_paise)/100,
      peak_own_capital_used:Number(t.peak_own_capital_used_paise)/100}))};
}

async function adminAction(user:any,action:string,controlPassword=""){
  if(PROTECTED_ADMIN_ACTIONS.has(action) && !(await verifyAdminControlPassword(controlPassword))){
    return {error:"Invalid administrator control password",status:403};
  }
  const actor=user;
  if(action==="RESET"){const {data,rpcError}=await db.rpc("jse_reset_event",{p_user_id:actor.uid});if(rpcError)return {error:rpcError.message,status:400};return data;}
  if(action==="FINALIZE"){const {data,rpcError}=await db.rpc("jse_finalize_event",{p_user_id:actor.uid});if(rpcError)return {error:rpcError.message,status:400};return data;}
  const {data:s}=await db.from("event_state").select("status").eq("id",1).single(),cur=s?.status,next:any={START:"LIVE",PAUSE:"PAUSED",RESUME:"LIVE",CLOSE:"CLOSED"}[action];
  if(!next)return {error:"Unknown admin action",status:400};
  const valid=(cur==="NOT_STARTED"&&action==="START")||(cur==="LIVE"&&(action==="PAUSE"||action==="CLOSE"))||(cur==="PAUSED"&&(action==="RESUME"||action==="CLOSE"));
  if(!valid)return {error:`Invalid event transition: ${cur} → ${next}`,status:409};
  const now=new Date().toISOString(),patch:any={status:next,updated_at:now};
  if(action==="START")patch.started_at=now;if(action==="PAUSE")patch.paused_at=now;if(action==="RESUME")patch.resumed_at=now;if(action==="CLOSE")patch.closed_at=now;
  const {error:e}=await db.from("event_state").update(patch).eq("id",1);if(e)throw e;
  await db.from("audit_log").insert({actor_user_id:actor.uid,actor_role:"ADMIN",action:"EVENT_"+action,what_happened:"Administrator changed event lifecycle.",details_json:{from:cur,to:next}});
  return {ok:true,status:next};
}

async function memberAccounts(user:any){
  const {data,error}=await db.from("users").select("id,username,email,display_name,role,team_id,institution_id,is_active,must_change_password").eq("is_active",true).order("username");
  if(error)throw error;
  const tm=await maps([...new Set((data||[]).map((x:any)=>x.team_id).filter(Boolean))],"teams","id","id,code");
  return {accounts:(data||[]).map((x:any)=>{const t=tm.get(String(x.team_id));return {
    id:x.id,username:x.username,email:x.email,display_name:x.display_name,role:x.role,
    team:t?.code||"",team_code:t?.code||"",password_status:x.must_change_password?"CHANGE_REQUIRED":"SET",active:x.is_active
  };})};
}


async function institutionalPortfolio(user:any,url:URL){
  const actor=user;
  let institutionId=actor.institution_id;
  if(!institutionId){
    const {data:i,error:ie}=await db.from("institutions").select("id,code,name,cash_paise").order("id").limit(1).single();
    if(ie)throw ie;
    institutionId=i.id;
  }
  const [{data:inst,error:ie},{data:assets,error:ae},{data:holdings,error:he},{data:orders,error:oe},{data:orderStats,error:ose},{data:teams,error:te}]=await Promise.all([
    db.from("institutions").select("id,code,name,cash_paise,initial_cash_paise").eq("id",institutionId).single(),
    db.from("assets").select("id,name,symbol,type,current_price_paise").eq("is_active",true).order("display_order"),
    db.from("institutional_holdings").select("asset_id,quantity,average_price_paise,cost_basis_paise").eq("institution_id",institutionId),
    db.from("orders").select("id,order_code,team_id,asset_id,side,quantity,price_paise,trade_value_paise,status,created_at").eq("institution_id",institutionId).order("created_at",{ascending:false}).order("id",{ascending:false}).limit(100),
    db.from("orders").select("side,trade_value_paise,status").eq("institution_id",institutionId).limit(50000),
    db.from("teams").select("code").order("code")
  ]);
  if(ie||ae||he||oe||ose||te)throw ie||ae||he||oe||ose||te;
  const amap=new Map((assets||[]).map((x:any)=>[String(x.id),x]));
  const tmap=new Map((teams||[]).map((x:any)=>[String((x as any).id),(x as any).code]));
  const h=(holdings||[]).map((x:any)=>{const a=amap.get(String(x.asset_id));const current=Number(x.quantity)*Number(a?.current_price_paise||0)/100;const invested=Number(x.cost_basis_paise||0)/100;return {stock:a?.name||"",symbol:a?.symbol||"",type:a?.type||"",quantity:Number(x.quantity),average_price:Number(x.average_price_paise||0)/100,current_price:Number(a?.current_price_paise||0)/100,market_value:current,pnl:current-invested};});
  const ord=orders||[], allOrd=orderStats||[];
  const stats={pending:allOrd.filter((x:any)=>["PENDING_EXCHANGE","EXCHANGE_APPROVED"].includes(x.status)).length,settled:allOrd.filter((x:any)=>x.status==="SETTLED").length,
    buy_value:allOrd.filter((x:any)=>x.side==="BUY").reduce((n:number,x:any)=>n+Number(x.trade_value_paise||0)/100,0),
    sell_value:allOrd.filter((x:any)=>x.side==="SELL").reduce((n:number,x:any)=>n+Number(x.trade_value_paise||0)/100,0),
    total:allOrd.length,market_value:h.reduce((n:number,x:any)=>n+x.market_value,0),pnl:h.reduce((n:number,x:any)=>n+x.pnl,0)};
  return {investor:{id:inst.id,code:inst.code,name:inst.name,available_cash:Number(inst.cash_paise)/100},
    teams:(teams||[]).map((x:any)=>x.code),holdings:h,orders:ord.map((x:any)=>({order_code:x.order_code,team:tmap.get(String(x.team_id))||"",asset:amap.get(String(x.asset_id))?.name||"",side:x.side,quantity:x.quantity,price:Number(x.price_paise)/100,trade_value:Number(x.trade_value_paise)/100,status:x.status,created_at:x.created_at})),stats};
}

async function eventStateCompat(){
  const d=await adminState();
  const event={...d.event};
  if(event.status==="PAUSED") event.status="SETTLEMENT_ONLY";
  return {...d,event};
}

async function exportEvent(){
  const {data:event}=await db.from("event_state").select("*").eq("id",1).single();
  if(event?.status!=="FINALIZED") throw new Error("The event archive is available only after FINALIZE EVENT.");
  const [{data:settings},{data:teams},{data:brokers},{data:assets},{data:orders},{data:settlements},{data:holdings},{data:institutionalHoldings},
    {data:loans},{data:commissions},{data:cash},{data:institutionCash},{data:audit},{data:rejections}]=await Promise.all([
    db.from("event_settings").select("*").limit(1),
    db.from("teams").select("id,code,broker_id,base_capital_paise,cash_paise,peak_own_capital_used_paise,minimum_cash_paise,realized_profit_paise,short_sale_count"),
    db.from("brokers").select("*"),
    db.from("assets").select("id,symbol,name,type,base_price_paise,current_price_paise,previous_price_paise,lot_size,display_order,is_active"),
    db.from("orders").select("*").limit(50000),
    db.from("settlements").select("*").limit(50000),
    db.from("holdings").select("*").limit(50000),
    db.from("institutional_holdings").select("*").limit(50000),
    db.from("loans").select("*").limit(50000),
    db.from("broker_commissions").select("*").limit(50000),
    db.from("cash_ledger").select("*").limit(50000),
    db.from("institution_cash_ledger").select("*").limit(50000),
    db.from("audit_log").select("*").limit(100000),
    db.from("settlement_rejections").select("*").limit(50000)
  ]);
  return {
    event:{...event,name:"JAIN STOCK EXCHANGE"},
    generated_at:new Date().toISOString(),
    data:{event_state:[event],event_settings:settings||[],brokers:brokers||[],teams:teams||[],assets:assets||[],
      orders:orders||[],settlements:settlements||[],holdings:holdings||[],institutional_holdings:institutionalHoldings||[],
      loans:loans||[],broker_commissions:commissions||[],cash_ledger:cash||[],
      institution_cash_ledger:institutionCash||[],settlement_rejections:rejections||[],audit_log:audit||[]}
  };
}

async function brokerReports(type:string){
  if(type==="commission_summary"){
    const {data,error}=await db.from("broker_commissions").select("broker_id,commission_paise").eq("status","APPLIED").limit(50000);
    if(error)throw error;
    const ids=[...new Set((data||[]).map((x:any)=>x.broker_id).filter(Boolean))];
    const bm=await maps(ids,"brokers","id","id,code,display_name");
    const grouped=new Map<string,any>();
    for(const x of (data||[])){
      const b=bm.get(String(x.broker_id)); const key=String(x.broker_id);
      const row=grouped.get(key)||{broker:b?.code||"",broker_name:b?.display_name||b?.code||"",commission_earned:0,transactions:0};
      row.commission_earned+=Number(x.commission_paise||0)/100; row.transactions++;
      grouped.set(key,row);
    }
    return {rows:[...grouped.values()].sort((a,b)=>b.commission_earned-a.commission_earned)};
  }
  if(type==="commissions"){
    const [{data:rows,error:re},{data:brokers,error:be},{data:teams,error:te},{data:assets,error:ae}]=await Promise.all([
      db.from("broker_commissions").select("id,order_id,broker_id,team_id,commission_rate_bps,commission_paise,status,created_at,orders(order_code,asset_id,side,quantity,price_paise,trade_value_paise)").order("created_at",{ascending:false}).order("id",{ascending:false}).limit(15000),
      db.from("brokers").select("id,code,display_name"),
      db.from("teams").select("id,code"),
      db.from("assets").select("id,name,symbol,type")
    ]);
    if(re||be||te||ae)throw re||be||te||ae;
    const bm=new Map((brokers||[]).map((x:any)=>[String(x.id),x])); const tm=new Map((teams||[]).map((x:any)=>[String(x.id),x]));
    const am=new Map((assets||[]).map((x:any)=>[String(x.id),x]));
    return {rows:(rows||[]).map((x:any)=>{const o=x.orders||{},b=bm.get(String(x.broker_id)),t=tm.get(String(x.team_id)),a=am.get(String(o.asset_id));
      return {broker:b?.code||"",order_code:o?.order_code||"",team:t?.code||"",stock:a?.name||"",symbol:a?.symbol||"",side:o?.side||"",quantity:o?.quantity||0,
        price:Number(o?.price_paise||0)/100,trade_value:Number(o?.trade_value_paise||0)/100,commission_rate:Number(x.commission_rate_bps||0)/10000,
        commission_amount:Number(x.commission_paise||0)/100,status:x.status,created_at:x.created_at};})};
  }
  return {rows:[]};
}

async function certificates(){
  const [{data:orders,error:oe},{data:teams,error:te},{data:brokers,error:be},{data:assets,error:ae}]=await Promise.all([
    db.from("orders").select("id,order_code,team_id,broker_id,asset_id,side,quantity,price_paise,trade_value_paise,brokerage_paise,settled_at").eq("status","SETTLED").order("settled_at",{ascending:false}).limit(15000),
    db.from("teams").select("id,code"),db.from("brokers").select("id,code"),db.from("assets").select("id,name,symbol,type")
  ]);
  if(oe||te||be||ae)throw oe||te||be||ae;
  const tm=new Map((teams||[]).map((x:any)=>[String(x.id),x.code])); const bm=new Map((brokers||[]).map((x:any)=>[String(x.id),x.code])); const am=new Map((assets||[]).map((x:any)=>[String(x.id),x]));
  return {certificates:(orders||[]).map((x:any)=>{const a=am.get(String(x.asset_id));return {order_code:x.order_code,team:tm.get(String(x.team_id))||"",broker:bm.get(String(x.broker_id))||"",
    stock:a?.name||"",symbol:a?.symbol||"",side:x.side,quantity:x.quantity,price:Number(x.price_paise||0)/100,
    trade_value:Number(x.trade_value_paise||0)/100,brokerage:Number(x.brokerage_paise||0)/100,created_at:x.settled_at};})};
}
async function loanData(user:any,teamCode?:string){
  let teamId=user.team_id;
  if(user.role!=="PARTICIPANT" && teamCode){
    const {data:t}=await db.from("teams").select("id").eq("code",teamCode).single();
    teamId=t?.id;
  }
  if(!teamId) throw new Error("Team is required");
  const {data:team,error:te}=await db.from("teams").select("id,code,cash_paise,minimum_cash_paise").eq("id",teamId).single();
  if(te) throw te;
  const {data:loan,error:le}=await db.from("loans").select("id,principal_paise,principal_outstanding_paise,interest_rate_bps,interest_due_paise,status")
    .eq("team_id",teamId).eq("status","OPEN").order("id",{ascending:false}).limit(1).maybeSingle();
  if(le) throw le;
  const cash=Number(team.cash_paise)/100;
  const minCash=Number(team.minimum_cash_paise)/100;
  const principal=Number(loan?.principal_outstanding_paise||0)/100;
  const interest=Number(loan?.interest_due_paise||0)/100;
  return {team:{team:team.code,available_cash:cash},loan:{id:loan?.id||null,principal_due:principal,interest_due:interest,total_due:principal+interest,
    interest_rate:loan?Number(loan.interest_rate_bps)/10000:0,max_repayable:Math.max(0,cash-minCash)}};
}
async function insights(){
  const [{data:assets},{data:orders},{data:teams},{data:loans},{data:state},{data:holdings}]=await Promise.all([
    db.from("assets").select("id,symbol,name,type,current_price_paise,previous_price_paise").eq("is_active",true),
    db.from("orders").select("id,team_id,asset_id,side,quantity,trade_value_paise,source,status").eq("status","SETTLED").limit(50000),
    db.from("teams").select("id,code,cash_paise,base_capital_paise,realized_profit_paise,peak_own_capital_used_paise,minimum_cash_paise,short_sale_count,broker_id"),
    db.from("loans").select("team_id,principal_outstanding_paise,interest_due_paise,status").order("id",{ascending:false}),
    db.from("event_state").select("status,topper_team_id,topper_realized_profit_paise,finalization_note").eq("id",1).single(),
    db.from("holdings").select("team_id,asset_id,quantity")
  ]);
  const aset=assets||[], ord=orders||[], tm=teams||[];
  const assetMap=new Map(aset.map((x:any)=>[x.id,x]));
  const ranked=aset.map((x:any)=>({...x,price:Number(x.current_price_paise)/100,
    change_pct:x.previous_price_paise?((Number(x.current_price_paise)-Number(x.previous_price_paise))*100/Number(x.previous_price_paise)):0}))
    .sort((a:any,b:any)=>b.change_pct-a.change_pct);
  const gainers=ranked.slice(0,10), losers=ranked.slice(-10).reverse();
  let totalBuy=0,totalSell=0,participantBuy=0,participantSell=0,institutionalBuy=0,institutionalSell=0;
  for(const o of ord){
    const v=Number(o.trade_value_paise||0)/100;
    if(o.side==="BUY"){totalBuy+=v;if(o.source==="INSTITUTION")institutionalBuy+=v;else participantBuy+=v;}
    else if(o.side==="SELL"){totalSell+=v;if(o.source==="INSTITUTION")institutionalSell+=v;else participantSell+=v;}
  }
  const summary:any={
    positive:ranked.filter((x:any)=>x.change_pct>0.005).length,
    negative:ranked.filter((x:any)=>x.change_pct<-0.005).length,
    flat:ranked.filter((x:any)=>Math.abs(x.change_pct)<=0.005).length,
    totalBuy,totalSell,participantBuy,participantSell,institutionalBuy,institutionalSell,
    settledOrders:ord.length,activeAssets:aset.length
  };
  summary.sentiment=summary.positive>summary.negative?"BULLISH":summary.negative>summary.positive?"BEARISH":"NEUTRAL";
  summary.institutionalSignal=summary.institutionalBuy>summary.institutionalSell*1.05?"BUY BIAS":summary.institutionalSell>summary.institutionalBuy*1.05?"SELL BIAS":"BALANCED";

  const sectorOf=(a:any)=>{
    const s=String(a.symbol+" "+a.name).toLowerCase();
    if(/bank|finance|financial|indusind|hdfc|icici|axis|kotak|sbi|bajaj finance|shriram/.test(s)) return "Financials";
    if(/tcs|infosys|hcl|tech mahindra|techm|information technology|software/.test(s)) return "Information Technology";
    if(/sun pharma|cipla|dr reddy|apollo|lifescience|pharma|health/.test(s)) return "Healthcare";
    if(/tata motors|mahindra|bajaj auto|eicher|maruti|voltra|auto|motors/.test(s)) return "Automotive";
    if(/cement|ultratech|larsen|dlf|shreebuild|infra|construction|coach|grasim/.test(s)) return "Infrastructure & Materials";
    if(/steel|hindalco|coal|jsw|bharat forge|metal|ongc|powergrid|ntpc|bhel|energy/.test(s)) return "Energy & Industrials";
    if(/asianpaint|hindunilvr|itc|titan|nestle|pidilite|trent|eternal/.test(s)) return "Consumer";
    if(/airtel|adani|ports|reliance|indigo/.test(s)) return "Telecom & Transport";
    if(/blueai|ai/.test(s)) return "Technology";
    return "Diversified";
  };

  const sectorMap=new Map<string,any>();
  for(const a of aset){
    const sec=sectorOf(a);
    const row=sectorMap.get(sec)||{sector:sec,buy_value:0,sell_value:0,net_value:0,positive:0,negative:0};
    const changePct=a.previous_price_paise?((Number(a.current_price_paise)-Number(a.previous_price_paise))*100/Number(a.previous_price_paise)):0;
    if(changePct>0.005)row.positive++;
    else if(changePct<-0.005)row.negative++;
    sectorMap.set(sec,row);
  }
  for(const o of ord){
    const a=assetMap.get(o.asset_id); if(!a) continue;
    const row=sectorMap.get(sectorOf(a));
    if(o.side==="BUY") row.buy_value+=Number(o.trade_value_paise)/100; else row.sell_value+=Number(o.trade_value_paise)/100;
  }
  const sectors=[...sectorMap.values()].map((x:any)=>{
    x.net_value=x.buy_value-x.sell_value;
    const gross=x.buy_value+x.sell_value;
    x.pressure=gross?Math.abs(x.net_value)/gross*100:0;
    x.signal=x.net_value>0?(x.pressure>20?"BUY BIAS":"ACCUMULATING"):x.net_value<0?(x.pressure>20?"SELL BIAS":"DISTRIBUTING"):"NEUTRAL";
    return x;
  }).sort((a:any,b:any)=>Math.abs(b.net_value)-Math.abs(a.net_value));

  const flowMap=new Map<number,any>();
  for(const o of ord){
    const row=flowMap.get(o.asset_id)||{asset_id:o.asset_id,net_qty:0,net_value:0,gross_value:0,buy_value:0,sell_value:0};
    const tradeValue=Number(o.trade_value_paise||0)/100;
    if(o.side==="BUY"){row.net_qty+=Number(o.quantity);row.net_value+=tradeValue;row.buy_value+=tradeValue;}
    else {row.net_qty-=Number(o.quantity);row.net_value-=tradeValue;row.sell_value+=tradeValue;}
    row.gross_value+=tradeValue;
    flowMap.set(o.asset_id,row);
  }
  const flows=[...flowMap.values()].map((x:any)=>{
    const a=assetMap.get(x.asset_id);
    const pressure=x.gross_value?Math.min(100,Math.abs(x.net_value)/x.gross_value*100):0;
    return {...x,asset:a?.name||"",pressure};
  });
  const strongestBuy=flows.filter((x:any)=>x.net_value>0).sort((a:any,b:any)=>b.net_value-a.net_value).slice(0,10);
  const strongestSell=flows.filter((x:any)=>x.net_value<0).sort((a:any,b:any)=>a.net_value-b.net_value).slice(0,10);

  const holdingValue=new Map<number,number>();
  for(const h of holdings||[]) holdingValue.set(h.team_id,(holdingValue.get(h.team_id)||0)+Number(h.quantity)*Number(assetMap.get(h.asset_id)?.current_price_paise||0)/100);
  const loanMap=new Map<string,any>();
  for(const loan of loans||[]){const k=String(loan.team_id);if(!loanMap.has(k))loanMap.set(k,loan);}
  const participantRows=tm.map((t:any)=>{
    const loan=loanMap.get(String(t.id));
    const liability=loan?Number(loan.principal_outstanding_paise+loan.interest_due_paise)/100:0;
    const capitalUtil=Number(t.peak_own_capital_used_paise)/Math.max(1,Number(t.base_capital_paise))*100;
    const eligible=capitalUtil>=99 && Number(t.cash_paise)>=Number(t.minimum_cash_paise) && Number(t.short_sale_count)===0 && liability===0;
    return {team:t.code,realized_pl:Number(t.realized_profit_paise)/100,peak_own_capital_used:Number(t.peak_own_capital_used_paise)/100,
      cash:Number(t.cash_paise)/100,holdings:Number(holdingValue.get(t.id)||0),liability,topper_eligible:eligible,capital_utilization_pct:capitalUtil};
  });
  const eligible=participantRows.filter((x:any)=>x.topper_eligible).sort((a:any,b:any)=>b.realized_pl-a.realized_pl);
  const topTeamCode=tm.find((t:any)=>t.id===state?.topper_team_id)?.code||null;
  const topperFinal=state?.status==="FINALIZED"&&topTeamCode?participantRows.find((x:any)=>x.team===topTeamCode)||null:null;
  const top=topperFinal||eligible[0]||null;
  eligible.forEach((x:any,i:number)=>x.topper_rank=i+1);
  const alerts=[];
  if(summary.sentiment==="BULLISH") alerts.push("Broad market breadth is positive across active securities.");
  if(summary.sentiment==="BEARISH") alerts.push("Broad market breadth is negative across active securities.");
  if(summary.institutionalSignal==="BUY BIAS") alerts.push("Institutional flow is tilted toward BUY activity.");
  if(summary.institutionalSignal==="SELL BIAS") alerts.push("Institutional flow is tilted toward SELL activity.");
  const ipos=aset.filter((x:any)=>x.type==="IPO").map((x:any)=>({...x,price:Number(x.current_price_paise)/100,
    change_pct:x.previous_price_paise?((Number(x.current_price_paise)-Number(x.previous_price_paise))*100/Number(x.previous_price_paise)):0,
    available_quantity:0,remaining_quantity:0,status:"OPEN"}));

  return {
    summary,alerts,topMovers:gainers,bottomMovers:losers,sectors,strongestBuy,strongestSell,
    topParticipants:participantRows.sort((a:any,b:any)=>b.realized_pl-a.realized_pl).slice(0,25),
    topper:top?{team:top.team,realized_pl:top.realized_pl,capital_utilization_pct:top.capital_utilization_pct,
      loan_repaid_rule:top.liability===0,minimum_cash_rule:top.cash>=20000?"YES":"NO"}:null,
    topperSelectionMode:state?.status==="FINALIZED"?"FINALIZED RESULT":"LIVE ELIGIBILITY PREVIEW",ipos
  };
}
async function handle(req:Request){
  if(req.method==="OPTIONS")return new Response("ok",{headers:CORS});
  const url=new URL(req.url);
  const contentLength=Number(req.headers.get("content-length")||"0");
  if(req.method==="POST" && Number.isFinite(contentLength) && contentLength>128*1024) return error("Request payload too large",413);
  const rawPath=url.pathname;
  const prefixes=["/functions/v1/jse-api","/jse-api"];
  let path=rawPath;
  for(const prefix of prefixes){
    if(path.startsWith(prefix)){path=path.slice(prefix.length)||"/";break;}
  }
  if(path.length>1) path=path.replace(/\/$/,"");
  try {
    if(path==="/member-login" && req.method==="POST") {
      const b=await bodyJson(req); const {data,rpcError}=await db.rpc("jse_login",{p_username:String(b.username||""),p_password:String(b.access_code||b.password||"")});
      if(rpcError||!data)return error("Invalid credentials",401);
      return response({ok:true,token:await issueToken(data),member:{username:data.username,display_name:data.display_name,role:data.role,team_id:data.team_id,institution_id:data.institution_id,needs_password_change:Boolean(data.needs_password_change)}});
    }
    if(path==="/admin-login" && req.method==="POST") {
      const b=await bodyJson(req); const {data,rpcError}=await db.rpc("jse_login",{p_username:String(b.username||""),p_password:String(b.password||"")});
      if(rpcError||!data||data.role!=="ADMIN")return error("Invalid administrator credentials",401);
      return response({ok:true,token:await issueToken(data),member:{username:data.username,display_name:data.display_name,role:data.role}});
    }

    const user=await auth(req);
    if(path==="/member-me") return user?response({member:{username:user.username,role:user.role,team_id:user.team_id,institution_id:user.institution_id,needs_password_change:Boolean(user.needs_password_change)}}):error("Authentication required",401);
    if(path==="/change-password" && req.method==="POST") {
      if(!user) return error("Authentication required",401);
      const b=await bodyJson(req);
      const newPassword=String(b.new_password||"");
      const {data,rpcError}=await db.rpc("jse_set_password",{p_user_id:Number(user.uid),p_new_password:newPassword});
      if(rpcError) return error(rpcError.message||"Password update failed",400);
      const refreshedToken=await issueToken({user_id:currentUser.uid,role:currentUser.role,team_id:currentUser.team_id,institution_id:currentUser.institution_id,username:currentUser.username,needs_password_change:false});
      return response({...data,token:refreshedToken});
    }
    if(path==="/member-logout") return response({ok:true});
    if(path==="/admin-reset-password" && req.method==="POST") {
      const adminUser=await auth(req);
      if(!needAdmin(adminUser)) return error("Administrator login required",401);
      const b=await bodyJson(req);
      const targetUserId=Number(b.user_id||0);
      if(!targetUserId) return error("Target user is required",400);
      const controlPassword=String(b.control_password||"");
      if(!(await verifyAdminControlPassword(controlPassword))) return error("Invalid administrator control password",403);
      const temporaryPassword=generateTemporaryPassword();
      const {data,rpcError}=await db.rpc("jse_set_temporary_password",{
        p_admin_user_id:Number(adminUser.uid),
        p_target_user_id:targetUserId,
        p_new_password:temporaryPassword
      });
      if(rpcError) return error(rpcError.message||"Temporary password reset failed",400);
      return response({...data,temporary_password:temporaryPassword});
    }
    if(path==="/event" && req.method==="GET") {
      const adminUser=await auth(req);
      if(!needAdmin(adminUser)) return error("Administrator login required",401);
      return response(await eventStateCompat());
    }
    if(path==="/event" && req.method==="POST") {
      const adminUser=await auth(req);
      if(!needAdmin(adminUser)) return error("Administrator login required",401);
      const b=await bodyJson(req);
      let action=String(b.action||"").toUpperCase();
      if(action==="SETTLEMENT_ONLY") action="PAUSE";
      const result=await adminAction(adminUser,action,String(b.control_password||""));
      if(result?.error) return error(result.error,Number(result.status||400));
      return response(result);
    }
    if(path==="/reset-event" && req.method==="POST") {
      const adminUser=await auth(req);
      if(!needAdmin(adminUser)) return error("Administrator login required",401);
      const b=await bodyJson(req);
      const result=await adminAction(adminUser,"RESET",String(b.control_password||""));
      if(result?.error) return error(result.error,Number(result.status||400));
      return response(result);
    }
    if(path==="/export-event" && req.method==="GET") {
      const adminUser=await auth(req);
      if(!needAdmin(adminUser)) return error("Administrator login required",401);
      return response(await exportEvent(),200,{"Cache-Control":"no-store"});
    }
    if(path==="/undo-redo" && req.method==="POST") {
      const adminUser=await auth(req);
      if(!needAdmin(adminUser)) return error("Administrator login required",401);
      const b=await bodyJson(req);
      const controlPassword=String(b.control_password||"");
      if(!(await verifyAdminControlPassword(controlPassword))) return error("Invalid administrator control password",403);
      const {data,rpcError}=await db.rpc("jse_undo_redo",{p_user_id:adminUser.uid,p_action:String(b.action||"").toUpperCase()});
      if(rpcError)return error(rpcError.message||"Recovery action failed",400);
      return response(data);
    }
    if(path==="/admin-state" && req.method==="GET") {
      const adminUser=await auth(req);
      if(!needAdmin(adminUser))return error("Administrator login required",401);
      return response(await adminState());
    }
    if(path==="/health" && req.method==="GET"){
      const adminUser=await auth(req);
      if(!needAdmin(adminUser)) return error("Administrator login required",401);
      const started=performance.now();
      const {data,rpcError}=await db.rpc("jse_health_probe");
      if(rpcError) return error("Database unavailable",503);
      return response({ok:true,db:true,elapsed_ms:Number((performance.now()-started).toFixed(2)),timestamp:new Date().toISOString()},200,{"Cache-Control":"no-store"});
    }
    if(path==="/market" && req.method==="GET") return response(await market(),200,{"Cache-Control":"public,max-age=2,s-maxage=3,stale-while-revalidate=5"});
    if(path==="/realtime" && req.method==="GET") {
      try {
        return response(await realtimeSnapshot(),200,{"Cache-Control":"private,max-age=1"});
      } catch(e) {
        return error(e instanceof Error?e.message:"Realtime state unavailable",500);
      }
    }

    if(path==="/orders" && req.method==="POST") {
      if(!need(user,["PIT_MANAGER","ADMIN"]))return error("Pit Manager access required",403);
      const b=await bodyJson(req); const idem=req.headers.get("idempotency-key")||crypto.randomUUID();
      const actor=user;
      let teamId=Number(b.team_id||0);
      if(!teamId && b.team){
        const {data:team,error:te}=await db.from("teams").select("id").eq("code",String(b.team)).single();
        if(te||!team)return error("Customer team not found",404);
        teamId=Number(team.id);
      }
      if(!teamId)return error("Customer team is required",400);
      const {data,rpcError}=await db.rpc("jse_create_order_for_team",{p_user_id:actor.uid,p_team_id:teamId,p_asset_id:Number(b.stock_id||b.asset_id),p_side:String(b.side||"").toUpperCase(),p_quantity:Number(b.quantity||0),p_price_paise:Math.round(wholeRupeePrice(b.price)*100),p_idempotency_key:idem});
      if(rpcError){return error(rpcError.message||"Order creation failed",400);} return response({ok:true,...data});
    }
    if(path==="/exchange" && req.method==="GET") {if(!need(user,["EXCHANGE","ADMIN"]))return error("Exchange access required",403);return response({transactions:await transactionQueue("exchange")});}
    if(path==="/exchange" && req.method==="POST") {
      if(!need(user,["EXCHANGE","ADMIN"]))return error("Exchange access required",403);
      const b=await bodyJson(req); const actor=user;
      const {data,rpcError}=await db.rpc("jse_exchange_action",{p_user_id:actor.uid,p_order_id:Number(b.order_id),p_action:String(b.action||"")});
      if(rpcError){
        const msg=rpcError.message||"Exchange action failed";
        if(msg.includes("SHORT_SELLING_NOT_POSSIBLE")) return error("Short selling is not possible on JSE.",409,{code:"SHORT_SELLING_NOT_POSSIBLE",approval_allowed:false});
        if(msg.includes("INSTITUTIONAL_COUNTERPARTY_HOLDING_NOT_POSSIBLE")) return error("Institutional BUY cannot be approved because the customer team does not hold enough shares.",409,{code:"INSTITUTIONAL_COUNTERPARTY_HOLDING_NOT_POSSIBLE",approval_allowed:false});
        return error(msg,400);
      }
      return response(data);
    }
    if(path==="/bank" && req.method==="GET") {if(!need(user,["BANK","ADMIN"]))return error("Bank access required",403);return response({transactions:await transactionQueue("bank"),interest_earned:0});}
    if(path==="/bank" && req.method==="POST") {
      if(!need(user,["BANK","ADMIN"]))return error("Bank access required",403);
      const b=await bodyJson(req);const actor=user;const {data:ord}=await db.from("orders").select("source").eq("id",Number(b.order_id)).single();const fn=ord?.source==="INSTITUTION"?"jse_bank_institutional_action":"jse_bank_action";const args=ord?.source==="INSTITUTION"?{p_user_id:actor.uid,p_order_id:Number(b.order_id),p_action:String(b.action||""),p_warning_ack:Boolean(b.warning_ack||b.force||false)}:{p_user_id:actor.uid,p_order_id:Number(b.order_id),p_action:String(b.action||""),p_warning_ack:Boolean(b.warning_ack||b.force||false)};const {data,rpcError}=await db.rpc(fn,args);
      if(rpcError)return error(rpcError.message||"Bank action failed",400); if(data?.code==="NO_BALANCE")return response(data,200); return response(data);
    }
    if(path==="/loan" && req.method==="GET"){
      if(!need(user,["PIT_MANAGER","ADMIN","EXCHANGE","BANK"])) return error("Access required",403);
      return response(await loanData(user,url.searchParams.get("team")||undefined));
    }
    if(path==="/loan" && req.method==="POST"){
      if(!need(user,["PIT_MANAGER","ADMIN"])) return error("Pit Manager access required",403);
      const b=await bodyJson(req);
      const actor=user;
      let teamId=Number(b.team_id||0);
      if(!teamId && b.team){const {data:team}=await db.from("teams").select("id").eq("code",String(b.team)).single();teamId=Number(team?.id||0);}
      if(!teamId)return error("Customer team is required",400);
      const {data,rpcError}=await db.rpc("jse_loan_action_for_team",{p_user_id:actor.uid,p_team_id:teamId,p_action:String(b.action||"REPAY"),p_amount_paise:b.amount==null?null:Math.round(Number(b.amount)*100)});
      if(rpcError) return error(rpcError.message||"Loan action failed",400);
      return response(data);
    }
    if(path==="/institutional-portfolio" && req.method==="GET"){
      if(!need(user,["INSTITUTION","ADMIN"])) return error("Institutional access required",403);
      return response(await institutionalPortfolio(user,url));
    }
    if(path==="/institutional-order" && req.method==="POST"){
      if(!need(user,["INSTITUTION","ADMIN"])) return error("Institutional access required",403);
      const b=await bodyJson(req);
      const actor=user;
      let teamId=Number(b.team_id||0);
      if(!teamId && b.team_code){const {data:team}=await db.from("teams").select("id").eq("code",String(b.team_code)).single();teamId=Number(team?.id||0);}
      if(!teamId)return error("Counterparty team is required",400);
      let assetId=Number(b.asset_id||0);
      if(!assetId)assetId=Number(b.stock_id||0);
      if(!assetId && b.ipo_id)assetId=Number(b.ipo_id);
      if(!assetId)return error("Asset is required",400);
      const idem=req.headers.get("idempotency-key")||crypto.randomUUID();
      const {data,rpcError}=await db.rpc("jse_create_institutional_order",{p_user_id:actor.uid,p_team_id:teamId,p_asset_id:assetId,p_side:String(b.side||"").toUpperCase(),p_quantity:Number(b.quantity||0),p_price_paise:Math.round(wholeRupeePrice(b.price)*100),p_idempotency_key:idem});
      if(rpcError)return error(rpcError.message||"Institutional order creation failed",400);
      return response({ok:true,...data});
    }
    if(path==="/reports" && req.method==="GET"){
      if(!need(user,["ADMIN","PIT_MANAGER","BANK","EXCHANGE"]))return error("Access required",403);
      return response(await brokerReports(String(url.searchParams.get("type")||"commission_summary")));
    }
    if(path==="/certificates" && req.method==="GET"){
      return response(await certificates());
    }
    if(path==="/export" && req.method==="GET"){
      const type=String(url.searchParams.get("type")||"");
      if(type==="commissions"){
        if(!need(user,["ADMIN","PIT_MANAGER","BANK","EXCHANGE"]))return error("Access required",403);
        const d=await brokerReports("commissions");
        return csvResponse(d.rows||[],"JSE-broker-commissions.csv");
      }
      return error("Unknown export type",400);
    }
    if(path==="/tracking" && req.method==="GET") {
      if(!need(user,["PIT_MANAGER","EXCHANGE","BANK","ADMIN"])) return error("Access required",403);
      let trackingTeamId:any=undefined;
      const teamCode=String(url.searchParams.get("team")||"").trim();
      if(teamCode){
        const {data:t,error:te}=await db.from("teams").select("id").eq("code",teamCode).single();
        if(te||!t) return error("Customer team not found",404);
        trackingTeamId=t.id;
      }
      return response(await orderList(
        user,
        Number(url.searchParams.get("page")||1),
        Number(url.searchParams.get("limit")||50),
        {status:url.searchParams.get("status")||"",team_id:trackingTeamId,q:url.searchParams.get("q")||""}
      ));
    }
    if(path==="/portfolios" && req.method==="GET") {if(!need(user,["PIT_MANAGER","ADMIN"]))return error("Pit Manager access required",403);return response(await teamPortfolio(user));}
    if(path==="/portfolio-details" && req.method==="GET") {if(!need(user,["PIT_MANAGER","ADMIN"]))return error("Pit Manager access required",403);return response(await teamPortfolio(user));}
    if(path==="/cash" && req.method==="GET") {if(!need(user,["PIT_MANAGER","ADMIN","BANK","EXCHANGE"]))return error("Access required",403);return response(await cashLedger(user,url));}
    if(path==="/audit" && req.method==="GET") {if(!need(user,["ADMIN","EXCHANGE","BANK","PIT_MANAGER"]))return error("Access required",403);return response(await audit(user,url));}
    if(path==="/member-accounts" && req.method==="GET") {
      const adminUser=await auth(req);
      if(!needAdmin(adminUser))return error("Administrator login required",401);
      return response(await memberAccounts(adminUser));
    }
    if(path==="/insights" && req.method==="GET") {if(!user)return error("Authentication required",401);return response(await insights());}
    if(path==="/admin-action" && req.method==="POST") {
      const adminUser=await auth(req);
      if(!needAdmin(adminUser))return error("Administrator login required",401);
      const b=await bodyJson(req);
      const result=await adminAction(adminUser,String(b.action||"").toUpperCase(),String(b.control_password||""));
      if(result?.error) return error(result.error,Number(result.status||400));
      return response(result);
    }

    return error("Route not found",404);
  } catch(e) {
    console.error(e);
    return error(e instanceof Error?e.message:"Server error",500);
  }
}

Deno.serve(handle);
