"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { emrApi, labApi, pharmacyApi, inpatientApi } from "@/lib/api/hms";
import { useToast } from "@/lib/store";
import { AlertCircle, FlaskConical, Pill, FileText, Activity, ArrowLeft } from "lucide-react";

const ROUTES = ["Oral","IV","IM","SC","Topical","Inhaled","Sublingual"] as const;
const FREQ   = ["OD","BID","TID","QID","PRN","Stat","Weekly"] as const;

export default function PatientConsultationPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const router = useRouter();
  const { show } = useToast();

  const [summary, setSummary]         = useState<any>(null);
  const [vitals, setVitals]           = useState<any>(null);
  const [notes, setNotes]             = useState<any[]>([]);
  const [tab, setTab]                 = useState<"soap"|"rx"|"lab"|"admit">("soap");
  const [loading, setLoading]         = useState(true);

  // SOAP form
  const [soap, setSoap] = useState({ subjective:"", objective:"", assessment:"", plan:"", noteType:"general" });
  const [diagnoses, setDiagnoses] = useState<{ icdCode: string; description: string; type: string }[]>([]);
  const [icdSearch, setIcdSearch] = useState("");

  // Prescription form
  const [rxItems, setRxItems] = useState<any[]>([]);
  const [drugSearch, setDrugSearch] = useState("");

  // Lab order form
  const [labPanel, setLabPanel] = useState("");
  const [labTest, setLabTest]   = useState("");
  const [labUrgency, setLabUrgency] = useState("routine");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [sumData, noteData, vitalData] = await Promise.all([
          emrApi.getPatientSummary(patientId),
          emrApi.getPatientNotes(patientId),
          emrApi.getPatientVitals(patientId),
        ]);
        setSummary(sumData);
        setNotes(Array.isArray(noteData) ? noteData : []);
        setVitals(Array.isArray(vitalData) && vitalData.length > 0 ? vitalData[0] : null);
      } catch { show("Could not load patient data", "error"); }
      finally { setLoading(false); }
    }
    if (patientId) load();
  }, [patientId]);

  async function saveNote() {
    if (!soap.subjective && !soap.assessment) { show("Add at least Subjective or Assessment", "warning"); return; }
    try {
      await emrApi.createNote({ patientId, ...soap, diagnoses });
      show("SOAP note saved", "success");
      setSoap({ subjective:"", objective:"", assessment:"", plan:"", noteType:"general" });
      setDiagnoses([]);
      const updated = await emrApi.getPatientNotes(patientId);
      setNotes(Array.isArray(updated) ? updated : []);
    } catch { show("Failed to save note", "error"); }
  }

  async function sendPrescription() {
    if (!rxItems.length) { show("Add at least one drug", "warning"); return; }
    try {
      await pharmacyApi.createRx({ patientId, items: rxItems });
      show(`Prescription sent to pharmacy (${rxItems.length} item${rxItems.length>1?"s":""})`, "success");
      setRxItems([]);
    } catch { show("Failed to send prescription", "error"); }
  }

  async function orderLabTest() {
    if (!labTest) { show("Select a test", "warning"); return; }
    try {
      await labApi.create({ patientId, testName: labTest, testPanel: labPanel, urgency: labUrgency });
      show(`Lab order sent: ${labTest}`, "success");
      setLabTest(""); setLabPanel("");
    } catch { show("Failed to order lab test", "error"); }
  }

  function addRxItem() {
    if (!drugSearch) return;
    setRxItems(prev => [...prev, { drug: drugSearch, genericName: drugSearch, dosage: "", route: "Oral", frequency: "OD", duration: "7 days", quantity: 7, instructions: "" }]);
    setDrugSearch("");
  }

  function addDiagnosis() {
    if (!icdSearch) return;
    setDiagnoses(prev => [...prev, { icdCode: icdSearch, description: icdSearch, type: "Primary" }]);
    setIcdSearch("");
  }

  if (loading) return <div style={{ padding: 32, color: "#60717c" }}>Loading patient…</div>;
  if (!summary) return <div style={{ padding: 32, color: "#c23b22" }}>Patient not found.</div>;

  const hasAllergies = summary.allergies?.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Back + header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ border: "1px solid var(--line,#e5)", borderRadius: 8, padding: "6px 12px", background: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{summary.fullName}</h2>
          <span style={{ fontSize: 13, color: "#60717c" }}>{summary.mrn} · {summary.gender} · DOB: {summary.dateOfBirth}</span>
        </div>
        {hasAllergies && (
          <span style={{ marginLeft: "auto", background: "#fff1f0", color: "#c23b22", border: "1px solid #fca5a5", borderRadius: 8, padding: "4px 12px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            <AlertCircle size={14} /> Allergies: {summary.allergies.join(", ")}
          </span>
        )}
      </div>

      {/* Summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
        {[
          { label: "Blood Group", value: summary.bloodGroup || "Unknown" },
          { label: "Insurance",   value: summary.insuranceProvider || "—" },
          { label: "Conditions",  value: summary.chronicConditions?.join(", ") || "None" },
          { label: "Last BP",     value: vitals ? `${vitals.systolicBp}/${vitals.diastolicBp} mmHg` : "—" },
          { label: "Last SpO2",   value: vitals ? `${vitals.oxygenSaturation}%` : "—" },
          { label: "Last Temp",   value: vitals ? `${vitals.temperature}°C` : "—" },
        ].map(k => (
          <div key={k.label} style={{ background: "white", border: "1px solid var(--line,#e5)", borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{k.label}</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Tab navigation */}
      <div style={{ display: "flex", gap: 8, borderBottom: "2px solid var(--line,#e5)" }}>
        {[["soap","SOAP Note",FileText],["rx","Prescribe",Pill],["lab","Order Lab",FlaskConical],["admit","Admit/Discharge",Activity]].map(([key,label,Icon]:any) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: "8px 16px", border: "none", background: "none", cursor: "pointer", fontWeight: tab===key?700:400, borderBottom: tab===key?"2px solid #027c8e":"2px solid transparent", color: tab===key?"#027c8e":"inherit", display:"flex",alignItems:"center",gap:6 }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* SOAP Note */}
      {tab === "soap" && (
        <div style={{ display:"grid", gap:12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <label style={{ display:"flex",flexDirection:"column",gap:4,fontSize:13 }}>
              Note Type
              <select value={soap.noteType} onChange={e=>setSoap(s=>({...s,noteType:e.target.value}))} style={{ padding:8,borderRadius:8,border:"1px solid var(--line,#e5)" }}>
                {["general","emergency","admission","discharge","anc","pre-op","post-op"].map(t=><option key={t} value={t}>{t.toUpperCase()}</option>)}
              </select>
            </label>
          </div>
          {(["subjective","objective","assessment","plan"] as const).map(field => (
            <label key={field} style={{ display:"flex",flexDirection:"column",gap:4,fontSize:13 }}>
              <strong style={{ textTransform:"capitalize" }}>{field}</strong>
              <textarea value={soap[field]} onChange={e=>setSoap(s=>({...s,[field]:e.target.value}))}
                rows={3} style={{ padding:10,borderRadius:8,border:"1px solid var(--line,#e5)",resize:"vertical",fontSize:13 }}
                placeholder={field==="subjective"?"Patient's complaints…":field==="objective"?"Exam findings…":field==="assessment"?"Diagnosis…":"Treatment plan…"} />
            </label>
          ))}
          <div>
            <strong style={{ fontSize:13 }}>Diagnoses (ICD-10/11)</strong>
            <div style={{ display:"flex",gap:8,marginTop:6 }}>
              <input value={icdSearch} onChange={e=>setIcdSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addDiagnosis()}
                placeholder="Type ICD code or diagnosis name, press Enter…" style={{ flex:1,padding:8,borderRadius:8,border:"1px solid var(--line,#e5)",fontSize:13 }} />
              <button onClick={addDiagnosis} style={{ padding:"8px 16px",background:"#027c8e",color:"white",border:"none",borderRadius:8,cursor:"pointer" }}>Add</button>
            </div>
            {diagnoses.map((d,i) => (
              <div key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",background:"#f0faf9",border:"1px solid #a7f3d0",borderRadius:8,padding:"6px 12px",marginTop:6,fontSize:13 }}>
                <span><strong>{d.icdCode}</strong> — {d.description}</span>
                <button onClick={()=>setDiagnoses(prev=>prev.filter((_,j)=>j!==i))} style={{ border:"none",background:"none",cursor:"pointer",color:"#c23b22" }}>✕</button>
              </div>
            ))}
          </div>
          <button onClick={saveNote} style={{ alignSelf:"flex-start",padding:"10px 24px",background:"#027c8e",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontWeight:600 }}>
            Save SOAP Note
          </button>
          {notes.length > 0 && (
            <div>
              <strong style={{ fontSize:13 }}>Previous Notes ({notes.length})</strong>
              {notes.slice(0,3).map(n=>(
                <div key={n.id} style={{ background:"white",border:"1px solid var(--line,#e5)",borderRadius:10,padding:"12px 16px",marginTop:8,fontSize:13 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
                    <strong>{n.noteType?.toUpperCase()}</strong>
                    <span style={{ color:"#9ca3af" }}>{n.createdAt?.slice(0,10)} · {n.authorName}</span>
                    {n.signed && <span style={{ color:"#0f9f6e",fontSize:12 }}>✓ Signed</span>}
                  </div>
                  {n.subjective && <p style={{ margin:"0 0 4px",color:"#374151" }}><strong>S:</strong> {n.subjective}</p>}
                  {n.assessment && <p style={{ margin:"0 0 4px",color:"#374151" }}><strong>A:</strong> {n.assessment}</p>}
                  {n.plan && <p style={{ margin:0,color:"#374151" }}><strong>P:</strong> {n.plan}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Prescription */}
      {tab === "rx" && (
        <div style={{ display:"grid",gap:12 }}>
          <strong style={{ fontSize:13 }}>Add Drug to Prescription</strong>
          <div style={{ display:"flex",gap:8 }}>
            <input value={drugSearch} onChange={e=>setDrugSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addRxItem()}
              placeholder="Generic name (e.g. Amoxicillin 500mg)…" style={{ flex:1,padding:8,borderRadius:8,border:"1px solid var(--line,#e5)",fontSize:13 }} />
            <button onClick={addRxItem} style={{ padding:"8px 16px",background:"#027c8e",color:"white",border:"none",borderRadius:8,cursor:"pointer" }}>Add Drug</button>
          </div>
          {rxItems.map((item,i) => (
            <div key={i} style={{ background:"white",border:"1px solid var(--line,#e5)",borderRadius:10,padding:"12px 16px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10 }}>
              <div style={{ gridColumn:"1/-1",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <strong style={{ fontSize:13 }}>{item.drug}</strong>
                <button onClick={()=>setRxItems(p=>p.filter((_,j)=>j!==i))} style={{ border:"none",background:"none",cursor:"pointer",color:"#c23b22" }}>Remove</button>
              </div>
              {["dosage","duration","quantity"].map(f=>(
                <label key={f} style={{ display:"flex",flexDirection:"column",gap:3,fontSize:12 }}>
                  {f.charAt(0).toUpperCase()+f.slice(1)}
                  <input value={item[f]} onChange={e=>setRxItems(p=>p.map((r,j)=>j===i?{...r,[f]:e.target.value}:r))}
                    placeholder={f==="dosage"?"e.g. 500mg":f==="duration"?"e.g. 7 days":"qty"} style={{ padding:6,borderRadius:6,border:"1px solid var(--line,#e5)",fontSize:12 }} />
                </label>
              ))}
              <label style={{ display:"flex",flexDirection:"column",gap:3,fontSize:12 }}>
                Route
                <select value={item.route} onChange={e=>setRxItems(p=>p.map((r,j)=>j===i?{...r,route:e.target.value}:r))} style={{ padding:6,borderRadius:6,border:"1px solid var(--line,#e5)",fontSize:12 }}>
                  {ROUTES.map(r=><option key={r}>{r}</option>)}
                </select>
              </label>
              <label style={{ display:"flex",flexDirection:"column",gap:3,fontSize:12 }}>
                Frequency
                <select value={item.frequency} onChange={e=>setRxItems(p=>p.map((r,j)=>j===i?{...r,frequency:e.target.value}:r))} style={{ padding:6,borderRadius:6,border:"1px solid var(--line,#e5)",fontSize:12 }}>
                  {FREQ.map(f=><option key={f}>{f}</option>)}
                </select>
              </label>
              <label style={{ display:"flex",flexDirection:"column",gap:3,fontSize:12,gridColumn:"span 2" }}>
                Instructions
                <input value={item.instructions} onChange={e=>setRxItems(p=>p.map((r,j)=>j===i?{...r,instructions:e.target.value}:r))}
                  placeholder="Take with food…" style={{ padding:6,borderRadius:6,border:"1px solid var(--line,#e5)",fontSize:12 }} />
              </label>
            </div>
          ))}
          {rxItems.length > 0 && (
            <button onClick={sendPrescription} style={{ alignSelf:"flex-start",padding:"10px 24px",background:"#0f9f6e",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontWeight:600 }}>
              Send to Pharmacy ({rxItems.length} item{rxItems.length>1?"s":""})
            </button>
          )}
        </div>
      )}

      {/* Lab order */}
      {tab === "lab" && (
        <div style={{ display:"grid",gap:12,maxWidth:480 }}>
          <strong style={{ fontSize:13 }}>Order Laboratory Test</strong>
          <label style={{ display:"flex",flexDirection:"column",gap:4,fontSize:13 }}>
            Test Panel
            <select value={labPanel} onChange={e=>setLabPanel(e.target.value)} style={{ padding:8,borderRadius:8,border:"1px solid var(--line,#e5)" }}>
              <option value="">Select panel…</option>
              {["Hematology","Biochemistry","Parasitology","Microbiology","Immunology","Serology","Urine Analysis","Coagulation"].map(p=><option key={p}>{p}</option>)}
            </select>
          </label>
          <label style={{ display:"flex",flexDirection:"column",gap:4,fontSize:13 }}>
            Test Name *
            <input value={labTest} onChange={e=>setLabTest(e.target.value)} placeholder="e.g. Full Blood Count, HbA1c, Malaria RDT…" style={{ padding:8,borderRadius:8,border:"1px solid var(--line,#e5)" }} />
          </label>
          <label style={{ display:"flex",flexDirection:"column",gap:4,fontSize:13 }}>
            Urgency
            <select value={labUrgency} onChange={e=>setLabUrgency(e.target.value)} style={{ padding:8,borderRadius:8,border:"1px solid var(--line,#e5)" }}>
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="stat">STAT (Immediate)</option>
            </select>
          </label>
          <button onClick={orderLabTest} style={{ alignSelf:"flex-start",padding:"10px 24px",background:"#5b5fc7",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontWeight:600 }}>
            Send Lab Order
          </button>
        </div>
      )}

      {/* Admit */}
      {tab === "admit" && (
        <div style={{ padding:16,background:"#f9fafb",borderRadius:12,border:"1px solid var(--line,#e5)",fontSize:13,color:"#374151" }}>
          <p>Use the <strong>Inpatient & Beds</strong> module to admit, transfer, or discharge this patient.</p>
          <p>Patient ID: <code>{patientId}</code></p>
        </div>
      )}
    </div>
  );
}
