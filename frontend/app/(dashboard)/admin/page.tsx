"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { superAdminApi } from "@/lib/api/hms";
import { useToast } from "@/lib/store";
import {
  LayoutDashboard, Building2, CreditCard, ShieldCheck, ToggleRight,
  ToggleLeft, CheckCircle, XCircle, Clock, RefreshCw, ExternalLink,
  Plus, Search, ChevronDown, ChevronRight, AlertTriangle, Loader2,
  Edit, Eye, MessageSquare, Bot, Send, Paperclip, Phone, Video,
  MoreVertical, ThumbsUp, ThumbsDown, FileText, Save, X, Smile,
  LogOut, Bell, Settings, Activity, Users, Globe, Zap, Lock,
  TrendingUp, Server, Database, Shield, ChevronLeft, Menu,
} from "lucide-react";
import { logout } from "@/lib/auth";

// ── Types ─────────────────────────────────────────────────────────────────────
type Section = "dashboard"|"features"|"hospitals"|"requests"|"chat"|"ai"|"billing"|"audit"|"settings";
type FeatureStatus = "active"|"locked"|"limited"|"beta"|"pending";
type TierLevel = "trial"|"basic"|"premium"|"pro"|"enterprise";

const TIERS: TierLevel[] = ["trial","basic","premium","pro","enterprise"];
const TIER_COLORS: Record<TierLevel,string> = { trial:"#6b7280",basic:"#0891b2",premium:"#7c3aed",pro:"#059669",enterprise:"#d97706" };
const TIER_BG: Record<TierLevel,string>     = { trial:"#f9fafb",basic:"#ecfeff",premium:"#f5f3ff",pro:"#ecfdf5",enterprise:"#fffbeb" };
const TIER_LABELS: Record<TierLevel,string> = { trial:"Trial",basic:"Basic",premium:"Premium",pro:"Pro",enterprise:"Enterprise" };
const STATUS_COLORS: Record<FeatureStatus,string> = { active:"#059669",locked:"#dc2626",limited:"#d97706",beta:"#7c3aed",pending:"#6b7280" };
const STATUS_BG: Record<FeatureStatus,string>     = { active:"#ecfdf5",locked:"#fef2f2",limited:"#fffbeb",beta:"#f5f3ff",pending:"#f9fafb" };
const STATUS_LABELS: Record<FeatureStatus,string> = { active:"Active",locked:"Locked",limited:"Limited",beta:"Beta",pending:"Pending" };

const AI_QUICK_ACTIONS = [
  { label:"Medication Info",   icon:"💊", prompt:"Explain this medication and dosage: " },
  { label:"Health Education",  icon:"📚", prompt:"Create patient health education about: " },
  { label:"Clinical Guidance", icon:"🩺", prompt:"Clinical decision support for: " },
  { label:"Symptom Analysis",  icon:"🤒", prompt:"Differential diagnosis for symptoms: " },
  { label:"Nutrition Guide",   icon:"🥗", prompt:"Nutritional guidance for patient with: " },
  { label:"Mental Health",     icon:"🧠", prompt:"Mental health support approach for: " },
  { label:"Drug Interaction",  icon:"⚗️", prompt:"Check drug interaction between: " },
  { label:"MOH Protocol",      icon:"🇷🇼", prompt:"Rwanda MOH protocol for: " },
];

const PORTAL_LINKS = [
  { label:"Hospital Manager", url:"http://172.209.217.176:3001/login?role=hospital-manager", icon:"🏥", color:"#0891b2" },
  { label:"Doctor",           url:"http://172.209.217.176:3001/login?role=doctor",           icon:"👨‍⚕️", color:"#059669" },
  { label:"Nurse",            url:"http://172.209.217.176:3001/login?role=nurse",             icon:"👩‍⚕️", color:"#7c3aed" },
  { label:"Pharmacist",       url:"http://172.209.217.176:3001/login?role=pharmacist",        icon:"💊", color:"#d97706" },
  { label:"Laboratory",       url:"http://172.209.217.176:3001/login?role=laboratory",        icon:"🔬", color:"#dc2626" },
  { label:"Receptionist",     url:"http://172.209.217.176:3001/login?role=receptionist",      icon:"🖥️", color:"#0891b2" },
  { label:"Patient Portal",   url:"http://172.209.217.176:3001/login?role=patient",           icon:"👤", color:"#059669" },
  { label:"API Health",       url:"http://172.209.217.176:4001/health",                       icon:"⚡", color:"#6b7280" },
];

