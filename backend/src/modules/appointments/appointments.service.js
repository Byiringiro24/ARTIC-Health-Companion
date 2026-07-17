/**
 * Appointments Service — scheduling, queue, check-in, status transitions.
 */

import { v4 as uuidv4 } from "uuid";
import { getDb } from "../../database/connection.js";
import { NotFoundError, ConflictError, AppError } from "../../middleware/errorHandler.js";

const DEPT_DEFAULT  = "dept-002";
const TENANT_DEFAULT = "tenant-001";
const HOSP_DEFAULT   = "hosp-001";

// ── Queue token generator ─────────────────────────────────────────────────────
async function nextQueueToken(db, deptCode) {
  const prefix = (deptCode || "GEN").toUpperCase().slice(0, 3);
  const today  = new Date().toISOString().slice(0, 10);
  const row    = await db.prepare(`
    SELECT queue_number FROM appointments
    WHERE appointment_date=? AND queue_number LIKE '${prefix}-%'
    ORDER BY queue_number DESC LIMIT 1
  `).get(today);
  const seq = row ? parseInt(row.queue_number.split("-")[1] || "0", 10) + 1 : 1;
  return `${prefix}-${String(seq).padStart(3, "0")}`;
}

// ── List appointments ─────────────────────────────────────────────────────────
export async function getAppointments({ page = 1, limit = 20, patientId, doctorId,
  departmentId, date, status, priority, tenantId, hospitalId } = {}) {
  const db     = getDb();
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const where  = ["a.deleted_at IS NULL"];
  const params = [];

  where.push("a.tenant_id=?");   params.push(tenantId   || TENANT_DEFAULT);
  where.push("a.hospital_id=?"); params.push(hospitalId || HOSP_DEFAULT);

  if (patientId)    { where.push("a.patient_id=?");    params.push(patientId); }
  if (doctorId)     { where.push("a.doctor_id=?");     params.push(doctorId); }
  if (departmentId) { where.push("a.department_id=?"); params.push(departmentId); }
  if (date)         { where.push("a.appointment_date=?"); params.push(date); }
  if (status)       { where.push("a.status=?");        params.push(status); }
  if (priority)     { where.push("a.priority=?");      params.push(priority); }

  const cond = where.join(" AND ");
  const totalRow = await db.prepare(`SELECT COUNT(*) as n FROM appointments a WHERE ${cond}`).get(...params);
  const total = totalRow?.n ?? 0;
  const rows  = await db.prepare(`
    SELECT a.*,
           p.first_name||' '||p.last_name as patient_name, p.mrn, p.phone as patient_phone,
           p.insurance_provider,
           u.first_name||' '||u.last_name as doctor_name,
           d.name as department_name, d.code as department_code
    FROM appointments a
    LEFT JOIN patients p    ON p.id = a.patient_id
    LEFT JOIN users    u    ON u.id = a.doctor_id
    LEFT JOIN departments d ON d.id = a.department_id
    WHERE ${cond}
    ORDER BY a.appointment_date ASC, a.start_time ASC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  return { data: rows.map(fmt), meta: { total, page: +page, limit: +limit, totalPages: Math.ceil(total / limit) } };
}

// ── Get one ───────────────────────────────────────────────────────────────────
export async function getAppointmentById(id) {
  const db = getDb();
  const a  = await db.prepare(`
    SELECT a.*,
           p.first_name||' '||p.last_name as patient_name, p.mrn, p.phone as patient_phone,
           p.insurance_provider, p.blood_group, p.allergies,
           u.first_name||' '||u.last_name as doctor_name,
           d.name as department_name, d.code as department_code
    FROM appointments a
    LEFT JOIN patients p    ON p.id = a.patient_id
    LEFT JOIN users    u    ON u.id = a.doctor_id
    LEFT JOIN departments d ON d.id = a.department_id
    WHERE a.id=? AND a.deleted_at IS NULL
  `).get(id);
  if (!a) throw new NotFoundError("Appointment");
  return fmt(a);
}

// ── Create appointment ────────────────────────────────────────────────────────
export async function createAppointment(data, createdBy, tenantId, hospitalId) {
  const db = getDb();

  // Validate patient exists
  const patient = await db.prepare(`SELECT id FROM patients WHERE id=? AND deleted_at IS NULL`).get(data.patientId);
  if (!patient) throw new AppError("Patient not found", 404, "PATIENT_NOT_FOUND");

  // Validate doctor exists
  const doctor = await db.prepare(`SELECT id FROM users WHERE id=? AND deleted_at IS NULL`).get(data.doctorId);
  if (!doctor) throw new AppError("Doctor not found", 404, "DOCTOR_NOT_FOUND");

  // Check for double booking (same doctor, same date+time, not cancelled)
  if (!data.walkIn) {
    const conflict = await db.prepare(`
      SELECT id FROM appointments
      WHERE doctor_id=? AND appointment_date=? AND start_time=?
        AND status NOT IN ('cancelled','no-show') AND deleted_at IS NULL
    `).get(data.doctorId, data.appointmentDate, data.startTime);
    if (conflict) throw new ConflictError("This time slot is already booked for the doctor");
  }

  const tid = tenantId   || TENANT_DEFAULT;
  const hid = hospitalId || HOSP_DEFAULT;
  const deptId = data.departmentId || DEPT_DEFAULT;

  // Get dept code for queue token
  const dept = await db.prepare(`SELECT code FROM departments WHERE id=?`).get(deptId);
  const queueToken = await nextQueueToken(db, dept?.code || "GEN");

  const id = `appt-${uuidv4().slice(0, 8)}`;
  await db.prepare(`
    INSERT INTO appointments
      (id,tenant_id,hospital_id,patient_id,doctor_id,department_id,
       appointment_date,start_time,end_time,duration_minutes,
       type,priority,status,queue_number,chief_complaint,notes,walk_in,
       created_by,updated_by)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    id, tid, hid,
    data.patientId, data.doctorId, deptId,
    data.appointmentDate, data.startTime,
    data.endTime || null,
    data.durationMinutes || 30,
    data.type     || "consultation",
    data.priority || "routine",
    data.walkIn   ? "checked-in" : "scheduled",
    queueToken,
    data.chiefComplaint || null,
    data.notes    || null,
    data.walkIn   ? 1 : 0,
    createdBy, createdBy
  );

  return getAppointmentById(id);
}

