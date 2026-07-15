"use client";

import { Plus } from "lucide-react";
import { useToast } from "@/lib/store";
import { SectionHeader, DataTable } from "@/components/ui/shared";

export function MortuaryModule() {
  const { show } = useToast();
  return (
    <section className="panel">
      <SectionHeader title="Mortuary Register"
        action={<button className="button" type="button" onClick={() => show("New body admission form opened", "info")}><Plus size={14} /> Record admission</button>} />
      <DataTable
        headers={["Body ID", "Name", "Age/Sex", "Cause of Death", "Admitted", "Storage", "Condition", "Status"]}
        rows={[
          ["BDY-001", "Mugisha Jean (unidentified)", "~60/M", "Cardiac arrest", "2026-07-14 22:10", "Bay 1", "Refrigerated", "Pending ID"],
          ["BDY-002", "Uwimana Beatrice", "78/F", "Cerebrovascular accident", "2026-07-13 08:45", "Bay 3", "Refrigerated", "Family notified"],
          ["BDY-003", "Mugabo Alexis", "45/M", "RTA injuries", "2026-07-15 04:30", "Bay 2", "Refrigerated", "Death cert issued"],
        ]}
        statusCol={7}
      />
    </section>
  );
}
