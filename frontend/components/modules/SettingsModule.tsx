"use client";

import { useState } from "react";
import { CheckCircle2, User, Bell, Globe, Link } from "lucide-react";
import { useToast } from "@/lib/store";
import { getSession } from "@/lib/auth";
import { SectionHeader } from "@/components/ui/shared";
import { OTPPasswordChange } from "@/components/ui/OTPPasswordChange";

export function SettingsModule() {
  const { show } = useToast();
  const session = getSession();
  const [settings, setSettings] = useState({
    facilityName: session?.facility || "Kigali District Hospital",
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
    <div style={{ display: "grid", gap: 20 }}>

      {/* ── Password Change (OTP) ─────────────────────────────────────────── */}
      <OTPPasswordChange
        userEmail={session?.email}
        onSuccess={() => show("Password changed — logging out…", "success")}
      />

      {/* ── Profile ──────────────────────────────────────────────────────── */}
      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <User size={15} color="#027c8e" />
          <SectionHeader title="Your Profile" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {[
            { l: "Full Name",   v: session?.name || "—" },
            { l: "Email",       v: session?.email || "—" },
            { l: "Role",        v: session?.roleLabel || session?.roleName || session?.role || "—" },
            { l: "Department",  v: session?.department || "—" },
            { l: "Facility",    v: session?.facility || "—" },
          ].map(f => (
            <div key={f.l} style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: 9, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.l}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginTop: 2 }}>{f.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Facility Settings ─────────────────────────────────────────────── */}
      <section className="panel" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Globe size={15} color="#027c8e" />
          <SectionHeader title="Facility Settings" />
        </div>
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

      {/* ── Notifications & Backup ────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Bell size={15} color="#027c8e" />
            <SectionHeader title="Notifications & Backup" />
          </div>
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

        <section className="panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Link size={15} color="#027c8e" />
            <SectionHeader title="Integration Endpoints" />
          </div>
          <ul className="compact-list">
            {[
              ["NID/NIDA API", "Connected"],
              ["RSSB Insurance API", "Live"],
              ["MTN MoMo API", "Live"],
              ["Africa's Talking SMS", "Active"],
              ["SMTP Email (Gmail)", "Configured"],
              ["Gemini AI", "Active"],
            ].map(([k, v]) => (
              <li key={k}>
                <span style={{ fontSize: 13 }}>{k}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="status">{v}</span>
                  <button type="button" style={{ border: "none", background: "none", cursor: "pointer", color: "#027c8e", fontSize: 12 }}
                    onClick={() => show(`Testing ${k}…`, "info")}>Test</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
