import { useMemo } from "react";
import type { Prescription } from "@/types/hms";

export function usePrescriptions() {
  const prescriptions = useMemo<Prescription[]>(() => [], []);

  return { prescriptions };
}
