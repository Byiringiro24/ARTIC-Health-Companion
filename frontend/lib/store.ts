"use client";

import { create } from "zustand";
import type { Patient, Appointment, InventoryItem, LabRequest, Invoice } from "@/types/hms";
import { patients as defaultPatients, appointments as defaultAppointments, inventory as defaultInventory, labRequests as defaultLabRequests, invoices as defaultInvoices } from "@/lib/data";
import { patientsApi, appointmentsApi, labApi, pharmacyApi, billingApi, inventoryApi, reportsApi, notificationsApi } from "@/lib/api/hms";

// ─── Toast ────────────────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "warning" | "info";
interface Toast { id: string; type: ToastType; message: string; }
interface ToastStore { toasts: Toast[]; show: (message: string, type?: ToastType) => void; dismiss: (id: string) => void; }

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  show(message: string, type: ToastType = "info") {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000);
  },
  dismiss(id: string) { set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })); },
}));

// ─── Patient ──────────────────────────────────────────────────────────────────
interface PatientStore {
  patients: Patient[]; selected: Patient | null; query: string; loading: boolean;
  setQuery: (q: string) => void; select: (p: Patient | null) => void;
  add: (p: Patient) => void; update: (id: string, data: Partial<Patient>) => void;
  setPatients: (patients: Patient[]) => void;
  fetchPatients: () => Promise<void>;
  createPatient: (data: Partial<Patient>) => Promise<Patient | null>;
}
export const usePatientStore = create<PatientStore>((set, get) => ({
  patients: defaultPatients, selected: null, query: "", loading: false,
  setQuery: (query) => set({ query }),
  select: (selected) => set({ selected }),
  add: (p) => set((s) => ({ patients: [p, ...s.patients] })),
  update: (id, data) => set((s) => ({ patients: s.patients.map((p) => p.id === id ? { ...p, ...data } : p) })),
  setPatients: (patients) => set({ patients }),
  async fetchPatients() {
    set({ loading: true });
    try {
      const result: any = await patientsApi.list({ limit: "100" });
      if (result?.data?.length) set({ patients: result.data.map(normalizePatient) });
    } catch { /* keep demo data */ } finally { set({ loading: false }); }
  },
  async createPatient(data) {
    try {
      const created: any = await patientsApi.create(data);
      const p = normalizePatient(created);
      set((s) => ({ patients: [p, ...s.patients] }));
      return p;
    } catch { return null; }
  },
}));

// ─── Appointment ──────────────────────────────────────────────────────────────
interface AppointmentStore {
  appointments: Appointment[]; loading: boolean;
  add: (a: Appointment) => void;
  updateStatus: (id: string, status: Appointment["status"]) => void;
  setAppointments: (a: Appointment[]) => void;
  fetchAppointments: (params?: Record<string,string>) => Promise<void>;
  checkIn: (id: string) => Promise<void>;
  createAppointment: (data: unknown) => Promise<Appointment | null>;
}
export const useAppointmentStore = create<AppointmentStore>((set, get) => ({
  appointments: defaultAppointments, loading: false,
  add: (a) => set((s) => ({ appointments: [a, ...s.appointments] })),
  updateStatus: (id, status) => set((s) => ({ appointments: s.appointments.map((a) => a.id === id ? { ...a, status } : a) })),
  setAppointments: (appointments) => set({ appointments }),
  async fetchAppointments(params) {
    set({ loading: true });
    try {
      const result: any = await appointmentsApi.list(params);
      if (result?.data?.length) set({ appointments: result.data.map(normalizeAppointment) });
    } catch { } finally { set({ loading: false }); }
  },
  async checkIn(id) {
    try {
      const updated: any = await appointmentsApi.checkIn(id);
      set((s) => ({ appointments: s.appointments.map((a) => a.id === id ? normalizeAppointment(updated) : a) }));
    } catch { }
  },
  async createAppointment(data) {
    try {
      const created: any = await appointmentsApi.create(data);
      const a = normalizeAppointment(created);
      set((s) => ({ appointments: [a, ...s.appointments] }));
      return a;
    } catch { return null; }
  },
}));

// ─── Inventory ────────────────────────────────────────────────────────────────
interface InventoryStore {
  items: InventoryItem[]; loading: boolean;
  add: (item: InventoryItem) => void;
  updateQty: (id: string, qty: number) => void;
  fetchInventory: () => Promise<void>;
}
export const useInventoryStore = create<InventoryStore>((set) => ({
  items: defaultInventory, loading: false,
  add: (item) => set((s) => ({ items: [item, ...s.items] })),
  updateQty: (id, qty) => set((s) => ({ items: s.items.map((i) => i.id === id ? { ...i, quantity: qty } : i) })),
  async fetchInventory() {
    set({ loading: true });
    try {
      const result: any = await pharmacyApi.listInventory();
      if (result?.length) set({ items: result.map(normalizeInventoryItem) });
    } catch { } finally { set({ loading: false }); }
  },
}));

