/**
 * Vaccination Registry Service — Rwanda EPI Programme
 */
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../../../database/connection.js";
import { NotFoundError } from "../../../middleware/errorHandler.js";

const H = "hosp-001", T = "tenant-001";

// Rwanda EPI schedule (pre-seeded vaccine catalogue)
const RWANDA_EPI = [
  { id:"vac-001", name:"BCG",                      antigen:"BCG",                   doses:1, schedule:[0],            interval:0,   tempMin:2, tempMax:8 },
  { id:"vac-002", name:"Polio 0 (OPV)",             antigen:"Polio",                  doses:4, schedule:[0,6,10,14],    interval:28,  tempMin:-20,tempMax:8 },
  { id:"vac-003", name:"DTP-HepB-Hib",              antigen:"DTP-HepB-Hib",           doses:3, schedule:[6,10,14],      interval:28,  tempMin:2, tempMax:8 },
  { id:"vac-004", name:"PCV13 (Pneumococcal)",       antigen:"Pneumococcal",           doses:3, schedule:[6,10,14],      interval:28,  tempMin:2, tempMax:8 },
  { id:"vac-005", name:"Rotavirus",                  antigen:"Rotavirus",              doses:2, schedule:[6,10],         interval:28,  tempMin:2, tempMax:8 },
  { id:"vac-006", name:"Measles-Rubella (MR)",       antigen:"Measles-Rubella",        doses:2, schedule:[36,60],        interval:720, tempMin:-20,tempMax:8 },
  { id:"vac-007", name:"Yellow Fever",               antigen:"Yellow Fever",           doses:1, schedule:[36],           interval:0,   tempMin:-20,tempMax:8 },
  { id:"vac-008", name:"Malaria (RTS,S)",            antigen:"Malaria",                doses:4, schedule:[36,40,48,72],  interval:28,  tempMin:2, tempMax:8 },
  { id:"vac-009", name:"HPV (Human Papillomavirus)", antigen:"HPV",                    doses:2, schedule:[144,170],      interval:180, tempMin:2, tempMax:8 },
  { id:"vac-010", name:"Tetanus Toxoid (Pregnant)",  antigen:"Tetanus",                doses:5, schedule:[0,28,180,365,730],interval:28,tempMin:2, tempMax:8 },
  { id:"vac-011", name:"COVID-19 Vaccine",           antigen:"COVID-19",               doses:2, schedule:[0,28],         interval:28,  tempMin:2, tempMax:8 },
  { id:"vac-012", name:"Hepatitis B (Adult)",        antigen:"Hepatitis B",            doses:3, schedule:[0,28,168],     interval:28,  tempMin:2, tempMax:8 },
];

export async function seedVaccineCatalogue() {
  const db = getDb();
  const existing = await db.prepare(`SELECT COUNT(*) as n FROM vaccine_catalogue`).get();
  if (existing?.n > 0) return;
  const ins = db.prepare(`INSERT INTO vaccine_catalogue (id,name,antigen,doses_required,schedule_weeks,min_interval_days,storage_temp_min,storage_temp_max) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING`);
  for (const v of RWANDA_EPI) {
    await ins.run(v.id, v.name, v.antigen, v.doses, JSON.stringify(v.schedule), v.interval, v.tempMin, v.tempMax);
  }
}

export async function getVaccineCatalogue() {
  const db = getDb();
  const rows = await db.prepare(`SELECT * FROM vaccine_catalogue WHERE is_active=1 ORDER BY name`).all();
  return rows.map(r => ({ ...r, scheduleWeeks: safeJson(r.schedule_weeks) }));
}

export async function getPatientImmunizationHistory(patientId) {
  const db = getDb();
  const rows = await db.prepare(`
    SELECT ir.*, vc.name as vaccine_name, vc.antigen, vc.doses_required,
           u.first_name||' '||u.last_name as administered_by_name
    FROM immunization_records ir
    JOIN vaccine_catalogue vc ON vc.id=ir.vaccine_id
    LEFT JOIN users u ON u.id=ir.administered_by
    WHERE ir.patient_id=? ORDER BY ir.administered_at DESC
  `).all(patientId);
  return rows;
}

