"use client";

import { apiFetch } from "@/lib/api/client";
import { demoUsers, roleDefinitions } from "@/lib/data";
import type { AppUser } from "@/types/hms";

const sessionKey = "artic-health-session";

function normalizeUser(user: any): AppUser | null {
  if (!user) return null;
  const role = user.role || user.roleName || user.role_name;
  if (!role) return null;

  const name = user.name || `${user.firstName || user.first_name || ""} ${user.lastName || user.last_name || ""}`.trim() || user.email || "ARTIC User";

  return {
    id: String(user.id),
    name,
    email: user.email ?? "",
    password: user.password ?? undefined,
    role,
    department: user.department ?? user.departmentName ?? "",
    facility: user.facility ?? user.facilityName ?? user.hospital ?? user.hospitalName ?? "",
    patientId: user.patientId ?? user.patient_id ?? undefined,
    accessToken: user.accessToken,
    refreshToken: user.refreshToken,
    roleName: user.roleName || user.role_name,
    roleLabel: user.roleLabel || user.role_label,
    firstName: user.firstName || user.first_name,
    lastName: user.lastName || user.last_name,
    hospitalId: user.hospitalId || user.hospital_id || undefined,
    tenantId: user.tenantId || user.tenant_id || undefined,
    departmentId: user.departmentId || user.department_id || undefined,
    roleId: user.roleId || user.role_id || undefined,
    jobTitle: user.jobTitle || user.job_title || undefined,
    modules: user.modules || undefined,
  };
}

export async function login(email: string, password: string): Promise<AppUser | null> {
  const trimmed = email.trim();
  if (!trimmed || !password) return null;

  try {
    const result = await apiFetch<{ accessToken: string; refreshToken: string; user: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: trimmed, password }),
    });

    const normalized = normalizeUser({ ...result.user, accessToken: result.accessToken, refreshToken: result.refreshToken });
    if (!normalized) return null;

    localStorage.setItem(sessionKey, JSON.stringify(normalized));
    return normalized;
  } catch (error) {
    console.warn("API login failed, falling back to demo users", error);

    const fallback = demoUsers.find((item) => item.email.toLowerCase() === trimmed.toLowerCase() && item.password === password);
    if (!fallback) return null;

    localStorage.setItem(sessionKey, JSON.stringify(fallback));
    return fallback;
  }
}

export function loginAs(user: AppUser): AppUser {
  const normalized = normalizeUser(user) ?? user;
  localStorage.setItem(sessionKey, JSON.stringify(normalized));
  return normalized;
}

export function getSession(): AppUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(sessionKey);
  if (!raw) return null;

  try {
    const item = JSON.parse(raw) as AppUser;
    if (!item.role && (item as any).roleName) item.role = (item as any).roleName;
    if (!item.name) item.name = `${(item as any).firstName ?? ""} ${(item as any).lastName ?? ""}`.trim() || item.email;
    return item;
  } catch {
    localStorage.removeItem(sessionKey);
    return null;
  }
}

export async function logout(): Promise<void> {
  const session = getSession();
  try {
    await apiFetch("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken: session?.refreshToken ?? null }),
    });
  } catch {
    // Ignore logout errors and clear local state anyway.
  }
  localStorage.removeItem(sessionKey);
}

export function getDashboardRoute(user: AppUser | null | undefined): string {
  if (!user) return "/dashboard";
  const role = user.role || (user as any).roleName;
  switch (role) {
    case "system-admin":     return "/admin";
    case "hospital-manager": return "/hospital-manager";
    case "patient":          return "/patient-portal";
    default:                 return "/dashboard";
  }
}

export function canAccess(user: AppUser, module: string) {
  return roleDefinitions[user.role].modules.includes(module as never);
}
