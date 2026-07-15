"use client";

import { useState } from "react";
import { CheckCircle2, Download, Plus, RefreshCw } from "lucide-react";
import { useInventoryStore, useToast } from "@/lib/store";
import { Modal } from "@/components/ui/Modal";
import { SectionHeader, DataTable } from "@/components/ui/shared";
import type { InventoryItem } from "@/types/hms";

export function InventoryModule() {
  const { items, add } = useInventoryStore();
  const { show } = useToast();
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState<Partial<InventoryItem> & { allergies?: string; controlled?: boolean }>({
    name: "", category: "Other", batch: "", expiry: "", quantity: 0,
    reorderLevel: 0, unitCost: undefined, location: "", controlled: false,
  });

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const id = `i-${Date.now()}`;
    add({
      id,
      name: form.name ?? "",
      category: form.category ?? "Other",
      batch: form.batch ?? "",
      expiry: form.expiry ?? "",
      quantity: Number(form.quantity) || 0,
      reorderLevel: Number(form.reorderLevel) || 0,
      unitCost: form.unitCost ? Number(form.unitCost) : undefined,
      location: form.location ?? "",
      controlled: form.controlled ?? false,
    });
    show(`Item "${form.name}" added to inventory`, "success");
    setAddModal(false);
    setForm({ name: "", category: "Other", batch: "", expiry: "", quantity: 0, reorderLevel: 0, unitCost: undefined, location: "", controlled: false });
  }

  return (
    <div className="grid">
      <section className="panel">
        <SectionHeader title="Stock Management" badge={`${items.length} items`}
          action={<>
            <button className="button" type="button" onClick={() => setAddModal(true)}><Plus size={14} /> Add item</button>
            <button className="button secondary" type="button"><RefreshCw size={14} /> Stock count</button>
            <button className="button secondary" type="button"><Download size={14} /> Export</button>
          </>} />
        <DataTable
          headers={["Item", "Category", "Batch", "Expiry", "Qty", "Reorder Lvl", "Cost (RWF)", "Location", "Controlled", "Status"]}
          rows={items.map((i) => [
            i.name, i.category, i.batch, i.expiry, String(i.quantity), String(i.reorderLevel),
            i.unitCost ? i.unitCost.toLocaleString() : "—", i.location, i.controlled ? "Yes" : "No",
            i.quantity <= i.reorderLevel ? "Low stock" : "OK",
          ])}
          statusCol={9}
        />
      </section>

      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add Inventory Item"
        footer={<div className="actions-row"><button className="button" type="submit" form="inv-form"><CheckCircle2 size={14} /> Add item</button><button className="button secondary" type="button" onClick={() => setAddModal(false)}>Cancel</button></div>}>
        <form id="inv-form" onSubmit={handleAdd} className="form-grid">
          <label className="field" style={{ gridColumn: "1/-1" }}>Item Name * <input required value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label className="field">Category
            <select value={form.category ?? "Other"} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {["Antibiotic","Antimalarial","Antiviral","Analgesic","Cardiovascular","Respiratory","Diabetes","Vaccine","IV Fluid","Other"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="field">Batch Number * <input required value={form.batch ?? ""} onChange={(e) => setForm({ ...form, batch: e.target.value })} /></label>
          <label className="field">Expiry Date * <input required type="date" value={form.expiry ?? ""} onChange={(e) => setForm({ ...form, expiry: e.target.value })} /></label>
          <label className="field">Quantity * <input required type="number" min="0" value={String(form.quantity ?? 0)} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })} /></label>
          <label className="field">Reorder Level <input type="number" min="0" value={String(form.reorderLevel ?? 0)} onChange={(e) => setForm({ ...form, reorderLevel: parseInt(e.target.value) || 0 })} /></label>
          <label className="field">Unit Cost (RWF) <input type="number" value={form.unitCost !== undefined ? String(form.unitCost) : ""} onChange={(e) => setForm({ ...form, unitCost: e.target.value ? parseFloat(e.target.value) : undefined })} /></label>
          <label className="field">Storage Location <input value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Pharmacy Store A" /></label>
          <label className="field" style={{ gridColumn: "1/-1", flexDirection: "row", alignItems: "center", gap: 10 }}>
            <input type="checkbox" checked={form.controlled ?? false} onChange={(e) => setForm({ ...form, controlled: e.target.checked })} style={{ width: "auto" }} /> Controlled Substance
          </label>
        </form>
      </Modal>
    </div>
  );
}
