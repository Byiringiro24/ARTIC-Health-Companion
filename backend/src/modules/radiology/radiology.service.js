import { v4 as uuidv4 } from "uuid";
import { getDb } from "../../database/connection.js";
import { NotFoundError } from "../../middleware/errorHandler.js";

const T="tenant-001",H="hosp-001";

export async function getOrders({page=1,limit=20,patientId,status,tenantId,hospitalId}={}) {
  const db=getDb();const offset=(page-1)*limit;
  const where=["o.deleted_at IS NULL","o.tenant_id=?","o.hospital_id=?"];
  const params=[tenantId||T,hospitalId||H];
  if(patientId){where.push("o.patient_id=?");params.push(patientId);}
  if(status){where.push("o.status=?");params.push(status);}
  const cond=where.join(" AND ");
  const total=(await db.prepare(`SELECT COUNT(*) as n FROM radiology_orders o WHERE ${cond}`).get(...params))?.n??0;
  const rows=await db.prepare(`
    SELECT o.*,p.first_name||' '||p.last_name as patient_name,p.mrn,
           u.first_name||' '||u.last_name as ordered_by_name,
           r.first_name||' '||r.last_name as radiologist_name
    FROM radiology_orders o
    LEFT JOIN patients p ON p.id=o.patient_id
    LEFT JOIN users u ON u.id=o.ordered_by
    LEFT JOIN users r ON r.id=o.radiologist_id
    WHERE ${cond} ORDER BY o.ordered_at DESC LIMIT ? OFFSET ?
  `).all(...params,limit,offset);
  return{data:rows.map(fmt),meta:{total,page:+page,limit:+limit,totalPages:Math.ceil(total/limit)}};
}

export async function getOrderById(id){
  const db=getDb();
  const o=await db.prepare(`SELECT o.*,p.first_name||' '||p.last_name as patient_name,p.mrn,u.first_name||' '||u.last_name as ordered_by_name FROM radiology_orders o LEFT JOIN patients p ON p.id=o.patient_id LEFT JOIN users u ON u.id=o.ordered_by WHERE o.id=? AND o.deleted_at IS NULL`).get(id);
  if(!o)throw new NotFoundError("Radiology order");
  return fmt(o);
}

export async function createOrder(data,createdBy,tenantId,hospitalId){
  const db=getDb();const id=`rad-${uuidv4().slice(0,8)}`;
  await db.prepare(`INSERT INTO radiology_orders (id,tenant_id,hospital_id,patient_id,appointment_id,ordered_by,modality,body_part,indication,urgency,status) VALUES(?,?,?,?,?,?,?,?,?,?,?)`).run(id,tenantId||T,hospitalId||H,data.patientId,data.appointmentId||null,createdBy,data.modality,data.bodyPart||null,data.indication||null,data.urgency||"routine","ordered");
  return getOrderById(id);
}

export async function submitReport(id,data,radiologistId){
  const db=getDb();
  const o=await db.prepare(`SELECT id FROM radiology_orders WHERE id=? AND deleted_at IS NULL`).get(id);
  if(!o)throw new NotFoundError("Radiology order");
  await db.prepare(`UPDATE radiology_orders SET status='reported',report=?,findings=?,impression=?,radiologist_id=?,reported_at=datetime('now'),updated_at=datetime('now') WHERE id=?`).run(data.report||null,data.findings||null,data.impression||null,radiologistId,id);
  return getOrderById(id);
}

function fmt(o){
  return{id:o.id,patientId:o.patient_id,patientName:o.patient_name,mrn:o.mrn,appointmentId:o.appointment_id,orderedBy:o.ordered_by,orderedByName:o.ordered_by_name,modality:o.modality,bodyPart:o.body_part,indication:o.indication,urgency:o.urgency,status:o.status,report:o.report,findings:o.findings,impression:o.impression,radiologistId:o.radiologist_id,radiologistName:o.radiologist_name,reportedAt:o.reported_at,imageUrl:o.image_url,orderedAt:o.ordered_at,tenantId:o.tenant_id,hospitalId:o.hospital_id,createdAt:o.created_at,updatedAt:o.updated_at};
}
