"use client";

import { Plus } from "lucide-react";
import { useToast } from "@/lib/store";
import { SectionHeader, DataTable } from "@/components/ui/shared";

export function MultiTenantModule() {
  const { show } = useToast();

  return (
    <section className="panel">
      <SectionHeader title="Hospital Network" badge="5 facilities"
        action={<button className="button" type="button" onClick={() => show("Tenant creation wizard opened", "info")}><Plus size={14} /> Add tenant</button>} />
      <DataTable
        headers={["Facility", "MOH Code", "Type", "Province", "Active Users", "Patients", "Status"]}
        rows={[
          ["Kigali District Hospital", "KDH-001", "District Hospital", "Kigali", "42", "1,842", "Active"],
          ["CHUK — University Teaching Hospital", "CHUK-001", "Referral Hospital", "Kigali", "118", "8,241", "Active"],
          ["Musanze District Hospital", "MDH-001", "District Hospital", "Northern", "31", "924", "Active"],
          ["Rwamagana Provincial Hospital", "RPH-001", "Provincial Hospital", "Eastern", "27", "712", "Active"],
          ["Huye District Hospital", "HDH-001", "District Hospital", "Southern", "22", "0", "Provisioning"],
        ]}
        statusCol={6}
      />
    </section>
  );
}
