/**
 * Insurance Claims Service
 */
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../../database/connection.js";
import { NotFoundError } from "../../middleware/errorHandler.js";

const T="tenant-001",H="hosp-001";

export async function getClaims({page=1,limit=20,patientId,status,provider,tenantId,hospitalId}={}){
  const db=getDb();const offset=(page-1)*limit;
  const where=["ic.tenant_id=?","ic.hospital_id=?"];
  const params=[tenantId||T,hospitalId||H];
  if(patientId){where.push("ic.patient_id=?");params.push(patientId);}
  if(status){where.push("ic.status=?");params.push(status);}
  if(provider){where.push("ic.provider=?");params.push(provider);}
  const cond=where.join(" AND ");
  const total=(await db.prepare(`SELECT COUNT(*) as n FROM insurance_claims ic WHERE ${cond}`).get(...params))?.n??0;
  const rows=await db.prepare(`
    SELECT ic.*,p.first_name||' '||p.last_name as patient_name,p.mrn,
           i.invoice_number,u.first_name||' '||u.last_name as submitted_by_name
    FROM insurance_claims ic
    LEFT JOIN patients p ON p.id=ic.patient_id
    LEFT JOIN invoices i ON i.id=ic.invoice_id
    LEFT JOIN users u ON u.id=ic.submitted_by
    WHERE ${cond} ORDER BY ic.created_at DESC LIMIT ? OFFSET ?
  `).all(...params,limit,offset);
  return{data:rows.map(fmt),meta:{total,page:+page,limit:+limit,totalPages:Math.ceil(total/limit)}};
}

export async function getClaimById(id){
  const db=getDb();
  const c=await db.prepare(`SELECT ic.*,p.first_name||' '||p.last_name as patient_name,p.mrn,i.invoice_number FROM insurance_claims ic LEFT JOIN patients p ON p.id=ic.patient_id LEFT JOIN invoices i ON i.id=ic.invoice_id WHERE ic.id=?`).get(id);
  if(!c)throw new NotFoundError("Insurance claim");
  return fmt(c);
}

export async function createClaim(data,createdBy,tenantId,hospitalId){
  const db=getDb();const id=`clm-${uuidv4().slice(0,8)}`;
  const claimNumber=`CLM-${new Date().getFullYear()}-${uuidv4().slice(0,6).toUpperCase()}`;
  await db.prepare(`INSERT INTO insurance_claims (id,tenant_id,hospital_id,invoice_id,patient_id,provider,claim_number,amount_claimed,status,submitted_by) VALUES(?,?,?,?,?,?,?,?,?,?)`).run(id,tenantId||T,hospitalId||H,data.invoiceId,data.patientId,data.provider,claimNumber,data.amountClaimed,"draft",createdBy);
  return getClaimById(id);
}

export async function submitClaim(id,userId){
  const db=getDb();
  const c=await db.prepare(`SELECT id FROM insurance_claims WHERE id=?`).get(id);
  if(!c)throw new NotFoundError("Claim");
  await db.prepare(`UPDATE insurance_claims SET status='submitted',submitted_at=datetime('now'),submitted_by=?,updated_at=datetime('now') WHERE id=?`).run(userId,id);
  await db.prepare(`UPDATE invoices SET insurance_claim_status='submitted' WHERE id=(SELECT invoice_id FROM insurance_claims WHERE id=?)`).run(id);
  return getClaimById(id);
}

export async function updateClaimStatus(id,data){
  const db=getDb();
  const c=await db.prepare(`SELECT id FROM insurance_claims WHERE id=?`).get(id);
  if(!c)throw new NotFoundError("Claim");
  const fields=["status=?","updated_at=datetime('now')"]; const vals=[data.status];
  if(data.amountApproved!==undefined){fields.push("amount_approved=?");vals.push(data.amountApproved);}
  if(data.rejectionReason!==undefined){fields.push("rejection_reason=?");vals.push(data.rejectionReason);}
  if(data.status==="approved"){fields.push("approved_at=datetime('now')");}
  if(data.status==="paid"){fields.push("paid_at=datetime('now')");}
  vals.push(id);
  await db.prepare(`UPDATE insurance_claims SET ${fields.join(",")} WHERE id=?`).run(...vals);
  const claimStatus=data.status==="approved"?"approved":data.status==="paid"?"paid":data.status==="denied"?"rejected":"submitted";
  await db.prepare(`UPDATE invoices SET insurance_claim_status=? WHERE id=(SELECT invoice_id FROM insurance_claims WHERE id=?)`).run(claimStatus,id);
  return getClaimById(id);
}

function fmt(c){
  return{id:c.id,tenantId:c.tenant_id,hospitalId:c.hospital_id,invoiceId:c.invoice_id,invoiceNumber:c.invoice_number,patientId:c.patient_id,patientName:c.patient_name,mrn:c.mrn,provider:c.provider,claimNumber:c.claim_number,amountClaimed:c.amount_claimed,amountApproved:c.amount_approved,status:c.status,submittedAt:c.submitted_at,approvedAt:c.approved_at,paidAt:c.paid_at,rejectionReason:c.rejection_reason,submittedBy:c.submitted_by,submittedByName:c.submitted_by_name,createdAt:c.created_at,updatedAt:c.updated_at};
}
