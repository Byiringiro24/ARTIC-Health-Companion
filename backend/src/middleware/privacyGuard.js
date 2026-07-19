/**
 * Privacy Guard Middleware
 * Enforces the principle: Super Admin = System Operator, NOT Clinical User.
 *
 * Super Admin CAN see:
 *   ✅ Aggregated counts (hospital stats, feature usage)
 *   ✅ Feature flags, subscriptions, system settings
 *   ✅ Technical audit logs (action, module, IP — NOT clinical content)
 *   ✅ Hospital-level KPIs without patient identifiers
 *
 * Super Admin CANNOT see:
 *   ❌ Individual patient records, names, NID, diagnoses
 *   ❌ Clinical notes, lab results, prescriptions
 *   ❌ Patient billing details (only aggregated totals)
 *   ❌ Individual messages or conversations
 *   ❌ Staff personal information (salary, HR records)
 */

import { ForbiddenError } from "./errorHandler.js";
import { getDb } from "../database/connection.js";

// Clinical routes that Super Admin is NEVER allowed to access
const CLINICAL_ROUTES_BLOCKED_FOR_SUPER_ADMIN = [
  "/api/patients",
  "/api/medical-records",
  "/api/laboratory",
  "/api/pharmacy/prescriptions",
  "/api/radiology",
  "/api/nursing",
  "/api/inpatient/admissions",
  "/api/billing/invoices",
  "/api/insurance",
  "/api/registry/vaccinations/patient",
  "/api/anc",
  "/api/postnatal",
  "/api/hiv",
  "/api/tb",
];

/**
 * Blocks Super Admin from accessing individual clinical data.
 * Does NOT block aggregated endpoints (stats, counts).
 */
export function clinicalPrivacyGuard(req, res, next) {
  const role = req.user?.role_name;
  if (role !== "system-admin") return next();   // only applies to Super Admin

  const path = req.path;

  // Allow aggregated/stats endpoints explicitly
  if (path.includes("/stats") || path.includes("/kpis") ||
      path.includes("/reports") || path.includes("/dashboard") ||
      path.includes("/super-admin") || path.includes("/users/roles")) {
    return next();
  }

  // Allow GET on users (for listing staff counts) but not individual clinical data
  if (path.startsWith("/api/users") && req.method === "GET") {
    return next();
  }

  // Block all clinical routes for Super Admin
  for (const blocked of CLINICAL_ROUTES_BLOCKED_FOR_SUPER_ADMIN) {
    if (path.startsWith(blocked)) {
      // Log the attempt
      try {
        const db = getDb();
        db.prepare(`INSERT INTO audit_logs (id,tenant_id,user_id,user_email,user_role,action,module,ip_address,result,reason)
          VALUES (gen_random_uuid(),$1,$2,$3,$4,'ACCESS_DENIED','privacy-guard',$5,'denied','Super Admin attempted to access clinical data')`
        ).run(req.user?.tenant_id||null, req.user?.id, req.user?.email, role, req.ip||null);
      } catch { /* non-blocking */ }

      return next(new ForbiddenError(
        "Super Admin cannot access individual clinical data. " +
        "This is enforced by Rwanda Data Protection Law and ARTIC privacy policy. " +
        "Use /api/reports/kpis for aggregated statistics."
      ));
    }
  }

  next();
}

/**
 * Applies to the patients route specifically:
 * Super Admin gets aggregated stats only, never individual records.
 */
export async function patientsPrivacyFilter(req, res, next) {
  const role = req.user?.role_name;
  if (role !== "system-admin") return next();

  // Super Admin can only get aggregate counts, not individual patients
  if (req.method === "GET" && !req.params.id && !req.params.mrn && !req.params.nid) {
    // Return aggregated count only, no patient data
    const db = getDb();
    try {
      const total = await db.prepare(`SELECT COUNT(*) as n FROM patients WHERE deleted_at IS NULL`).get();
      const byHospital = await db.prepare(`
        SELECT h.name as hospital_name, COUNT(p.id) as patient_count
        FROM patients p JOIN hospitals h ON h.id=p.hospital_id
        WHERE p.deleted_at IS NULL GROUP BY h.name ORDER BY patient_count DESC
      `).all();
      return res.json({
        note: "Aggregated data only — Super Admin cannot see individual patient records per Rwanda Data Protection Law",
        totalPatients: total?.n || 0,
        byHospital,
      });
    } catch {
      return res.json({ totalPatients: 0, byHospital: [] });
    }
  }

  // Any attempt to get individual patient → blocked
  return next(new ForbiddenError(
    "Super Admin cannot access individual patient records. " +
    "Patient data is protected health information."
  ));
}
