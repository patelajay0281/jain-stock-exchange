import { db } from "../lib/hatchable.js";
export const access = "member";
export const methods = ["GET"];
export default async function(req,res){
 const type=String(req.query?.type||"portfolios"); let rows=[];
 if(type==="portfolios"){({rows}=await db.query("SELECT t.code AS team,b.code AS broker,t.total_cash,t.available_cash,COALESCE(SUM(h.quantity*s.price),0) AS portfolio_value FROM teams t JOIN brokers b ON b.id=t.broker_id LEFT JOIN holdings h ON h.team_id=t.id LEFT JOIN stocks s ON s.id=h.stock_id GROUP BY t.code,b.code,t.total_cash,t.available_cash ORDER BY t.code"))}
 if(type==="rejections"){({rows}=await db.query("SELECT r.id,o.order_code,t.code AS team,b.code AS broker,s.name AS stock,o.side,o.quantity,o.price,o.trade_value,o.brokerage,r.available_cash,r.required_cash,r.shortfall,r.reason,r.created_at FROM settlement_rejections r JOIN orders o ON o.id=r.order_id JOIN teams t ON t.id=r.team_id JOIN brokers b ON b.id=r.broker_id JOIN stocks s ON s.id=o.stock_id ORDER BY r.created_at DESC"))}
 if(type==="commissions"){({rows}=await db.query("SELECT b.code AS broker,o.order_code,t.code AS team,s.name AS stock,o.side,o.quantity,o.price,o.trade_value,bc.commission_rate,bc.commission_amount,o.status,o.created_at FROM broker_commissions bc JOIN brokers b ON b.id=bc.broker_id JOIN orders o ON o.id=bc.order_id JOIN teams t ON t.id=bc.team_id JOIN stocks s ON s.id=o.stock_id ORDER BY bc.created_at DESC"))
 }
 if(type==="commission_summary"){({rows}=await db.query("SELECT b.code AS broker,COALESCE(SUM(bc.commission_amount),0) AS commission_earned FROM broker_commissions bc JOIN brokers b ON b.id=bc.broker_id GROUP BY b.code ORDER BY b.code"))}
 res.json({type,rows,export_columns:rows[0]?Object.keys(rows[0]):[]});
}