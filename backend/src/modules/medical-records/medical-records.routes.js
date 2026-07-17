import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import * as ctrl from "./medical-records.controller.js";

const router = Router();
router.use(authenticate);

router.post("/vitals",                          ctrl.recordVitals);
router.get("/vitals/patient/:patientId",        ctrl.getPatientVitals);
router.post("/notes",                           ctrl.createNote);
router.get("/notes/:id",                        ctrl.getNote);
router.patch("/notes/:id",                      ctrl.updateNote);
router.post("/notes/:id/sign",                  ctrl.signNote);
router.get("/notes/patient/:patientId",         ctrl.getPatientNotes);
router.get("/summary/:patientId",               ctrl.getPatientSummary);

export default router;
