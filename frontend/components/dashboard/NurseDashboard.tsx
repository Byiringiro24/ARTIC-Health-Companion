"use client";
import { useState } from "react";
import {
  HeartPulse, ClipboardPlus, Activity, Users, Bell, Settings,
  LogOut, ChevronLeft, Menu, Search, CheckCircle, AlertCircle,
  Clock, Plus, X, Download, Send,
} from "lucide-react";
import type { AppUser } from "@/types/hms";
import { AccountSettings } from "@/components/ui/AccountSettings";
import { logout } from "@/lib/auth";

type NSection = "dashboard"|"vitals"|"triage"|"medications"|"patients"|"handover"|"inbox"|"settings";

const NAV: { key: NSection; label: string; icon: any }[] = [
  { key:"dashboard",   label:"Dashboard",          icon:Activity },
  { key:"patients",    label:"Ward Patients",       icon:Users },
  { key:"vitals",      label:"Vital Signs",         icon:HeartPulse },
  { key:"triage",      label:"Triage & Queue",      icon:AlertCircle },
  { key:"medications", label:"Medication Admin",    icon:ClipboardPlus },
  { key:"handover",    label:"Shift Handover",      icon:Clock },
  { key:"inbox",       label:"Messages",            icon:Bell },
  { key:"settings",    label:"Settings",            icon:Settings },
];

const Bdg = ({ l, c, bg }: { l:string; c:string; bg:string }) => (
  <span style={{ padding:"2px 9px",borderRadius:20,fontSize:10,fontWeight:600,background:bg,color:c,whiteSpace:"nowrap" }}>{l}</span>
);
const KPI = ({ label,value,icon,color,bg }: any) => (
  <div style={{ background:"white",borderRadius:12,padding:"13px 15px",border:"1px solid #e2e8f0",borderTop:`3px solid ${color}` }}>
    <div style={{ fontSize:16,marginBottom:5 }}>{icon}</div>
    <div style={{ fontSize:22,fontWeight:800,color }}>{value}</div>
    <div style={{ fontSize:11,color:"#64748b",marginTop:1 }}>{label}</div>
  </div>
);

const WARD_PATIENTS = [
  { id:"w1",name:"Ernest Uwimana",    bed:"B-14",ward:"Medical",  dx:"Hypertension",   bp:"160/95",temp:"36.8",pulse:"88", spo2:"97%",status:"Stable",    medsDue:true,   nextVitals:"09:00" },
  { id:"w2",name:"Alice Niyomugabo",  bed:"B-08",ward:"Medical",  dx:"COPD",            bp:"145/90",temp:"37.2",pulse:"98", spo2:"91%",status:"Needs Review",medsDue:true,  nextVitals:"Now" },
  { id:"w3",name:"Marie Mukamana",    bed:"M-03",ward:"Maternity",dx:"G2P1 ANC",        bp:"118/72",temp:"36.6",pulse:"78", spo2:"99%",status:"Stable",    medsDue:false,  nextVitals:"11:00" },
  { id:"w4",name:"Patrick Gasana",    bed:"E-02",ward:"Emergency",dx:"Chest Pain",      bp:"152/98",temp:"37.0",pulse:"110",spo2:"95%",status:"Critical",  medsDue:true,   nextVitals:"Now" },
  { id:"w5",name:"Jean B. Hakizimana",bed:"P-05",ward:"Pediatrics",dx:"Febrile illness", bp:"100/65",temp:"38.7",pulse:"105",spo2:"98%",status:"Stable",   medsDue:false,  nextVitals:"10:30" },
];

