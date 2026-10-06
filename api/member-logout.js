import { clearMemberCookie } from "../src/session.js";
export const access="public";
export const methods=["POST"];
export default async function(req,res){res.setHeader("set-cookie",clearMemberCookie());res.json({ok:true})}
