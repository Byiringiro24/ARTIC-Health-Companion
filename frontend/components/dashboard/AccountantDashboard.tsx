"use client";

import { BadgeDollarSign, ReceiptText } from "lucide-react";
import type { AppUser } from "@/types/hms";

export function AccountantDashboard({ user }: { user?: AppUser }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p className="muted" style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 12 }}>Finance workspace</p>
            <h2 style={{ margin: "6px 0 0" }}>Billing, payments, and claims</h2>
          </div>
          <span className="badge">Accountant</span>
        </div>
      </section>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ReceiptText size={18} color="#027c8e" />
            <h3 style={{ margin: 0 }}>Outstanding invoices</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>INV-1042 • Mutuelle</span><span className="status warn">Pending</span></li>
            <li><span>INV-1047 • Cash</span><span className="status success">Paid</span></li>
          </ul>
        </section>

        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BadgeDollarSign size={18} color="#0f9f6e" />
            <h3 style={{ margin: 0 }}>Claims follow-up</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>RSSB claim 223</span><span className="status info">Submitted</span></li>
            <li><span>Private insurer 912</span><span className="status warn">Needs review</span></li>
          </ul>
        </section>
      </div>

      <section className="panel" style={{ padding: 20 }}>
        <p className="muted" style={{ marginTop: 0 }}>Welcome, {user?.name ?? "accountant"}. Your workspace supports invoicing, insurance reconciliation, and payment tracking.</p>
      </section>
    </div>
  );
}
