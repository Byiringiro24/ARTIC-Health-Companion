import { asyncHandler } from "../../middleware/errorHandler.js";
import * as svc from "./laboratory.service.js";

const t = r => r.user?.tenantId||"tenant-001", h = r => r.user?.hospitalId||"hosp-001";

export const list     = asyncHandler(async (req,res) => res.json(await svc.getLabRequests({...req.query,tenantId:t(req),hospitalId:h(req)})));
export const getOne   = asyncHandler(async (req,res) => res.json(await svc.getById(req.params.id)));
export const create   = asyncHandler(async (req,res) => res.status(201).json(await svc.createLabRequest(req.body,req.user?.id,t(req),h(req))));
export const collect  = asyncHandler(async (req,res) => res.json(await svc.collectSpecimen(req.params.id,req.user?.id)));
export const receive  = asyncHandler(async (req,res) => res.json(await svc.receiveSpecimen(req.params.id,req.user?.id)));
export const result   = asyncHandler(async (req,res) => res.json(await svc.enterResult(req.params.id,req.body,req.user?.id)));
export const validate = asyncHandler(async (req,res) => res.json(await svc.validateResult(req.params.id,req.user?.id)));
