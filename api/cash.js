import { db } from "../lib/hatchable.js";
export const access="member";
export const methods=["GET"];

export default async function(req,res){
  const page=Math.max(1,Number(req.query?.page||1));
  const limit=Math.min(100,Math.max(10,Number(req.query?.limit||50)));
  const offset=(page-1)*limit;
  const team=String(req.query?.team||"").trim();
  const type=String(req.query?.entry_type||"").trim();
  const q=String(req.query?.q||"").trim();

  const where=[]; const params=[];
  if(team){params.push(team);where.push(`t.code=$${params.length}`)}
  if(type){params.push(type);where.push(`l.entry_type=$${params.length}`)}
  if(q){params.push(`%${q}%`);where.push(`(t.code ILIKE $${params.length} OR COALESCE(o.order_code,io.order_code,'') ILIKE $${params.length} OR COALESCE(l.note,'') ILIKE $${params.length})`)}
  const w=where.length?"WHERE "+where.join(" AND "):"";

  const count=(await db.query(`SELECT COUNT(*)::int count FROM cash_ledger l JOIN teams t ON t.id=l.team_id LEFT JOIN orders o ON o.id=l.order_id LEFT JOIN institutional_orders io ON io.id=l.order_id ${w}`,params)).rows[0]?.count||0;

  const rows=(await db.query(`SELECT l.id,l.team_id,t.code team,l.order_id,
    COALESCE(o.order_code,io.order_code,CASE WHEN l.order_id IS NOT NULL THEN 'ORDER #'||l.order_id::text END,'—') order_code,
    l.entry_type,l.debit,l.credit,l.balance_after,l.note,l.created_at
    FROM cash_ledger l
    JOIN teams t ON t.id=l.team_id
    LEFT JOIN orders o ON o.id=l.order_id
    LEFT JOIN institutional_orders io ON io.id=l.order_id
    ${w}
    ORDER BY l.created_at DESC,l.id DESC
    LIMIT $${params.length+1} OFFSET $${params.length+2}`,[...params,limit,offset])).rows;

  const summary=(await db.query(`SELECT
    COALESCE(SUM(l.debit),0) total_debit,
    COALESCE(SUM(l.credit),0) total_credit,
    COUNT(l.id)::int entries,
    (SELECT COALESCE(SUM(available_cash),0) FROM teams) current_cash
    FROM cash_ledger l
    JOIN teams t ON t.id=l.team_id
    ${w}`,params)).rows[0]||{};

  const teams=(await db.query("SELECT code FROM teams ORDER BY code")).rows.map(x=>x.code);
  const types=(await db.query("SELECT DISTINCT entry_type FROM cash_ledger WHERE entry_type IS NOT NULL ORDER BY entry_type")).rows.map(x=>x.entry_type);

  res.json({
    rows,
    summary:{
      total_debit:Number(summary.total_debit||0),
      total_credit:Number(summary.total_credit||0),
      net_movement:Number(summary.total_credit||0)-Number(summary.total_debit||0),
      entries:Number(summary.entries||0),
      current_cash:Number(summary.current_cash||0)
    },
    pagination:{page,limit,total:Number(count),pages:Math.max(1,Math.ceil(Number(count)/limit))},
    filters:{teams,types}
  });
}