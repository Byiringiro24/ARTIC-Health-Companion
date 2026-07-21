"use client";
import { useState } from "react";
import {
  Users2, CalendarCheck2, Activity, ClipboardList,
  Settings, LogOut, ChevronLeft, Menu, Search, Bell,
  Plus, CheckCircle, Clock, AlertCircle, Download, Phone,
} from "lucide-react";
import type { AppUser } from "@/types/hms";
import { PatientRegistrationForm } from "@/components/dashboard/PatientRegistrationForm";
import { AccountSettings } from "@/components/ui/AccountSettings";
import { logout } from "@/lib/auth";

type RSection = "dashboard"|"register"|"queue"|"appointments"|"checkin"|"settings";

const NAV: { key: RSection; label: string; icon: any }[] = [
  { key:"dashboard",    label:"Dashboard",           icon:Activity },
  { key:"register",     label:"Register Patient",    icon:Users2 },
  { key:"queue",        label:"Queue Management",    icon:ClipboardList },
  { key:"appointments", label:"Appointments",        icon:CalendarCheck2 },
  { key:"checkin",      label:"Check-In",            icon:CheckCircle },
  { key:"settings",     label:"Settings",            icon:Settings },
];

const Bdg = ({ l, c, bg }: { l:string; c:string; bg:string }) => (
  <span style={{ padding:"2px 9px",borderRadius:20,fontSize:10,fontWeight:600,background:bg,color:c,whiteSpace:"nowrap" }}>{l}</span>
);
const KPI = ({ label,value,icon,color }: any) => (
  <div style={{ background:"white",borderRadius:12,padding:"13px 15px",border:"1px solid #e2e8f0",borderTop:`3px solid ${color}` }}>
    <div style={{ fontSize:16,marginBottom:5 }}>{icon}</div>
    <div style={{ fontSize:22,fontWeight:800,color }}>{value}</div>
    <div style={{ fontSize:11,color:"#64748b",marginTop:1 }}>{label}</div>
  </div>
);

const QUEUE = [
  { id:"q1",ticket:"A001",name:"Ernest Uwimana",   type:"Consultation",  time:"08:30",status:"With Doctor",  priority:"Routine",wait:"—" },
  { id:"q2",ticket:"A002",name:"Marie Mukamana",   type:"ANC Visit",     time:"09:15",status:"Waiting",      priority:"Routine",wait:"12m" },
  { id:"q3",ticket:"A003",name:"Alice Niyomugabo", type:"Emergency",     time:"09:20",status:"Waiting",      priority:"Urgent", wait:"5m" },
  { id:"q4",ticket:"A004",name:"Bosco Habimana",   type:"Lab Collection",time:"09:30",status:"Waiting",      priority:"Routine",wait:"18m" },
  { id:"q5",ticket:"A005",name:"Diane Mukagasana", type:"Pharmacy",      time:"09:45",status:"Checked In",   priority:"Routine",wait:"—" },
];

const TODAY_APPTS = [
  { id:"a1",time:"09:00",patient:"Ernest Uwimana",   doctor:"Dr. Grace M.",type:"Follow-up",  status:"arrived",  insurance:"RSSB" },
  { id:"a2",time:"09:30",patient:"Marie Mukamana",   doctor:"Dr. Grace M.",type:"ANC",        status:"arrived",  insurance:"Mutuelle" },
  { id:"a3",time:"10:00",patient:"Jean B.",          doctor:"Dr. Grace M.",type:"Acute",       status:"pending",  insurance:"Mutuelle" },
  { id:"a4",time:"10:30",patient:"Alice Niyomugabo", doctor:"Dr. Grace M.",type:"Emergency",   status:"arrived",  insurance:"RSSB" },
  { id:"a5",time:"11:00",patient:"Olive Uwineza",    doctor:"Dr. Grace M.",type:"New Patient", status:"pending",  insurance:"Cash" },
  { id:"a6",time:"14:00",patient:"Patrick Karera",   doctor:"Dr. Grace M.",type:"Follow-up",   status:"pending",  insurance:"RSSB" },
];

