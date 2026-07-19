/**
 * ARTIC Health Companion — Complete Database Schema
 * PostgreSQL-compatible schema used by the production backend
 *
 * Design decisions:
 *  - Every table has id (UUID), created_at, updated_at, deleted_at (soft delete)
 *  - tenant_id on every clinical/operational table (multi-tenancy)
 *  - Audit columns: created_by, updated_by
 *  - All foreign keys enforced via PRAGMA foreign_keys = ON
 */

export const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 1 — FOUNDATION: Tenants, Hospitals, Departments
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tenants (
  id           TEXT PRIMARY KEY,
  code         TEXT UNIQUE NOT NULL,
  name         TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT 'hospital',  -- hospital | clinic | network
  country      TEXT NOT NULL DEFAULT 'Rwanda',
  timezone     TEXT NOT NULL DEFAULT 'Africa/Kigali',
  currency     TEXT NOT NULL DEFAULT 'RWF',
  is_active    INTEGER NOT NULL DEFAULT 1,
  settings     TEXT,                              -- JSON blob
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at   TEXT
);

CREATE TABLE IF NOT EXISTS hospitals (
  id                  TEXT PRIMARY KEY,
  tenant_id           TEXT NOT NULL REFERENCES tenants(id),
  code                TEXT UNIQUE NOT NULL,
  name                TEXT NOT NULL,
  type                TEXT NOT NULL DEFAULT 'district',  -- clinic|health_center|district|referral|teaching|private
  moh_code            TEXT,
  registration_number TEXT,
  address             TEXT,                             -- JSON
  phone               TEXT,
  email               TEXT,
  website             TEXT,
  logo_url            TEXT,
  operating_hours     TEXT,                             -- JSON
  is_active           INTEGER NOT NULL DEFAULT 1,
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at          TEXT
);

