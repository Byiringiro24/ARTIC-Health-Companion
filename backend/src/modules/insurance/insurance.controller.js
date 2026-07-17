import { asyncHandler } from "../../middleware/errorHandler.js";
import * as svc from "./insurance.service.js";
const t=r=>r.user?.tenantId||"tenant-001",h=r=>r.user?.hospitalId||"hosp-001";
export const list   = asyncHandler(async(req,res)=>res.json(await svc.getClaims({...req.query,tenantId:t(req),hospitalId:h(req)})));
export const getOne = asyncHandler(async(req,res)=>res.json(await svc.getClaimById(req.params.id)));
export const create = asyncHandler(async(req,res)=>res.status(201).json(await svc.createClaim(req.body,req.user?.id,t(req),h(req))));
export const submit = asyncHandler(async(req,res)=>res.json(await svc.submitClaim(req.params.id,req.user?.id)));
export const updateStatus = asyncHandler(async(req,res)=>res.json(await svc.updateClaimStatus(req.params.id,req.body)));
