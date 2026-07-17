/**
 * ARTIC HMS — Typed API client for all backend modules.
 * Every module calls these functions instead of using local demo data.
 */

import { apiFetch } from "./client";
import { getSession } from "@/lib/auth";

// ─── Auth header helper ───────────────────────────────────────────────────────
function authHeader(): Record<string, string> {
  const session = getSession();
  if (session?.accessToken) return { Authorization: `Bearer ${session.accessToken}` };
  return {};
}

function get<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { headers: authHeader() });
}

function post<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, { method: "POST", body: JSON.stringify(body), headers: authHeader() });
}

function patch<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined, headers: authHeader() });
}

function del<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: "DELETE", headers: authHeader() });
}

// ─── Patients ─────────────────────────────────────────────────────────────────
export const patientsApi = {
  list:       (params?: Record<string, string>) => get(`/api/patients?${new URLSearchParams(params)}`),
  getById:    (id: string)                       => get(`/api/patients/${id}`),
  getByMRN:   (mrn: string)                      => get(`/api/patients/mrn/${mrn}`),
  getByNID:   (nid: string)                      => get(`/api/patients/nid/${nid}`),
  create:     (data: unknown)                    => post("/api/patients", data),
  update:     (id: string, data: unknown)        => patch(`/api/patients/${id}`, data),
};

// ─── Appointments ─────────────────────────────────────────────────────────────
export const appointmentsApi = {
  list:         (params?: Record<string, string>) => get(`/api/appointments?${new URLSearchParams(params)}`),
  getById:      (id: string)                       => get(`/api/appointments/${id}`),
  create:       (data: unknown)                    => post("/api/appointments", data),
  update:       (id: string, data: unknown)        => patch(`/api/appointments/${id}`, data),
  checkIn:      (id: string)                       => patch(`/api/appointments/${id}/check-in`),
  setStatus:    (id: string, status: string)       => patch(`/api/appointments/${id}/status`, { status }),
  cancel:       (id: string)                       => del(`/api/appointments/${id}`),
  queue:        (params?: Record<string, string>)  => get(`/api/appointments/queue?${new URLSearchParams(params)}`),
};

// ─── Medical Records ──────────────────────────────────────────────────────────
export const emrApi = {
  recordVitals:      (data: unknown)       => post("/api/medical-records/vitals", data),
  getPatientVitals:  (patientId: string)   => get(`/api/medical-records/vitals/patient/${patientId}`),
  createNote:        (data: unknown)       => post("/api/medical-records/notes", data),
  getNote:           (id: string)          => get(`/api/medical-records/notes/${id}`),
  updateNote:        (id: string, d: unknown) => patch(`/api/medical-records/notes/${id}`, d),
  signNote:          (id: string)          => post(`/api/medical-records/notes/${id}/sign`, {}),
  getPatientNotes:   (patientId: string)   => get(`/api/medical-records/notes/patient/${patientId}`),
  getPatientSummary: (patientId: string)   => get(`/api/medical-records/summary/${patientId}`),
};

// ─── Laboratory ───────────────────────────────────────────────────────────────
export const labApi = {
  list:       (params?: Record<string, string>) => get(`/api/laboratory?${new URLSearchParams(params)}`),
  getById:    (id: string)                       => get(`/api/laboratory/${id}`),
  create:     (data: unknown)                    => post("/api/laboratory", data),
  collect:    (id: string)                       => patch(`/api/laboratory/${id}/collect`),
  receive:    (id: string)                       => patch(`/api/laboratory/${id}/receive`),
  enterResult:(id: string, data: unknown)        => patch(`/api/laboratory/${id}/result`, data),
  validate:   (id: string)                       => patch(`/api/laboratory/${id}/validate`),
};

// ─── Pharmacy ─────────────────────────────────────────────────────────────────
export const pharmacyApi = {
  listRx:       (params?: Record<string, string>) => get(`/api/pharmacy/prescriptions?${new URLSearchParams(params)}`),
  getRx:        (id: string)                       => get(`/api/pharmacy/prescriptions/${id}`),
  createRx:     (data: unknown)                    => post("/api/pharmacy/prescriptions", data),
  dispense:     (id: string)                       => patch(`/api/pharmacy/prescriptions/${id}/dispense`),
  listInventory:(params?: Record<string, string>)  => get(`/api/pharmacy/inventory?${new URLSearchParams(params)}`),
  receiveStock: (data: unknown)                    => post("/api/pharmacy/inventory/receive", data),
  lowStock:     ()                                 => get("/api/pharmacy/inventory/low-stock"),
};

