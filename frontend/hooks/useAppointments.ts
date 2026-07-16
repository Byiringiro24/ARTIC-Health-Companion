import { useMemo } from "react";
import { useAppointmentStore } from "@/lib/store";
import type { Appointment } from "@/types/hms";

export function useAppointments() {
  const { appointments, add, updateStatus, setAppointments } = useAppointmentStore();

  const upcoming = useMemo(() => appointments.slice(0, 6), [appointments]);

  return { appointments, upcoming, add, updateStatus, setAppointments };
}
