import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import * as ctrl from "./billing.controller.js";

const router = Router();
router.use(authenticate);
router.get("/invoices",                  ctrl.listInvoices);
router.get("/invoices/reconciliation",   ctrl.reconciliation);
router.get("/invoices/:id",              ctrl.getInvoice);
router.post("/invoices",                 ctrl.createInvoice);
router.post("/invoices/:id/payment",     ctrl.payment);
export default router;
