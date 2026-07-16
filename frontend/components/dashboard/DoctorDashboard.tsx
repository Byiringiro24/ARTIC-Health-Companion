"use client";

import { CalendarDays, ClipboardList, HeartPulse, UserRoundPlus } from "lucide-react";
import { PatientRegistrationForm } from "@/components/dashboard/PatientRegistrationForm";
import type { AppUser } from "@/types/hms";

export function DoctorDashboard({ user }: { user?: AppUser }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p className="muted" style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 12 }}>Clinical workspace</p>
            <h2 style={{ margin: "6px 0 0" }}>Welcome, {user?.name ?? "Doctor"}</h2>
          </div>
          <span className="badge">Doctor</span>
        </div>
      </section>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <UserRoundPlus size={18} color="#027c8e" />
            <h3 style={{ margin: 0 }}>Patient registration</h3>
          </div>
          <p className="muted" style={{ marginTop: 8 }}>Capture full clinical and demographic information for new patients in a structured form.</p>
          <PatientRegistrationForm />
        </section>

        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ClipboardList size={18} color="#0f9f6e" />
            <h3 style={{ margin: 0 }}>Today’s consultations</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Ernest Uwimana • Follow-up review</span><span className="status success">Ready</span></li>
            <li><span>Marie Mukamana • Chronic care plan</span><span className="status warn">Pending</span></li>
            <li><span>Jean Baptiste • New diagnosis</span><span className="status info">Scheduled</span></li>
          </ul>
        </section>
      </div>

      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CalendarDays size={18} color="#b7791f" />
          <h3 style={{ margin: 0 }}>Upcoming appointments</h3>
        </div>
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {["09:00 • ANC review", "11:30 • Post-op follow-up", "14:00 • Pediatrics consult"].map((item) => (
            <div key={item} style={{ display: "flex", justifyContent: "space-between", padding: 12, border: "1px solid var(--line)", borderRadius: 10 }}>
              <span>{item}</span>
              <span className="status info">Confirmed</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
