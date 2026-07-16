import { Router } from "express";
import * as ctrl from "./patients.controller.js";
import { authenticate, requireModule, auditLog } from "../../middleware/auth.js";

const router = Router();
router.use(authenticate);
router.use(requireModule("patients"));

router.get("/",               auditLog("LIST",   "patients"),             ctrl.list);
router.get("/mrn/:mrn",       auditLog("READ",   "patients"),             ctrl.getByMRN);
router.get("/nid/:nid",       auditLog("READ",   "patients"),             ctrl.getByNID);
router.get("/:id",            auditLog("READ",   "patients", r=>r.params.id), ctrl.getOne);
router.post("/",              auditLog("CREATE", "patients"),             ctrl.create);
router.patch("/:id",          auditLog("UPDATE", "patients", r=>r.params.id), ctrl.update);
router.delete("/:id",         auditLog("DELETE", "patients", r=>r.params.id), ctrl.remove);

export default router;
