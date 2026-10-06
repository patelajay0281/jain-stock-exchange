import { db } from "../lib/hatchable.js";
export const access="admin";
export const methods=["GET"];

const MAP={
"Reliance Industries":["Energy","Oil & Gas / Integrated Energy"],"HDFC Bank":["Financial Services","Banks"],"ICICI Bank":["Financial Services","Banks"],"Infosys":["Information Technology","IT Services"],"TCS":["Information Technology","IT Services"],"Bharti Airtel":["Telecommunication","Telecom Services"],"Larsen & Toubro":["Industrials","Construction & Engineering"],"Axis Bank":["Financial Services","Banks"],"Kotak Mahindra Bank":["Financial Services","Banks"],"SBI":["Financial Services","Banks"],"Bajaj Finance":["Financial Services","NBFC / Consumer Finance"],"Maruti Suzuki":["Consumer Discretionary","Automobiles"],"Mahindra & Mahindra":["Consumer Discretionary","Automobiles"],"Titan":["Consumer Discretionary","Consumer Durables"],"Asian Paints":["Consumer Discretionary","Consumer Durables"],"UltraTech Cement":["Commodities","Cement"],"Sun Pharma":["Healthcare","Pharmaceuticals"],"NTPC":["Utilities","Power"],"Power Grid":["Utilities","Power Transmission"],"Tata Motors":["Consumer Discretionary","Automobiles"],"Adani Ports":["Services","Transport Infrastructure"],"Adani Enterprises":["Industrials","Diversified / Infrastructure"],"JSW Steel":["Commodities","Ferrous Metals"],"HCL Technologies":["Information Technology","IT Services"],"Tech Mahindra":["Information Technology","IT Services"],"Nestlé India":["Fast Moving Consumer Goods","FMCG - Food Products"],"Hindustan Unilever":["Fast Moving Consumer Goods","FMCG - Household & Personal Care"],"ITC":["Fast Moving Consumer Goods","Diversified FMCG"],"Wipro":["Information Technology","IT Services"],"ONGC":["Energy","Oil & Gas Exploration"],"Coal India":["Energy","Coal"],"Bajaj Auto":["Consumer Discretionary","Automobiles"],"Cipla":["Healthcare","Pharmaceuticals"],"Dr. Reddy's":["Healthcare","Pharmaceuticals"],"IndusInd Bank":["Financial Services","Banks"],"Tata Steel":["Commodities","Ferrous Metals"],"Eicher Motors":["Consumer Discretionary","Automobiles"],"Apollo Hospitals":["Healthcare","Healthcare Services"],"Trent":["Consumer Discretionary","Retail"],"BEL":["Industrials","Aerospace & Defence"],"Bharat Forge":["Industrials","Auto Components"],"DLF":["Real Estate","Real Estate"],"Grasim":["Commodities","Cement / Diversified Materials"],"Divi's Laboratories":["Healthcare","Pharmaceuticals"],"Siemens India":["Industrials","Electrical Equipment"],"Pidilite Industries":["Commodities","Chemicals"],"Shriram Finance":["Financial Services","NBFC / Consumer Finance"],"Hindalco":["Commodities","Non-Ferrous Metals"],"Zomato (Eternal)":["Consumer Discretionary","Internet Retail / Food Delivery"],"InterGlobe Aviation":["Services","Airlines"]};
const classify=n=>MAP[n]||["Other","Other"];
const n=v=>Number(v||0);

