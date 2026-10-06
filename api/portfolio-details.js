import { db } from "../lib/hatchable.js";
export const access="member";
export const methods=["GET"];
export default async function(req,res){
 const [teamsQ,stockQ,ipoQ,brokerageQ,soldQ,attemptsQ,buyQ,cashQ]=await Promise.all([
  db.query("SELECT t.id,t.code team,b.code broker,t.total_cash,t.available_cash,l.original_principal,l.principal_due,l.principal_paid,l.interest_due,l.interest_paid,l.interest_rate,l.status loan_status FROM teams t JOIN brokers b ON b.id=t.broker_id JOIN participant_loans l ON l.team_id=t.id ORDER BY t.code"),
  db.query("SELECT h.team_id,t.code team,b.code broker,s.name stock,h.quantity,h.average_price,s.price current_price,h.quantity*h.average_price invested_value,h.quantity*s.price current_value,(h.quantity*s.price)-(h.quantity*h.average_price) unrealized_pl FROM holdings h JOIN teams t ON t.id=h.team_id JOIN brokers b ON b.id=t.broker_id JOIN stocks s ON s.id=h.stock_id WHERE h.quantity>0 ORDER BY t.code,s.name"),
  db.query("SELECT h.team_id,t.code team,b.code broker,ip.name stock,h.quantity,h.average_price,ip.price current_price,h.quantity*h.average_price invested_value,h.quantity*ip.price current_value,(h.quantity*ip.price)-(h.quantity*h.average_price) unrealized_pl FROM holdings h JOIN teams t ON t.id=h.team_id JOIN brokers b ON b.id=t.broker_id JOIN ipo_offerings ip ON ip.id=h.ipo_id WHERE h.quantity>0 ORDER BY t.code,ip.name"),
  db.query("SELECT team_id,COALESCE(SUM(commission_amount),0) brokerage_paid FROM broker_commissions WHERE status='SETTLED' GROUP BY team_id"),
  db.query("SELECT o.team_id,t.code team,b.code broker,COALESCE(s.name,ip.name) stock,COALESCE(o.stock_id,-o.ipo_id) asset_key,SUM(o.quantity) quantity,ROUND(SUM(o.trade_value)/NULLIF(SUM(o.quantity),0),2) average_sale_price,SUM(o.trade_value) gross_proceeds,SUM(o.brokerage) brokerage,SUM(o.trade_value-o.brokerage) net_proceeds,MAX(o.created_at) last_sold_at FROM orders o JOIN teams t ON t.id=o.team_id JOIN brokers b ON b.id=t.broker_id LEFT JOIN stocks s ON s.id=o.stock_id LEFT JOIN ipo_offerings ip ON ip.id=o.ipo_id WHERE o.status='SETTLED' AND o.side='SELL' GROUP BY o.team_id,t.code,b.code,COALESCE(s.name,ip.name),COALESCE(o.stock_id,-o.ipo_id) ORDER BY t.code,stock"),
  db.query("SELECT o.id,o.team_id,t.code team,COALESCE(s.name,ip.name) asset,o.side,o.quantity,o.price,o.trade_value,o.brokerage,o.status,o.order_code,o.created_at FROM orders o JOIN teams t ON t.id=o.team_id LEFT JOIN stocks s ON s.id=o.stock_id LEFT JOIN ipo_offerings ip ON ip.id=o.ipo_id ORDER BY o.created_at DESC"),
  db.query("SELECT team_id,COALESCE(stock_id,-ipo_id) asset_key,SUM(quantity) quantity,ROUND(SUM(trade_value)/NULLIF(SUM(quantity),0),2) average_buy_price FROM orders WHERE status='SETTLED' AND side='BUY' GROUP BY team_id,COALESCE(stock_id,-ipo_id)"),
  db.query("SELECT team_id,entry_type,debit,credit,balance_after,created_at,id FROM cash_ledger ORDER BY created_at,id")
 ]);
 const holdings=[...stockQ.rows,...ipoQ.rows].sort((a,b)=>String(a.team).localeCompare(String(b.team))||String(a.stock).localeCompare(String(b.stock)));
 const sold=soldQ.rows;
 const buys=new Map(buyQ.rows.map(x=>[String(x.team_id)+":"+String(x.asset_key),x]));
 const byTeam={};
 for(const r of teamsQ.rows){byTeam[r.id]={...r,base_money_left:Math.min(2000000,Math.max(0,Number(r.available_cash||0))),loan_money_left:Math.max(0,Number(r.original_principal||0)-Number(r.principal_due||0)),loan_withdrawn:Number(r.principal_due||0),holdings_value:0,invested_value:0,unrealized_pl:0,realized_pl:0,realized_gross_pl:0,brokerage_paid:0}}
 for(const r of holdings){const t=byTeam[r.team_id];if(t){t.invested_value+=Number(r.invested_value||0);t.holdings_value+=Number(r.current_value||0);t.unrealized_pl+=Number(r.unrealized_pl||0)}}
 for(const r of brokerageQ.rows){if(byTeam[r.team_id])byTeam[r.team_id].brokerage_paid=Number(r.brokerage_paid||0)}
 for(const r of sold){
  const t=byTeam[r.team_id];if(!t)continue;
  const buy=buys.get(String(r.team_id)+":"+String(r.asset_key));
  const cost=Number(buy?.average_buy_price||0)*Number(r.quantity||0);
  const gross=Number(r.gross_proceeds||0)-cost;
  const net=gross-Number(r.brokerage||0);
  r.cost_basis=cost;r.realized_gross_pl=gross;r.realized_pl=net;
  t.realized_gross_pl+=gross;t.realized_pl+=net;
 }
 const MIN_CASH=20000,STARTING_CAPITAL=2000000,REQUIRED_OWN_USE=1980000;
 const ledgerByTeam={};
 for(const row of cashQ.rows)(ledgerByTeam[row.team_id] ||= []).push(row);
 const runningQty=new Map(),shortAttemptCount={},shortSettledTeams=new Set();
 const orderedAttempts=[...attemptsQ.rows].sort((a,b)=>new Date(a.created_at)-new Date(b.created_at)||Number(a.id)-Number(b.id));
 for(const o of orderedAttempts){
   const k=String(o.team_id)+":"+String(o.asset||"");
   const before=Number(runningQty.get(k)||0);
   if(o.side==="SELL"&&Number(o.quantity||0)>before){
     shortAttemptCount[o.team_id]=(shortAttemptCount[o.team_id]||0)+1;
     if(o.status==="SETTLED")shortSettledTeams.add(Number(o.team_id));
   }
   if(o.status==="SETTLED")runningQty.set(k,before+(o.side==="BUY"?Number(o.quantity||0):-Number(o.quantity||0)));
 }
 for(const t of Object.values(byTeam)){
   let totalCash=STARTING_CAPITAL,loanPrincipal=0,minOwn=STARTING_CAPITAL;
   for(const row of ledgerByTeam[t.id]||[]){
     const type=String(row.entry_type||"");
     totalCash+=Number(row.credit||0)-Number(row.debit||0);
     if(type==="LOAN_WITHDRAWAL")loanPrincipal+=Number(row.credit||0);
     if(type==="LOAN_PRINCIPAL_REPAYMENT")loanPrincipal=Math.max(0,loanPrincipal-Number(row.debit||0));
     minOwn=Math.min(minOwn,Math.max(0,totalCash-loanPrincipal));
   }
   t.peak_own_capital_used=Math.max(0,STARTING_CAPITAL-minOwn);
   t.capital_utilization_pct=Math.min(100,t.peak_own_capital_used*100/STARTING_CAPITAL);
   t.full_capital_rule=t.peak_own_capital_used>=REQUIRED_OWN_USE?"YES":"NO";
   t.loan_drawn=Number(t.principal_paid||0)+Number(t.principal_due||0);
   t.loan_repaid_rule=Number(t.principal_due||0)<=0.01&&Number(t.interest_due||0)<=0.01;
   t.minimum_cash_rule=Number(t.available_cash||0)>=MIN_CASH?"YES":"NO";
   t.short_attempts=Number(shortAttemptCount[t.id]||0);
   t.short_settled=shortSettledTeams.has(Number(t.id))?1:0;
   t.short_selling_rule=t.short_settled===0?"YES":"NO";
 }
 const teams=Object.values(byTeam).map(t=>{const portfolio_value=Number(t.holdings_value||0),pnl=Number(t.unrealized_pl||0)+Number(t.realized_pl||0),invested=Number(t.invested_value||0),return_pct=invested>0?pnl*100/invested:0;
   const topperEligible=t.full_capital_rule==="YES"&&t.loan_repaid_rule&&t.minimum_cash_rule==="YES"&&t.short_selling_rule==="YES";
   return {...t,portfolio_value,current_value:portfolio_value,pnl,return_pct,topper_eligible:topperEligible?"YES":"NO",realized_profit_status:Number(t.realized_pl)>0?"PROFIT":Number(t.realized_pl)<0?"LOSS":"BREAK-EVEN"};
 });
 const positiveEligible=teams.filter(t=>t.topper_eligible==="YES"&&Number(t.realized_pl)>0);
 const fallbackEligible=teams.filter(t=>t.topper_eligible==="YES"&&Number(t.realized_pl)<0);
 const topperPool=positiveEligible.length?positiveEligible:fallbackEligible;
 const topperSelectionMode=positiveEligible.length?"HIGHEST REALIZED PROFIT":"LEAST LOSS — NO ELIGIBLE TEAM EARNED A REALIZED PROFIT";
 const topper=[...topperPool].sort((a,b)=>Number(b.realized_pl)-Number(a.realized_pl))[0]||null;
 const rankMap=new Map([...topperPool].sort((a,b)=>Number(b.realized_pl)-Number(a.realized_pl)).map((x,i)=>[x.team,i+1]));
 for(const t of teams){t.topper_rank=rankMap.get(t.team)||"";t.top_performer=topper&&topper.team===t.team?"YES":"NO";t.topper_selection_mode=topperSelectionMode;}
 const ranked=[...teams].sort((a,b)=>Number(b.realized_pl)-Number(a.realized_pl));
 const attempts=attemptsQ.rows.map(x=>({...x,attempt_result:x.status==='SETTLED'?'SETTLED':x.status==='EXCHANGE_REJECTED'?'REJECTED BY EXCHANGE':x.status==='BANK_REJECTED'?'REJECTED BY BANK':x.status.replaceAll('_',' ')}));
 res.json({holdings,sold_holdings:sold,attempts,teams,top_gainers:ranked.slice(0,10),top_losers:ranked.slice(-10).reverse(),topper,topper_selection_mode:topperSelectionMode,topper_rule:{starting_capital:STARTING_CAPITAL,minimum_cash:MIN_CASH,required_own_capital_use:REQUIRED_OWN_USE,performance_basis:"realized_pl",fallback:"least_loss_if_no_eligible_team_has_realized_profit"}});
}