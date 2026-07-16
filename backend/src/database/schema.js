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
`;
