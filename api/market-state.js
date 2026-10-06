import { db } from "../lib/hatchable.js";
export const access="public";
export const methods=["GET"];
export default async function(req,res){
  const [stocksQ,iposQ,indexQ,eventQ,refQ]=await Promise.all([
    db.query("SELECT id,symbol,name,price,previous_price,ROUND((price-previous_price)*100/NULLIF(previous_price,0),2) AS change_pct FROM stocks WHERE id IN (SELECT stock_id FROM stock_catalog) ORDER BY updated_at DESC,id ASC"),
    db.query("SELECT id,code,name,symbol,price,previous_price,remaining_quantity,status,ROUND((price-previous_price)*100/NULLIF(previous_price,0),2) AS change_pct FROM ipo_offerings ORDER BY id ASC"),
    db.query("SELECT s.price,s.previous_price FROM stocks s JOIN cms50_components c ON c.stock_id=s.id"),
    db.query("SELECT status,updated_at FROM event_control WHERE id=1"),
    db.query("SELECT base_value FROM cms50_reference WHERE id=1")
  ]);
  const e=eventQ.rows[0];
  const since=e?.updated_at||"1970-01-01";
  const approvedQ=await db.query(
    "SELECT a.order_id,o.stock_id,o.ipo_id FROM audit_log a JOIN orders o ON o.id=a.order_id WHERE a.action='EXCHANGE_APPROVED' AND a.created_at >= $1 ORDER BY a.id DESC",
    [since]
  );
  const stocks=stocksQ.rows,ipos=iposQ.rows;
  const stockTotal=stocks.reduce((n,x)=>n+Number(x.price||0),0);
  const ipoTotal=ipos.reduce((n,x)=>n+Number(x.price||0),0);
  const previousStockTotal=stocks.reduce((n,x)=>n+Number(x.previous_price||x.price||0),0);
  const previousIpoTotal=ipos.reduce((n,x)=>n+Number(x.previous_price||x.price||0),0);
  const value=Math.round(stockTotal+ipoTotal),previous=Math.round(previousStockTotal+previousIpoTotal);
  const baseValue=Number(refQ.rows[0]?.base_value||previous||value);
  const change_pct=baseValue?Number((((value-baseValue)*100)/baseValue).toFixed(2)):0;
  res.json({
    stocks,
    ipos,
    index:{value,change_pct},
    status:e?.status||"NOT_STARTED",
    event_updated_at:e?.updated_at||null,
    approved_orders:approvedQ.rows.map(x=>({
      asset_type:x.ipo_id!==null?"ipo":"stock",
      asset_id:Number(x.ipo_id||x.stock_id),
      order_id:Number(x.order_id)
    }))
  });
}