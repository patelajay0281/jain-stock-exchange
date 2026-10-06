(() => {
  const STORAGE_KEY="jse_identity_v1";
  const read=()=>{try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"null")}catch(_){return null}};
  const write=x=>localStorage.setItem(STORAGE_KEY,JSON.stringify(x));
  const esc=s=>String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
  function ensureUI(){
    if(document.getElementById("jseIdentityPill"))return;
    const pill=document.createElement("button");
    pill.id="jseIdentityPill";pill.type="button";pill.textContent="PARTICIPANT ACCESS";
    pill.style.cssText="position:fixed;right:18px;bottom:18px;z-index:5000;border:1px solid #cbd5e1;background:#fff;color:#172f4b;border-radius:999px;padding:10px 14px;font:800 10px/1 Arial;box-shadow:0 8px 20px rgba(15,23,42,.12)";
    pill.onclick=show;
    document.body.appendChild(pill);
    refreshPill();
  }
  function refreshPill(){
    const x=read(),p=document.getElementById("jseIdentityPill");
    if(!p)return;p.textContent=x?("IDENTITY · "+(x.team||"TEAM")+" · "+(x.email||x.name||"MEMBER")):"PARTICIPANT ACCESS";
  }
  function show(){
    let o=document.getElementById("jseIdentityModal");
    if(!o){
      o=document.createElement("div");o.id="jseIdentityModal";
      o.style.cssText="position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:6000;display:flex;align-items:center;justify-content:center;padding:18px";
      o.innerHTML='<div style="width:min(420px,100%);background:#fff;border-radius:16px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.18);font-family:Arial"><div style="font-size:11px;font-weight:900;letter-spacing:.08em;color:#155eef">JAIN STOCK EXCHANGE</div><h2 style="margin:8px 0;color:#172f4b">Participant Access</h2><p style="font-size:12px;color:#667085;margin:0 0 16px">Set the member identity used in the Audit Log for this browser.</p><label style="font-size:10px;font-weight:800;color:#475467">TEAM</label><select id="jseIdTeam" style="width:100%;height:42px;margin:6px 0 12px"><option value="">Select team</option></select><label style="font-size:10px;font-weight:800;color:#475467">PARTICIPANT NAME</label><input id="jseIdName" style="width:100%;height:42px;box-sizing:border-box;margin:6px 0 12px;padding:0 10px" placeholder="Participant name"><label style="font-size:10px;font-weight:800;color:#475467">EMAIL</label><input id="jseIdEmail" type="email" style="width:100%;height:42px;box-sizing:border-box;margin:6px 0 16px;padding:0 10px" placeholder="participant@email.com"><div style="display:flex;gap:8px"><button id="jseIdSave" style="flex:1;height:42px;border:0;border-radius:8px;background:#172f4b;color:#fff;font-weight:850">SAVE ACCESS</button><button id="jseIdCancel" style="width:110px;height:42px;border:1px solid #d0d5dd;border-radius:8px;background:#fff">CANCEL</button></div><div id="jseIdMsg" style="font-size:10px;color:#a23a43;margin-top:10px"></div></div>';
      document.body.appendChild(o);
      const sel=o.querySelector("#jseIdTeam");
      for(let i=1;i<=100;i++){const op=document.createElement("option");op.value="TEAM-"+String(i).padStart(3,"0");op.textContent=op.value;sel.appendChild(op)}
      o.querySelector("#jseIdCancel").onclick=()=>o.remove();
      o.querySelector("#jseIdSave").onclick=()=>{const team=sel.value,name=o.querySelector("#jseIdName").value.trim(),email=o.querySelector("#jseIdEmail").value.trim();if(!team||!name||!email){o.querySelector("#jseIdMsg").textContent="Enter team, participant name and email.";return}write({team,name,email});o.remove();refreshPill();window.dispatchEvent(new CustomEvent("jse:identity",{detail:read()}));};
    }
    const x=read();o.querySelector("#jseIdTeam").value=x?.team||"";o.querySelector("#jseIdName").value=x?.name||"";o.querySelector("#jseIdEmail").value=x?.email||"";o.style.display="flex";
  }
  const originalFetch=window.fetch.bind(window);
  window.fetch=async(input,init={})=>{
    const x=read();
    if(x && (typeof input==="string"?input:input?.url||"").includes("/api/")){
      const h=new Headers(init.headers||((input instanceof Request)?input.headers:undefined)||{});
      h.set("X-JSE-Actor-Id",x.email||x.name||"participant");
      h.set("X-JSE-Actor-Email",x.email||"");
      h.set("X-JSE-Actor-Role","participant");
      h.set("X-JSE-Team",x.team||"");
      init={...init,headers:h};
    }
    return originalFetch(input,init);
  };
  window.JSE_IDENTITY={get:read,edit:show};
  document.addEventListener("DOMContentLoaded",()=>{ensureUI()});
})();