import { db } from "../lib/hatchable.js";

export const access="admin";
export const methods=["POST"];

export default async function(req,res){
  const requested=Math.min(Math.max(Number(req.body?.count||1000),1),1000);
  const batchSize=Math.min(Math.max(Number(req.body?.batch_size||100),1),100);
  const assetId=Number(req.body?.asset_id||1);
  const price=Math.round(Number(req.body?.price||720));
  const started=Date.now();
  const tag="LOADTEST-"+Date.now()+"-";

  const ev=(await db.query("SELECT status FROM event_control WHERE id=1")).rows[0];
  if(!ev||ev.status!=="LIVE")
    return res.status(409).json({error:"Set the event to LIVE before running the load test.",status:ev?.status||"NOT_STARTED"});

  const team=(await db.query("SELECT id FROM teams WHERE code='TEAM-001'")).rows[0];
  if(!team)return res.status(500).json({error:"TEAM-001 not found"});

  const asset=(await db.query("SELECT id,name,price FROM stocks WHERE id=$1",[assetId])).rows[0];
  if(!asset)return res.status(400).json({error:"Test stock not found"});

  let created=0,failed=0;
  const failures=[];
  const batches=Math.ceil(requested/batchSize);

  for(let b=0;b<batches;b++){
    const n=Math.min(batchSize,requested-created);
    const jobs=[];
    for(let i=0;i<n;i++){
      const seq=created+i+1;
      jobs.push((async()=>{
        try{
          const key=tag+seq;
          const value=Math.round(50*price);
          const brokerage=Math.round(value*0.005);
          const code=tag+seq;
          await db.query(
            "INSERT INTO orders(order_code,team_id,stock_id,ipo_id,side,quantity,price,trade_value,brokerage,status,created_by,idempotency_key) VALUES($1,$2,$3,NULL,'BUY',$4,$5,$6,$7,'EXCHANGE_PENDING','LOAD_TEST',$8)",
            [code,team.id,asset.id,50,price,value,brokerage,key]
          );
          return {ok:true};
        }catch(e){
          return {ok:false,error:String(e?.message||e)};
        }
      })());
    }
    const out=await Promise.all(jobs);
    for(const x of out){
      if(x.ok)created++;
      else{
        failed++;
        if(failures.length<20)failures.push(x.error);
      }
    }
  }

  const countQ=await db.query(
    "SELECT COUNT(*) AS count FROM orders WHERE idempotency_key LIKE $1",
    [tag+"%"]
  );

  res.json({
    test_id:tag,
    requested,
    batch_size:batchSize,
    batches,
    created,
    failed,
    verified_created:Number(countQ.rows[0]?.count||0),
    elapsed_ms:Date.now()-started,
    orders_per_second:Number((created/Math.max((Date.now()-started)/1000,0.001)).toFixed(2)),
    failures
  });
}