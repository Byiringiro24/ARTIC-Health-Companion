"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AppUser } from "@/types/hms";

/**
 * AdminDashboard — redirects to the full Super Admin portal page.
 * The real portal is at /admin/page.tsx with all 7 tabs.
 */
export function AdminDashboard({ user }: { user?: AppUser }) {
  const router = useRouter();
  useEffect(() => {
    // Hard redirect to full portal so it loads cleanly with all API calls
    window.location.href = "/admin";
  }, []);

  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:300, flexDirection:"column", gap:12 }}>
      <div style={{ fontSize:32 }}>🔐</div>
      <p style={{ color:"#6b7280", fontSize:14 }}>Loading Super Admin portal…</p>
    </div>
  );
}
