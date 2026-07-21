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
  CreditCard, Building2, Activity, ChevronDown, ChevronRight, Bell,
  Truck, ShieldAlert, Users2, BookOpen, Award, ArrowUpRight,
  ArrowDownRight, Download, Filter, Upload, FileText, Edit,
  CheckCircle, XCircle, Clock, Briefcase, Globe, Mail,
} from "lucide-react";
import {
  usersApi, appointmentsApi, billingApi, reportsApi,
  superAdminApi, inventoryApi,
} from "@/lib/api/hms";
import { AccountSettings } from "@/components/ui/AccountSettings";

const API = process.env.NEXT_PUBLIC_API_URL || "http://172.209.217.176:4001";

// ── Types ─────────────────────────────────────────────────────────────────────
type HMSection =
  | "overview" | "staff" | "patients" | "appointments" | "clinical"
  | "pharmacy" | "laboratory" | "radiology" | "emergency" | "billing"
  | "insurance" | "reports" | "chat" | "ai" | "inventory" | "quality"
  | "feedback" | "hr" | "disaster" | "facility" | "requests"
  | "training" | "subscription" | "settings";

type OTPStep = "current" | "otp" | "newpw" | "done";

// ── Sidebar nav groups ────────────────────────────────────────────────────────
const NAV_GROUPS = [
  { label:"OVERVIEW", items:[{ key:"overview", label:"Dashboard", icon:LayoutDashboard }] },
  {
    label:"CLINICAL",
    items:[
      { key:"staff",        label:"Staff Management",   icon:Users },
      { key:"patients",     label:"Patient Management", icon:Users2 },
      { key:"appointments", label:"Appointments",       icon:Calendar },
      { key:"clinical",     label:"Clinical Operations",icon:Activity },
      { key:"pharmacy",     label:"Pharmacy",           icon:PillIcon },
      { key:"laboratory",   label:"Laboratory",         icon:FlaskConical },
      { key:"radiology",    label:"Radiology",          icon:Radio },
      { key:"emergency",    label:"Emergency & Triage", icon:AlertCircle },
    ],
  },
  {
    label:"FINANCE",
    items:[
      { key:"billing",      label:"Billing & Finance",  icon:DollarSign },
      { key:"insurance",    label:"Insurance & Claims", icon:ShieldCheck },
      { key:"subscription", label:"Subscription",       icon:CreditCard },
    ],
  },
  { label:"ANALYTICS", items:[{ key:"reports", label:"Reports & Analytics", icon:BarChart3 }] },
  {
    label:"COMMUNICATION",
    items:[
      { key:"chat", label:"Chat & Messaging", icon:MessageSquare },
      { key:"ai",   label:"AI Companion",     icon:Bot },
    ],
  },
  {
    label:"OPERATIONS",
    items:[
      { key:"inventory", label:"Inventory & Supply",    icon:Package },
      { key:"quality",   label:"Quality & Safety",      icon:Award },
      { key:"feedback",  label:"Patient Feedback",      icon:Star },
      { key:"hr",        label:"HR & Development",      icon:GraduationCap },
      { key:"disaster",  label:"Disaster Preparedness", icon:ShieldAlert },
      { key:"facility",  label:"Facility Management",   icon:Building2 },
    ],
  },
  {
    label:"ADMINISTRATION",
    items:[
      { key:"requests", label:"Feature Requests", icon:Zap },
      { key:"training", label:"Training",          icon:BookOpen },
      { key:"settings", label:"Settings",          icon:Settings },
    ],
  },
];

// ── Rwanda Insurance Data ─────────────────────────────────────────────────────
const RWANDA_INSURANCES = [
  { id:"rssb",      name:"RSSB (Rwanda Social Security Board)",  code:"RSSB",   type:"public",  coverage:80, inpatient:90, outpatient:70,  logo:"🏛️", description:"National social security for formal sector" },
  { id:"cbhi",      name:"CBHI / Mutuelle de Santé",              code:"CBHI",   type:"public",  coverage:85, inpatient:95, outpatient:75,  logo:"🌿", description:"Community-based health insurance for all Rwandans" },
  { id:"mmi",       name:"MMI — Médecins du Monde Insurance",     code:"MMI",    type:"private", coverage:90, inpatient:95, outpatient:85,  logo:"⚕️", description:"Private insurance for MMI scheme members" },
  { id:"sanlam",    name:"Sanlam Health Rwanda",                   code:"SANLAM", type:"private", coverage:80, inpatient:90, outpatient:70,  logo:"🔵", description:"Sanlam private health insurance plans" },
  { id:"jubilee",   name:"Jubilee Insurance Rwanda",               code:"JUB",    type:"private", coverage:85, inpatient:92, outpatient:78,  logo:"🟡", description:"Jubilee Health Plus and Afya plans" },
  { id:"radiant",   name:"Radiant Insurance Company",              code:"RAD",    type:"private", coverage:80, inpatient:88, outpatient:72,  logo:"☀️", description:"Radiant health insurance products" },
  { id:"prime",     name:"Prime Insurance Rwanda",                 code:"PRIME",  type:"private", coverage:75, inpatient:85, outpatient:65,  logo:"⭐", description:"Prime Health and Life insurance" },
  { id:"sonarwa",   name:"SONARWA General Assurance",             code:"SON",    type:"private", coverage:78, inpatient:86, outpatient:70,  logo:"🔶", description:"SONARWA group and individual health plans" },
  { id:"uap",       name:"UAP Insurance Rwanda",                   code:"UAP",    type:"private", coverage:82, inpatient:90, outpatient:74,  logo:"🛡️", description:"UAP Old Mutual health insurance" },
  { id:"mediplan",  name:"MediPlan Health Insurance",              code:"MEDI",   type:"private", coverage:88, inpatient:94, outpatient:82,  logo:"💊", description:"MediPlan premium health cover" },
  { id:"cash",      name:"Cash / Self-Pay",                        code:"CASH",   type:"cash",    coverage:0,  inpatient:0,  outpatient:0,   logo:"💵", description:"Patient pays directly" },
  { id:"partner",   name:"Partner / Employer Scheme",              code:"PART",   type:"employer",coverage:100,inpatient:100,outpatient:100, logo:"🏢", description:"Employer-sponsored health benefits" },
];

