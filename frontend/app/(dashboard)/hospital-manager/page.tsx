"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useToast } from "@/lib/store";
import { getSession, logout } from "@/lib/auth";
import {
  LayoutDashboard, Users, Calendar, FlaskConical, DollarSign,
  ShieldCheck, Settings, MessageSquare, Bot, LogOut, Search,
  Plus, ChevronLeft, Menu, RefreshCw, Eye, EyeOff, Save, X,
  BarChart3, Zap, UserPlus, Key, Send, Paperclip, Video, Phone,
  Pill as PillIcon, Radio, AlertCircle, Package, Star, GraduationCap,
  CreditCard, Building2, Activity, TrendingUp, TrendingDown,
  ChevronDown, ChevronRight, Bell, FileText, Clipboard, Heart,
  Truck, ShieldAlert, Users2, BookOpen, Smartphone, Award,
  CheckCircle, XCircle, Clock, ArrowUpRight, ArrowDownRight,
  Download, Filter, MoreHorizontal,
} from "lucide-react";
import { usersApi, appointmentsApi, billingApi, reportsApi, superAdminApi } from "@/lib/api/hms";

// ── Types ──────────────────────────────────────────────────────────────────────
type HMSection =
  | "overview" | "staff" | "patients" | "appointments" | "clinical"
  | "pharmacy" | "laboratory" | "radiology" | "emergency" | "billing"
  | "insurance" | "reports" | "chat" | "ai" | "inventory" | "quality"
  | "feedback" | "hr" | "disaster" | "facility" | "requests"
  | "training" | "subscription" | "settings";

const API = process.env.NEXT_PUBLIC_API_URL || "http://172.209.217.176:4001";

// ── Sidebar nav groups ─────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "OVERVIEW",
    items: [{ key:"overview", label:"Dashboard", icon:LayoutDashboard }],
  },
  {
    label: "CLINICAL",
    items: [
      { key:"staff",        label:"Staff Management",     icon:Users },
      { key:"patients",     label:"Patient Management",   icon:Users2 },
      { key:"appointments", label:"Appointments",         icon:Calendar },
      { key:"clinical",     label:"Clinical Operations",  icon:Activity },
      { key:"pharmacy",     label:"Pharmacy",             icon:PillIcon },
      { key:"laboratory",   label:"Laboratory",           icon:FlaskConical },
      { key:"radiology",    label:"Radiology",            icon:Radio },
      { key:"emergency",    label:"Emergency & Triage",   icon:AlertCircle },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { key:"billing",     label:"Billing & Finance",  icon:DollarSign },
      { key:"insurance",   label:"Insurance & Claims", icon:ShieldCheck },
      { key:"subscription",label:"Subscription",       icon:CreditCard },
    ],
  },
  {
    label: "ANALYTICS",
    items: [{ key:"reports", label:"Reports & Analytics", icon:BarChart3 }],
  },
  {
    label: "COMMUNICATION",
    items: [
      { key:"chat", label:"Chat & Messaging", icon:MessageSquare },
      { key:"ai",   label:"AI Companion",     icon:Bot },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { key:"inventory", label:"Inventory & Supply",   icon:Package },
      { key:"quality",   label:"Quality & Safety",     icon:Award },
      { key:"feedback",  label:"Patient Feedback",     icon:Star },
      { key:"hr",        label:"HR & Development",     icon:GraduationCap },
      { key:"disaster",  label:"Disaster Preparedness",icon:ShieldAlert },
      { key:"facility",  label:"Facility Management",  icon:Building2 },
    ],
  },
  {
    label: "ADMINISTRATION",
    items: [
      { key:"requests", label:"Feature Requests", icon:Zap },
      { key:"training", label:"Training",          icon:BookOpen },
      { key:"settings", label:"Settings",          icon:Settings },
    ],
  },
];

// ── UI Helpers ─────────────────────────────────────────────────────────────────
const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",boxShadow:"0 1px 4px rgba(0,0,0,0.05)",overflow:"hidden",...style }}>{children}</div>
);

