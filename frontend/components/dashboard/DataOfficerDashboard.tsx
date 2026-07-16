"use client";

import { DatabaseZap, ShieldCheck } from "lucide-react";
import type { AppUser } from "@/types/hms";

export function DataOfficerDashboard({ user }: { user?: AppUser }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p className="muted" style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 12 }}>Data management</p>
            <h2 style={{ margin: "6px 0 0" }}>Electronic records, reporting, and analytics</h2>
          </div>
          <span className="badge">Data Officer</span>
        </div>
      </section>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <DatabaseZap size={18} color="#027c8e" />
            <h3 style={{ margin: 0 }}>Data pipelines</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Sync status</span><span className="status success">Healthy</span></li>
            <li><span>Data quality checks</span><span className="status info">Running</span></li>
          </ul>
        </section>

        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldCheck size={18} color="#0f9f6e" />
            <h3 style={{ margin: 0 }}>Governance</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Access control</span><span className="status success">Updated</span></li>
            <li><span>Retention</span><span className="status warn">Review</span></li>
          </ul>
        </section>
      </div>

      <section className="panel" style={{ padding: 20 }}>
        <p className="muted" style={{ marginTop: 0 }}>Welcome, {user?.name ?? "data officer"}. Your workspace supports integrity, reporting, and secure information flow.</p>
      </section>
    </div>
  );
}
