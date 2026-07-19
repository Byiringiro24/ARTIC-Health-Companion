/**
 * Inpatient Service — bed management, admissions, discharge, ward rounds.
 */
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../../database/connection.js";
import { NotFoundError, AppError } from "../../middleware/errorHandler.js";
import { emitBedUpdate } from "../realtime/socket.js";

const T = "tenant-001", H = "hosp-001";

// ── Beds ───────────────────────────────────────────────────────────────────────
export async function getBeds({ ward, status, hospitalId } = {}) {
  const db = getDb(); const where = ["b.hospital_id=?", "b.is_active=1"]; const params = [hospitalId || H];
  if (ward)   { where.push("b.ward=?");   params.push(ward); }
  if (status) { where.push("b.status=?"); params.push(status); }
  const rows = await db.prepare(`
    SELECT b.*, a.id as admission_id,
           p.first_name||' '||p.last_name as patient_name, p.mrn,
           u.first_name||' '||u.last_name as doctor_name
    FROM beds b
    LEFT JOIN admissions a ON a.bed_id=b.id AND a.status='active'
    LEFT JOIN patients p ON p.id=a.patient_id
    LEFT JOIN users    u ON u.id=a.doctor_id
    WHERE ${where.join(" AND ")} ORDER BY b.ward, b.room, b.bed_number
  `).all(...params);

  // Group by ward
  const byWard = {};
  for (const b of rows) {
    if (!byWard[b.ward]) byWard[b.ward] = [];
    byWard[b.ward].push(fmtBed(b));
  }
  return byWard;
}

export async function getBedById(id) {
  const db = getDb();
  const b = await db.prepare(`SELECT * FROM beds WHERE id=?`).get(id);
  if (!b) throw new NotFoundError("Bed");
  return fmtBed(b);
}

export async function updateBedStatus(id, status, userId) {
  const db = getDb();
  const b = await db.prepare(`SELECT id, hospital_id FROM beds WHERE id=?`).get(id);
  if (!b) throw new NotFoundError("Bed");
  await db.prepare(`UPDATE beds SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(status, id);
  emitBedUpdate(b.hospital_id, { bedId: id, status });
  return getBedById(id);
}

export async function seedBeds(hospitalId, tenantId) {
  const db = getDb();
  const existing = await db.prepare(`SELECT COUNT(*) as n FROM beds WHERE hospital_id=?`).get(hospitalId || H);
  if (existing?.n > 0) return;
  const demoBeads = [
    { id:"bed-001", ward:"ICU",          room:"ICU-1",   bed_number:"ICU-1A", type:"icu",       status:"occupied" },
    { id:"bed-002", ward:"ICU",          room:"ICU-1",   bed_number:"ICU-1B", type:"icu",       status:"available" },
    { id:"bed-003", ward:"Medical Ward", room:"MW-101",  bed_number:"MW-101A",type:"standard",  status:"occupied" },
    { id:"bed-004", ward:"Medical Ward", room:"MW-101",  bed_number:"MW-101B",type:"standard",  status:"available" },
    { id:"bed-005", ward:"Medical Ward", room:"MW-102",  bed_number:"MW-102A",type:"standard",  status:"cleaning" },
    { id:"bed-006", ward:"Maternity",    room:"MAT-201", bed_number:"MAT-201A",type:"maternity", status:"available" },
    { id:"bed-007", ward:"Maternity",    room:"MAT-201", bed_number:"MAT-201B",type:"maternity", status:"occupied" },
    { id:"bed-008", ward:"Paediatric",   room:"PD-401",  bed_number:"PD-401A", type:"paediatric",status:"occupied" },
    { id:"bed-009", ward:"Isolation",    room:"ISO-301", bed_number:"ISO-301A",type:"isolation", status:"available" },
  ];
  const ins = db.prepare(`INSERT INTO beds (id,hospital_id,tenant_id,ward,room,bed_number,type,status) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING`);
  for (const b of demoBeads) await ins.run(b.id, hospitalId||H, tenantId||T, b.ward, b.room, b.bed_number, b.type, b.status);
}

// ── Admissions ────────────────────────────────────────────────────────────────
export async function getAdmissions({ status, ward, hospitalId } = {}) {
  const db = getDb(); const where = ["a.hospital_id=?"]; const params = [hospitalId||H];
  if (status) { where.push("a.status=?"); params.push(status); }
  if (ward)   { where.push("a.ward=?");   params.push(ward); }
  const rows = await db.prepare(`
    SELECT a.*, p.first_name||' '||p.last_name as patient_name, p.mrn, p.blood_group, p.allergies,
           u.first_name||' '||u.last_name as doctor_name,
           b.ward as bed_ward, b.room as bed_room, b.bed_number
    FROM admissions a
    LEFT JOIN patients p ON p.id=a.patient_id
    LEFT JOIN users    u ON u.id=a.doctor_id
    LEFT JOIN beds     b ON b.id=a.bed_id
    WHERE ${where.join(" AND ")} ORDER BY a.admitted_at DESC
  `).all(...params);
  return rows.map(fmtAdmission);
}

export async function getAdmissionById(id) {
  const db = getDb();
  const a = await db.prepare(`
    SELECT a.*, p.first_name||' '||p.last_name as patient_name, p.mrn, p.blood_group, p.allergies,
           u.first_name||' '||u.last_name as doctor_name,
           b.ward as bed_ward, b.room, b.bed_number
    FROM admissions a
    LEFT JOIN patients p ON p.id=a.patient_id
    LEFT JOIN users    u ON u.id=a.doctor_id
    LEFT JOIN beds     b ON b.id=a.bed_id
    WHERE a.id=?
  `).get(id);
  if (!a) throw new NotFoundError("Admission");
  return fmtAdmission(a);
}

export async function admitPatient(data, createdBy, tenantId, hospitalId) {
  const db = getDb();
  // Verify bed is available
  const bed = await db.prepare(`SELECT * FROM beds WHERE id=? AND status='available'`).get(data.bedId);
  if (!bed) throw new AppError("Bed is not available", 422, "BED_NOT_AVAILABLE");

  const id = `adm-${uuidv4().slice(0, 8)}`;
  await db.prepare(`
    INSERT INTO admissions (id,tenant_id,hospital_id,patient_id,bed_id,doctor_id,appointment_id,
      admission_type,ward,admission_diagnosis,admitting_notes,status,created_by)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,'active',?)
  `).run(id, tenantId||T, hospitalId||H, data.patientId, data.bedId, data.doctorId,
    data.appointmentId||null, data.admissionType||"elective",
    bed.ward, data.admissionDiagnosis||null, data.admittingNotes||null, createdBy);

  // Mark bed as occupied
  await db.prepare(`UPDATE beds SET status='occupied', updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(data.bedId);
  emitBedUpdate(hospitalId||H, { bedId: data.bedId, status: "occupied" });
  return getAdmissionById(id);
}

