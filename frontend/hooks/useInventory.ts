import { useMemo } from "react";
import { useInventoryStore } from "@/lib/store";
import type { InventoryItem } from "@/types/hms";

export function useInventory() {
  const { items, add, updateQty } = useInventoryStore();

  const lowStock = useMemo(() => items.filter((item: InventoryItem) => item.quantity <= item.reorderLevel), [items]);

  return { items, lowStock, add, updateQty };
}
