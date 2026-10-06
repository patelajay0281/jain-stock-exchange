import { db } from "../lib/hatchable.js";
export const access="admin";
export const methods=["POST"];
export default async function(req,res){
 const investorId=req.body?.investor_id?Number(req.body.investor_id):null,investorCode=String(req.body?.investor_code||"").trim(),teamCode=String(req.body?.team_code||"").trim(),stockId=req.body?.stock_id?Number(req.body.stock_id):null,ipoId=req.body?.ipo_id?Number(req.body.ipo_id):null,side=String(req.body?.side||""),qty=Number(req.body?.quantity),price=Number(req.body?.price);
 if((!Number.isInteger(investorId)&&!investorCode)||!teamCode||(!stockId&&!ipoId)||(stockId&&ipoId)||!["BUY","SELL"].includes(side)||!Number.isInteger(qty)||qty<=0||!Number.isFinite(price)||price<=0)return res.status(400).json({error:"Institutional trade requires a participant team and valid order details."});
 const inv=(await db.query(investorCode?"SELECT * FROM institutional_investors WHERE code=$1":"SELECT * FROM institutional_investors WHERE id=$1",[investorCode||investorId])).rows[0]; if(!inv)return res.status(404).json({error:"Investor not found"});
 const team=(await db.query("SELECT id,code FROM teams WHERE code=$1",[teamCode])).rows[0]; if(!team)return res.status(404).json({error:"Participant team not found"});
 const resolvedInvestorId=Number(inv.id),resolvedTeamId=Number(team.id);
 const ev=(await db.query("SELECT status FROM event_control WHERE id=1")).rows[0];
 if(!ev||ev.status!=="LIVE")return res.status(409).json({error:"Event is not open for new institutional orders",status:ev?.status||"NOT_STARTED"});
 const cfg=(await db.query("SELECT max_price_move_pct FROM event_config WHERE id=1")).rows[0];
 if(stockId&&!((await db.query("SELECT id,price FROM stocks WHERE id=$1",[stockId])).rows[0]))return res.status(404).json({error:"Stock not found"});
 if(ipoId&&!((await db.query("SELECT id FROM ipo_offerings WHERE id=$1 AND status='OPEN'",[ipoId])).rows[0]))return res.status(409).json({error:"IPO is not open"});
 if(stockId && qty%50!==0)return res.status(400).json({error:"Listed stocks must be traded in 50-share lots.",code:"LOT_SIZE",lot_size:50,requested_quantity:qty});
 const value=qty*price;
 // Order creation does not reserve cash or holdings. Actual cash and holding constraints are enforced atomically at Bank Settlement.
 const code="INST-"+Date.now().toString(36).toUpperCase()+"-"+crypto.randomUUID().slice(0,6).toUpperCase();
 const inserted=(await db.query("INSERT INTO institutional_orders(order_code,investor_id,team_id,stock_id,ipo_id,side,quantity,price,trade_value,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,'EXCHANGE_PENDING') RETURNING id",[code,resolvedInvestorId,resolvedTeamId,stockId,ipoId,side,qty,price,value])).rows[0];
 const orderId=Number(inserted.id);
 await db.query(stockId?"UPDATE stocks SET previous_price=price,price=$1,updated_at=now() WHERE id=$2":"UPDATE ipo_offerings SET previous_price=price,price=$1 WHERE id=$2",[price,stockId||ipoId]);
 await db.query("INSERT INTO audit_log(actor_id,actor_email,actor_role,action,order_id,details,team_id) VALUES($1,$2,'admin','INSTITUTIONAL_ORDER_SUBMITTED',$3,$4,$5)",[req.member?.id||"admin",req.member?.email||null,orderId,JSON.stringify({order_code:code,investor_id:resolvedInvestorId,team_code:teamCode,side,quantity:qty,price}),resolvedTeamId]);
 res.json({status:"EXCHANGE_PENDING",order_code:code,transaction_id:orderId,trade_value:value,team:teamCode});
}