"use client";

import { useState } from "react";
import { Building2, Layers3, ShieldCheck, ToggleRight } from "lucide-react";
import type { AppUser } from "@/types/hms";

const featureSeed = [
  { key: "hospitals", label: "Hospitals", enabled: true },
  { key: "clinics", label: "Clinics", enabled: true },
  { key: "dispensers", label: "Dispensers", enabled: true },
  { key: "telemedicine", label: "Telemedicine", enabled: false },
  { key: "audit", label: "Audit trails", enabled: true },
];

export function AdminDashboard({ user }: { user?: AppUser }) {
  const [features, setFeatures] = useState(featureSeed);

  function toggleFeature(key: string) {
    setFeatures((current) => current.map((feature) => feature.key === key ? { ...feature, enabled: !feature.enabled } : feature));
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p className="muted" style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 12 }}>System administration</p>
            <h2 style={{ margin: "6px 0 0" }}>Govern hospitals, clinics, and dispensers</h2>
          </div>
          <span className="badge">System admin</span>
        </div>
      </section>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Building2 size={18} color="#027c8e" />
            <h3 style={{ margin: 0 }}>Facility access</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Rwanda Referral Hospital</span><span className="status success">Active</span></li>
            <li><span>Kigali Family Clinic</span><span className="status info">Pending review</span></li>
            <li><span>Community Dispenser Hub</span><span className="status warn">Needs approval</span></li>
          </ul>
        </section>

        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Layers3 size={18} color="#0f9f6e" />
            <h3 style={{ margin: 0 }}>Feature toggles</h3>
          </div>
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {features.map((feature) => (
              <div key={feature.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10, border: "1px solid var(--line)", borderRadius: 10 }}>
                <span>{feature.label}</span>
                <button type="button" onClick={() => toggleFeature(feature.key)} style={{ border: "none", background: "none", cursor: "pointer" }}>
                  <ToggleRight size={22} color={feature.enabled ? "#027c8e" : "#a0b0bc"} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ShieldCheck size={18} color="#b7791f" />
          <h3 style={{ margin: 0 }}>Technical oversight</h3>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>As the system administrator, {user?.name ?? "you"} can manage role permissions, grant module access, and enable or disable platform features for each facility.</p>
      </section>
    </div>
  );
}
