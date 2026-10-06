import { memberFromRequest } from "../src/hatchable-compat.js";
export const access="public";
export const methods=["GET"];

export default async function(req,res){
  const member=await memberFromRequest(req);
  if(!member) return res.status(401).json({error:"Not signed in"});
  res.json({member});
}
