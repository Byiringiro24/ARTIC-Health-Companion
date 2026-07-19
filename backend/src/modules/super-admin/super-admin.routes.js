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

// Hospitals / tenants
router.get("/hospitals",                   ctrl.listHospitals);
router.post("/hospitals",                  ctrl.createHospital);
router.patch("/hospitals/:id/subscription",ctrl.updateSub);
router.get("/hospitals/:id/features",      ctrl.hospitalFeatures);
router.post("/hospitals/:id/features",     ctrl.setFeatureAccess);
router.post("/hospitals/:id/tier",         ctrl.bulkSetTier);

// Access requests (from hospital managers/doctors)
router.get("/requests",                    ctrl.listRequests);
router.post("/requests",                   ctrl.submitRequest);
router.patch("/requests/:id",              ctrl.resolveRequest);

// Subscription invoices
router.get("/invoices",                    ctrl.listInvoices);
router.post("/invoices",                   ctrl.createInvoice);

export default router;
