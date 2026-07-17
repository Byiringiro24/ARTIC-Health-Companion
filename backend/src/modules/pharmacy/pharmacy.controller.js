import { asyncHandler } from "../../middleware/errorHandler.js";
import * as svc from "./pharmacy.service.js";

const t = r=>r.user?.tenantId||"tenant-001", h=r=>r.user?.hospitalId||"hosp-001";

export const listRx       = asyncHandler(async (req,res)=>res.json(await svc.getPrescriptions({...req.query,tenantId:t(req),hospitalId:h(req)})));
export const getRx        = asyncHandler(async (req,res)=>res.json(await svc.getPrescriptionById(req.params.id)));
export const createRx     = asyncHandler(async (req,res)=>res.status(201).json(await svc.createPrescription(req.body,req.user?.id,t(req),h(req))));
export const dispense     = asyncHandler(async (req,res)=>res.json(await svc.dispensePrescription(req.params.id,req.user?.id)));
export const listInventory= asyncHandler(async (req,res)=>res.json(await svc.getDrugInventory({...req.query,tenantId:t(req),hospitalId:h(req)})));
export const receiveStock = asyncHandler(async (req,res)=>res.status(201).json(await svc.receiveStock(req.body,req.user?.id,t(req),h(req))));
export const lowStock     = asyncHandler(async (req,res)=>res.json(await svc.getLowStockAlerts(h(req))));
