import { db } from "../src/hatchable-compat.js";

export const access="public";
export const methods=["POST"];

async function sha256Hex(value){
  const bytes=new TextEncoder().encode(value);
  const digest=await crypto.subtle.digest("SHA-256",bytes);
  return Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,"0")).join("");
}

function token(){
  const bytes=new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(x=>x.toString(16).padStart(2,"0")).join("");
}

export default async function(req,res){
  const username=String(req.body?.username||"").trim().toUpperCase();
  const password=String(req.body?.password||"");
  if(!username||!password) return res.status(400).json({error:"User ID and password are required"});
  if(username!=="ADMINAP") return res.status(401).json({error:"Invalid administrator credentials"});
  const hash=await sha256Hex(password);
  const valid=Boolean((await db.query("SELECT 1 FROM admin_credentials WHERE id=1 AND password_sha256=$1",[hash])).rows[0]);
  if(!valid)return res.status(401).json({error:"Invalid administrator password"});
  const raw=token(),tokenHash=await sha256Hex(raw);
  await db.query("DELETE FROM admin_sessions WHERE expires_at < now()");
  await db.query("INSERT INTO admin_sessions(token_sha256,expires_at) VALUES($1,now()+INTERVAL '8 hours')",[tokenHash]);
  res.setHeader("set-cookie","jse_admin="+encodeURIComponent(raw)+"; Max-Age=28800; Path=/; HttpOnly; Secure; SameSite=Strict");
  res.json({ok:true,admin:{username:"ADMINAP",display_name:"JSE Administrator"}});
}
