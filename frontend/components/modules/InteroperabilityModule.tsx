"use client";

import { useToast } from "@/lib/store";
import { SectionHeader } from "@/components/ui/shared";

const integrations = [
  { title: "National ID / NIDA", desc: "Real-time patient demographic lookup and identity matching via Rwanda NIDA API", status: "Connected" },
  { title: "RSSB Insurance Gateway", desc: "Eligibility verification, claim submission, and rejection management for Mutuelle and formal sector", status: "Live" },
  { title: "HL7 FHIR R4 API", desc: "Patient, Encounter, Observation, MedicationRequest FHIR resources for cross-facility record sharing", status: "Ready" },
  { title: "ICD-10 / ICD-11 Coding", desc: "WHO diagnosis coding embedded for clinical notes, billing, and MOH reporting compliance", status: "Embedded" },
  { title: "MTN MoMo / Airtel Money", desc: "Mobile money payment collection with callback verification and automatic reconciliation", status: "Live" },
  { title: "HIE — Health Info Exchange", desc: "Cross-facility referral management and patient record sharing with consent management", status: "Planned" },
];

export function InteroperabilityModule() {
  const { show } = useToast();

  return (
    <div className="grid cols-2">
      {integrations.map(({ title, desc, status }) => (
        <section className="panel" key={title}>
          <div className="module-header">
            <h2>{title}</h2>
            <span className={`status${status === "Planned" ? " warn" : ""}`}>{status}</span>
          </div>
          <p className="muted" style={{ fontSize: 13, margin: "0 0 14px" }}>{desc}</p>
          <button
            className="button secondary"
            type="button"
            onClick={() => show(`Testing connection to ${title}…`, "info")}
          >
            Test connection
          </button>
        </section>
      ))}
    </div>
  );
}
