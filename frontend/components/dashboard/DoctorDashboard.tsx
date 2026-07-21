"use client";
/**
 * ARTIC HMS — Doctor Portal
 * Full sidebar navigation portal (dark navy, like Hospital Manager)
 * Sections: Dashboard, Patients, Register, Appointments, Lab Orders,
 *           Laboratory Results, Prescriptions, Radiology, In-Basket, Reports, Settings
 */
import { useState, useEffect, useCallback, useRef } from "react";
import {
  LayoutDashboard, Users, UserRoundPlus, CalendarDays, FlaskConical,
  Pill, Radio, MessageSquare, BarChart3, Settings, LogOut,
  ChevronLeft, Menu, Bell, Search, AlertCircle, CheckCircle,
  ChevronRight, Activity, Send, Download, X, Plus,
  Stethoscope, ClipboardList, TrendingUp, Eye, EyeOff,
  FileText, RefreshCw, Key, Shield, Mail,
} from "lucide-react";
import type { AppUser } from "@/types/hms";
import { PatientRegistrationForm } from "@/components/dashboard/PatientRegistrationForm";
import { AccountSettings } from "@/components/ui/AccountSettings";
import {
  appointmentsApi, reportsApi, labApi, patientsApi,
} from "@/lib/api/hms";
import { getSession, logout } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://172.209.217.176:4001";

// ── Sidebar nav ───────────────────────────────────────────────────────────────
type DocSection =
  | "dashboard" | "patients" | "register" | "appointments"
  | "lab-orders" | "lab-results" | "prescriptions" | "radiology"
  | "inbox" | "reports" | "settings";

