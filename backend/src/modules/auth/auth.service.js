/**
 * Auth Service — all authentication business logic.
 */

import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../../database/connection.js";
import {
  issueAccessToken, issueRefreshToken, saveRefreshToken,
  consumeRefreshToken, revokeToken, revokeAllUserTokens,
} from "../../services/jwt.service.js";
import {
  AuthError, NotFoundError, AppError,
} from "../../middleware/errorHandler.js";
import { config } from "../../config/index.js";
import { sendEmail, emailPasswordReset } from "../../services/email.service.js";

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

// ── Forgot Password ───────────────────────────────────────────────────────────
export async function forgotPassword(email, frontendUrl) {
  const db = getDb();
  const user = await db.prepare(`SELECT id, first_name, last_name, email FROM users WHERE LOWER(email)=LOWER(?) AND deleted_at IS NULL AND is_active=1`).get(email.trim());

  // Always respond with success to prevent email enumeration
  if (!user) return { sent: false };

  // Generate a secure token (6-char code + UUID portion)
  const token = uuidv4().replace(/-/g,"").slice(0,32);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  // Store token in DB — create table if not exists
  try {
    await db.prepare(`CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`).run();
  } catch {}

  // Invalidate old tokens for this user
  await db.prepare(`UPDATE password_reset_tokens SET used=1 WHERE user_id=?`).run(user.id);

  // Insert new token
  await db.prepare(`INSERT INTO password_reset_tokens (id,user_id,token,expires_at) VALUES(?,?,?,?)`).run(`prt-${uuidv4().slice(0,8)}`, user.id, token, expiresAt);

  // Send email
  const resetLink = `${frontendUrl || process.env.FRONTEND_URL || "http://172.209.217.176:3001"}/reset-password?token=${token}`;
  const name = `${user.first_name} ${user.last_name}`;
  const { subject, html, text } = emailPasswordReset({ name, resetLink, expiresIn: "1 hour" });
  await sendEmail({ to: user.email, subject, html, text });

  return { sent: true };
}

// ── Reset Password ────────────────────────────────────────────────────────────
export async function resetPassword(token, newPassword) {
  const db = getDb();

  // Validate token
  const record = await db.prepare(`
    SELECT prt.*, u.id as uid, u.first_name, u.last_name
    FROM password_reset_tokens prt
    JOIN users u ON u.id=prt.user_id
    WHERE prt.token=? AND prt.used=0
  `).get(token);

  if (!record) throw new AuthError("Invalid or expired reset token. Please request a new one.");
  if (new Date(record.expires_at) < new Date()) {
    await db.prepare(`UPDATE password_reset_tokens SET used=1 WHERE token=?`).run(token);
    throw new AuthError("Reset token has expired. Please request a new one.");
  }

  if (newPassword.length < 8) throw new AppError("Password must be at least 8 characters", 422, "WEAK_PASSWORD");

  // Hash and update
  const hash = await bcrypt.hash(newPassword, config.bcrypt.rounds);
  await db.prepare(`UPDATE users SET password_hash=?, must_change_password=0, password_changed_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(hash, record.uid);

  // Mark token as used
  await db.prepare(`UPDATE password_reset_tokens SET used=1 WHERE token=?`).run(token);

  // Revoke all existing sessions
  await revokeAllUserTokens(record.uid);

  return { success: true, name: `${record.first_name} ${record.last_name}` };
}
