import { db } from "../lib/hatchable.js";
export const access="admin";
export const methods=["GET","POST"];
export default async function(req,res){
 if(req.method==="GET"){
  const e=(await db.query("SELECT * FROM event_control WHERE id=1")).rows[0]||null;
  const c=(await db.query("SELECT * FROM event_config WHERE id=1")).rows[0]||null;
  return res.json({event:e,config:c});
 }
 const action=String(req.body?.action||"");
 const map={START:"LIVE",PAUSE:"SETTLEMENT_ONLY",CLOSE:"CLOSED",FINALIZE:"FINALIZED",RESET:"NOT_STARTED"};
 if(!map[action]) return res.status(400).json({error:"Invalid event action"});
 const tx=[];
 if(action==="FINALIZE"){
  const loans=(await db.query("SELECT t.id,t.code,t.available_cash,l.principal_due,l.interest_due FROM teams t JOIN participant_loans l ON l.team_id=t.id ORDER BY t.id")).rows;
  tx.push({sql:"UPDATE event_control SET status='CLOSED',updated_at=now() WHERE id=1",params:[]});
  for(const l of loans){
   const cash=Number(l.available_cash||0),sweep=Math.max(0,cash-20000),interest=Math.min(sweep,Number(l.interest_due||0)),principal=Math.min(Math.max(0,sweep-interest),Number(l.principal_due||0)),total=interest+principal;
   if(total>0){
    const after=cash-total;
    if(interest>0) tx.push({sql:"INSERT INTO cash_ledger(team_id,entry_type,debit,balance_after,note) VALUES($1,'LOAN_INTEREST_REPAYMENT',$2,$3,'Loan interest repayment at event finalization')",params:[l.id,interest,after+principal]});
    if(principal>0) tx.push({sql:"INSERT INTO cash_ledger(team_id,entry_type,debit,balance_after,note) VALUES($1,'LOAN_PRINCIPAL_REPAYMENT',$2,$3,'Loan principal repayment at event finalization')",params:[l.id,principal,after]});
    tx.push({sql:"UPDATE teams SET available_cash=$1 WHERE id=$2",params:[after,l.id]});
    tx.push({sql:"UPDATE participant_loans SET interest_due=interest_due-$1,principal_due=principal_due-$2,interest_paid=interest_paid+$1,principal_paid=principal_paid+$2,status=CASE WHEN interest_due-$1<=0 AND principal_due-$2<=0 THEN 'REPAID' ELSE 'OUTSTANDING' END,updated_at=now() WHERE team_id=$3",params:[interest,principal,l.id]});
   }
  }
  tx.push({sql:"UPDATE event_control SET status='FINALIZED',updated_at=now() WHERE id=1",params:[]});
 }
 if(action==="RESET"){
  tx.push({sql:"DELETE FROM cash_ledger",params:[]},{sql:"DELETE FROM audit_log",params:[]},{sql:"DELETE FROM broker_commissions",params:[]},{sql:"DELETE FROM settlement_rejections",params:[]},{sql:"DELETE FROM action_history",params:[]},{sql:"DELETE FROM holdings",params:[]},{sql:"DELETE FROM institutional_holdings",params:[]},{sql:"DELETE FROM price_history",params:[]},{sql:"DELETE FROM orders",params:[]},{sql:"DELETE FROM institutional_orders",params:[]},{sql:"UPDATE teams SET total_cash=2000000,available_cash=2000000",params:[]},{sql:"UPDATE participant_loans SET original_principal=500000,principal_due=0,interest_rate=0.02,interest_due=0,interest_paid=0,principal_paid=0,status='AVAILABLE',updated_at=now()",params:[]},{sql:"UPDATE institutional_investors SET cash=20000000,available_cash=20000000",params:[]},{sql:"UPDATE ipo_offerings SET remaining_quantity=available_quantity,status='OPEN',price=CASE id WHEN 1 THEN 890 WHEN 2 THEN 780 WHEN 3 THEN 620 WHEN 4 THEN 710 ELSE price END,previous_price=CASE id WHEN 1 THEN 890 WHEN 2 THEN 780 WHEN 3 THEN 620 WHEN 4 THEN 710 ELSE price END",params:[]},{sql:"UPDATE stocks s SET price=c.base_price,previous_price=c.base_price,updated_at=now() FROM cms50_components c WHERE c.stock_id=s.id",params:[]},{sql:"DELETE FROM daily_order_counters",params:[]});
 }
 tx.push({sql:"INSERT INTO event_control(id,status) VALUES(1,$1) ON CONFLICT(id) DO UPDATE SET status=EXCLUDED.status,updated_at=now()",params:[map[action]]});
 await db.transaction(tx);
 await db.query("INSERT INTO audit_log(actor_id,actor_email,actor_role,action,details) VALUES($1,$2,$3,$4,$5)",[req.member?.id||"admin",req.member?.email||null,"admin","EVENT_"+action,JSON.stringify({status:map[action]})]);
 res.json({status:map[action]});
}