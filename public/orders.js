const A=window.__HATCHABLE__.api,$=s=>document.querySelector(s);
const money=n=>'₹'+Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:0});
const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
let page=1;
async function load(){
 const status=$('#status').value,team=$('#team').value,q=$('#search').value.trim(),limit=$('#limit').value;
 const p=new URLSearchParams({page,limit});if(status)p.set('status',status);if(team)p.set('team',team);if(q)p.set('q',q);
 const r=await fetch(A+'/tracking?'+p,{cache:'no-store'});if(!r.ok){$('#app').innerHTML='<div class="empty-state">Access required to track orders.</div>';return}
 const d=await r.json(),s=d.summary||{},rows=d.rows||[];
 $('#summary').innerHTML=
 '<div class="summary-box"><span>Total Orders</span><b>'+s.total.toLocaleString('en-IN')+'</b></div>'+
 '<div class="summary-box"><span>Pending Exchange</span><b>'+s.pending.toLocaleString('en-IN')+'</b></div>'+
 '<div class="summary-box"><span>Exchange Approved</span><b>'+s.exchange_approved.toLocaleString('en-IN')+'</b></div>'+
 '<div class="summary-box"><span>Settled</span><b>'+s.settled.toLocaleString('en-IN')+'</b></div>'+
 '<div class="summary-box"><span>Exchange Rejected</span><b>'+s.exchange_rejected.toLocaleString('en-IN')+'</b></div>'+
 '<div class="summary-box"><span>Bank Rejected</span><b>'+s.bank_rejected.toLocaleString('en-IN')+'</b></div>'+
 '<div class="summary-box"><span>Total Order Value</span><b>'+money(s.trade_value)+'</b></div>'+
 '<div class="summary-box"><span>Total Brokerage</span><b>'+money(s.brokerage)+'</b></div>';
 if(!rows.length){$('#app').innerHTML='<div class="empty-state">No orders match the selected filters.</div>'}else{
 $('#app').innerHTML='<div class="table-wrap"><table class="tracking-table"><thead><tr><th>Order</th><th>Team</th><th>Broker</th><th>Stock / IPO</th><th>Side</th><th>Qty</th><th>Price</th><th>Trade Value</th><th>Brokerage</th><th>Amount</th><th>Status</th></tr></thead><tbody>'+
 rows.map(x=>{const buy=x.side==='BUY',tv=Number(x.trade_value||0),bc=Number(x.brokerage||0),net=buy?tv+bc:tv-bc;return '<tr><td class="order-code">'+esc(x.order_code)+'</td><td><b>'+esc(x.team)+'</b></td><td>'+esc(x.broker)+'</td><td>'+esc(x.stock)+'</td><td class="'+(buy?'side-buy':'side-sell')+'">'+x.side+'</td><td>'+x.quantity+'</td><td class="value">'+money(x.price)+'</td><td class="value">'+money(tv)+'</td><td class="value brokerage">'+money(bc)+'</td><td class="value">'+money(net)+'</td><td><span class="status">'+esc(x.status)+'</span></td></tr>'}).join('')+'</tbody></table></div>'}
 const pg=d.pagination;
 $('#pager').innerHTML='<button id="prev" '+(pg.page<=1?'disabled':'')+'>← Previous</button><span>Page '+pg.page+' of '+pg.pages+' · '+pg.total.toLocaleString('en-IN')+' matching orders</span><button id="next" '+(pg.page>=pg.pages?'disabled':'')+'>Next →</button>';
 $('#prev').onclick=()=>{if(page>1){page--;load()}};$('#next').onclick=()=>{if(page<pg.pages){page++;load()}};
 if(!$('#team').options.length){$('#team').innerHTML='<option value="">All teams</option>'+d.filters.teams.map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join('')}
}
$('#status').onchange=()=>{page=1;load()};$('#team').onchange=()=>{page=1;load()};$('#limit').onchange=()=>{page=1;load()};$('#refresh').onclick=load;
let timer;$('#search').oninput=()=>{clearTimeout(timer);timer=setTimeout(()=>{page=1;load()},250)};load();setInterval(load,10000);