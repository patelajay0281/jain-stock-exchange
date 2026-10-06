import { db } from "../lib/hatchable.js";
export const access = "public";
export const methods = ["GET"];

export default async function(req,res){
  const sq=await db.query("SELECT s.id,s.symbol,s.name,s.price,s.previous_price FROM stocks s JOIN cms50_components c ON c.stock_id=s.id ORDER BY s.id");
  const iq=await db.query("SELECT id,code,name,symbol,price FROM ipo_offerings ORDER BY id");
  const stocks=sq.rows, ipos=iq.rows;
  const stockTotal=stocks.reduce((n,x)=>n+Number(x.price||0),0);
  const ipoTotal=ipos.reduce((n,x)=>n+Number(x.price||0),0);
  const total=stockTotal+ipoTotal;
  const refQ=await db.query("SELECT base_value FROM cms50_reference WHERE id=1");
  const baseValue=Number(refQ.rows[0]?.base_value||total);
  const changePct=baseValue?Number((((total-baseValue)*100)/baseValue).toFixed(2)):0;
  return res.json({name:"CMS 50",exchange:"JAIN SECURITIES EXCHANGE",description:"JSE index total of all 50 listed shares plus 4 IPO offerings.",methodology:"Simple price-sum index: 50 listed-stock prices + 4 IPO prices.",stock_count:stocks.length,ipo_count:ipos.length,stock_total:Math.round(stockTotal),ipo_total:Math.round(ipoTotal),value:Math.round(total),previous_value:Math.round(baseValue),change_pct:changePct,stocks,ipos});
}