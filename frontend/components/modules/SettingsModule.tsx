"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/lib/store";
import { SectionHeader } from "@/components/ui/shared";

export function SettingsModule() {
  const { show } = useToast();
  const [settings, setSettings] = useState({
    facilityName: "Kigali District Hospital",
    mohCode: "KDH-001",
    province: "Kigali",
    district: "Gasabo",
    phone: "+250 788 000 001",
    email: "admin@kdh.gov.rw",
    timezone: "Africa/Kigali",
    currency: "RWF",
    vat: "18",
    language: "en",
  });

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    show("Facility settings saved", "success");
  }

  return (
    <div className="grid cols-2">
      <section className="panel">
        <SectionHeader title="Facility Settings" />
        <form onSubmit={handleSave} className="form-grid">
          <label className="field">Facility Name <input value={settings.facilityName} onChange={(e) => setSettings({ ...settings, facilityName: e.target.value })} /></label>
          <label className="field">MOH Facility Code <input value={settings.mohCode} onChange={(e) => setSettings({ ...settings, mohCode: e.target.value })} /></label>
          <label className="field">Province
            <select value={settings.province} onChange={(e) => setSettings({ ...settings, province: e.target.value })}>
              {["Kigali", "Eastern", "Western", "Northern", "Southern"].map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
          <label className="field">District <input value={settings.district} onChange={(e) => setSettings({ ...settings, district: e.target.value })} /></label>
          <label className="field">Phone <input value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} /></label>
          <label className="field">Email <input type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} /></label>
          <label className="field">Timezone <input value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} /></label>
          <label className="field">Currency <input value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} /></label>
          <label className="field">VAT (%) <input type="number" value={settings.vat} onChange={(e) => setSettings({ ...settings, vat: e.target.value })} /></label>
          <label className="field">Language
            <select value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })}>
              <option value="en">English</option>
              <option value="rw">Kinyarwanda</option>
              <option value="fr">Français</option>
            </select>
          </label>
          <button className="button" type="submit" style={{ gridColumn: "1/-1", marginTop: 8 }}>
            <CheckCircle2 size={14} /> Save settings
          </button>
        </form>
      </section>

      <div className="grid">
        <section className="panel">
          <SectionHeader title="Notifications &amp; Backup" />
          <ul className="compact-list">
            {[
              ["SMS reminders (Africa's Talking)", "Enabled"],
              ["Critical result escalation", "Enabled"],
              ["WhatsApp appointment reminders", "Enabled"],
              ["Daily backup to S3/MinIO (02:00)", "Scheduled"],
              ["Point-in-time recovery", "Configured"],
              ["Audit log retention (7 years)", "Enforced"],
            ].map(([k, v]) => (
              <li key={k}><span style={{ fontSize: 13 }}>{k}</span><span className="status">{v}</span></li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <SectionHeader title="Integration Endpoints" />
          <ul className="compact-list">
            {[
              ["NID/NIDA API", "Connected"],
              ["RSSB Insurance API", "Live"],
              ["MTN MoMo API", "Live"],
              ["Africa's Talking SMS", "Active"],
              ["SMTP Email", "Configured"],
            ].map(([k, v]) => (
              <li key={k}>
                <span style={{ fontSize: 13 }}>{k}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="status">{v}</span>
                  <button type="button" style={{ border: "none", background: "none", cursor: "pointer", color: "#027c8e", fontSize: 12 }}
                    onClick={() => show(`Testing ${k}…`, "info")}>
                    Test
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
