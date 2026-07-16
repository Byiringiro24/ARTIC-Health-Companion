import { getDb } from "../../database/connection.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

export const getKPIs = asyncHandler(async (req, res) => {
  const db  = getDb();
  const tid = req.user.tenant_id || req.user.tenantId || "tenant-001";

  const totalPatientsRow = await db.prepare(`SELECT COUNT(*) n FROM patients WHERE tenant_id=? AND deleted_at IS NULL`).get(tid);
  const todayAppointmentsRow = await db.prepare(`SELECT COUNT(*) n FROM appointments WHERE tenant_id=? AND deleted_at IS NULL`).get(tid);
  const waitingRow = await db.prepare(`SELECT COUNT(*) n FROM appointments WHERE tenant_id=? AND status IN ('checked-in','waiting','triage') AND deleted_at IS NULL`).get(tid);
  const admittedRow = await db.prepare(`SELECT COUNT(*) n FROM appointments WHERE tenant_id=? AND status='admitted' AND deleted_at IS NULL`).get(tid);

  const recentActivity = await db.prepare(`
    SELECT action, module, user_email, created_at, result
    FROM audit_logs WHERE tenant_id=?
    ORDER BY created_at DESC LIMIT 10
  `).all(tid);

  res.json({
    success: true,
    kpis: [
      { label: "Total Patients", value: String(totalPatientsRow?.n ?? 0), trend: "registered", tone: "good" },
      { label: "Total Appointments", value: String(todayAppointmentsRow?.n ?? 0), trend: "in system", tone: "good" },
      { label: "Waiting Patients", value: String(waitingRow?.n ?? 0), trend: "in queue", tone: (waitingRow?.n ?? 0) > 20 ? "warn" : "good" },
      { label: "Active Admissions", value: String(admittedRow?.n ?? 0), trend: "currently admitted", tone: "good" },
    ],
    recentActivity,
  });
});

export const getModules = asyncHandler((req, res) => {
  res.json({ success: true, modules: req.user.modules || [] });
});
