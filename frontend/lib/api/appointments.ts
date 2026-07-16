import type { Appointment } from "@/types/hms";
import { apiFetch } from "./client";

export async function getAppointments(accessToken?: string): Promise<Appointment[]> {
  return apiFetch<Appointment[]>("/api/appointments", {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
}
