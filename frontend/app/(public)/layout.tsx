import type { ReactNode } from "react";
import Link from "next/link";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", maxWidth: 1360, margin: "0 auto" }}>
        <Link href="/" style={{ textDecoration: "none", color: "#0f172a", fontWeight: 700, fontSize: 18 }}>
          ARTIC Health Companion
        </Link>
        <nav style={{ display: "flex", gap: 16 }}>
          <Link href="/login" className="button ghost">Login</Link>
          <Link href="/" className="button ghost">Home</Link>
        </nav>
      </header>
      <main style={{ maxWidth: 1360, margin: "0 auto", padding: "24px 16px" }}>{children}</main>
    </div>
  );
}
