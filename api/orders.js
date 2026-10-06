import { db, events } from "../lib/hatchable.js";

export const access="member";
export const methods=["POST"];

export default async function(req,res){
  const requestedTeam=String(req.body?.team||"");
  const team=req.member?.role==="participant"
    ? String(req.member?.team_code||"")
    : requestedTeam;
  const actorRole=String(req.member?.role||"participant");
  const assetType=String(req.body?.asset_type||"stock");
  const assetId=Number(req.body?.asset_id);
  const side=String(req.body?.side||"");
  const units=Number(req.body?.quantity);
  const rawPrice=Number(req.body?.price);
  const price=Number.isFinite(rawPrice)?Math.round(rawPrice*100)/100:NaN;
  const key=String(req.body?.idempotency_key||"");
  const actorId=req.member?.id||"participant";
  const actorEmail=req.member?.email||null;
  const qty=assetType==="stock"?units*50:units;

  if((actorRole==="participant"&&!req.member?.team_id)||!/^TEAM-\d{3}$/.test(team)||!["stock","ipo"].includes(assetType)||
     !Number.isSafeInteger(assetId)||!["BUY","SELL"].includes(side)||
     !Number.isSafeInteger(units)||units<=0||units>1000000||
     !Number.isFinite(price)||price<=0||price>10000000||
     !key||key.length>128){
    return res.status(400).json({error:"Invalid order details"});
  }

  const validationSql=`WITH
    cfg AS (
      SELECT ec.status AS event_status,
             cfg.brokerage_rate,cfg.min_order_value,
             cfg.max_order_value,cfg.max_price_move_pct
      FROM event_control ec CROSS JOIN event_config cfg
      WHERE ec.id=1 AND cfg.id=1
    ),
    inp AS (
      SELECT cfg.*,
             t.id AS team_id,b.code AS broker_code,
             old.id AS existing_id,old.order_code AS existing_code,old.status AS existing_status,
             a.id AS asset_id,a.price AS old_price,
             $5::numeric AS qty,
             ROUND($5::numeric*$6::numeric) AS trade_value,
             ROUND(ROUND($5::numeric*$6::numeric)*COALESCE(cfg.brokerage_rate,0.005)) AS brokerage
      FROM cfg
      LEFT JOIN teams t ON t.code=$1
      LEFT JOIN brokers b ON b.id=t.broker_id
      LEFT JOIN orders old ON old.idempotency_key=$4
      LEFT JOIN LATERAL (
        SELECT id,price FROM stocks WHERE $2='stock' AND id=$3
        UNION ALL
        SELECT id,price FROM ipo_offerings WHERE $2='ipo' AND id=$3
      ) a ON true
    )
    SELECT *,
      CASE
        WHEN existing_id IS NOT NULL THEN NULL
        WHEN event_status<>'LIVE' THEN 'EVENT_NOT_LIVE'
        WHEN team_id IS NULL THEN 'TEAM_NOT_FOUND'
        WHEN asset_id IS NULL THEN 'ASSET_NOT_FOUND'
        WHEN trade_value<COALESCE(min_order_value,1) THEN 'ORDER_VALUE_TOO_LOW'
        WHEN trade_value>COALESCE(max_order_value,5000000) THEN 'ORDER_VALUE_TOO_HIGH'
        WHEN old_price>0
          AND ABS($6::numeric-old_price)>(old_price*COALESCE(max_price_move_pct,10)/100)
          THEN 'PRICE_MOVE_EXCEEDED'
        ELSE NULL
      END AS error_code
    FROM inp`;

  const insertSql=`WITH
    cfg AS (
      SELECT ec.status AS event_status,
             cfg.brokerage_rate,cfg.min_order_value,
             cfg.max_order_value,cfg.max_price_move_pct
      FROM event_control ec CROSS JOIN event_config cfg
      WHERE ec.id=1 AND cfg.id=1
    ),
    inp AS (
      SELECT cfg.*,t.id AS team_id,
             old.id AS existing_id,
             a.id AS asset_id,a.price AS old_price,
             $5::numeric AS qty,
             ROUND($5::numeric*$6::numeric) AS trade_value,
             ROUND(ROUND($5::numeric*$6::numeric)*COALESCE(cfg.brokerage_rate,0.005)) AS brokerage
      FROM cfg
      LEFT JOIN teams t ON t.code=$1
      LEFT JOIN orders old ON old.idempotency_key=$4
      LEFT JOIN LATERAL (
        SELECT id,price FROM stocks WHERE $2='stock' AND id=$3
        UNION ALL
        SELECT id,price FROM ipo_offerings WHERE $2='ipo' AND id=$3
      ) a ON true
    ),
    chk AS (
      SELECT *,
        CASE
          WHEN existing_id IS NOT NULL THEN NULL
          WHEN event_status<>'LIVE' THEN 'EVENT_NOT_LIVE'
          WHEN team_id IS NULL THEN 'TEAM_NOT_FOUND'
          WHEN asset_id IS NULL THEN 'ASSET_NOT_FOUND'
          WHEN trade_value<COALESCE(min_order_value,1) THEN 'ORDER_VALUE_TOO_LOW'
          WHEN trade_value>COALESCE(max_order_value,5000000) THEN 'ORDER_VALUE_TOO_HIGH'
          WHEN old_price>0
            AND ABS($6::numeric-old_price)>(old_price*COALESCE(max_price_move_pct,10)/100)
            THEN 'PRICE_MOVE_EXCEEDED'
          ELSE NULL
        END AS error_code
      FROM inp
    )
    INSERT INTO orders(
      order_code,team_id,stock_id,ipo_id,side,quantity,price,
      trade_value,brokerage,status,created_by,idempotency_key
    )
    SELECT
      'ORD-'||nextval('order_code_seq'),
      team_id,
      CASE WHEN $2='stock' THEN asset_id ELSE NULL END,
      CASE WHEN $2='ipo' THEN asset_id ELSE NULL END,
      $7,qty,$6,trade_value,brokerage,
      'EXCHANGE_INTAKE',$8,$4
    FROM chk
    WHERE error_code IS NULL AND existing_id IS NULL
    ON CONFLICT DO NOTHING
    RETURNING id`;

  const params=[team,assetType,assetId,key,qty,price,side,actorId,actorEmail];

  try{
    const tx=await db.transaction([
      // Serialize duplicate submissions for the same idempotency key.
      {sql:"SELECT pg_advisory_xact_lock(hashtextextended($1,0))",params:[key]},
      {sql:validationSql,params},
      {sql:insertSql,params},
      {sql:`UPDATE stocks s
             SET previous_price=s.price,price=$2,updated_at=now()
             FROM orders o
             WHERE o.idempotency_key=$1
               AND o.status='EXCHANGE_INTAKE'
               AND o.stock_id=s.id
             RETURNING s.id,s.previous_price,s.price,o.id AS order_id`,
       params:[key,price]},
      {sql:`INSERT INTO price_history(stock_id,previous_price,new_price,order_id)
             SELECT s.id,s.previous_price,s.price,o.id
             FROM stocks s JOIN orders o ON o.stock_id=s.id
             WHERE o.idempotency_key=$1 AND o.status='EXCHANGE_INTAKE'`,
       params:[key]},
      {sql:`UPDATE ipo_offerings i
             SET previous_price=i.price
             FROM orders o
             WHERE o.idempotency_key=$1
               AND o.status='EXCHANGE_INTAKE'
               AND o.ipo_id=i.id`,
       params:[key]},
      {sql:`INSERT INTO audit_log(
               actor_id,actor_email,actor_role,action,order_id,team_id,details
             )
             SELECT $1,$2,$9::text,'ORDER_CREATED',o.id,o.team_id,
                    json_build_object(
                      'asset_type',$3::text,'asset_id',$4::bigint,'side',$5::text,
                      'quantity',o.quantity,'price',o.price,
                      'order_code',o.order_code,'status','EXCHANGE_PENDING',
                      'trade_value',o.trade_value,'brokerage',o.brokerage
                    )::text
             FROM orders o
             WHERE o.idempotency_key=$6 AND o.status='EXCHANGE_INTAKE'`,
       params:[actorId,actorEmail,assetType,assetId,side,key,qty,price,actorRole]},
      {sql:`UPDATE orders
             SET status='EXCHANGE_PENDING'
             WHERE idempotency_key=$1 AND status='EXCHANGE_INTAKE'
             RETURNING id,order_code,status,team_id,stock_id,ipo_id,trade_value,brokerage`,
       params:[key]},
      {sql:`SELECT o.id,o.order_code,o.status,o.trade_value,o.brokerage,
                    b.code AS broker_code
             FROM orders o
             JOIN teams t ON t.id=o.team_id
             LEFT JOIN brokers b ON b.id=t.broker_id
             WHERE o.idempotency_key=$1
             LIMIT 1`,
       params:[key]}
    ]);

    const validation=tx.results?.[1]?.rows?.[0];
    if(validation?.error_code){
      const messages={
        EVENT_NOT_LIVE:"Event is not open for new orders",
        TEAM_NOT_FOUND:"Team not found",
        ASSET_NOT_FOUND:"Asset not found",
        ORDER_VALUE_TOO_LOW:"Order value is outside event limits",
        ORDER_VALUE_TOO_HIGH:"Order value is outside event limits",
        PRICE_MOVE_EXCEEDED:"Price move exceeds event limit"
      };
      const code=validation.error_code;
      return res.status(code==="EVENT_NOT_LIVE"?409:400).json({
        error:messages[code]||"Order could not be accepted",code
      });
    }

    const existingBefore=validation?.existing_id;
    const finalRow=tx.results?.[8]?.rows?.[0];
    if(!finalRow){
      return res.status(503).json({error:"Trading service is temporarily unavailable. Please retry."});
    }

    const replayed=Boolean(existingBefore);
    const value=Number(finalRow.trade_value||0);
    const brokerage=Number(finalRow.brokerage||0);
    const settlementAmount=side==="BUY"?value+brokerage:value-brokerage;

    if(!replayed){
      try{
        await events.publish("market","order_created",{
          asset_type:assetType,asset_id:assetId,
          order_id:finalRow.id,order_code:finalRow.order_code,
          side,quantity:qty,price
        });
        await events.publish("market","price_updated",{
          asset_type:assetType,asset_id:assetId,
          price,order_id:finalRow.id
        });
      }catch(_e){}
    }

    return res.status(replayed?200:201).json({
      order_id:finalRow.order_code,
      transaction_id:finalRow.id,
      broker:finalRow.broker_code||"",
      trade_value:value,
      brokerage,
      brokerage_rate:Number(validation?.brokerage_rate||0.005),
      side,
      total_required:side==="BUY"?settlementAmount:null,
      net_proceeds:side==="SELL"?settlementAmount:null,
      status:finalRow.status,
      replayed
    });
  }catch(e){
    return res.status(503).json({error:"Order could not be processed right now. Please retry."});
  }
}