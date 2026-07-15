"use client";

import { useState } from "react";
import { CheckCircle2, Download, Eye, Plus, Printer } from "lucide-react";
import { useBillingStore, useToast } from "@/lib/store";
import { Modal } from "@/components/ui/Modal";
import { SectionHeader, DataTable, StatCard } from "@/components/ui/shared";
import type { AppUser, Invoice } from "@/types/hms";

export function BillingModule({ user }: { user: AppUser }) {
  const { invoices, recordPayment } = useBillingStore();
  const { show } = useToast();
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);
  const [payModal, setPayModal] = useState(false);
  const [payForm, setPayForm] = useState({ amount: "", method: "Cash" as Invoice["paymentMethod"] });

  const visible = user.role === "patient" ? invoices.filter((i) => i.patientId === user.patientId) : invoices;
  const totalRevenue = visible.reduce((s, i) => s + i.paid, 0);
  const totalOutstanding = visible.reduce((s, i) => s + (i.amount - i.paid), 0);

  function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!detailInvoice) return;
    const amt = parseFloat(payForm.amount);
    if (isNaN(amt) || amt <= 0) { show("Enter a valid amount", "error"); return; }
    recordPayment(detailInvoice.number, amt, payForm.method ?? "Cash");
    show(`RWF ${amt.toLocaleString()} recorded on ${detailInvoice.number}`, "success");
    setPayModal(false);
    setPayForm({ amount: "", method: "Cash" });
  }

  // Detail view
  if (detailInvoice) {
    const fresh = invoices.find((i) => i.number === detailInvoice.number) ?? detailInvoice;
    return (
      <div className="grid">
        <div className="actions-row">
          <button className="button secondary" type="button" onClick={() => setDetailInvoice(null)}>← Back to Billing</button>
          <h2 style={{ margin: 0 }}>{fresh.number}</h2>
          <span className={`status${fresh.status === "Unpaid" ? " danger" : fresh.status === "Partially Paid" ? " warn" : ""}`}>{fresh.status}</span>
          <span style={{ marginLeft: "auto" }} />
          {fresh.status !== "Paid" && <button className="button" type="button" onClick={() => setPayModal(true)}><Plus size={14} /> Record payment</button>}
          <button className="button secondary" type="button"><Printer size={14} /> Print receipt</button>
        </div>
        <div className="grid cols-2">
          <section className="panel">
            <SectionHeader title="Invoice Details" />
            <ul className="compact-list">
              <li><span>Patient</span><strong>{fresh.patient}</strong></li>
              <li><span>Date</span><strong>{fresh.date}</strong></li>
              <li><span>Payer</span><strong>{fresh.payer}</strong></li>
              <li><span>Total</span><strong>RWF {fresh.amount.toLocaleString()}</strong></li>
              <li><span>Paid</span><strong style={{ color: "#0f9f6e" }}>RWF {fresh.paid.toLocaleString()}</strong></li>
              <li><span>Balance</span><strong style={{ color: fresh.amount - fresh.paid > 0 ? "#c23b22" : "#0f9f6e" }}>RWF {(fresh.amount - fresh.paid).toLocaleString()}</strong></li>
              <li><span>Claim status</span><span className={`status${String(fresh.claimStatus) === "Denied" ? " danger" : String(fresh.claimStatus) === "Submitted" ? " warn" : ""}`}>{String(fresh.claimStatus)}</span></li>
            </ul>
          </section>
          <section className="panel">
            <SectionHeader title="Line Items" />
            <DataTable
              headers={["Service", "Category", "Qty", "Unit (RWF)", "Total (RWF)", "Insurance", "Co-pay"]}
              rows={(fresh.items ?? []).map((item) => [
                item.service, item.category, String(item.quantity),
                item.unitPrice.toLocaleString(), item.total.toLocaleString(),
                item.insuranceCover ? item.insuranceCover.toLocaleString() : "—",
                item.patientCopay ? item.patientCopay.toLocaleString() : "—",
              ])}
            />
          </section>
        </div>

        <Modal open={payModal} onClose={() => setPayModal(false)} title="Record Payment"
          footer={<div className="actions-row"><button className="button" type="submit" form="pay-form"><CheckCircle2 size={14} /> Record payment</button><button className="button secondary" type="button" onClick={() => setPayModal(false)}>Cancel</button></div>}>
          <form id="pay-form" onSubmit={handlePayment} style={{ display: "grid", gap: 12 }}>
            <div style={{ background: "#f7f9fb", padding: "10px 14px", borderRadius: 8, fontSize: 13 }}>
              Balance due: <strong style={{ color: "#c23b22" }}>RWF {(fresh.amount - fresh.paid).toLocaleString()}</strong>
            </div>
            <label className="field">Amount (RWF) * <input required type="number" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} min="1" /></label>
            <label className="field">Payment Method
              <select value={payForm.method ?? "Cash"} onChange={(e) => setPayForm({ ...payForm, method: e.target.value as Invoice["paymentMethod"] })}>
                {["Cash", "MTN MoMo", "Airtel Money", "Bank Card", "Insurance", "Bank Transfer"].map((m) => <option key={m}>{m}</option>)}
              </select>
            </label>
          </form>
        </Modal>
      </div>
    );
  }

  return (
    <div className="grid">
      <div className="grid cols-4">
        <StatCard label="Total Invoiced" value={`RWF ${visible.reduce((s, i) => s + i.amount, 0).toLocaleString()}`} tone="good" />
        <StatCard label="Collected" value={`RWF ${totalRevenue.toLocaleString()}`} tone="good" />
        <StatCard label="Outstanding" value={`RWF ${totalOutstanding.toLocaleString()}`} tone={totalOutstanding > 0 ? "danger" : "good"} />
        <StatCard label="Invoices" value={String(visible.length)} tone="good" />
      </div>

      <section className="panel">
        <SectionHeader title="Invoices" badge={String(visible.length)}
          action={<><button className="button" type="button"><Plus size={14} /> Generate invoice</button><button className="button secondary" type="button"><Download size={14} /> Export</button></>} />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>{["Invoice", "Patient", "Date", "Payer", "Amount", "Paid", "Balance", "Status", "Claim", ""].map((h) => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {visible.map((inv) => (
                <tr key={inv.number} style={{ cursor: "pointer" }} onClick={() => setDetailInvoice(inv)}>
                  <td style={{ fontSize: 12 }}>{inv.number}</td>
                  <td><strong>{inv.patient}</strong></td>
                  <td style={{ fontSize: 12 }}>{inv.date}</td>
                  <td>{inv.payer}</td>
                  <td>RWF {inv.amount.toLocaleString()}</td>
                  <td style={{ color: "#0f9f6e" }}>RWF {inv.paid.toLocaleString()}</td>
                  <td style={{ color: inv.amount - inv.paid > 0 ? "#c23b22" : undefined }}>RWF {(inv.amount - inv.paid).toLocaleString()}</td>
                  <td><span className={`status${inv.status === "Unpaid" ? " danger" : inv.status === "Partially Paid" ? " warn" : ""}`}>{inv.status}</span></td>
                  <td><span className={`status${String(inv.claimStatus) === "Denied" ? " danger" : String(inv.claimStatus) === "Submitted" ? " warn" : ""}`}>{String(inv.claimStatus)}</span></td>
                  <td><button type="button" style={{ border: "none", background: "none", cursor: "pointer", color: "#027c8e" }} onClick={(e) => { e.stopPropagation(); setDetailInvoice(inv); }}><Eye size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
