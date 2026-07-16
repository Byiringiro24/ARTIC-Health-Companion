"use client";

import { CalendarClock, FileHeart, MessageSquareText, Pill } from "lucide-react";
import type { AppUser } from "@/types/hms";

export function PatientDashboard({ user }: { user?: AppUser }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p className="muted" style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 12 }}>My health portal</p>
            <h2 style={{ margin: "6px 0 0" }}>Manage appointments, results, and medications</h2>
          </div>
          <span className="badge">Patient</span>
        </div>
      </section>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CalendarClock size={18} color="#027c8e" />
            <h3 style={{ margin: 0 }}>Upcoming appointments</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Follow-up consultation</span><span className="status info">Tomorrow</span></li>
            <li><span>Pharmacy refill</span><span className="status success">Ready</span></li>
          </ul>
        </section>

        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Pill size={18} color="#0f9f6e" />
            <h3 style={{ margin: 0 }}>Medication plan</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Amoxicillin</span><span className="status warn">Pending refill</span></li>
            <li><span>Paracetamol</span><span className="status success">On track</span></li>
          </ul>
        </section>
      </div>

      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <FileHeart size={18} color="#b7791f" />
          <h3 style={{ margin: 0 }}>Messages</h3>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>Welcome, {user?.name ?? "patient"}. Your portal supports secure communication with the care team, payment visibility, and prescription tracking.</p>
      </section>
    </div>
  );
}
