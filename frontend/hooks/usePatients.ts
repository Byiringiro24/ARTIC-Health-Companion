import { useMemo } from "react";
import { usePatientStore } from "@/lib/store";
import type { Patient } from "@/types/hms";

export function usePatients() {
  const { patients, selected, query, setQuery, select, add, update, setPatients } = usePatientStore();

  const filtered = useMemo(() => {
    if (!query) return patients;
    const term = query.toLowerCase();
    return patients.filter((patient: Patient) => [patient.name, patient.mrn, patient.nid, patient.phone].some((value) => value.toLowerCase().includes(term)));
  }, [patients, query]);

  return { patients: filtered, selected, query, setQuery, select, add, update, setPatients };
}