CREATE TABLE IF NOT EXISTS departments (
  id                    TEXT PRIMARY KEY,
  hospital_id           TEXT NOT NULL REFERENCES hospitals(id),
  tenant_id             TEXT NOT NULL REFERENCES tenants(id),
  code                  TEXT NOT NULL,
  name                  TEXT NOT NULL,
  type                  TEXT NOT NULL DEFAULT 'clinical',  -- clinical|admin|support
  parent_department_id  TEXT REFERENCES departments(id),
  head_user_id          TEXT,
  description           TEXT,
  location              TEXT,
  phone                 TEXT,
  email                 TEXT,
  is_active             INTEGER NOT NULL DEFAULT 1,
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at            TEXT,
  UNIQUE(hospital_id, code)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 3 — AUTHENTICATION: Roles, Permissions, Users, Sessions, Audit
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS roles (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT REFERENCES tenants(id),
  name          TEXT NOT NULL,
  label         TEXT NOT NULL,
  description   TEXT,
  is_system     INTEGER NOT NULL DEFAULT 0,
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at    TEXT,
  UNIQUE(tenant_id, name)
);

CREATE TABLE IF NOT EXISTS permissions (
  id          TEXT PRIMARY KEY,
  module      TEXT NOT NULL,
  action      TEXT NOT NULL,   -- create|read|update|delete|execute
  resource    TEXT NOT NULL,
  description TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(module, action, resource)
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at    TEXT NOT NULL DEFAULT (datetime('now')),
  granted_by    TEXT,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS role_modules (
  role_id    TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,
  PRIMARY KEY (role_id, module_key)
);

CREATE TABLE IF NOT EXISTS users (
  id                      TEXT PRIMARY KEY,
  tenant_id               TEXT REFERENCES tenants(id),
  hospital_id             TEXT REFERENCES hospitals(id),
  department_id           TEXT REFERENCES departments(id),
  role_id                 TEXT NOT NULL REFERENCES roles(id),
  employee_id             TEXT,
  first_name              TEXT NOT NULL,
  last_name               TEXT NOT NULL,
  email                   TEXT UNIQUE NOT NULL,
  phone                   TEXT,
  password_hash           TEXT NOT NULL,
  gender                  TEXT,
  date_of_birth           TEXT,
  profile_image_url       TEXT,
  job_title               TEXT,
  qualification           TEXT,
  professional_reg_number TEXT,
  patient_id              TEXT,                         -- linked patient record if role=patient
  is_active               INTEGER NOT NULL DEFAULT 1,
  is_locked               INTEGER NOT NULL DEFAULT 0,
  locked_until            TEXT,
  login_attempts          INTEGER NOT NULL DEFAULT 0,
  must_change_password    INTEGER NOT NULL DEFAULT 0,
  password_changed_at     TEXT,
  last_login_at           TEXT,
  mfa_enabled             INTEGER NOT NULL DEFAULT 0,
  mfa_secret              TEXT,
  mfa_backup_codes        TEXT,                         -- JSON array
  preferences             TEXT,                         -- JSON
  created_by              TEXT,
  updated_by              TEXT,
  created_at              TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at              TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at              TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email       ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tenant      ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_hospital    ON users(hospital_id);
CREATE INDEX IF NOT EXISTS idx_users_role        ON users(role_id);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  device_info TEXT,
  ip_address  TEXT,
  user_agent  TEXT,
  expires_at  TEXT NOT NULL,
  revoked_at  TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_refresh_user ON refresh_tokens(user_id);

CREATE TABLE IF NOT EXISTS audit_logs (
  id           TEXT PRIMARY KEY,
  tenant_id    TEXT REFERENCES tenants(id),
  user_id      TEXT REFERENCES users(id),
  user_email   TEXT,
  user_role    TEXT,
  action       TEXT NOT NULL,   -- LOGIN|LOGOUT|CREATE|READ|UPDATE|DELETE|EXPORT|DENIED
  module       TEXT NOT NULL,
  resource     TEXT,
  record_id    TEXT,
  old_values   TEXT,            -- JSON
  new_values   TEXT,            -- JSON
  ip_address   TEXT,
  user_agent   TEXT,
  session_id   TEXT,
  result       TEXT NOT NULL DEFAULT 'success',  -- success|denied|error
  reason       TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_user      ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action    ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_module    ON audit_logs(module);
CREATE INDEX IF NOT EXISTS idx_audit_created   ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_tenant    ON audit_logs(tenant_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 5 — PATIENTS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS patients (
  id                    TEXT PRIMARY KEY,
  tenant_id             TEXT NOT NULL REFERENCES tenants(id),
  hospital_id           TEXT NOT NULL REFERENCES hospitals(id),
  mrn                   TEXT UNIQUE NOT NULL,
  national_id           TEXT UNIQUE,
  passport_number       TEXT,
  first_name            TEXT NOT NULL,
  last_name             TEXT NOT NULL,
  middle_name           TEXT,
  date_of_birth         TEXT NOT NULL,
  approximate_dob       INTEGER NOT NULL DEFAULT 0,
  gender                TEXT NOT NULL,
  blood_group           TEXT,
  rh_factor             TEXT,
  marital_status        TEXT,
  nationality           TEXT DEFAULT 'Rwandan',
  religion              TEXT,
  occupation            TEXT,
  education_level       TEXT,
  phone                 TEXT NOT NULL,
  phone_secondary       TEXT,
  email                 TEXT,
  address               TEXT,           -- JSON: province, district, sector, cell, village
  gps_coordinates       TEXT,           -- JSON: lat, lng
  emergency_contact     TEXT,           -- JSON: name, relationship, phone
  insurance_provider    TEXT,
  insurance_number      TEXT,
  insurance_expiry      TEXT,
  insurance_type        TEXT,           -- RSSB|MUTUELLE|PRIVATE|SELF
  allergies             TEXT,           -- JSON array
  chronic_conditions    TEXT,           -- JSON array
  current_medications   TEXT,           -- JSON array
  medical_history       TEXT,
  family_history        TEXT,
  social_history        TEXT,           -- JSON
  immunization_history  TEXT,           -- JSON array
  organ_donor           INTEGER NOT NULL DEFAULT 0,
  is_deceased           INTEGER NOT NULL DEFAULT 0,
  deceased_date         TEXT,
  status                TEXT NOT NULL DEFAULT 'active',
  registered_by         TEXT REFERENCES users(id),
  created_by            TEXT,
  updated_by            TEXT,
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at            TEXT
);

CREATE INDEX IF NOT EXISTS idx_patients_mrn        ON patients(mrn);
CREATE INDEX IF NOT EXISTS idx_patients_nid        ON patients(national_id);
CREATE INDEX IF NOT EXISTS idx_patients_name       ON patients(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_patients_phone      ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_tenant     ON patients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_patients_hospital   ON patients(hospital_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 6 — APPOINTMENTS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS appointments (
  id                TEXT PRIMARY KEY,
  tenant_id         TEXT NOT NULL REFERENCES tenants(id),
  hospital_id       TEXT NOT NULL REFERENCES hospitals(id),
  patient_id        TEXT NOT NULL REFERENCES patients(id),
  doctor_id         TEXT NOT NULL REFERENCES users(id),
  department_id     TEXT REFERENCES departments(id),
  appointment_date  TEXT NOT NULL,
  start_time        TEXT NOT NULL,
  end_time          TEXT,
  duration_minutes  INTEGER NOT NULL DEFAULT 30,
  type              TEXT NOT NULL DEFAULT 'consultation',
  priority          TEXT NOT NULL DEFAULT 'routine',
  status            TEXT NOT NULL DEFAULT 'scheduled',
  queue_number      TEXT,
  chief_complaint   TEXT,
  notes             TEXT,
  walk_in           INTEGER NOT NULL DEFAULT 0,
  reminder_sent     INTEGER NOT NULL DEFAULT 0,
  check_in_time     TEXT,
  check_out_time    TEXT,
  created_by        TEXT REFERENCES users(id),
  updated_by        TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at        TEXT
);

CREATE INDEX IF NOT EXISTS idx_appt_patient    ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appt_doctor     ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appt_date       ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appt_status     ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appt_tenant     ON appointments(tenant_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 7 — MEDICAL RECORDS (EMR)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS vitals (
  id                  TEXT PRIMARY KEY,
  patient_id          TEXT NOT NULL REFERENCES patients(id),
  appointment_id      TEXT REFERENCES appointments(id),
  tenant_id           TEXT NOT NULL REFERENCES tenants(id),
  hospital_id         TEXT NOT NULL REFERENCES hospitals(id),
  temperature         REAL,
  systolic_bp         INTEGER,
  diastolic_bp        INTEGER,
  heart_rate          INTEGER,
  respiratory_rate    INTEGER,
  oxygen_saturation   REAL,
  blood_glucose       REAL,
  weight_kg           REAL,
  height_cm           REAL,
  bmi                 REAL,
  pain_score          INTEGER,
  recorded_by         TEXT REFERENCES users(id),
  notes               TEXT,
  recorded_at         TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_vitals_patient ON vitals(patient_id);

CREATE TABLE IF NOT EXISTS clinical_notes (
  id              TEXT PRIMARY KEY,
  patient_id      TEXT NOT NULL REFERENCES patients(id),
  appointment_id  TEXT REFERENCES appointments(id),
  tenant_id       TEXT NOT NULL REFERENCES tenants(id),
  hospital_id     TEXT NOT NULL REFERENCES hospitals(id),
  author_id       TEXT NOT NULL REFERENCES users(id),
  note_type       TEXT NOT NULL DEFAULT 'general',
  subjective      TEXT,
  objective       TEXT,
  assessment      TEXT,
  plan            TEXT,
  diagnoses       TEXT,   -- JSON array of {icdCode, description, type, chronic}
  vitals_id       TEXT REFERENCES vitals(id),
  signed          INTEGER NOT NULL DEFAULT 0,
  signed_at       TEXT,
  created_by      TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at      TEXT
);
CREATE INDEX IF NOT EXISTS idx_notes_patient ON clinical_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_notes_author  ON clinical_notes(author_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 9 — LABORATORY
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS lab_requests (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL REFERENCES tenants(id),
  hospital_id     TEXT NOT NULL REFERENCES hospitals(id),
  patient_id      TEXT NOT NULL REFERENCES patients(id),
  appointment_id  TEXT REFERENCES appointments(id),
  note_id         TEXT REFERENCES clinical_notes(id),
  ordered_by      TEXT NOT NULL REFERENCES users(id),
  test_name       TEXT NOT NULL,
  test_panel      TEXT,
  sample_type     TEXT,
  barcode         TEXT UNIQUE,
  urgency         TEXT NOT NULL DEFAULT 'routine',
  status          TEXT NOT NULL DEFAULT 'ordered',
  clinical_notes  TEXT,
  ordered_at      TEXT NOT NULL DEFAULT (datetime('now')),
  collected_at    TEXT,
  received_at     TEXT,
  processed_at    TEXT,
  result_value    TEXT,
  result_unit     TEXT,
  reference_range TEXT,
  result_flag     TEXT,
  result_at       TEXT,
  technician_id   TEXT REFERENCES users(id),
  validated_by    TEXT REFERENCES users(id),
  validated_at    TEXT,
  critical_alerted INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at      TEXT
);
CREATE INDEX IF NOT EXISTS idx_lab_patient ON lab_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_status  ON lab_requests(status);
CREATE INDEX IF NOT EXISTS idx_lab_barcode ON lab_requests(barcode);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 10 — RADIOLOGY
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS radiology_orders (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL REFERENCES tenants(id),
  hospital_id     TEXT NOT NULL REFERENCES hospitals(id),
  patient_id      TEXT NOT NULL REFERENCES patients(id),
  appointment_id  TEXT REFERENCES appointments(id),
  ordered_by      TEXT NOT NULL REFERENCES users(id),
  modality        TEXT NOT NULL,
  body_part       TEXT,
  indication      TEXT,
  urgency         TEXT NOT NULL DEFAULT 'routine',
  status          TEXT NOT NULL DEFAULT 'ordered',
  report          TEXT,
  findings        TEXT,
  impression      TEXT,
  radiologist_id  TEXT REFERENCES users(id),
  reported_at     TEXT,
  image_url       TEXT,
  ordered_at      TEXT NOT NULL DEFAULT (datetime('now')),
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at      TEXT
);
CREATE INDEX IF NOT EXISTS idx_radio_patient ON radiology_orders(patient_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 11 — PHARMACY
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS drug_catalogue (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL REFERENCES tenants(id),
  generic_name    TEXT NOT NULL,
  brand_names     TEXT,   -- JSON array
  category        TEXT,
  dosage_forms    TEXT,   -- JSON array
  strength        TEXT,
  unit            TEXT,
  controlled      INTEGER NOT NULL DEFAULT 0,
  reorder_level   INTEGER NOT NULL DEFAULT 50,
  description     TEXT,
  is_active       INTEGER NOT NULL DEFAULT 1,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_drug_tenant ON drug_catalogue(tenant_id);

CREATE TABLE IF NOT EXISTS drug_inventory (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL REFERENCES tenants(id),
  hospital_id     TEXT NOT NULL REFERENCES hospitals(id),
  drug_id         TEXT NOT NULL REFERENCES drug_catalogue(id),
  batch_number    TEXT NOT NULL,
  manufacturer    TEXT,
  expiry_date     TEXT NOT NULL,
  quantity        INTEGER NOT NULL DEFAULT 0,
  unit_cost       REAL,
  selling_price   REAL,
  location        TEXT,
  supplier        TEXT,
  received_at     TEXT NOT NULL DEFAULT (datetime('now')),
  received_by     TEXT REFERENCES users(id),
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_inv_drug    ON drug_inventory(drug_id);
CREATE INDEX IF NOT EXISTS idx_inv_expiry  ON drug_inventory(expiry_date);

CREATE TABLE IF NOT EXISTS prescriptions (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL REFERENCES tenants(id),
  hospital_id     TEXT NOT NULL REFERENCES hospitals(id),
  patient_id      TEXT NOT NULL REFERENCES patients(id),
  appointment_id  TEXT REFERENCES appointments(id),
  note_id         TEXT REFERENCES clinical_notes(id),
  doctor_id       TEXT NOT NULL REFERENCES users(id),
  status          TEXT NOT NULL DEFAULT 'active',
  dispensed_by    TEXT REFERENCES users(id),
  dispensed_at    TEXT,
  items           TEXT NOT NULL,  -- JSON array of prescription items
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at      TEXT
);
CREATE INDEX IF NOT EXISTS idx_rx_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_rx_doctor  ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_rx_status  ON prescriptions(status);

CREATE TABLE IF NOT EXISTS dispensing_log (
  id              TEXT PRIMARY KEY,
  prescription_id TEXT NOT NULL REFERENCES prescriptions(id),
  inventory_id    TEXT NOT NULL REFERENCES drug_inventory(id),
  patient_id      TEXT NOT NULL REFERENCES patients(id),
  pharmacist_id   TEXT NOT NULL REFERENCES users(id),
  verifier_id     TEXT REFERENCES users(id),
  drug_name       TEXT NOT NULL,
  quantity        INTEGER NOT NULL,
  dispensed_at    TEXT NOT NULL DEFAULT (datetime('now')),
  notes           TEXT
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 12 — BILLING
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS service_tariffs (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL REFERENCES tenants(id),
  hospital_id     TEXT NOT NULL REFERENCES hospitals(id),
  service_name    TEXT NOT NULL,
  category        TEXT NOT NULL,
  price           REAL NOT NULL,
  insurance_cover REAL NOT NULL DEFAULT 0,
  is_active       INTEGER NOT NULL DEFAULT 1,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS invoices (
  id              TEXT PRIMARY KEY,
  invoice_number  TEXT UNIQUE NOT NULL,
  tenant_id       TEXT NOT NULL REFERENCES tenants(id),
  hospital_id     TEXT NOT NULL REFERENCES hospitals(id),
  patient_id      TEXT NOT NULL REFERENCES patients(id),
  appointment_id  TEXT REFERENCES appointments(id),
  payer           TEXT,
  insurance_claim_status TEXT NOT NULL DEFAULT 'none',
  subtotal        REAL NOT NULL DEFAULT 0,
  insurance_cover REAL NOT NULL DEFAULT 0,
  patient_copay   REAL NOT NULL DEFAULT 0,
  total           REAL NOT NULL DEFAULT 0,
  paid            REAL NOT NULL DEFAULT 0,
  balance         REAL NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'unpaid',
  due_date        TEXT,
  notes           TEXT,
  created_by      TEXT REFERENCES users(id),
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at      TEXT
);
CREATE INDEX IF NOT EXISTS idx_inv_patient  ON invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_inv_status   ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_inv_number   ON invoices(invoice_number);

CREATE TABLE IF NOT EXISTS invoice_items (
  id              TEXT PRIMARY KEY,
  invoice_id      TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  service_name    TEXT NOT NULL,
  category        TEXT,
  quantity        INTEGER NOT NULL DEFAULT 1,
  unit_price      REAL NOT NULL,
  total           REAL NOT NULL,
  insurance_cover REAL NOT NULL DEFAULT 0,
  patient_copay   REAL NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_invitem_invoice ON invoice_items(invoice_id);

CREATE TABLE IF NOT EXISTS payments (
  id              TEXT PRIMARY KEY,
  invoice_id      TEXT NOT NULL REFERENCES invoices(id),
  patient_id      TEXT NOT NULL REFERENCES patients(id),
  amount          REAL NOT NULL,
  method          TEXT NOT NULL,
  reference       TEXT,
  status          TEXT NOT NULL DEFAULT 'completed',
  cashier_id      TEXT REFERENCES users(id),
  paid_at         TEXT NOT NULL DEFAULT (datetime('now')),
  notes           TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_pay_invoice  ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_pay_patient  ON payments(patient_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 13 — INSURANCE CLAIMS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS insurance_claims (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL REFERENCES tenants(id),
  hospital_id     TEXT NOT NULL REFERENCES hospitals(id),
  invoice_id      TEXT NOT NULL REFERENCES invoices(id),
  patient_id      TEXT NOT NULL REFERENCES patients(id),
  provider        TEXT NOT NULL,
  claim_number    TEXT UNIQUE,
  amount_claimed  REAL NOT NULL,
  amount_approved REAL,
  status          TEXT NOT NULL DEFAULT 'draft',
  submitted_at    TEXT,
  approved_at     TEXT,
  paid_at         TEXT,
  rejection_reason TEXT,
  submitted_by    TEXT REFERENCES users(id),
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 14 — INVENTORY & PROCUREMENT
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS inventory_items (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL REFERENCES tenants(id),
  hospital_id     TEXT NOT NULL REFERENCES hospitals(id),
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,
  unit            TEXT NOT NULL DEFAULT 'piece',
  current_stock   INTEGER NOT NULL DEFAULT 0,
  reorder_level   INTEGER NOT NULL DEFAULT 10,
  unit_cost       REAL,
  location        TEXT,
  is_active       INTEGER NOT NULL DEFAULT 1,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id              TEXT PRIMARY KEY,
  item_id         TEXT NOT NULL REFERENCES inventory_items(id),
  tenant_id       TEXT NOT NULL REFERENCES tenants(id),
  movement_type   TEXT NOT NULL,  -- received|issued|transferred|adjusted
  quantity        INTEGER NOT NULL,
  from_location   TEXT,
  to_location     TEXT,
  reference       TEXT,
  notes           TEXT,
  created_by      TEXT REFERENCES users(id),
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS purchase_requests (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL REFERENCES tenants(id),
  hospital_id     TEXT NOT NULL REFERENCES hospitals(id),
  request_number  TEXT UNIQUE NOT NULL,
  items           TEXT NOT NULL,  -- JSON array
  status          TEXT NOT NULL DEFAULT 'pending',
  requested_by    TEXT REFERENCES users(id),
  approved_by     TEXT REFERENCES users(id),
  approved_at     TEXT,
  notes           TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 16 — NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notifications (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT REFERENCES tenants(id),
  user_id         TEXT REFERENCES users(id),
  patient_id      TEXT REFERENCES patients(id),
  type            TEXT NOT NULL DEFAULT 'info',
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  channel         TEXT NOT NULL DEFAULT 'in-app',
  status          TEXT NOT NULL DEFAULT 'pending',
  read_at         TEXT,
  sent_at         TEXT,
  metadata        TEXT,  -- JSON
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notif_user   ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_status ON notifications(status);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SPRINT 1 — INPATIENT, NURSING, HR, AMBULANCE, BLOOD BANK, MORTUARY,
--            QUALITY, SURVEILLANCE, REGISTRIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- INPATIENT ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS beds (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL REFERENCES tenants(id),
  hospital_id     TEXT NOT NULL REFERENCES hospitals(id),
  ward            TEXT NOT NULL,
  room            TEXT,
  bed_number      TEXT NOT NULL,
  type            TEXT NOT NULL DEFAULT 'standard',
  status          TEXT NOT NULL DEFAULT 'available',
  is_active       INTEGER NOT NULL DEFAULT 1,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(hospital_id, ward, bed_number)
);
CREATE INDEX IF NOT EXISTS idx_beds_hospital ON beds(hospital_id);
CREATE INDEX IF NOT EXISTS idx_beds_status   ON beds(status);

CREATE TABLE IF NOT EXISTS admissions (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL REFERENCES tenants(id),
  hospital_id     TEXT NOT NULL REFERENCES hospitals(id),
  patient_id      TEXT NOT NULL REFERENCES patients(id),
  bed_id          TEXT REFERENCES beds(id),
  doctor_id       TEXT NOT NULL REFERENCES users(id),
  appointment_id  TEXT REFERENCES appointments(id),
  admission_type  TEXT NOT NULL DEFAULT 'elective',
  ward            TEXT,
  admission_diagnosis TEXT,
  admitting_notes TEXT,
  status          TEXT NOT NULL DEFAULT 'active',
  admitted_at     TEXT NOT NULL DEFAULT (datetime('now')),
  discharged_at   TEXT,
  created_by      TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_admissions_patient ON admissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_admissions_status  ON admissions(status);

CREATE TABLE IF NOT EXISTS discharge_summaries (
  id              TEXT PRIMARY KEY,
  admission_id    TEXT NOT NULL REFERENCES admissions(id),
  patient_id      TEXT NOT NULL REFERENCES patients(id),
  doctor_id       TEXT NOT NULL REFERENCES users(id),
  admission_diagnosis   TEXT,
  final_diagnosis       TEXT,
  hospital_course       TEXT,
  procedures_performed  TEXT,
  medications_on_discharge TEXT,   -- JSON
  follow_up_plan        TEXT,
  follow_up_date        TEXT,
  instructions          TEXT,
  signed              INTEGER NOT NULL DEFAULT 0,
  signed_at           TEXT,
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ward_rounds (
  id              TEXT PRIMARY KEY,
  admission_id    TEXT NOT NULL REFERENCES admissions(id),
  patient_id      TEXT NOT NULL REFERENCES patients(id),
  doctor_id       TEXT NOT NULL REFERENCES users(id),
  vitals_id       TEXT REFERENCES vitals(id),
  notes           TEXT,
  plan            TEXT,
  status_update   TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- NURSING ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS triage_assessments (
  id              TEXT PRIMARY KEY,
  patient_id      TEXT NOT NULL REFERENCES patients(id),
  appointment_id  TEXT REFERENCES appointments(id),
  hospital_id     TEXT NOT NULL REFERENCES hospitals(id),
  nurse_id        TEXT NOT NULL REFERENCES users(id),
  triage_level    INTEGER NOT NULL,   -- 1=Emergency 2=Urgent 3=Less Urgent 4=Non-Urgent 5=Minor
  chief_complaint TEXT NOT NULL,
  vitals_id       TEXT REFERENCES vitals(id),
  allergies_noted TEXT,
  notes           TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_triage_patient ON triage_assessments(patient_id);

CREATE TABLE IF NOT EXISTS medication_administration (
  id              TEXT PRIMARY KEY,
  patient_id      TEXT NOT NULL REFERENCES patients(id),
  admission_id    TEXT REFERENCES admissions(id),
  prescription_id TEXT REFERENCES prescriptions(id),
  nurse_id        TEXT NOT NULL REFERENCES users(id),
  drug_name       TEXT NOT NULL,
  dose            TEXT NOT NULL,
  route           TEXT NOT NULL,
  given_at        TEXT NOT NULL DEFAULT (datetime('now')),
  notes           TEXT,
  omitted         INTEGER NOT NULL DEFAULT 0,
  omit_reason     TEXT
);
CREATE INDEX IF NOT EXISTS idx_mar_patient ON medication_administration(patient_id);

CREATE TABLE IF NOT EXISTS shift_handovers (
  id              TEXT PRIMARY KEY,
  hospital_id     TEXT NOT NULL REFERENCES hospitals(id),
  ward            TEXT NOT NULL,
  shift_date      TEXT NOT NULL,
  shift_type      TEXT NOT NULL,   -- morning|afternoon|night
  outgoing_nurse  TEXT NOT NULL REFERENCES users(id),
  incoming_nurse  TEXT REFERENCES users(id),
  patient_count   INTEGER,
  notes           TEXT NOT NULL,
  pending_tasks   TEXT,   -- JSON
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS patient_consents (
  id              TEXT PRIMARY KEY,
  patient_id      TEXT NOT NULL REFERENCES patients(id),
  admission_id    TEXT REFERENCES admissions(id),
  consent_type    TEXT NOT NULL,   -- surgical|anesthesia|blood|photography|research
  consented       INTEGER NOT NULL DEFAULT 1,
  signed_at       TEXT NOT NULL DEFAULT (datetime('now')),
  witness_id      TEXT REFERENCES users(id),
  document_url    TEXT,
  notes           TEXT
);

-- HUMAN RESOURCES ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff_attendance (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id),
  date        TEXT NOT NULL,
  clock_in    TEXT,
  clock_out   TEXT,
  hours_worked REAL,
  status      TEXT NOT NULL DEFAULT 'present',   -- present|absent|late|half-day|leave
  notes       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, date)
);
CREATE INDEX IF NOT EXISTS idx_attendance_user ON staff_attendance(user_id);

CREATE TABLE IF NOT EXISTS leave_requests (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id),
  leave_type    TEXT NOT NULL,   -- annual|sick|maternity|paternity|compassionate|unpaid
  start_date    TEXT NOT NULL,
  end_date      TEXT NOT NULL,
  days_count    INTEGER,
  reason        TEXT,
  status        TEXT NOT NULL DEFAULT 'pending',   -- pending|approved|rejected|cancelled
  approved_by   TEXT REFERENCES users(id),
  approved_at   TEXT,
  rejection_reason TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS payroll_records (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id),
  hospital_id   TEXT NOT NULL REFERENCES hospitals(id),
  month         TEXT NOT NULL,   -- YYYY-MM
  basic_salary  REAL NOT NULL,
  allowances    REAL NOT NULL DEFAULT 0,
  deductions    REAL NOT NULL DEFAULT 0,
  net_pay       REAL NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',   -- pending|approved|paid
  paid_at       TEXT,
  created_by    TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, month)
);

CREATE TABLE IF NOT EXISTS staff_credentials (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id),
  credential_type TEXT NOT NULL,   -- medical_license|nursing_license|pharmacist_license|etc
  number          TEXT NOT NULL,
  issuing_body    TEXT,
  issued_at       TEXT,
  expiry_date     TEXT,
  document_url    TEXT,
  status          TEXT NOT NULL DEFAULT 'active',
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- AMBULANCE ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ambulances (
  id              TEXT PRIMARY KEY,
  hospital_id     TEXT NOT NULL REFERENCES hospitals(id),
  vehicle_number  TEXT NOT NULL,
  vehicle_type    TEXT NOT NULL DEFAULT 'basic',   -- basic|advanced|neonatal
  driver_id       TEXT REFERENCES users(id),
  status          TEXT NOT NULL DEFAULT 'available',   -- available|dispatched|maintenance|off_duty
  last_location   TEXT,   -- JSON: lat, lng
  fuel_level      INTEGER,
  is_active       INTEGER NOT NULL DEFAULT 1,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dispatches (
  id              TEXT PRIMARY KEY,
  ambulance_id    TEXT NOT NULL REFERENCES ambulances(id),
  hospital_id     TEXT NOT NULL REFERENCES hospitals(id),
  patient_id      TEXT REFERENCES patients(id),
  driver_id       TEXT NOT NULL REFERENCES users(id),
  caller_name     TEXT,
  caller_phone    TEXT,
  pickup_location TEXT,
  destination     TEXT,
  chief_complaint TEXT,
  priority        TEXT NOT NULL DEFAULT 'urgent',
  status          TEXT NOT NULL DEFAULT 'dispatched',
  dispatched_at   TEXT NOT NULL DEFAULT (datetime('now')),
  arrived_at      TEXT,
  patient_loaded_at TEXT,
  delivered_at    TEXT,
  notes           TEXT,
  created_by      TEXT
);
CREATE INDEX IF NOT EXISTS idx_dispatch_ambulance ON dispatches(ambulance_id);

-- BLOOD BANK ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blood_donors (
  id              TEXT PRIMARY KEY,
  hospital_id     TEXT NOT NULL REFERENCES hospitals(id),
  name            TEXT NOT NULL,
  national_id     TEXT,
  blood_group     TEXT NOT NULL,
  rh_factor       TEXT,
  phone           TEXT,
  last_donation   TEXT,
  eligible_from   TEXT,
  total_donations INTEGER NOT NULL DEFAULT 0,
  is_active       INTEGER NOT NULL DEFAULT 1,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS blood_units (
  id              TEXT PRIMARY KEY,
  hospital_id     TEXT NOT NULL REFERENCES hospitals(id),
  blood_group     TEXT NOT NULL,
  component       TEXT NOT NULL,   -- whole_blood|packed_rbc|platelets|ffp|cryo
  units           INTEGER NOT NULL DEFAULT 1,
  volume_ml       INTEGER,
  batch_number    TEXT,
  collected_at    TEXT NOT NULL,
  expiry_date     TEXT NOT NULL,
  donor_id        TEXT REFERENCES blood_donors(id),
  status          TEXT NOT NULL DEFAULT 'available',   -- available|reserved|issued|expired|discarded
  storage_unit    TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_blood_hospital ON blood_units(hospital_id);
CREATE INDEX IF NOT EXISTS idx_blood_group    ON blood_units(blood_group);

CREATE TABLE IF NOT EXISTS transfusions (
  id              TEXT PRIMARY KEY,
  patient_id      TEXT NOT NULL REFERENCES patients(id),
  admission_id    TEXT REFERENCES admissions(id),
  blood_unit_id   TEXT NOT NULL REFERENCES blood_units(id),
  ordered_by      TEXT NOT NULL REFERENCES users(id),
  administered_by TEXT REFERENCES users(id),
  crossmatch_done INTEGER NOT NULL DEFAULT 0,
  started_at      TEXT,
  completed_at    TEXT,
  reaction_noted  INTEGER NOT NULL DEFAULT 0,
  reaction_details TEXT,
  notes           TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- MORTUARY ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mortuary_records (
  id              TEXT PRIMARY KEY,
  hospital_id     TEXT NOT NULL REFERENCES hospitals(id),
  patient_id      TEXT REFERENCES patients(id),
  name            TEXT NOT NULL,
  national_id     TEXT,
  date_of_birth   TEXT,
  date_of_death   TEXT NOT NULL,
  time_of_death   TEXT,
  cause_of_death  TEXT,
  cause_icd_code  TEXT,
  manner_of_death TEXT,   -- natural|accident|suicide|homicide|unknown
  certifying_doctor TEXT REFERENCES users(id),
  storage_unit    TEXT,
  admitted_at     TEXT NOT NULL DEFAULT (datetime('now')),
  released_at     TEXT,
  status          TEXT NOT NULL DEFAULT 'in_storage',   -- in_storage|released|transferred
  notes           TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS death_certificates (
  id              TEXT PRIMARY KEY,
  mortuary_id     TEXT NOT NULL REFERENCES mortuary_records(id),
  certificate_number TEXT UNIQUE NOT NULL,
  primary_cause   TEXT NOT NULL,
  contributing_cause TEXT,
  icd_code        TEXT,
  doctor_id       TEXT NOT NULL REFERENCES users(id),
  issued_at       TEXT NOT NULL DEFAULT (datetime('now')),
  nida_submitted  INTEGER NOT NULL DEFAULT 0,
  nida_ref        TEXT,
  burial_permit   TEXT
);

-- QUALITY ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clinical_audits (
  id              TEXT PRIMARY KEY,
  hospital_id     TEXT NOT NULL REFERENCES hospitals(id),
  title           TEXT NOT NULL,
  audit_type      TEXT NOT NULL,
  standard        TEXT,
  audit_date      TEXT NOT NULL,
  auditor_id      TEXT NOT NULL REFERENCES users(id),
  findings        TEXT,
  score           INTEGER,
  recommendations TEXT,
  status          TEXT NOT NULL DEFAULT 'open',   -- open|closed|in_progress
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS safety_incidents (
  id              TEXT PRIMARY KEY,
  hospital_id     TEXT NOT NULL REFERENCES hospitals(id),
  patient_id      TEXT REFERENCES patients(id),
  incident_type   TEXT NOT NULL,   -- medication_error|fall|infection|near_miss|equipment_failure|other
  severity        TEXT NOT NULL,   -- near_miss|minor|moderate|major|catastrophic
  description     TEXT NOT NULL,
  immediate_action TEXT,
  reported_by     TEXT NOT NULL REFERENCES users(id),
  occurred_at     TEXT NOT NULL,
  reported_at     TEXT NOT NULL DEFAULT (datetime('now')),
  investigation_notes TEXT,
  status          TEXT NOT NULL DEFAULT 'open',
  corrective_actions TEXT   -- JSON array
);

-- VACCINATION ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vaccine_catalogue (
  id                  TEXT PRIMARY KEY,
  name                TEXT NOT NULL,
  antigen             TEXT NOT NULL,
  doses_required      INTEGER NOT NULL DEFAULT 1,
  schedule_weeks      TEXT,   -- JSON array of week numbers e.g. [6,10,14]
  min_interval_days   INTEGER NOT NULL DEFAULT 28,
  storage_temp_min    REAL,
  storage_temp_max    REAL,
  is_active           INTEGER NOT NULL DEFAULT 1,
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS immunization_records (
  id              TEXT PRIMARY KEY,
  patient_id      TEXT NOT NULL REFERENCES patients(id),
  hospital_id     TEXT NOT NULL REFERENCES hospitals(id),
  vaccine_id      TEXT NOT NULL REFERENCES vaccine_catalogue(id),
  dose_number     INTEGER NOT NULL DEFAULT 1,
  batch_number    TEXT,
  manufacturer    TEXT,
  administered_at TEXT NOT NULL DEFAULT (datetime('now')),
  administered_by TEXT NOT NULL REFERENCES users(id),
  site            TEXT,   -- left_arm|right_arm|left_thigh|right_thigh|oral
  route           TEXT,   -- IM|SC|oral|ID
  next_dose_due   TEXT,
  aefi_noted      INTEGER NOT NULL DEFAULT 0,
  aefi_details    TEXT
);
CREATE INDEX IF NOT EXISTS idx_imm_patient ON immunization_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_imm_vaccine ON immunization_records(vaccine_id);

-- BIRTH REGISTRATION ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS birth_registrations (
  id                  TEXT PRIMARY KEY,
  hospital_id         TEXT NOT NULL REFERENCES hospitals(id),
  mother_patient_id   TEXT REFERENCES patients(id),
  newborn_patient_id  TEXT REFERENCES patients(id),
  birth_date          TEXT NOT NULL,
  birth_time          TEXT,
  delivery_mode       TEXT NOT NULL DEFAULT 'normal',   -- normal|cesarean|assisted
  gestational_weeks   INTEGER,
  birth_weight_grams  INTEGER,
  birth_length_cm     REAL,
  apgar_1min          INTEGER,
  apgar_5min          INTEGER,
  birth_outcome       TEXT NOT NULL DEFAULT 'live_birth',   -- live_birth|stillbirth|neonatal_death
  sex                 TEXT NOT NULL,
  multiple_birth      INTEGER NOT NULL DEFAULT 0,
  birth_order         INTEGER,
  complications       TEXT,
  attendant_id        TEXT REFERENCES users(id),
  certificate_number  TEXT UNIQUE,
  crvs_reference      TEXT,
  crvs_submitted_at   TEXT,
  issued_at           TEXT,
  created_by          TEXT,
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ANC REGISTER ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pregnancies (
  id                  TEXT PRIMARY KEY,
  patient_id          TEXT NOT NULL REFERENCES patients(id),
  hospital_id         TEXT NOT NULL REFERENCES hospitals(id),
  lmp_date            TEXT,
  edd                 TEXT,
  gestational_weeks   INTEGER,
  gravida             INTEGER NOT NULL DEFAULT 1,
  para                INTEGER NOT NULL DEFAULT 0,
  risk_level          TEXT NOT NULL DEFAULT 'low',   -- low|medium|high
  hiv_status          TEXT,
  syphilis_status     TEXT,
  blood_group         TEXT,
  rhesus              TEXT,
  delivery_plan       TEXT,
  outcome             TEXT,   -- delivered|miscarriage|stillbirth|ectopic|ongoing
  birth_id            TEXT REFERENCES birth_registrations(id),
  registered_at       TEXT NOT NULL DEFAULT (datetime('now')),
  registered_by       TEXT REFERENCES users(id),
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_pregnancy_patient ON pregnancies(patient_id);

CREATE TABLE IF NOT EXISTS anc_visits (
  id                  TEXT PRIMARY KEY,
  pregnancy_id        TEXT NOT NULL REFERENCES pregnancies(id),
  visit_number        INTEGER NOT NULL,
  visit_date          TEXT NOT NULL,
  gestational_weeks   INTEGER,
  weight_kg           REAL,
  bp_systolic         INTEGER,
  bp_diastolic        INTEGER,
  fundal_height       REAL,
  fetal_position      TEXT,
  fetal_heart_rate    INTEGER,
  urine_protein       TEXT,
  urine_glucose       TEXT,
  hemoglobin          REAL,
  tetanus_given       INTEGER NOT NULL DEFAULT 0,
  iron_folic_given    INTEGER NOT NULL DEFAULT 0,
  itn_given           INTEGER NOT NULL DEFAULT 0,
  counselling_topics  TEXT,   -- JSON array
  next_visit_date     TEXT,
  provider_id         TEXT NOT NULL REFERENCES users(id),
  notes               TEXT,
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

-- FAMILY PLANNING ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS family_planning_clients (
  id              TEXT PRIMARY KEY,
  patient_id      TEXT NOT NULL REFERENCES patients(id),
  hospital_id     TEXT NOT NULL REFERENCES hospitals(id),
  enrollment_date TEXT NOT NULL,
  current_method  TEXT,   -- pill|injection|iud|implant|condom|sterilization|nfp|none
  method_start    TEXT,
  children_count  INTEGER,
  reason_for_fp   TEXT,
  status          TEXT NOT NULL DEFAULT 'active',
  counselled_by   TEXT REFERENCES users(id),
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS fp_visits (
  id              TEXT PRIMARY KEY,
  client_id       TEXT NOT NULL REFERENCES family_planning_clients(id),
  visit_date      TEXT NOT NULL,
  method_given    TEXT,
  quantity        INTEGER,
  bp_systolic     INTEGER,
  bp_diastolic    INTEGER,
  weight_kg       REAL,
  side_effects    TEXT,
  next_visit      TEXT,
  provider_id     TEXT NOT NULL REFERENCES users(id),
  notes           TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
`;
