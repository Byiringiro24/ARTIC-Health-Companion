"use client";
import { useState } from "react";
import {
  CalendarDays, ClipboardList, UserRoundPlus,
  Bell, AlertCircle, CheckCircle, Clock, ChevronRight,
  Activity, Pill, FlaskConical, FileText, Users, MessageSquare,
  TrendingUp, Plus, X, Stethoscope, Send, Download, Search,
} from "lucide-react";
import type { AppUser } from "@/types/hms";
import { PatientRegistrationForm } from "@/components/dashboard/PatientRegistrationForm";

// ── Helpers ───────────────────────────────────────────────────────────────────
const TrafficLight = ({ level }: { level: "red"|"amber"|"green" }) => (
  <span style={{
    display:"inline-block",width:11,height:11,borderRadius:"50%",flexShrink:0,
    background:level==="red"?"#dc2626":level==="amber"?"#f59e0b":"#22c55e",
    boxShadow:level==="red"?"0 0 6px #dc2626":level==="amber"?"0 0 6px #f59e0b":"0 0 6px #22c55e",
  }}/>
);
const Badge = ({ label, color, bg }: { label:string; color:string; bg:string }) => (
  <span style={{ padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:bg,color,whiteSpace:"nowrap" }}>{label}</span>
);
const StatBox = ({ label, value, icon, color, bg, sub }: any) => (
  <div style={{ background:"white",borderRadius:12,padding:"14px 16px",border:"1px solid #e2e8f0",borderTop:`3px solid ${color}` }}>
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6 }}>
      <div style={{ width:34,height:34,borderRadius:9,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>{icon}</div>
    </div>
    <div style={{ fontSize:24,fontWeight:800,color }}>{value}</div>
    <div style={{ fontSize:11,color:"#64748b",marginTop:2,fontWeight:500 }}>{label}</div>
    {sub && <div style={{ fontSize:10,color:"#94a3b8",marginTop:1 }}>{sub}</div>}
  </div>
);

// ── Mock patient data ─────────────────────────────────────────────────────────
const MOCK_PATIENTS = [
  { id:"p1", name:"Ernest Uwimana",    age:52, gender:"M", dx:"Hypertension + T2DM",       urgency:"red",   wait:"32m", appointment:"09:00", status:"In Room",   pam:42, vitals:{ bp:"160/95",temp:"36.8",spo2:"97%",pulse:"88" } },
  { id:"p2", name:"Marie Mukamana",    age:34, gender:"F", dx:"ANC Visit (28 weeks)",       urgency:"green", wait:"12m", appointment:"09:30", status:"Waiting",   pam:76, vitals:{ bp:"118/72",temp:"36.6",spo2:"99%",pulse:"78" } },
  { id:"p3", name:"Jean B. Hakizimana",age:8,  gender:"M", dx:"Acute Febrile Illness",      urgency:"amber", wait:"18m", appointment:"10:00", status:"Waiting",   pam:null,vitals:{ bp:"100/65",temp:"38.7",spo2:"98%",pulse:"105" } },
  { id:"p4", name:"Alice Niyomugabo",  age:61, gender:"F", dx:"COPD Exacerbation",          urgency:"red",   wait:"5m",  appointment:"10:30", status:"Checked In",pam:28, vitals:{ bp:"145/90",temp:"37.2",spo2:"91%",pulse:"98" } },
  { id:"p5", name:"Patrick Gasana",    age:45, gender:"M", dx:"Chest Pain — Rule out ACS",  urgency:"red",   wait:"8m",  appointment:"STAT",  status:"Emergency", pam:35, vitals:{ bp:"152/98",temp:"37.0",spo2:"95%",pulse:"110" } },
  { id:"p6", name:"Olive Uwineza",     age:29, gender:"F", dx:"Urinary Tract Infection",    urgency:"green", wait:"25m", appointment:"11:00", status:"Waiting",   pam:82, vitals:{ bp:"112/70",temp:"37.5",spo2:"99%",pulse:"82" } },
];

const MOCK_CONSULTATIONS = [
  { id:"c1", patient:"Ernest Uwimana",   type:"Follow-up",   time:"09:00", status:"In Progress", dx:"Hypertension, T2DM" },
  { id:"c2", patient:"Marie Mukamana",   type:"ANC",         time:"09:30", status:"Waiting",     dx:"G2P1, 28 weeks" },
  { id:"c3", patient:"Jean B.",          type:"Acute",       time:"10:00", status:"Waiting",     dx:"Fever, Malaria screen" },
  { id:"c4", patient:"Alice Niyomugabo", type:"Emergency",   time:"10:30", status:"Urgent",      dx:"COPD, SOB" },
];

type DoctorTab = "dashboard"|"patients"|"register"|"appointments"|"prescriptions"|"results"|"inbox";

export function DoctorDashboard({ user }: { user?: AppUser }) {
  const [tab, setTab]                   = useState<DoctorTab>("dashboard");
  const [selectedPatient, setSelPt]     = useState<any>(null);
  const [showConsult, setShowConsult]   = useState(false);
  const [showRx, setShowRx]             = useState(false);
  const [consultNotes, setConsultNotes] = useState("");
  const [rxInput, setRxInput]           = useState({ drug:"",dose:"",freq:"",duration:"",route:"",notes:"" });
  const [rxList, setRxList]             = useState<any[]>([]);
  const [searchPt, setSearchPt]         = useState("");
  const [toastMsg, setToastMsg]         = useState("");

  function toast(msg: string) { setToastMsg(msg); setTimeout(()=>setToastMsg(""),3000); }

  const urgencyOrder: Record<string,number> = { red:0, amber:1, green:2 };
  const sortedPatients = [...MOCK_PATIENTS]
    .filter(p=>!searchPt||p.name.toLowerCase().includes(searchPt.toLowerCase())||p.dx.toLowerCase().includes(searchPt.toLowerCase()))
    .sort((a,b)=>urgencyOrder[a.urgency]-urgencyOrder[b.urgency]);

  const TABS: { key:DoctorTab; label:string; icon:React.ReactNode }[] = [
    { key:"dashboard",     label:"Summary",       icon:<Activity size={14}/> },
    { key:"patients",      label:"My Patients",   icon:<Users size={14}/> },
    { key:"register",      label:"Register Patient",icon:<UserRoundPlus size={14}/> },
    { key:"appointments",  label:"Consultations", icon:<CalendarDays size={14}/> },
    { key:"prescriptions", label:"e-Prescribing", icon:<Pill size={14}/> },
    { key:"results",       label:"Lab Results",   icon:<FlaskConical size={14}/> },
    { key:"inbox",         label:"In-Basket",     icon:<MessageSquare size={14}/> },
  ];

  return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif",minHeight:"100vh",background:"#f1f5f9" }}>
      {/* Toast */}
      {toastMsg && (
        <div style={{ position:"fixed",top:20,right:20,zIndex:9999,padding:"12px 20px",background:"#059669",color:"white",borderRadius:10,fontSize:13,fontWeight:600,boxShadow:"0 4px 16px rgba(0,0,0,0.15)" }}>{toastMsg}</div>
      )}

      {/* Header */}
      <div style={{ background:"white",borderBottom:"1px solid #e2e8f0",padding:"12px 24px",display:"flex",alignItems:"center",gap:14 }}>
        <div style={{ width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,#0891b2,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
          <Stethoscope size={20} color="white"/>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:800,fontSize:15,color:"#0f172a" }}>Dr. {user?.name||"Doctor"} — Clinical Workspace</div>
          <div style={{ fontSize:11,color:"#94a3b8" }}>{new Date().toLocaleDateString("en-RW",{ weekday:"long",day:"numeric",month:"long",year:"numeric" })} · {user?.facility||"ARTIC Hospital"}</div>
        </div>
        <div style={{ display:"flex",gap:8,alignItems:"center" }}>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <TrafficLight level="red"/><span style={{ fontSize:10,color:"#64748b" }}>Urgent</span>
            <TrafficLight level="amber"/><span style={{ fontSize:10,color:"#64748b" }}>Review</span>
            <TrafficLight level="green"/><span style={{ fontSize:10,color:"#64748b" }}>Stable</span>
          </div>
          <div style={{ width:1,height:24,background:"#e2e8f0",margin:"0 4px" }}/>
          <button style={{ position:"relative",border:"none",background:"none",cursor:"pointer",padding:6,borderRadius:8,display:"flex",color:"#64748b" }}>
            <Bell size={18}/>
            <span style={{ position:"absolute",top:2,right:2,width:7,height:7,borderRadius:"50%",background:"#dc2626",border:"2px solid white" }}/>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:"white",borderBottom:"1px solid #e2e8f0",padding:"0 24px",display:"flex",gap:2,overflowX:"auto" }}>
        {TABS.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)}
            style={{ display:"flex",alignItems:"center",gap:6,padding:"12px 16px",border:"none",background:"none",cursor:"pointer",fontSize:12,fontWeight:tab===t.key?700:400,color:tab===t.key?"#0891b2":"#64748b",borderBottom:`2px solid ${tab===t.key?"#0891b2":"transparent"}`,whiteSpace:"nowrap",transition:"all 0.15s" }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ padding:"20px 24px" }}>

        {/* ── DASHBOARD TAB ── */}
        {tab==="dashboard" && (
          <div style={{ display:"grid",gap:18 }}>
            {/* Alert banner for critical patients */}
            {MOCK_PATIENTS.filter(p=>p.urgency==="red").length>0 && (
              <div style={{ background:"#fef2f2",border:"2px solid #fca5a5",borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:10 }}>
                <AlertCircle size={20} style={{ color:"#dc2626",flexShrink:0 }}/>
                <div>
                  <div style={{ fontSize:13,fontWeight:700,color:"#dc2626" }}>⚠️ {MOCK_PATIENTS.filter(p=>p.urgency==="red").length} patients require urgent attention</div>
                  <div style={{ fontSize:11,color:"#b91c1c",marginTop:1 }}>{MOCK_PATIENTS.filter(p=>p.urgency==="red").map(p=>p.name).join(" · ")}</div>
                </div>
                <button onClick={()=>setTab("patients")} style={{ marginLeft:"auto",padding:"6px 14px",background:"#dc2626",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:700,flexShrink:0 }}>Review Now →</button>
              </div>
            )}

            {/* KPIs */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12 }}>
              <StatBox label="Patients Today"   value={MOCK_PATIENTS.length}                              icon="👤" color="#0891b2" bg="#ecfeff"  sub="Scheduled"/>
              <StatBox label="Urgent / Red"     value={MOCK_PATIENTS.filter(p=>p.urgency==="red").length} icon="🚨" color="#dc2626" bg="#fef2f2"  sub="Immediate attention"/>
              <StatBox label="Waiting"          value={MOCK_PATIENTS.filter(p=>p.status==="Waiting").length} icon="⏳" color="#d97706" bg="#fffbeb" sub="In queue"/>
              <StatBox label="Completed"        value={2}                                                  icon="✅" color="#059669" bg="#ecfdf5"  sub="Consultations done"/>
              <StatBox label="Lab Results Due"  value={3}                                                  icon="🔬" color="#7c3aed" bg="#f5f3ff"  sub="Awaiting review"/>
              <StatBox label="Messages"         value={5}                                                  icon="💬" color="#0891b2" bg="#ecfeff"  sub="Unread in-basket"/>
            </div>

            {/* Today's queue + vitals */}
            <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:16 }}>
              <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",overflow:"hidden" }}>
                <div style={{ padding:"14px 18px",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <div style={{ fontWeight:700,fontSize:13,color:"#0f172a" }}>👥 Today&apos;s Patient Queue</div>
                  <button onClick={()=>setTab("patients")} style={{ fontSize:11,color:"#0891b2",border:"none",background:"none",cursor:"pointer",fontWeight:600 }}>Full list →</button>
                </div>
                <div style={{ display:"flex",flexDirection:"column" }}>
                  {MOCK_PATIENTS.slice(0,5).map(p=>(
                    <div key={p.id} onClick={()=>{ setSelPt(p); setTab("patients"); }} style={{ display:"flex",alignItems:"center",gap:10,padding:"11px 18px",borderBottom:"1px solid #f9fafb",cursor:"pointer",transition:"background 0.1s" }}
                      onMouseEnter={e=>(e.currentTarget.style.background="#f8fafc")}
                      onMouseLeave={e=>(e.currentTarget.style.background="")}>
                      <TrafficLight level={p.urgency as any}/>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:12,fontWeight:600,color:"#0f172a",display:"flex",alignItems:"center",gap:6 }}>
                          {p.name} <span style={{ fontSize:10,color:"#94a3b8",fontWeight:400 }}>{p.age}{p.gender} · {p.appointment}</span>
                        </div>
                        <div style={{ fontSize:11,color:"#64748b",marginTop:1 }}>{p.dx}</div>
                      </div>
                      <Badge label={p.status} color={p.status==="Emergency"?"#dc2626":p.status==="In Room"?"#0891b2":p.status==="Checked In"?"#7c3aed":"#d97706"} bg={p.status==="Emergency"?"#fee2e2":p.status==="In Room"?"#ecfeff":p.status==="Checked In"?"#f5f3ff":"#fffbeb"}/>
                      {p.pam!==null && <div style={{ fontSize:10,color:p.pam<40?"#dc2626":p.pam<60?"#d97706":"#059669",fontWeight:700,minWidth:42,textAlign:"right" }}>PAM: {p.pam}</div>}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",padding:"14px 16px" }}>
                  <div style={{ fontWeight:700,fontSize:12,color:"#0f172a",marginBottom:10 }}>📅 Today&apos;s Consultations</div>
                  {MOCK_CONSULTATIONS.map((c,i)=>(
                    <div key={c.id} style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:i<MOCK_CONSULTATIONS.length-1?"1px solid #f1f5f9":"none" }}>
                      <div style={{ width:8,height:8,borderRadius:"50%",background:c.status==="Urgent"?"#dc2626":c.status==="In Progress"?"#0891b2":"#94a3b8",flexShrink:0 }}/>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:11,fontWeight:600,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{c.patient}</div>
                        <div style={{ fontSize:10,color:"#94a3b8" }}>{c.time} · {c.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ background:"linear-gradient(135deg,#0a1628,#0f2942)",borderRadius:12,padding:"14px 16px",color:"white" }}>
                  <div style={{ fontWeight:700,fontSize:12,marginBottom:8 }}>🩺 Quick Actions</div>
                  {[
                    { label:"New Consultation",  action:()=>setTab("appointments") },
                    { label:"Register Patient",  action:()=>setTab("register") },
                    { label:"Write Prescription",action:()=>setShowRx(true) },
                    { label:"View Lab Results",  action:()=>setTab("results") },
                  ].map(a=>(
                    <button key={a.label} onClick={a.action} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"7px 10px",marginBottom:4,background:"rgba(255,255,255,0.05)",borderRadius:8,border:"none",cursor:"pointer",fontSize:11,color:"#e2e8f0",fontWeight:500 }}>
                      {a.label}<ChevronRight size={11}/>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PATIENTS TAB ── */}
        {tab==="patients" && (
          <div style={{ display:"grid",gap:14 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <div style={{ display:"flex",alignItems:"center",gap:7,background:"white",border:"1px solid #e2e8f0",borderRadius:9,padding:"8px 13px",flex:1,maxWidth:360 }}>
                <Search size={13} style={{ color:"#94a3b8" }}/>
                <input value={searchPt} onChange={e=>setSearchPt(e.target.value)} placeholder="Search patients by name or diagnosis…" style={{ border:"none",outline:"none",fontSize:12,background:"transparent",flex:1,color:"#0f172a" }}/>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:6,fontSize:11,color:"#64748b" }}>
                <TrafficLight level="red"/>{MOCK_PATIENTS.filter(p=>p.urgency==="red").length} urgent
                <TrafficLight level="amber"/>{MOCK_PATIENTS.filter(p=>p.urgency==="amber").length} review
                <TrafficLight level="green"/>{MOCK_PATIENTS.filter(p=>p.urgency==="green").length} stable
              </div>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:0,background:"white",borderRadius:12,border:"1px solid #e2e8f0",overflow:"hidden" }}>
              {sortedPatients.map((p,i)=>(
                <div key={p.id} style={{ borderBottom:i<sortedPatients.length-1?"1px solid #f1f5f9":"none" }}>
                  {/* Patient row */}
                  <div onClick={()=>setSelPt(selectedPatient?.id===p.id?null:p)} style={{ display:"flex",alignItems:"center",gap:12,padding:"14px 18px",cursor:"pointer",background:selectedPatient?.id===p.id?"#f0fdf4":"white",transition:"background 0.1s" }}>
                    <TrafficLight level={p.urgency as any}/>
                    <div style={{ width:38,height:38,borderRadius:"50%",background:p.urgency==="red"?"#fee2e2":p.urgency==="amber"?"#fffbeb":"#ecfdf5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:p.urgency==="red"?"#dc2626":p.urgency==="amber"?"#d97706":"#059669",flexShrink:0 }}>
                      {p.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:2 }}>
                        <span style={{ fontSize:13,fontWeight:700,color:"#0f172a" }}>{p.name}</span>
                        <span style={{ fontSize:11,color:"#94a3b8" }}>{p.age}y {p.gender}</span>
                        {p.urgency==="red" && <span style={{ fontSize:10,background:"#fee2e2",color:"#dc2626",padding:"1px 6px",borderRadius:4,fontWeight:700 }}>URGENT</span>}
                      </div>
                      <div style={{ fontSize:11,color:"#64748b" }}>{p.dx}</div>
                    </div>
                    <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0 }}>
                      <Badge label={p.status} color={p.status==="Emergency"?"#dc2626":p.status==="In Room"?"#0891b2":p.status==="Checked In"?"#7c3aed":"#94a3b8"} bg={p.status==="Emergency"?"#fee2e2":p.status==="In Room"?"#ecfeff":p.status==="Checked In"?"#f5f3ff":"#f1f5f9"}/>
                      <div style={{ fontSize:10,color:"#94a3b8" }}>Wait: {p.wait}</div>
                    </div>
                    <ChevronRight size={14} style={{ color:"#cbd5e1",flexShrink:0,transform:selectedPatient?.id===p.id?"rotate(90deg)":"none",transition:"transform 0.2s" }}/>
                  </div>

                  {/* Expanded vitals + actions */}
                  {selectedPatient?.id===p.id && (
                    <div style={{ padding:"14px 18px 18px",background:"#f8fafc",borderTop:"1px solid #e2e8f0" }}>
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                        <div>
                          <div style={{ fontWeight:700,fontSize:12,color:"#0f172a",marginBottom:8,display:"flex",alignItems:"center",gap:5 }}>
                            <Activity size={13} style={{ color:"#0891b2" }}/>Vital Signs
                          </div>
                          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }}>
                            {[
                              { l:"Blood Pressure", v:p.vitals.bp,  alert:p.urgency==="red" },
                              { l:"Temperature",    v:p.vitals.temp, alert:Number(p.vitals.temp)>38 },
                              { l:"SpO₂",           v:p.vitals.spo2, alert:Number(p.vitals.spo2.replace("%",""))<95 },
                              { l:"Pulse",          v:p.vitals.pulse+" bpm", alert:Number(p.vitals.pulse)>100 },
                            ].map(v=>(
                              <div key={v.l} style={{ padding:"8px 10px",background:v.alert?"#fef2f2":"white",borderRadius:8,border:`1px solid ${v.alert?"#fca5a5":"#e2e8f0"}` }}>
                                <div style={{ fontSize:10,color:"#94a3b8",marginBottom:2 }}>{v.l}</div>
                                <div style={{ fontSize:14,fontWeight:700,color:v.alert?"#dc2626":"#0f172a" }}>{v.v}</div>
                              </div>
                            ))}
                          </div>
                          {p.pam!==null && (
                            <div style={{ marginTop:8,padding:"8px 12px",background:p.pam<40?"#fee2e2":p.pam<60?"#fffbeb":"#ecfdf5",borderRadius:8,border:`1px solid ${p.pam<40?"#fca5a5":p.pam<60?"#fed7aa":"#bbf7d0"}` }}>
                              <div style={{ fontSize:10,color:"#64748b",marginBottom:1 }}>PAM Score (Patient Activation)</div>
                              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                                <div style={{ fontSize:20,fontWeight:800,color:p.pam<40?"#dc2626":p.pam<60?"#d97706":"#059669" }}>{p.pam}</div>
                                <div style={{ fontSize:11,color:"#64748b" }}>{p.pam<40?"Low activation":p.pam<60?"Moderate":"High activation"}</div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight:700,fontSize:12,color:"#0f172a",marginBottom:8 }}>⚡ Actions</div>
                          <div style={{ display:"grid",gap:6 }}>
                            <button onClick={()=>{ setSelPt(p); setShowConsult(true); }} style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 14px",background:"#0891b2",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600 }}>
                              <ClipboardList size={13}/>Start Consultation
                            </button>
                            <button onClick={()=>{ setSelPt(p); setShowRx(true); }} style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 14px",background:"white",color:"#7c3aed",border:"1px solid #c4b5fd",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600 }}>
                              <Pill size={13}/>Write Prescription
                            </button>
                            <button onClick={()=>{ toast(`Lab referral sent for ${p.name}`); }} style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 14px",background:"white",color:"#059669",border:"1px solid #bbf7d0",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600 }}>
                              <FlaskConical size={13}/>Order Lab Test
                            </button>
                            <button onClick={()=>{ toast(`Referral created for ${p.name}`); }} style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 14px",background:"white",color:"#d97706",border:"1px solid #fed7aa",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600 }}>
                              <TrendingUp size={13}/>Refer Patient
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── REGISTER TAB ── */}
        {tab==="register" && (
          <PatientRegistrationForm />
        )}

        {/* ── APPOINTMENTS / CONSULTATIONS TAB ── */}
        {tab==="appointments" && (
          <div style={{ display:"grid",gap:14 }}>
            <div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Consultation Schedule</div>
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {MOCK_CONSULTATIONS.map(c=>(
                <div key={c.id} style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",padding:"16px 18px",display:"flex",alignItems:"center",gap:14 }}>
                  <div style={{ width:10,height:10,borderRadius:"50%",background:c.status==="Urgent"?"#dc2626":c.status==="In Progress"?"#0891b2":"#94a3b8",flexShrink:0 }}/>
                  <div>
                    <div style={{ fontSize:13,fontWeight:700,color:"#0f172a" }}>{c.time} — {c.patient}</div>
                    <div style={{ fontSize:11,color:"#64748b",marginTop:2 }}>{c.type} · {c.dx}</div>
                  </div>
                  <div style={{ marginLeft:"auto",display:"flex",gap:8 }}>
                    <button onClick={()=>{ const p=MOCK_PATIENTS.find(x=>c.patient.startsWith(x.name.split(" ")[0])); setSelPt(p||MOCK_PATIENTS[0]); setShowConsult(true); }} style={{ display:"flex",alignItems:"center",gap:5,padding:"7px 14px",background:"#0891b2",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:600 }}>
                      <ClipboardList size={12}/>Start
                    </button>
                    <span style={{ padding:"5px 12px",borderRadius:20,fontSize:11,fontWeight:600,background:c.status==="Urgent"?"#fee2e2":c.status==="In Progress"?"#ecfeff":"#f1f5f9",color:c.status==="Urgent"?"#dc2626":c.status==="In Progress"?"#0891b2":"#64748b" }}>{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PRESCRIPTIONS TAB ── */}
        {tab==="prescriptions" && (
          <div style={{ display:"grid",gap:14 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>e-Prescribing</div>
              <button onClick={()=>setShowRx(true)} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 16px",background:"#7c3aed",color:"white",border:"none",borderRadius:9,cursor:"pointer",fontSize:12,fontWeight:600 }}>
                <Plus size={13}/>New Prescription
              </button>
            </div>
            <div style={{ background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10,padding:"12px 16px",fontSize:12,color:"#92400e" }}>
              ⚠️ Drug interaction checker active. Contraindications based on Rwanda MOH formulary and WHO essential medicines list.
            </div>
            <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",padding:"16px 18px" }}>
              <div style={{ fontWeight:700,fontSize:13,color:"#0f172a",marginBottom:12 }}>Recent Prescriptions</div>
              {rxList.length===0 ? (
                <div style={{ textAlign:"center",padding:"28px",color:"#94a3b8" }}>
                  <Pill size={32} style={{ marginBottom:8,opacity:0.4 }}/>
                  <div>No prescriptions yet. Write a new one using the button above.</div>
                </div>
              ) : rxList.map((rx,i)=>(
                <div key={i} style={{ padding:"10px 12px",background:"#f8fafc",borderRadius:9,marginBottom:7,border:"1px solid #e2e8f0" }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#7c3aed" }}>{rx.drug} {rx.dose}</div>
                  <div style={{ fontSize:11,color:"#64748b" }}>{rx.freq} for {rx.duration} · Route: {rx.route}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LAB RESULTS TAB ── */}
        {tab==="results" && (
          <div style={{ display:"grid",gap:14 }}>
            <div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Laboratory Results</div>
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {[
                { patient:"Ernest Uwimana",   test:"HbA1c",        result:"9.2%",     normal:"<7%",     flag:"High",     status:"Final", date:"Jul 20" },
                { patient:"Patrick Gasana",   test:"Troponin I",   result:"0.8 ng/mL",normal:"<0.04",   flag:"Critical", status:"Final", date:"Jul 20" },
                { patient:"Marie Mukamana",   test:"Haemoglobin",  result:"10.2 g/dL",normal:"12–16",   flag:"Low",      status:"Final", date:"Jul 19" },
                { patient:"Alice Niyomugabo", test:"Peak Flow",    result:"180 L/min",normal:"350–450", flag:"Low",      status:"Preliminary", date:"Jul 20" },
                { patient:"Jean B.",          test:"Malaria RDT",  result:"POSITIVE", normal:"Negative",flag:"Positive", status:"Final", date:"Jul 20" },
              ].map((r,i)=>(
                <div key={i} style={{ background:"white",borderRadius:12,border:`1px solid ${r.flag==="Critical"?"#fca5a5":"#e2e8f0"}`,padding:"14px 18px",display:"flex",alignItems:"center",gap:14 }}>
                  <div style={{ width:10,height:10,borderRadius:"50%",background:r.flag==="Critical"?"#dc2626":r.flag==="High"||r.flag==="Low"||r.flag==="Positive"?"#d97706":"#059669",flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13,fontWeight:700,color:"#0f172a" }}>{r.patient} — {r.test}</div>
                    <div style={{ fontSize:11,color:"#64748b",marginTop:1 }}>Normal range: {r.normal} · {r.date}</div>
                  </div>
                  <div style={{ fontWeight:800,fontSize:16,color:r.flag==="Critical"?"#dc2626":r.flag!=="Normal"?"#d97706":"#059669" }}>{r.result}</div>
                  <Badge label={r.flag} color={r.flag==="Critical"?"#dc2626":r.flag!=="Normal"?"#d97706":"#059669"} bg={r.flag==="Critical"?"#fee2e2":r.flag!=="Normal"?"#fffbeb":"#dcfce7"}/>
                  <button onClick={()=>toast(`Acknowledged: ${r.patient} — ${r.test}`)} style={{ padding:"5px 12px",borderRadius:7,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:11,color:"#374151",fontWeight:600 }}>Acknowledge</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── IN-BASKET TAB ── */}
        {tab==="inbox" && (
          <div style={{ display:"grid",gap:14 }}>
            <div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>In-Basket — Messages & Tasks</div>
            {[
              { from:"Lab (Patrick M.)",      subj:"Critical Result: Troponin — Patrick Gasana",          type:"critical", time:"5 min ago",  unread:true },
              { from:"Nurse Eric N.",         subj:"Patient ready in Room 3 — Ernest Uwimana",            type:"info",     time:"12 min ago", unread:true },
              { from:"Pharmacist Diane I.",   subj:"Re: Metformin dose for Ernest Uwimana",               type:"reply",    time:"1h ago",     unread:false },
              { from:"Hospital Manager",      subj:"Reminder: Monthly audit report due July 25",          type:"admin",    time:"2h ago",     unread:false },
              { from:"Patient Referral",      subj:"New referral received: Cardiac case from Kigali DH",  type:"referral", time:"3h ago",     unread:true },
            ].map((msg,i)=>(
              <div key={i} style={{ background:"white",borderRadius:12,border:`1px solid ${msg.unread&&msg.type==="critical"?"#fca5a5":msg.unread?"#bae6fd":"#e2e8f0"}`,padding:"14px 18px",display:"flex",alignItems:"center",gap:12,cursor:"pointer" }}>
                <div style={{ width:36,height:36,borderRadius:10,background:msg.type==="critical"?"#fee2e2":msg.type==="referral"?"#f5f3ff":msg.type==="reply"?"#ecfdf5":"#ecfeff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>
                  {msg.type==="critical"?"🚨":msg.type==="referral"?"↗️":msg.type==="reply"?"💬":msg.type==="admin"?"📋":"ℹ️"}
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:11,color:"#94a3b8",marginBottom:2 }}>{msg.from} · {msg.time}</div>
                  <div style={{ fontSize:13,fontWeight:msg.unread?700:400,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{msg.subj}</div>
                </div>
                {msg.unread && <div style={{ width:8,height:8,borderRadius:"50%",background:msg.type==="critical"?"#dc2626":"#0891b2",flexShrink:0 }}/>}
                <button onClick={()=>toast("Replied")} style={{ display:"flex",alignItems:"center",gap:4,padding:"5px 12px",borderRadius:7,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:11,color:"#374151" }}>
                  <Send size={10}/>Reply
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── CONSULTATION MODAL ── */}
      {showConsult && selectedPatient && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:"white",borderRadius:16,width:"100%",maxWidth:620,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 32px 80px rgba(0,0,0,0.28)" }}>
            <div style={{ background:"linear-gradient(135deg,#0891b2,#7c3aed)",padding:"18px 22px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div>
                <div style={{ fontSize:16,fontWeight:800,color:"white" }}>🩺 Consultation — {selectedPatient.name}</div>
                <div style={{ fontSize:11,color:"rgba(255,255,255,0.7)" }}>{selectedPatient.dx} · {selectedPatient.appointment}</div>
              </div>
              <button onClick={()=>setShowConsult(false)} style={{ border:"none",background:"rgba(255,255,255,0.15)",cursor:"pointer",padding:8,borderRadius:8,color:"white",display:"flex" }}><X size={16}/></button>
            </div>
            <div style={{ padding:"20px 22px",display:"grid",gap:14 }}>
              {/* Vitals recap */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8 }}>
                {[
                  { l:"BP",    v:selectedPatient.vitals.bp },
                  { l:"Temp",  v:`${selectedPatient.vitals.temp}°C` },
                  { l:"SpO₂",  v:selectedPatient.vitals.spo2 },
                  { l:"Pulse", v:`${selectedPatient.vitals.pulse}bpm` },
                ].map(v=>(
                  <div key={v.l} style={{ padding:"8px 10px",background:"#f8fafc",borderRadius:8,textAlign:"center" }}>
                    <div style={{ fontSize:10,color:"#94a3b8" }}>{v.l}</div>
                    <div style={{ fontSize:14,fontWeight:700,color:"#0f172a",marginTop:2 }}>{v.v}</div>
                  </div>
                ))}
              </div>
              <div>
                <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5 }}>Consultation Notes / SOAP</label>
                <textarea value={consultNotes} onChange={e=>setConsultNotes(e.target.value)} rows={7} placeholder="S — Subjective: Patient complaint and history&#10;O — Objective: Physical examination findings, vital signs&#10;A — Assessment: Clinical diagnosis / differential diagnoses&#10;P — Plan: Treatment, medications, investigations, referrals, follow-up"
                  style={{ width:"100%",padding:"12px 14px",borderRadius:9,border:"1px solid #e2e8f0",fontSize:12,outline:"none",resize:"vertical",fontFamily:"monospace",color:"#0f172a",lineHeight:1.7,boxSizing:"border-box" }}/>
              </div>
              <div>
                <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5 }}>ICD-10 Diagnosis Code</label>
                <input placeholder="Search or enter code (e.g. I10 — Hypertension)" style={{ width:"100%",padding:"9px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none",color:"#0f172a",boxSizing:"border-box" }}/>
              </div>
              <div>
                <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5 }}>Follow-up</label>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 2fr",gap:10 }}>
                  <input type="date" style={{ padding:"9px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none",color:"#0f172a" }}/>
                  <input placeholder="Instructions for patient" style={{ padding:"9px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none",color:"#0f172a" }}/>
                </div>
              </div>
              <div style={{ display:"flex",gap:8,justifyContent:"flex-end" }}>
                <button onClick={()=>setShowConsult(false)} style={{ padding:"9px 18px",borderRadius:9,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:12,color:"#374151",fontWeight:600 }}>Cancel</button>
                <button onClick={()=>{ toast("Draft saved"); }} style={{ display:"flex",alignItems:"center",gap:5,padding:"9px 16px",background:"#f1f5f9",color:"#374151",border:"none",borderRadius:9,cursor:"pointer",fontSize:12,fontWeight:600 }}><FileText size={12}/>Save Draft</button>
                <button onClick={()=>{ toast(`✅ Consultation signed for ${selectedPatient.name}`); setShowConsult(false); }} style={{ display:"flex",alignItems:"center",gap:6,padding:"9px 20px",background:"linear-gradient(135deg,#0891b2,#7c3aed)",color:"white",border:"none",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:700 }}>
                  <CheckCircle size={13}/>Sign & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RX MODAL ── */}
      {showRx && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:"white",borderRadius:16,width:"100%",maxWidth:520,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 32px 80px rgba(0,0,0,0.28)" }}>
            <div style={{ background:"linear-gradient(135deg,#7c3aed,#0891b2)",padding:"18px 22px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div style={{ fontSize:16,fontWeight:800,color:"white" }}>💊 Write Prescription</div>
              <button onClick={()=>setShowRx(false)} style={{ border:"none",background:"rgba(255,255,255,0.15)",cursor:"pointer",padding:8,borderRadius:8,color:"white",display:"flex" }}><X size={16}/></button>
            </div>
            <div style={{ padding:"20px 22px",display:"grid",gap:12 }}>
              <div style={{ background:"#fffbeb",border:"1px solid #fde68a",borderRadius:9,padding:"10px 14px",fontSize:12,color:"#92400e" }}>
                🔍 Drug interaction checker will flag contraindications when you add medications.
              </div>
              {selectedPatient && <div style={{ fontSize:12,color:"#64748b" }}>Patient: <strong style={{ color:"#0f172a" }}>{selectedPatient.name}</strong> · {selectedPatient.dx}</div>}
              {[
                { k:"drug" as const,     l:"Drug Name *",          ph:"Generic name (e.g. Amoxicillin)",  t:"text" },
                { k:"dose" as const,     l:"Dose *",               ph:"e.g. 500mg",                        t:"text" },
                { k:"route" as const,    l:"Route",                ph:"Oral / IV / IM / Topical",          t:"text" },
                { k:"freq" as const,     l:"Frequency *",          ph:"e.g. 3 times daily",                t:"text" },
                { k:"duration" as const, l:"Duration",             ph:"e.g. 7 days",                       t:"text" },
                { k:"notes" as const,    l:"Special Instructions", ph:"e.g. Take with food",               t:"text" },
              ].map(f=>(
                <div key={f.k}><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>{f.l}</label>
                <input value={rxInput[f.k]} onChange={e=>setRxInput(p=>({...p,[f.k]:e.target.value}))} type={f.t} placeholder={f.ph} style={{ width:"100%",padding:"9px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none",color:"#0f172a",boxSizing:"border-box" }}/></div>
              ))}
              <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:6 }}>
                <button onClick={()=>setShowRx(false)} style={{ padding:"9px 18px",borderRadius:9,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:12,color:"#374151",fontWeight:600 }}>Cancel</button>
                <button onClick={()=>{ if(!rxInput.drug||!rxInput.dose){ toast("Drug name and dose required"); return; } setRxList(p=>[...p,{ ...rxInput }]); toast(`✅ ${rxInput.drug} ${rxInput.dose} prescribed`); setRxInput({ drug:"",dose:"",freq:"",duration:"",route:"",notes:"" }); setShowRx(false); }} style={{ display:"flex",alignItems:"center",gap:6,padding:"9px 20px",background:"linear-gradient(135deg,#7c3aed,#0891b2)",color:"white",border:"none",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:700 }}>
                  <Download size={13}/>Issue Prescription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
