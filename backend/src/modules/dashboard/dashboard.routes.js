import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { getKPIs, getModules } from "./dashboard.controller.js";

const router = Router();
router.use(authenticate);

router.get("/kpis",    getKPIs);
router.get("/modules", getModules);

export default router;
