import { db } from "../lib/hatchable.js";
export const access="admin";
export const methods=["GET"];
export default async function(req,res){
 const {rows}=await db.query("SELECT id,code,name,symbol,price,remaining_quantity,status FROM ipo_offerings ORDER BY id");
 res.json({ipos:rows});
}