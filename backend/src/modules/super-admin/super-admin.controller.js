import { asyncHandler, NotFoundError } from "../../middleware/errorHandler.js";
import * as svc from "./super-admin.service.js";

// ── Core stats ────────────────────────────────────────────────────────────────
export const stats = asyncHandler(async(req,res) => res.json(await svc.getSystemStats()));

// ── Feature flags ─────────────────────────────────────────────────────────────
export const listFeatures    = asyncHandler(async(req,res) => res.json(await svc.getAllFeatureFlags(req.query)));
export const updateFeature   = asyncHandler(async(req,res) => res.json(await svc.updateFeatureFlag(req.params.id, req.body)));
export const bulkUpdateFeatures = asyncHandler(async(req,res) => res.json(await svc.bulkUpdateFeatureFlags(req.body)));
export const exportFeatures  = asyncHandler(async(req,res) => {
  const features = await svc.getAllFeatureFlags();
  res.setHeader("Content-Disposition", "attachment; filename=artic-features.json");
  res.setHeader("Content-Type", "application/json");
  res.json({ exported: new Date().toISOString(), count: features.length, features });
});
export const importFeatures  = asyncHandler(async(req,res) => res.json(await svc.importFeatureFlags(req.body.features, req.user?.id)));

// ── Hospitals ─────────────────────────────────────────────────────────────────
export const listHospitals    = asyncHandler(async(req,res) => res.json(await svc.getAllHospitals(req.query)));
export const createHospital   = asyncHandler(async(req,res) => res.status(201).json(await svc.createHospital(req.body, req.user?.id)));
export const getHospital      = asyncHandler(async(req,res) => res.json(await svc.getHospitalById(req.params.id)));
export const updateHospital   = asyncHandler(async(req,res) => res.json(await svc.updateHospital(req.params.id, req.body)));
export const deleteHospital   = asyncHandler(async(req,res) => { await svc.softDeleteHospital(req.params.id, req.user?.id); res.json({ success: true }); });
export const updateSub        = asyncHandler(async(req,res) => res.json(await svc.updateHospitalSubscription(req.params.id, req.body.tier, req.user?.id)));
export const hospitalFeatures = asyncHandler(async(req,res) => res.json(await svc.getHospitalFeatures(req.params.id)));
export const setFeatureAccess = asyncHandler(async(req,res) => res.json(await svc.setHospitalFeatureAccess(req.params.id, req.body.featureId, req.body.status, req.user?.id, req.body)));
export const bulkSetTier      = asyncHandler(async(req,res) => res.json(await svc.bulkSetTierFeatures(req.params.id, req.body.tier, req.user?.id)));

// ── Access requests ───────────────────────────────────────────────────────────
export const listRequests  = asyncHandler(async(req,res) => res.json(await svc.getAccessRequests(req.query)));
export const requestHistory= asyncHandler(async(req,res) => res.json(await svc.getAccessRequests({ status: "all" })));
export const submitRequest = asyncHandler(async(req,res) => res.status(201).json(await svc.submitAccessRequest(req.body.hospitalId, req.body.featureId, req.user?.id, req.body.reason)));
export const resolveRequest= asyncHandler(async(req,res) => res.json(await svc.resolveAccessRequest(req.params.id, req.body.decision, req.user?.id, req.body.adminNotes, req.body)));

// ── Invoices ──────────────────────────────────────────────────────────────────
export const listInvoices   = asyncHandler(async(req,res) => res.json(await svc.getSubscriptionInvoices(req.query)));
export const createInvoice  = asyncHandler(async(req,res) => res.status(201).json(await svc.createSubscriptionInvoice(req.body.hospitalId, req.body.amount, req.user?.id, req.body)));
export const getInvoice     = asyncHandler(async(req,res) => res.json(await svc.getInvoiceById(req.params.id)));
export const updateInvoiceStatus = asyncHandler(async(req,res) => res.json(await svc.updateInvoiceStatus(req.params.id, req.body.status, req.user?.id)));

// ── Tier configs ──────────────────────────────────────────────────────────────
export const listTierConfigs  = asyncHandler(async(req,res) => res.json(await svc.getTierConfigs()));
export const updateTierConfig = asyncHandler(async(req,res) => res.json(await svc.updateTierConfig(req.params.tier, req.body)));

// ── Audit logs (system-level, no clinical data) ───────────────────────────────
export const getAuditLogs = asyncHandler(async(req,res) => res.json(await svc.getSystemAuditLogs(req.query)));

// ── AI Companion ──────────────────────────────────────────────────────────────
export const aiQuery   = asyncHandler(async(req,res) => res.json(await svc.processAIQuery(req.body.query, req.user?.id)));
export const aiHistory = asyncHandler(async(req,res) => res.json(await svc.getAIHistory(req.user?.id, req.query)));

// ── Chat (admin view — user listing only, no clinical content) ────────────────
export const chatUsers = asyncHandler(async(req,res) => res.json(await svc.getActiveChatUsers()));
