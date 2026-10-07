const A=window.__HATCHABLE__.api,$=s=>document.querySelector(s),m=n=>'₹'+Math.round(Number(n||0)).toLocaleString('en-IN');
let state=[],ipos=[],approvedKeys=[],indexBase=0;

function key(type,id){return String(type)+':'+String(id)}
function updateList(oldList,newList,type){
 return (newList||[]).map(n=>{
  const old=oldList.find(x=>Number(x.id)===Number(n.id));
  const base=Number(n.previous_price ?? old?.previous_price ?? n.price ?? 0);
  const price=Number(n.price||0);
  return {...n,_assetType:type,previous_price:base,change_pct:base?((price-base)*100/base):Number(n.change_pct||0)};
 });
}
function render(){
 const all=[...ipos,...state],map=new Map(all.map(x=>[key(x._assetType||'stock',x.id),x]));
 const ordered=[];
 for(const k of approvedKeys){const x=map.get(k);if(x&&!ordered.includes(x))ordered.push(x);}
 for(const x of all)if(!ordered.includes(x))ordered.push(x);
 $('#stocks').innerHTML=ordered.map(s=>{
  const c=Number(s.change_pct||0),up=c>=0;
  return '<div class="heat-stock '+(up?'heat-up':'heat-down')+'"><div class="tile-top"><b>'+s.name+'</b><small>'+((s._assetType==='ipo')?'IPO':'EQUITY')+'</small></div><span>'+m(s.price)+'</span><em>'+((s.symbol?s.symbol+' · ':'')+(up?'▲ ':'▼ ')+Math.abs(c).toFixed(2)+'%')+'</em></div>';
 }).join('');
}
function applyApproved(type,id){
 const k=key(type,id);
 approvedKeys=[k,...approvedKeys.filter(x=>x!==k)];
 render();
}
function renderMarketStatus(status){
 const raw=String(status||"NOT_STARTED").toUpperCase();
 const label=raw==="LIVE"?"LIVE":raw==="PAUSED"?"PAUSED":(raw==="CLOSED"||raw==="FINALIZED")?"CLOSED":"NOT STARTED";
 const el=$("#marketStatus");
 if(!el)return;
 el.textContent=label;
 el.className="market-status status-"+label.toLowerCase().replace(/s+/g,"-");
}
function renderIndex(d){
 const v=Number(d?.value||0),c=Number(d?.change_pct||0),up=c>=0;
 $('#cms50Value').textContent=Math.round(v).toLocaleString('en-IN');
 $('#cms50Change').textContent=(up?'▲ ':'▼ ')+Math.abs(c).toFixed(2)+'%';
 $('#cms50Change').className=up?'cms50-up':'cms50-down';
}
async function load(){
 try{
  const r=await fetch(A+'/market');
  if(!r.ok)throw new Error('Market data unavailable');
  const d=await r.json();
  state=updateList(state,d.stocks||[],'stock');
  ipos=updateList(ipos,d.ipos||[],'ipo');
  render();
  indexBase=Number(d.index?.base_value||0);
  renderIndex(d.index||{});
  renderMarketStatus(d.status);
 }catch(e){
  const el=$("#marketStatus");
  if(el){el.textContent="RETRYING";el.className="market-status status-paused";}
 }
}
load();
const marketRefreshMs=localStorage.getItem("jse_token")?5000:10000;
let marketTimer=setInterval(()=>{if(document.visibilityState==="visible")load();},marketRefreshMs);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")load();});
try{
 hatchable.events.connect().channel('market').on('order_approved',ev=>{
  const p=ev?.payload||ev,type=p?.asset_type==='ipo'?'ipo':'stock',id=Number(p?.asset_id);
  if(id)applyApproved(type,id);
 });
 hatchable.events.connect().channel('market').on('price_updated',ev=>{
  const p=ev?.payload||ev,type=p?.asset_type==='ipo'?'ipo':'stock',id=Number(p?.asset_id),price=Number(p?.price||0);
  if(!id)return;
  const list=type==='ipo'?ipos:state,x=list.find(i=>Number(i.id)===id);
  if(x){
   x.price=price;
   const base=Number(x.previous_price||price);
   x.change_pct=base?((price-base)*100/base):0;
  }
  render();
  const total=[...state,...ipos].reduce((n,x)=>n+Number(x.price||0),0);
  renderIndex({value:total,change_pct:indexBase?((total-indexBase)*100/indexBase):0});
 });
}catch(e){}