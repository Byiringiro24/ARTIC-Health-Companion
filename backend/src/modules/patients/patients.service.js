/**
 * Patients Service — full CRUD, search, MRN generation, insurance linking.
 */

import { v4 as uuidv4 } from "uuid";
import { getDb } from "../../database/connection.js";
import { NotFoundError, ConflictError } from "../../middleware/errorHandler.js";

const BASE_YEAR = new Date().getFullYear();

// ── Generate next MRN ─────────────────────────────────────────────────────────
async function nextMRN(db, tenantId) {
  const normalize = (t) => {
    if (!t) return "tenant-001";
    if (typeof t === "string") return t;
    if (typeof t === "object") return t.tenantId || t.tenant_id || t.id || "tenant-001";
    return String(t);
  };
  const tid = normalize(tenantId);
  const safeTid = String(tid).replace(/'/g, "''");
  const row = await db.prepare(`
    SELECT mrn FROM patients
    WHERE tenant_id='${safeTid}' AND mrn LIKE 'MRN-${BASE_YEAR}-%'
    ORDER BY mrn DESC LIMIT 1
  `).get();

  const seq = row ? parseInt(row.mrn.split("-")[2], 10) + 1 : 1;
  return `MRN-${BASE_YEAR}-${String(seq).padStart(5, "0")}`;
}

// ── List / search ─────────────────────────────────────────────────────────────
export async function getPatients({ page = 1, limit = 20, search, gender, insurance, status, hospitalId, tenantId } = {}) {
  const db     = getDb();
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const where  = ["p.deleted_at IS NULL"];
  const params = [];

  const tid = tenantId || "tenant-001";
  const hid = hospitalId || "hosp-001";

  where.push("p.tenant_id=?");   params.push(tid);
  where.push("p.hospital_id=?"); params.push(hid);
  if (gender)     { where.push("p.gender=?");        params.push(gender); }
  if (insurance)  { where.push("p.insurance_provider=?"); params.push(insurance); }
  if (status)     { where.push("p.status=?");        params.push(status); }

  if (search) {
    where.push(`(
      LOWER(p.first_name||' '||p.last_name) LIKE ? OR
      p.mrn LIKE ? OR
      p.national_id LIKE ? OR
      p.phone LIKE ?
    )`);
    const q = `%${search.toLowerCase()}%`;
    params.push(q, q, q, q);
  }

  const cond  = where.join(" AND ");
  const totalRow = await db.prepare(`SELECT COUNT(*) as n FROM patients p WHERE ${cond}`).get(...params);
  const total = totalRow?.n ?? 0;
  const rows  = await db.prepare(`
    SELECT p.*, u.first_name||' '||u.last_name as registered_by_name
    FROM patients p
    LEFT JOIN users u ON u.id = p.registered_by
    WHERE ${cond}
    ORDER BY p.last_name, p.first_name
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  return {
    data: rows.map(formatPatient),
    meta: { total, page: +page, limit: +limit, totalPages: Math.ceil(total / parseInt(limit)) },
  };
}

// ── Get one ───────────────────────────────────────────────────────────────────
export async function getPatientById(id) {
  const db = getDb();
  const p  = await db.prepare(`
    SELECT p.*, u.first_name||' '||u.last_name as registered_by_name
    FROM patients p
    LEFT JOIN users u ON u.id = p.registered_by
    WHERE p.id=? AND p.deleted_at IS NULL
  `).get(id);
  if (!p) throw new NotFoundError("Patient");
  return formatPatient(p);
}

export async function getPatientByMRN(mrn) {
  const db = getDb();
  const p  = await db.prepare(`SELECT * FROM patients WHERE mrn=? AND deleted_at IS NULL`).get(mrn);
  if (!p) throw new NotFoundError("Patient");
  return formatPatient(p);
}

export async function getPatientByNID(nid) {
  const db = getDb();
  const p  = await db.prepare(`SELECT * FROM patients WHERE national_id=? AND deleted_at IS NULL`).get(nid);
  if (!p) throw new NotFoundError("Patient");
  return formatPatient(p);
}

// ── Create ────────────────────────────────────────────────────────────────────
export async function createPatient(data, createdBy, tenantId, hospitalId) {
  const db = getDb();

  if (data.nationalId) {
    const dup = await db.prepare(`SELECT id FROM patients WHERE national_id=? AND deleted_at IS NULL`).get(data.nationalId);
    if (dup) throw new ConflictError(`A patient with National ID '${data.nationalId}' already exists`);
  }

  if (data.phone) {
    const dup = await db.prepare(`SELECT id FROM patients WHERE phone=? AND deleted_at IS NULL`).get(data.phone);
    if (dup) throw new ConflictError(`A patient with phone '${data.phone}' already exists`);
  }

  const id  = `p-${uuidv4().slice(0, 8)}`;
  const mrn = await nextMRN(db, tenantId);

  await db.prepare(`
    INSERT INTO patients (
      id,tenant_id,hospital_id,mrn,national_id,passport_number,
      first_name,last_name,middle_name,date_of_birth,approximate_dob,gender,
      blood_group,rh_factor,marital_status,nationality,religion,occupation,education_level,
      phone,phone_secondary,email,address,gps_coordinates,emergency_contact,
      insurance_provider,insurance_number,insurance_expiry,insurance_type,
      allergies,chronic_conditions,current_medications,medical_history,family_history,social_history,
      organ_donor,status,registered_by,created_by,updated_by
    ) VALUES (
      ?,?,?,?,?,?,
      ?,?,?,?,?,?,
      ?,?,?,?,?,?,?,
      ?,?,?,?,?,?,
      ?,?,?,?,
      ?,?,?,?,?,?,
      ?,?,?,?,?
    )
  `).run(
    id, tenantId, hospitalId, mrn,
    data.nationalId || null, data.passportNumber || null,
    data.firstName, data.lastName, data.middleName || null,
    data.dateOfBirth, data.approximateDob ? 1 : 0,
    data.gender,
    data.bloodGroup || null, data.rhFactor || null,
    data.maritalStatus || null, data.nationality || "Rwandan",
    data.religion || null, data.occupation || null, data.educationLevel || null,
    data.phone, data.phoneSecondary || null, data.email || null,
    data.address ? JSON.stringify(data.address) : null,
    data.gpsCoordinates ? JSON.stringify(data.gpsCoordinates) : null,
    data.emergencyContact ? JSON.stringify(data.emergencyContact) : null,
    data.insuranceProvider || null, data.insuranceNumber || null,
    data.insuranceExpiry || null, data.insuranceType || null,
    data.allergies ? JSON.stringify(data.allergies) : null,
    data.chronicConditions ? JSON.stringify(data.chronicConditions) : null,
    data.currentMedications ? JSON.stringify(data.currentMedications) : null,
    data.medicalHistory || null, data.familyHistory || null,
    data.socialHistory ? JSON.stringify(data.socialHistory) : null,
    data.organDonor ? 1 : 0, "active",
    createdBy, createdBy, createdBy
  );

  return getPatientById(id);
}

// ── Update ────────────────────────────────────────────────────────────────────
export async function updatePatient(id, data, updatedBy) {
  const db = getDb();
  const existing = await db.prepare(`SELECT * FROM patients WHERE id=? AND deleted_at IS NULL`).get(id);
  if (!existing) throw new NotFoundError("Patient");

  const fields = [];
  const vals   = [];

  const map = {
    firstName:"first_name", lastName:"last_name", middleName:"middle_name",
    dateOfBirth:"date_of_birth", gender:"gender", bloodGroup:"blood_group",
    maritalStatus:"marital_status", nationality:"nationality", religion:"religion",
    occupation:"occupation", educationLevel:"education_level",
    phone:"phone", phoneSecondary:"phone_secondary", email:"email",
    insuranceProvider:"insurance_provider", insuranceNumber:"insurance_number",
    insuranceExpiry:"insurance_expiry", insuranceType:"insurance_type",
    medicalHistory:"medical_history", familyHistory:"family_history",
    organDonor:"organ_donor", status:"status",
  };
  const jsonMap = {
    address:"address", gpsCoordinates:"gps_coordinates",
    emergencyContact:"emergency_contact", allergies:"allergies",
    chronicConditions:"chronic_conditions", currentMedications:"current_medications",
    socialHistory:"social_history",
  };

  for (const [key, col] of Object.entries(map)) {
    if (data[key] !== undefined) { fields.push(`${col}=?`); vals.push(data[key]); }
  }
  for (const [key, col] of Object.entries(jsonMap)) {
    if (data[key] !== undefined) { fields.push(`${col}=?`); vals.push(JSON.stringify(data[key])); }
  }

  if (!fields.length) return getPatientById(id);

  fields.push("updated_by=?", "updated_at=CURRENT_TIMESTAMP");
  vals.push(updatedBy, id);
  await db.prepare(`UPDATE patients SET ${fields.join(",")} WHERE id=?`).run(...vals);
  return getPatientById(id);
}

// ── Soft delete ───────────────────────────────────────────────────────────────
export async function deletePatient(id, deletedBy) {
  const db = getDb();
  const p  = await db.prepare(`SELECT id FROM patients WHERE id=? AND deleted_at IS NULL`).get(id);
  if (!p) throw new NotFoundError("Patient");
  await db.prepare(`UPDATE patients SET deleted_at=CURRENT_TIMESTAMP, updated_by=?, status='deleted' WHERE id=?`).run(deletedBy, id);
}

// ── Format output ─────────────────────────────────────────────────────────────
function formatPatient(p) {
  const parse = (v) => { try { return v ? JSON.parse(v) : null; } catch { return v; } };
  return {
    id:               p.id,
    mrn:              p.mrn,
    nationalId:       p.national_id,
    passportNumber:   p.passport_number,
    firstName:        p.first_name,
    lastName:         p.last_name,
    middleName:       p.middle_name,
    fullName:         `${p.first_name} ${p.last_name}`,
    dateOfBirth:      p.date_of_birth,
    approximateDob:   Boolean(p.approximate_dob),
    gender:           p.gender,
    bloodGroup:       p.blood_group,
    rhFactor:         p.rh_factor,
    maritalStatus:    p.marital_status,
    nationality:      p.nationality,
    religion:         p.religion,
    occupation:       p.occupation,
    educationLevel:   p.education_level,
    phone:            p.phone,
    phoneSecondary:   p.phone_secondary,
    email:            p.email,
    address:          parse(p.address),
    gpsCoordinates:   parse(p.gps_coordinates),
    emergencyContact: parse(p.emergency_contact),
    insuranceProvider:p.insurance_provider,
    insuranceNumber:  p.insurance_number,
    insuranceExpiry:  p.insurance_expiry,
    insuranceType:    p.insurance_type,
    allergies:        parse(p.allergies) || [],
    chronicConditions:parse(p.chronic_conditions) || [],
    currentMedications:parse(p.current_medications) || [],
    medicalHistory:   p.medical_history,
    familyHistory:    p.family_history,
    socialHistory:    parse(p.social_history),
    organDonor:       Boolean(p.organ_donor),
    isDeceased:       Boolean(p.is_deceased),
    deceasedDate:     p.deceased_date,
    status:           p.status,
    registeredBy:     p.registered_by,
    registeredByName: p.registered_by_name,
    tenantId:         p.tenant_id,
    hospitalId:       p.hospital_id,
    createdAt:        p.created_at,
    updatedAt:        p.updated_at,
  };
}
