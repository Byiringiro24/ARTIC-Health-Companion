"use client";

import { Building2, ClipboardCheck, TrendingUp } from "lucide-react";
import type { AppUser } from "@/types/hms";

export function HospitalManagerDashboard({ user }: { user?: AppUser }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p className="muted" style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 12 }}>Facility leadership</p>
            <h2 style={{ margin: "6px 0 0" }}>Operations and service delivery</h2>
          </div>
          <span className="badge">Hospital Manager</span>
        </div>
      </section>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Building2 size={18} color="#027c8e" />
            <h3 style={{ margin: 0 }}>Facility status</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Bed occupancy</span><span className="status warn">82%</span></li>
            <li><span>Daily admissions</span><span className="status success">24</span></li>
          </ul>
        </section>

        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TrendingUp size={18} color="#0f9f6e" />
            <h3 style={{ margin: 0 }}>Performance</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Revenue trend</span><span className="status success">+12%</span></li>
            <li><span>Wait time</span><span className="status info">18 min</span></li>
          </ul>
        </section>
      </div>

      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ClipboardCheck size={18} color="#b7791f" />
          <h3 style={{ margin: 0 }}>Leadership notes</h3>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>Welcome, {user?.name ?? "manager"}. This workspace highlights staffing, operations, finance, and service delivery readiness.</p>
      </section>
    </div>
  );
}
