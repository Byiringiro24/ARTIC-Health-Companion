import { asyncHandler } from "../../middleware/errorHandler.js";
import * as svc from "./super-admin.service.js";

export const stats          = asyncHandler(async(req,res)=>res.json(await svc.getSystemStats()));
export const listFeatures   = asyncHandler(async(req,res)=>res.json(await svc.getAllFeatureFlags(req.query)));
export const updateFeature  = asyncHandler(async(req,res)=>res.json(await svc.updateFeatureFlag(req.params.id,req.body)));
export const listHospitals  = asyncHandler(async(req,res)=>res.json(await svc.getAllHospitals(req.query)));
export const createHospital = asyncHandler(async(req,res)=>res.status(201).json(await svc.createHospital(req.body,req.user?.id)));
export const updateSub      = asyncHandler(async(req,res)=>res.json(await svc.updateHospitalSubscription(req.params.id,req.body.tier,req.user?.id)));
export const hospitalFeatures = asyncHandler(async(req,res)=>res.json(await svc.getHospitalFeatures(req.params.id)));
export const setFeatureAccess = asyncHandler(async(req,res)=>res.json(await svc.setHospitalFeatureAccess(req.params.id,req.body.featureId,req.body.status,req.user?.id,req.body)));
export const bulkSetTier    = asyncHandler(async(req,res)=>res.json(await svc.bulkSetTierFeatures(req.params.id,req.body.tier,req.user?.id)));
export const listRequests   = asyncHandler(async(req,res)=>res.json(await svc.getAccessRequests(req.query)));
export const submitRequest  = asyncHandler(async(req,res)=>res.status(201).json(await svc.submitAccessRequest(req.body.hospitalId,req.body.featureId,req.user?.id,req.body.reason)));
export const resolveRequest = asyncHandler(async(req,res)=>res.json(await svc.resolveAccessRequest(req.params.id,req.body.decision,req.user?.id,req.body.adminNotes,req.body)));
export const listInvoices   = asyncHandler(async(req,res)=>res.json(await svc.getSubscriptionInvoices(req.query)));
export const createInvoice  = asyncHandler(async(req,res)=>res.status(201).json(await svc.createSubscriptionInvoice(req.body.hospitalId,req.body.amount,req.user?.id,req.body)));