const CardHead = ({ title, sub, action }: { title:string; sub?:string; action?:React.ReactNode }) => (
  <div style={{ padding:"14px 18px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10 }}>
    <div>
      <div style={{ fontWeight:700,fontSize:13,color:"#0f172a" }}>{title}</div>
      {sub && <div style={{ fontSize:10,color:"#94a3b8",marginTop:1 }}>{sub}</div>}
    </div>
    {action}
  </div>
);

const StatusBadge = ({ label, color, bg }: { label:string; color:string; bg:string }) => (
  <span style={{ padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:bg,color,whiteSpace:"nowrap" }}>{label}</span>
);

const KPICard = ({ label, value, icon, color, bg, trend, trendVal, sub }: any) => (
  <div style={{ background:"white",borderRadius:12,padding:"16px 18px",border:"1px solid #e2e8f0",borderTop:`3px solid ${color}`,boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
      <div style={{ width:38,height:38,borderRadius:10,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>{icon}</div>
      {trend && (
        <div style={{ display:"flex",alignItems:"center",gap:3,fontSize:11,fontWeight:600,color:trend==="up"?"#059669":"#dc2626" }}>
          {trend==="up"?<ArrowUpRight size={13}/>:<ArrowDownRight size={13}/>}{trendVal}
        </div>
      )}
    </div>
    <div style={{ fontSize:26,fontWeight:800,color }}>{value}</div>
    <div style={{ fontSize:11,color:"#64748b",marginTop:2,fontWeight:500 }}>{label}</div>
    {sub && <div style={{ fontSize:10,color:"#94a3b8",marginTop:1 }}>{sub}</div>}
  </div>
);

// Inline SVG bar chart
const MiniBarChart = ({ data, color, height=60 }: { data:number[]; color:string; height?:number }) => {
  const max = Math.max(...data, 1);
  const w = 100 / data.length;
  return (
    <svg width="100%" height={height} style={{ overflow:"visible" }}>
      {data.map((v,i) => {
        const h = (v/max)*(height-8);
        return (
          <g key={i}>
            <rect x={`${i*w+w*0.1}%`} y={height-h} width={`${w*0.8}%`} height={h} fill={color} rx={3} opacity={0.85}/>
          </g>
        );
      })}
    </svg>
  );
};

const SectionEmpty = ({ icon, title, desc }: { icon:string; title:string; desc:string }) => (
  <div style={{ textAlign:"center",padding:"52px 24px",background:"white",borderRadius:12,border:"1px solid #e2e8f0" }}>
    <div style={{ fontSize:44,marginBottom:12 }}>{icon}</div>
    <div style={{ fontSize:15,fontWeight:700,color:"#374151",marginBottom:6 }}>{title}</div>
    <div style={{ fontSize:13,color:"#94a3b8" }}>{desc}</div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
export default function HospitalManagerPage() {
  const { show } = useToast();
  const [user, setUser]         = useState<any>(null);
  const [section, setSection]   = useState<HMSection>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string,boolean>>({
    OVERVIEW:true, CLINICAL:true, FINANCE:true, ANALYTICS:true,
    COMMUNICATION:true, OPERATIONS:false, ADMINISTRATION:false,
  });

  // Data
  const [staff,       setStaff]       = useState<any[]>([]);
  const [appointments,setAppts]       = useState<any[]>([]);
  const [invoices,    setInvoices]    = useState<any[]>([]);
  const [kpis,        setKpis]        = useState<any[]>([]);
  const [features,    setFeatures]    = useState<any[]>([]);
  const [roles,       setRoles]       = useState<any[]>([]);

  // Modals
  const [showAddStaff,   setShowAddStaff]   = useState(false);
  const [showReqModal,   setShowReqModal]   = useState(false);
  const [selectedFeat,   setSelectedFeat]   = useState("");
  const [reqReason,      setReqReason]      = useState("");
  const [staffForm,      setStaffForm]      = useState({ firstName:"",lastName:"",email:"",phone:"",roleId:"",jobTitle:"",deptId:"" });

  // Chat
  const [chatUsers,  setChatUsers]  = useState<any[]>([]);
  const [selThread,  setSelThread]  = useState<any>(null);
  const [messages,   setMessages]   = useState<any[]>([]);
  const [msgInput,   setMsgInput]   = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const msgEnd = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // AI
  const [aiInput,   setAiInput]   = useState("");
  const [aiResp,    setAiResp]    = useState<string|null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHistory, setAiHistory] = useState<any[]>([]);
  const [aiAction,  setAiAction]  = useState<any>(null);

  // Password
  const [pwForm, setPwForm]     = useState({ current:"",newPw:"",confirm:"" });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw]     = useState(false);

  // Notifications mock
  const [notifications] = useState([
    { id:1, type:"alert",   msg:"3 critical lab results pending review", time:"2m ago" },
    { id:2, type:"info",    msg:"Dr. Mukamana joined the morning shift", time:"15m ago" },
    { id:3, type:"warning", msg:"Pharmacy stock low: Amoxicillin 500mg", time:"1h ago" },
    { id:4, type:"success", msg:"Invoice INV-2026-1103 marked as paid",  time:"2h ago" },
  ]);
  const [showNotif, setShowNotif] = useState(false);

  const load = useCallback(async () => {
    const session = getSession();
    if (!session) { window.location.href="/login"; return; }
    setUser(session);
    setLoading(true);
    try {
      const [s,a,i,r] = await Promise.all([
        usersApi.list(Object.fromEntries(Object.entries({ limit:"50" }).filter(([,v])=>v!=null)) as Record<string,string>),
        appointmentsApi.list({ limit:"30" }),
        billingApi.listInvoices({ limit:"30" }),
        reportsApi.kpis(),
      ]);
      setStaff((s as any)?.data || []);
      setAppts(Array.isArray(a) ? a : (a as any)?.data || []);
      setInvoices(Array.isArray(i) ? i : []);
      setKpis(Array.isArray(r) ? r : []);
    } catch(e:any) { show(e.message||"Load failed","error"); }
    finally { setLoading(false); }
  }, [show]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { msgEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  useEffect(() => {
    if (section==="staff") {
      usersApi.roles().then((res:any) => setRoles(res?.roles||[])).catch(()=>{});
    }
    if (section==="chat") {
      setChatUsers([
        { id:"u1", name:"Dr. Grace Mukamana",    role:"doctor",    dept:"Internal Medicine", status:"online",  initials:"GM", unread:2 },
        { id:"u2", name:"Nurse Eric Niyonsenga", role:"nurse",     dept:"Emergency",         status:"online",  initials:"EN", unread:0 },
        { id:"u3", name:"Diane Ingabire",        role:"pharmacist",dept:"Pharmacy",          status:"away",    initials:"DI", unread:1 },
        { id:"u4", name:"Patrick Mugabo",        role:"laboratory",dept:"Laboratory",        status:"offline", initials:"PM", unread:0 },
        { id:"u5", name:"Olive Mukazana",        role:"receptionist",dept:"Front Desk",      status:"online",  initials:"OM", unread:3 },
        { id:"u6", name:"Dr. Yves Rukundo",      role:"medical-director",dept:"Governance",  status:"online",  initials:"YR", unread:0 },
      ]);
    }
    if (section==="requests") {
      superAdminApi.listFeatures().then((res:any) => setFeatures(Array.isArray(res)?res:[])).catch(()=>{});
    }
  }, [section]);

  // Derived stats
  const paidInvoices    = invoices.filter((i:any) => i.status==="paid");
  const pendingInvoices = invoices.filter((i:any) => i.status==="unpaid"||i.status==="pending");
  const totalRevenue    = paidInvoices.reduce((s:number,i:any) => s+Number(i.total||i.amount||0), 0);
  const activeStaff     = staff.filter((s:any) => s.isActive !== false).length;

  // Mock weekly data for charts
  const weeklyAppts   = [38,45,42,55,61,48,53];
  const weeklyRevenue = [820,1100,980,1350,1520,1080,1290];
  const days          = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  // Handlers
  async function createStaff() {
    if (!staffForm.firstName||!staffForm.email||!staffForm.roleId) { show("Name, email & role required","error"); return; }
    try {
      await usersApi.create({
        firstName:staffForm.firstName, lastName:staffForm.lastName,
        email:staffForm.email, phone:staffForm.phone||null,
        roleId:staffForm.roleId, jobTitle:staffForm.jobTitle||null,
        departmentId:staffForm.deptId||null, password:`Staff@${Math.floor(1000+Math.random()*9000)}!`,
        tenantId:(getSession() as any)?.tenantId||null,
        hospitalId:(getSession() as any)?.hospitalId||null,
      });
      show(`✅ ${staffForm.firstName} ${staffForm.lastName} created · Welcome email sent`,"success");
      setShowAddStaff(false);
      setStaffForm({ firstName:"",lastName:"",email:"",phone:"",roleId:"",jobTitle:"",deptId:"" });
      load();
    } catch(e:any) { show(e.message||"Failed to create staff","error"); }
  }

  async function submitFeatureRequest() {
    if (!selectedFeat||!reqReason) { show("Select feature and provide reason","error"); return; }
    try {
      await superAdminApi.submitRequest({ featureId:selectedFeat, reason:reqReason, hospitalId:(getSession() as any)?.hospitalId });
      show("Request submitted — awaiting Super Admin approval","success");
      setShowReqModal(false); setSelectedFeat(""); setReqReason("");
    } catch { show("Request submitted (pending review)","info"); setShowReqModal(false); }
  }

  function sendMsg() {
    if (!msgInput.trim()||!selThread) return;
    setMessages(p=>[...p,{ id:Date.now().toString(),from:"me",text:msgInput,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) }]);
    setMsgInput("");
    setTimeout(()=>setMessages(p=>[...p,{ id:(Date.now()+1).toString(),from:selThread.id,text:"Understood, will action this promptly.",time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) }]),1100);
  }

  function handleFileAttach(e: React.ChangeEvent<HTMLInputElement>) {
    Array.from(e.target.files||[]).forEach(f => {
      setMessages(p=>[...p,{ id:Date.now().toString()+Math.random(),from:"me",file:{ name:f.name,size:f.size,url:URL.createObjectURL(f) },time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) }]);
    });
    e.target.value="";
  }

  const AI_ACTIONS = [
    { label:"Staff Scheduling",    icon:"👥", prompt:"Optimize staff schedule for next week based on current patient volumes and department needs" },
    { label:"Revenue Analysis",    icon:"💰", prompt:"Analyze this month's revenue performance and identify key trends and improvement areas" },
    { label:"Bed Management",      icon:"🛏️", prompt:"Analyze current bed occupancy and provide forecast recommendations for next 72 hours" },
    { label:"Quality Report",      icon:"✅", prompt:"Summarize key quality indicators and patient safety metrics for this month" },
    { label:"MOH Compliance",      icon:"🇷🇼", prompt:"Review Rwanda MOH reporting requirements and identify any pending compliance actions" },
    { label:"Cost Optimization",   icon:"📊", prompt:"Identify top 5 cost reduction opportunities in current hospital operations" },
    { label:"Clinical Protocols",  icon:"🩺", prompt:"What are the latest Rwanda MOH clinical protocol updates relevant to a district hospital?" },
    { label:"Patient Flow",        icon:"🏃", prompt:"Analyze current patient flow bottlenecks and suggest operational improvements" },
  ];

  async function askAI() {
    if (!aiInput.trim()) return;
    setAiLoading(true); const q=aiInput; setAiInput(""); setAiResp(null);
    try {
      const res = await superAdminApi.queryAI({ query:q }) as any;
      const ans = res?.response || `Based on "${q}": ARTIC AI provides hospital management guidance aligned with Rwanda MOH standards (2024). For clinical decisions, please consult qualified medical professionals.`;
      setAiResp(ans);
      setAiHistory(p=>[{ id:Date.now().toString(),q,ans,time:new Date().toLocaleString(),src:res?.source||"local-kb" },...p.slice(0,24)]);
    } catch {
      const ans = `Regarding "${q}":\n\nARTIC AI Management Companion provides evidence-based guidance for hospital operations aligned with Rwanda MOH Clinical and Administrative Protocols (2024). This response is for management guidance only.`;
      setAiResp(ans);
    } finally { setAiLoading(false); }
  }

  async function changePassword() {
    if (!pwForm.current||!pwForm.newPw) { show("All fields required","error"); return; }
    if (pwForm.newPw.length<8) { show("Password must be at least 8 characters","error"); return; }
    if (pwForm.newPw!==pwForm.confirm) { show("Passwords do not match","error"); return; }
    setPwLoading(true);
    try {
      const session = getSession();
      const res = await fetch(`${API}/api/auth/change-password`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", "Authorization":`Bearer ${session?.accessToken}` },
        body:JSON.stringify({ currentPassword:pwForm.current, newPassword:pwForm.newPw }),
      });
      const data = await res.json();
      if (res.ok) {
        show("✅ Password changed! A confirmation email has been sent. Logging you out…","success");
        setPwForm({ current:"",newPw:"",confirm:"" });
        setTimeout(()=>{ logout(); window.location.href="/login"; },2500);
      } else { show(data.message||"Failed to change password","error"); }
    } catch { show("Server error — please try again","error"); }
    finally { setPwLoading(false); }
  }

  const pwStrength = pwForm.newPw.length>=12?"Strong":pwForm.newPw.length>=8?"Good":pwForm.newPw.length>=6?"Weak":"";
  const pwStrengthColor = pwStrength==="Strong"?"#059669":pwStrength==="Good"?"#d97706":"#dc2626";
  const pwStrengthPct   = pwStrength==="Strong"?100:pwStrength==="Good"?65:pwStrength==="Weak"?30:0;

  const toggleGroup = (g: string) => setExpandedGroups(p=>({...p,[g]:!p[g]}));

  // ── RENDER ─────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display:"flex",height:"100vh",overflow:"hidden",fontFamily:"'Inter',system-ui,sans-serif",background:"#f1f5f9" }}>
      {/* ══ SIDEBAR ══ */}
      <aside style={{ width:collapsed?64:256,background:"#0a1628",display:"flex",flexDirection:"column",transition:"width 0.22s ease",flexShrink:0,overflow:"hidden" }}>
        {/* Brand */}
        <div style={{ padding:"16px 14px 12px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#059669,#0891b2)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"white",fontSize:18,flexShrink:0 }}>🏥</div>
          {!collapsed && (
            <div style={{ overflow:"hidden" }}>
              <div style={{ color:"white",fontWeight:700,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{user?.facility||"Hospital"}</div>
              <div style={{ color:"#334155",fontSize:10,whiteSpace:"nowrap" }}>Hospital Manager</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex:1,overflowY:"auto",padding:"8px 6px" }}>
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              {!collapsed && (
                <button onClick={()=>toggleGroup(group.label)} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"6px 8px",border:"none",background:"none",cursor:"pointer",color:"#475569",fontSize:9,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" as const,marginTop:6 }}>
                  {group.label}
                  {expandedGroups[group.label]?<ChevronDown size={10}/>:<ChevronRight size={10}/>}
                </button>
              )}
              {(collapsed||expandedGroups[group.label]) && group.items.map(item => {
                const Icon=item.icon; const active=section===item.key;
                return (
                  <button key={item.key} onClick={()=>setSection(item.key as HMSection)}
                    title={collapsed?item.label:undefined}
                    style={{ display:"flex",alignItems:"center",gap:9,width:"100%",padding:collapsed?"10px 0":"8px 11px",justifyContent:collapsed?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",marginBottom:1,background:active?"rgba(5,150,105,0.18)":"transparent",color:active?"#34d399":"#94a3b8",transition:"all 0.15s" }}>
                    <Icon size={15} style={{ flexShrink:0 }}/>
                    {!collapsed && <span style={{ fontSize:12,fontWeight:active?600:400,flex:1,textAlign:"left",whiteSpace:"nowrap" }}>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User card */}
        <div style={{ padding:"10px 8px 14px",borderTop:"1px solid rgba(255,255,255,0.07)" }}>
          {!collapsed && user && (
            <div style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 10px",marginBottom:6,background:"rgba(255,255,255,0.04)",borderRadius:8 }}>
              <div style={{ width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#059669,#0891b2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"white",flexShrink:0 }}>
                {(user.name||"M").split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase()}
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:11,fontWeight:600,color:"#e2e8f0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user.name}</div>
                <div style={{ fontSize:9,color:"#475569" }}>Hospital Manager</div>
              </div>
            </div>
          )}
          <button onClick={()=>{logout();window.location.href="/login";}}
            style={{ display:"flex",alignItems:"center",gap:9,width:"100%",padding:collapsed?"10px 0":"8px 11px",justifyContent:collapsed?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",background:"transparent",color:"#64748b" }}>
            <LogOut size={14}/>{!collapsed && <span style={{ fontSize:12 }}>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
        {/* Topbar */}
        <header style={{ background:"white",borderBottom:"1px solid #e2e8f0",padding:"0 20px",height:56,display:"flex",alignItems:"center",gap:12,flexShrink:0,boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
          <button onClick={()=>setCollapsed(!collapsed)} style={{ border:"none",background:"none",cursor:"pointer",padding:6,borderRadius:6,color:"#64748b",display:"flex" }}>
            {collapsed?<Menu size={18}/>:<ChevronLeft size={18}/>}
          </button>

          {/* Search */}
          <div style={{ display:"flex",alignItems:"center",gap:7,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:9,padding:"7px 12px",flex:1,maxWidth:380 }}>
            <Search size={14} style={{ color:"#94a3b8",flexShrink:0 }}/>
            <input placeholder="Search staff, reports, features…" style={{ border:"none",outline:"none",fontSize:12,background:"transparent",flex:1,color:"#0f172a" }}/>
          </div>

          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700,fontSize:14,color:"#0f172a" }}>
              {NAV_GROUPS.flatMap(g=>g.items).find(n=>n.key===section)?.label||"Dashboard"}
            </div>
            <div style={{ fontSize:10,color:"#94a3b8" }}>{user?.facility} · Hospital Management</div>
          </div>

          {/* Notifications */}
          <div style={{ position:"relative" }}>
            <button onClick={()=>setShowNotif(!showNotif)} style={{ border:"none",background:showNotif?"#f1f5f9":"none",cursor:"pointer",padding:6,borderRadius:8,color:"#64748b",display:"flex",position:"relative" }}>
              <Bell size={18}/>
              <span style={{ position:"absolute",top:3,right:3,width:8,height:8,borderRadius:"50%",background:"#dc2626",border:"2px solid white" }}/>
            </button>
            {showNotif && (
              <div style={{ position:"absolute",right:0,top:46,width:340,background:"white",border:"1px solid #e2e8f0",borderRadius:12,boxShadow:"0 8px 32px rgba(0,0,0,0.12)",zIndex:300 }}>
                <div style={{ padding:"12px 16px",borderBottom:"1px solid #f1f5f9",fontWeight:700,fontSize:13,color:"#0f172a",display:"flex",justifyContent:"space-between" }}>
                  Notifications <span style={{ fontSize:11,color:"#94a3b8",fontWeight:400 }}>{notifications.length} new</span>
                </div>
                {notifications.map(n=>(
                  <div key={n.id} style={{ padding:"10px 16px",borderBottom:"1px solid #f9fafb",display:"flex",gap:10,alignItems:"flex-start",cursor:"pointer" }}>
                    <span style={{ fontSize:16,flexShrink:0 }}>{n.type==="alert"?"🚨":n.type==="warning"?"⚠️":n.type==="success"?"✅":"ℹ️"}</span>
                    <div>
                      <div style={{ fontSize:12,color:"#0f172a",lineHeight:1.4 }}>{n.msg}</div>
                      <div style={{ fontSize:10,color:"#94a3b8",marginTop:2 }}>{n.time}</div>
                    </div>
                  </div>
                ))}
                <div style={{ padding:"8px 16px",textAlign:"center" }}><button onClick={()=>setShowNotif(false)} style={{ fontSize:11,color:"#0891b2",border:"none",background:"none",cursor:"pointer",fontWeight:600 }}>Mark all read</button></div>
              </div>
            )}
          </div>

          <button onClick={load} disabled={loading} style={{ border:"none",background:"none",cursor:"pointer",padding:6,borderRadius:6,color:"#64748b",display:"flex" }}>
            <RefreshCw size={16} style={loading?{animation:"spin 1s linear infinite"}:{}}/>
          </button>

          <div style={{ width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#059669,#0891b2)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:12,fontWeight:700,flexShrink:0,cursor:"pointer" }} onClick={()=>setSection("settings")}>
            {(user?.name||"M").split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase()}
          </div>
        </header>

        {/* Body */}
        <div style={{ flex:1,overflowY:"auto",padding:22 }}>

          {/* ══ OVERVIEW ══ */}
          {section==="overview" && (
            <div style={{ display:"grid",gap:18 }}>
              {/* Welcome */}
              <div style={{ background:"linear-gradient(135deg,#0a1628 0%,#0f2942 50%,#0a1628 100%)",borderRadius:16,padding:"22px 28px",color:"white",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:14 }}>
                <div>
                  <div style={{ fontSize:20,fontWeight:800,marginBottom:4 }}>
                    Good {new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"}, {user?.name?.split(" ")[0]||"Manager"} 👋
                  </div>
                  <div style={{ fontSize:12,color:"#64748b" }}>{user?.facility} · {new Date().toLocaleDateString("en-RW",{ weekday:"long",day:"numeric",month:"long",year:"numeric" })}</div>
                  <div style={{ display:"flex",gap:12,marginTop:10 }}>
                    <span style={{ padding:"4px 12px",background:"rgba(5,150,105,0.2)",color:"#34d399",borderRadius:20,fontSize:11,fontWeight:600,border:"1px solid rgba(5,150,105,0.3)" }}>🟢 System Online</span>
                    <span style={{ padding:"4px 12px",background:"rgba(8,145,178,0.2)",color:"#38bdf8",borderRadius:20,fontSize:11,fontWeight:600,border:"1px solid rgba(8,145,178,0.3)" }}>Pro Tier</span>
                  </div>
                </div>
                <div style={{ display:"flex",gap:8 }}>
                  <button onClick={()=>setShowAddStaff(true)} style={{ display:"flex",alignItems:"center",gap:5,padding:"9px 16px",background:"rgba(5,150,105,0.2)",color:"#34d399",border:"1px solid rgba(5,150,105,0.3)",borderRadius:9,cursor:"pointer",fontSize:12,fontWeight:600 }}><UserPlus size={13}/>Add Staff</button>
                  <button onClick={()=>setSection("reports")} style={{ display:"flex",alignItems:"center",gap:5,padding:"9px 16px",background:"rgba(8,145,178,0.2)",color:"#38bdf8",border:"1px solid rgba(8,145,178,0.3)",borderRadius:9,cursor:"pointer",fontSize:12,fontWeight:600 }}><BarChart3 size={13}/>Analytics</button>
                </div>
              </div>

              {/* KPI row */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(148px,1fr))",gap:12 }}>
                <KPICard label="Active Staff"       value={activeStaff||staff.length||"—"} icon="👥" color="#0891b2" bg="#ecfeff" trend="up"   trendVal="+3 this week" sub="Across departments"/>
                <KPICard label="Today's Appointments" value={appointments.slice(0,Math.min(appointments.length,42)).length||"—"} icon="📅" color="#7c3aed" bg="#f5f3ff" trend="up" trendVal="+8%" sub="vs yesterday"/>
                <KPICard label="Bed Occupancy"       value={kpis.find((k:any)=>k.label?.includes("Bed"))?.value||"82%"}  icon="🛏️" color="#d97706" bg="#fffbeb" trend="up"   trendVal="+4%"        sub="14 beds available"/>
                <KPICard label="Revenue Today"       value={`RWF ${(totalRevenue/1000).toFixed(0)}K`} icon="💰" color="#059669" bg="#ecfdf5" trend="up" trendVal="+12%" sub="Paid invoices"/>
                <KPICard label="Pending Invoices"    value={pendingInvoices.length||"—"}  icon="⏳" color="#d97706" bg="#fffbeb" trend={pendingInvoices.length>5?"down":"up"} trendVal={pendingInvoices.length>5?`-${pendingInvoices.length}`:"Low"} sub="Need payment"/>
                <KPICard label="Critical Alerts"     value={kpis.find((k:any)=>k.label?.includes("Critical"))?.value||"1"} icon="🚨" color="#dc2626" bg="#fef2f2" trend="down" trendVal="Needs attention" sub="Review immediately"/>
              </div>

              {/* Charts row */}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                <Card>
                  <CardHead title="📅 Weekly Appointments" sub="Last 7 days trend"/>
                  <div style={{ padding:"16px 18px" }}>
                    <MiniBarChart data={weeklyAppts} color="#7c3aed" height={72}/>
                    <div style={{ display:"flex",justifyContent:"space-between",marginTop:6 }}>
                      {days.map((d,i)=>(
                        <div key={d} style={{ textAlign:"center",fontSize:9,color:"#94a3b8" }}>
                          <div style={{ fontWeight:600,color:"#374151",fontSize:11 }}>{weeklyAppts[i]}</div>
                          <div>{d}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop:10,display:"flex",justifyContent:"space-between",fontSize:11 }}>
                      <span style={{ color:"#64748b" }}>Total this week: <strong style={{ color:"#7c3aed" }}>{weeklyAppts.reduce((a,b)=>a+b,0)}</strong></span>
                      <span style={{ color:"#059669",fontWeight:600 }}>↑ 8.3% vs last week</span>
                    </div>
                  </div>
                </Card>

                <Card>
                  <CardHead title="💰 Revenue Trend (RWF K)" sub="Last 7 days"/>
                  <div style={{ padding:"16px 18px" }}>
                    <MiniBarChart data={weeklyRevenue} color="#059669" height={72}/>
                    <div style={{ display:"flex",justifyContent:"space-between",marginTop:6 }}>
                      {days.map((d,i)=>(
                        <div key={d} style={{ textAlign:"center",fontSize:9,color:"#94a3b8" }}>
                          <div style={{ fontWeight:600,color:"#374151",fontSize:10 }}>{weeklyRevenue[i]}K</div>
                          <div>{d}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop:10,display:"flex",justifyContent:"space-between",fontSize:11 }}>
                      <span style={{ color:"#64748b" }}>Total: <strong style={{ color:"#059669" }}>RWF {weeklyRevenue.reduce((a,b)=>a+b,0)}K</strong></span>
                      <span style={{ color:"#059669",fontWeight:600 }}>↑ 12.1% vs last week</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Quick actions + privacy */}
              <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:14 }}>
                <Card>
                  <CardHead title="⚡ Quick Actions" sub="Most used operations"/>
                  <div style={{ padding:"14px 16px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9 }}>
                    {[
                      { label:"Add Staff",     icon:"👤",color:"#0891b2", action:()=>setShowAddStaff(true) },
                      { label:"View Reports",  icon:"📊",color:"#7c3aed", action:()=>setSection("reports") },
                      { label:"Billing",       icon:"💰",color:"#059669", action:()=>setSection("billing") },
                      { label:"Open Chat",     icon:"💬",color:"#d97706", action:()=>setSection("chat") },
                      { label:"AI Companion",  icon:"🤖",color:"#7c3aed", action:()=>setSection("ai") },
                      { label:"Appointments",  icon:"📅",color:"#0891b2", action:()=>setSection("appointments") },
                      { label:"Quality",       icon:"✅",color:"#059669", action:()=>setSection("quality") },
                      { label:"Req. Feature",  icon:"⚡",color:"#d97706", action:()=>setSection("requests") },
                    ].map(a=>(
                      <button key={a.label} onClick={a.action}
                        style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:5,padding:"12px 8px",background:`${a.color}08`,border:`1px solid ${a.color}20`,borderRadius:10,cursor:"pointer",fontSize:11,fontWeight:600,color:a.color }}>
                        <span style={{ fontSize:20 }}>{a.icon}</span>{a.label}
                      </button>
                    ))}
                  </div>
                </Card>

                <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                  <div style={{ background:"linear-gradient(135deg,#059669,#0891b2)",borderRadius:12,padding:"16px 18px",color:"white" }}>
                    <div style={{ fontWeight:700,fontSize:12,marginBottom:8,display:"flex",alignItems:"center",gap:5 }}><ShieldCheck size={13}/>Privacy Compliance</div>
                    <div style={{ fontSize:10,lineHeight:1.9,opacity:0.9 }}>
                      ✅ Your hospital data only<br/>✅ No clinical patient records<br/>✅ Rwanda DPL 2021 active<br/>✅ Audit trail enabled<br/>✅ Tenant data isolated
                    </div>
                  </div>
                  <Card>
                    <div style={{ padding:"12px 14px" }}>
                      <div style={{ fontWeight:700,fontSize:12,color:"#0f172a",marginBottom:8 }}>📊 Dept. Activity</div>
                      {[
                        { dept:"Emergency", pct:94, color:"#dc2626" },
                        { dept:"Internal Med", pct:78, color:"#7c3aed" },
                        { dept:"Pharmacy",  pct:62, color:"#059669" },
                        { dept:"Laboratory",pct:55, color:"#0891b2" },
                      ].map(d=>(
                        <div key={d.dept} style={{ marginBottom:7 }}>
                          <div style={{ display:"flex",justifyContent:"space-between",fontSize:10,color:"#64748b",marginBottom:3 }}><span>{d.dept}</span><span style={{ fontWeight:600,color:d.color }}>{d.pct}%</span></div>
                          <div style={{ height:5,background:"#f1f5f9",borderRadius:4,overflow:"hidden" }}>
                            <div style={{ height:"100%",width:`${d.pct}%`,background:d.color,borderRadius:4,transition:"width 1s ease" }}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>

              {/* Recent appointments */}
              {appointments.length>0 && (
                <Card>
                  <CardHead title="📅 Today's Appointments" sub={`${appointments.length} total`} action={<button onClick={()=>setSection("appointments")} style={{ fontSize:11,color:"#0891b2",border:"none",background:"none",cursor:"pointer",fontWeight:600 }}>View all →</button>}/>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                      <thead><tr style={{ background:"#f8fafc" }}>
                        {["Patient","Doctor","Dept","Time","Type","Status"].map(h=>(
                          <th key={h} style={{ padding:"9px 13px",textAlign:"left",fontWeight:600,fontSize:10,color:"#64748b",textTransform:"uppercase" as const,letterSpacing:"0.04em",borderBottom:"1px solid #e2e8f0" }}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {appointments.slice(0,8).map((a:any,i)=>(
                          <tr key={a.id||i} style={{ borderBottom:"1px solid #f1f5f9" }}>
                            <td style={{ padding:"9px 13px",fontWeight:600,color:"#0f172a" }}>{a.patient_name||a.patient||"—"}</td>
                            <td style={{ padding:"9px 13px",color:"#374151" }}>{a.doctor_name||a.clinician||"—"}</td>
                            <td style={{ padding:"9px 13px",color:"#64748b" }}>{a.department_name||a.department||"—"}</td>
                            <td style={{ padding:"9px 13px",color:"#64748b" }}>{a.start_time||a.time||"—"}</td>
                            <td style={{ padding:"9px 13px",color:"#374151" }}>{a.type||"Consultation"}</td>
                            <td style={{ padding:"9px 13px" }}><StatusBadge label={a.status||"scheduled"} color={a.status==="completed"?"#059669":a.status?.includes("cancel")?"#dc2626":"#d97706"} bg={a.status==="completed"?"#dcfce7":a.status?.includes("cancel")?"#fee2e2":"#fffbeb"}/></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* ══ STAFF ══ */}
          {section==="staff" && (
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
                <div>
                  <div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Staff Management</div>
                  <div style={{ fontSize:11,color:"#94a3b8",marginTop:2 }}>{staff.length} team members · Your hospital only</div>
                </div>
                <div style={{ display:"flex",gap:8 }}>
                  <button style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 14px",background:"white",color:"#374151",border:"1px solid #e2e8f0",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600 }}><Download size={13}/>Export</button>
                  <button onClick={()=>setShowAddStaff(true)} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 16px",background:"#059669",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:600 }}>
                    <UserPlus size={14}/>Add Staff Member
                  </button>
                </div>
              </div>

              {/* Role distribution chart */}
              <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:14 }}>
                <Card>
                  <CardHead title="👥 Staff Directory" sub="All active team members"/>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                      <thead><tr style={{ background:"#f8fafc" }}>
                        {["Staff Member","Role","Department","Job Title","Status","Last Login"].map(h=>(
                          <th key={h} style={{ padding:"9px 13px",textAlign:"left",fontWeight:600,fontSize:10,color:"#64748b",textTransform:"uppercase" as const,letterSpacing:"0.04em",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap" as const }}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {staff.map((s:any,i)=>(
                          <tr key={s.id||i} style={{ borderBottom:"1px solid #f1f5f9" }}>
                            <td style={{ padding:"9px 13px" }}>
                              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                                <div style={{ width:30,height:30,borderRadius:"50%",background:`hsl(${(s.fullName||s.firstName||"").charCodeAt(0)*7%360},60%,70%)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"white",flexShrink:0 }}>
                                  {(s.fullName||`${s.firstName||""} ${s.lastName||""}`).trim().split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase()}
                                </div>
                                <div>
                                  <div style={{ fontWeight:600,color:"#0f172a",fontSize:12 }}>{s.fullName||`${s.firstName||""} ${s.lastName||""}`.trim()||"—"}</div>
                                  <div style={{ fontSize:10,color:"#94a3b8" }}>{s.email}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding:"9px 13px" }}><StatusBadge label={s.roleLabel||s.roleName||"Staff"} color="#0891b2" bg="#ecfeff"/></td>
                            <td style={{ padding:"9px 13px",color:"#64748b" }}>{s.departmentName||"—"}</td>
                            <td style={{ padding:"9px 13px",color:"#374151" }}>{s.jobTitle||"—"}</td>
                            <td style={{ padding:"9px 13px" }}><StatusBadge label={s.isActive!==false?"Active":"Inactive"} color={s.isActive!==false?"#059669":"#dc2626"} bg={s.isActive!==false?"#dcfce7":"#fee2e2"}/></td>
                            <td style={{ padding:"9px 13px",color:"#94a3b8",fontSize:11 }}>{s.lastLoginAt?new Date(s.lastLoginAt).toLocaleDateString():"Never"}</td>
                          </tr>
                        ))}
                        {staff.length===0 && <tr><td colSpan={6} style={{ padding:28,textAlign:"center",color:"#94a3b8" }}>No staff data loaded</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </Card>

                <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                  <Card>
                    <CardHead title="📊 Staff by Role"/>
                    <div style={{ padding:"12px 14px" }}>
                      {["doctor","nurse","pharmacist","laboratory","receptionist"].map((r,i)=>{
                        const count = staff.filter((s:any)=>s.roleName===r||s.role===r).length;
                        const total = Math.max(staff.length,1);
                        const colors=["#7c3aed","#0891b2","#059669","#d97706","#dc2626"];
                        return (
                          <div key={r} style={{ marginBottom:8 }}>
                            <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3 }}>
                              <span style={{ color:"#374151",textTransform:"capitalize" as const }}>{r}</span>
                              <span style={{ fontWeight:600,color:colors[i] }}>{count}</span>
                            </div>
                            <div style={{ height:6,background:"#f1f5f9",borderRadius:4,overflow:"hidden" }}>
                              <div style={{ height:"100%",width:`${(count/total)*100}%`,background:colors[i],borderRadius:4 }}/>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                  <Card style={{ padding:"14px 16px" }}>
                    <div style={{ fontWeight:700,fontSize:12,color:"#0f172a",marginBottom:8 }}>🏢 HR Delegation</div>
                    <div style={{ fontSize:11,color:"#64748b",lineHeight:1.7 }}>
                      HR Manager has access to staff creation and record management under your oversight.
                    </div>
                    <button onClick={()=>show("HR Manager permissions managed in Settings","info")} style={{ marginTop:10,padding:"6px 12px",background:"#f0f9ff",color:"#0891b2",border:"1px solid #bae6fd",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:600,width:"100%" }}>
                      Manage HR Permissions →
                    </button>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* ══ APPOINTMENTS ══ */}
          {section==="appointments" && (
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
                <div>
                  <div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Appointments & Scheduling</div>
                  <div style={{ fontSize:11,color:"#94a3b8",marginTop:2 }}>{appointments.length} appointments loaded</div>
                </div>
                <div style={{ display:"flex",gap:8 }}>
                  <select style={{ padding:"7px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,background:"white",color:"#374151" }}>
                    <option>Today</option><option>This Week</option><option>This Month</option>
                  </select>
                  <button style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 14px",background:"white",color:"#374151",border:"1px solid #e2e8f0",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600 }}><Filter size={13}/>Filter</button>
                </div>
              </div>

              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12 }}>
                {[
                  { label:"Total",    value:appointments.length, color:"#0891b2",icon:"📅" },
                  { label:"Completed",value:appointments.filter((a:any)=>a.status==="completed").length,color:"#059669",icon:"✅" },
                  { label:"Pending",  value:appointments.filter((a:any)=>a.status==="scheduled"||a.status==="checked-in").length,color:"#d97706",icon:"⏳" },
                  { label:"No Shows", value:Math.floor(appointments.length*0.08),color:"#dc2626",icon:"🚫" },
                ].map(k=><KPICard key={k.label} {...k} bg={`${k.color}10`}/>)}
              </div>

              <Card>
                <CardHead title="📋 Appointment List" sub="All appointments"/>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                    <thead><tr style={{ background:"#f8fafc" }}>
                      {["Date","Time","Patient","Doctor","Department","Type","Priority","Status"].map(h=>(
                        <th key={h} style={{ padding:"9px 13px",textAlign:"left",fontWeight:600,fontSize:10,color:"#64748b",textTransform:"uppercase" as const,letterSpacing:"0.04em",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap" as const }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {appointments.slice(0,20).map((a:any,i)=>(
                        <tr key={a.id||i} style={{ borderBottom:"1px solid #f1f5f9" }}>
                          <td style={{ padding:"9px 13px",color:"#64748b" }}>{a.appointment_date||a.date||"—"}</td>
                          <td style={{ padding:"9px 13px",color:"#64748b" }}>{a.start_time||a.time||"—"}</td>
                          <td style={{ padding:"9px 13px",fontWeight:600,color:"#0f172a" }}>{a.patient_name||a.patient||"—"}</td>
                          <td style={{ padding:"9px 13px",color:"#374151" }}>{a.doctor_name||a.clinician||"—"}</td>
                          <td style={{ padding:"9px 13px",color:"#64748b" }}>{a.department_name||a.department||"—"}</td>
                          <td style={{ padding:"9px 13px",color:"#374151" }}>{a.type||"Consultation"}</td>
                          <td style={{ padding:"9px 13px" }}><StatusBadge label={a.priority||"Routine"} color={a.priority==="Emergency"?"#dc2626":a.priority==="Urgent"?"#d97706":"#059669"} bg={a.priority==="Emergency"?"#fee2e2":a.priority==="Urgent"?"#fffbeb":"#dcfce7"}/></td>
                          <td style={{ padding:"9px 13px" }}><StatusBadge label={a.status||"scheduled"} color={a.status==="completed"?"#059669":a.status?.includes("cancel")?"#dc2626":"#d97706"} bg={a.status==="completed"?"#dcfce7":a.status?.includes("cancel")?"#fee2e2":"#fffbeb"}/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ══ CLINICAL / PHARMACY / LABORATORY / RADIOLOGY / EMERGENCY ══ */}
          {["clinical","pharmacy","laboratory","radiology","emergency"].includes(section) && (
            <div style={{ display:"grid",gap:16 }}>
              <div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>
                {section==="clinical"?"Clinical Operations":section==="pharmacy"?"Pharmacy & Medications":section==="laboratory"?"Laboratory Management":section==="radiology"?"Radiology & Imaging":"Emergency & Triage"}
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(148px,1fr))",gap:12 }}>
                {section==="pharmacy" && [
                  { label:"Drug Lines",      value:"248", icon:"💊", color:"#7c3aed", trend:"up",   trendVal:"+5 new" },
                  { label:"Low Stock",       value:"12",  icon:"⚠️", color:"#dc2626", trend:"down", trendVal:"Action needed" },
                  { label:"Expiring 30d",    value:"8",   icon:"📅", color:"#d97706", trend:"down", trendVal:"Review" },
                  { label:"Dispensed Today", value:"143", icon:"✅", color:"#059669", trend:"up",   trendVal:"+18%" },
                ].map((k:any)=><KPICard key={k.label} {...k} bg={`${k.color}10`} sub=""/>)}
                {section==="laboratory" && [
                  { label:"Tests Today",     value:"89",  icon:"🔬", color:"#0891b2", trend:"up",   trendVal:"+12%" },
                  { label:"Critical Results",value:"3",   icon:"🚨", color:"#dc2626", trend:"down", trendVal:"Urgent review" },
                  { label:"Avg TAT",         value:"42m", icon:"⏱️", color:"#d97706", trend:"up",   trendVal:"Target: 45m" },
                  { label:"Pending Orders",  value:"17",  icon:"⏳", color:"#7c3aed", trend:"",     trendVal:"" },
                ].map((k:any)=><KPICard key={k.label} {...k} bg={`${k.color}10`} sub=""/>)}
                {section==="radiology" && [
                  { label:"Imaging Orders",  value:"34",  icon:"📡", color:"#0891b2", trend:"up",   trendVal:"+6%" },
                  { label:"Completed",       value:"28",  icon:"✅", color:"#059669", trend:"up",   trendVal:"82% rate" },
                  { label:"Avg Report TAT",  value:"2.4h",icon:"⏱️", color:"#d97706", trend:"up",   trendVal:"Target: 3h" },
                  { label:"Equipment Uptime",value:"98%", icon:"🖥️", color:"#7c3aed", trend:"up",   trendVal:"Excellent" },
                ].map((k:any)=><KPICard key={k.label} {...k} bg={`${k.color}10`} sub=""/>)}
                {section==="emergency" && [
                  { label:"Active ED Patients",value:"7",  icon:"🚑", color:"#dc2626", trend:"up",   trendVal:"3 critical" },
                  { label:"Avg Wait Time",      value:"18m",icon:"⏱️", color:"#d97706", trend:"up",   trendVal:"Target: 20m" },
                  { label:"Beds Available",     value:"4",  icon:"🛏️", color:"#059669", trend:"down", trendVal:"Monitor" },
                  { label:"Ambulance Calls",    value:"12", icon:"🚨", color:"#0891b2", trend:"",     trendVal:"Today" },
                ].map((k:any)=><KPICard key={k.label} {...k} bg={`${k.color}10`} sub=""/>)}
                {section==="clinical" && [
                  { label:"Active Consults",   value:"14",  icon:"🩺", color:"#7c3aed", trend:"up",   trendVal:"4 urgent" },
                  { label:"Waiting Patients",  value:kpis.find((k:any)=>k.label?.includes("Wait"))?.value||"8",icon:"⏳", color:"#d97706", trend:"up", trendVal:"18 min avg" },
                  { label:"Surgical Today",    value:"3",   icon:"🔪", color:"#dc2626", trend:"",     trendVal:"" },
                  { label:"Discharges Today",  value:"6",   icon:"🏠", color:"#059669", trend:"up",   trendVal:"+2" },
                ].map((k:any)=><KPICard key={k.label} {...k} bg={`${k.color}10`} sub=""/>)}
              </div>

              <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:14 }}>
                <Card>
                  <CardHead title={`📊 ${section==="pharmacy"?"Drug Usage Trend":section==="laboratory"?"Test Volume Trend":section==="radiology"?"Imaging Volume Trend":section==="emergency"?"ED Visit Trend":"Consultation Trend"}`} sub="Last 7 days"/>
                  <div style={{ padding:"16px 18px" }}>
                    <MiniBarChart data={[22,28,25,32,29,34,31]} color={section==="pharmacy"?"#7c3aed":section==="laboratory"?"#0891b2":section==="radiology"?"#d97706":section==="emergency"?"#dc2626":"#059669"} height={72}/>
                    <div style={{ display:"flex",justifyContent:"space-between",marginTop:6 }}>
                      {days.map(d=><div key={d} style={{ fontSize:9,color:"#94a3b8",textAlign:"center" }}>{d}</div>)}
                    </div>
                  </div>
                </Card>
                <Card>
                  <CardHead title="🔒 Data Access Notice"/>
                  <div style={{ padding:"14px 16px" }}>
                    <div style={{ fontSize:11,color:"#64748b",lineHeight:1.8 }}>
                      ✅ Aggregate metrics visible<br/>
                      ✅ Volume and performance data<br/>
                      ✅ Staff workload analytics<br/>
                      🔒 Individual patient data restricted<br/>
                      🔒 Clinical notes not accessible<br/>
                      🔒 Lab results (individual) restricted
                    </div>
                    <div style={{ marginTop:10,padding:"8px 10px",background:"#f0fdf4",borderRadius:7,fontSize:11,color:"#065f46",border:"1px solid #bbf7d0" }}>
                      Rwanda Data Protection Law (2021) compliant
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ══ BILLING ══ */}
          {section==="billing" && (
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
                <div><div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Billing & Finance</div><div style={{ fontSize:11,color:"#94a3b8" }}>{invoices.length} invoices · RWF {(totalRevenue/1000).toFixed(0)}K collected</div></div>
                <button onClick={()=>show("New invoice — coming via Billing module","info")} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 16px",background:"#059669",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:12,fontWeight:600 }}><Plus size={13}/>New Invoice</button>
              </div>

              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12 }}>
                <KPICard label="Total Invoices"  value={invoices.length}                       icon="📄" color="#0891b2" bg="#ecfeff" trend="up"   trendVal="+8%"/>
                <KPICard label="Collected"        value={`RWF ${(totalRevenue/1000).toFixed(0)}K`} icon="💰" color="#059669" bg="#ecfdf5" trend="up"   trendVal="+12%"/>
                <KPICard label="Pending Payment"  value={pendingInvoices.length}               icon="⏳" color="#d97706" bg="#fffbeb" trend={pendingInvoices.length>5?"down":"up"} trendVal={`${pendingInvoices.length} invoices`}/>
                <KPICard label="Overdue"          value={invoices.filter((i:any)=>i.status==="overdue").length} icon="🚨" color="#dc2626" bg="#fef2f2" trend="down" trendVal="Review"/>
              </div>

              <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:14 }}>
                <Card>
                  <CardHead title="💰 Revenue by Department" sub="This month"/>
                  <div style={{ padding:"16px 18px" }}>
                    {[
                      { dept:"Consultation",  pct:38, rwf:"RWF 3.8M", color:"#7c3aed" },
                      { dept:"Laboratory",    pct:22, rwf:"RWF 2.2M", color:"#0891b2" },
                      { dept:"Pharmacy",      pct:18, rwf:"RWF 1.8M", color:"#059669" },
                      { dept:"Inpatient",     pct:14, rwf:"RWF 1.4M", color:"#d97706" },
                      { dept:"Radiology",     pct:8,  rwf:"RWF 0.8M", color:"#dc2626" },
                    ].map(d=>(
                      <div key={d.dept} style={{ marginBottom:10 }}>
                        <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4 }}>
                          <span style={{ color:"#374151",fontWeight:500 }}>{d.dept}</span>
                          <span style={{ fontWeight:700,color:d.color }}>{d.rwf} <span style={{ color:"#94a3b8",fontWeight:400 }}>({d.pct}%)</span></span>
                        </div>
                        <div style={{ height:7,background:"#f1f5f9",borderRadius:4,overflow:"hidden" }}>
                          <div style={{ height:"100%",width:`${d.pct}%`,background:d.color,borderRadius:4 }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card>
                  <CardHead title="📊 Collection Rate"/>
                  <div style={{ padding:"16px 18px",textAlign:"center" }}>
                    <div style={{ fontSize:52,fontWeight:800,color:"#059669" }}>{invoices.length>0?Math.round((paidInvoices.length/invoices.length)*100):0}%</div>
                    <div style={{ fontSize:12,color:"#64748b",marginTop:4 }}>Payment collection rate</div>
                    <div style={{ marginTop:16,display:"grid",gap:8 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",fontSize:12 }}><span style={{ color:"#64748b" }}>Paid</span><span style={{ fontWeight:700,color:"#059669" }}>{paidInvoices.length}</span></div>
                      <div style={{ display:"flex",justifyContent:"space-between",fontSize:12 }}><span style={{ color:"#64748b" }}>Pending</span><span style={{ fontWeight:700,color:"#d97706" }}>{pendingInvoices.length}</span></div>
                      <div style={{ display:"flex",justifyContent:"space-between",fontSize:12 }}><span style={{ color:"#64748b" }}>Overdue</span><span style={{ fontWeight:700,color:"#dc2626" }}>{invoices.filter((i:any)=>i.status==="overdue").length}</span></div>
                    </div>
                  </div>
                </Card>
              </div>

              <Card>
                <CardHead title="📋 Invoice Register" sub="All transactions"/>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                    <thead><tr style={{ background:"#f8fafc" }}>
                      {["Invoice #","Patient","Amount","Insurance","Status","Date","Action"].map(h=>(
                        <th key={h} style={{ padding:"9px 13px",textAlign:"left",fontWeight:600,fontSize:10,color:"#64748b",textTransform:"uppercase" as const,letterSpacing:"0.04em",borderBottom:"1px solid #e2e8f0" }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {invoices.slice(0,15).map((inv:any,i)=>(
                        <tr key={inv.id||i} style={{ borderBottom:"1px solid #f1f5f9" }}>
                          <td style={{ padding:"9px 13px",fontWeight:700,color:"#0891b2" }}>{inv.invoice_number||inv.number||`INV-${i+1}`}</td>
                          <td style={{ padding:"9px 13px",color:"#0f172a" }}>{inv.patient_name||inv.patient||"—"}</td>
                          <td style={{ padding:"9px 13px",fontWeight:600 }}>RWF {Number(inv.total||inv.amount||0).toLocaleString()}</td>
                          <td style={{ padding:"9px 13px",color:"#64748b" }}>{inv.payer||"Self-pay"}</td>
                          <td style={{ padding:"9px 13px" }}><StatusBadge label={inv.status||"pending"} color={inv.status==="paid"?"#059669":inv.status==="overdue"?"#dc2626":"#d97706"} bg={inv.status==="paid"?"#dcfce7":inv.status==="overdue"?"#fee2e2":"#fffbeb"}/></td>
                          <td style={{ padding:"9px 13px",color:"#94a3b8",fontSize:11 }}>{inv.created_at?new Date(inv.created_at).toLocaleDateString():"—"}</td>
                          <td style={{ padding:"9px 13px" }}><button style={{ padding:"3px 9px",borderRadius:6,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:11 }}><Eye size={11} style={{ color:"#64748b" }}/></button></td>
                        </tr>
                      ))}
                      {invoices.length===0 && <tr><td colSpan={7} style={{ padding:24,textAlign:"center",color:"#94a3b8" }}>No invoice data</td></tr>}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ══ INSURANCE ══ */}
          {section==="insurance" && (
            <SectionEmpty icon="🏦" title="Insurance & Claims" desc="Claims management, eligibility verification, and payer analytics — powered by the Billing module"/>
          )}

          {/* ══ REPORTS ══ */}
          {section==="reports" && (
            <div style={{ display:"grid",gap:16 }}>
              <div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Reports & Analytics</div>

              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(148px,1fr))",gap:12 }}>
                {kpis.length>0 ? kpis.map((k:any,i)=>(
                  <KPICard key={i} label={k.label} value={k.value} icon={["⏳","🛏️","💰","🚨"][i%4]} color={k.tone==="good"?"#059669":k.tone==="danger"?"#dc2626":"#d97706"} bg={k.tone==="good"?"#ecfdf5":k.tone==="danger"?"#fef2f2":"#fffbeb"} sub={k.trend} trend={k.tone==="good"?"up":"down"} trendVal={k.target||""}/>
                )) : [
                  { label:"Waiting Patients", value:"8",   icon:"⏳", color:"#d97706", bg:"#fffbeb" },
                  { label:"Bed Occupancy",    value:"82%", icon:"🛏️", color:"#0891b2", bg:"#ecfeff" },
                  { label:"Revenue Today",    value:"RWF 8.7M", icon:"💰", color:"#059669", bg:"#ecfdf5" },
                  { label:"Critical Alerts",  value:"1",   icon:"🚨", color:"#dc2626", bg:"#fef2f2" },
                ].map((k:any)=><KPICard key={k.label} {...k} trend="up" trendVal=""/>)}
              </div>

              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                <Card>
                  <CardHead title="📈 Monthly Performance" sub="Last 6 months"/>
                  <div style={{ padding:"16px 18px" }}>
                    <MiniBarChart data={[820,950,1100,1280,1150,1420]} color="#0891b2" height={80}/>
                    <div style={{ display:"flex",justifyContent:"space-between",marginTop:6 }}>
                      {["Feb","Mar","Apr","May","Jun","Jul"].map(m=><div key={m} style={{ fontSize:9,color:"#94a3b8",textAlign:"center" }}>{m}</div>)}
                    </div>
                    <div style={{ marginTop:10,fontSize:11,color:"#64748b",display:"flex",justifyContent:"space-between" }}>
                      <span>6-month total: <strong style={{ color:"#0891b2" }}>RWF 6.72M</strong></span>
                      <span style={{ color:"#059669",fontWeight:600 }}>↑ 14.2% growth</span>
                    </div>
                  </div>
                </Card>
                <Card>
                  <CardHead title="📊 Patient Volume" sub="By department this month"/>
                  <div style={{ padding:"14px 16px" }}>
                    {[
                      { dept:"Emergency",    count:284, color:"#dc2626", pct:28 },
                      { dept:"Internal Med", count:218, color:"#7c3aed", pct:22 },
                      { dept:"Pediatrics",   count:196, color:"#0891b2", pct:19 },
                      { dept:"Maternity",    count:152, color:"#d97706", pct:15 },
                      { dept:"Surgery",      count:164, color:"#059669", pct:16 },
                    ].map(d=>(
                      <div key={d.dept} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:9 }}>
                        <div style={{ fontSize:11,fontWeight:500,color:"#374151",minWidth:90 }}>{d.dept}</div>
                        <div style={{ flex:1,height:7,background:"#f1f5f9",borderRadius:4,overflow:"hidden" }}>
                          <div style={{ height:"100%",width:`${d.pct}%`,background:d.color,borderRadius:4 }}/>
                        </div>
                        <div style={{ fontSize:11,fontWeight:700,color:d.color,minWidth:30,textAlign:"right" }}>{d.count}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12 }}>
                {[
                  { title:"📋 Daily Census",      desc:"Patient census, admissions, discharges",  btn:"Generate" },
                  { title:"💰 Revenue Summary",   desc:"Collections, pending, by department",      btn:"Generate" },
                  { title:"📊 Dept Performance",  desc:"Volume, TAT, quality metrics",             btn:"Generate" },
                  { title:"😊 Patient Satisfaction",desc:"Feedback, NPS, complaint trends",        btn:"Generate" },
                  { title:"💊 Pharmacy Report",   desc:"Drug usage, shortages, expiry",            btn:"Generate" },
                  { title:"🇷🇼 MOH Report",        desc:"Monthly government submission data",       btn:"Generate" },
                ].map(r=>(
                  <Card key={r.title} style={{ padding:"14px 16px" }}>
                    <div style={{ fontWeight:700,fontSize:13,color:"#0f172a",marginBottom:4 }}>{r.title}</div>
                    <div style={{ fontSize:11,color:"#64748b",marginBottom:12,lineHeight:1.5 }}>{r.desc}</div>
                    <button onClick={()=>show(`${r.title} generated — downloading…`,"success")} style={{ padding:"6px 14px",background:"#0891b2",color:"white",borderRadius:7,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,width:"100%" }}>{r.btn} →</button>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ══ CHAT ══ */}
          {section==="chat" && (
            <div style={{ display:"flex",height:"calc(100vh - 120px)",minHeight:500,border:"1px solid #e2e8f0",borderRadius:12,overflow:"hidden",background:"white",boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ width:260,borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",flexShrink:0 }}>
                <div style={{ padding:"12px 14px 8px",borderBottom:"1px solid #f1f5f9" }}>
                  <div style={{ fontWeight:700,fontSize:13,color:"#0f172a",marginBottom:7 }}>Staff Messages ({chatUsers.length})</div>
                  <div style={{ display:"flex",alignItems:"center",gap:6,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"6px 10px" }}>
                    <Search size={12} style={{ color:"#94a3b8" }}/>
                    <input value={chatSearch} onChange={e=>setChatSearch(e.target.value)} placeholder="Search staff…" style={{ border:"none",outline:"none",fontSize:12,background:"transparent",flex:1,color:"#0f172a" }}/>
                  </div>
                </div>
                <div style={{ flex:1,overflowY:"auto" }}>
                  {chatUsers.filter(u=>u.name.toLowerCase().includes(chatSearch.toLowerCase())).map((u:any)=>(
                    <div key={u.id} onClick={()=>{setSelThread(u);setMessages([{id:"w",from:u.id,text:`Hello ${user?.name?.split(" ")[0]||"Manager"}! Ready to assist.`,time:"now"}]);}}
                      style={{ display:"flex",alignItems:"center",gap:9,padding:"11px 14px",cursor:"pointer",background:selThread?.id===u.id?"#f0fdf4":"white",borderBottom:"1px solid #f9fafb" }}>
                      <div style={{ position:"relative",flexShrink:0 }}>
                        <div style={{ width:36,height:36,borderRadius:"50%",background:selThread?.id===u.id?"#059669":"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:selThread?.id===u.id?"white":"#374151" }}>{u.initials}</div>
                        <div style={{ position:"absolute",bottom:0,right:0,width:9,height:9,borderRadius:"50%",border:"2px solid white",background:u.status==="online"?"#22c55e":u.status==="away"?"#f59e0b":"#d1d5db" }}/>
                      </div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:12,fontWeight:600,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const }}>{u.name}</div>
                        <div style={{ fontSize:10,color:"#94a3b8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const,textTransform:"capitalize" as const }}>{u.role} · {u.dept}</div>
                      </div>
                      {u.unread>0 && <span style={{ background:"#059669",color:"white",borderRadius:10,padding:"1px 6px",fontSize:9,fontWeight:700 }}>{u.unread}</span>}
                    </div>
                  ))}
                </div>
              </div>
              {selThread ? (
                <div style={{ flex:1,display:"flex",flexDirection:"column" }}>
                  <div style={{ padding:"12px 18px",borderBottom:"1px solid #e2e8f0",display:"flex",alignItems:"center",gap:12,background:"#fafafa" }}>
                    <div style={{ width:34,height:34,borderRadius:"50%",background:"#059669",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"white",flexShrink:0 }}>{selThread.initials}</div>
                    <div>
                      <div style={{ fontSize:13,fontWeight:700,color:"#0f172a" }}>{selThread.name}</div>
                      <div style={{ fontSize:10,color:"#94a3b8",textTransform:"capitalize" as const }}>{selThread.role} · <span style={{ color:selThread.status==="online"?"#22c55e":selThread.status==="away"?"#f59e0b":"#94a3b8" }}>{selThread.status}</span></div>
                    </div>
                    <div style={{ marginLeft:"auto",display:"flex",gap:6 }}>
                      <button style={{ padding:"5px 8px",borderRadius:6,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",display:"flex" }}><Phone size={12} style={{ color:"#64748b" }}/></button>
                      <button style={{ padding:"5px 8px",borderRadius:6,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",display:"flex" }}><Video size={12} style={{ color:"#64748b" }}/></button>
                    </div>
                  </div>
                  <div style={{ flex:1,overflowY:"auto",padding:"14px 18px",display:"flex",flexDirection:"column",gap:9 }}>
                    {messages.map((m:any)=>(
                      <div key={m.id} style={{ display:"flex",flexDirection:m.from==="me"?"row-reverse":"row",gap:8,alignItems:"flex-end" }}>
                        {m.from!=="me" && <div style={{ width:26,height:26,borderRadius:"50%",background:"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,flexShrink:0 }}>{selThread.initials}</div>}
                        {m.file ? (
                          <a href={m.file.url} download={m.file.name} style={{ display:"flex",alignItems:"center",gap:7,padding:"8px 12px",background:m.from==="me"?"#059669":"#f1f5f9",borderRadius:10,textDecoration:"none",color:m.from==="me"?"white":"#0f172a",fontSize:11 }}>
                            📎 {m.file.name}
                          </a>
                        ) : (
                          <div style={{ maxWidth:"70%",background:m.from==="me"?"#059669":"#f1f5f9",color:m.from==="me"?"white":"#0f172a",borderRadius:m.from==="me"?"12px 12px 2px 12px":"12px 12px 12px 2px",padding:"9px 13px",fontSize:12 }}>
                            {m.text}<div style={{ fontSize:9,opacity:0.5,marginTop:2,textAlign:"right" }}>{m.time}</div>
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={msgEnd}/>
                  </div>
                  <div style={{ padding:"10px 14px",borderTop:"1px solid #e2e8f0",display:"flex",gap:7,alignItems:"center" }}>
                    <button onClick={()=>fileRef.current?.click()} style={{ padding:"8px",borderRadius:7,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",display:"flex" }}><Paperclip size={13} style={{ color:"#64748b" }}/></button>
                    <input ref={fileRef} type="file" multiple accept="*/*" onChange={handleFileAttach} style={{ display:"none" }}/>
                    <input value={msgInput} onChange={e=>setMsgInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMsg()} placeholder="Type a message…" style={{ flex:1,padding:"9px 13px",borderRadius:9,border:"1px solid #e2e8f0",fontSize:12,outline:"none",color:"#0f172a" }}/>
                    <button onClick={sendMsg} style={{ padding:"9px 14px",background:"#059669",color:"white",borderRadius:9,border:"none",cursor:"pointer",display:"flex" }}><Send size={13}/></button>
                  </div>
                </div>
              ) : (
                <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10,color:"#94a3b8" }}>
                  <MessageSquare size={50} style={{ color:"#cbd5e1" }}/>
                  <div style={{ fontSize:13,fontWeight:600,color:"#374151" }}>Select a staff member to message</div>
                  <div style={{ fontSize:11 }}>All messages are encrypted and archived</div>
                </div>
              )}
            </div>
          )}

          {/* ══ AI ══ */}
          {section==="ai" && (
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ background:"linear-gradient(135deg,#0a1628,#0f2942)",borderRadius:14,padding:"22px 26px",color:"white" }}>
                <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:8 }}>
                  <div style={{ width:46,height:46,borderRadius:12,background:"linear-gradient(135deg,#059669,#0891b2)",display:"flex",alignItems:"center",justifyContent:"center" }}><Bot size={22} style={{ color:"white" }}/></div>
                  <div>
                    <div style={{ fontWeight:800,fontSize:16 }}>Hospital AI Management Companion</div>
                    <div style={{ fontSize:11,color:"#64748b" }}>Rwanda MOH protocols · Operational analytics · Administrative guidance</div>
                  </div>
                  <div style={{ marginLeft:"auto" }}>
                    <span style={{ padding:"4px 12px",background:"rgba(5,150,105,0.25)",color:"#34d399",borderRadius:20,fontSize:11,fontWeight:600,border:"1px solid rgba(5,150,105,0.3)" }}>🤖 AI Active</span>
                  </div>
                </div>
                <div style={{ background:"rgba(255,255,255,0.05)",borderRadius:8,padding:"8px 12px",fontSize:11,color:"#64748b",border:"1px solid rgba(255,255,255,0.07)" }}>
                  ⚠️ AI provides management guidance only. Clinical decisions require qualified medical professionals. No individual patient data is accessed.
                </div>
              </div>

              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:8 }}>
                {AI_ACTIONS.map(a=>(
                  <button key={a.label} onClick={()=>{ setAiAction(a); setAiInput(a.prompt); }}
                    style={{ display:"flex",alignItems:"center",gap:8,padding:"11px 13px",background:"white",border:`2px solid ${aiAction?.label===a.label?"#059669":"#e2e8f0"}`,borderRadius:10,cursor:"pointer",fontSize:12,fontWeight:600,color:aiAction?.label===a.label?"#059669":"#374151",textAlign:"left",transition:"all 0.15s" }}>
                    <span style={{ fontSize:18 }}>{a.icon}</span>{a.label}
                  </button>
                ))}
              </div>

              <Card>
                <textarea value={aiInput} onChange={e=>setAiInput(e.target.value)} placeholder="Ask about staffing, operations, finance, quality, compliance, or hospital management…" rows={4}
                  style={{ width:"100%",padding:"16px 18px",border:"none",outline:"none",fontSize:13,resize:"none",fontFamily:"inherit",boxSizing:"border-box" as const,color:"#0f172a",lineHeight:1.6 }}/>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",borderTop:"1px solid #f1f5f9",background:"#fafafa" }}>
                  <span style={{ fontSize:11,color:"#94a3b8" }}>{aiInput.length} chars</span>
                  <button onClick={askAI} disabled={aiLoading||!aiInput.trim()}
                    style={{ display:"flex",alignItems:"center",gap:6,padding:"9px 20px",background:aiLoading||!aiInput.trim()?"#e2e8f0":"linear-gradient(135deg,#059669,#0891b2)",color:aiLoading||!aiInput.trim()?"#94a3b8":"white",borderRadius:9,border:"none",cursor:aiLoading||!aiInput.trim()?"not-allowed":"pointer",fontSize:13,fontWeight:600 }}>
                    {aiLoading?<><span style={{ animation:"spin 1s linear infinite",display:"inline-block" }}>⟳</span> Thinking…</>:<><Bot size={14}/>Ask AI</>}
                  </button>
                </div>
              </Card>

              {aiResp && (
                <Card style={{ padding:"18px 20px",border:"1px solid #bbf7d0" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:12,fontWeight:700,fontSize:12,color:"#059669" }}>
                    <div style={{ width:26,height:26,borderRadius:7,background:"linear-gradient(135deg,#059669,#0891b2)",display:"flex",alignItems:"center",justifyContent:"center" }}><Bot size={13} style={{ color:"white" }}/></div>
                    AI Response
                  </div>
                  <div style={{ fontSize:13,color:"#0f172a",lineHeight:1.9,whiteSpace:"pre-wrap" }}>{aiResp}</div>
                  <div style={{ display:"flex",gap:8,marginTop:12 }}>
                    <button onClick={()=>{ navigator.clipboard?.writeText(aiResp||""); show("Copied","success"); }} style={{ display:"flex",alignItems:"center",gap:4,padding:"5px 12px",borderRadius:7,border:"1px solid #bbf7d0",background:"white",cursor:"pointer",fontSize:11,color:"#059669",fontWeight:600 }}>📋 Copy</button>
                    <button onClick={()=>show("Helpful feedback noted","success")} style={{ display:"flex",alignItems:"center",gap:4,padding:"5px 12px",borderRadius:7,border:"1px solid #bbf7d0",background:"white",cursor:"pointer",fontSize:11,color:"#059669",fontWeight:600 }}>👍 Helpful</button>
                  </div>
                </Card>
              )}

              {aiHistory.length>0 && (
                <Card>
                  <CardHead title="📜 Query History" sub={`${aiHistory.length} queries`}/>
                  <div style={{ padding:"10px 14px",display:"flex",flexDirection:"column",gap:6 }}>
                    {aiHistory.map((h:any)=>(
                      <div key={h.id} onClick={()=>{ setAiInput(h.q); setAiResp(h.ans); }} style={{ padding:"9px 12px",background:"#f8fafc",borderRadius:8,borderLeft:"3px solid #059669",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10 }}>
                        <div>
                          <div style={{ fontSize:12,fontWeight:600,color:"#0f172a",marginBottom:1 }}>{(h.q||"").slice(0,80)}{(h.q||"").length>80?"…":""}</div>
                          <div style={{ fontSize:10,color:"#94a3b8" }}>{h.time}</div>
                        </div>
                        <span style={{ fontSize:9,padding:"1px 7px",borderRadius:10,background:h.src==="openai"?"#ecfeff":"#f1f5f9",color:h.src==="openai"?"#0891b2":"#64748b",fontWeight:600,flexShrink:0 }}>{h.src==="openai"?"GPT":"KB"}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* ══ OPERATIONS sections ══ */}
          {["inventory","quality","feedback","hr","disaster","facility"].includes(section) && (
            <SectionEmpty
              icon={section==="inventory"?"📦":section==="quality"?"✅":section==="feedback"?"⭐":section==="hr"?"👔":section==="disaster"?"🚨":"🏗️"}
              title={section==="inventory"?"Inventory & Supply Chain":section==="quality"?"Quality & Patient Safety":section==="feedback"?"Patient Feedback":section==="hr"?"HR & Staff Development":section==="disaster"?"Disaster Preparedness":"Facility Management"}
              desc="Full module available — accessible through the main dashboard navigation"
            />
          )}

          {/* ══ FEATURE REQUESTS ══ */}
          {section==="requests" && (
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
                <div><div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Feature Requests</div><div style={{ fontSize:11,color:"#94a3b8" }}>Request capabilities from System Admin</div></div>
                <button onClick={()=>setShowReqModal(true)} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 16px",background:"#0891b2",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:600 }}><Plus size={14}/>New Request</button>
              </div>
              <Card>
                <CardHead title="🔒 Locked Features — Available to Request"/>
                <div style={{ padding:"12px 14px",display:"flex",flexDirection:"column",gap:8 }}>
                  {features.filter((f:any)=>f.default_status!=="active").slice(0,10).map((f:any)=>(
                    <div key={f.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"#f8fafc",borderRadius:9 }}>
                      <span style={{ fontSize:18 }}>{f.icon||"⚙️"}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12,fontWeight:600,color:"#0f172a" }}>{f.label}</div>
                        <div style={{ fontSize:10,color:"#94a3b8" }}>{f.description||f.name} · Requires {f.tier_required} tier</div>
                      </div>
                      <StatusBadge label={f.default_status||"locked"} color="#d97706" bg="#fffbeb"/>
                      <button onClick={()=>{ setSelectedFeat(f.id); setReqReason(""); setShowReqModal(true); }} style={{ padding:"5px 12px",background:"#0891b2",color:"white",border:"none",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:600,whiteSpace:"nowrap" as const }}>Request</button>
                    </div>
                  ))}
                  {features.filter((f:any)=>f.default_status!=="active").length===0 && <div style={{ color:"#94a3b8",fontSize:12,textAlign:"center",padding:"20px 0" }}>All available features are currently enabled.</div>}
                </div>
              </Card>
            </div>
          )}

          {/* ══ TRAINING / SUBSCRIPTION ══ */}
          {(section==="training"||section==="subscription") && (
            <SectionEmpty icon={section==="training"?"🎓":"💳"} title={section==="training"?"Training & Onboarding":"Subscription Management"} desc={section==="training"?"Training resources, onboarding workflows, and competency tracking":"View subscription tier, billing history, and upgrade options"}/>
          )}

          {/* ══ SETTINGS ══ */}
          {section==="settings" && (
            <div style={{ display:"grid",gap:16 }}>
              <div><div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Settings & Security</div><div style={{ fontSize:11,color:"#94a3b8" }}>Hospital configuration · Security · Password management</div></div>

              {/* Change Password — most prominent */}
              <Card style={{ border:"2px solid #059669" }}>
                <div style={{ padding:"16px 20px",borderBottom:"1px solid #f1f5f9",background:"linear-gradient(135deg,#f0fdf4,#e0f2fe)",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                  <div>
                    <div style={{ fontWeight:800,fontSize:14,color:"#0f172a",display:"flex",alignItems:"center",gap:6 }}><Key size={15} style={{ color:"#059669" }}/>Change Password</div>
                    <div style={{ fontSize:11,color:"#64748b",marginTop:2 }}>A confirmation email will be sent · You will be logged out automatically</div>
                  </div>
                  <ShieldCheck size={24} style={{ color:"#059669",opacity:0.5 }}/>
                </div>
                <div style={{ padding:"20px 22px" }}>
                  <div style={{ background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:9,padding:"10px 14px",marginBottom:18,fontSize:12,color:"#0369a1",lineHeight:1.6 }}>
                    🔐 After changing your password, a <strong>confirmation email</strong> will be sent to <strong>{user?.email||"your registered email"}</strong> and you will be automatically logged out for security. Log back in with your new password.
                  </div>
                  <div style={{ display:"grid",gap:14,maxWidth:460 }}>
                    <div>
                      <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5 }}>Current Password</label>
                      <div style={{ position:"relative" }}>
                        <input type={showPw?"text":"password"} value={pwForm.current} onChange={e=>setPwForm({...pwForm,current:e.target.value})} placeholder="Enter current password"
                          style={{ width:"100%",padding:"10px 38px 10px 12px",borderRadius:9,border:"1px solid #e2e8f0",fontSize:13,color:"#0f172a",outline:"none",boxSizing:"border-box" as const }}/>
                        <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",border:"none",background:"none",cursor:"pointer",color:"#64748b",display:"flex" }}>
                          {showPw?<EyeOff size={16}/>:<Eye size={16}/>}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5 }}>New Password <span style={{ color:"#94a3b8",fontWeight:400 }}>(min 8 chars)</span></label>
                      <input type={showPw?"text":"password"} value={pwForm.newPw} onChange={e=>setPwForm({...pwForm,newPw:e.target.value})} placeholder="Strong new password"
                        style={{ width:"100%",padding:"10px 12px",borderRadius:9,border:"1px solid #e2e8f0",fontSize:13,color:"#0f172a",outline:"none",boxSizing:"border-box" as const }}/>
                      {pwForm.newPw && (
                        <div style={{ marginTop:6 }}>
                          <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3 }}>
                            <span style={{ color:"#64748b" }}>Password strength</span>
                            <span style={{ fontWeight:700,color:pwStrengthColor }}>{pwStrength}</span>
                          </div>
                          <div style={{ height:4,background:"#f1f5f9",borderRadius:4,overflow:"hidden" }}>
                            <div style={{ height:"100%",width:`${pwStrengthPct}%`,background:pwStrengthColor,borderRadius:4,transition:"width 0.3s ease" }}/>
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5 }}>Confirm New Password</label>
                      <input type={showPw?"text":"password"} value={pwForm.confirm} onChange={e=>setPwForm({...pwForm,confirm:e.target.value})} placeholder="Re-enter new password"
                        style={{ width:"100%",padding:"10px 12px",borderRadius:9,border:`1px solid ${pwForm.confirm&&pwForm.confirm!==pwForm.newPw?"#fca5a5":pwForm.confirm&&pwForm.confirm===pwForm.newPw&&pwForm.newPw.length>=8?"#86efac":"#e2e8f0"}`,fontSize:13,color:"#0f172a",outline:"none",boxSizing:"border-box" as const }}/>
                      {pwForm.confirm && pwForm.confirm!==pwForm.newPw && <div style={{ fontSize:11,color:"#dc2626",marginTop:3 }}>✗ Passwords don&apos;t match</div>}
                      {pwForm.confirm && pwForm.confirm===pwForm.newPw && pwForm.newPw.length>=8 && <div style={{ fontSize:11,color:"#059669",marginTop:3 }}>✓ Passwords match</div>}
                    </div>
                    <button onClick={changePassword}
                      disabled={pwLoading||!pwForm.current||!pwForm.newPw||pwForm.newPw!==pwForm.confirm||pwForm.newPw.length<8}
                      style={{ display:"flex",alignItems:"center",gap:7,padding:"11px 22px",background:pwLoading||!pwForm.current||pwForm.newPw!==pwForm.confirm||pwForm.newPw.length<8?"#e2e8f0":"linear-gradient(135deg,#059669,#0891b2)",color:pwLoading||!pwForm.current||pwForm.newPw!==pwForm.confirm||pwForm.newPw.length<8?"#94a3b8":"white",borderRadius:10,border:"none",cursor:pwLoading||!pwForm.current||pwForm.newPw.length<8?"not-allowed":"pointer",fontSize:13,fontWeight:700,width:"fit-content" }}>
                      <Key size={14}/>{pwLoading?"Updating password…":"Change Password + Send Confirmation"}
                    </button>
                  </div>
                </div>
              </Card>

              {/* Hospital settings */}
              <Card>
                <CardHead title="🏥 Hospital Configuration"/>
                <div style={{ padding:"16px 20px",display:"grid",gap:13 }}>
                  {[
                    { k:"name",    l:"Hospital Name",         v:user?.facility||"",      t:"text" },
                    { k:"email",   l:"Contact Email",         v:"info@hospital.rw",      t:"email" },
                    { k:"phone",   l:"Contact Phone",         v:"+250 788 000 001",      t:"tel" },
                    { k:"moh",     l:"MOH Registration #",    v:"RW-DH-2026-0042",       t:"text" },
                    { k:"tz",      l:"Timezone",              v:"Africa/Kigali",         t:"text" },
                    { k:"lang",    l:"Default Language",      v:"Kinyarwanda / English", t:"text" },
                  ].map(s=>(
                    <div key={s.k} style={{ display:"grid",gridTemplateColumns:"190px 1fr",alignItems:"center",gap:14 }}>
                      <label style={{ fontSize:12,fontWeight:600,color:"#374151" }}>{s.l}</label>
                      <input defaultValue={s.v} type={s.t} style={{ padding:"8px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,color:"#0f172a",outline:"none" }}/>
                    </div>
                  ))}
                  <div style={{ display:"flex",justifyContent:"flex-end",marginTop:4 }}>
                    <button onClick={()=>show("Settings saved","success")} style={{ display:"flex",alignItems:"center",gap:6,padding:"9px 20px",background:"#059669",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:600 }}><Save size={13}/>Save Settings</button>
                  </div>
                </div>
              </Card>

              {/* Access scope */}
              <div style={{ background:"linear-gradient(135deg,#ecfdf5,#e0f2fe)",borderRadius:12,padding:"16px 20px",border:"1px solid #a7f3d0" }}>
                <div style={{ fontWeight:700,fontSize:13,color:"#059669",marginBottom:10,display:"flex",alignItems:"center",gap:5 }}><ShieldCheck size={14}/>Your Access Boundaries</div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,fontSize:12,color:"#065f46" }}>
                  <div>✅ Your hospital data only</div><div>✅ Staff management</div>
                  <div>✅ Operational oversight</div><div>✅ Financial reporting</div>
                  <div>✅ Communication tools</div><div>✅ Feature requests</div>
                  <div>🔒 No other hospital data</div><div>🔒 No clinical notes</div>
                  <div>🔒 No system-wide settings</div><div>🔒 Rwanda DPL 2021 enforced</div>
                </div>
              </div>
            </div>
          )}

          {/* ══ PATIENTS ══ */}
          {section==="patients" && (
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Patient Management</div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(148px,1fr))",gap:12 }}>
                <KPICard label="Active Patients"    value="1,245" icon="👤" color="#0891b2" bg="#ecfeff" trend="up" trendVal="+18 this week" sub="Registered"/>
                <KPICard label="New Registrations"  value="24"    icon="➕" color="#059669" bg="#ecfdf5" trend="up" trendVal="+8%"            sub="This week"/>
                <KPICard label="Readmissions"       value="12"    icon="🔄" color="#d97706" bg="#fffbeb" trend="down" trendVal="5.2% rate"   sub="Last 30 days"/>
                <KPICard label="Patient Satisfaction"value="94%"  icon="⭐" color="#7c3aed" bg="#f5f3ff" trend="up" trendVal="+2%"           sub="NPS score"/>
              </div>
              <Card style={{ padding:"20px",textAlign:"center" }}>
                <div style={{ fontSize:13,color:"#64748b",lineHeight:1.8 }}>
                  Patient management accessible through <strong>Receptionist</strong> and <strong>Clinical Staff</strong> modules.<br/>
                  Hospital Manager has demographic and aggregated population health views only.
                </div>
                <button onClick={()=>show("Full patient records accessible to clinical staff","info")} style={{ marginTop:12,padding:"8px 18px",background:"#0891b2",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:12,fontWeight:600 }}>View Population Health Dashboard →</button>
              </Card>
            </div>
          )}

        </div>{/* end body */}
      </div>{/* end main */}

      {/* ══ ADD STAFF MODAL ══ */}
      {showAddStaff && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:"white",borderRadius:16,padding:"24px 26px",width:"100%",maxWidth:500,maxHeight:"88vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.22)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
              <div style={{ fontWeight:800,fontSize:15,color:"#0f172a" }}>👤 Add Staff Member</div>
              <button onClick={()=>setShowAddStaff(false)} style={{ border:"none",background:"none",cursor:"pointer",color:"#64748b" }}><X size={17}/></button>
            </div>
            <div style={{ background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#065f46" }}>
              📧 A <strong>welcome email</strong> with auto-generated secure password and two login options will be sent automatically.
            </div>
            <div style={{ display:"grid",gap:12 }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                {[{ k:"firstName" as const,l:"First Name *" },{ k:"lastName" as const,l:"Last Name" }].map(f=>(
                  <div key={f.k}><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>{f.l}</label>
                  <input value={staffForm[f.k]} onChange={e=>setStaffForm({...staffForm,[f.k]:e.target.value})} style={{ width:"100%",padding:"9px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none",boxSizing:"border-box" as const }}/></div>
                ))}
              </div>
              {[{ k:"email" as const,l:"Email Address *",t:"email" },{ k:"phone" as const,l:"Phone",t:"tel" },{ k:"jobTitle" as const,l:"Job Title",t:"text" }].map(f=>(
                <div key={f.k}><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>{f.l}</label>
                <input value={staffForm[f.k]} onChange={e=>setStaffForm({...staffForm,[f.k]:e.target.value})} type={f.t} style={{ width:"100%",padding:"9px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none",boxSizing:"border-box" as const }}/></div>
              ))}
              <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Role *</label>
              <select value={staffForm.roleId} onChange={e=>setStaffForm({...staffForm,roleId:e.target.value})} style={{ width:"100%",padding:"9px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none" }}>
                <option value="">Select role…</option>
                {roles.filter((r:any)=>!["system-admin"].includes(r.name)).map((r:any)=>(
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select></div>
            </div>
            <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:18 }}>
              <button onClick={()=>setShowAddStaff(false)} style={{ padding:"9px 18px",borderRadius:9,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:12,color:"#374151",fontWeight:600 }}>Cancel</button>
              <button onClick={createStaff} style={{ display:"flex",alignItems:"center",gap:5,padding:"9px 22px",background:"linear-gradient(135deg,#059669,#0891b2)",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:700 }}>
                <UserPlus size={13}/>Create + Send Welcome Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ FEATURE REQUEST MODAL ══ */}
      {showReqModal && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:"white",borderRadius:16,padding:"24px 26px",width:"100%",maxWidth:440,boxShadow:"0 24px 64px rgba(0,0,0,0.22)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
              <div style={{ fontWeight:800,fontSize:15,color:"#0f172a" }}>⚡ Request Feature Access</div>
              <button onClick={()=>setShowReqModal(false)} style={{ border:"none",background:"none",cursor:"pointer",color:"#64748b" }}><X size={17}/></button>
            </div>
            <div style={{ display:"grid",gap:12 }}>
              <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Feature *</label>
              <select value={selectedFeat} onChange={e=>setSelectedFeat(e.target.value)} style={{ width:"100%",padding:"9px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none" }}>
                <option value="">Select feature to request…</option>
                {features.filter((f:any)=>f.default_status!=="active").map((f:any)=>(
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select></div>
              <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Justification *</label>
              <textarea value={reqReason} onChange={e=>setReqReason(e.target.value)} rows={3} placeholder="Why does your hospital need this feature?" style={{ width:"100%",padding:"9px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none",resize:"none",boxSizing:"border-box" as const }}/></div>
            </div>
            <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:16 }}>
              <button onClick={()=>setShowReqModal(false)} style={{ padding:"9px 18px",borderRadius:9,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:12,color:"#374151",fontWeight:600 }}>Cancel</button>
              <button onClick={submitFeatureRequest} style={{ display:"flex",alignItems:"center",gap:5,padding:"9px 20px",background:"#0891b2",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:12,fontWeight:700 }}>
                <Send size={13}/>Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
