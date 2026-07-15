"use client";

import { useState } from "react";
import { CheckCircle2, Plus, Printer, Save, Send, Trash2 } from "lucide-react";
import { usePatientStore, useLabStore, useToast } from "@/lib/store";
import { demoUsers, patientTimeline } from "@/lib/data";
import { SectionHeader, DataTable } from "@/components/ui/shared";
import type { AppUser } from "@/types/hms";

export function ConsultationModule({ user: _user }: { user: AppUser }) {
  const { patients } = usePatientStore();
  const { show } = useToast();

  const [tab, setTab] = useState<"soap" | "vitals" | "orders" | "rx" | "timeline">("soap");
  const [selectedPatient, setSelectedPatient] = useState(patients[0]);
  const [soap, setSoap] = useState({
    subjective: "Patient presents with fever, headache, and fatigue for 3 days.",
    objective: "Temp 38.5°C, BP 148/92 mmHg, Pulse 96 bpm, RR 18/min, SpO₂ 98%. Alert, febrile.",
    assessment: "B54 — Malaria, unspecified",
    plan: "Start antimalarial therapy (ACT). Continue antihypertensives. Follow-up in 7 days.",
  });
  const [vitals, setVitals] = useState({
    temp: "38.5", sbp: "148", dbp: "92", hr: "96",
    rr: "18", spo2: "98", weight: "68", glucose: "—", pain: "4",
  });
  const [rxList, setRxList] = useState([
    { drug: "Artemether-Lumefantrine 80/480mg", dose: "4 tabs", route: "Oral", freq: "BID", duration: "3 days", qty: "24 tabs", notes: "Take with food" },
  ]);
  const [rxForm, setRxForm] = useState({ drug: "", dose: "", route: "Oral", freq: "BID", duration: "5 days", qty: "10", notes: "" });
  const [orderTest, setOrderTest] = useState("Full Blood Count");
  const [orderUrgency, setOrderUrgency] = useState("Routine");
  const [orderIndication, setOrderIndication] = useState("");

  const bmi =
    vitals.weight && vitals.weight !== "—"
      ? (parseFloat(vitals.weight) / 1.68 ** 2).toFixed(1)
      : "—";

  const TABS: { key: typeof tab; label: string }[] = [
    { key: "soap", label: "SOAP Note" },
    { key: "vitals", label: "Vital Signs" },
    { key: "orders", label: "Orders" },
    { key: "rx", label: "Prescriptions" },
    { key: "timeline", label: "Timeline" },
  ];

  function addRx(e: React.FormEvent) {
    e.preventDefault();
    if (!rxForm.drug) { show("Drug name is required", "error"); return; }
    setRxList((prev) => [...prev, { ...rxForm, qty: `${rxForm.qty} units` }]);
    setRxForm({ drug: "", dose: "", route: "Oral", freq: "BID", duration: "5 days", qty: "10", notes: "" });
    show("Prescription item added", "success");
  }

  return (
    <div className="grid cols-2">
      {/* Left — Workspace */}
      <div className="grid">
        <section className="panel">
          {/* Patient selector + allergy banner */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <label className="field" style={{ margin: 0, flex: 1 }}>
              <span style={{ fontSize: 12, color: "#60717c" }}>Active patient</span>
              <select
                value={selectedPatient?.id ?? ""}
                onChange={(e) => {
                  const p = patients.find((pt) => pt.id === e.target.value);
                  if (p) setSelectedPatient(p);
                }}
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.mrn}
                  </option>
                ))}
              </select>
            </label>
            {selectedPatient?.allergies.length > 0 && (
              <span className="status danger" style={{ whiteSpace: "nowrap" }}>
                ⚠ {selectedPatient.allergies.join(", ")}
              </span>
            )}
          </div>

          {/* Tab bar */}
          <div className="actions-row" style={{ marginBottom: 16, flexWrap: "wrap" }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`button${tab === t.key ? "" : " secondary"}`}
                type="button"
                style={{ fontSize: 13 }}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* SOAP */}
          {tab === "soap" && (
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ background: "#fff7e6", border: "1px solid #b7791f44", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
                ⚠ <strong>CDS Alert:</strong> Patient has Penicillin allergy — avoid all beta-lactam antibiotics.
              </div>
              <div className="form-grid">
                <label className="field" style={{ gridColumn: "1/-1" }}>
                  Subjective — Chief Complaint & History
                  <textarea rows={3} value={soap.subjective} onChange={(e) => setSoap({ ...soap, subjective: e.target.value })} />
                </label>
                <label className="field" style={{ gridColumn: "1/-1" }}>
                  Objective — Examination Findings
                  <textarea rows={3} value={soap.objective} onChange={(e) => setSoap({ ...soap, objective: e.target.value })} />
                </label>
                <label className="field" style={{ gridColumn: "1/-1" }}>
                  Assessment — ICD-10/11 Diagnosis
                  <select value={soap.assessment} onChange={(e) => setSoap({ ...soap, assessment: e.target.value })}>
                    {[
                      "B54 — Malaria, unspecified", "I10 — Essential hypertension", "E11 — Type 2 diabetes mellitus",
                      "J06 — Acute upper respiratory infection", "A09 — Acute diarrhoea", "N18 — Chronic kidney disease",
                    ].map((d) => (<option key={d}>{d}</option>))}
                  </select>
                </label>
                <label className="field" style={{ gridColumn: "1/-1" }}>
                  Plan — Treatment & Follow-up
                  <textarea rows={3} value={soap.plan} onChange={(e) => setSoap({ ...soap, plan: e.target.value })} />
                </label>
              </div>
              <div className="actions-row">
                <button className="button" type="button" onClick={() => show("SOAP note signed and saved to EMR", "success")}>
                  <CheckCircle2 size={14} /> Sign & save note
                </button>
                <button className="button secondary" type="button"><Printer size={14} /> Print summary</button>
              </div>
            </div>
          )}

          {/* Vitals */}
          {tab === "vitals" && (
            <div>
              <div className="form-grid">
                {[
                  { label: "Temperature (°C)", key: "temp", ref: "36.5–37.5" },
                  { label: "Systolic BP (mmHg)", key: "sbp", ref: "90–140" },
                  { label: "Diastolic BP (mmHg)", key: "dbp", ref: "60–90" },
                  { label: "Heart Rate (bpm)", key: "hr", ref: "60–100" },
                  { label: "Respiratory Rate (/min)", key: "rr", ref: "12–20" },
                  { label: "SpO₂ (%)", key: "spo2", ref: "≥95%" },
                  { label: "Weight (kg)", key: "weight", ref: "—" },
                  { label: "Blood Glucose (mmol/L)", key: "glucose", ref: "3.9–7.8" },
                  { label: "Pain Score (0–10)", key: "pain", ref: "0 = no pain" },
                ].map(({ label, key, ref }) => (
                  <label key={key} className="field">
                    {label} <span className="muted" style={{ fontWeight: 400, fontSize: 11 }}>({ref})</span>
                    <input
                      value={(vitals as Record<string, string>)[key]}
                      onChange={(e) => setVitals({ ...vitals, [key]: e.target.value })}
                    />
                  </label>
                ))}
                <label className="field">
                  BMI (auto-calculated)
                  <input readOnly value={bmi} style={{ background: "#f7f9fb" }} />
                </label>
              </div>
              {parseFloat(vitals.temp) > 37.5 && (
                <div style={{ background: "#fff0ed", border: "1px solid #c23b2244", borderRadius: 8, padding: "8px 12px", fontSize: 13, marginTop: 10 }}>
                  🌡️ Temperature {vitals.temp}°C — <strong>Fever detected</strong>
                </div>
              )}
              {parseInt(vitals.sbp) > 140 && (
                <div style={{ background: "#fff7e6", border: "1px solid #b7791f44", borderRadius: 8, padding: "8px 12px", fontSize: 13, marginTop: 8 }}>
                  ❤️ BP {vitals.sbp}/{vitals.dbp} mmHg — <strong>Hypertension range</strong>
                </div>
              )}
              <button className="button" type="button" onClick={() => show("Vitals recorded in EMR", "success")} style={{ marginTop: 12 }}>
                <Save size={14} /> Record vitals
              </button>
            </div>
          )}

          {/* Orders */}
          {tab === "orders" && (
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ padding: 14, background: "#f7f9fb", borderRadius: 8, border: "1px solid var(--line)" }}>
                <strong style={{ fontSize: 14 }}>Laboratory Order</strong>
                <div className="form-grid" style={{ marginTop: 10 }}>
                  <label className="field">
                    Test Panel
                    <select value={orderTest} onChange={(e) => setOrderTest(e.target.value)}>
                      {["Full Blood Count", "Malaria RDT", "HbA1c", "Renal Function", "Liver Function", "HIV Screen", "COVID-19 PCR", "Urinalysis"].map(
                        (t) => <option key={t}>{t}</option>
                      )}
                    </select>
                  </label>
                  <label className="field">
                    Urgency
                    <select value={orderUrgency} onChange={(e) => setOrderUrgency(e.target.value)}>
                      <option>Routine</option><option>Urgent</option><option>Stat</option>
                    </select>
                  </label>
                  <label className="field" style={{ gridColumn: "1/-1" }}>
                    Clinical Indication
                    <input value={orderIndication} onChange={(e) => setOrderIndication(e.target.value)} placeholder="e.g. Fever — query malaria" />
                  </label>
                </div>
                <button className="button" type="button" onClick={() => show(`Lab order for "${orderTest}" sent to Laboratory`, "success")} style={{ marginTop: 10 }}>
                  <Send size={14} /> Send to Laboratory
                </button>
              </div>
              <div style={{ padding: 14, background: "#f7f9fb", borderRadius: 8, border: "1px solid var(--line)" }}>
                <strong style={{ fontSize: 14 }}>Imaging Order</strong>
                <div className="form-grid" style={{ marginTop: 10 }}>
                  <label className="field">Modality <select><option>Chest X-Ray</option><option>Abdominal Ultrasound</option><option>ECG</option><option>Head CT</option><option>MRI Brain</option></select></label>
                  <label className="field">Urgency <select><option>Routine</option><option>Urgent</option><option>Emergency</option></select></label>
                  <label className="field" style={{ gridColumn: "1/-1" }}>Indication <input placeholder="Clinical indication for imaging" /></label>
                </div>
                <button className="button" type="button" onClick={() => show("Imaging order sent to Radiology", "success")} style={{ marginTop: 10 }}>
                  <Send size={14} /> Send to Radiology
                </button>
              </div>
            </div>
          )}

          {/* Rx */}
          {tab === "rx" && (
            <div style={{ display: "grid", gap: 12 }}>
              {rxList.map((rx, i) => (
                <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 8, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <strong style={{ fontSize: 14 }}>{rx.drug}</strong>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "#60717c" }}>{rx.dose} · {rx.route} · {rx.freq} × {rx.duration} · Qty: {rx.qty}</p>
                    {rx.notes && <p style={{ margin: "2px 0 0", fontSize: 12, color: "#b7791f" }}>{rx.notes}</p>}
                  </div>
                  <button type="button" style={{ border: "none", background: "none", cursor: "pointer", color: "#c23b22" }} onClick={() => { setRxList((r) => r.filter((_, j) => j !== i)); show("Item removed", "info"); }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <form onSubmit={addRx} style={{ padding: 14, background: "#f7f9fb", borderRadius: 8, border: "1px solid var(--line)" }}>
                <strong style={{ fontSize: 14 }}>Add Prescription Item</strong>
                <div className="form-grid" style={{ marginTop: 10 }}>
                  <label className="field" style={{ gridColumn: "1/-1" }}>Drug (generic name) * <input required value={rxForm.drug} onChange={(e) => setRxForm({ ...rxForm, drug: e.target.value })} placeholder="e.g. Amoxicillin 500mg" /></label>
                  <label className="field">Dose <input value={rxForm.dose} onChange={(e) => setRxForm({ ...rxForm, dose: e.target.value })} placeholder="e.g. 1 cap" /></label>
                  <label className="field">Route <select value={rxForm.route} onChange={(e) => setRxForm({ ...rxForm, route: e.target.value })}>{["Oral", "IV", "IM", "SC", "Topical", "Inhaled"].map((r) => <option key={r}>{r}</option>)}</select></label>
                  <label className="field">Frequency <select value={rxForm.freq} onChange={(e) => setRxForm({ ...rxForm, freq: e.target.value })}>{["OD", "BID", "TID", "QID", "PRN", "Stat", "Weekly"].map((f) => <option key={f}>{f}</option>)}</select></label>
                  <label className="field">Duration <input value={rxForm.duration} onChange={(e) => setRxForm({ ...rxForm, duration: e.target.value })} placeholder="e.g. 5 days" /></label>
                  <label className="field">Quantity <input value={rxForm.qty} onChange={(e) => setRxForm({ ...rxForm, qty: e.target.value })} placeholder="e.g. 10" /></label>
                  <label className="field" style={{ gridColumn: "1/-1" }}>Instructions <input value={rxForm.notes} onChange={(e) => setRxForm({ ...rxForm, notes: e.target.value })} placeholder="e.g. Take with food" /></label>
                </div>
                <div className="actions-row" style={{ marginTop: 10 }}>
                  <button className="button secondary" type="submit"><Plus size={14} /> Add item</button>
                  {rxList.length > 0 && (
                    <button className="button" type="button" onClick={() => show(`${rxList.length} item(s) sent to Pharmacy`, "success")}>
                      <Send size={14} /> Send {rxList.length} item(s) to Pharmacy
                    </button>
                  )}
                  <button className="button secondary" type="button"><Printer size={14} /> Print</button>
                </div>
              </form>
            </div>
          )}

          {/* Timeline */}
          {tab === "timeline" && (
            <ul className="compact-list">
              {patientTimeline.map((item) => (
                <li key={item}><span style={{ fontSize: 13 }}>{item}</span><CheckCircle2 color="#0f9f6e" size={16} /></li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Right — CDS sidebar */}
      <div className="grid">
        <section className="panel">
          <SectionHeader title="Clinical Decision Support" />
          <ul className="compact-list">
            {[
              { alert: "⚠ Penicillin allergy on record — avoid beta-lactams", tone: "danger" },
              { alert: "📊 BP 148/92 — hypertension range, review antihypertensives", tone: "warn" },
              { alert: "🌡️ Temp 38.5°C — elevated, investigate cause", tone: "warn" },
              { alert: "💊 ACT is recommended first-line for uncomplicated malaria", tone: "" },
              { alert: "🔬 Malaria RDT + CBC recommended as first-line investigations", tone: "" },
              { alert: "📅 Follow-up in 48h if fever persists", tone: "" },
            ].map(({ alert, tone }) => (
              <li key={alert}>
                <span style={{ fontSize: 13 }}>{alert}</span>
                {tone && <span className={`status ${tone}`}>{tone === "danger" ? "Alert" : "Warning"}</span>}
              </li>
            ))}
          </ul>
        </section>
        {selectedPatient && (
          <section className="panel">
            <SectionHeader title="Patient Summary" badge={selectedPatient.mrn} />
            <ul className="compact-list">
              <li><span>Blood Group</span><strong style={{ color: "#c23b22" }}>{selectedPatient.bloodGroup}</strong></li>
              <li><span>Insurance</span><span className="status">{selectedPatient.insurance}</span></li>
              <li><span>Allergies</span><strong>{selectedPatient.allergies.join(", ") || "None"}</strong></li>
              <li><span>Conditions</span><strong style={{ fontSize: 12 }}>{selectedPatient.chronicConditions.join(", ") || "None"}</strong></li>
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
