import { db } from "../lib/hatchable.js";
import { issueMember,setMemberCookie } from "../src/session.js";
export const access="public";
export const methods=["POST"];
export default async function(req,res){
 const username=String(req.body?.username||"").trim().toUpperCase();
 const accessCode=String(req.body?.access_code||"").trim();
 if(!username||!accessCode)return res.status(400).json({error:"Username and access code are required"});
 const q=await db.query("SELECT r.id,r.username,r.display_name,r.email,r.team_id,t.code team_code FROM participant_registry r JOIN teams t ON t.id=r.team_id WHERE r.username=$1 AND r.access_code=$2 AND r.active=true LIMIT 1",[username,accessCode]);
 const m=q.rows[0];
 if(!m)return res.status(401).json({error:"Invalid participant account or access code"});
 const token=await issueMember(m);
 res.setHeader("set-cookie",setMemberCookie(token));
 res.json({ok:true,member:{username:m.username,display_name:m.display_name,team:m.team_code,email:m.email||m.username}});
}
