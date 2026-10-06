const stocks=[
  ["Reliance Industries","RELIANCE","₹","2,940","0.86","Energy & Conglomerates"],
  ["Tata Motors","TATAMOTORS","₹","1,028","-0.42","Automobile"],
  ["TCS","TCS","₹","4,112","1.14","Information Technology"],
  ["HDFC Bank","HDFCBANK","₹","1,892","0.31","Banking"],
  ["ICICI Bank","ICICIBANK","₹","1,474","-0.18","Banking"],
  ["Airtel","BHARTIARTL","₹","1,802","0.72","Telecom"],
  ["Titan Company","TITAN","₹","3,544","1.63","Consumer"],
  ["Cipla","CIPLA","₹","1,566","-0.61","Pharmaceuticals"],
  ["BHEL","BHEL","₹","327","0.45","Capital Goods"],
  ["Adani Ports","ADANIPORTS","₹","1,406","-0.74","Infrastructure"],
  ["HCLTech","HCLTECH","₹","1,612","0.28","Information Technology"],
  ["UltraTech Cement","ULTRACEMCO","₹","12,086","0.53","Cement"]
];

function renderWall(){
  const wall=document.querySelector("#marketWall");
  wall.innerHTML="";
  for(const [name,symbol,currency,price,change,sector] of stocks){
    const n=Number(change);
    const direction=n>0?"up":n<0?"down":"neutral";
    const sign=n>0?"+":"";
    const el=document.createElement("article");
    el.className="stock-tile";
    el.innerHTML=`
      <div class="stock-top">
        <div><div class="stock-name">${name}</div><div class="stock-symbol">${symbol}</div></div>
        <span class="stock-sector">${sector}</span>
      </div>
      <div class="stock-price">${currency}${price}</div>
      <div class="stock-change ${direction}">${sign}${change}%</div>`;
    wall.appendChild(el);
  }
}

async function checkHealth(){
  try{
    const r=await fetch("/api/health",{cache:"no-store"});
    const data=await r.json();
    const status=document.querySelector("#systemStatus");
    if(data.status==="ok"){
      status.textContent="ONLINE";
      document.querySelector("#marketStatus").textContent="READY";
    }else{
      status.textContent="CHECKING";
    }
  }catch{
    document.querySelector("#systemStatus").textContent="OFFLINE";
  }
}

document.querySelector("#listedCount").textContent=String(stocks.length);
renderWall();
checkHealth();
