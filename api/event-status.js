import { db } from "../lib/hatchable.js";
export const access="public";
export const methods=["GET"];
export default async function(req,res){
  const e=(await db.query("SELECT status,updated_at FROM event_control WHERE id=1")).rows[0];
  const since=e?.updated_at||'1970-01-01';
  const approved=(await db.query("SELECT a.id,a.order_id,a.created_at,o.stock_id,o.ipo_id,CASE WHEN o.ipo_id IS NOT NULL THEN 'ipo' ELSE 'stock' END asset_type FROM audit_log a JOIN orders o ON o.id=a.order_id WHERE a.action='EXCHANGE_APPROVED' AND a.created_at >= $1 ORDER BY a.id DESC",[since])).rows;
  res.json({
    status:e?.status||"NOT_STARTED",
    event_updated_at:e?.updated_at||null,
    approved_orders:approved.map(x=>({asset_type:x.asset_type,asset_id:Number(x.asset_type==='ipo'?x.ipo_id:x.stock_id),order_id:Number(x.order_id),audit_id:Number(x.id)}))
  });
}