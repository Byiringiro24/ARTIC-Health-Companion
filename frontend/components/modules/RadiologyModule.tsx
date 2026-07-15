"use client";

import { useState } from "react";
import { CheckCircle2, Plus } from "lucide-react";
import { useToast } from "@/lib/store";
import { Modal } from "@/components/ui/Modal";
import { SectionHeader, DataTable } from "@/components/ui/shared";

type Order = { id: string; patient: string; modality: string; bodyPart: string; indication: string; urgency: string; status: string; report: string; };

const initialOrders: Order[] = [
  { id: "RAD-0501", patient: "Patrick Mugenzi", modality: "X-Ray", bodyPart: "Chest", indication: "Trauma — rib assessment", urgency: "Urgent", status: "In progress", report: "Pending" },
  { id: "RAD-0502", patient: "Esperance Kayitesi", modality: "Ultrasound", bodyPart: "Abdomen", indication: "Abdominal pain", urgency: "Routine", status: "Completed", report: "Signed" },
  { id: "RAD-0503", patient: "Claudine Mutesi", modality: "ECG", bodyPart: "Cardiac", indication: "Hypertension follow-up", urgency: "Routine", status: "Completed", report: "Available" },
  { id: "RAD-0504", patient: "Vestine Uwimana", modality: "Ultrasound", bodyPart: "Obstetric", indication: "ANC 28-week scan", urgency: "Routine", status: "Scheduled", report: "Pending" },
];

export function RadiologyModule() {
  const { show } = useToast();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [orderModal, setOrderModal] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [findings, setFindings] = useState("");
  const [impression, setImpression] = useState("");
  const [form, setForm] = useState({ patient: "", modality: "X-Ray", bodyPart: "", indication: "", urgency: "Routine", contrast: "No" });

  function handleOrder(e: React.FormEvent) {
    e.preventDefault();
    setOrders((o) => [...o, { id: `RAD-${Date.now()}`, patient: form.patient, modality: form.modality, bodyPart: form.bodyPart, indication: form.indication, urgency: form.urgency, status: "Scheduled", report: "Pending" }]);
    show(`Imaging order for ${form.patient} scheduled`, "success");
    setOrderModal(false);
    setForm({ patient: "", modality: "X-Ray", bodyPart: "", indication: "", urgency: "Routine", contrast: "No" });
  }

  function signReport() {
    if (!activeOrder) { show("Select an order first", "error"); return; }
    setOrders((o) => o.map((ord) => ord.id === activeOrder.id ? { ...ord, report: "Signed", status: "Completed" } : ord));
    show("Radiology report signed and released", "success");
    setFindings(""); setImpression(""); setActiveOrder(null);
  }

  return (
    <div className="grid">
      <section className="panel">
        <SectionHeader title="Imaging Orders" badge={`${orders.length} orders`}
          action={<button className="button" type="button" onClick={() => setOrderModal(true)}><Plus size={14} /> Schedule imaging</button>} />
        <DataTable
          headers={["Order ID", "Patient", "Modality", "Body Part", "Indication", "Urgency", "Status", "Report"]}
          rows={orders.map((o) => [o.id, o.patient, o.modality, o.bodyPart, o.indication, o.urgency, o.status, o.report])}
          statusCol={6}
        />
      </section>

      <div className="grid cols-2">
        <section className="panel">
          <SectionHeader title="Write Radiology Report" />
          <div style={{ display: "grid", gap: 10 }}>
            <label className="field">Select order
              <select onChange={(e) => { const o = orders.find((ord) => ord.id === e.target.value); setActiveOrder(o ?? null); }}>
                <option value="">— Select order —</option>
                {orders.filter((o) => o.report !== "Signed").map((o) => <option key={o.id} value={o.id}>{o.id} — {o.patient} ({o.modality})</option>)}
              </select>
            </label>
            <label className="field">Findings<textarea rows={4} value={findings} onChange={(e) => setFindings(e.target.value)} placeholder="Systematic review of findings…" /></label>
            <label className="field">Impression / Conclusion<textarea rows={2} value={impression} onChange={(e) => setImpression(e.target.value)} placeholder="Diagnosis and recommendations…" /></label>
            <button className="button" type="button" onClick={signReport}><CheckCircle2 size={14} /> Sign report</button>
          </div>
        </section>
        <section className="panel">
          <SectionHeader title="DICOM / PACS Status" />
          <ul className="compact-list">
            {[["PACS Server", "Connected"], ["DICOM Worklist", "12 studies"], ["Image Viewer", "Available"], ["3D Reconstruction", "Module ready"], ["Archive (30-day retention)", "Enabled"]].map(([k, v]) => (
              <li key={k}><span style={{ fontSize: 13 }}>{k}</span><span className="status">{v}</span></li>
            ))}
          </ul>
        </section>
      </div>

      <Modal open={orderModal} onClose={() => setOrderModal(false)} title="Schedule Imaging Order"
        footer={<div className="actions-row"><button className="button" type="submit" form="rad-form"><CheckCircle2 size={14} /> Create order</button><button className="button secondary" type="button" onClick={() => setOrderModal(false)}>Cancel</button></div>}>
        <form id="rad-form" onSubmit={handleOrder} className="form-grid">
          <label className="field" style={{ gridColumn: "1/-1" }}>Patient * <input required value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} placeholder="Patient name or MRN" /></label>
          <label className="field">Modality * <select required value={form.modality} onChange={(e) => setForm({ ...form, modality: e.target.value })}>{["X-Ray", "Ultrasound", "CT Scan", "MRI", "ECG", "Mammography", "DEXA Scan"].map((m) => <option key={m}>{m}</option>)}</select></label>
          <label className="field">Body Part <input value={form.bodyPart} onChange={(e) => setForm({ ...form, bodyPart: e.target.value })} placeholder="e.g. Chest, Abdomen" /></label>
          <label className="field" style={{ gridColumn: "1/-1" }}>Clinical Indication * <input required value={form.indication} onChange={(e) => setForm({ ...form, indication: e.target.value })} placeholder="Reason for imaging" /></label>
          <label className="field">Urgency <select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}><option>Routine</option><option>Urgent</option><option>Emergency</option></select></label>
          <label className="field">Contrast Required <select value={form.contrast} onChange={(e) => setForm({ ...form, contrast: e.target.value })}><option>No</option><option>Yes</option></select></label>
        </form>
      </Modal>
    </div>
  );
}
