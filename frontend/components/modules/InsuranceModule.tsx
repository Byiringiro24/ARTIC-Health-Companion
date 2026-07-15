"use client";

import { useState } from "react";
import { Send, Shield } from "lucide-react";
import { useToast } from "@/lib/store";
import { SectionHeader, DataTable, StatCard } from "@/components/ui/shared";

export function InsuranceModule() {
  const { show } = useToast();
  const [verify, setVerify] = useState({ patient: "", provider: "RSSB" });

  return (
    <div className="grid">
      <div className="grid cols-3">
        <StatCard label="Claims Submitted" value="38" tone="good" />
        <StatCard label="Approved" value="34" tone="good" />
        <StatCard label="Rejected" value="4" tone="danger" />
      </div>

      <section className="panel">
        <SectionHeader title="Insurance Claims"
          action={<button className="button" type="button" onClick={() => show("Batch submitted to RSSB", "success")}><Send size={14} /> Submit batch</button>} />
        <DataTable
          headers={["Claim Ref", "Patient", "Provider", "Amount (RWF)", "Date", "Status", "Rejection Reason"]}
          rows={[
            ["CLM-2026-0201", "Claudine Mutesi", "RSSB", "17,100", "2026-07-15", "Submitted", "—"],
            ["CLM-2026-0202", "Samuel Ndayisaba", "Mutuelle", "11,520", "2026-07-15", "Draft", "—"],
            ["CLM-2026-0203", "Esperance Kayitesi", "Private", "168,500", "2026-07-14", "Approved", "—"],
            ["CLM-2026-0198", "Joseph Kayinamura", "RSSB", "8,400", "2026-07-13", "Denied", "Missing ICD-10 code"],
          ]}
          statusCol={5}
        />
      </section>

      <section className="panel">
        <SectionHeader title="Eligibility Verification" />
        <div className="form-grid">
          <label className="field">Patient MRN / NID <input value={verify.patient} onChange={(e) => setVerify({ ...verify, patient: e.target.value })} placeholder="Search patient…" /></label>
          <label className="field">Insurance Provider
            <select value={verify.provider} onChange={(e) => setVerify({ ...verify, provider: e.target.value })}>
              <option>RSSB</option><option>Mutuelle</option><option>Private</option>
            </select>
          </label>
          <button className="button" type="button" style={{ gridColumn: "1/-1", marginTop: 4 }}
            onClick={() => show(`Insurance eligibility verified — ${verify.provider} Active, Coverage: Full`, "success")}>
            <Shield size={14} /> Verify eligibility
          </button>
        </div>
      </section>
    </div>
  );
}
