import { db } from "../lib/hatchable.js";
export const access="public";
export const methods=["GET"];

export default async function(req,res){
  try{
    const q=await db.query(`
      WITH s AS (
        SELECT
          COALESCE(json_agg(
            json_build_object(
              'id',id,'symbol',symbol,'name',name,'price',price,
              'previous_price',previous_price,
              'change_pct',ROUND((price-previous_price)*100/NULLIF(previous_price,0),2)
            ) ORDER BY updated_at DESC,id ASC
          ),'[]'::json) AS rows,
          COALESCE(SUM(price),0) AS total
        FROM stocks
        WHERE id IN (SELECT stock_id FROM stock_catalog)
      ),
      i AS (
        SELECT
          COALESCE(json_agg(
            json_build_object(
              'id',id,'code',code,'name',name,'symbol',symbol,'price',price,
              'previous_price',previous_price,'remaining_quantity',remaining_quantity,
              'status',status,
              'change_pct',ROUND((price-previous_price)*100/NULLIF(previous_price,0),2)
            ) ORDER BY id ASC
          ),'[]'::json) AS rows,
          COALESCE(SUM(price),0) AS total
        FROM ipo_offerings
      ),
      e AS (
        SELECT status,updated_at FROM event_control WHERE id=1
      ),
      r AS (
        SELECT base_value FROM cms50_reference WHERE id=1
      )
      SELECT
        s.rows AS stocks,
        i.rows AS ipos,
        e.status,
        e.updated_at AS event_updated_at,
        r.base_value AS index_base_value,
        ROUND((s.total+i.total)) AS index_value,
        ROUND(
          CASE WHEN COALESCE(r.base_value,0)<>0
            THEN ((s.total+i.total-r.base_value)*100/r.base_value)
            ELSE 0 END,2
        ) AS index_change_pct
      FROM s CROSS JOIN i
      LEFT JOIN e ON true
      LEFT JOIN r ON true
    `);
    const x=q.rows[0]||{};
    res.setHeader?.("Cache-Control","public, max-age=1, s-maxage=3, stale-while-revalidate=5, stale-if-error=30");
    res.json({
      stocks:x.stocks||[],
      ipos:x.ipos||[],
      status:x.status||"NOT_STARTED",
      event_updated_at:x.event_updated_at||null,
      index:{
        value:Number(x.index_value||0),
        base_value:Number(x.index_base_value||0),
        change_pct:Number(x.index_change_pct||0)
      }
    });
  }catch(e){
    res.status(503).json({error:"Market data temporarily unavailable. Please retry."});
  }
}