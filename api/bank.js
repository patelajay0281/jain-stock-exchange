import { db } from "../lib/hatchable.js";
export const access="member"; export const methods=["GET","POST"]; const MIN=20000;
export default async function(req,res){
 if(req.method==="GET"){
  const regular=(await db.query("SELECT o.id,o.order_code,t.code team,b.code broker,COALESCE(s.name,ip.name) stock,o.side,o.quantity,o.price,o.trade_value,o.brokerage,t.available_cash,COALESCE((SELECT SUM(h.quantity) FROM holdings h WHERE h.team_id=o.team_id AND h.stock_id IS NOT DISTINCT FROM o.stock_id AND h.ipo_id IS NOT DISTINCT FROM o.ipo_id),0) holding_qty,COALESCE(pl.original_principal,500000) loan_limit,COALESCE(pl.principal_due,0) loan_drawn FROM orders o JOIN teams t ON t.id=o.team_id JOIN brokers b ON b.id=t.broker_id LEFT JOIN stocks s ON s.id=o.stock_id LEFT JOIN ipo_offerings ip ON ip.id=o.ipo_id LEFT JOIN participant_loans pl ON pl.team_id=o.team_id WHERE o.status='EXCHANGE_APPROVED' ORDER BY o.created_at LIMIT 100")).rows.map(x=>{const required=Number(x.trade_value)+Number(x.brokerage);const loanAvailable=Math.max(0,Number(x.loan_limit||500000)-Number(x.loan_drawn||0));const no_balance=x.side==='BUY' && Number(x.available_cash||0)+loanAvailable-required<MIN;const short_selling=x.side==='SELL' && Number(x.holding_qty||0)<Number(x.quantity||0);return {...x,kind:"PARTICIPANT",required_cash:required,minimum_balance:MIN,no_balance,short_selling,available_financing:Number(x.available_cash||0)+loanAvailable};});
  const institutional=(await db.query("SELECT io.id,io.order_code,COALESCE(t.code,'—') team,ii.name investor,'INSTITUTIONAL' broker,COALESCE(s.name,ip.name) stock,io.side,io.quantity,io.price,io.trade_value,ii.available_cash FROM institutional_orders io JOIN institutional_investors ii ON ii.id=io.investor_id LEFT JOIN teams t ON t.id=io.team_id LEFT JOIN stocks s ON s.id=io.stock_id LEFT JOIN ipo_offerings ip ON ip.id=io.ipo_id WHERE io.status='EXCHANGE_APPROVED' ORDER BY io.created_at LIMIT 100")).rows.map(x=>({...x,kind:"INSTITUTIONAL",required_cash:Number(x.trade_value),minimum_balance:0,unlimited:true}));
  const interestRow=(await db.query("SELECT COALESCE(SUM(COALESCE(interest_paid,0)+COALESCE(interest_due,0)),0) AS interest_earned FROM participant_loans")).rows[0];
  const interest_earned=Number(interestRow?.interest_earned||0);
  return res.json({transactions:[...regular,...institutional],interest_earned});
 }
 const id=Number(req.body?.order_id),action=String(req.body?.action||""),kind=String(req.body?.kind||"PARTICIPANT");
 if(!Number.isInteger(id)||!["APPROVE","REJECT"].includes(action))return res.status(400).json({error:"Invalid settlement action"});
 if(kind==="INSTITUTIONAL"){
  const o=(await db.query("SELECT io.*,ii.id investor_id FROM institutional_orders io JOIN institutional_investors ii ON ii.id=io.investor_id WHERE io.id=$1",[id])).rows[0];
  if(!o||o.status!=="EXCHANGE_APPROVED")return res.status(409).json({error:"Institutional order is no longer awaiting bank settlement"});
  if(action==="REJECT"){await db.query("UPDATE institutional_orders SET status='BANK_REJECTED' WHERE id=$1",[id]);await db.query("INSERT INTO audit_log(actor_id,actor_email,actor_role,action,order_id,team_id,details) VALUES($1,$2,'bank','BANK_REJECTED',$3,$4,$5)",[req.member?.id||"bank",req.member?.email||null,id,o.team_id,JSON.stringify({kind:"INSTITUTIONAL",reason:"BANK_REJECTED_BY_OPERATOR"})]);return res.json({status:"BANK_REJECTED"})}
  const h=(await db.query("SELECT quantity,average_price FROM institutional_holdings WHERE investor_id=$1 AND stock_id IS NOT DISTINCT FROM $2 AND ipo_id IS NOT DISTINCT FROM $3 FOR UPDATE",[o.investor_id,o.stock_id,o.ipo_id])).rows[0];
  const investor=(await db.query("SELECT id,available_cash FROM institutional_investors WHERE id=$1 FOR UPDATE",[o.investor_id])).rows[0];
  const team=(await db.query("SELECT id,code,available_cash FROM teams WHERE id=$1 FOR UPDATE",[o.team_id])).rows[0];
  if(!team)return res.status(409).json({error:"Institutional order has no valid participant counterparty"});
  const ph=(await db.query("SELECT quantity,average_price FROM holdings WHERE team_id=$1 AND stock_id IS NOT DISTINCT FROM $2 AND ipo_id IS NOT DISTINCT FROM $3",[o.team_id,o.stock_id,o.ipo_id])).rows[0];
  const current=Number(h?.quantity||0),avg=Number(h?.average_price||o.price),teamQty=Number(ph?.quantity||0),teamAvg=Number(ph?.average_price||o.price),tradeQty=Number(o.quantity),tradePrice=Number(o.price),tradeValue=Number(o.trade_value);
  if(o.side==="BUY"){
   if(Number(investor?.available_cash||0)<tradeValue){
    await db.query("UPDATE institutional_orders SET status='BANK_REJECTED' WHERE id=$1",[id]);
    return res.json({status:"BANK_REJECTED",reason:"INSTITUTIONAL_INSUFFICIENT_AVAILABLE_FUNDS",available_cash:Number(investor?.available_cash||0),required_cash:tradeValue});
   }
   if(teamQty<tradeQty){
    await db.query("UPDATE institutional_orders SET status='BANK_REJECTED' WHERE id=$1",[id]);
    return res.json({status:"BANK_REJECTED",reason:"COUNTERPARTY_INSUFFICIENT_HOLDINGS",available_quantity:teamQty,requested_quantity:tradeQty});
   }
   const remaining=current+tradeQty;
   let newAvg=tradePrice;
   if(current>0)newAvg=((current*avg)+(tradeQty*tradePrice))/remaining;
   else if(current<0 && remaining<0)newAvg=((Math.abs(current)*avg)+(tradeQty*tradePrice))/Math.abs(remaining);
   else if(current<0 && remaining>0)newAvg=tradePrice;
   const teamRemaining=teamQty-tradeQty;
   const stmts=[
    {sql:"UPDATE institutional_investors SET available_cash=available_cash-$1 WHERE id=$2",params:[tradeValue,o.investor_id]},
    {sql:"UPDATE teams SET available_cash=available_cash+$1 WHERE id=$2",params:[tradeValue,o.team_id]},
    {sql:"UPDATE holdings SET quantity=$1 WHERE team_id=$2 AND stock_id IS NOT DISTINCT FROM $3 AND ipo_id IS NOT DISTINCT FROM $4",params:[teamRemaining,o.team_id,o.stock_id,o.ipo_id]},
    h?{sql:"UPDATE institutional_holdings SET quantity=$1,average_price=$2 WHERE investor_id=$3 AND stock_id IS NOT DISTINCT FROM $4 AND ipo_id IS NOT DISTINCT FROM $5",params:[remaining,newAvg,o.investor_id,o.stock_id,o.ipo_id]}:{sql:"INSERT INTO institutional_holdings(investor_id,stock_id,ipo_id,quantity,average_price) VALUES($1,$2,$3,$4,$5)",params:[o.investor_id,o.stock_id,o.ipo_id,remaining,newAvg]},
    {sql:"UPDATE institutional_orders SET status='SETTLED' WHERE id=$1",params:[id]},
    {sql:"INSERT INTO audit_log(actor_id,actor_email,actor_role,action,order_id,team_id,details) VALUES($1,$2,'bank','BANK_SETTLED',$3,$4,$5)",params:[req.member?.id||"bank",req.member?.email||null,id,o.team_id,JSON.stringify({kind:"INSTITUTIONAL",trade_value:tradeValue})]},
    {sql:"INSERT INTO audit_log(actor_id,actor_role,action,team_id,details) VALUES($1,'system','INSTITUTIONAL_COUNTERPARTY_SETTLEMENT',$2,$3)",params:["system",o.team_id,JSON.stringify({order_id:id,order_code:o.order_code,side:o.side,quantity:tradeQty,trade_value:tradeValue,counterparty:o.team_id})]}
   ];
   if(o.ipo_id)stmts.push({sql:"UPDATE ipo_offerings SET remaining_quantity=remaining_quantity+$1 WHERE id=$2",params:[tradeQty,o.ipo_id]});
   await db.transaction(stmts);
  }else{
   if(Number(h?.quantity||0)<tradeQty){
    await db.query("UPDATE institutional_orders SET status='BANK_REJECTED' WHERE id=$1",[id]);
    return res.json({status:"BANK_REJECTED",reason:"INSTITUTIONAL_INSUFFICIENT_HOLDINGS",available_quantity:Number(h?.quantity||0),requested_quantity:tradeQty});
   }
   const cash=Number(team.available_cash);
   const loan=(await db.query("SELECT original_principal,principal_due,interest_rate,interest_due,status FROM participant_loans WHERE team_id=$1 FOR UPDATE",[o.team_id])).rows[0];
   const currentPrincipal=Number(loan?.principal_due||0);
   const loanLimit=Number(loan?.original_principal||500000);
   const remainingLoan=Math.max(0,loanLimit-currentPrincipal);
   const needsAutoLoan=cash-tradeValue<MIN;
   if(needsAutoLoan && (remainingLoan<=0 || cash+remainingLoan-tradeValue<MIN)){
    await db.query("UPDATE institutional_orders SET status='BANK_REJECTED' WHERE id=$1",[id]);
    return res.json({status:"BANK_REJECTED",reason:"COUNTERPARTY_INSUFFICIENT_AVAILABLE_FUNDS_MINIMUM_BALANCE"});
   }
   const autoDraw=needsAutoLoan?Math.min(remainingLoan,Math.max(0,tradeValue+MIN-cash)):0;
   const autoInterest=autoDraw*Number(loan?.interest_rate||0.02);
   const newCash=cash+autoDraw-tradeValue;
   const newPrincipal=currentPrincipal+autoDraw;
   const newInterest=Number(loan?.interest_due||0)+autoInterest;
   const remaining=current-tradeQty;
   let newAvg=tradePrice;
   if(current>0 && remaining>=0)newAvg=avg;
   else if(current>0 && remaining<0)newAvg=tradePrice;
   else if(current<0 && remaining<0)newAvg=((Math.abs(current)*avg)+(tradeQty*tradePrice))/Math.abs(remaining);
   const stmts=[
    {sql:"UPDATE institutional_investors SET available_cash=available_cash+$1 WHERE id=$2",params:[tradeValue,o.investor_id]},
    {sql:"UPDATE teams SET available_cash=$1 WHERE id=$2 AND available_cash=$3",params:[newCash,o.team_id,team.available_cash]},
    {sql:"WITH ins AS (INSERT INTO holdings(team_id,stock_id,ipo_id,quantity,average_price) VALUES($1,$2,$3,$4::integer,$5::numeric) ON CONFLICT DO NOTHING RETURNING id) UPDATE holdings h SET average_price=CASE WHEN h.quantity+$4::integer=0 THEN 0::numeric ELSE ((h.quantity::numeric*h.average_price)+($4::numeric*$5::numeric))/(h.quantity+$4::integer) END,quantity=h.quantity+$4::integer WHERE h.team_id=$1 AND h.stock_id IS NOT DISTINCT FROM $2 AND h.ipo_id IS NOT DISTINCT FROM $3 AND NOT EXISTS (SELECT 1 FROM ins)",params:[o.team_id,o.stock_id,o.ipo_id,tradeQty,tradePrice]},
    h?{sql:"UPDATE institutional_holdings SET quantity=$1,average_price=$2 WHERE investor_id=$3 AND stock_id IS NOT DISTINCT FROM $4 AND ipo_id IS NOT DISTINCT FROM $5",params:[remaining,newAvg,o.investor_id,o.stock_id,o.ipo_id]}:{sql:"INSERT INTO institutional_holdings(investor_id,stock_id,ipo_id,quantity,average_price) VALUES($1,$2,$3,$4,$5)",params:[o.investor_id,o.stock_id,o.ipo_id,remaining,newAvg]},
    {sql:"UPDATE institutional_orders SET status='SETTLED' WHERE id=$1",params:[id]},
    {sql:"INSERT INTO audit_log(actor_id,actor_email,actor_role,action,order_id,team_id,details) VALUES($1,$2,'bank','BANK_SETTLED',$3,$4,$5)",params:[req.member?.id||"bank",req.member?.email||null,id,o.team_id,JSON.stringify({kind:"INSTITUTIONAL",trade_value:tradeValue})]},
    {sql:"INSERT INTO cash_ledger(team_id,order_id,entry_type,debit,balance_after,note) VALUES($1,$2,'INSTITUTIONAL_BUY',0+$3,$4,'Institutional investor sold to participant counterparty')",params:[o.team_id,id,tradeValue,newCash]},
    {sql:"INSERT INTO audit_log(actor_id,actor_role,action,team_id,details) VALUES($1,'system','INSTITUTIONAL_COUNTERPARTY_SETTLEMENT',$2,$3)",params:["system",o.team_id,JSON.stringify({order_id:id,order_code:o.order_code,side:o.side,quantity:tradeQty,trade_value:tradeValue,counterparty:o.team_id,auto_loan:autoDraw,interest_charged:autoInterest})]}
   ];
   if(autoDraw>0)stmts.splice(2,0,
    {sql:"UPDATE participant_loans SET principal_due=principal_due+$1,interest_due=interest_due+$2,status='OUTSTANDING',updated_at=now() WHERE team_id=$3 AND principal_due=$4 AND interest_due=$5",params:[autoDraw,autoInterest,o.team_id,currentPrincipal,Number(loan?.interest_due||0)]},
    {sql:"INSERT INTO cash_ledger(team_id,entry_type,credit,balance_after,note) VALUES($1,'LOAN_WITHDRAWAL',$2,$3,'Automatic participant loan activation for institutional counterparty purchase')",params:[o.team_id,autoDraw,newCash+tradeValue]}
   );
   if(o.ipo_id)stmts.push({sql:"UPDATE ipo_offerings SET remaining_quantity=GREATEST(0,remaining_quantity-$1) WHERE id=$2",params:[tradeQty,o.ipo_id]});
   await db.transaction(stmts);
  }
  return res.json({status:"SETTLED",counterparty_team:o.team_id});
 }
 const o=(await db.query("SELECT o.*,t.code team,t.available_cash,t.broker_id,COALESCE(h.quantity,0) holding_qty,pl.original_principal,pl.principal_due,pl.interest_rate,pl.interest_due,pl.status loan_status FROM orders o JOIN teams t ON t.id=o.team_id LEFT JOIN holdings h ON h.team_id=o.team_id AND h.stock_id IS NOT DISTINCT FROM o.stock_id AND h.ipo_id IS NOT DISTINCT FROM o.ipo_id LEFT JOIN participant_loans pl ON pl.team_id=o.team_id WHERE o.id=$1",[id])).rows[0];
 if(!o||o.status!=="EXCHANGE_APPROVED")return res.status(409).json({error:"Order is no longer awaiting bank settlement"});
 if(action==="REJECT"){await db.query("UPDATE orders SET status='BANK_REJECTED' WHERE id=$1",[id]);await db.query("INSERT INTO audit_log(actor_id,actor_email,actor_role,action,order_id,team_id,details) VALUES($1,$2,'bank','BANK_REJECTED',$3,$4,$5)",[req.member?.id||"bank",req.member?.email||null,id,o.team_id,JSON.stringify({kind:"PARTICIPANT",reason:"BANK_REJECTED_BY_OPERATOR"})]);return res.json({status:"BANK_REJECTED"})}
 if(o.side==="BUY"){
  const reqd=Number(o.trade_value)+Number(o.brokerage);
  const cash=Number(o.available_cash);
  const currentPrincipal=Number(o.principal_due||0);
  const loanLimit=Number(o.original_principal||500000);
  const remainingLoan=Math.max(0,loanLimit-currentPrincipal);
  const wouldLeave=cash-reqd;
  const needsAutoLoan=wouldLeave<MIN;
  if(needsAutoLoan){
   if(remainingLoan<=0 || cash+remainingLoan-reqd<MIN){
    await db.query("UPDATE orders SET status='BANK_REJECTED' WHERE id=$1",[id]);
    await db.query("INSERT INTO audit_log(actor_id,actor_email,actor_role,action,order_id,team_id,details) VALUES($1,$2,'bank','INSUFFICIENT_BALANCE_REJECTED',$3,$4,$5)",[req.member?.id||"bank",req.member?.email||null,id,o.team_id,JSON.stringify({risk:"INSUFFICIENT_BALANCE",required_cash:reqd,available_cash:cash,loan_available:remainingLoan,reason:"MINIMUM_CASH_BUFFER"})]);
    return res.json({status:"BANK_REJECTED",reason:"INSUFFICIENT_AVAILABLE_FUNDS_MINIMUM_BALANCE"});
   }
  }
  const autoDraw=needsAutoLoan?Math.min(remainingLoan,Math.max(0,reqd+MIN-cash)):0;
  const autoInterest=autoDraw*Number(o.interest_rate||0.02);
  const newBal=cash+autoDraw-reqd;
  const newPrincipal=currentPrincipal+autoDraw;
  const newInterest=Number(o.interest_due||0)+autoInterest;
  const loanStatus=autoDraw>0?"OUTSTANDING":String(o.loan_status||"AVAILABLE");
  const stmts=[
   {sql:"UPDATE teams SET available_cash=$1 WHERE id=$2 AND available_cash=$3",params:[newBal,o.team_id,o.available_cash]},
   {sql:"INSERT INTO cash_ledger(team_id,order_id,entry_type,debit,balance_after,note) VALUES($1,$2,'BUY_SETTLEMENT',$3,$4,'Participant BUY settlement including brokerage')",params:[o.team_id,id,reqd,newBal]},
   {sql:"INSERT INTO broker_commissions(order_id,broker_id,team_id,commission_rate,commission_amount,status) VALUES($1,$2,$3,0.005,$4,'SETTLED')",params:[id,o.broker_id,o.team_id,o.brokerage]},
   {sql:"WITH ins AS (INSERT INTO holdings(team_id,stock_id,ipo_id,quantity,average_price) VALUES($1,$2,$3,$4::integer,$5::numeric) ON CONFLICT DO NOTHING RETURNING id) UPDATE holdings h SET average_price=((h.quantity::numeric*h.average_price)+($4::numeric*$5::numeric))/(h.quantity+$4::integer),quantity=h.quantity+$4::integer WHERE h.team_id=$1 AND h.stock_id IS NOT DISTINCT FROM $2 AND h.ipo_id IS NOT DISTINCT FROM $3 AND NOT EXISTS (SELECT 1 FROM ins)",params:[o.team_id,o.stock_id,o.ipo_id,o.quantity,o.price]},
   {sql:"UPDATE orders SET status='SETTLED' WHERE id=$1",params:[id]},
   {sql:"INSERT INTO audit_log(actor_id,actor_email,actor_role,action,order_id,team_id,details) VALUES($1,$2,'bank','BANK_SETTLED',$3,$4,$5)",params:[req.member?.id||"bank",req.member?.email||null,id,o.team_id,JSON.stringify({kind:"PARTICIPANT",side:o.side,trade_value:Number(o.trade_value),brokerage:Number(o.brokerage)})]}
  ];
  if(o.ipo_id)stmts.push({sql:"UPDATE ipo_offerings SET remaining_quantity=GREATEST(0,remaining_quantity-$1) WHERE id=$2",params:[o.quantity,o.ipo_id]});
  if(autoDraw>0){
   stmts.splice(1,0,
    {sql:"UPDATE participant_loans SET principal_due=principal_due+$1,interest_due=interest_due+$2,status=$3,updated_at=now() WHERE team_id=$4 AND principal_due=$5 AND interest_due=$6",params:[autoDraw,autoInterest,loanStatus,o.team_id,o.principal_due,o.interest_due]},
    {sql:"INSERT INTO cash_ledger(team_id,entry_type,credit,balance_after,note) VALUES($1,'LOAN_WITHDRAWAL',$2,$3,'Automatic participant loan activation after order reached the ₹20,000 cash buffer')",params:[o.team_id,autoDraw,newBal+reqd]},
    {sql:"INSERT INTO audit_log(actor_id,actor_email,actor_role,action,order_id,team_id,details) VALUES($1,$2,'bank','INSUFFICIENT_BALANCE_SETTLED',$3,$4,$5)",params:[req.member?.id||"bank",req.member?.email||null,o.id,o.team_id,JSON.stringify({risk:"INSUFFICIENT_BALANCE",loan_drawn:autoDraw,interest_charged:autoInterest,trigger:"ORDER_WOULD_BREACH_MINIMUM_CASH",required_cash:reqd,cash_before:cash})]},
    {sql:"INSERT INTO audit_log(actor_id,actor_role,action,team_id,details) VALUES($1,'system','LOAN_WITHDRAWAL',$2,$3)",params:["system",o.team_id,JSON.stringify({amount:autoDraw,interest_charged:autoInterest,trigger:"ORDER_WOULD_BREACH_MINIMUM_CASH",order_id:o.id,order_code:o.order_code})]}
   );
  }
  await db.transaction(stmts);
 }else{
  const sellHoldingRows=(await db.query("SELECT id,quantity,average_price FROM holdings WHERE team_id=$1 AND stock_id IS NOT DISTINCT FROM $2 AND ipo_id IS NOT DISTINCT FROM $3 ORDER BY id",[o.team_id,o.stock_id,o.ipo_id])).rows;
  const totalHolding=sellHoldingRows.reduce((sum,h)=>sum+Number(h.quantity||0),0);
  if(totalHolding<Number(o.quantity)){await db.query("UPDATE orders SET status='BANK_REJECTED' WHERE id=$1",[id]);return res.json({status:"BANK_REJECTED",reason:"INSUFFICIENT_HOLDINGS",available_quantity:totalHolding,requested_quantity:Number(o.quantity)})}
  const credit=Number(o.trade_value)-Number(o.brokerage);
  const sellStmts=[
   {sql:"UPDATE teams SET available_cash=available_cash+$1 WHERE id=$2",params:[credit,o.team_id]},
   {sql:"INSERT INTO cash_ledger(team_id,order_id,entry_type,credit,balance_after,note) VALUES($1,$2,'SELL_SETTLEMENT',$3,(SELECT available_cash FROM teams WHERE id=$1),'Participant SELL settlement net of brokerage')",params:[o.team_id,id,credit]},
   {sql:"INSERT INTO broker_commissions(order_id,broker_id,team_id,commission_rate,commission_amount,status) VALUES($1,$2,$3,0.005,$4,'SETTLED')",params:[id,o.broker_id,o.team_id,o.brokerage]},
   {sql:"WITH ordered AS (SELECT id,quantity,COALESCE(SUM(quantity) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING),0) AS prior_qty FROM holdings WHERE team_id=$1 AND stock_id IS NOT DISTINCT FROM $2 AND ipo_id IS NOT DISTINCT FROM $3) UPDATE holdings h SET quantity=GREATEST(0,h.quantity-LEAST(h.quantity,GREATEST(0,$4-ordered.prior_qty))) FROM ordered WHERE h.id=ordered.id",params:[o.team_id,o.stock_id,o.ipo_id,o.quantity]},
   {sql:"DELETE FROM holdings WHERE quantity<=0 AND team_id=$1 AND stock_id IS NOT DISTINCT FROM $2 AND ipo_id IS NOT DISTINCT FROM $3",params:[o.team_id,o.stock_id,o.ipo_id]},
   {sql:"UPDATE orders SET status='SETTLED' WHERE id=$1",params:[id]},
   {sql:"INSERT INTO audit_log(actor_id,actor_email,actor_role,action,order_id,team_id,details) VALUES($1,$2,'bank','BANK_SETTLED',$3,$4,$5)",params:[req.member?.id||"bank",req.member?.email||null,id,o.team_id,JSON.stringify({kind:"PARTICIPANT",side:o.side,trade_value:Number(o.trade_value),brokerage:Number(o.brokerage)})]}
  ];
  if(o.ipo_id)sellStmts.push({sql:"UPDATE ipo_offerings SET remaining_quantity=remaining_quantity+$1 WHERE id=$2",params:[o.quantity,o.ipo_id]});
  await db.transaction(sellStmts);
 }
 res.json({status:"SETTLED"});
}