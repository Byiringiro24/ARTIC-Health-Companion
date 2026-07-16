/**
 * Seed script — inserts default tenant, hospital, departments, roles, permissions,
 * and demo users with hashed passwords into the database.
 * Safe to run multiple times (uses INSERT OR IGNORE).
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
  db.prepare(`INSERT OR IGNORE INTO tenants (id,code,name,type,country,timezone,currency,is_active) VALUES (?,?,?,?,?,?,?,1)`).run(
    TENANT_ID, "ARTIC-RW", "ARTIC Health Rwanda", "network", "Rwanda", "Africa/Kigali", "RWF"
  );

  // ── Hospital ────────────────────────────────────────────────────────────────
  db.prepare(`INSERT OR IGNORE INTO hospitals (id,tenant_id,code,name,type,moh_code,email,phone,is_active) VALUES (?,?,?,?,?,?,?,?,1)`).run(
    HOSPITAL_ID, TENANT_ID, "KDH-001", "Kigali District Hospital", "district", "KDH-001", "admin@kdh.gov.rw", "+250 788 000 001"
  );

  // ── Departments ─────────────────────────────────────────────────────────────
  const insertDept = db.prepare(`INSERT OR IGNORE INTO departments (id,hospital_id,tenant_id,code,name,type,is_active) VALUES (?,?,?,?,?,?,1)`);
  for (const d of DEPARTMENTS) {
    insertDept.run(d.id, HOSPITAL_ID, TENANT_ID, d.code, d.name, d.type);
  }

  // ── Roles ───────────────────────────────────────────────────────────────────
  const insertRole    = db.prepare(`INSERT OR IGNORE INTO roles (id,tenant_id,name,label,is_system,is_active) VALUES (?,?,?,?,?,1)`);
  const insertModule  = db.prepare(`INSERT OR IGNORE INTO role_modules (role_id,module_key) VALUES (?,?)`);
  for (const r of ROLES) {
    insertRole.run(r.id, TENANT_ID, r.name, r.label, r.is_system);
    for (const m of r.modules) {
      insertModule.run(r.id, m);
    }
  }

  // ── Users ───────────────────────────────────────────────────────────────────
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users
      (id,tenant_id,hospital_id,department_id,role_id,first_name,last_name,email,phone,password_hash,job_title,is_active)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,1)
  `);

  const roleByName = Object.fromEntries(ROLES.map(r => [r.name, r.id]));
  const deptByCode = Object.fromEntries(DEPARTMENTS.map(d => [d.code, d.id]));

  for (const u of DEMO_USERS_INPUT) {
    const hash = bcrypt.hashSync(u.password, ROUNDS);
    const uid  = `user-${u.email.split("@")[0]}`;
    insertUser.run(uid, TENANT_ID, HOSPITAL_ID, deptByCode[u.dept], roleByName[u.role], u.first, u.last, u.email, null, hash, u.title);
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
    INSERT OR IGNORE INTO patients
      (id,tenant_id,hospital_id,mrn,national_id,first_name,last_name,date_of_birth,gender,phone,
       insurance_provider,insurance_number,blood_group,allergies,chronic_conditions,status,registered_by)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'active','user-admin')
  `);
  for (const p of demoPatients) {
    insertPatient.run(p.id, TENANT_ID, HOSPITAL_ID, p.mrn, p.nid, p.first, p.last, p.dob, p.gender, p.phone, p.insurance, p.ins_no, p.blood, p.allergies, p.conditions);
  }

  console.log("✅  Seed complete — demo users and patients inserted");
  console.log("\n📋  Demo accounts:");
  for (const u of DEMO_USERS_INPUT) {
    console.log(`   ${u.email.padEnd(32)} password: ${u.password}`);
  }
}

// Allow running directly: node src/database/seed.js
if (process.argv[1].includes("seed.js")) {
  runMigrations();
  await seed();
}
