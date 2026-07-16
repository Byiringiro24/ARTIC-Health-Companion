"use client";

import { ImagePlus, Radio, ScanLine } from "lucide-react";
import type { AppUser } from "@/types/hms";

export function RadiologyDashboard({ user }: { user?: AppUser }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p className="muted" style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 12 }}>Imaging services</p>
            <h2 style={{ margin: "6px 0 0" }}>Radiology workflow and reporting</h2>
          </div>
          <span className="badge">Radiology</span>
        </div>
      </section>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ScanLine size={18} color="#027c8e" />
            <h3 style={{ margin: 0 }}>Pending studies</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Chest X-ray</span><span className="status info">Queued</span></li>
            <li><span>Abdominal ultrasound</span><span className="status warn">Review</span></li>
          </ul>
        </section>

        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ImagePlus size={18} color="#0f9f6e" />
            <h3 style={{ margin: 0 }}>Reports</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>CT findings</span><span className="status success">Ready</span></li>
            <li><span>Urgent imaging</span><span className="status danger">High priority</span></li>
          </ul>
        </section>
      </div>

      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Radio size={18} color="#b7791f" />
          <h3 style={{ margin: 0 }}>Radiology summary</h3>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>Welcome, {user?.name ?? "radiology staff"}. This workspace supports imaging requests, scheduling, and report delivery.</p>
      </section>
    </div>
  );
}
