"use client";
import { useState } from "react";
import {
  Pill, Boxes, ClipboardCheck, AlertCircle, BarChart3,
  Settings, LogOut, ChevronLeft, Menu, Search, CheckCircle,
  Download, Plus, Activity,
} from "lucide-react";
import type { AppUser } from "@/types/hms";
import { AccountSettings } from "@/components/ui/AccountSettings";
import { logout } from "@/lib/auth";

type PSection = "dashboard"|"prescriptions"|"inventory"|"dispensing"|"lowstock"|"reports"|"settings";

const NAV: { key: PSection; label: string; icon: any }[] = [
  { key:"dashboard",     label:"Dashboard",          icon:Activity },
  { key:"prescriptions", label:"Pending Rx",         icon:ClipboardCheck },
  { key:"dispensing",    label:"Dispensing",         icon:Pill },
  { key:"inventory",     label:"Inventory",          icon:Boxes },
  { key:"lowstock",      label:"Low Stock Alerts",   icon:AlertCircle },
  { key:"reports",       label:"Reports",            icon:BarChart3 },
  { key:"settings",      label:"Settings",           icon:Settings },
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

const PRESCRIPTIONS = [
  { id:"rx1",patient:"Ernest Uwimana",   mrn:"MRN-001",drug:"Metformin 500mg",  qty:"60 tabs",  route:"Oral",freq:"BD",  duration:"30 days",doctor:"Dr. Grace M.",status:"pending",  insurance:"RSSB" },
  { id:"rx2",patient:"Marie Mukamana",   mrn:"MRN-002",drug:"Folic Acid 5mg",   qty:"30 tabs",  route:"Oral",freq:"OD",  duration:"30 days",doctor:"Dr. Grace M.",status:"pending",  insurance:"Mutuelle" },
  { id:"rx3",patient:"Alice Niyomugabo", mrn:"MRN-004",drug:"Salbutamol Inhaler",qty:"1 inhaler",route:"Inh.", freq:"PRN", duration:"1 month",doctor:"Dr. Grace M.",status:"pending",  insurance:"RSSB" },
  { id:"rx4",patient:"Patrick Gasana",   mrn:"MRN-005",drug:"Aspirin 75mg",     qty:"30 tabs",  route:"Oral",freq:"OD",  duration:"30 days",doctor:"Dr. Grace M.",status:"dispensed",insurance:"Cash" },
  { id:"rx5",patient:"Jean B.",          mrn:"MRN-003",drug:"Amoxicillin 250mg",qty:"21 caps",  route:"Oral",freq:"TID", duration:"7 days", doctor:"Dr. Grace M.",status:"pending",  insurance:"Mutuelle" },
];

const INVENTORY = [
  { id:"i1",name:"Metformin 500mg",    category:"Oral Hypoglycemic", stock:245, reorder:50,  unit:"tabs",  expiry:"2027-06",status:"ok" },
  { id:"i2",name:"Amoxicillin 250mg",  category:"Antibiotic",        stock:38,  reorder:50,  unit:"caps",  expiry:"2026-12",status:"low" },
  { id:"i3",name:"Paracetamol 500mg",  category:"Analgesic",         stock:520, reorder:100, unit:"tabs",  expiry:"2027-03",status:"ok" },
  { id:"i4",name:"Salbutamol Inhaler", category:"Bronchodilator",    stock:12,  reorder:20,  unit:"pcs",   expiry:"2026-09",status:"low" },
  { id:"i5",name:"Artesunate 50mg",    category:"Antimalarial",      stock:8,   reorder:30,  unit:"tabs",  expiry:"2026-08",status:"critical" },
  { id:"i6",name:"ORS Sachets",        category:"Rehydration",       stock:180, reorder:50,  unit:"sachets",expiry:"2027-01",status:"ok" },
  { id:"i7",name:"Folic Acid 5mg",     category:"Supplement",        stock:320, reorder:100, unit:"tabs",  expiry:"2027-06",status:"ok" },
  { id:"i8",name:"Lisinopril 10mg",    category:"Antihypertensive",  stock:15,  reorder:40,  unit:"tabs",  expiry:"2026-10",status:"critical" },
  { id:"i9",name:"Aspirin 75mg",       category:"Antiplatelet",      stock:280, reorder:60,  unit:"tabs",  expiry:"2027-02",status:"ok" },
  { id:"i10",name:"Co-trimoxazole",    category:"Antibiotic",        stock:45,  reorder:80,  unit:"tabs",  expiry:"2026-11",status:"low" },
];

export function PharmacistDashboard({ user }: { user?: AppUser }) {
  const [section, setSection]   = useState<PSection>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [toast, setToast]       = useState("");
  const [prescriptions, setRxs] = useState(PRESCRIPTIONS);
  const [inventory, setInv]     = useState(INVENTORY);
  const [invSearch, setInvSearch]= useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }
  function downloadCSV(name:string, rows:any[][], headers:string[]) {
    const csv=[headers,...rows].map(r=>r.map((c:any)=>`"${String(c||"").replace(/"/g,'""')}"`).join(",")).join("\n");
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download=`${name}.csv`; a.click();
    showToast(`✅ ${name} downloaded`);
  }

  const pending  = prescriptions.filter(rx=>rx.status==="pending");
  const lowStock = inventory.filter(i=>i.status==="low"||i.status==="critical");

  return (
    <div style={{ display:"flex",height:"100vh",overflow:"hidden",fontFamily:"'Inter',system-ui,sans-serif",background:"#f1f5f9" }}>
      {toast&&<div style={{ position:"fixed",top:20,right:20,zIndex:9999,padding:"12px 20px",background:"#059669",color:"white",borderRadius:10,fontSize:13,fontWeight:600,boxShadow:"0 4px 16px rgba(0,0,0,0.15)" }}>{toast}</div>}

      {/* Sidebar */}
      <aside style={{ width:collapsed?64:224,background:"#0a1628",display:"flex",flexDirection:"column",transition:"width 0.22s",flexShrink:0,overflow:"hidden" }}>
        <div style={{ padding:"14px 12px 10px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",gap:9 }}>
          <div style={{ width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#059669,#d97706)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <Pill size={15} color="white"/>
          </div>
          {!collapsed&&<div style={{ overflow:"hidden" }}>
            <div style={{ color:"white",fontWeight:700,fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{user?.facility||"Hospital"}</div>
            <div style={{ color:"#475569",fontSize:9 }}>Pharmacy Portal</div>
          </div>}
        </div>
        <nav style={{ flex:1,overflowY:"auto",padding:"8px 6px" }}>
          {NAV.filter(n=>n.key!=="settings").map(item=>{
            const Icon=item.icon; const active=section===item.key;
            const badge=item.key==="prescriptions"?pending.length:item.key==="lowstock"?lowStock.length:0;
            return <button key={item.key} onClick={()=>setSection(item.key)} title={collapsed?item.label:undefined}
              style={{ display:"flex",alignItems:"center",gap:8,width:"100%",padding:collapsed?"10px 0":"8px 10px",justifyContent:collapsed?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",marginBottom:1,background:active?"rgba(5,150,105,0.18)":"transparent",color:active?"#34d399":"#94a3b8",transition:"all 0.15s" }}>
              <Icon size={15} style={{ flexShrink:0 }}/>{!collapsed&&<span style={{ fontSize:12,fontWeight:active?600:400,flex:1 }}>{item.label}</span>}
              {!collapsed&&badge>0&&<span style={{ background:"#dc2626",color:"white",borderRadius:10,padding:"1px 5px",fontSize:9,fontWeight:700 }}>{badge}</span>}
            </button>;
          })}
        </nav>
        <div style={{ padding:"8px 6px 10px",borderTop:"1px solid rgba(255,255,255,0.07)" }}>
          {!collapsed&&user&&<div style={{ display:"flex",alignItems:"center",gap:7,padding:"7px 8px",marginBottom:4,background:"rgba(255,255,255,0.04)",borderRadius:8 }}>
            <div style={{ width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#059669,#d97706)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"white",flexShrink:0 }}>
              {(user.name||"P").split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase()}
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:10,fontWeight:600,color:"#e2e8f0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user.name}</div>
              <div style={{ fontSize:8,color:"#475569" }}>Pharmacist</div>
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
            <div style={{ fontSize:10,color:"#94a3b8" }}>{user?.facility} · Pharmacy</div>
          </div>
          {lowStock.length>0&&<div style={{ display:"flex",alignItems:"center",gap:5,background:"#fffbeb",borderRadius:8,padding:"4px 10px",fontSize:11,color:"#d97706",fontWeight:600 }}><AlertCircle size={12}/>{lowStock.length} low stock</div>}
        </header>

        <div style={{ flex:1,overflowY:"auto",padding:16 }}>

          {/* Dashboard */}
          {section==="dashboard"&&(
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ background:"linear-gradient(135deg,#0a1628,#0f2942)",borderRadius:13,padding:"16px 20px",color:"white",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
                <div>
                  <div style={{ fontSize:16,fontWeight:800,marginBottom:3 }}>Pharmacy — {user?.name?.split(" ").slice(-1)[0]||"Pharmacist"} 💊</div>
                  <div style={{ fontSize:11,color:"#64748b" }}>{new Date().toLocaleDateString("en-RW",{weekday:"long",day:"numeric",month:"long"})} · {user?.department||"Pharmacy"}</div>
                </div>
                <div style={{ display:"flex",gap:6 }}>
                  <button onClick={()=>setSection("prescriptions")} style={{ padding:"6px 13px",background:"rgba(5,150,105,0.2)",color:"#34d399",border:"1px solid rgba(5,150,105,0.3)",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:600 }}>Pending Rx ({pending.length})</button>
                  <button onClick={()=>setSection("lowstock")} style={{ padding:"6px 13px",background:"rgba(220,38,38,0.2)",color:"#fca5a5",border:"1px solid rgba(220,38,38,0.3)",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:600 }}>Low Stock ({lowStock.length})</button>
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10 }}>
                <KPI label="Pending Rx"      value={pending.length}                                      icon="📋" color="#d97706"/>
                <KPI label="Dispensed Today" value={prescriptions.filter(rx=>rx.status==="dispensed").length} icon="✅" color="#059669"/>
                <KPI label="Drug Lines"      value={inventory.length}                                    icon="💊" color="#0891b2"/>
                <KPI label="Low Stock"       value={lowStock.length}                                     icon="⚠️" color="#dc2626"/>
                <KPI label="Expiring 30d"    value="3"                                                   icon="📅" color="#7c3aed"/>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:14 }}>
                <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",overflow:"auto" }}>
                  <div style={{ padding:"11px 14px",borderBottom:"1px solid #f1f5f9",fontWeight:700,fontSize:12,color:"#0f172a" }}>📋 Recent Prescriptions</div>
                  {prescriptions.slice(0,5).map(rx=>(
                    <div key={rx.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:"1px solid #f9fafb" }}>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontWeight:600,fontSize:12,color:"#0f172a" }}>{rx.patient} — {rx.drug}</div>
                        <div style={{ fontSize:10,color:"#64748b" }}>{rx.qty} · {rx.freq} · {rx.duration} · {rx.insurance}</div>
                      </div>
                      <Bdg l={rx.status} c={rx.status==="dispensed"?"#059669":"#d97706"} bg={rx.status==="dispensed"?"#dcfce7":"#fffbeb"}/>
                      {rx.status==="pending"&&<button onClick={()=>{ setRxs(p=>p.map(x=>x.id===rx.id?{...x,status:"dispensed"}:x)); showToast(`${rx.drug} dispensed to ${rx.patient}`); }} style={{ padding:"4px 9px",background:"#059669",color:"white",border:"none",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700 }}>Dispense</button>}
                    </div>
                  ))}
                </div>
                <div style={{ background:"white",borderRadius:12,border:"2px solid #fde68a",padding:"12px 14px" }}>
                  <div style={{ fontWeight:700,fontSize:11,color:"#d97706",marginBottom:7 }}>⚠️ Low / Critical Stock</div>
                  {lowStock.map(i=>(
                    <div key={i.id} style={{ padding:"6px 0",borderBottom:"1px solid #f9fafb",fontSize:11 }}>
                      <div style={{ fontWeight:700,color:i.status==="critical"?"#dc2626":"#d97706" }}>{i.name}</div>
                      <div style={{ color:"#64748b" }}>{i.stock} {i.unit} remaining (reorder: {i.reorder})</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Prescriptions */}
          {section==="prescriptions"&&(
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Pending Prescriptions</div>
              <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",overflow:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                  <thead><tr style={{ background:"#f8fafc" }}>
                    {["Patient","MRN","Drug","Quantity","Route","Freq","Duration","Insurance","Doctor","Status","Action"].map(h=>(
                      <th key={h} style={{ padding:"9px 12px",textAlign:"left",fontWeight:600,fontSize:10,color:"#64748b",textTransform:"uppercase",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {prescriptions.map(rx=>(
                      <tr key={rx.id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                        <td style={{ padding:"9px 12px",fontWeight:600,color:"#0f172a" }}>{rx.patient}</td>
                        <td style={{ padding:"9px 12px",color:"#0891b2",fontSize:10 }}>{rx.mrn}</td>
                        <td style={{ padding:"9px 12px",fontWeight:600,color:"#374151" }}>{rx.drug}</td>
                        <td style={{ padding:"9px 12px",color:"#64748b" }}>{rx.qty}</td>
                        <td style={{ padding:"9px 12px",color:"#64748b" }}>{rx.route}</td>
                        <td style={{ padding:"9px 12px",color:"#64748b" }}>{rx.freq}</td>
                        <td style={{ padding:"9px 12px",color:"#64748b" }}>{rx.duration}</td>
                        <td style={{ padding:"9px 12px" }}><Bdg l={rx.insurance} c={rx.insurance==="RSSB"?"#0891b2":rx.insurance==="Mutuelle"?"#059669":rx.insurance==="Cash"?"#d97706":"#7c3aed"} bg={rx.insurance==="RSSB"?"#ecfeff":rx.insurance==="Mutuelle"?"#ecfdf5":rx.insurance==="Cash"?"#fffbeb":"#f5f3ff"}/></td>
                        <td style={{ padding:"9px 12px",color:"#64748b",fontSize:10 }}>{rx.doctor}</td>
                        <td style={{ padding:"9px 12px" }}><Bdg l={rx.status} c={rx.status==="dispensed"?"#059669":"#d97706"} bg={rx.status==="dispensed"?"#dcfce7":"#fffbeb"}/></td>
                        <td style={{ padding:"9px 12px" }}>
                          {rx.status==="pending"&&<button onClick={()=>{ setRxs(p=>p.map(x=>x.id===rx.id?{...x,status:"dispensed"}:x)); showToast(`✅ ${rx.drug} dispensed to ${rx.patient}`); }} style={{ padding:"4px 10px",background:"#059669",color:"white",border:"none",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700 }}>Dispense</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Dispensing */}
          {section==="dispensing"&&(
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Dispensing Log — Today</div>
              <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",padding:"14px 16px" }}>
                {prescriptions.filter(rx=>rx.status==="dispensed").length===0
                  ? <div style={{ textAlign:"center",padding:"24px",color:"#94a3b8" }}>No dispensed medications yet today.</div>
                  : prescriptions.filter(rx=>rx.status==="dispensed").map(rx=>(
                    <div key={rx.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid #f1f5f9" }}>
                      <CheckCircle size={15} style={{ color:"#059669",flexShrink:0 }}/>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600,fontSize:12,color:"#0f172a" }}>{rx.patient} — {rx.drug}</div>
                        <div style={{ fontSize:10,color:"#64748b" }}>{rx.qty} · {rx.freq} · {rx.insurance}</div>
                      </div>
                      <button onClick={()=>showToast("Dispensing receipt printed")} style={{ padding:"3px 9px",border:"1px solid #e2e8f0",background:"white",borderRadius:6,cursor:"pointer",fontSize:10,color:"#374151" }}>Print Receipt</button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Inventory */}
          {section==="inventory"&&(
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
                <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Drug Inventory</div>
                <div style={{ display:"flex",alignItems:"center",gap:7,background:"white",border:"1px solid #e2e8f0",borderRadius:8,padding:"7px 11px" }}>
                  <Search size={13} style={{ color:"#94a3b8" }}/>
                  <input value={invSearch} onChange={e=>setInvSearch(e.target.value)} placeholder="Search drugs…" style={{ border:"none",outline:"none",fontSize:12,background:"transparent",width:180,color:"#0f172a" }}/>
                </div>
              </div>
              <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",overflow:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                  <thead><tr style={{ background:"#f8fafc" }}>
                    {["Drug Name","Category","Stock","Reorder Point","Unit","Expiry","Status","Action"].map(h=>(
                      <th key={h} style={{ padding:"9px 12px",textAlign:"left",fontWeight:600,fontSize:10,color:"#64748b",textTransform:"uppercase",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {inventory.filter(i=>!invSearch||i.name.toLowerCase().includes(invSearch.toLowerCase())).map(i=>(
                      <tr key={i.id} style={{ borderBottom:"1px solid #f1f5f9",background:i.status==="critical"?"#fff5f5":i.status==="low"?"#fffdf0":"white" }}>
                        <td style={{ padding:"9px 12px",fontWeight:600,color:"#0f172a" }}>{i.name}</td>
                        <td style={{ padding:"9px 12px",color:"#64748b",fontSize:10 }}>{i.category}</td>
                        <td style={{ padding:"9px 12px",fontWeight:700,color:i.status==="critical"?"#dc2626":i.status==="low"?"#d97706":"#059669" }}>{i.stock}</td>
                        <td style={{ padding:"9px 12px",color:"#64748b" }}>{i.reorder}</td>
                        <td style={{ padding:"9px 12px",color:"#64748b" }}>{i.unit}</td>
                        <td style={{ padding:"9px 12px",color:"#64748b",fontSize:10 }}>{i.expiry}</td>
                        <td style={{ padding:"9px 12px" }}><Bdg l={i.status==="critical"?"Critical":i.status==="low"?"Low Stock":"In Stock"} c={i.status==="critical"?"#dc2626":i.status==="low"?"#d97706":"#059669"} bg={i.status==="critical"?"#fee2e2":i.status==="low"?"#fffbeb":"#dcfce7"}/></td>
                        <td style={{ padding:"9px 12px" }}>
                          {(i.status==="critical"||i.status==="low")&&<button onClick={()=>showToast(`Purchase request raised for ${i.name}`)} style={{ padding:"3px 9px",background:"#d97706",color:"white",border:"none",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700 }}>Request Restock</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Low Stock */}
          {section==="lowstock"&&(
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Low Stock & Critical Alerts</div>
              {lowStock.length===0
                ? <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",padding:"28px",textAlign:"center",color:"#94a3b8" }}>All items are adequately stocked.</div>
                : lowStock.map(i=>(
                  <div key={i.id} style={{ background:"white",borderRadius:12,border:`2px solid ${i.status==="critical"?"#fca5a5":"#fde68a"}`,padding:"14px 16px",display:"flex",alignItems:"center",gap:12 }}>
                    <div style={{ fontSize:28,flexShrink:0 }}>{i.status==="critical"?"🚨":"⚠️"}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700,fontSize:13,color:i.status==="critical"?"#dc2626":"#d97706" }}>{i.name}</div>
                      <div style={{ fontSize:11,color:"#64748b",marginTop:2 }}>{i.category} · {i.stock} {i.unit} remaining (reorder at {i.reorder}) · Expires {i.expiry}</div>
                    </div>
                    <button onClick={()=>showToast(`Purchase request submitted for ${i.name}`)} style={{ padding:"7px 14px",background:i.status==="critical"?"#dc2626":"#d97706",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:700 }}>Request Restock</button>
                  </div>
                ))}
            </div>
          )}

          {/* Reports */}
          {section==="reports"&&(
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Pharmacy Reports</div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10 }}>
                <KPI label="Dispensed This Month" value="847" icon="✅" color="#059669"/>
                <KPI label="Rx Processed"         value="912" icon="📋" color="#0891b2"/>
                <KPI label="Drug Interactions"     value="3"   icon="⚠️" color="#d97706"/>
                <KPI label="Value Dispensed"       value="RWF 2.1M" icon="💰" color="#7c3aed"/>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:11 }}>
                {[
                  { title:"📋 Prescriptions Report", rows:prescriptions.map(rx=>[rx.patient,rx.drug,rx.qty,rx.freq,rx.insurance,rx.status,rx.doctor]), headers:["Patient","Drug","Qty","Frequency","Insurance","Status","Doctor"] },
                  { title:"📦 Inventory Report",      rows:inventory.map(i=>[i.name,i.category,String(i.stock),String(i.reorder),i.unit,i.expiry,i.status]), headers:["Drug","Category","Stock","Reorder","Unit","Expiry","Status"] },
                  { title:"⚠️ Low Stock Report",      rows:lowStock.map(i=>[i.name,String(i.stock),String(i.reorder),i.unit,i.expiry,i.status]), headers:["Drug","Stock","Reorder","Unit","Expiry","Status"] },
                  { title:"🇷🇼 MOH Pharmacy Report",  rows:[["Total Rx dispensed","847"],["Essential medicines dispensed","743"],["Drug stock-outs","2"]], headers:["Indicator","Value"] },
                ].map(r=>(
                  <div key={r.title} style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",padding:"14px 16px" }}>
                    <div style={{ fontWeight:700,fontSize:12,color:"#0f172a",marginBottom:4 }}>{r.title}</div>
                    <div style={{ fontSize:11,color:"#64748b",marginBottom:12 }}>{r.rows.length} records</div>
                    <button onClick={()=>downloadCSV(r.title.replace(/[^a-zA-Z]/g,"_"),r.rows,r.headers)} style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 14px",background:"#059669",color:"white",borderRadius:7,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,width:"100%" }}>
                      <Download size={11}/>Download CSV
                    </button>
                  </div>
                ))}
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
