"use client";
import { useState } from "react";
import {
  FlaskConical, Microscope, TestTube2, ClipboardList, Activity,
  Bell, Settings, LogOut, ChevronLeft, Menu, Search, CheckCircle,
  AlertCircle, Download, Plus, X,
} from "lucide-react";
import type { AppUser } from "@/types/hms";
import { OTPPasswordChange } from "@/components/ui/OTPPasswordChange";
import { logout } from "@/lib/auth";
import { LAB_CATALOGUE } from "@/components/dashboard/PatientRegistrationForm";

type LSection = "dashboard"|"pending"|"results"|"entry"|"critical"|"reports"|"settings";

const NAV: { key: LSection; label: string; icon: any }[] = [
  { key:"dashboard", label:"Dashboard",       icon:Activity },
  { key:"pending",   label:"Pending Orders",  icon:ClipboardList },
  { key:"results",   label:"Results Entry",   icon:TestTube2 },
  { key:"critical",  label:"Critical Alerts", icon:AlertCircle },
  { key:"reports",   label:"Reports",         icon:FlaskConical },
  { key:"settings",  label:"Settings",        icon:Settings },
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

const PENDING_ORDERS = [
  { id:"o1",patient:"Ernest Uwimana",   mrn:"MRN-001",test:"HbA1c",           dept:"Biochemistry",    priority:"Routine", collected:true,  received:true,  time:"08:30",doctor:"Dr. Grace M." },
  { id:"o2",patient:"Patrick Gasana",   mrn:"MRN-005",test:"Troponin I",       dept:"Biochemistry",    priority:"STAT",    collected:true,  received:true,  time:"08:55",doctor:"Dr. Grace M." },
  { id:"o3",patient:"Jean B.",          mrn:"MRN-003",test:"Malaria RDT",       dept:"Parasitology",    priority:"Urgent",  collected:true,  received:false, time:"09:05",doctor:"Dr. Grace M." },
  { id:"o4",patient:"Alice Niyomugabo", mrn:"MRN-004",test:"Peak Flow",         dept:"Pulmonology",     priority:"Routine", collected:false, received:false, time:"09:30",doctor:"Dr. Grace M." },
  { id:"o5",patient:"Marie Mukamana",   mrn:"MRN-002",test:"Haemoglobin (Hb)", dept:"Hematology",      priority:"Routine", collected:true,  received:true,  time:"09:45",doctor:"Dr. Grace M." },
  { id:"o6",patient:"Olive Uwineza",    mrn:"MRN-006",test:"Urinalysis (R/E)", dept:"Clinical Pathology",priority:"Routine",collected:true, received:true,  time:"10:00",doctor:"Dr. Grace M." },
];

const RESULTS_DATA = [
  { id:"r1",patient:"Ernest Uwimana",   test:"HbA1c",        result:"9.2%",     ref:"<7.0%",     flag:"High",     verified:false, date:"Jul 21" },
  { id:"r2",patient:"Patrick Gasana",   test:"Troponin I",   result:"0.8 ng/mL",ref:"<0.04",     flag:"Critical", verified:false, date:"Jul 21" },
  { id:"r3",patient:"Marie Mukamana",   test:"Haemoglobin",  result:"10.2 g/dL",ref:"12.0–16.0", flag:"Low",      verified:true,  date:"Jul 21" },
  { id:"r4",patient:"Jean B.",          test:"Malaria RDT",  result:"POSITIVE", ref:"Negative",  flag:"Positive", verified:true,  date:"Jul 21" },
  { id:"r5",patient:"Olive Uwineza",    test:"Urinalysis",   result:"Nitrites+, Leuco++",ref:"Negative",flag:"Abnormal",verified:false,date:"Jul 21" },
];

export function LabDashboard({ user }: { user?: AppUser }) {
  const [section, setSection] = useState<LSection>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [toast, setToast] = useState("");
  const [orders, setOrders] = useState(PENDING_ORDERS);
  const [results, setResults] = useState(RESULTS_DATA);
  const [entryValues, setEntryValues] = useState<Record<string,string>>({});

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }
  function downloadCSV(name:string, rows:any[][], headers:string[]) {
    const csv=[headers,...rows].map(r=>r.map((c:any)=>`"${String(c||"").replace(/"/g,'""')}"`).join(",")).join("\n");
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download=`${name}.csv`; a.click();
    showToast(`✅ ${name} downloaded`);
  }

  const criticals = results.filter(r => r.flag === "Critical" || r.flag === "Positive");
  const pending   = orders.filter(o => !o.received);
  const inProcess = orders.filter(o => o.received && !results.find(r=>r.test===o.test&&r.patient===o.patient));

  return (
    <div style={{ display:"flex",height:"100vh",overflow:"hidden",fontFamily:"'Inter',system-ui,sans-serif",background:"#f1f5f9" }}>
      {toast&&<div style={{ position:"fixed",top:20,right:20,zIndex:9999,padding:"12px 20px",background:"#059669",color:"white",borderRadius:10,fontSize:13,fontWeight:600,boxShadow:"0 4px 16px rgba(0,0,0,0.15)" }}>{toast}</div>}

      {/* Sidebar */}
      <aside style={{ width:collapsed?64:224,background:"#0a1628",display:"flex",flexDirection:"column",transition:"width 0.22s",flexShrink:0,overflow:"hidden" }}>
        <div style={{ padding:"14px 12px 10px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",gap:9 }}>
          <div style={{ width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#7c3aed,#0891b2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <Microscope size={15} color="white"/>
          </div>
          {!collapsed&&<div style={{ overflow:"hidden" }}>
            <div style={{ color:"white",fontWeight:700,fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{user?.facility||"Hospital"}</div>
            <div style={{ color:"#475569",fontSize:9 }}>Laboratory Portal</div>
          </div>}
        </div>
        <nav style={{ flex:1,overflowY:"auto",padding:"8px 6px" }}>
          {NAV.filter(n=>n.key!=="settings").map(item=>{
            const Icon=item.icon; const active=section===item.key;
            const badge=item.key==="critical"?criticals.length:item.key==="pending"?pending.length:0;
            return <button key={item.key} onClick={()=>setSection(item.key)} title={collapsed?item.label:undefined}
              style={{ display:"flex",alignItems:"center",gap:8,width:"100%",padding:collapsed?"10px 0":"8px 10px",justifyContent:collapsed?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",marginBottom:1,background:active?"rgba(124,58,237,0.18)":"transparent",color:active?"#c4b5fd":"#94a3b8",transition:"all 0.15s" }}>
              <Icon size={15} style={{ flexShrink:0 }}/>{!collapsed&&<span style={{ fontSize:12,fontWeight:active?600:400,flex:1 }}>{item.label}</span>}
              {!collapsed&&badge>0&&<span style={{ background:"#dc2626",color:"white",borderRadius:10,padding:"1px 5px",fontSize:9,fontWeight:700 }}>{badge}</span>}
            </button>;
          })}
        </nav>
        <div style={{ padding:"8px 6px 10px",borderTop:"1px solid rgba(255,255,255,0.07)" }}>
          {!collapsed&&user&&<div style={{ display:"flex",alignItems:"center",gap:7,padding:"7px 8px",marginBottom:4,background:"rgba(255,255,255,0.04)",borderRadius:8 }}>
            <div style={{ width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#0891b2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"white",flexShrink:0 }}>
              {(user.name||"L").split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase()}
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:10,fontWeight:600,color:"#e2e8f0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user.name}</div>
              <div style={{ fontSize:8,color:"#475569" }}>Lab Scientist</div>
            </div>
          </div>}
          <button onClick={()=>setSection("settings")} style={{ display:"flex",alignItems:"center",gap:8,width:"100%",padding:collapsed?"10px 0":"7px 10px",justifyContent:collapsed?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",background:section==="settings"?"rgba(124,58,237,0.18)":"transparent",color:section==="settings"?"#c4b5fd":"#64748b",marginBottom:2 }}>
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
            <div style={{ fontSize:10,color:"#94a3b8" }}>{user?.facility} · Laboratory</div>
          </div>
          {criticals.length>0&&<div style={{ display:"flex",alignItems:"center",gap:5,background:"#fee2e2",borderRadius:8,padding:"4px 10px",fontSize:11,color:"#dc2626",fontWeight:600 }}><AlertCircle size={12}/>{criticals.length} critical results</div>}
        </header>

        <div style={{ flex:1,overflowY:"auto",padding:16 }}>

          {/* Dashboard */}
          {section==="dashboard"&&(
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ background:"linear-gradient(135deg,#0a1628,#0f2942)",borderRadius:13,padding:"16px 20px",color:"white",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
                <div>
                  <div style={{ fontSize:16,fontWeight:800,marginBottom:3 }}>Lab — {user?.name?.split(" ")[0]||"Scientist"} 🔬</div>
                  <div style={{ fontSize:11,color:"#64748b" }}>{new Date().toLocaleDateString("en-RW",{weekday:"long",day:"numeric",month:"long"})} · {user?.department||"Laboratory"}</div>
                </div>
                <div style={{ display:"flex",gap:6 }}>
                  <button onClick={()=>setSection("critical")} style={{ padding:"6px 13px",background:"rgba(220,38,38,0.2)",color:"#fca5a5",border:"1px solid rgba(220,38,38,0.3)",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:600 }}>Critical Alerts ({criticals.length})</button>
                  <button onClick={()=>setSection("pending")} style={{ padding:"6px 13px",background:"rgba(255,255,255,0.08)",color:"white",border:"1px solid rgba(255,255,255,0.15)",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:600 }}>Pending ({pending.length})</button>
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10 }}>
                <KPI label="Total Orders"    value={orders.length}                                                     icon="📋" color="#0891b2"/>
                <KPI label="Pending Collect" value={orders.filter(o=>!o.collected).length}                             icon="🩸" color="#d97706"/>
                <KPI label="In Processing"   value={inProcess.length}                                                   icon="⚗️" color="#7c3aed"/>
                <KPI label="Results Ready"   value={results.length}                                                     icon="✅" color="#059669"/>
                <KPI label="Critical/Panic"  value={criticals.length}                                                   icon="🚨" color="#dc2626"/>
                <KPI label="Avg TAT"         value="38m"                                                                icon="⏱️" color="#0891b2"/>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:14 }}>
                <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",overflow:"auto" }}>
                  <div style={{ padding:"11px 14px",borderBottom:"1px solid #f1f5f9",fontWeight:700,fontSize:12,color:"#0f172a" }}>📋 Recent Orders</div>
                  <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                    <thead><tr style={{ background:"#f8fafc" }}>
                      {["Patient","Test","Dept","Priority","Status"].map(h=><th key={h} style={{ padding:"8px 11px",textAlign:"left",fontWeight:600,fontSize:10,color:"#64748b",textTransform:"uppercase",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap" }}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {orders.slice(0,6).map(o=>(
                        <tr key={o.id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                          <td style={{ padding:"8px 11px",fontWeight:600,color:"#0f172a" }}>{o.patient}</td>
                          <td style={{ padding:"8px 11px",color:"#374151" }}>{o.test}</td>
                          <td style={{ padding:"8px 11px",color:"#64748b",fontSize:10 }}>{o.dept}</td>
                          <td style={{ padding:"8px 11px" }}><Bdg l={o.priority} c={o.priority==="STAT"?"#dc2626":o.priority==="Urgent"?"#d97706":"#059669"} bg={o.priority==="STAT"?"#fee2e2":o.priority==="Urgent"?"#fffbeb":"#dcfce7"}/></td>
                          <td style={{ padding:"8px 11px" }}>
                            <Bdg l={!o.collected?"Awaiting Collection":!o.received?"Collected":results.find(r=>r.test===o.test&&r.patient===o.patient)?"Resulted":"Processing"}
                              c={!o.collected?"#d97706":!o.received?"#7c3aed":results.find(r=>r.test===o.test&&r.patient===o.patient)?"#059669":"#0891b2"}
                              bg={!o.collected?"#fffbeb":!o.received?"#f5f3ff":results.find(r=>r.test===o.test&&r.patient===o.patient)?"#dcfce7":"#ecfeff"}/>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                  <div style={{ background:"white",borderRadius:12,border:"2px solid #fca5a5",padding:"12px 14px" }}>
                    <div style={{ fontWeight:700,fontSize:11,color:"#dc2626",marginBottom:7,display:"flex",alignItems:"center",gap:5 }}><AlertCircle size={12}/>Critical Results — Notify Doctor</div>
                    {criticals.map(r=>(
                      <div key={r.id} style={{ padding:"6px 0",borderBottom:"1px solid #f9fafb",fontSize:11 }}>
                        <div style={{ fontWeight:700,color:"#dc2626" }}>{r.flag} — {r.test}: {r.result}</div>
                        <div style={{ color:"#64748b" }}>{r.patient}</div>
                        <button onClick={()=>showToast(`Doctor notified: ${r.patient} — ${r.test}`)} style={{ marginTop:3,padding:"2px 8px",background:"#fee2e2",border:"1px solid #fca5a5",borderRadius:5,cursor:"pointer",fontSize:9,color:"#dc2626",fontWeight:700 }}>Notify Doctor</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pending Orders */}
          {section==="pending"&&(
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Pending Lab Orders</div>
              <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",overflow:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                  <thead><tr style={{ background:"#f8fafc" }}>
                    {["Time","Patient","MRN","Test","Dept","Priority","Doctor","Collected","Received","Action"].map(h=>(
                      <th key={h} style={{ padding:"9px 12px",textAlign:"left",fontWeight:600,fontSize:10,color:"#64748b",textTransform:"uppercase",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {orders.map(o=>(
                      <tr key={o.id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                        <td style={{ padding:"9px 12px",color:"#64748b",whiteSpace:"nowrap" }}>{o.time}</td>
                        <td style={{ padding:"9px 12px",fontWeight:600,color:"#0f172a" }}>{o.patient}</td>
                        <td style={{ padding:"9px 12px",color:"#0891b2",fontSize:10 }}>{o.mrn}</td>
                        <td style={{ padding:"9px 12px",fontWeight:600,color:"#374151" }}>{o.test}</td>
                        <td style={{ padding:"9px 12px",color:"#64748b",fontSize:10 }}>{o.dept}</td>
                        <td style={{ padding:"9px 12px" }}><Bdg l={o.priority} c={o.priority==="STAT"?"#dc2626":o.priority==="Urgent"?"#d97706":"#059669"} bg={o.priority==="STAT"?"#fee2e2":o.priority==="Urgent"?"#fffbeb":"#dcfce7"}/></td>
                        <td style={{ padding:"9px 12px",color:"#64748b",fontSize:10 }}>{o.doctor}</td>
                        <td style={{ padding:"9px 12px",textAlign:"center" }}>
                          {o.collected?<CheckCircle size={14} style={{ color:"#059669" }}/>:<button onClick={()=>{ setOrders(p=>p.map(x=>x.id===o.id?{...x,collected:true}:x)); showToast("Specimen collected"); }} style={{ padding:"3px 8px",background:"#fffbeb",border:"1px solid #fed7aa",borderRadius:5,cursor:"pointer",fontSize:10,color:"#d97706",fontWeight:600 }}>Collect</button>}
                        </td>
                        <td style={{ padding:"9px 12px",textAlign:"center" }}>
                          {o.received?<CheckCircle size={14} style={{ color:"#059669" }}/>:o.collected?<button onClick={()=>{ setOrders(p=>p.map(x=>x.id===o.id?{...x,received:true}:x)); showToast("Specimen received in lab"); }} style={{ padding:"3px 8px",background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:5,cursor:"pointer",fontSize:10,color:"#0891b2",fontWeight:600 }}>Receive</button>:<span style={{ color:"#94a3b8",fontSize:10 }}>—</span>}
                        </td>
                        <td style={{ padding:"9px 12px" }}>
                          {o.received&&<button onClick={()=>setSection("results")} style={{ padding:"3px 9px",background:"#7c3aed",color:"white",border:"none",borderRadius:5,cursor:"pointer",fontSize:10,fontWeight:600 }}>Enter Result</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Results Entry */}
          {section==="results"&&(
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Results Entry & Verification</div>
              <div style={{ display:"grid",gap:10 }}>
                {orders.filter(o=>o.received).map(o=>{
                  const existing=results.find(r=>r.test===o.test&&r.patient===o.patient);
                  return (
                    <div key={o.id} style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",padding:"14px 16px" }}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                        <div>
                          <div style={{ fontWeight:700,fontSize:13,color:"#0f172a" }}>{o.patient} — {o.test}</div>
                          <div style={{ fontSize:11,color:"#64748b" }}>{o.dept} · {o.mrn} · Ordered by {o.doctor}</div>
                        </div>
                        {existing?<Bdg l={existing.verified?"Verified":"Awaiting Verification"} c={existing.verified?"#059669":"#d97706"} bg={existing.verified?"#dcfce7":"#fffbeb"}/>:<Bdg l="Enter Result" c="#7c3aed" bg="#f5f3ff"/>}
                      </div>
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:10,alignItems:"flex-end" }}>
                        <div>
                          <label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:3 }}>Result Value</label>
                          <input value={existing?.result||entryValues[o.id]||""} onChange={e=>setEntryValues(p=>({...p,[o.id]:e.target.value}))} placeholder="e.g. 9.2%" style={{ width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13,fontWeight:700,outline:"none",color:"#0f172a",boxSizing:"border-box" }}/>
                        </div>
                        <div>
                          <label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:3 }}>Flag</label>
                          <select style={{ width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none",color:"#374151" }}>
                            <option>Normal</option><option>Low</option><option>High</option><option>Critical</option><option>Positive</option><option>Abnormal</option>
                          </select>
                        </div>
                        <div style={{ display:"flex",gap:6 }}>
                          <button onClick={()=>{ if(!entryValues[o.id]&&!existing?.result){showToast("Enter a result value");return;} const newR={id:"r"+Date.now(),patient:o.patient,test:o.test,result:entryValues[o.id]||existing?.result||"",ref:"—",flag:"Normal",verified:false,date:"Jul 21"}; setResults(p=>[...p.filter(r=>!(r.test===o.test&&r.patient===o.patient)),newR]); showToast(`Result saved for ${o.patient}`); }} style={{ padding:"7px 14px",background:"#0891b2",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:600,whiteSpace:"nowrap" }}>Save</button>
                          {existing&&!existing.verified&&<button onClick={()=>{ setResults(p=>p.map(r=>r.test===o.test&&r.patient===o.patient?{...r,verified:true}:r)); showToast(`Result verified & released for ${o.patient}`); }} style={{ padding:"7px 14px",background:"#059669",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:600,whiteSpace:"nowrap" }}>Verify & Release</button>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Critical Alerts */}
          {section==="critical"&&(
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Critical & Panic Results — Notify Doctor Immediately</div>
              <div style={{ background:"#fef2f2",border:"2px solid #fca5a5",borderRadius:12,padding:"12px 16px",fontSize:12,color:"#dc2626",fontWeight:600 }}>
                ⚠️ Critical/panic values must be verbally communicated to the requesting doctor within 30 minutes per Rwanda MOH protocol.
              </div>
              {criticals.length===0?<div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",padding:"28px",textAlign:"center",color:"#94a3b8" }}>No critical results at this time.</div>:criticals.map(r=>(
                <div key={r.id} style={{ background:"white",borderRadius:12,border:"2px solid #fca5a5",padding:"14px 16px" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10 }}>
                    <div>
                      <div style={{ fontSize:15,fontWeight:800,color:"#dc2626" }}>{r.flag} — {r.test}: {r.result}</div>
                      <div style={{ fontSize:12,color:"#374151",marginTop:3 }}>{r.patient} · Reference: {r.ref}</div>
                      <div style={{ fontSize:11,color:"#94a3b8",marginTop:1 }}>Date: {r.date} · Status: {r.verified?"Verified":"Pending verification"}</div>
                    </div>
                    <div style={{ display:"flex",gap:6 }}>
                      <button onClick={()=>showToast(`Doctor verbally notified: ${r.patient} — ${r.test} CRITICAL`)} style={{ padding:"7px 14px",background:"#dc2626",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:700 }}>📞 Notify Doctor</button>
                      {!r.verified&&<button onClick={()=>{ setResults(p=>p.map(x=>x.id===r.id?{...x,verified:true}:x)); showToast("Result verified"); }} style={{ padding:"7px 14px",background:"#059669",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:700 }}>✓ Verify</button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reports */}
          {section==="reports"&&(
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Lab Reports</div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10 }}>
                <KPI label="Tests This Month" value="284"  icon="🔬" color="#0891b2"/>
                <KPI label="Critical Results" value="8"   icon="🚨" color="#dc2626"/>
                <KPI label="Avg TAT"          value="38m" icon="⏱️" color="#7c3aed"/>
                <KPI label="QC Pass Rate"     value="99%" icon="✅" color="#059669"/>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:11 }}>
                {[
                  { title:"📋 Pending Orders Report",  rows:orders.map(o=>[o.patient,o.mrn,o.test,o.dept,o.priority,o.collected?"Yes":"No",o.received?"Yes":"No"]), headers:["Patient","MRN","Test","Dept","Priority","Collected","Received"] },
                  { title:"✅ Results Report",          rows:results.map(r=>[r.patient,r.test,r.result,r.ref,r.flag,r.verified?"Yes":"No",r.date]), headers:["Patient","Test","Result","Reference","Flag","Verified","Date"] },
                  { title:"🚨 Critical Results Report", rows:criticals.map(r=>[r.patient,r.test,r.result,r.ref,r.flag,r.date]), headers:["Patient","Test","Result","Reference","Flag","Date"] },
                  { title:"📊 Test Volume by Dept",     rows:Object.entries(orders.reduce((a:any,o)=>({...a,[o.dept]:(a[o.dept]||0)+1}),{})).map(([d,c])=>[d,String(c)]), headers:["Department","Count"] },
                ].map(r=>(
                  <div key={r.title} style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",padding:"14px 16px" }}>
                    <div style={{ fontWeight:700,fontSize:12,color:"#0f172a",marginBottom:4 }}>{r.title}</div>
                    <div style={{ fontSize:11,color:"#64748b",marginBottom:12 }}>{r.rows.length} records</div>
                    <button onClick={()=>downloadCSV(r.title.replace(/[^a-zA-Z]/g,"_"),r.rows,r.headers)} style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 14px",background:"#7c3aed",color:"white",borderRadius:7,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,width:"100%" }}>
                      <Download size={11}/>Download CSV
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings */}
          {section==="settings"&&(
            <div style={{ display:"grid",gap:16,maxWidth:600 }}>
              <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Settings & Security</div>
              <OTPPasswordChange userEmail={user?.email}/>
              <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",padding:"16px 18px" }}>
                <div style={{ fontWeight:700,fontSize:12,color:"#0f172a",marginBottom:10 }}>👤 Profile</div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                  {[{ l:"Name",v:user?.name||"—" },{ l:"Email",v:user?.email||"—" },{ l:"Department",v:user?.department||"—" },{ l:"Facility",v:user?.facility||"—" }].map(f=>(
                    <div key={f.l} style={{ padding:"9px 11px",background:"#f8fafc",borderRadius:8 }}>
                      <div style={{ fontSize:10,color:"#94a3b8",fontWeight:600,textTransform:"uppercase" }}>{f.l}</div>
                      <div style={{ fontSize:12,fontWeight:600,color:"#0f172a",marginTop:2 }}>{f.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
