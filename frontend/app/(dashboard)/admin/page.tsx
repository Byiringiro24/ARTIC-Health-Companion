"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { superAdminApi } from "@/lib/api/hms";
import { useToast } from "@/lib/store";
import {
  LayoutDashboard, Settings, Building2, CreditCard, FileBarChart,
  ShieldCheck, ToggleLeft, ToggleRight, CheckCircle, XCircle, Clock,
  RefreshCw, ExternalLink, Plus, Search, ChevronDown, ChevronRight,
  AlertTriangle, Loader2, DollarSign, Edit, Eye, MessageSquare, Bot,
  Send, Paperclip, Phone, Video, MoreVertical, ThumbsUp, ThumbsDown,
  FileText, Image as ImageIcon, Download, Upload, Edit3, Save, X,
  Smile, Users,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = "dashboard"|"features"|"hospitals"|"requests"|"chat"|"ai"|"billing"|"settings";
type FeatureStatus = "active"|"locked"|"limited"|"beta"|"pending";
type TierLevel = "trial"|"basic"|"premium"|"pro"|"enterprise";

const TIERS: TierLevel[] = ["trial","basic","premium","pro","enterprise"];
const TIER_COLORS: Record<TierLevel,string> = { trial:"#9ca3af",basic:"#027c8e",premium:"#5b5fc7",pro:"#0f9f6e",enterprise:"#b7791f" };
const TIER_LABELS: Record<TierLevel,string> = { trial:"Trial",basic:"Basic",premium:"Premium",pro:"Pro",enterprise:"Enterprise" };
const STATUS_COLORS: Record<FeatureStatus,string> = { active:"#0f9f6e",locked:"#c23b22",limited:"#b7791f",beta:"#5b5fc7",pending:"#9ca3af" };
const STATUS_LABELS: Record<FeatureStatus,string> = { active:"Active",locked:"Locked",limited:"Limited",beta:"Beta",pending:"Pending" };
const STATUS_ICONS: Record<FeatureStatus,string> = { active:"✅",locked:"🔒",limited:"⚠️",beta:"🧪",pending:"⏳" };

const AI_QUICK_ACTIONS = [
  { label:"Explain Medication",  icon:"💊", prompt:"Explain this medication in simple terms: " },
  { label:"Health Education",    icon:"📚", prompt:"Create patient education about: " },
  { label:"Clinical Support",    icon:"🩺", prompt:"Clinical guidance for: " },
  { label:"Symptom Check",       icon:"🤒", prompt:"Possible causes of: " },
  { label:"Nutrition Advice",    icon:"🥗", prompt:"Nutrition advice for: " },
  { label:"Mental Health",       icon:"🧠", prompt:"Mental health support for: " },
];

const PORTAL_LINKS = [
  { label:"Hospital Manager", url:"http://172.209.217.176:3001/login?role=hospital-manager", icon:"🏥" },
  { label:"Doctor",           url:"http://172.209.217.176:3001/login?role=doctor",           icon:"👨‍⚕️" },
  { label:"Nurse",            url:"http://172.209.217.176:3001/login?role=nurse",             icon:"👩‍⚕️" },
  { label:"Pharmacy",         url:"http://172.209.217.176:3001/login?role=pharmacist",        icon:"💊" },
  { label:"Laboratory",       url:"http://172.209.217.176:3001/login?role=laboratory",        icon:"🔬" },
  { label:"Receptionist",     url:"http://172.209.217.176:3001/login?role=receptionist",      icon:"🖥️" },
  { label:"Patient Portal",   url:"http://172.209.217.176:3001/login?role=patient",           icon:"👤" },
  { label:"API Health",       url:"http://172.209.217.176:4001/health",                       icon:"⚡" },
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function SuperAdminPage() {
  const [tab, setTab]               = useState<Tab>("dashboard");
  const [stats, setStats]           = useState<any>(null);
  const [features, setFeatures]     = useState<any[]>([]);
  const [hospitals, setHospitals]   = useState<any[]>([]);
  const [requests, setRequests]     = useState<any[]>([]);
  const [invoices, setInvoices]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(false);
  const [expandedCat, setExpandedCat] = useState<string|null>("Core");
  const [search, setSearch]         = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  // Feature editing
  const [editingFeature, setEditingFeature] = useState<any>(null);
  // Chat state
  const [chatUsers, setChatUsers]   = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // AI state
  const [aiInput, setAiInput]       = useState("");
  const [aiResponse, setAiResponse] = useState<string|null>(null);
  const [aiLoading, setAiLoading]   = useState(false);
  const [aiHistory, setAiHistory]   = useState<any[]>([]);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const { show } = useToast();

  // Load all data
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s,f,h,r,i] = await Promise.all([
        superAdminApi.stats(),
        superAdminApi.listFeatures(),
        superAdminApi.listHospitals(),
        superAdminApi.listRequests({ status:"pending" }),
        superAdminApi.listInvoices(),
      ]);
      setStats(s);
      setFeatures(Array.isArray(f)?f:[]);
      setHospitals((h as any)?.data ?? (Array.isArray(h)?h:[]));
      setRequests(Array.isArray(r)?r:[]);
      setInvoices(Array.isArray(i)?i:[]);
      // Simulate chat users from hospital users
      setChatUsers([
        { id:"u-doctor",id2:"doctor@artic.health",name:"Dr. Grace Mukamana",role:"doctor",status:"online",hospital:"Kigali District Hospital",unread:2 },
        { id:"u-nurse",id2:"nurse@artic.health",name:"Nurse Eric Niyonsenga",role:"nurse",status:"online",hospital:"Kigali District Hospital",unread:0 },
        { id:"u-manager",id2:"manager@artic.health",name:"Jean Habimana",role:"hospital-manager",status:"away",hospital:"Kigali District Hospital",unread:1 },
        { id:"u-pharmacy",id2:"pharmacy@artic.health",name:"Diane Ingabire",role:"pharmacist",status:"offline",hospital:"Kigali District Hospital",unread:0 },
        { id:"u-lab",id2:"lab@artic.health",name:"Patrick Mugabo",role:"laboratory",status:"online",hospital:"Kigali District Hospital",unread:3 },
      ]);
    } catch (e:any) { show(e.message||"Failed to load","error"); }
    finally { setLoading(false); }
  }, [show]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [chatMessages]);

  // Handlers
  async function toggleFeature(f:any) {
    const ns = f.default_status === "active" ? "locked" : "active";
    try {
      await superAdminApi.updateFeature(f.id, { defaultStatus:ns });
      show(`"${f.label}" ${ns==="active"?"enabled":"disabled"}`, ns==="active"?"success":"warning");
      load();
    } catch { show("Failed","error"); }
  }

  async function saveFeature(f:any) {
    try {
      await superAdminApi.updateFeature(f.id, f);
      show("Feature saved","success");
      setEditingFeature(null);
      load();
    } catch { show("Failed to save","error"); }
  }

  async function resolveRequest(id:string, decision:"approved"|"denied") {
    try {
      await superAdminApi.resolveRequest(id, decision, `${decision} by system admin`);
      show(`Request ${decision}`, decision==="approved"?"success":"info");
      load();
    } catch { show("Failed","error"); }
  }

  async function setHospitalTier(hospitalId:string, tier:TierLevel) {
    try {
      await superAdminApi.setTierFeatures(hospitalId, tier);
      show(`Tier updated to ${TIER_LABELS[tier]}`,"success");
      load();
    } catch { show("Failed","error"); }
  }

  function sendMessage() {
    if (!messageInput.trim() || !selectedUser) return;
    const msg = { id:Date.now().toString(), from:"admin", text:messageInput, time:new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) };
    setChatMessages(prev => [...prev, msg]);
    setMessageInput("");
    // Simulate reply
    setTimeout(() => {
      setChatMessages(prev => [...prev, { id:(Date.now()+1).toString(), from:selectedUser.id, text:`Thank you for the message, System Admin.`, time:new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) }]);
    }, 1500);
  }

  async function askAI() {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    const q = aiInput;
    setAiInput("");
    setAiResponse(null);
    try {
      // Simulate AI response since backend not yet wired
      await new Promise(r => setTimeout(r, 1200));
      const response = `Based on your question about "${q}", here is what ARTIC AI recommends:\n\nThis is a system-level AI response. For clinical questions, please ensure appropriate medical review by qualified staff. The ARTIC Health Companion AI provides general guidance based on established medical protocols and Rwanda MOH guidelines.\n\nFor more specific guidance, consult the relevant clinical module or contact your medical director.`;
      setAiResponse(response);
      setAiHistory(prev => [{ id:Date.now().toString(), question:q, response, time:new Date().toLocaleString() }, ...prev.slice(0,19)]);
    } catch { show("AI query failed","error"); }
    finally { setAiLoading(false); }
  }

  // Filtered features
  const filteredFeatures = features.filter(f => {
    const ms = f.label?.toLowerCase().includes(search.toLowerCase()) || f.description?.toLowerCase().includes(search.toLowerCase());
    const mt = tierFilter==="all" || f.tier_required===tierFilter;
    const ms2 = statusFilter==="all" || f.default_status===statusFilter;
    return ms && mt && ms2;
  });

  const byCategory = filteredFeatures.reduce((acc:any,f) => {
    const c = f.category||"Other"; if(!acc[c]) acc[c]=[]; acc[c].push(f); return acc;
  }, {});

  const tabs = [
    { key:"dashboard",label:"Dashboard",    icon:LayoutDashboard },
    { key:"features", label:"Features",      icon:Settings },
    { key:"hospitals",label:"Hospitals",     icon:Building2 },
    { key:"requests", label:"Requests",      icon:Clock, badge:requests.length },
    { key:"chat",     label:"Chat System",   icon:MessageSquare },
    { key:"ai",       label:"AI Companion",  icon:Bot },
    { key:"billing",  label:"Billing",       icon:CreditCard },
    { key:"settings", label:"Settings",      icon:ShieldCheck },
  ];

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:14,padding:"4px 0" }}>
      {/* Portal links */}
      <div style={{ background:"linear-gradient(135deg,#1e293b,#334155)",borderRadius:12,padding:"14px 18px" }}>
        <div style={{ color:"#94a3b8",fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8,fontWeight:600 }}>🔗 Quick Access — All Portals</div>
        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
          {PORTAL_LINKS.map(p => (
            <a key={p.label} href={p.url} target="_blank" rel="noopener noreferrer"
              style={{ display:"flex",alignItems:"center",gap:5,padding:"5px 12px",background:"rgba(255,255,255,0.08)",borderRadius:7,color:"white",textDecoration:"none",fontSize:12,border:"1px solid rgba(255,255,255,0.12)" }}>
              <span>{p.icon}</span>{p.label}<ExternalLink size={10}/>
            </a>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex",gap:2,borderBottom:"2px solid #e5e7eb",overflowX:"auto" }}>
        {(tabs as any[]).map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={()=>setTab(t.key as Tab)}
              style={{ display:"flex",alignItems:"center",gap:5,padding:"9px 14px",border:"none",background:"none",cursor:"pointer",fontWeight:tab===t.key?700:400,color:tab===t.key?"#027c8e":"#6b7280",borderBottom:tab===t.key?"2px solid #027c8e":"2px solid transparent",whiteSpace:"nowrap",fontSize:13 }}>
              <Icon size={14}/>{t.label}
              {t.badge && t.badge>0 ? <span style={{ background:"#c23b22",color:"white",borderRadius:10,padding:"1px 5px",fontSize:10,fontWeight:700 }}>{t.badge}</span> : null}
            </button>
          );
        })}
        <button onClick={load} disabled={loading} style={{ marginLeft:"auto",border:"none",background:"none",cursor:"pointer",padding:"9px 12px",color:"#6b7280" }}>
          <RefreshCw size={14} style={loading?{animation:"spin 1s linear infinite"}:{}}/>
        </button>
      </div>

      {/* ── DASHBOARD ── */}
      {tab==="dashboard" && (
        <div style={{ display:"grid",gap:14 }}>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10 }}>
            {[
              { label:"Total Hospitals",  value:stats?.totalHospitals||0,   icon:"🏥",color:"#027c8e" },
              { label:"Active Users",     value:stats?.activeUsers||0,      icon:"👥",color:"#0f9f6e" },
              { label:"Total Patients",   value:stats?.totalPatients||0,    icon:"👤",color:"#5b5fc7" },
              { label:"Pending Requests", value:stats?.pendingRequests||0,  icon:"⏳",color:stats?.pendingRequests?"#c23b22":"#9ca3af" },
              { label:"Active Features",  value:stats?.activeFeatures||0,   icon:"⚙️",color:"#b7791f" },
              { label:"Appointments Today",value:stats?.todayAppointments||0,icon:"📅",color:"#027c8e" },
            ].map(k => (
              <div key={k.label} style={{ background:"white",border:`1px solid #e5e7eb`,borderLeft:`4px solid ${k.color}`,borderRadius:10,padding:"14px 16px" }}>
                <div style={{ fontSize:20,marginBottom:4 }}>{k.icon}</div>
                <div style={{ fontSize:24,fontWeight:700,color:k.color }}>{k.value}</div>
                <div style={{ fontSize:11,color:"#9ca3af",marginTop:2 }}>{k.label}</div>
              </div>
            ))}
          </div>

          {stats?.hospitalsByTier?.length>0 && (
            <section style={{ background:"white",border:"1px solid #e5e7eb",borderRadius:10,padding:14 }}>
              <h3 style={{ margin:"0 0 10px",fontSize:14,fontWeight:700 }}>Hospitals by Tier</h3>
              <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
                {stats.hospitalsByTier.map((t:any) => (
                  <div key={t.tier} style={{ padding:"6px 14px",background:(TIER_COLORS[t.tier as TierLevel]||"#9ca3af")+"15",border:`1px solid ${(TIER_COLORS[t.tier as TierLevel]||"#9ca3af")}40`,borderRadius:8,fontSize:13,color:TIER_COLORS[t.tier as TierLevel]||"#9ca3af",fontWeight:600 }}>
                    {TIER_LABELS[t.tier as TierLevel]||t.tier}: {t.count}
                  </div>
                ))}
              </div>
            </section>
          )}

          {requests.length>0 && (
            <section style={{ background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:10,padding:14 }}>
              <h3 style={{ margin:"0 0 10px",fontSize:14,fontWeight:700,color:"#b7791f" }}>⏳ {requests.length} Pending Request{requests.length>1?"s":""}</h3>
              {requests.slice(0,3).map((r:any) => (
                <div key={r.id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #fed7aa",fontSize:13,flexWrap:"wrap",gap:8 }}>
                  <span><strong>{r.feature_label}</strong> — {r.hospital_name} ({r.requested_by_name})</span>
                  <div style={{ display:"flex",gap:6 }}>
                    <button onClick={()=>resolveRequest(r.id,"approved")} style={{ display:"flex",alignItems:"center",gap:4,padding:"3px 10px",background:"#0f9f6e",color:"white",border:"none",borderRadius:5,cursor:"pointer",fontSize:12 }}><CheckCircle size={12}/> Approve</button>
                    <button onClick={()=>resolveRequest(r.id,"denied")} style={{ display:"flex",alignItems:"center",gap:4,padding:"3px 10px",background:"#c23b22",color:"white",border:"none",borderRadius:5,cursor:"pointer",fontSize:12 }}><XCircle size={12}/> Deny</button>
                  </div>
                </div>
              ))}
              {requests.length>3 && <button onClick={()=>setTab("requests")} style={{ marginTop:6,fontSize:12,color:"#b7791f",border:"none",background:"none",cursor:"pointer" }}>View all {requests.length} →</button>}
            </section>
          )}

          {/* Privacy notice */}
          <div style={{ padding:"10px 14px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,fontSize:12,color:"#166534",display:"flex",alignItems:"center",gap:6 }}>
            🔒 <strong>Privacy:</strong> This dashboard shows aggregated system statistics only. Individual patient clinical data is never accessible to Super Admin per Rwanda Data Protection Law (2021).
          </div>
        </div>
      )}

      {/* ── FEATURES TAB ── */}
      {tab==="features" && (
        <div style={{ display:"grid",gap:14 }}>
          {/* Filters */}
          <div style={{ display:"flex",gap:8,flexWrap:"wrap",alignItems:"center" }}>
            <div style={{ display:"flex",alignItems:"center",gap:6,background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:"6px 10px",flex:1,minWidth:200 }}>
              <Search size={14} style={{ color:"#9ca3af" }}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search features…" style={{ border:"none",outline:"none",fontSize:13,flex:1 }}/>
            </div>
            <select value={tierFilter} onChange={e=>setTierFilter(e.target.value)} style={{ padding:"6px 10px",borderRadius:8,border:"1px solid #e5e7eb",fontSize:13,background:"white" }}>
              <option value="all">All Tiers</option>
              {TIERS.map(t=><option key={t} value={t}>{TIER_LABELS[t]}</option>)}
            </select>
            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{ padding:"6px 10px",borderRadius:8,border:"1px solid #e5e7eb",fontSize:13,background:"white" }}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="locked">Locked</option>
              <option value="limited">Limited</option>
              <option value="beta">Beta</option>
              <option value="pending">Pending</option>
            </select>
            <span style={{ fontSize:12,color:"#9ca3af",whiteSpace:"nowrap" }}>{filteredFeatures.length} feature{filteredFeatures.length!==1?"s":""}</span>
          </div>

          {/* Feature categories */}
          {Object.entries(byCategory).map(([cat, feats]) => (
            <div key={cat} style={{ background:"white",border:"1px solid #e5e7eb",borderRadius:10,overflow:"hidden" }}>
              <button onClick={()=>setExpandedCat(expandedCat===cat?null:cat)} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"11px 14px",background:"#f8fafc",border:"none",cursor:"pointer",fontWeight:600,fontSize:13 }}>
                <span>{cat} <span style={{ color:"#9ca3af",fontWeight:400 }}>({(feats as any[]).length})</span></span>
                {expandedCat===cat ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
              </button>
              {expandedCat===cat && (feats as any[]).map((f:any) => (
                <div key={f.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderTop:"1px solid #f1f5f9",flexWrap:"wrap" }}>
                  <span style={{ fontSize:18,minWidth:24,textAlign:"center" }}>{f.icon||"⚙️"}</span>
                  <div style={{ flex:1,minWidth:180 }}>
                    <div style={{ fontWeight:600,fontSize:13 }}>{f.label}</div>
                    <div style={{ fontSize:11,color:"#9ca3af" }}>{f.description||f.name}</div>
                  </div>
                  <span style={{ padding:"2px 9px",borderRadius:12,fontSize:11,fontWeight:600,background:(TIER_COLORS[f.tier_required as TierLevel]||"#9ca3af")+"20",color:TIER_COLORS[f.tier_required as TierLevel]||"#9ca3af" }}>{TIER_LABELS[f.tier_required as TierLevel]||f.tier_required}</span>
                  <span style={{ padding:"2px 9px",borderRadius:12,fontSize:11,fontWeight:600,background:(STATUS_COLORS[f.default_status as FeatureStatus]||"#9ca3af")+"20",color:STATUS_COLORS[f.default_status as FeatureStatus]||"#9ca3af" }}>{STATUS_ICONS[f.default_status as FeatureStatus]} {STATUS_LABELS[f.default_status as FeatureStatus]||f.default_status}</span>
                  <div style={{ display:"flex",gap:5 }}>
                    <button onClick={()=>toggleFeature(f)} title={f.default_status==="active"?"Disable":"Enable"} style={{ display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:6,border:"1px solid #e5e7eb",cursor:"pointer",fontSize:12,background:f.default_status==="active"?"#fef3c7":"#dcfce7",color:f.default_status==="active"?"#b7791f":"#0f9f6e",fontWeight:600 }}>
                      {f.default_status==="active" ? <><ToggleRight size={13}/>Disable</> : <><ToggleLeft size={13}/>Enable</>}
                    </button>
                    <button onClick={()=>setEditingFeature({...f})} title="Edit feature" style={{ display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:6,border:"1px solid #e5e7eb",cursor:"pointer",fontSize:12,background:"white",color:"#374151" }}>
                      <Edit size={12}/>Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
          {filteredFeatures.length===0 && <div style={{ textAlign:"center",padding:40,color:"#9ca3af",fontSize:14 }}>No features match your filters.</div>}
        </div>
      )}

      {/* ── HOSPITALS TAB ── */}
      {tab==="hospitals" && (
        <div style={{ display:"grid",gap:12 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8 }}>
            <h3 style={{ margin:0,fontSize:16,fontWeight:700 }}>🏥 Hospitals ({hospitals.length})</h3>
            <button onClick={()=>show("Hospital creation form — coming soon","info")} style={{ display:"flex",alignItems:"center",gap:5,padding:"7px 14px",background:"#027c8e",color:"white",borderRadius:8,border:"none",cursor:"pointer",fontSize:13 }}>
              <Plus size={14}/>Add Hospital
            </button>
          </div>
          {hospitals.map((h:any) => (
            <div key={h.id} style={{ background:"white",border:"1px solid #e5e7eb",borderRadius:10,padding:"14px 16px" }}>
              <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:10 }}>
                <div>
                  <div style={{ fontWeight:700,fontSize:14 }}>{h.name}</div>
                  <div style={{ fontSize:12,color:"#9ca3af",marginTop:2 }}>{h.email||"No email"} · {h.phone||"No phone"} · {h.type||"district"}</div>
                  <div style={{ fontSize:12,color:"#6b7280",marginTop:3 }}>
                    <span style={{ marginRight:10 }}>👥 {h.active_users||0} users</span>
                    <span>⚙️ {h.active_features||0} active features</span>
                  </div>
                </div>
                <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6 }}>
                  <span style={{ padding:"3px 10px",borderRadius:12,fontSize:12,fontWeight:600,background:(TIER_COLORS[h.tier as TierLevel]||"#9ca3af")+"20",color:TIER_COLORS[h.tier as TierLevel]||"#9ca3af" }}>
                    {TIER_LABELS[h.tier as TierLevel]||h.tier||"No tier"}
                  </span>
                  <span style={{ fontSize:11,color:h.sub_status==="active"?"#0f9f6e":"#c23b22",fontWeight:600 }}>
                    {h.sub_status==="active"?"● Active":"● Inactive"}
                  </span>
                </div>
              </div>
              <div style={{ marginTop:10,display:"flex",gap:5,flexWrap:"wrap" }}>
                <span style={{ fontSize:11,color:"#9ca3af",alignSelf:"center",marginRight:4 }}>Set tier:</span>
                {TIERS.map(t=>(
                  <button key={t} onClick={()=>setHospitalTier(h.id,t)} style={{ padding:"3px 10px",borderRadius:6,fontSize:11,fontWeight:600,border:`1px solid ${TIER_COLORS[t]}`,background:h.tier===t?TIER_COLORS[t]:"white",color:h.tier===t?"white":TIER_COLORS[t],cursor:"pointer" }}>
                    {TIER_LABELS[t]}
                  </button>
                ))}
                <button onClick={()=>show("View hospital details — coming soon","info")} style={{ marginLeft:"auto",display:"flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:6,border:"1px solid #e5e7eb",background:"white",cursor:"pointer",fontSize:11,color:"#374151" }}>
                  <Eye size={11}/>View
                </button>
              </div>
            </div>
          ))}
          {hospitals.length===0 && (
            <div style={{ textAlign:"center",padding:40,color:"#9ca3af" }}>
              <Building2 size={40} style={{ margin:"0 auto 10px",display:"block",color:"#d1d5db" }}/>
              <div style={{ fontSize:14 }}>No hospitals registered yet.</div>
              <button onClick={()=>show("Hospital creation form — coming soon","info")} style={{ marginTop:10,padding:"7px 16px",background:"#027c8e",color:"white",borderRadius:8,border:"none",cursor:"pointer",fontSize:13 }}>Add First Hospital</button>
            </div>
          )}
        </div>
      )}

      {/* ── REQUESTS TAB ── */}
      {tab==="requests" && (
        <div style={{ display:"grid",gap:12 }}>
          <h3 style={{ margin:0,fontSize:16,fontWeight:700 }}>⏳ Feature Access Requests</h3>
          {requests.length===0 && (
            <div style={{ textAlign:"center",padding:40,color:"#9ca3af" }}>
              <CheckCircle size={40} style={{ margin:"0 auto 10px",display:"block",color:"#d1d5db" }}/>
              <div style={{ fontSize:14 }}>No pending requests — all clear!</div>
            </div>
          )}
          {requests.map((r:any) => (
            <div key={r.id} style={{ background:"white",border:"1px solid #e5e7eb",borderRadius:10,padding:"14px 16px" }}>
              <div style={{ display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,alignItems:"flex-start" }}>
                <div>
                  <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}>
                    <span style={{ fontSize:16 }}>{r.icon||"⚙️"}</span>
                    <span style={{ fontWeight:700,fontSize:14 }}>{r.feature_label}</span>
                    <span style={{ padding:"2px 8px",borderRadius:12,fontSize:11,background:"#fff7ed",color:"#b7791f",border:"1px solid #fed7aa",fontWeight:600 }}>Pending</span>
                  </div>
                  <div style={{ fontSize:12,color:"#6b7280",marginTop:4 }}>
                    🏥 <strong>{r.hospital_name}</strong> · Requested by <strong>{r.requested_by_name}</strong> ({r.job_title||r.role})
                  </div>
                  {r.reason && <div style={{ fontSize:12,color:"#374151",marginTop:5,background:"#f8fafc",borderRadius:6,padding:"6px 8px",borderLeft:"3px solid #027c8e" }}>💬 "{r.reason}"</div>}
                  <div style={{ fontSize:11,color:"#9ca3af",marginTop:4 }}>{new Date(r.created_at).toLocaleString()}</div>
                </div>
                <div style={{ display:"flex",gap:8 }}>
                  <button onClick={()=>resolveRequest(r.id,"approved")} style={{ display:"flex",alignItems:"center",gap:5,padding:"7px 16px",background:"#0f9f6e",color:"white",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:600 }}>
                    <CheckCircle size={14}/>Approve
                  </button>
                  <button onClick={()=>resolveRequest(r.id,"denied")} style={{ display:"flex",alignItems:"center",gap:5,padding:"7px 16px",background:"#c23b22",color:"white",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:600 }}>
                    <XCircle size={14}/>Deny
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CHAT TAB ── */}
      {tab==="chat" && (
        <div style={{ display:"flex",gap:0,height:520,border:"1px solid #e5e7eb",borderRadius:12,overflow:"hidden",background:"white" }}>
          {/* Sidebar */}
          <div style={{ width:260,borderRight:"1px solid #e5e7eb",display:"flex",flexDirection:"column",flexShrink:0 }}>
            <div style={{ padding:"10px 12px",borderBottom:"1px solid #f1f5f9" }}>
              <div style={{ display:"flex",alignItems:"center",gap:6,background:"#f8fafc",borderRadius:8,padding:"6px 10px" }}>
                <Search size={13} style={{ color:"#9ca3af" }}/>
                <input value={chatSearch} onChange={e=>setChatSearch(e.target.value)} placeholder="Search users…" style={{ border:"none",outline:"none",fontSize:12,flex:1,background:"transparent" }}/>
              </div>
            </div>
            <div style={{ flex:1,overflowY:"auto" }}>
              {chatUsers.filter(u=>u.name.toLowerCase().includes(chatSearch.toLowerCase())).map((u:any) => (
                <div key={u.id} onClick={()=>{setSelectedUser(u);setChatMessages([{ id:"welcome",from:u.id,text:`Hi Admin! How can I help you today?`,time:"now" }]);}} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",cursor:"pointer",background:selectedUser?.id===u.id?"#f0fdfa":"white",borderBottom:"1px solid #f9fafb" }}>
                  <div style={{ position:"relative" }}>
                    <div style={{ width:36,height:36,borderRadius:"50%",background:u.status==="online"?"#dcfce7":u.status==="away"?"#fef3c7":"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#374151" }}>
                      {u.name.split(" ").map((n:string)=>n[0]).join("").slice(0,2)}
                    </div>
                    <div style={{ position:"absolute",bottom:0,right:0,width:10,height:10,borderRadius:"50%",border:"2px solid white",background:u.status==="online"?"#22c55e":u.status==="away"?"#f59e0b":"#d1d5db" }}/>
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{u.name}</div>
                    <div style={{ fontSize:10,color:"#9ca3af",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{u.role} · {u.hospital}</div>
                  </div>
                  {u.unread>0 && <span style={{ background:"#027c8e",color:"white",borderRadius:10,padding:"1px 6px",fontSize:10,fontWeight:700,flexShrink:0 }}>{u.unread}</span>}
                </div>
              ))}
            </div>
          </div>
          {/* Message area */}
          {selectedUser ? (
            <div style={{ flex:1,display:"flex",flexDirection:"column" }}>
              <div style={{ padding:"10px 16px",borderBottom:"1px solid #e5e7eb",display:"flex",alignItems:"center",gap:10,background:"#fafafa" }}>
                <div style={{ width:34,height:34,borderRadius:"50%",background:"#dcfce7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#374151" }}>
                  {selectedUser.name.split(" ").map((n:string)=>n[0]).join("").slice(0,2)}
                </div>
                <div>
                  <div style={{ fontSize:13,fontWeight:700 }}>{selectedUser.name}</div>
                  <div style={{ fontSize:11,color:"#9ca3af" }}>{selectedUser.role} · {selectedUser.status}</div>
                </div>
                <div style={{ marginLeft:"auto",display:"flex",gap:8 }}>
                  <button style={{ padding:"5px 8px",borderRadius:6,border:"1px solid #e5e7eb",background:"white",cursor:"pointer" }}><Phone size={13} style={{ color:"#6b7280" }}/></button>
                  <button style={{ padding:"5px 8px",borderRadius:6,border:"1px solid #e5e7eb",background:"white",cursor:"pointer" }}><Video size={13} style={{ color:"#6b7280" }}/></button>
                  <button style={{ padding:"5px 8px",borderRadius:6,border:"1px solid #e5e7eb",background:"white",cursor:"pointer" }}><MoreVertical size={13} style={{ color:"#6b7280" }}/></button>
                </div>
              </div>
              <div style={{ flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:10 }}>
                {chatMessages.map((m:any) => (
                  <div key={m.id} style={{ display:"flex",flexDirection:m.from==="admin"?"row-reverse":"row",gap:8,alignItems:"flex-end" }}>
                    {m.from!=="admin" && <div style={{ width:28,height:28,borderRadius:"50%",background:"#e0f2fe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0 }}>{selectedUser.name[0]}</div>}
                    <div style={{ maxWidth:"70%",background:m.from==="admin"?"#027c8e":"#f1f5f9",color:m.from==="admin"?"white":"#374151",borderRadius:m.from==="admin"?"12px 12px 0 12px":"12px 12px 12px 0",padding:"8px 12px",fontSize:13 }}>
                      {m.text}
                      <div style={{ fontSize:10,opacity:0.6,marginTop:3,textAlign:"right" }}>{m.time}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef}/>
              </div>
              <div style={{ padding:"10px 12px",borderTop:"1px solid #e5e7eb",display:"flex",gap:8,alignItems:"center" }}>
                <button style={{ padding:"7px 8px",borderRadius:8,border:"1px solid #e5e7eb",background:"white",cursor:"pointer" }}><Smile size={14} style={{ color:"#9ca3af" }}/></button>
                <button style={{ padding:"7px 8px",borderRadius:8,border:"1px solid #e5e7eb",background:"white",cursor:"pointer" }}><Paperclip size={14} style={{ color:"#9ca3af" }}/></button>
                <input value={messageInput} onChange={e=>setMessageInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMessage()} placeholder="Type a message…" style={{ flex:1,padding:"8px 12px",borderRadius:8,border:"1px solid #e5e7eb",fontSize:13,outline:"none" }}/>
                <button onClick={sendMessage} style={{ padding:"8px 12px",background:"#027c8e",color:"white",borderRadius:8,border:"none",cursor:"pointer" }}><Send size={14}/></button>
              </div>
            </div>
          ) : (
            <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10,color:"#9ca3af" }}>
              <MessageSquare size={48} style={{ color:"#d1d5db" }}/>
              <div style={{ fontSize:14 }}>Select a user to start chatting</div>
            </div>
          )}
        </div>
      )}

      {/* ── AI COMPANION TAB ── */}
      {tab==="ai" && (
        <div style={{ display:"grid",gap:14 }}>
          <div style={{ background:"linear-gradient(135deg,#1e293b,#0f172a)",borderRadius:12,padding:"20px 22px",color:"white" }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
              <Bot size={24} style={{ color:"#38bdf8" }}/>
              <div>
                <div style={{ fontWeight:700,fontSize:16 }}>ARTIC AI Health Companion</div>
                <div style={{ fontSize:12,color:"#94a3b8" }}>Powered by clinical knowledge & Rwanda MOH protocols</div>
              </div>
            </div>
            <div style={{ fontSize:12,color:"#64748b",background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"8px 12px",border:"1px solid rgba(255,255,255,0.08)" }}>
              ⚠️ AI responses are for informational guidance only. Clinical decisions must be made by qualified medical professionals.
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div style={{ fontSize:12,fontWeight:600,color:"#6b7280",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em" }}>Quick Actions</div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:8 }}>
              {AI_QUICK_ACTIONS.map(a=>(
                <button key={a.label} onClick={()=>{setSelectedAction(a);setAiInput(a.prompt);}} style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:"white",border:`2px solid ${selectedAction?.label===a.label?"#027c8e":"#e5e7eb"}`,borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:500,color:selectedAction?.label===a.label?"#027c8e":"#374151",textAlign:"left" }}>
                  <span style={{ fontSize:18 }}>{a.icon}</span>{a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input area */}
          <div style={{ background:"white",border:"1px solid #e5e7eb",borderRadius:10,overflow:"hidden" }}>
            <textarea value={aiInput} onChange={e=>setAiInput(e.target.value)} placeholder="Ask the AI anything about clinical guidance, health education, system management…" rows={4} style={{ width:"100%",padding:"14px 16px",border:"none",outline:"none",fontSize:13,resize:"none",fontFamily:"inherit",boxSizing:"border-box" }}/>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderTop:"1px solid #f1f5f9",background:"#fafafa" }}>
              <span style={{ fontSize:12,color:"#9ca3af" }}>{aiInput.length} chars</span>
              <button onClick={askAI} disabled={aiLoading||!aiInput.trim()} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 18px",background:aiLoading||!aiInput.trim()?"#e5e7eb":"#027c8e",color:aiLoading||!aiInput.trim()?"#9ca3af":"white",borderRadius:8,border:"none",cursor:aiLoading||!aiInput.trim()?"not-allowed":"pointer",fontSize:13,fontWeight:600 }}>
                {aiLoading ? <><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }}/>Thinking…</> : <><Bot size={14}/>Ask AI</>}
              </button>
            </div>
          </div>

          {/* AI Response */}
          {aiResponse && (
            <div style={{ background:"#f0fdfa",border:"1px solid #99f6e4",borderRadius:10,padding:"14px 16px" }}>
              <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:8,fontWeight:700,fontSize:13,color:"#027c8e" }}>
                <Bot size={16}/>AI Response
              </div>
              <div style={{ fontSize:13,color:"#374151",lineHeight:1.7,whiteSpace:"pre-wrap" }}>{aiResponse}</div>
              <div style={{ display:"flex",gap:8,marginTop:10 }}>
                <button onClick={()=>show("Response copied","success")} style={{ display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:6,border:"1px solid #99f6e4",background:"white",cursor:"pointer",fontSize:12,color:"#027c8e" }}>
                  <FileText size={12}/>Copy
                </button>
                <button onClick={()=>show("Helpful feedback recorded","success")} style={{ display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:6,border:"1px solid #99f6e4",background:"white",cursor:"pointer",fontSize:12,color:"#0f9f6e" }}>
                  <ThumbsUp size={12}/>Helpful
                </button>
                <button onClick={()=>show("Feedback recorded — we'll improve","info")} style={{ display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:6,border:"1px solid #fecaca",background:"white",cursor:"pointer",fontSize:12,color:"#c23b22" }}>
                  <ThumbsDown size={12}/>Not Helpful
                </button>
              </div>
            </div>
          )}

          {/* History */}
          {aiHistory.length>0 && (
            <div style={{ background:"white",border:"1px solid #e5e7eb",borderRadius:10,padding:"14px 16px" }}>
              <div style={{ fontWeight:700,fontSize:13,marginBottom:10 }}>📜 Query History</div>
              <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                {aiHistory.map((h:any)=>(
                  <div key={h.id} style={{ padding:"8px 10px",background:"#f8fafc",borderRadius:8,borderLeft:"3px solid #027c8e",cursor:"pointer" }} onClick={()=>{setAiInput(h.question);setAiResponse(h.response);}}>
                    <div style={{ fontSize:12,fontWeight:600,color:"#374151",marginBottom:2 }}>{h.question.slice(0,80)}{h.question.length>80?"…":""}</div>
                    <div style={{ fontSize:11,color:"#9ca3af" }}>{h.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── BILLING TAB ── */}
      {tab==="billing" && (
        <div style={{ display:"grid",gap:14 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8 }}>
            <h3 style={{ margin:0,fontSize:16,fontWeight:700 }}>💳 Subscription Billing</h3>
            <button onClick={()=>show("Invoice creation — coming soon","info")} style={{ display:"flex",alignItems:"center",gap:5,padding:"7px 14px",background:"#027c8e",color:"white",borderRadius:8,border:"none",cursor:"pointer",fontSize:13 }}>
              <Plus size={14}/>Create Invoice
            </button>
          </div>

          {/* Summary cards */}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10 }}>
            {[
              { label:"Total Invoices",  value:invoices.length,       icon:"📄",color:"#027c8e" },
              { label:"Paid",            value:invoices.filter((i:any)=>i.status==="paid").length,    icon:"✅",color:"#0f9f6e" },
              { label:"Pending",         value:invoices.filter((i:any)=>i.status==="pending").length, icon:"⏳",color:"#b7791f" },
              { label:"Overdue",         value:invoices.filter((i:any)=>i.status==="overdue").length, icon:"🚨",color:"#c23b22" },
            ].map(k=>(
              <div key={k.label} style={{ background:"white",border:`1px solid #e5e7eb`,borderLeft:`4px solid ${k.color}`,borderRadius:10,padding:"12px 14px" }}>
                <div style={{ fontSize:18,marginBottom:3 }}>{k.icon}</div>
                <div style={{ fontSize:22,fontWeight:700,color:k.color }}>{k.value}</div>
                <div style={{ fontSize:11,color:"#9ca3af" }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Invoices table */}
          <div style={{ background:"white",border:"1px solid #e5e7eb",borderRadius:10,overflow:"hidden" }}>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                <thead>
                  <tr style={{ background:"#f8fafc",borderBottom:"1px solid #e5e7eb" }}>
                    {["Invoice","Hospital","Tier","Amount","Period","Status",""].map(h=>(
                      <th key={h} style={{ padding:"9px 12px",textAlign:"left",fontWeight:600,fontSize:12,color:"#6b7280",whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv:any)=>(
                    <tr key={inv.id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                      <td style={{ padding:"9px 12px",fontWeight:600,color:"#027c8e" }}>{inv.invoice_ref}</td>
                      <td style={{ padding:"9px 12px" }}>{inv.hospital_name}</td>
                      <td style={{ padding:"9px 12px" }}><span style={{ padding:"2px 8px",borderRadius:12,fontSize:11,background:(TIER_COLORS[inv.tier as TierLevel]||"#9ca3af")+"20",color:TIER_COLORS[inv.tier as TierLevel]||"#9ca3af",fontWeight:600 }}>{TIER_LABELS[inv.tier as TierLevel]||inv.tier||"—"}</span></td>
                      <td style={{ padding:"9px 12px",fontWeight:600 }}>{inv.currency||"USD"} {Number(inv.amount||0).toLocaleString()}</td>
                      <td style={{ padding:"9px 12px",fontSize:12,color:"#9ca3af" }}>{inv.period_start||"—"}</td>
                      <td style={{ padding:"9px 12px" }}>
                        <span style={{ padding:"2px 9px",borderRadius:12,fontSize:11,fontWeight:600,background:inv.status==="paid"?"#dcfce7":inv.status==="overdue"?"#fee2e2":"#fef3c7",color:inv.status==="paid"?"#0f9f6e":inv.status==="overdue"?"#c23b22":"#b7791f" }}>
                          {inv.status||"pending"}
                        </span>
                      </td>
                      <td style={{ padding:"9px 12px" }}>
                        <button onClick={()=>show("Invoice actions — coming soon","info")} style={{ padding:"3px 8px",borderRadius:6,border:"1px solid #e5e7eb",background:"white",cursor:"pointer",fontSize:11 }}>
                          <Eye size={11}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {invoices.length===0 && (
                    <tr><td colSpan={7} style={{ padding:30,textAlign:"center",color:"#9ca3af",fontSize:13 }}>No invoices yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── SETTINGS TAB ── */}
      {tab==="settings" && (
        <div style={{ display:"grid",gap:14 }}>
          <h3 style={{ margin:0,fontSize:16,fontWeight:700 }}>⚙️ System Settings</h3>

          {/* Tier Configurations */}
          <div style={{ background:"white",border:"1px solid #e5e7eb",borderRadius:10,padding:"16px" }}>
            <div style={{ fontWeight:700,fontSize:14,marginBottom:12 }}>📊 Subscription Tier Configurations</div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10 }}>
              {TIERS.map(t=>(
                <div key={t} style={{ border:`2px solid ${TIER_COLORS[t]}30`,borderRadius:10,padding:"14px",background:`${TIER_COLORS[t]}08` }}>
                  <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:8 }}>
                    <div style={{ width:10,height:10,borderRadius:"50%",background:TIER_COLORS[t] }}/>
                    <span style={{ fontWeight:700,fontSize:13,color:TIER_COLORS[t] }}>{TIER_LABELS[t]}</span>
                  </div>
                  <div style={{ fontSize:12,color:"#6b7280",lineHeight:1.8 }}>
                    <div>Price: {t==="trial"?"Free":t==="basic"?"$50/mo":t==="premium"?"$120/mo":t==="pro"?"$250/mo":"Custom"}</div>
                    <div>Users: {t==="trial"?"3":t==="basic"?"10":t==="premium"?"30":t==="pro"?"100":"Unlimited"}</div>
                    <div>Support: {t==="trial"?"Email":t==="basic"?"Email":t==="premium"?"Priority":t==="pro"?"24/7":"Dedicated"}</div>
                  </div>
                  <button onClick={()=>show(`Edit ${TIER_LABELS[t]} tier — coming soon`,"info")} style={{ marginTop:8,padding:"4px 10px",borderRadius:6,border:`1px solid ${TIER_COLORS[t]}40`,background:"white",cursor:"pointer",fontSize:11,color:TIER_COLORS[t],fontWeight:600,width:"100%" }}>
                    Edit Tier
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* System Settings */}
          <div style={{ background:"white",border:"1px solid #e5e7eb",borderRadius:10,padding:"16px" }}>
            <div style={{ fontWeight:700,fontSize:14,marginBottom:12 }}>🔧 System Configuration</div>
            <div style={{ display:"grid",gap:10 }}>
              {[
                { key:"system_name",     label:"System Name",           value:"ARTIC HMS", type:"text" },
                { key:"support_email",   label:"Support Email",         value:"support@artic.health", type:"email" },
                { key:"default_currency",label:"Default Currency",      value:"USD", type:"text" },
                { key:"trial_duration",  label:"Trial Duration (days)", value:"14", type:"number" },
                { key:"moh_country",     label:"MOH Country",           value:"Rwanda", type:"text" },
              ].map(s=>(
                <div key={s.key} style={{ display:"flex",alignItems:"center",gap:12,flexWrap:"wrap" }}>
                  <label style={{ fontSize:13,fontWeight:600,color:"#374151",minWidth:200 }}>{s.label}</label>
                  <input defaultValue={s.value} type={s.type} style={{ padding:"7px 10px",borderRadius:7,border:"1px solid #e5e7eb",fontSize:13,flex:1,minWidth:150,outline:"none" }}/>
                </div>
              ))}
              <div style={{ display:"flex",justifyContent:"flex-end",marginTop:6 }}>
                <button onClick={()=>show("Settings saved","success")} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 18px",background:"#027c8e",color:"white",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:600 }}>
                  <Save size={14}/>Save Settings
                </button>
              </div>
            </div>
          </div>

          {/* Privacy & Compliance */}
          <div style={{ background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"14px 16px" }}>
            <div style={{ fontWeight:700,fontSize:14,marginBottom:8,color:"#166534" }}>🔒 Privacy & Compliance</div>
            <div style={{ fontSize:13,color:"#166534",lineHeight:1.7 }}>
              <div>✅ Rwanda Data Protection Law (2021) — Compliant</div>
              <div>✅ Super Admin cannot access individual patient clinical data</div>
              <div>✅ All stats shown are aggregated counts only</div>
              <div>✅ Full audit trail enabled for all admin actions</div>
              <div>✅ Hospital data isolated per tenant</div>
            </div>
          </div>

          {/* Danger Zone */}
          <div style={{ background:"#fff5f5",border:"1px solid #fecaca",borderRadius:10,padding:"14px 16px" }}>
            <div style={{ fontWeight:700,fontSize:14,marginBottom:8,color:"#c23b22",display:"flex",alignItems:"center",gap:6 }}>
              <AlertTriangle size={16}/>Danger Zone
            </div>
            <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
              <button onClick={()=>show("This action requires additional confirmation","warning")} style={{ padding:"7px 14px",borderRadius:8,border:"1px solid #fecaca",background:"white",cursor:"pointer",fontSize:13,color:"#c23b22",fontWeight:600 }}>
                🗑️ Clear All Demo Data
              </button>
              <button onClick={()=>show("System backup initiated","info")} style={{ padding:"7px 14px",borderRadius:8,border:"1px solid #fecaca",background:"white",cursor:"pointer",fontSize:13,color:"#c23b22",fontWeight:600 }}>
                💾 Force Backup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT FEATURE MODAL ── */}
      {editingFeature && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:"white",borderRadius:14,padding:"22px 24px",width:"100%",maxWidth:540,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
              <div style={{ fontWeight:700,fontSize:16 }}>{editingFeature.icon||"⚙️"} Edit Feature: {editingFeature.label}</div>
              <button onClick={()=>setEditingFeature(null)} style={{ border:"none",background:"none",cursor:"pointer",padding:4 }}><X size={18}/></button>
            </div>
            <div style={{ display:"grid",gap:12 }}>
              {[
                { key:"label",        label:"Display Label",  type:"text" },
                { key:"description",  label:"Description",    type:"text" },
                { key:"access_message",label:"Locked Message",type:"text" },
              ].map(f=>(
                <div key={f.key}>
                  <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>{f.label}</label>
                  <input value={editingFeature[f.key]||""} onChange={e=>setEditingFeature({...editingFeature,[f.key]:e.target.value})} type={f.type} style={{ width:"100%",padding:"8px 10px",borderRadius:7,border:"1px solid #e5e7eb",fontSize:13,outline:"none",boxSizing:"border-box" }}/>
                </div>
              ))}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                <div>
                  <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Status</label>
                  <select value={editingFeature.default_status||"active"} onChange={e=>setEditingFeature({...editingFeature,default_status:e.target.value})} style={{ width:"100%",padding:"8px 10px",borderRadius:7,border:"1px solid #e5e7eb",fontSize:13,outline:"none" }}>
                    <option value="active">Active</option>
                    <option value="locked">Locked</option>
                    <option value="limited">Limited</option>
                    <option value="beta">Beta</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Required Tier</label>
                  <select value={editingFeature.tier_required||"basic"} onChange={e=>setEditingFeature({...editingFeature,tier_required:e.target.value})} style={{ width:"100%",padding:"8px 10px",borderRadius:7,border:"1px solid #e5e7eb",fontSize:13,outline:"none" }}>
                    {TIERS.map(t=><option key={t} value={t}>{TIER_LABELS[t]}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <input type="checkbox" id="req-approval" checked={!!editingFeature.requires_approval} onChange={e=>setEditingFeature({...editingFeature,requires_approval:e.target.checked})} style={{ width:16,height:16,cursor:"pointer" }}/>
                <label htmlFor="req-approval" style={{ fontSize:13,color:"#374151",cursor:"pointer" }}>Requires Admin Approval to access</label>
              </div>
            </div>
            <div style={{ display:"flex",gap:10,justifyContent:"flex-end",marginTop:18 }}>
              <button onClick={()=>setEditingFeature(null)} style={{ padding:"8px 18px",borderRadius:8,border:"1px solid #e5e7eb",background:"white",cursor:"pointer",fontSize:13,color:"#374151" }}>Cancel</button>
              <button onClick={()=>saveFeature(editingFeature)} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 20px",background:"#027c8e",color:"white",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:600 }}>
                <Save size={14}/>Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
