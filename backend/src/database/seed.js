/**
 * Seed script — inserts default tenant, hospital, departments, roles, permissions,
 * and demo users with hashed passwords into the database.
 * Safe to run multiple times with PostgreSQL conflict handling.
 */

import "dotenv/config";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "./connection.js";
import { runMigrations } from "./migrate.js";

const ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "12", 10);

// ─── Seed data ────────────────────────────────────────────────────────────────
const TENANT_ID    = "tenant-001";
const HOSPITAL_ID  = "hosp-001";

const DEPARTMENTS = [
  { id: "dept-001", code: "EXEC",  name: "Executive Office",        type: "admin" },
  { id: "dept-002", code: "IM",    name: "Internal Medicine",        type: "clinical" },
  { id: "dept-003", code: "EMRG",  name: "Emergency",               type: "clinical" },
  { id: "dept-004", code: "PEDS",  name: "Pediatrics",              type: "clinical" },
  { id: "dept-005", code: "SURG",  name: "Surgery",                 type: "clinical" },
  { id: "dept-006", code: "MATR",  name: "Maternity",               type: "clinical" },
  { id: "dept-007", code: "PHARM", name: "Pharmacy",                type: "clinical" },
  { id: "dept-008", code: "LAB",   name: "Laboratory",              type: "clinical" },
  { id: "dept-009", code: "RADIOL",name: "Radiology",               type: "clinical" },
  { id: "dept-010", code: "ICU",   name: "Intensive Care Unit",     type: "clinical" },
  { id: "dept-011", code: "FIN",   name: "Finance",                 type: "admin" },
  { id: "dept-012", code: "HR",    name: "Human Resources",         type: "admin" },
  { id: "dept-013", code: "IT",    name: "IT & Platform",           type: "support" },
  { id: "dept-014", code: "FRONT", name: "Front Desk / Reception",  type: "admin" },
  { id: "dept-015", code: "STORE", name: "Stores",                  type: "support" },
  { id: "dept-016", code: "QUAL",  name: "Quality",                 type: "support" },
];

const ROLES = [
  { id: "role-01", name: "system-admin",     label: "System Admin",           is_system: 1, modules: ["overview","admin","patients","appointments","queue","consultations","nursing","pharmacy","laboratory","radiology","inpatient","billing","insurance","inventory","procurement","hr","ambulance","blood-bank","mortuary","assets","telemedicine","notifications","reports","surveillance","interoperability","quality","ai","multi-tenant","audit","settings"] },
  { id: "role-02", name: "hospital-manager", label: "Hospital Manager",       is_system: 1, modules: ["overview","queue","inpatient","billing","insurance","inventory","procurement","hr","ambulance","blood-bank","mortuary","assets","notifications","reports","surveillance","quality","audit","settings"] },
  { id: "role-03", name: "medical-director", label: "Medical Director",       is_system: 1, modules: ["overview","patients","consultations","nursing","laboratory","radiology","inpatient","reports","surveillance","quality","ai","audit"] },
  { id: "role-04", name: "doctor",           label: "Doctor",                 is_system: 1, modules: ["overview","patients","appointments","queue","consultations","laboratory","radiology","pharmacy","telemedicine","reports"] },
  { id: "role-05", name: "nurse",            label: "Nurse",                  is_system: 1, modules: ["overview","patients","appointments","queue","nursing","inpatient","blood-bank","reports"] },
  { id: "role-06", name: "pharmacist",       label: "Pharmacist",             is_system: 1, modules: ["overview","pharmacy","billing","reports","audit"] },
  { id: "role-07", name: "laboratory",       label: "Laboratory Scientist",   is_system: 1, modules: ["overview","laboratory","patients","reports","audit"] },
  { id: "role-08", name: "radiology",        label: "Radiology Staff",        is_system: 1, modules: ["overview","radiology","patients","reports"] },
  { id: "role-09", name: "receptionist",     label: "Receptionist",           is_system: 1, modules: ["overview","patients","appointments","queue","billing"] },
  { id: "role-10", name: "accountant",       label: "Accountant",             is_system: 1, modules: ["overview","billing","insurance","reports","audit"] },
  { id: "role-11", name: "cashier",          label: "Cashier",                is_system: 1, modules: ["overview","billing","notifications"] },
  { id: "role-12", name: "insurance-officer",label: "Insurance Officer",      is_system: 1, modules: ["overview","insurance","billing","reports","audit"] },
  { id: "role-13", name: "store-manager",    label: "Store Manager",          is_system: 1, modules: ["overview","inventory","procurement","assets","reports","audit"] },
  { id: "role-14", name: "hr-manager",       label: "HR Manager",             is_system: 1, modules: ["overview","hr","notifications","reports","audit","settings"] },
  { id: "role-15", name: "records-officer",  label: "Medical Records Officer",is_system: 1, modules: ["overview","patients","consultations","reports","audit"] },
  { id: "role-16", name: "quality-officer",  label: "Quality Officer",        is_system: 1, modules: ["overview","quality","surveillance","reports","audit","notifications"] },
  { id: "role-17", name: "data-officer",     label: "Data Officer",           is_system: 1, modules: ["overview","reports","surveillance","interoperability","quality"] },
  { id: "role-18", name: "ambulance-driver", label: "Ambulance Driver",       is_system: 1, modules: ["overview","ambulance","notifications"] },
  { id: "role-19", name: "patient",          label: "Patient",                is_system: 1, modules: ["patient-portal","appointments","telemedicine","billing"] },
];

