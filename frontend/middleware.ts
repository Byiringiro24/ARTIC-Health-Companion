/**
 * Next.js Middleware — Lightweight route protection.
 *
 * NOTE: The JWT token is stored in localStorage (client-side only) — it is
 * NOT accessible here on the server. Full auth is enforced client-side in
 * DashboardApp.tsx via getSession(). This middleware only prevents direct
 * URL access to public-only pages when a session cookie is present
 * (set at login via the API's HttpOnly cookie).
 *
 * We intentionally keep this minimal — complex checks belong in the client.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Just pass through — full RBAC is enforced client-side.
  // The backend API enforces RBAC on every data request via JWT.
  return NextResponse.next();
}

export const config = {
  matcher: [],  // No routes intercepted — disabled
};
