(()=>{"use strict";
const A=window.JSE_API||"/api";
const nativeFetch=window.fetch.bind(window);
function authFetch(input,init){
 const opts=init?{...init}:{},h=new Headers(opts.headers||{}),t=localStorage.getItem("jse_token");
 if(t&&!h.has("Authorization"))h.set("Authorization","Bearer "+t);
 opts.headers=h;opts.cache="no-store";return nativeFetch(input,opts);
}
window.fetch=(input,init)=>authFetch(input,init);
async function loginAdminFixed(){
 const username=(document.querySelector("#adminUsername")?.value||"").trim().toUpperCase();
 const password=document.querySelector("#adminPassword")?.value||"",msg=document.querySelector("#adminLoginMsg"),btn=document.querySelector("#adminLoginBtn");
 if(!username||!password){if(msg)msg.textContent="Enter the User ID and password.";return}
 if(btn)btn.disabled=true;if(msg)msg.textContent="Signing in…";
 try{const r=await nativeFetch(A+"/admin-login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,password}),cache:"no-store"});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||"Administrator login failed.");if(d.token)localStorage.setItem("jse_token",d.token);location.reload()}
 catch(e){if(msg)msg.textContent=e.message||"Administrator login failed.";if(btn)btn.disabled=false}
}
async function downloadArchiveFixed(){
 const b=document.querySelector("#downloadArchive"),status=(document.querySelector("#eventStatus")?.textContent||"").trim().toUpperCase();
 if(b)b.disabled=true;
 try{
  if(status!=="FINALIZED")throw Error("The Excel report is available only after FINALIZE EVENT.");
  const r=await authFetch(A+"/export-event",{headers:{Accept:"application/json"}}),d=await r.json().catch(()=>({}));
  if(!r.ok)throw Error(d.error||"Final Excel archive could not be generated.");
  if(d.event?.status!=="FINALIZED")throw Error("The event archive is not finalized. Please FINALIZE the event first.");
  const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  const sheets=[];const data=d.data&&typeof d.data==="object"?d.data:{};
  for(const [name,raw] of Object.entries(data)){const rows=Array.isArray(raw)?raw:[],cols=[...new Set(rows.flatMap(x=>Object.keys(x||{})))];
   const rn=esc(name).slice(0,31)||"Sheet";const head="<Row>"+cols.map(k=>"<Cell><Data ss:Type=\"String\">"+esc(k)+"</Data></Cell>").join("")+"</Row>";
   const body=rows.map(row=>"<Row>"+cols.map(k=>"<Cell><Data ss:Type=\"String\">"+esc(typeof row?.[k]==="object"?JSON.stringify(row?.[k]):row?.[k])+"</Data></Cell>").join("")+"</Row>").join("");
   sheets.push("<Worksheet ss:Name=\""+rn+"\"><Table>"+head+body+"</Table></Worksheet>");
  }
  const xml='<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">'+sheets.join("")+"</Workbook>";
  const blob=new Blob([xml],{type:"application/vnd.ms-excel;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download="JSE-final-event-report.xls";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  window.setMsg?.("Final Excel report downloaded.","success");
 }catch(e){window.setMsg?.(e.message||"Excel report export failed","error");if(!window.setMsg)alert(e.message)}
 finally{if(b)b.disabled=((document.querySelector("#eventStatus")?.textContent||"").trim().toUpperCase()!=="FINALIZED")}
}
function install(){window.loginAdmin=loginAdminFixed;window.downloadArchive=downloadArchiveFixed}
install();
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:false});window.addEventListener("load",install);
})();