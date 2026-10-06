const A=window.__HATCHABLE__.api,$=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let pendingShort=null,knownIds=new Set(),firstLoad=true,loading=false,refreshQueued=false,pendingIds=new Set(),currentRows=[];
function review(x){return x.short_selling?'<span class="warning-ribbon short">SHORT SELLING</span>':'<span class="ok-ribbon">CLEAR</span>'}
function closeShortPopup(){const p=$('#shortPopup');if(p){p.style.display='none';p.setAttribute('aria-hidden','true')}pendingShort=null}
function showShortPopup(x){pendingShort=x;const p=$('#shortPopup');$('#shortText').textContent='Order '+(x.order_code||'')+' for '+(x.team||'participant')+' is a SELL order for '+Number(x.quantity||0).toLocaleString('en-IN')+' shares, but the participant holds only '+Number(x.holding_qty||0).toLocaleString('en-IN')+' shares. This is SHORT SELLING and requires explicit Exchange approval.';p.style.display='flex';p.setAttribute('aria-hidden','false')}
async function confirmShortApproval(){const x=pendingShort;if(!x)return;closeShortPopup();await act(x.id,x.kind,'APPROVE',true)}
function requestApproval(x){if(x.short_selling)showShortPopup(x);else act(x.id,x.kind,'APPROVE',false)}
function render(rows){
  const visible=(rows||[]).filter(x=>!pendingIds.has(String(x.id)+':'+String(x.kind)));
  $('#metrics').innerHTML='<div class="metric"><span>Pending</span><b>'+visible.length+'</b></div><div class="metric"><span>Trade Orders</span><b>'+visible.filter(x=>x.kind==='PARTICIPANT').length+'</b></div><div class="metric"><span>Short Selling</span><b style="color:#a23a43">'+visible.filter(x=>x.short_selling).length+'</b></div><div class="metric"><span>Action</span><b style="font-size:14px">REVIEW</b></div>';
  $('#updated').textContent='Review queue • '+new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  if(!visible.length){$('#app').innerHTML='<div class="empty">No transactions are waiting for exchange settlement.</div>';return}
  $('#app').innerHTML='<div class="settlement-cards">'+visible.map(x=>'<article class="settlement-order-card '+(x.short_selling?'has-warning':'')+'"><div class="order-card-top"><div><span class="order-code">'+esc(x.order_code)+'</span><span class="kind">'+esc(x.kind)+'</span></div><div>'+review(x)+'</div></div><div class="order-card-main"><div class="order-party"><span>TEAM / INVESTOR</span><b>'+esc(x.team)+'</b></div><div class="order-party"><span>BROKER</span><b>'+esc(x.broker)+'</b></div><div class="order-party stock-party"><span>STOCK / IPO</span><b>'+esc(x.stock)+'</b></div></div><div class="order-card-stats"><div><span>SIDE</span><strong class="'+(String(x.side).toUpperCase()==='BUY'?'buy-side':'sell-side')+'">'+esc(x.side)+'</strong></div><div><span>QUANTITY</span><strong>'+Number(x.quantity||0).toLocaleString('en-IN')+'</strong></div><div><span>PRICE</span><strong>₹'+Number(x.price||0).toLocaleString('en-IN')+'</strong></div></div><div class="order-card-actions"><button class="approve" onclick="requestApproval('+JSON.stringify(x).replace(/"/g,'&quot;')+')">✓ APPROVE</button><button class="reject" onclick="act('+Number(x.id)+',&quot;'+esc(x.kind)+'&quot;,&quot;REJECT&quot;)">✕ REJECT</button></div></article>').join('')+'</div>';
}
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