/**
 * Authentication + authorisation middleware.
 *
 *  authenticate   — verifies JWT, attaches req.user
 *  authorize(...) — checks role name(s)
 *  requireModule  — checks user has access to a module key
 *  auditLog       — writes to audit_logs table
 */

import { verifyAccessToken } from "../services/jwt.service.js";
import { getDb } from "../database/connection.js";
import { AuthError, ForbiddenError } from "./errorHandler.js";
import { v4 as uuidv4 } from "uuid";

// ── Authenticate ──────────────────────────────────────────────────────────────
export function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return next(new AuthError());

  const token   = header.slice(7);
  const payload = verifyAccessToken(token);   // throws AuthError if invalid

  // Fetch live user (catches deactivated accounts mid-session)
  const db   = getDb();
  const user = db.prepare(`
    SELECT u.*, r.name as role_name, r.label as role_label
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.id = ? AND u.deleted_at IS NULL
  `).get(payload.sub);

  if (!user)           return next(new AuthError("User account not found"));
  if (!user.is_active) return next(new AuthError("Account is deactivated"));
  if (user.is_locked)  return next(new AuthError("Account is locked"));

  // Attach modules the role has access to
  const modules = db.prepare(`SELECT module_key FROM role_modules WHERE role_id = ?`).all(user.role_id).map(r => r.module_key);

  req.user    = { ...user, modules };
  req.tokenPayload = payload;
  next();
}

// ── Authorise by role name(s) ─────────────────────────────────────────────────
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new AuthError());
    if (!roles.includes(req.user.role_name)) {
      writeAuditLog(req, "ACCESS_DENIED", "auth", null, "Insufficient role");
      return next(new ForbiddenError(`Role '${req.user.role_name}' is not allowed`));
    }
    next();
  };
}

// ── Require module access ─────────────────────────────────────────────────────
export function requireModule(moduleKey) {
  return (req, res, next) => {
    if (!req.user) return next(new AuthError());
    if (!req.user.modules.includes(moduleKey)) {
      writeAuditLog(req, "ACCESS_DENIED", moduleKey, null, "Module not in role");
      return next(new ForbiddenError(`Access to module '${moduleKey}' is denied`));
    }
    next();
  };
}

// ── Audit log helper ──────────────────────────────────────────────────────────
export function auditLog(action, module, resourceFn = null) {
  return (req, res, next) => {
    // Run after response, non-blocking
    res.on("finish", () => {
      const resourceId = resourceFn ? resourceFn(req) : (req.params.id || null);
      writeAuditLog(req, action, module, resourceId);
    });
    next();
  };
}

function writeAuditLog(req, action, module, resourceId = null, reason = null) {
  try {
    const db = getDb();
    db.prepare(`
      INSERT INTO audit_logs
        (id, tenant_id, user_id, user_email, user_role, action, module, resource, record_id,
         ip_address, user_agent, result, reason, created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))
    `).run(
      uuidv4(),
      req.user?.tenant_id || null,
      req.user?.id        || null,
      req.user?.email     || null,
      req.user?.role_name || null,
      action,
      module,
      resourceId ? String(resourceId).split("/").pop() : null,
      resourceId ? String(resourceId).split("/").pop() : null,
      req.ip      || null,
      req.headers["user-agent"] || null,
      reason ? "denied" : "success",
      reason || null
    );
  } catch { /* audit failures must never break the request */ }
}
