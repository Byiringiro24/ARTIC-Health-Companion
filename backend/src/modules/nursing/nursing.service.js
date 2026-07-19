/**
 * Nursing Service — triage, MAR, vitals, shift handover, consent.
 */
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../../database/connection.js";
import { NotFoundError } from "../../middleware/errorHandler.js";
import { emitQueueUpdate } from "../realtime/socket.js";

const H = "hosp-001", T = "tenant-001";

// ── Triage ─────────────────────────────────────────────────────────────────────
export async function triagePatient(data, nurseId) {
  const db = getDb(); const id = `triage-${uuidv4().slice(0, 8)}`;
  await db.prepare(`
    INSERT INTO triage_assessments
      (id,patient_id,appointment_id,hospital_id,nurse_id,triage_level,chief_complaint,vitals_id,allergies_noted,notes)
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `).run(id, data.patientId, data.appointmentId||null, data.hospitalId||H,
    nurseId, data.triageLevel, data.chiefComplaint,
    data.vitalsId||null, data.allergiesNoted||null, data.notes||null);

  // Escalate queue position for emergency/urgent
  if (data.triageLevel <= 2 && data.appointmentId) {
    await db.prepare(`UPDATE appointments SET priority=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .run(data.triageLevel === 1 ? "emergency" : "urgent", data.appointmentId);
    emitQueueUpdate(data.hospitalId||H, data.departmentId, { escalated: data.appointmentId, triageLevel: data.triageLevel });
  }
  return getTriageById(id);
}

export async function getTriageById(id) {
  const db = getDb();
  const t = await db.prepare(`
    SELECT tr.*, p.first_name||' '||p.last_name as patient_name, p.mrn,
           u.first_name||' '||u.last_name as nurse_name
    FROM triage_assessments tr
    LEFT JOIN patients p ON p.id=tr.patient_id
    LEFT JOIN users    u ON u.id=tr.nurse_id
    WHERE tr.id=?
  `).get(id);
  if (!t) throw new NotFoundError("Triage assessment");
  return fmtTriage(t);
}

export async function getTriageList({ hospitalId, date } = {}) {
  const db = getDb(); const d = date || new Date().toISOString().slice(0, 10);
  const rows = await db.prepare(`
    SELECT tr.*, p.first_name||' '||p.last_name as patient_name, p.mrn,
           u.first_name||' '||u.last_name as nurse_name
    FROM triage_assessments tr
    LEFT JOIN patients p ON p.id=tr.patient_id
    LEFT JOIN users    u ON u.id=tr.nurse_id
    WHERE tr.hospital_id=? AND date(tr.created_at)=?
    ORDER BY tr.triage_level ASC, tr.created_at ASC
  `).all(hospitalId||H, d);
  return rows.map(fmtTriage);
}

// ── Medication Administration Record (MAR) ────────────────────────────────────
export async function recordMedication(data, nurseId) {
  const db = getDb(); const id = `mar-${uuidv4().slice(0, 8)}`;
  await db.prepare(`
    INSERT INTO medication_administration
      (id,patient_id,admission_id,prescription_id,nurse_id,drug_name,dose,route,given_at,notes,omitted,omit_reason)
    VALUES (?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,?,?,?)
  `).run(id, data.patientId, data.admissionId||null, data.prescriptionId||null,
    nurseId, data.drugName, data.dose, data.route,
    data.notes||null, data.omitted?1:0, data.omitReason||null);
  return db.prepare(`SELECT * FROM medication_administration WHERE id=?`).get(id);
}

export async function getPatientMAR(patientId) {
  const db = getDb();
  const rows = await db.prepare(`
    SELECT mar.*, u.first_name||' '||u.last_name as nurse_name
    FROM medication_administration mar
    LEFT JOIN users u ON u.id=mar.nurse_id
    WHERE mar.patient_id=? ORDER BY mar.given_at DESC LIMIT 50
  `).all(patientId);
  return rows;
}

// ── Shift Handover ─────────────────────────────────────────────────────────────
export async function createHandover(data, outgoingNurseId) {
  const db = getDb(); const id = `ho-${uuidv4().slice(0, 8)}`;
  await db.prepare(`
    INSERT INTO shift_handovers
      (id,hospital_id,ward,shift_date,shift_type,outgoing_nurse,incoming_nurse,patient_count,notes,pending_tasks)
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `).run(id, data.hospitalId||H, data.ward, data.shiftDate||new Date().toISOString().slice(0,10),
    data.shiftType||"morning", outgoingNurseId, data.incomingNurseId||null,
    data.patientCount||0, data.notes, data.pendingTasks?JSON.stringify(data.pendingTasks):null);
  return db.prepare(`SELECT * FROM shift_handovers WHERE id=?`).get(id);
}

export async function getHandovers({ hospitalId, ward, date } = {}) {
  const db = getDb(); const where = ["sh.hospital_id=?"]; const params = [hospitalId||H];
  if (ward) { where.push("sh.ward=?"); params.push(ward); }
  if (date) { where.push("sh.shift_date=?"); params.push(date); }
  const rows = await db.prepare(`
    SELECT sh.*,
           o.first_name||' '||o.last_name as outgoing_name,
           i.first_name||' '||i.last_name as incoming_name
    FROM shift_handovers sh
    LEFT JOIN users o ON o.id=sh.outgoing_nurse
    LEFT JOIN users i ON i.id=sh.incoming_nurse
    WHERE ${where.join(" AND ")} ORDER BY sh.created_at DESC LIMIT 20
  `).all(...params);
  return rows.map(r=>({...r, pendingTasks: safeJson(r.pending_tasks)||[] }));
}

// ── Patient Consent ────────────────────────────────────────────────────────────
export async function recordConsent(data, witnessId) {
  const db = getDb(); const id = `con-${uuidv4().slice(0, 8)}`;
  await db.prepare(`
    INSERT INTO patient_consents (id,patient_id,admission_id,consent_type,consented,witness_id,notes)
    VALUES (?,?,?,?,?,?,?)
  `).run(id, data.patientId, data.admissionId||null, data.consentType, data.consented?1:0, witnessId, data.notes||null);
  return db.prepare(`SELECT * FROM patient_consents WHERE id=?`).get(id);
}

// ── Format ─────────────────────────────────────────────────────────────────────
function fmtTriage(t) {
  return { id:t.id, patientId:t.patient_id, patientName:t.patient_name, mrn:t.mrn,
    appointmentId:t.appointment_id, nurseId:t.nurse_id, nurseName:t.nurse_name,
    triageLevel:t.triage_level, chiefComplaint:t.chief_complaint,
    vitalsId:t.vitals_id, allergiesNoted:t.allergies_noted, notes:t.notes,
    createdAt:t.created_at };
}
function safeJson(v) { try { return v ? JSON.parse(v) : null; } catch { return v; } }
