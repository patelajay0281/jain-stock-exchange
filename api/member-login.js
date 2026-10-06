import { db } from "../lib/hatchable.js";
import { issueMember,setMemberCookie } from "../src/session.js";
export const access="public";
export const methods=["POST"];
export default async function(req,res){
 const username=String(req.body?.username||"").trim().toUpperCase();
 const accessCode=String(req.body?.access_code||"").trim();
 if(!username||!accessCode)return res.status(400).json({error:"Username and access code are required"});
 await db.query(`
   INSERT INTO member_accounts(username,display_name,role,team_id,initial_password,must_change_password,active)
   SELECT 'TEAM-'||lpad(i::text,3,'0')||v.suffix,
          'TEAM-'||lpad(i::text,3,'0')||' Participant '||substr(v.suffix,2,1),
          'participant',t.id,
          'JSE26-'||lpad(i::text,3,'0')||v.suffix||'!',true,true
   FROM generate_series(1,100) i
   CROSS JOIN (VALUES ('-A'),('-B')) v(suffix)
   JOIN teams t ON t.code='TEAM-'||lpad(i::text,3,'0')
   ON CONFLICT(username) DO NOTHING
 `);
 const q=await db.query(`
   SELECT m.id,m.username,m.display_name,m.role,m.team_id,t.code AS team_code,m.initial_password
   FROM member_accounts m LEFT JOIN teams t ON t.id=m.team_id
   WHERE m.username=$1 AND m.active=true
   LIMIT 1
 `,[username]);

 const m=q.rows[0];
 if(!m || accessCode!==String(m.initial_password||"")) return res.status(401).json({error:"Invalid participant account or access code"});
 const token=await issueMember(m);
 res.setHeader("set-cookie",setMemberCookie(token));
 res.json({ok:true,member:{username:m.username,display_name:m.display_name,team:m.team_code,email:m.email||m.username}});
}
