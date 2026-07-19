/**
 * ARTIC Health Companion — Express Application v2.0
 * Full HMS: Auth, Users, Patients, Appointments, EMR, Lab, Pharmacy,
 * Billing, Insurance, Inventory, Radiology, Reports, Notifications
 */

import "dotenv/config";
import express        from "express";
import cors           from "cors";
import helmet         from "helmet";
import morgan         from "morgan";
import cookieParser   from "cookie-parser";

import { config }          from "./config/index.js";
import { getDb }           from "./database/connection.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { globalLimiter }   from "./middleware/rateLimiter.js";

// ── Route modules ─────────────────────────────────────────────────────────────
import authRoutes           from "./modules/auth/auth.routes.js";
import usersRoutes          from "./modules/users/users.routes.js";
import patientsRoutes       from "./modules/patients/patients.routes.js";
import dashboardRoutes      from "./modules/dashboard/dashboard.routes.js";
import appointmentsRoutes   from "./modules/appointments/appointments.routes.js";
import medicalRecordsRoutes from "./modules/medical-records/medical-records.routes.js";
import laboratoryRoutes     from "./modules/laboratory/laboratory.routes.js";
import pharmacyRoutes       from "./modules/pharmacy/pharmacy.routes.js";
import billingRoutes        from "./modules/billing/billing.routes.js";
import insuranceRoutes      from "./modules/insurance/insurance.routes.js";
import inventoryRoutes      from "./modules/inventory/inventory.routes.js";
import radiologyRoutes      from "./modules/radiology/radiology.routes.js";
import notificationsRoutes  from "./modules/notifications/notifications.routes.js";
import reportsRoutes        from "./modules/reports/reports.routes.js";
import inpatientRoutes      from "./modules/inpatient/inpatient.routes.js";
import nursingRoutes        from "./modules/nursing/nursing.routes.js";
import vaccinationRoutes    from "./modules/registries/vaccinations/vaccinations.routes.js";
import birthsRoutes         from "./modules/registries/births/births.routes.js";
import deathsRoutes         from "./modules/registries/deaths/deaths.routes.js";
import superAdminRoutes     from "./modules/super-admin/super-admin.routes.js";

// ── Legacy shim data (in-memory, for backward-compat endpoints) ───────────────
import { modules, roles, users as legacyUsers, auditLogs } from "./data.js";

// ─────────────────────────────────────────────────────────────────────────────
const app = express();

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" }, contentSecurityPolicy: false }));

// CORS
app.use(cors({
  origin:         config.cors.origin,
  credentials:    true,
  methods:        ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","X-Requested-With"],
}));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (config.isDev) app.use(morgan("dev"));
else              app.use(morgan("combined"));

// Global rate limit
app.use(globalLimiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", async (_req, res) => {
  let dbStatus = "ok";
  try { await getDb().prepare("SELECT 1").get(); } catch { dbStatus = "error"; }
  res.json({
    status:      "ok",
    service:     "ARTIC Health Companion API",
    version:     "2.0.0",
    phase:       "Full HMS — Appointments, EMR, Lab, Pharmacy, Billing, Insurance, Inventory, Radiology, Notifications, Reports",
    timestamp:   new Date().toISOString(),
    database:    dbStatus,
    environment: config.nodeEnv,
  });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",            authRoutes);
app.use("/api/users",           usersRoutes);
app.use("/api/patients",        patientsRoutes);
app.use("/api/dashboard",       dashboardRoutes);
app.use("/api/appointments",    appointmentsRoutes);
app.use("/api/medical-records", medicalRecordsRoutes);
app.use("/api/laboratory",      laboratoryRoutes);
app.use("/api/pharmacy",        pharmacyRoutes);
app.use("/api/billing",         billingRoutes);
app.use("/api/insurance",       insuranceRoutes);
app.use("/api/inventory",       inventoryRoutes);
app.use("/api/radiology",       radiologyRoutes);
app.use("/api/notifications",   notificationsRoutes);
app.use("/api/reports",         reportsRoutes);
app.use("/api/inpatient",       inpatientRoutes);
app.use("/api/nursing",         nursingRoutes);
app.use("/api/registry/vaccinations", vaccinationRoutes);
app.use("/api/registry/births",       birthsRoutes);
app.use("/api/registry/deaths",       deathsRoutes);
app.use("/api/super-admin",           superAdminRoutes);

// ── Legacy shim routes (keep existing frontend working) ───────────────────────
function legacyUser(req) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  return legacyUsers.find(u => u.id === token || u.email === token) || null;
}
function visibleModules(user) {
  if (!user) return [];
  const role = roles[user.role];
  return role ? modules.filter(m => role.modules.includes(m.key)) : [];
}

app.get("/api/roles",   (_req, res) => res.json(roles));
app.get("/api/modules", (req,  res) => {
  const role = req.query.role;
  res.json(role && roles[role] ? modules.filter(m => roles[role].modules.includes(m.key)) : modules);
});
app.get("/api/me", (req, res) => {
  const user = legacyUser(req);
  if (!user) return res.status(401).json({ error: "Missing or invalid bearer token" });
  const { password, ...safe } = user;
  res.json({ user: safe, role: roles[user.role], modules: visibleModules(user) });
});
app.get("/api/audit", (_req, res) => res.json(auditLogs));

// ── 404 + error handlers ──────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
