import { getDb } from "../../database/connection.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

export const getKPIs = asyncHandler((req, res) => {
  const db  = getDb();
  // Support both camelCase (JWT payload) and snake_case (DB row) property names
  const tid = req.user.tenant_id   || req.user.tenantId   || "tenant-001";
  const hid = req.user.hospital_id || req.user.hospitalId || "hosp-001";

  const totalPatients     = db.prepare(`SELECT COUNT(*) n FROM patients WHERE tenant_id=? AND deleted_at IS NULL`).get(tid).n;
  const todayAppointments = db.prepare(`SELECT COUNT(*) n FROM appointments WHERE tenant_id=? AND deleted_at IS NULL`).get(tid).n;
  const waiting           = db.prepare(`SELECT COUNT(*) n FROM appointments WHERE tenant_id=? AND status IN ('checked-in','waiting','triage') AND deleted_at IS NULL`).get(tid).n;
  const admitted          = db.prepare(`SELECT COUNT(*) n FROM appointments WHERE tenant_id=? AND status='admitted' AND deleted_at IS NULL`).get(tid).n;

  const recentActivity = db.prepare(`
    SELECT action, module, user_email, created_at, result
    FROM audit_logs WHERE tenant_id=?
    ORDER BY created_at DESC LIMIT 10
  `).all(tid);

  res.json({
    success: true,
    kpis: [
      { label: "Total Patients",       value: String(totalPatients),     trend: "registered",         tone: "good" },
      { label: "Total Appointments",   value: String(todayAppointments), trend: "in system",          tone: "good" },
      { label: "Waiting Patients",     value: String(waiting),           trend: "in queue",           tone: waiting > 20 ? "warn" : "good" },
      { label: "Active Admissions",    value: String(admitted),          trend: "currently admitted", tone: "good" },
    ],
    recentActivity,
  });
});

export const getModules = asyncHandler((req, res) => {
  res.json({ success: true, modules: req.user.modules || [] });
});
