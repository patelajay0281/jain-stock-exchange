import { db } from "../lib/hatchable.js";
export const access="admin";
export const methods=["GET"];

async function provision(){
  await db.query(`
    INSERT INTO member_accounts(username,display_name,role,team_id,initial_password,must_change_password,active)
    SELECT 'TEAM-'||lpad(i::text,3,'0')||v.suffix,
           'TEAM-'||lpad(i::text,3,'0')||' Participant '||substr(v.suffix,2,1),
           'participant',t.id,
           'JSE26-'||lpad(i::text,3,'0')||v.suffix||'!',
           true,true
    FROM generate_series(1,100) i
    CROSS JOIN (VALUES ('-A'),('-B')) v(suffix)
    JOIN teams t ON t.code='TEAM-'||lpad(i::text,3,'0')
    ON CONFLICT(username) DO UPDATE SET display_name=EXCLUDED.display_name,
      team_id=EXCLUDED.team_id,initial_password=EXCLUDED.initial_password,active=true
  `);
  await db.query(`
    INSERT INTO member_accounts(username,display_name,role,team_id,initial_password,must_change_password,active)
    SELECT 'JSE-OP-'||lpad(i::text,2,'0'),'JSE Operations '||lpad(i::text,2,'0'),
           'operator',NULL,'JSE26-OP-'||lpad(i::text,2,'0')||'!',true,true
    FROM generate_series(1,5) i
    ON CONFLICT(username) DO UPDATE SET display_name=EXCLUDED.display_name,
      initial_password=EXCLUDED.initial_password,active=true
  `);
}

function csv(rows){
  const cols=["username","display_name","role","team_code","initial_password","active"];
  const q=v=>'"'+String(v??"").replaceAll('"','""')+'"';
  return [cols.join(","),...rows.map(r=>cols.map(c=>q(r[c])).join(","))].join("\r\n");
}

export default async function(req,res){
  await provision();
  const q=await db.query(`
    SELECT m.username,m.display_name,m.role,t.code AS team_code,
           m.initial_password,m.active
    FROM member_accounts m LEFT JOIN teams t ON t.id=m.team_id
    ORDER BY CASE WHEN m.role='participant' THEN 0 ELSE 1 END,m.username
  `);
  if(String(req.query?.format||"").toLowerCase()==="csv"){
    res.setHeader("content-type","text/csv; charset=utf-8");
    res.setHeader("content-disposition",'attachment; filename="jse-member-accounts.csv"');
    return res.send(csv(q.rows));
  }
  res.json({accounts:q.rows,count:q.rows.length});
}
