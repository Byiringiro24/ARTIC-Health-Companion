"use client";

import { CalendarCheck2, Users2 } from "lucide-react";
import { PatientRegistrationForm } from "@/components/dashboard/PatientRegistrationForm";
import type { AppUser } from "@/types/hms";

export function ReceptionDashboard({ user }: { user?: AppUser }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p className="muted" style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 12 }}>Patient flow</p>
            <h2 style={{ margin: "6px 0 0" }}>Reception and registration desk</h2>
          </div>
          <span className="badge">Receptionist</span>
        </div>
      </section>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Users2 size={18} color="#027c8e" />
            <h3 style={{ margin: 0 }}>Register patient</h3>
          </div>
          <PatientRegistrationForm />
        </section>

        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CalendarCheck2 size={18} color="#0f9f6e" />
            <h3 style={{ margin: 0 }}>Queue overview</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Patient 0121 • Vital signs</span><span className="status info">Waiting</span></li>
            <li><span>Patient 0118 • Billing</span><span className="status warn">Pending</span></li>
            <li><span>Patient 0107 • Consultation</span><span className="status success">Ready</span></li>
          </ul>
        </section>
      </div>

      <section className="panel" style={{ padding: 20 }}>
        <p className="muted" style={{ marginTop: 0 }}>Welcome, {user?.name ?? "receptionist"}. The desk now supports registration, appointment coordination, and queue handoff.</p>
      </section>
    </div>
  );
}
