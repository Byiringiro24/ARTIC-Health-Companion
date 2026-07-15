"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { useToast } from "@/lib/store";
import { SectionHeader, DataTable } from "@/components/ui/shared";

export function NursingModule() {
  const { show } = useToast();
  const [triageForm, setTriageForm] = useState({ patient: "", level: "3", complaint: "", temp: "", bp: "", pulse: "" });
  const [handoverNotes, setHandoverNotes] = useState(
    "4 patients on ward. Patrick Mugenzi in ICU — hemoglobin low, transfusion in progress. Vitals stable on others. Medication rounds completed at 14:00."
  );

  function handleTriage(e: React.FormEvent) {
    e.preventDefault();
    show(`Triage Level ${triageForm.level} recorded for ${triageForm.patient || "patient"}`, "success");
    setTriageForm({ patient: "", level: "3", complaint: "", temp: "", bp: "", pulse: "" });
  }

  const marRows = [
    { patient: "Claudine Mutesi", drug: "Amlodipine 5mg", time: "08:00", status: "Administered" },
    { patient: "Esperance Kayitesi", drug: "Metformin 500mg", time: "08:30", status: "Due" },
    { patient: "Patrick Mugenzi", drug: "IV Normal Saline 0.9%", time: "09:00", status: "Running" },
    { patient: "Samuel Ndayisaba", drug: "Salbutamol Inhaler", time: "10:00", status: "Pending" },
  ];

  return (
    <div className="grid">
      <div className="grid cols-3">
        {/* Triage */}
        <section className="panel">
          <SectionHeader title="Triage Station" />
          <form onSubmit={handleTriage} style={{ display: "grid", gap: 10 }}>
            <label className="field">Patient (MRN / Name)<input value={triageForm.patient} onChange={(e) => setTriageForm({ ...triageForm, patient: e.target.value })} placeholder="Scan QR or type MRN" /></label>
            <label className="field">Triage Level
              <select value={triageForm.level} onChange={(e) => setTriageForm({ ...triageForm, level: e.target.value })}>
                {["1 — Immediate (Resuscitation)", "2 — Urgent (≤15 min)", "3 — Less Urgent (≤60 min)", "4 — Non-Urgent (≤2 hr)", "5 — Minor"].map((l) => (
                  <option key={l} value={l.charAt(0)}>{l}</option>
                ))}
              </select>
            </label>
            <label className="field">Chief Complaint<input value={triageForm.complaint} onChange={(e) => setTriageForm({ ...triageForm, complaint: e.target.value })} placeholder="Main complaint" /></label>
            <label className="field">Temperature (°C)<input value={triageForm.temp} onChange={(e) => setTriageForm({ ...triageForm, temp: e.target.value })} /></label>
            <label className="field">BP (mmHg)<input value={triageForm.bp} onChange={(e) => setTriageForm({ ...triageForm, bp: e.target.value })} placeholder="120/80" /></label>
            <label className="field">Pulse (bpm)<input value={triageForm.pulse} onChange={(e) => setTriageForm({ ...triageForm, pulse: e.target.value })} /></label>
            <button className="button" type="submit"><CheckCircle2 size={14} /> Complete triage</button>
          </form>
        </section>

        {/* MAR */}
        <section className="panel">
          <SectionHeader title="Medication Administration" badge="MAR" />
          <ul className="compact-list">
            {marRows.map(({ patient, drug, time, status }) => (
              <li key={patient + drug}>
                <div>
                  <strong style={{ fontSize: 13 }}>{drug}</strong>
                  <p className="muted" style={{ margin: "2px 0 0", fontSize: 12 }}>{patient} — {time}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                  <span className={`status${status === "Due" || status === "Pending" ? " warn" : ""}`}>{status}</span>
                  {(status === "Due" || status === "Pending") && (
                    <button type="button" className="button secondary" style={{ fontSize: 11, padding: "2px 8px", minHeight: 0 }} onClick={() => show(`${drug} administered`, "success")}>
                      Administer
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Shift Handover */}
        <section className="panel">
          <SectionHeader title="Shift Handover" />
          <div style={{ display: "grid", gap: 10 }}>
            <label className="field">Outgoing shift<input readOnly defaultValue="Day shift — Nurse Eric (07:00–15:00)" style={{ background: "#f7f9fb" }} /></label>
            <label className="field">Incoming shift<input readOnly defaultValue="Evening — Nurse Marie (15:00–23:00)" style={{ background: "#f7f9fb" }} /></label>
            <label className="field">Handover notes<textarea rows={5} value={handoverNotes} onChange={(e) => setHandoverNotes(e.target.value)} /></label>
            <button className="button" type="button" onClick={() => show("Shift handover submitted and signed", "success")}>
              <Send size={14} /> Submit handover
            </button>
          </div>
        </section>
      </div>

      <section className="panel">
        <SectionHeader title="Ward Patients — Vitals Due" />
        <DataTable
          headers={["Patient", "Bed", "BP", "Temp", "SpO₂", "Pulse", "Pain", "Last Recorded", "Due in"]}
          rows={[
            ["Patrick Mugenzi", "ICU-1A", "106/74", "37.2°C", "96%", "82", "3/10", "15:00", "Overdue"],
            ["Esperance Kayitesi", "MW-101A", "138/88", "36.8°C", "98%", "76", "2/10", "14:00", "30 min"],
            ["Samuel Ndayisaba", "PD-401A", "100/65", "37.6°C", "97%", "88", "4/10", "14:30", "1 hr"],
          ]}
          statusCol={8}
        />
      </section>
    </div>
  );
}
