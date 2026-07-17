/**
 * Laboratory Service — specimens, results, critical alerts.
 */
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../../database/connection.js";
import { NotFoundError, AppError } from "../../middleware/errorHandler.js";

const T = "tenant-001", H = "hosp-001";

function nextBarcode() {
  return `SP-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

export async function getLabRequests({ page=1, limit=20, patientId, status, urgency, tenantId, hospitalId } = {}) {
  const db = getDb(); const offset = (page-1)*limit;
  const where = ["lr.deleted_at IS NULL","lr.tenant_id=?","lr.hospital_id=?"];
  const params = [tenantId||T, hospitalId||H];
  if (patientId) { where.push("lr.patient_id=?"); params.push(patientId); }
  if (status)    { where.push("lr.status=?");     params.push(status); }
  if (urgency)   { where.push("lr.urgency=?");    params.push(urgency); }
  const cond = where.join(" AND ");
  const total = (await db.prepare(`SELECT COUNT(*) as n FROM lab_requests lr WHERE ${cond}`).get(...params))?.n ?? 0;
  const rows  = await db.prepare(`
    SELECT lr.*,
           p.first_name||' '||p.last_name as patient_name, p.mrn,
           u.first_name||' '||u.last_name as ordered_by_name,
           t.first_name||' '||t.last_name as technician_name
    FROM lab_requests lr
    LEFT JOIN patients p ON p.id=lr.patient_id
    LEFT JOIN users    u ON u.id=lr.ordered_by
    LEFT JOIN users    t ON t.id=lr.technician_id
    WHERE ${cond} ORDER BY
      CASE lr.urgency WHEN 'stat' THEN 1 WHEN 'urgent' THEN 2 ELSE 3 END,
      lr.ordered_at ASC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);
  return { data: rows.map(fmt), meta: { total, page:+page, limit:+limit, totalPages: Math.ceil(total/limit) } };
}

export async function getById(id) {
  const db = getDb();
  const r  = await db.prepare(`
    SELECT lr.*,
           p.first_name||' '||p.last_name as patient_name, p.mrn, p.allergies,
           u.first_name||' '||u.last_name as ordered_by_name,
           t.first_name||' '||t.last_name as technician_name
    FROM lab_requests lr
    LEFT JOIN patients p ON p.id=lr.patient_id
    LEFT JOIN users    u ON u.id=lr.ordered_by
    LEFT JOIN users    t ON t.id=lr.technician_id
    WHERE lr.id=? AND lr.deleted_at IS NULL
  `).get(id);
  if (!r) throw new NotFoundError("Lab request");
  return fmt(r);
}

