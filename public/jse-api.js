(() => {
  const API = "https://yxmztxtbgqkvardwgrak.supabase.co/functions/v1/jse-api";
  function makeHeaders(init) {
    const h = new Headers(init && init.headers ? init.headers : {});
    h.set("Accept","application/json");
    if (init && init.body && typeof init.body === "string" && !h.has("Content-Type")) h.set("Content-Type","application/json");
    const token = localStorage.getItem("jse_token");
    if (token) h.set("Authorization","Bearer "+token);
    return h;
  }
  async function request(path, init={}) {
    const value=String(path);
    const url=value.startsWith("http")?value:API+(value.startsWith("/")?value:"/"+value);
    const opts={...init,headers:makeHeaders(init)};
    for(let attempt=0;attempt<3;attempt++){
      try{
        const r=await fetch(url,opts);
        if(r.ok || ![429,502,503,504].includes(r.status) || attempt===2) return r;
        await new Promise(x=>setTimeout(x,700*(attempt+1)));
      }catch(e){
        if(attempt===2) throw e;
        await new Promise(x=>setTimeout(x,700*(attempt+1)));
      }
    }
    throw new Error("API request failed");
  }
  window.JSE_API=API;
  window.jseFetch=request;
})();