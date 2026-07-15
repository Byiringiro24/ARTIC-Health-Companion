"use client";

import { Send } from "lucide-react";
import { useToast } from "@/lib/store";
import { SectionHeader, DataTable } from "@/components/ui/shared";

export function AmbulanceModule() {
  const { show } = useToast();
  return (
    <div className="grid cols-2">
      <section className="panel">
        <SectionHeader title="Fleet Status"
          action={<button className="button" type="button" onClick={() => show("Dispatch initiated", "info")}><Send size={14} /> New dispatch</button>} />
        <DataTable
          headers={["Unit", "Type", "Status", "Crew", "Last Location", "Fuel"]}
          rows={[
            ["AMB-001", "ALS", "Available", "Driver Theoneste + Paramedic Jules", "KG7 Ave, Kigali", "94%"],
            ["AMB-002", "BLS", "On mission", "Driver Alexis + Nurse Marie", "Gasabo District", "67%"],
            ["AMB-003", "ALS", "Maintenance", "—", "Hospital bay", "100%"],
          ]}
          statusCol={2}
        />
      </section>

      <section className="panel">
        <SectionHeader title="Active Dispatch" badge="AMB-002" />
        <div style={{ background: "#fff0ed", border: "1px solid #c23b2244", borderRadius: 10, padding: 16, marginBottom: 14 }}>
          <strong>ACTIVE DISPATCH — AMB-002</strong>
          <ul style={{ margin: "10px 0 0", padding: "0 0 0 16px", fontSize: 13 }}>
            <li>Patient: Unknown male — Road Traffic Accident</li>
            <li>Pickup: KK 15 Ave, Nyarugenge</li>
            <li>ETA to hospital: 12 minutes</li>
            <li>Intervention: Airway secured, IV access established</li>
          </ul>
        </div>
        <ul className="compact-list">
          {[["GPS Location", "Live tracking active"], ["Two-way comms", "Connected"], ["Hospital alert", "ED notified"]].map(([k, v]) => (
            <li key={k}><span>{k}</span><span className="status">{v}</span></li>
          ))}
        </ul>
      </section>
    </div>
  );
}
