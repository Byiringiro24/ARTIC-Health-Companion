"use client";

import { Activity, ShieldCheck, Stethoscope } from "lucide-react";
import type { AppUser } from "@/types/hms";

export function MedicalDirectorDashboard({ user }: { user?: AppUser }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p className="muted" style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 12 }}>Clinical governance</p>
            <h2 style={{ margin: "6px 0 0" }}>Quality, safety, and patient outcomes</h2>
          </div>
          <span className="badge">Medical Director</span>
        </div>
      </section>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Stethoscope size={18} color="#027c8e" />
            <h3 style={{ margin: 0 }}>Clinical quality</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Care audits</span><span className="status success">On track</span></li>
            <li><span>Safety incidents</span><span className="status warn">3 open</span></li>
          </ul>
        </section>

        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldCheck size={18} color="#0f9f6e" />
            <h3 style={{ margin: 0 }}>Governance</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Clinical protocols</span><span className="status info">Reviewed</span></li>
            <li><span>Compliance</span><span className="status success">98%</span></li>
          </ul>
        </section>
      </div>

      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Activity size={18} color="#b7791f" />
          <h3 style={{ margin: 0 }}>Clinical overview</h3>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>Welcome, {user?.name ?? "director"}. Your workspace supports clinical oversight, quality improvement, and patient safety monitoring.</p>
      </section>
    </div>
  );
}