export function ReceptionDashboard({ user }: { user?: AppUser }) {
  const [section, setSection]     = useState<RSection>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [toast, setToast]         = useState("");
  const [queue, setQueue]         = useState(QUEUE);
  const [appts, setAppts]         = useState(TODAY_APPTS);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  const waiting  = queue.filter(q=>q.status==="Waiting").length;
  const pending  = appts.filter(a=>a.status==="pending").length;

  return (
    <div style={{ display:"flex",height:"100vh",overflow:"hidden",fontFamily:"'Inter',system-ui,sans-serif",background:"#f1f5f9" }}>
      {toast&&<div style={{ position:"fixed",top:20,right:20,zIndex:9999,padding:"12px 20px",background:"#059669",color:"white",borderRadius:10,fontSize:13,fontWeight:600,boxShadow:"0 4px 16px rgba(0,0,0,0.15)" }}>{toast}</div>}

      {/* Sidebar */}
      <aside style={{ width:collapsed?64:224,background:"#0a1628",display:"flex",flexDirection:"column",transition:"width 0.22s",flexShrink:0,overflow:"hidden" }}>
        <div style={{ padding:"14px 12px 10px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",gap:9 }}>
          <div style={{ width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#d97706,#0891b2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <Users2 size={15} color="white"/>
          </div>
          {!collapsed&&<div style={{ overflow:"hidden" }}>
            <div style={{ color:"white",fontWeight:700,fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{user?.facility||"Hospital"}</div>
            <div style={{ color:"#475569",fontSize:9 }}>Reception Portal</div>
          </div>}
        </div>
        <nav style={{ flex:1,overflowY:"auto",padding:"8px 6px" }}>
          {NAV.filter(n=>n.key!=="settings").map(item=>{
            const Icon=item.icon; const active=section===item.key;
            const badge=item.key==="queue"?waiting:item.key==="appointments"?pending:0;
            return <button key={item.key} onClick={()=>setSection(item.key)} title={collapsed?item.label:undefined}
              style={{ display:"flex",alignItems:"center",gap:8,width:"100%",padding:collapsed?"10px 0":"8px 10px",justifyContent:collapsed?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",marginBottom:1,background:active?"rgba(217,119,6,0.2)":"transparent",color:active?"#fde68a":"#94a3b8",transition:"all 0.15s" }}>
              <Icon size={15} style={{ flexShrink:0 }}/>{!collapsed&&<span style={{ fontSize:12,fontWeight:active?600:400,flex:1 }}>{item.label}</span>}
              {!collapsed&&badge>0&&<span style={{ background:"#dc2626",color:"white",borderRadius:10,padding:"1px 5px",fontSize:9,fontWeight:700 }}>{badge}</span>}
            </button>;
          })}
        </nav>
        <div style={{ padding:"8px 6px 10px",borderTop:"1px solid rgba(255,255,255,0.07)" }}>
          {!collapsed&&user&&<div style={{ display:"flex",alignItems:"center",gap:7,padding:"7px 8px",marginBottom:4,background:"rgba(255,255,255,0.04)",borderRadius:8 }}>
            <div style={{ width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#d97706,#0891b2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"white",flexShrink:0 }}>
              {(user.name||"R").split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase()}
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:10,fontWeight:600,color:"#e2e8f0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user.name}</div>
              <div style={{ fontSize:8,color:"#475569" }}>Receptionist</div>
            </div>
          </div>}
          <button onClick={()=>setSection("settings")} style={{ display:"flex",alignItems:"center",gap:8,width:"100%",padding:collapsed?"10px 0":"7px 10px",justifyContent:collapsed?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",background:section==="settings"?"rgba(217,119,6,0.2)":"transparent",color:section==="settings"?"#fde68a":"#64748b",marginBottom:2 }}>
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
            <div style={{ fontSize:10,color:"#94a3b8" }}>{user?.facility} · Reception</div>
          </div>
          <button onClick={()=>setSection("register")} style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 13px",background:"#d97706",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:600 }}><Plus size={12}/>New Patient</button>
        </header>

        <div style={{ flex:1,overflowY:"auto",padding:16 }}>

          {/* Dashboard */}
          {section==="dashboard"&&(
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ background:"linear-gradient(135deg,#0a1628,#0f2942)",borderRadius:13,padding:"16px 20px",color:"white",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
                <div>
                  <div style={{ fontSize:16,fontWeight:800,marginBottom:3 }}>Reception — {user?.name?.split(" ")[0]||"Receptionist"} 🗂️</div>
                  <div style={{ fontSize:11,color:"#64748b" }}>{new Date().toLocaleDateString("en-RW",{weekday:"long",day:"numeric",month:"long"})} · Front Desk</div>
                </div>
                <div style={{ display:"flex",gap:6 }}>
                  <button onClick={()=>setSection("register")} style={{ padding:"6px 13px",background:"rgba(217,119,6,0.2)",color:"#fde68a",border:"1px solid rgba(217,119,6,0.3)",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:600 }}>Register Patient</button>
                  <button onClick={()=>setSection("queue")} style={{ padding:"6px 13px",background:"rgba(255,255,255,0.08)",color:"white",border:"1px solid rgba(255,255,255,0.15)",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:600 }}>View Queue ({waiting})</button>
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10 }}>
                <KPI label="Checked In Today"     value={appts.filter(a=>a.status==="arrived").length}  icon="✅" color="#059669"/>
                <KPI label="In Queue"             value={waiting}                                         icon="⏳" color="#d97706"/>
                <KPI label="Pending Appointments" value={pending}                                          icon="📅" color="#0891b2"/>
                <KPI label="Registered Today"     value="6"                                               icon="👤" color="#7c3aed"/>
              </div>
              {/* Today's appointments */}
              <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",overflow:"auto" }}>
                <div style={{ padding:"11px 14px",borderBottom:"1px solid #f1f5f9",fontWeight:700,fontSize:12,color:"#0f172a" }}>📅 Today&apos;s Appointments</div>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                  <thead><tr style={{ background:"#f8fafc" }}>
                    {["Time","Patient","Doctor","Type","Insurance","Status","Action"].map(h=><th key={h} style={{ padding:"8px 11px",textAlign:"left",fontWeight:600,fontSize:10,color:"#64748b",textTransform:"uppercase",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap" }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {appts.map(a=>(
                      <tr key={a.id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                        <td style={{ padding:"8px 11px",color:"#64748b",whiteSpace:"nowrap" }}>{a.time}</td>
                        <td style={{ padding:"8px 11px",fontWeight:600,color:"#0f172a" }}>{a.patient}</td>
                        <td style={{ padding:"8px 11px",color:"#64748b",fontSize:10 }}>{a.doctor}</td>
                        <td style={{ padding:"8px 11px",color:"#374151" }}>{a.type}</td>
                        <td style={{ padding:"8px 11px" }}><Bdg l={a.insurance} c={a.insurance==="RSSB"?"#0891b2":a.insurance==="Mutuelle"?"#059669":"#d97706"} bg={a.insurance==="RSSB"?"#ecfeff":a.insurance==="Mutuelle"?"#ecfdf5":"#fffbeb"}/></td>
                        <td style={{ padding:"8px 11px" }}><Bdg l={a.status==="arrived"?"Checked In":"Pending"} c={a.status==="arrived"?"#059669":"#d97706"} bg={a.status==="arrived"?"#dcfce7":"#fffbeb"}/></td>
                        <td style={{ padding:"8px 11px" }}>
                          {a.status==="pending"&&<button onClick={()=>{ setAppts(p=>p.map(x=>x.id===a.id?{...x,status:"arrived"}:x)); showToast(`${a.patient} checked in`); }} style={{ padding:"3px 9px",background:"#059669",color:"white",border:"none",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700 }}>Check In</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Register — uses the full clinical form */}
          {section==="register"&&<PatientRegistrationForm/>}

          {/* Queue */}
          {section==="queue"&&(
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Queue Management</div>
                <button onClick={()=>showToast("New queue ticket created — A006")} style={{ display:"flex",alignItems:"center",gap:5,padding:"7px 14px",background:"#d97706",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:600 }}><Plus size={12}/>Add to Queue</button>
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:9 }}>
                {queue.map(q=>(
                  <div key={q.id} style={{ background:"white",borderRadius:12,border:`1px solid ${q.priority==="Urgent"?"#fca5a5":"#e2e8f0"}`,padding:"13px 16px",display:"flex",alignItems:"center",gap:12 }}>
                    <div style={{ width:42,height:42,borderRadius:10,background:q.status==="With Doctor"?"#ecfdf5":q.priority==="Urgent"?"#fee2e2":"#fffbeb",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,color:q.status==="With Doctor"?"#059669":q.priority==="Urgent"?"#dc2626":"#d97706",flexShrink:0 }}>{q.ticket}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700,fontSize:12,color:"#0f172a" }}>{q.name}</div>
                      <div style={{ fontSize:11,color:"#64748b",marginTop:1 }}>{q.type} · Arrived {q.time} · Wait: {q.wait}</div>
                    </div>
                    <Bdg l={q.priority} c={q.priority==="Urgent"?"#dc2626":"#059669"} bg={q.priority==="Urgent"?"#fee2e2":"#dcfce7"}/>
                    <Bdg l={q.status} c={q.status==="With Doctor"?"#059669":q.status==="Checked In"?"#0891b2":"#d97706"} bg={q.status==="With Doctor"?"#dcfce7":q.status==="Checked In"?"#ecfeff":"#fffbeb"}/>
                    {q.status==="Waiting"&&<button onClick={()=>{ setQueue(p=>p.map(x=>x.id===q.id?{...x,status:"Checked In"}:x)); showToast(`${q.name} called in`); }} style={{ padding:"5px 12px",background:"#0891b2",color:"white",border:"none",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:600 }}>Call In</button>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appointments */}
          {section==="appointments"&&(
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Appointment Schedule</div>
              <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",overflow:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                  <thead><tr style={{ background:"#f8fafc" }}>
                    {["Time","Patient","Doctor","Type","Insurance","Status","Action"].map(h=><th key={h} style={{ padding:"9px 12px",textAlign:"left",fontWeight:600,fontSize:10,color:"#64748b",textTransform:"uppercase",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap" }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {appts.map(a=>(
                      <tr key={a.id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                        <td style={{ padding:"9px 12px",color:"#64748b" }}>{a.time}</td>
                        <td style={{ padding:"9px 12px",fontWeight:600,color:"#0f172a" }}>{a.patient}</td>
                        <td style={{ padding:"9px 12px",color:"#64748b",fontSize:10 }}>{a.doctor}</td>
                        <td style={{ padding:"9px 12px",color:"#374151" }}>{a.type}</td>
                        <td style={{ padding:"9px 12px" }}><Bdg l={a.insurance} c={a.insurance==="RSSB"?"#0891b2":a.insurance==="Mutuelle"?"#059669":"#d97706"} bg={a.insurance==="RSSB"?"#ecfeff":a.insurance==="Mutuelle"?"#ecfdf5":"#fffbeb"}/></td>
                        <td style={{ padding:"9px 12px" }}><Bdg l={a.status==="arrived"?"Checked In":"Pending"} c={a.status==="arrived"?"#059669":"#d97706"} bg={a.status==="arrived"?"#dcfce7":"#fffbeb"}/></td>
                        <td style={{ padding:"9px 12px" }}>
                          {a.status==="pending"&&<button onClick={()=>{ setAppts(p=>p.map(x=>x.id===a.id?{...x,status:"arrived"}:x)); showToast(`${a.patient} checked in`); }} style={{ padding:"4px 10px",background:"#059669",color:"white",border:"none",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700 }}>Check In</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Check-in */}
          {section==="checkin"&&(
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Patient Check-In</div>
              <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",padding:"20px 22px",maxWidth:480 }}>
                <div style={{ fontWeight:600,fontSize:13,color:"#0f172a",marginBottom:12 }}>Search by Name, MRN, or NID</div>
                <div style={{ display:"flex",gap:8,marginBottom:16 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:7,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"8px 12px",flex:1 }}>
                    <Search size={13} style={{ color:"#94a3b8" }}/>
                    <input placeholder="Name / MRN / NID" style={{ border:"none",outline:"none",fontSize:12,background:"transparent",flex:1,color:"#0f172a" }}/>
                  </div>
                  <button onClick={()=>showToast("Patient found — MRN-001 Ernest Uwimana")} style={{ padding:"8px 16px",background:"#d97706",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600 }}>Search</button>
                </div>
                <div style={{ background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:9,padding:"12px 14px" }}>
                  <div style={{ fontWeight:700,fontSize:13,color:"#0f172a" }}>Ernest Uwimana</div>
                  <div style={{ fontSize:11,color:"#64748b",marginTop:2 }}>MRN-001 · RSSB · 52y M · Hypertension + T2DM</div>
                  <div style={{ display:"flex",gap:8,marginTop:10 }}>
                    <button onClick={()=>showToast("Patient checked in — ticket A001")} style={{ flex:1,padding:"8px",background:"#059669",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700 }}>✅ Check In</button>
                    <button onClick={()=>showToast("Appointment booked")} style={{ flex:1,padding:"8px",background:"white",color:"#0891b2",border:"1px solid #bae6fd",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600 }}>Book Appointment</button>
                  </div>
                </div>
              </div>
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
