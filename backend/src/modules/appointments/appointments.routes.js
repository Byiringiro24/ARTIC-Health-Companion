import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import * as ctrl from "./appointments.controller.js";

const router = Router();
router.use(authenticate);

router.get("/",              ctrl.list);
router.get("/queue",         ctrl.queue);
router.get("/:id",           ctrl.getOne);
router.post("/",             ctrl.create);
router.patch("/:id",         ctrl.update);
router.patch("/:id/check-in",ctrl.checkIn);
router.patch("/:id/status",  ctrl.updateStatus);
router.delete("/:id",        ctrl.remove);

export default router;