// Demo users: { role_name, first_name, last_name, email, password, department_code, job_title }
const DEMO_USERS_INPUT = [
  { role: "system-admin",     first: "Aline",      last: "Uwase",       email: "admin@artic.health",    password: "admin123",    dept: "IT",    title: "System Administrator" },
  { role: "hospital-manager", first: "Jean",       last: "Habimana",    email: "manager@artic.health",  password: "manager123",  dept: "EXEC",  title: "Hospital Manager" },
  { role: "medical-director", first: "Yves",       last: "Rukundo",     email: "director@artic.health", password: "director123", dept: "EXEC",  title: "Medical Director" },
  { role: "doctor",           first: "Grace",      last: "Mukamana",    email: "doctor@artic.health",   password: "doctor123",   dept: "IM",    title: "Specialist — Internal Medicine" },
  { role: "nurse",            first: "Eric",       last: "Niyonsenga",  email: "nurse@artic.health",    password: "nurse123",    dept: "EMRG",  title: "Senior Nurse" },
  { role: "pharmacist",       first: "Diane",      last: "Ingabire",    email: "pharmacy@artic.health", password: "pharmacy123", dept: "PHARM", title: "Senior Pharmacist" },
  { role: "laboratory",       first: "Patrick",    last: "Mugabo",      email: "lab@artic.health",      password: "lab123",      dept: "LAB",   title: "Laboratory Scientist" },
  { role: "radiology",        first: "Chantal",    last: "Uwimana",     email: "radiology@artic.health",password: "radio123",    dept: "RADIOL",title: "Radiographer" },
  { role: "receptionist",     first: "Olive",      last: "Mukazana",    email: "reception@artic.health",password: "front123",    dept: "FRONT", title: "Reception Lead" },
  { role: "accountant",       first: "Emmanuel",   last: "Nzeyimana",   email: "accounts@artic.health", password: "money123",    dept: "FIN",   title: "Accountant" },
  { role: "cashier",          first: "Bella",      last: "Ingabire",    email: "cashier@artic.health",  password: "cashier123",  dept: "FIN",   title: "Cashier" },
  { role: "insurance-officer",first: "Nadia",      last: "Kamana",      email: "insurance@artic.health",password: "claim123",    dept: "FIN",   title: "Insurance Officer" },
  { role: "store-manager",    first: "Bosco",      last: "Tuyishime",   email: "store@artic.health",    password: "store123",    dept: "STORE", title: "Store Manager" },
  { role: "hr-manager",       first: "Sandrine",   last: "Uwera",       email: "hr@artic.health",       password: "hr123",       dept: "HR",    title: "HR Manager" },
  { role: "quality-officer",  first: "Alice",      last: "Nizeyimana",  email: "quality@artic.health",  password: "quality123",  dept: "QUAL",  title: "Quality Officer" },
  { role: "data-officer",     first: "Kevin",      last: "Iradukunda",  email: "data@artic.health",     password: "data123",     dept: "IT",    title: "HMIS Data Officer" },
  { role: "ambulance-driver", first: "Theoneste",  last: "Habimana",    email: "ambulance@artic.health",password: "drive123",    dept: "EMRG",  title: "Ambulance Driver" },
  { role: "patient",          first: "Claudine",   last: "Mutesi",      email: "patient@artic.health",  password: "patient123",  dept: "FRONT", title: "Patient" },
];

