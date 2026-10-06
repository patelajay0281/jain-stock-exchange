import { verifyMember } from "../src/session.js";
export const access="public";
export const methods=["GET"];
export default async function(req,res){
 const m=await verifyMember(req.cookies?.jse_member||"");
 if(!m)return res.status(401).json({authenticated:false});
 res.json({authenticated:true,member:{username:m.username,display_name:m.display_name,team:m.team_code,email:m.email||m.username}});
}
