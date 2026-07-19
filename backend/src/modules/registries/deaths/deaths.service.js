/**
 * Death Registration Service — Rwanda Civil Registration
 */
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../../../database/connection.js";
import { NotFoundError } from "../../../middleware/errorHandler.js";

const H = "hosp-001";

export async function registerDeath(data, createdBy, hospitalId) {
  const db = getDb();
  const id = `death-${uuidv4().slice(0, 8)}`;
  const certNumber = `DCERT-${new Date().getFullYear()}-${uuidv4().slice(0, 6).toUpperCase()}`;

  await db.prepare(`
    INSERT INTO death_registrations
      (id,hospital_id,patient_id,name,national_id,date_of_birth,date_of_death,time_of_death,
       cause_of_death,cause_icd_code,manner_of_death,certifying_doctor,storage_unit,
       status,notes,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)
  `).run(id, hospitalId||H,
    data.patientId||null, data.name, data.nationalId||null,
    data.dateOfBirth||null,
    data.dateOfDeath||new Date().toISOString().slice(0,10),
    data.timeOfDeath||null,
    data.causeOfDeath||null, data.causeIcdCode||null,
    data.mannerOfDeath||"natural",
    data.certifyingDoctorId||createdBy,
    data.storageUnit||null,
    "in_storage", data.notes||null);

  // Insert death certificate
  await db.prepare(`
    INSERT INTO death_certificates
      (id,mortuary_id,certificate_number,primary_cause,contributing_cause,icd_code,doctor_id)
    VALUES (?,?,?,?,?,?,?)
  `).run(`dc-${uuidv4().slice(0,8)}`, id, certNumber,
    data.causeOfDeath||"Unknown", data.contributingCause||null,
    data.causeIcdCode||null, data.certifyingDoctorId||createdBy);

  // Mark patient as deceased
  if (data.patientId) {
    await db.prepare(`UPDATE patients SET is_deceased=1, deceased_date=?, status='deceased', updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .run(data.dateOfDeath, data.patientId);
  }

  return getDeathById(id);
}

export async function getDeathById(id) {
  const db = getDb();
  const r = await db.prepare(`
    SELECT dr.*, p.mrn, u.first_name||' '||u.last_name as doctor_name,
           dc.certificate_number
    FROM death_registrations dr
    LEFT JOIN patients p ON p.id=dr.patient_id
    LEFT JOIN users    u ON u.id=dr.certifying_doctor
    LEFT JOIN death_certificates dc ON dc.mortuary_id=dr.id
    WHERE dr.id=?
  `).get(id);
  if (!r) throw new NotFoundError("Death registration");
  return r;
}

export async function getDeathsList({ hospitalId, date } = {}) {
  const db = getDb();
  const where = ["dr.hospital_id=?"]; const params = [hospitalId||H];
  if (date) { where.push("dr.date_of_death=?"); params.push(date); }
  return db.prepare(`
    SELECT dr.*, dc.certificate_number
    FROM death_registrations dr
    LEFT JOIN death_certificates dc ON dc.mortuary_id=dr.id
    WHERE ${where.join(" AND ")} ORDER BY dr.date_of_death DESC
  `).all(...params);
}

export async function getMortalityStats(hospitalId, month) {
  const db = getDb(); const m = month || new Date().toISOString().slice(0, 7);
  const rows = await db.prepare(`
    SELECT manner_of_death, COUNT(*) as count
    FROM death_registrations WHERE hospital_id=? AND strftime('%Y-%m',date_of_death)=?
    GROUP BY manner_of_death
  `).all(hospitalId||H, m);
  return { month: m, total: rows.reduce((a, r) => a + r.count, 0), byManner: rows };
}
