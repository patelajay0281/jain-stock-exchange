(async()=>{
  const publicPaths=new Set(["/","/login.html","/admin.html","/member-accounts.html"]);
  if(publicPaths.has(location.pathname)) return;
  try{
    let identity=null;
    const admin=await fetch("/api/admin-state",{cache:"no-store"});
    if(admin.ok) identity={username:"JSE-ADMIN",display_name:"JSE Administrator",role:"admin"};
    if(!identity){
      const r=await fetch("/api/member-me",{cache:"no-store"});
      if(!r.ok){
        const next=location.pathname+location.search+location.hash;
        location.replace("/login.html?next="+encodeURIComponent(next));
        return;
      }
      const d=await r.json();
      identity=d.member;
    }
    window.JSE_MEMBER=identity;

    const nav=document.querySelector(".site-nav");
    if(nav&&identity){
      const chip=document.createElement("span");
      chip.className="jse-user-chip";
      chip.textContent=(identity.display_name||identity.username||"Member")+" · "+String(identity.role||"member").toUpperCase();
      nav.appendChild(chip);

      const b=document.createElement("button");
      b.className="jse-logout-btn";
      b.type="button";
      b.textContent="SIGN OUT";
      b.onclick=async()=>{
        await fetch(identity.role==="admin"?"/api/admin-logout":"/api/member-logout",{method:"POST"});
        location.replace("/login.html");
      };
      nav.appendChild(b);
    }
  }catch(_){
    location.replace("/login.html");
  }
})();