export default async function(req,res){
 const [stocksR,iposR,ordersR,instR,holdR,teamsR,cashR]=await Promise.all([
  db.query("SELECT id,name,symbol,price,previous_price,ROUND((price-previous_price)*100/NULLIF(previous_price,0),2) change_pct FROM stocks WHERE id IN (SELECT stock_id FROM stock_catalog) ORDER BY name"),
  db.query("SELECT id,code,name,symbol,price,previous_price,available_quantity,remaining_quantity,status,ROUND((price-previous_price)*100/NULLIF(previous_price,0),2) change_pct FROM ipo_offerings ORDER BY name"),
  db.query("SELECT o.id,o.team_id,o.stock_id,o.ipo_id,o.side,o.quantity,o.price,o.trade_value,o.brokerage,o.status,o.created_at,t.code team,b.code broker,COALESCE(s.name,ip.name) asset FROM orders o JOIN teams t ON t.id=o.team_id JOIN brokers b ON b.id=t.broker_id LEFT JOIN stocks s ON s.id=o.stock_id LEFT JOIN ipo_offerings ip ON ip.id=o.ipo_id WHERE o.status='SETTLED' ORDER BY o.created_at"),
  db.query("SELECT io.id,io.investor_id,io.stock_id,io.ipo_id,io.side,io.quantity,io.price,io.trade_value,io.status,io.created_at,ii.name investor,COALESCE(s.name,ip.name) asset FROM institutional_orders io JOIN institutional_investors ii ON ii.id=io.investor_id LEFT JOIN stocks s ON s.id=io.stock_id LEFT JOIN ipo_offerings ip ON ip.id=io.ipo_id WHERE io.status='SETTLED' ORDER BY io.created_at"),
  db.query("SELECT h.team_id,h.stock_id,h.ipo_id,h.quantity,h.average_price,COALESCE(s.name,ip.name) asset,COALESCE(s.price,ip.price) current_price FROM holdings h LEFT JOIN stocks s ON s.id=h.stock_id LEFT JOIN ipo_offerings ip ON ip.id=h.ipo_id WHERE h.quantity>0"),
  db.query("SELECT t.id,t.code,t.available_cash,l.principal_due,l.principal_paid,l.interest_due,l.interest_paid FROM teams t JOIN participant_loans l ON l.team_id=t.id"),
  db.query("SELECT team_id,entry_type,debit,credit,balance_after,created_at,id FROM cash_ledger ORDER BY created_at,id")
 ]);
 const stocks=stocksR.rows.map(x=>({...x,type:"STOCK",change_pct:n(x.change_pct)})),ipos=iposR.rows.map(x=>({...x,type:"IPO",change_pct:n(x.change_pct)}));
 const assets=[...stocks,...ipos];
 const assetMap=new Map(assets.map(x=>[x.name,x]));
 const flow={};
 const ensure=(name,stockId)=>{if(!flow[name]){const a=assetMap.get(name),[sector,industry]=classify(name);flow[name]={asset:name,sector,industry,price:n(a?.price),change_pct:n(a?.change_pct),buy_qty:0,sell_qty:0,buy_value:0,sell_value:0,orders:0,stock_id:stockId}};return flow[name]};
 const settled=[...ordersR.rows.map(x=>({...x,source:"PARTICIPANT"})),...instR.rows.map(x=>({...x,source:"INSTITUTIONAL"}))];
 for(const o of settled){const f=ensure(o.asset,o.stock_id);f.orders++;const q=n(o.quantity),v=n(o.trade_value);if(o.side==="BUY"){f.buy_qty+=q;f.buy_value+=v}else{f.sell_qty+=q;f.sell_value+=v}}
 const flows=Object.values(flow).map(f=>({...f,net_qty:f.buy_qty-f.sell_qty,net_value:f.buy_value-f.sell_value,pressure:f.buy_qty+f.sell_qty?((f.buy_qty-f.sell_qty)/(f.buy_qty+f.sell_qty))*100:0})).sort((a,b)=>Math.abs(b.net_value)-Math.abs(a.net_value));
 const sectorMap={};
 for(const f of flows){if(!sectorMap[f.sector])sectorMap[f.sector]={sector:f.sector,stocks:0,buy_value:0,sell_value:0,net_value:0,positive:0,negative:0,flat:0};const s=sectorMap[f.sector];s.stocks++;s.buy_value+=f.buy_value;s.sell_value+=f.sell_value;s.net_value+=f.net_value;if(f.change_pct>0)s.positive++;else if(f.change_pct<0)s.negative++;else s.flat++}
 const sectors=Object.values(sectorMap).map(s=>({...s,pressure:s.buy_value+s.sell_value?100*s.net_value/(s.buy_value+s.sell_value):0,signal:s.net_value>0&&s.positive>=s.negative?"BUY BIAS":s.net_value<0&&s.negative>=s.positive?"SELL BIAS":"MIXED"})).sort((a,b)=>b.net_value-a.net_value);
 const positive=assets.filter(x=>x.change_pct>0).length,negative=assets.filter(x=>x.change_pct<0).length,flat=assets.length-positive-negative;
 const totalBuy=settled.filter(x=>x.side==="BUY").reduce((a,x)=>a+n(x.trade_value),0),totalSell=settled.filter(x=>x.side==="SELL").reduce((a,x)=>a+n(x.trade_value),0);
 const participantBuy=ordersR.rows.filter(x=>x.side==="BUY").reduce((a,x)=>a+n(x.trade_value),0),participantSell=ordersR.rows.filter(x=>x.side==="SELL").reduce((a,x)=>a+n(x.trade_value),0);
 const institutionalBuy=instR.rows.filter(x=>x.side==="BUY").reduce((a,x)=>a+n(x.trade_value),0),institutionalSell=instR.rows.filter(x=>x.side==="SELL").reduce((a,x)=>a+n(x.trade_value),0);
 const breadth=positive-negative, sentiment=breadth>2?"BULLISH":breadth<-2?"BEARISH":"NEUTRAL";
 const topMovers=[...assets].sort((a,b)=>b.change_pct-a.change_pct).slice(0,20);
 const bottomMovers=[...assets].sort((a,b)=>a.change_pct-b.change_pct).slice(0,10);
 const mostBought=flows.slice().sort((a,b)=>b.buy_value-a.buy_value).slice(0,8);
 const strongestBuy=flows.slice().sort((a,b)=>b.net_value-a.net_value).slice(0,8);
 const strongestSell=flows.slice().sort((a,b)=>a.net_value-b.net_value).slice(0,8);
 const concentration=flows.filter(x=>x.net_value!==0).slice(0,5).reduce((a,x)=>a+Math.abs(x.net_value),0);
 const participantMap={};
 for(const t of teamsR.rows){
   const h=holdR.rows.filter(x=>x.team_id===t.id);
   const holdings=h.reduce((a,x)=>a+n(x.quantity)*n(x.current_price),0);
   const liability=n(t.principal_due)+n(t.interest_due);
   const value=n(t.available_cash)+holdings-liability;
   participantMap[t.id]={team:t.code,cash:n(t.available_cash),holdings,liability,value,pnl:value-2000000,return_pct:(value-2000000)*100/2000000,
     principal_due:n(t.principal_due),principal_paid:n(t.principal_paid),interest_due:n(t.interest_due),interest_paid:n(t.interest_paid)};
 }
 // Realized P&L and peak own-capital utilization for topper selection.
 const costBasis=new Map(),realizedByTeam={};
 const settledOrders=[...ordersR.rows].sort((a,b)=>new Date(a.created_at)-new Date(b.created_at)||Number(a.id)-Number(b.id));
 for(const o of settledOrders){
   const k=String(o.team_id)+":"+String(o.stock_id??"")+"|"+String(o.ipo_id??"");
   const st=costBasis.get(k)||{qty:0,cost:0};
   if(o.side==="BUY"){st.qty+=n(o.quantity);st.cost+=n(o.trade_value)}
   else{
     const avg=st.qty>0?st.cost/st.qty:0,basis=avg*n(o.quantity),gross=n(o.trade_value)-basis,net=gross-n(o.brokerage);
     realizedByTeam[o.team_id]=(realizedByTeam[o.team_id]||0)+net;
     st.qty=Math.max(0,st.qty-n(o.quantity));st.cost=Math.max(0,st.cost-basis);
   }
   costBasis.set(k,st);
 }
 const ledgerByTeam={};
 for(const row of cashR.rows)(ledgerByTeam[row.team_id] ||= []).push(row);
 const MIN_CASH=20000,STARTING_CAPITAL=2000000,REQUIRED_OWN_USE=1980000;
 for(const t of teamsR.rows){
   let totalCash=STARTING_CAPITAL,loanPrincipal=0,minOwn=STARTING_CAPITAL;
   for(const row of ledgerByTeam[t.id]||[]){
     const type=String(row.entry_type||"");
     totalCash+=n(row.credit)-n(row.debit);
     if(type==="LOAN_WITHDRAWAL")loanPrincipal+=n(row.credit);
     if(type==="LOAN_PRINCIPAL_REPAYMENT")loanPrincipal=Math.max(0,loanPrincipal-n(row.debit));
     minOwn=Math.min(minOwn,Math.max(0,totalCash-loanPrincipal));
   }
   const m=participantMap[t.id];
   m.realized_pl=n(realizedByTeam[t.id]);
   m.peak_own_capital_used=Math.max(0,STARTING_CAPITAL-minOwn);
   m.capital_utilization_pct=Math.min(100,m.peak_own_capital_used*100/STARTING_CAPITAL);
   m.full_capital_rule=m.peak_own_capital_used>=REQUIRED_OWN_USE?"YES":"NO";
   m.loan_repaid_rule=n(t.principal_due)<=0.01&&n(t.interest_due)<=0.01;
   m.minimum_cash_rule=n(t.available_cash)>=MIN_CASH?"YES":"NO";
   m.topper_eligible=m.full_capital_rule==="YES"&&m.loan_repaid_rule&&m.minimum_cash_rule==="YES";
 }
 const positiveEligible=Object.values(participantMap).filter(x=>x.topper_eligible&&x.realized_pl>0);
 const fallbackEligible=Object.values(participantMap).filter(x=>x.topper_eligible&&x.realized_pl<0);
 const topperPool=positiveEligible.length?positiveEligible:fallbackEligible;
 const topperSelectionMode=positiveEligible.length?"HIGHEST REALIZED PROFIT":"LEAST LOSS — NO ELIGIBLE TEAM EARNED A REALIZED PROFIT";
 const topper=[...topperPool].sort((a,b)=>b.realized_pl-a.realized_pl)[0]||null;
 const topParticipants=[...Object.values(participantMap)].sort((a,b)=>{
   const ae=a.topper_eligible?0:1,be=b.topper_eligible?0:1;
   return ae-be||Number(b.realized_pl)-Number(a.realized_pl);
 }).slice(0,10);
 const institutionalSignal=institutionalBuy>institutionalSell*1.1?"ACCUMULATING":institutionalSell>institutionalBuy*1.1?"DISTRIBUTING":"BALANCED";
 const alerts=[];
 if(sentiment==="BULLISH")alerts.push("Market breadth is positive: more securities are rising than falling.");
 if(sentiment==="BEARISH")alerts.push("Market breadth is negative: more securities are falling than rising.");
 if(institutionalSignal==="ACCUMULATING")alerts.push("Institutional flow shows net buying pressure.");
 if(institutionalSignal==="DISTRIBUTING")alerts.push("Institutional flow shows net selling pressure.");
 if(sectors[0]?.net_value>0)alerts.push(sectors[0].sector+" has the strongest net buying flow.");
 if(sectors.slice().sort((a,b)=>a.net_value-b.net_value)[0]?.net_value<0)alerts.push(sectors.slice().sort((a,b)=>a.net_value-b.net_value)[0].sector+" has the strongest net selling flow.");
 res.json({summary:{sentiment,breadth,positive,negative,flat,totalBuy,totalSell,participantBuy,participantSell,institutionalBuy,institutionalSell,institutionalSignal,settledOrders:settled.length,activeAssets:assets.length},topMovers,bottomMovers,sectors,flows,strongestBuy,strongestSell,mostBought,topParticipants,topper,topperSelectionMode,topperRule:{starting_capital:STARTING_CAPITAL,minimum_cash:MIN_CASH,required_own_capital_use:REQUIRED_OWN_USE,performance_basis:"realized_pl",fallback:"least_loss_if_no_eligible_team_has_realized_profit"},alerts,ipos,participants:ordersR.rows,institutional:instR.rows});
}