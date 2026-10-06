import { db } from "../lib/hatchable.js";
export const access="public";
export const methods=["GET"];
export default async function(req,res){
  const started=Date.now();
  try{
    const tx=await db.transaction([
      {sql:"SELECT 1 AS one",params:[]},
      {sql:"SELECT 2 AS two",params:[]}
    ]);
    res.setHeader("cache-control","no-store");
    res.json({ok:true,transaction:true,elapsed_ms:Date.now()-started,results:tx.results.map(x=>x.rows?.[0]||{})});
  }catch(error){
    res.status(500).json({ok:false,transaction:false,error:error instanceof Error?error.message:String(error),elapsed_ms:Date.now()-started});
  }
}
