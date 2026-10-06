(async()=>{
  const publicPaths=new Set(["/","/login.html","/admin.html","/member-accounts.html"]);
  if(publicPaths.has(location.pathname)) return;
  try{
    const member=await fetch("/api/member-me",{cache:"no-store"});
    if(member.ok){
      const d=await member.json();
      window.JSE_MEMBER=d.member||null;
      return;
    }
    const admin=await fetch("/api/admin-state",{cache:"no-store"});
    if(admin.ok){
      window.JSE_MEMBER={username:"JSE-ADMIN",display_name:"JSE Administrator",role:"admin"};
      return;
    }
    const next=location.pathname+location.search+location.hash;
    location.replace("/login.html?next="+encodeURIComponent(next));
  }catch(_){
    const next=location.pathname+location.search+location.hash;
    location.replace("/login.html?next="+encodeURIComponent(next));
  }
})();