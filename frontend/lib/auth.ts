"use client";

import { demoUsers, roleDefinitions } from "@/lib/data";
import type { AppUser } from "@/types/hms";

const sessionKey = "artic-health-session";

export function login(email: string, password: string): AppUser | null {
  const user = demoUsers.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password);
  if (!user) {
    return null;
  }

  localStorage.setItem(sessionKey, JSON.stringify(user));
  return user;
}

export function loginAs(user: AppUser): AppUser {
  localStorage.setItem(sessionKey, JSON.stringify(user));
  return user;
}

export function getSession(): AppUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(sessionKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AppUser;
  } catch {
    localStorage.removeItem(sessionKey);
    return null;
  }
}

export function logout() {
  localStorage.removeItem(sessionKey);
}

export function canAccess(user: AppUser, module: string) {
  return roleDefinitions[user.role].modules.includes(module as never);
}
