import { Router } from "express";
import * as ctrl from "./users.controller.js";
import { authenticate, authorize } from "../../middleware/auth.js";

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get("/roles",  ctrl.roles);           // GET  /api/users/roles
router.get("/",       ctrl.list);            // GET  /api/users
router.get("/:id",    ctrl.getOne);          // GET  /api/users/:id
router.post("/",      authorize("system-admin","hospital-manager","hr-manager"), ctrl.create);  // POST /api/users
router.patch("/:id",  authorize("system-admin","hospital-manager","hr-manager"), ctrl.update);  // PATCH /api/users/:id
router.delete("/:id", authorize("system-admin"),                                  ctrl.remove);  // DELETE /api/users/:id

export default router;
