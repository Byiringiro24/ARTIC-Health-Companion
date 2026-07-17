/**
 * Medical Records Service — SOAP notes, vitals, diagnoses, problem list.
 */

import { v4 as uuidv4 } from "uuid";
import { getDb } from "../../database/connection.js";
import { NotFoundError, AppError } from "../../middleware/errorHandler.js";

// ── Vitals ────────────────────────────────────────────────────────────────────
export async function recordVitals(data, createdBy) {
  const db = getDb();
  const id = `vit-${uuidv4().slice(0, 8)}`;
  await db.prepare(`
    INSERT INTO vitals
      (id,patient_id,appointment_id,tenant_id,hospital_id,
       temperature,systolic_bp,diastolic_bp,heart_rate,respiratory_rate,
       oxygen_saturation,blood_glucose,weight_kg,height_cm,bmi,pain_score,
       recorded_by,notes)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    id, data.patientId, data.appointmentId || null,
    data.tenantId || "tenant-001", data.hospitalId || "hosp-001",
    data.temperature || null, data.systolicBp || null, data.diastolicBp || null,
    data.heartRate || null, data.respiratoryRate || null,
    data.oxygenSaturation || null, data.bloodGlucose || null,
    data.weightKg || null, data.heightCm || null,
    (data.weightKg && data.heightCm)
      ? +(data.weightKg / ((data.heightCm / 100) ** 2)).toFixed(1) : null,
    data.painScore || null,
    createdBy, data.notes || null
  );
  return getVitalsById(id);
}

export async function getVitalsById(id) {
  const db = getDb();
  const v  = await db.prepare(`SELECT * FROM vitals WHERE id=?`).get(id);
  if (!v) throw new NotFoundError("Vitals record");
  return fmtVitals(v);
}

export async function getPatientVitals(patientId, limit = 10) {
  const db  = getDb();
  const rows = await db.prepare(`
    SELECT v.*, u.first_name||' '||u.last_name as recorded_by_name
    FROM vitals v
    LEFT JOIN users u ON u.id = v.recorded_by
    WHERE v.patient_id=?
    ORDER BY v.recorded_at DESC
    LIMIT ?
  `).all(patientId, limit);
  return rows.map(fmtVitals);
}

// ── Clinical notes (SOAP) ─────────────────────────────────────────────────────
export async function createNote(data, createdBy) {
  const db = getDb();
  const id = `note-${uuidv4().slice(0, 8)}`;
  await db.prepare(`
    INSERT INTO clinical_notes
      (id,patient_id,appointment_id,tenant_id,hospital_id,author_id,
       note_type,subjective,objective,assessment,plan,
       diagnoses,vitals_id,signed,signed_at,created_by)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,0,NULL,?)
  `).run(
    id, data.patientId, data.appointmentId || null,
    data.tenantId || "tenant-001", data.hospitalId || "hosp-001",
    createdBy, data.noteType || "general",
    data.subjective || "", data.objective || "",
    data.assessment || "", data.plan || "",
    data.diagnoses ? JSON.stringify(data.diagnoses) : null,
    data.vitalsId  || null,
    createdBy
  );
  return getNoteById(id);
}

export async function getNoteById(id) {
  const db = getDb();
  const n  = await db.prepare(`
    SELECT cn.*, u.first_name||' '||u.last_name as author_name,
           u.job_title as author_title
    FROM clinical_notes cn
    LEFT JOIN users u ON u.id = cn.author_id
    WHERE cn.id=? AND cn.deleted_at IS NULL
  `).get(id);
  if (!n) throw new NotFoundError("Clinical note");
  return fmtNote(n);
}

export async function getPatientNotes(patientId, limit = 20) {
  const db  = getDb();
  const rows = await db.prepare(`
    SELECT cn.*, u.first_name||' '||u.last_name as author_name, u.job_title as author_title
    FROM clinical_notes cn
    LEFT JOIN users u ON u.id = cn.author_id
    WHERE cn.patient_id=? AND cn.deleted_at IS NULL
    ORDER BY cn.created_at DESC
    LIMIT ?
  `).all(patientId, limit);
  return rows.map(fmtNote);
}

export async function signNote(id, userId) {
  const db = getDb();
  const n  = await db.prepare(`SELECT * FROM clinical_notes WHERE id=? AND deleted_at IS NULL`).get(id);
  if (!n) throw new NotFoundError("Clinical note");
  if (n.author_id !== userId) throw new AppError("Only the author can sign a note", 403, "FORBIDDEN");
  if (n.signed) throw new AppError("Note is already signed", 422, "ALREADY_SIGNED");
  await db.prepare(`UPDATE clinical_notes SET signed=1, signed_at=datetime('now'), updated_at=datetime('now') WHERE id=?`).run(id);
  return getNoteById(id);
}

export async function updateNote(id, data, userId) {
  const db = getDb();
  const n  = await db.prepare(`SELECT * FROM clinical_notes WHERE id=? AND deleted_at IS NULL`).get(id);
  if (!n) throw new NotFoundError("Clinical note");
  if (n.signed) throw new AppError("Cannot edit a signed note. Create an addendum.", 422, "NOTE_SIGNED");
  if (n.author_id !== userId) throw new AppError("Only the author can edit a note", 403, "FORBIDDEN");

  const fields = []; const vals = [];
  const map = { subjective:"subjective", objective:"objective", assessment:"assessment", plan:"plan", noteType:"note_type" };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { fields.push(`${col}=?`); vals.push(data[k]); }
  }
  if (data.diagnoses !== undefined) { fields.push("diagnoses=?"); vals.push(JSON.stringify(data.diagnoses)); }
  if (!fields.length) return getNoteById(id);
  fields.push("updated_at=datetime('now')");
  vals.push(id);
  await db.prepare(`UPDATE clinical_notes SET ${fields.join(",")} WHERE id=?`).run(...vals);
  return getNoteById(id);
}

// ── Patient summary (for doctor workspace load) ───────────────────────────────
export async function getPatientSummary(patientId) {
  const db = getDb();
  const patient = await db.prepare(`SELECT * FROM patients WHERE id=? AND deleted_at IS NULL`).get(patientId);
  if (!patient) throw new NotFoundError("Patient");

  const [lastVitals, recentNotes] = await Promise.all([
    getPatientVitals(patientId, 5),
    getPatientNotes(patientId, 3),
  ]);

  const parse = (v) => { try { return v ? JSON.parse(v) : []; } catch { return []; } };

  return {
    id:               patient.id,
    mrn:              patient.mrn,
    fullName:         `${patient.first_name} ${patient.last_name}`,
    dateOfBirth:      patient.date_of_birth,
    gender:           patient.gender,
    bloodGroup:       patient.blood_group,
    allergies:        parse(patient.allergies),
    chronicConditions:parse(patient.chronic_conditions),
    currentMedications:parse(patient.current_medications),
    insuranceProvider:patient.insurance_provider,
    lastVitals:       lastVitals.slice(0, 1)[0] || null,
    recentNotes,
  };
}

// ── Format helpers ────────────────────────────────────────────────────────────
function fmtVitals(v) {
  return {
    id:               v.id, patientId: v.patient_id, appointmentId: v.appointment_id,
    temperature:      v.temperature, systolicBp: v.systolic_bp, diastolicBp: v.diastolic_bp,
    heartRate:        v.heart_rate, respiratoryRate: v.respiratory_rate,
    oxygenSaturation: v.oxygen_saturation, bloodGlucose: v.blood_glucose,
    weightKg:         v.weight_kg, heightCm: v.height_cm, bmi: v.bmi,
    painScore:        v.pain_score, recordedBy: v.recorded_by, recordedByName: v.recorded_by_name,
    notes:            v.notes, recordedAt: v.recorded_at,
  };
}

function fmtNote(n) {
  return {
    id:            n.id, patientId: n.patient_id, appointmentId: n.appointment_id,
    authorId:      n.author_id, authorName: n.author_name, authorTitle: n.author_title,
    noteType:      n.note_type,
    subjective:    n.subjective, objective: n.objective,
    assessment:    n.assessment, plan: n.plan,
    diagnoses:     safeJson(n.diagnoses) || [],
    vitalsId:      n.vitals_id,
    signed:        Boolean(n.signed), signedAt: n.signed_at,
    createdAt:     n.created_at, updatedAt: n.updated_at,
  };
}

function safeJson(v) { try { return v ? JSON.parse(v) : null; } catch { return v; } }
