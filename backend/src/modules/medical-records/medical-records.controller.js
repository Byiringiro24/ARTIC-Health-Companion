import { asyncHandler } from "../../middleware/errorHandler.js";
import * as svc from "./medical-records.service.js";

export const recordVitals     = asyncHandler(async (req, res) => {
  res.status(201).json(await svc.recordVitals({ ...req.body, tenantId: req.user?.tenantId, hospitalId: req.user?.hospitalId }, req.user?.id));
});
export const getPatientVitals = asyncHandler(async (req, res) => {
  res.json(await svc.getPatientVitals(req.params.patientId, req.query.limit));
});
export const createNote       = asyncHandler(async (req, res) => {
  res.status(201).json(await svc.createNote({ ...req.body, tenantId: req.user?.tenantId, hospitalId: req.user?.hospitalId }, req.user?.id));
});
export const getNote          = asyncHandler(async (req, res) => {
  res.json(await svc.getNoteById(req.params.id));
});
export const updateNote       = asyncHandler(async (req, res) => {
  res.json(await svc.updateNote(req.params.id, req.body, req.user?.id));
});
export const signNote         = asyncHandler(async (req, res) => {
  res.json(await svc.signNote(req.params.id, req.user?.id));
});
export const getPatientNotes  = asyncHandler(async (req, res) => {
  res.json(await svc.getPatientNotes(req.params.patientId, req.query.limit));
});
export const getPatientSummary = asyncHandler(async (req, res) => {
  res.json(await svc.getPatientSummary(req.params.patientId));
});
