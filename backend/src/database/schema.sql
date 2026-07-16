-- =============================================================================
-- ARTIC Health Companion — Database Schema
-- SQLite (production: swap DATABASE_PATH for PostgreSQL via pg driver)
-- =============================================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- =============================================================================
-- CORE / TENANCY
-- =============================================================================

CREATE TABLE IF NOT EXISTS hospitals (
  id          TEXT PRIMARY KEY,
  code        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'district',  -- clinic|district|referral|teaching|private
  address     TEXT,
  province    TEXT,
  district    TEXT,
  phone       TEXT,
  email       TEXT,
  website     TEXT,
  logo_url    TEXT,
  timezone    TEXT NOT NULL DEFAULT 'Africa/Kigali',
  currency    TEXT NOT NULL DEFAULT 'RWF',
  tax_rate    REAL NOT NULL DEFAULT 18.0,
  is_active   INTEGER NOT NULL DEFAULT 1,
  settings    TEXT,                               -- JSON blob
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at  TEXT
);

CREATE TABLE IF NOT EXISTS departments (
  id                  TEXT PRIMARY KEY,
  hospital_id         TEXT NOT NULL REFERENCES hospitals(id),
  code                TEXT NOT NULL,
  name                TEXT NOT NULL,
  type                TEXT NOT NULL DEFAULT 'clinical', -- clinical|administrative|support
  parent_id           TEXT REFERENCES departments(id),
  head_user_id        TEXT,
  location            TEXT,
  phone               TEXT,
  is_active           INTEGER NOT NULL DEFAULT 1,
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at          TEXT,
  UNIQUE(hospital_id, code)
);

-- =============================================================================
-- USERS & AUTH
-- =============================================================================

CREATE TABLE IF NOT EXISTS roles (
  id          TEXT PRIMARY KEY,
  hospital_id TEXT REFERENCES hospitals(id),
  name        TEXT NOT NULL,
  label       TEXT NOT NULL,
  description TEXT,
  is_system   INTEGER NOT NULL DEFAULT 0,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(hospital_id, name)
);

CREATE TABLE IF NOT EXISTS permissions (
  id          TEXT PRIMARY KEY,
  role_id     TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  module      TEXT NOT NULL,
  action      TEXT NOT NULL,  -- create|read|update|delete|export
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id                      TEXT PRIMARY KEY,
  hospital_id             TEXT REFERENCES hospitals(id),
  department_id           TEXT REFERENCES departments(id),
  role_id                 TEXT NOT NULL REFERENCES roles(id),
  employee_id             TEXT,
  email                   TEXT UNIQUE NOT NULL,
  phone                   TEXT,
  password_hash           TEXT NOT NULL,
  first_name              TEXT NOT NULL,
  last_name               TEXT NOT NULL,
  middle_name             TEXT,
  date_of_birth           TEXT,
  gender                  TEXT,
  profile_image_url       TEXT,
  job_title               TEXT,
  qualification           TEXT,
  professional_reg_no     TEXT,
  is_active               INTEGER NOT NULL DEFAULT 1,
  is_locked               INTEGER NOT NULL DEFAULT 0,
  login_attempts          INTEGER NOT NULL DEFAULT 0,
  locked_until            TEXT,
  mfa_enabled             INTEGER NOT NULL DEFAULT 0,
  mfa_secret              TEXT,
  must_change_password    INTEGER NOT NULL DEFAULT 0,
  last_login_at           TEXT,
  last_password_change    TEXT,
  preferences             TEXT,  -- JSON
  created_at              TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at              TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at              TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email       ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_hospital    ON users(hospital_id);
CREATE INDEX IF NOT EXISTS idx_users_role        ON users(role_id);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  device_info TEXT,
  ip_address  TEXT,
  expires_at  TEXT NOT NULL,
  revoked     INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);

CREATE TABLE IF NOT EXISTS audit_logs (
  id          TEXT PRIMARY KEY,
  hospital_id TEXT REFERENCES hospitals(id),
  user_id     TEXT REFERENCES users(id),
  action      TEXT NOT NULL,  -- LOGIN|LOGOUT|CREATE|READ|UPDATE|DELETE|EXPORT
  module      TEXT NOT NULL,
  resource    TEXT,
  record_id   TEXT,
  old_values  TEXT,           -- JSON
  new_values  TEXT,           -- JSON
  ip_address  TEXT,
  user_agent  TEXT,
  result      TEXT NOT NULL DEFAULT 'SUCCESS', -- SUCCESS|DENIED|FAILED
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_user    ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_module  ON audit_logs(module);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- =============================================================================
-- PATIENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS patients (
  id                  TEXT PRIMARY KEY,
  hospital_id         TEXT NOT NULL REFERENCES hospitals(id),
  mrn                 TEXT UNIQUE NOT NULL,
  national_id         TEXT UNIQUE,
  passport_number     TEXT,
  first_name          TEXT NOT NULL,
  last_name           TEXT NOT NULL,
  middle_name         TEXT,
  date_of_birth       TEXT,
  approximate_dob     INTEGER NOT NULL DEFAULT 0,
  gender              TEXT,
  blood_group         TEXT,
  rh_factor           TEXT,
  marital_status      TEXT,
  nationality         TEXT DEFAULT 'Rwandan',
  religion            TEXT,
  occupation          TEXT,
  education_level     TEXT,
  phone               TEXT NOT NULL,
  phone_secondary     TEXT,
  email               TEXT,
  province            TEXT,
  district            TEXT,
  sector              TEXT,
  cell                TEXT,
  village             TEXT,
  emergency_name      TEXT,
  emergency_phone     TEXT,
  emergency_relation  TEXT,
  insurance_provider  TEXT,
  insurance_number    TEXT,
  insurance_expiry    TEXT,
  insurance_type      TEXT,  -- RSSB|MUTUELLE|PRIVATE|SELF
  allergies           TEXT,  -- JSON array
  chronic_conditions  TEXT,  -- JSON array
  medical_history     TEXT,
  family_history      TEXT,
  social_history      TEXT,  -- JSON
  organ_donor         INTEGER NOT NULL DEFAULT 0,
  is_deceased         INTEGER NOT NULL DEFAULT 0,
  deceased_date       TEXT,
  is_active           INTEGER NOT NULL DEFAULT 1,
  registration_date   TEXT NOT NULL DEFAULT (date('now')),
  registered_by       TEXT REFERENCES users(id),
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at          TEXT
);

CREATE INDEX IF NOT EXISTS idx_patients_mrn       ON patients(mrn);
CREATE INDEX IF NOT EXISTS idx_patients_nid       ON patients(national_id);
CREATE INDEX IF NOT EXISTS idx_patients_name      ON patients(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_patients_phone     ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_hospital  ON patients(hospital_id);
