import { db } from "../lib/hatchable.js";
export const access="admin";
export const methods=["GET"];
export default async function(req,res){
 const e=(await db.query("SELECT * FROM event_control WHERE id=1")).rows[0];
 const c=(await db.query("SELECT * FROM event_config WHERE id=1")).rows[0];
 const i=(await db.query("SELECT * FROM institutional_investors ORDER BY id LIMIT 20")).rows;
 const ipos=(await db.query("SELECT * FROM ipo_offerings ORDER BY id")).rows;
 res.json({event:e,config:c,institutional_investors:i,ipos});
}