import { useMemo } from "react";
import { useBillingStore } from "@/lib/store";
import type { Invoice } from "@/types/hms";

export function useBilling() {
  const { invoices, add, recordPayment } = useBillingStore();

  const outstanding = useMemo(() => invoices.filter((invoice: Invoice) => invoice.status !== "Paid"), [invoices]);

  return { invoices, outstanding, add, recordPayment };
}
