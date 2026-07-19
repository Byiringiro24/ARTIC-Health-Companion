"use client";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";
import type { AppUser } from "@/types/hms";
import {
  DoctorWidgets, NurseWidgets, PharmacistWidgets, LabWidgets,
  AccountantWidgets, ReceptionWidgets, DefaultWidgets,
} from "./widgets/DoctorWidgets";

// Role → widget component map
const ROLE_WIDGETS: Record<string, React.ReactNode> = {
  "doctor":           <DoctorWidgets />,
  "medical-director": <DoctorWidgets />,
  "nurse":            <NurseWidgets />,
  "pharmacist":       <PharmacistWidgets />,
  "laboratory":       <LabWidgets />,
  "accountant":       <AccountantWidgets />,
  "cashier":          <AccountantWidgets />,
  "receptionist":     <ReceptionWidgets />,
};

export default function DashboardPage() {
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    setUser(getSession());
  }, []);

  if (!user) return null;

  const widgets = ROLE_WIDGETS[user.role] ?? <DefaultWidgets />;
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ padding: "0 0 32px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
          {greeting}, {user.firstName ?? user.name?.split(" ")[0] ?? "User"} 👋
        </h1>
        <p style={{ color: "#6b7280", fontSize: 14, margin: "4px 0 0" }}>
          {user.roleLabel ?? user.role} — Kigali District Hospital
        </p>
      </div>
      {widgets}
    </div>
  );
}
