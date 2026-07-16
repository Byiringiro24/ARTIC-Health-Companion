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
  AuthError, NotFoundError, AppError,
} from "../../middleware/errorHandler.js";
import { config } from "../../config/index.js";

const MAX_ATTEMPTS  = 5;
const LOCK_MINUTES  = 30;

// ── Login ─────────────────────────────────────────────────────────────────────
export async function login(email, password, meta = {}) {
  const db   = getDb();
  const user = await db.prepare(`
    SELECT u.*, r.name as role_name, r.label as role_label
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE LOWER(u.email) = LOWER(?) AND u.deleted_at IS NULL
  `).get(email.trim());

  if (!user) throw new AuthError("Invalid email or password");
  if (!user.is_active) throw new AuthError("Account is deactivated. Contact administrator.");

  if (user.is_locked) {
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const mins = Math.ceil((new Date(user.locked_until) - Date.now()) / 60000);
      throw new AuthError(`Account locked. Try again in ${mins} minute(s).`);
    }
    await db.prepare(`UPDATE users SET is_locked=0, locked_until=NULL, login_attempts=0 WHERE id=?`).run(user.id);
    user.is_locked = 0;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const attempts = user.login_attempts + 1;
    if (attempts >= MAX_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60000).toISOString();
      await db.prepare(`UPDATE users SET login_attempts=?, is_locked=1, locked_until=? WHERE id=?`).run(attempts, lockedUntil, user.id);
      throw new AuthError(`Too many failed attempts. Account locked for ${LOCK_MINUTES} minutes.`);
    }
    await db.prepare(`UPDATE users SET login_attempts=? WHERE id=?`).run(attempts, user.id);
    throw new AuthError(`Invalid email or password (${MAX_ATTEMPTS - attempts} attempt(s) remaining)`);
  }

  await db.prepare(`UPDATE users SET login_attempts=0, is_locked=0, locked_until=NULL, last_login_at=CURRENT_TIMESTAMP WHERE id=?`).run(user.id);

  const modules = (await db.prepare(`SELECT module_key FROM role_modules WHERE role_id=?`).all(user.role_id)).map(r => r.module_key);

  const accessToken  = issueAccessToken({ ...user, role_name: user.role_name });
  const refreshToken = issueRefreshToken(user);
  await saveRefreshToken(user.id, refreshToken, meta);

  return {
    accessToken,
    refreshToken,
    user: safeUser(user, modules),
  };
}

// ── Refresh ───────────────────────────────────────────────────────────────────
export async function refresh(rawToken, meta = {}) {
  const db     = getDb();
  const record = await consumeRefreshToken(rawToken);

  const user = await db.prepare(`
    SELECT u.*, r.name as role_name, r.label as role_label
    FROM users u JOIN roles r ON r.id = u.role_id
    WHERE u.id = ? AND u.is_active = 1 AND u.deleted_at IS NULL
  `).get(record.user_id);

  if (!user) throw new AuthError("User not found or deactivated");

  const modules = (await db.prepare(`SELECT module_key FROM role_modules WHERE role_id=?`).all(user.role_id)).map(r => r.module_key);

  const newAccess  = issueAccessToken({ ...user, role_name: user.role_name });
  const newRefresh = issueRefreshToken(user);
  await saveRefreshToken(user.id, newRefresh, meta);

  return { accessToken: newAccess, refreshToken: newRefresh, user: safeUser(user, modules) };
}

// ── Logout ────────────────────────────────────────────────────────────────────
export async function logout(rawToken) {
  if (rawToken) await revokeToken(rawToken);
}

export async function logoutAll(userId) {
  await revokeAllUserTokens(userId);
}

// ── Me (current user) ─────────────────────────────────────────────────────────
export async function getMe(userId) {
  const db   = getDb();
  const user = await db.prepare(`
    SELECT u.*, r.name as role_name, r.label as role_label
    FROM users u JOIN roles r ON r.id = u.role_id
    WHERE u.id = ? AND u.deleted_at IS NULL
  `).get(userId);
  if (!user) throw new NotFoundError("User");
  const modules = (await db.prepare(`SELECT module_key FROM role_modules WHERE role_id=?`).all(user.role_id)).map(r => r.module_key);
  return safeUser(user, modules);
}

// ── Change password ───────────────────────────────────────────────────────────
export async function changePassword(userId, currentPassword, newPassword) {
  const db   = getDb();
  const user = await db.prepare(`SELECT * FROM users WHERE id=? AND deleted_at IS NULL`).get(userId);
  if (!user) throw new NotFoundError("User");

  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) throw new AuthError("Current password is incorrect");

  if (newPassword.length < 8) throw new AppError("New password must be at least 8 characters", 422, "WEAK_PASSWORD");

  const hash = await bcrypt.hash(newPassword, config.bcrypt.rounds);
  await db.prepare(`UPDATE users SET password_hash=?, must_change_password=0, password_changed_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(hash, userId);

  await revokeAllUserTokens(userId);
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
