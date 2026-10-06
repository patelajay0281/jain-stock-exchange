import { db } from "../lib/hatchable.js";
export const access="public";
export const methods=["GET","POST"];
const MIN=20000,RATE=.02,rupee=n=>Math.round(Number(n||0));
export default async function(req,res){
 const actorId=req.member?.id||"loan",actorEmail=req.member?.email||null,actorRole=req.member?.role||"loan";
 const teamCode=String(req.body?.team||req.query?.team||"").trim();
 if(!/^TEAM-\d{3}$/.test(teamCode))return res.status(400).json({error:"Invalid team"});
 const team=(await db.query("SELECT id,code,total_cash,available_cash FROM teams WHERE code=$1",[teamCode])).rows[0];
 if(!team)return res.status(404).json({error:"Team not found"});
 const loan=(await db.query("SELECT original_principal,principal_due,interest_rate,interest_due,interest_paid,principal_paid,status FROM participant_loans WHERE team_id=$1",[team.id])).rows[0];
 if(!loan)return res.status(404).json({error:"Loan record not found"});
 const rate=Number(loan.interest_rate||RATE);
 if(req.method==="GET"){
  const available=rupee(team.available_cash),principal=rupee(loan.principal_due),interest=rupee(loan.interest_due),totalDue=principal+interest,maxRepayable=Math.min(totalDue,Math.max(0,available-MIN));
  return res.json({team:{code:team.code,available_cash:available,minimum_cash:MIN,max_repayable:maxRepayable},loan:{original_principal:rupee(loan.original_principal),principal_due:principal,loan_withdrawn:principal,interest_rate:rate,interest_due:interest,interest_paid:rupee(loan.interest_paid),principal_paid:rupee(loan.principal_paid),total_due:totalDue,max_repayable:maxRepayable,status:loan.status}});
 }
 const amount=Number(req.body?.amount),action=String(req.body?.action||"REPAY").toUpperCase();
 if(!Number.isInteger(amount)||amount<=0)return res.status(400).json({error:"Amount must be a positive whole rupee amount"});
 if(action==="DRAW"){
  const limit=rupee(loan.original_principal),drawn=rupee(loan.principal_due),availableLimit=Math.max(0,limit-drawn),cash=rupee(team.available_cash);
  if(cash>MIN)return res.status(409).json({error:"Use your own money first. Loan withdrawal is allowed only when available cash is ₹20,000 or less.",code:"OWN_MONEY_NOT_EXHAUSTED"});
  if(amount>availableLimit)return res.status(409).json({error:"Loan withdrawal exceeds the remaining loan limit.",code:"LOAN_LIMIT"});
  const interest=rupee(amount*rate),newCash=cash+amount,newPrincipal=drawn+amount,newInterest=rupee(loan.interest_due)+interest;
  await db.transaction([
   {sql:"UPDATE teams SET available_cash=$1 WHERE id=$2 AND available_cash=$3",params:[newCash,team.id,team.available_cash]},
   {sql:"UPDATE participant_loans SET principal_due=principal_due+$1,interest_due=interest_due+$2,interest_rate=$3,status='OUTSTANDING',updated_at=now() WHERE team_id=$4 AND principal_due=$5 AND interest_due=$6",params:[amount,interest,rate,team.id,loan.principal_due,loan.interest_due]},
   {sql:"INSERT INTO cash_ledger(team_id,entry_type,credit,balance_after,note) VALUES($1,'LOAN_WITHDRAWAL',$2,$3,'Participant loan withdrawal')",params:[team.id,amount,newCash]}
  ]);
  await db.query("INSERT INTO audit_log(actor_id,actor_email,actor_role,action,team_id,details) VALUES($1,$2,$3,'LOAN_WITHDRAWAL',$4,$5)",
    [actorId,actorEmail,actorRole,team.id,JSON.stringify({amount,interest_charged:interest,available_cash:newCash})]);
  return res.json({status:"OUTSTANDING",team:team.code,withdrawn:amount,interest_charged:interest,available_cash:newCash,principal_due:newPrincipal,interest_due:newInterest,total_due:newPrincipal+newInterest});
 }
 const principal=rupee(loan.principal_due),interest=rupee(loan.interest_due),outstanding=principal+interest,maxPayable=Math.max(0,rupee(team.available_cash)-MIN);
 if(outstanding<=0)return res.status(409).json({error:"No outstanding loan to repay",code:"LOAN_REPAID"});
 if(amount>outstanding)return res.status(409).json({error:"Repayment exceeds current loan due",code:"REPAYMENT_EXCEEDS_DUE",outstanding});
 if(amount>maxPayable)return res.status(409).json({error:"Repayment exceeds the amount available while keeping ₹20,000 cash.",code:"REPAYMENT_CASH_LIMIT",max_payable:maxPayable});
 const interestPay=Math.min(amount,interest),principalPay=Math.min(amount-interestPay,principal),newPrincipal=Math.max(0,principal-principalPay),newBalance=rupee(team.available_cash)-amount;
 const fullyRepaid=newPrincipal===0&&Math.max(0,interest-interestPay)===0;
 const nextInterest=fullyRepaid?0:(principalPay>0?rupee(newPrincipal*rate):Math.max(0,interest-interestPay));
 const status=fullyRepaid?"AVAILABLE":"OUTSTANDING";
 await db.transaction([
  {sql:"UPDATE teams SET available_cash=$1 WHERE id=$2 AND available_cash=$3",params:[newBalance,team.id,team.available_cash]},
  {sql:"UPDATE participant_loans SET interest_due=$1,principal_due=$2,interest_paid=interest_paid+$3,principal_paid=principal_paid+$4,interest_rate=$5,status=$6,updated_at=now() WHERE team_id=$7 AND interest_due=$8 AND principal_due=$9",params:[nextInterest,newPrincipal,interestPay,principalPay,rate,status,team.id,loan.interest_due,loan.principal_due]},
  {sql:"INSERT INTO cash_ledger(team_id,entry_type,debit,balance_after,note) VALUES($1,'LOAN_INTEREST_REPAYMENT',$2,$3,'Loan interest repayment collected first')",params:[team.id,interestPay,newBalance+principalPay]},
  {sql:"INSERT INTO cash_ledger(team_id,entry_type,debit,balance_after,note) VALUES($1,'LOAN_PRINCIPAL_REPAYMENT',$2,$3,'Loan principal repayment after interest')",params:[team.id,principalPay,newBalance]}
 ]);
 await db.query("INSERT INTO audit_log(actor_id,actor_email,actor_role,action,team_id,details) VALUES($1,$2,$3,'LOAN_REPAYMENT',$4,$5)",
   [actorId,actorEmail,actorRole,team.id,JSON.stringify({amount,interest_paid:interestPay,principal_paid:principalPay,available_cash:newBalance})]);
 return res.json({status,team:team.code,paid_total:amount,interest_paid:interestPay,principal_paid:principalPay,available_cash:newBalance,interest_due:nextInterest,principal_due:newPrincipal,total_due:newPrincipal+nextInterest});
}