// ─── Lab ──────────────────────────────────────────────────────────────────────
interface LabStore {
  requests: LabRequest[]; loading: boolean;
  add: (r: LabRequest) => void;
  updateStatus: (id: string, status: LabRequest["status"], result?: string, flag?: string) => void;
  fetchLabRequests: (params?: Record<string,string>) => Promise<void>;
  enterResult: (id: string, data: { resultValue: string; resultUnit: string; referenceRange: string; flag?: string }) => Promise<void>;
}
export const useLabStore = create<LabStore>((set) => ({
  requests: defaultLabRequests, loading: false,
  add: (r) => set((s) => ({ requests: [r, ...s.requests] })),
  updateStatus: (id, status, result, flag) => set((s) => ({
    requests: s.requests.map((r) => r.id === id ? { ...r, status, ...(result !== undefined ? { result } : {}), ...(flag !== undefined ? { flag } : {}) } : r),
  })),
  async fetchLabRequests(params) {
    set({ loading: true });
    try {
      const result: any = await labApi.list(params);
      if (result?.data?.length) set({ requests: result.data.map(normalizeLabRequest) });
    } catch { } finally { set({ loading: false }); }
  },
  async enterResult(id, data) {
    try {
      const updated: any = await labApi.enterResult(id, data);
      set((s) => ({ requests: s.requests.map((r) => r.id === id ? normalizeLabRequest(updated) : r) }));
    } catch { }
  },
}));

// ─── Billing ──────────────────────────────────────────────────────────────────
interface BillingStore {
  invoices: Invoice[]; loading: boolean;
  add: (inv: Invoice) => void;
  recordPayment: (number: string, amount: number, method: string) => void;
  fetchInvoices: (params?: Record<string,string>) => Promise<void>;
  payInvoice: (id: string, amount: number, method: string) => Promise<void>;
}
export const useBillingStore = create<BillingStore>((set) => ({
  invoices: defaultInvoices, loading: false,
  add: (inv) => set((s) => ({ invoices: [inv, ...s.invoices] })),
  recordPayment: (number, amount, method) => set((s) => ({
    invoices: s.invoices.map((i) => {
      if (i.number !== number) return i;
      const paid = i.paid + amount;
      return { ...i, paid, paymentMethod: method as Invoice["paymentMethod"], status: (paid >= i.amount ? "Paid" : "Partially Paid") as Invoice["status"] };
    }),
  })),
  async fetchInvoices(params) {
    set({ loading: true });
    try {
      const result: any = await billingApi.listInvoices(params);
      if (result?.data?.length) set({ invoices: result.data.map(normalizeInvoice) });
    } catch { } finally { set({ loading: false }); }
  },
  async payInvoice(id, amount, method) {
    try {
      const updated: any = await billingApi.recordPayment(id, { amount, method });
      set((s) => ({ invoices: s.invoices.map((i) => i.number === updated.invoiceNumber || i.number === id ? normalizeInvoice(updated) : i) }));
    } catch { }
  },
}));

// ─── Notifications ────────────────────────────────────────────────────────────
interface NotificationStore {
  notifications: any[]; unreadCount: number; loading: boolean;
  fetchNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}
export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [], unreadCount: 0, loading: false,
  async fetchNotifications() {
    set({ loading: true });
    try {
      const [result, countResult]: [any, any] = await Promise.all([
        notificationsApi.list({ limit: "50" }),
        notificationsApi.unreadCount(),
      ]);
      if (result?.data) set({ notifications: result.data, unreadCount: countResult?.count || 0 });
    } catch { } finally { set({ loading: false }); }
  },
  async markRead(id) {
    try {
      await notificationsApi.markRead(id);
      set((s) => ({
        notifications: s.notifications.map((n) => n.id === id ? { ...n, readAt: new Date().toISOString() } : n),
        unreadCount: Math.max(0, s.unreadCount - 1),
      }));
    } catch { }
  },
  async markAllRead() {
    try {
      await notificationsApi.markAllRead();
      set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })), unreadCount: 0 }));
    } catch { }
  },
}));

// ─── KPI store ────────────────────────────────────────────────────────────────
interface KPIStore { kpis: any[]; loading: boolean; fetchKPIs: () => Promise<void>; }
export const useKPIStore = create<KPIStore>((set) => ({
  kpis: [], loading: false,
  async fetchKPIs() {
    set({ loading: true });
    try {
      const result: any = await reportsApi.kpis();
      if (Array.isArray(result)) set({ kpis: result });
    } catch { } finally { set({ loading: false }); }
  },
}));

