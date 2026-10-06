(() => {
  async function refresh(){
    try{
      const r=await fetch("/api/member-me",{cache:"no-store"});
      if(r.ok){
        const d=await r.json();
        window.JSE_MEMBER_STATE=d.member||null;
        return d.member||null;
      }
    }catch(_){}
    window.JSE_MEMBER_STATE=null;
    return null;
  }
  window.JSE_MEMBER=window.JSE_MEMBER||{
    get:()=>window.JSE_MEMBER_STATE||null,
    refresh,
    logout:async()=>{await fetch("/api/member-logout",{method:"POST"});window.JSE_MEMBER_STATE=null;return true}
  };
  document.addEventListener("DOMContentLoaded",refresh);
})();