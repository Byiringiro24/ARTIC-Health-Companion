"use client";

import { useState } from "react";
import { Edit2, Send } from "lucide-react";
import { notifications } from "@/lib/data";
import { useToast } from "@/lib/store";
import { SectionHeader, DataTable } from "@/components/ui/shared";

export function NotificationsModule() {
  const { show } = useToast();
  const [form, setForm] = useState({ recipient: "", channel: "SMS", priority: "Normal", message: "" });

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    show(`Message sent via ${form.channel} to ${form.recipient}`, "success");
    setForm({ recipient: "", channel: "SMS", priority: "Normal", message: "" });
  }

  return (
    <div className="grid">
      <section className="panel">
        <SectionHeader title="Notification Log"
          action={<button className="button secondary" type="button"><Send size={14} /> Send notification</button>} />
        <DataTable
          headers={["Time", "Type", "Title", "Recipient", "Channel", "Status"]}
          rows={notifications.map((n) => [n.sentAt, n.type, n.title, n.recipient, n.channel, n.status])}
          statusCol={5}
        />
      </section>

      <div className="grid cols-2">
        <section className="panel">
          <SectionHeader title="Send Message" />
          <form onSubmit={handleSend} style={{ display: "grid", gap: 12 }}>
            <label className="field">Recipient * <input required value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} placeholder="Patient / staff name or phone" /></label>
            <label className="field">Channel
              <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
                {["SMS", "Email", "WhatsApp", "In-App", "Push"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="field">Priority
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option>Normal</option><option>Urgent</option><option>Critical</option>
              </select>
            </label>
            <label className="field">Message * <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} placeholder="Enter message…" /></label>
            <button className="button" type="submit"><Send size={14} /> Send</button>
          </form>
        </section>

        <section className="panel">
          <SectionHeader title="Channel Status" />
          <ul className="compact-list">
            {[["SMS — Africa's Talking", "Active"], ["Email — SMTP/Nodemailer", "Active"], ["WhatsApp Business API", "Connected"], ["In-App — Socket.IO", "Live"], ["Push notifications", "Configured"]].map(([ch, status]) => (
              <li key={ch}><span style={{ fontSize: 13 }}>{ch}</span><span className="status">{status}</span></li>
            ))}
          </ul>
          <div style={{ marginTop: 16 }}>
            <SectionHeader title="Templates" />
            <ul className="compact-list">
              {["Appointment reminder (EN/FR/RW)", "Lab result notification", "Payment confirmation", "Prescription ready", "Critical alert — staff"].map((t) => (
                <li key={t}>
                  <span style={{ fontSize: 13 }}>{t}</span>
                  <button type="button" style={{ border: "none", background: "none", cursor: "pointer", color: "#027c8e", fontSize: 12 }} onClick={() => show("Template copied", "info")}>
                    <Edit2 size={13} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