// ─── Data normalisers ─────────────────────────────────────────────────────────
function normalizePatient(p: any): Patient {
  return {
    id: p.id, mrn: p.mrn, name: p.fullName || `${p.firstName||""} ${p.lastName||""}`.trim() || p.name || "",
    nid: p.nationalId || p.nid || "", age: calcAge(p.dateOfBirth || p.dob),
    dob: p.dateOfBirth || p.dob || "", gender: p.gender,
    phone: p.phone, email: p.email,
    address: p.address || { province: "", district: "", sector: "" },
    insurance: (p.insuranceProvider || p.insurance) as any,
    insuranceNumber: p.insuranceNumber, bloodGroup: (p.bloodGroup || p.blood_group) as any,
    allergies: p.allergies || [], chronicConditions: p.chronicConditions || [],
    currentMedications: p.currentMedications || [],
    emergencyContact: p.emergencyContact || { name: "", relationship: "", phone: "" },
    status: p.status || "active",
    registeredAt: (p.createdAt || p.registeredAt || "").slice(0, 10),
  };
}

function normalizeAppointment(a: any): Appointment {
  return {
    id: a.id, patientId: a.patientId || a.patient_id,
    patient: a.patientName || a.patient || "",
    clinician: a.doctorName || a.clinician || "",
    department: a.departmentName || a.department || "",
    date: a.appointmentDate || a.date || "",
    time: a.startTime || a.time || "",
    type: a.type as any || "Consultation",
    status: mapApptStatus(a.status),
    queue: a.queueNumber || a.queue || "",
    priority: capitalize(a.priority) as any || "Routine",
    notes: a.notes,
  };
}

function normalizeLabRequest(r: any): LabRequest {
  return {
    id: r.id, patientId: r.patientId || r.patient_id,
    patient: r.patientName || r.patient || "",
    orderedBy: r.orderedByName || r.orderedBy || "",
    test: r.testName || r.test || "",
    testPanel: r.testPanel || "",
    sample: r.sampleType || r.sample || "",
    barcode: r.barcode,
    status: mapLabStatus(r.status),
    urgency: capitalize(r.urgency) as any || "Routine",
    orderedAt: r.orderedAt || "",
    collectedAt: r.collectedAt,
    resultAt: r.resultAt,
    turnaround: r.resultAt ? calcTAT(r.orderedAt, r.resultAt) : "—",
    result: r.resultValue || r.result,
    unit: r.resultUnit || r.unit,
    referenceRange: r.referenceRange,
    flag: r.resultFlag || r.flag,
    technician: r.technicianName || r.technician,
  };
}

function normalizeInventoryItem(i: any): InventoryItem {
  return {
    id: i.id, name: i.genericName || i.name || "",
    genericName: i.genericName, category: i.category as any,
    batch: i.batchNumber || i.batch || "",
    manufacturer: i.manufacturer,
    expiry: i.expiryDate || i.expiry || "",
    quantity: i.quantity || 0,
    reorderLevel: i.reorderLevel || i.reorder_level || 0,
    unitCost: i.unitCost, sellingPrice: i.sellingPrice,
    location: i.location || "", controlled: Boolean(i.controlled),
  };
}

function normalizeInvoice(i: any): Invoice {
  return {
    number: i.invoiceNumber || i.invoice_number || i.number || i.id,
    patientId: i.patientId, patient: i.patientName || i.patient || "",
    payer: i.payer as any || "Self-pay",
    amount: i.total || i.amount || 0,
    paid: i.paid || 0,
    status: mapInvoiceStatus(i.status),
    claimStatus: i.insuranceClaimStatus || i.claimStatus || "none",
    date: (i.createdAt || i.date || "").slice(0, 10),
    items: i.items || [],
    paymentMethod: i.payments?.[0]?.method as any,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcAge(dob: string): number {
  if (!dob) return 0;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

function calcTAT(start: string, end: string): string {
  if (!start || !end) return "—";
  const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  return mins < 60 ? `${mins} min` : `${Math.round(mins / 60 * 10) / 10} hrs`;
}

function capitalize(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function mapApptStatus(s: string): Appointment["status"] {
  const map: Record<string, Appointment["status"]> = {
    scheduled: "Scheduled", confirmed: "Scheduled",
    "checked-in": "Checked In", "in-progress": "In Progress",
    completed: "Completed", "no-show": "No-Show",
    cancelled: "Cancelled", triage: "Triage",
    waiting: "Waiting", admitted: "Admitted",
  };
  return map[s?.toLowerCase()] || "Scheduled";
}

function mapLabStatus(s: string): LabRequest["status"] {
  const map: Record<string, LabRequest["status"]> = {
    ordered: "Ordered", collected: "Collected", received: "Received",
    "in-progress": "In progress", processing: "Processing",
    completed: "Completed", "critical review": "Critical review",
  };
  return map[s?.toLowerCase()] || "Ordered";
}

function mapInvoiceStatus(s: string): Invoice["status"] {
  const map: Record<string, Invoice["status"]> = {
    paid: "Paid", "partially-paid": "Partially Paid", unpaid: "Unpaid",
    insurance: "Insurance",
  };
  return map[s?.toLowerCase()] || "Unpaid";
}
