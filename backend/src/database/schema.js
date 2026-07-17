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
`;
