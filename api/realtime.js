import { db } from "hatchable";
export const access="public";
export const methods=["GET"];

export default async function(req,res){
  const r=await db.query(`
    SELECT
      (SELECT status FROM event_control WHERE id=1) AS event_status,
      (SELECT updated_at FROM event_control WHERE id=1) AS event_updated_at,
      (SELECT COALESCE(MAX(id),0) FROM orders) AS max_order_id,
      (SELECT COALESCE(MAX(id),0) FROM institutional_orders) AS max_institutional_order_id,
      (SELECT COALESCE(MAX(id),0) FROM action_history) AS max_action_id,
      (SELECT COALESCE(MAX(id),0) FROM audit_log) AS max_audit_id,
      (SELECT COALESCE(MAX(updated_at),TIMESTAMP '1970-01-01') FROM stocks) AS stock_updated_at,
      (SELECT COALESCE(MAX(updated_at),TIMESTAMP '1970-01-01') FROM ipo_offerings) AS ipo_updated_at
  `);
  res.setHeader("cache-control","no-store");
  res.json(r.rows[0]||{});
}
