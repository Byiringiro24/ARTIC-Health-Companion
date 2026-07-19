import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.js";
import * as ctrl from "./super-admin.controller.js";

const router = Router();
router.use(authenticate);
router.use(authorize("system-admin"));   // Super Admin only

// System overview
router.get("/stats",                       ctrl.stats);

// Feature flags
router.get("/features",                    ctrl.listFeatures);
router.patch("/features/:id",              ctrl.updateFeature);
router.post("/features/bulk",              ctrl.bulkUpdateFeatures);
router.get("/features/export",             ctrl.exportFeatures);
router.post("/features/import",            ctrl.importFeatures);

// Hospitals / tenants
router.get("/hospitals",                   ctrl.listHospitals);
router.post("/hospitals",                  ctrl.createHospital);
router.get("/hospitals/:id",               ctrl.getHospital);
router.patch("/hospitals/:id",             ctrl.updateHospital);
router.delete("/hospitals/:id",            ctrl.deleteHospital);
router.patch("/hospitals/:id/subscription",ctrl.updateSub);
router.get("/hospitals/:id/features",      ctrl.hospitalFeatures);
router.post("/hospitals/:id/features",     ctrl.setFeatureAccess);
router.post("/hospitals/:id/tier",         ctrl.bulkSetTier);

// Access requests
router.get("/requests",                    ctrl.listRequests);
router.post("/requests",                   ctrl.submitRequest);
router.patch("/requests/:id",              ctrl.resolveRequest);
router.get("/requests/history",            ctrl.requestHistory);

// Subscription invoices
router.get("/invoices",                    ctrl.listInvoices);
router.post("/invoices",                   ctrl.createInvoice);
router.get("/invoices/:id",                ctrl.getInvoice);
router.patch("/invoices/:id/status",       ctrl.updateInvoiceStatus);

// Tier configurations (stored in DB)
router.get("/tiers",                       ctrl.listTierConfigs);
router.patch("/tiers/:tier",               ctrl.updateTierConfig);

// Audit logs (system-level only — no clinical data)
router.get("/audit",                       ctrl.getAuditLogs);

// AI Companion queries (stored for history)
router.post("/ai/query",                   ctrl.aiQuery);
router.get("/ai/history",                  ctrl.aiHistory);

// Chat system (admin broadcast / user listing)
router.get("/chat/users",                  ctrl.chatUsers);

export default router;
