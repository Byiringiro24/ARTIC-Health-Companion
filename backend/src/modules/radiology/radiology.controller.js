import { asyncHandler } from "../../middleware/errorHandler.js";
import * as svc from "./radiology.service.js";
const t=r=>r.user?.tenantId||"tenant-001",h=r=>r.user?.hospitalId||"hosp-001";
export const list   = asyncHandler(async(req,res)=>res.json(await svc.getOrders({...req.query,tenantId:t(req),hospitalId:h(req)})));
export const getOne = asyncHandler(async(req,res)=>res.json(await svc.getOrderById(req.params.id)));
export const create = asyncHandler(async(req,res)=>res.status(201).json(await svc.createOrder(req.body,req.user?.id,t(req),h(req))));
export const report = asyncHandler(async(req,res)=>res.json(await svc.submitReport(req.params.id,req.body,req.user?.id)));
