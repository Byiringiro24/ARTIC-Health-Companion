"use client";

import { BriefcaseBusiness, Users } from "lucide-react";
import type { AppUser } from "@/types/hms";

export function HrDashboard({ user }: { user?: AppUser }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p className="muted" style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 12 }}>People operations</p>
            <h2 style={{ margin: "6px 0 0" }}>Workforce planning and staff administration</h2>
          </div>
          <span className="badge">HR Manager</span>
        </div>
      </section>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Users size={18} color="#027c8e" />
            <h3 style={{ margin: 0 }}>Staff status</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Active employees</span><span className="status success">184</span></li>
            <li><span>Open requests</span><span className="status warn">7</span></li>
          </ul>
        </section>

        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BriefcaseBusiness size={18} color="#0f9f6e" />
            <h3 style={{ margin: 0 }}>HR focus</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Recruitment</span><span className="status info">In progress</span></li>
            <li><span>Training</span><span className="status success">Scheduled</span></li>
          </ul>
        </section>
      </div>

      <section className="panel" style={{ padding: 20 }}>
        <p className="muted" style={{ marginTop: 0 }}>Welcome, {user?.name ?? "HR manager"}. Your workspace supports staffing, compliance, and employee lifecycle tasks.</p>
      </section>
    </div>
  );
}
