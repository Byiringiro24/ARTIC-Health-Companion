import { useMemo } from "react";
import { useLabStore } from "@/lib/store";
import type { LabRequest } from "@/types/hms";

export function useLabTests() {
  const { requests, add, updateStatus } = useLabStore();

  const pending = useMemo(() => requests.filter((request: LabRequest) => request.status !== "Completed"), [requests]);

  return { requests, pending, add, updateStatus };
}
