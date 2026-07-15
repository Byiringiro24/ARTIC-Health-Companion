"use client";

import { Download } from "lucide-react";
import { auditLogs } from "@/lib/data";
import { SectionHeader, DataTable } from "@/components/ui/shared";

export function AuditModule() {
  return (
    <section className="panel">
      <SectionHeader title="Audit Trail"
        action={<button className="button secondary" type="button"><Download size={14} /> Export logs</button>} />
      <DataTable
        headers={["Time", "User", "Action", "Module", "Resource", "Result", "IP"]}
        rows={auditLogs.map((a) => [a.time, a.user, a.action, a.module, a.resource ?? "—", a.result, a.ip ?? "—"])}
        statusCol={5}
      />
    </section>
  );
}
