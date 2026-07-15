"use client";

import { Phone, Send, Video } from "lucide-react";
import { useToast } from "@/lib/store";
import { SectionHeader } from "@/components/ui/shared";
import type { AppUser } from "@/types/hms";

export function TelemedicineModule({ user }: { user: AppUser }) {
  const { show } = useToast();

  return (
    <div className="grid cols-2">
      <section className="panel">
        <SectionHeader title="Virtual Consultation" />
        <p className="muted" style={{ marginBottom: 16 }}>
          Secure WebRTC video and voice calls with end-to-end encryption. Electronic prescriptions can be issued remotely with full EMR integration.
        </p>
        <div className="actions-row">
          <button className="button" type="button" onClick={() => show("Video session initiated — waiting for patient to connect", "info")}><Video size={16} /> Start video call</button>
          <button className="button secondary" type="button" onClick={() => show("Voice call initiated", "info")}><Phone size={16} /> Voice call</button>
          <button className="button secondary" type="button" onClick={() => show("Secure chat opened", "info")}><Send size={16} /> Secure message</button>
        </div>

        <div style={{ marginTop: 20, background: "#f7f9fb", border: "1px solid var(--line)", borderRadius: 10, padding: 16 }}>
          <SectionHeader title="Today's Teleconsultations" />
          <ul className="compact-list" style={{ marginTop: 10 }}>
            {[["Follow-up — Claudine Mutesi", "Completed"], ["Prescription renewal — Samuel Ndayisaba", "Scheduled 11:30"], ["Diabetes review — Esperance Kayitesi", "Scheduled 14:00"]].map(([k, v]) => (
              <li key={k}><span style={{ fontSize: 13 }}>{k}</span><span className={`status${v.startsWith("Scheduled") ? " warn" : ""}`}>{v}</span></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="panel">
        <SectionHeader title={user.role === "patient" ? "My Teleconsultations" : "Provider Queue"} />
        <ul className="compact-list">
          {[["Follow-up consultation", "Today 14:00"], ["Prescription renewal request", "Review pending"], ["Lab result discussion", "Scheduled Friday"]].map(([title, time]) => (
            <li key={title}><span>{title}</span><span className="status warn">{time}</span></li>
          ))}
        </ul>

        <div style={{ marginTop: 20 }}>
          <SectionHeader title="Platform Requirements" />
          <ul className="compact-list">
            {[["WebRTC encryption", "Active"], ["Consent recording", "Required"], ["e-Prescription", "Available"], ["EMR integration", "Live"], ["Recording (with consent)", "Optional"]].map(([k, v]) => (
              <li key={k}><span style={{ fontSize: 13 }}>{k}</span><span className="status">{v}</span></li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
