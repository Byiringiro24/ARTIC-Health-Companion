"use client";

import { Plus } from "lucide-react";
import { SectionHeader, DataTable } from "@/components/ui/shared";

export function ProcurementModule() {
  return (
    <div className="grid">
      <section className="panel">
        <SectionHeader title="Purchase Requests"
          action={<button className="button" type="button"><Plus size={14} /> New request</button>} />
        <DataTable
          headers={["PR No.", "Item", "Qty", "Department", "Est. Cost (RWF)", "Requested By", "Status"]}
          rows={[
            ["PR-0041", "Insulin Glargine 100U/mL", "100 vials", "Pharmacy", "420,000", "Pharm. Ingabire", "Pending approval"],
            ["PR-0042", "Surgical gloves (box 100)", "50 boxes", "Surgery", "125,000", "Nurse Eric", "Approved"],
            ["PR-0043", "Malaria RDT kits", "2,000 kits", "Laboratory", "640,000", "Lab Scientist Patrick", "PO raised"],
          ]}
          statusCol={6}
        />
      </section>

      <div className="grid cols-2">
        <section className="panel">
          <SectionHeader title="Approved Suppliers"
            action={<button className="button secondary" type="button"><Plus size={14} /> Add supplier</button>} />
          <ul className="compact-list">
            {["Cipla Quality Chemical — Medications", "B.Braun Medical — IV Fluids", "SD Biosensor — Diagnostics", "Novartis Rwanda — Specialty Drugs", "Labaid Rwanda — Lab Consumables"].map((s) => (
              <li key={s}><span style={{ fontSize: 13 }}>{s}</span><span className="status">Approved</span></li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <SectionHeader title="Active Purchase Orders" />
          <DataTable
            headers={["PO No.", "Supplier", "Amount (RWF)", "Delivery", "Status"]}
            rows={[
              ["PO-0301", "Cipla Quality Chemical", "2,400,000", "2026-07-20", "Confirmed"],
              ["PO-0302", "SD Biosensor", "640,000", "2026-07-18", "Shipped"],
            ]}
            statusCol={4}
          />
        </section>
      </div>
    </div>
  );
}
