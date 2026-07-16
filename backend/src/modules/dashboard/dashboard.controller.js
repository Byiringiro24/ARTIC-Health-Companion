import { getDb } from "../../database/connection.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

export const getKPIs = asyncHandler((req, res) => {
  const db  = getDb();
  const tid = req.user.tenantId;
  const hid = req.user.hospitalId;

  const totalPatients     = db.prepare(`SELECT COUNT(*) n FROM patients WHERE tenant_id=? AND hospital_id=? AND deleted_at IS NULL`).get(tid, hid).n;
  const todayAppointments = db.prepare(`SELECT COUNT(*) n FROM appointments WHERE tenant_id=? AND hospital_id=? AND date(appointment_date)=date('now') AND deleted_at IS NULL`).get(tid, hid).n;
  const waiting           = db.prepare(`SELECT COUNT(*) n FROM appointments WHERE tenant_id=? AND hospital_id=? AND status='checked-in' AND date(appointment_date)=date('now') AND deleted_at IS NULL`).get(tid, hid).n;
  const admittedBeds      = db.prepare(`SELECT COUNT(*) n FROM appointments WHERE tenant_id=? AND hospital_id=? AND status='admitted' AND deleted_at IS NULL`).get(tid, hid).n;

  res.json({
    success: true,
    kpis: [
      { label: "Total Patients",       value: totalPatients.toLocaleString(),        trend: "registered",           tone: "good" },
      { label: "Today's Appointments", value: todayAppointments.toLocaleString(),    trend: "scheduled today",      tone: "good" },
      { label: "Waiting Patients",     value: waiting.toLocaleString(),              trend: "checked in",           tone: waiting > 20 ? "warn" : "good" },
      { label: "Active Admissions",    value: admittedBeds.toLocaleString(),         trend: "currently admitted",   tone: "good" },
    ],
    recentActivity: db.prepare(`
      SELECT al.action, al.module, al.user_email, al.created_at, al.result
      FROM audit_logs al
      WHERE al.tenant_id=?
      ORDER BY al.created_at DESC LIMIT 10
    `).all(tid),
  });
});

export const getModules = asyncHandler((req, res) => {
  res.json({ success: true, modules: req.user.modules });
});
