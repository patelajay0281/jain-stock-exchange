import { db } from "../lib/hatchable.js";
export const access="public";
export const methods=["POST"];

async function sha256Hex(value){
  const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(String(value)));
  return Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,"0")).join("");
}

export default async function(req,res){
  const raw=req.cookies?.jse_member||"";
  if(raw){
    const tokenHash=await sha256Hex(raw);
    const q=await db.query(`
      SELECT m.id,m.username,m.role,m.team_id,t.code AS team_code
      FROM member_sessions s JOIN member_accounts m ON m.id=s.member_id
      LEFT JOIN teams t ON t.id=m.team_id
      WHERE s.token_sha256=$1 LIMIT 1
    `,[tokenHash]);
    const m=q.rows[0];
    await db.query("DELETE FROM member_sessions WHERE token_sha256=$1",[tokenHash]);
    if(m){
      await db.query(
        "INSERT INTO audit_log(actor_id,actor_email,actor_role,team_id,action,details) VALUES($1,$2,$3,$4,'MEMBER_LOGOUT',$5)",
        [m.username,m.username,m.role,m.team_id,JSON.stringify({team_code:m.team_code})]
      );
    }
  }
  res.setHeader("set-cookie","jse_member=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax");
  res.json({ok:true});
}
