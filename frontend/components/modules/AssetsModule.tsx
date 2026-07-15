"use client";

import { Plus } from "lucide-react";
import { SectionHeader, DataTable } from "@/components/ui/shared";

export function AssetsModule() {
  return (
    <section className="panel">
      <SectionHeader title="Asset Register"
        action={<button className="button" type="button"><Plus size={14} /> Add asset</button>} />
      <DataTable
        headers={["Asset ID", "Equipment", "Location", "Tracking", "Last Service", "Next Service", "Status"]}
        rows={[
          ["AST-001", "Ventilator Puritan Bennett 840", "ICU Bay 1", "RFID active", "2026-05-10", "2026-08-10", "Operational"],
          ["AST-002", "Vaccine refrigerator (2–8°C)", "Pharmacy", "IoT temp sensor", "2026-06-01", "2026-09-01", "Operational"],
          ["AST-003", "Oxygen cylinder OX-31", "Emergency", "QR scanned", "2026-07-01", "2026-07-20", "Low pressure"],
          ["AST-004", "CBC Haematology Analyser", "Laboratory", "Asset barcode", "2026-06-15", "2026-09-15", "Calibration due"],
          ["AST-005", "Digital X-Ray unit", "Radiology", "Asset tag", "2026-04-20", "2026-10-20", "Operational"],
        ]}
        statusCol={6}
      />
    </section>
  );
}
