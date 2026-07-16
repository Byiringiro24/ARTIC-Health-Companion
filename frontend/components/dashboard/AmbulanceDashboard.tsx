"use client";

import { Ambulance, MapPinned, PhoneCall } from "lucide-react";
import type { AppUser } from "@/types/hms";

export function AmbulanceDashboard({ user }: { user?: AppUser }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p className="muted" style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 12 }}>Emergency transport</p>
            <h2 style={{ margin: "6px 0 0" }}>Dispatch coordination and response tracking</h2>
          </div>
          <span className="badge">Ambulance Driver</span>
        </div>
      </section>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <PhoneCall size={18} color="#027c8e" />
            <h3 style={{ margin: 0 }}>Active dispatches</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Transfer to district hospital</span><span className="status info">En route</span></li>
            <li><span>Referral pickup</span><span className="status warn">Awaiting crew</span></li>
          </ul>
        </section>

        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <MapPinned size={18} color="#0f9f6e" />
            <h3 style={{ margin: 0 }}>Vehicle status</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Ambulance 02</span><span className="status success">Ready</span></li>
            <li><span>Fuel level</span><span className="status warn">Low</span></li>
          </ul>
        </section>
      </div>

      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Ambulance size={18} color="#b7791f" />
          <h3 style={{ margin: 0 }}>Response overview</h3>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>Welcome, {user?.name ?? "ambulance driver"}. Your workspace helps you coordinate emergency transfers and confirm arrivals.</p>
      </section>
    </div>
  );
}