export async function seed() {
  const db = getDb();

  console.log("🌱  Seeding database…");

  // ── Tenant ──────────────────────────────────────────────────────────────────
  await db.prepare(`INSERT INTO tenants (id,code,name,type,country,timezone,currency,is_active) VALUES (?,?,?,?,?,?,?,1) ON CONFLICT (id) DO NOTHING`).run(
    TENANT_ID, "ARTIC-RW", "ARTIC Health Rwanda", "network", "Rwanda", "Africa/Kigali", "RWF"
  );

  // ── Hospital ────────────────────────────────────────────────────────────────
  await db.prepare(`INSERT INTO hospitals (id,tenant_id,code,name,type,moh_code,email,phone,is_active) VALUES (?,?,?,?,?,?,?,?,1) ON CONFLICT (id) DO NOTHING`).run(
    HOSPITAL_ID, TENANT_ID, "KDH-001", "Kigali District Hospital", "district", "KDH-001", "admin@kdh.gov.rw", "+250 788 000 001"
  );

  // ── Departments ─────────────────────────────────────────────────────────────
  const insertDept = db.prepare(`INSERT INTO departments (id,hospital_id,tenant_id,code,name,type,is_active) VALUES (?,?,?,?,?,?,1) ON CONFLICT (id) DO NOTHING`);
  for (const d of DEPARTMENTS) {
    await insertDept.run(d.id, HOSPITAL_ID, TENANT_ID, d.code, d.name, d.type);
  }

  // ── Roles ───────────────────────────────────────────────────────────────────
  const insertRole    = db.prepare(`INSERT INTO roles (id,tenant_id,name,label,is_system,is_active) VALUES (?,?,?,?,?,1) ON CONFLICT (id) DO NOTHING`);
  const insertModule  = db.prepare(`INSERT INTO role_modules (role_id,module_key) VALUES (?,?) ON CONFLICT (role_id, module_key) DO NOTHING`);
  for (const r of ROLES) {
    await insertRole.run(r.id, TENANT_ID, r.name, r.label, r.is_system);
    for (const m of r.modules) {
      await insertModule.run(r.id, m);
    }
  }

  // ── Users ───────────────────────────────────────────────────────────────────
  const insertUser = db.prepare(`
    INSERT INTO users
      (id,tenant_id,hospital_id,department_id,role_id,first_name,last_name,email,phone,password_hash,job_title,is_active)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,1)
    ON CONFLICT (id) DO NOTHING
  `);

  const roleByName = Object.fromEntries(ROLES.map(r => [r.name, r.id]));
  const deptByCode = Object.fromEntries(DEPARTMENTS.map(d => [d.code, d.id]));

  for (const u of DEMO_USERS_INPUT) {
    const hash = bcrypt.hashSync(u.password, ROUNDS);
    const uid  = `user-${u.email.split("@")[0]}`;
    await insertUser.run(uid, TENANT_ID, HOSPITAL_ID, deptByCode[u.dept], roleByName[u.role], u.first, u.last, u.email, null, hash, u.title);
  }

  // ── Demo patients ───────────────────────────────────────────────────────────
  const demoPatients = [
    { id:"p-001", mrn:"MRN-2026-0001", first:"Claudine",  last:"Mutesi",    nid:"1199880000000001", dob:"1992-03-15", gender:"Female", phone:"+250 788 100 001", insurance:"RSSB",    ins_no:"RSSB-00123456", blood:"O+",  allergies:JSON.stringify(["Penicillin"]), conditions:JSON.stringify(["Hypertension"]) },
    { id:"p-002", mrn:"MRN-2026-0002", first:"Samuel",    last:"Ndayisaba", nid:"1199770000000002", dob:"2018-07-22", gender:"Male",   phone:"+250 788 100 002", insurance:"Mutuelle",ins_no:"MUT-789012",    blood:"A+",  allergies:JSON.stringify([]),              conditions:JSON.stringify(["Asthma"]) },
    { id:"p-003", mrn:"MRN-2026-0003", first:"Esperance", last:"Kayitesi",  nid:"1199660000000003", dob:"1965-11-08", gender:"Female", phone:"+250 788 100 003", insurance:"Private", ins_no:"PRIV-334455",   blood:"B-",  allergies:JSON.stringify(["Sulfa"]),       conditions:JSON.stringify(["Diabetes","Hypertension"]) },
    { id:"p-004", mrn:"MRN-2026-0004", first:"Patrick",   last:"Mugenzi",   nid:"1199550000000004", dob:"1982-05-30", gender:"Male",   phone:"+250 788 100 004", insurance:"RSSB",    ins_no:"RSSB-00567890", blood:"AB+", allergies:JSON.stringify(["Latex"]),       conditions:JSON.stringify([]) },
    { id:"p-005", mrn:"MRN-2026-0005", first:"Vestine",   last:"Uwimana",   nid:"1200010000000005", dob:"1998-01-14", gender:"Female", phone:"+250 788 100 005", insurance:"Mutuelle",ins_no:"MUT-112233",    blood:"A-",  allergies:JSON.stringify([]),              conditions:JSON.stringify([]) },
  ];

  const insertPatient = db.prepare(`
    INSERT INTO patients
      (id,tenant_id,hospital_id,mrn,national_id,first_name,last_name,date_of_birth,gender,phone,
       insurance_provider,insurance_number,blood_group,allergies,chronic_conditions,status,registered_by)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'active','user-admin')
    ON CONFLICT (id) DO NOTHING
  `);
  for (const p of demoPatients) {
    await insertPatient.run(p.id, TENANT_ID, HOSPITAL_ID, p.mrn, p.nid, p.first, p.last, p.dob, p.gender, p.phone, p.insurance, p.ins_no, p.blood, p.allergies, p.conditions);
  }

  console.log("✅  Seed complete — demo users and patients inserted");
  console.log("\n📋  Demo accounts:");
  for (const u of DEMO_USERS_INPUT) {
    console.log(`   ${u.email.padEnd(32)} password: ${u.password}`);
  }

  // ── Demo appointments ───────────────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);
  const demoAppts = [
    { id:"appt-001", patient_id:"p-001", doctor_id:"user-doctor", department_id:"dept-002", appointment_date:today, start_time:"08:30", type:"follow-up",    priority:"routine",   status:"checked-in",  queue_number:"IM-014",  chief_complaint:"Hypertension review",    walk_in:0 },
    { id:"appt-002", patient_id:"p-004", doctor_id:"user-doctor", department_id:"dept-003", appointment_date:today, start_time:"08:00", type:"emergency",    priority:"emergency", status:"in-progress", queue_number:"ER-001",  chief_complaint:"Trauma, shortness of breath", walk_in:1 },
    { id:"appt-003", patient_id:"p-002", doctor_id:"user-doctor", department_id:"dept-004", appointment_date:today, start_time:"09:10", type:"consultation", priority:"urgent",    status:"checked-in",  queue_number:"PD-006",  chief_complaint:"Fever and cough",       walk_in:0 },
    { id:"appt-004", patient_id:"p-003", doctor_id:"user-director",department_id:"dept-002",appointment_date:today, start_time:"10:00", type:"follow-up",    priority:"urgent",    status:"in-progress", queue_number:"WARD",    chief_complaint:"Diabetes management",   walk_in:0 },
    { id:"appt-005", patient_id:"p-005", doctor_id:"user-doctor", department_id:"dept-006", appointment_date:today, start_time:"11:00", type:"consultation", priority:"routine",   status:"scheduled",   queue_number:"MAT-003", chief_complaint:"Antenatal care visit",  walk_in:0 },
  ];
  const insAppt = db.prepare(`INSERT INTO appointments (id,tenant_id,hospital_id,patient_id,doctor_id,department_id,appointment_date,start_time,type,priority,status,queue_number,chief_complaint,walk_in,created_by,updated_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING`);
  for (const a of demoAppts) {
    await insAppt.run(a.id,TENANT_ID,HOSPITAL_ID,a.patient_id,a.doctor_id,a.department_id,a.appointment_date,a.start_time,a.type,a.priority,a.status,a.queue_number,a.chief_complaint,a.walk_in,"user-admin","user-admin");
  }

  // ── Demo lab requests ───────────────────────────────────────────────────────
  const demoLabs = [
    { id:"lab-001", patient_id:"p-004", appointment_id:"appt-002", ordered_by:"user-doctor", test_name:"Full Blood Count",  test_panel:"Hematology",   sample_type:"EDTA Blood",        barcode:"SP-9901", urgency:"stat",    status:"completed",  result_value:"7.2",  result_unit:"g/dL",  reference_range:"12–16 g/dL", result_flag:"Critical", result_at:today },
    { id:"lab-002", patient_id:"p-003", appointment_id:"appt-004", ordered_by:"user-director",test_name:"HbA1c",            test_panel:"Biochemistry", sample_type:"EDTA Blood",        barcode:"SP-9902", urgency:"routine", status:"completed",  result_value:"9.1",  result_unit:"%",     reference_range:"< 7%",       result_flag:"High",     result_at:today },
    { id:"lab-003", patient_id:"p-002", appointment_id:"appt-003", ordered_by:"user-doctor", test_name:"Malaria RDT",      test_panel:"Parasitology", sample_type:"Finger-prick Blood", barcode:"SP-9903", urgency:"urgent",  status:"in-progress",result_value:null,   result_unit:null,    reference_range:null,         result_flag:null,        result_at:null },
    { id:"lab-004", patient_id:"p-001", appointment_id:"appt-001", ordered_by:"user-doctor", test_name:"Renal Function",   test_panel:"Biochemistry", sample_type:"Serum",             barcode:"SP-9904", urgency:"routine", status:"ordered",    result_value:null,   result_unit:null,    reference_range:null,         result_flag:null,        result_at:null },
  ];
  const insLab = db.prepare(`INSERT INTO lab_requests (id,tenant_id,hospital_id,patient_id,appointment_id,ordered_by,test_name,test_panel,sample_type,barcode,urgency,status,result_value,result_unit,reference_range,result_flag,result_at,ordered_at,collected_at,technician_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'),datetime('now'),?) ON CONFLICT(id) DO NOTHING`);
  for (const l of demoLabs) {
    await insLab.run(l.id,TENANT_ID,HOSPITAL_ID,l.patient_id,l.appointment_id,l.ordered_by,l.test_name,l.test_panel,l.sample_type,l.barcode,l.urgency,l.status,l.result_value,l.result_unit,l.reference_range,l.result_flag,l.result_at,"user-lab");
  }

  // ── Demo drug catalogue & inventory ─────────────────────────────────────────
  const demoDrugs = [
    { id:"drug-001", generic_name:"Amoxicillin",               category:"Antibiotic",   controlled:0 },
    { id:"drug-002", generic_name:"Insulin Glargine",          category:"Diabetes",     controlled:0 },
    { id:"drug-003", generic_name:"Artemether-Lumefantrine",   category:"Antimalarial", controlled:0 },
    { id:"drug-004", generic_name:"Morphine Sulfate",          category:"Analgesic",    controlled:1 },
    { id:"drug-005", generic_name:"Metformin HCl",             category:"Diabetes",     controlled:0 },
    { id:"drug-006", generic_name:"Amlodipine",                category:"Cardiovascular",controlled:0 },
  ];
  const insDrug = db.prepare(`INSERT INTO drug_catalogue (id,tenant_id,generic_name,category,controlled,reorder_level) VALUES(?,?,?,?,?,50) ON CONFLICT(id) DO NOTHING`);
  for (const d of demoDrugs) await insDrug.run(d.id,TENANT_ID,d.generic_name,d.category,d.controlled);

  const demoDrugInv = [
    { id:"dinv-001", drug_id:"drug-001", batch:"AMX-2602", expiry:"2026-11-30", quantity:420, unit_cost:85,   selling_price:120,  location:"Pharmacy Store A" },
    { id:"dinv-002", drug_id:"drug-002", batch:"INS-2604", expiry:"2026-09-12", quantity:36,  unit_cost:4200, selling_price:5500, location:"2-8°C Refrigerator" },
    { id:"dinv-003", drug_id:"drug-003", batch:"ACT-2603", expiry:"2027-03-01", quantity:245, unit_cost:1800, selling_price:2500, location:"Pharmacy Store A" },
    { id:"dinv-004", drug_id:"drug-004", batch:"MOR-2601", expiry:"2026-08-15", quantity:18,  unit_cost:3500, selling_price:5000, location:"Controlled Cabinet" },
    { id:"dinv-005", drug_id:"drug-005", batch:"MET-2602", expiry:"2027-05-20", quantity:680, unit_cost:55,   selling_price:80,   location:"Pharmacy Store B" },
    { id:"dinv-006", drug_id:"drug-006", batch:"AML-2603", expiry:"2027-02-10", quantity:320, unit_cost:95,   selling_price:140,  location:"Pharmacy Store A" },
  ];
  const insDInv = db.prepare(`INSERT INTO drug_inventory (id,tenant_id,hospital_id,drug_id,batch_number,expiry_date,quantity,unit_cost,selling_price,location,received_by) VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING`);
  for (const i of demoDrugInv) await insDInv.run(i.id,TENANT_ID,HOSPITAL_ID,i.drug_id,i.batch,i.expiry,i.quantity,i.unit_cost,i.selling_price,i.location,"user-admin");

  // ── Demo prescriptions ───────────────────────────────────────────────────────
  const demoRx = [
    { id:"rx-001", patient_id:"p-001", appointment_id:"appt-001", doctor_id:"user-doctor", status:"active",
      items: JSON.stringify([{drug:"Amlodipine",genericName:"Amlodipine",dosage:"5mg",route:"Oral",frequency:"OD",duration:"30 days",quantity:30,instructions:"Take once daily with water"},{drug:"Hydrochlorothiazide",genericName:"Hydrochlorothiazide",dosage:"25mg",route:"Oral",frequency:"OD",duration:"30 days",quantity:30,instructions:"Take in the morning"}]) },
    { id:"rx-002", patient_id:"p-003", appointment_id:"appt-004", doctor_id:"user-director", status:"dispensed",
      items: JSON.stringify([{drug:"Metformin",genericName:"Metformin HCl",dosage:"500mg",route:"Oral",frequency:"BID",duration:"30 days",quantity:60,instructions:"Take with food"},{drug:"Glibenclamide",genericName:"Glibenclamide",dosage:"5mg",route:"Oral",frequency:"OD",duration:"30 days",quantity:30,instructions:"Take before breakfast"}]) },
  ];
  const insRx = db.prepare(`INSERT INTO prescriptions (id,tenant_id,hospital_id,patient_id,appointment_id,doctor_id,status,items) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING`);
  for (const r of demoRx) await insRx.run(r.id,TENANT_ID,HOSPITAL_ID,r.patient_id,r.appointment_id,r.doctor_id,r.status,r.items);

  // ── Demo invoices ────────────────────────────────────────────────────────────
  const demoInvoices = [
    { id:"inv-001", invoice_number:"INV-2026-1101", patient_id:"p-001", appointment_id:"appt-001", payer:"RSSB",    subtotal:26200, insurance_cover:13100, patient_copay:13100, total:26200, paid:13100, balance:13100, status:"partially-paid" },
    { id:"inv-002", invoice_number:"INV-2026-1102", patient_id:"p-002", appointment_id:"appt-003", payer:"Mutuelle",subtotal:8950,  insurance_cover:7607,  patient_copay:1343,  total:8950,  paid:0,     balance:1343,  status:"unpaid" },
    { id:"inv-003", invoice_number:"INV-2026-1103", patient_id:"p-003", appointment_id:"appt-004", payer:"Private", subtotal:186500,insurance_cover:0,     patient_copay:186500,total:186500,paid:186500,balance:0,     status:"paid" },
  ];
  const insInv = db.prepare(`INSERT INTO invoices (id,invoice_number,tenant_id,hospital_id,patient_id,appointment_id,payer,subtotal,insurance_cover,patient_copay,total,paid,balance,status,created_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING`);
  for (const i of demoInvoices) await insInv.run(i.id,i.invoice_number,TENANT_ID,HOSPITAL_ID,i.patient_id,i.appointment_id,i.payer,i.subtotal,i.insurance_cover,i.patient_copay,i.total,i.paid,i.balance,i.status,"user-admin");

  // Invoice items for INV-2026-1101
  const insII = db.prepare(`INSERT INTO invoice_items (id,invoice_id,service_name,category,quantity,unit_price,total,insurance_cover,patient_copay) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING`);
  await insII.run("ii-001","inv-001","Specialist Consultation","Consultation",1,12000,12000,6000,6000);
  await insII.run("ii-002","inv-001","Renal Function Panel","Laboratory",1,8200,8200,4100,4100);
  await insII.run("ii-003","inv-001","Amlodipine 5mg x 30","Pharmacy",30,80,2400,1200,1200);
  await insII.run("ii-004","inv-001","BP Monitoring","Nursing",1,3600,3600,1800,1800);

  // ── Demo notifications ───────────────────────────────────────────────────────
  const demoNotifs = [
    { id:"notif-001", user_id:"user-doctor",  patient_id:"p-004", type:"danger",  title:"Critical Lab Result",      message:"Patrick Mugenzi — Hemoglobin 7.2 g/dL. Immediate clinical review required.", channel:"in-app" },
    { id:"notif-002", user_id:"user-store",   patient_id:null,    type:"warning", title:"Low Stock Alert",           message:"Insulin Glargine stock at 36 units — below reorder level of 50.", channel:"in-app" },
    { id:"notif-003", user_id:"user-accounts",patient_id:"p-003", type:"success", title:"Insurance Claim Approved",  message:"Claim INV-2026-1103 approved. RWF 186,500 to be reimbursed.", channel:"in-app" },
    { id:"notif-004", user_id:"user-admin",   patient_id:null,    type:"info",    title:"System Backup Complete",    message:"Automated nightly backup completed successfully.", channel:"in-app" },
  ];
  const insN = db.prepare(`INSERT INTO notifications (id,tenant_id,user_id,patient_id,type,title,message,channel,status) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING`);
  for (const n of demoNotifs) await insN.run(n.id,TENANT_ID,n.user_id,n.patient_id,n.type,n.title,n.message,n.channel,"delivered");

  console.log("✅  Clinical demo data seeded — appointments, labs, prescriptions, invoices, notifications");
}

// Allow running directly: node src/database/seed.js
if (process.argv[1]?.includes("seed.js")) {
  await runMigrations();
  await seed();
}
