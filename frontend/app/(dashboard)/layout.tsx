import type { ReactNode } from "react";

export default function DashboardRouteLayout({ children }: { children: ReactNode }) {
  return (
    <main style={{ minHeight: "100vh", background: "#eef2ff", padding: "24px 16px" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto" }}>
        {children}
      </div>
    </main>
  );
}
