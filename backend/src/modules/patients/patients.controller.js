import * as svc from "./patients.service.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

export const list    = asyncHandler((req, res) => {
  const result = svc.getPatients({ ...req.query, tenantId: req.user.tenantId, hospitalId: req.user.hospitalId });
  res.json({ success: true, ...result });
});

export const getOne  = asyncHandler((req, res) => {
  res.json({ success: true, patient: svc.getPatientById(req.params.id) });
});

export const getByMRN = asyncHandler((req, res) => {
  res.json({ success: true, patient: svc.getPatientByMRN(req.params.mrn) });
});

export const getByNID = asyncHandler((req, res) => {
  res.json({ success: true, patient: svc.getPatientByNID(req.params.nid) });
});

export const create  = asyncHandler((req, res) => {
  const patient = svc.createPatient(req.body, req.user.id, req.user.tenantId, req.user.hospitalId);
  res.status(201).json({ success: true, patient });
});

export const update  = asyncHandler((req, res) => {
  const patient = svc.updatePatient(req.params.id, req.body, req.user.id);
  res.json({ success: true, patient });
});

export const remove  = asyncHandler((req, res) => {
  svc.deletePatient(req.params.id, req.user.id);
  res.json({ success: true, message: "Patient deleted" });
});
