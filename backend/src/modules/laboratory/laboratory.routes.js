import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import * as ctrl from "./laboratory.controller.js";

const router = Router();
router.use(authenticate);
router.get("/",                   ctrl.list);
router.get("/:id",                ctrl.getOne);
router.post("/",                  ctrl.create);
router.patch("/:id/collect",      ctrl.collect);
router.patch("/:id/receive",      ctrl.receive);
router.patch("/:id/result",       ctrl.result);
router.patch("/:id/validate",     ctrl.validate);
export default router;
