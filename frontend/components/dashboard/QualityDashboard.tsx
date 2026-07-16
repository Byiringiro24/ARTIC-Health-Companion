"use client";

import { CheckCircle2, ClipboardList } from "lucide-react";
import type { AppUser } from "@/types/hms";

export function QualityDashboard({ user }: { user?: AppUser }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p className="muted" style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 12 }}>Quality assurance</p>
            <h2 style={{ margin: "6px 0 0" }}>Audit readiness and service quality control</h2>
          </div>
          <span className="badge">Quality Officer</span>
        </div>
      </section>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ClipboardList size={18} color="#027c8e" />
            <h3 style={{ margin: 0 }}>Open audit items</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Documentation gaps</span><span className="status warn">4</span></li>
            <li><span>Incident review</span><span className="status info">2</span></li>
          </ul>
        </section>

        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle2 size={18} color="#0f9f6e" />
            <h3 style={{ margin: 0 }}>Compliance trend</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Monthly score</span><span className="status success">94%</span></li>
            <li><span>Action plan</span><span className="status success">On schedule</span></li>
          </ul>
        </section>
      </div>

      <section className="panel" style={{ padding: 20 }}>
        <p className="muted" style={{ marginTop: 0 }}>Welcome, {user?.name ?? "quality officer"}. Your workspace supports monitoring, audit preparation, and continuous improvement.</p>
      </section>
    </div>
  );
}
