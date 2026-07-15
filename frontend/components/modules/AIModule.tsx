"use client";

import { Search, TrendingUp } from "lucide-react";
import { SectionHeader } from "@/components/ui/shared";

export function AIModule() {
  return (
    <div className="grid">
      <div className="grid cols-2">
        <section className="panel">
          <SectionHeader title="Clinical Decision Support" badge="AI-powered" />
          <ul className="compact-list">
            {[
              { a: "⚠ Penicillin allergy — β-lactam class contraindicated", d: "Active for Claudine Mutesi", tone: "danger" },
              { a: "💊 Drug interaction: Metformin + contrast dye", d: "Alert raised — Esperance Kayitesi", tone: "warn" },
              { a: "🚨 NEWS2 Sepsis score: 7 (High risk)", d: "Patrick Mugenzi — Urgent review", tone: "danger" },
              { a: "🔬 Malaria diagnosis suggestion — B54", d: "Confirmed by RDT — 92% confidence", tone: "" },
              { a: "📅 Follow-up reminder — 48h", d: "Malaria treatment monitoring", tone: "" },
            ].map(({ a, d, tone }) => (
              <li key={a}>
                <div>
                  <strong style={{ fontSize: 13 }}>{a}</strong>
                  <p className="muted" style={{ margin: "2px 0 0", fontSize: 12 }}>{d}</p>
                </div>
                {tone && <span className={`status ${tone}`}>{tone === "danger" ? "Alert" : "Warn"}</span>}
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <SectionHeader title="Predictive Analytics" />
          <ul className="compact-list">
            {[
              { p: "Bed demand forecast (next 7 days)", r: "Expected 88% occupancy — plan ahead" },
              { p: "Drug demand — Insulin Glargine", r: "Reorder needed within 5 days" },
              { p: "Readmission risk — Esperance Kayitesi", r: "28% risk — improve diabetes management" },
              { p: "Patient volume forecast", r: "+14% vs last week — schedule extra staff" },
              { p: "Staff overtime prediction", r: "3 nurses likely to exceed hours" },
            ].map(({ p, r }) => (
              <li key={p}>
                <div>
                  <strong style={{ fontSize: 13 }}>{p}</strong>
                  <p className="muted" style={{ margin: "2px 0 0", fontSize: 12 }}>{r}</p>
                </div>
                <TrendingUp size={14} color="#0f9f6e" />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="panel">
        <SectionHeader title="ICD-10 Coding Assistant" />
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <label className="field" style={{ flex: 1, margin: 0 }}>
            Enter symptom or condition
            <input placeholder="e.g. fever, headache, malaria, hypertension…" />
          </label>
          <button className="button" type="button"><Search size={14} /> Suggest ICD codes</button>
        </div>
        <div style={{ marginTop: 14 }}>
          <p className="muted" style={{ fontSize: 13 }}>Example suggestions:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {["B54 — Malaria, unspecified", "I10 — Essential hypertension", "E11 — Type 2 diabetes mellitus", "J06 — Acute upper respiratory infection", "A09 — Acute diarrhoea"].map((code) => (
              <span key={code} style={{ padding: "6px 12px", background: "#eef5f6", borderRadius: 20, fontSize: 13, cursor: "pointer", border: "1px solid var(--line)" }}>
                {code}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
