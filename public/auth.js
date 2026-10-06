(async()=>{
  const publicPaths=new Set(["/","/login.html","/admin.html","/member-accounts.html"]);
  if(publicPaths.has(location.pathname))return;
  try{
    const r=await fetch("/api/member-me",{cache:"no-store"});
    if(!r.ok){
      const next=location.pathname+location.search+location.hash;
      location.replace("/login.html?next="+encodeURIComponent(next));
      return;
    }
    const d=await r.json();
    const m=d.member;
    window.JSE_MEMBER=m;
    const nav=document.querySelector(".site-nav");
    if(nav&&m){
      const chip=document.createElement("span");
      chip.className="jse-user-chip";
      chip.textContent=(m.display_name||m.username||"Member")+" · "+(m.role||"member").toUpperCase();
      nav.appendChild(chip);
      const b=document.createElement("button");
      b.className="jse-logout-btn";
      b.type="button"; b.textContent="Sign Out";
      b.onclick=async()=>{
        await fetch("/api/member-logout",{method:"POST"});
        location.replace("/login.html");
      };
      nav.appendChild(b);
    }
  }catch(_){
    location.replace("/login.html");
  }
})();