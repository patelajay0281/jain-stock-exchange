(() => {
  const channels = new Map();
  const lastState = { realtime:null, market:null, approved:new Set(), started:false, timer:null };
  const key=(type,id)=>String(type)+":"+String(id);

  function ensureChannel(name){
    if(!channels.has(name)) channels.set(name,new Map());
    return channels.get(name);
  }

  function emit(channel,event,payload){
    const events=ensureChannel(channel).get(event)||[];
    for(const fn of events){ try{ fn({payload}); }catch(_){} }
  }

  async function pull(){
    try{
      const r=await fetch("/api/realtime",{cache:"no-store"});
      if(!r.ok)return;
      const next=await r.json();
      const prev=lastState.realtime;
      lastState.realtime=next;

      if(!prev){
        try{
          const er=await fetch("/api/event-status",{cache:"no-store"});
          if(er.ok){
            const d=await er.json();
            for(const x of d.approved_orders||[])lastState.approved.add(key(x.asset_type,x.asset_id)+":"+x.order_id);
          }
        }catch(_){}
        return;
      }

      if(Number(next.max_order_id||0)>Number(prev.max_order_id||0) ||
         Number(next.max_institutional_order_id||0)>Number(prev.max_institutional_order_id||0)){
        emit("market","order_created",{});
      }

      if(String(next.stock_updated_at)!==String(prev.stock_updated_at) ||
         String(next.ipo_updated_at)!==String(prev.ipo_updated_at)){
        try{
          const mr=await fetch("/api/market",{cache:"no-store"});
          if(mr.ok){
            const d=await mr.json();
            const combined=[...(d.stocks||[]).map(x=>({...x,_assetType:"stock"})),...(d.ipos||[]).map(x=>({...x,_assetType:"ipo"}))];
            const old=lastState.market||new Map();
            const now=new Map(combined.map(x=>[key(x._assetType,x.id),x]));
            for(const [k,x] of now){
              const o=old.get(k);
              if(o && Number(o.price)!==Number(x.price)){
                emit("market","price_updated",{asset_type:x._assetType,asset_id:Number(x.id),price:Number(x.price)});
              }
            }
            lastState.market=now;
          }
        }catch(_){}
      }

      if(Number(next.max_action_id||0)>Number(prev.max_action_id||0) ||
         Number(next.max_audit_id||0)>Number(prev.max_audit_id||0)){
        try{
          const er=await fetch("/api/event-status",{cache:"no-store"});
          if(er.ok){
            const d=await er.json();
            for(const x of d.approved_orders||[]){
              const k=key(x.asset_type,x.asset_id)+":"+x.order_id;
              if(!lastState.approved.has(k)){
                lastState.approved.add(k);
                emit("market","order_approved",x);
              }
            }
          }
        }catch(_){}
      }
    }catch(_){}
  }

  function start(){
    if(lastState.started)return;
    lastState.started=true;
    pull();
    lastState.timer=setInterval(pull,1200);
  }

  window.hatchable = window.hatchable || {};
  window.hatchable.events = {
    connect(){
      return {
        channel(name){
          const bucket=ensureChannel(name);
          return {
            on(event,fn){
              if(!bucket.has(event))bucket.set(event,[]);
              bucket.get(event).push(fn);
              start();
              return this;
            }
          };
        }
      };
    }
  };
})();
