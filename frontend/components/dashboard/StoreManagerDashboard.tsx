"use client";

import { PackageCheck, Warehouse } from "lucide-react";
import type { AppUser } from "@/types/hms";

export function StoreManagerDashboard({ user }: { user?: AppUser }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p className="muted" style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 12 }}>Supply chain</p>
            <h2 style={{ margin: "6px 0 0" }}>Inventory oversight and stock movement</h2>
          </div>
          <span className="badge">Store Manager</span>
        </div>
      </section>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Warehouse size={18} color="#027c8e" />
            <h3 style={{ margin: 0 }}>Critical stock</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Gloves</span><span className="status warn">Low</span></li>
            <li><span>IV fluids</span><span className="status success">Healthy</span></li>
          </ul>
        </section>

        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <PackageCheck size={18} color="#0f9f6e" />
            <h3 style={{ margin: 0 }}>Receipts</h3>
          </div>
          <ul className="compact-list" style={{ marginTop: 12 }}>
            <li><span>Supplier deliveries</span><span className="status info">3 pending</span></li>
            <li><span>Reorder cycle</span><span className="status success">Active</span></li>
          </ul>
        </section>
      </div>

      <section className="panel" style={{ padding: 20 }}>
        <p className="muted" style={{ marginTop: 0 }}>Welcome, {user?.name ?? "store manager"}. Your dashboard supports inventory control, stock alerts, and purchase planning.</p>
      </section>
    </div>
  );
}
