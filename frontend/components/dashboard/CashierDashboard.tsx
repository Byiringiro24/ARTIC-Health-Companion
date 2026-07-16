"use client";

import { BadgeDollarSign, ReceiptText } from "lucide-react";
import type { AppUser } from "@/types/hms";

export function CashierDashboard({ user }: { user?: AppUser }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p className="muted" style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 12 }}>Revenue collection</p>
            <h2 style={{ margin: "6px 0 0" }}>Daily cash and mobile money reconciliation</h2>
          </div>
          <span className="badge">Cashier</span>
        </div>
      </section>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ReceiptText size={18} color="#027c8e" />
            <h3 style={{ margin: 0 }}>Pending receipts</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Invoice 1047</span><span className="status info">Awaiting print</span></li>
            <li><span>Mobile money receipt</span><span className="status success">Posted</span></li>
          </ul>
        </section>

        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BadgeDollarSign size={18} color="#0f9f6e" />
            <h3 style={{ margin: 0 }}>Cash summary</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Cash collected</span><span className="status success">RWF 1.8M</span></li>
            <li><span>Shift balance</span><span className="status warn">RWF 340k</span></li>
          </ul>
        </section>
      </div>

      <section className="panel" style={{ padding: 20 }}>
        <p className="muted" style={{ marginTop: 0 }}>Welcome, {user?.name ?? "cashier"}. Your workspace supports receipting, payment reconciliation, and service charge closure.</p>
      </section>
    </div>
  );
}
