/**
 * ARTIC Health Companion — Express Application
 * Phase 1+2+3: Foundation, Database, Authentication
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { config } from "./config/index.js";
import { runMigrations } from "./database/migrate.js";
import { seed } from "./database/seed.js";
import { getDb } from "./database/connection.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { globalLimiter } from "./middleware/rateLimiter.js";

// ── Route imports ─────────────────────────────────────────────────────────────
import authRoutes      from "./modules/auth/auth.routes.js";
import usersRoutes     from "./modules/users/users.routes.js";
import patientsRoutes  from "./modules/patients/patients.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";

// Legacy data import (kept for backward compatibility with existing frontend)
import { appointments, auditLogs, kpis, modules, patients as legacyPatients, roles, users as legacyUsers } from "./data.js";

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin:      config.cors.origin,
  credentials: true,
  methods:     ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","X-Requested-With"],
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Request logging ───────────────────────────────────────────────────────────
if (config.isDev) app.use(morgan("dev"));
else              app.use(morgan("combined"));

// ── Global rate limit ─────────────────────────────────────────────────────────
app.use(globalLimiter);

// ── Health check (no auth) ────────────────────────────────────────────────────
app.get("/health", async (req, res) => {
  const db = getDb();
  let dbStatus = "ok";
  try { await db.prepare("SELECT 1").get(); } catch { dbStatus = "error"; }

  res.json({
    status:    "ok",
    service:   "ARTIC Health Companion API",
    version:   "1.0.0",
    phase:     "Phase 1+2+3 — Foundation, Database, Authentication",
    timestamp: new Date().toISOString(),
    database:  dbStatus,
    environment: config.nodeEnv,
  });
});

// ── API v1 routes (new production routes) ─────────────────────────────────────
app.use("/api/auth",      authRoutes);
app.use("/api/users",     usersRoutes);
app.use("/api/patients",  patientsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ── Legacy compatibility routes ───────────────────────────────────────────────
// These mirror the old server.js endpoints so the existing frontend continues
// working without any changes while we migrate.

function getLegacyUser(req) {
  const header = req.headers.authorization || "";
  const token  = header.replace("Bearer ", "");
  return legacyUsers.find(u => u.id === token || u.email === token) || null;
}

function visibleModules(user) {
  if (!user) return [];
  const role = roles[user.role];
  return role ? modules.filter(m => role.modules.includes(m.key)) : [];
}

app.get("/api/roles",   (req, res) => res.json(roles));
app.get("/api/modules", (req, res) => {
  const role = req.query.role;
  if (role && roles[role]) return res.json(modules.filter(m => roles[role].modules.includes(m.key)));
  res.json(modules);
});
app.get("/api/me", (req, res) => {
  const user = getLegacyUser(req);
  if (!user) return res.status(401).json({ error: "Missing or invalid bearer token" });
  const { password, ...safe } = user;
  res.json({ user: safe, role: roles[user.role], modules: visibleModules(user) });
});
app.get("/api/appointments", (req, res) => {
  const user = getLegacyUser(req);
  if (user?.role === "patient") return res.json(appointments.filter(a => a.patientId === user.patientId));
  res.json(appointments);
});
app.get("/api/audit", (req, res) => res.json(auditLogs));
app.get("/api/dashboard-legacy", (req, res) => {
  const user = getLegacyUser(req);
  res.json({ kpis, queue: appointments, modules: visibleModules(user), compliance: ["MOH reporting","PBF indicators","FHIR/ICD-10 readiness","Rwanda Data Protection Law alignment"] });
});

// ── 404 + error handlers ──────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
