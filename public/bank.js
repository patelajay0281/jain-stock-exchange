const A=window.__HATCHABLE__.api,$=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const money=n=>'₹'+Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:0});
let knownIds=new Set(),firstLoad=true,pendingWarning=null,loading=false,pendingIds=new Set();
function review(x){if(x.no_balance)return '<span class="warning-ribbon balance">NO BALANCE</span>';if(x.minimum_cash_warning)return '<span class="warning-ribbon balance">MIN CASH WARNING</span>';return '<span class="ok-ribbon">CLEAR</span>';}
function closeApprovalPopup(){const p=$('#approvalPopup');if(p){p.style.display='none';p.setAttribute('aria-hidden','true');}}
function closeWarningPopup(){const p=$('#warningPopup');if(p){p.style.display='none';p.setAttribute('aria-hidden','true');}pendingWarning=null;}
function showApprovalPopup(rows){const x=rows[0],p=$('#approvalPopup'),t=$('#approvalText');if(!p||!x)return;t.textContent=(x.side||'')+' order '+(x.order_code||'')+' for '+(x.team||x.investor||'participant')+' has been approved by Exchange Settlement and is now ready for CMS BANK LTD.';p.style.display='flex';p.setAttribute('aria-hidden','false');}
function askWarningApproval(x){pendingWarning=x;const p=$('#warningPopup'),t=$('#warningText'),h=$('#warningTitle'),b=$('#warningConfirmBtn');if(!p)return;
 const hardStop=String(x.approval_allowed)==='false'||x.no_balance;
 if(hardStop){h.textContent='NO BALANCE — NOT POSSIBLE';t.textContent='Order '+(x.order_code||'')+' for '+(x.team||x.investor||'customer team')+' requires '+money(x.required_cash)+' but the paying account has only '+money(x.available_cash)+'. Bank cannot approve or settle this transaction.';
   if(b){b.style.display='none';b.disabled=true;}p.style.display='flex';p.setAttribute('aria-hidden','false');return;}
 h.textContent='MINIMUM CASH WARNING — APPROVAL REQUIRED';
 t.textContent='Order '+(x.order_code||'')+' will leave '+(x.team||'customer team')+' below the ₹20,000 minimum cash buffer. Bank may continue only after explicit warning approval.';
 if(b){b.textContent='APPROVE WITH WARNING';b.style.display='inline-block';b.disabled=false;}
 p.style.display='flex';p.setAttribute('aria-hidden','false');
}
async function confirmWarningApproval(){const x=pendingWarning;if(!x)return;closeWarningPopup();await act(x.id,x.kind,'APPROVE');}
async function load(){if(loading)return;const scrollY=window.scrollY;loading=true;try{const r=await fetch(A+'/bank',{redirect:'manual',cache:'no-store'});if(r.status===401||r.type==='opaqueredirect'){window.location='/';return}if(r.status===403){$('#app').innerHTML='<div class="empty">Bank Admin access required.</div>';return}const d=await r.json(),serverRows=d.transactions||[];pendingIds.forEach(id=>{if(!serverRows.some(x=>String(x.id)===id))pendingIds.delete(id)});const rows=serverRows.filter(x=>!pendingIds.has(String(x.id)));const ids=new Set(rows.map(x=>String(x.id)));if(!firstLoad){const fresh=rows.filter(x=>!knownIds.has(String(x.id)));if(fresh.length)showApprovalPopup(fresh);}knownIds=ids;firstLoad=false;const warnings=rows.filter(x=>x.no_balance||x.minimum_cash_warning).length;$('#metrics').innerHTML='<div class="metric"><span>Pending</span><b>'+rows.length+'</b></div><div class="metric"><span>BUY Requests</span><b>'+rows.filter(x=>x.side==='BUY').length+'</b></div><div class="metric"><span>SELL Requests</span><b>'+rows.filter(x=>x.side==='SELL').length+'</b></div><div class="metric"><span>Warnings</span><b style="color:#a23a43">'+warnings+'</b></div><div class="metric"><span>Interest Earned</span><b>₹'+Number(d.interest_earned||0).toLocaleString('en-IN')+'</b></div>';$('#updated').textContent='Settlement queue • '+new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});if(!rows.length){$('#app').innerHTML='<div class="empty">No transactions are waiting for bank settlement.</div>';return}$('#app').innerHTML='<div class="settlement-cards">'+rows.map(x=>'<article class="settlement-order-card '+(x.no_balance?'has-warning':'')+'"><div class="order-card-top"><div><span class="order-code">'+esc(x.order_code)+'</span><span class="kind">'+esc(x.kind)+'</span></div><div>'+review(x)+'</div></div><div class="order-card-main"><div class="order-party"><span>TEAM / INVESTOR</span><b>'+esc(x.team)+'</b></div><div class="order-party"><span>BROKER</span><b>'+esc(x.broker)+'</b></div><div class="order-party stock-party"><span>STOCK / IPO</span><b>'+esc(x.stock)+'</b></div></div><div class="order-card-stats"><div><span>SIDE</span><strong class="'+(String(x.side).toUpperCase()==='BUY'?'buy-side':'sell-side')+'">'+esc(x.side)+'</strong></div><div><span>REQUIRED</span><strong>'+money(x.required_cash)+'</strong></div><div><span>AVAILABLE</span><strong>'+money(x.available_cash)+'</strong></div></div><div class="order-card-actions"><button class="approve" onclick="requestApproval('+Number(x.id)+',&quot;'+esc(x.kind)+'&quot;,'+JSON.stringify(x).replace(/"/g,'&quot;')+')">✓ APPROVE</button><button class="reject" onclick="act('+Number(x.id)+',&quot;'+esc(x.kind)+'&quot;,&quot;REJECT&quot;)">✕ REJECT</button></div></article>').join('')+'</div>'; }catch(e){$('#updated').textContent='Connection error';}finally{loading=false;if(scrollY>0)requestAnimationFrame(()=>window.scrollTo(0,scrollY))}}
function requestApproval(id,k,x){x.id=id;x.kind=k;if(x.no_balance||x.minimum_cash_warning){askWarningApproval(x);return}act(id,k,'APPROVE',false);}
async function act(id,k,a,warningAck){pendingIds.add(String(id));load();try{
 const r=await fetch(A+'/bank',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({order_id:id,kind:k,action:a,warning_ack:!!warningAck}),redirect:'manual'});
 const d=await r.json().catch(()=>({}));
 if(!r.ok){pendingIds.delete(String(id));load();alert(d.error||'Bank action failed');return}
 if(d.ok===false){
   pendingIds.delete(String(id));load();
   const row={id,kind:k,order_code:d.order_id?('Order '+d.order_id):'',team:d.team||'',investor:d.investor||'',required_cash:Number(d.required_cash||0),available_cash:Number(d.available_cash||0),no_balance:d.code==='INSUFFICIENT_BALANCE',approval_allowed:d.approval_allowed!==false,minimum_cash_warning:d.code==='MINIMUM_CASH_WARNING'};
   askWarningApproval(row);return;
 }
 pendingIds.delete(String(id));load();
 }catch(e){pendingIds.delete(String(id));load();alert('Bank action could not be completed. Please retry.')}
load();
try{
 const liveEvents=hatchable.events.connect();
 liveEvents.channel('market').on('order_approved',()=>load());
}catch(e){}