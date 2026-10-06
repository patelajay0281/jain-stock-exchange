import { db } from "../lib/hatchable.js";
export const access="admin";
export const methods=["GET"];
const esc=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
export default async function(req,res){
 const {rows}=await db.query("SELECT t.code team,b.code broker,t.total_cash,t.available_cash,s.name stock,h.quantity,h.average_price,s.price current_price,h.quantity*h.average_price invested_value,h.quantity*s.price current_value,(h.quantity*s.price)-(h.quantity*h.average_price) profit_loss,COALESCE((SELECT SUM(bc.commission_amount) FROM broker_commissions bc WHERE bc.team_id=t.id AND bc.status='SETTLED'),0) brokerage_paid FROM teams t JOIN brokers b ON b.id=t.broker_id LEFT JOIN holdings h ON h.team_id=t.id LEFT JOIN stocks s ON s.id=h.stock_id WHERE h.quantity>0 ORDER BY t.code,s.name");
 const teams=[...new Set(rows.map(r=>r.team))];
 const cols=["Team","Broker","Total Cash","Money Left","Share","Quantity","Average Price","Current Price","Invested Value","Current Value","Profit/Loss","Brokerage Paid"];
 const xmlHead='<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="h"><Font ss:Bold="1"/></Style></Styles>';
 const sheets=teams.map(team=>{const rs=rows.filter(r=>r.team===team);const head='<Row>'+cols.map(c=>'<Cell ss:StyleID="h"><Data ss:Type="String">'+esc(c)+'</Data></Cell>').join('')+'</Row>';const body=rs.map(r=>'<Row>'+[r.team,r.broker,r.total_cash,r.available_cash,r.stock,r.quantity,r.average_price,r.current_price,r.invested_value,r.current_value,r.profit_loss,r.brokerage_paid].map(v=>{const n=typeof v==='number'||(v!==null&&v!==''&&!isNaN(Number(v)));return '<Cell><Data ss:Type="'+(n?'Number':'String')+'">'+esc(v)+'</Data></Cell>'}).join('')+'</Row>').join('');return '<Worksheet ss:Name="'+esc(team)+'"><Table>'+head+body+'</Table></Worksheet>'}).join('');
 res.setHeader("Content-Type","application/vnd.ms-excel");res.setHeader("Content-Disposition",'attachment; filename="participant_portfolios.xls"');res.send(xmlHead+sheets+'</Workbook>');
}