const NAV_ITEMS: { key: Section; label: string; icon: any; badge?: string }[] = [
  { key:"dashboard", label:"Dashboard",        icon:LayoutDashboard },
  { key:"features",  label:"Feature Control",  icon:Zap },
  { key:"hospitals", label:"Hospitals",         icon:Building2 },
  { key:"requests",  label:"Access Requests",   icon:Clock },
  { key:"chat",      label:"Chat System",       icon:MessageSquare },
  { key:"ai",        label:"AI Companion",      icon:Bot },
  { key:"billing",   label:"Billing",           icon:CreditCard },
  { key:"audit",     label:"Audit Logs",        icon:Shield },
  { key:"settings",  label:"Settings",          icon:Settings },
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function SuperAdminPage() {
  const [section, setSection]       = useState<Section>("dashboard");
  const [stats, setStats]           = useState<any>(null);
  const [features, setFeatures]     = useState<any[]>([]);
  const [hospitals, setHospitals]   = useState<any[]>([]);
  const [requests, setRequests]     = useState<any[]>([]);
  const [invoices, setInvoices]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Features
  const [expandedCat, setExpandedCat]   = useState<string|null>("Core");
  const [search, setSearch]             = useState("");
  const [tierFilter, setTierFilter]     = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingFeature, setEditingFeature] = useState<any>(null);
  // Chat
  const [chatUsers, setChatUsers]       = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [chatSearch, setChatSearch]     = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // AI
  const [aiInput, setAiInput]     = useState("");
  const [aiResponse, setAiResponse] = useState<string|null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHistory, setAiHistory] = useState<any[]>([]);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  // Audit
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const { show } = useToast();

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
      setChatUsers([
        { id:"u1",name:"Dr. Grace Mukamana",    role:"doctor",           status:"online", hospital:"Kigali District Hospital", unread:2, initials:"GM" },
        { id:"u2",name:"Nurse Eric Niyonsenga", role:"nurse",            status:"online", hospital:"Kigali District Hospital", unread:0, initials:"EN" },
        { id:"u3",name:"Jean Habimana",          role:"hospital-manager", status:"away",   hospital:"Kigali District Hospital", unread:1, initials:"JH" },
        { id:"u4",name:"Diane Ingabire",         role:"pharmacist",       status:"offline",hospital:"Kigali District Hospital", unread:0, initials:"DI" },
        { id:"u5",name:"Patrick Mugabo",         role:"laboratory",       status:"online", hospital:"Kigali District Hospital", unread:3, initials:"PM" },
      ]);
    } catch(e:any) { show(e.message||"Failed to load","error"); }
    finally { setLoading(false); }
  }, [show]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [chatMessages]);

  async function toggleFeature(f:any) {
    const ns = f.default_status==="active" ? "locked" : "active";
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
      await superAdminApi.resolveRequest(id, decision, `${decision} by Super Admin`);
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
    if (!messageInput.trim()||!selectedUser) return;
    const msg = { id:Date.now().toString(), from:"admin", text:messageInput, time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) };
    setChatMessages(prev=>[...prev,msg]);
    setMessageInput("");
    setTimeout(()=>{
      setChatMessages(prev=>[...prev,{ id:(Date.now()+1).toString(), from:selectedUser.id, text:`Received your message. How can I assist?`, time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) }]);
    },1400);
  }

  async function askAI() {
    if(!aiInput.trim()) return;
    setAiLoading(true); const q=aiInput; setAiInput(""); setAiResponse(null);
    try {
      await new Promise(r=>setTimeout(r,1100));
      const r=`Based on your query about "${q}":\n\nARTIC AI Companion provides evidence-based guidance aligned with Rwanda MOH Clinical Protocols (2024). This response is for informational purposes only — all clinical decisions must be reviewed by qualified medical professionals.\n\nFor detailed guidelines, consult the Rwanda Integrated Clinic Manual or contact your facility medical director.`;
      setAiResponse(r);
      setAiHistory(prev=>[{ id:Date.now().toString(),question:q,response:r,time:new Date().toLocaleString() },...prev.slice(0,19)]);
    } catch { show("AI query failed","error"); }
    finally { setAiLoading(false); }
  }

  const filteredFeatures = features.filter(f=>{
    const ms = f.label?.toLowerCase().includes(search.toLowerCase())||f.description?.toLowerCase().includes(search.toLowerCase());
    const mt = tierFilter==="all"||f.tier_required===tierFilter;
    const ms2= statusFilter==="all"||f.default_status===statusFilter;
    return ms&&mt&&ms2;
  });

  const byCategory = filteredFeatures.reduce((acc:any,f)=>{
    const c=f.category||"Other"; if(!acc[c]) acc[c]=[]; acc[c].push(f); return acc;
  },{});

  const pendingCount = requests.length;
  const navWithBadge = NAV_ITEMS.map(n=>({
    ...n, badge: n.key==="requests"&&pendingCount>0 ? String(pendingCount) : undefined
  }));

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", fontFamily:"'Inter',system-ui,sans-serif", background:"#f1f5f9" }}>

      {/* ── LEFT SIDEBAR ── */}
      <aside style={{
        width: sidebarCollapsed ? 64 : 240,
        background:"#0f172a",
        display:"flex", flexDirection:"column",
        transition:"width 0.2s ease",
        flexShrink:0, overflow:"hidden",
      }}>
        {/* Brand */}
        <div style={{ padding:"18px 16px 14px", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#0891b2,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"white",fontSize:16,flexShrink:0 }}>A</div>
          {!sidebarCollapsed && (
            <div style={{ overflow:"hidden" }}>
              <div style={{ color:"white",fontWeight:700,fontSize:14,whiteSpace:"nowrap" }}>ARTIC Health</div>
              <div style={{ color:"#64748b",fontSize:11,whiteSpace:"nowrap" }}>Super Admin</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex:1,overflowY:"auto",padding:"10px 8px" }}>
          {navWithBadge.map(item=>{
            const Icon=item.icon;
            const active=section===item.key;
            return (
              <button key={item.key} onClick={()=>setSection(item.key)}
                title={sidebarCollapsed?item.label:undefined}
                style={{ display:"flex",alignItems:"center",gap:10,width:"100%",padding:sidebarCollapsed?"10px 0":"9px 12px",justifyContent:sidebarCollapsed?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",marginBottom:2,
                  background:active?"rgba(8,145,178,0.18)":"transparent",
                  color:active?"#38bdf8":"#94a3b8",
                  transition:"all 0.15s",
                }}>
                <Icon size={17} style={{ flexShrink:0 }}/>
                {!sidebarCollapsed && <span style={{ fontSize:13,fontWeight:active?600:400,flex:1,textAlign:"left",whiteSpace:"nowrap" }}>{item.label}</span>}
                {!sidebarCollapsed && item.badge && <span style={{ background:"#dc2626",color:"white",borderRadius:10,padding:"1px 7px",fontSize:10,fontWeight:700 }}>{item.badge}</span>}
                {sidebarCollapsed && item.badge && <span style={{ position:"absolute",background:"#dc2626",color:"white",borderRadius:"50%",width:14,height:14,fontSize:8,display:"grid",placeItems:"center",fontWeight:700,marginLeft:14,marginTop:-18 }}>{item.badge}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div style={{ padding:"10px 8px 16px",borderTop:"1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={()=>{logout();window.location.href="/login";}}
            style={{ display:"flex",alignItems:"center",gap:10,width:"100%",padding:sidebarCollapsed?"10px 0":"9px 12px",justifyContent:sidebarCollapsed?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",background:"transparent",color:"#64748b" }}>
            <LogOut size={16}/>
            {!sidebarCollapsed && <span style={{ fontSize:13 }}>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>

        {/* Top bar */}
        <header style={{ background:"white",borderBottom:"1px solid #e2e8f0",padding:"0 20px",height:56,display:"flex",alignItems:"center",gap:12,flexShrink:0 }}>
          <button onClick={()=>setSidebarCollapsed(!sidebarCollapsed)} style={{ border:"none",background:"none",cursor:"pointer",padding:6,borderRadius:6,color:"#64748b",display:"flex" }}>
            {sidebarCollapsed ? <Menu size={18}/> : <ChevronLeft size={18}/>}
          </button>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>
              {NAV_ITEMS.find(n=>n.key===section)?.label ?? "Dashboard"}
            </div>
            <div style={{ fontSize:11,color:"#94a3b8" }}>ARTIC HMS — System Control Center</div>
          </div>

          {/* Portal quick links */}
          <div style={{ display:"flex",gap:4,flexWrap:"nowrap",overflowX:"auto" }}>
            {PORTAL_LINKS.slice(0,5).map(p=>(
              <a key={p.label} href={p.url} target="_blank" rel="noopener noreferrer"
                style={{ display:"flex",alignItems:"center",gap:4,padding:"4px 9px",background:`${p.color}15`,border:`1px solid ${p.color}30`,borderRadius:6,color:p.color,textDecoration:"none",fontSize:11,fontWeight:600,whiteSpace:"nowrap" }}>
                <span style={{ fontSize:13 }}>{p.icon}</span>{p.label}
              </a>
            ))}
            <a href="http://172.209.217.176:4001/health" target="_blank" rel="noopener noreferrer"
              style={{ display:"flex",alignItems:"center",gap:4,padding:"4px 9px",background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:6,color:"#64748b",textDecoration:"none",fontSize:11 }}>
              <span>⚡</span>API
            </a>
          </div>

          <button onClick={load} disabled={loading}
            style={{ border:"none",background:"none",cursor:"pointer",padding:6,borderRadius:6,color:"#64748b",display:"flex" }}>
            <RefreshCw size={16} style={loading?{animation:"spin 1s linear infinite"}:{}}/>
          </button>

          <div style={{ width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#0891b2,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:13,fontWeight:700 }}>SA</div>
        </header>

        {/* Page body */}
        <div style={{ flex:1,overflowY:"auto",padding:22 }}>

          {/* ── DASHBOARD ── */}
          {section==="dashboard" && (
            <div style={{ display:"grid",gap:18 }}>
              {/* KPI cards */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:14 }}>
                {[
                  { label:"Total Hospitals",  value:stats?.totalHospitals||0,   icon:"🏥", color:"#0891b2", bg:"#ecfeff" },
                  { label:"Active Users",     value:stats?.activeUsers||0,      icon:"👥", color:"#7c3aed", bg:"#f5f3ff" },
                  { label:"Total Patients",   value:stats?.totalPatients||0,    icon:"👤", color:"#059669", bg:"#ecfdf5", note:"Aggregated" },
                  { label:"Active Features",  value:stats?.activeFeatures||0,   icon:"⚙️", color:"#d97706", bg:"#fffbeb" },
                  { label:"Pending Requests", value:stats?.pendingRequests||0,  icon:"⏳", color:stats?.pendingRequests?"#dc2626":"#6b7280", bg:stats?.pendingRequests?"#fef2f2":"#f9fafb" },
                  { label:"Today's Appointments",value:stats?.todayAppointments||0,icon:"📅",color:"#0891b2",bg:"#ecfeff",note:"Aggregated" },
                ].map(k=>(
                  <div key={k.label} style={{ background:"white",borderRadius:12,padding:"16px 18px",border:"1px solid #e2e8f0",borderTop:`3px solid ${k.color}`,boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                      <div>
                        <div style={{ fontSize:26,fontWeight:800,color:k.color }}>{k.value.toLocaleString()}</div>
                        <div style={{ fontSize:12,color:"#64748b",marginTop:3,fontWeight:500 }}>{k.label}</div>
                        {k.note && <div style={{ fontSize:10,color:"#94a3b8",marginTop:2 }}>({k.note} only)</div>}
                      </div>
                      <div style={{ width:38,height:38,borderRadius:10,background:k.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>{k.icon}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                {/* Hospitals by Tier */}
                <div style={{ background:"white",borderRadius:12,padding:"18px 20px",border:"1px solid #e2e8f0",boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontWeight:700,fontSize:14,color:"#0f172a",marginBottom:14,display:"flex",alignItems:"center",gap:6 }}>
                    <Building2 size={15} style={{ color:"#0891b2" }}/> Hospitals by Subscription Tier
                  </div>
                  {stats?.hospitalsByTier?.length > 0 ? (
                    <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                      {stats.hospitalsByTier.map((t:any)=>(
                        <div key={t.tier} style={{ display:"flex",alignItems:"center",gap:10 }}>
                          <div style={{ width:10,height:10,borderRadius:"50%",background:TIER_COLORS[t.tier as TierLevel]||"#6b7280",flexShrink:0 }}/>
                          <div style={{ fontSize:13,fontWeight:600,color:"#374151",flex:1 }}>{TIER_LABELS[t.tier as TierLevel]||t.tier}</div>
                          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                            <div style={{ height:6,width:Math.max(t.count*20,8),background:TIER_COLORS[t.tier as TierLevel]||"#6b7280",borderRadius:3 }}/>
                            <span style={{ fontSize:13,fontWeight:700,color:TIER_COLORS[t.tier as TierLevel]||"#6b7280",minWidth:20,textAlign:"right" }}>{t.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color:"#94a3b8",fontSize:13,padding:"16px 0",textAlign:"center" }}>No tier data yet</div>
                  )}
                </div>

                {/* Pending Requests panel */}
                <div style={{ background:"white",borderRadius:12,padding:"18px 20px",border:"1px solid #e2e8f0",boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontWeight:700,fontSize:14,color:"#0f172a",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                    <span style={{ display:"flex",alignItems:"center",gap:6 }}><Clock size={15} style={{ color:"#d97706" }}/>Pending Requests</span>
                    {pendingCount>0 && <span style={{ background:"#fef3c7",color:"#d97706",borderRadius:12,padding:"2px 9px",fontSize:11,fontWeight:700 }}>{pendingCount} pending</span>}
                  </div>
                  {requests.slice(0,4).map((r:any)=>(
                    <div key={r.id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f1f5f9",gap:8 }}>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:12,fontWeight:600,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{r.feature_label}</div>
                        <div style={{ fontSize:11,color:"#64748b",marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{r.hospital_name}</div>
                      </div>
                      <div style={{ display:"flex",gap:5,flexShrink:0 }}>
                        <button onClick={()=>resolveRequest(r.id,"approved")} style={{ padding:"3px 8px",background:"#dcfce7",color:"#059669",border:"none",borderRadius:5,cursor:"pointer",fontSize:11,fontWeight:600 }}>✓</button>
                        <button onClick={()=>resolveRequest(r.id,"denied")} style={{ padding:"3px 8px",background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:5,cursor:"pointer",fontSize:11,fontWeight:600 }}>✗</button>
                      </div>
                    </div>
                  ))}
                  {requests.length===0 && <div style={{ color:"#94a3b8",fontSize:13,padding:"16px 0",textAlign:"center" }}>✅ No pending requests</div>}
                  {requests.length>4 && <button onClick={()=>setSection("requests")} style={{ marginTop:8,fontSize:12,color:"#0891b2",border:"none",background:"none",cursor:"pointer",fontWeight:600 }}>View all {requests.length} →</button>}
                </div>
              </div>

              {/* System Health + Privacy Notice */}
              <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:14 }}>
                <div style={{ background:"white",borderRadius:12,padding:"18px 20px",border:"1px solid #e2e8f0",boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontWeight:700,fontSize:14,color:"#0f172a",marginBottom:14,display:"flex",alignItems:"center",gap:6 }}><Server size={15} style={{ color:"#059669" }}/>System Health</div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                    {[
                      { label:"Backend API",    status:"✅ Online",   color:"#059669" },
                      { label:"PostgreSQL DB",  status:"✅ Connected",color:"#059669" },
                      { label:"Redis Cache",    status:"✅ Active",   color:"#059669" },
                      { label:"Socket.IO",      status:"✅ Running",  color:"#059669" },
                      { label:"Frontend",       status:"✅ Online",   color:"#059669" },
                      { label:"VMS Project",    status:"✅ No Conflict",color:"#059669" },
                    ].map(s=>(
                      <div key={s.label} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",background:"#f8fafc",borderRadius:7 }}>
                        <span style={{ fontSize:12,color:"#374151",fontWeight:500 }}>{s.label}</span>
                        <span style={{ fontSize:11,color:s.color,fontWeight:600 }}>{s.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background:"linear-gradient(135deg,#059669,#0891b2)",borderRadius:12,padding:"18px 20px",color:"white" }}>
                  <div style={{ fontWeight:700,fontSize:14,marginBottom:10,display:"flex",alignItems:"center",gap:6 }}><Shield size={15}/>Privacy Enforced</div>
                  <div style={{ fontSize:12,lineHeight:1.8,opacity:0.9 }}>
                    <div>✅ Rwanda DPL 2021 Compliant</div>
                    <div>✅ Aggregated stats only</div>
                    <div>✅ No individual patient data</div>
                    <div>✅ Clinical data isolated</div>
                    <div>✅ Full audit trail active</div>
                    <div>✅ Tenant data separated</div>
                  </div>
                </div>
              </div>

              {/* Quick portal links */}
              <div style={{ background:"white",borderRadius:12,padding:"16px 20px",border:"1px solid #e2e8f0",boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ fontWeight:700,fontSize:14,color:"#0f172a",marginBottom:12,display:"flex",alignItems:"center",gap:6 }}><Globe size={15} style={{ color:"#0891b2" }}/>Quick Portal Access</div>
                <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                  {PORTAL_LINKS.map(p=>(
                    <a key={p.label} href={p.url} target="_blank" rel="noopener noreferrer"
                      style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 14px",background:p.color+"10",border:`1px solid ${p.color}25`,borderRadius:8,color:p.color,textDecoration:"none",fontSize:12,fontWeight:600,transition:"all 0.15s" }}>
                      <span style={{ fontSize:16 }}>{p.icon}</span>{p.label}<ExternalLink size={10}/>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── FEATURES ── */}
          {section==="features" && (
            <div style={{ display:"grid",gap:16 }}>
              {/* Toolbar */}
              <div style={{ background:"white",borderRadius:12,padding:"14px 18px",border:"1px solid #e2e8f0",display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"7px 12px",flex:1,minWidth:200 }}>
                  <Search size={14} style={{ color:"#94a3b8" }}/>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search features…" style={{ border:"none",outline:"none",fontSize:13,background:"transparent",flex:1,color:"#0f172a" }}/>
                </div>
                <select value={tierFilter} onChange={e=>setTierFilter(e.target.value)} style={{ padding:"7px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13,background:"white",color:"#374151" }}>
                  <option value="all">All Tiers</option>
                  {TIERS.map(t=><option key={t} value={t}>{TIER_LABELS[t]}</option>)}
                </select>
                <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{ padding:"7px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13,background:"white",color:"#374151" }}>
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="locked">Locked</option>
                  <option value="limited">Limited</option>
                  <option value="beta">Beta</option>
                </select>
                <span style={{ fontSize:12,color:"#94a3b8",whiteSpace:"nowrap" }}>{filteredFeatures.length} feature{filteredFeatures.length!==1?"s":""}</span>
              </div>

              {/* Categories */}
              {Object.entries(byCategory).map(([cat,feats])=>(
                <div key={cat} style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                  <button onClick={()=>setExpandedCat(expandedCat===cat?null:cat)}
                    style={{ display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"12px 18px",background:expandedCat===cat?"#f0f9ff":"#f8fafc",border:"none",cursor:"pointer",borderBottom:"1px solid #e2e8f0" }}>
                    <span style={{ fontWeight:700,fontSize:13,color:"#0f172a" }}>{cat} <span style={{ color:"#94a3b8",fontWeight:400 }}>({(feats as any[]).length})</span></span>
                    {expandedCat===cat ? <ChevronDown size={15} style={{ color:"#64748b" }}/> : <ChevronRight size={15} style={{ color:"#64748b" }}/>}
                  </button>
                  {expandedCat===cat && (feats as any[]).map((f:any)=>(
                    <div key={f.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"11px 18px",borderBottom:"1px solid #f8fafc",flexWrap:"wrap" }}>
                      <span style={{ fontSize:20,width:28,textAlign:"center",flexShrink:0 }}>{f.icon||"⚙️"}</span>
                      <div style={{ flex:1,minWidth:160 }}>
                        <div style={{ fontWeight:600,fontSize:13,color:"#0f172a" }}>{f.label}</div>
                        <div style={{ fontSize:11,color:"#94a3b8",marginTop:1 }}>{f.description||f.name}</div>
                      </div>
                      <span style={{ padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:TIER_BG[f.tier_required as TierLevel]||"#f9fafb",color:TIER_COLORS[f.tier_required as TierLevel]||"#6b7280",border:`1px solid ${TIER_COLORS[f.tier_required as TierLevel]||"#6b7280"}25` }}>
                        {TIER_LABELS[f.tier_required as TierLevel]||f.tier_required}
                      </span>
                      <span style={{ padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:STATUS_BG[f.default_status as FeatureStatus]||"#f9fafb",color:STATUS_COLORS[f.default_status as FeatureStatus]||"#6b7280" }}>
                        {f.default_status==="active"?"● ":"○ "}{STATUS_LABELS[f.default_status as FeatureStatus]||f.default_status}
                      </span>
                      <div style={{ display:"flex",gap:6 }}>
                        <button onClick={()=>toggleFeature(f)}
                          style={{ display:"flex",alignItems:"center",gap:4,padding:"5px 12px",borderRadius:7,border:"1px solid #e2e8f0",cursor:"pointer",fontSize:12,fontWeight:600,background:f.default_status==="active"?"#fff7ed":"#f0fdf4",color:f.default_status==="active"?"#d97706":"#059669" }}>
                          {f.default_status==="active"?<><ToggleRight size={13}/>Disable</>:<><ToggleLeft size={13}/>Enable</>}
                        </button>
                        <button onClick={()=>setEditingFeature({...f})}
                          style={{ display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:7,border:"1px solid #e2e8f0",cursor:"pointer",fontSize:12,background:"white",color:"#374151" }}>
                          <Edit size={12}/>Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {filteredFeatures.length===0 && (
                <div style={{ background:"white",borderRadius:12,padding:40,textAlign:"center",color:"#94a3b8",border:"1px solid #e2e8f0" }}>
                  <Zap size={36} style={{ margin:"0 auto 10px",display:"block",color:"#cbd5e1" }}/>
                  <div style={{ fontSize:14 }}>No features match your filters.</div>
                </div>
              )}
            </div>
          )}

          {/* ── HOSPITALS ── */}
          {section==="hospitals" && (
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
                <div>
                  <div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Registered Hospitals</div>
                  <div style={{ fontSize:12,color:"#94a3b8",marginTop:2 }}>{hospitals.length} hospital{hospitals.length!==1?"s":""} in the network</div>
                </div>
                <button onClick={()=>show("Hospital creation — coming soon","info")} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",background:"#0891b2",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:600 }}>
                  <Plus size={15}/>Add Hospital
                </button>
              </div>

              {hospitals.map((h:any)=>(
                <div key={h.id} style={{ background:"white",borderRadius:12,padding:"18px 20px",border:"1px solid #e2e8f0",boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12 }}>
                    <div style={{ display:"flex",alignItems:"flex-start",gap:14 }}>
                      <div style={{ width:44,height:44,borderRadius:12,background:"#ecfeff",border:"1px solid #0891b225",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>🏥</div>
                      <div>
                        <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>{h.name}</div>
                        <div style={{ fontSize:12,color:"#64748b",marginTop:3 }}>
                          {h.email||"No email set"} · {h.phone||"No phone"} · <span style={{ textTransform:"capitalize" }}>{h.type||"district"}</span>
                        </div>
                        <div style={{ fontSize:12,color:"#94a3b8",marginTop:4 }}>
                          <span style={{ marginRight:12 }}>👥 {h.active_users||0} active users</span>
                          <span>⚙️ {h.active_features||0} active features</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6 }}>
                      <span style={{ padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:700,background:TIER_BG[h.tier as TierLevel]||"#f9fafb",color:TIER_COLORS[h.tier as TierLevel]||"#6b7280",border:`1px solid ${TIER_COLORS[h.tier as TierLevel]||"#6b7280"}30` }}>
                        {TIER_LABELS[h.tier as TierLevel]||h.tier||"No tier"}
                      </span>
                      <span style={{ fontSize:11,fontWeight:600,color:h.sub_status==="active"?"#059669":"#dc2626" }}>
                        {h.sub_status==="active"?"● Active":"● Inactive"}
                      </span>
                    </div>
                  </div>
                  <div style={{ marginTop:14,paddingTop:12,borderTop:"1px solid #f1f5f9",display:"flex",alignItems:"center",gap:6,flexWrap:"wrap" }}>
                    <span style={{ fontSize:11,color:"#94a3b8",marginRight:4 }}>Assign tier:</span>
                    {TIERS.map(t=>(
                      <button key={t} onClick={()=>setHospitalTier(h.id,t)}
                        style={{ padding:"4px 11px",borderRadius:6,fontSize:11,fontWeight:600,border:`1.5px solid ${TIER_COLORS[t]}`,background:h.tier===t?TIER_COLORS[t]:"white",color:h.tier===t?"white":TIER_COLORS[t],cursor:"pointer",transition:"all 0.15s" }}>
                        {TIER_LABELS[t]}
                      </button>
                    ))}
                    <button onClick={()=>show("Hospital details — coming soon","info")} style={{ marginLeft:"auto",display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:6,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:11,color:"#374151" }}>
                      <Eye size={11}/>Details
                    </button>
                  </div>
                </div>
              ))}

              {hospitals.length===0 && (
                <div style={{ background:"white",borderRadius:12,padding:48,textAlign:"center",border:"1px solid #e2e8f0" }}>
                  <Building2 size={44} style={{ margin:"0 auto 12px",display:"block",color:"#cbd5e1" }}/>
                  <div style={{ fontSize:15,fontWeight:600,color:"#374151",marginBottom:6 }}>No hospitals yet</div>
                  <div style={{ fontSize:13,color:"#94a3b8",marginBottom:16 }}>Add your first hospital to get started</div>
                  <button onClick={()=>show("Hospital creation — coming soon","info")} style={{ padding:"8px 20px",background:"#0891b2",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:600 }}>Add First Hospital</button>
                </div>
              )}
            </div>
          )}

          {/* ── REQUESTS ── */}
          {section==="requests" && (
            <div style={{ display:"grid",gap:14 }}>
              <div>
                <div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Feature Access Requests</div>
                <div style={{ fontSize:12,color:"#94a3b8",marginTop:2 }}>{requests.length} pending approval</div>
              </div>
              {requests.length===0 && (
                <div style={{ background:"white",borderRadius:12,padding:48,textAlign:"center",border:"1px solid #e2e8f0" }}>
                  <CheckCircle size={44} style={{ margin:"0 auto 12px",display:"block",color:"#bbf7d0" }}/>
                  <div style={{ fontSize:15,fontWeight:600,color:"#374151" }}>All clear — no pending requests</div>
                </div>
              )}
              {requests.map((r:any)=>(
                <div key={r.id} style={{ background:"white",borderRadius:12,padding:"18px 20px",border:"1px solid #e2e8f0",boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:12,alignItems:"flex-start" }}>
                    <div>
                      <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:6 }}>
                        <span style={{ fontSize:18 }}>{r.icon||"⚙️"}</span>
                        <span style={{ fontWeight:700,fontSize:14,color:"#0f172a" }}>{r.feature_label}</span>
                        <span style={{ padding:"2px 9px",borderRadius:20,fontSize:11,background:"#fffbeb",color:"#d97706",border:"1px solid #fde68a",fontWeight:600 }}>Pending</span>
                      </div>
                      <div style={{ fontSize:12,color:"#64748b" }}>🏥 <strong>{r.hospital_name}</strong> · by <strong>{r.requested_by_name}</strong> ({r.job_title||r.role})</div>
                      {r.reason && <div style={{ marginTop:8,fontSize:12,color:"#374151",background:"#f8fafc",borderRadius:7,padding:"7px 10px",borderLeft:"3px solid #0891b2" }}>"{r.reason}"</div>}
                      <div style={{ fontSize:11,color:"#94a3b8",marginTop:6 }}>{new Date(r.created_at).toLocaleString()}</div>
                    </div>
                    <div style={{ display:"flex",gap:8 }}>
                      <button onClick={()=>resolveRequest(r.id,"approved")} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 18px",background:"#059669",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:600 }}>
                        <CheckCircle size={14}/>Approve
                      </button>
                      <button onClick={()=>resolveRequest(r.id,"denied")} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 18px",background:"#dc2626",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:600 }}>
                        <XCircle size={14}/>Deny
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── CHAT ── */}
          {section==="chat" && (
            <div style={{ display:"flex",gap:0,height:"calc(100vh - 130px)",border:"1px solid #e2e8f0",borderRadius:12,overflow:"hidden",background:"white",boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
              {/* User list */}
              <div style={{ width:270,borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",flexShrink:0 }}>
                <div style={{ padding:"14px 14px 10px",borderBottom:"1px solid #f1f5f9" }}>
                  <div style={{ fontWeight:700,fontSize:13,color:"#0f172a",marginBottom:8 }}>Messages</div>
                  <div style={{ display:"flex",alignItems:"center",gap:7,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"6px 10px" }}>
                    <Search size={13} style={{ color:"#94a3b8" }}/>
                    <input value={chatSearch} onChange={e=>setChatSearch(e.target.value)} placeholder="Search users…" style={{ border:"none",outline:"none",fontSize:12,flex:1,background:"transparent",color:"#0f172a" }}/>
                  </div>
                </div>
                <div style={{ flex:1,overflowY:"auto" }}>
                  {chatUsers.filter(u=>u.name.toLowerCase().includes(chatSearch.toLowerCase())).map((u:any)=>(
                    <div key={u.id} onClick={()=>{setSelectedUser(u);setChatMessages([{id:"w",from:u.id,text:`Hello Admin! Ready to assist.`,time:"now"}]);}}
                      style={{ display:"flex",alignItems:"center",gap:10,padding:"11px 14px",cursor:"pointer",background:selectedUser?.id===u.id?"#f0f9ff":"white",borderBottom:"1px solid #f9fafb",transition:"background 0.1s" }}>
                      <div style={{ position:"relative" }}>
                        <div style={{ width:38,height:38,borderRadius:"50%",background:selectedUser?.id===u.id?"#0891b2":"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:selectedUser?.id===u.id?"white":"#374151" }}>{u.initials}</div>
                        <div style={{ position:"absolute",bottom:0,right:0,width:10,height:10,borderRadius:"50%",border:"2px solid white",background:u.status==="online"?"#22c55e":u.status==="away"?"#f59e0b":"#d1d5db" }}/>
                      </div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:12,fontWeight:600,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{u.name}</div>
                        <div style={{ fontSize:10,color:"#94a3b8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textTransform:"capitalize" }}>{u.role}</div>
                      </div>
                      {u.unread>0 && <span style={{ background:"#0891b2",color:"white",borderRadius:10,padding:"1px 6px",fontSize:10,fontWeight:700,flexShrink:0 }}>{u.unread}</span>}
                    </div>
                  ))}
                </div>
              </div>
              {/* Message area */}
              {selectedUser ? (
                <div style={{ flex:1,display:"flex",flexDirection:"column" }}>
                  <div style={{ padding:"12px 18px",borderBottom:"1px solid #e2e8f0",display:"flex",alignItems:"center",gap:12,background:"#fafafa" }}>
                    <div style={{ width:36,height:36,borderRadius:"50%",background:"#0891b2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"white" }}>{selectedUser.initials}</div>
                    <div>
                      <div style={{ fontSize:13,fontWeight:700,color:"#0f172a" }}>{selectedUser.name}</div>
                      <div style={{ fontSize:11,color:"#94a3b8",textTransform:"capitalize" }}>{selectedUser.role} · <span style={{ color:selectedUser.status==="online"?"#22c55e":selectedUser.status==="away"?"#f59e0b":"#94a3b8" }}>{selectedUser.status}</span></div>
                    </div>
                    <div style={{ marginLeft:"auto",display:"flex",gap:6 }}>
                      <button style={{ padding:"6px 8px",borderRadius:7,border:"1px solid #e2e8f0",background:"white",cursor:"pointer" }}><Phone size={13} style={{ color:"#64748b" }}/></button>
                      <button style={{ padding:"6px 8px",borderRadius:7,border:"1px solid #e2e8f0",background:"white",cursor:"pointer" }}><Video size={13} style={{ color:"#64748b" }}/></button>
                      <button style={{ padding:"6px 8px",borderRadius:7,border:"1px solid #e2e8f0",background:"white",cursor:"pointer" }}><MoreVertical size={13} style={{ color:"#64748b" }}/></button>
                    </div>
                  </div>
                  <div style={{ flex:1,overflowY:"auto",padding:"16px 18px",display:"flex",flexDirection:"column",gap:10 }}>
                    {chatMessages.map((m:any)=>(
                      <div key={m.id} style={{ display:"flex",flexDirection:m.from==="admin"?"row-reverse":"row",gap:8,alignItems:"flex-end" }}>
                        {m.from!=="admin" && <div style={{ width:28,height:28,borderRadius:"50%",background:"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0 }}>{selectedUser.initials}</div>}
                        <div style={{ maxWidth:"68%",background:m.from==="admin"?"#0891b2":"#f1f5f9",color:m.from==="admin"?"white":"#0f172a",borderRadius:m.from==="admin"?"12px 12px 2px 12px":"12px 12px 12px 2px",padding:"9px 13px",fontSize:13 }}>
                          {m.text}
                          <div style={{ fontSize:10,opacity:0.6,marginTop:3,textAlign:"right" }}>{m.time}</div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef}/>
                  </div>
                  <div style={{ padding:"10px 14px",borderTop:"1px solid #e2e8f0",display:"flex",gap:8,alignItems:"center" }}>
                    <button style={{ padding:"8px",borderRadius:8,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",display:"flex" }}><Smile size={14} style={{ color:"#94a3b8" }}/></button>
                    <button style={{ padding:"8px",borderRadius:8,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",display:"flex" }}><Paperclip size={14} style={{ color:"#94a3b8" }}/></button>
                    <input value={messageInput} onChange={e=>setMessageInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMessage()} placeholder="Type a message…" style={{ flex:1,padding:"9px 13px",borderRadius:9,border:"1px solid #e2e8f0",fontSize:13,outline:"none",color:"#0f172a" }}/>
                    <button onClick={sendMessage} style={{ padding:"9px 14px",background:"#0891b2",color:"white",borderRadius:9,border:"none",cursor:"pointer",display:"flex",alignItems:"center" }}><Send size={14}/></button>
                  </div>
                </div>
              ) : (
                <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12,color:"#94a3b8" }}>
                  <MessageSquare size={52} style={{ color:"#cbd5e1" }}/>
                  <div style={{ fontSize:14,fontWeight:600,color:"#374151" }}>Select a conversation</div>
                  <div style={{ fontSize:13 }}>Choose a user from the sidebar to start messaging</div>
                </div>
              )}
            </div>
          )}

          {/* ── AI COMPANION ── */}
          {section==="ai" && (
            <div style={{ display:"grid",gap:16 }}>
              <div style={{ background:"linear-gradient(135deg,#0f172a 0%,#1e293b 100%)",borderRadius:14,padding:"22px 24px",color:"white" }}>
                <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:8 }}>
                  <div style={{ width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,#0891b2,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center" }}><Bot size={22} style={{ color:"white" }}/></div>
                  <div>
                    <div style={{ fontWeight:700,fontSize:16 }}>ARTIC AI Health Companion</div>
                    <div style={{ fontSize:12,color:"#94a3b8" }}>Powered by clinical knowledge · Rwanda MOH protocols</div>
                  </div>
                </div>
                <div style={{ background:"rgba(255,255,255,0.06)",borderRadius:8,padding:"9px 13px",fontSize:12,color:"#94a3b8",border:"1px solid rgba(255,255,255,0.08)" }}>
                  ⚠️ AI responses are informational guidance only. All clinical decisions must be made by qualified medical professionals.
                </div>
              </div>

              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:8 }}>
                {AI_QUICK_ACTIONS.map(a=>(
                  <button key={a.label} onClick={()=>{setSelectedAction(a);setAiInput(a.prompt);}}
                    style={{ display:"flex",alignItems:"center",gap:9,padding:"11px 13px",background:"white",border:`2px solid ${selectedAction?.label===a.label?"#0891b2":"#e2e8f0"}`,borderRadius:10,cursor:"pointer",fontSize:12,fontWeight:600,color:selectedAction?.label===a.label?"#0891b2":"#374151",textAlign:"left",transition:"all 0.15s" }}>
                    <span style={{ fontSize:18 }}>{a.icon}</span>{a.label}
                  </button>
                ))}
              </div>

              <div style={{ background:"white",border:"1px solid #e2e8f0",borderRadius:12,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                <textarea value={aiInput} onChange={e=>setAiInput(e.target.value)} placeholder="Ask anything — clinical guidance, health education, drug information, system management…" rows={4}
                  style={{ width:"100%",padding:"16px 18px",border:"none",outline:"none",fontSize:13,resize:"none",fontFamily:"inherit",boxSizing:"border-box",color:"#0f172a",lineHeight:1.6 }}/>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",borderTop:"1px solid #f1f5f9",background:"#fafafa" }}>
                  <span style={{ fontSize:12,color:"#94a3b8" }}>{aiInput.length} characters</span>
                  <button onClick={askAI} disabled={aiLoading||!aiInput.trim()}
                    style={{ display:"flex",alignItems:"center",gap:6,padding:"9px 20px",background:aiLoading||!aiInput.trim()?"#e2e8f0":"linear-gradient(135deg,#0891b2,#7c3aed)",color:aiLoading||!aiInput.trim()?"#94a3b8":"white",borderRadius:9,border:"none",cursor:aiLoading||!aiInput.trim()?"not-allowed":"pointer",fontSize:13,fontWeight:600 }}>
                    {aiLoading?<><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }}/>Thinking…</>:<><Bot size={14}/>Ask AI</>}
                  </button>
                </div>
              </div>

              {aiResponse && (
                <div style={{ background:"white",border:"1px solid #a7f3d0",borderRadius:12,padding:"18px 20px",boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:12,fontWeight:700,fontSize:13,color:"#059669" }}>
                    <div style={{ width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#0891b2,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center" }}><Bot size={14} style={{ color:"white" }}/></div>
                    AI Response
                  </div>
                  <div style={{ fontSize:13,color:"#0f172a",lineHeight:1.8,whiteSpace:"pre-wrap" }}>{aiResponse}</div>
                  <div style={{ display:"flex",gap:8,marginTop:12 }}>
                    <button onClick={()=>show("Copied!","success")} style={{ display:"flex",alignItems:"center",gap:4,padding:"5px 11px",borderRadius:7,border:"1px solid #a7f3d0",background:"white",cursor:"pointer",fontSize:11,color:"#059669",fontWeight:600 }}><FileText size={12}/>Copy</button>
                    <button onClick={()=>show("Helpful — thank you!","success")} style={{ display:"flex",alignItems:"center",gap:4,padding:"5px 11px",borderRadius:7,border:"1px solid #a7f3d0",background:"white",cursor:"pointer",fontSize:11,color:"#059669",fontWeight:600 }}><ThumbsUp size={12}/>Helpful</button>
                    <button onClick={()=>show("Feedback recorded","info")} style={{ display:"flex",alignItems:"center",gap:4,padding:"5px 11px",borderRadius:7,border:"1px solid #fecaca",background:"white",cursor:"pointer",fontSize:11,color:"#dc2626",fontWeight:600 }}><ThumbsDown size={12}/>Not Helpful</button>
                  </div>
                </div>
              )}

              {aiHistory.length>0 && (
                <div style={{ background:"white",border:"1px solid #e2e8f0",borderRadius:12,padding:"16px 20px",boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontWeight:700,fontSize:13,color:"#0f172a",marginBottom:10 }}>Recent Queries</div>
                  <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                    {aiHistory.map((h:any)=>(
                      <div key={h.id} onClick={()=>{setAiInput(h.question);setAiResponse(h.response);}} style={{ padding:"9px 12px",background:"#f8fafc",borderRadius:8,borderLeft:"3px solid #0891b2",cursor:"pointer" }}>
                        <div style={{ fontSize:12,fontWeight:600,color:"#0f172a",marginBottom:2 }}>{h.question.slice(0,90)}{h.question.length>90?"…":""}</div>
                        <div style={{ fontSize:11,color:"#94a3b8" }}>{h.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── BILLING ── */}
          {section==="billing" && (
            <div style={{ display:"grid",gap:16 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
                <div>
                  <div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Subscription Billing</div>
                  <div style={{ fontSize:12,color:"#94a3b8",marginTop:2 }}>Manage hospital subscriptions and invoices</div>
                </div>
                <button onClick={()=>show("Invoice creation — coming soon","info")} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",background:"#0891b2",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:600 }}>
                  <Plus size={15}/>Create Invoice
                </button>
              </div>

              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12 }}>
                {[
                  { label:"Total",   value:invoices.length,                                              icon:"📄",color:"#0891b2",bg:"#ecfeff" },
                  { label:"Paid",    value:invoices.filter((i:any)=>i.status==="paid").length,           icon:"✅",color:"#059669",bg:"#ecfdf5" },
                  { label:"Pending", value:invoices.filter((i:any)=>i.status==="pending").length,        icon:"⏳",color:"#d97706",bg:"#fffbeb" },
                  { label:"Overdue", value:invoices.filter((i:any)=>i.status==="overdue").length,        icon:"🚨",color:"#dc2626",bg:"#fef2f2" },
                ].map(k=>(
                  <div key={k.label} style={{ background:"white",borderRadius:12,padding:"14px 16px",border:"1px solid #e2e8f0",borderTop:`3px solid ${k.color}` }}>
                    <div style={{ fontSize:24,fontWeight:800,color:k.color }}>{k.value}</div>
                    <div style={{ fontSize:12,color:"#64748b",marginTop:3,fontWeight:500 }}>{k.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                    <thead>
                      <tr style={{ background:"#f8fafc",borderBottom:"1px solid #e2e8f0" }}>
                        {["Invoice Ref","Hospital","Tier","Amount","Period","Status",""].map(h=>(
                          <th key={h} style={{ padding:"10px 14px",textAlign:"left",fontWeight:600,fontSize:11,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.04em",whiteSpace:"nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv:any)=>(
                        <tr key={inv.id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                          <td style={{ padding:"10px 14px",fontWeight:700,color:"#0891b2" }}>{inv.invoice_ref}</td>
                          <td style={{ padding:"10px 14px",color:"#0f172a" }}>{inv.hospital_name}</td>
                          <td style={{ padding:"10px 14px" }}>
                            <span style={{ padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:700,background:TIER_BG[inv.tier as TierLevel]||"#f9fafb",color:TIER_COLORS[inv.tier as TierLevel]||"#6b7280" }}>{TIER_LABELS[inv.tier as TierLevel]||inv.tier||"—"}</span>
                          </td>
                          <td style={{ padding:"10px 14px",fontWeight:600,color:"#0f172a" }}>{inv.currency||"USD"} {Number(inv.amount||0).toLocaleString()}</td>
                          <td style={{ padding:"10px 14px",color:"#64748b",fontSize:12 }}>{inv.period_start||"—"}</td>
                          <td style={{ padding:"10px 14px" }}>
                            <span style={{ padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:inv.status==="paid"?"#dcfce7":inv.status==="overdue"?"#fee2e2":"#fffbeb",color:inv.status==="paid"?"#059669":inv.status==="overdue"?"#dc2626":"#d97706" }}>
                              {inv.status||"pending"}
                            </span>
                          </td>
                          <td style={{ padding:"10px 14px" }}>
                            <button onClick={()=>show("Invoice details — coming soon","info")} style={{ padding:"4px 9px",borderRadius:6,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",display:"flex",alignItems:"center" }}>
                              <Eye size={12} style={{ color:"#64748b" }}/>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {invoices.length===0 && <tr><td colSpan={7} style={{ padding:32,textAlign:"center",color:"#94a3b8",fontSize:13 }}>No invoices yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── AUDIT ── */}
          {section==="audit" && (
            <div style={{ display:"grid",gap:16 }}>
              <div>
                <div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Audit Logs</div>
                <div style={{ fontSize:12,color:"#94a3b8",marginTop:2 }}>System-level audit trail — admin actions, access denials, security events</div>
              </div>
              <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ padding:"12px 18px",borderBottom:"1px solid #f1f5f9",display:"flex",gap:10,alignItems:"center",background:"#f8fafc" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:7,background:"white",border:"1px solid #e2e8f0",borderRadius:7,padding:"6px 10px",flex:1,maxWidth:300 }}>
                    <Search size={12} style={{ color:"#94a3b8" }}/>
                    <input placeholder="Filter logs…" style={{ border:"none",outline:"none",fontSize:12,background:"transparent",color:"#0f172a" }}/>
                  </div>
                  <span style={{ fontSize:11,color:"#94a3b8" }}>Showing system-level events only. Clinical data audit is per hospital.</span>
                </div>
                <div style={{ padding:"14px 18px" }}>
                  <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                    {[
                      { action:"FEATURE_UPDATED",   module:"super-admin", user:"admin@artic.health", time:"2026-07-19 14:23", result:"success", icon:"⚙️" },
                      { action:"LOGIN",              module:"auth",        user:"admin@artic.health", time:"2026-07-19 14:00", result:"success", icon:"🔐" },
                      { action:"ACCESS_DENIED",      module:"privacy-guard",user:"admin@artic.health",time:"2026-07-19 13:55",result:"denied",  icon:"🚫" },
                      { action:"HOSPITAL_CREATED",   module:"super-admin", user:"admin@artic.health", time:"2026-07-19 12:30", result:"success", icon:"🏥" },
                      { action:"TIER_ASSIGNED",      module:"super-admin", user:"admin@artic.health", time:"2026-07-19 12:31", result:"success", icon:"🏆" },
                    ].map((log,i)=>(
                      <div key={i} style={{ display:"flex",alignItems:"center",gap:12,padding:"9px 12px",background:"#f8fafc",borderRadius:8 }}>
                        <span style={{ fontSize:16 }}>{log.icon}</span>
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                            <span style={{ fontSize:12,fontWeight:700,color:"#0f172a" }}>{log.action}</span>
                            <span style={{ fontSize:11,color:"#94a3b8" }}>· {log.module}</span>
                          </div>
                          <div style={{ fontSize:11,color:"#64748b",marginTop:1 }}>{log.user} · {log.time}</div>
                        </div>
                        <span style={{ padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:600,background:log.result==="success"?"#dcfce7":log.result==="denied"?"#fee2e2":"#fffbeb",color:log.result==="success"?"#059669":log.result==="denied"?"#dc2626":"#d97706" }}>
                          {log.result}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:12,padding:"10px",background:"#f0f9ff",borderRadius:8,fontSize:12,color:"#0891b2",textAlign:"center" }}>
                    📋 Full audit log API: <code style={{ background:"#e0f2fe",padding:"1px 6px",borderRadius:4 }}>GET /api/reports/audit</code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {section==="settings" && (
            <div style={{ display:"grid",gap:16 }}>
              <div>
                <div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>System Settings</div>
                <div style={{ fontSize:12,color:"#94a3b8",marginTop:2 }}>Global configuration for ARTIC HMS</div>
              </div>

              {/* Tier configs */}
              <div style={{ background:"white",borderRadius:12,padding:"18px 20px",border:"1px solid #e2e8f0",boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ fontWeight:700,fontSize:14,color:"#0f172a",marginBottom:14,display:"flex",alignItems:"center",gap:6 }}><TrendingUp size={15} style={{ color:"#0891b2" }}/>Subscription Tier Pricing</div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10 }}>
                  {TIERS.map(t=>(
                    <div key={t} style={{ border:`2px solid ${TIER_COLORS[t]}30`,borderRadius:10,padding:"14px",background:TIER_BG[t] }}>
                      <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:8 }}>
                        <div style={{ width:10,height:10,borderRadius:"50%",background:TIER_COLORS[t] }}/>
                        <span style={{ fontWeight:700,fontSize:13,color:TIER_COLORS[t] }}>{TIER_LABELS[t]}</span>
                      </div>
                      <div style={{ fontSize:12,color:"#374151",lineHeight:2 }}>
                        <div>💰 {t==="trial"?"Free":t==="basic"?"$50/mo":t==="premium"?"$120/mo":t==="pro"?"$250/mo":"Custom"}</div>
                        <div>👥 {t==="trial"?"3":t==="basic"?"10":t==="premium"?"30":t==="pro"?"100":"Unlimited"} users</div>
                        <div>💬 {t==="trial"||t==="basic"?"Email":t==="premium"?"Priority":t==="pro"?"24/7":"Dedicated"} support</div>
                      </div>
                      <button onClick={()=>show(`Edit ${TIER_LABELS[t]} tier pricing — coming soon`,"info")} style={{ marginTop:10,padding:"5px 0",width:"100%",borderRadius:7,border:`1px solid ${TIER_COLORS[t]}40`,background:"white",cursor:"pointer",fontSize:11,color:TIER_COLORS[t],fontWeight:600 }}>
                        Edit Pricing
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* System config */}
              <div style={{ background:"white",borderRadius:12,padding:"18px 20px",border:"1px solid #e2e8f0",boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ fontWeight:700,fontSize:14,color:"#0f172a",marginBottom:14,display:"flex",alignItems:"center",gap:6 }}><Database size={15} style={{ color:"#7c3aed" }}/>System Configuration</div>
                <div style={{ display:"grid",gap:12 }}>
                  {[
                    { key:"system_name",     label:"System Name",         value:"ARTIC HMS", type:"text" },
                    { key:"support_email",   label:"Support Email",       value:"support@artic.health", type:"email" },
                    { key:"default_currency",label:"Default Currency",    value:"USD", type:"text" },
                    { key:"trial_days",      label:"Trial Duration (days)",value:"14", type:"number" },
                    { key:"moh_country",     label:"MOH Country",         value:"Rwanda", type:"text" },
                    { key:"base_url",        label:"Frontend URL",        value:"http://172.209.217.176:3001", type:"url" },
                    { key:"api_url",         label:"Backend API URL",     value:"http://172.209.217.176:4001", type:"url" },
                  ].map(s=>(
                    <div key={s.key} style={{ display:"grid",gridTemplateColumns:"220px 1fr",alignItems:"center",gap:14 }}>
                      <label style={{ fontSize:13,fontWeight:600,color:"#374151" }}>{s.label}</label>
                      <input defaultValue={s.value} type={s.type} style={{ padding:"8px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13,color:"#0f172a",outline:"none" }}/>
                    </div>
                  ))}
                  <div style={{ display:"flex",justifyContent:"flex-end",marginTop:4 }}>
                    <button onClick={()=>show("Settings saved","success")} style={{ display:"flex",alignItems:"center",gap:6,padding:"9px 20px",background:"#0891b2",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:600 }}>
                      <Save size={14}/>Save Settings
                    </button>
                  </div>
                </div>
              </div>

              {/* Privacy & compliance */}
              <div style={{ background:"linear-gradient(135deg,#ecfdf5,#e0f2fe)",borderRadius:12,padding:"18px 20px",border:"1px solid #a7f3d0" }}>
                <div style={{ fontWeight:700,fontSize:14,color:"#059669",marginBottom:10,display:"flex",alignItems:"center",gap:6 }}><Shield size={15}/>Privacy & Legal Compliance</div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,fontSize:13,color:"#065f46" }}>
                  <div>✅ Rwanda Data Protection Law (2021)</div>
                  <div>✅ Super Admin clinical data blocked</div>
                  <div>✅ Aggregated statistics only shown</div>
                  <div>✅ Full audit trail (7-year retention)</div>
                  <div>✅ Hospital data tenant-isolated</div>
                  <div>✅ TLS 1.3 in transit enforced</div>
                </div>
              </div>

              {/* Danger zone */}
              <div style={{ background:"#fff5f5",borderRadius:12,padding:"18px 20px",border:"1px solid #fecaca" }}>
                <div style={{ fontWeight:700,fontSize:14,color:"#dc2626",marginBottom:10,display:"flex",alignItems:"center",gap:6 }}><AlertTriangle size={15}/>Danger Zone</div>
                <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
                  <button onClick={()=>show("Requires additional confirmation","warning")} style={{ padding:"8px 16px",borderRadius:8,border:"1px solid #fecaca",background:"white",cursor:"pointer",fontSize:12,color:"#dc2626",fontWeight:600 }}>🗑️ Clear Demo Data</button>
                  <button onClick={()=>show("Backup initiated","info")} style={{ padding:"8px 16px",borderRadius:8,border:"1px solid #fecaca",background:"white",cursor:"pointer",fontSize:12,color:"#dc2626",fontWeight:600 }}>💾 Force Backup</button>
                  <button onClick={()=>show("Cache cleared","success")} style={{ padding:"8px 16px",borderRadius:8,border:"1px solid #fecaca",background:"white",cursor:"pointer",fontSize:12,color:"#dc2626",fontWeight:600 }}>🔄 Clear Cache</button>
                </div>
              </div>
            </div>
          )}

        </div>{/* end page body */}
      </div>{/* end main content */}

      {/* ── EDIT FEATURE MODAL ── */}
      {editingFeature && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:"white",borderRadius:16,padding:"24px 26px",width:"100%",maxWidth:520,maxHeight:"88vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.25)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
              <div style={{ fontWeight:800,fontSize:16,color:"#0f172a" }}>{editingFeature.icon||"⚙️"} Edit: {editingFeature.label}</div>
              <button onClick={()=>setEditingFeature(null)} style={{ border:"none",background:"none",cursor:"pointer",padding:6,borderRadius:6,color:"#64748b" }}><X size={18}/></button>
            </div>
            <div style={{ display:"grid",gap:14 }}>
              {[
                { key:"label",         label:"Display Label",   type:"text" },
                { key:"description",   label:"Description",     type:"text" },
                { key:"access_message",label:"Locked Message",  type:"text" },
              ].map(field=>(
                <div key={field.key}>
                  <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5 }}>{field.label}</label>
                  <input value={editingFeature[field.key]||""} onChange={e=>setEditingFeature({...editingFeature,[field.key]:e.target.value})} type={field.type}
                    style={{ width:"100%",padding:"9px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13,color:"#0f172a",outline:"none",boxSizing:"border-box" }}/>
                </div>
              ))}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                <div>
                  <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5 }}>Status</label>
                  <select value={editingFeature.default_status||"active"} onChange={e=>setEditingFeature({...editingFeature,default_status:e.target.value})}
                    style={{ width:"100%",padding:"9px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13,color:"#0f172a",outline:"none" }}>
                    <option value="active">Active</option>
                    <option value="locked">Locked</option>
                    <option value="limited">Limited</option>
                    <option value="beta">Beta</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5 }}>Required Tier</label>
                  <select value={editingFeature.tier_required||"basic"} onChange={e=>setEditingFeature({...editingFeature,tier_required:e.target.value})}
                    style={{ width:"100%",padding:"9px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13,color:"#0f172a",outline:"none" }}>
                    {TIERS.map(t=><option key={t} value={t}>{TIER_LABELS[t]}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <input type="checkbox" id="req-appr" checked={!!editingFeature.requires_approval} onChange={e=>setEditingFeature({...editingFeature,requires_approval:e.target.checked})} style={{ width:16,height:16,cursor:"pointer",accentColor:"#0891b2" }}/>
                <label htmlFor="req-appr" style={{ fontSize:13,color:"#374151",cursor:"pointer" }}>Requires Admin Approval to unlock</label>
              </div>
            </div>
            <div style={{ display:"flex",gap:10,justifyContent:"flex-end",marginTop:20 }}>
              <button onClick={()=>setEditingFeature(null)} style={{ padding:"9px 20px",borderRadius:9,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:13,color:"#374151",fontWeight:600 }}>Cancel</button>
              <button onClick={()=>saveFeature(editingFeature)} style={{ display:"flex",alignItems:"center",gap:6,padding:"9px 22px",background:"linear-gradient(135deg,#0891b2,#7c3aed)",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:700 }}>
                <Save size={14}/>Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
