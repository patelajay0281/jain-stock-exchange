import { db } from "../lib/hatchable.js";

export const access="public";
export const methods=["POST"];

async function sha256Hex(value){
  const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(String(value)));
  return Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,"0")).join("");
}
function makeToken(){
  const b=new Uint8Array(32); crypto.getRandomValues(b);
  return Array.from(b).map(x=>x.toString(16).padStart(2,"0")).join("");
}

export default async function(req,res){
  const username=String(req.body?.username||"").trim().toUpperCase();
  const password=String(req.body?.password||"");
  if(!username||!password) return res.status(400).json({error:"Username and password are required."});

  const q=await db.query(`
    SELECT m.id,m.username,m.display_name,m.role,m.team_id,t.code AS team_code,
           m.password_sha256,m.initial_password,m.must_change_password
    FROM member_accounts m
    LEFT JOIN teams t ON t.id=m.team_id
    WHERE upper(m.username)=upper($1) AND m.active=true
    LIMIT 1
  `,[username]);
  const account=q.rows[0];
  if(!account) return res.status(401).json({error:"Invalid member account or password."});

  const supplied=await sha256Hex(password);
  const valid=account.password_sha256
    ? supplied===account.password_sha256
    : password===String(account.initial_password||"");
  if(!valid) return res.status(401).json({error:"Invalid member account or password."});

  await db.query("UPDATE member_accounts SET password_sha256=$1,must_change_password=false,updated_at=now() WHERE id=$2",[supplied,account.id]);

  const raw=makeToken(), tokenHash=await sha256Hex(raw);
  await db.query("DELETE FROM member_sessions WHERE expires_at<now()");
  await db.query("INSERT INTO member_sessions(member_id,token_sha256,expires_at) VALUES($1,$2,now()+INTERVAL '12 hours')",[account.id,tokenHash]);

  await db.query(
    "INSERT INTO audit_log(actor_id,actor_email,actor_role,team_id,action,details) VALUES($1,$2,$3,$4,'MEMBER_LOGIN',$5)",
    [account.username,account.username,account.role,account.team_id,JSON.stringify({display_name:account.display_name,team_code:account.team_code})]
  );

  res.setHeader("set-cookie","jse_member="+encodeURIComponent(raw)+"; Max-Age=43200; Path=/; HttpOnly; Secure; SameSite=Lax");
  res.json({
    ok:true,
    member:{
      username:account.username,
      display_name:account.display_name,
      role:account.role,
      team_id:account.team_id,
      team_code:account.team_code
    },
    must_change_password:false
  });
}