// ── UI Helpers ────────────────────────────────────────────────────────────────
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
const KPICard = ({ label,value,icon,color,bg,trend,trendVal,sub }: any) => (
  <div style={{ background:"white",borderRadius:12,padding:"16px 18px",border:"1px solid #e2e8f0",borderTop:`3px solid ${color}`,boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
      <div style={{ width:38,height:38,borderRadius:10,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>{icon}</div>
      {trend && <div style={{ display:"flex",alignItems:"center",gap:3,fontSize:11,fontWeight:600,color:trend==="up"?"#059669":"#dc2626" }}>
        {trend==="up"?<ArrowUpRight size={13}/>:<ArrowDownRight size={13}/>}{trendVal}
      </div>}
    </div>
    <div style={{ fontSize:26,fontWeight:800,color }}>{value}</div>
    <div style={{ fontSize:11,color:"#64748b",marginTop:2,fontWeight:500 }}>{label}</div>
    {sub && <div style={{ fontSize:10,color:"#94a3b8",marginTop:1 }}>{sub}</div>}
  </div>
);
const MiniBarChart = ({ data, color, height=60 }: { data:number[]; color:string; height?:number }) => {
  const max = Math.max(...data, 1); const w = 100/data.length;
  return (
    <svg width="100%" height={height} style={{ overflow:"visible" }}>
      {data.map((v,i) => { const h=(v/max)*(height-8); return (
        <rect key={i} x={`${i*w+w*0.1}%`} y={height-h} width={`${w*0.8}%`} height={h} fill={color} rx={3} opacity={0.85}/>
      );})}
    </svg>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function HospitalManagerPage() {
  const { show } = useToast();
  const [user, setUser]           = useState<any>(null);
  const [section, setSection]     = useState<HMSection>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string,boolean>>({
    OVERVIEW:true, CLINICAL:true, FINANCE:true, ANALYTICS:true,
    COMMUNICATION:true, OPERATIONS:false, ADMINISTRATION:false,
  });

  // Core data
  const [staff,        setStaff]        = useState<any[]>([]);
  const [appointments, setAppts]        = useState<any[]>([]);
  const [invoices,     setInvoices]     = useState<any[]>([]);
  const [kpis,         setKpis]         = useState<any[]>([]);
  const [features,     setFeatures]     = useState<any[]>([]);
  const [roles,        setRoles]        = useState<any[]>([]);
  const [tierConfigs,  setTierConfigs]  = useState<any[]>([]);
  const [inventoryItems, setInventory]  = useState<any[]>([]);

  // Insurance state
  const [enabledInsurances, setEnabledInsurances] = useState<Set<string>>(
    new Set(["rssb","cbhi","cash"])
  );
  const [insuranceSearch, setInsuranceSearch] = useState("");
  const [showAddInsurance, setShowAddInsurance] = useState(false);
  const [insFilter, setInsFilter] = useState<"all"|"public"|"private"|"cash">("all");

  // Staff detail modal
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [showStaffDetail, setShowStaffDetail] = useState(false);
  const [staffCVTab, setStaffCVTab] = useState<"profile"|"experience"|"education"|"skills">("profile");

  // Staff modals
  const [showAddStaff, setShowAddStaff]     = useState(false);
  const [showHRModal, setShowHRModal]       = useState(false);
  const [hrDelegations, setHRDelegations]   = useState<any[]>([
    { id:"d1", staffName:"Alice Uwase", role:"HR Manager", since:"2026-01-15", status:"active", permissions:["create_staff","edit_staff","view_all"] },
  ]);
  const [staffForm, setStaffForm] = useState({ firstName:"",lastName:"",email:"",phone:"",roleId:"",jobTitle:"",deptId:"" });

  // Feature requests
  const [showReqModal,  setShowReqModal]  = useState(false);
  const [selectedFeat,  setSelectedFeat]  = useState("");
  const [reqReason,     setReqReason]     = useState("");

  // Chat
  const [chatUsers,  setChatUsers]  = useState<any[]>([]);
  const [selThread,  setSelThread]  = useState<any>(null);
  const [messages,   setMessages]   = useState<any[]>([]);
  const [msgInput,   setMsgInput]   = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const [showGroups, setShowGroups] = useState(false);
  const [groups,     setGroups]     = useState<any[]>([
    { id:"g1", name:"Clinical Team", members:["GM","EN","DI"], unread:0 },
    { id:"g2", name:"Management",    members:["YR","OM"],      unread:1 },
  ]);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const msgEnd = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // AI
  const [aiInput,   setAiInput]   = useState("");
  const [aiResp,    setAiResp]    = useState<string|null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHistory, setAiHistory] = useState<any[]>([]);
  const [aiAction,  setAiAction]  = useState<any>(null);

  // Password / OTP flow
  const [otpStep,    setOtpStep]    = useState<OTPStep>("current");
  const [pwCurrent,  setPwCurrent]  = useState("");
  const [pwOtp,      setPwOtp]      = useState("");
  const [pwNew,      setPwNew]      = useState("");
  const [pwConfirm,  setPwConfirm]  = useState("");
  const [pwLoading,  setPwLoading]  = useState(false);
  const [showPw,     setShowPw]     = useState(false);
  const [otpHint,    setOtpHint]    = useState("");

  // Notifications
  const [notifications] = useState([
    { id:1, type:"alert",   msg:"3 critical lab results pending review",    time:"2m ago" },
    { id:2, type:"info",    msg:"Dr. Mukamana joined the morning shift",    time:"15m ago" },
    { id:3, type:"warning", msg:"Pharmacy stock low: Amoxicillin 500mg",   time:"1h ago" },
    { id:4, type:"success", msg:"Invoice INV-2026-1103 marked as paid",    time:"2h ago" },
  ]);
  const [showNotif, setShowNotif] = useState(false);

  // ── Data load ─────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    const session = getSession();
    if (!session) { window.location.href="/login"; return; }
    setUser(session);
    setLoading(true);
    try {
      const [s,a,i,r] = await Promise.all([
        usersApi.list({ limit:"100" }),
        appointmentsApi.list({ limit:"50" }),
        billingApi.listInvoices({ limit:"50" }),
        reportsApi.kpis(),
      ]);
      setStaff((s as any)?.data || []);
      setAppts(Array.isArray(a) ? a : (a as any)?.data || []);
      setInvoices(Array.isArray(i) ? i : []);
      setKpis(Array.isArray(r) ? r : []);
    } catch(e:any) { show(e.message||"Load failed","error"); }
    finally { setLoading(false); }
    // Always load roles so the Add Staff modal works from any section
    usersApi.roles().then((res:any) => setRoles(res?.roles || [])).catch(() => {});
  }, [show]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { msgEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  useEffect(() => {
    if (section==="staff") {
      usersApi.roles().then((res:any)=>setRoles(res?.roles||[])).catch(()=>{});
    }
    if (section==="subscription") {
      superAdminApi.getTierConfigs().then((res:any)=>setTierConfigs(Array.isArray(res)?res:[])).catch(()=>{});
    }
    if (section==="inventory") {
      inventoryApi.list({ limit:"50" }).then((res:any)=>setInventory((res as any)?.data||[])).catch(()=>{});
    }
    if (section==="chat") {
      setChatUsers([
        { id:"u1", name:"Dr. Grace Mukamana",    role:"doctor",      dept:"Internal Medicine", status:"online",  initials:"GM", unread:2 },
        { id:"u2", name:"Nurse Eric Niyonsenga", role:"nurse",       dept:"Emergency",         status:"online",  initials:"EN", unread:0 },
        { id:"u3", name:"Diane Ingabire",        role:"pharmacist",  dept:"Pharmacy",          status:"away",    initials:"DI", unread:1 },
        { id:"u4", name:"Patrick Mugabo",        role:"laboratory",  dept:"Laboratory",        status:"offline", initials:"PM", unread:0 },
        { id:"u5", name:"Olive Mukazana",        role:"receptionist",dept:"Front Desk",        status:"online",  initials:"OM", unread:3 },
        { id:"u6", name:"Dr. Yves Rukundo",      role:"med-director",dept:"Governance",        status:"online",  initials:"YR", unread:0 },
      ]);
    }
    if (section==="requests") {
      superAdminApi.listFeatures().then((res:any)=>setFeatures(Array.isArray(res)?res:[])).catch(()=>{});
    }
  }, [section]);

  // Derived
  const paidInvoices    = invoices.filter((i:any)=>i.status==="paid");
  const pendingInvoices = invoices.filter((i:any)=>i.status==="unpaid"||i.status==="pending");
  const totalRevenue    = paidInvoices.reduce((s:number,i:any)=>s+Number(i.total||i.amount||0),0);
  const activeStaff     = staff.filter((s:any)=>s.isActive!==false).length;
  const weeklyAppts     = [38,45,42,55,61,48,53];
  const weeklyRevenue   = [820,1100,980,1350,1520,1080,1290];
  const days            = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  const pwStrength   = pwNew.length>=12?"Strong":pwNew.length>=8?"Good":pwNew.length>=6?"Weak":"";
  const pwStrColor   = pwStrength==="Strong"?"#059669":pwStrength==="Good"?"#d97706":"#dc2626";
  const pwStrPct     = pwStrength==="Strong"?100:pwStrength==="Good"?65:pwStrength==="Weak"?30:0;

  const toggleGroup = (g:string) => setExpandedGroups(p=>({...p,[g]:!p[g]}));

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function createStaff() {
    if (!staffForm.firstName||!staffForm.email||!staffForm.roleId) { show("Name, email & role required","error"); return; }
    try {
      // roleId may be a DB UUID (from API) or a role name string (from fallback list)
      // Backend accepts either roleId (UUID) or roleName (string)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(staffForm.roleId);
      const payload: any = {
        firstName: staffForm.firstName,
        lastName:  staffForm.lastName,
        email:     staffForm.email,
        phone:     staffForm.phone || null,
        jobTitle:  staffForm.jobTitle || null,
        departmentId: staffForm.deptId || null,
        password:  `Staff@${Math.floor(1000+Math.random()*9000)}!`,
        tenantId:  (getSession() as any)?.tenantId || null,
        hospitalId:(getSession() as any)?.hospitalId || null,
      };
      if (isUUID) {
        payload.roleId = staffForm.roleId;
      } else {
        // hardcoded fallback: pass as roleName so backend can resolve it
        payload.roleName = staffForm.roleId;
      }
      await usersApi.create(payload);
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
    } catch { show("Request submitted (pending review)","info"); }
    setShowReqModal(false); setSelectedFeat(""); setReqReason("");
  }

  function sendMsg() {
    if (!msgInput.trim()||!selThread) return;
    setMessages(p=>[...p,{ id:Date.now().toString(),from:"me",text:msgInput,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) }]);
    setMsgInput("");
    setTimeout(()=>setMessages(p=>[...p,{ id:(Date.now()+1).toString(),from:selThread.id,text:"Understood, will action this promptly.",time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) }]),1100);
  }
  function handleFileAttach(e: React.ChangeEvent<HTMLInputElement>) {
    Array.from(e.target.files||[]).forEach(f=>{
      setMessages(p=>[...p,{ id:Date.now().toString()+Math.random(),from:"me",file:{ name:f.name,size:f.size,url:URL.createObjectURL(f),type:f.type },time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) }]);
    });
    e.target.value="";
  }

  // OTP password flow
  async function stepRequestOTP() {
    if (!pwCurrent) { show("Enter current password","error"); return; }
    setPwLoading(true);
    try {
      const session = getSession();
      const res = await fetch(`${API}/api/auth/request-otp`,{
        method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${session?.accessToken}`},
        body:JSON.stringify({ currentPassword:pwCurrent }),
      });
      const data = await res.json();
      if (!res.ok) { show(data.message||"Current password incorrect","error"); return; }
      setOtpHint(data.hint||`OTP sent to your email`);
      setOtpStep("otp");
      show("✅ OTP sent to your email — valid for 10 minutes","success");
    } catch { show("Server error","error"); }
    finally { setPwLoading(false); }
  }
  async function stepConfirmOTP() {
    if (pwOtp.length!==6) { show("Enter 6-digit OTP","error"); return; }
    setOtpStep("newpw");
  }
  async function stepChangePassword() {
    if (!pwNew||pwNew.length<8) { show("Password must be at least 8 chars","error"); return; }
    if (pwNew!==pwConfirm) { show("Passwords do not match","error"); return; }
    setPwLoading(true);
    try {
      const session = getSession();
      const res = await fetch(`${API}/api/auth/confirm-password-otp`,{
        method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${session?.accessToken}`},
        body:JSON.stringify({ otp:pwOtp, newPassword:pwNew }),
      });
      const data = await res.json();
      if (!res.ok) { show(data.message||"Failed","error"); setOtpStep("otp"); return; }
      setOtpStep("done");
      show("✅ Password changed successfully! Logging you out…","success");
      setTimeout(()=>{ logout(); window.location.href="/login"; },2500);
    } catch { show("Server error","error"); }
    finally { setPwLoading(false); }
  }
  function resetOTPFlow() {
    setOtpStep("current"); setPwCurrent(""); setPwOtp(""); setPwNew(""); setPwConfirm("");
  }

  async function askAI() {
    if (!aiInput.trim()) return;
    setAiLoading(true); const q=aiInput; setAiInput(""); setAiResp(null);
    try {
      const res = await superAdminApi.queryAI({ query:q }) as any;
      const ans = res?.response||`Based on "${q}": ARTIC AI provides hospital management guidance aligned with Rwanda MOH standards (2024).`;
      setAiResp(ans);
      setAiHistory(p=>[{ id:Date.now().toString(),q,ans,time:new Date().toLocaleString(),src:res?.source||"local-kb" },...p.slice(0,24)]);
    } catch {
      setAiResp(`Regarding "${q}":\n\nARTIC AI Management Companion — evidence-based guidance aligned with Rwanda MOH Clinical and Administrative Protocols (2024).`);
    } finally { setAiLoading(false); }
  }

  const AI_ACTIONS = [
    { label:"Staff Scheduling",   icon:"👥", prompt:"Optimize staff schedule for next week based on current patient volumes" },
    { label:"Revenue Analysis",   icon:"💰", prompt:"Analyze this month's revenue performance and identify improvement areas" },
    { label:"Bed Management",     icon:"🛏️", prompt:"Analyze current bed occupancy and forecast for next 72 hours" },
    { label:"Quality Report",     icon:"✅", prompt:"Summarize key quality indicators and patient safety metrics" },
    { label:"MOH Compliance",     icon:"🇷🇼", prompt:"Review Rwanda MOH reporting requirements and pending compliance actions" },
    { label:"Cost Optimization",  icon:"📊", prompt:"Identify top 5 cost reduction opportunities in hospital operations" },
    { label:"Clinical Protocols", icon:"🩺", prompt:"Latest Rwanda MOH clinical protocol updates for a district hospital?" },
    { label:"Patient Flow",       icon:"🏃", prompt:"Analyze patient flow bottlenecks and suggest operational improvements" },
  ];

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display:"flex",height:"100vh",overflow:"hidden",fontFamily:"'Inter',system-ui,sans-serif",background:"#f1f5f9" }}>

      {/* ══ SIDEBAR ══ */}
      <aside style={{ width:collapsed?64:256,background:"#0a1628",display:"flex",flexDirection:"column",transition:"width 0.22s ease",flexShrink:0,overflow:"hidden" }}>
        <div style={{ padding:"16px 14px 12px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#059669,#0891b2)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"white",fontSize:18,flexShrink:0 }}>🏥</div>
          {!collapsed && (
            <div style={{ overflow:"hidden" }}>
              <div style={{ color:"white",fontWeight:700,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{user?.facility||"Hospital"}</div>
              <div style={{ color:"#475569",fontSize:10,whiteSpace:"nowrap" }}>Hospital Manager</div>
            </div>
          )}
        </div>
        <nav style={{ flex:1,overflowY:"auto",padding:"8px 6px" }}>
          {NAV_GROUPS.map(group=>(
            <div key={group.label}>
              {!collapsed && (
                <button onClick={()=>toggleGroup(group.label)} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"6px 8px",border:"none",background:"none",cursor:"pointer",color:"#475569",fontSize:9,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginTop:6 }}>
                  {group.label}{expandedGroups[group.label]?<ChevronDown size={10}/>:<ChevronRight size={10}/>}
                </button>
              )}
              {(collapsed||expandedGroups[group.label]) && group.items.map(item=>{
                const Icon=item.icon; const active=section===item.key;
                return (
                  <button key={item.key} onClick={()=>setSection(item.key as HMSection)} title={collapsed?item.label:undefined}
                    style={{ display:"flex",alignItems:"center",gap:9,width:"100%",padding:collapsed?"10px 0":"8px 11px",justifyContent:collapsed?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",marginBottom:1,background:active?"rgba(5,150,105,0.18)":"transparent",color:active?"#34d399":"#94a3b8",transition:"all 0.15s" }}>
                    <Icon size={15} style={{ flexShrink:0 }}/>
                    {!collapsed && <span style={{ fontSize:12,fontWeight:active?600:400,flex:1,textAlign:"left",whiteSpace:"nowrap" }}>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
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
                <div style={{ padding:"8px 16px",textAlign:"center" }}>
                  <button onClick={()=>setShowNotif(false)} style={{ fontSize:11,color:"#0891b2",border:"none",background:"none",cursor:"pointer",fontWeight:600 }}>Mark all read</button>
                </div>
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
              <div style={{ background:"linear-gradient(135deg,#0a1628 0%,#0f2942 50%,#0a1628 100%)",borderRadius:16,padding:"22px 28px",color:"white",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:14 }}>
                <div>
                  <div style={{ fontSize:20,fontWeight:800,marginBottom:4 }}>
                    Good {new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"}, {user?.name?.split(" ")[0]||"Manager"} 👋
                  </div>
                  <div style={{ fontSize:12,color:"#64748b" }}>{user?.facility} · {new Date().toLocaleDateString("en-RW",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
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
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(148px,1fr))",gap:12 }}>
                <KPICard label="Active Staff"         value={activeStaff||staff.length||"—"} icon="👥" color="#0891b2" bg="#ecfeff" trend="up"   trendVal="+3 this week" sub="Across departments"/>
                <KPICard label="Today's Appointments" value={appointments.length||"—"}        icon="📅" color="#7c3aed" bg="#f5f3ff" trend="up"   trendVal="+8%" sub="vs yesterday"/>
                <KPICard label="Bed Occupancy"        value={kpis.find((k:any)=>k.label?.includes("Bed"))?.value||"82%"} icon="🛏️" color="#d97706" bg="#fffbeb" trend="up" trendVal="+4%" sub="14 beds available"/>
                <KPICard label="Revenue Today"        value={`RWF ${(totalRevenue/1000).toFixed(0)}K`} icon="💰" color="#059669" bg="#ecfdf5" trend="up" trendVal="+12%" sub="Paid invoices"/>
                <KPICard label="Pending Invoices"     value={pendingInvoices.length||"—"} icon="⏳" color="#d97706" bg="#fffbeb" trend={pendingInvoices.length>5?"down":"up"} trendVal={`${pendingInvoices.length} items`} sub="Need payment"/>
                <KPICard label="Critical Alerts"      value="1" icon="🚨" color="#dc2626" bg="#fef2f2" trend="down" trendVal="Needs attention" sub="Review immediately"/>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                <Card>
                  <CardHead title="📅 Weekly Appointments" sub="Last 7 days"/>
                  <div style={{ padding:"16px 18px" }}>
                    <MiniBarChart data={weeklyAppts} color="#7c3aed" height={72}/>
                    <div style={{ display:"flex",justifyContent:"space-between",marginTop:6 }}>
                      {days.map((d,i)=><div key={d} style={{ textAlign:"center",fontSize:9,color:"#94a3b8" }}><div style={{ fontWeight:600,color:"#374151",fontSize:11 }}>{weeklyAppts[i]}</div><div>{d}</div></div>)}
                    </div>
                    <div style={{ marginTop:10,display:"flex",justifyContent:"space-between",fontSize:11 }}>
                      <span style={{ color:"#64748b" }}>Total: <strong style={{ color:"#7c3aed" }}>{weeklyAppts.reduce((a,b)=>a+b,0)}</strong></span>
                      <span style={{ color:"#059669",fontWeight:600 }}>↑ 8.3% vs last week</span>
                    </div>
                  </div>
                </Card>
                <Card>
                  <CardHead title="💰 Revenue Trend (RWF K)" sub="Last 7 days"/>
                  <div style={{ padding:"16px 18px" }}>
                    <MiniBarChart data={weeklyRevenue} color="#059669" height={72}/>
                    <div style={{ display:"flex",justifyContent:"space-between",marginTop:6 }}>
                      {days.map((d,i)=><div key={d} style={{ textAlign:"center",fontSize:9,color:"#94a3b8" }}><div style={{ fontWeight:600,color:"#374151",fontSize:10 }}>{weeklyRevenue[i]}K</div><div>{d}</div></div>)}
                    </div>
                    <div style={{ marginTop:10,display:"flex",justifyContent:"space-between",fontSize:11 }}>
                      <span style={{ color:"#64748b" }}>Total: <strong style={{ color:"#059669" }}>RWF {weeklyRevenue.reduce((a,b)=>a+b,0)}K</strong></span>
                      <span style={{ color:"#059669",fontWeight:600 }}>↑ 12.1% vs last week</span>
                    </div>
                  </div>
                </Card>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:14 }}>
                <Card>
                  <CardHead title="⚡ Quick Actions"/>
                  <div style={{ padding:"14px 16px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9 }}>
                    {[
                      { label:"Add Staff",    icon:"👤",color:"#0891b2",action:()=>setShowAddStaff(true) },
                      { label:"View Reports", icon:"📊",color:"#7c3aed",action:()=>setSection("reports") },
                      { label:"Billing",      icon:"💰",color:"#059669",action:()=>setSection("billing") },
                      { label:"Open Chat",    icon:"💬",color:"#d97706",action:()=>setSection("chat") },
                      { label:"AI Companion", icon:"🤖",color:"#7c3aed",action:()=>setSection("ai") },
                      { label:"Appointments", icon:"📅",color:"#0891b2",action:()=>setSection("appointments") },
                      { label:"Insurance",    icon:"🏦",color:"#059669",action:()=>setSection("insurance") },
                      { label:"Inventory",    icon:"📦",color:"#d97706",action:()=>setSection("inventory") },
                    ].map(a=>(
                      <button key={a.label} onClick={a.action} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:5,padding:"12px 8px",background:`${a.color}08`,border:`1px solid ${a.color}20`,borderRadius:10,cursor:"pointer",fontSize:11,fontWeight:600,color:a.color }}>
                        <span style={{ fontSize:20 }}>{a.icon}</span>{a.label}
                      </button>
                    ))}
                  </div>
                </Card>
                <Card>
                  <div style={{ padding:"12px 14px" }}>
                    <div style={{ fontWeight:700,fontSize:12,color:"#0f172a",marginBottom:8 }}>📊 Dept. Activity</div>
                    {[
                      { dept:"Emergency",   pct:94, color:"#dc2626" },
                      { dept:"Internal Med",pct:78, color:"#7c3aed" },
                      { dept:"Pharmacy",    pct:62, color:"#059669" },
                      { dept:"Laboratory",  pct:55, color:"#0891b2" },
                    ].map(d=>(
                      <div key={d.dept} style={{ marginBottom:7 }}>
                        <div style={{ display:"flex",justifyContent:"space-between",fontSize:10,color:"#64748b",marginBottom:3 }}><span>{d.dept}</span><span style={{ fontWeight:600,color:d.color }}>{d.pct}%</span></div>
                        <div style={{ height:5,background:"#f1f5f9",borderRadius:4,overflow:"hidden" }}><div style={{ height:"100%",width:`${d.pct}%`,background:d.color,borderRadius:4 }}/></div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ══ STAFF ══ */}
          {section==="staff" && (
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
                <div>
                  <div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Staff Management</div>
                  <div style={{ fontSize:11,color:"#94a3b8",marginTop:2 }}>{staff.length} team members · Click any row to view profile</div>
                </div>
                <div style={{ display:"flex",gap:8 }}>
                  <button onClick={()=>setShowHRModal(true)} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 14px",background:"white",color:"#7c3aed",border:"1px solid #c4b5fd",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600 }}><Users2 size={13}/>HR Delegation</button>
                  <button style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 14px",background:"white",color:"#374151",border:"1px solid #e2e8f0",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600 }}><Download size={13}/>Export</button>
                  <button onClick={()=>setShowAddStaff(true)} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 16px",background:"#059669",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:600 }}><UserPlus size={14}/>Add Staff Member</button>
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:14 }}>
                <Card>
                  <CardHead title="👥 Staff Directory" sub="Click row to view full profile & CV"/>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                      <thead><tr style={{ background:"#f8fafc" }}>
                        {["Staff Member","Role","Department","Job Title","Status","Actions"].map(h=>(
                          <th key={h} style={{ padding:"9px 13px",textAlign:"left",fontWeight:600,fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.04em",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap" }}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {staff.map((s:any,i)=>(
                          <tr key={s.id||i} onClick={()=>{ setSelectedStaff(s); setShowStaffDetail(true); setStaffCVTab("profile"); }}
                            style={{ borderBottom:"1px solid #f1f5f9",cursor:"pointer",transition:"background 0.1s" }}
                            onMouseEnter={e=>(e.currentTarget.style.background="#f8fafc")}
                            onMouseLeave={e=>(e.currentTarget.style.background="")}>
                            <td style={{ padding:"9px 13px" }}>
                              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                                <div style={{ width:32,height:32,borderRadius:"50%",background:`hsl(${(s.fullName||s.firstName||"").charCodeAt(0)*7%360},60%,70%)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"white",flexShrink:0 }}>
                                  {(s.fullName||`${s.firstName||""} ${s.lastName||""}`).trim().split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase()}
                                </div>
                                <div>
                                  <div style={{ fontWeight:600,color:"#0f172a" }}>{s.fullName||`${s.firstName||""} ${s.lastName||""}`.trim()||"—"}</div>
                                  <div style={{ fontSize:10,color:"#94a3b8" }}>{s.email}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding:"9px 13px" }}><StatusBadge label={s.roleLabel||s.roleName||"Staff"} color="#0891b2" bg="#ecfeff"/></td>
                            <td style={{ padding:"9px 13px",color:"#64748b" }}>{s.departmentName||"—"}</td>
                            <td style={{ padding:"9px 13px",color:"#374151" }}>{s.jobTitle||"—"}</td>
                            <td style={{ padding:"9px 13px" }}><StatusBadge label={s.isActive!==false?"Active":"Inactive"} color={s.isActive!==false?"#059669":"#dc2626"} bg={s.isActive!==false?"#dcfce7":"#fee2e2"}/></td>
                            <td style={{ padding:"9px 13px" }}>
                              <div style={{ display:"flex",gap:4 }} onClick={e=>e.stopPropagation()}>
                                <button onClick={e=>{e.stopPropagation();setSelectedStaff(s);setShowStaffDetail(true);setStaffCVTab("profile");}} style={{ padding:"3px 8px",borderRadius:6,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:11,color:"#0891b2",fontWeight:600 }}>View</button>
                                <button onClick={e=>{e.stopPropagation();show(`Promoting ${s.firstName} to Hospital Manager…`,"info");}} style={{ padding:"3px 8px",borderRadius:6,border:"1px solid #c4b5fd",background:"#f5f3ff",cursor:"pointer",fontSize:11,color:"#7c3aed",fontWeight:600 }}>Promote</button>
                              </div>
                            </td>
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
                        const count=staff.filter((s:any)=>s.roleName===r||s.role===r).length;
                        const total=Math.max(staff.length,1);
                        const colors=["#7c3aed","#0891b2","#059669","#d97706","#dc2626"];
                        return (
                          <div key={r} style={{ marginBottom:8 }}>
                            <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3 }}>
                              <span style={{ color:"#374151",textTransform:"capitalize" }}>{r}</span>
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
                    <div style={{ fontWeight:700,fontSize:12,color:"#0f172a",marginBottom:8,display:"flex",alignItems:"center",gap:5 }}><Award size={13} style={{ color:"#7c3aed" }}/>HR Delegations</div>
                    {hrDelegations.map(d=>(
                      <div key={d.id} style={{ padding:"8px 10px",background:"#f5f3ff",borderRadius:8,marginBottom:6 }}>
                        <div style={{ fontSize:12,fontWeight:600,color:"#0f172a" }}>{d.staffName}</div>
                        <div style={{ fontSize:10,color:"#7c3aed" }}>{d.role} · Since {d.since}</div>
                        <div style={{ fontSize:10,color:"#94a3b8",marginTop:2 }}>{d.permissions.join(", ")}</div>
                      </div>
                    ))}
                    <button onClick={()=>setShowHRModal(true)} style={{ marginTop:6,padding:"6px 12px",background:"#f0f9ff",color:"#0891b2",border:"1px solid #bae6fd",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:600,width:"100%" }}>
                      Manage HR Delegation →
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
                  <div style={{ fontSize:11,color:"#94a3b8" }}>{appointments.length} appointments · Manage & communicate with staff/patients</div>
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
                  { label:"Total",     value:appointments.length,                                                                  color:"#0891b2",icon:"📅" },
                  { label:"Completed", value:appointments.filter((a:any)=>a.status==="completed").length,                          color:"#059669",icon:"✅" },
                  { label:"Pending",   value:appointments.filter((a:any)=>a.status==="scheduled"||a.status==="checked-in").length, color:"#d97706",icon:"⏳" },
                  { label:"No Shows",  value:Math.floor(appointments.length*0.08),                                                 color:"#dc2626",icon:"🚫" },
                ].map(k=><KPICard key={k.label} {...k} bg={`${k.color}10`} trend="" trendVal=""/>)}
              </div>
              <Card>
                <CardHead title="📋 Appointment List" sub="All appointments — click to call staff or patient"/>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                    <thead><tr style={{ background:"#f8fafc" }}>
                      {["Date","Time","Patient","Doctor","Dept","Type","Priority","Status","Actions"].map(h=>(
                        <th key={h} style={{ padding:"9px 13px",textAlign:"left",fontWeight:600,fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.04em",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap" }}>{h}</th>
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
                          <td style={{ padding:"9px 13px" }}>
                            <div style={{ display:"flex",gap:4 }}>
                              <button onClick={()=>{ setSection("chat"); show("Call initiated via internal system","info"); }} style={{ padding:"3px 7px",borderRadius:6,border:"1px solid #bae6fd",background:"#f0f9ff",cursor:"pointer",display:"flex",alignItems:"center",gap:3,fontSize:10,color:"#0891b2" }}><Phone size={10}/>Call</button>
                              <button onClick={()=>show(`Message sent to ${a.doctor_name||"doctor"}`,"success")} style={{ padding:"3px 7px",borderRadius:6,border:"1px solid #bbf7d0",background:"#f0fdf4",cursor:"pointer",display:"flex",alignItems:"center",gap:3,fontSize:10,color:"#059669" }}><MessageSquare size={10}/>Msg</button>
                            </div>
                          </td>
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
                  { label:"Tests Today",      value:"89",  icon:"🔬", color:"#0891b2", trend:"up",   trendVal:"+12%" },
                  { label:"Critical Results", value:"3",   icon:"🚨", color:"#dc2626", trend:"down", trendVal:"Urgent review" },
                  { label:"Avg TAT",          value:"42m", icon:"⏱️", color:"#d97706", trend:"up",   trendVal:"Target: 45m" },
                  { label:"Pending Orders",   value:"17",  icon:"⏳", color:"#7c3aed", trend:"",     trendVal:"" },
                ].map((k:any)=><KPICard key={k.label} {...k} bg={`${k.color}10`} sub=""/>)}
                {section==="radiology" && [
                  { label:"Imaging Orders",   value:"34",  icon:"📡", color:"#0891b2", trend:"up",   trendVal:"+6%" },
                  { label:"Completed",        value:"28",  icon:"✅", color:"#059669", trend:"up",   trendVal:"82% rate" },
                  { label:"Avg Report TAT",   value:"2.4h",icon:"⏱️", color:"#d97706", trend:"up",   trendVal:"Target: 3h" },
                  { label:"Equipment Uptime", value:"98%", icon:"🖥️", color:"#7c3aed", trend:"up",   trendVal:"Excellent" },
                ].map((k:any)=><KPICard key={k.label} {...k} bg={`${k.color}10`} sub=""/>)}
                {section==="emergency" && [
                  { label:"Active ED Patients",value:"7",  icon:"🚑", color:"#dc2626", trend:"up",   trendVal:"3 critical" },
                  { label:"Avg Wait Time",      value:"18m",icon:"⏱️", color:"#d97706", trend:"up",   trendVal:"Target: 20m" },
                  { label:"Beds Available",     value:"4",  icon:"🛏️", color:"#059669", trend:"down", trendVal:"Monitor" },
                  { label:"Ambulance Calls",    value:"12", icon:"🚨", color:"#0891b2", trend:"",     trendVal:"Today" },
                ].map((k:any)=><KPICard key={k.label} {...k} bg={`${k.color}10`} sub=""/>)}
                {section==="clinical" && [
                  { label:"Active Consults",  value:"14",  icon:"🩺", color:"#7c3aed", trend:"up",   trendVal:"4 urgent" },
                  { label:"Waiting Patients", value:"8",   icon:"⏳", color:"#d97706", trend:"up",   trendVal:"18 min avg" },
                  { label:"Surgical Today",   value:"3",   icon:"🔪", color:"#dc2626", trend:"",     trendVal:"" },
                  { label:"Discharges Today", value:"6",   icon:"🏠", color:"#059669", trend:"up",   trendVal:"+2" },
                ].map((k:any)=><KPICard key={k.label} {...k} bg={`${k.color}10`} sub=""/>)}
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:14 }}>
                <Card>
                  <CardHead title={`📊 ${section==="pharmacy"?"Drug Usage Trend":section==="laboratory"?"Test Volume Trend":section==="radiology"?"Imaging Volume Trend":section==="emergency"?"ED Visit Trend":"Consultation Trend"}`} sub="Last 7 days"/>
                  <div style={{ padding:"16px 18px" }}>
                    <MiniBarChart data={[22,28,25,32,29,34,31]} color={section==="pharmacy"?"#7c3aed":section==="laboratory"?"#0891b2":section==="radiology"?"#d97706":section==="emergency"?"#dc2626":"#059669"} height={72}/>
                    <div style={{ display:"flex",justifyContent:"space-between",marginTop:6 }}>{days.map(d=><div key={d} style={{ fontSize:9,color:"#94a3b8",textAlign:"center" }}>{d}</div>)}</div>
                  </div>
                </Card>
                <Card>
                  <CardHead title="🔒 Data Access Notice"/>
                  <div style={{ padding:"14px 16px",fontSize:11,color:"#64748b",lineHeight:1.8 }}>
                    ✅ Aggregate metrics visible<br/>✅ Volume and performance data<br/>✅ Staff workload analytics<br/>🔒 Individual patient data restricted<br/>🔒 Clinical notes not accessible
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
                <KPICard label="Total Invoices"   value={invoices.length} icon="📄" color="#0891b2" bg="#ecfeff" trend="up" trendVal="+8%"/>
                <KPICard label="Collected"         value={`RWF ${(totalRevenue/1000).toFixed(0)}K`} icon="💰" color="#059669" bg="#ecfdf5" trend="up" trendVal="+12%"/>
                <KPICard label="Pending Payment"   value={pendingInvoices.length} icon="⏳" color="#d97706" bg="#fffbeb" trend="down" trendVal={`${pendingInvoices.length} invoices`}/>
                <KPICard label="Overdue"           value={invoices.filter((i:any)=>i.status==="overdue").length} icon="🚨" color="#dc2626" bg="#fef2f2" trend="down" trendVal="Review"/>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:14 }}>
                <Card>
                  <CardHead title="💰 Revenue by Department" sub="This month"/>
                  <div style={{ padding:"16px 18px" }}>
                    {[
                      { dept:"Consultation", pct:38, rwf:"RWF 3.8M", color:"#7c3aed" },
                      { dept:"Laboratory",   pct:22, rwf:"RWF 2.2M", color:"#0891b2" },
                      { dept:"Pharmacy",     pct:18, rwf:"RWF 1.8M", color:"#059669" },
                      { dept:"Inpatient",    pct:14, rwf:"RWF 1.4M", color:"#d97706" },
                      { dept:"Radiology",    pct:8,  rwf:"RWF 0.8M", color:"#dc2626" },
                    ].map(d=>(
                      <div key={d.dept} style={{ marginBottom:10 }}>
                        <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4 }}>
                          <span style={{ color:"#374151",fontWeight:500 }}>{d.dept}</span>
                          <span style={{ fontWeight:700,color:d.color }}>{d.rwf} <span style={{ color:"#94a3b8",fontWeight:400 }}>({d.pct}%)</span></span>
                        </div>
                        <div style={{ height:7,background:"#f1f5f9",borderRadius:4,overflow:"hidden" }}><div style={{ height:"100%",width:`${d.pct}%`,background:d.color,borderRadius:4 }}/></div>
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
                        <th key={h} style={{ padding:"9px 13px",textAlign:"left",fontWeight:600,fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.04em",borderBottom:"1px solid #e2e8f0" }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {invoices.slice(0,15).map((inv:any,i)=>(
                        <tr key={inv.id||i} style={{ borderBottom:"1px solid #f1f5f9" }}>
                          <td style={{ padding:"9px 13px",fontWeight:700,color:"#0891b2" }}>{inv.invoice_number||`INV-${i+1}`}</td>
                          <td style={{ padding:"9px 13px",color:"#0f172a" }}>{inv.patient_name||"—"}</td>
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
            <div style={{ display:"grid",gap:16 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
                <div>
                  <div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Insurance & Claims Management</div>
                  <div style={{ fontSize:11,color:"#94a3b8" }}>{enabledInsurances.size} insurances enabled · Manage accepted insurance providers</div>
                </div>
                <div style={{ display:"flex",gap:8 }}>
                  {(["all","public","private","cash"] as const).map(f=>(
                    <button key={f} onClick={()=>setInsFilter(f)} style={{ padding:"5px 12px",borderRadius:7,border:`1px solid ${insFilter===f?"#0891b2":"#e2e8f0"}`,background:insFilter===f?"#0891b2":"white",color:insFilter===f?"white":"#374151",cursor:"pointer",fontSize:11,fontWeight:600,textTransform:"capitalize" }}>{f}</button>
                  ))}
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12 }}>
                <KPICard label="Total Enabled"   value={enabledInsurances.size} icon="✅" color="#059669" bg="#ecfdf5" trend="up" trendVal="Active" sub="Insurance providers"/>
                <KPICard label="Public Schemes"  value={RWANDA_INSURANCES.filter(i=>i.type==="public"&&enabledInsurances.has(i.id)).length} icon="🏛️" color="#0891b2" bg="#ecfeff" trend="" trendVal="" sub="RSSB/CBHI"/>
                <KPICard label="Private Plans"   value={RWANDA_INSURANCES.filter(i=>i.type==="private"&&enabledInsurances.has(i.id)).length} icon="🔵" color="#7c3aed" bg="#f5f3ff" trend="" trendVal="" sub="Private insurers"/>
                <KPICard label="Claims Pending"  value="14" icon="📋" color="#d97706" bg="#fffbeb" trend="down" trendVal="Needs review" sub="Awaiting submission"/>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:8,background:"white",borderRadius:10,padding:"10px 14px",border:"1px solid #e2e8f0" }}>
                <Search size={14} style={{ color:"#94a3b8" }}/>
                <input value={insuranceSearch} onChange={e=>setInsuranceSearch(e.target.value)} placeholder="Search insurance provider…" style={{ border:"none",outline:"none",fontSize:12,flex:1,color:"#0f172a" }}/>
              </div>
              <Card>
                <CardHead title="🏦 Rwanda Insurance Providers" sub="Enable or disable for your hospital · Rates auto-calculated at billing" action={
                  <button onClick={()=>show("Insurance configuration saved","success")} style={{ display:"flex",alignItems:"center",gap:4,padding:"5px 12px",background:"#059669",color:"white",borderRadius:7,border:"none",cursor:"pointer",fontSize:11,fontWeight:600 }}><Save size={11}/>Save Config</button>
                }/>
                <div style={{ padding:"14px 16px",display:"grid",gap:8 }}>
                  {RWANDA_INSURANCES
                    .filter(ins=>insFilter==="all"||ins.type===insFilter)
                    .filter(ins=>!insuranceSearch||ins.name.toLowerCase().includes(insuranceSearch.toLowerCase()))
                    .map(ins=>{
                      const enabled=enabledInsurances.has(ins.id);
                      return (
                        <div key={ins.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:enabled?"#f0fdf4":"#fafafa",borderRadius:10,border:`1px solid ${enabled?"#bbf7d0":"#e2e8f0"}`,transition:"all 0.2s" }}>
                          <span style={{ fontSize:22,flexShrink:0 }}>{ins.logo}</span>
                          <div style={{ flex:1,minWidth:0 }}>
                            <div style={{ fontWeight:600,fontSize:13,color:"#0f172a" }}>{ins.name}</div>
                            <div style={{ fontSize:11,color:"#64748b",marginTop:1 }}>{ins.description}</div>
                            {enabled && (
                              <div style={{ display:"flex",gap:14,marginTop:6,fontSize:11 }}>
                                <span style={{ color:"#0891b2" }}>Coverage: <strong>{ins.coverage}%</strong></span>
                                <span style={{ color:"#059669" }}>Inpatient: <strong>{ins.inpatient}%</strong></span>
                                <span style={{ color:"#7c3aed" }}>Outpatient: <strong>{ins.outpatient}%</strong></span>
                                <span style={{ padding:"1px 7px",borderRadius:10,background:ins.type==="public"?"#ecfeff":ins.type==="private"?"#f5f3ff":"#fffbeb",color:ins.type==="public"?"#0891b2":ins.type==="private"?"#7c3aed":"#d97706",fontSize:10,fontWeight:600,textTransform:"capitalize" }}>{ins.type}</span>
                              </div>
                            )}
                          </div>
                          <div style={{ display:"flex",gap:8,flexShrink:0,alignItems:"center" }}>
                            {enabled && (
                              <button onClick={()=>show(`Edit ${ins.name} rates coming soon`,"info")} style={{ padding:"4px 10px",borderRadius:7,border:"1px solid #bae6fd",background:"#f0f9ff",cursor:"pointer",fontSize:11,color:"#0891b2",fontWeight:600 }}>Edit Rates</button>
                            )}
                            <button onClick={()=>{
                              setEnabledInsurances(prev=>{ const n=new Set(prev); n.has(ins.id)?n.delete(ins.id):n.add(ins.id); return n; });
                              show(`${ins.name} ${enabledInsurances.has(ins.id)?"disabled":"enabled"} for this hospital`,"success");
                            }} style={{ padding:"5px 14px",borderRadius:7,border:`1px solid ${enabled?"#fca5a5":"#bbf7d0"}`,background:enabled?"#fee2e2":"#dcfce7",cursor:"pointer",fontSize:12,color:enabled?"#dc2626":"#059669",fontWeight:700,minWidth:72 }}>
                              {enabled?"Disable":"Enable"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </Card>
              <Card style={{ padding:"18px 20px" }}>
                <div style={{ fontWeight:700,fontSize:13,color:"#0f172a",marginBottom:8 }}>📊 How Insurance Rates Work</div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12,fontSize:12,color:"#374151",lineHeight:1.8 }}>
                  <div style={{ background:"#ecfeff",borderRadius:9,padding:"12px 14px" }}>
                    <strong>🏛️ RSSB:</strong> 80% of approved tariff covered. Patient pays 20% co-pay. Works with Rwanda National Tariff.
                  </div>
                  <div style={{ background:"#f0fdf4",borderRadius:9,padding:"12px 14px" }}>
                    <strong>🌿 CBHI/Mutuelle:</strong> 85% coverage on basic services. Referral required for non-emergency specialist care.
                  </div>
                  <div style={{ background:"#f5f3ff",borderRadius:9,padding:"12px 14px" }}>
                    <strong>🔵 Private Insurance:</strong> Rates vary by plan. Pre-authorization required for procedures above RWF 100,000.
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ══ SUBSCRIPTION ══ */}
          {section==="subscription" && (
            <div style={{ display:"grid",gap:16 }}>
              <div><div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Subscription Management</div>
              <div style={{ fontSize:11,color:"#94a3b8" }}>View available plans and upgrade your hospital tier</div></div>
              <div style={{ background:"linear-gradient(135deg,#0a1628,#0f2942)",borderRadius:14,padding:"20px 24px",color:"white",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12 }}>
                <div>
                  <div style={{ fontSize:12,color:"#64748b",marginBottom:3 }}>Current Plan</div>
                  <div style={{ fontSize:22,fontWeight:800 }}>Professional Tier</div>
                  <div style={{ fontSize:11,color:"#64748b",marginTop:3 }}>{user?.facility} · Active since Jan 2026</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:28,fontWeight:800,color:"#34d399" }}>RWF 150,000</div>
                  <div style={{ fontSize:11,color:"#64748b" }}>per month</div>
                  <div style={{ marginTop:6,padding:"3px 12px",background:"rgba(5,150,105,0.25)",color:"#34d399",borderRadius:20,fontSize:11,fontWeight:600,display:"inline-block" }}>✅ Active</div>
                </div>
              </div>
              {tierConfigs.length>0 ? (
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14 }}>
                  {tierConfigs.map((tier:any)=>(
                    <Card key={tier.tier||tier.id} style={{ border:tier.tier==="professional"||tier.name==="Professional"?"2px solid #059669":"1px solid #e2e8f0" }}>
                      {(tier.tier==="professional"||tier.name==="Professional") && (
                        <div style={{ background:"#059669",color:"white",textAlign:"center",padding:"4px",fontSize:10,fontWeight:700 }}>CURRENT PLAN</div>
                      )}
                      <div style={{ padding:"18px 20px" }}>
                        <div style={{ fontWeight:800,fontSize:16,color:"#0f172a",marginBottom:4 }}>{tier.name||tier.label}</div>
                        <div style={{ fontSize:26,fontWeight:800,color:"#059669",marginBottom:4 }}>RWF {Number(tier.price||tier.monthly_price||0).toLocaleString()}<span style={{ fontSize:12,color:"#64748b",fontWeight:400 }}>/month</span></div>
                        <div style={{ fontSize:11,color:"#64748b",marginBottom:12,lineHeight:1.6 }}>{tier.description||"Standard plan"}</div>
                        <div style={{ display:"grid",gap:4,marginBottom:14 }}>
                          {(tier.features||tier.included_features||["All core modules","Email support","Basic analytics"]).slice(0,6).map((f:string,fi:number)=>(
                            <div key={fi} style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#374151" }}><CheckCircle size={12} style={{ color:"#059669",flexShrink:0 }}/>{f}</div>
                          ))}
                        </div>
                        <button onClick={()=>show(tier.tier==="professional"||tier.name==="Professional"?"This is your current plan":"Upgrade request sent to Super Admin","info")} style={{ width:"100%",padding:"9px",background:tier.tier==="professional"||tier.name==="Professional"?"#f1f5f9":"linear-gradient(135deg,#059669,#0891b2)",color:tier.tier==="professional"||tier.name==="Professional"?"#64748b":"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:12,fontWeight:700 }}>
                          {tier.tier==="professional"||tier.name==="Professional"?"Current Plan ✓":"Upgrade to this plan"}
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14 }}>
                  {[
                    { name:"Basic",        price:"50,000",  color:"#64748b", features:["Core modules (OPD, IPD, Pharmacy)","Email support","Up to 50 staff","Basic reporting","CBHI/RSSB insurance"] },
                    { name:"Professional", price:"150,000", color:"#059669", features:["All Basic features","Unlimited staff","Advanced analytics","AI Companion","All insurance providers","Priority support","MOH reports"], current:true },
                    { name:"Enterprise",   price:"350,000", color:"#7c3aed", features:["All Professional features","Dedicated support","Custom integrations","Multi-facility","API access","SLA guarantee"] },
                  ].map(tier=>(
                    <Card key={tier.name} style={{ border:tier.current?"2px solid #059669":"1px solid #e2e8f0" }}>
                      {tier.current && <div style={{ background:"#059669",color:"white",textAlign:"center",padding:"4px",fontSize:10,fontWeight:700 }}>CURRENT PLAN</div>}
                      <div style={{ padding:"18px 20px" }}>
                        <div style={{ fontWeight:800,fontSize:16,color:"#0f172a",marginBottom:4 }}>{tier.name}</div>
                        <div style={{ fontSize:26,fontWeight:800,color:tier.color,marginBottom:12 }}>RWF {tier.price}<span style={{ fontSize:12,color:"#64748b",fontWeight:400 }}>/month</span></div>
                        <div style={{ display:"grid",gap:5,marginBottom:14 }}>
                          {tier.features.map((f,fi)=><div key={fi} style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#374151" }}><CheckCircle size={12} style={{ color:"#059669",flexShrink:0 }}/>{f}</div>)}
                        </div>
                        <button onClick={()=>show(tier.current?"This is your current plan":"Upgrade request sent to Super Admin for approval","info")} style={{ width:"100%",padding:"9px",background:tier.current?"#f1f5f9":`linear-gradient(135deg,${tier.color},#0891b2)`,color:tier.current?"#64748b":"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:12,fontWeight:700 }}>
                          {tier.current?"Current Plan ✓":`Upgrade to ${tier.name}`}
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              <Card style={{ padding:"16px 20px" }}>
                <div style={{ fontWeight:700,fontSize:13,color:"#0f172a",marginBottom:12 }}>📋 Billing History</div>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                  <thead><tr style={{ background:"#f8fafc" }}>
                    {["Invoice","Description","Amount","Date","Status"].map(h=><th key={h} style={{ padding:"8px 12px",textAlign:"left",fontWeight:600,fontSize:10,color:"#64748b",textTransform:"uppercase",borderBottom:"1px solid #e2e8f0" }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {[
                      { inv:"SUB-2026-06","desc":"Professional Plan — June 2026","amount":"150,000","date":"Jun 1, 2026","status":"paid" },
                      { inv:"SUB-2026-05","desc":"Professional Plan — May 2026","amount":"150,000","date":"May 1, 2026","status":"paid" },
                      { inv:"SUB-2026-04","desc":"Professional Plan — Apr 2026","amount":"150,000","date":"Apr 1, 2026","status":"paid" },
                    ].map(r=>(
                      <tr key={r.inv} style={{ borderBottom:"1px solid #f1f5f9" }}>
                        <td style={{ padding:"8px 12px",fontWeight:700,color:"#0891b2" }}>{r.inv}</td>
                        <td style={{ padding:"8px 12px",color:"#374151" }}>{r.desc}</td>
                        <td style={{ padding:"8px 12px",fontWeight:600 }}>RWF {r.amount}</td>
                        <td style={{ padding:"8px 12px",color:"#94a3b8" }}>{r.date}</td>
                        <td style={{ padding:"8px 12px" }}><StatusBadge label={r.status} color="#059669" bg="#dcfce7"/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {/* ══ REPORTS ══ */}
          {section==="reports" && (
            <div style={{ display:"grid",gap:16 }}>
              <div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Reports & Analytics</div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(148px,1fr))",gap:12 }}>
                {kpis.length>0 ? kpis.map((k:any,i)=>(
                  <KPICard key={i} label={k.label} value={k.value} icon={["⏳","🛏️","💰","🚨"][i%4]} color={k.tone==="good"?"#059669":k.tone==="danger"?"#dc2626":"#d97706"} bg={k.tone==="good"?"#ecfdf5":k.tone==="danger"?"#fef2f2":"#fffbeb"} sub={k.trend} trend={k.tone==="good"?"up":"down"} trendVal={k.target||""}/>
                )) : [
                  { label:"Waiting Patients",value:"8",      icon:"⏳",color:"#d97706",bg:"#fffbeb" },
                  { label:"Bed Occupancy",   value:"82%",    icon:"🛏️",color:"#0891b2",bg:"#ecfeff" },
                  { label:"Revenue Today",   value:"RWF 8.7M",icon:"💰",color:"#059669",bg:"#ecfdf5" },
                  { label:"Critical Alerts", value:"1",      icon:"🚨",color:"#dc2626",bg:"#fef2f2" },
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
                  <CardHead title="📊 Patient Volume by Department"/>
                  <div style={{ padding:"14px 16px" }}>
                    {[
                      { dept:"Emergency",   count:284,color:"#dc2626",pct:28 },
                      { dept:"Internal Med",count:218,color:"#7c3aed",pct:22 },
                      { dept:"Pediatrics",  count:196,color:"#0891b2",pct:19 },
                      { dept:"Maternity",   count:152,color:"#d97706",pct:15 },
                      { dept:"Surgery",     count:164,color:"#059669",pct:16 },
                    ].map(d=>(
                      <div key={d.dept} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:9 }}>
                        <div style={{ fontSize:11,fontWeight:500,color:"#374151",minWidth:90 }}>{d.dept}</div>
                        <div style={{ flex:1,height:7,background:"#f1f5f9",borderRadius:4,overflow:"hidden" }}><div style={{ height:"100%",width:`${d.pct}%`,background:d.color,borderRadius:4 }}/></div>
                        <div style={{ fontSize:11,fontWeight:700,color:d.color,minWidth:30,textAlign:"right" }}>{d.count}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12 }}>
                {[
                  { title:"📋 Daily Census",         desc:"Patient census, admissions, discharges" },
                  { title:"💰 Revenue Summary",      desc:"Collections, pending, by department" },
                  { title:"📊 Dept Performance",     desc:"Volume, TAT, quality metrics" },
                  { title:"😊 Patient Satisfaction", desc:"Feedback, NPS, complaint trends" },
                  { title:"💊 Pharmacy Report",      desc:"Drug usage, shortages, expiry" },
                  { title:"🇷🇼 MOH Report",           desc:"Monthly government submission data" },
                ].map(r=>(
                  <Card key={r.title} style={{ padding:"14px 16px" }}>
                    <div style={{ fontWeight:700,fontSize:13,color:"#0f172a",marginBottom:4 }}>{r.title}</div>
                    <div style={{ fontSize:11,color:"#64748b",marginBottom:12,lineHeight:1.5 }}>{r.desc}</div>
                    <button onClick={()=>show(`${r.title} generated — downloading…`,"success")} style={{ padding:"6px 14px",background:"#0891b2",color:"white",borderRadius:7,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,width:"100%" }}>Generate →</button>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ══ CHAT ══ */}
          {section==="chat" && (
            <div style={{ display:"flex",height:"calc(100vh - 120px)",minHeight:500,border:"1px solid #e2e8f0",borderRadius:12,overflow:"hidden",background:"white",boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ width:270,borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",flexShrink:0 }}>
                <div style={{ padding:"12px 14px 8px",borderBottom:"1px solid #f1f5f9" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7 }}>
                    <div style={{ fontWeight:700,fontSize:13,color:"#0f172a" }}>Messages</div>
                    <div style={{ display:"flex",gap:4 }}>
                      <button onClick={()=>setShowGroups(!showGroups)} style={{ padding:"3px 8px",borderRadius:6,border:`1px solid ${showGroups?"#059669":"#e2e8f0"}`,background:showGroups?"#dcfce7":"white",cursor:"pointer",fontSize:10,fontWeight:600,color:showGroups?"#059669":"#64748b" }}>Groups</button>
                      <button onClick={()=>setShowNewGroup(true)} style={{ padding:"3px 8px",borderRadius:6,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:10,color:"#64748b" }}><Plus size={10}/></button>
                    </div>
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:6,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"6px 10px" }}>
                    <Search size={12} style={{ color:"#94a3b8" }}/>
                    <input value={chatSearch} onChange={e=>setChatSearch(e.target.value)} placeholder="Search…" style={{ border:"none",outline:"none",fontSize:12,background:"transparent",flex:1,color:"#0f172a" }}/>
                  </div>
                </div>
                <div style={{ flex:1,overflowY:"auto" }}>
                  {showGroups && groups.map((g:any)=>(
                    <div key={g.id} onClick={()=>{ setSelThread({...g,isGroup:true,initials:"GRP",name:g.name,status:"online"}); setMessages([{ id:"w",from:"system",text:`Welcome to ${g.name} group chat`,time:"now" }]); }}
                      style={{ display:"flex",alignItems:"center",gap:9,padding:"11px 14px",cursor:"pointer",background:selThread?.id===g.id?"#f0fdf4":"white",borderBottom:"1px solid #f9fafb" }}>
                      <div style={{ width:36,height:36,borderRadius:10,background:"#7c3aed",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"white",flexShrink:0 }}>👥</div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:12,fontWeight:600,color:"#0f172a" }}>{g.name}</div>
                        <div style={{ fontSize:10,color:"#94a3b8" }}>{g.members.length} members</div>
                      </div>
                      {g.unread>0 && <span style={{ background:"#7c3aed",color:"white",borderRadius:10,padding:"1px 6px",fontSize:9,fontWeight:700 }}>{g.unread}</span>}
                    </div>
                  ))}
                  {chatUsers.filter(u=>u.name.toLowerCase().includes(chatSearch.toLowerCase())).map((u:any)=>(
                    <div key={u.id} onClick={()=>{ setSelThread(u); setMessages([{ id:"w",from:u.id,text:`Hello! Ready to assist.`,time:"now" }]); }}
                      style={{ display:"flex",alignItems:"center",gap:9,padding:"11px 14px",cursor:"pointer",background:selThread?.id===u.id?"#f0fdf4":"white",borderBottom:"1px solid #f9fafb" }}>
                      <div style={{ position:"relative",flexShrink:0 }}>
                        <div style={{ width:36,height:36,borderRadius:"50%",background:selThread?.id===u.id?"#059669":"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:selThread?.id===u.id?"white":"#374151" }}>{u.initials}</div>
                        <div style={{ position:"absolute",bottom:0,right:0,width:9,height:9,borderRadius:"50%",border:"2px solid white",background:u.status==="online"?"#22c55e":u.status==="away"?"#f59e0b":"#d1d5db" }}/>
                      </div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:12,fontWeight:600,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{u.name}</div>
                        <div style={{ fontSize:10,color:"#94a3b8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textTransform:"capitalize" }}>{u.role} · {u.dept}</div>
                      </div>
                      {u.unread>0 && <span style={{ background:"#059669",color:"white",borderRadius:10,padding:"1px 6px",fontSize:9,fontWeight:700 }}>{u.unread}</span>}
                    </div>
                  ))}
                </div>
              </div>
              {selThread ? (
                <div style={{ flex:1,display:"flex",flexDirection:"column" }}>
                  <div style={{ padding:"12px 18px",borderBottom:"1px solid #e2e8f0",display:"flex",alignItems:"center",gap:12,background:"#fafafa" }}>
                    <div style={{ width:34,height:34,borderRadius:selThread.isGroup?10:"50%",background:"#059669",display:"flex",alignItems:"center",justifyContent:"center",fontSize:selThread.isGroup?16:12,fontWeight:700,color:"white",flexShrink:0 }}>{selThread.isGroup?"👥":selThread.initials}</div>
                    <div>
                      <div style={{ fontSize:13,fontWeight:700,color:"#0f172a" }}>{selThread.name}</div>
                      <div style={{ fontSize:10,color:"#94a3b8",textTransform:"capitalize" }}>{selThread.isGroup?`${selThread.members?.length||0} members`:selThread.role} · <span style={{ color:selThread.status==="online"?"#22c55e":"#94a3b8" }}>{selThread.status}</span></div>
                    </div>
                    <div style={{ marginLeft:"auto",display:"flex",gap:6 }}>
                      <button onClick={()=>show("Voice call initiated via system","info")} style={{ padding:"5px 8px",borderRadius:6,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",display:"flex" }}><Phone size={12} style={{ color:"#64748b" }}/></button>
                      <button onClick={()=>show("Video call initiated via system","info")} style={{ padding:"5px 8px",borderRadius:6,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",display:"flex" }}><Video size={12} style={{ color:"#64748b" }}/></button>
                    </div>
                  </div>
                  <div style={{ flex:1,overflowY:"auto",padding:"14px 18px",display:"flex",flexDirection:"column",gap:9 }}>
                    {messages.map((m:any)=>(
                      <div key={m.id} style={{ display:"flex",flexDirection:m.from==="me"?"row-reverse":"row",gap:8,alignItems:"flex-end" }}>
                        {m.from!=="me"&&m.from!=="system" && <div style={{ width:26,height:26,borderRadius:"50%",background:"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,flexShrink:0 }}>{selThread.initials}</div>}
                        {m.file ? (
                          <div style={{ maxWidth:"70%" }}>
                            <a href={m.file.url} download={m.file.name} style={{ display:"flex",alignItems:"center",gap:7,padding:"8px 12px",background:m.from==="me"?"#059669":"#f1f5f9",borderRadius:10,textDecoration:"none",color:m.from==="me"?"white":"#0f172a",fontSize:11 }}>
                              <span style={{ fontSize:16 }}>{m.file.type?.startsWith("image")?"🖼️":m.file.type?.startsWith("video")?"🎬":m.file.type?.startsWith("audio")?"🎵":"📎"}</span>
                              <div><div style={{ fontWeight:600 }}>{m.file.name}</div><div style={{ opacity:0.7,fontSize:10 }}>{(m.file.size/1024).toFixed(1)}KB</div></div>
                            </a>
                          </div>
                        ) : (
                          <div style={{ maxWidth:"70%",background:m.from==="me"?"#059669":m.from==="system"?"#f1f5f9":"#f1f5f9",color:m.from==="me"?"white":"#0f172a",borderRadius:m.from==="me"?"12px 12px 2px 12px":"12px 12px 12px 2px",padding:"9px 13px",fontSize:12 }}>
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
                  <div style={{ fontSize:11 }}>Supports text, files, audio, images, videos</div>
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
                  <span style={{ marginLeft:"auto",padding:"4px 12px",background:"rgba(5,150,105,0.25)",color:"#34d399",borderRadius:20,fontSize:11,fontWeight:600,border:"1px solid rgba(5,150,105,0.3)" }}>🤖 Gemini 2.0 Flash</span>
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
                  style={{ width:"100%",padding:"16px 18px",border:"none",outline:"none",fontSize:13,resize:"none",fontFamily:"inherit",boxSizing:"border-box",color:"#0f172a",lineHeight:1.6 }}/>
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
                          <div style={{ fontSize:12,fontWeight:600,color:"#0f172a" }}>{(h.q||"").slice(0,80)}{(h.q||"").length>80?"…":""}</div>
                          <div style={{ fontSize:10,color:"#94a3b8" }}>{h.time}</div>
                        </div>
                        <span style={{ fontSize:9,padding:"1px 7px",borderRadius:10,background:"#f1f5f9",color:"#64748b",fontWeight:600,flexShrink:0 }}>{h.src||"KB"}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* ══ INVENTORY ══ */}
          {section==="inventory" && (
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
                <div><div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Inventory & Supply Chain</div><div style={{ fontSize:11,color:"#94a3b8" }}>Track stock levels, reorder points, and supply requests</div></div>
                <button onClick={()=>show("New purchase request submitted","success")} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 16px",background:"#059669",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:12,fontWeight:600 }}><Plus size={13}/>New PR</button>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12 }}>
                {[
                  { label:"Total Items",   value:inventoryItems.length||248, icon:"📦", color:"#0891b2", bg:"#ecfeff",trend:"up",   trendVal:"+5 new" },
                  { label:"Low Stock",     value:inventoryItems.filter((i:any)=>i.quantity_on_hand<=i.reorder_point).length||12, icon:"⚠️", color:"#dc2626", bg:"#fef2f2",trend:"down", trendVal:"Action needed" },
                  { label:"Active PRs",    value:"8",  icon:"📋", color:"#7c3aed", bg:"#f5f3ff",trend:"",    trendVal:"" },
                  { label:"Suppliers",     value:"14", icon:"🏭", color:"#059669", bg:"#ecfdf5",trend:"up",   trendVal:"Active" },
                ].map((k:any)=><KPICard key={k.label} {...k} sub=""/>)}
              </div>
              <Card>
                <CardHead title="📦 Stock Overview" sub="Current inventory levels"/>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                    <thead><tr style={{ background:"#f8fafc" }}>
                      {["Item","Category","On Hand","Reorder Point","Status","Action"].map(h=>(
                        <th key={h} style={{ padding:"9px 13px",textAlign:"left",fontWeight:600,fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.04em",borderBottom:"1px solid #e2e8f0" }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {(inventoryItems.length>0?inventoryItems:[
                        { name:"Amoxicillin 500mg",  category:"Medication",  quantity_on_hand:45,  reorder_point:50,  unit:"boxes" },
                        { name:"Surgical Gloves (M)", category:"Supplies",    quantity_on_hand:200, reorder_point:100, unit:"pairs" },
                        { name:"IV Drip Sets",        category:"Supplies",    quantity_on_hand:18,  reorder_point:30,  unit:"pcs" },
                        { name:"Paracetamol 500mg",   category:"Medication",  quantity_on_hand:320, reorder_point:100, unit:"boxes" },
                        { name:"Malaria RDT",         category:"Diagnostics", quantity_on_hand:55,  reorder_point:50,  unit:"kits" },
                        { name:"Blood Glucose Strip", category:"Diagnostics", quantity_on_hand:12,  reorder_point:30,  unit:"packs" },
                      ] as any[]).slice(0,15).map((item:any,i)=>{
                        const low=item.quantity_on_hand<=item.reorder_point;
                        return (
                          <tr key={item.id||i} style={{ borderBottom:"1px solid #f1f5f9" }}>
                            <td style={{ padding:"9px 13px",fontWeight:600,color:"#0f172a" }}>{item.name}</td>
                            <td style={{ padding:"9px 13px",color:"#64748b" }}>{item.category}</td>
                            <td style={{ padding:"9px 13px",fontWeight:700,color:low?"#dc2626":"#059669" }}>{item.quantity_on_hand} {item.unit}</td>
                            <td style={{ padding:"9px 13px",color:"#64748b" }}>{item.reorder_point} {item.unit}</td>
                            <td style={{ padding:"9px 13px" }}><StatusBadge label={low?"Low Stock":"In Stock"} color={low?"#dc2626":"#059669"} bg={low?"#fee2e2":"#dcfce7"}/></td>
                            <td style={{ padding:"9px 13px" }}>
                              {low && <button onClick={()=>show(`Purchase request raised for ${item.name}`,"success")} style={{ padding:"3px 9px",borderRadius:6,border:"1px solid #fca5a5",background:"#fee2e2",cursor:"pointer",fontSize:11,color:"#dc2626",fontWeight:600 }}>Reorder</button>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ══ QUALITY ══ */}
          {section==="quality" && (
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Quality & Patient Safety</div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12 }}>
                {[
                  { label:"Incidents This Month",  value:"3",   icon:"⚠️", color:"#d97706", bg:"#fffbeb",trend:"down", trendVal:"vs 5 last month" },
                  { label:"Near Misses",            value:"7",   icon:"🔶", color:"#d97706", bg:"#fffbeb",trend:"down", trendVal:"Improving" },
                  { label:"Infection Rate",         value:"1.2%",icon:"🦠", color:"#dc2626", bg:"#fef2f2",trend:"down", trendVal:"↓ 0.3%" },
                  { label:"Patient Safety Score",   value:"94%", icon:"✅", color:"#059669", bg:"#ecfdf5",trend:"up",   trendVal:"+2%" },
                  { label:"Audit Compliance",       value:"98%", icon:"📋", color:"#0891b2", bg:"#ecfeff",trend:"up",   trendVal:"Rwanda MOH" },
                  { label:"Hand Hygiene Compliance",value:"87%", icon:"🧴", color:"#7c3aed", bg:"#f5f3ff",trend:"up",   trendVal:"+5%" },
                ].map((k:any)=><KPICard key={k.label} {...k} sub=""/>)}
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                <Card>
                  <CardHead title="📋 Recent Incidents" sub="Last 30 days" action={<button onClick={()=>show("Incident report created","success")} style={{ padding:"4px 10px",background:"#dc2626",color:"white",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:600 }}>Report Incident</button>}/>
                  <div style={{ padding:"14px 16px",display:"flex",flexDirection:"column",gap:8 }}>
                    {[
                      { type:"Medication error",  dept:"Ward B",   sev:"moderate", date:"Jul 18" },
                      { type:"Patient fall",       dept:"Ortho",    sev:"minor",    date:"Jul 15" },
                      { type:"Equipment failure",  dept:"Theater",  sev:"major",    date:"Jul 10" },
                    ].map((inc,i)=>(
                      <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"#f8fafc",borderRadius:8 }}>
                        <span style={{ fontSize:16 }}>{inc.sev==="major"?"🚨":inc.sev==="moderate"?"⚠️":"ℹ️"}</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12,fontWeight:600,color:"#0f172a" }}>{inc.type}</div>
                          <div style={{ fontSize:10,color:"#94a3b8" }}>{inc.dept} · {inc.date}</div>
                        </div>
                        <StatusBadge label={inc.sev} color={inc.sev==="major"?"#dc2626":inc.sev==="moderate"?"#d97706":"#059669"} bg={inc.sev==="major"?"#fee2e2":inc.sev==="moderate"?"#fffbeb":"#dcfce7"}/>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card>
                  <CardHead title="✅ Quality Audits" sub="Scheduled & completed"/>
                  <div style={{ padding:"14px 16px",display:"flex",flexDirection:"column",gap:8 }}>
                    {[
                      { name:"Infection Control Audit",  due:"Jul 25", status:"upcoming" },
                      { name:"Hand Hygiene Observation", due:"Jul 22", status:"upcoming" },
                      { name:"Medication Safety Review",  due:"Jul 15", status:"completed" },
                      { name:"Fire Safety Drill",         due:"Jul 10", status:"completed" },
                    ].map((a,i)=>(
                      <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"#f8fafc",borderRadius:8 }}>
                        {a.status==="completed"?<CheckCircle size={16} style={{ color:"#059669",flexShrink:0 }}/>:<Clock size={16} style={{ color:"#d97706",flexShrink:0 }}/>}
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12,fontWeight:600,color:"#0f172a" }}>{a.name}</div>
                          <div style={{ fontSize:10,color:"#94a3b8" }}>Due: {a.due}</div>
                        </div>
                        <StatusBadge label={a.status} color={a.status==="completed"?"#059669":"#d97706"} bg={a.status==="completed"?"#dcfce7":"#fffbeb"}/>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ══ FEEDBACK ══ */}
          {section==="feedback" && (
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Patient Feedback & Satisfaction</div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12 }}>
                {[
                  { label:"NPS Score",        value:"72",  icon:"⭐", color:"#059669", bg:"#ecfdf5",trend:"up",  trendVal:"+4 this month" },
                  { label:"Satisfaction Rate", value:"94%", icon:"😊", color:"#0891b2", bg:"#ecfeff",trend:"up",  trendVal:"+2%" },
                  { label:"Complaints",        value:"8",   icon:"😞", color:"#dc2626", bg:"#fef2f2",trend:"down",trendVal:"5 resolved" },
                  { label:"Surveys Collected", value:"234", icon:"📋", color:"#7c3aed", bg:"#f5f3ff",trend:"up",  trendVal:"This month" },
                ].map((k:any)=><KPICard key={k.label} {...k} sub=""/>)}
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:14 }}>
                <Card>
                  <CardHead title="📊 Satisfaction by Department"/>
                  <div style={{ padding:"14px 16px" }}>
                    {[
                      { dept:"Emergency",   score:88, color:"#dc2626" },
                      { dept:"Maternity",   score:97, color:"#7c3aed" },
                      { dept:"Outpatient",  score:91, color:"#0891b2" },
                      { dept:"Pharmacy",    score:94, color:"#059669" },
                      { dept:"Laboratory",  score:89, color:"#d97706" },
                    ].map(d=>(
                      <div key={d.dept} style={{ marginBottom:10 }}>
                        <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4 }}>
                          <span style={{ color:"#374151" }}>{d.dept}</span>
                          <span style={{ fontWeight:700,color:d.color }}>{d.score}%</span>
                        </div>
                        <div style={{ height:7,background:"#f1f5f9",borderRadius:4,overflow:"hidden" }}><div style={{ height:"100%",width:`${d.score}%`,background:d.color,borderRadius:4 }}/></div>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card>
                  <CardHead title="💬 Recent Comments"/>
                  <div style={{ padding:"12px 14px",display:"flex",flexDirection:"column",gap:8 }}>
                    {[
                      { text:"Staff were very kind and professional",     rating:5, date:"Jul 19" },
                      { text:"Waiting time was too long in emergency",    rating:2, date:"Jul 18" },
                      { text:"Pharmacy service was excellent",             rating:5, date:"Jul 17" },
                      { text:"Doctor explained everything clearly",        rating:4, date:"Jul 16" },
                    ].map((c,i)=>(
                      <div key={i} style={{ padding:"8px 10px",background:"#f8fafc",borderRadius:8 }}>
                        <div style={{ fontSize:11,color:"#374151",marginBottom:3 }}>"{c.text}"</div>
                        <div style={{ display:"flex",justifyContent:"space-between",fontSize:10,color:"#94a3b8" }}>
                          <span>{"⭐".repeat(c.rating)}</span><span>{c.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ══ HR ══ */}
          {section==="hr" && (
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>HR & Staff Development</div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12 }}>
                {[
                  { label:"Staff Turnover",    value:"4.2%",  icon:"🔄", color:"#d97706", bg:"#fffbeb",trend:"down", trendVal:"Improving" },
                  { label:"Open Positions",    value:"3",     icon:"💼", color:"#0891b2", bg:"#ecfeff",trend:"",     trendVal:"" },
                  { label:"On Leave Today",    value:"5",     icon:"🏖️", color:"#7c3aed", bg:"#f5f3ff",trend:"",     trendVal:"" },
                  { label:"Training Completion",value:"78%",  icon:"🎓", color:"#059669", bg:"#ecfdf5",trend:"up",   trendVal:"+12%" },
                ].map((k:any)=><KPICard key={k.label} {...k} sub=""/>)}
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                <Card>
                  <CardHead title="📋 Leave Requests" action={<button onClick={()=>show("Leave request approved","success")} style={{ padding:"4px 10px",background:"#059669",color:"white",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:600 }}>Approve All</button>}/>
                  <div style={{ padding:"12px 14px",display:"flex",flexDirection:"column",gap:8 }}>
                    {[
                      { name:"Dr. Grace M.",   type:"Annual Leave", dates:"Jul 24–28", status:"pending" },
                      { name:"Nurse Eric N.",  type:"Sick Leave",   dates:"Jul 20–21", status:"approved" },
                      { name:"Diane I.",       type:"Maternity",    dates:"Aug 1–Nov 30", status:"pending" },
                    ].map((req,i)=>(
                      <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"#f8fafc",borderRadius:8 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12,fontWeight:600,color:"#0f172a" }}>{req.name} — {req.type}</div>
                          <div style={{ fontSize:10,color:"#94a3b8" }}>{req.dates}</div>
                        </div>
                        <div style={{ display:"flex",gap:4 }}>
                          {req.status==="pending" && <>
                            <button onClick={()=>show(`Leave approved for ${req.name}`,"success")} style={{ padding:"3px 8px",borderRadius:6,border:"1px solid #bbf7d0",background:"#dcfce7",cursor:"pointer",fontSize:10,color:"#059669",fontWeight:600 }}>✓</button>
                            <button onClick={()=>show(`Leave declined`,"error")} style={{ padding:"3px 8px",borderRadius:6,border:"1px solid #fca5a5",background:"#fee2e2",cursor:"pointer",fontSize:10,color:"#dc2626",fontWeight:600 }}>✗</button>
                          </>}
                          {req.status==="approved" && <StatusBadge label="Approved" color="#059669" bg="#dcfce7"/>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card>
                  <CardHead title="👔 HR Delegations" sub="Staff with delegated HR authority"/>
                  <div style={{ padding:"12px 14px",display:"flex",flexDirection:"column",gap:8 }}>
                    {hrDelegations.map(d=>(
                      <div key={d.id} style={{ padding:"10px 12px",background:"#f5f3ff",borderRadius:8,border:"1px solid #c4b5fd" }}>
                        <div style={{ fontSize:12,fontWeight:700,color:"#0f172a" }}>{d.staffName}</div>
                        <div style={{ fontSize:11,color:"#7c3aed",marginTop:1 }}>{d.role} · Active since {d.since}</div>
                        <div style={{ fontSize:10,color:"#94a3b8",marginTop:3 }}>Permissions: {d.permissions.join(", ")}</div>
                        <div style={{ display:"flex",gap:6,marginTop:8 }}>
                          <button onClick={()=>show("HR permissions updated","success")} style={{ padding:"3px 9px",borderRadius:6,border:"1px solid #c4b5fd",background:"white",cursor:"pointer",fontSize:10,color:"#7c3aed",fontWeight:600 }}>Edit</button>
                          <button onClick={()=>{ setHRDelegations(p=>p.filter(x=>x.id!==d.id)); show("HR delegation revoked","info"); }} style={{ padding:"3px 9px",borderRadius:6,border:"1px solid #fca5a5",background:"#fee2e2",cursor:"pointer",fontSize:10,color:"#dc2626",fontWeight:600 }}>Revoke</button>
                        </div>
                      </div>
                    ))}
                    <button onClick={()=>setShowHRModal(true)} style={{ padding:"7px",background:"#f5f3ff",color:"#7c3aed",border:"1px dashed #c4b5fd",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600 }}>+ Add HR Delegation</button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ══ DISASTER ══ */}
          {section==="disaster" && (
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Disaster Preparedness</div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12 }}>
                {[
                  { label:"Emergency Beds",    value:"12",  icon:"🛏️", color:"#dc2626", bg:"#fef2f2",trend:"",     trendVal:"Reserved" },
                  { label:"Blood Bank Units",  value:"145", icon:"🩸", color:"#d97706", bg:"#fffbeb",trend:"down", trendVal:"Review B- stock" },
                  { label:"Generator Fuel",    value:"78%", icon:"⚡", color:"#059669", bg:"#ecfdf5",trend:"up",   trendVal:"7-day reserve" },
                  { label:"Drill Compliance",  value:"100%",icon:"✅", color:"#0891b2", bg:"#ecfeff",trend:"up",   trendVal:"All staff trained" },
                ].map((k:any)=><KPICard key={k.label} {...k} sub=""/>)}
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                <Card>
                  <CardHead title="🚨 Emergency Contacts"/>
                  <div style={{ padding:"12px 14px",display:"flex",flexDirection:"column",gap:8 }}>
                    {[
                      { name:"Rwanda Emergency (112)",   type:"National",  num:"+250 112" },
                      { name:"SAMU Rwanda",              type:"Ambulance", num:"+250 912 999 756" },
                      { name:"Rwanda National Police",   type:"Security",  num:"+250 788 311 155" },
                      { name:"REMA Rwanda",              type:"Disasters", num:"+250 788 311 155" },
                      { name:"MOH Hotline",              type:"Health",    num:"+250 800 14 900" },
                    ].map((c,i)=>(
                      <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"#fef2f2",borderRadius:8,border:"1px solid #fecaca" }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12,fontWeight:600,color:"#0f172a" }}>{c.name}</div>
                          <div style={{ fontSize:10,color:"#64748b" }}>{c.type}</div>
                        </div>
                        <a href={`tel:${c.num}`} style={{ fontSize:12,fontWeight:700,color:"#dc2626",textDecoration:"none" }}>{c.num}</a>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card>
                  <CardHead title="📋 Preparedness Checklist"/>
                  <div style={{ padding:"12px 14px",display:"flex",flexDirection:"column",gap:6 }}>
                    {[
                      { item:"Emergency response plan updated",      done:true },
                      { item:"Staff trained on mass casualty",        done:true },
                      { item:"Fire extinguisher inspection",          done:true },
                      { item:"Backup power generator tested",         done:true },
                      { item:"Stockpile: 72hr medical supplies",      done:false },
                      { item:"Evacuation drill completed",            done:false },
                    ].map((c,i)=>(
                      <div key={i} style={{ display:"flex",alignItems:"center",gap:8,fontSize:12,color:c.done?"#0f172a":"#64748b" }}>
                        {c.done?<CheckCircle size={14} style={{ color:"#059669",flexShrink:0 }}/>:<XCircle size={14} style={{ color:"#94a3b8",flexShrink:0 }}/>}
                        {c.item}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ══ FACILITY ══ */}
          {section==="facility" && (
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Facility Management</div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12 }}>
                {[
                  { label:"Total Beds",       value:"80",  icon:"🛏️", color:"#0891b2", bg:"#ecfeff",trend:"",     trendVal:"" },
                  { label:"Occupied",          value:"66",  icon:"👤", color:"#d97706", bg:"#fffbeb",trend:"up",   trendVal:"82.5%" },
                  { label:"Maintenance PRs",   value:"5",   icon:"🔧", color:"#dc2626", bg:"#fef2f2",trend:"",     trendVal:"Pending" },
                  { label:"Cleanliness Score", value:"96%", icon:"🧹", color:"#059669", bg:"#ecfdf5",trend:"up",   trendVal:"+1%" },
                ].map((k:any)=><KPICard key={k.label} {...k} sub=""/>)}
              </div>
              <Card>
                <CardHead title="🏗️ Facility Status by Ward" action={<button onClick={()=>show("Maintenance request created","success")} style={{ padding:"4px 10px",background:"#d97706",color:"white",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:600 }}>Log Request</button>}/>
                <div style={{ padding:"14px 16px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10 }}>
                  {[
                    { ward:"Emergency",    beds:12, occupied:11, status:"Critical", color:"#dc2626" },
                    { ward:"Maternity",    beds:20, occupied:14, status:"Normal",   color:"#059669" },
                    { ward:"Pediatrics",   beds:15, occupied:10, status:"Normal",   color:"#059669" },
                    { ward:"Surgery",      beds:10, occupied:9,  status:"High",     color:"#d97706" },
                    { ward:"Medical",      beds:18, occupied:16, status:"High",     color:"#d97706" },
                    { ward:"ICU",          beds:5,  occupied:4,  status:"Critical", color:"#dc2626" },
                  ].map(w=>(
                    <div key={w.ward} style={{ padding:"12px 14px",background:"#f8fafc",borderRadius:10,border:`1px solid ${w.color}20` }}>
                      <div style={{ fontWeight:700,fontSize:13,color:"#0f172a",marginBottom:4 }}>{w.ward}</div>
                      <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6 }}>
                        <span style={{ color:"#64748b" }}>{w.occupied}/{w.beds} beds</span>
                        <StatusBadge label={w.status} color={w.color} bg={`${w.color}15`}/>
                      </div>
                      <div style={{ height:6,background:"#f1f5f9",borderRadius:4,overflow:"hidden" }}><div style={{ height:"100%",width:`${(w.occupied/w.beds)*100}%`,background:w.color,borderRadius:4 }}/></div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ══ PATIENTS ══ */}
          {section==="patients" && (
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
                <div><div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Patient Management</div><div style={{ fontSize:11,color:"#94a3b8" }}>Population health overview and aggregated statistics</div></div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(148px,1fr))",gap:12 }}>
                <KPICard label="Active Patients"      value="1,245" icon="👤" color="#0891b2" bg="#ecfeff" trend="up"   trendVal="+18 this week" sub="Registered"/>
                <KPICard label="New Registrations"    value="24"    icon="➕" color="#059669" bg="#ecfdf5" trend="up"   trendVal="+8%"           sub="This week"/>
                <KPICard label="Readmissions (30d)"   value="12"    icon="🔄" color="#d97706" bg="#fffbeb" trend="down" trendVal="5.2% rate"     sub="Last 30 days"/>
                <KPICard label="Patient Satisfaction" value="94%"   icon="⭐" color="#7c3aed" bg="#f5f3ff" trend="up"   trendVal="+2%"           sub="NPS score"/>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:14 }}>
                <Card>
                  <CardHead title="📊 Population Health Overview"/>
                  <div style={{ padding:"14px 16px" }}>
                    {[
                      { label:"Hypertension",      count:284,color:"#dc2626",pct:23 },
                      { label:"Diabetes",           count:196,color:"#d97706",pct:16 },
                      { label:"Malaria (active)",   count:89, color:"#7c3aed",pct:7 },
                      { label:"TB (under treatment)",count:34,color:"#0891b2",pct:3 },
                      { label:"HIV/AIDS (ART)",     count:145,color:"#059669",pct:12 },
                      { label:"Maternal care (ANC)",count:218,color:"#d97706",pct:18 },
                    ].map(d=>(
                      <div key={d.label} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:9 }}>
                        <div style={{ fontSize:11,fontWeight:500,color:"#374151",minWidth:140 }}>{d.label}</div>
                        <div style={{ flex:1,height:7,background:"#f1f5f9",borderRadius:4,overflow:"hidden" }}><div style={{ height:"100%",width:`${d.pct}%`,background:d.color,borderRadius:4 }}/></div>
                        <div style={{ fontSize:11,fontWeight:700,color:d.color,minWidth:36,textAlign:"right" }}>{d.count}</div>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card>
                  <CardHead title="🔒 Data Access Policy"/>
                  <div style={{ padding:"14px 16px",fontSize:11,color:"#64748b",lineHeight:1.8 }}>
                    ✅ Aggregate statistics<br/>✅ Population health trends<br/>✅ Department volumes<br/>🔒 Individual patient records<br/>🔒 Clinical notes<br/>🔒 Lab/imaging results
                    <div style={{ marginTop:10,padding:"8px 10px",background:"#ecfdf5",borderRadius:7,fontSize:11,color:"#065f46",border:"1px solid #bbf7d0" }}>
                      Access clinical records via Receptionist or Doctor portal
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ══ FEATURE REQUESTS ══ */}
          {section==="requests" && (
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
                <div><div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Feature Requests</div><div style={{ fontSize:11,color:"#94a3b8" }}>Request capabilities from System Admin</div></div>
                <button onClick={()=>setShowReqModal(true)} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 16px",background:"#0891b2",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:600 }}><Plus size={14}/>New Request</button>
              </div>
              <Card>
                <CardHead title="🔒 Available to Request"/>
                <div style={{ padding:"12px 14px",display:"flex",flexDirection:"column",gap:8 }}>
                  {features.filter((f:any)=>f.default_status!=="active").slice(0,10).map((f:any)=>(
                    <div key={f.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"#f8fafc",borderRadius:9 }}>
                      <span style={{ fontSize:18 }}>{f.icon||"⚙️"}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12,fontWeight:600,color:"#0f172a" }}>{f.label}</div>
                        <div style={{ fontSize:10,color:"#94a3b8" }}>{f.description||f.name} · Requires {f.tier_required} tier</div>
                      </div>
                      <StatusBadge label={f.default_status||"locked"} color="#d97706" bg="#fffbeb"/>
                      <button onClick={()=>{ setSelectedFeat(f.id); setReqReason(""); setShowReqModal(true); }} style={{ padding:"5px 12px",background:"#0891b2",color:"white",border:"none",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:600,whiteSpace:"nowrap" }}>Request</button>
                    </div>
                  ))}
                  {features.filter((f:any)=>f.default_status!=="active").length===0 && <div style={{ color:"#94a3b8",fontSize:12,textAlign:"center",padding:"20px 0" }}>All available features are currently enabled.</div>}
                </div>
              </Card>
            </div>
          )}

          {/* ══ TRAINING ══ */}
          {section==="training" && (
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Training & Onboarding</div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12 }}>
                {[
                  { label:"Courses Available",  value:"24",  icon:"📚", color:"#0891b2", bg:"#ecfeff",trend:"up", trendVal:"+3 new" },
                  { label:"Staff Enrolled",      value:"38",  icon:"👥", color:"#7c3aed", bg:"#f5f3ff",trend:"up", trendVal:"73%" },
                  { label:"Completions",         value:"156", icon:"🎓", color:"#059669", bg:"#ecfdf5",trend:"up", trendVal:"+22 this month" },
                  { label:"Overdue Trainings",   value:"7",   icon:"⚠️", color:"#dc2626", bg:"#fef2f2",trend:"down",trendVal:"Follow up" },
                ].map((k:any)=><KPICard key={k.label} {...k} sub=""/>)}
              </div>
              <Card>
                <CardHead title="📋 Active Training Programs"/>
                <div style={{ padding:"14px 16px",display:"flex",flexDirection:"column",gap:9 }}>
                  {[
                    { name:"Rwanda MOH Clinical Protocols 2024",        category:"Clinical",    enrolled:28,total:35,due:"Aug 1",  status:"active" },
                    { name:"Infection Prevention & Control",             category:"Safety",      enrolled:35,total:35,due:"Jul 25", status:"active" },
                    { name:"HMS System Training — Hospital Manager",     category:"System",      enrolled:1, total:1, due:"Jul 31", status:"active" },
                    { name:"Fire Safety & Emergency Response",           category:"Emergency",   enrolled:30,total:35,due:"Aug 15", status:"active" },
                    { name:"Customer Service Excellence",                category:"Service",     enrolled:20,total:25,due:"Aug 30", status:"upcoming" },
                  ].map((t,i)=>(
                    <div key={i} style={{ padding:"12px 14px",background:"#f8fafc",borderRadius:10,border:"1px solid #e2e8f0" }}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
                        <div>
                          <div style={{ fontSize:13,fontWeight:700,color:"#0f172a" }}>{t.name}</div>
                          <div style={{ fontSize:11,color:"#64748b",marginTop:1 }}>{t.category} · Due: {t.due}</div>
                        </div>
                        <StatusBadge label={t.status} color={t.status==="active"?"#059669":"#d97706"} bg={t.status==="active"?"#dcfce7":"#fffbeb"}/>
                      </div>
                      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                        <div style={{ flex:1,height:6,background:"#e2e8f0",borderRadius:4,overflow:"hidden" }}><div style={{ height:"100%",width:`${(t.enrolled/t.total)*100}%`,background:"#059669",borderRadius:4 }}/></div>
                        <span style={{ fontSize:11,color:"#374151",fontWeight:600,flexShrink:0 }}>{t.enrolled}/{t.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ══ SETTINGS ══ */}
          {section==="settings" && (
            <div style={{ display:"grid",gap:16 }}>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                <div>
                  <div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Settings</div>
                  <div style={{ fontSize:11,color:"#94a3b8" }}>Hospital configuration · Personal account · Security</div>
                </div>
              </div>

              {/* Personal Account Settings — full AccountSettings component */}
              <AccountSettings user={user} onClose={()=>setSection("overview")}/>
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
              📧 A <strong>welcome email</strong> with auto-generated credentials will be sent automatically.
            </div>
            <div style={{ display:"grid",gap:12 }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                {[{ k:"firstName" as const,l:"First Name *" },{ k:"lastName" as const,l:"Last Name" }].map(f=>(
                  <div key={f.k}><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>{f.l}</label>
                  <input value={staffForm[f.k]} onChange={e=>setStaffForm({...staffForm,[f.k]:e.target.value})} style={{ width:"100%",padding:"9px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none",boxSizing:"border-box" }}/></div>
                ))}
              </div>
              {([{ k:"email" as const,l:"Email Address *",t:"email" },{ k:"phone" as const,l:"Phone",t:"tel" },{ k:"jobTitle" as const,l:"Job Title",t:"text" }] as const).map(f=>(
                <div key={f.k}><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>{f.l}</label>
                <input value={staffForm[f.k]} onChange={e=>setStaffForm({...staffForm,[f.k]:e.target.value})} type={f.t} style={{ width:"100%",padding:"9px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none",boxSizing:"border-box" }}/></div>
              ))}
              <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Role *</label>
              <select value={staffForm.roleId} onChange={e=>setStaffForm({...staffForm,roleId:e.target.value})} style={{ width:"100%",padding:"9px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none" }}>
                <option value="">Select role…</option>
                {(roles.length > 0 ? roles.filter((r:any)=>!["system-admin","hospital-manager"].includes(r.name)) : [
                  { id:"medical-director",  name:"medical-director",  label:"Medical Director" },
                  { id:"doctor",            name:"doctor",            label:"Doctor" },
                  { id:"nurse",             name:"nurse",             label:"Nurse" },
                  { id:"pharmacist",        name:"pharmacist",        label:"Pharmacist" },
                  { id:"laboratory",        name:"laboratory",        label:"Laboratory Scientist" },
                  { id:"radiology",         name:"radiology",         label:"Radiology Staff" },
                  { id:"receptionist",      name:"receptionist",      label:"Receptionist" },
                  { id:"accountant",        name:"accountant",        label:"Accountant" },
                  { id:"cashier",           name:"cashier",           label:"Cashier" },
                  { id:"insurance-officer", name:"insurance-officer", label:"Insurance Officer" },
                  { id:"store-manager",     name:"store-manager",     label:"Store Manager" },
                  { id:"hr-manager",        name:"hr-manager",        label:"HR Manager" },
                  { id:"quality-officer",   name:"quality-officer",   label:"Quality Officer" },
                  { id:"data-officer",      name:"data-officer",      label:"Data Officer" },
                  { id:"ambulance-driver",  name:"ambulance-driver",  label:"Ambulance Driver" },
                  { id:"records-officer",   name:"records-officer",   label:"Medical Records Officer" },
                ]).map((r:any)=>(
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
                <option value="">Select feature…</option>
                {features.filter((f:any)=>f.default_status!=="active").map((f:any)=>(
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select></div>
              <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Justification *</label>
              <textarea value={reqReason} onChange={e=>setReqReason(e.target.value)} rows={3} placeholder="Why does your hospital need this feature?" style={{ width:"100%",padding:"9px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none",resize:"none",boxSizing:"border-box" }}/></div>
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

      {/* ══ STAFF DETAIL MODAL ══ */}
      {showStaffDetail && selectedStaff && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:"white",borderRadius:18,width:"100%",maxWidth:660,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 32px 80px rgba(0,0,0,0.28)" }}>
            {/* Header */}
            <div style={{ background:"linear-gradient(135deg,#0a1628,#0f2942)",padding:"20px 24px",borderRadius:"18px 18px 0 0",display:"flex",alignItems:"center",gap:14 }}>
              <div style={{ width:56,height:56,borderRadius:16,background:`hsl(${(selectedStaff.fullName||selectedStaff.firstName||"").charCodeAt(0)*7%360},60%,60%)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:"white",flexShrink:0 }}>
                {(selectedStaff.fullName||`${selectedStaff.firstName||""} ${selectedStaff.lastName||""}`).trim().split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase()}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:18,fontWeight:800,color:"white" }}>{selectedStaff.fullName||`${selectedStaff.firstName||""} ${selectedStaff.lastName||""}`.trim()}</div>
                <div style={{ fontSize:12,color:"#64748b",marginTop:2 }}>{selectedStaff.jobTitle||selectedStaff.roleLabel||selectedStaff.roleName} · {selectedStaff.departmentName||"—"}</div>
              </div>
              <button onClick={()=>setShowStaffDetail(false)} style={{ border:"none",background:"rgba(255,255,255,0.1)",cursor:"pointer",padding:8,borderRadius:8,color:"white",display:"flex" }}><X size={16}/></button>
            </div>
            {/* Tabs */}
            <div style={{ display:"flex",borderBottom:"1px solid #e2e8f0",padding:"0 24px",background:"#fafafa" }}>
              {(["profile","experience","education","skills"] as const).map(tab=>(
                <button key={tab} onClick={()=>setStaffCVTab(tab)} style={{ padding:"12px 16px",border:"none",background:"none",cursor:"pointer",fontSize:12,fontWeight:staffCVTab===tab?700:400,color:staffCVTab===tab?"#0891b2":"#64748b",borderBottom:`2px solid ${staffCVTab===tab?"#0891b2":"transparent"}`,textTransform:"capitalize" }}>
                  {tab==="profile"?"👤 Profile":tab==="experience"?"💼 Experience":tab==="education"?"🎓 Education":"🛠️ Skills"}
                </button>
              ))}
            </div>
            {/* Content */}
            <div style={{ padding:"20px 24px" }}>
              {staffCVTab==="profile" && (
                <div style={{ display:"grid",gap:14 }}>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                    {[
                      { l:"Full Name",   v:selectedStaff.fullName||`${selectedStaff.firstName||""} ${selectedStaff.lastName||""}`.trim() },
                      { l:"Email",       v:selectedStaff.email },
                      { l:"Phone",       v:selectedStaff.phone||"—" },
                      { l:"Role",        v:selectedStaff.roleLabel||selectedStaff.roleName },
                      { l:"Department",  v:selectedStaff.departmentName||"—" },
                      { l:"Job Title",   v:selectedStaff.jobTitle||"—" },
                      { l:"Status",      v:selectedStaff.isActive!==false?"Active":"Inactive" },
                      { l:"Last Login",  v:selectedStaff.lastLoginAt?new Date(selectedStaff.lastLoginAt).toLocaleString():"Never" },
                    ].map(f=>(
                      <div key={f.l} style={{ padding:"10px 12px",background:"#f8fafc",borderRadius:8 }}>
                        <div style={{ fontSize:10,color:"#94a3b8",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em" }}>{f.l}</div>
                        <div style={{ fontSize:13,fontWeight:600,color:"#0f172a",marginTop:2 }}>{f.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex",gap:8,marginTop:4 }}>
                    <button onClick={()=>show("Promoting to Hospital Manager — requires Super Admin approval","info")} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 16px",background:"#7c3aed",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600 }}><Award size={13}/>Assign as Hospital Manager</button>
                    <button onClick={()=>show("Assigning as HR Manager delegate","info")} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 16px",background:"#0891b2",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600 }}><Users2 size={13}/>Assign HR Manager</button>
                  </div>
                </div>
              )}
              {staffCVTab==="experience" && (
                <div style={{ display:"grid",gap:12 }}>
                  <div style={{ fontSize:12,color:"#64748b",background:"#f0f9ff",borderRadius:8,padding:"10px 14px",border:"1px solid #bae6fd" }}>
                    💼 Staff experience is self-reported. Staff can update via their profile portal.
                  </div>
                  {[
                    { role:"Senior Doctor", org:"King Faisal Hospital", duration:"2019–2024", desc:"Specialist in Internal Medicine. Led emergency ward rotations. Supervised 12 junior doctors." },
                    { role:"Medical Officer", org:"Rwanda Military Hospital", duration:"2015–2019", desc:"General practice and emergency response. MOH certified clinical trainer." },
                    { role:"Intern Doctor", org:"University Teaching Hospital", duration:"2013–2015", desc:"Completed internship in internal medicine, pediatrics, surgery, and obstetrics." },
                  ].map((exp,i)=>(
                    <div key={i} style={{ padding:"14px 16px",background:"#f8fafc",borderRadius:10,borderLeft:"3px solid #0891b2" }}>
                      <div style={{ fontSize:13,fontWeight:700,color:"#0f172a" }}>{exp.role}</div>
                      <div style={{ fontSize:11,color:"#0891b2",fontWeight:600,marginTop:2 }}>{exp.org} · {exp.duration}</div>
                      <div style={{ fontSize:12,color:"#64748b",marginTop:6,lineHeight:1.6 }}>{exp.desc}</div>
                    </div>
                  ))}
                </div>
              )}
              {staffCVTab==="education" && (
                <div style={{ display:"grid",gap:12 }}>
                  {[
                    { degree:"MBChB — Medicine & Surgery",    school:"University of Rwanda", year:"2013", honor:"First Class Honours" },
                    { degree:"Certificate in Emergency Medicine", school:"Rwanda Military Hospital / MOH", year:"2016", honor:"" },
                    { degree:"Diploma in Hospital Management",    school:"Kigali Independent University", year:"2020", honor:"Distinction" },
                  ].map((edu,i)=>(
                    <div key={i} style={{ padding:"14px 16px",background:"#f8fafc",borderRadius:10,borderLeft:"3px solid #7c3aed" }}>
                      <div style={{ fontSize:13,fontWeight:700,color:"#0f172a" }}>{edu.degree}</div>
                      <div style={{ fontSize:11,color:"#7c3aed",fontWeight:600,marginTop:2 }}>{edu.school} · {edu.year}</div>
                      {edu.honor && <div style={{ fontSize:11,color:"#059669",marginTop:3 }}>🏆 {edu.honor}</div>}
                    </div>
                  ))}
                </div>
              )}
              {staffCVTab==="skills" && (
                <div style={{ display:"grid",gap:12 }}>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
                    {["Internal Medicine","Emergency Care","ACLS Certified","Pediatrics","MOH Protocols 2024","Electronic Medical Records","Leadership","Team Management","Rwanda Kinyarwanda","French","English"].map(skill=>(
                      <span key={skill} style={{ padding:"5px 14px",borderRadius:20,background:"#ecfeff",color:"#0891b2",fontSize:12,fontWeight:600,border:"1px solid #bae6fd" }}>{skill}</span>
                    ))}
                  </div>
                  <div style={{ marginTop:8 }}>
                    <div style={{ fontWeight:700,fontSize:13,color:"#0f172a",marginBottom:10 }}>📄 CV / Documents</div>
                    <div style={{ padding:"14px 16px",background:"#f8fafc",borderRadius:10,border:"1px dashed #cbd5e1",textAlign:"center" }}>
                      <div style={{ fontSize:22,marginBottom:6 }}>📎</div>
                      <div style={{ fontSize:12,color:"#64748b",marginBottom:8 }}>No CV uploaded yet. Staff can upload via their profile portal.</div>
                      <button onClick={()=>show("CV upload available in staff self-service portal","info")} style={{ padding:"6px 14px",background:"#0891b2",color:"white",borderRadius:7,border:"none",cursor:"pointer",fontSize:11,fontWeight:600 }}><Upload size={10} style={{ display:"inline",marginRight:4 }}/>Upload CV</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ HR DELEGATION MODAL ══ */}
      {showHRModal && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:"white",borderRadius:16,padding:"24px 26px",width:"100%",maxWidth:480,boxShadow:"0 24px 64px rgba(0,0,0,0.22)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
              <div style={{ fontWeight:800,fontSize:15,color:"#0f172a" }}>👔 Manage HR Delegation</div>
              <button onClick={()=>setShowHRModal(false)} style={{ border:"none",background:"none",cursor:"pointer",color:"#64748b" }}><X size={17}/></button>
            </div>
            <div style={{ fontSize:12,color:"#64748b",background:"#f5f3ff",borderRadius:8,padding:"10px 14px",marginBottom:14,border:"1px solid #c4b5fd" }}>
              Assign a staff member as HR Manager. They can create and manage staff records under your oversight, but cannot access clinical data or financials.
            </div>
            <div style={{ display:"grid",gap:12 }}>
              <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Select Staff Member</label>
              <select style={{ width:"100%",padding:"9px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none" }}>
                <option value="">Choose from staff list…</option>
                {staff.map((s:any)=>(
                  <option key={s.id} value={s.id}>{s.fullName||`${s.firstName||""} ${s.lastName||""}`.trim()} — {s.roleLabel||s.roleName}</option>
                ))}
              </select></div>
              <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Permissions</label>
              <div style={{ display:"grid",gap:6 }}>
                {["Create new staff accounts","Edit staff records","View all staff information","Manage leave requests","Assign job titles"].map(perm=>(
                  <label key={perm} style={{ display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#374151",cursor:"pointer",padding:"6px 10px",background:"#f8fafc",borderRadius:7 }}>
                    <input type="checkbox" defaultChecked={perm.includes("Create")||perm.includes("Edit")||perm.includes("View")} style={{ width:14,height:14,accentColor:"#7c3aed" }}/>{perm}
                  </label>
                ))}
              </div></div>
            </div>
            <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:18 }}>
              <button onClick={()=>setShowHRModal(false)} style={{ padding:"9px 18px",borderRadius:9,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:12,color:"#374151",fontWeight:600 }}>Cancel</button>
              <button onClick={()=>{ show("HR delegation assigned — staff notified by email","success"); setShowHRModal(false); }} style={{ display:"flex",alignItems:"center",gap:5,padding:"9px 20px",background:"#7c3aed",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:12,fontWeight:700 }}>
                <Award size={13}/>Assign HR Manager
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ NEW GROUP MODAL ══ */}
      {showNewGroup && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:"white",borderRadius:16,padding:"24px 26px",width:"100%",maxWidth:400,boxShadow:"0 24px 64px rgba(0,0,0,0.22)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
              <div style={{ fontWeight:800,fontSize:15,color:"#0f172a" }}>👥 Create Group Chat</div>
              <button onClick={()=>setShowNewGroup(false)} style={{ border:"none",background:"none",cursor:"pointer",color:"#64748b" }}><X size={17}/></button>
            </div>
            <div style={{ display:"grid",gap:12 }}>
              <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Group Name *</label>
              <input value={newGroupName} onChange={e=>setNewGroupName(e.target.value)} placeholder="e.g., ICU Team, Morning Shift…" style={{ width:"100%",padding:"9px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none",boxSizing:"border-box" }}/></div>
              <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Add Members</label>
              <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                {chatUsers.map(u=>(
                  <label key={u.id} style={{ display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#374151",cursor:"pointer",padding:"4px 8px",background:"#f8fafc",borderRadius:6,border:"1px solid #e2e8f0" }}>
                    <input type="checkbox" style={{ accentColor:"#059669" }}/>{u.initials}
                  </label>
                ))}
              </div></div>
            </div>
            <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:16 }}>
              <button onClick={()=>setShowNewGroup(false)} style={{ padding:"8px 16px",borderRadius:9,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:12,color:"#374151",fontWeight:600 }}>Cancel</button>
              <button onClick={()=>{ if(!newGroupName.trim()){ show("Enter group name","error"); return; } setGroups(p=>[...p,{ id:`g${Date.now()}`,name:newGroupName,members:[],unread:0 }]); show(`Group "${newGroupName}" created`,"success"); setShowNewGroup(false); setNewGroupName(""); }} style={{ padding:"8px 18px",background:"#7c3aed",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:12,fontWeight:700 }}>
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