const NAV_ITEMS: { key: DocSection; label: string; icon: any; badge?: number }[] = [
  { key:"dashboard",     label:"Dashboard",          icon:LayoutDashboard },
  { key:"patients",      label:"My Patients",         icon:Users },
  { key:"register",      label:"Register Patient",    icon:UserRoundPlus },
  { key:"appointments",  label:"Appointments",        icon:CalendarDays },
  { key:"lab-orders",    label:"Lab Orders",          icon:FlaskConical },
  { key:"lab-results",   label:"Lab Results",         icon:Activity },
  { key:"prescriptions", label:"e-Prescribing",       icon:Pill },
  { key:"radiology",     label:"Radiology",           icon:Radio },
  { key:"inbox",         label:"In-Basket",           icon:MessageSquare },
  { key:"reports",       label:"Reports & KPIs",      icon:BarChart3 },
  { key:"settings",      label:"Settings",            icon:Settings },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const TL = ({ level }: { level:"red"|"amber"|"green" }) => (
  <span style={{ display:"inline-block",width:10,height:10,borderRadius:"50%",flexShrink:0,
    background:level==="red"?"#dc2626":level==="amber"?"#f59e0b":"#22c55e",
    boxShadow:`0 0 5px ${level==="red"?"#dc2626":level==="amber"?"#f59e0b":"#22c55e"}` }}/>
);
const Bdg = ({ label, color, bg }: { label:string; color:string; bg:string }) => (
  <span style={{ padding:"2px 9px",borderRadius:20,fontSize:10,fontWeight:600,background:bg,color,whiteSpace:"nowrap" }}>{label}</span>
);
const KPI = ({ label,value,icon,color,bg,sub }: any) => (
  <div style={{ background:"white",borderRadius:12,padding:"14px 16px",border:"1px solid #e2e8f0",borderTop:`3px solid ${color}` }}>
    <div style={{ width:32,height:32,borderRadius:9,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,marginBottom:8 }}>{icon}</div>
    <div style={{ fontSize:22,fontWeight:800,color }}>{value}</div>
    <div style={{ fontSize:11,color:"#64748b",marginTop:2,fontWeight:500 }}>{label}</div>
    {sub && <div style={{ fontSize:10,color:"#94a3b8",marginTop:1 }}>{sub}</div>}
  </div>
);
const MiniBar = ({ data, color, height=52 }: { data:number[]; color:string; height?:number }) => {
  const mx=Math.max(...data,1), w=100/data.length;
  return <svg width="100%" height={height} style={{ overflow:"visible" }}>
    {data.map((v,i)=><rect key={i} x={`${i*w+w*0.1}%`} y={height-(v/mx)*(height-6)} width={`${w*0.8}%`} height={(v/mx)*(height-6)} fill={color} rx={3} opacity={0.85}/>)}
  </svg>;
};

// Mock today's patients
const PATIENTS_TODAY = [
  { id:"p1",name:"Ernest Uwimana",    age:52,gender:"M",dx:"Hypertension + T2DM",       urgency:"red",   time:"09:00",status:"In Room",   pam:42,  vitals:{ bp:"160/95",temp:"36.8",spo2:"97%",pulse:"88" } },
  { id:"p2",name:"Marie Mukamana",    age:34,gender:"F",dx:"ANC Visit (28 weeks)",       urgency:"green", time:"09:30",status:"Waiting",   pam:76,  vitals:{ bp:"118/72",temp:"36.6",spo2:"99%",pulse:"78" } },
  { id:"p3",name:"Jean B. Hakizimana",age:8, gender:"M",dx:"Acute Febrile Illness",      urgency:"amber", time:"10:00",status:"Waiting",   pam:null,vitals:{ bp:"100/65",temp:"38.7",spo2:"98%",pulse:"105"} },
  { id:"p4",name:"Alice Niyomugabo",  age:61,gender:"F",dx:"COPD Exacerbation",          urgency:"red",   time:"10:30",status:"Checked In",pam:28,  vitals:{ bp:"145/90",temp:"37.2",spo2:"91%",pulse:"98" } },
  { id:"p5",name:"Patrick Gasana",    age:45,gender:"M",dx:"Chest Pain — Rule out ACS",  urgency:"red",   time:"STAT", status:"Emergency", pam:35,  vitals:{ bp:"152/98",temp:"37.0",spo2:"95%",pulse:"110"} },
  { id:"p6",name:"Olive Uwineza",     age:29,gender:"F",dx:"Urinary Tract Infection",    urgency:"green", time:"11:00",status:"Waiting",   pam:82,  vitals:{ bp:"112/70",temp:"37.5",spo2:"99%",pulse:"82" } },
];

// Mock appointments
const MOCK_APPTS = [
  { id:"a1",patient:"Ernest Uwimana",   date:"2026-07-20",time:"09:00",type:"Follow-up",  reason:"Chronic BP/DM review — 3 monthly",       status:"confirmed",  priority:"routine" },
  { id:"a2",patient:"Marie Mukamana",   date:"2026-07-20",time:"09:30",type:"ANC",        reason:"ANC visit — 28 weeks, routine check",     status:"confirmed",  priority:"routine" },
  { id:"a3",patient:"Jean B.",          date:"2026-07-20",time:"10:00",type:"Acute",      reason:"High fever for 2 days, suspected malaria", status:"pending",    priority:"urgent" },
  { id:"a4",patient:"Alice Niyomugabo", date:"2026-07-20",time:"10:30",type:"Emergency",  reason:"Acute shortness of breath — COPD",        status:"pending",    priority:"emergency" },
  { id:"a5",patient:"Olive Uwineza",    date:"2026-07-20",time:"11:00",type:"New",        reason:"Burning on urination, 3 days",            status:"pending",    priority:"routine" },
  { id:"a6",patient:"Patrick Karera",   date:"2026-07-21",time:"08:30",type:"Follow-up",  reason:"Post-op wound review — day 7",            status:"pending",    priority:"routine" },
  { id:"a7",patient:"Diane Mukagasana", date:"2026-07-19",time:"14:00",type:"New",        reason:"Persistent cough 3 weeks",                status:"completed",  priority:"routine" },
  { id:"a8",patient:"Bosco Habimana",   date:"2026-07-18",time:"10:00",type:"New",        reason:"Headache, blurred vision",                status:"rejected",   priority:"routine" },
];

// Mock lab results
const MOCK_LAB = [
  { id:"l1",patient:"Ernest Uwimana",   test:"HbA1c",       result:"9.2%",     ref:"<7%",      flag:"High",     status:"Final",       date:"Jul 20",urgent:true  },
  { id:"l2",patient:"Patrick Gasana",   test:"Troponin I",  result:"0.8 ng/mL",ref:"<0.04",    flag:"Critical", status:"Final",       date:"Jul 20",urgent:true  },
  { id:"l3",patient:"Marie Mukamana",   test:"Haemoglobin", result:"10.2 g/dL",ref:"12–16",    flag:"Low",      status:"Final",       date:"Jul 19",urgent:false },
  { id:"l4",patient:"Alice Niyomugabo", test:"Peak Flow",   result:"180 L/min",ref:"350–450",  flag:"Low",      status:"Preliminary", date:"Jul 20",urgent:false },
  { id:"l5",patient:"Jean B.",          test:"Malaria RDT", result:"POSITIVE", ref:"Negative", flag:"Positive", status:"Final",       date:"Jul 20",urgent:true  },
  { id:"l6",patient:"Olive Uwineza",    test:"Urinalysis",  result:"Nitrites+",ref:"Negative", flag:"Abnormal", status:"Final",       date:"Jul 20",urgent:false },
];

type OTPStep = "current"|"otp"|"newpw"|"done";

export function DoctorDashboard({ user }: { user?: AppUser }) {
  const [section,    setSection]   = useState<DocSection>("dashboard");
  const [collapsed,  setCollapsed] = useState(false);
  const [selPt,      setSelPt]     = useState<any>(null);
  const [showConsult,setConsult]   = useState(false);
  const [showRx,     setShowRx]    = useState(false);
  const [consultNotes, setNotes]   = useState("");
  const [rxInput,    setRxInput]   = useState({ drug:"",dose:"",freq:"",duration:"",route:"",notes:"" });
  const [rxList,     setRxList]    = useState<any[]>([]);
  const [ptSearch,   setPtSearch]  = useState("");
  const [apptFilter, setApptFilter]= useState<"all"|"pending"|"confirmed"|"completed"|"rejected">("all");
  const [showNotif,  setShowNotif] = useState(false);
  const [appts,      setAppts]     = useState(MOCK_APPTS);
  const [kpis,       setKpis]      = useState<any[]>([]);
  const [toast,      setToast]     = useState("");
  const [loading,    setLoading]   = useState(false);

  // OTP password change
  const [otpStep,   setOtpStep]    = useState<OTPStep>("current");
  const [pwCurrent, setPwCurrent]  = useState("");
  const [pwOtp,     setPwOtp]      = useState("");
  const [pwNew,     setPwNew]      = useState("");
  const [pwConfirm, setPwConfirm]  = useState("");
  const [pwLoading, setPwLoading]  = useState(false);
  const [showPw,    setShowPw]     = useState(false);
  const [otpHint,   setOtpHint]    = useState("");

  function showToast(msg:string) { setToast(msg); setTimeout(()=>setToast(""),3500); }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await reportsApi.kpis() as any[];
      setKpis(Array.isArray(r)?r:[]);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Appointment actions
  function apptAction(id:string, action:"confirm"|"reject"|"complete") {
    const labels = { confirm:"Confirmed",reject:"Rejected",complete:"Completed" } as const;
    setAppts(p=>p.map(a=>a.id===id?{ ...a,status:action==="confirm"?"confirmed":action==="reject"?"rejected":"completed" }:a));
    showToast(`✅ Appointment ${labels[action]}`);
    // In real: appointmentsApi.setStatus(id, labels[action].toLowerCase());
  }

  // OTP flow
  async function stepRequestOTP() {
    if (!pwCurrent) { showToast("Enter current password"); return; }
    setPwLoading(true);
    try {
      const s = getSession();
      const res = await fetch(`${API}/api/auth/request-otp`,{
        method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${s?.accessToken}`},
        body:JSON.stringify({ currentPassword:pwCurrent }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.message||"Incorrect password"); return; }
      setOtpHint(data.hint||"OTP sent to your email");
      setOtpStep("otp");
      showToast("✅ OTP sent to your email");
    } catch { showToast("Server error"); }
    finally { setPwLoading(false); }
  }
  function stepConfirmOTP() {
    if (pwOtp.length!==6) { showToast("Enter 6-digit OTP"); return; }
    setOtpStep("newpw");
  }
  async function stepChangePassword() {
    if (!pwNew||pwNew.length<8) { showToast("Min 8 characters"); return; }
    if (pwNew!==pwConfirm) { showToast("Passwords do not match"); return; }
    setPwLoading(true);
    try {
      const s = getSession();
      const res = await fetch(`${API}/api/auth/confirm-password-otp`,{
        method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${s?.accessToken}`},
        body:JSON.stringify({ otp:pwOtp, newPassword:pwNew }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.message||"Failed"); setOtpStep("otp"); return; }
      setOtpStep("done");
      showToast("✅ Password changed! Logging out…");
      setTimeout(()=>{ logout(); window.location.href="/login"; },2500);
    } catch { showToast("Server error"); }
    finally { setPwLoading(false); }
  }
  function resetOTP() { setOtpStep("current"); setPwCurrent(""); setPwOtp(""); setPwNew(""); setPwConfirm(""); }

  const pwStr  = pwNew.length>=12?"Strong":pwNew.length>=8?"Good":pwNew.length>=6?"Weak":"";
  const pwStrC = pwStr==="Strong"?"#059669":pwStr==="Good"?"#d97706":"#dc2626";
  const pwStrP = pwStr==="Strong"?100:pwStr==="Good"?65:pwStr==="Weak"?30:0;

  // Report download helper
  function downloadReport(name:string, rows:string[][], headers:string[]) {
    const csv=[headers,...rows].map(r=>r.map(c=>`"${String(c||"").replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob=new Blob([csv],{type:"text/csv"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`${name}_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    showToast(`✅ ${name} downloaded`);
  }

  const filteredAppts = appts.filter(a=>apptFilter==="all"||a.status===apptFilter);
  const urgencyOrder: Record<string,number> = { red:0,amber:1,green:2 };
  const sortedPts = [...PATIENTS_TODAY]
    .filter(p=>!ptSearch||p.name.toLowerCase().includes(ptSearch.toLowerCase())||p.dx.toLowerCase().includes(ptSearch.toLowerCase()))
    .sort((a,b)=>urgencyOrder[a.urgency]-urgencyOrder[b.urgency]);

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ display:"flex",height:"100vh",overflow:"hidden",fontFamily:"'Inter',system-ui,sans-serif",background:"#f1f5f9" }}>

      {/* Toast */}
      {toast && <div style={{ position:"fixed",top:20,right:20,zIndex:9999,padding:"12px 20px",background:"#059669",color:"white",borderRadius:10,fontSize:13,fontWeight:600,boxShadow:"0 4px 16px rgba(0,0,0,0.15)",maxWidth:380 }}>{toast}</div>}

      {/* ── SIDEBAR ── */}
      <aside style={{ width:collapsed?64:230,background:"#0a1628",display:"flex",flexDirection:"column",transition:"width 0.22s ease",flexShrink:0,overflow:"hidden" }}>
        {/* Brand */}
        <div style={{ padding:"14px 12px 10px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",gap:9 }}>
          <div style={{ width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#0891b2,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <Stethoscope size={16} color="white"/>
          </div>
          {!collapsed && (
            <div style={{ overflow:"hidden" }}>
              <div style={{ color:"white",fontWeight:700,fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{user?.facility||"Hospital"}</div>
              <div style={{ color:"#475569",fontSize:9,whiteSpace:"nowrap" }}>Doctor Portal</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex:1,overflowY:"auto",padding:"8px 6px" }}>
          {NAV_ITEMS.filter(n=>n.key!=="settings").map(item=>{
            const Icon=item.icon; const active=section===item.key;
            return (
              <button key={item.key} onClick={()=>setSection(item.key)} title={collapsed?item.label:undefined}
                style={{ display:"flex",alignItems:"center",gap:8,width:"100%",padding:collapsed?"10px 0":"8px 10px",justifyContent:collapsed?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",marginBottom:1,background:active?"rgba(8,145,178,0.18)":"transparent",color:active?"#38bdf8":"#94a3b8",transition:"all 0.15s" }}>
                <Icon size={15} style={{ flexShrink:0 }}/>
                {!collapsed && <span style={{ fontSize:12,fontWeight:active?600:400,flex:1,textAlign:"left",whiteSpace:"nowrap" }}>{item.label}</span>}
                {!collapsed && item.badge && <span style={{ background:"#dc2626",color:"white",borderRadius:10,padding:"1px 5px",fontSize:9,fontWeight:700 }}>{item.badge}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom user + settings + logout */}
        <div style={{ padding:"8px 6px 10px",borderTop:"1px solid rgba(255,255,255,0.07)" }}>
          {!collapsed && user && (
            <div style={{ display:"flex",alignItems:"center",gap:7,padding:"7px 8px",marginBottom:4,background:"rgba(255,255,255,0.04)",borderRadius:8 }}>
              <div style={{ width:26,height:26,borderRadius:"50%",background:"linear-gradient(135deg,#0891b2,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"white",flexShrink:0 }}>
                {(user.name||"D").split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase()}
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:10,fontWeight:600,color:"#e2e8f0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user.name}</div>
                <div style={{ fontSize:8,color:"#475569" }}>Doctor · {user.department}</div>
              </div>
            </div>
          )}
          <button onClick={()=>setSection("settings")} title={collapsed?"Settings":undefined}
            style={{ display:"flex",alignItems:"center",gap:8,width:"100%",padding:collapsed?"10px 0":"7px 10px",justifyContent:collapsed?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",background:section==="settings"?"rgba(8,145,178,0.18)":"transparent",color:section==="settings"?"#38bdf8":"#64748b",marginBottom:1 }}>
            <Settings size={14} style={{ flexShrink:0 }}/>{!collapsed && <span style={{ fontSize:12 }}>Settings</span>}
          </button>
          <button onClick={()=>{logout();window.location.href="/login";}}
            style={{ display:"flex",alignItems:"center",gap:8,width:"100%",padding:collapsed?"10px 0":"7px 10px",justifyContent:collapsed?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",background:"transparent",color:"#64748b" }}>
            <LogOut size={14} style={{ flexShrink:0 }}/>{!collapsed && <span style={{ fontSize:12 }}>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
        {/* Topbar */}
        <header style={{ background:"white",borderBottom:"1px solid #e2e8f0",padding:"0 18px",height:54,display:"flex",alignItems:"center",gap:10,flexShrink:0,boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
          <button onClick={()=>setCollapsed(!collapsed)} style={{ border:"none",background:"none",cursor:"pointer",padding:5,borderRadius:6,color:"#64748b",display:"flex" }}>
            {collapsed?<Menu size={17}/>:<ChevronLeft size={17}/>}
          </button>
          <div style={{ display:"flex",alignItems:"center",gap:6,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"6px 11px",flex:1,maxWidth:340 }}>
            <Search size={13} style={{ color:"#94a3b8",flexShrink:0 }}/>
            <input placeholder="Search patients, results…" style={{ border:"none",outline:"none",fontSize:12,background:"transparent",flex:1,color:"#0f172a" }}/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700,fontSize:13,color:"#0f172a" }}>{NAV_ITEMS.find(n=>n.key===section)?.label}</div>
            <div style={{ fontSize:10,color:"#94a3b8" }}>{user?.facility} · Clinical Workspace</div>
          </div>
          {/* Traffic lights legend */}
          <div style={{ display:"flex",alignItems:"center",gap:8,fontSize:10,color:"#64748b" }}>
            <TL level="red"/><span>Urgent</span>
            <TL level="amber"/><span>Review</span>
            <TL level="green"/><span>Stable</span>
          </div>
          <div style={{ position:"relative" }}>
            <button onClick={()=>setShowNotif(!showNotif)} style={{ border:"none",background:"none",cursor:"pointer",padding:5,borderRadius:8,color:"#64748b",display:"flex",position:"relative" }}>
              <Bell size={17}/>
              <span style={{ position:"absolute",top:2,right:2,width:7,height:7,borderRadius:"50%",background:"#dc2626",border:"2px solid white" }}/>
            </button>
            {showNotif && (
              <div style={{ position:"absolute",right:0,top:44,width:300,background:"white",border:"1px solid #e2e8f0",borderRadius:12,boxShadow:"0 8px 32px rgba(0,0,0,0.12)",zIndex:300 }}>
                <div style={{ padding:"10px 14px",borderBottom:"1px solid #f1f5f9",fontWeight:700,fontSize:12,color:"#0f172a" }}>Notifications</div>
                {[
                  "🚨 Critical result: Troponin — Patrick Gasana",
                  "⚕️ Patient ready in Room 3: Ernest Uwimana",
                  "💊 Pharmacy: Metformin dispensed for E. Uwimana",
                  "📋 Appointment request: Alice Niyomugabo — COPD",
                ].map((n,i)=><div key={i} style={{ padding:"8px 14px",borderBottom:"1px solid #f9fafb",fontSize:11,color:"#374151",cursor:"pointer" }}>{n}</div>)}
                <div style={{ padding:"6px 14px",textAlign:"center" }}><button onClick={()=>setShowNotif(false)} style={{ fontSize:11,color:"#0891b2",border:"none",background:"none",cursor:"pointer",fontWeight:600 }}>Close</button></div>
              </div>
            )}
          </div>
          <button onClick={load} disabled={loading} style={{ border:"none",background:"none",cursor:"pointer",padding:5,borderRadius:6,color:"#64748b",display:"flex" }}>
            <RefreshCw size={15} style={loading?{animation:"spin 1s linear infinite"}:{}}/>
          </button>
          <div onClick={()=>setSection("settings")} style={{ width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#0891b2,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0 }}>
            {(user?.name||"D").split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase()}
          </div>
        </header>

        {/* Body */}
        <div style={{ flex:1,overflowY:"auto",padding:18 }}>

          {/* ══ DASHBOARD ══ */}
          {section==="dashboard" && (
            <div style={{ display:"grid",gap:16 }}>
              {/* Welcome banner */}
              <div style={{ background:"linear-gradient(135deg,#0a1628,#0f2942)",borderRadius:14,padding:"18px 22px",color:"white",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12 }}>
                <div>
                  <div style={{ fontSize:17,fontWeight:800,marginBottom:3 }}>
                    Good {new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"}, Dr. {user?.name?.split(" ")[1]||user?.name||"Doctor"} 👋
                  </div>
                  <div style={{ fontSize:11,color:"#64748b" }}>{new Date().toLocaleDateString("en-RW",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} · {user?.department}</div>
                  <div style={{ display:"flex",gap:10,marginTop:8 }}>
                    <span style={{ padding:"3px 10px",background:"rgba(8,145,178,0.2)",color:"#38bdf8",borderRadius:20,fontSize:10,fontWeight:600,border:"1px solid rgba(8,145,178,0.3)" }}>🟢 On Duty</span>
                    <span style={{ padding:"3px 10px",background:"rgba(220,38,38,0.2)",color:"#fca5a5",borderRadius:20,fontSize:10,fontWeight:600,border:"1px solid rgba(220,38,38,0.3)" }}>⚠️ {PATIENTS_TODAY.filter(p=>p.urgency==="red").length} Urgent Patients</span>
                  </div>
                </div>
                <div style={{ display:"flex",gap:7 }}>
                  <button onClick={()=>setSection("patients")} style={{ padding:"7px 14px",background:"rgba(8,145,178,0.2)",color:"#38bdf8",border:"1px solid rgba(8,145,178,0.3)",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:600 }}>View Patients</button>
                  <button onClick={()=>setSection("register")} style={{ padding:"7px 14px",background:"rgba(255,255,255,0.08)",color:"white",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:600 }}>Register Patient</button>
                </div>
              </div>

              {/* Urgent alert */}
              {PATIENTS_TODAY.filter(p=>p.urgency==="red").length>0 && (
                <div style={{ background:"#fef2f2",border:"2px solid #fca5a5",borderRadius:12,padding:"11px 16px",display:"flex",alignItems:"center",gap:10 }}>
                  <AlertCircle size={18} style={{ color:"#dc2626",flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13,fontWeight:700,color:"#dc2626" }}>Urgent — {PATIENTS_TODAY.filter(p=>p.urgency==="red").length} patients need immediate attention</div>
                    <div style={{ fontSize:11,color:"#b91c1c",marginTop:1 }}>{PATIENTS_TODAY.filter(p=>p.urgency==="red").map(p=>p.name).join(" · ")}</div>
                  </div>
                  <button onClick={()=>setSection("patients")} style={{ padding:"6px 14px",background:"#dc2626",color:"white",border:"none",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:700 }}>Review →</button>
                </div>
              )}

              {/* KPIs */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:11 }}>
                <KPI label="Today's Patients"    value={PATIENTS_TODAY.length}                                 icon="👤" color="#0891b2" bg="#ecfeff" sub="Scheduled"/>
                <KPI label="Urgent / Red"        value={PATIENTS_TODAY.filter(p=>p.urgency==="red").length}   icon="🚨" color="#dc2626" bg="#fef2f2" sub="See immediately"/>
                <KPI label="Waiting"             value={PATIENTS_TODAY.filter(p=>p.status==="Waiting").length} icon="⏳" color="#d97706" bg="#fffbeb" sub="In queue"/>
                <KPI label="Completed Today"     value={2}                                                     icon="✅" color="#059669" bg="#ecfdf5" sub="Consultations"/>
                <KPI label="Pending Appointments"value={appts.filter(a=>a.status==="pending").length}          icon="📅" color="#7c3aed" bg="#f5f3ff" sub="Need action"/>
                <KPI label="Unread Lab Results"  value={MOCK_LAB.filter(l=>l.urgent).length}                   icon="🔬" color="#0891b2" bg="#ecfeff" sub="Requires review"/>
              </div>

              {/* Queue + quick actions */}
              <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:14 }}>
                <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",overflow:"hidden" }}>
                  <div style={{ padding:"12px 16px",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <div style={{ fontWeight:700,fontSize:13,color:"#0f172a" }}>👥 Today&apos;s Queue</div>
                    <button onClick={()=>setSection("patients")} style={{ fontSize:11,color:"#0891b2",border:"none",background:"none",cursor:"pointer",fontWeight:600 }}>Full list →</button>
                  </div>
                  {PATIENTS_TODAY.slice(0,5).map(p=>(
                    <div key={p.id} onClick={()=>{setSelPt(p);setSection("patients");}} style={{ display:"flex",alignItems:"center",gap:9,padding:"10px 16px",borderBottom:"1px solid #f9fafb",cursor:"pointer" }}
                      onMouseEnter={e=>(e.currentTarget.style.background="#f8fafc")} onMouseLeave={e=>(e.currentTarget.style.background="")}>
                      <TL level={p.urgency as any}/>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:12,fontWeight:600,color:"#0f172a" }}>{p.name} <span style={{ fontSize:10,color:"#94a3b8",fontWeight:400 }}>{p.age}{p.gender} · {p.time}</span></div>
                        <div style={{ fontSize:10,color:"#64748b" }}>{p.dx}</div>
                      </div>
                      <Bdg label={p.status} color={p.status==="Emergency"?"#dc2626":p.status==="In Room"?"#0891b2":p.status==="Checked In"?"#7c3aed":"#d97706"} bg={p.status==="Emergency"?"#fee2e2":p.status==="In Room"?"#ecfeff":p.status==="Checked In"?"#f5f3ff":"#fffbeb"}/>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                  <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",padding:"12px 14px" }}>
                    <div style={{ fontWeight:700,fontSize:12,color:"#0f172a",marginBottom:8 }}>⚡ Quick Actions</div>
                    {[
                      { l:"Start Consultation",  a:()=>setConsult(true) },
                      { l:"Register New Patient",a:()=>setSection("register") },
                      { l:"Write Prescription",  a:()=>setShowRx(true) },
                      { l:"Order Lab Tests",      a:()=>setSection("lab-orders") },
                      { l:"View Lab Results",     a:()=>setSection("lab-results") },
                      { l:"Pending Appointments", a:()=>setSection("appointments") },
                    ].map(a=>(
                      <button key={a.l} onClick={a.a} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"6px 8px",marginBottom:3,background:"#f8fafc",borderRadius:7,border:"none",cursor:"pointer",fontSize:11,color:"#374151",fontWeight:500 }}>
                        {a.l}<ChevronRight size={10}/>
                      </button>
                    ))}
                  </div>
                  <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",padding:"12px 14px" }}>
                    <div style={{ fontWeight:700,fontSize:12,color:"#0f172a",marginBottom:8 }}>🔬 Critical Results</div>
                    {MOCK_LAB.filter(l=>l.urgent).map(l=>(
                      <div key={l.id} style={{ padding:"6px 0",borderBottom:"1px solid #f1f5f9",fontSize:11 }}>
                        <div style={{ fontWeight:600,color:"#dc2626" }}>{l.flag} — {l.test}</div>
                        <div style={{ color:"#64748b" }}>{l.patient} · {l.result}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ PATIENTS ══ */}
          {section==="patients" && (
            <div style={{ display:"grid",gap:12 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
                <div style={{ fontWeight:700,fontSize:15,color:"#0f172a",flex:1 }}>My Patients — Today</div>
                <div style={{ display:"flex",alignItems:"center",gap:6,background:"white",border:"1px solid #e2e8f0",borderRadius:8,padding:"7px 11px" }}>
                  <Search size={13} style={{ color:"#94a3b8" }}/>
                  <input value={ptSearch} onChange={e=>setPtSearch(e.target.value)} placeholder="Search by name or diagnosis…" style={{ border:"none",outline:"none",fontSize:12,background:"transparent",width:220,color:"#0f172a" }}/>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:6,fontSize:11,color:"#64748b" }}>
                  <TL level="red"/>{PATIENTS_TODAY.filter(p=>p.urgency==="red").length}
                  <TL level="amber"/>{PATIENTS_TODAY.filter(p=>p.urgency==="amber").length}
                  <TL level="green"/>{PATIENTS_TODAY.filter(p=>p.urgency==="green").length}
                </div>
              </div>
              <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",overflow:"hidden" }}>
                {sortedPts.map((p,i)=>(
                  <div key={p.id} style={{ borderBottom:i<sortedPts.length-1?"1px solid #f1f5f9":"none" }}>
                    <div onClick={()=>setSelPt(selPt?.id===p.id?null:p)} style={{ display:"flex",alignItems:"center",gap:11,padding:"13px 16px",cursor:"pointer",background:selPt?.id===p.id?"#f0fdf4":"white",transition:"background 0.1s" }}>
                      <TL level={p.urgency as any}/>
                      <div style={{ width:36,height:36,borderRadius:"50%",background:p.urgency==="red"?"#fee2e2":p.urgency==="amber"?"#fffbeb":"#ecfdf5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:p.urgency==="red"?"#dc2626":p.urgency==="amber"?"#d97706":"#059669",flexShrink:0 }}>
                        {p.name.split(" ").map((n:string)=>n[0]).join("").slice(0,2)}
                      </div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:2 }}>
                          <span style={{ fontSize:13,fontWeight:700,color:"#0f172a" }}>{p.name}</span>
                          <span style={{ fontSize:11,color:"#94a3b8" }}>{p.age}y {p.gender}</span>
                          {p.urgency==="red" && <span style={{ fontSize:9,background:"#fee2e2",color:"#dc2626",padding:"1px 6px",borderRadius:4,fontWeight:700 }}>URGENT</span>}
                        </div>
                        <div style={{ fontSize:11,color:"#64748b" }}>{p.dx}</div>
                      </div>
                      <Bdg label={p.status} color={p.status==="Emergency"?"#dc2626":p.status==="In Room"?"#0891b2":p.status==="Checked In"?"#7c3aed":"#94a3b8"} bg={p.status==="Emergency"?"#fee2e2":p.status==="In Room"?"#ecfeff":p.status==="Checked In"?"#f5f3ff":"#f1f5f9"}/>
                      <ChevronRight size={13} style={{ color:"#cbd5e1",transform:selPt?.id===p.id?"rotate(90deg)":"none",transition:"transform 0.2s" }}/>
                    </div>
                    {selPt?.id===p.id && (
                      <div style={{ padding:"12px 16px 16px",background:"#f8fafc",borderTop:"1px solid #e2e8f0" }}>
                        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                          <div>
                            <div style={{ fontWeight:700,fontSize:11,color:"#0f172a",marginBottom:7,display:"flex",alignItems:"center",gap:4 }}><Activity size={12} style={{ color:"#0891b2" }}/>Vital Signs</div>
                            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }}>
                              {[
                                { l:"BP",   v:p.vitals.bp,  alert:p.urgency==="red" },
                                { l:"Temp", v:p.vitals.temp, alert:Number(p.vitals.temp)>38 },
                                { l:"SpO₂", v:p.vitals.spo2, alert:Number(p.vitals.spo2.replace("%",""))<95 },
                                { l:"Pulse",v:p.vitals.pulse+" bpm",alert:Number(p.vitals.pulse)>100 },
                              ].map(v=>(
                                <div key={v.l} style={{ padding:"7px 9px",background:v.alert?"#fef2f2":"white",borderRadius:7,border:`1px solid ${v.alert?"#fca5a5":"#e2e8f0"}` }}>
                                  <div style={{ fontSize:9,color:"#94a3b8",marginBottom:1 }}>{v.l}</div>
                                  <div style={{ fontSize:13,fontWeight:700,color:v.alert?"#dc2626":"#0f172a" }}>{v.v}</div>
                                </div>
                              ))}
                            </div>
                            {p.pam!==null && (
                              <div style={{ marginTop:7,padding:"7px 11px",background:p.pam<40?"#fee2e2":p.pam<60?"#fffbeb":"#ecfdf5",borderRadius:8,border:`1px solid ${p.pam<40?"#fca5a5":p.pam<60?"#fed7aa":"#bbf7d0"}` }}>
                                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                                  <div>
                                    <div style={{ fontSize:9,color:"#64748b" }}>PAM Score</div>
                                    <div style={{ fontSize:18,fontWeight:800,color:p.pam<40?"#dc2626":p.pam<60?"#d97706":"#059669" }}>{p.pam}</div>
                                  </div>
                                  <div style={{ fontSize:10,color:"#64748b" }}>{p.pam<40?"Low activation":p.pam<60?"Moderate":"High activation"}</div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight:700,fontSize:11,color:"#0f172a",marginBottom:7 }}>⚡ Actions</div>
                            <div style={{ display:"grid",gap:5 }}>
                              <button onClick={()=>{setSelPt(p);setConsult(true);}} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 12px",background:"#0891b2",color:"white",border:"none",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:600 }}><ClipboardList size={12}/>Start Consultation</button>
                              <button onClick={()=>{setSelPt(p);setShowRx(true);}} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 12px",background:"white",color:"#7c3aed",border:"1px solid #c4b5fd",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:600 }}><Pill size={12}/>Write Prescription</button>
                              <button onClick={()=>{showToast(`Lab order sent for ${p.name}`);}} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 12px",background:"white",color:"#059669",border:"1px solid #bbf7d0",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:600 }}><FlaskConical size={12}/>Order Lab Tests</button>
                              <button onClick={()=>{showToast(`Referral created for ${p.name}`);}} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 12px",background:"white",color:"#d97706",border:"1px solid #fed7aa",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:600 }}><TrendingUp size={12}/>Refer Patient</button>
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

          {/* ══ REGISTER PATIENT ══ */}
          {section==="register" && <PatientRegistrationForm/>}

          {/* ══ APPOINTMENTS ══ */}
          {section==="appointments" && (
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10 }}>
                <div>
                  <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Appointments</div>
                  <div style={{ fontSize:11,color:"#94a3b8" }}>{appts.length} total · History, pending, and completed</div>
                </div>
                <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                  {(["all","pending","confirmed","completed","rejected"] as const).map(f=>(
                    <button key={f} onClick={()=>setApptFilter(f)} style={{ padding:"5px 11px",borderRadius:7,border:`1px solid ${apptFilter===f?"#0891b2":"#e2e8f0"}`,background:apptFilter===f?"#0891b2":"white",color:apptFilter===f?"white":"#374151",cursor:"pointer",fontSize:11,fontWeight:600,textTransform:"capitalize" }}>{f}</button>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10 }}>
                {[
                  { l:"Total",     v:appts.length,                               c:"#0891b2" },
                  { l:"Pending",   v:appts.filter(a=>a.status==="pending").length, c:"#d97706" },
                  { l:"Confirmed", v:appts.filter(a=>a.status==="confirmed").length,c:"#059669" },
                  { l:"Completed", v:appts.filter(a=>a.status==="completed").length,c:"#7c3aed" },
                  { l:"Rejected",  v:appts.filter(a=>a.status==="rejected").length, c:"#dc2626" },
                ].map(k=>(
                  <div key={k.l} style={{ background:"white",borderRadius:10,padding:"12px 14px",border:`1px solid #e2e8f0`,borderTop:`3px solid ${k.c}` }}>
                    <div style={{ fontSize:20,fontWeight:800,color:k.c }}>{k.v}</div>
                    <div style={{ fontSize:11,color:"#64748b",marginTop:2 }}>{k.l}</div>
                  </div>
                ))}
              </div>

              {/* List */}
              <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",overflow:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                  <thead><tr style={{ background:"#f8fafc" }}>
                    {["Date","Time","Patient","Type","Reason for Visit","Priority","Status","Actions"].map(h=>(
                      <th key={h} style={{ padding:"9px 12px",textAlign:"left",fontWeight:700,fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.04em",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {filteredAppts.map((a,i)=>(
                      <tr key={a.id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                        <td style={{ padding:"10px 12px",color:"#64748b",whiteSpace:"nowrap" }}>{a.date}</td>
                        <td style={{ padding:"10px 12px",color:"#64748b",whiteSpace:"nowrap" }}>{a.time}</td>
                        <td style={{ padding:"10px 12px",fontWeight:600,color:"#0f172a" }}>{a.patient}</td>
                        <td style={{ padding:"10px 12px",color:"#374151" }}>{a.type}</td>
                        <td style={{ padding:"10px 12px",color:"#64748b",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }} title={a.reason}>{a.reason}</td>
                        <td style={{ padding:"10px 12px" }}>
                          <Bdg label={a.priority} color={a.priority==="emergency"?"#dc2626":a.priority==="urgent"?"#d97706":"#059669"} bg={a.priority==="emergency"?"#fee2e2":a.priority==="urgent"?"#fffbeb":"#dcfce7"}/>
                        </td>
                        <td style={{ padding:"10px 12px" }}>
                          <Bdg label={a.status} color={a.status==="completed"?"#059669":a.status==="confirmed"?"#0891b2":a.status==="rejected"?"#dc2626":"#d97706"} bg={a.status==="completed"?"#dcfce7":a.status==="confirmed"?"#ecfeff":a.status==="rejected"?"#fee2e2":"#fffbeb"}/>
                        </td>
                        <td style={{ padding:"10px 12px" }}>
                          <div style={{ display:"flex",gap:5 }}>
                            {a.status==="pending" && <>
                              <button onClick={()=>apptAction(a.id,"confirm")} style={{ padding:"3px 8px",borderRadius:6,border:"1px solid #bbf7d0",background:"#dcfce7",cursor:"pointer",fontSize:10,color:"#059669",fontWeight:700 }}>✓ Confirm</button>
                              <button onClick={()=>apptAction(a.id,"reject")} style={{ padding:"3px 8px",borderRadius:6,border:"1px solid #fca5a5",background:"#fee2e2",cursor:"pointer",fontSize:10,color:"#dc2626",fontWeight:700 }}>✗ Reject</button>
                            </>}
                            {a.status==="confirmed" && (
                              <button onClick={()=>{ const p=PATIENTS_TODAY.find(x=>a.patient.includes(x.name.split(" ")[0])); setSelPt(p||PATIENTS_TODAY[0]); setConsult(true); }} style={{ padding:"3px 8px",borderRadius:6,border:"1px solid #bae6fd",background:"#f0f9ff",cursor:"pointer",fontSize:10,color:"#0891b2",fontWeight:700,display:"flex",alignItems:"center",gap:3 }}><ClipboardList size={9}/>Start</button>
                            )}
                            {a.status==="completed" && (
                              <button onClick={()=>showToast("Opening consultation notes…")} style={{ padding:"3px 8px",borderRadius:6,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:10,color:"#374151" }}><Eye size={9}/></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredAppts.length===0 && <tr><td colSpan={8} style={{ padding:24,textAlign:"center",color:"#94a3b8" }}>No appointments for this filter</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ LAB ORDERS ══ */}
          {section==="lab-orders" && (
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Order Lab Tests</div>
              <div style={{ background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:10,padding:"11px 14px",fontSize:12,color:"#0369a1" }}>
                ✅ Select a patient and tests. Orders are sent directly to the Laboratory portal. Lab staff will see them in their pending queue.
              </div>
              {/* Patient selector */}
              <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",padding:"14px 16px" }}>
                <div style={{ fontWeight:700,fontSize:12,color:"#0f172a",marginBottom:10 }}>1. Select Patient</div>
                <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                  {PATIENTS_TODAY.map(p=>(
                    <button key={p.id} onClick={()=>setSelPt(selPt?.id===p.id?null:p)} style={{ display:"flex",alignItems:"center",gap:9,padding:"9px 12px",borderRadius:9,border:`2px solid ${selPt?.id===p.id?"#0891b2":"#e2e8f0"}`,background:selPt?.id===p.id?"#f0f9ff":"white",cursor:"pointer",textAlign:"left",transition:"all 0.15s" }}>
                      <TL level={p.urgency as any}/>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12,fontWeight:600,color:"#0f172a" }}>{p.name} <span style={{ color:"#94a3b8",fontWeight:400 }}>{p.age}y {p.gender}</span></div>
                        <div style={{ fontSize:10,color:"#64748b" }}>{p.dx}</div>
                      </div>
                      {selPt?.id===p.id && <CheckCircle size={14} style={{ color:"#0891b2" }}/>}
                    </button>
                  ))}
                </div>
              </div>
              {selPt && (
                <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",padding:"14px 16px" }}>
                  <div style={{ fontWeight:700,fontSize:12,color:"#0f172a",marginBottom:8 }}>2. Select Tests for {selPt.name}</div>
                  <PatientRegistrationForm/>
                </div>
              )}
            </div>
          )}

          {/* ══ LAB RESULTS ══ */}
          {section==="lab-results" && (
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
                <div>
                  <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Laboratory Results</div>
                  <div style={{ fontSize:11,color:"#94a3b8" }}>{MOCK_LAB.length} results · {MOCK_LAB.filter(l=>l.urgent).length} urgent</div>
                </div>
                <button onClick={()=>downloadReport("Lab_Results",[MOCK_LAB.map(l=>[l.patient,l.test,l.result,l.ref,l.flag,l.status,l.date])][0],["Patient","Test","Result","Reference","Flag","Status","Date"])} style={{ display:"flex",alignItems:"center",gap:5,padding:"7px 14px",background:"white",border:"1px solid #e2e8f0",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:600,color:"#374151" }}>
                  <Download size={12}/>Export Results
                </button>
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:9 }}>
                {MOCK_LAB.map(r=>(
                  <div key={r.id} style={{ background:"white",borderRadius:12,border:`1px solid ${r.flag==="Critical"?"#fca5a5":r.urgent?"#fed7aa":"#e2e8f0"}`,padding:"13px 16px",display:"flex",alignItems:"center",gap:12 }}>
                    <div style={{ width:9,height:9,borderRadius:"50%",background:r.flag==="Critical"?"#dc2626":r.flag==="Positive"||r.flag==="High"||r.flag==="Low"||r.flag==="Abnormal"?"#d97706":"#059669",flexShrink:0 }}/>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:13,fontWeight:700,color:"#0f172a" }}>{r.patient} — {r.test}</div>
                      <div style={{ fontSize:11,color:"#64748b",marginTop:1 }}>Ref: {r.ref} · {r.date} · {r.status}</div>
                    </div>
                    <div style={{ fontWeight:800,fontSize:15,color:r.flag==="Critical"?"#dc2626":r.flag!=="Normal"?"#d97706":"#059669" }}>{r.result}</div>
                    <Bdg label={r.flag} color={r.flag==="Critical"?"#dc2626":r.flag!=="Normal"?"#d97706":"#059669"} bg={r.flag==="Critical"?"#fee2e2":r.flag!=="Normal"?"#fffbeb":"#dcfce7"}/>
                    <button onClick={()=>showToast(`Acknowledged: ${r.patient} — ${r.test}`)} style={{ padding:"4px 10px",borderRadius:7,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:11,color:"#374151",fontWeight:600 }}>Acknowledge</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ PRESCRIPTIONS ══ */}
          {section==="prescriptions" && (
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>e-Prescribing</div>
                <button onClick={()=>setShowRx(true)} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 16px",background:"#7c3aed",color:"white",border:"none",borderRadius:9,cursor:"pointer",fontSize:12,fontWeight:600 }}><Plus size={13}/>New Prescription</button>
              </div>
              <div style={{ background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10,padding:"11px 14px",fontSize:12,color:"#92400e" }}>
                ⚠️ Drug interaction checker active — contraindications per Rwanda MOH Essential Medicines List.
              </div>
              <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",padding:"16px 18px" }}>
                <div style={{ fontWeight:700,fontSize:12,color:"#0f172a",marginBottom:12 }}>Recent Prescriptions</div>
                {rxList.length===0 ? (
                  <div style={{ textAlign:"center",padding:"28px",color:"#94a3b8" }}>
                    <Pill size={30} style={{ margin:"0 auto 8px",display:"block",opacity:0.3 }}/>
                    <div style={{ fontSize:12 }}>No prescriptions yet. Click "New Prescription" above.</div>
                  </div>
                ) : rxList.map((rx,i)=>(
                  <div key={i} style={{ padding:"9px 11px",background:"#f8fafc",borderRadius:9,marginBottom:6,border:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:13,fontWeight:700,color:"#7c3aed" }}>{rx.drug} {rx.dose}</div>
                      <div style={{ fontSize:11,color:"#64748b" }}>{rx.freq} for {rx.duration} · Route: {rx.route||"Oral"}</div>
                    </div>
                    <button onClick={()=>showToast("Prescription printed")} style={{ display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:7,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:10,color:"#374151" }}>
                      <Download size={10}/>Print
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ RADIOLOGY ══ */}
          {section==="radiology" && (
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Radiology & Imaging</div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10 }}>
                {[
                  { l:"Orders Today",    v:"6", c:"#0891b2" },
                  { l:"Completed",       v:"4", c:"#059669" },
                  { l:"Pending Reports", v:"2", c:"#d97706" },
                ].map(k=><div key={k.l} style={{ background:"white",borderRadius:10,padding:"12px",border:`1px solid #e2e8f0`,borderTop:`3px solid ${k.c}` }}><div style={{ fontSize:20,fontWeight:800,color:k.c }}>{k.v}</div><div style={{ fontSize:11,color:"#64748b" }}>{k.l}</div></div>)}
              </div>
              {[
                { patient:"Patrick Gasana",   modality:"ECG",          indication:"Chest pain — rule out ACS",   status:"Reported",  result:"ST elevation leads II, III, aVF" },
                { patient:"Alice Niyomugabo", modality:"CXR",          indication:"SOB, COPD exacerbation",       status:"Reported",  result:"Hyperinflation, no consolidation" },
                { patient:"Jean B.",          modality:"Chest X-ray",  indication:"Fever, cough",                 status:"Pending",   result:"—" },
              ].map((r,i)=>(
                <div key={i} style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",padding:"13px 16px",display:"flex",alignItems:"center",gap:12 }}>
                  <div style={{ width:36,height:36,borderRadius:9,background:"#ecfeff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>📡</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13,fontWeight:700,color:"#0f172a" }}>{r.patient} — {r.modality}</div>
                    <div style={{ fontSize:11,color:"#64748b",marginTop:1 }}>{r.indication}</div>
                    {r.status==="Reported" && <div style={{ fontSize:11,color:"#059669",marginTop:3,fontWeight:600 }}>📋 {r.result}</div>}
                  </div>
                  <Bdg label={r.status} color={r.status==="Reported"?"#059669":"#d97706"} bg={r.status==="Reported"?"#dcfce7":"#fffbeb"}/>
                </div>
              ))}
            </div>
          )}

          {/* ══ IN-BASKET ══ */}
          {section==="inbox" && (
            <div style={{ display:"grid",gap:12 }}>
              <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>In-Basket — Messages & Tasks</div>
              {[
                { from:"Lab (Patrick M.)",     subj:"🚨 CRITICAL: Troponin I elevated — Patrick Gasana",    type:"critical",time:"5m ago", unread:true  },
                { from:"Nurse Eric N.",        subj:"Patient ready in Room 3 — Ernest Uwimana",             type:"info",    time:"12m ago",unread:true  },
                { from:"Pharmacist Diane I.",  subj:"Re: Metformin dose query for Ernest Uwimana",          type:"reply",   time:"1h ago", unread:false },
                { from:"Hospital Manager",     subj:"Reminder: Monthly clinical audit report — due Jul 25", type:"admin",   time:"2h ago", unread:false },
                { from:"Referral System",      subj:"New inbound referral — Cardiac case from Kigali DH",   type:"referral",time:"3h ago", unread:true  },
                { from:"Appointment System",   subj:"Alice Niyomugabo requested urgent appointment",        type:"info",    time:"4h ago", unread:false },
              ].map((msg,i)=>(
                <div key={i} style={{ background:"white",borderRadius:12,border:`1px solid ${msg.unread&&msg.type==="critical"?"#fca5a5":msg.unread?"#bae6fd":"#e2e8f0"}`,padding:"13px 16px",display:"flex",alignItems:"center",gap:11,cursor:"pointer" }}>
                  <div style={{ width:34,height:34,borderRadius:9,background:msg.type==="critical"?"#fee2e2":msg.type==="referral"?"#f5f3ff":msg.type==="reply"?"#ecfdf5":"#ecfeff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0 }}>
                    {msg.type==="critical"?"🚨":msg.type==="referral"?"↗️":msg.type==="reply"?"💬":msg.type==="admin"?"📋":"ℹ️"}
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:11,color:"#94a3b8",marginBottom:1 }}>{msg.from} · {msg.time}</div>
                    <div style={{ fontSize:13,fontWeight:msg.unread?700:400,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{msg.subj}</div>
                  </div>
                  {msg.unread && <div style={{ width:7,height:7,borderRadius:"50%",background:msg.type==="critical"?"#dc2626":"#0891b2",flexShrink:0 }}/>}
                  <button onClick={()=>showToast("Replied")} style={{ display:"flex",alignItems:"center",gap:4,padding:"4px 11px",borderRadius:7,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:11,color:"#374151" }}>
                    <Send size={10}/>Reply
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ══ REPORTS ══ */}
          {section==="reports" && (
            <div style={{ display:"grid",gap:16 }}>
              <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Reports & KPIs</div>

              {/* KPI cards — live or mock */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:11 }}>
                {kpis.length>0 ? kpis.map((k:any,i)=>(
                  <KPI key={i} label={k.label} value={k.value} icon={["⏳","🛏️","💰","🚨"][i%4]} color={k.tone==="good"?"#059669":k.tone==="danger"?"#dc2626":"#d97706"} bg={k.tone==="good"?"#ecfdf5":k.tone==="danger"?"#fef2f2":"#fffbeb"} sub={k.trend}/>
                )) : [
                  { l:"Patients This Month", v:"284",  icon:"👤", c:"#0891b2" },
                  { l:"Consultations Done",  v:"271",  icon:"🩺", c:"#059669" },
                  { l:"Lab Orders Placed",   v:"189",  icon:"🔬", c:"#7c3aed" },
                  { l:"Prescriptions Written",v:"203", icon:"💊", c:"#d97706" },
                  { l:"Referrals Made",       v:"18",  icon:"↗️", c:"#0891b2" },
                  { l:"Avg. Consult Time",    v:"24m", icon:"⏱️", c:"#059669" },
                ].map(k=>(
                  <div key={k.l} style={{ background:"white",borderRadius:10,padding:"12px",border:`1px solid #e2e8f0`,borderTop:`3px solid ${k.c}` }}>
                    <div style={{ fontSize:22,marginBottom:4 }}>{k.icon}</div>
                    <div style={{ fontSize:20,fontWeight:800,color:k.c }}>{k.v}</div>
                    <div style={{ fontSize:11,color:"#64748b" }}>{k.l}</div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",padding:"16px 18px" }}>
                  <div style={{ fontWeight:700,fontSize:12,color:"#0f172a",marginBottom:10 }}>📅 Consultations — Last 7 Days</div>
                  <MiniBar data={[28,34,29,41,38,45,33]} color="#0891b2"/>
                  <div style={{ display:"flex",justifyContent:"space-between",marginTop:5 }}>
                    {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=><div key={d} style={{ fontSize:9,color:"#94a3b8",textAlign:"center" }}>{d}</div>)}
                  </div>
                </div>
                <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",padding:"16px 18px" }}>
                  <div style={{ fontWeight:700,fontSize:12,color:"#0f172a",marginBottom:10 }}>🏷️ Top Diagnoses This Month</div>
                  {[
                    { dx:"Hypertension",  count:48, color:"#dc2626", pct:33 },
                    { dx:"Malaria",       count:36, color:"#7c3aed", pct:25 },
                    { dx:"Diabetes",      count:29, color:"#d97706", pct:20 },
                    { dx:"RTI / URTI",    count:22, color:"#0891b2", pct:15 },
                    { dx:"UTI",           count:12, color:"#059669", pct:8 },
                  ].map(d=>(
                    <div key={d.dx} style={{ display:"flex",alignItems:"center",gap:8,marginBottom:7 }}>
                      <div style={{ fontSize:11,color:"#374151",minWidth:100 }}>{d.dx}</div>
                      <div style={{ flex:1,height:6,background:"#f1f5f9",borderRadius:4,overflow:"hidden" }}><div style={{ height:"100%",width:`${d.pct}%`,background:d.color,borderRadius:4 }}/></div>
                      <div style={{ fontSize:11,fontWeight:700,color:d.color,minWidth:28,textAlign:"right" }}>{d.count}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Downloadable reports */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:11 }}>
                {[
                  { title:"👤 Patient Summary Report",     desc:"All registered patients, demographics, diagnoses",
                    rows:PATIENTS_TODAY.map(p=>[p.name,String(p.age),p.gender,p.dx,p.status,p.time]),
                    headers:["Name","Age","Gender","Diagnosis","Status","Appointment Time"] },
                  { title:"📅 Appointments Report",        desc:"All appointments history with reasons and outcomes",
                    rows:appts.map(a=>[a.patient,a.date,a.time,a.type,a.reason,a.status,a.priority]),
                    headers:["Patient","Date","Time","Type","Reason","Status","Priority"] },
                  { title:"🔬 Lab Orders Report",          desc:"Tests ordered, results and flags",
                    rows:MOCK_LAB.map(l=>[l.patient,l.test,l.result,l.ref,l.flag,l.status,l.date]),
                    headers:["Patient","Test","Result","Reference","Flag","Status","Date"] },
                  { title:"💊 Prescriptions Report",       desc:"All prescriptions issued this month",
                    rows:rxList.map(r=>[r.drug,r.dose,r.freq,r.duration,r.route,r.notes]),
                    headers:["Drug","Dose","Frequency","Duration","Route","Notes"] },
                  { title:"🏷️ Disease Burden Report",      desc:"Diagnosis frequency for MOH reporting",
                    rows:[["Hypertension","48","33%"],["Malaria","36","25%"],["Diabetes","29","20%"],["RTI","22","15%"],["UTI","12","8%"]],
                    headers:["Diagnosis","Count","Percentage"] },
                  { title:"🇷🇼 MOH Clinical Report",       desc:"Monthly government submission — clinical indicators",
                    rows:[["Outpatient visits","284"],["New patients","68"],["Lab tests ordered","189"],["Referrals","18"]],
                    headers:["Indicator","Value"] },
                ].map(r=>(
                  <div key={r.title} style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",padding:"14px 16px" }}>
                    <div style={{ fontWeight:700,fontSize:12,color:"#0f172a",marginBottom:4 }}>{r.title}</div>
                    <div style={{ fontSize:11,color:"#64748b",marginBottom:12,lineHeight:1.5 }}>{r.desc}</div>
                    <button onClick={()=>downloadReport(r.title.replace(/[^a-zA-Z]/g,"_"),r.rows,r.headers)} style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 14px",background:"#0891b2",color:"white",borderRadius:7,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,width:"100%" }}>
                      <Download size={11}/>Download CSV
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ SETTINGS ══ */}
          {section==="settings" && (
            <AccountSettings user={user} onClose={()=>setSection("dashboard")}/>
          )}

        </div>{/* end body */}
      </div>{/* end main */}

      {/* ── CONSULTATION MODAL ── */}
      {showConsult && selPt && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:"white",borderRadius:16,width:"100%",maxWidth:580,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 32px 80px rgba(0,0,0,0.28)" }}>
            <div style={{ background:"linear-gradient(135deg,#0891b2,#7c3aed)",padding:"16px 20px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div>
                <div style={{ fontSize:15,fontWeight:800,color:"white" }}>🩺 Consultation — {selPt.name}</div>
                <div style={{ fontSize:11,color:"rgba(255,255,255,0.7)",marginTop:1 }}>{selPt.dx} · {selPt.time}</div>
              </div>
              <button onClick={()=>setConsult(false)} style={{ border:"none",background:"rgba(255,255,255,0.15)",cursor:"pointer",padding:7,borderRadius:8,color:"white",display:"flex" }}><X size={15}/></button>
            </div>
            <div style={{ padding:"18px 20px",display:"grid",gap:12 }}>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7 }}>
                {[{ l:"BP",v:selPt.vitals.bp },{ l:"Temp",v:`${selPt.vitals.temp}°C` },{ l:"SpO₂",v:selPt.vitals.spo2 },{ l:"Pulse",v:`${selPt.vitals.pulse}bpm` }].map(v=>(
                  <div key={v.l} style={{ padding:"7px 9px",background:"#f8fafc",borderRadius:8,textAlign:"center" }}>
                    <div style={{ fontSize:9,color:"#94a3b8" }}>{v.l}</div>
                    <div style={{ fontSize:13,fontWeight:700,color:"#0f172a",marginTop:1 }}>{v.v}</div>
                  </div>
                ))}
              </div>
              <div>
                <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Consultation Notes — SOAP Format</label>
                <textarea value={consultNotes} onChange={e=>setNotes(e.target.value)} rows={7}
                  placeholder={"S — Subjective: Chief complaint, history\nO — Objective: Examination findings, vitals\nA — Assessment: Clinical diagnosis\nP — Plan: Treatment, labs, follow-up"}
                  style={{ width:"100%",padding:"11px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none",resize:"vertical",fontFamily:"monospace",color:"#0f172a",lineHeight:1.7,boxSizing:"border-box" }}/>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                <div>
                  <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>ICD-10 Diagnosis</label>
                  <input placeholder="e.g. I10 — Hypertension" style={{ width:"100%",padding:"8px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none",boxSizing:"border-box" }}/>
                </div>
                <div>
                  <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Follow-up Date</label>
                  <input type="date" style={{ width:"100%",padding:"8px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none",boxSizing:"border-box" }}/>
                </div>
              </div>
              <div style={{ display:"flex",gap:8,justifyContent:"flex-end" }}>
                <button onClick={()=>setConsult(false)} style={{ padding:"8px 16px",border:"1px solid #e2e8f0",background:"white",borderRadius:8,cursor:"pointer",fontSize:12,color:"#374151",fontWeight:600 }}>Cancel</button>
                <button onClick={()=>{showToast("Draft saved");}} style={{ display:"flex",alignItems:"center",gap:4,padding:"8px 14px",background:"#f1f5f9",color:"#374151",border:"none",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600 }}><FileText size={12}/>Save Draft</button>
                <button onClick={()=>{showToast(`✅ Consultation signed for ${selPt.name}`);setConsult(false);}} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 18px",background:"linear-gradient(135deg,#0891b2,#7c3aed)",color:"white",border:"none",borderRadius:9,cursor:"pointer",fontSize:12,fontWeight:700 }}>
                  <CheckCircle size={12}/>Sign & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RX MODAL ── */}
      {showRx && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:"white",borderRadius:16,width:"100%",maxWidth:500,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 32px 80px rgba(0,0,0,0.28)" }}>
            <div style={{ background:"linear-gradient(135deg,#7c3aed,#0891b2)",padding:"16px 20px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div style={{ fontSize:15,fontWeight:800,color:"white" }}>💊 Write Prescription{selPt?` — ${selPt.name}`:""}</div>
              <button onClick={()=>setShowRx(false)} style={{ border:"none",background:"rgba(255,255,255,0.15)",cursor:"pointer",padding:7,borderRadius:8,color:"white",display:"flex" }}><X size={15}/></button>
            </div>
            <div style={{ padding:"18px 20px",display:"grid",gap:11 }}>
              <div style={{ background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,padding:"9px 12px",fontSize:12,color:"#92400e" }}>⚠️ Drug interaction checker active — Rwanda MOH Essential Medicines List.</div>
              {([
                { k:"drug" as const,     l:"Drug Name *",  ph:"Generic name (e.g. Amoxicillin)" },
                { k:"dose" as const,     l:"Dose *",       ph:"e.g. 500mg" },
                { k:"route" as const,    l:"Route",        ph:"Oral / IV / IM / Topical" },
                { k:"freq" as const,     l:"Frequency *",  ph:"e.g. TID — 3 times daily" },
                { k:"duration" as const, l:"Duration",     ph:"e.g. 7 days" },
                { k:"notes" as const,    l:"Instructions", ph:"e.g. Take with food" },
              ] as const).map(f=>(
                <div key={f.k}>
                  <label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:3 }}>{f.l}</label>
                  <input value={rxInput[f.k]} onChange={e=>setRxInput(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} style={{ width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none",color:"#0f172a",boxSizing:"border-box" }}/>
                </div>
              ))}
              <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:4 }}>
                <button onClick={()=>setShowRx(false)} style={{ padding:"8px 16px",border:"1px solid #e2e8f0",background:"white",borderRadius:8,cursor:"pointer",fontSize:12,color:"#374151",fontWeight:600 }}>Cancel</button>
                <button onClick={()=>{
                  if(!rxInput.drug||!rxInput.dose){showToast("Drug name and dose required");return;}
                  setRxList(p=>[...p,{...rxInput}]);
                  showToast(`✅ ${rxInput.drug} ${rxInput.dose} prescribed`);
                  setRxInput({drug:"",dose:"",freq:"",duration:"",route:"",notes:""});
                  setShowRx(false);
                }} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 18px",background:"linear-gradient(135deg,#7c3aed,#0891b2)",color:"white",border:"none",borderRadius:9,cursor:"pointer",fontSize:12,fontWeight:700 }}>
                  <Download size={12}/>Issue Prescription
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
