"use client";

import { FlaskConical, Microscope, TestTube2 } from "lucide-react";
import type { AppUser } from "@/types/hms";

export function LabDashboard({ user }: { user?: AppUser }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p className="muted" style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 12 }}>Laboratory operations</p>
            <h2 style={{ margin: "6px 0 0" }}>Specimen tracking and reporting</h2>
          </div>
          <span className="badge">Laboratory</span>
        </div>
      </section>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TestTube2 size={18} color="#027c8e" />
            <h3 style={{ margin: 0 }}>Pending specimens</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>HbA1c panel</span><span className="status info">Received</span></li>
            <li><span>Malaria microscopy</span><span className="status warn">Processing</span></li>
          </ul>
        </section>

        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Microscope size={18} color="#0f9f6e" />
            <h3 style={{ margin: 0 }}>Critical alerts</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Glucose above threshold</span><span className="status danger">Urgent</span></li>
            <li><span>HIV confirmatory sample</span><span className="status warn">Review</span></li>
          </ul>
        </section>
      </div>

      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <FlaskConical size={18} color="#b7791f" />
          <h3 style={{ margin: 0 }}>Results workflow</h3>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>Welcome, {user?.name ?? "laboratory"}. This workspace supports result verification, specimen tracking, and critical result escalation.</p>
      </section>
    </div>
  );
}
