const A=window.JSE_API;
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const money=n=>'₹'+Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:0});
let rows=[],loading=false,pending=new Set(),pollTimer=null;

function renderMetrics(){
 const total=rows.length,shorts=rows.filter(x=>x.short_selling).length,buys=rows.filter(x=>x.side==='BUY').length,sells=rows.filter(x=>x.side==='SELL').length;
 $('metrics').innerHTML=
   '<div class="metric"><span>Pending Exchange</span><b>'+total+'</b></div>'+
   '<div class="metric"><span>BUY Orders</span><b>'+buys+'</b></div>'+
   '<div class="metric"><span>SELL Orders</span><b>'+sells+'</b></div>'+
   '<div class="metric"><span>Short-Sell Attempts</span><b>'+shorts+'</b></div>';
}
function render(){
 renderMetrics();
 $('updated').textContent='Updated '+new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
 if(!rows.length){$('app').innerHTML='<div class="empty">No orders are waiting for Exchange review.</div>';return}
 $('app').innerHTML='<div class="table-wrap"><table class="settle-table"><thead><tr><th>Order</th><th>Customer Team</th><th>Broker</th><th>Security</th><th>Side</th><th>Qty</th><th>Price</th><th>Trade Value</th><th>Required Cash</th><th>Risk</th><th>Action</th></tr></thead><tbody>'+
 rows.map(x=>{
   const risk=x.short_selling?'<span class="warning-ribbon short">SHORT SELLING</span>':'<span class="ok-ribbon">CLEAR</span>';
   const action=x.short_selling
     ?'<button class="reject" onclick="requestApproval('+x.id+')">NOT POSSIBLE</button>'
     :'<button class="approve" onclick="approveOrder('+x.id+')">APPROVE</button>';
   return '<tr><td class="order-code">'+esc(x.order_code)+'</td><td><b>'+esc(x.team)+'</b></td><td>'+esc(x.broker)+'</td><td>'+esc(x.stock)+'</td><td>'+esc(x.side)+'</td><td>'+Number(x.quantity).toLocaleString('en-IN')+'</td><td class="money">'+money(x.price)+'</td><td class="money">'+money(x.trade_value)+'</td><td class="money">'+money(x.required_cash)+'</td><td>'+risk+'</td><td><div class="actions">'+action+'<button class="reject" onclick="rejectOrder('+x.id+')">REJECT</button></div></td></tr>';
 }).join('')+'</tbody></table></div>';
}
function showShortPopup(x){
 const p=$('#shortPopup');
 if(!p)return;
 $('#shortText').textContent='Order '+(x.order_code||('ORD-'+x.id))+' for '+(x.team||'customer team')+' attempts to sell '+Number(x.quantity||0).toLocaleString('en-IN')+' shares while only '+Number(x.holding_qty||0).toLocaleString('en-IN')+' are held. SHORT SELLING IS NOT POSSIBLE. This order cannot be approved.';
 p.style.display='flex';p.setAttribute('aria-hidden','false');window.pendingShort=x;
}
function closeShortPopup(){const p=$('#shortPopup');if(p){p.style.display='none';p.setAttribute('aria-hidden','true')}window.pendingShort=null}
async function requestApproval(id){
 const x=rows.find(r=>String(r.id)===String(id)); if(x)showShortPopup(x);
}
async function confirmShortApproval(){const x=window.pendingShort;if(!x)return;closeShortPopup();await rejectOrder(x.id)}
async function postAction(id,action){
 const key=String(id); if(pending.has(key))return; pending.add(key);render();
 try{
   const r=await fetch(A+'/exchange',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({order_id:id,action})});
   const d=await r.json().catch(()=>({}));
   if(!r.ok){alert(d.error||'Exchange action failed.');return}
   await load();
 }catch(e){alert('Exchange action failed. Please retry.')}
 finally{pending.delete(key);render()}
}
async function approveOrder(id){await postAction(id,'APPROVE')}
async function rejectOrder(id){await postAction(id,'REJECT')}
async function load(){
 if(loading)return;
 loading=true;
 try{
   const r=await fetch(A+'/exchange',{cache:'no-store'});
   const d=await r.json().catch(()=>({}));
   if(!r.ok){$('app').innerHTML='<div class="empty">Exchange queue unavailable: '+esc(d.error||'Unknown error')+'</div>';return}
   rows=d.transactions||[];
   render();
 }catch(e){$('app').innerHTML='<div class="empty">Exchange connection error. Retrying…</div>'}
 finally{loading=false}
}
load();
pollTimer=setInterval(load,3000);
try{hatchable.events.connect().channel('market').on('order_created',load).on('order_approved',load)}catch(_){}
