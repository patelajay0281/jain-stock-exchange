import { db } from "../lib/hatchable.js";
export const access="admin";
export const methods=["GET"];

export default async function(req,res){
 const investorId=Number(req.query?.investor_id||1);
 const investor=(await db.query("SELECT id,code,name,cash,available_cash FROM institutional_investors WHERE id=$1",[investorId])).rows[0];
 if(!investor)return res.status(404).json({error:"Investor not found"});

 const [holdings,orders,teams,stats]=await Promise.all([
  db.query("SELECT h.quantity,h.average_price,s.name stock,ip.name ipo,COALESCE(s.price,ip.price) current_price,h.quantity*COALESCE(s.price,ip.price) market_value,(COALESCE(s.price,ip.price)-h.average_price)*h.quantity pnl FROM institutional_holdings h LEFT JOIN stocks s ON s.id=h.stock_id LEFT JOIN ipo_offerings ip ON ip.id=h.ipo_id WHERE h.investor_id=$1 AND h.quantity>0 ORDER BY COALESCE(s.name,ip.name)",[investorId]),
  db.query("SELECT io.id,io.order_code,COALESCE(s.name,ip.name) asset,io.side,io.quantity,io.price,io.trade_value,io.status,io.created_at,COALESCE(t.code,'—') team FROM institutional_orders io LEFT JOIN stocks s ON s.id=io.stock_id LEFT JOIN ipo_offerings ip ON ip.id=io.ipo_id LEFT JOIN teams t ON t.id=io.team_id WHERE io.investor_id=$1 ORDER BY io.created_at DESC LIMIT 100",[investorId]),
  db.query("SELECT code FROM teams ORDER BY code"),
  db.query("SELECT COUNT(*)::int total,COUNT(*) FILTER(WHERE status='SETTLED')::int settled,COUNT(*) FILTER(WHERE status='EXCHANGE_PENDING')::int pending,COUNT(*) FILTER(WHERE status='BANK_REJECTED')::int bank_rejected,COUNT(*) FILTER(WHERE status='EXCHANGE_REJECTED')::int exchange_rejected,COALESCE(SUM(trade_value) FILTER(WHERE status='SETTLED' AND side='BUY'),0) buy_value,COALESCE(SUM(trade_value) FILTER(WHERE status='SETTLED' AND side='SELL'),0) sell_value FROM institutional_orders WHERE investor_id=$1",[investorId])
 ]);
 const h=holdings.rows;
 const marketValue=h.reduce((a,x)=>a+Number(x.market_value||0),0);
 const pnl=h.reduce((a,x)=>a+Number(x.pnl||0),0);
 const s=stats.rows[0]||{};
 res.json({
  investor,
  holdings:h,
  orders:orders.rows,
  teams:teams.rows.map(x=>x.code),
  stats:{
   total:Number(s.total||0),settled:Number(s.settled||0),pending:Number(s.pending||0),
   bank_rejected:Number(s.bank_rejected||0),exchange_rejected:Number(s.exchange_rejected||0),
   buy_value:Number(s.buy_value||0),sell_value:Number(s.sell_value||0),
   net_flow:Number(s.buy_value||0)-Number(s.sell_value||0),
   market_value:marketValue,pnl
  }
 });
}