(()=>{"use strict";
const A=window.JSE_API||"/api";
const nativeFetch=window.fetch.bind(window);
function withAuth(input,init){
  const opts=init?{...init}:{};
  const h=new Headers(opts.headers||{});
  const t=localStorage.getItem("jse_token");
  if(t&&!h.has("Authorization"))h.set("Authorization","Bearer "+t);
  opts.headers=h; opts.cache="no-store";
  return [input,opts];
}
window.fetch=(input,init)=>nativeFetch(...withAuth(input,init));
async function adminLoginFixed(){
  const user=(document.querySelector("#adminUsername")?.value||"").trim().toUpperCase();
  const pass=document.querySelector("#adminPassword")?.value||"";
  const msg=document.querySelector("#adminLoginMsg"),btn=document.querySelector("#adminLoginBtn");
  if(!user||!pass){if(msg)msg.textContent="Enter the User ID and password.";return}
  if(btn)btn.disabled=true;if(msg)msg.textContent="Signing in…";
  try{
    const r=await nativeFetch(A+"/admin-login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:user,password:pass}),cache:"no-store"});
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw Error(d.error||"Administrator login failed.");
    if(d.token)localStorage.setItem("jse_token",d.token);
    location.reload();
  }catch(e){if(msg)msg.textContent=e.message||"Administrator login failed.";if(btn)btn.disabled=false}
}
window.loginAdmin=adminLoginFixed;
async function downloadArchiveFixed(){
  const b=document.querySelector("#downloadArchive");if(b)b.disabled=true;
  try{
    if(window.currentStatus&&window.currentStatus!=="FINALIZED")throw Error("The Excel report is available only after FINALIZE EVENT.");
    const r=await nativeFetch(A+"/export-event",{headers:{Accept:"application/json"},cache:"no-store"});
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw Error(d.error||"Final Excel archive could not be generated.");
    if(d.event?.status!=="FINALIZED")throw Error("The event archive is not finalized. Please FINALIZE the event first.");
    const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    const sheets=[];const data=d.data&&typeof d.data==="object"?d.data:{};
    for(const [name,rows0] of Object.entries(data)){
      const rows=Array.isArray(rows0)?rows0:[];const cols=[...new Set(rows.flatMap(x=>Object.keys(x||{})))];
      const head="<Row>"+cols.map(k=>"<Cell><Data ss:Type=\"String\">"+esc(k)+"</Data></Cell>").join("")+"</Row>";
      const body=rows.map(row=>"<Row>"+cols.map(k=>{const v=row?.[k];return "<Cell><Data ss:Type=\"String\">"+esc(typeof v==="object"?JSON.stringify(v):v)+"</Data></Cell>"}).join("")+"</Row>").join("");
      sheets.push("<Worksheet ss:Name=\""+esc(name).slice(0,31)+"\"><Table>"+head+body+"</Table></Worksheet>");
    }
    const xml='<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="Default"><Alignment ss:Vertical="Center"/></Style></Styles>'+sheets.join("")+"</Workbook>";
    const blob=new Blob([xml],{type:"application/vnd.ms-excel;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download="JSE-final-event-report.xls";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
    if(window.setMsg)window.setMsg("Final Excel report downloaded.","success");
  }catch(e){if(window.setMsg)window.setMsg(e.message||"Excel report export failed","error");else alert(e.message)}
  finally{if(b)b.disabled=window.currentStatus!=="FINALIZED"}
}
window.downloadArchive=downloadArchiveFixed;
window.addEventListener("load",()=>{
  document.querySelectorAll("#adminUsername,#adminPassword").forEach(el=>el.addEventListener("keydown",e=>{if(e.key==="Enter")window.loginAdmin()}));
  const t=localStorage.getItem("jse_token"); if(t) document.body.dataset.adminToken="1";
  document.querySelectorAll("button").forEach(btn=>{
    btn.addEventListener("click",()=>{
      if(btn.disabled)return;
      btn.dataset.busyAt=String(Date.now());
    },{capture:true});
  });
});
})();