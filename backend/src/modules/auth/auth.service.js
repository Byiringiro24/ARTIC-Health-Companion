/**
 * Auth Service — all authentication business logic.
 */

import bcrypt from "bcryptjs";
import { getDb } from "../../database/connection.js";
import {
  issueAccessToken, issueRefreshToken, saveRefreshToken,
  consumeRefreshToken, revokeToken, revokeAllUserTokens,
} from "../../services/jwt.service.js";
import {
  AuthError, ConflictError, NotFoundError, AppError,
} from "../../middleware/errorHandler.js";
import { config } from "../../config/index.js";
import { v4 as uuidv4 } from "uuid";

const MAX_ATTEMPTS  = 5;
const LOCK_MINUTES  = 30;

// ── Login ─────────────────────────────────────────────────────────────────────
export async function login(email, password, meta = {}) {
  const db   = getDb();
  const user = db.prepare(`
    SELECT u.*, r.name as role_name, r.label as role_label
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE LOWER(u.email) = LOWER(?) AND u.deleted_at IS NULL
  `).get(email.trim());

  if (!user) throw new AuthError("Invalid email or password");
  if (!user.is_active) throw new AuthError("Account is deactivated. Contact administrator.");

  // Check lock
  if (user.is_locked) {
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const mins = Math.ceil((new Date(user.locked_until) - Date.now()) / 60000);
      throw new AuthError(`Account locked. Try again in ${mins} minute(s).`);
    }
    // Unlock if lock period passed
    db.prepare(`UPDATE users SET is_locked=0, locked_until=NULL, login_attempts=0 WHERE id=?`).run(user.id);
    user.is_locked = 0;
  }

  // Verify password
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const attempts = user.login_attempts + 1;
    if (attempts >= MAX_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60000).toISOString();
      db.prepare(`UPDATE users SET login_attempts=?, is_locked=1, locked_until=? WHERE id=?`).run(attempts, lockedUntil, user.id);
      throw new AuthError(`Too many failed attempts. Account locked for ${LOCK_MINUTES} minutes.`);
    }
    db.prepare(`UPDATE users SET login_attempts=? WHERE id=?`).run(attempts, user.id);
    throw new AuthError(`Invalid email or password (${MAX_ATTEMPTS - attempts} attempt(s) remaining)`);
  }

  // Reset attempts on success
  db.prepare(`UPDATE users SET login_attempts=0, is_locked=0, locked_until=NULL, last_login_at=datetime('now') WHERE id=?`).run(user.id);

  // Get modules
  const modules = db.prepare(`SELECT module_key FROM role_modules WHERE role_id=?`).all(user.role_id).map(r => r.module_key);

  // Issue tokens
  const accessToken  = issueAccessToken({ ...user, role_name: user.role_name });
  const refreshToken = issueRefreshToken(user);
  saveRefreshToken(user.id, refreshToken, meta);

  return {
    accessToken,
    refreshToken,
    user: safeUser(user, modules),
  };
}

// ── Refresh ───────────────────────────────────────────────────────────────────
export async function refresh(rawToken, meta = {}) {
  const db     = getDb();
  const record = consumeRefreshToken(rawToken);   // throws AuthError if invalid

  const user = db.prepare(`
    SELECT u.*, r.name as role_name, r.label as role_label
    FROM users u JOIN roles r ON r.id = u.role_id
    WHERE u.id = ? AND u.is_active = 1 AND u.deleted_at IS NULL
  `).get(record.user_id);

  if (!user) throw new AuthError("User not found or deactivated");

  const modules = db.prepare(`SELECT module_key FROM role_modules WHERE role_id=?`).all(user.role_id).map(r => r.module_key);

  const newAccess  = issueAccessToken({ ...user, role_name: user.role_name });
  const newRefresh = issueRefreshToken(user);
  saveRefreshToken(user.id, newRefresh, meta);

  return { accessToken: newAccess, refreshToken: newRefresh, user: safeUser(user, modules) };
}

// ── Logout ────────────────────────────────────────────────────────────────────
export function logout(rawToken) {
  if (rawToken) revokeToken(rawToken);
}

export function logoutAll(userId) {
  revokeAllUserTokens(userId);
}

// ── Me (current user) ─────────────────────────────────────────────────────────
export function getMe(userId) {
  const db   = getDb();
  const user = db.prepare(`
    SELECT u.*, r.name as role_name, r.label as role_label
    FROM users u JOIN roles r ON r.id = u.role_id
    WHERE u.id = ? AND u.deleted_at IS NULL
  `).get(userId);
  if (!user) throw new NotFoundError("User");
  const modules = db.prepare(`SELECT module_key FROM role_modules WHERE role_id=?`).all(user.role_id).map(r => r.module_key);
  return safeUser(user, modules);
}

// ── Change password ───────────────────────────────────────────────────────────
export async function changePassword(userId, currentPassword, newPassword) {
  const db   = getDb();
  const user = db.prepare(`SELECT * FROM users WHERE id=? AND deleted_at IS NULL`).get(userId);
  if (!user) throw new NotFoundError("User");

  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) throw new AuthError("Current password is incorrect");

  if (newPassword.length < 8) throw new AppError("New password must be at least 8 characters", 422, "WEAK_PASSWORD");

  const hash = await bcrypt.hash(newPassword, config.bcrypt.rounds);
  db.prepare(`UPDATE users SET password_hash=?, must_change_password=0, password_changed_at=datetime('now'), updated_at=datetime('now') WHERE id=?`).run(hash, userId);

  // Revoke all refresh tokens — force re-login on all devices
  revokeAllUserTokens(userId);
}

// ── Helper: strip sensitive fields ────────────────────────────────────────────
function safeUser(user, modules = []) {
  return {
    id:           user.id,
    tenantId:     user.tenant_id,
    hospitalId:   user.hospital_id,
    departmentId: user.department_id,
    roleId:       user.role_id,
    roleName:     user.role_name,
    roleLabel:    user.role_label,
    firstName:    user.first_name,
    lastName:     user.last_name,
    email:        user.email,
    phone:        user.phone,
    jobTitle:     user.job_title,
    profileImage: user.profile_image_url,
    mfaEnabled:   Boolean(user.mfa_enabled),
    lastLoginAt:  user.last_login_at,
    mustChangePw: Boolean(user.must_change_password),
    modules,
  };
}