// ── Check-in ──────────────────────────────────────────────────────────────────
export async function checkIn(id, updatedBy) {
  const db = getDb();
  const a  = await db.prepare(`SELECT * FROM appointments WHERE id=? AND deleted_at IS NULL`).get(id);
  if (!a) throw new NotFoundError("Appointment");
  if (!["scheduled","confirmed"].includes(a.status))
    throw new AppError(`Cannot check in appointment with status '${a.status}'`, 422, "INVALID_STATUS");

  await db.prepare(`
    UPDATE appointments SET status='checked-in', check_in_time=datetime('now'), updated_by=?, updated_at=datetime('now')
    WHERE id=?
  `).run(updatedBy, id);
  return getAppointmentById(id);
}

// ── Status transition ─────────────────────────────────────────────────────────
const VALID_TRANSITIONS = {
  scheduled:    ["confirmed","checked-in","cancelled","no-show"],
  confirmed:    ["checked-in","cancelled","no-show"],
  "checked-in": ["in-progress","cancelled"],
  "in-progress":["completed","admitted"],
  completed:    [],
  admitted:     ["completed"],
  cancelled:    [],
  "no-show":    [],
};

export async function updateStatus(id, status, updatedBy) {
  const db = getDb();
  const a  = await db.prepare(`SELECT status FROM appointments WHERE id=? AND deleted_at IS NULL`).get(id);
  if (!a) throw new NotFoundError("Appointment");

  const allowed = VALID_TRANSITIONS[a.status] || [];
  if (!allowed.includes(status))
    throw new AppError(`Cannot transition from '${a.status}' to '${status}'`, 422, "INVALID_TRANSITION");

  const extra = status === "completed" ? ", check_out_time=datetime('now')" : "";
  await db.prepare(`
    UPDATE appointments SET status=?, updated_by=?, updated_at=datetime('now')${extra} WHERE id=?
  `).run(status, updatedBy, id);
  return getAppointmentById(id);
}