// ─── Billing ──────────────────────────────────────────────────────────────────
export const billingApi = {
  listInvoices:   (params?: Record<string, string>) => get(`/api/billing/invoices?${new URLSearchParams(params)}`),
  getInvoice:     (id: string)                       => get(`/api/billing/invoices/${id}`),
  createInvoice:  (data: unknown)                    => post("/api/billing/invoices", data),
  recordPayment:  (id: string, data: unknown)        => post(`/api/billing/invoices/${id}/payment`, data),
  reconciliation: (date?: string)                    => get(`/api/billing/invoices/reconciliation${date ? `?date=${date}` : ""}`),
};

// ─── Insurance ────────────────────────────────────────────────────────────────
export const insuranceApi = {
  list:         (params?: Record<string, string>) => get(`/api/insurance?${new URLSearchParams(params)}`),
  getById:      (id: string)                       => get(`/api/insurance/${id}`),
  create:       (data: unknown)                    => post("/api/insurance", data),
  submit:       (id: string)                       => patch(`/api/insurance/${id}/submit`),
  updateStatus: (id: string, data: unknown)        => patch(`/api/insurance/${id}/status`, data),
};

// ─── Inventory ────────────────────────────────────────────────────────────────
export const inventoryApi = {
  list:       (params?: Record<string, string>) => get(`/api/inventory?${new URLSearchParams(params)}`),
  getById:    (id: string)                       => get(`/api/inventory/${id}`),
  create:     (data: unknown)                    => post("/api/inventory", data),
  update:     (id: string, data: unknown)        => patch(`/api/inventory/${id}`, data),
  issue:      (id: string, quantity: number, destination: string) => post(`/api/inventory/${id}/issue`, { quantity, destination }),
  receive:    (id: string, quantity: number, reference: string)   => post(`/api/inventory/${id}/receive`, { quantity, reference }),
  lowStock:   ()                                 => get("/api/inventory/low-stock"),
  listPR:     (params?: Record<string, string>)  => get(`/api/inventory/purchase-requests?${new URLSearchParams(params)}`),
  createPR:   (data: unknown)                    => post("/api/inventory/purchase-requests", data),
  approvePR:  (id: string)                       => patch(`/api/inventory/purchase-requests/${id}/approve`),
};

// ─── Radiology ────────────────────────────────────────────────────────────────
export const radiologyApi = {
  list:     (params?: Record<string, string>) => get(`/api/radiology?${new URLSearchParams(params)}`),
  getById:  (id: string)                       => get(`/api/radiology/${id}`),
  create:   (data: unknown)                    => post("/api/radiology", data),
  report:   (id: string, data: unknown)        => patch(`/api/radiology/${id}/report`, data),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsApi = {
  list:         (params?: Record<string, string>) => get(`/api/notifications?${new URLSearchParams(params)}`),
  unreadCount:  ()                                 => get<{ count: number }>("/api/notifications/unread-count"),
  markRead:     (id: string)                       => patch(`/api/notifications/${id}/read`),
  markAllRead:  ()                                 => patch("/api/notifications/mark-all-read"),
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reportsApi = {
  kpis:    () => get("/api/reports/kpis"),
  revenue: (days?: number) => get(`/api/reports/revenue${days ? `?days=${days}` : ""}`),
  weekly:  () => get("/api/reports/weekly"),
  moh:     (month?: string) => get(`/api/reports/moh${month ? `?month=${month}` : ""}`),
  audit:   (params?: Record<string, string>) => get(`/api/reports/audit?${new URLSearchParams(params)}`),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  list:     (params?: Record<string, string>) => get(`/api/users?${new URLSearchParams(params)}`),
  getById:  (id: string)                       => get(`/api/users/${id}`),
  create:   (data: unknown)                    => post("/api/users", data),
  update:   (id: string, data: unknown)        => patch(`/api/users/${id}`, data),
  roles:    ()                                 => get("/api/users/roles"),
};
