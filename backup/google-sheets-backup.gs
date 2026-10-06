/*
 * JAIN STOCK EXCHANGE — Google Sheets Backup Bridge
 *
 * One-time setup:
 * 1) Create a new Apps Script project at script.google.com.
 * 2) Paste this file.
 * 3) Replace WEB_APP_URL and BACKUP_TOKEN below.
 * 4) Run setupJSEBackup() once and approve Google permissions.
 * 5) Run installJSEBackupTrigger() once.
 *
 * The trigger polls the Neon-backed backup ledger every minute.
 * Google Sheets is a mirror only: a Sheets outage cannot stop JSE trading.
 */
const WEB_APP_URL = "https://jain-stock-exchange.patelajay0281.workers.dev/api/backup-ledger";
const ACK_URL = "https://jain-stock-exchange.patelajay0281.workers.dev/api/backup-ack";
const BACKUP_TOKEN = "REPLACE_WITH_BACKUP_TOKEN";
const SPREADSHEET_NAME = "JSE Backend Backup";

function setupJSEBackup(){
  const props=PropertiesService.getScriptProperties();
  props.setProperties({
    JSE_WEB_APP_URL:WEB_APP_URL,
    JSE_ACK_URL:ACK_URL,
    JSE_BACKUP_TOKEN:BACKUP_TOKEN,
    JSE_LAST_ID:"0"
  });
  let id=props.getProperty("JSE_SHEET_ID");
  let ss=id?SpreadsheetApp.openById(id):null;
  if(!ss){
    ss=SpreadsheetApp.create(SPREADSHEET_NAME);
    props.setProperty("JSE_SHEET_ID",ss.getId());
  }
  ensureSheet_(ss,"Backend Transactions",[
    "Backup ID","Event Time","Source Table","Operation","Record ID","Order Code","Team ID","Actor","Payload JSON"
  ]);
  ensureSheet_(ss,"Audit Log",[
    "Backup ID","Event Time","Operation","Record ID","Order Code","Team ID","Actor","Payload JSON"
  ]);
  ensureSheet_(ss,"Recovery Status",[
    "Metric","Value"
  ]);
  const status=ss.getSheetByName("Recovery Status");
  status.getRange("A2:B7").setValues([
    ["Last synced backup ID",props.getProperty("JSE_LAST_ID")||"0"],
    ["Last sync time",new Date()],
    ["Sync interval","1 minute"],
    ["Primary database","Neon PostgreSQL"],
    ["External mirror","Google Sheets"],
    ["Google Sheets is trading dependency?","NO"]
  ]);
  Logger.log("JSE Backup Sheet: "+ss.getUrl());
  return ss.getUrl();
}

function installJSEBackupTrigger(){
  ScriptApp.getProjectTriggers().forEach(t=>{
    if(t.getHandlerFunction()==="syncJSEBackup") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("syncJSEBackup").timeBased().everyMinutes(1).create();
}

function syncJSEBackup(){
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(5000)) return;
  try{
    const props=PropertiesService.getScriptProperties();
    const url=props.getProperty("JSE_WEB_APP_URL")||WEB_APP_URL;
    const ackUrl=props.getProperty("JSE_ACK_URL")||ACK_URL;
    const token=props.getProperty("JSE_BACKUP_TOKEN")||BACKUP_TOKEN;
    if(!token||token==="REPLACE_WITH_BACKUP_TOKEN") throw new Error("Configure BACKUP_TOKEN first.");
    const last=Number(props.getProperty("JSE_LAST_ID")||"0");
    const r=UrlFetchApp.fetch(url+"?after_id="+encodeURIComponent(last)+"&limit=500",{
      method:"get",
      headers:{"X-JSE-BACKUP-TOKEN":token},
      muteHttpExceptions:true
    });
    if(r.getResponseCode()!==200) throw new Error("Backup API HTTP "+r.getResponseCode()+": "+r.getContentText());
    const data=JSON.parse(r.getContentText());
    const rows=data.rows||[];
    const ss=SpreadsheetApp.openById(props.getProperty("JSE_SHEET_ID"));
    const tx=ss.getSheetByName("Backend Transactions");
    const audit=ss.getSheetByName("Audit Log");
    if(rows.length){
      const txValues=rows.map(x=>[
        x.id,x.occurred_at,x.source_table,x.operation,x.record_id||"",x.order_code||"",x.team_id||"",x.actor_email||"",JSON.stringify(x.payload||{})
      ]);
      tx.getRange(tx.getLastRow()+1,1,txValues.length,txValues[0].length).setValues(txValues);
      const auditRows=rows.filter(x=>x.source_table==="audit_log").map(x=>[
        x.id,x.occurred_at,x.operation,x.record_id||"",x.order_code||"",x.team_id||"",x.actor_email||"",JSON.stringify(x.payload||{})
      ]);
      if(auditRows.length)audit.getRange(audit.getLastRow()+1,1,auditRows.length,auditRows[0].length).setValues(auditRows);

      const ids=rows.map(x=>x.id);
      const ack=UrlFetchApp.fetch(ackUrl,{
        method:"post",
        contentType:"application/json",
        headers:{"X-JSE-BACKUP-TOKEN":token},
        payload:JSON.stringify({ids}),
        muteHttpExceptions:true
      });
      if(ack.getResponseCode()!==200)throw new Error("Backup ACK HTTP "+ack.getResponseCode()+": "+ack.getContentText());

      props.setProperty("JSE_LAST_ID",String(data.last_id||last));
      const status=ss.getSheetByName("Recovery Status");
      status.getRange("B2:B3").setValues([[String(data.last_id||last)],[new Date()]]);
    }
  } finally {
    lock.releaseLock();
  }
}

function ensureSheet_(ss,name,headers){
  let sh=ss.getSheetByName(name);
  if(!sh)sh=ss.insertSheet(name);
  if(sh.getLastRow()===0){
    sh.getRange(1,1,1,headers.length).setValues([headers]);
    sh.setFrozenRows(1);
    sh.getRange(1,1,1,headers.length).setFontWeight("bold");
  }
  return sh;
}
