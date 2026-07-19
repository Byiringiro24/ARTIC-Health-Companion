import { asyncHandler } from "../../../middleware/errorHandler.js";
import * as svc from "./vaccinations.service.js";
const h = r => r.user?.hospitalId || "hosp-001";
export const catalogue  = asyncHandler(async (req, res) => res.json(await svc.getVaccineCatalogue()));
export const history    = asyncHandler(async (req, res) => res.json(await svc.getPatientImmunizationHistory(req.params.patientId)));
export const administer = asyncHandler(async (req, res) => res.status(201).json(await svc.administerVaccine({ ...req.body, hospitalId: h(req) }, req.user?.id)));
export const dueToday   = asyncHandler(async (req, res) => res.json(await svc.getDueTodayList({ hospitalId: h(req) })));
export const defaulters = asyncHandler(async (req, res) => res.json(await svc.getDefaultersReport({ hospitalId: h(req), daysOverdue: req.query.days })));
export const coverage   = asyncHandler(async (req, res) => res.json(await svc.getVaccineCoverageReport({ hospitalId: h(req), month: req.query.month })));
