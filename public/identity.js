(() => {
  let member=null, loading=false;
  const esc=s=>String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
  async function refresh(){
    try{const r=await fetch("/api/member-me",{cache:"no-store"});if(r.ok){const d=await r.json();member=d.member||null;window.JSE_MEMBER_STATE=member;refreshPill();return member}}
    catch(_){}
    member=null;window.JSE_MEMBER_STATE=null;refreshPill();return null;
  }
  function ensureUI(){
    if(location.pathname!="/order.html")return;
    if(document.getElementById("jseIdentityPill"))return;
    const pill=document.createElement("button");
    pill.id="jseIdentityPill";pill.type="button";
    pill.style.cssText="position:fixed;right:18px;bottom:18px;z-index:5000;border:1px solid #cbd5e1;background:#fff;color:#172f4b;border-radius:999px;padding:10px 14px;font:800 10px/1 Arial;box-shadow:0 8px 20px rgba(15,23,42,.12)";
    pill.onclick=showLogin;document.body.appendChild(pill);refreshPill();
  }
  function refreshPill(){
    const p=document.getElementById("jseIdentityPill");if(!p)return;
    p.textContent=member?("ACCOUNT · "+member.team+" · "+member.username):"PARTICIPANT ACCESS";
  }
  function showLogin(){
    let o=document.getElementById("jseMemberModal");
    if(!o){
      o=document.createElement("div");o.id="jseMemberModal";
      o.style.cssText="position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:6000;display:flex;align-items:center;justify-content:center;padding:18px";
      o.innerHTML='<div style="width:min(420px,100%);background:#fff;border-radius:16px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.18);font-family:Arial"><div style="font-size:11px;font-weight:900;letter-spacing:.08em;color:#155eef">JAIN STOCK EXCHANGE</div><h2 style="margin:8px 0;color:#172f4b">Participant Access</h2><p style="font-size:12px;color:#667085;margin:0 0 16px">Use the account issued by the Event Admin. Your account determines the team recorded in the Audit Log.</p><label style="font-size:10px;font-weight:800;color:#475467">USERNAME</label><input id="jseUser" style="width:100%;height:42px;box-sizing:border-box;margin:6px 0 12px;padding:0 10px" placeholder="TEAM-001-A" autocomplete="username"><label style="font-size:10px;font-weight:800;color:#475467">ACCESS CODE</label><input id="jseCode" type="password" style="width:100%;height:42px;box-sizing:border-box;margin:6px 0 16px;padding:0 10px" placeholder="Access code" autocomplete="current-password"><div style="display:flex;gap:8px"><button id="jseLogin" style="flex:1;height:42px;border:0;border-radius:8px;background:#172f4b;color:#fff;font-weight:850">SIGN IN</button><button id="jseCancel" style="width:100px;height:42px;border:1px solid #d0d5dd;border-radius:8px;background:#fff">CANCEL</button></div><div id="jseLoginMsg" style="font-size:10px;color:#a23a43;margin-top:10px"></div></div>';
      document.body.appendChild(o);
      o.querySelector("#jseCancel").onclick=()=>o.remove();
      const doLogin=async()=>{if(loading)return;loading=true;const u=o.querySelector("#jseUser"),c=o.querySelector("#jseCode"),msg=o.querySelector("#jseLoginMsg"),btn=o.querySelector("#jseLogin");btn.disabled=true;msg.textContent="Signing in…";try{const r=await fetch("/api/member-login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:u.value.trim(),access_code:c.value.trim()})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Sign in failed");member=d.member;window.JSE_MEMBER_STATE=member;o.remove();refreshPill();window.dispatchEvent(new CustomEvent("jse:member",{detail:member}));}catch(e){msg.textContent=e.message||"Sign in failed";btn.disabled=false}finally{loading=false}};
      o.querySelector("#jseLogin").onclick=doLogin;
      o.querySelector("#jseCode").addEventListener("keydown",e=>{if(e.key==="Enter")doLogin()});
    }
    o.style.display="flex";o.querySelector("#jseUser").focus();
  }
  async function login(){if(member)return member;showLogin();return new Promise(resolve=>{const done=()=>{window.removeEventListener("jse:member",done);resolve(member)};window.addEventListener("jse:member",done)})}
  async function logout(){await fetch("/api/member-logout",{method:"POST"});member=null;window.JSE_MEMBER_STATE=null;refreshPill();return true}
  window.JSE_MEMBER={get:()=>member||window.JSE_MEMBER_STATE||null,login,logout,show:showLogin,refresh};
  document.addEventListener("DOMContentLoaded",()=>{ensureUI();refresh()});
})();