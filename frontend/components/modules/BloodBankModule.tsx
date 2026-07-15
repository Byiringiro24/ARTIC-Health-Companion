"use client";

import { useState } from "react";
import { CheckCircle2, Plus } from "lucide-react";
import { bloodUnits } from "@/lib/data";
import { useToast } from "@/lib/store";
import { Modal } from "@/components/ui/Modal";
import { SectionHeader, DataTable } from "@/components/ui/shared";

export function BloodBankModule() {
  const { show } = useToast();
  const [requestModal, setRequestModal] = useState(false);
  const [reqForm, setReqForm] = useState({ patient: "", bloodGroup: "O+", component: "Packed RBC", units: "1", indication: "", urgency: "Routine" });

  function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    show(`Crossmatch requested: ${reqForm.component} ${reqForm.bloodGroup} × ${reqForm.units} for ${reqForm.patient}`, "info");
    setRequestModal(false);
    setReqForm({ patient: "", bloodGroup: "O+", component: "Packed RBC", units: "1", indication: "", urgency: "Routine" });
  }

  return (
    <div className="grid">
      <section className="panel">
        <SectionHeader title="Blood Stock"
          action={<button className="button" type="button" onClick={() => show("Donation recording form opened", "info")}><Plus size={14} /> Record donation</button>} />
        <DataTable
          headers={["Blood Group", "Component", "Units", "Collected", "Expiry", "Status"]}
          rows={bloodUnits.map((b) => [b.bloodGroup, b.component, String(b.units), b.collectedAt, b.expiryDate, b.status])}
          statusCol={5}
        />
      </section>

      <div className="grid cols-2">
        <section className="panel">
          <SectionHeader title="Transfusion Request"
            action={<button className="button" type="button" onClick={() => setRequestModal(true)}><Plus size={14} /> New request</button>} />
          <ul className="compact-list">
            {[["Crossmatch procedure", "2–4 hours"], ["Emergency O- available", "12 units"], ["Last transfusion", "Patrick Mugenzi — 2 units packed RBC"]].map(([k, v]) => (
              <li key={k}><span style={{ fontSize: 13 }}>{k}</span><span style={{ fontSize: 13 }}>{v}</span></li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <SectionHeader title="Donor Records" />
          <ul className="compact-list">
            {[["Jean Claude — O+", "2026-06-15", "Eligible"], ["Marie Rose — A+", "2026-05-20", "Eligible"], ["Pierre — B-", "2026-04-10", "Eligible"], ["Alphonse — O-", "2026-07-01", "Deferred 56 days"]].map(([name, date, status]) => (
              <li key={name}>
                <div>
                  <strong style={{ fontSize: 13 }}>{name}</strong>
                  <p className="muted" style={{ margin: "2px 0 0", fontSize: 12 }}>Last donated: {date}</p>
                </div>
                <span className={`status${status.startsWith("Deferred") ? " warn" : ""}`}>{status}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Modal open={requestModal} onClose={() => setRequestModal(false)} title="Transfusion Request"
        footer={<div className="actions-row"><button className="button" type="submit" form="blood-form"><CheckCircle2 size={14} /> Request crossmatch</button><button className="button secondary" type="button" onClick={() => setRequestModal(false)}>Cancel</button></div>}>
        <form id="blood-form" onSubmit={handleRequest} className="form-grid">
          <label className="field" style={{ gridColumn: "1/-1" }}>Patient * <input required value={reqForm.patient} onChange={(e) => setReqForm({ ...reqForm, patient: e.target.value })} placeholder="Patient name or MRN" /></label>
          <label className="field">Blood Group <select value={reqForm.bloodGroup} onChange={(e) => setReqForm({ ...reqForm, bloodGroup: e.target.value })}>{["O+","O-","A+","A-","B+","B-","AB+","AB-"].map((g) => <option key={g}>{g}</option>)}</select></label>
          <label className="field">Component <select value={reqForm.component} onChange={(e) => setReqForm({ ...reqForm, component: e.target.value })}>{["Packed RBC","Whole Blood","Platelets","Fresh Frozen Plasma","Cryoprecipitate"].map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="field">Units <input type="number" min="1" value={reqForm.units} onChange={(e) => setReqForm({ ...reqForm, units: e.target.value })} /></label>
          <label className="field">Urgency <select value={reqForm.urgency} onChange={(e) => setReqForm({ ...reqForm, urgency: e.target.value })}><option>Routine</option><option>Urgent</option><option>Emergency</option></select></label>
          <label className="field" style={{ gridColumn: "1/-1" }}>Clinical Indication <input value={reqForm.indication} onChange={(e) => setReqForm({ ...reqForm, indication: e.target.value })} placeholder="e.g. Haemorrhage, anaemia" /></label>
        </form>
      </Modal>
    </div>
  );
}
