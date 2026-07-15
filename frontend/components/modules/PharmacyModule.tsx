"use client";

import { useState } from "react";
import { AlertTriangle, Clock, Download, Package, Plus, Send } from "lucide-react";
import { useInventoryStore, useToast } from "@/lib/store";
import { Modal } from "@/components/ui/Modal";
import { SectionHeader, DataTable, StatCard } from "@/components/ui/shared";

export function PharmacyModule() {
  const { items, updateQty } = useInventoryStore();
  const { show } = useToast();
  const [receiveModal, setReceiveModal] = useState(false);
  const [dispenseModal, setDispenseModal] = useState(false);
  const [receiveForm, setReceiveForm] = useState({ item: "", qty: "", batch: "", expiry: "", supplier: "", unitCost: "" });
  const [dispenseItemId, setDispenseItemId] = useState("");

  const lowStock = items.filter((i) => i.quantity <= i.reorderLevel);
  const expirySoon = items.filter((i) => {
    const d = new Date(i.expiry);
    const diff = (d.getTime() - Date.now()) / 86400000;
    return diff > 0 && diff <= 60;
  });

  function handleReceive(e: React.FormEvent) {
    e.preventDefault();
    const it = items.find((i) => i.name === receiveForm.item);
    if (it) updateQty(it.id, it.quantity + parseInt(receiveForm.qty || "0"));
    show(`Stock received: ${receiveForm.item} — ${receiveForm.qty} units`, "success");
    setReceiveModal(false);
    setReceiveForm({ item: "", qty: "", batch: "", expiry: "", supplier: "", unitCost: "" });
  }

  function handleDispense() {
    const it = items.find((i) => i.id === dispenseItemId);
    if (!it) return;
    if (it.quantity === 0) { show("Out of stock", "error"); return; }
    updateQty(it.id, it.quantity - 1);
    show(`Dispensed 1 unit of ${it.name}`, "success");
    setDispenseModal(false);
  }

  return (
    <div className="grid">
      <div className="grid cols-3">
        <StatCard label="Total Drug Lines" value={String(items.length)} tone="good" icon={<Package size={22} color="#027c8e" />} />
        <StatCard label="Low Stock Alerts" value={String(lowStock.length)} tone={lowStock.length > 0 ? "danger" : "good"} icon={<AlertTriangle size={22} color={lowStock.length > 0 ? "#c23b22" : "#0f9f6e"} />} />
        <StatCard label="Expiry Warnings (≤60d)" value={String(expirySoon.length)} tone={expirySoon.length > 0 ? "warn" : "good"} icon={<Clock size={22} color={expirySoon.length > 0 ? "#b7791f" : "#0f9f6e"} />} />
      </div>

      <section className="panel">
        <SectionHeader title="Drug Inventory (FEFO)" badge={`${items.length} items`}
          action={<>
            <button className="button" type="button" onClick={() => setReceiveModal(true)}><Plus size={14} /> Receive stock</button>
            <button className="button secondary" type="button" onClick={() => setDispenseModal(true)}><Send size={14} /> Dispense</button>
            <button className="button secondary" type="button"><Download size={14} /> Reorder list</button>
          </>} />
        <DataTable
          headers={["Drug", "Category", "Batch", "Expiry", "Qty", "Reorder", "Cost (RWF)", "Location", "Controlled", "Status"]}
          rows={items.map((i) => [
            i.name, i.category, i.batch, i.expiry, String(i.quantity), String(i.reorderLevel),
            i.unitCost ? i.unitCost.toLocaleString() : "—", i.location, i.controlled ? "Yes" : "No",
            i.quantity <= i.reorderLevel ? "Low stock" : i.quantity <= i.reorderLevel * 1.3 ? "Near reorder" : "OK",
          ])}
          statusCol={9}
        />
      </section>

      <section className="panel">
        <SectionHeader title="Pending Prescriptions — Dispensing Queue" />
        <DataTable
          headers={["Rx ID", "Patient", "Drug", "Dose / Route / Freq", "Qty", "Doctor", "Status"]}
          rows={[
            ["RX-2026-0401", "Patrick Mugenzi", "Morphine 10mg/mL Inj", "1 amp IV / PRN", "2", "Dr. Grace Mukamana", "Awaiting dual verify"],
            ["RX-2026-0402", "Claudine Mutesi", "Amlodipine 5mg", "1 tab Oral / OD", "30", "Dr. Grace Mukamana", "Ready"],
            ["RX-2026-0403", "Samuel Ndayisaba", "ACT 80/480mg", "4 tabs Oral / BID", "24", "Dr. Grace Mukamana", "Ready"],
          ]}
          statusCol={6}
        />
      </section>

      {/* Receive stock modal */}
      <Modal open={receiveModal} onClose={() => setReceiveModal(false)} title="Receive Stock"
        footer={<div className="actions-row"><button className="button" type="submit" form="recv-form">Receive stock</button><button className="button secondary" type="button" onClick={() => setReceiveModal(false)}>Cancel</button></div>}>
        <form id="recv-form" onSubmit={handleReceive} className="form-grid">
          <label className="field" style={{ gridColumn: "1/-1" }}>Drug *
            <select required value={receiveForm.item} onChange={(e) => setReceiveForm({ ...receiveForm, item: e.target.value })}>
              <option value="">— Select drug —</option>
              {items.map((i) => <option key={i.id} value={i.name}>{i.name}</option>)}
            </select>
          </label>
          <label className="field">Quantity * <input required type="number" min="1" value={receiveForm.qty} onChange={(e) => setReceiveForm({ ...receiveForm, qty: e.target.value })} /></label>
          <label className="field">Batch Number * <input required value={receiveForm.batch} onChange={(e) => setReceiveForm({ ...receiveForm, batch: e.target.value })} /></label>
          <label className="field">Expiry Date * <input required type="date" value={receiveForm.expiry} onChange={(e) => setReceiveForm({ ...receiveForm, expiry: e.target.value })} /></label>
          <label className="field">Supplier <input value={receiveForm.supplier} onChange={(e) => setReceiveForm({ ...receiveForm, supplier: e.target.value })} /></label>
          <label className="field">Unit Cost (RWF) <input type="number" value={receiveForm.unitCost} onChange={(e) => setReceiveForm({ ...receiveForm, unitCost: e.target.value })} /></label>
        </form>
      </Modal>

      {/* Dispense modal */}
      <Modal open={dispenseModal} onClose={() => setDispenseModal(false)} title="Dispense Medication"
        footer={<div className="actions-row"><button className="button" type="button" onClick={handleDispense}>Confirm dispense</button><button className="button secondary" type="button" onClick={() => setDispenseModal(false)}>Cancel</button></div>}>
        <div style={{ display: "grid", gap: 12 }}>
          <label className="field">Drug to dispense
            <select value={dispenseItemId} onChange={(e) => setDispenseItemId(e.target.value)}>
              <option value="">— Select drug —</option>
              {items.map((i) => <option key={i.id} value={i.id}>{i.name} — Stock: {i.quantity}</option>)}
            </select>
          </label>
          <label className="field">Quantity <input type="number" defaultValue="1" min="1" /></label>
          <label className="field">Patient <input placeholder="Patient MRN or name" /></label>
          <label className="field">Prescription ID <input placeholder="Rx ID" /></label>
          {items.find((i) => i.id === dispenseItemId)?.controlled && (
            <div style={{ background: "#fff0ed", border: "1px solid #c23b2244", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
              ⚠ <strong>Controlled substance</strong> — dual pharmacist verification required.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
