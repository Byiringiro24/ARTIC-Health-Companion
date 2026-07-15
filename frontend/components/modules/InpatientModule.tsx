"use client";

import { useState } from "react";
import { CheckCircle2, Plus } from "lucide-react";
import { beds, demoUsers } from "@/lib/data";
import { useToast } from "@/lib/store";
import { Modal } from "@/components/ui/Modal";
import { SectionHeader, DataTable } from "@/components/ui/shared";
import type { BedInfo } from "@/types/hms";

export function InpatientModule() {
  const { show } = useToast();
  const [bedList, setBedList] = useState<BedInfo[]>(beds);
  const [admitModal, setAdmitModal] = useState(false);
  const [admitForm, setAdmitForm] = useState({ patient: "", ward: "Medical Ward", bed: "MW-101B", doctor: "Dr. Grace Mukamana", admissionType: "Planned", diagnosis: "" });

  const wardGroups = Array.from(new Set(bedList.map((b) => b.ward)));
  const statsMap = wardGroups.map((w) => {
    const wb = bedList.filter((b) => b.ward === w);
    return { ward: w, total: wb.length, occupied: wb.filter((b) => b.status === "Occupied").length };
  });

  const bedStatusColor: Record<string, string> = { Occupied: "#c23b22", Available: "#0f9f6e", Cleaning: "#b7791f", Maintenance: "#60717c", Reserved: "#5b5fc7" };

  function handleAdmit(e: React.FormEvent) {
    e.preventDefault();
    setBedList((prev) =>
      prev.map((b) =>
        b.bedNumber === admitForm.bed
          ? { ...b, status: "Occupied" as const, patientName: admitForm.patient, attendingDoctor: admitForm.doctor, admittedAt: new Date().toISOString().split("T")[0] }
          : b
      )
    );
    show(`${admitForm.patient} admitted to ${admitForm.bed}`, "success");
    setAdmitModal(false);
  }

  return (
    <div className="grid">
      <div className="grid cols-3">
        {statsMap.slice(0, 3).map(({ ward, total, occupied }) => (
          <div className="card" key={ward} style={{ padding: 18 }}>
            <span className="muted" style={{ fontSize: 13 }}>{ward}</span>
            <strong style={{ display: "block", fontSize: 28, margin: "6px 0 4px" }}>{occupied}/{total}</strong>
            <p className="muted" style={{ margin: 0, fontSize: 12 }}>{total - occupied} beds available</p>
            <div style={{ marginTop: 10, height: 6, background: "#dce5ea", borderRadius: 3 }}>
              <div style={{ height: 6, borderRadius: 3, width: `${(occupied / total) * 100}%`, background: occupied / total > 0.9 ? "#c23b22" : occupied / total > 0.75 ? "#b7791f" : "#0f9f6e" }} />
            </div>
          </div>
        ))}
      </div>

      <section className="panel">
        <SectionHeader title="Bed Status Map" badge={`${bedList.filter((b) => b.status === "Occupied").length}/${bedList.length} occupied`}
          action={<>
            <div className="actions-row" style={{ flexWrap: "wrap" }}>
              {(["Available", "Occupied", "Cleaning", "Maintenance", "Reserved"] as const).map((s) => (
                <span key={s} style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: bedStatusColor[s], display: "inline-block" }} />
                  {s}
                </span>
              ))}
            </div>
            <button className="button" type="button" onClick={() => setAdmitModal(true)}><Plus size={14} /> Admit patient</button>
          </>} />
        <DataTable
          headers={["Bed", "Ward", "Type", "Status", "Patient", "Admitted", "Doctor"]}
          rows={bedList.map((b) => [b.bedNumber, b.ward, b.type, b.status, b.patientName ?? "—", b.admittedAt ?? "—", b.attendingDoctor ?? "—"])}
          statusCol={3}
        />
      </section>

      <Modal open={admitModal} onClose={() => setAdmitModal(false)} title="Admit Patient"
        footer={<div className="actions-row"><button className="button" type="submit" form="admit-form"><CheckCircle2 size={14} /> Confirm admission</button><button className="button secondary" type="button" onClick={() => setAdmitModal(false)}>Cancel</button></div>}>
        <form id="admit-form" onSubmit={handleAdmit} className="form-grid">
          <label className="field" style={{ gridColumn: "1/-1" }}>Patient * <input required value={admitForm.patient} onChange={(e) => setAdmitForm({ ...admitForm, patient: e.target.value })} placeholder="Patient name / MRN" /></label>
          <label className="field">Admission Type <select value={admitForm.admissionType} onChange={(e) => setAdmitForm({ ...admitForm, admissionType: e.target.value })}><option>Planned</option><option>Emergency</option><option>Transfer</option><option>Overnight stay</option></select></label>
          <label className="field">Ward <select value={admitForm.ward} onChange={(e) => setAdmitForm({ ...admitForm, ward: e.target.value })}>{wardGroups.map((w) => <option key={w}>{w}</option>)}</select></label>
          <label className="field">Bed <select value={admitForm.bed} onChange={(e) => setAdmitForm({ ...admitForm, bed: e.target.value })}>
            {bedList.filter((b) => b.status === "Available").map((b) => <option key={b.id} value={b.bedNumber}>{b.bedNumber} ({b.ward})</option>)}
          </select></label>
          <label className="field">Attending Doctor <select value={admitForm.doctor} onChange={(e) => setAdmitForm({ ...admitForm, doctor: e.target.value })}>
            {demoUsers.filter((u) => u.role === "doctor" || u.role === "medical-director").map((d) => <option key={d.id}>{d.name}</option>)}
          </select></label>
          <label className="field" style={{ gridColumn: "1/-1" }}>Admission Diagnosis (ICD-10) <input value={admitForm.diagnosis} onChange={(e) => setAdmitForm({ ...admitForm, diagnosis: e.target.value })} placeholder="e.g. I10 — Hypertension" /></label>
        </form>
      </Modal>
    </div>
  );
}
