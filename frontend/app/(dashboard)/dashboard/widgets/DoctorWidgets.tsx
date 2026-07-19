"use client";
import { useAppointmentStore } from "@/lib/store";
import { useLabStore } from "@/lib/store";

export function DoctorWidgets() {
  const { appointments } = useAppointmentStore();
  const { requests: labs } = useLabStore();
  const today = new Date().toISOString().slice(0, 10);
  const todayAppts = appointments.filter(a => a.date === today);
  const pendingLabs = labs.filter(l => l.status === "Completed" && !l.flag?.toLowerCase().includes("normal"));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
      <WidgetCard title="Today's Patients" value={String(todayAppts.length)} sub="Scheduled today" color="#027c8e" />
      <WidgetCard title="In Progress" value={String(todayAppts.filter(a=>a.status==="In Progress").length)} sub="Currently consulting" color="#0f9f6e" />
      <WidgetCard title="Pending Results" value={String(pendingLabs.length)} sub="Awaiting review" color="#b7791f" />
      <WidgetCard title="Completed Today" value={String(todayAppts.filter(a=>a.status==="Completed").length)} sub="Consultations done" color="#5b5fc7" />
    </div>
  );
}

export function NurseWidgets() {
  const { appointments } = useAppointmentStore();
  const urgent = appointments.filter(a => a.priority === "Urgent" || a.priority === "Emergency");
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
      <WidgetCard title="Triage Queue" value={String(urgent.length)} sub="Urgent + Emergency" color="#c23b22" />
      <WidgetCard title="Patients in Ward" value="14" sub="Admitted" color="#027c8e" />
      <WidgetCard title="Medications Due" value="8" sub="Next 2 hours" color="#b7791f" />
      <WidgetCard title="Vitals Pending" value="5" sub="Not yet recorded" color="#5b5fc7" />
    </div>
  );
}

export function PharmacistWidgets() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
      <WidgetCard title="Pending Rx" value="12" sub="To dispense" color="#027c8e" />
      <WidgetCard title="Low Stock Items" value="3" sub="Below reorder level" color="#c23b22" />
      <WidgetCard title="Expiring Soon" value="2" sub="Within 30 days" color="#b7791f" />
      <WidgetCard title="Dispensed Today" value="47" sub="Prescriptions filled" color="#0f9f6e" />
    </div>
  );
}

export function LabWidgets() {
  const { requests } = useLabStore();
  const pending = requests.filter(r => ["ordered","collected","received","in-progress"].includes(r.status?.toLowerCase() ?? ""));
  const critical = requests.filter(r => r.flag?.toLowerCase().includes("critical"));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
      <WidgetCard title="Pending Tests" value={String(pending.length)} sub="Awaiting processing" color="#027c8e" />
      <WidgetCard title="Critical Results" value={String(critical.length)} sub="Require urgent review" color="#c23b22" />
      <WidgetCard title="Completed Today" value={String(requests.filter(r=>r.status==="Completed").length)} sub="Results released" color="#0f9f6e" />
      <WidgetCard title="Avg TAT" value="42 min" sub="Turnaround time" color="#5b5fc7" />
    </div>
  );
}

export function AccountantWidgets() {
  const { invoices } = require("@/lib/store").useBillingStore.getState();
  const unpaid = invoices?.filter((i: any) => i.status === "Unpaid") ?? [];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
      <WidgetCard title="Revenue Today" value="RWF 4.2M" sub="Collected" color="#0f9f6e" />
      <WidgetCard title="Unpaid Invoices" value={String(unpaid.length)} sub="Outstanding" color="#c23b22" />
      <WidgetCard title="Claims Pending" value="8" sub="Insurance claims" color="#b7791f" />
      <WidgetCard title="Claim Rate" value="91%" sub="Approval rate" color="#5b5fc7" />
    </div>
  );
}

export function ReceptionWidgets() {
  const { appointments } = useAppointmentStore();
  const today = new Date().toISOString().slice(0, 10);
  const checkedIn = appointments.filter(a => a.date === today && a.status === "Checked In");
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
      <WidgetCard title="Checked In" value={String(checkedIn.length)} sub="Today" color="#027c8e" />
      <WidgetCard title="Waiting" value={String(appointments.filter(a=>a.status==="Waiting").length)} sub="In queue" color="#b7791f" />
      <WidgetCard title="Appointments" value={String(appointments.filter(a=>a.date===today).length)} sub="Scheduled today" color="#5b5fc7" />
      <WidgetCard title="Walk-ins" value="7" sub="Today" color="#0f9f6e" />
    </div>
  );
}

export function DefaultWidgets() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
      <WidgetCard title="System Status" value="Online" sub="All services running" color="#0f9f6e" />
      <WidgetCard title="Active Users" value="24" sub="Currently logged in" color="#027c8e" />
    </div>
  );
}

function WidgetCard({ title, value, sub, color }: { title: string; value: string; sub: string; color: string }) {
  return (
    <div style={{ background: "white", borderRadius: 12, padding: "20px 24px", border: "1px solid var(--line, #e5e7eb)", borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{sub}</div>
    </div>
  );
}
