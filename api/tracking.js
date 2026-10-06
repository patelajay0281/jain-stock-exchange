import { db } from "../lib/hatchable.js";
export const access="member";
export const methods=["GET"];

export default async function(req,res){
 const page=Math.max(1,Number(req.query?.page||1));
 const limit=Math.min(100,Math.max(25,Number(req.query?.limit||50)));
 const offset=(page-1)*limit;
 const status=String(req.query?.status||"").trim();
 const team=String(req.query?.team||"").trim();
 const q=String(req.query?.q||"").trim();
 const where=[];const params=[];
 if(status){params.push(status);where.push(`o.status=$${params.length}`)}
 if(team){params.push(team);where.push(`t.code=$${params.length}`)}
 if(q){params.push(`%${q}%`);where.push(`(o.order_code ILIKE $${params.length} OR t.code ILIKE $${params.length} OR COALESCE(s.name,ip.name,'') ILIKE $${params.length})`)}
 const w=where.length?"WHERE "+where.join(" AND "):"";
 const count=(await db.query(`SELECT COUNT(*)::int count FROM orders o JOIN teams t ON t.id=o.team_id LEFT JOIN stocks s ON s.id=o.stock_id LEFT JOIN ipo_offerings ip ON ip.id=o.ipo_id ${w}`,params)).rows[0]?.count||0;
 const rows=(await db.query(`SELECT o.order_code,t.code team,b.code broker,COALESCE(s.name,ip.name) stock,o.side,o.quantity,o.price,o.trade_value,o.brokerage,o.status,o.created_at FROM orders o JOIN teams t ON t.id=o.team_id JOIN brokers b ON b.id=t.broker_id LEFT JOIN stocks s ON s.id=o.stock_id LEFT JOIN ipo_offerings ip ON ip.id=o.ipo_id ${w} ORDER BY o.created_at DESC,o.id DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`,[...params,limit,offset])).rows;
 const stats=(await db.query(`SELECT COUNT(*)::int total,
 COUNT(*) FILTER(WHERE o.status='EXCHANGE_PENDING')::int pending,
 COUNT(*) FILTER(WHERE o.status='EXCHANGE_APPROVED')::int exchange_approved,
 COUNT(*) FILTER(WHERE o.status='SETTLED')::int settled,
 COUNT(*) FILTER(WHERE o.status='EXCHANGE_REJECTED')::int exchange_rejected,
 COUNT(*) FILTER(WHERE o.status='BANK_REJECTED')::int bank_rejected,
 COALESCE(SUM(o.trade_value),0) trade_value,COALESCE(SUM(o.brokerage),0) brokerage
 FROM orders o JOIN teams t ON t.id=o.team_id`,[])).rows[0]||{};
 const teams=(await db.query("SELECT code FROM teams ORDER BY code")).rows.map(x=>x.code);
 res.json({rows,summary:{
  total:Number(stats.total||0),pending:Number(stats.pending||0),exchange_approved:Number(stats.exchange_approved||0),
  settled:Number(stats.settled||0),exchange_rejected:Number(stats.exchange_rejected||0),bank_rejected:Number(stats.bank_rejected||0),
  trade_value:Number(stats.trade_value||0),brokerage:Number(stats.brokerage||0)
 },pagination:{page,limit,total:Number(count),pages:Math.max(1,Math.ceil(Number(count)/limit))},filters:{teams}});
}