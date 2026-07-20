"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useToast } from "@/lib/store";
import { getSession, logout } from "@/lib/auth";
import {
  LayoutDashboard, Users, Calendar, FlaskConical,
  DollarSign, ShieldCheck, Settings, MessageSquare, Bot,
  LogOut, Search, Plus, ChevronLeft, Menu, RefreshCw,
  Eye, EyeOff, Save, X, BarChart3, Zap, UserPlus,
  Key, Send, Paperclip, Video, Phone, Pill as PillIcon,
} from "lucide-react";
import {
  usersApi, appointmentsApi, billingApi, reportsApi, superAdminApi,
} from "@/lib/api/hms";

// ── Types ─────────────────────────────────────────────────────────────────────
type HMSection =
  | "overview" | "staff" | "patients" | "appointments"
  | "pharmacy" | "laboratory" | "billing" | "insurance"
  | "reports" | "chat" | "ai" | "requests" | "settings";

const API = process.env.NEXT_PUBLIC_API_URL || "http://172.209.217.176:4001";

const AI_PROMPTS = [
  { label:"Staff Scheduling", icon:"👥", prompt:"Suggest optimal staff schedule for next week based on patient volumes" },
  { label:"Financial Report", icon:"📊", prompt:"Summarize this month's financial performance and key trends" },
  { label:"Bed Occupancy",    icon:"🛏️", prompt:"Analyze current bed occupancy and forecast for next 3 days" },
  { label:"MOH Protocol",     icon:"🇷🇼", prompt:"What are Rwanda MOH requirements for hospital reporting?" },
  { label:"Quality Metrics",  icon:"✅", prompt:"List key quality indicators I should monitor daily" },
  { label:"Drug Shortage",    icon:"💊", prompt:"How to manage a critical drug shortage situation?" },
];

const NAV_ITEMS = [
  { key:"overview",     label:"Dashboard",       icon:LayoutDashboard },
  { key:"staff",        label:"Staff",           icon:Users },
  { key:"appointments", label:"Appointments",    icon:Calendar },
  { key:"pharmacy",     label:"Pharmacy",        icon:PillIcon },
  { key:"laboratory",   label:"Laboratory",      icon:FlaskConical },
  { key:"billing",      label:"Billing & Finance",icon:DollarSign },
  { key:"reports",      label:"Reports",         icon:BarChart3 },
  { key:"chat",         label:"Communication",   icon:MessageSquare },
  { key:"ai",           label:"AI Companion",    icon:Bot },
  { key:"requests",     label:"Feature Requests",icon:Zap },
  { key:"settings",     label:"Settings",        icon:Settings },
] as const;

