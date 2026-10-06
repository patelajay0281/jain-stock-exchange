import { db } from "../lib/hatchable.js";
export const access="member";
export const methods=["GET"];

export default async function(req,res){
  const r=await db.query(`
    SELECT
      a.id,
      a.created_at,
      a.actor_id,
      a.actor_email,
      a.actor_role,
      a.action,
      a.order_id,
      a.team_id,
      a.details,
      o.order_code,
      o.side,
      o.quantity,
      o.price,
      o.trade_value,
      o.brokerage,
      o.status AS order_status,
      COALESCE((
        SELECT SUM(
          CASE
            WHEN po.side='BUY' AND po.status='SETTLED' THEN po.quantity
            WHEN po.side='SELL' AND po.status='SETTLED' THEN -po.quantity
            ELSE 0
          END
        )
        FROM orders po
        WHERE po.team_id=o.team_id
          AND po.stock_id IS NOT DISTINCT FROM o.stock_id
          AND po.ipo_id IS NOT DISTINCT FROM o.ipo_id
          AND (po.created_at<o.created_at OR (po.created_at=o.created_at AND po.id<o.id))
      ),0) AS holding_before,
      t.code AS team_code,
      COALESCE(s.symbol, i.symbol) AS asset_symbol,
      COALESCE(s.name, i.name) AS asset_name,
      CASE WHEN s.id IS NOT NULL THEN 'Stock' WHEN i.id IS NOT NULL THEN 'IPO' ELSE NULL END AS asset_type
    FROM audit_log a
    LEFT JOIN orders o ON o.id=a.order_id
    LEFT JOIN teams t ON t.id=a.team_id
    LEFT JOIN stocks s ON s.id=o.stock_id
    LEFT JOIN ipo_offerings i ON i.id=o.ipo_id
    ORDER BY a.created_at DESC,a.id DESC
    LIMIT 1000
  `);
  const rows=r.rows.map(x=>({
    ...x,
    action_label:{
      ORDER_CREATED:"Order Placed",
      EXCHANGE_APPROVED:"Exchange Approved",
      EXCHANGE_REJECTED:"Exchange Rejected",
      BANK_SETTLED:"Bank Settled",
      BANK_REJECTED:"Bank Rejected",
      EVENT_START:"Event Started",
      EVENT_RESET:"Event Reset",
      SHORT_SELLING_APPROVED:"Short Selling Approved",
      INSUFFICIENT_BALANCE_SETTLED:"Insufficient Balance — Settled",
      INSUFFICIENT_BALANCE_REJECTED:"Insufficient Balance — Rejected"
    }[x.action]||x.action.replaceAll("_"," ")
  }));
  rows.forEach(x=>{
    const side=String(x.side||"").toUpperCase();
    const qty=Number(x.quantity||0);
    const before=Number(x.holding_before||0);
    x.risk_label=null;
    x.risk_level="normal";
    if((x.action==="SHORT_SELLING_APPROVED" || side==="SELL") && qty>before && x.order_status==="SETTLED"){
      x.risk_label="SHORT SOLD";
      x.risk_level="danger";
    }else if(side==="SELL" && qty>before && x.order_status==="BANK_REJECTED"){
      x.risk_label="SHORT SELLING — REJECTED AT BANK";
      x.risk_level="danger";
    }else if((x.action==="SHORT_SELLING_APPROVED" || x.action==="EXCHANGE_APPROVED") && side==="SELL" && qty>before){
      x.risk_label="SHORT SELLING — EXCHANGE APPROVED";
      x.risk_level="danger";
    }else if(x.action==="INSUFFICIENT_BALANCE_SETTLED"){
      x.risk_label="INSUFFICIENT BALANCE — LOAN USED";
      x.risk_level="warning";
    }else if(x.action==="INSUFFICIENT_BALANCE_REJECTED"){
      x.risk_label="INSUFFICIENT BALANCE — REJECTED";
      x.risk_level="danger";
    }else if(side==="SELL" && qty>before && x.action==="ORDER_CREATED"){
      x.risk_label="SHORT SELLING ATTEMPT";
      x.risk_level="danger";
    }
  });
  res.json({rows});
}