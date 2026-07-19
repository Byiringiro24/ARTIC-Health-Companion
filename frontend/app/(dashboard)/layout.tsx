/**
 * Dashboard route group layout.
 * All sub-routes under (dashboard)/ deep-link into the main DashboardApp.
 * The real application lives at /dashboard (DashboardApp).
 */
import type { ReactNode } from "react";

export default function DashboardRouteLayout({ children }: { children: ReactNode }) {
  // The actual app is at /dashboard — sub-routes are deep-link entry points.
  return <>{children}</>;
}