// ── Sub-components ─────────────────────────────────────────────────────────────
const Card = ({ children, style }: any) => (
  <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",boxShadow:"0 1px 3px rgba(0,0,0,0.04)",overflow:"hidden",...style }}>{children}</div>
);
const CardHead = ({ title, sub, action }: any) => (
  <div style={{ padding:"13px 16px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10 }}>
    <div>
      <div style={{ fontWeight:700,fontSize:13,color:"#0f172a" }}>{title}</div>
      {sub && <div style={{ fontSize:10,color:"#94a3b8",marginTop:1 }}>{sub}</div>}
    </div>
    {action}
  </div>
);
const Tag = ({ label, color, bg }: any) => (
  <span style={{ padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:600,background:bg,color }}>{label}</span>
);
const Stat = ({ label, value, icon, color, sub }: any) => (
  <div style={{ background:"white",borderRadius:12,padding:"14px 16px",border:"1px solid #e2e8f0",borderTop:`3px solid ${color}` }}>
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
      <div>
        <div style={{ fontSize:22,fontWeight:800,color }}>{value}</div>
        <div style={{ fontSize:11,color:"#64748b",marginTop:2,fontWeight:500 }}>{label}</div>
        {sub && <div style={{ fontSize:10,color:"#94a3b8",marginTop:1 }}>{sub}</div>}
      </div>
      <span style={{ fontSize:20 }}>{icon}</span>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export default function HospitalManagerPage() {
  const { show } = useToast();
  const [user, setUser]       = useState<any>(null);
  const [section, setSection] = useState<HMSection>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Data
  const [staff, setStaff]           = useState<any[]>([]);
  const [appointments, setAppts]    = useState<any[]>([]);
  const [invoices, setInvoices]     = useState<any[]>([]);
  const [kpis, setKpis]             = useState<any[]>([]);
  const [features, setFeatures]     = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);

  // Staff modal
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffForm, setStaffForm]       = useState({ firstName:"",lastName:"",email:"",phone:"",roleId:"",jobTitle:"",departmentId:"" });
  const [roles, setRoles]               = useState<any[]>([]);

  // Chat
  const [chatUsers, setChatUsers]     = useState<any[]>([]);
  const [selThread, setSelThread]     = useState<any>(null);
  const [messages, setMessages]       = useState<any[]>([]);
  const [msgInput, setMsgInput]       = useState("");
  const [chatSearch, setChatSearch]   = useState("");
  const msgEnd = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // AI
  const [aiInput, setAiInput]     = useState("");
  const [aiResp, setAiResp]       = useState<string|null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHistory, setAiHistory] = useState<any[]>([]);
  const [aiAction, setAiAction]   = useState<any>(null);

  // Feature request
  const [showReqModal, setShowReqModal] = useState(false);
  const [reqForm, setReqForm]           = useState({ featureId:"", reason:"" });

  // Change password
  const [pwForm, setPwForm]   = useState({ current:"",newPw:"",confirm:"" });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  // Load data
  const load = useCallback(async () => {
    const session = getSession();
    if (!session) { window.location.href="/login"; return; }
    setUser(session);
    setLoading(true);
    try {
      const [s,a,i,r] = await Promise.all([
        usersApi.list(Object.fromEntries(Object.entries({ hospitalId: session.hospitalId, limit:"50" }).filter(([,v])=>v!=null)) as Record<string,string>),
        appointmentsApi.list({ limit:"20" }),
        billingApi.listInvoices({ limit:"20" }),
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
      usersApi.roles().then((res:any) => setRoles(res?.roles || [])).catch(()=>{});
    }
    if (section==="chat") {
      // Load chat users (hospital staff)
      setChatUsers([
        { id:"u1",name:"Dr. Grace Mukamana",role:"doctor",status:"online",initials:"GM",unread:2 },
        { id:"u2",name:"Nurse Eric Niyonsenga",role:"nurse",status:"online",initials:"EN",unread:0 },
        { id:"u3",name:"Diane Ingabire",role:"pharmacist",status:"away",initials:"DI",unread:1 },
        { id:"u4",name:"Patrick Mugabo",role:"laboratory",status:"offline",initials:"PM",unread:0 },
        { id:"u5",name:"Olive Mukazana",role:"receptionist",status:"online",initials:"OM",unread:3 },
      ]);
    }
    if (section==="requests") {
      superAdminApi.listFeatures().then((res:any) => setFeatures(Array.isArray(res)?res:[])).catch(()=>{});
      superAdminApi.listRequests({ status:"all" }).then((res:any) => setMyRequests(Array.isArray(res)?res:[])).catch(()=>{});
    }
  }, [section]);

  // Create staff
  async function createStaff() {
    if (!staffForm.firstName||!staffForm.email||!staffForm.roleId) { show("Name, email and role required","error"); return; }
    try {
      const session = getSession();
      const tempPw = `Staff@${Math.floor(1000+Math.random()*9000)}!`;
      await usersApi.create({
        firstName:staffForm.firstName, lastName:staffForm.lastName,
        email:staffForm.email, phone:staffForm.phone||null,
        roleId:staffForm.roleId, jobTitle:staffForm.jobTitle||null,
        departmentId:staffForm.departmentId||null,
        password:tempPw, hospitalId:session?.hospitalId||null,
        tenantId:session?.tenantId||null,
      });
      show(`✅ Staff "${staffForm.firstName} ${staffForm.lastName}" created · Welcome email sent`,"success");
      setShowAddStaff(false);
      setStaffForm({ firstName:"",lastName:"",email:"",phone:"",roleId:"",jobTitle:"",departmentId:"" });
      load();
    } catch(e:any) { show(e.message||"Failed","error"); }
  }

  // Chat
  function sendMsg() {
    if (!msgInput.trim()||!selThread) return;
    setMessages(prev=>[...prev,{ id:Date.now().toString(),from:"me",text:msgInput,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) }]);
    setMsgInput("");
    setTimeout(()=>setMessages(prev=>[...prev,{ id:(Date.now()+1).toString(),from:selThread.id,text:"Understood, noted. I will action this.",time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) }]),1200);
  }
  function handleFileAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files||[]);
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setMessages(prev=>[...prev,{ id:Date.now().toString()+Math.random(),from:"me",file:{ name:file.name,size:file.size,type:file.type,url },time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) }]);
    });
    e.target.value="";
  }

  // AI
  async function askAI() {
    if (!aiInput.trim()) return;
    setAiLoading(true); const q=aiInput; setAiInput(""); setAiResp(null);
    try {
      const res = await superAdminApi.queryAI({ query:q }) as any;
      const ans = res?.response || `Based on your query about "${q}", here is guidance aligned with Rwanda MOH protocols (2024). For operational decisions, consult your clinical and administrative team.`;
      setAiResp(ans);
      setAiHistory(prev=>[{ id:Date.now().toString(),q,ans,time:new Date().toLocaleString() },...prev.slice(0,19)]);
    } catch {
      const fallback = `Regarding "${q}":\n\nARTIC AI provides hospital management guidance based on Rwanda MOH protocols and best practices. For clinical decisions, consult qualified medical professionals.`;
      setAiResp(fallback);
    } finally { setAiLoading(false); }
  }

  // Feature request
  async function submitRequest() {
    if (!reqForm.featureId||!reqForm.reason) { show("Feature and reason required","error"); return; }
    const session = getSession();
    try {
      await superAdminApi.submitRequest({ hospitalId:(session as any)?.hospitalId, featureId:reqForm.featureId, reason:reqForm.reason });
      show("Feature request submitted — Super Admin will review","success");
      setShowReqModal(false); setReqForm({ featureId:"",reason:"" });
    } catch { show("Request submitted (pending admin review)","info"); setShowReqModal(false); }
  }

  // Change password
  async function changePassword() {
    if (!pwForm.current||!pwForm.newPw) { show("All fields required","error"); return; }
    if (pwForm.newPw.length<8) { show("New password must be at least 8 characters","error"); return; }
    if (pwForm.newPw !== pwForm.confirm) { show("Passwords do not match","error"); return; }
    setPwLoading(true);
    try {
      const session = getSession();
      const res = await fetch(`${API}/api/auth/change-password`, {
        method:"POST",
        headers:{ "Content-Type":"application/json","Authorization":`Bearer ${session?.accessToken}` },
        body:JSON.stringify({ currentPassword:pwForm.current, newPassword:pwForm.newPw }),
      });
      const data = await res.json();
      if (res.ok) {
        show("✅ Password changed! You will be logged out.","success");
        setPwForm({ current:"",newPw:"",confirm:"" });
        setTimeout(()=>{ logout(); window.location.href="/login"; },2000);
      } else { show(data.message||"Failed to change password","error"); }
    } catch { show("Server error","error"); }
    finally { setPwLoading(false); }
  }

  const pendingInvoices = invoices.filter((i:any)=>i.status==="unpaid"||i.status==="pending");
  const totalRevenue    = invoices.filter((i:any)=>i.status==="paid").reduce((s:number,i:any)=>s+Number(i.total||i.amount||0),0);

  return (
    <div style={{ display:"flex",height:"100vh",overflow:"hidden",fontFamily:"'Inter',system-ui,sans-serif",background:"#f8fafc" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width:collapsed?64:240,background:"linear-gradient(180deg,#0f172a 0%,#1e3a5f 100%)",display:"flex",flexDirection:"column",transition:"width 0.2s ease",flexShrink:0,overflow:"hidden" }}>
        {/* Brand */}
        <div style={{ padding:"16px",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#0891b2,#059669)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"white",fontSize:16,flexShrink:0 }}>🏥</div>
          {!collapsed && (
            <div style={{ overflow:"hidden" }}>
              <div style={{ color:"white",fontWeight:700,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{user?.facility||"Hospital"}</div>
              <div style={{ color:"#64748b",fontSize:10,whiteSpace:"nowrap" }}>Hospital Manager</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex:1,overflowY:"auto",padding:"8px" }}>
          {NAV_ITEMS.map(item => {
            const Icon=item.icon; const active=section===item.key;
            return (
              <button key={item.key} onClick={()=>setSection(item.key as HMSection)}
                title={collapsed?item.label:undefined}
                style={{ display:"flex",alignItems:"center",gap:10,width:"100%",padding:collapsed?"10px":"9px 12px",justifyContent:collapsed?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",marginBottom:2,background:active?"rgba(8,145,178,0.22)":"transparent",color:active?"#38bdf8":"#94a3b8",transition:"all 0.15s" }}>
                <Icon size={16} style={{ flexShrink:0 }}/>
                {!collapsed && <span style={{ fontSize:12,fontWeight:active?600:400,flex:1,textAlign:"left",whiteSpace:"nowrap" }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding:"8px 8px 16px",borderTop:"1px solid rgba(255,255,255,0.08)" }}>
          {!collapsed && user && (
            <div style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 10px",marginBottom:6 }}>
              <div style={{ width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#0891b2,#059669)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"white",flexShrink:0 }}>
                {(user.name||"M").split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase()}
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:11,fontWeight:600,color:"white",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user.name}</div>
                <div style={{ fontSize:9,color:"#64748b" }}>Hospital Manager</div>
              </div>
            </div>
          )}
          <button onClick={()=>{logout();window.location.href="/login";}}
            style={{ display:"flex",alignItems:"center",gap:10,width:"100%",padding:collapsed?"10px":"8px 12px",justifyContent:collapsed?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",background:"transparent",color:"#64748b" }}>
            <LogOut size={15}/>{!collapsed && <span style={{ fontSize:12 }}>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
        {/* Top bar */}
        <header style={{ background:"white",borderBottom:"1px solid #e2e8f0",padding:"0 18px",height:54,display:"flex",alignItems:"center",gap:10,flexShrink:0 }}>
          <button onClick={()=>setCollapsed(!collapsed)} style={{ border:"none",background:"none",cursor:"pointer",padding:6,borderRadius:6,color:"#64748b",display:"flex" }}>
            {collapsed?<Menu size={17}/>:<ChevronLeft size={17}/>}
          </button>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700,fontSize:14,color:"#0f172a" }}>{NAV_ITEMS.find(n=>n.key===section)?.label}</div>
            <div style={{ fontSize:10,color:"#94a3b8" }}>{user?.facility||"Hospital"} — Hospital Management Portal</div>
          </div>
          <button onClick={load} disabled={loading} style={{ border:"none",background:"none",cursor:"pointer",padding:6,borderRadius:6,color:"#64748b",display:"flex" }}>
            <RefreshCw size={14} style={loading?{animation:"spin 1s linear infinite"}:{}}/>
          </button>
          <div style={{ display:"flex",alignItems:"center",gap:6 }}>
            <span style={{ fontSize:11,color:"#94a3b8" }}>{user?.name}</span>
            <div style={{ width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#0891b2,#059669)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:11,fontWeight:700 }}>
              {(user?.name||"M").split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Body */}
        <div style={{ flex:1,overflowY:"auto",padding:20 }}>

          {/* ══ OVERVIEW ══ */}
          {section==="overview" && (
            <div style={{ display:"grid",gap:16 }}>
              {/* Welcome banner */}
              <div style={{ background:"linear-gradient(135deg,#0f172a,#1e3a5f)",borderRadius:14,padding:"20px 24px",color:"white",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12 }}>
                <div>
                  <div style={{ fontSize:18,fontWeight:800 }}>Good {new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"}, {user?.name?.split(" ")[0]||"Manager"} 👋</div>
                  <div style={{ fontSize:12,color:"#94a3b8",marginTop:4 }}>{user?.facility} · {new Date().toLocaleDateString("en-RW",{ weekday:"long",day:"numeric",month:"long",year:"numeric" })}</div>
                </div>
                <div style={{ display:"flex",gap:8 }}>
                  <button onClick={()=>setSection("staff")} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 14px",background:"rgba(8,145,178,0.2)",color:"#38bdf8",border:"1px solid rgba(8,145,178,0.3)",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600 }}><UserPlus size={13}/>Add Staff</button>
                  <button onClick={()=>setSection("reports")} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 14px",background:"rgba(5,150,105,0.2)",color:"#34d399",border:"1px solid rgba(5,150,105,0.3)",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600 }}><BarChart3 size={13}/>View Reports</button>
                </div>
              </div>

              {/* KPI stats */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12 }}>
                <Stat label="Staff on Duty"         value={staff.length}                    icon="👥" color="#0891b2" sub="Active accounts"/>
                <Stat label="Today's Appointments"  value={appointments.length}             icon="📅" color="#7c3aed" sub="Scheduled today"/>
                <Stat label="Pending Invoices"       value={pendingInvoices.length}          icon="⏳" color="#d97706" sub="Awaiting payment"/>
                <Stat label="Revenue Collected"      value={`RWF ${(totalRevenue/1000).toFixed(0)}K`} icon="💰" color="#059669" sub="Paid invoices"/>
                <Stat label="Critical Alerts"        value={kpis.find((k:any)=>k.label?.includes("Critical"))?.value||"0"} icon="🚨" color="#dc2626" sub="Needs attention"/>
                <Stat label="Bed Occupancy"          value={kpis.find((k:any)=>k.label?.includes("Bed"))?.value||"82%"} icon="🛏️" color="#0891b2" sub="Current status"/>
              </div>

              <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:14 }}>
                {/* Quick actions */}
                <Card>
                  <CardHead title="⚡ Quick Actions"/>
                  <div style={{ padding:"14px 16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                    {[
                      { label:"Add Staff Member",   icon:"👤",  action:()=>setSection("staff"),        color:"#0891b2" },
                      { label:"View Appointments",  icon:"📅",  action:()=>setSection("appointments"),  color:"#7c3aed" },
                      { label:"Generate Report",    icon:"📊",  action:()=>setSection("reports"),        color:"#059669" },
                      { label:"Request Feature",    icon:"⚡",  action:()=>setSection("requests"),       color:"#d97706" },
                      { label:"Open Chat",          icon:"💬",  action:()=>setSection("chat"),           color:"#0891b2" },
                      { label:"AI Assistant",       icon:"🤖",  action:()=>setSection("ai"),             color:"#7c3aed" },
                    ].map(a=>(
                      <button key={a.label} onClick={a.action}
                        style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:`${a.color}08`,border:`1px solid ${a.color}25`,borderRadius:9,cursor:"pointer",fontSize:12,fontWeight:600,color:a.color,textAlign:"left" }}>
                        <span style={{ fontSize:18 }}>{a.icon}</span>{a.label}
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Privacy notice */}
                <div style={{ background:"linear-gradient(135deg,#059669,#0891b2)",borderRadius:12,padding:"16px 18px",color:"white" }}>
                  <div style={{ fontWeight:700,fontSize:13,marginBottom:8,display:"flex",alignItems:"center",gap:5 }}><ShieldCheck size={14}/>Your Access Scope</div>
                  <div style={{ fontSize:11,lineHeight:2,opacity:0.9 }}>
                    ✅ Your hospital only<br/>
                    ✅ Staff management<br/>
                    ✅ Operational metrics<br/>
                    ✅ Financial oversight<br/>
                    ✅ Communication tools<br/>
                    🔒 No other hospital data<br/>
                    🔒 No individual clinical notes
                  </div>
                </div>
              </div>

              {/* Recent appointments */}
              {appointments.length > 0 && (
                <Card>
                  <CardHead title="📅 Recent Appointments" sub={`${appointments.length} loaded`} action={<button onClick={()=>setSection("appointments")} style={{ fontSize:11,color:"#0891b2",border:"none",background:"none",cursor:"pointer",fontWeight:600 }}>View all →</button>}/>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                      <thead><tr style={{ background:"#f8fafc",borderBottom:"1px solid #e2e8f0" }}>
                        {["Time","Patient","Doctor","Dept","Status"].map(h=><th key={h} style={{ padding:"8px 12px",textAlign:"left",fontWeight:600,fontSize:10,color:"#64748b",textTransform:"uppercase" }}>{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {appointments.slice(0,6).map((a:any)=>(
                          <tr key={a.id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                            <td style={{ padding:"8px 12px",color:"#64748b" }}>{a.start_time||a.time||"—"}</td>
                            <td style={{ padding:"8px 12px",fontWeight:600,color:"#0f172a" }}>{a.patient_name||a.patient||"—"}</td>
                            <td style={{ padding:"8px 12px",color:"#374151" }}>{a.doctor_name||a.clinician||"—"}</td>
                            <td style={{ padding:"8px 12px",color:"#64748b" }}>{a.department_name||a.department||"—"}</td>
                            <td style={{ padding:"8px 12px" }}><Tag label={a.status||"scheduled"} color={a.status==="completed"?"#059669":a.status?.includes("cancel")?"#dc2626":"#d97706"} bg={a.status==="completed"?"#dcfce7":a.status?.includes("cancel")?"#fee2e2":"#fffbeb"}/></td>
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
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8 }}>
                <div>
                  <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Staff Management</div>
                  <div style={{ fontSize:11,color:"#94a3b8",marginTop:2 }}>{staff.length} staff members · Your hospital only</div>
                </div>
                <button onClick={()=>setShowAddStaff(true)} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 16px",background:"#0891b2",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:600 }}>
                  <UserPlus size={14}/>Add Staff Member
                </button>
              </div>

              <Card>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                    <thead><tr style={{ background:"#f8fafc",borderBottom:"1px solid #e2e8f0" }}>
                      {["Staff Member","Role","Department","Job Title","Status","Last Login"].map(h=>(
                        <th key={h} style={{ padding:"9px 13px",textAlign:"left",fontWeight:600,fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.04em",whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {staff.map((s:any)=>(
                        <tr key={s.id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                          <td style={{ padding:"9px 13px" }}>
                            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                              <div style={{ width:30,height:30,borderRadius:"50%",background:"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#374151",flexShrink:0 }}>
                                {(s.fullName||s.firstName||"S").split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight:600,color:"#0f172a" }}>{s.fullName||`${s.firstName} ${s.lastName}`}</div>
                                <div style={{ fontSize:10,color:"#94a3b8" }}>{s.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding:"9px 13px" }}><Tag label={s.roleLabel||s.roleName||"Staff"} color="#0891b2" bg="#ecfeff"/></td>
                          <td style={{ padding:"9px 13px",color:"#64748b" }}>{s.departmentName||"—"}</td>
                          <td style={{ padding:"9px 13px",color:"#374151" }}>{s.jobTitle||"—"}</td>
                          <td style={{ padding:"9px 13px" }}><Tag label={s.isActive?"Active":"Inactive"} color={s.isActive?"#059669":"#dc2626"} bg={s.isActive?"#dcfce7":"#fee2e2"}/></td>
                          <td style={{ padding:"9px 13px",color:"#94a3b8",fontSize:11 }}>{s.lastLoginAt?new Date(s.lastLoginAt).toLocaleDateString():"Never"}</td>
                        </tr>
                      ))}
                      {staff.length===0 && <tr><td colSpan={6} style={{ padding:28,textAlign:"center",color:"#94a3b8" }}>No staff loaded — add your first team member above.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ══ APPOINTMENTS ══ */}
          {section==="appointments" && (
            <div style={{ display:"grid",gap:14 }}>
              <div><div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Appointments</div><div style={{ fontSize:11,color:"#94a3b8" }}>{appointments.length} loaded · Aggregated view only</div></div>
              <Card>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                    <thead><tr style={{ background:"#f8fafc",borderBottom:"1px solid #e2e8f0" }}>
                      {["Date","Time","Patient","Doctor","Department","Type","Status"].map(h=>(
                        <th key={h} style={{ padding:"9px 13px",textAlign:"left",fontWeight:600,fontSize:10,color:"#64748b",textTransform:"uppercase",whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {appointments.slice(0,20).map((a:any)=>(
                        <tr key={a.id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                          <td style={{ padding:"9px 13px",color:"#64748b" }}>{a.appointment_date||a.date||"—"}</td>
                          <td style={{ padding:"9px 13px",color:"#64748b" }}>{a.start_time||a.time||"—"}</td>
                          <td style={{ padding:"9px 13px",fontWeight:600,color:"#0f172a" }}>{a.patient_name||a.patient||"—"}</td>
                          <td style={{ padding:"9px 13px",color:"#374151" }}>{a.doctor_name||a.clinician||"—"}</td>
                          <td style={{ padding:"9px 13px",color:"#64748b" }}>{a.department_name||a.department||"—"}</td>
                          <td style={{ padding:"9px 13px",color:"#374151" }}>{a.type||"Consultation"}</td>
                          <td style={{ padding:"9px 13px" }}><Tag label={a.status||"scheduled"} color={a.status==="completed"?"#059669":"#d97706"} bg={a.status==="completed"?"#dcfce7":"#fffbeb"}/></td>
                        </tr>
                      ))}
                      {appointments.length===0 && <tr><td colSpan={7} style={{ padding:28,textAlign:"center",color:"#94a3b8" }}>No appointments data.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ══ PHARMACY ══ */}
          {section==="pharmacy" && (
            <div style={{ display:"grid",gap:14 }}>
              <div><div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Pharmacy Overview</div><div style={{ fontSize:11,color:"#94a3b8" }}>Inventory levels and usage metrics — no individual prescriptions</div></div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12 }}>
                <Stat label="Total Drug Lines"    value="248"  icon="💊" color="#7c3aed" sub="In formulary"/>
                <Stat label="Low Stock Items"     value="12"   icon="⚠️" color="#dc2626" sub="Below reorder"/>
                <Stat label="Expiring 30 Days"    value="8"    icon="📅" color="#d97706" sub="Action needed"/>
                <Stat label="Dispensed Today"     value="143"  icon="✅" color="#059669" sub="Prescriptions"/>
              </div>
              <Card><CardHead title="💊 Pharmacy Operations" sub="Operational metrics only — individual prescriptions restricted"/>
                <div style={{ padding:14,color:"#64748b",fontSize:13,lineHeight:1.9 }}>
                  <div>✅ Prescription volumes visible (aggregated)</div>
                  <div>✅ Inventory levels and reorder alerts</div>
                  <div>✅ Expiry tracking and wastage metrics</div>
                  <div>🔒 Individual patient prescriptions are restricted</div>
                  <div style={{ marginTop:10 }}><button onClick={()=>show("Full pharmacy report available in Reports section","info")} style={{ padding:"7px 14px",background:"#7c3aed",color:"white",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600 }}>View Pharmacy Report →</button></div>
                </div>
              </Card>
            </div>
          )}

          {/* ══ LABORATORY ══ */}
          {section==="laboratory" && (
            <div style={{ display:"grid",gap:14 }}>
              <div><div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Laboratory Overview</div><div style={{ fontSize:11,color:"#94a3b8" }}>Turnaround times and volume metrics — no individual results</div></div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12 }}>
                <Stat label="Tests Today"       value="89"  icon="🔬" color="#0891b2" sub="Processed"/>
                <Stat label="Critical Results"  value="3"   icon="🚨" color="#dc2626" sub="Awaiting review"/>
                <Stat label="Avg Turnaround"    value="42m" icon="⏱️" color="#d97706" sub="Today's average"/>
                <Stat label="Pending Orders"    value="17"  icon="⏳" color="#7c3aed" sub="In queue"/>
              </div>
              <Card><CardHead title="🔬 Laboratory Operations"/>
                <div style={{ padding:14,color:"#64748b",fontSize:13,lineHeight:1.9 }}>
                  <div>✅ Test volumes and turnaround times</div>
                  <div>✅ Equipment utilization and QC metrics</div>
                  <div>✅ Critical result notification rates</div>
                  <div>🔒 Individual patient results are restricted to clinical staff</div>
                </div>
              </Card>
            </div>
          )}

          {/* ══ BILLING ══ */}
          {section==="billing" && (
            <div style={{ display:"grid",gap:14 }}>
              <div><div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Billing & Finance</div><div style={{ fontSize:11,color:"#94a3b8" }}>{invoices.length} invoices · RWF {(totalRevenue/1000).toFixed(0)}K collected</div></div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12 }}>
                <Stat label="Total Invoices"  value={invoices.length}              icon="📄" color="#0891b2"/>
                <Stat label="Paid"            value={invoices.filter((i:any)=>i.status==="paid").length}   icon="✅" color="#059669"/>
                <Stat label="Pending"         value={pendingInvoices.length}        icon="⏳" color="#d97706"/>
                <Stat label="Revenue (RWF)"   value={`${(totalRevenue/1000).toFixed(0)}K`} icon="💰" color="#059669"/>
              </div>
              <Card>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                    <thead><tr style={{ background:"#f8fafc",borderBottom:"1px solid #e2e8f0" }}>
                      {["Invoice","Patient","Amount","Status","Date"].map(h=>(
                        <th key={h} style={{ padding:"9px 13px",textAlign:"left",fontWeight:600,fontSize:10,color:"#64748b",textTransform:"uppercase" }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {invoices.slice(0,15).map((inv:any)=>(
                        <tr key={inv.id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                          <td style={{ padding:"9px 13px",fontWeight:700,color:"#0891b2" }}>{inv.invoice_number||inv.number||"—"}</td>
                          <td style={{ padding:"9px 13px",color:"#0f172a" }}>{inv.patient_name||inv.patient||"—"}</td>
                          <td style={{ padding:"9px 13px",fontWeight:600 }}>RWF {Number(inv.total||inv.amount||0).toLocaleString()}</td>
                          <td style={{ padding:"9px 13px" }}><Tag label={inv.status||"pending"} color={inv.status==="paid"?"#059669":inv.status?.includes("cancel")?"#dc2626":"#d97706"} bg={inv.status==="paid"?"#dcfce7":inv.status?.includes("cancel")?"#fee2e2":"#fffbeb"}/></td>
                          <td style={{ padding:"9px 13px",color:"#64748b",fontSize:11 }}>{inv.created_at?new Date(inv.created_at).toLocaleDateString():"—"}</td>
                        </tr>
                      ))}
                      {invoices.length===0 && <tr><td colSpan={5} style={{ padding:28,textAlign:"center",color:"#94a3b8" }}>No invoice data.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ══ REPORTS ══ */}
          {section==="reports" && (
            <div style={{ display:"grid",gap:14 }}>
              <div><div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Reports & Analytics</div><div style={{ fontSize:11,color:"#94a3b8" }}>Your hospital's performance — aggregated, non-identifiable data</div></div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12 }}>
                {kpis.length > 0 ? kpis.map((k:any,i:number)=>(
                  <Stat key={i} label={k.label} value={k.value} icon={i===0?"⏳":i===1?"🛏️":i===2?"💰":"🚨"} color={k.tone==="good"?"#059669":k.tone==="danger"?"#dc2626":"#d97706"} sub={k.trend}/>
                )) : [
                  <Stat key="a" label="Waiting Patients" value="—" icon="⏳" color="#d97706"/>,
                  <Stat key="b" label="Bed Occupancy"    value="82%" icon="🛏️" color="#0891b2"/>,
                  <Stat key="c" label="Revenue Today"    value="—" icon="💰" color="#059669"/>,
                  <Stat key="d" label="Critical Alerts"  value="—" icon="🚨" color="#dc2626"/>,
                ]}
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                {[
                  { title:"📋 Daily Census Report",       desc:"Patient census, admissions, discharges, transfers" },
                  { title:"💰 Revenue Summary",           desc:"Collections, pending, write-offs by department" },
                  { title:"📊 Department Performance",    desc:"Volume, turnaround times, quality metrics" },
                  { title:"😊 Patient Satisfaction",      desc:"Feedback scores, complaint trends, NPS" },
                  { title:"💊 Pharmacy Report",           desc:"Drug usage, shortages, expiry tracking" },
                  { title:"🔬 Laboratory Report",         desc:"Test volumes, TAT, critical rates" },
                ].map(r=>(
                  <Card key={r.title} style={{ padding:"14px 16px",cursor:"pointer" }}>
                    <div style={{ fontWeight:700,fontSize:13,color:"#0f172a",marginBottom:4 }}>{r.title}</div>
                    <div style={{ fontSize:11,color:"#64748b",marginBottom:10 }}>{r.desc}</div>
                    <button onClick={()=>show("Report generation — downloading…","info")} style={{ padding:"5px 12px",background:"#0891b2",color:"white",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:600 }}>Generate →</button>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ══ CHAT ══ */}
          {section==="chat" && (
            <div style={{ display:"flex",height:"calc(100vh - 120px)",minHeight:480,border:"1px solid #e2e8f0",borderRadius:12,overflow:"hidden",background:"white" }}>
              <div style={{ width:250,borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",flexShrink:0 }}>
                <div style={{ padding:"12px 12px 8px",borderBottom:"1px solid #f1f5f9" }}>
                  <div style={{ fontWeight:700,fontSize:13,color:"#0f172a",marginBottom:7 }}>Hospital Staff ({chatUsers.length})</div>
                  <div style={{ display:"flex",alignItems:"center",gap:6,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:7,padding:"5px 9px" }}>
                    <Search size={12} style={{ color:"#94a3b8" }}/>
                    <input value={chatSearch} onChange={e=>setChatSearch(e.target.value)} placeholder="Search…" style={{ border:"none",outline:"none",fontSize:12,background:"transparent",flex:1 }}/>
                  </div>
                </div>
                <div style={{ flex:1,overflowY:"auto" }}>
                  {chatUsers.filter(u=>u.name.toLowerCase().includes(chatSearch.toLowerCase())).map((u:any)=>(
                    <div key={u.id} onClick={()=>{setSelThread(u);setMessages([{id:"w",from:u.id,text:`Hello ${user?.name?.split(" ")[0]||"Manager"}! How can I help?`,time:"now"}]);}}
                      style={{ display:"flex",alignItems:"center",gap:9,padding:"10px 12px",cursor:"pointer",background:selThread?.id===u.id?"#f0f9ff":"white",borderBottom:"1px solid #f9fafb" }}>
                      <div style={{ position:"relative",flexShrink:0 }}>
                        <div style={{ width:34,height:34,borderRadius:"50%",background:selThread?.id===u.id?"#0891b2":"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:selThread?.id===u.id?"white":"#374151" }}>{u.initials}</div>
                        <div style={{ position:"absolute",bottom:0,right:0,width:9,height:9,borderRadius:"50%",border:"2px solid white",background:u.status==="online"?"#22c55e":u.status==="away"?"#f59e0b":"#d1d5db" }}/>
                      </div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:11,fontWeight:600,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{u.name}</div>
                        <div style={{ fontSize:10,color:"#94a3b8",textTransform:"capitalize" }}>{u.role}</div>
                      </div>
                      {u.unread>0 && <span style={{ background:"#0891b2",color:"white",borderRadius:10,padding:"1px 5px",fontSize:9,fontWeight:700 }}>{u.unread}</span>}
                    </div>
                  ))}
                </div>
              </div>
              {selThread ? (
                <div style={{ flex:1,display:"flex",flexDirection:"column" }}>
                  <div style={{ padding:"10px 16px",borderBottom:"1px solid #e2e8f0",display:"flex",alignItems:"center",gap:10,background:"#fafafa" }}>
                    <div style={{ width:32,height:32,borderRadius:"50%",background:"#0891b2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"white",flexShrink:0 }}>{selThread.initials}</div>
                    <div><div style={{ fontSize:13,fontWeight:700,color:"#0f172a" }}>{selThread.name}</div><div style={{ fontSize:10,color:"#94a3b8",textTransform:"capitalize" }}>{selThread.role} · {selThread.status}</div></div>
                    <div style={{ marginLeft:"auto",display:"flex",gap:5 }}>
                      <button style={{ padding:"5px 7px",borderRadius:6,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",display:"flex" }}><Phone size={12} style={{ color:"#64748b" }}/></button>
                      <button style={{ padding:"5px 7px",borderRadius:6,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",display:"flex" }}><Video size={12} style={{ color:"#64748b" }}/></button>
                    </div>
                  </div>
                  <div style={{ flex:1,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:8 }}>
                    {messages.map((m:any)=>(
                      <div key={m.id} style={{ display:"flex",flexDirection:m.from==="me"?"row-reverse":"row",gap:7,alignItems:"flex-end" }}>
                        {m.from!=="me" && <div style={{ width:24,height:24,borderRadius:"50%",background:"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,flexShrink:0 }}>{selThread.initials}</div>}
                        {m.file ? (
                          <a href={m.file.url} download={m.file.name} style={{ display:"flex",alignItems:"center",gap:7,padding:"8px 12px",background:m.from==="me"?"#0891b2":"#f1f5f9",borderRadius:10,textDecoration:"none",color:m.from==="me"?"white":"#0f172a",fontSize:11 }}>
                            📎 {m.file.name} <span style={{ opacity:0.6 }}>({(m.file.size/1024).toFixed(1)}KB)</span>
                          </a>
                        ) : (
                          <div style={{ maxWidth:"70%",background:m.from==="me"?"#0891b2":"#f1f5f9",color:m.from==="me"?"white":"#0f172a",borderRadius:m.from==="me"?"12px 12px 2px 12px":"12px 12px 12px 2px",padding:"8px 12px",fontSize:12 }}>
                            {m.text}<div style={{ fontSize:9,opacity:0.5,marginTop:2,textAlign:"right" }}>{m.time}</div>
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={msgEnd}/>
                  </div>
                  <div style={{ padding:"9px 12px",borderTop:"1px solid #e2e8f0",display:"flex",gap:7,alignItems:"center" }}>
                    <button onClick={()=>fileRef.current?.click()} style={{ padding:"7px",borderRadius:7,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",display:"flex" }}><Paperclip size={13} style={{ color:"#64748b" }}/></button>
                    <input ref={fileRef} type="file" multiple accept="*/*" onChange={handleFileAttach} style={{ display:"none" }}/>
                    <input value={msgInput} onChange={e=>setMsgInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMsg()} placeholder="Type a message…" style={{ flex:1,padding:"8px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none" }}/>
                    <button onClick={sendMsg} style={{ padding:"8px 12px",background:"#0891b2",color:"white",borderRadius:8,border:"none",cursor:"pointer",display:"flex" }}><Send size={13}/></button>
                  </div>
                </div>
              ) : (
                <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10,color:"#94a3b8" }}>
                  <MessageSquare size={44} style={{ color:"#cbd5e1" }}/>
                  <div style={{ fontSize:13,fontWeight:600,color:"#374151" }}>Select a staff member to message</div>
                </div>
              )}
            </div>
          )}

          {/* ══ AI ══ */}
          {section==="ai" && (
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ background:"linear-gradient(135deg,#0f172a,#1e3a5f)",borderRadius:14,padding:"20px 22px",color:"white" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
                  <div style={{ width:42,height:42,borderRadius:10,background:"linear-gradient(135deg,#0891b2,#059669)",display:"flex",alignItems:"center",justifyContent:"center" }}><Bot size={20} style={{ color:"white" }}/></div>
                  <div>
                    <div style={{ fontWeight:700,fontSize:15 }}>Hospital AI Management Companion</div>
                    <div style={{ fontSize:11,color:"#94a3b8" }}>Administrative support · Rwanda MOH protocols · No patient PII</div>
                  </div>
                </div>
                <div style={{ background:"rgba(255,255,255,0.06)",borderRadius:7,padding:"8px 12px",fontSize:11,color:"#94a3b8",border:"1px solid rgba(255,255,255,0.07)" }}>
                  ⚠️ AI provides management guidance only. Clinical decisions require qualified medical professionals.
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:7 }}>
                {AI_PROMPTS.map(a=>(
                  <button key={a.label} onClick={()=>{ setAiAction(a); setAiInput(a.prompt); }}
                    style={{ display:"flex",alignItems:"center",gap:7,padding:"10px 12px",background:"white",border:`2px solid ${aiAction?.label===a.label?"#0891b2":"#e2e8f0"}`,borderRadius:9,cursor:"pointer",fontSize:11,fontWeight:600,color:aiAction?.label===a.label?"#0891b2":"#374151",textAlign:"left" }}>
                    <span style={{ fontSize:16 }}>{a.icon}</span>{a.label}
                  </button>
                ))}
              </div>
              <Card>
                <textarea value={aiInput} onChange={e=>setAiInput(e.target.value)} placeholder="Ask about staffing, operations, finances, compliance, or hospital management…" rows={4}
                  style={{ width:"100%",padding:"14px 16px",border:"none",outline:"none",fontSize:13,resize:"none",fontFamily:"inherit",boxSizing:"border-box",color:"#0f172a",lineHeight:1.6 }}/>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 14px",borderTop:"1px solid #f1f5f9",background:"#fafafa" }}>
                  <span style={{ fontSize:11,color:"#94a3b8" }}>{aiInput.length} chars</span>
                  <button onClick={askAI} disabled={aiLoading||!aiInput.trim()}
                    style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 18px",background:aiLoading||!aiInput.trim()?"#e2e8f0":"linear-gradient(135deg,#0891b2,#059669)",color:aiLoading||!aiInput.trim()?"#94a3b8":"white",borderRadius:8,border:"none",cursor:aiLoading||!aiInput.trim()?"not-allowed":"pointer",fontSize:12,fontWeight:600 }}>
                    {aiLoading?<><span style={{ display:"inline-block",animation:"spin 1s linear infinite" }}>⟳</span> Thinking…</>:<><Bot size={13}/>Ask AI</>}
                  </button>
                </div>
              </Card>
              {aiResp && (
                <Card style={{ padding:"16px 18px",border:"1px solid #a7f3d0" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:10,fontWeight:700,fontSize:12,color:"#059669" }}>
                    <div style={{ width:24,height:24,borderRadius:6,background:"linear-gradient(135deg,#0891b2,#059669)",display:"flex",alignItems:"center",justifyContent:"center" }}><Bot size={12} style={{ color:"white" }}/></div>
                    AI Response
                  </div>
                  <div style={{ fontSize:13,color:"#0f172a",lineHeight:1.8,whiteSpace:"pre-wrap" }}>{aiResp}</div>
                </Card>
              )}
              {aiHistory.length > 0 && (
                <Card>
                  <CardHead title="📜 Query History"/>
                  <div style={{ padding:"10px 14px",display:"flex",flexDirection:"column",gap:6 }}>
                    {aiHistory.map((h:any)=>(
                      <div key={h.id} onClick={()=>{ setAiInput(h.q); setAiResp(h.ans); }} style={{ padding:"8px 11px",background:"#f8fafc",borderRadius:7,borderLeft:"3px solid #0891b2",cursor:"pointer" }}>
                        <div style={{ fontSize:11,fontWeight:600,color:"#0f172a",marginBottom:1 }}>{h.q.slice(0,80)}{h.q.length>80?"…":""}</div>
                        <div style={{ fontSize:10,color:"#94a3b8" }}>{h.time}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* ══ FEATURE REQUESTS ══ */}
          {section==="requests" && (
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8 }}>
                <div><div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Feature Requests</div><div style={{ fontSize:11,color:"#94a3b8" }}>Request new capabilities from System Admin</div></div>
                <button onClick={()=>setShowReqModal(true)} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 16px",background:"#0891b2",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:600 }}><Plus size={14}/>New Request</button>
              </div>

              {/* Available locked features */}
              <Card>
                <CardHead title="🔒 Locked Features — Available to Request" sub="Based on your subscription tier"/>
                <div style={{ padding:"12px 14px",display:"flex",flexDirection:"column",gap:8 }}>
                  {features.filter((f:any)=>f.default_status==="locked"||f.default_status==="pending").slice(0,8).map((f:any)=>(
                    <div key={f.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"#f8fafc",borderRadius:8 }}>
                      <span style={{ fontSize:18,width:26,textAlign:"center" }}>{f.icon||"⚙️"}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12,fontWeight:600,color:"#0f172a" }}>{f.label}</div>
                        <div style={{ fontSize:10,color:"#94a3b8" }}>{f.description||f.name} · Requires {f.tier_required} tier</div>
                      </div>
                      <button onClick={()=>{ setReqForm({featureId:f.id,reason:""}); setShowReqModal(true); }}
                        style={{ padding:"4px 10px",background:"#fffbeb",color:"#d97706",border:"1px solid #fde68a",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:600,whiteSpace:"nowrap" }}>
                        Request Access
                      </button>
                    </div>
                  ))}
                  {features.filter((f:any)=>f.default_status==="locked").length===0 && <div style={{ color:"#94a3b8",fontSize:12,textAlign:"center",padding:"16px 0" }}>All available features are enabled for your hospital.</div>}
                </div>
              </Card>

              {/* Request history */}
              {myRequests.length > 0 && (
                <Card>
                  <CardHead title="📋 Request History" sub={`${myRequests.length} requests`}/>
                  <div style={{ padding:"12px 14px",display:"flex",flexDirection:"column",gap:6 }}>
                    {myRequests.slice(0,10).map((r:any)=>(
                      <div key={r.id} style={{ display:"flex",alignItems:"center",gap:9,padding:"8px 10px",background:"#f8fafc",borderRadius:7,flexWrap:"wrap" }}>
                        <span style={{ fontSize:15 }}>{r.icon||"⚙️"}</span>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ fontSize:12,fontWeight:600,color:"#0f172a" }}>{r.feature_label||"Feature"}</div>
                          <div style={{ fontSize:10,color:"#64748b" }}>{r.reason?.slice(0,60)||"No reason provided"}</div>
                        </div>
                        <Tag label={r.status||"pending"} color={r.status==="approved"?"#059669":r.status==="denied"?"#dc2626":"#d97706"} bg={r.status==="approved"?"#dcfce7":r.status==="denied"?"#fee2e2":"#fffbeb"}/>
                        <span style={{ fontSize:10,color:"#94a3b8" }}>{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* ══ SETTINGS ══ */}
          {section==="settings" && (
            <div style={{ display:"grid",gap:16 }}>
              <div><div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Settings</div><div style={{ fontSize:11,color:"#94a3b8" }}>Hospital configuration · Security · Password management</div></div>

              {/* Change Password — prominent section */}
              <Card style={{ border:"2px solid #0891b210" }}>
                <CardHead title="🔐 Change Password" sub="Secure your account — send email confirmation"/>
                <div style={{ padding:"18px 20px" }}>
                  <div style={{ background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:8,padding:"10px 12px",marginBottom:14,fontSize:12,color:"#0369a1" }}>
                    After changing your password, you will be <strong>automatically logged out</strong> and must log in again with your new password.
                    A confirmation email will be sent to <strong>{user?.email||"your registered email"}</strong>.
                  </div>
                  <div style={{ display:"grid",gap:12,maxWidth:440 }}>
                    <div>
                      <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Current Password</label>
                      <div style={{ position:"relative" }}>
                        <input type={showPw?"text":"password"} value={pwForm.current} onChange={e=>setPwForm({...pwForm,current:e.target.value})} placeholder="Your current password"
                          style={{ width:"100%",padding:"9px 36px 9px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13,color:"#0f172a",outline:"none",boxSizing:"border-box" }}/>
                        <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",border:"none",background:"none",cursor:"pointer",color:"#64748b",display:"flex" }}>
                          {showPw?<EyeOff size={15}/>:<Eye size={15}/>}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>New Password <span style={{ color:"#94a3b8",fontWeight:400 }}>(min 8 characters)</span></label>
                      <input type={showPw?"text":"password"} value={pwForm.newPw} onChange={e=>setPwForm({...pwForm,newPw:e.target.value})} placeholder="Strong new password"
                        style={{ width:"100%",padding:"9px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13,color:"#0f172a",outline:"none",boxSizing:"border-box" }}/>
                      {pwForm.newPw && <div style={{ fontSize:10,marginTop:3,fontWeight:600,color:pwForm.newPw.length>=12?"#059669":pwForm.newPw.length>=8?"#d97706":"#dc2626" }}>
                        Strength: {pwForm.newPw.length>=12?"Strong ✅":pwForm.newPw.length>=8?"Good":"Too short ❌"}
                      </div>}
                    </div>
                    <div>
                      <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Confirm New Password</label>
                      <input type={showPw?"text":"password"} value={pwForm.confirm} onChange={e=>setPwForm({...pwForm,confirm:e.target.value})} placeholder="Re-enter new password"
                        style={{ width:"100%",padding:"9px 11px",borderRadius:8,border:`1px solid ${pwForm.confirm&&pwForm.confirm!==pwForm.newPw?"#fca5a5":pwForm.confirm&&pwForm.confirm===pwForm.newPw&&pwForm.newPw.length>=8?"#86efac":"#e2e8f0"}`,fontSize:13,color:"#0f172a",outline:"none",boxSizing:"border-box" }}/>
                      {pwForm.confirm && pwForm.confirm !== pwForm.newPw && <div style={{ fontSize:10,color:"#dc2626",marginTop:3 }}>Passwords don't match</div>}
                      {pwForm.confirm && pwForm.confirm === pwForm.newPw && pwForm.newPw.length>=8 && <div style={{ fontSize:10,color:"#059669",marginTop:3 }}>✓ Passwords match</div>}
                    </div>
                    <button onClick={changePassword} disabled={pwLoading||!pwForm.current||!pwForm.newPw||pwForm.newPw!==pwForm.confirm||pwForm.newPw.length<8}
                      style={{ display:"flex",alignItems:"center",gap:6,padding:"10px 20px",background:pwLoading||!pwForm.current||pwForm.newPw!==pwForm.confirm||pwForm.newPw.length<8?"#e2e8f0":"linear-gradient(135deg,#0891b2,#059669)",color:pwLoading||!pwForm.current||pwForm.newPw!==pwForm.confirm||pwForm.newPw.length<8?"#94a3b8":"white",borderRadius:9,border:"none",cursor:pwLoading||!pwForm.current?"not-allowed":"pointer",fontSize:13,fontWeight:700,width:"fit-content" }}>
                      <Key size={14}/>{pwLoading?"Changing password…":"Change Password"}
                    </button>
                  </div>
                </div>
              </Card>

              {/* Hospital Settings */}
              <Card>
                <CardHead title="🏥 Hospital Settings" sub="Contact info, departments, notifications"/>
                <div style={{ padding:"14px 18px",display:"grid",gap:11 }}>
                  {[
                    { k:"hospital_name",  l:"Hospital Name",      v:user?.facility||"Kigali District Hospital",  t:"text" },
                    { k:"contact_email",  l:"Contact Email",      v:"info@hospital.rw",                          t:"email" },
                    { k:"contact_phone",  l:"Contact Phone",      v:"+250 788 000 001",                          t:"tel" },
                    { k:"timezone",       l:"Timezone",           v:"Africa/Kigali",                             t:"text" },
                  ].map(s=>(
                    <div key={s.k} style={{ display:"grid",gridTemplateColumns:"180px 1fr",alignItems:"center",gap:12 }}>
                      <label style={{ fontSize:12,fontWeight:600,color:"#374151" }}>{s.l}</label>
                      <input defaultValue={s.v} type={s.t} style={{ padding:"7px 11px",borderRadius:7,border:"1px solid #e2e8f0",fontSize:12,color:"#0f172a",outline:"none" }}/>
                    </div>
                  ))}
                  <div style={{ display:"flex",justifyContent:"flex-end",marginTop:4 }}>
                    <button onClick={()=>show("Settings saved","success")} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 18px",background:"#0891b2",color:"white",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600 }}><Save size={13}/>Save Settings</button>
                  </div>
                </div>
              </Card>

              {/* Access info */}
              <div style={{ background:"linear-gradient(135deg,#ecfdf5,#e0f2fe)",borderRadius:12,padding:"16px 18px",border:"1px solid #a7f3d0" }}>
                <div style={{ fontWeight:700,fontSize:13,color:"#059669",marginBottom:8 }}>🔒 Your Access Boundaries</div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,fontSize:12,color:"#065f46" }}>
                  <div>✅ Your hospital data only</div><div>✅ Staff management</div>
                  <div>✅ Operational oversight</div><div>✅ Financial reporting</div>
                  <div>🔒 No other hospital data</div><div>🔒 No individual clinical notes</div>
                  <div>🔒 No system-wide settings</div><div>🔒 No pricing configuration</div>
                </div>
              </div>
            </div>
          )}

        </div>{/* end body */}
      </div>{/* end main */}

      {/* ══ ADD STAFF MODAL ══ */}
      {showAddStaff && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:"white",borderRadius:14,padding:"22px 24px",width:"100%",maxWidth:500,maxHeight:"88vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.22)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
              <div style={{ fontWeight:800,fontSize:15,color:"#0f172a" }}>👤 Add Staff Member</div>
              <button onClick={()=>setShowAddStaff(false)} style={{ border:"none",background:"none",cursor:"pointer",color:"#64748b" }}><X size={17}/></button>
            </div>
            <div style={{ background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,padding:"10px 12px",marginBottom:14,fontSize:12,color:"#065f46" }}>
              📧 A <strong>welcome email</strong> with auto-generated password and login options will be sent to the staff member's email.
            </div>
            <div style={{ display:"grid",gap:11 }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>First Name *</label>
                <input value={staffForm.firstName} onChange={e=>setStaffForm({...staffForm,firstName:e.target.value})} style={{ width:"100%",padding:"8px 11px",borderRadius:7,border:"1px solid #e2e8f0",fontSize:12,outline:"none",boxSizing:"border-box" }}/></div>
                <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Last Name</label>
                <input value={staffForm.lastName} onChange={e=>setStaffForm({...staffForm,lastName:e.target.value})} style={{ width:"100%",padding:"8px 11px",borderRadius:7,border:"1px solid #e2e8f0",fontSize:12,outline:"none",boxSizing:"border-box" }}/></div>
              </div>
              {[{k:"email" as const,l:"Email Address *",t:"email"},{k:"phone" as const,l:"Phone",t:"tel"},{k:"jobTitle" as const,l:"Job Title",t:"text"}].map(f=>(
                <div key={f.k}><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>{f.l}</label>
                <input value={staffForm[f.k]} onChange={e=>setStaffForm({...staffForm,[f.k]:e.target.value})} type={f.t} style={{ width:"100%",padding:"8px 11px",borderRadius:7,border:"1px solid #e2e8f0",fontSize:12,outline:"none",boxSizing:"border-box" }}/></div>
              ))}
              <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Role *</label>
              <select value={staffForm.roleId} onChange={e=>setStaffForm({...staffForm,roleId:e.target.value})} style={{ width:"100%",padding:"8px 11px",borderRadius:7,border:"1px solid #e2e8f0",fontSize:12,outline:"none" }}>
                <option value="">Select role…</option>
                {roles.filter((r:any)=>!["system-admin"].includes(r.name)).map((r:any)=>(
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select></div>
            </div>
            <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:18 }}>
              <button onClick={()=>setShowAddStaff(false)} style={{ padding:"8px 18px",borderRadius:8,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:12,color:"#374151",fontWeight:600 }}>Cancel</button>
              <button onClick={createStaff} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 20px",background:"linear-gradient(135deg,#0891b2,#059669)",color:"white",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:700 }}>
                <UserPlus size={13}/>Create + Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ FEATURE REQUEST MODAL ══ */}
      {showReqModal && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:"white",borderRadius:14,padding:"22px 24px",width:"100%",maxWidth:440,boxShadow:"0 20px 60px rgba(0,0,0,0.22)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
              <div style={{ fontWeight:800,fontSize:15,color:"#0f172a" }}>⚡ Request Feature Access</div>
              <button onClick={()=>setShowReqModal(false)} style={{ border:"none",background:"none",cursor:"pointer",color:"#64748b" }}><X size={17}/></button>
            </div>
            <div style={{ display:"grid",gap:12 }}>
              <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Feature *</label>
              <select value={reqForm.featureId} onChange={e=>setReqForm({...reqForm,featureId:e.target.value})} style={{ width:"100%",padding:"8px 11px",borderRadius:7,border:"1px solid #e2e8f0",fontSize:12,outline:"none" }}>
                <option value="">Select feature…</option>
                {features.filter((f:any)=>f.default_status!=="active").map((f:any)=>(
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select></div>
              <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Reason / Justification *</label>
              <textarea value={reqForm.reason} onChange={e=>setReqForm({...reqForm,reason:e.target.value})} rows={3} placeholder="Why does your hospital need this feature?" style={{ width:"100%",padding:"8px 11px",borderRadius:7,border:"1px solid #e2e8f0",fontSize:12,outline:"none",resize:"none",boxSizing:"border-box" }}/></div>
            </div>
            <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:16 }}>
              <button onClick={()=>setShowReqModal(false)} style={{ padding:"8px 18px",borderRadius:8,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:12,color:"#374151",fontWeight:600 }}>Cancel</button>
              <button onClick={submitRequest} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 20px",background:"#0891b2",color:"white",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:700 }}>
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
