import { db } from "../lib/hatchable.js";
export const access="admin";
export const methods=["GET"];

const esc=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const safeSheet=s=>String(s||"Sheet").replace(/[\\/:?*\[\]]/g,"_").slice(0,31)||"Sheet";
const isNum=v=>v!==null&&v!==""&&Number.isFinite(Number(v));
const cell=v=>'<Cell><Data ss:Type="'+(isNum(v)?"Number":"String")+'">'+esc(v)+'</Data></Cell>';
const sheet=(name,cols,rows)=>{
 const head='<Row>'+cols.map(c=>'<Cell ss:StyleID="h"><Data ss:Type="String">'+esc(c)+'</Data></Cell>').join("")+'</Row>';
 const body=rows.map(r=>'<Row>'+cols.map(c=>cell(r[c])).join("")+'</Row>').join("");
 return '<Worksheet ss:Name="'+esc(safeSheet(name))+'"><Table>'+head+body+'</Table></Worksheet>';
};

export default async function(req,res){
 const ev=(await db.query("SELECT id,event_name,status,created_at,updated_at FROM event_control WHERE id=1")).rows[0];
 if(!ev)return res.status(404).json({error:"Event control record not found."});
 if(ev.status!=="FINALIZED")return res.status(409).json({error:"Complete Excel report is available only after FINALIZE EVENT.",status:ev.status});

 const [cfg,teams,orders,stocks,prices,holdings,ipos,investors,instOrders,instHoldings,cash,commissions,rejections,audit,history,loans,brokers]=await Promise.all([
  db.query("SELECT * FROM event_config WHERE id=1"),
  db.query("SELECT t.id,t.code team,b.code broker,t.total_cash,t.available_cash,l.original_principal,l.principal_due,l.principal_paid,l.interest_due,l.interest_paid,l.interest_rate,l.status loan_status FROM teams t JOIN brokers b ON b.id=t.broker_id LEFT JOIN participant_loans l ON l.team_id=t.id ORDER BY t.code"),
  db.query("SELECT o.id,o.order_code,t.code team,b.code broker,COALESCE(s.name,ip.name) asset,COALESCE(s.symbol,ip.symbol) symbol,CASE WHEN o.stock_id IS NOT NULL THEN 'STOCK' ELSE 'IPO' END asset_type,o.side,o.quantity,o.price,o.trade_value,o.brokerage,o.status,o.created_by,o.created_at FROM orders o JOIN teams t ON t.id=o.team_id JOIN brokers b ON b.id=t.broker_id LEFT JOIN stocks s ON s.id=o.stock_id LEFT JOIN ipo_offerings ip ON ip.id=o.ipo_id ORDER BY o.created_at,o.id"),
  db.query("SELECT id,symbol,name,previous_price,price,updated_at FROM stocks ORDER BY symbol"),
  db.query("SELECT ph.id,ph.stock_id,s.symbol,s.name,ph.previous_price,ph.new_price,ph.order_id,ph.changed_at FROM price_history ph JOIN stocks s ON s.id=ph.stock_id ORDER BY ph.changed_at,ph.id"),
  db.query("SELECT h.id,t.code team,b.code broker,s.symbol,s.name stock,h.quantity,h.average_price,s.price current_price,h.quantity*h.average_price invested_value,h.quantity*s.price current_value,(h.quantity*s.price)-(h.quantity*h.average_price) unrealized_pl FROM holdings h JOIN teams t ON t.id=h.team_id JOIN brokers b ON b.id=t.broker_id JOIN stocks s ON s.id=h.stock_id WHERE h.quantity<>0 ORDER BY t.code,s.symbol"),
  db.query("SELECT id,code,name,symbol,price,available_quantity,remaining_quantity,status,created_at FROM ipo_offerings ORDER BY code"),
  db.query("SELECT id,code,name,cash,available_cash,created_at FROM institutional_investors ORDER BY code"),
  db.query("SELECT io.id,io.order_code,ii.code investor_code,ii.name investor,COALESCE(t.code,'') counterparty_team,COALESCE(s.symbol,ip.symbol) symbol,COALESCE(s.name,ip.name) asset,CASE WHEN io.stock_id IS NOT NULL THEN 'STOCK' ELSE 'IPO' END asset_type,io.side,io.quantity,io.price,io.trade_value,io.status,io.created_at FROM institutional_orders io JOIN institutional_investors ii ON ii.id=io.investor_id LEFT JOIN teams t ON t.id=io.team_id LEFT JOIN stocks s ON s.id=io.stock_id LEFT JOIN ipo_offerings ip ON ip.id=io.ipo_id ORDER BY io.created_at,io.id"),
  db.query("SELECT ih.id,ii.code investor_code,ii.name investor,COALESCE(s.symbol,ip.symbol) symbol,COALESCE(s.name,ip.name) asset,ih.quantity,ih.average_price,COALESCE(s.price,ip.price) current_price,ih.quantity*ih.average_price invested_value,ih.quantity*COALESCE(s.price,ip.price) current_value FROM institutional_holdings ih JOIN institutional_investors ii ON ii.id=ih.investor_id LEFT JOIN stocks s ON s.id=ih.stock_id LEFT JOIN ipo_offerings ip ON ip.id=ih.ipo_id WHERE ih.quantity<>0 ORDER BY ii.code,symbol"),
  db.query("SELECT c.id,t.code team,o.order_code,c.entry_type,c.debit,c.credit,c.balance_after,c.note,c.created_at FROM cash_ledger c JOIN teams t ON t.id=c.team_id LEFT JOIN orders o ON o.id=c.order_id ORDER BY c.created_at,c.id"),
  db.query("SELECT bc.id,t.code team,b.code broker,o.order_code,bc.commission_rate,bc.commission_amount,bc.status,bc.created_at FROM broker_commissions bc JOIN teams t ON t.id=bc.team_id JOIN brokers b ON b.id=bc.broker_id JOIN orders o ON o.id=bc.order_id ORDER BY bc.created_at,bc.id"),
  db.query("SELECT sr.id,o.order_code,t.code team,b.code broker,s.symbol,s.name stock,sr.available_cash,sr.required_cash,sr.shortfall,sr.reason,sr.created_at FROM settlement_rejections sr JOIN orders o ON o.id=sr.order_id JOIN teams t ON t.id=sr.team_id JOIN brokers b ON b.id=sr.broker_id LEFT JOIN stocks s ON s.id=o.stock_id ORDER BY sr.created_at,sr.id"),
  db.query("SELECT al.id,al.actor_id,al.actor_role,al.action,al.order_id,al.team_id,al.details,al.created_at FROM audit_log al ORDER BY al.created_at,al.id"),
  db.query("SELECT * FROM action_history ORDER BY id"),
  db.query("SELECT pl.id,t.code team,pl.original_principal,pl.principal_due,pl.principal_paid,pl.interest_rate,pl.interest_due,pl.interest_paid,pl.status,pl.created_at,pl.updated_at FROM participant_loans pl JOIN teams t ON t.id=pl.team_id ORDER BY t.code"),
  db.query("SELECT id,code,created_at FROM brokers ORDER BY code")
 ]);

 const stockRows=stocks.rows.map(s=>{
   const ph=prices.rows.filter(p=>Number(p.stock_id)===Number(s.id));
   const opening=ph.length?Number(ph[0].previous_price):Number(s.previous_price);
   const finalPrice=Number(s.price);
   const trades=orders.rows.filter(o=>Number((o.symbol&&0)||0)===999);
   const related=orders.rows.filter(o=>o.symbol===s.symbol);
   const settled=related.filter(o=>o.status==="SETTLED");
   const volume=settled.reduce((a,o)=>a+Number(o.quantity||0),0);
   const turnover=settled.reduce((a,o)=>a+Number(o.trade_value||0),0);
   const change=finalPrice-opening;
   return {Symbol:s.symbol,Company:s.name,"Opening Price":opening,"Final Closing Price":finalPrice,"Change":change,"Change %":opening?change*100/opening:0,"Settled Trades":settled.length,"Settled Volume":volume,"Settled Turnover":turnover,"Last Updated":s.updated_at};
 });

 const teamSummary=teams.rows.map(t=>{
   const hs=holdings.rows.filter(h=>h.team===t.team);
   const hv=hs.reduce((a,h)=>a+Number(h.current_value||0),0);
   const invested=hs.reduce((a,h)=>a+Number(h.invested_value||0),0);
   const liability=Number(t.principal_due||0)+Number(t.interest_due||0);
   const finalValue=Number(t.available_cash||0)+hv-liability;
   const pnl=finalValue-2000000;
   const os=orders.rows.filter(o=>o.team===t.team);
   return {Team:t.team,Broker:t.broker,"Starting Cash":2000000,"Final Cash":t.available_cash,"Holdings Value":hv,"Invested Value":invested,"Loan Principal Due":t.principal_due,"Interest Due":t.interest_due,"Total Liability":liability,"Final Net Worth":finalValue,"P&L":pnl,"Return %":pnl*100/2000000,"Orders":os.length,"Settled Orders":os.filter(o=>o.status==="SETTLED").length,"Rejected Orders":os.filter(o=>String(o.status).includes("REJECTED")).length};
 });

 const totals=[{
   "Event":ev.event_name,"Status":ev.status,"Finalized At":ev.updated_at,
   "Teams":teams.rows.length,"Stocks":stocks.rows.length,"Orders":orders.rows.length,
   "Settled Orders":orders.rows.filter(o=>o.status==="SETTLED").length,
   "Rejected Orders":orders.rows.filter(o=>String(o.status).includes("REJECTED")).length,
   "Total Order Value":orders.rows.reduce((a,o)=>a+Number(o.trade_value||0),0),
   "Settled Turnover":orders.rows.filter(o=>o.status==="SETTLED").reduce((a,o)=>a+Number(o.trade_value||0),0),
   "Brokerage":orders.rows.reduce((a,o)=>a+Number(o.brokerage||0),0),
   "Price Updates":prices.rows.length,
   "Audit Entries":audit.rows.length
 }];

 const eventInfo=[{
   "Event Name":ev.event_name,"Status":ev.status,"Created At":ev.created_at,"Finalized At":ev.updated_at,
   "Brokerage Rate":cfg.rows[0]?.brokerage_rate,"Max Price Move %":cfg.rows[0]?.max_price_move_pct,
   "Minimum Order Value":cfg.rows[0]?.min_order_value,"Maximum Order Value":cfg.rows[0]?.max_order_value,
   "Archive Note":"Participant personal names/USNs/contact details are not stored in the current database; Team code is the participant identifier."
 }];

 const colsMap=[
  ["Event Summary",Object.keys(totals[0]),totals],
  ["Event Info",Object.keys(eventInfo[0]),eventInfo],
  ["Participants",teamSummary.length?Object.keys(teamSummary[0]):["Team"],teamSummary],
  ["Stocks Final Prices",stockRows.length?Object.keys(stockRows[0]):["Symbol"],stockRows],
  ["Orders",orders.rows.length?Object.keys(orders.rows[0]):["id"],orders.rows],
  ["Price History",prices.rows.length?Object.keys(prices.rows[0]):["id"],prices.rows],
  ["Final Holdings",holdings.rows.length?Object.keys(holdings.rows[0]):["id"],holdings.rows],
  ["Cash Ledger",cash.rows.length?Object.keys(cash.rows[0]):["id"],cash.rows],
  ["Broker Commissions",commissions.rows.length?Object.keys(commissions.rows[0]):["id"],commissions.rows],
  ["Settlement Rejects",rejections.rows.length?Object.keys(rejections.rows[0]):["id"],rejections.rows],
  ["Participant Loans",loans.rows.length?Object.keys(loans.rows[0]):["id"],loans.rows],
  ["Brokers",brokers.rows.length?Object.keys(brokers.rows[0]):["id"],brokers.rows],
  ["IPOs",ipos.rows.length?Object.keys(ipos.rows[0]):["id"],ipos.rows],
  ["Institutional Investors",investors.rows.length?Object.keys(investors.rows[0]):["id"],investors.rows],
  ["Institutional Orders",instOrders.rows.length?Object.keys(instOrders.rows[0]):["id"],instOrders.rows],
  ["Institutional Holdings",instHoldings.rows.length?Object.keys(instHoldings.rows[0]):["id"],instHoldings.rows],
  ["Audit Log",audit.rows.length?Object.keys(audit.rows[0]):["id"],audit.rows],
  ["Action History",history.rows.length?Object.keys(history.rows[0]):["id"],history.rows]
 ];

 const xml='<?xml version="1.0" encoding="UTF-8"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="h"><Font ss:Bold="1"/></Style></Styles>'+colsMap.map(x=>sheet(x[0],x[1],x[2])).join("")+"</Workbook>";
 const filename="jain-stock-exchange-final-report-"+new Date().toISOString().slice(0,10)+".xls";
 res.setHeader("Content-Type","application/vnd.ms-excel; charset=utf-8");
 res.setHeader("Content-Disposition",'attachment; filename="'+filename+'"');
 res.send(xml);
}