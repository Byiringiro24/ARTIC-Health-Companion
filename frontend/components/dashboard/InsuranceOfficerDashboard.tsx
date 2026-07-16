"use client";

import { BriefcaseMedical, ShieldCheck } from "lucide-react";
import type { AppUser } from "@/types/hms";

export function InsuranceOfficerDashboard({ user }: { user?: AppUser }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p className="muted" style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 12 }}>Claims and coverage</p>
            <h2 style={{ margin: "6px 0 0" }}>Policy validation and claims triage</h2>
          </div>
          <span className="badge">Insurance Officer</span>
        </div>
      </section>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BriefcaseMedical size={18} color="#027c8e" />
            <h3 style={{ margin: 0 }}>Pending claims</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Claim #221</span><span className="status warn">Needs review</span></li>
            <li><span>Claim #224</span><span className="status success">Approved</span></li>
          </ul>
        </section>

        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldCheck size={18} color="#0f9f6e" />
            <h3 style={{ margin: 0 }}>Coverage checks</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Authorizations</span><span className="status info">12 active</span></li>
            <li><span>Limits</span><span className="status warn">2 near cap</span></li>
          </ul>
        </section>
      </div>

      <section className="panel" style={{ padding: 20 }}>
        <p className="muted" style={{ marginTop: 0 }}>Welcome, {user?.name ?? "insurance officer"}. Your workspace supports claims review, authorization checks, and payer coordination.</p>
      </section>
    </div>
  );
}
