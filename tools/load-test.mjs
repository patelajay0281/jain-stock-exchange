#!/usr/bin/env node
/**
 * JAIN STOCK EXCHANGE load test
 *
 * Default profile: 25 simulated clients × 4 requests/second × 10 seconds
 * = 1,000 DB-backed /api/market requests over ~10 seconds.
 *
 * The /api/market endpoint is intentionally one consolidated Neon query, so
 * this test measures one database-backed operation per successful request.
 *
 * Usage:
 *   node tools/load-test.mjs
 *   node tools/load-test.mjs https://jain-stock-exchange.patelajay0281.workers.dev/api/market
 */
const baseUrl=process.argv[2]||"https://jain-stock-exchange.patelajay0281.workers.dev/api/market";
const clients=25,requestsPerClientPerSecond=4,durationSeconds=10;
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const samples=[];
let ok=0,fail=0;

async function hit(){
  const started=performance.now();
  try{
    const r=await fetch(baseUrl,{cache:"no-store",headers:{"accept":"application/json"}});
    const elapsed=performance.now()-started;
    samples.push(elapsed);
    if(r.ok) ok++; else fail++;
    await r.arrayBuffer();
  }catch(e){
    samples.push(performance.now()-started);
    fail++;
  }
}

console.log("JSE load test");
console.log("Target:",baseUrl);
console.log(`Profile: ${clients} clients × ${requestsPerClientPerSecond} req/s × ${durationSeconds}s = ${clients*requestsPerClientPerSecond*durationSeconds} requests`);

const testStart=performance.now();
for(let second=0;second<durationSeconds;second++){
  const tick=performance.now();
  const batch=[];
  for(let c=0;c<clients;c++){
    for(let n=0;n<requestsPerClientPerSecond;n++) batch.push(hit());
  }
  await Promise.all(batch);
  const elapsed=performance.now()-tick;
  if(second<durationSeconds-1) await pause(Math.max(0,1000-elapsed));
}
const totalMs=performance.now()-testStart;
samples.sort((a,b)=>a-b);
const percentile=p=>samples[Math.min(samples.length-1,Math.floor((p/100)*samples.length))]||0;
const avg=samples.length?samples.reduce((a,b)=>a+b,0)/samples.length:0;
const total=ok+fail;

console.log("");
console.log("RESULT");
console.log("Total requests:",total);
console.log("Successful:",ok);
console.log("Failed:",fail);
console.log("Success rate:",total?(ok/total*100).toFixed(2)+"%":"0.00%");
console.log("Elapsed:",(totalMs/1000).toFixed(2)+"s");
console.log("Throughput:",(total/(totalMs/1000)).toFixed(2),"req/s");
console.log("Average latency:",avg.toFixed(2),"ms");
console.log("p50 latency:",percentile(50).toFixed(2),"ms");
console.log("p95 latency:",percentile(95).toFixed(2),"ms");
console.log("Max latency:",(samples.at(-1)||0).toFixed(2),"ms");

if(fail===0 && total>=1000) {
  console.log("PASS: 1,000 requests completed with zero HTTP/network failures.");
  process.exitCode=0;
} else {
  console.log("FAIL: investigate errors/latency before event use.");
  process.exitCode=1;
}
