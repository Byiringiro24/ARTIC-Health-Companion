/**
 * JWT Service — issues, verifies, and revokes access + refresh tokens.
 */

import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config/index.js";
import { getDb } from "../database/connection.js";
import { AuthError } from "../middleware/errorHandler.js";

// ── Issue tokens ──────────────────────────────────────────────────────────────
export function issueAccessToken(user) {
  const payload = {
    sub:        user.id,
    email:      user.email,
    role:       user.role_name,
    roleId:     user.role_id,
    tenantId:   user.tenant_id,
    hospitalId: user.hospital_id,
    firstName:  user.first_name,
    lastName:   user.last_name,
  };
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpires,
    issuer:    "artic-health",
    audience:  "artic-client",
  });
}

export function issueRefreshToken(user) {
  const raw = uuidv4() + "." + crypto.randomBytes(32).toString("hex");
  return raw;
}

export function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

// ── Persist refresh token ─────────────────────────────────────────────────────
export async function saveRefreshToken(userId, rawToken, meta = {}) {
  const db   = getDb();
  const hash = hashToken(rawToken);
  const exp  = new Date(Date.now() + parseDuration(config.jwt.refreshExpires)).toISOString();

  await db.prepare(`
    INSERT INTO refresh_tokens (id, user_id, token_hash, device_info, ip_address, user_agent, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), userId, hash, meta.deviceInfo || null, meta.ip || null, meta.userAgent || null, exp);
}

// ── Verify access token ───────────────────────────────────────────────────────
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, config.jwt.accessSecret, {
      issuer:   "artic-health",
      audience: "artic-client",
    });
  } catch (err) {
    throw new AuthError(
      err.name === "TokenExpiredError" ? "Access token expired" : "Invalid access token"
    );
  }
}

// ── Rotate refresh token ──────────────────────────────────────────────────────
export async function rotateRefreshToken(rawToken, userId, meta = {}) {
  const db   = getDb();
  const hash = hashToken(rawToken);
  const now  = new Date().toISOString();

  const record = await db.prepare(`
    SELECT * FROM refresh_tokens
    WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > ?
  `).get(hash, now);

  if (!record) throw new AuthError("Refresh token is invalid or expired");
  if (record.user_id !== userId) throw new AuthError("Token user mismatch");

  await db.prepare(`UPDATE refresh_tokens SET revoked_at = ? WHERE id = ?`).run(now, record.id);

  const newRefresh = issueRefreshToken({ id: userId });
  await saveRefreshToken(userId, newRefresh, meta);
  return newRefresh;
}

// ── Revoke all tokens for user (logout all devices) ───────────────────────────
export async function revokeAllUserTokens(userId) {
  const db  = getDb();
  const now = new Date().toISOString();
  await db.prepare(`UPDATE refresh_tokens SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL`).run(now, userId);
}

// ── Revoke one token ──────────────────────────────────────────────────────────
export async function revokeToken(rawToken) {
  const db   = getDb();
  const hash = hashToken(rawToken);
  const now  = new Date().toISOString();
  await db.prepare(`UPDATE refresh_tokens SET revoked_at = ? WHERE token_hash = ?`).run(now, hash);
}

// ── Verify + consume refresh token ───────────────────────────────────────────
export async function consumeRefreshToken(rawToken) {
  const db   = getDb();
  const hash = hashToken(rawToken);
  const now  = new Date().toISOString();

  const record = await db.prepare(`
    SELECT rt.*, u.id as uid
    FROM refresh_tokens rt
    JOIN users u ON u.id = rt.user_id
    WHERE rt.token_hash = ? AND rt.revoked_at IS NULL AND rt.expires_at > ?
  `).get(hash, now);

  if (!record) throw new AuthError("Refresh token is invalid or expired");

  await db.prepare(`UPDATE refresh_tokens SET revoked_at = ? WHERE id = ?`).run(now, record.id);
  return record;
}

// ── Helper ────────────────────────────────────────────────────────────────────
function parseDuration(str) {
  const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  const m     = str.match(/^(\d+)([smhd])$/);
  if (!m) return 7 * 86400000;
  return parseInt(m[1], 10) * (units[m[2]] || 86400000);
}
