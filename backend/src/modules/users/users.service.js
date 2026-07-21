/**
 * Users Service — CRUD for system users (staff accounts).
 */

import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../../database/connection.js";
import { NotFoundError, ConflictError, AppError } from "../../middleware/errorHandler.js";
import { config } from "../../config/index.js";

const SELECT_USER = `
  SELECT u.*, r.name as role_name, r.label as role_label,
         d.name as department_name, h.name as hospital_name
  FROM users u
  LEFT JOIN roles r ON r.id = u.role_id
  LEFT JOIN departments d ON d.id = u.department_id
  LEFT JOIN hospitals h ON h.id = u.hospital_id
  WHERE u.deleted_at IS NULL
`;

// ── List ──────────────────────────────────────────────────────────────────────
export async function getUsers({ page = 1, limit = 20, search, roleId, hospitalId, departmentId, isActive } = {}) {
  const db     = getDb();
  const offset = (page - 1) * limit;
  const where  = ["u.deleted_at IS NULL"];
  const params = [];

  if (search) {
    where.push(`(LOWER(u.first_name||' '||u.last_name) LIKE ? OR LOWER(u.email) LIKE ?)`);
    params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
  }
  if (roleId)        { where.push("u.role_id = ?");       params.push(roleId); }
  if (hospitalId)    { where.push("u.hospital_id = ?");   params.push(hospitalId); }
  if (departmentId)  { where.push("u.department_id = ?"); params.push(departmentId); }
  if (isActive !== undefined) { where.push("u.is_active = ?"); params.push(isActive ? 1 : 0); }

  const cond    = where.join(" AND ");
  const totalRow = await db.prepare(`SELECT COUNT(*) as n FROM users u WHERE ${cond}`).get(...params);
  const total = totalRow?.n ?? 0;
  const rows    = await db.prepare(`
    SELECT u.*, r.name as role_name, r.label as role_label,
           d.name as department_name, h.name as hospital_name
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    LEFT JOIN departments d ON d.id = u.department_id
    LEFT JOIN hospitals h ON h.id = u.hospital_id
    WHERE ${cond}
    ORDER BY u.last_name, u.first_name
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  return { data: rows.map(safeUser), meta: { total, page: +page, limit: +limit, totalPages: Math.ceil(total / limit) } };
}

// ── Get one ───────────────────────────────────────────────────────────────────
export async function getUserById(id) {
  const db   = getDb();
  const user = await db.prepare(`${SELECT_USER} AND u.id = ?`).get(id);
  if (!user) throw new NotFoundError("User");
  const modules = (await db.prepare(`SELECT module_key FROM role_modules WHERE role_id=?`).all(user.role_id)).map(r => r.module_key);
  return safeUser(user, modules);
}

// ── Create ────────────────────────────────────────────────────────────────────
export async function createUser(data, createdBy) {
  const db = getDb();

  const existing = await db.prepare(`SELECT id FROM users WHERE LOWER(email)=LOWER(?) AND deleted_at IS NULL`).get(data.email);
  if (existing) throw new ConflictError(`Email '${data.email}' is already registered`);

  // Support roleId (UUID) OR roleName (string) — hospital manager uses role names as fallback
  let role = null;
  if (data.roleId) {
    // Try by UUID first
    role = await db.prepare(`SELECT id FROM roles WHERE id=? AND deleted_at IS NULL`).get(data.roleId);
    // If not found by UUID, try treating roleId as a role name
    if (!role) {
      role = await db.prepare(`SELECT id FROM roles WHERE name=? AND deleted_at IS NULL`).get(data.roleId);
    }
  }
  if (!role && data.roleName) {
    role = await db.prepare(`SELECT id FROM roles WHERE name=? AND deleted_at IS NULL`).get(data.roleName);
  }
  if (!role) throw new AppError("Role not found. Please select a valid role.", 422, "INVALID_ROLE");

  const resolvedRoleId = role.id;

  const hash = await bcrypt.hash(data.password || "TempPass2026!", config.bcrypt.rounds);
  const id   = `user-${uuidv4().slice(0, 8)}`;

  await db.prepare(`
    INSERT INTO users
      (id,tenant_id,hospital_id,department_id,role_id,first_name,last_name,email,phone,
       password_hash,job_title,qualification,professional_reg_number,
       must_change_password,is_active,created_by,updated_by)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1,1,?,?)
  `).run(
    id, data.tenantId, data.hospitalId, data.departmentId || null, resolvedRoleId,
    data.firstName, data.lastName, data.email.toLowerCase().trim(),
    data.phone || null, hash, data.jobTitle || null,
    data.qualification || null, data.professionalRegNumber || null,
    createdBy, createdBy
  );

  return getUserById(id);
}

// ── Update ────────────────────────────────────────────────────────────────────
export async function updateUser(id, data, updatedBy) {
  const db = getDb();
  const existing = await db.prepare(`SELECT * FROM users WHERE id=? AND deleted_at IS NULL`).get(id);
  if (!existing) throw new NotFoundError("User");

  const fields = [];
  const vals   = [];

  const allowed = { firstName:"first_name", lastName:"last_name", phone:"phone",
    jobTitle:"job_title", qualification:"qualification", departmentId:"department_id",
    roleId:"role_id", isActive:"is_active", profileImageUrl:"profile_image_url",
    professionalRegNumber:"professional_reg_number" };

  for (const [key, col] of Object.entries(allowed)) {
    if (data[key] !== undefined) { fields.push(`${col}=?`); vals.push(data[key]); }
  }
  if (!fields.length) return getUserById(id);

  fields.push("updated_by=?", "updated_at=CURRENT_TIMESTAMP");
  vals.push(updatedBy, id);

  await db.prepare(`UPDATE users SET ${fields.join(",")} WHERE id=?`).run(...vals);
  return getUserById(id);
}

// ── Soft delete ───────────────────────────────────────────────────────────────
export async function deleteUser(id, deletedBy) {
  const db = getDb();
  const u  = await db.prepare(`SELECT id FROM users WHERE id=? AND deleted_at IS NULL`).get(id);
  if (!u) throw new NotFoundError("User");
  await db.prepare(`UPDATE users SET deleted_at=CURRENT_TIMESTAMP, is_active=0, updated_by=? WHERE id=?`).run(deletedBy, id);
}

// ── Roles listing ─────────────────────────────────────────────────────────────
export async function getRoles() {
  const db    = getDb();
  const roles = await db.prepare(`SELECT * FROM roles WHERE deleted_at IS NULL ORDER BY label`).all();

  return Promise.all(roles.map(async (r) => ({
    id:       r.id,
    name:     r.name,
    label:    r.label,
    isSystem: Boolean(r.is_system),
    modules:  (await db.prepare(`SELECT module_key FROM role_modules WHERE role_id=?`).all(r.id)).map((m) => m.module_key),
  })));
}

// ── Strip sensitive fields ─────────────────────────────────────────────────────
function safeUser(u, modules = []) {
  return {
    id:                   u.id,
    tenantId:             u.tenant_id,
    hospitalId:           u.hospital_id,
    hospitalName:         u.hospital_name,
    departmentId:         u.department_id,
    departmentName:       u.department_name,
    roleId:               u.role_id,
    roleName:             u.role_name,
    roleLabel:            u.role_label,
    firstName:            u.first_name,
    lastName:             u.last_name,
    fullName:             `${u.first_name} ${u.last_name}`,
    email:                u.email,
    phone:                u.phone,
    jobTitle:             u.job_title,
    qualification:        u.qualification,
    professionalRegNo:    u.professional_reg_number,
    profileImage:         u.profile_image_url,
    isActive:             Boolean(u.is_active),
    isLocked:             Boolean(u.is_locked),
    mfaEnabled:           Boolean(u.mfa_enabled),
    mustChangePw:         Boolean(u.must_change_password),
    lastLoginAt:          u.last_login_at,
    createdAt:            u.created_at,
    updatedAt:            u.updated_at,
    modules,
  };
}