export async function createLabRequest(data, createdBy, tenantId, hospitalId) {
  const db = getDb(); const id = `lab-${uuidv4().slice(0,8)}`;
  await db.prepare(`
    INSERT INTO lab_requests
      (id,tenant_id,hospital_id,patient_id,appointment_id,note_id,ordered_by,
       test_name,test_panel,sample_type,urgency,status,clinical_notes)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(id, tenantId||T, hospitalId||H, data.patientId, data.appointmentId||null,
    data.noteId||null, createdBy, data.testName, data.testPanel||null,
    data.sampleType||null, data.urgency||"routine", "ordered", data.clinicalNotes||null);
  return getById(id);
}

export async function collectSpecimen(id, userId) {
  const db = getDb();
  const r  = await db.prepare(`SELECT status FROM lab_requests WHERE id=? AND deleted_at IS NULL`).get(id);
  if (!r) throw new NotFoundError("Lab request");
  if (r.status !== "ordered") throw new AppError("Can only collect specimen for 'ordered' requests", 422, "INVALID_STATUS");
  const barcode = nextBarcode();
  await db.prepare(`
    UPDATE lab_requests SET status='collected', barcode=?, collected_at=datetime('now'),
    technician_id=?, updated_at=datetime('now') WHERE id=?
  `).run(barcode, userId, id);
  return getById(id);
}

export async function receiveSpecimen(id, userId) {
  const db = getDb();
  const r  = await db.prepare(`SELECT status FROM lab_requests WHERE id=? AND deleted_at IS NULL`).get(id);
  if (!r) throw new NotFoundError("Lab request");
  if (r.status !== "collected") throw new AppError("Specimen must be collected first", 422, "INVALID_STATUS");
  await db.prepare(`
    UPDATE lab_requests SET status='received', received_at=datetime('now'),
    technician_id=?, updated_at=datetime('now') WHERE id=?
  `).run(userId, id);
  return getById(id);
}

export async function enterResult(id, data, userId) {
  const db = getDb();
  const r  = await db.prepare(`SELECT * FROM lab_requests WHERE id=? AND deleted_at IS NULL`).get(id);
  if (!r) throw new NotFoundError("Lab request");

  const flag = data.flag || autoFlag(data.resultValue, data.referenceRange);
  const isCritical = flag && flag.toLowerCase().includes("critical");

  await db.prepare(`
    UPDATE lab_requests SET status='completed', result_value=?, result_unit=?,
    reference_range=?, result_flag=?, result_at=datetime('now'),
    processed_at=datetime('now'), technician_id=?, updated_at=datetime('now')
    WHERE id=?
  `).run(data.resultValue, data.resultUnit||null, data.referenceRange||null,
    flag||null, userId, id);

  if (isCritical) {
    const updated = await getById(id);
    await db.prepare(`
      INSERT INTO notifications (id,tenant_id,user_id,patient_id,type,title,message,channel,status)
      SELECT ?,lr.tenant_id,lr.ordered_by,lr.patient_id,'danger',
        'Critical Lab Result',
        'CRITICAL: '||lr.test_name||' for '||(SELECT first_name||' '||last_name FROM patients WHERE id=lr.patient_id)||
        ' — Value: '||?,
        'in-app','pending'
      FROM lab_requests lr WHERE lr.id=?
    `).run(`notif-${uuidv4().slice(0,8)}`, data.resultValue, id);
    await db.prepare(`UPDATE lab_requests SET critical_alerted=1 WHERE id=?`).run(id);
  }
  return getById(id);
}

export async function validateResult(id, userId) {
  const db = getDb();
  const r  = await db.prepare(`SELECT status FROM lab_requests WHERE id=? AND deleted_at IS NULL`).get(id);
  if (!r) throw new NotFoundError("Lab request");
  if (r.status !== "completed") throw new AppError("Result must be entered first", 422, "INVALID_STATUS");
  await db.prepare(`
    UPDATE lab_requests SET validated_by=?, validated_at=datetime('now'), updated_at=datetime('now')
    WHERE id=?
  `).run(userId, id);
  return getById(id);
}

function autoFlag(value, range) {
  if (!value || !range) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return null;
  const match = range.match(/([\d.]+)\s*[–\-]\s*([\d.]+)/);
  if (!match) return null;
  const [, lo, hi] = match;
  if (num < parseFloat(lo) * 0.7 || num > parseFloat(hi) * 1.3) return "Critical";
  if (num < parseFloat(lo)) return "Low";
  if (num > parseFloat(hi)) return "High";
  return "Normal";
}

function fmt(r) {
  return {
    id: r.id, patientId: r.patient_id, patientName: r.patient_name, mrn: r.mrn,
    appointmentId: r.appointment_id, noteId: r.note_id,
    orderedBy: r.ordered_by, orderedByName: r.ordered_by_name,
    testName: r.test_name, testPanel: r.test_panel, sampleType: r.sample_type,
    barcode: r.barcode, urgency: r.urgency, status: r.status,
    clinicalNotes: r.clinical_notes,
    orderedAt: r.ordered_at, collectedAt: r.collected_at,
    receivedAt: r.received_at, processedAt: r.processed_at,
    resultValue: r.result_value, resultUnit: r.result_unit,
    referenceRange: r.reference_range, resultFlag: r.result_flag,
    resultAt: r.result_at, technicianId: r.technician_id,
    technicianName: r.technician_name,
    validatedBy: r.validated_by, validatedAt: r.validated_at,
    criticalAlerted: Boolean(r.critical_alerted),
    tenantId: r.tenant_id, hospitalId: r.hospital_id,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}
