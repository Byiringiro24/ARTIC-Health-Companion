"use client";
/**
 * ModuleRedirect — used by all (dashboard) sub-route pages.
 * Deep-links the user into /dashboard?module=<key>
 * If already at /dashboard, just switches the active module via URL.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ModuleRedirect({ module }: { module: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/dashboard?module=${module}`);
  }, [module, router]);
  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", color: "#64748b" }}>
      Loading…
    </div>
  );
}
