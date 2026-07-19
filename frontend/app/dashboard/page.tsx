import { Suspense } from "react";
import { DashboardApp } from "@/components/DashboardApp";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div style={{ display:"grid", placeItems:"center", minHeight:"100vh" }}>Loading…</div>}>
      <DashboardApp />
    </Suspense>
  );
}
