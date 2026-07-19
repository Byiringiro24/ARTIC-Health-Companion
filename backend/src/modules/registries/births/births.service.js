/**
 * Birth Registration Service — Rwanda Civil Registration
 */
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../../../database/connection.js";
import { NotFoundError } from "../../../middleware/errorHandler.js";

const H = "hosp-001", T = "tenant-001";

export async function registerBirth(data, createdBy, tenantId, hospitalId) {
  const db = getDb();
  const id = `birth-${uuidv4().slice(0, 8)}`;
  const certNumber = `CERT-${new Date().getFullYear()}-${uuidv4().slice(0, 6).toUpperCase()}`;

  // Auto-create newborn patient record
  let newbornId = null;
  if (data.motherPatientId) {
    newbornId = `p-${uuidv4().slice(0, 8)}`;
    const year = new Date().getFullYear();
    const lastMrn = await db.prepare(`SELECT mrn FROM patients WHERE tenant_id=? AND mrn LIKE 'MRN-${year}-%' ORDER BY mrn DESC LIMIT 1`).get(tenantId||T);
    const seq = lastMrn ? parseInt(lastMrn.mrn.split("-")[2], 10) + 1 : 1;
    const mrn = `MRN-${year}-${String(seq).padStart(5, "0")}`;
    const dob = data.birthDate || new Date().toISOString().slice(0, 10);
    await db.prepare(`
      INSERT INTO patients (id,tenant_id,hospital_id,mrn,first_name,last_name,date_of_birth,gender,phone,status,registered_by,created_by,updated_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(newbornId, tenantId||T, hospitalId||H, mrn,
      data.newbornFirstName||"Newborn", data.newbornLastName||"",
      dob, data.sex||"Unknown", "N/A", "active",
      createdBy, createdBy, createdBy);
  }

  await db.prepare(`
    INSERT INTO birth_registrations
      (id,hospital_id,mother_patient_id,newborn_patient_id,birth_date,birth_time,
       delivery_mode,gestational_weeks,birth_weight_grams,birth_length_cm,
       apgar_1min,apgar_5min,birth_outcome,sex,multiple_birth,birth_order,
       complications,attendant_id,certificate_number,created_by)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(id, hospitalId||H,
    data.motherPatientId||null, newbornId,
    data.birthDate||new Date().toISOString().slice(0,10),
    data.birthTime||null,
    data.deliveryMode||"normal",
    data.gestationalWeeks||null,
    data.birthWeightGrams||null, data.birthLengthCm||null,
    data.apgar1min||null, data.apgar5min||null,
    data.birthOutcome||"live_birth",
    data.sex||"Unknown",
    data.multipleBirth?1:0, data.birthOrder||1,
    data.complications||null,
    data.attendantId||createdBy,
    certNumber, createdBy);

  return getBirthById(id);
}

export async function getBirthById(id) {
  const db = getDb();
  const r = await db.prepare(`
    SELECT br.*, m.first_name||' '||m.last_name as mother_name, m.mrn as mother_mrn,
           n.mrn as newborn_mrn, n.first_name||' '||n.last_name as newborn_name,
           u.first_name||' '||u.last_name as attendant_name
    FROM birth_registrations br
    LEFT JOIN patients m ON m.id=br.mother_patient_id
    LEFT JOIN patients n ON n.id=br.newborn_patient_id
    LEFT JOIN users    u ON u.id=br.attendant_id
    WHERE br.id=?
  `).get(id);
  if (!r) throw new NotFoundError("Birth registration");
  return r;
}

export async function getBirthsList({ hospitalId, date, outcome } = {}) {
  const db = getDb();
  const where = ["br.hospital_id=?"]; const params = [hospitalId||H];
  if (date)    { where.push("br.birth_date=?");       params.push(date); }
  if (outcome) { where.push("br.birth_outcome=?");    params.push(outcome); }
  const rows = await db.prepare(`
    SELECT br.*, m.first_name||' '||m.last_name as mother_name
    FROM birth_registrations br
    LEFT JOIN patients m ON m.id=br.mother_patient_id
    WHERE ${where.join(" AND ")} ORDER BY br.birth_date DESC, br.birth_time DESC
  `).all(...params);
  return rows;
}

export async function getBirthStats(hospitalId, month) {
  const db = getDb();
  const m = month || new Date().toISOString().slice(0, 7);
  const rows = await db.prepare(`
    SELECT birth_outcome, delivery_mode, COUNT(*) as count,
           AVG(birth_weight_grams) as avg_weight_grams
    FROM birth_registrations
    WHERE hospital_id=? AND strftime('%Y-%m', birth_date)=?
    GROUP BY birth_outcome, delivery_mode
  `).all(hospitalId||H, m);
  return { month: m, stats: rows };
}
