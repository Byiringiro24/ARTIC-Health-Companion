"use client";

import { AlertCircle, CheckCircle, Plus } from "lucide-react";
import { useToast } from "@/lib/store";
import { SectionHeader, StatCard } from "@/components/ui/shared";

export function QualityModule() {
  const { show } = useToast();

  const accreditationAreas = [
    ["Clinical governance", 92], ["Patient safety", 88], ["Infection control", 95],
    ["Medical records", 79], ["Medication management", 91], ["Emergency preparedness", 84],
  ] as [string, number][];

  return (
    <div className="grid">
      <div className="grid cols-4">
        <StatCard label="Patient safety incidents" value="2" tone="warn" icon={<AlertCircle size={22} color="#b7791f" />} />
        <StatCard label="Open corrective actions" value="5" tone="warn" icon={<AlertCircle size={22} color="#b7791f" />} />
        <StatCard label="Audits completed (July)" value="8" tone="good" icon={<CheckCircle size={22} color="#0f9f6e" />} />
        <StatCard label="Patient satisfaction" value="87%" tone="good" />
      </div>

      <div className="grid cols-2">
        <section className="panel">
          <SectionHeader title="RAAQH Accreditation Readiness" />
          <ul className="compact-list">
            {accreditationAreas.map(([area, pct]) => (
              <li key={area}>
                <span style={{ fontSize: 13 }}>{area}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 80, height: 6, background: "#dce5ea", borderRadius: 3 }}>
                    <div style={{ width: `${pct}%`, height: 6, borderRadius: 3, background: pct >= 90 ? "#0f9f6e" : pct >= 80 ? "#b7791f" : "#c23b22" }} />
                  </div>
                  <span style={{ fontSize: 12 }}>{pct}%</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <SectionHeader title="Incident Register"
            action={<button className="button secondary" type="button" onClick={() => show("New incident form opened", "info")}><Plus size={14} /> Report</button>} />
          <ul className="compact-list">
            {[["Near-miss: Wrong medication almost dispensed", "Open", "warn"], ["Fall: Patient slipped in corridor", "Under investigation", "warn"], ["Complaint: Long waiting time in pharmacy", "Resolved", ""]].map(([incident, status, tone]) => (
              <li key={incident}>
                <span style={{ fontSize: 13 }}>{incident}</span>
                <span className={`status${tone ? ` ${tone}` : ""}`}>{status}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
