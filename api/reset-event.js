import { db } from "../lib/hatchable.js";
export const access="admin";
export const methods=["POST"];
export default async function(req,res){
 const password=String(req.body?.password||"");
 const expected=String(process.env.EVENT_ADMIN_PASSWORD||"");
 if(password!==expected) return res.status(401).json({error:"Invalid reset password"});
 await db.transaction([
  {sql:"DELETE FROM cash_ledger",params:[]},
  {sql:"DELETE FROM audit_log",params:[]},
  {sql:"DELETE FROM broker_commissions",params:[]},
  {sql:"DELETE FROM settlement_rejections",params:[]},
  {sql:"DELETE FROM action_history",params:[]},
  {sql:"DELETE FROM holdings",params:[]},
  {sql:"DELETE FROM institutional_holdings",params:[]},
  {sql:"DELETE FROM price_history",params:[]},
  {sql:"DELETE FROM orders",params:[]},
  {sql:"DELETE FROM institutional_orders",params:[]},
  {sql:"UPDATE teams SET total_cash=2000000,available_cash=2000000",params:[]},
  {sql:"UPDATE participant_loans SET original_principal=500000,principal_due=0,interest_rate=0.02,interest_due=0,interest_paid=0,principal_paid=0,status='AVAILABLE',updated_at=now()",params:[]},
  {sql:"UPDATE institutional_investors SET cash=20000000,available_cash=20000000",params:[]},
  {sql:"UPDATE ipo_offerings SET remaining_quantity=available_quantity,status='OPEN',price=CASE id WHEN 1 THEN 890 WHEN 2 THEN 780 WHEN 3 THEN 620 WHEN 4 THEN 710 ELSE price END,previous_price=CASE id WHEN 1 THEN 890 WHEN 2 THEN 780 WHEN 3 THEN 620 WHEN 4 THEN 710 ELSE price END",params:[]},
  {sql:"UPDATE stocks s SET price=c.base_price,previous_price=c.base_price,updated_at=now() FROM cms50_components c WHERE c.stock_id=s.id",params:[]},
  {sql:"DELETE FROM daily_order_counters",params:[]},
  {sql:"INSERT INTO event_control(id,status) VALUES(1,'NOT_STARTED') ON CONFLICT(id) DO UPDATE SET status='NOT_STARTED',updated_at=now()",params:[]}
 ]);
 await db.query("INSERT INTO audit_log(actor_id,actor_email,actor_role,action,details) VALUES($1,$2,'admin','EVENT_RESET','Reset authenticated with reset password')",[req.member?.id||"admin",req.member?.email||null]);
 res.json({status:"NOT_STARTED",reset:true});
}