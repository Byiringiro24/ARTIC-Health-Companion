import * as svc from "./patients.service.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

export const list    = asyncHandler(async (req, res) => {
  const tenantId   = req.user.tenant_id   || req.user.tenantId   || "tenant-001";
  const hospitalId = req.user.hospital_id || req.user.hospitalId || "hosp-001";
  const result = await svc.getPatients({ ...req.query, tenantId, hospitalId });
  res.json({ success: true, ...result });
});

export const getOne  = asyncHandler(async (req, res) => {
  res.json({ success: true, patient: await svc.getPatientById(req.params.id) });
});

export const getByMRN = asyncHandler(async (req, res) => {
  res.json({ success: true, patient: await svc.getPatientByMRN(req.params.mrn) });
});

export const getByNID = asyncHandler(async (req, res) => {
  res.json({ success: true, patient: await svc.getPatientByNID(req.params.nid) });
});

export const create  = asyncHandler(async (req, res) => {
  const tenantId   = req.user.tenant_id   || req.user.tenantId   || "tenant-001";
  const hospitalId = req.user.hospital_id || req.user.hospitalId || "hosp-001";
  const patient = await svc.createPatient(req.body, req.user.id, tenantId, hospitalId);
  res.status(201).json({ success: true, patient });
});

export const update  = asyncHandler(async (req, res) => {
  const patient = await svc.updatePatient(req.params.id, req.body, req.user.id);
  res.json({ success: true, patient });
});

export const remove  = asyncHandler(async (req, res) => {
  await svc.deletePatient(req.params.id, req.user.id);
  res.json({ success: true, message: "Patient deleted" });
});