export async function administerVaccine(data, nurseId) {
  const db = getDb();
  const id = `imm-${uuidv4().slice(0, 8)}`;

  // Calculate next dose due date
  const vaccine = await db.prepare(`SELECT * FROM vaccine_catalogue WHERE id=?`).get(data.vaccineId);
  if (!vaccine) throw new NotFoundError("Vaccine");

  const schedule = safeJson(vaccine.schedule_weeks) || [];
  const currentDose = data.doseNumber || 1;
  let nextDueDate = null;
  if (currentDose < vaccine.doses_required) {
    const intervalDays = vaccine.min_interval_days || 28;
    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + intervalDays);
    nextDueDate = nextDue.toISOString().slice(0, 10);
  }

  await db.prepare(`
    INSERT INTO immunization_records
      (id,patient_id,hospital_id,vaccine_id,dose_number,batch_number,manufacturer,
       administered_at,administered_by,site,route,next_dose_due,aefi_noted,aefi_details)
    VALUES (?,?,?,?,?,?,?,CURRENT_TIMESTAMP,?,?,?,?,?,?)
  `).run(id, data.patientId, data.hospitalId||H, data.vaccineId, currentDose,
    data.batchNumber||null, data.manufacturer||null,
    nurseId, data.site||null, data.route||"IM",
    nextDueDate, data.aefiNoted?1:0, data.aefiDetails||null);

  return getImmunizationById(id);
}

export async function getImmunizationById(id) {
  const db = getDb();
  const r = await db.prepare(`
    SELECT ir.*, vc.name as vaccine_name, vc.antigen,
           u.first_name||' '||u.last_name as administered_by_name
    FROM immunization_records ir
    JOIN vaccine_catalogue vc ON vc.id=ir.vaccine_id
    LEFT JOIN users u ON u.id=ir.administered_by
    WHERE ir.id=?
  `).get(id);
  if (!r) throw new NotFoundError("Immunization record");
  return r;
}

export async function getDefaultersReport({ hospitalId, daysOverdue = 14 } = {}) {
  const db = getDb();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysOverdue);
  const rows = await db.prepare(`
    SELECT ir.patient_id, p.first_name||' '||p.last_name as patient_name,
           p.mrn, p.phone, vc.name as vaccine_name, ir.next_dose_due
    FROM immunization_records ir
    JOIN patients p ON p.id=ir.patient_id
    JOIN vaccine_catalogue vc ON vc.id=ir.vaccine_id
    WHERE ir.next_dose_due IS NOT NULL
      AND ir.next_dose_due < ? AND p.hospital_id=?
    ORDER BY ir.next_dose_due ASC
  `).all(cutoff.toISOString().slice(0,10), hospitalId||H);
  return rows;
}

export async function getDueTodayList({ hospitalId } = {}) {
  const db = getDb(); const today = new Date().toISOString().slice(0,10);
  return db.prepare(`
    SELECT ir.patient_id, p.first_name||' '||p.last_name as patient_name,
           p.mrn, p.date_of_birth, vc.name as vaccine_name, ir.next_dose_due, ir.dose_number
    FROM immunization_records ir
    JOIN patients p ON p.id=ir.patient_id
    JOIN vaccine_catalogue vc ON vc.id=ir.vaccine_id
    WHERE ir.next_dose_due<=? AND p.hospital_id=?
    ORDER BY ir.next_dose_due ASC
  `).all(today, hospitalId||H);
}

export async function getVaccineCoverageReport({ hospitalId, month } = {}) {
  const db = getDb();
  const m = month || new Date().toISOString().slice(0,7);
  const rows = await db.prepare(`
    SELECT vc.name as vaccine_name, vc.antigen, ir.dose_number,
           COUNT(*) as doses_given
    FROM immunization_records ir
    JOIN vaccine_catalogue vc ON vc.id=ir.vaccine_id
    WHERE ir.hospital_id=? AND strftime('%Y-%m',ir.administered_at)=?
    GROUP BY vc.name, ir.dose_number ORDER BY vc.name, ir.dose_number
  `).all(hospitalId||H, m);
  return { month: m, coverage: rows };
}

function safeJson(v) { try { return v ? JSON.parse(v) : null; } catch { return v; } }
