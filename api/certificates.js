import { db } from "../lib/hatchable.js";
export const access="admin";
export const methods=["GET"];
export default async function(req,res){const r=await db.query("SELECT o.order_code,t.code team,b.code broker,s.name stock,o.side,o.quantity,o.price,o.trade_value,o.brokerage,o.created_at FROM orders o JOIN teams t ON t.id=o.team_id JOIN brokers b ON b.id=t.broker_id JOIN stocks s ON s.id=o.stock_id WHERE o.status='SETTLED' ORDER BY o.id");res.json({certificates:r.rows})}