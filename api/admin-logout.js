export const access="public";
export const methods=["POST"];
export default async function(req,res){
  const cookie=req.cookies?.jse_admin||"";
  if(cookie){
    const bytes=new TextEncoder().encode(cookie);
    const digest=await crypto.subtle.digest("SHA-256",bytes);
    const hash=Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,"0")).join("");
    const {db}=await import("../src/hatchable-compat.js");
    await db.query("DELETE FROM admin_sessions WHERE token_sha256=$1",[hash]);
  }
  res.setHeader("set-cookie","jse_admin=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict");
  res.json({ok:true});
}
