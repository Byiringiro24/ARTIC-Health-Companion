"use client";

import { Activity, ClipboardPlus, HeartPulse } from "lucide-react";
import type { AppUser } from "@/types/hms";

export function NurseDashboard({ user }: { user?: AppUser }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p className="muted" style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 12 }}>Ward operations</p>
            <h2 style={{ margin: "6px 0 0" }}>Patient care coordination</h2>
          </div>
          <span className="badge">Nurse</span>
        </div>
      </section>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <HeartPulse size={18} color="#027c8e" />
            <h3 style={{ margin: 0 }}>Vital signs</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Alice Ntirenganya</span><span className="status success">Stable</span></li>
            <li><span>Peter Habimana</span><span className="status warn">Needs review</span></li>
          </ul>
        </section>

        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ClipboardPlus size={18} color="#0f9f6e" />
            <h3 style={{ margin: 0 }}>Pending tasks</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Administer medication round</span><span className="status info">Today</span></li>
            <li><span>Update handover note</span><span className="status warn">Now</span></li>
          </ul>
        </section>
      </div>

      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Activity size={18} color="#b7791f" />
          <h3 style={{ margin: 0 }}>Care summary</h3>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>Welcome, {user?.name ?? "nurse"}. Your workspace is aligned for ward monitoring, medication administration, and bedside documentation.</p>
      </section>
    </div>
  );
}
