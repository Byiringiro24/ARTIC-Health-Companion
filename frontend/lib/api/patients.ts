import type { Patient } from "@/types/hms";
import { apiFetch } from "./client";

export async function getPatients(accessToken?: string): Promise<Patient[]> {
  const response = await apiFetch<{ success?: boolean; data?: Patient[]}>("/api/patients", {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  return response.data ?? [];
}
