import { asyncHandler } from "../../middleware/errorHandler.js";
import * as svc from "./billing.service.js";

const t=r=>r.user?.tenantId||"tenant-001", h=r=>r.user?.hospitalId||"hosp-001";

export const listInvoices  = asyncHandler(async(req,res)=>res.json(await svc.getInvoices({...req.query,tenantId:t(req),hospitalId:h(req)})));
export const getInvoice    = asyncHandler(async(req,res)=>res.json(await svc.getInvoiceById(req.params.id)));
export const createInvoice = asyncHandler(async(req,res)=>res.status(201).json(await svc.createInvoice(req.body,req.user?.id,t(req),h(req))));
export const payment       = asyncHandler(async(req,res)=>res.json(await svc.recordPayment(req.params.id,req.body,req.user?.id)));
export const reconciliation= asyncHandler(async(req,res)=>res.json(await svc.getDailyReconciliation(req.query.date,h(req))));
