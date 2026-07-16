import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "#f4f7fb" }}>
      <div style={{ width: "100%", maxWidth: 520, padding: 24, background: "#ffffff", borderRadius: 20, boxShadow: "0 18px 50px rgba(15, 23, 42, 0.08)" }}>
        {children}
      </div>
    </main>
  );
}
