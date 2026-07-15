"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, Printer, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useLabStore, useToast } from "@/lib/store";
import { Modal } from "@/components/ui/Modal";
import { SectionHeader, DataTable, StatCard } from "@/components/ui/shared";
import type { LabRequest } from "@/types/hms";

export function LaboratoryModule() {
  const { requests, updateStatus } = useLabStore();
  const { show } = useToast();
  const [resultModal, setResultModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState<LabRequest | null>(null);
  const [resultForm, setResultForm] = useState({ value: "", unit: "", refRange: "", flag: "Normal" });

  const stats = {
    ordered: requests.filter((r) => r.status === "Ordered").length,
    inProgress: requests.filter((r) => r.status === "In progress").length,
    critical: requests.filter((r) => r.flag?.toLowerCase().includes("critical")).length,
    completed: requests.filter((r) => r.status === "Completed").length,
  };

  function handleResult(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedReq) return;
    updateStatus(selectedReq.id, "Completed", `${resultForm.value} ${resultForm.unit}`, resultForm.flag);
    if (resultForm.flag.includes("CRITICAL")) {
      show(`⚠ CRITICAL result for ${selectedReq.patient} — Notifying doctor`, "error");
    } else {
      show(`Result entered for ${selectedReq.patient} — ${selectedReq.test}`, "success");
    }
    setResultModal(false);
    setSelectedReq(null);
    setResultForm({ value: "", unit: "", refRange: "", flag: "Normal" });
  }

  const tatData = [
    { test: "CBC", avg: 18, target: 60 },
    { test: "Malaria", avg: 9, target: 30 },
    { test: "HbA1c", avg: 42, target: 120 },
    { test: "HIV", avg: 22, target: 60 },
  ];

  return (
    <div className="grid">
      <div className="grid cols-4">
        <StatCard label="Pending Orders" value={String(stats.ordered)} tone="warn" icon={<Clock size={22} color="#b7791f" />} />
        <StatCard label="In Progress" value={String(stats.inProgress)} tone="good" icon={<RefreshCw size={22} color="#027c8e" />} />
        <StatCard label="Critical Alerts" value={String(stats.critical)} tone="danger" icon={<AlertTriangle size={22} color="#c23b22" />} />
        <StatCard label="Completed Today" value={String(stats.completed)} tone="good" icon={<CheckCircle2 size={22} color="#0f9f6e" />} />
      </div>

      <section className="panel">
        <SectionHeader title="Specimen Workflow"
          action={<button className="button secondary" type="button" onClick={() => show("Collection manifest printed", "info")}><Printer size={14} /> Print manifest</button>} />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>{["ID", "Patient", "Test", "Panel", "Barcode", "Urgency", "Status", "Result", "Flag", ""].map((h) => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontSize: 12 }}>{r.id}</td>
                  <td><strong>{r.patient}</strong></td>
                  <td>{r.test}</td>
                  <td style={{ fontSize: 12 }}>{r.testPanel}</td>
                  <td><code style={{ fontSize: 11 }}>{r.barcode ?? r.sample}</code></td>
                  <td><span className={`status${r.urgency === "Stat" ? " danger" : r.urgency === "Urgent" ? " warn" : ""}`}>{r.urgency}</span></td>
                  <td><span className={`status${r.status === "Critical review" ? " danger" : r.status === "In progress" || r.status === "Ordered" ? " warn" : ""}`}>{r.status}</span></td>
                  <td style={{ fontSize: 13 }}>{r.result ? `${r.result} ${r.unit ?? ""}` : "—"}</td>
                  <td>{r.flag ? <span className={`status${r.flag.toLowerCase().includes("critical") ? " danger" : r.flag === "High" || r.flag === "Low" ? " warn" : ""}`}>{r.flag}</span> : <span className="status">Normal</span>}</td>
                  <td>
                    {r.status !== "Completed" ? (
                      <button type="button" className="button secondary" style={{ fontSize: 12, padding: "4px 10px", minHeight: 0 }} onClick={() => { setSelectedReq(r); setResultModal(true); }}>
                        Enter result
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: "#0f9f6e" }}>Released ✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid cols-2">
        <section className="panel">
          <SectionHeader title="Quality Control" />
          <ul className="compact-list">
            {[["Hematology analyser — QC", "Pass"], ["Biochemistry analyser — QC", "Pass"], ["Malaria RDT lot — QC", "Pass"], ["HIV kit — External QC", "Pending"], ["CBC analyser — Calibration", "Due in 3 days"]].map(([item, status]) => (
              <li key={item}><span style={{ fontSize: 13 }}>{item}</span><span className={`status${status === "Pending" || status.includes("Due") ? " warn" : ""}`}>{status}</span></li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <SectionHeader title="Turnaround Time (TAT)" badge="Today" />
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={tatData}>
              <XAxis dataKey="test" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="avg" fill="#027c8e" name="Actual (min)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" fill="#dce5ea" name="Target (min)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>

      <Modal
        open={resultModal}
        onClose={() => { setResultModal(false); setSelectedReq(null); }}
        title={`Enter Result — ${selectedReq?.test ?? ""}`}
        footer={<div className="actions-row"><button className="button" type="submit" form="result-form"><CheckCircle2 size={14} /> Submit result</button><button className="button secondary" type="button" onClick={() => { setResultModal(false); setSelectedReq(null); }}>Cancel</button></div>}
      >
        {selectedReq && (
          <form id="result-form" onSubmit={handleResult} style={{ display: "grid", gap: 12 }}>
            <div style={{ background: "#f7f9fb", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
              <strong>{selectedReq.patient}</strong> — {selectedReq.test} · Barcode: {selectedReq.barcode}
            </div>
            <label className="field">Result Value * <input required value={resultForm.value} onChange={(e) => setResultForm({ ...resultForm, value: e.target.value })} placeholder="e.g. 7.2" /></label>
            <label className="field">Unit <input value={resultForm.unit} onChange={(e) => setResultForm({ ...resultForm, unit: e.target.value })} placeholder="e.g. g/dL" /></label>
            <label className="field">Reference Range <input value={resultForm.refRange} onChange={(e) => setResultForm({ ...resultForm, refRange: e.target.value })} placeholder="e.g. 12–16 g/dL" /></label>
            <label className="field">Flag
              <select value={resultForm.flag} onChange={(e) => setResultForm({ ...resultForm, flag: e.target.value })}>
                {["Normal", "Low", "High", "CRITICAL LOW", "CRITICAL HIGH", "Positive", "Negative", "Abnormal"].map((f) => <option key={f}>{f}</option>)}
              </select>
            </label>
            {resultForm.flag.includes("CRITICAL") && (
              <div style={{ background: "#fff0ed", border: "1px solid #c23b2244", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
                ⚠ Critical value — doctor will be notified immediately.
              </div>
            )}
          </form>
        )}
      </Modal>
    </div>
  );
}
