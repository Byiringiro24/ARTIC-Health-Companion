import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import * as ctrl from "./pharmacy.controller.js";

const router = Router();
router.use(authenticate);
router.get("/prescriptions",              ctrl.listRx);
router.get("/prescriptions/:id",          ctrl.getRx);
router.post("/prescriptions",             ctrl.createRx);
router.patch("/prescriptions/:id/dispense",ctrl.dispense);
router.get("/inventory",                  ctrl.listInventory);
router.post("/inventory/receive",         ctrl.receiveStock);
router.get("/inventory/low-stock",        ctrl.lowStock);
export default router;