const TRIAGE_QUEUE = [
  { id:"t1",name:"Olive Uwineza",    time:"08:45",complaint:"Burning urination",        priority:"Low",    vitals:"BP 112/70, T 37.5",status:"Waiting" },
  { id:"t2",name:"Bosco Habimana",   time:"08:52",complaint:"Severe headache + vomiting",priority:"Urgent",vitals:"BP 185/110, T 37.2",status:"Waiting" },
  { id:"t3",name:"Diane Mukagasana", time:"09:01",complaint:"Shortness of breath",       priority:"High",   vitals:"BP 130/85, SpO2 93%",status:"Waiting" },
  { id:"t4",name:"Theophile Izere",  time:"09:05",complaint:"Fever 3 days, malaria RDT", priority:"Moderate",vitals:"BP 110/70, T 39.1",status:"In Room" },
];

export function NurseDashboard({ user }: { user?: AppUser }) {
  const [section, setSection] = useState<NSection>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [selPt, setSelPt] = useState<any>(null);
  const [toast, setToast] = useState("");
  const [handoverNotes, setHandoverNotes] = useState("");
  const [msgInput, setMsgInput] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  const critPts = WARD_PATIENTS.filter(p => p.status === "Critical" || p.status === "Needs Review");

  return (
    <div style={{ display:"flex",height:"100vh",overflow:"hidden",fontFamily:"'Inter',system-ui,sans-serif",background:"#f1f5f9" }}>
      {toast && <div style={{ position:"fixed",top:20,right:20,zIndex:9999,padding:"12px 20px",background:"#059669",color:"white",borderRadius:10,fontSize:13,fontWeight:600,boxShadow:"0 4px 16px rgba(0,0,0,0.15)" }}>{toast}</div>}

      {/* Sidebar */}
      <aside style={{ width:collapsed?64:224,background:"#0a1628",display:"flex",flexDirection:"column",transition:"width 0.22s",flexShrink:0,overflow:"hidden" }}>
        <div style={{ padding:"14px 12px 10px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",gap:9 }}>
          <div style={{ width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#059669,#0891b2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <HeartPulse size={15} color="white"/>
          </div>
          {!collapsed && <div style={{ overflow:"hidden" }}>
            <div style={{ color:"white",fontWeight:700,fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{user?.facility||"Hospital"}</div>
            <div style={{ color:"#475569",fontSize:9 }}>Nurse Portal</div>
          </div>}
        </div>
        <nav style={{ flex:1,overflowY:"auto",padding:"8px 6px" }}>
          {NAV.filter(n=>n.key!=="settings").map(item=>{
            const Icon=item.icon; const active=section===item.key;
            return <button key={item.key} onClick={()=>setSection(item.key)} title={collapsed?item.label:undefined}
              style={{ display:"flex",alignItems:"center",gap:8,width:"100%",padding:collapsed?"10px 0":"8px 10px",justifyContent:collapsed?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",marginBottom:1,background:active?"rgba(5,150,105,0.18)":"transparent",color:active?"#34d399":"#94a3b8",transition:"all 0.15s" }}>
              <Icon size={15} style={{ flexShrink:0 }}/>{!collapsed&&<span style={{ fontSize:12,fontWeight:active?600:400 }}>{item.label}</span>}
            </button>;
          })}
        </nav>
        <div style={{ padding:"8px 6px 10px",borderTop:"1px solid rgba(255,255,255,0.07)" }}>
          {!collapsed&&user&&<div style={{ display:"flex",alignItems:"center",gap:7,padding:"7px 8px",marginBottom:4,background:"rgba(255,255,255,0.04)",borderRadius:8 }}>
            <div style={{ width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#059669,#0891b2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"white",flexShrink:0 }}>
              {(user.name||"N").split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase()}
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:10,fontWeight:600,color:"#e2e8f0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user.name}</div>
              <div style={{ fontSize:8,color:"#475569" }}>Nurse</div>
            </div>
          </div>}
          <button onClick={()=>setSection("settings")} style={{ display:"flex",alignItems:"center",gap:8,width:"100%",padding:collapsed?"10px 0":"7px 10px",justifyContent:collapsed?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",background:section==="settings"?"rgba(5,150,105,0.18)":"transparent",color:section==="settings"?"#34d399":"#64748b",marginBottom:2 }}>
            <Settings size={14}/>{!collapsed&&<span style={{ fontSize:12 }}>Settings</span>}
          </button>
          <button onClick={()=>{logout();window.location.href="/login";}} style={{ display:"flex",alignItems:"center",gap:8,width:"100%",padding:collapsed?"10px 0":"7px 10px",justifyContent:collapsed?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",background:"transparent",color:"#64748b" }}>
            <LogOut size={14}/>{!collapsed&&<span style={{ fontSize:12 }}>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
        <header style={{ background:"white",borderBottom:"1px solid #e2e8f0",padding:"0 18px",height:52,display:"flex",alignItems:"center",gap:10,flexShrink:0 }}>
          <button onClick={()=>setCollapsed(!collapsed)} style={{ border:"none",background:"none",cursor:"pointer",padding:5,borderRadius:6,color:"#64748b",display:"flex" }}>
            {collapsed?<Menu size={16}/>:<ChevronLeft size={16}/>}
          </button>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700,fontSize:13,color:"#0f172a" }}>{NAV.find(n=>n.key===section)?.label}</div>
            <div style={{ fontSize:10,color:"#94a3b8" }}>{user?.facility} · Nursing</div>
          </div>
          {critPts.length>0&&<div style={{ display:"flex",alignItems:"center",gap:5,background:"#fee2e2",borderRadius:8,padding:"4px 10px",fontSize:11,color:"#dc2626",fontWeight:600 }}><AlertCircle size={12}/>{critPts.length} critical patients</div>}
        </header>

        <div style={{ flex:1,overflowY:"auto",padding:16 }}>

          {/* Dashboard */}
          {section==="dashboard"&&(
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ background:"linear-gradient(135deg,#0a1628,#0f2942)",borderRadius:13,padding:"16px 20px",color:"white",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
                <div>
                  <div style={{ fontSize:16,fontWeight:800,marginBottom:3 }}>Good {new Date().getHours()<12?"morning":"afternoon"}, {user?.name?.split(" ")[0]||"Nurse"} 👋</div>
                  <div style={{ fontSize:11,color:"#64748b" }}>{new Date().toLocaleDateString("en-RW",{weekday:"long",day:"numeric",month:"long"})} · {user?.department}</div>
                </div>
                <div style={{ display:"flex",gap:6 }}>
                  <button onClick={()=>setSection("triage")} style={{ padding:"6px 13px",background:"rgba(5,150,105,0.2)",color:"#34d399",border:"1px solid rgba(5,150,105,0.3)",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:600 }}>Triage Queue</button>
                  <button onClick={()=>setSection("vitals")} style={{ padding:"6px 13px",background:"rgba(255,255,255,0.08)",color:"white",border:"1px solid rgba(255,255,255,0.15)",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:600 }}>Record Vitals</button>
                </div>
              </div>
              {critPts.length>0&&<div style={{ background:"#fef2f2",border:"2px solid #fca5a5",borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:9 }}>
                <AlertCircle size={17} style={{ color:"#dc2626",flexShrink:0 }}/>
                <div>
                  <div style={{ fontSize:12,fontWeight:700,color:"#dc2626" }}>Immediate attention required: {critPts.map(p=>p.name).join(", ")}</div>
                  <div style={{ fontSize:10,color:"#b91c1c",marginTop:1 }}>Check vitals and escalate to doctor if needed</div>
                </div>
                <button onClick={()=>setSection("patients")} style={{ marginLeft:"auto",padding:"5px 12px",background:"#dc2626",color:"white",border:"none",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:700 }}>View →</button>
              </div>}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10 }}>
                <KPI label="Ward Patients"    value={WARD_PATIENTS.length}                                icon="🛏️" color="#0891b2" bg="#ecfeff"/>
                <KPI label="Critical"         value={WARD_PATIENTS.filter(p=>p.status==="Critical").length}icon="🚨" color="#dc2626" bg="#fef2f2"/>
                <KPI label="Meds Due"         value={WARD_PATIENTS.filter(p=>p.medsDue).length}           icon="💊" color="#d97706" bg="#fffbeb"/>
                <KPI label="Vitals Pending"   value={WARD_PATIENTS.filter(p=>p.nextVitals==="Now").length} icon="❤️" color="#7c3aed" bg="#f5f3ff"/>
                <KPI label="Triage Queue"     value={TRIAGE_QUEUE.filter(t=>t.status==="Waiting").length}  icon="⏳" color="#059669" bg="#ecfdf5"/>
              </div>
              {/* Quick vitals overview */}
              <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",overflow:"hidden" }}>
                <div style={{ padding:"11px 14px",borderBottom:"1px solid #f1f5f9",fontWeight:700,fontSize:12,color:"#0f172a" }}>🛏️ Ward Overview</div>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                  <thead><tr style={{ background:"#f8fafc" }}>
                    {["Bed","Patient","Ward","BP","Temp","SpO₂","Status","Next Vitals"].map(h=><th key={h} style={{ padding:"8px 11px",textAlign:"left",fontWeight:600,fontSize:10,color:"#64748b",textTransform:"uppercase",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap" }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {WARD_PATIENTS.map((p,i)=>(
                      <tr key={p.id} onClick={()=>{setSelPt(p);setSection("vitals");}} style={{ borderBottom:"1px solid #f1f5f9",cursor:"pointer" }}
                        onMouseEnter={e=>(e.currentTarget.style.background="#f8fafc")} onMouseLeave={e=>(e.currentTarget.style.background="")}>
                        <td style={{ padding:"8px 11px",fontWeight:700,color:"#0891b2" }}>{p.bed}</td>
                        <td style={{ padding:"8px 11px",fontWeight:600,color:"#0f172a" }}>{p.name}</td>
                        <td style={{ padding:"8px 11px",color:"#64748b" }}>{p.ward}</td>
                        <td style={{ padding:"8px 11px",color:p.status==="Critical"?"#dc2626":"#374151",fontWeight:p.status==="Critical"?700:400 }}>{p.bp}</td>
                        <td style={{ padding:"8px 11px",color:Number(p.temp)>38?"#dc2626":"#374151",fontWeight:Number(p.temp)>38?700:400 }}>{p.temp}°C</td>
                        <td style={{ padding:"8px 11px",color:Number(p.spo2.replace("%",""))<95?"#dc2626":"#374151",fontWeight:Number(p.spo2.replace("%",""))<95?700:400 }}>{p.spo2}</td>
                        <td style={{ padding:"8px 11px" }}><Bdg l={p.status} c={p.status==="Critical"?"#dc2626":p.status==="Needs Review"?"#d97706":"#059669"} bg={p.status==="Critical"?"#fee2e2":p.status==="Needs Review"?"#fffbeb":"#dcfce7"}/></td>
                        <td style={{ padding:"8px 11px",color:p.nextVitals==="Now"?"#dc2626":"#64748b",fontWeight:p.nextVitals==="Now"?700:400 }}>{p.nextVitals}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Vitals */}
          {section==="vitals"&&(
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Record & Review Vital Signs</div>
              {WARD_PATIENTS.map(p=>(
                <div key={p.id} style={{ background:"white",borderRadius:12,border:`1px solid ${p.status==="Critical"?"#fca5a5":p.status==="Needs Review"?"#fed7aa":"#e2e8f0"}`,overflow:"hidden" }}>
                  <div style={{ padding:"11px 14px",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8 }}>
                    <div>
                      <div style={{ fontWeight:700,fontSize:13,color:"#0f172a" }}>{p.name} — Bed {p.bed}</div>
                      <div style={{ fontSize:11,color:"#64748b",marginTop:1 }}>{p.ward} · {p.dx}</div>
                    </div>
                    <Bdg l={p.status} c={p.status==="Critical"?"#dc2626":p.status==="Needs Review"?"#d97706":"#059669"} bg={p.status==="Critical"?"#fee2e2":p.status==="Needs Review"?"#fffbeb":"#dcfce7"}/>
                  </div>
                  <div style={{ padding:"12px 14px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10 }}>
                    {[
                      { l:"Blood Pressure",v:p.bp,   ph:"120/80",alert:false },
                      { l:"Temperature",  v:p.temp+" °C",ph:"36.5",alert:Number(p.temp)>38 },
                      { l:"Pulse (bpm)",  v:p.pulse, ph:"72",  alert:Number(p.pulse)>100 },
                      { l:"SpO₂ (%)",     v:p.spo2,  ph:"98",  alert:Number(p.spo2.replace("%",""))<95 },
                    ].map(v=>(
                      <div key={v.l}>
                        <div style={{ fontSize:10,color:"#94a3b8",marginBottom:3 }}>{v.l}</div>
                        <input defaultValue={v.v} placeholder={v.ph} style={{ width:"100%",padding:"7px 10px",borderRadius:8,border:`1px solid ${v.alert?"#fca5a5":"#e2e8f0"}`,fontSize:13,fontWeight:700,color:v.alert?"#dc2626":"#0f172a",outline:"none",boxSizing:"border-box",background:v.alert?"#fff5f5":"white" }}/>
                      </div>
                    ))}
                    <div style={{ display:"flex",alignItems:"flex-end" }}>
                      <button onClick={()=>showToast(`Vitals recorded for ${p.name}`)} style={{ width:"100%",padding:"7px",background:"#059669",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:700 }}>Save Vitals</button>
                    </div>
                    {p.medsDue&&<div style={{ display:"flex",alignItems:"flex-end" }}>
                      <button onClick={()=>showToast(`Medication administered for ${p.name}`)} style={{ width:"100%",padding:"7px",background:"#7c3aed",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:700 }}>Administer Meds</button>
                    </div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Triage */}
          {section==="triage"&&(
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Triage & Queue</div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10 }}>
                {[
                  { l:"Waiting",  v:TRIAGE_QUEUE.filter(t=>t.status==="Waiting").length,  c:"#d97706" },
                  { l:"In Room",  v:TRIAGE_QUEUE.filter(t=>t.status==="In Room").length,   c:"#0891b2" },
                  { l:"Urgent",   v:TRIAGE_QUEUE.filter(t=>t.priority==="Urgent"||t.priority==="High").length, c:"#dc2626" },
                ].map(k=><div key={k.l} style={{ background:"white",borderRadius:10,padding:"12px",border:`1px solid #e2e8f0`,borderTop:`3px solid ${k.c}` }}><div style={{ fontSize:22,fontWeight:800,color:k.c }}>{k.v}</div><div style={{ fontSize:11,color:"#64748b" }}>{k.l}</div></div>)}
              </div>
              <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",overflow:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                  <thead><tr style={{ background:"#f8fafc" }}>
                    {["Time","Patient","Complaint","Vitals","Priority","Status","Action"].map(h=><th key={h} style={{ padding:"9px 12px",textAlign:"left",fontWeight:600,fontSize:10,color:"#64748b",textTransform:"uppercase",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap" }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {TRIAGE_QUEUE.map(t=>(
                      <tr key={t.id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                        <td style={{ padding:"9px 12px",color:"#64748b",whiteSpace:"nowrap" }}>{t.time}</td>
                        <td style={{ padding:"9px 12px",fontWeight:600,color:"#0f172a" }}>{t.name}</td>
                        <td style={{ padding:"9px 12px",color:"#374151",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{t.complaint}</td>
                        <td style={{ padding:"9px 12px",color:"#64748b",fontSize:11 }}>{t.vitals}</td>
                        <td style={{ padding:"9px 12px" }}><Bdg l={t.priority} c={t.priority==="Urgent"?"#dc2626":t.priority==="High"?"#d97706":t.priority==="Moderate"?"#7c3aed":"#059669"} bg={t.priority==="Urgent"?"#fee2e2":t.priority==="High"?"#fffbeb":t.priority==="Moderate"?"#f5f3ff":"#dcfce7"}/></td>
                        <td style={{ padding:"9px 12px" }}><Bdg l={t.status} c={t.status==="In Room"?"#0891b2":"#d97706"} bg={t.status==="In Room"?"#ecfeff":"#fffbeb"}/></td>
                        <td style={{ padding:"9px 12px" }}><button onClick={()=>showToast(`Patient ${t.name} called in`)} style={{ padding:"3px 9px",borderRadius:6,border:"1px solid #bae6fd",background:"#f0f9ff",cursor:"pointer",fontSize:10,color:"#0891b2",fontWeight:600 }}>Call In</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Medications */}
          {section==="medications"&&(
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Medication Administration (MAR)</div>
              {WARD_PATIENTS.filter(p=>p.medsDue).map(p=>(
                <div key={p.id} style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",padding:"14px 16px" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                    <div><div style={{ fontWeight:700,fontSize:13,color:"#0f172a" }}>{p.name} — {p.bed}</div><div style={{ fontSize:11,color:"#64748b" }}>{p.dx}</div></div>
                    <Bdg l="Meds Due" c="#d97706" bg="#fffbeb"/>
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:8 }}>
                    {["Metformin 500mg – oral – BD","Lisinopril 10mg – oral – OD","Aspirin 75mg – oral – OD"].map((med,i)=>(
                      <div key={i} style={{ padding:"8px 11px",background:"#f8fafc",borderRadius:8,border:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                        <span style={{ fontSize:11,color:"#374151" }}>{med}</span>
                        <button onClick={()=>showToast(`${med.split("–")[0].trim()} administered`)} style={{ padding:"3px 9px",background:"#059669",color:"white",border:"none",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,whiteSpace:"nowrap" }}>✓ Give</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Patients */}
          {section==="patients"&&(
            <div style={{ display:"grid",gap:12 }}>
              <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Ward Patients</div>
              {WARD_PATIENTS.map(p=>(
                <div key={p.id} style={{ background:"white",borderRadius:12,border:`1px solid ${p.status==="Critical"?"#fca5a5":"#e2e8f0"}`,padding:"13px 16px",display:"flex",alignItems:"center",gap:12 }}>
                  <div style={{ width:38,height:38,borderRadius:"50%",background:p.status==="Critical"?"#fee2e2":"#ecfdf5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:p.status==="Critical"?"#dc2626":"#059669",flexShrink:0 }}>
                    {p.name.split(" ").map((n:string)=>n[0]).join("").slice(0,2)}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700,fontSize:13,color:"#0f172a" }}>{p.name} <span style={{ fontSize:11,color:"#94a3b8",fontWeight:400 }}>Bed {p.bed} · {p.ward}</span></div>
                    <div style={{ fontSize:11,color:"#64748b",marginTop:1 }}>{p.dx} · BP {p.bp} · Temp {p.temp}°C · SpO₂ {p.spo2}</div>
                  </div>
                  <Bdg l={p.status} c={p.status==="Critical"?"#dc2626":p.status==="Needs Review"?"#d97706":"#059669"} bg={p.status==="Critical"?"#fee2e2":p.status==="Needs Review"?"#fffbeb":"#dcfce7"}/>
                  <button onClick={()=>{ setSelPt(p); setSection("vitals"); }} style={{ padding:"5px 12px",border:"1px solid #bae6fd",background:"#f0f9ff",borderRadius:7,cursor:"pointer",fontSize:10,color:"#0891b2",fontWeight:600 }}>Vitals</button>
                </div>
              ))}
            </div>
          )}

          {/* Handover */}
          {section==="handover"&&(
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Shift Handover</div>
              <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",padding:"16px 18px" }}>
                <div style={{ fontWeight:600,fontSize:12,color:"#374151",marginBottom:8 }}>Handover Notes — {new Date().toLocaleDateString("en-RW",{weekday:"long",day:"numeric",month:"long"})}</div>
                <textarea value={handoverNotes} onChange={e=>setHandoverNotes(e.target.value)} rows={8}
                  placeholder={"SBAR Handover:\n\nSITUATION: Current ward status, patient count\nBACKGROUND: Key clinical history\nASSESSMENT: Patient conditions, concerns\nRECOMMENDATION: Priority actions for incoming shift"}
                  style={{ width:"100%",padding:"12px 14px",borderRadius:9,border:"1px solid #e2e8f0",fontSize:12,outline:"none",resize:"vertical",fontFamily:"monospace",color:"#0f172a",lineHeight:1.7,boxSizing:"border-box" }}/>
                <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:10 }}>
                  <button onClick={()=>showToast("Handover note saved")} style={{ padding:"8px 16px",border:"1px solid #e2e8f0",background:"white",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,color:"#374151" }}>Save Draft</button>
                  <button onClick={()=>showToast("✅ Handover submitted — incoming nurse notified")} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 18px",background:"linear-gradient(135deg,#059669,#0891b2)",color:"white",border:"none",borderRadius:9,cursor:"pointer",fontSize:12,fontWeight:700 }}><Send size={12}/>Submit Handover</button>
                </div>
              </div>
            </div>
          )}

          {/* Inbox */}
          {section==="inbox"&&(
            <div style={{ display:"grid",gap:12 }}>
              <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Messages</div>
              <div style={{ display:"flex",alignItems:"center",gap:6,background:"white",border:"1px solid #e2e8f0",borderRadius:8,padding:"7px 11px",marginBottom:4 }}>
                <Search size={12} style={{ color:"#94a3b8" }}/>
                <input value={msgInput} onChange={e=>setMsgInput(e.target.value)} placeholder="Search messages…" style={{ border:"none",outline:"none",fontSize:12,background:"transparent",flex:1,color:"#0f172a" }}/>
              </div>
              {[
                { from:"Dr. Grace Mukamana",subj:"Vitals update needed for Patrick Gasana — urgent",type:"urgent",time:"5m ago",unread:true },
                { from:"Ward Manager",      subj:"Medication round starting in 15 minutes",         type:"info",  time:"20m ago",unread:true },
                { from:"Pharmacy",          subj:"Metformin refill ready for Bed B-14",             type:"info",  time:"1h ago", unread:false },
                { from:"Charge Nurse",      subj:"Please complete handover before 14:00",           type:"admin", time:"2h ago", unread:false },
              ].map((msg,i)=>(
                <div key={i} style={{ background:"white",borderRadius:12,border:`1px solid ${msg.unread&&msg.type==="urgent"?"#fca5a5":msg.unread?"#bae6fd":"#e2e8f0"}`,padding:"12px 14px",display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ width:32,height:32,borderRadius:9,background:msg.type==="urgent"?"#fee2e2":"#ecfeff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0 }}>
                    {msg.type==="urgent"?"🚨":"ℹ️"}
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:11,color:"#94a3b8",marginBottom:1 }}>{msg.from} · {msg.time}</div>
                    <div style={{ fontSize:12,fontWeight:msg.unread?700:400,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{msg.subj}</div>
                  </div>
                  {msg.unread&&<div style={{ width:7,height:7,borderRadius:"50%",background:msg.type==="urgent"?"#dc2626":"#0891b2",flexShrink:0 }}/>}
                </div>
              ))}
            </div>
          )}

          {/* Settings */}
          {section==="settings"&&(
            <AccountSettings user={user} onClose={()=>setSection("dashboard")}/>
          )}
        </div>
      </div>
    </div>
  );
}
