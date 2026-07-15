"use client";

import { useState } from "react";
import { CheckCircle2, Plus } from "lucide-react";
import { staff, roleDefinitions } from "@/lib/data";
import { useToast } from "@/lib/store";
import { Modal } from "@/components/ui/Modal";
import { SectionHeader, DataTable } from "@/components/ui/shared";

export function HRModule() {
  const { show } = useToast();
  const [leaveModal, setLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ type: "Annual leave", from: "", to: "", reason: "" });

  function handleLeave(e: React.FormEvent) {
    e.preventDefault();
    show("Leave request submitted for approval", "success");
    setLeaveModal(false);
  }

  return (
    <div className="grid">
      <section className="panel">
        <SectionHeader title="Staff Directory"
          action={<button className="button" type="button"><Plus size={14} /> Add staff</button>} />
        <DataTable
          headers={["Emp ID", "Name", "Role", "Department", "Qualification", "Reg No.", "Status"]}
          rows={staff.map((s) => [s.employeeId, s.name, roleDefinitions[s.role].label, s.department, s.qualification, s.registrationNumber ?? "—", s.status])}
          statusCol={6}
        />
      </section>

      <div className="grid cols-3">
        <section className="panel">
          <SectionHeader title="Attendance Summary" badge="Today" />
          <ul className="compact-list">
            {[["Present", "42"], ["On Leave", "3"], ["Late Arrivals", "2"], ["Overtime", "5"], ["Absent", "1"]].map(([k, v]) => (
              <li key={k}><span>{k}</span><strong style={{ color: k === "Absent" ? "#c23b22" : undefined }}>{v}</strong></li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <SectionHeader title="Leave Requests"
            action={<button className="button secondary" type="button" onClick={() => setLeaveModal(true)}><Plus size={14} /> Request</button>} />
          <ul className="compact-list">
            {[["Nurse Eric — Annual leave", "Pending"], ["Dr. Rukundo — Conference", "Approved"], ["Pharm. Ingabire — Sick leave", "Approved"]].map(([k, v]) => (
              <li key={k}><span style={{ fontSize: 13 }}>{k}</span><span className={`status${v === "Pending" ? " warn" : ""}`}>{v}</span></li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <SectionHeader title="Credential Alerts" />
          <ul className="compact-list">
            {[["Nurse Eric — License renewal", "warn"], ["Lab Patrick — CPD hours (32/40)", "warn"], ["Radiographer Chantal — Radiation cert", "good"]].map(([k, tone]) => (
              <li key={k}><span style={{ fontSize: 13 }}>{k}</span><span className={`status${tone === "warn" ? " warn" : ""}`}>{tone === "warn" ? "Attention" : "Valid"}</span></li>
            ))}
          </ul>
        </section>
      </div>

      <Modal open={leaveModal} onClose={() => setLeaveModal(false)} title="Request Leave"
        footer={<div className="actions-row"><button className="button" type="submit" form="leave-form"><CheckCircle2 size={14} /> Submit request</button><button className="button secondary" type="button" onClick={() => setLeaveModal(false)}>Cancel</button></div>}>
        <form id="leave-form" onSubmit={handleLeave} style={{ display: "grid", gap: 12 }}>
          <label className="field">Leave Type
            <select value={leaveForm.type} onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}>
              {["Annual leave", "Sick leave", "Maternity leave", "Paternity leave", "Study leave", "Compassionate leave"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label className="field">From * <input required type="date" value={leaveForm.from} onChange={(e) => setLeaveForm({ ...leaveForm, from: e.target.value })} /></label>
          <label className="field">To * <input required type="date" value={leaveForm.to} onChange={(e) => setLeaveForm({ ...leaveForm, to: e.target.value })} /></label>
          <label className="field">Reason <textarea rows={3} value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} placeholder="Reason for leave…" /></label>
        </form>
      </Modal>
    </div>
  );
}
