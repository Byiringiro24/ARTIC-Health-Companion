"use client";

import { useEffect, useState } from "react";
import { nursingApi, emrApi } from "@/lib/api/hms";
import { usePatientStore, useAppointmentStore, useToast } from "@/lib/store";

const TRIAGE_LEVELS = [
  { level: 1, label: "Level 1 — Resuscitation", color: "#c23b22", bg: "#fff1f0", hint: "Immediate — life threatening" },
  { level: 2, label: "Level 2 — Emergent",      color: "#b7791f", bg: "#fffbeb", hint: "Within 10–15 min" },
  { level: 3, label: "Level 3 — Urgent",         color: "#5b5fc7", bg: "#eef2ff", hint: "Within 30–60 min" },
  { level: 4, label: "Level 4 — Less Urgent",    color: "#0f9f6e", bg: "#f0faf9", hint: "Within 1–2 hours" },
  { level: 5, label: "Level 5 — Non-Urgent",     color: "#027c8e", bg: "#f0f9fa", hint: "2+ hours" },
];

export default function TriagePage() {
  const { patients } = usePatientStore();
  const { appointments } = useAppointmentStore();
  const { show } = useToast();

  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [triageLevel, setTriageLevel] = useState(3);
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [allergiesNoted, setAllergiesNoted] = useState("");
  const [notes, setNotes] = useState("");
  const [vitals, setVitals] = useState({ temperature:"", systolicBp:"", diastolicBp:"", heartRate:"", respiratoryRate:"", oxygenSaturation:"", weight:"", painScore:"" });
  const [submitting, setSubmitting] = useState(false);
  const [todayTriages, setTodayTriages] = useState<any[]>([]);

  const todayWaiting = appointments.filter(a =>
    (a.status === "Checked In" || a.status === "Waiting") &&
    a.date === new Date().toISOString().slice(0,10)
  );

  const filteredPatients = patients.filter(p =>
    patientSearch && (
      p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.mrn.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.nid?.includes(patientSearch)
    )
  );

  useEffect(() => {
    nursingApi.getTriageList({}).then(setTodayTriages).catch(() => {});
  }, []);

  async function submitTriage() {
    if (!selectedPatient) { show("Select a patient", "warning"); return; }
    if (!chiefComplaint)  { show("Enter chief complaint", "warning"); return; }
    setSubmitting(true);
    try {
      // Record vitals first
      let vitalsId: string | undefined;
      const hasVitals = Object.values(vitals).some(v => v !== "");
      if (hasVitals) {
        const v: any = await emrApi.recordVitals({
          patientId: selectedPatient.id,
          temperature:       vitals.temperature       ? parseFloat(vitals.temperature)       : undefined,
          systolicBp:        vitals.systolicBp        ? parseInt(vitals.systolicBp)          : undefined,
          diastolicBp:       vitals.diastolicBp       ? parseInt(vitals.diastolicBp)         : undefined,
          heartRate:         vitals.heartRate         ? parseInt(vitals.heartRate)           : undefined,
          respiratoryRate:   vitals.respiratoryRate   ? parseInt(vitals.respiratoryRate)     : undefined,
          oxygenSaturation:  vitals.oxygenSaturation  ? parseFloat(vitals.oxygenSaturation)  : undefined,
          weightKg:          vitals.weight            ? parseFloat(vitals.weight)            : undefined,
          painScore:         vitals.painScore         ? parseInt(vitals.painScore)           : undefined,
        });
        vitalsId = v?.id;
      }

      // Record triage
      const appt = appointments.find(a => a.patientId === selectedPatient.id && a.date === new Date().toISOString().slice(0,10));
      await nursingApi.triage({
        patientId: selectedPatient.id,
        appointmentId: appt?.id,
        triageLevel,
        chiefComplaint,
        vitalsId,
        allergiesNoted,
        notes,
      });

      show(`Triage recorded for ${selectedPatient.name} — Level ${triageLevel}`, triageLevel <= 2 ? "error" : "success");

      // Reset
      setSelectedPatient(null); setPatientSearch("");
      setChiefComplaint(""); setAllergiesNoted(""); setNotes("");
      setVitals({ temperature:"", systolicBp:"", diastolicBp:"", heartRate:"", respiratoryRate:"", oxygenSaturation:"", weight:"", painScore:"" });
      setTriageLevel(3);

      const updated = await nursingApi.getTriageList({});
      setTodayTriages(Array.isArray(updated) ? updated : []);
    } catch (e: any) {
      show(e.message || "Failed to record triage", "error");
    } finally { setSubmitting(false); }
  }

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:16, height:"calc(100vh - 140px)" }}>
      {/* Left: triage form */}
      <div style={{ overflowY:"auto", display:"flex", flexDirection:"column", gap:14 }}>
        <h2 style={{ margin:0, fontSize:17, fontWeight:700 }}>Triage Assessment</h2>

        {/* Patient search */}
        <div style={{ position:"relative" }}>
          <input value={patientSearch} onChange={e=>setPatientSearch(e.target.value)}
            placeholder="Search patient by name, MRN, or NID…"
            style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1px solid var(--line,#e5)", fontSize:13 }} />
          {filteredPatients.length > 0 && !selectedPatient && (
            <div style={{ position:"absolute", top:"100%", left:0, right:0, background:"white", border:"1px solid var(--line,#e5)", borderRadius:8, zIndex:100, boxShadow:"0 4px 16px rgba(0,0,0,0.1)" }}>
              {filteredPatients.slice(0,5).map(p => (
                <div key={p.id} onClick={() => { setSelectedPatient(p); setPatientSearch(p.name); setAllergiesNoted(p.allergies?.join(", ")||""); }}
                  style={{ padding:"10px 14px", cursor:"pointer", borderBottom:"1px solid var(--line,#e5)", fontSize:13 }}
                  onMouseEnter={e=>(e.currentTarget.style.background="#f9fafb")}
                  onMouseLeave={e=>(e.currentTarget.style.background="white")}>
                  <strong>{p.name}</strong> <span style={{ color:"#6b7280" }}>{p.mrn} · {p.gender} · {p.insurance}</span>
                  {p.allergies?.length > 0 && <span style={{ color:"#c23b22", fontSize:11, marginLeft:8 }}>⚠ {p.allergies.join(", ")}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
        {selectedPatient && (
          <div style={{ background:"#f0faf9", border:"1px solid #a7f3d0", borderRadius:8, padding:"8px 12px", fontSize:13, display:"flex", justifyContent:"space-between" }}>
            <span>✓ <strong>{selectedPatient.name}</strong> · {selectedPatient.mrn}</span>
            <button onClick={()=>{setSelectedPatient(null);setPatientSearch("");}} style={{ border:"none",background:"none",cursor:"pointer",color:"#c23b22",fontSize:16 }}>✕</button>
          </div>
        )}

        {/* Triage level */}
        <div>
          <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>Triage Level *</label>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {TRIAGE_LEVELS.map(t => (
              <div key={t.level} onClick={() => setTriageLevel(t.level)}
                style={{ padding:"10px 12px", border:`2px solid ${triageLevel===t.level?t.color:"var(--line,#e5)"}`, borderRadius:10, cursor:"pointer", background:triageLevel===t.level?t.bg:"white" }}>
                <div style={{ fontWeight:700, color:t.color, fontSize:13 }}>{t.label}</div>
                <div style={{ fontSize:11, color:"#6b7280" }}>{t.hint}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Chief complaint */}
        <label style={{ display:"flex",flexDirection:"column",gap:4,fontSize:13 }}>
          Chief Complaint *
          <input value={chiefComplaint} onChange={e=>setChiefComplaint(e.target.value)}
            placeholder="Patient's main reason for visit…"
            style={{ padding:8,borderRadius:8,border:"1px solid var(--line,#e5)" }} />
        </label>

        {/* Vitals */}
        <div>
          <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>Vital Signs</label>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
            {[
              ["temperature","Temp (°C)"],["systolicBp","Systolic BP"],["diastolicBp","Diastolic BP"],["heartRate","HR (bpm)"],
              ["respiratoryRate","RR (breaths/min)"],["oxygenSaturation","SpO₂ (%)"],["weight","Weight (kg)"],["painScore","Pain (0–10)"]
            ].map(([k,label]) => (
              <label key={k} style={{ display:"flex",flexDirection:"column",gap:3,fontSize:12 }}>
                {label}
                <input value={(vitals as any)[k]} onChange={e=>setVitals(v=>({...v,[k]:e.target.value}))} type="number"
                  style={{ padding:6,borderRadius:6,border:"1px solid var(--line,#e5)",fontSize:12 }} />
              </label>
            ))}
          </div>
        </div>

        <label style={{ display:"flex",flexDirection:"column",gap:4,fontSize:13 }}>
          Known Allergies (confirm or update)
          <input value={allergiesNoted} onChange={e=>setAllergiesNoted(e.target.value)}
            placeholder="e.g. Penicillin, Sulfa…" style={{ padding:8,borderRadius:8,border:"1px solid var(--line,#e5)" }} />
        </label>
        <label style={{ display:"flex",flexDirection:"column",gap:4,fontSize:13 }}>
          Nursing Notes
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2}
            style={{ padding:8,borderRadius:8,border:"1px solid var(--line,#e5)",resize:"vertical" }} />
        </label>

        <button onClick={submitTriage} disabled={submitting}
          style={{ padding:"11px 28px",background:submitting?"#9ca3af":"#027c8e",color:"white",border:"none",borderRadius:8,cursor:submitting?"not-allowed":"pointer",fontWeight:700,fontSize:14 }}>
          {submitting ? "Saving…" : "Record Triage & Vitals"}
        </button>
      </div>

      {/* Right: today's queue */}
      <div style={{ background:"white",border:"1px solid var(--line,#e5)",borderRadius:12,padding:16,overflowY:"auto" }}>
        <h3 style={{ margin:"0 0 12px",fontSize:15,fontWeight:700 }}>Waiting for Triage ({todayWaiting.length})</h3>
        {todayWaiting.map(a => (
          <div key={a.id} onClick={() => { const p = patients.find(pt=>pt.id===a.patientId); if(p){setSelectedPatient(p);setPatientSearch(p.name);} }}
            style={{ padding:"10px 12px",borderBottom:"1px solid var(--line,#e5)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:13 }}>
            <div>
              <strong>{a.patient}</strong>
              <div style={{ color:"#6b7280",fontSize:11 }}>{a.queue} · {a.time} · {a.department}</div>
            </div>
            <span style={{ fontSize:12,fontWeight:600,color:a.priority==="Emergency"?"#c23b22":a.priority==="Urgent"?"#b7791f":"#027c8e" }}>{a.priority}</span>
          </div>
        ))}
        {todayWaiting.length === 0 && <p style={{ color:"#9ca3af",fontSize:13 }}>No patients waiting for triage.</p>}

        <h3 style={{ margin:"16px 0 12px",fontSize:15,fontWeight:700 }}>Today's Triage ({todayTriages.length})</h3>
        {todayTriages.map((t:any) => (
          <div key={t.id} style={{ padding:"8px 12px",borderBottom:"1px solid var(--line,#e5)",fontSize:12 }}>
            <div style={{ display:"flex",justifyContent:"space-between" }}>
              <strong>{t.patient_name || t.patientName}</strong>
              <span style={{ color:TRIAGE_LEVELS[t.triage_level-1]?.color||"#333",fontWeight:700 }}>L{t.triage_level}</span>
            </div>
            <div style={{ color:"#6b7280" }}>{t.chief_complaint}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
