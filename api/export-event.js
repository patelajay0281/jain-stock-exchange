import { db } from "../lib/hatchable.js";
export const access="admin";
export const methods=["GET"];

const jsonSafe=v=>{
  if(v instanceof Date)return v.toISOString();
  if(typeof v==="bigint")return Number(v);
  return v;
};
const num=v=>Number(v||0);
const round=(v,d=2)=>Math.round((num(v)+Number.EPSILON)*10**d)/10**d;
const key=(team,stock,ipo)=>String(team)+":"+String(stock??"")+"|"+String(ipo??"");

export default async function(req,res){
  const ev=(await db.query("SELECT id,event_name,status,created_at,updated_at FROM event_control WHERE id=1")).rows[0];
  if(!ev)return res.status(404).json({error:"Event control record not found."});
  if(ev.status!=="FINALIZED")return res.status(409).json({error:"The complete final report is available only after FINALIZE EVENT.",status:ev.status});

  const [
    cfgQ,brokersQ,teamsQ,ordersQ,stocksQ,pricesQ,holdingsQ,iposQ,
    investorsQ,instOrdersQ,instHoldingsQ,cashQ,commissionsQ,rejectionsQ,
    auditQ,historyQ,loansQ,reportRunsQ,countersQ
  ]=await Promise.all([
    db.query("SELECT * FROM event_config WHERE id=1"),
    db.query("SELECT id,code,created_at FROM brokers ORDER BY code"),
    db.query("SELECT t.id,t.code team,b.code broker,t.total_cash,t.available_cash,l.original_principal,l.principal_due,l.principal_paid,l.interest_rate,l.interest_due,l.interest_paid,l.status loan_status FROM teams t JOIN brokers b ON b.id=t.broker_id LEFT JOIN participant_loans l ON l.team_id=t.id ORDER BY t.code"),
    db.query(`SELECT o.id,o.order_code,o.team_id,t.code team,b.code broker,
      o.stock_id,o.ipo_id,COALESCE(s.symbol,ip.symbol) symbol,COALESCE(s.name,ip.name) asset,
      CASE WHEN o.stock_id IS NOT NULL THEN 'STOCK' ELSE 'IPO' END asset_type,
      o.side,o.quantity,o.price,o.trade_value,o.brokerage,o.status,o.created_by,o.idempotency_key,o.created_at
      FROM orders o JOIN teams t ON t.id=o.team_id JOIN brokers b ON b.id=t.broker_id
      LEFT JOIN stocks s ON s.id=o.stock_id LEFT JOIN ipo_offerings ip ON ip.id=o.ipo_id
      ORDER BY o.created_at,o.id`),
    db.query("SELECT id,symbol,name,previous_price,price,updated_at FROM stocks ORDER BY symbol"),
    db.query("SELECT ph.id,ph.stock_id,s.symbol,s.name,ph.previous_price,ph.new_price,ph.order_id,ph.changed_at FROM price_history ph JOIN stocks s ON s.id=ph.stock_id ORDER BY ph.changed_at,ph.id"),
    db.query(`SELECT h.id,h.team_id,t.code team,b.code broker,h.stock_id,h.ipo_id,
      COALESCE(s.symbol,ip.symbol) symbol,COALESCE(s.name,ip.name) asset,
      h.quantity,h.average_price,COALESCE(s.price,ip.price) current_price,
      h.quantity*h.average_price invested_value,
      h.quantity*COALESCE(s.price,ip.price) current_value,
      (h.quantity*COALESCE(s.price,ip.price))-(h.quantity*h.average_price) unrealized_pl
      FROM holdings h JOIN teams t ON t.id=h.team_id JOIN brokers b ON b.id=t.broker_id
      LEFT JOIN stocks s ON s.id=h.stock_id LEFT JOIN ipo_offerings ip ON ip.id=h.ipo_id
      WHERE h.quantity<>0 ORDER BY t.code,symbol`),
    db.query("SELECT id,code,name,symbol,price,previous_price,available_quantity,remaining_quantity,status,created_at FROM ipo_offerings ORDER BY code"),
    db.query("SELECT id,code,name,cash,available_cash,created_at FROM institutional_investors ORDER BY code"),
    db.query(`SELECT io.id,io.order_code,io.investor_id,ii.code investor_code,ii.name investor,io.team_id,
      COALESCE(t.code,'') counterparty_team,io.stock_id,io.ipo_id,
      COALESCE(s.symbol,ip.symbol) symbol,COALESCE(s.name,ip.name) asset,
      CASE WHEN io.stock_id IS NOT NULL THEN 'STOCK' ELSE 'IPO' END asset_type,
      io.side,io.quantity,io.price,io.trade_value,io.status,io.created_at
      FROM institutional_orders io JOIN institutional_investors ii ON ii.id=io.investor_id
      LEFT JOIN teams t ON t.id=io.team_id LEFT JOIN stocks s ON s.id=io.stock_id LEFT JOIN ipo_offerings ip ON ip.id=io.ipo_id
      ORDER BY io.created_at,io.id`),
    db.query(`SELECT ih.id,ih.investor_id,ii.code investor_code,ii.name investor,ih.stock_id,ih.ipo_id,
      COALESCE(s.symbol,ip.symbol) symbol,COALESCE(s.name,ip.name) asset,ih.quantity,ih.average_price,
      COALESCE(s.price,ip.price) current_price,ih.quantity*ih.average_price invested_value,
      ih.quantity*COALESCE(s.price,ip.price) current_value
      FROM institutional_holdings ih JOIN institutional_investors ii ON ii.id=ih.investor_id
      LEFT JOIN stocks s ON s.id=ih.stock_id LEFT JOIN ipo_offerings ip ON ip.id=ih.ipo_id
      WHERE ih.quantity<>0 ORDER BY ii.code,symbol`),
    db.query(`SELECT l.id,l.team_id,t.code team,l.order_id,
      o.order_code,l.entry_type,l.debit,l.credit,l.balance_after,l.note,l.created_at
      FROM cash_ledger l JOIN teams t ON t.id=l.team_id LEFT JOIN orders o ON o.id=l.order_id
      ORDER BY l.created_at,l.id`),
    db.query(`SELECT bc.id,bc.order_id,t.code team,b.code broker,o.order_code,bc.commission_rate,
      bc.commission_amount,bc.status,bc.created_at
      FROM broker_commissions bc JOIN teams t ON t.id=bc.team_id JOIN brokers b ON b.id=bc.broker_id
      JOIN orders o ON o.id=bc.order_id ORDER BY bc.created_at,bc.id`),
    db.query(`SELECT sr.id,sr.order_id,o.order_code,t.code team,b.code broker,
      COALESCE(s.symbol,ip.symbol) asset,o.side,o.quantity,o.price,o.trade_value,
      sr.available_cash,sr.required_cash,sr.shortfall,sr.reason,sr.created_at
      FROM settlement_rejections sr JOIN orders o ON o.id=sr.order_id
      JOIN teams t ON t.id=sr.team_id JOIN brokers b ON b.id=sr.broker_id
      LEFT JOIN stocks s ON s.id=o.stock_id LEFT JOIN ipo_offerings ip ON ip.id=o.ipo_id
      ORDER BY sr.created_at,sr.id`),
    db.query(`SELECT a.id,a.actor_id,a.actor_email,a.actor_role,a.action,a.order_id,a.team_id,
      o.order_code,o.side,o.quantity,o.price,o.trade_value,o.brokerage,o.status order_status,
      t.code team,COALESCE(s.symbol,ip.symbol) symbol,COALESCE(s.name,ip.name) asset,
      a.details,a.created_at
      FROM audit_log a
      LEFT JOIN orders o ON o.id=a.order_id LEFT JOIN teams t ON t.id=a.team_id
      LEFT JOIN stocks s ON s.id=o.stock_id LEFT JOIN ipo_offerings ip ON ip.id=o.ipo_id
      ORDER BY a.created_at,a.id`),
    db.query("SELECT * FROM action_history ORDER BY id"),
    db.query("SELECT pl.id,t.code team,pl.original_principal,pl.principal_due,pl.principal_paid,pl.interest_rate,pl.interest_due,pl.interest_paid,pl.status,pl.created_at,pl.updated_at FROM participant_loans pl JOIN teams t ON t.id=pl.team_id ORDER BY t.code"),
    db.query("SELECT id,report_type,created_at FROM report_runs ORDER BY id"),
    db.query("SELECT order_date,last_number FROM daily_order_counters ORDER BY order_date")
  ]);

  const cfg=cfgQ.rows[0]||{};
  const teams=teamsQ.rows.map(x=>({...x}));
  const orders=ordersQ.rows.map(x=>({...x}));
  const holdings=holdingsQ.rows.map(x=>({...x}));
  const audit=auditQ.rows.map(x=>({...x}));
  const cash=cashQ.rows.map(x=>({...x}));
  const commissions=commissionsQ.rows.map(x=>({...x}));
  const rejections=rejectionsQ.rows.map(x=>({...x}));

  // Topper capital-utilization rule:
  // Own allocation = ₹20,00,000. Because ₹20,000 must remain protected,
  // at least ₹19,80,000 of own capital must be deployed at peak.
  // Loan withdrawals are financing and do not count as own-capital utilization.
  const MIN_CASH=20000, STARTING_CAPITAL=2000000, REQUIRED_OWN_USE=STARTING_CAPITAL-MIN_CASH;
  const utilizationByTeam={};
  for(const t of teams){
    utilizationByTeam[t.id]={min_own_cash:STARTING_CAPITAL,peak_own_capital_used:0,capital_utilization_pct:0,loan_drawn:0};
  }
  const ledgerByTeam={};
  for(const row of cash){
    (ledgerByTeam[row.team_id] ||= []).push(row);
  }
  for(const t of teams){
    let loanPrincipal=0, totalCash=STARTING_CAPITAL;
    for(const row of ledgerByTeam[t.id]||[]){
      const type=String(row.entry_type||"");
      const credit=num(row.credit), debit=num(row.debit);
      totalCash += credit-debit;
      if(type==="LOAN_WITHDRAWAL") loanPrincipal+=credit;
      if(type==="LOAN_PRINCIPAL_REPAYMENT") loanPrincipal=Math.max(0,loanPrincipal-debit);
      // Total cash includes financing; remove outstanding loan principal to isolate own capital remaining.
      const ownAvailable=Math.max(0,totalCash-loanPrincipal);
      if(ownAvailable<utilizationByTeam[t.id].min_own_cash)utilizationByTeam[t.id].min_own_cash=ownAvailable;
      utilizationByTeam[t.id].peak_own_capital_used=Math.max(utilizationByTeam[t.id].peak_own_capital_used,STARTING_CAPITAL-ownAvailable);
      utilizationByTeam[t.id].loan_drawn=Math.max(utilizationByTeam[t.id].loan_drawn,loanPrincipal);
    }
    const u=utilizationByTeam[t.id];
    u.capital_utilization_pct=round(Math.min(100,u.peak_own_capital_used*100/STARTING_CAPITAL));
    u.full_capital_rule=u.peak_own_capital_used>=REQUIRED_OWN_USE?"YES":"NO";
  }

  // Reconstruct holding quantity immediately before each participant order.
  const running=new Map();
  const orderTracking=[];
  for(const o of orders){
    const k=key(o.team_id,o.stock_id,o.ipo_id);
    const before=num(running.get(k));
    const shortAttempt=o.side==="SELL"&&num(o.quantity)>before;
    orderTracking.push({
      ...o,
      holding_before:before,
      short_selling_attempt:shortAttempt?"YES":"NO",
      insufficient_balance_attempt:audit.some(a=>Number(a.order_id)===Number(o.id)&&["INSUFFICIENT_BALANCE_SETTLED","INSUFFICIENT_BALANCE_REJECTED"].includes(a.action))?"YES":"NO",
      rejection_stage:String(o.status).includes("REJECTED")?(o.status==="EXCHANGE_REJECTED"?"EXCHANGE":"BANK"):"",
      order_result:o.status==="SETTLED"?"SETTLED":String(o.status).replaceAll("_"," ")
    });
    if(o.status==="SETTLED"){
      const delta=o.side==="BUY"?num(o.quantity):-num(o.quantity);
      running.set(k,before+delta);
    }
  }

  const shortAttempts=orderTracking.filter(x=>x.short_selling_attempt==="YES").map(x=>({
    order_code:x.order_code,team:x.team,broker:x.broker,asset:x.asset,side:x.side,
    requested_quantity:x.quantity,holding_before:x.holding_before,shortfall_quantity:Math.max(0,num(x.quantity)-num(x.holding_before)),
    status:x.status,created_at:x.created_at,
    outcome:x.status==="SETTLED"?"SHORT SALE SETTLED":x.status==="BANK_REJECTED"?"REJECTED BY BANK":x.status==="EXCHANGE_REJECTED"?"REJECTED BY EXCHANGE":x.status==="EXCHANGE_APPROVED"?"APPROVED BY EXCHANGE / PENDING BANK":String(x.status).replaceAll("_"," ")
  }));

  const insufficientAttempts=audit.filter(a=>["INSUFFICIENT_BALANCE_SETTLED","INSUFFICIENT_BALANCE_REJECTED"].includes(a.action)).map(a=>{
    let details={};try{details=JSON.parse(a.details||"{}")}catch(_){}
    return {
      order_code:a.order_code,team:a.team,actor_id:a.actor_id,actor_email:a.actor_email,action:a.action,
      status:a.order_status,side:a.side,quantity:a.quantity,price:a.price,trade_value:a.trade_value,
      required_cash:details.required_cash??details.cash_before??null,
      available_cash:details.available_cash??details.cash_before??null,
      loan_drawn:details.loan_drawn??0,interest_charged:details.interest_charged??0,
      reason:details.reason??details.trigger??"",
      created_at:a.created_at
    };
  });

  const portfolioByTeam={};
  for(const t of teams){
    portfolioByTeam[t.id]={
      team:t.team,broker:t.broker,starting_cash:2000000,final_cash:num(t.available_cash),
      holdings_value:0,invested_value:0,unrealized_pl:0,brokerage_paid:0,
      realized_gross_pl:0,realized_pl:0,loan_principal_due:num(t.principal_due),
      loan_interest_due:num(t.interest_due),loan_principal_paid:num(t.principal_paid),
      loan_interest_paid:num(t.interest_paid),orders:0,settled_orders:0,rejected_orders:0,
      short_attempts:0,short_settled:0,insufficient_balance_attempts:0,insufficient_balance_rejected:0
    };
  }
  for(const h of holdings){
    const t=portfolioByTeam[h.team_id];if(!t)continue;
    t.holdings_value+=num(h.current_value);t.invested_value+=num(h.invested_value);t.unrealized_pl+=num(h.unrealized_pl);
  }
  for(const o of orders){
    const t=portfolioByTeam[o.team_id];if(!t)continue;
    t.orders++;if(o.status==="SETTLED")t.settled_orders++;if(String(o.status).includes("REJECTED"))t.rejected_orders++;
  }
  for(const c of commissions){const t=teams.find(x=>x.team===c.team);if(t&&portfolioByTeam[t.id])portfolioByTeam[t.id].brokerage_paid+=num(c.commission_amount);}
  for(const s of shortAttempts){const t=teams.find(x=>x.team===s.team);if(t&&portfolioByTeam[t.id]){portfolioByTeam[t.id].short_attempts++;if(s.status==="SETTLED")portfolioByTeam[t.id].short_settled++;}}
  for(const a of insufficientAttempts){const t=teams.find(x=>x.team===a.team);if(t&&portfolioByTeam[t.id]){portfolioByTeam[t.id].insufficient_balance_attempts++;if(a.action==="INSUFFICIENT_BALANCE_REJECTED")portfolioByTeam[t.id].insufficient_balance_rejected++;}}

  // Realized P&L uses sequential weighted-average cost basis for each team/asset.
  const costBasis=new Map();
  for(const o of orders.filter(x=>x.status==="SETTLED")){
    const k=key(o.team_id,o.stock_id,o.ipo_id);
    const state=costBasis.get(k)||{qty:0,cost:0};
    if(o.side==="BUY"){
      state.qty+=num(o.quantity);
      state.cost+=num(o.trade_value);
    }else if(o.side==="SELL"){
      const sellQty=num(o.quantity);
      const avgCost=state.qty>0?state.cost/state.qty:0;
      const basis=avgCost*sellQty;
      const gross=num(o.trade_value)-basis;
      const net=gross-num(o.brokerage);
      const t=teams.find(x=>Number(x.id)===Number(o.team_id));
      if(t&&portfolioByTeam[t.id]){portfolioByTeam[t.id].realized_gross_pl+=gross;portfolioByTeam[t.id].realized_pl+=net;}
      state.qty=Math.max(0,state.qty-sellQty);
      state.cost=Math.max(0,state.cost-basis);
    }
    costBasis.set(k,state);
  }

  const participantPerformanceBase=Object.values(portfolioByTeam).map(t=>{
    const liability=t.loan_principal_due+t.loan_interest_due;
    const netWorth=t.final_cash+t.holdings_value-liability;
    const pnl=netWorth-t.starting_cash;
    const returnPct=t.starting_cash?pnl*100/t.starting_cash:0;
    const u=utilizationByTeam[t.team_id]||{peak_own_capital_used:0,capital_utilization_pct:0,full_capital_rule:"NO",loan_drawn:0};
    const loanDrawn=num(t.loan_principal_due)+num(t.loan_principal_paid);
    const loanRepaid= t.loan_principal_due<=0.01 && t.loan_interest_due<=0.01 &&
      (loanDrawn<=0 || (num(t.loan_principal_paid)>=loanDrawn-0.01 && num(t.loan_interest_paid)>0));
    const minCash=t.final_cash>=MIN_CASH;
    const fullCapital=u.full_capital_rule==="YES";
    const noSettledShort=t.short_settled===0;
    const baseEligible=fullCapital&&loanRepaid&&minCash&&noSettledShort;
    return {
      ...t,loan_drawn:round(loanDrawn),peak_own_capital_used:round(u.peak_own_capital_used),
      capital_utilization_pct:round(u.capital_utilization_pct),
      loan_total_due:round(liability),net_worth:round(netWorth),pnl:round(pnl),return_pct:round(returnPct),
      portfolio_value:round(t.holdings_value),total_assets:round(t.final_cash+t.holdings_value),
      rule_min_cash_ok:minCash?"YES":"NO",
      rule_full_capital_used_ok:fullCapital?"YES":"NO",
      rule_loan_repaid_ok:loanRepaid?"YES":"NO",
      rule_short_selling_ok:noSettledShort?"YES":"NO",
      realized_profit_status:t.realized_pl>0?"PROFIT":t.realized_pl<0?"LOSS":"BREAK-EVEN",
      topper_base_eligible:baseEligible?"YES":"NO",
      topper_exclusion_reason:baseEligible?"":(!fullCapital?"Did not use at least ₹19,80,000 of own capital at peak":
        !loanRepaid?"Loan principal and/or interest not fully repaid":
        !minCash?"Final cash below ₹20,000":
        !noSettledShort?"Settled short-selling violation":""),
      rule_status:baseEligible?"COMPLIANT":"REVIEW REQUIRED"
    };
  });
  const positiveEligible=participantPerformanceBase.filter(x=>x.topper_base_eligible==="YES"&&x.realized_pl>0);
  const fallbackEligible=participantPerformanceBase.filter(x=>x.topper_base_eligible==="YES"&&x.realized_pl<0);
  const topperPool=positiveEligible.length?positiveEligible:fallbackEligible;
  const topperSelectionMode=positiveEligible.length?"HIGHEST REALIZED PROFIT":"LEAST LOSS — NO ELIGIBLE TEAM EARNED A REALIZED PROFIT";
  const winner=topperPool.slice().sort((a,b)=>b.realized_pl-a.realized_pl)[0]||null;
  const eligibleSorted=topperPool.slice().sort((a,b)=>b.realized_pl-a.realized_pl);
  const rankMap=new Map(eligibleSorted.map((x,i)=>[x.team,i+1]));
  const participantPerformance=participantPerformanceBase.map(x=>({
    ...x,rank:rankMap.get(x.team)||"",top_performer:winner&&winner.team===x.team?"YES":"NO",
    topper_selection_mode:topperSelectionMode
  })).sort((a,b)=>{
    const ar=a.rank===""?999:Number(a.rank),br=b.rank===""?999:Number(b.rank);
    return ar-br || Number(b.realized_pl)-Number(a.realized_pl);
  });

  const top=winner;
  const brokerPerformance=brokersQ.rows.map(b=>{
    const os=orders.filter(o=>o.broker===b.code);
    const cs=commissions.filter(c=>c.broker===b.code);
    const teamsForBroker=teams.filter(t=>t.broker===b.code);
    return {
      broker:b.code,teams:teamsForBroker.length,
      orders:os.length,settled_orders:os.filter(o=>o.status==="SETTLED").length,
      exchange_rejected:os.filter(o=>o.status==="EXCHANGE_REJECTED").length,
      bank_rejected:os.filter(o=>o.status==="BANK_REJECTED").length,
      rejected_orders:os.filter(o=>String(o.status).includes("REJECTED")).length,
      gross_order_value:round(os.reduce((a,o)=>a+num(o.trade_value),0)),
      settled_turnover:round(os.filter(o=>o.status==="SETTLED").reduce((a,o)=>a+num(o.trade_value),0)),
      brokerage_earned:round(cs.reduce((a,c)=>a+num(c.commission_amount),0))
    };
  });

  const rejectionSummary=[{
    total_orders:orders.length,
    settled:orders.filter(o=>o.status==="SETTLED").length,
    exchange_rejected:orders.filter(o=>o.status==="EXCHANGE_REJECTED").length,
    bank_rejected:orders.filter(o=>o.status==="BANK_REJECTED").length,
    total_rejected:orders.filter(o=>String(o.status).includes("REJECTED")).length,
    settlement_rejection_records:rejections.length,
    short_selling_attempts:shortAttempts.length,
    short_selling_settled:shortAttempts.filter(x=>x.status==="SETTLED").length,
    insufficient_balance_attempts:insufficientAttempts.length,
    insufficient_balance_rejected:insufficientAttempts.filter(x=>x.action==="INSUFFICIENT_BALANCE_REJECTED").length,
    insufficient_balance_settled_via_loan:insufficientAttempts.filter(x=>x.action==="INSUFFICIENT_BALANCE_SETTLED").length
  }];

  const complianceRules=[
    {rule:"Topper — own capital utilization",threshold:"At least ₹19,80,000 of ₹20,00,000",basis:"Peak own capital deployed; ₹20,000 minimum buffer protected",status:participantPerformance.every(x=>x.rule_full_capital_used_ok==="YES")?"PASS":"TEAM-LEVEL REVIEW"},
    {rule:"Topper — full loan repayment",threshold:"₹0 principal due + ₹0 interest due",basis:"Final participant loan balance after finalization",status:participantPerformance.every(x=>x.rule_loan_repaid_ok==="YES")?"PASS":"TEAM-LEVEL REVIEW"},
    {rule:"Topper — minimum final cash",threshold:"At least ₹20,000",basis:"Final available cash after loan repayment",status:participantPerformance.every(x=>x.rule_min_cash_ok==="YES")?"PASS":"TEAM-LEVEL REVIEW"},
    {rule:"Topper — short-selling control",threshold:"No settled short sale",basis:"Persisted orders versus holdings immediately before each order",status:shortAttempts.some(x=>x.status==="SETTLED")?"REVIEW":"PASS"},
    {rule:"Topper — performance",threshold:"Highest realized profit; if nobody eligible has profit, least loss",basis:"Realized P&L after brokerage, among teams satisfying all mandatory topper rules",status:top?"WINNER SELECTED":"NO ELIGIBLE TOPPER"},
    {rule:"Order value limit",threshold:"₹1 to ₹50,00,000",basis:"Persisted orders",status:orders.every(x=>num(x.trade_value)>=num(cfg.min_order_value)&&num(x.trade_value)<=num(cfg.max_order_value))?"PASS":"REVIEW"},
    {rule:"Stock lot rule",threshold:"50 shares per lot",basis:"Persisted stock orders",status:orders.filter(x=>x.asset_type==="STOCK").every(x=>num(x.quantity)%50===0)?"PASS":"REVIEW"},
    {rule:"Price movement rule",threshold:String(cfg.max_price_move_pct||10)+"%",basis:"Persisted stock price updates versus prior price",status:"PASS / PRE-ORDER VALIDATION"}
  ];

  const topTeam=[top?{
    rank:1,team:top.team,broker:top.broker,pnl:top.pnl,realized_pl:top.realized_pl,return_pct:top.return_pct,
    net_worth:top.net_worth,final_cash:top.final_cash,portfolio_value:top.portfolio_value,
    capital_utilization_pct:top.capital_utilization_pct,peak_own_capital_used:top.peak_own_capital_used,
    loan_drawn:top.loan_drawn,loan_principal_paid:top.loan_principal_paid,loan_interest_paid:top.loan_interest_paid,
    settled_orders:top.settled_orders,rejected_orders:top.rejected_orders,
    short_selling_attempts:top.short_attempts,short_selling_settled:top.short_settled,
    insufficient_balance_attempts:top.insufficient_balance_attempts,
    rule_compliance:top.rule_status,topper_selection_mode:top.topper_selection_mode,
    meets_all_topper_rules:top.topper_base_eligible,
    selection_reason:topperSelectionMode
  }:{rank:"",team:"No eligible topper"}];

  const stockPerformance=stocksQ.rows.map(s=>{
    const related=orders.filter(o=>o.symbol===s.symbol&&o.status==="SETTLED");
    const opening=pricesQ.rows.filter(p=>Number(p.stock_id)===Number(s.id)).length?num(pricesQ.rows.filter(p=>Number(p.stock_id)===Number(s.id))[0].previous_price):num(s.previous_price);
    const finalPrice=num(s.price);const change=finalPrice-opening;
    return {symbol:s.symbol,company:s.name,opening_price:opening,final_price:finalPrice,change:round(change),change_pct:round(opening?change*100/opening:0),settled_trades:related.length,settled_volume:related.reduce((a,o)=>a+num(o.quantity),0),settled_turnover:round(related.reduce((a,o)=>a+num(o.trade_value),0))};
  });

  const portfolioDetails=holdings.map(h=>({
    team:h.team,broker:h.broker,symbol:h.symbol,asset:h.asset,quantity:h.quantity,average_price:h.average_price,
    current_price:h.current_price,invested_value:round(h.invested_value),current_value:round(h.current_value),unrealized_pl:round(h.unrealized_pl)
  }));

  const eventSummary=[{
    event_name:ev.event_name,status:ev.status,created_at:jsonSafe(ev.created_at),finalized_at:jsonSafe(ev.updated_at),
    teams:teams.length,brokers:brokersQ.rows.length,stocks:stocksQ.rows.length,ipos:iposQ.rows.length,
    participant_orders:orders.length,settled_orders:orders.filter(o=>o.status==="SETTLED").length,
    rejected_orders:orders.filter(o=>String(o.status).includes("REJECTED")).length,
    total_order_value:round(orders.reduce((a,o)=>a+num(o.trade_value),0)),
    settled_turnover:round(orders.filter(o=>o.status==="SETTLED").reduce((a,o)=>a+num(o.trade_value),0)),
    brokerage_earned:round(commissions.reduce((a,c)=>a+num(c.commission_amount),0)),
    cash_ledger_entries:cash.length,audit_entries:audit.length,action_history_entries:historyQ.rows.length,
    short_selling_attempts:shortAttempts.length,insufficient_balance_attempts:insufficientAttempts.length,
    top_team:top?.team||"",top_team_pnl:top?.pnl||0,top_team_realized_profit:top?.realized_pl||0,
    topper_selection_mode:topperSelectionMode,eligible_topper_count:topperPool.length
  }];

  const eventInfo=[{
    event_name:ev.event_name,status:ev.status,created_at:jsonSafe(ev.created_at),finalized_at:jsonSafe(ev.updated_at),
    brokerage_rate:cfg.brokerage_rate,max_price_move_pct:cfg.max_price_move_pct,
    minimum_order_value:cfg.min_order_value,maximum_order_value:cfg.max_order_value,
    minimum_cash_buffer:20000,participant_loan_limit:500000,
    report_scope:"Finalized JSE event — raw evidence plus derived performance/risk/compliance reports.",
    participant_identity_note:"The current database stores Team code and broker assignment plus actor IDs/emails in audit logs. It does not contain participant names, USNs or contact numbers, so those fields are not invented."
  }];

  const riskOverview=[{
    short_selling_attempts:shortAttempts.length,
    short_selling_rejected:shortAttempts.filter(x=>x.status==="BANK_REJECTED"||x.status==="EXCHANGE_REJECTED").length,
    short_selling_approved_pending_bank:shortAttempts.filter(x=>x.status==="EXCHANGE_APPROVED").length,
    short_selling_settled:shortAttempts.filter(x=>x.status==="SETTLED").length,
    insufficient_balance_attempts:insufficientAttempts.length,
    insufficient_balance_rejected:insufficientAttempts.filter(x=>x.action==="INSUFFICIENT_BALANCE_REJECTED").length,
    insufficient_balance_settled_using_loan:insufficientAttempts.filter(x=>x.action==="INSUFFICIENT_BALANCE_SETTLED").length,
    total_rejected_orders:orders.filter(o=>String(o.status).includes("REJECTED")).length
  }];

  const data={
    "Executive Summary":eventSummary,
    "Event Info":eventInfo,
    "Participant Performance":participantPerformance,
    "Top Performing Team":topTeam,
    "Topper Eligibility":participantPerformance.map(x=>({
      rank:x.rank,team:x.team,broker:x.broker,realized_pl:x.realized_pl,pnl:x.pnl,return_pct:x.return_pct,
      peak_own_capital_used:x.peak_own_capital_used,capital_utilization_pct:x.capital_utilization_pct,
      minimum_cash_rule:x.rule_min_cash_ok,full_capital_rule:x.rule_full_capital_used_ok,
      loan_repaid_rule:x.rule_loan_repaid_ok,short_selling_rule:x.rule_short_selling_ok,
      realized_profit_status:x.realized_profit_status,topper_base_eligible:x.topper_base_eligible,
      top_performer:x.top_performer,selection_mode:x.topper_selection_mode,
      exclusion_reason:x.topper_exclusion_reason
    })),
    "Team Rule Compliance":participantPerformance.map(x=>({
      rank:x.rank,team:x.team,broker:x.broker,pnl:x.pnl,realized_pl:x.realized_pl,return_pct:x.return_pct,
      minimum_cash_rule:x.rule_min_cash_ok,full_capital_rule:x.rule_full_capital_used_ok,
      loan_repaid_rule:x.rule_loan_repaid_ok,short_selling_rule:x.rule_short_selling_ok,
      overall_status:x.rule_status,topper_eligible:x.topper_base_eligible,
      violation_count:[x.rule_min_cash_ok,x.rule_full_capital_used_ok,x.rule_loan_repaid_ok,x.rule_short_selling_ok].filter(v=>v==="NO").length
    })),
    "Rule Definitions":complianceRules,
    "Order Tracking":orderTracking,
    "Rejection Summary":rejectionSummary,
    "Risk Overview":riskOverview,
    "Short Selling Attempts":shortAttempts,
    "Insufficient Balance Attempts":insufficientAttempts,
    "Broker Performance":brokerPerformance,
    "Portfolio Summary":participantPerformance.map(x=>({
      rank:x.rank,team:x.team,broker:x.broker,final_cash:x.final_cash,portfolio_value:x.portfolio_value,
      invested_value:x.invested_value,unrealized_pl:round(x.unrealized_pl),realized_gross_pl:round(x.realized_gross_pl),
      realized_pl:round(x.realized_pl),brokerage_paid:round(x.brokerage_paid),
      peak_own_capital_used:x.peak_own_capital_used,capital_utilization_pct:x.capital_utilization_pct,
      loan_drawn:round(x.loan_drawn),loan_principal_due:round(x.loan_principal_due),loan_interest_due:round(x.loan_interest_due),
      loan_principal_paid:round(x.loan_principal_paid),loan_interest_paid:round(x.loan_interest_paid),
      topper_eligible:x.topper_base_eligible,top_performer:x.top_performer,
      net_worth:x.net_worth,pnl:x.pnl,return_pct:x.return_pct
    })),
    "Portfolio Holdings":portfolioDetails,
    "Cash Ledger":cash,
    "Audit Log":audit,
    "Action History":historyQ.rows,
    "Broker Commissions":commissions,
    "Settlement Rejections":rejections,
    "Participant Loans":loansQ.rows,
    "Market Performance":stockPerformance,
    "Price History":pricesQ.rows,
    "IPOs":iposQ.rows,
    "Institutional Investors":investorsQ.rows,
    "Institutional Orders":instOrdersQ.rows,
    "Institutional Holdings":instHoldingsQ.rows,
    "Brokers":brokersQ.rows,
    "Orders Raw":orders,
    "Holdings Raw":holdings,
    "Teams Raw":teams,
    "Report Runs":reportRunsQ.rows,
    "Daily Order Counters":countersQ.rows
  };

  const rawTables=(await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' AND table_name NOT LIKE '__hatchable_%' ORDER BY table_name")).rows.map(x=>x.table_name);
  const raw={};
  const manifest=[];
  for(const table of rawTables){
    const cols=(await db.query("SELECT column_name,data_type,is_nullable FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position",[table])).rows;
    const rows=(await db.query('SELECT * FROM "'+String(table).replaceAll('"','""')+'"')).rows.map(row=>{
      const out={};for(const [k,v] of Object.entries(row))out[k]=jsonSafe(v);return out;
    });
    raw[table]=rows;
    manifest.push({table,row_count:rows.length,columns:cols});
  }

  // Keep the raw database tables as a separate evidence section as well.
  for(const [table,rows] of Object.entries(raw))data["RAW — "+table]=rows;

  const generatedAt=new Date().toISOString();
  const snapshot={archive_format:"JAIN-STOCK-EXCHANGE-EVENT-ARCHIVE",archive_version:2,generated_at:generatedAt,
    event:{id:ev.id,name:ev.event_name,status:ev.status,created_at:jsonSafe(ev.created_at),updated_at:jsonSafe(ev.updated_at)},
    event_config:cfg,manifest,data};
  const canonical=JSON.stringify(snapshot);
  const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(canonical));
  const sha256=Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,"0")).join("");
  const archive={...snapshot,integrity:{algorithm:"SHA-256",canonical_snapshot_sha256:sha256,verification:"Remove the integrity object, serialize the remaining JSON without formatting changes, SHA-256 the UTF-8 bytes, and compare with canonical_snapshot_sha256."}};
  res.setHeader("Content-Type","application/json; charset=utf-8");
  res.setHeader("Content-Disposition",'attachment; filename="jain-stock-exchange-final-event-report-'+generatedAt.slice(0,10)+'.json"');
  res.send(JSON.stringify(archive));
}