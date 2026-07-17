import { asyncHandler } from "../../middleware/errorHandler.js";
import * as svc from "./reports.service.js";
const h = r => r.user?.hospitalId || "hosp-001";
const t = r => r.user?.tenantId   || "tenant-001";
export const kpis       = asyncHandler(async (req, res) => res.json(await svc.getLiveKPIs(h(req))));
export const revenue    = asyncHandler(async (req, res) => res.json(await svc.getRevenueByDepartment(h(req), req.query.days)));
export const weekly     = asyncHandler(async (req, res) => res.json(await svc.getWeeklyRevenue(h(req))));
export const moh        = asyncHandler(async (req, res) => res.json(await svc.getMOHSummary(h(req), req.query.month)));
export const auditLogs  = asyncHandler(async (req, res) => res.json(await svc.getAuditLogs({ ...req.query, tenantId: t(req) })));
