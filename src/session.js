function secret(){return String(globalThis.__JSE_ENV?.EVENT_ADMIN_PASSWORD||"jse-event-session-secret")}
const enc=new TextEncoder(),dec=x=>new TextDecoder().decode(x);
function b64(bytes){let s="";for(const x of bytes)s+=String.fromCharCode(x);return btoa(s).replaceAll("+","-").replaceAll("/","_").replaceAll("=","")}
function unb64(s){s=s.replaceAll("-","+").replaceAll("_","/");while(s.length%4)s+="=";const x=atob(s);return Uint8Array.from(x,c=>c.charCodeAt(0))}
async function sig(data){const k=await crypto.subtle.importKey("raw",enc.encode(secret()),{name:"HMAC",hash:"SHA-256"},false,["sign","verify"]);const d=await crypto.subtle.sign("HMAC",k,enc.encode(data));return b64(new Uint8Array(d))}
export async function issueMember(member){
 const payload=b64(enc.encode(JSON.stringify({id:member.id,username:member.username,display_name:member.display_name,team_id:member.team_id,team_code:member.team_code,email:member.email||null,exp:Date.now()+8*60*60*1000})));
 return payload+"."+await sig(payload);
}
export async function verifyMember(token){
 try{
  const [payload,signature]=String(token||"").split(".");
  if(!payload||!signature)return null;
  if(!(await crypto.subtle.verify("HMAC",await crypto.subtle.importKey("raw",enc.encode(secret()),{name:"HMAC",hash:"SHA-256"},false,["verify"]),unb64(signature),enc.encode(payload))))return null;
  const data=JSON.parse(dec(unb64(payload)));
  return data.exp>Date.now()?data:null;
 }catch(_){return null}
}
export function setMemberCookie(raw){return "jse_member="+encodeURIComponent(raw)+"; Max-Age=28800; Path=/; HttpOnly; Secure; SameSite=Lax"}
export function clearMemberCookie(){return "jse_member=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax"}
