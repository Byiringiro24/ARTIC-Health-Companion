"use client";

import { create } from "zustand";
import type { Patient, Appointment, InventoryItem, LabRequest, Invoice } from "@/types/hms";
import { patients as defaultPatients, appointments as defaultAppointments, inventory as defaultInventory, labRequests as defaultLabRequests, invoices as defaultInvoices } from "@/lib/data";

// ─── Toast ────────────────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "warning" | "info";
interface Toast { id: string; type: ToastType; message: string; }
interface ToastStore { toasts: Toast[]; show: (message: string, type?: ToastType) => void; dismiss: (id: string) => void; }

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  show(message: string, type: ToastType = "info") {
    const id = Math.random().toString(36).slice(2);
    set((s: ToastStore) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => set((s: ToastStore) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000);
  },
  dismiss(id: string) { set((s: ToastStore) => ({ toasts: s.toasts.filter((t: Toast) => t.id !== id) })); },
}));

// ─── Patient ──────────────────────────────────────────────────────────────────
interface PatientStore { patients: Patient[]; selected: Patient | null; query: string; setQuery: (q: string) => void; select: (p: Patient | null) => void; add: (p: Patient) => void; update: (id: string, data: Partial<Patient>) => void; }
export const usePatientStore = create<PatientStore>((set) => ({
  patients: defaultPatients, selected: null, query: "",
  setQuery: (query: string) => set({ query }),
  select: (selected: Patient | null) => set({ selected }),
  add: (p: Patient) => set((s: PatientStore) => ({ patients: [p, ...s.patients] })),
  update: (id: string, data: Partial<Patient>) => set((s: PatientStore) => ({ patients: s.patients.map((p: Patient) => p.id === id ? { ...p, ...data } : p) })),
}));

// ─── Appointment ──────────────────────────────────────────────────────────────
interface AppointmentStore { appointments: Appointment[]; add: (a: Appointment) => void; updateStatus: (id: string, status: Appointment["status"]) => void; }
export const useAppointmentStore = create<AppointmentStore>((set) => ({
  appointments: defaultAppointments,
  add: (a: Appointment) => set((s: AppointmentStore) => ({ appointments: [a, ...s.appointments] })),
  updateStatus: (id: string, status: Appointment["status"]) => set((s: AppointmentStore) => ({ appointments: s.appointments.map((a: Appointment) => a.id === id ? { ...a, status } : a) })),
}));

// ─── Inventory ────────────────────────────────────────────────────────────────
interface InventoryStore { items: InventoryItem[]; add: (item: InventoryItem) => void; updateQty: (id: string, qty: number) => void; }
export const useInventoryStore = create<InventoryStore>((set) => ({
  items: defaultInventory,
  add: (item: InventoryItem) => set((s: InventoryStore) => ({ items: [item, ...s.items] })),
  updateQty: (id: string, qty: number) => set((s: InventoryStore) => ({ items: s.items.map((i: InventoryItem) => i.id === id ? { ...i, quantity: qty } : i) })),
}));

// ─── Lab ──────────────────────────────────────────────────────────────────────
interface LabStore { requests: LabRequest[]; add: (r: LabRequest) => void; updateStatus: (id: string, status: LabRequest["status"], result?: string, flag?: string) => void; }
export const useLabStore = create<LabStore>((set) => ({
  requests: defaultLabRequests,
  add: (r: LabRequest) => set((s: LabStore) => ({ requests: [r, ...s.requests] })),
  updateStatus: (id: string, status: LabRequest["status"], result?: string, flag?: string) => set((s: LabStore) => ({
    requests: s.requests.map((r: LabRequest) => r.id === id ? { ...r, status, ...(result !== undefined ? { result } : {}), ...(flag !== undefined ? { flag } : {}) } : r),
  })),
}));

// ─── Billing ──────────────────────────────────────────────────────────────────
interface BillingStore { invoices: Invoice[]; add: (inv: Invoice) => void; recordPayment: (number: string, amount: number, method: string) => void; }
export const useBillingStore = create<BillingStore>((set) => ({
  invoices: defaultInvoices,
  add: (inv: Invoice) => set((s: BillingStore) => ({ invoices: [inv, ...s.invoices] })),
  recordPayment: (number: string, amount: number, method: string) => set((s: BillingStore) => ({
    invoices: s.invoices.map((i: Invoice) => {
      if (i.number !== number) return i;
      const paid = i.paid + amount;
      return { ...i, paid, paymentMethod: method as Invoice["paymentMethod"], status: (paid >= i.amount ? "Paid" : "Partially Paid") as Invoice["status"] };
    }),
  })),
}));
