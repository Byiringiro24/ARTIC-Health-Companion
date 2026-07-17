/**
 * Appointments Controller
 */

import { asyncHandler } from "../../middleware/errorHandler.js";
import * as svc from "./appointments.service.js";

const tid = (req) => req.user?.tenantId   || "tenant-001";
const hid = (req) => req.user?.hospitalId || "hosp-001";

export const list   = asyncHandler(async (req, res) => {
  const result = await svc.getAppointments({ ...req.query, tenantId: tid(req), hospitalId: hid(req) });
  res.json(result);
});

export const getOne = asyncHandler(async (req, res) => {
  res.json(await svc.getAppointmentById(req.params.id));
});

export const create = asyncHandler(async (req, res) => {
  const appt = await svc.createAppointment(req.body, req.user?.id, tid(req), hid(req));
  res.status(201).json(appt);
});

export const update = asyncHandler(async (req, res) => {
  res.json(await svc.updateAppointment(req.params.id, req.body, req.user?.id));
});

export const checkIn = asyncHandler(async (req, res) => {
  res.json(await svc.checkIn(req.params.id, req.user?.id));
});

export const updateStatus = asyncHandler(async (req, res) => {
  res.json(await svc.updateStatus(req.params.id, req.body.status, req.user?.id));
});

export const remove = asyncHandler(async (req, res) => {
  await svc.deleteAppointment(req.params.id, req.user?.id);
  res.json({ message: "Appointment cancelled" });
});

export const queue = asyncHandler(async (req, res) => {
  res.json(await svc.getQueue({ ...req.query, tenantId: tid(req), hospitalId: hid(req) }));
});