// ── Update appointment ────────────────────────────────────────────────────────
export async function updateAppointment(id, data, updatedBy) {
  const db = getDb();
  const existing = await db.prepare(`SELECT * FROM appointments WHERE id=? AND deleted_at IS NULL`).get(id);
  if (!existing) throw new NotFoundError("Appointment");

  const fields = [];
  const vals   = [];
  const map = {
    appointmentDate: "appointment_date", startTime: "start_time", endTime: "end_time",
    durationMinutes: "duration_minutes", type: "type", priority: "priority",
    chiefComplaint: "chief_complaint", notes: "notes", doctorId: "doctor_id",
    departmentId: "department_id",
  };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { fields.push(`${col}=?`); vals.push(data[k]); }
  }
  if (!fields.length) return getAppointmentById(id);
  fields.push("updated_by=?", "updated_at=datetime('now')");
  vals.push(updatedBy, id);
  await db.prepare(`UPDATE appointments SET ${fields.join(",")} WHERE id=?`).run(...vals);
  return getAppointmentById(id);
}

// ── Soft delete ───────────────────────────────────────────────────────────────
export async function deleteAppointment(id, deletedBy) {
  const db = getDb();
  const a  = await db.prepare(`SELECT id FROM appointments WHERE id=? AND deleted_at IS NULL`).get(id);
  if (!a) throw new NotFoundError("Appointment");
  await db.prepare(`
    UPDATE appointments SET deleted_at=datetime('now'), status='cancelled', updated_by=? WHERE id=?
  `).run(deletedBy, id);
}

// ── Queue (today's appointments sorted by priority + check-in time) ───────────
export async function getQueue({ departmentId, doctorId, tenantId, hospitalId } = {}) {
  const db    = getDb();
  const today = new Date().toISOString().slice(0, 10);
  const where = ["a.deleted_at IS NULL", "a.appointment_date=?",
    "a.status IN ('checked-in','in-progress')",
    "a.tenant_id=?", "a.hospital_id=?"];
  const params = [today, tenantId || TENANT_DEFAULT, hospitalId || HOSP_DEFAULT];

  if (departmentId) { where.push("a.department_id=?"); params.push(departmentId); }
  if (doctorId)     { where.push("a.doctor_id=?");     params.push(doctorId); }

  const rows = await db.prepare(`
    SELECT a.*,
           p.first_name||' '||p.last_name as patient_name, p.mrn,
           u.first_name||' '||u.last_name as doctor_name,
           d.name as department_name
    FROM appointments a
    LEFT JOIN patients p    ON p.id = a.patient_id
    LEFT JOIN users    u    ON u.id = a.doctor_id
    LEFT JOIN departments d ON d.id = a.department_id
    WHERE ${where.join(" AND ")}
    ORDER BY
      CASE a.priority WHEN 'emergency' THEN 1 WHEN 'urgent' THEN 2 ELSE 3 END,
      a.check_in_time ASC
  `).all(...params);

  return rows.map(fmt);
}

// ── Format output ─────────────────────────────────────────────────────────────
function fmt(a) {
  return {
    id:              a.id,
    patientId:       a.patient_id,
    patientName:     a.patient_name,
    mrn:             a.mrn,
    patientPhone:    a.patient_phone,
    insuranceProvider: a.insurance_provider,
    bloodGroup:      a.blood_group,
    allergies:       safeJson(a.allergies),
    doctorId:        a.doctor_id,
    doctorName:      a.doctor_name,
    departmentId:    a.department_id,
    departmentName:  a.department_name,
    departmentCode:  a.department_code,
    appointmentDate: a.appointment_date,
    startTime:       a.start_time,
    endTime:         a.end_time,
    durationMinutes: a.duration_minutes,
    type:            a.type,
    priority:        a.priority,
    status:          a.status,
    queueNumber:     a.queue_number,
    chiefComplaint:  a.chief_complaint,
    notes:           a.notes,
    walkIn:          Boolean(a.walk_in),
    reminderSent:    Boolean(a.reminder_sent),
    checkInTime:     a.check_in_time,
    checkOutTime:    a.check_out_time,
    tenantId:        a.tenant_id,
    hospitalId:      a.hospital_id,
    createdAt:       a.created_at,
    updatedAt:       a.updated_at,
  };
}

function safeJson(v) { try { return v ? JSON.parse(v) : null; } catch { return v; } }
