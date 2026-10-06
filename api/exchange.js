import { db, events } from "../lib/hatchable.js";
export const access="member"; export const methods=["GET","POST"];
export default async function(req,res){
  if(req.method==="GET"){
    const sql=`
      WITH participant AS (
        SELECT o.id,o.order_code,t.code AS team,b.code AS broker,
          COALESCE(s.name,ip.name) AS stock,o.side,o.quantity,o.price,o.trade_value,o.brokerage,o.created_at,
          t.available_cash,
          COALESCE((SELECT SUM(h.quantity) FROM holdings h WHERE h.team_id=o.team_id AND h.stock_id IS NOT DISTINCT FROM o.stock_id AND h.ipo_id IS NOT DISTINCT FROM o.ipo_id),0) AS holding_qty,
          COALESCE(pl.original_principal,500000) AS loan_limit,COALESCE(pl.principal_due,0) AS loan_drawn
        FROM orders o JOIN teams t ON t.id=o.team_id JOIN brokers b ON b.id=t.broker_id
        LEFT JOIN stocks s ON s.id=o.stock_id LEFT JOIN ipo_offerings ip ON ip.id=o.ipo_id
        LEFT JOIN participant_loans pl ON pl.team_id=o.team_id
        WHERE o.status='EXCHANGE_PENDING' ORDER BY o.created_at LIMIT 100
      ),
      participant_rows AS (
        SELECT p.*,(p.trade_value+p.brokerage) AS required_cash,
          (p.available_cash+GREATEST(0,p.loan_limit-p.loan_drawn)) AS available_financing,
          (p.side='BUY' AND p.available_cash+GREATEST(0,p.loan_limit-p.loan_drawn)-(p.trade_value+p.brokerage)<20000) AS no_balance,
          (p.side='SELL' AND p.holding_qty<p.quantity) AS short_selling
        FROM participant p
      ),
      institutional_rows AS (
        SELECT io.id,io.order_code,COALESCE(t.code,'—') AS team,ii.name AS broker,
          COALESCE(s.name,ip.name) AS stock,io.side,io.quantity,io.price,io.trade_value,0 AS brokerage,io.created_at,
          NULL::numeric AS holding_qty,0::numeric AS loan_limit,0::numeric AS loan_drawn,NULL::numeric AS available_cash,
          io.trade_value AS required_cash,NULL::numeric AS available_financing,false AS no_balance,false AS short_selling
        FROM institutional_orders io JOIN institutional_investors ii ON ii.id=io.investor_id
        LEFT JOIN teams t ON t.id=io.team_id LEFT JOIN stocks s ON s.id=io.stock_id LEFT JOIN ipo_offerings ip ON ip.id=io.ipo_id
        WHERE io.status='EXCHANGE_PENDING' ORDER BY io.created_at LIMIT 100
      )
      SELECT *, 'PARTICIPANT' AS kind FROM participant_rows
      UNION ALL
      SELECT *, 'INSTITUTIONAL' AS kind FROM institutional_rows
      ORDER BY created_at LIMIT 100
    `;
    return res.json({transactions:(await db.query(sql)).rows});
  }

  const id=Number(req.body?.order_id),kind=String(req.body?.kind||"PARTICIPANT"),action=String(req.body?.action||""),forceShort=req.body?.confirm_short_selling===true;
  if(!Number.isInteger(id)||!["APPROVE","REJECT"].includes(action)||!["PARTICIPANT","INSTITUTIONAL"].includes(kind))return res.status(400).json({error:"Invalid action"});

  const target=action==="APPROVE"?"EXCHANGE_APPROVED":"EXCHANGE_REJECTED";
  const auditAction=action==="APPROVE"?(forceShort?"SHORT_SELLING_APPROVED":"EXCHANGE_APPROVED"):"EXCHANGE_REJECTED";
  const actorId=req.member?.id||"exchange",actorEmail=req.member?.email||null;
  const enforceShort=kind==="PARTICIPANT"&&action==="APPROVE"&&!forceShort;
  const tableName=kind==="INSTITUTIONAL"?"institutional_orders":"orders";
  const selectSql=kind==="PARTICIPANT"
    ? "SELECT o.id,o.status,o.side,o.quantity,o.team_id,o.stock_id,o.ipo_id,COALESCE((SELECT SUM(h.quantity) FROM holdings h WHERE h.team_id=o.team_id AND h.stock_id IS NOT DISTINCT FROM o.stock_id AND h.ipo_id IS NOT DISTINCT FROM o.ipo_id),0) AS holding_qty FROM orders o WHERE o.id=$1"
    : "SELECT id,status,NULL::text AS side,NULL::numeric AS quantity,team_id,stock_id,ipo_id,0::numeric AS holding_qty FROM institutional_orders WHERE id=$1";

  const updateAndAudit=`
    WITH changed AS (
      UPDATE __TABLE__ o SET status=$2
      WHERE o.id=$1 AND o.status='EXCHANGE_PENDING'
        AND (NOT $3::boolean OR o.side<>'SELL' OR COALESCE((SELECT SUM(h.quantity) FROM holdings h WHERE h.team_id=o.team_id AND h.stock_id IS NOT DISTINCT FROM o.stock_id AND h.ipo_id IS NOT DISTINCT FROM o.ipo_id),0)>=o.quantity)
      RETURNING o.id,o.team_id,o.stock_id,o.ipo_id
    ), audit AS (
      INSERT INTO audit_log(actor_id,actor_email,actor_role,action,order_id,team_id,details)
      SELECT $4,$5,'exchange',$6,changed.id,changed.team_id,
        json_build_object('stock_id',changed.stock_id,'ipo_id',changed.ipo_id,'institutional',__INSTITUTIONAL__)::text
      FROM changed RETURNING order_id
    )
    SELECT * FROM changed
  `.replace("__TABLE__",tableName).replace("__INSTITUTIONAL__",kind==="INSTITUTIONAL"?"true":"false");

  try{
    const tx=await db.transaction([
      {sql:"SELECT pg_advisory_xact_lock(hashtextextended($1,0))",params:[kind+":"+id]},
      {sql:selectSql,params:[id]},
      {sql:updateAndAudit,params:[id,target,enforceShort,actorId,actorEmail,auditAction]}
    ]);
    const current=tx.results?.[1]?.rows?.[0],changed=tx.results?.[2]?.rows?.[0];
    if(!current)return res.status(404).json({error:"Order not found"});
    if(!changed){
      if(enforceShort&&current.status==="EXCHANGE_PENDING"&&current.side==="SELL"&&Number(current.holding_qty||0)<Number(current.quantity||0))
        return res.status(409).json({error:"Short selling requires explicit Exchange approval.",code:"SHORT_SELLING_CONFIRM_REQUIRED",holding_quantity:Number(current.holding_qty||0),requested_quantity:Number(current.quantity||0)});
      return res.status(409).json({error:"Order is no longer pending"});
    }
    try{await events.publish("market","order_approved",{asset_type:changed.ipo_id?"ipo":"stock",asset_id:Number(changed.ipo_id||changed.stock_id),order_id:Number(changed.id)})}catch(_e){}
    return res.json({status:target});
  }catch(e){return res.status(503).json({error:"Exchange action could not be completed right now. Please retry."})}
}