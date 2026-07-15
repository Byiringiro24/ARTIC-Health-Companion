"use client";

import { Download, Plus, Send, Smartphone, Video } from "lucide-react";
import { usePatientStore, useAppointmentStore, useLabStore, useBillingStore, useToast } from "@/lib/store";
import { SectionHeader } from "@/components/ui/shared";
import type { AppUser } from "@/types/hms";

export function PatientPortal({ user }: { user: AppUser }) {
  const { patients } = usePatientStore();
  const { invoices } = useBillingStore();
  const { requests } = useLabStore();
  const { appointments } = useAppointmentStore();
  const { show } = useToast();

  const patient = patients.find((p) => p.id === user.patientId) ?? patients[0];
  const myAppts = appointments.filter((a) => a.patientId === patient.id);
  const myLabs = requests.filter((l) => l.patientId === patient.id);
  const myInvoices = invoices.filter((i) => i.patientId === patient.id);

  return (
    <div className="grid">
      {/* Hero banner */}
      <div style={{ background: "linear-gradient(135deg, #027c8e, #0f9f6e)", borderRadius: 12, padding: "24px 28px", color: "white" }}>
        <h2 style={{ margin: 0 }}>Welcome, {patient.name}</h2>
        <p style={{ margin: "6px 0 0", opacity: 0.9, fontSize: 14 }}>
          {patient.mrn} · {patient.insurance} — {patient.insuranceNumber} · Blood group <strong>{patient.bloodGroup}</strong>
        </p>
        {patient.allergies.length > 0 && (
          <p style={{ margin: "6px 0 0", fontSize: 13, opacity: 0.9 }}>⚠ Allergies: {patient.allergies.join(", ")}</p>
        )}
      </div>

      <div className="grid cols-3">
        {/* Appointments */}
        <section className="panel">
          <SectionHeader title="My Appointments"
            action={<button className="button secondary" type="button" onClick={() => show("Appointment booking opened", "info")}><Plus size={14} /> Book</button>} />
          {myAppts.length === 0
            ? <p className="muted">No appointments on record.</p>
            : (
              <ul className="compact-list">
                {myAppts.map((a) => (
                  <li key={a.id}>
                    <div>
                      <strong style={{ fontSize: 13 }}>{a.type}</strong>
                      <p className="muted" style={{ margin: "2px 0 0", fontSize: 12 }}>{a.date} {a.time} — {a.clinician}</p>
                    </div>
                    <span className="status">{a.status}</span>
                  </li>
                ))}
              </ul>
            )}
        </section>

        {/* Lab Results */}
        <section className="panel">
          <SectionHeader title="Lab Results" />
          {myLabs.length === 0
            ? <p className="muted">No lab results on record.</p>
            : (
              <ul className="compact-list">
                {myLabs.map((l) => (
                  <li key={l.id}>
                    <div>
                      <strong style={{ fontSize: 13 }}>{l.test}</strong>
                      <p className="muted" style={{ margin: "2px 0 0", fontSize: 12 }}>
                        {l.result ? `${l.result} ${l.unit}` : l.status}
                      </p>
                    </div>
                    <span className={`status${l.flag?.toLowerCase().includes("critical") ? " danger" : l.flag === "High" || l.flag === "Low" ? " warn" : ""}`}>
                      {l.flag ?? l.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
        </section>

        {/* Bills */}
        <section className="panel">
          <SectionHeader title="My Bills" />
          {myInvoices.length === 0
            ? <p className="muted">No invoices on record.</p>
            : (
              <ul className="compact-list">
                {myInvoices.map((i) => (
                  <li key={i.number}>
                    <div>
                      <strong style={{ fontSize: 13 }}>{i.number}</strong>
                      <p className="muted" style={{ margin: "2px 0 0", fontSize: 12 }}>RWF {i.amount.toLocaleString()} — {i.date}</p>
                    </div>
                    <span className={`status${i.status === "Unpaid" ? " danger" : i.status === "Partially Paid" ? " warn" : ""}`}>{i.status}</span>
                  </li>
                ))}
              </ul>
            )}
          <button className="button secondary" type="button" style={{ marginTop: 14, width: "100%" }}
            onClick={() => show("Mobile money payment initiated", "info")}>
            <Smartphone size={14} /> Pay via Mobile Money
          </button>
        </section>
      </div>

      <div className="grid cols-2">
        {/* Quick actions */}
        <section className="panel">
          <SectionHeader title="Quick Actions" />
          <div style={{ display: "grid", gap: 10 }}>
            {[
              { label: "Book appointment", icon: <Plus size={15} />, action: () => show("Appointment booking opened", "info") },
              { label: "Download lab results", icon: <Download size={15} />, action: () => show("Results downloaded", "success") },
              { label: "Video consultation", icon: <Video size={15} />, action: () => show("Telemedicine session initiated", "info") },
              { label: "Message my doctor", icon: <Send size={15} />, action: () => show("Secure message opened", "info") },
            ].map(({ label, icon, action }) => (
              <button key={label} className="button secondary" type="button" onClick={action} style={{ justifyContent: "flex-start", gap: 10 }}>
                {icon} {label}
              </button>
            ))}
          </div>
        </section>

        {/* Health summary */}
        <section className="panel">
          <SectionHeader title="Health Summary" />
          <ul className="compact-list">
            <li><span>Blood Group</span><strong style={{ color: "#c23b22" }}>{patient.bloodGroup}</strong></li>
            <li><span>Insurance</span><span className="status">{patient.insurance}</span></li>
            <li><span>Allergies</span><strong>{patient.allergies.join(", ") || "None known"}</strong></li>
            <li><span>Chronic Conditions</span><strong style={{ fontSize: 12 }}>{patient.chronicConditions.join(", ") || "None"}</strong></li>
            <li><span>Current Medications</span><strong style={{ fontSize: 12 }}>{patient.currentMedications.join("; ") || "None recorded"}</strong></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
