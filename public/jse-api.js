(() => {
  const API = "/api";
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
    const method=String(opts.method||"GET").toUpperCase();
    const retryable=method==="GET" || method==="HEAD" || method==="OPTIONS";
    const maxAttempts=retryable?3:1;
    for(let attempt=0;attempt<maxAttempts;attempt++){
      try{
        const r=await fetch(url,opts);
        if(r.ok || ![429,502,503,504].includes(r.status) || attempt===maxAttempts-1) return r;
        await new Promise(x=>setTimeout(x,700*(attempt+1)));
      }catch(e){
        if(attempt===maxAttempts-1) throw e;
        await new Promise(x=>setTimeout(x,700*(attempt+1)));
      }
    }
    throw new Error("API request failed");
  }
  window.JSE_API=API;
  window.__HATCHABLE__=window.__HATCHABLE__||{};
  window.__HATCHABLE__.api=API;
  window.hatchable=window.hatchable||{};
  window.hatchable.events=window.hatchable.events||{connect(){return{channel(){return{on(){return this;}}}}}};
  window.jseFetch=request;
})();