export async function dischargePatient(admissionId, data, userId) {
  const db = getDb();
  const adm = await db.prepare(`SELECT * FROM admissions WHERE id=? AND status='active'`).get(admissionId);
  if (!adm) throw new NotFoundError("Admission");

  // Create discharge summary
  const dsId = `ds-${uuidv4().slice(0, 8)}`;
  await db.prepare(`
    INSERT INTO discharge_summaries
      (id,admission_id,patient_id,doctor_id,admission_diagnosis,final_diagnosis,
       hospital_course,procedures_performed,medications_on_discharge,follow_up_plan,follow_up_date,instructions)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(dsId, admissionId, adm.patient_id, userId,
    adm.admission_diagnosis, data.finalDiagnosis||null,
    data.hospitalCourse||null, data.proceduresPerformed||null,
    data.medicationsOnDischarge ? JSON.stringify(data.medicationsOnDischarge) : null,
    data.followUpPlan||null, data.followUpDate||null, data.instructions||null);

  // Update admission
  await db.prepare(`UPDATE admissions SET status='discharged', discharged_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(admissionId);

  // Free bed
  if (adm.bed_id) {
    await db.prepare(`UPDATE beds SET status='cleaning', updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(adm.bed_id);
    emitBedUpdate(adm.hospital_id, { bedId: adm.bed_id, status: "cleaning" });
  }
  return { admissionId, dischargeSummaryId: dsId, message: "Patient discharged successfully" };
}

export async function addWardRound(data, doctorId) {
  const db = getDb(); const id = `wr-${uuidv4().slice(0, 8)}`;
  await db.prepare(`INSERT INTO ward_rounds (id,admission_id,patient_id,doctor_id,vitals_id,notes,plan,status_update) VALUES(?,?,?,?,?,?,?,?)`).run(id, data.admissionId, data.patientId, doctorId, data.vitalsId||null, data.notes||null, data.plan||null, data.statusUpdate||null);
  return db.prepare(`SELECT * FROM ward_rounds WHERE id=?`).get(id);
}

export async function transferPatient(admissionId, newBedId, userId) {
  const db = getDb();
  const adm = await db.prepare(`SELECT * FROM admissions WHERE id=? AND status='active'`).get(admissionId);
  if (!adm) throw new NotFoundError("Admission");
  const newBed = await db.prepare(`SELECT * FROM beds WHERE id=? AND status='available'`).get(newBedId);
  if (!newBed) throw new AppError("Target bed is not available", 422, "BED_NOT_AVAILABLE");

  // Free old bed
  if (adm.bed_id) await db.prepare(`UPDATE beds SET status='cleaning', updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(adm.bed_id);

  // Occupy new bed
  await db.prepare(`UPDATE beds SET status='occupied', updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(newBedId);
  await db.prepare(`UPDATE admissions SET bed_id=?, ward=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(newBedId, newBed.ward, admissionId);

  emitBedUpdate(adm.hospital_id, { bedId: newBedId, status: "occupied" });
  if (adm.bed_id) emitBedUpdate(adm.hospital_id, { bedId: adm.bed_id, status: "cleaning" });
  return getAdmissionById(admissionId);
}

// ── Format ─────────────────────────────────────────────────────────────────────
function fmtBed(b) {
  return { id:b.id, ward:b.ward, room:b.room, bedNumber:b.bed_number, type:b.type, status:b.status,
    admissionId:b.admission_id, patientName:b.patient_name, mrn:b.mrn, doctorName:b.doctor_name,
    hospitalId:b.hospital_id };
}
function fmtAdmission(a) {
  const sj = v => { try { return v ? JSON.parse(v) : null; } catch { return v; } };
  return { id:a.id, patientId:a.patient_id, patientName:a.patient_name, mrn:a.mrn,
    bloodGroup:a.blood_group, allergies:sj(a.allergies)||[],
    bedId:a.bed_id, ward:a.bed_ward||a.ward, room:a.room, bedNumber:a.bed_number,
    doctorId:a.doctor_id, doctorName:a.doctor_name,
    admissionType:a.admission_type, admissionDiagnosis:a.admission_diagnosis,
    admittingNotes:a.admitting_notes, status:a.status,
    admittedAt:a.admitted_at, dischargedAt:a.discharged_at,
    hospitalId:a.hospital_id, tenantId:a.tenant_id };
}
