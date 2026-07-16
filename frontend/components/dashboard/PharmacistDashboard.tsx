"use client";

import { Boxes, ClipboardCheck, Pill } from "lucide-react";
import type { AppUser } from "@/types/hms";

export function PharmacistDashboard({ user }: { user?: AppUser }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p className="muted" style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 12 }}>Pharmacy operations</p>
            <h2 style={{ margin: "6px 0 0" }}>Medication dispensing workflow</h2>
          </div>
          <span className="badge">Pharmacist</span>
        </div>
      </section>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Boxes size={18} color="#027c8e" />
            <h3 style={{ margin: 0 }}>Inventory status</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Amoxicillin 250mg</span><span className="status warn">Low stock</span></li>
            <li><span>Paracetamol</span><span className="status success">Available</span></li>
          </ul>
        </section>

        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ClipboardCheck size={18} color="#0f9f6e" />
            <h3 style={{ margin: 0 }}>Pending prescriptions</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Patient 0012 • ART refill</span><span className="status info">Queued</span></li>
            <li><span>Patient 0034 • Dermatology</span><span className="status warn">Review</span></li>
          </ul>
        </section>
      </div>

      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Pill size={18} color="#b7791f" />
          <h3 style={{ margin: 0 }}>Pharmacy notes</h3>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>Welcome, {user?.name ?? "pharmacist"}. The workflow covers inventory, compounding, and safe dispensing checks.</p>
      </section>
    </div>
  );
}
