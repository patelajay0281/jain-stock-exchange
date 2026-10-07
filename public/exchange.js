const A=window.__HATCHABLE__.api,$=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let pendingShort=null,knownIds=new Set(),firstLoad=true,loading=false,refreshQueued=false,pendingIds=new Set(),currentRows=[];
function review(x){return x.short_selling?'<span class="warning-ribbon short">SHORT SELLING</span>':'<span class="ok-ribbon">CLEAR</span>'}
function closeShortPopup(){const p=$('#shortPopup');if(p){p.style.display='none';p.setAttribute('aria-hidden','true')}pendingShort=null}
function showShortPopup(x){pendingShort=x;const p=$('#shortPopup');$('#shortText').textContent='Order '+(x.order_code||'')+' for '+(x.team||'customer team')+' attempts to sell '+Number(x.quantity||0).toLocaleString('en-IN')+' shares while only '+Number(x.holding_qty||0).toLocaleString('en-IN')+' are held. SHORT SELLING IS NOT POSSIBLE. Exchange cannot approve this order and it must be rejected.';p.style.display='flex';p.setAttribute('aria-hidden','false')}
async function load(){
  if(loading){refreshQueued=true;return}
  loading=true;
  try{
    const r=await fetch(A+'/exchange',{cache:'no-store'});
    if(!r.ok){$('#app').innerHTML='<div class="empty">Exchange Admin access required.</div>';return}
    const d=await r.json(),rows=d.transactions||[];
    const ids=new Set(rows.map(x=>String(x.id)+':'+String(x.kind)));
    if(!firstLoad){const fresh=rows.filter(x=>!knownIds.has(String(x.id)+':'+String(x.kind))&&x.short_selling);if(fresh.length)showShortPopup(fresh[0])}
    knownIds=ids;firstLoad=false;currentRows=rows;render(currentRows);
  }catch(e){$('#updated').textContent='Connection error'}
  finally{loading=false;if(refreshQueued){refreshQueued=false;requestAnimationFrame(load)}}
}
async function act(id,k,a,confirmShort){
  const key=String(id)+':'+String(k);pendingIds.add(key);render(currentRows);
  try{
    const r=await fetch(A+'/exchange',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({order_id:id,kind:k,action:a,confirm_short_selling:!!confirmShort})});
    const d=await r.json().catch(()=>({}));
    if(!r.ok){
      pendingIds.delete(key);render(currentRows);
      if(d.code==='SHORT_SELLING_CONFIRM_REQUIRED'){const row=currentRows.find(x=>String(x.id)===String(id)&&x.kind===k)||{id,kind:k,short_selling:true,quantity:d.requested_quantity,holding_qty:d.holding_quantity};showShortPopup(row);return}
      alert(d.error||'Exchange action failed');return
    }
    pendingIds.delete(key);currentRows=currentRows.filter(x=>!(String(x.id)===String(id)&&x.kind===k));render(currentRows);load();
  }catch(e){pendingIds.delete(key);render(currentRows);alert('Exchange action could not be completed. Please retry.')}
}
load();
try{const liveEvents=hatchable.events.connect();liveEvents.channel('market').on('order_created',()=>load());liveEvents.channel('market').on('order_approved',()=>load())}catch(e){}