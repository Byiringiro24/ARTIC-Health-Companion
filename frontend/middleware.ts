/**
 * Next.js Middleware — Route-level RBAC enforcement.
 * Runs on every request to (dashboard) routes before the page renders.
 * Checks JWT in localStorage is not possible here (server-side), so we
 * use the accessToken cookie set at login.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Maps route prefixes to required module keys
const MODULE_ROUTES: Record<string, string> = {
  "/doctor":         "consultations",
  "/nurse":          "nursing",
  "/pharmacist":     "pharmacy",
  "/laboratory":     "laboratory",
  "/accountant":     "billing",
  "/receptionist":   "patients",
  "/store-manager":  "inventory",
  "/patient-portal": "patient-portal",
  "/hospital-admin": "settings",
  "/admin":          "admin",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect dashboard routes
  if (!pathname.startsWith("/dashboard") && !pathname.startsWith("/(dashboard)")) {
    return NextResponse.next();
  }

  // Check for auth token (set as HttpOnly cookie on login)
  const token = request.cookies.get("accessToken")?.value
    ?? request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Decode JWT payload (no verify — signature verified by backend)
  try {
    const [, payloadB64] = token.split(".");
    const payload = JSON.parse(Buffer.from(payloadB64, "base64").toString("utf8"));
    const modules: string[] = payload.modules ?? [];

    // Find which role-route prefix matches this path
    for (const [prefix, requiredModule] of Object.entries(MODULE_ROUTES)) {
      if (pathname.includes(prefix) && !modules.includes(requiredModule)) {
        // User doesn't have this module — redirect to their dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  } catch {
    // Invalid token — redirect to login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/(dashboard)/:path*",
    "/dashboard/:path*",
  ],
};
