const A=window.JSE_API;
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const money=n=>'₹'+Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:0});
let rows=[],loading=false,pending=new Set(),pendingWarning=null;

function renderMetrics(){
 const total=rows.length,noBal=rows.filter(x=>x.no_balance).length,warn=rows.filter(x=>x.minimum_cash_warning).length,inst=rows.filter(x=>x.kind==='INSTITUTION').length;
 $('metrics').innerHTML=
  '<div class="metric"><span>Pending Bank</span><b>'+total+'</b></div>'+
  '<div class="metric"><span>No Balance</span><b>'+noBal+'</b></div>'+
  '<div class="metric"><span>Minimum Cash Warnings</span><b>'+warn+'</b></div>'+
  '<div class="metric"><span>Institutional</span><b>'+inst+'</b></div>';
}
function risk(x){
 if(x.no_balance)return '<span class="warning-ribbon balance">NO BALANCE</span>';
 if(x.minimum_cash_warning)return '<span class="warning-ribbon balance">MIN CASH WARNING</span>';
 return '<span class="ok-ribbon">CLEAR</span>';
}
function render(){
 renderMetrics();
 $('updated').textContent='Updated '+new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
 if(!rows.length){$('app').innerHTML='<div class="empty">No exchange-approved orders are waiting for Bank settlement.</div>';return}
 $('app').innerHTML='<div class="table-wrap"><table class="settle-table"><thead><tr><th>Order</th><th>Customer Team</th><th>Payer</th><th>Broker</th><th>Security</th><th>Side</th><th>Qty</th><th>Required</th><th>Available</th><th>Cash After</th><th>Risk</th><th>Action</th></tr></thead><tbody>'+
 rows.map(x=>{
   const disabled=x.no_balance?' disabled style="opacity:.45;cursor:not-allowed"':'';
   return '<tr><td class="order-code">'+esc(x.order_code)+'</td><td><b>'+esc(x.team)+'</b></td><td>'+esc(x.payer)+'</td><td>'+esc(x.broker)+'</td><td>'+esc(x.stock)+'</td><td>'+esc(x.side)+'</td><td>'+Number(x.quantity).toLocaleString('en-IN')+'</td><td class="money">'+money(x.required_cash)+'</td><td class="money">'+money(x.available_cash)+'</td><td class="money">'+money(x.cash_after)+'</td><td>'+risk(x)+'</td><td><div class="actions"><button class="approve"'+disabled+' onclick="requestApproval('+x.id+')">APPROVE</button><button class="reject" onclick="rejectOrder('+x.id+')">REJECT</button></div></td></tr>';
 }).join('')+'</tbody></table></div>';
}
function closeApprovalPopup(){const p=$('#approvalPopup');if(p){p.style.display='none';p.setAttribute('aria-hidden','true')}}
function closeWarningPopup(){const p=$('#warningPopup');if(p){p.style.display='none';p.setAttribute('aria-hidden','true')}pendingWarning=null}
function showWarningPopup(x){
 pendingWarning=x;
 const p=$('#warningPopup'),h=$('#warningTitle'),t=$('#warningText'),b=$('#warningConfirmBtn');
 if(!p)return;
 if(x.no_balance||x.approval_allowed===false){
   h.textContent='NO BALANCE — NOT POSSIBLE';
   t.textContent='Order '+(x.order_code||('ORD-'+x.id))+' requires '+money(x.required_cash)+' but the payer has only '+money(x.available_cash)+'. The Bank cannot settle this transaction.';
   b.style.display='none';b.disabled=true;
 }else{
   h.textContent='MINIMUM CASH WARNING — APPROVAL REQUIRED';
   t.textContent='Settlement will leave the payer below the ₹20,000 minimum cash buffer. Bank must explicitly confirm this warning before settlement.';
   b.textContent='APPROVE WITH WARNING';b.style.display='inline-block';b.disabled=false;
 }
 p.style.display='flex';p.setAttribute('aria-hidden','false');
}
async function postAction(id,action,ack){
 const key=String(id);if(pending.has(key))return;pending.add(key);render();
 try{
   const r=await fetch(A+'/bank',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({order_id:id,action,warning_ack:!!ack})});
   const d=await r.json().catch(()=>({}));
   if(!r.ok){alert(d.error||'Bank action failed.');return}
   if(d.ok===false){
     const x=rows.find(r=>String(r.id)===String(id))||{};
     showWarningPopup({...x,...d,no_balance:d.code==='INSUFFICIENT_BALANCE'||x.no_balance,minimum_cash_warning:d.code==='MINIMUM_CASH_WARNING'});
     return;
   }
   await load();
 }catch(e){alert('Bank action failed. Please retry.')}
 finally{pending.delete(key);render()}
}
async function requestApproval(id){await postAction(id,'APPROVE',false)}
async function confirmWarningApproval(){const x=pendingWarning;if(!x||x.no_balance||x.approval_allowed===false)return;closeWarningPopup();await postAction(x.id,'APPROVE',true)}
async function rejectOrder(id){await postAction(id,'REJECT',false)}
async function load(){
 if(loading)return;loading=true;
 try{
  const r=await fetch(A+'/bank',{cache:'no-store'}),d=await r.json().catch(()=>({}));
  if(!r.ok){$('app').innerHTML='<div class="empty">Bank queue unavailable: '+esc(d.error||'Unknown error')+'</div>';return}
  rows=d.transactions||[];render();
 }catch(e){$('app').innerHTML='<div class="empty">Bank connection error. Retrying…</div>'}
 finally{loading=false}
}
load();
setInterval(load,3000);
try{hatchable.events.connect().channel('market').on('order_approved',load)}catch(_){}
