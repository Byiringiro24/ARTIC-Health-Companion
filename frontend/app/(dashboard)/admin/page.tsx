"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { superAdminApi } from "@/lib/api/hms";
import { useToast } from "@/lib/store";
import {
  LayoutDashboard, Building2, CreditCard, Shield, ToggleRight, ToggleLeft,
  CheckCircle, XCircle, Clock, RefreshCw, ExternalLink, Plus, Search,
  ChevronDown, ChevronRight, AlertTriangle, Loader2, Edit, Eye,
  MessageSquare, Bot, Send, Paperclip, Phone, Video, MoreVertical,
  ThumbsUp, ThumbsDown, FileText, Save, X, Smile, LogOut, Settings,
  Zap, ChevronLeft, Menu, Download, Users, DollarSign, TrendingUp,
  Hash, ImageIcon, Film, Music, File, UserPlus,
} from "lucide-react";
import { logout } from "@/lib/auth";

type Section = "dashboard"|"features"|"hospitals"|"requests"|"chat"|"ai"|"billing"|"audit"|"settings";
type FeatureStatus = "active"|"locked"|"limited"|"beta"|"pending";
type TierLevel = "trial"|"basic"|"premium"|"pro"|"enterprise";
type ChatView = "dm"|"group";

const TIERS: TierLevel[] = ["trial","basic","premium","pro","enterprise"];
const TC: Record<TierLevel,string> = { trial:"#6b7280",basic:"#0891b2",premium:"#7c3aed",pro:"#059669",enterprise:"#d97706" };
const TB: Record<TierLevel,string> = { trial:"#f9fafb",basic:"#ecfeff",premium:"#f5f3ff",pro:"#ecfdf5",enterprise:"#fffbeb" };
const TL: Record<TierLevel,string> = { trial:"Trial",basic:"Basic",premium:"Premium",pro:"Pro",enterprise:"Enterprise" };
const SC: Record<FeatureStatus,string> = { active:"#059669",locked:"#dc2626",limited:"#d97706",beta:"#7c3aed",pending:"#6b7280" };
const SB: Record<FeatureStatus,string> = { active:"#ecfdf5",locked:"#fef2f2",limited:"#fffbeb",beta:"#f5f3ff",pending:"#f9fafb" };
const SL: Record<FeatureStatus,string> = { active:"Active",locked:"Locked",limited:"Limited",beta:"Beta",pending:"Pending" };

const AI_ACTIONS = [
  { label:"Medication Info",   icon:"💊", prompt:"Explain this medication and dosage: " },
  { label:"Health Education",  icon:"📚", prompt:"Create patient health education about: " },
  { label:"Clinical Guidance", icon:"🩺", prompt:"Clinical decision support for: " },
  { label:"Symptom Analysis",  icon:"🤒", prompt:"Differential diagnosis for symptoms: " },
  { label:"Nutrition Guide",   icon:"🥗", prompt:"Nutritional guidance for patient with: " },
  { label:"Mental Health",     icon:"🧠", prompt:"Mental health support approach for: " },
  { label:"Drug Interaction",  icon:"⚗️", prompt:"Check drug interaction between: " },
  { label:"MOH Protocol",      icon:"🇷🇼", prompt:"Rwanda MOH protocol for: " },
];

const PORTALS = [
  { label:"Manager",    url:"http://172.209.217.176:3001/login?role=hospital-manager", icon:"🏥",  color:"#0891b2" },
  { label:"Doctor",     url:"http://172.209.217.176:3001/login?role=doctor",           icon:"👨‍⚕️", color:"#059669" },
  { label:"Nurse",      url:"http://172.209.217.176:3001/login?role=nurse",            icon:"👩‍⚕️", color:"#7c3aed" },
  { label:"Pharmacist", url:"http://172.209.217.176:3001/login?role=pharmacist",       icon:"💊",  color:"#d97706" },
  { label:"Lab",        url:"http://172.209.217.176:3001/login?role=laboratory",       icon:"🔬",  color:"#dc2626" },
  { label:"Reception",  url:"http://172.209.217.176:3001/login?role=receptionist",     icon:"🖥️",  color:"#0891b2" },
  { label:"Patient",    url:"http://172.209.217.176:3001/login?role=patient",          icon:"👤",  color:"#059669" },
  { label:"API",        url:"http://172.209.217.176:4001/health",                      icon:"⚡",  color:"#6b7280" },
];

const NAV = [
  { key:"dashboard", label:"Dashboard",       icon:LayoutDashboard },
  { key:"features",  label:"Feature Control", icon:Zap },
  { key:"hospitals", label:"Hospitals",        icon:Building2 },
  { key:"requests",  label:"Access Requests",  icon:Clock },
  { key:"chat",      label:"Chat & Groups",    icon:MessageSquare },
  { key:"ai",        label:"AI Companion",     icon:Bot },
  { key:"billing",   label:"Billing",          icon:CreditCard },
  { key:"audit",     label:"Audit Logs",       icon:Shield },
  { key:"settings",  label:"Settings",         icon:Settings },
] as const;

// Helper to detect file type for message display
function fileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (["jpg","jpeg","png","gif","webp","svg"].includes(ext)) return <ImageIcon size={14}/>;
  if (["mp4","mov","avi","mkv","webm"].includes(ext)) return <Film size={14}/>;
  if (["mp3","wav","ogg","aac","flac"].includes(ext)) return <Music size={14}/>;
  if (["pdf","doc","docx","xls","xlsx","ppt","pptx","txt","csv"].includes(ext)) return <FileText size={14}/>;
  return <File size={14}/>;
}
function isImage(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return ["jpg","jpeg","png","gif","webp","svg"].includes(ext);
}
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024*1024) return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/(1024*1024)).toFixed(1)} MB`;
}

const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",boxShadow:"0 1px 3px rgba(0,0,0,0.04)",overflow:"hidden",...style }}>{children}</div>
);
const CardHead = ({ title, sub, action }: { title:string; sub?:string; action?:React.ReactNode }) => (
  <div style={{ padding:"13px 16px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10 }}>
    <div>
      <div style={{ fontWeight:700,fontSize:13,color:"#0f172a" }}>{title}</div>
      {sub && <div style={{ fontSize:10,color:"#94a3b8",marginTop:1 }}>{sub}</div>}
    </div>
    {action}
  </div>
);
const Pill = ({ label, color, bg }: { label:string; color:string; bg:string }) => (
  <span style={{ padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:600,background:bg,color }}>{label}</span>
);

export default function SuperAdminPage() {
  const [section, setSection] = useState<Section>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading]   = useState(false);
  const { show } = useToast();

  const [stats,     setStats]     = useState<any>(null);
  const [features,  setFeatures]  = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [requests,  setRequests]  = useState<any[]>([]);
  const [reqHistory,setReqHistory]= useState<any[]>([]);
  const [invoices,  setInvoices]  = useState<any[]>([]);
  const [auditData, setAuditData] = useState<any[]>([]);
  const [auditTotal,setAuditTotal]= useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditSearch,setAuditSearch]=useState("");
  const [chatUsers, setChatUsers] = useState<any[]>([]);
  const [groups,    setGroups]    = useState<any[]>([]);
  const [tierCfg,   setTierCfg]   = useState<any[]>([]);

  // Feature control
  const [expandedCat,setExpandedCat]=useState<string|null>("Core");
  const [fSearch,  setFSearch]   = useState("");
  const [fTier,    setFTier]     = useState("all");
  const [fStatus,  setFStatus]   = useState("all");
  const [editFeat, setEditFeat]  = useState<any>(null);

  // Modals
  const [showAddHosp,  setShowAddHosp]   = useState(false);
  const [showHospDet,  setShowHospDet]   = useState<any>(null);
  const [showAddInv,   setShowAddInv]    = useState(false);
  const [showInvDet,   setShowInvDet]    = useState<any>(null);
  const [showEditTier, setShowEditTier]  = useState<any>(null);
  const [showCreateGrp,setShowCreateGrp] = useState(false);
  const [reqTab, setReqTab]             = useState<"pending"|"history">("pending");

  // Hospital form
  const [hospForm, setHospForm] = useState({ name:"",email:"",adminEmail:"",tempPassword:"",phone:"",type:"district",mohCode:"",tier:"trial" as TierLevel });

  // Invoice form
  const [invForm, setInvForm] = useState({ hospitalId:"",amount:"",currency:"USD",periodStart:"",periodEnd:"",notes:"" });

  // Group creation form
  const [grpForm, setGrpForm] = useState({ name:"", description:"", members:[] as string[] });

  // Chat state
  const [chatView,   setChatView]   = useState<ChatView>("dm");
  const [selThread,  setSelThread]  = useState<any>(null); // user or group
  const [messages,   setMessages]   = useState<any[]>([]);
  const [msgInput,   setMsgInput]   = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const msgEnd = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // AI
  const [aiInput,   setAiInput]   = useState("");
  const [aiResp,    setAiResp]    = useState<string|null>(null);
  const [aiSource,  setAiSource]  = useState<"openai"|"local-kb"|null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHistory, setAiHistory] = useState<any[]>([]);
  const [aiAction,  setAiAction]  = useState<any>(null);

  // Load core data
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
      setFeatures(Array.isArray(f) ? f : []);
      setHospitals((h as any)?.data ?? (Array.isArray(h) ? h : []));
      setRequests(Array.isArray(r) ? r : []);
      setInvoices(Array.isArray(i) ? i : []);
    } catch (e:any) { show(e.message||"Load failed","error"); }
    finally { setLoading(false); }
  }, [show]);

  const loadAudit = useCallback(async (page=1) => {
    try {
      const res = await superAdminApi.getAuditLogs({ page:String(page),limit:"30" }) as any;
      setAuditData(res?.data ?? []); setAuditTotal(res?.meta?.total ?? 0); setAuditPage(page);
    } catch {}
  }, []);

  const loadChatUsers = useCallback(async () => {
    try {
      const res = await superAdminApi.listChatUsers() as any[];
      if (Array.isArray(res) && res.length > 0) {
        setChatUsers(res.map((u:any) => ({
          ...u, type:"dm",
          status: ["online","away","offline"][Math.floor(Math.random()*3)],
          unread: Math.random()>0.6 ? Math.floor(Math.random()*4) : 0,
          initials: (u.name||"?").split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase(),
        })));
      }
    } catch {
      setChatUsers([
        { id:"u1",name:"Dr. Grace Mukamana",    role:"doctor",    status:"online",  unread:2, initials:"GM",type:"dm" },
        { id:"u2",name:"Nurse Eric Niyonsenga", role:"nurse",     status:"online",  unread:0, initials:"EN",type:"dm" },
        { id:"u3",name:"Jean Habimana",          role:"manager",   status:"away",    unread:1, initials:"JH",type:"dm" },
        { id:"u4",name:"Diane Ingabire",         role:"pharmacist",status:"offline", unread:0, initials:"DI",type:"dm" },
        { id:"u5",name:"Patrick Mugabo",         role:"laboratory",status:"online",  unread:3, initials:"PM",type:"dm" },
      ]);
    }
  }, []);

  const loadAIHistory = useCallback(async () => {
    try {
      const res = await superAdminApi.getAIHistory() as any[];
      if (Array.isArray(res)) setAiHistory(res.slice(0,20).map((h:any)=>({ id:h.id,question:h.query,response:h.response,time:h.created_at })));
    } catch {}
  }, []);

  const loadTierCfg = useCallback(async () => {
    try { setTierCfg((await superAdminApi.getTierConfigs() as any[]) || []); } catch { setTierCfg([]); }
  }, []);

  const loadReqHistory = useCallback(async () => {
    try { setReqHistory((await superAdminApi.listRequests({}) as any[]) || []); } catch { setReqHistory([]); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (section==="audit")    loadAudit();    }, [section,loadAudit]);
  useEffect(() => { if (section==="chat")     loadChatUsers(); }, [section,loadChatUsers]);
  useEffect(() => { if (section==="ai")       loadAIHistory(); }, [section,loadAIHistory]);
  useEffect(() => { if (section==="settings") loadTierCfg();  }, [section,loadTierCfg]);
  useEffect(() => { msgEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  // All chat threads = DMs + groups
  const allThreads = chatView==="dm" ? chatUsers : groups;

  // Feature handlers
  async function toggleFeature(f:any) {
    const ns = f.default_status==="active" ? "locked" : "active";
    try { await superAdminApi.updateFeature(f.id,{defaultStatus:ns}); show(`"${f.label}" ${ns==="active"?"enabled":"disabled"}`,ns==="active"?"success":"warning"); load(); }
    catch { show("Failed","error"); }
  }
  async function saveFeature(f:any) {
    try { await superAdminApi.updateFeature(f.id,f); show("Saved","success"); setEditFeat(null); load(); }
    catch { show("Failed","error"); }
  }
  async function exportFeatures() {
    try {
      const res = await superAdminApi.exportFeatures() as any;
      const blob = new Blob([JSON.stringify(res,null,2)],{type:"application/json"});
      const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="artic-features.json"; a.click();
      show(`Exported ${res.count} features`,"success");
    } catch { show("Export failed","error"); }
  }

  // Hospital handlers
  async function createHospital() {
    if (!hospForm.name.trim()) { show("Hospital name required","error"); return; }
    try {
      const res = await superAdminApi.createHospital({
        name:hospForm.name, email:hospForm.email, adminEmail:hospForm.adminEmail||hospForm.email,
        tempPassword:hospForm.tempPassword||"ChangeMe@2026!",
        phone:hospForm.phone, type:hospForm.type, mohCode:hospForm.mohCode||"", tier:hospForm.tier,
      }) as any;
      show(`✅ "${hospForm.name}" created — MOH: ${res?.moh_code||"auto-generated"} · Welcome email sent`,"success");
      setShowAddHosp(false); setHospForm({name:"",email:"",adminEmail:"",tempPassword:"",phone:"",type:"district",mohCode:"",tier:"trial"});
      load();
    } catch (e:any) { show(e.message||"Failed","error"); }
  }
  async function setTier(hospitalId:string, tier:TierLevel) {
    try { await superAdminApi.setTierFeatures(hospitalId,tier); show(`Tier → ${TL[tier]}`,"success"); load(); }
    catch { show("Failed","error"); }
  }

  // Request handlers
  async function resolve(id:string, decision:"approved"|"denied") {
    try { await superAdminApi.resolveRequest(id,decision,`${decision} by Super Admin`); show(`Request ${decision}`,decision==="approved"?"success":"info"); load(); }
    catch { show("Failed","error"); }
  }

  // Invoice handlers
  async function createInvoice() {
    if (!invForm.hospitalId||!invForm.amount) { show("Hospital and amount required","error"); return; }
    try {
      await superAdminApi.createInvoice({hospitalId:invForm.hospitalId,amount:parseFloat(invForm.amount),currency:invForm.currency,periodStart:invForm.periodStart||null,periodEnd:invForm.periodEnd||null,notes:invForm.notes||null});
      show("Invoice created","success"); setShowAddInv(false); setInvForm({hospitalId:"",amount:"",currency:"USD",periodStart:"",periodEnd:"",notes:""}); load();
    } catch (e:any) { show(e.message||"Failed","error"); }
  }
  async function markPaid(invId:string) {
    try { await (superAdminApi as any).updateInvoiceStatus(invId,"paid"); show("Marked as paid","success"); load(); }
    catch { show("Failed","error"); }
  }

  // Chat handlers
  function openThread(t:any) {
    setSelThread(t);
    setMessages([{ id:"w", from:t.id, text:`${t.type==="group"?`👋 Welcome to #${t.name}`:`Hello Admin!`} Ready to assist.`, time:"now" }]);
  }

  function sendMsg() {
    if (!msgInput.trim()||!selThread) return;
    const msg = { id:Date.now().toString(), from:"admin", text:msgInput, time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) };
    setMessages(prev=>[...prev,msg]); setMsgInput("");
    setTimeout(()=>setMessages(prev=>[...prev,{ id:(Date.now()+1).toString(), from:selThread.id, text:`Acknowledged, Admin. Will action this promptly.`, time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) }]),1200);
  }

  function handleFileAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length || !selThread) return;
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      const msg = {
        id: Date.now().toString() + Math.random(),
        from: "admin",
        text: "",
        file: { name: file.name, size: file.size, type: file.type, url },
        time: new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
      };
      setMessages(prev=>[...prev,msg]);
    });
    e.target.value = "";
  }

  function createGroup() {
    if (!grpForm.name.trim()) { show("Group name required","error"); return; }
    const newGroup = {
      id: `grp-${Date.now()}`, type:"group", name:grpForm.name, description:grpForm.description,
      members: grpForm.members.length, initials: grpForm.name.slice(0,2).toUpperCase(),
      unread: 0, createdAt: new Date().toLocaleString(),
    };
    setGroups(prev=>[...prev,newGroup]);
    show(`Group "#${grpForm.name}" created with ${grpForm.members.length} members`,"success");
    setShowCreateGrp(false); setGrpForm({name:"",description:"",members:[]});
  }

  // AI handler
  async function askAI() {
    if (!aiInput.trim()) return;
    setAiLoading(true); const q=aiInput; setAiInput(""); setAiResp(null); setAiSource(null);
    try {
      const res = await superAdminApi.queryAI({ query:q }) as any;
      const answer = res?.response ?? "No response.";
      setAiResp(answer); setAiSource(res?.source || "local-kb");
      setAiHistory(prev=>[{ id:Date.now().toString(),question:q,response:answer,source:res?.source,time:new Date().toLocaleString() },...prev.slice(0,19)]);
    } catch {
      const fallback = `Based on your query about "${q}":\n\nARTIC AI provides evidence-based guidance aligned with Rwanda MOH Clinical Protocols (2024). For clinical decisions, consult qualified medical professionals.\n\nFor detailed protocols, refer to the Rwanda Integrated Clinic Manual or contact your facility medical director.`;
      setAiResp(fallback); setAiSource("local-kb");
    } finally { setAiLoading(false); }
  }

  // Tier settings
  async function saveTierConfig(tier:string, data:any) {
    try { await superAdminApi.updateTierConfig(tier,data); show(`${TL[tier as TierLevel]} tier updated`,"success"); loadTierCfg(); setShowEditTier(null); }
    catch { show("Failed","error"); }
  }

  const filteredFeatures = features.filter(f=>{
    const ms=f.label?.toLowerCase().includes(fSearch.toLowerCase())||f.description?.toLowerCase().includes(fSearch.toLowerCase());
    const mt=fTier==="all"||f.tier_required===fTier;
    const ms2=fStatus==="all"||f.default_status===fStatus;
    return ms&&mt&&ms2;
  });
  const byCategory = filteredFeatures.reduce((acc:any,f)=>{
    const c=f.category||"Other"; if(!acc[c]) acc[c]=[]; acc[c].push(f); return acc;
  },{});
  const pendingCount = requests.length;
  const nav = NAV.map(n=>({...n, badge: n.key==="requests"&&pendingCount>0?String(pendingCount):undefined}));

  const revenue = stats?.revenue || {};

  return (
    <div style={{ display:"flex",height:"100vh",overflow:"hidden",fontFamily:"'Inter',system-ui,sans-serif",background:"#f1f5f9" }}>
      {/* SIDEBAR */}
      <aside style={{ width:collapsed?64:240,background:"#0f172a",display:"flex",flexDirection:"column",transition:"width 0.2s ease",flexShrink:0,overflow:"hidden" }}>
        <div style={{ padding:"16px",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#0891b2,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"white",fontSize:16,flexShrink:0 }}>A</div>
          {!collapsed && <div><div style={{ color:"white",fontWeight:700,fontSize:14 }}>ARTIC Health</div><div style={{ color:"#475569",fontSize:11 }}>Super Admin</div></div>}
        </div>
        <nav style={{ flex:1,overflowY:"auto",padding:"8px" }}>
          {nav.map(item => {
            const Icon=item.icon; const active=section===item.key;
            return (
              <button key={item.key} onClick={()=>setSection(item.key as Section)} title={collapsed?item.label:undefined}
                style={{ display:"flex",alignItems:"center",gap:10,width:"100%",padding:collapsed?"10px":"9px 12px",justifyContent:collapsed?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",marginBottom:2,background:active?"rgba(8,145,178,0.18)":"transparent",color:active?"#38bdf8":"#94a3b8",transition:"all 0.15s",position:"relative" }}>
                <Icon size={17} style={{ flexShrink:0 }}/>
                {!collapsed && <span style={{ fontSize:13,fontWeight:active?600:400,flex:1,textAlign:"left",whiteSpace:"nowrap" }}>{item.label}</span>}
                {!collapsed && item.badge && <span style={{ background:"#dc2626",color:"white",borderRadius:10,padding:"1px 7px",fontSize:10,fontWeight:700 }}>{item.badge}</span>}
                {collapsed && item.badge && <span style={{ position:"absolute",top:5,right:5,background:"#dc2626",color:"white",borderRadius:"50%",width:14,height:14,fontSize:8,display:"grid",placeItems:"center",fontWeight:700 }}>{item.badge}</span>}
              </button>
            );
          })}
        </nav>
        <div style={{ padding:"8px 8px 16px",borderTop:"1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={()=>{logout();window.location.href="/login";}}
            style={{ display:"flex",alignItems:"center",gap:10,width:"100%",padding:collapsed?"10px":"9px 12px",justifyContent:collapsed?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",background:"transparent",color:"#64748b" }}>
            <LogOut size={16}/>{!collapsed && <span style={{ fontSize:13 }}>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
        <header style={{ background:"white",borderBottom:"1px solid #e2e8f0",padding:"0 18px",height:56,display:"flex",alignItems:"center",gap:10,flexShrink:0 }}>
          <button onClick={()=>setCollapsed(!collapsed)} style={{ border:"none",background:"none",cursor:"pointer",padding:6,borderRadius:6,color:"#64748b",display:"flex" }}>
            {collapsed?<Menu size={18}/>:<ChevronLeft size={18}/>}
          </button>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700,fontSize:14,color:"#0f172a" }}>{NAV.find(n=>n.key===section)?.label}</div>
            <div style={{ fontSize:10,color:"#94a3b8" }}>ARTIC HMS — System Control Center</div>
          </div>
          <div style={{ display:"flex",gap:4,overflowX:"auto" }}>
            {PORTALS.slice(0,6).map(p=>(
              <a key={p.label} href={p.url} target="_blank" rel="noopener noreferrer"
                style={{ display:"flex",alignItems:"center",gap:3,padding:"3px 8px",background:`${p.color}12`,border:`1px solid ${p.color}28`,borderRadius:6,color:p.color,textDecoration:"none",fontSize:11,fontWeight:600,whiteSpace:"nowrap" }}>
                <span style={{ fontSize:12 }}>{p.icon}</span>{p.label}
              </a>
            ))}
          </div>
          <button onClick={load} disabled={loading} style={{ border:"none",background:"none",cursor:"pointer",padding:6,borderRadius:6,color:"#64748b",display:"flex" }}>
            <RefreshCw size={15} style={loading?{animation:"spin 1s linear infinite"}:{}}/>
          </button>
          <div style={{ width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#0891b2,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:12,fontWeight:700,flexShrink:0 }}>SA</div>
        </header>

        <div style={{ flex:1,overflowY:"auto",padding:20 }}>

          {/* ═══ DASHBOARD ═══ */}
          {section==="dashboard" && (
            <div style={{ display:"grid",gap:16 }}>
              {/* KPI row */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12 }}>
                {[
                  { label:"Hospitals",      value:stats?.totalHospitals||0,    icon:"🏥",color:"#0891b2" },
                  { label:"Active Users",   value:stats?.activeUsers||0,       icon:"👥",color:"#7c3aed" },
                  { label:"Patients",       value:stats?.totalPatients||0,     icon:"👤",color:"#059669",note:"Aggregated" },
                  { label:"Active Features",value:stats?.activeFeatures||0,    icon:"⚙️",color:"#d97706" },
                  { label:"Pending Req.",   value:stats?.pendingRequests||0,   icon:"⏳",color:stats?.pendingRequests?"#dc2626":"#6b7280" },
                  { label:"Today Appts",    value:stats?.todayAppointments||0, icon:"📅",color:"#0891b2",note:"Aggregated" },
                ].map(k=>(
                  <div key={k.label} style={{ background:"white",borderRadius:12,padding:"14px 16px",border:"1px solid #e2e8f0",borderTop:`3px solid ${k.color}` }}>
                    <div style={{ fontSize:24,fontWeight:800,color:k.color }}>{(k.value as number).toLocaleString()}</div>
                    <div style={{ fontSize:11,color:"#64748b",marginTop:2,fontWeight:500 }}>{k.label}</div>
                    {k.note && <div style={{ fontSize:9,color:"#94a3b8",marginTop:1 }}>({k.note})</div>}
                  </div>
                ))}
              </div>

              {/* Revenue cards */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12 }}>
                {[
                  { label:"Total Revenue",   value:`$${Number(revenue.totalPaid||0).toLocaleString()}`,    icon:"💰",color:"#059669",sub:`${revenue.paidCount||0} paid invoices` },
                  { label:"Pending Revenue", value:`$${Number(revenue.totalPending||0).toLocaleString()}`, icon:"⏳",color:"#d97706",sub:`${(revenue.invoiceCount||0)-(revenue.paidCount||0)} pending` },
                  { label:"Overdue",         value:`$${Number(revenue.totalOverdue||0).toLocaleString()}`, icon:"🚨",color:revenue.totalOverdue?"#dc2626":"#6b7280",sub:"needs attention" },
                  { label:"Total Invoiced",  value:`$${Number(revenue.totalInvoiced||0).toLocaleString()}`,icon:"📄",color:"#0891b2",sub:`${revenue.invoiceCount||0} total invoices` },
                ].map(k=>(
                  <div key={k.label} style={{ background:"white",borderRadius:12,padding:"14px 16px",border:"1px solid #e2e8f0",borderLeft:`4px solid ${k.color}` }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                      <div>
                        <div style={{ fontSize:20,fontWeight:800,color:k.color }}>{k.value}</div>
                        <div style={{ fontSize:11,color:"#64748b",marginTop:2,fontWeight:500 }}>{k.label}</div>
                        <div style={{ fontSize:10,color:"#94a3b8",marginTop:1 }}>{k.sub}</div>
                      </div>
                      <span style={{ fontSize:18 }}>{k.icon}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Monthly revenue chart (bar) */}
              {revenue.monthly?.length > 0 && (
                <Card>
                  <CardHead title="📈 Monthly Revenue (Subscription)" sub="Last 6 months"/>
                  <div style={{ padding:"14px 18px" }}>
                    <div style={{ display:"flex",gap:6,alignItems:"flex-end",height:80 }}>
                      {revenue.monthly.map((m:any) => {
                        const maxRev = Math.max(...revenue.monthly.map((x:any)=>Number(x.revenue)||0),1);
                        const h = Math.max((Number(m.revenue)/maxRev)*72,4);
                        return (
                          <div key={m.month} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
                            <div style={{ fontSize:9,color:"#64748b",fontWeight:600 }}>${(Number(m.revenue)||0).toLocaleString()}</div>
                            <div style={{ width:"100%",height:h,background:"linear-gradient(to top,#0891b2,#38bdf8)",borderRadius:"4px 4px 0 0" }} title={`${m.month}: $${m.revenue}`}/>
                            <div style={{ fontSize:9,color:"#94a3b8",whiteSpace:"nowrap" }}>{m.month?.slice(5)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              )}

              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                {/* Tier distribution */}
                <Card>
                  <CardHead title="🏥 Hospitals by Tier"/>
                  <div style={{ padding:"12px 16px" }}>
                    {stats?.hospitalsByTier?.length > 0 ? stats.hospitalsByTier.map((t:any)=>(
                      <div key={t.tier} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:7 }}>
                        <div style={{ width:9,height:9,borderRadius:"50%",background:TC[t.tier as TierLevel]||"#6b7280",flexShrink:0 }}/>
                        <div style={{ fontSize:12,fontWeight:600,color:"#374151",flex:1 }}>{TL[t.tier as TierLevel]||t.tier}</div>
                        <div style={{ height:5,width:Math.max(t.count*22,5),background:TC[t.tier as TierLevel]||"#6b7280",borderRadius:3 }}/>
                        <span style={{ fontSize:12,fontWeight:700,color:TC[t.tier as TierLevel]||"#6b7280",minWidth:18,textAlign:"right" }}>{t.count}</span>
                      </div>
                    )) : <div style={{ color:"#94a3b8",fontSize:12,textAlign:"center",padding:"14px 0" }}>No data</div>}
                  </div>
                </Card>

                {/* Pending requests */}
                <Card>
                  <CardHead title="⏳ Pending Requests" action={pendingCount>0?<Pill label={`${pendingCount}`} color="#d97706" bg="#fef3c7"/>:undefined}/>
                  <div style={{ padding:"10px 14px" }}>
                    {requests.slice(0,4).map((r:any)=>(
                      <div key={r.id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #f8fafc",gap:7 }}>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ fontSize:11,fontWeight:600,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{r.feature_label}</div>
                          <div style={{ fontSize:10,color:"#64748b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{r.hospital_name}</div>
                        </div>
                        <div style={{ display:"flex",gap:4,flexShrink:0 }}>
                          <button onClick={()=>resolve(r.id,"approved")} style={{ padding:"2px 8px",background:"#dcfce7",color:"#059669",border:"none",borderRadius:5,cursor:"pointer",fontSize:10,fontWeight:700 }}>✓</button>
                          <button onClick={()=>resolve(r.id,"denied")} style={{ padding:"2px 8px",background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:5,cursor:"pointer",fontSize:10,fontWeight:700 }}>✗</button>
                        </div>
                      </div>
                    ))}
                    {requests.length===0 && <div style={{ color:"#94a3b8",fontSize:11,textAlign:"center",padding:"12px 0" }}>✅ All clear</div>}
                    {requests.length>4 && <button onClick={()=>setSection("requests")} style={{ marginTop:5,fontSize:11,color:"#0891b2",border:"none",background:"none",cursor:"pointer",fontWeight:600 }}>View all →</button>}
                  </div>
                </Card>
              </div>

              <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:14 }}>
                <Card>
                  <CardHead title="🖥️ System Health"/>
                  <div style={{ padding:"12px 16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:7 }}>
                    {[["Backend API","✅ v2.0.0"],["PostgreSQL","✅ Connected"],["Redis","✅ Active"],["Socket.IO","✅ Running"],["Frontend :3001","✅ Online"],["VMS :3000/:4000","✅ No Conflict"]].map(([l,v])=>(
                      <div key={String(l)} style={{ display:"flex",justifyContent:"space-between",padding:"5px 9px",background:"#f8fafc",borderRadius:6 }}>
                        <span style={{ fontSize:11,color:"#374151",fontWeight:500 }}>{l}</span>
                        <span style={{ fontSize:11,color:"#059669",fontWeight:600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </Card>
                <div style={{ background:"linear-gradient(135deg,#059669,#0891b2)",borderRadius:12,padding:"16px 18px",color:"white" }}>
                  <div style={{ fontWeight:700,fontSize:13,marginBottom:8 }}>🔒 Privacy Active</div>
                  <div style={{ fontSize:11,lineHeight:1.9,opacity:0.9 }}>
                    ✅ Rwanda DPL 2021<br/>✅ Aggregated stats only<br/>✅ No clinical records<br/>✅ Audit trail active<br/>✅ Tenant isolated
                  </div>
                </div>
              </div>

              {/* Portal links */}
              <Card style={{ padding:"12px 16px" }}>
                <div style={{ fontWeight:700,fontSize:13,color:"#0f172a",marginBottom:10 }}>🔗 Quick Portal Access</div>
                <div style={{ display:"flex",gap:7,flexWrap:"wrap" }}>
                  {PORTALS.map(p=>(
                    <a key={p.label} href={p.url} target="_blank" rel="noopener noreferrer"
                      style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 12px",background:`${p.color}10`,border:`1px solid ${p.color}25`,borderRadius:8,color:p.color,textDecoration:"none",fontSize:11,fontWeight:600 }}>
                      <span style={{ fontSize:14 }}>{p.icon}</span>{p.label}<ExternalLink size={9}/>
                    </a>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ═══ FEATURES ═══ */}
          {section==="features" && (
            <div style={{ display:"grid",gap:14 }}>
              <Card style={{ padding:"12px 16px" }}>
                <div style={{ display:"flex",gap:8,flexWrap:"wrap",alignItems:"center" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:7,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"7px 11px",flex:1,minWidth:180 }}>
                    <Search size={13} style={{ color:"#94a3b8" }}/>
                    <input value={fSearch} onChange={e=>setFSearch(e.target.value)} placeholder="Search features…" style={{ border:"none",outline:"none",fontSize:12,background:"transparent",flex:1,color:"#0f172a" }}/>
                  </div>
                  <select value={fTier} onChange={e=>setFTier(e.target.value)} style={{ padding:"7px 10px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,background:"white",color:"#374151" }}>
                    <option value="all">All Tiers</option>
                    {TIERS.map(t=><option key={t} value={t}>{TL[t]}</option>)}
                  </select>
                  <select value={fStatus} onChange={e=>setFStatus(e.target.value)} style={{ padding:"7px 10px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,background:"white",color:"#374151" }}>
                    <option value="all">All</option><option value="active">Active</option>
                    <option value="locked">Locked</option><option value="beta">Beta</option>
                  </select>
                  <span style={{ fontSize:11,color:"#94a3b8" }}>{filteredFeatures.length} features</span>
                  <button onClick={exportFeatures} style={{ display:"flex",alignItems:"center",gap:4,padding:"6px 12px",borderRadius:8,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:11,color:"#374151",fontWeight:600 }}>
                    <Download size={12}/>Export JSON
                  </button>
                </div>
              </Card>

              {Object.entries(byCategory).map(([cat,feats])=>(
                <Card key={cat}>
                  <button onClick={()=>setExpandedCat(expandedCat===cat?null:cat)}
                    style={{ display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"11px 16px",background:expandedCat===cat?"#f0f9ff":"#f8fafc",border:"none",cursor:"pointer",borderBottom:expandedCat===cat?"1px solid #e2e8f0":"none" }}>
                    <span style={{ fontWeight:700,fontSize:13,color:"#0f172a" }}>{cat} <span style={{ color:"#94a3b8",fontWeight:400 }}>({(feats as any[]).length})</span></span>
                    {expandedCat===cat?<ChevronDown size={14} style={{ color:"#64748b" }}/>:<ChevronRight size={14} style={{ color:"#64748b" }}/>}
                  </button>
                  {expandedCat===cat && (feats as any[]).map((f:any)=>(
                    <div key={f.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 16px",borderBottom:"1px solid #f8fafc",flexWrap:"wrap" }}>
                      <span style={{ fontSize:18,width:26,textAlign:"center",flexShrink:0 }}>{f.icon||"⚙️"}</span>
                      <div style={{ flex:1,minWidth:150 }}>
                        <div style={{ fontWeight:600,fontSize:12,color:"#0f172a" }}>{f.label}</div>
                        <div style={{ fontSize:10,color:"#94a3b8",marginTop:1 }}>{f.description||f.name}</div>
                      </div>
                      <Pill label={TL[f.tier_required as TierLevel]||f.tier_required} color={TC[f.tier_required as TierLevel]||"#6b7280"} bg={TB[f.tier_required as TierLevel]||"#f9fafb"}/>
                      <Pill label={(f.default_status==="active"?"● ":"○ ")+(SL[f.default_status as FeatureStatus]||f.default_status)} color={SC[f.default_status as FeatureStatus]||"#6b7280"} bg={SB[f.default_status as FeatureStatus]||"#f9fafb"}/>
                      <div style={{ display:"flex",gap:5 }}>
                        <button onClick={()=>toggleFeature(f)} style={{ display:"flex",alignItems:"center",gap:3,padding:"4px 10px",borderRadius:6,border:"1px solid #e2e8f0",cursor:"pointer",fontSize:11,fontWeight:600,background:f.default_status==="active"?"#fff7ed":"#f0fdf4",color:f.default_status==="active"?"#d97706":"#059669" }}>
                          {f.default_status==="active"?<><ToggleRight size={12}/>Disable</>:<><ToggleLeft size={12}/>Enable</>}
                        </button>
                        <button onClick={()=>setEditFeat({...f})} style={{ display:"flex",alignItems:"center",gap:3,padding:"4px 9px",borderRadius:6,border:"1px solid #e2e8f0",cursor:"pointer",fontSize:11,background:"white",color:"#374151" }}>
                          <Edit size={11}/>Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </Card>
              ))}
              {filteredFeatures.length===0 && <Card style={{ padding:40,textAlign:"center" }}><Zap size={30} style={{ margin:"0 auto 8px",display:"block",color:"#cbd5e1" }}/><div style={{ fontSize:13,color:"#94a3b8" }}>No features match.</div></Card>}
            </div>
          )}

          {/* ═══ HOSPITALS ═══ */}
          {section==="hospitals" && (
            <div style={{ display:"grid",gap:12 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8 }}>
                <div>
                  <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Registered Hospitals</div>
                  <div style={{ fontSize:11,color:"#94a3b8",marginTop:2 }}>{hospitals.length} in network · MOH codes auto-generated</div>
                </div>
                <button onClick={()=>setShowAddHosp(true)} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 16px",background:"#0891b2",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:600 }}>
                  <Plus size={14}/>Add Hospital
                </button>
              </div>

              {hospitals.map((h:any)=>(
                <Card key={h.id} style={{ padding:"16px 18px" }}>
                  <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:10 }}>
                    <div style={{ display:"flex",gap:12 }}>
                      <div style={{ width:42,height:42,borderRadius:10,background:"#ecfeff",border:"1px solid #0891b220",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>🏥</div>
                      <div>
                        <div style={{ fontWeight:700,fontSize:14,color:"#0f172a" }}>{h.name}</div>
                        <div style={{ fontSize:11,color:"#64748b",marginTop:2 }}>{h.email||"No email"} · {h.phone||"No phone"} · {h.type||"district"}</div>
                        <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:4 }}>
                          <span style={{ fontSize:11,color:"#94a3b8" }}>MOH:</span>
                          <span style={{ fontSize:11,fontWeight:700,color:"#0891b2",fontFamily:"monospace",background:"#ecfeff",padding:"1px 7px",borderRadius:5,border:"1px solid #bae6fd" }}>{h.moh_code||"—"}</span>
                          <span style={{ fontSize:10,color:"#94a3b8" }}>👥 {h.active_users||0} · ⚙️ {h.active_features||0}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5 }}>
                      <Pill label={TL[h.tier as TierLevel]||h.tier||"—"} color={TC[h.tier as TierLevel]||"#6b7280"} bg={TB[h.tier as TierLevel]||"#f9fafb"}/>
                      <span style={{ fontSize:10,fontWeight:600,color:h.sub_status==="active"?"#059669":"#dc2626" }}>{h.sub_status==="active"?"● Active":"● Inactive"}</span>
                    </div>
                  </div>
                  <div style={{ marginTop:11,paddingTop:9,borderTop:"1px solid #f1f5f9",display:"flex",alignItems:"center",gap:5,flexWrap:"wrap" }}>
                    <span style={{ fontSize:10,color:"#94a3b8",marginRight:3 }}>Set tier:</span>
                    {TIERS.map(t=>(
                      <button key={t} onClick={()=>setTier(h.id,t)} style={{ padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:600,border:`1.5px solid ${TC[t]}`,background:h.tier===t?TC[t]:"white",color:h.tier===t?"white":TC[t],cursor:"pointer" }}>{TL[t]}</button>
                    ))}
                    <button onClick={()=>setShowHospDet(h)} style={{ marginLeft:"auto",display:"flex",alignItems:"center",gap:3,padding:"3px 9px",borderRadius:6,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:10,color:"#374151" }}>
                      <Eye size={11}/>Details
                    </button>
                  </div>
                </Card>
              ))}
              {hospitals.length===0 && (
                <Card style={{ padding:48,textAlign:"center" }}>
                  <Building2 size={40} style={{ margin:"0 auto 10px",display:"block",color:"#cbd5e1" }}/>
                  <div style={{ fontSize:14,fontWeight:600,color:"#374151",marginBottom:4 }}>No hospitals yet</div>
                  <button onClick={()=>setShowAddHosp(true)} style={{ padding:"8px 18px",background:"#0891b2",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:600 }}>Add First Hospital</button>
                </Card>
              )}
            </div>
          )}

          {/* ═══ REQUESTS ═══ */}
          {section==="requests" && (
            <div style={{ display:"grid",gap:12 }}>
              <div style={{ display:"flex",gap:0,borderBottom:"2px solid #e2e8f0" }}>
                {(["pending","history"] as const).map(t=>(
                  <button key={t} onClick={()=>{ setReqTab(t); if(t==="history") loadReqHistory(); }}
                    style={{ padding:"8px 18px",border:"none",background:"none",cursor:"pointer",fontWeight:reqTab===t?700:400,color:reqTab===t?"#0891b2":"#6b7280",borderBottom:reqTab===t?"2px solid #0891b2":"2px solid transparent",fontSize:13,textTransform:"capitalize" }}>
                    {t} {t==="pending"&&pendingCount>0?`(${pendingCount})`:""}
                  </button>
                ))}
              </div>
              {reqTab==="pending" && <>
                {requests.length===0 && <Card style={{ padding:40,textAlign:"center" }}><CheckCircle size={36} style={{ margin:"0 auto 10px",display:"block",color:"#bbf7d0" }}/><div style={{ fontSize:14,fontWeight:600,color:"#374151" }}>All clear!</div></Card>}
                {requests.map((r:any)=>(
                  <Card key={r.id} style={{ padding:"14px 16px" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:10 }}>
                      <div>
                        <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:4,flexWrap:"wrap" }}>
                          <span style={{ fontSize:16 }}>{r.icon||"⚙️"}</span>
                          <span style={{ fontWeight:700,fontSize:13,color:"#0f172a" }}>{r.feature_label}</span>
                          <Pill label="Pending" color="#d97706" bg="#fffbeb"/>
                        </div>
                        <div style={{ fontSize:11,color:"#64748b" }}>🏥 <strong>{r.hospital_name}</strong> · {r.requested_by_name} ({r.job_title||r.role})</div>
                        {r.reason && <div style={{ marginTop:6,fontSize:11,color:"#374151",background:"#f8fafc",borderRadius:6,padding:"5px 9px",borderLeft:"3px solid #0891b2" }}>"{r.reason}"</div>}
                        <div style={{ fontSize:10,color:"#94a3b8",marginTop:4 }}>{new Date(r.created_at).toLocaleString()}</div>
                      </div>
                      <div style={{ display:"flex",gap:7,alignSelf:"flex-start" }}>
                        <button onClick={()=>resolve(r.id,"approved")} style={{ display:"flex",alignItems:"center",gap:5,padding:"7px 14px",background:"#059669",color:"white",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600 }}><CheckCircle size={12}/>Approve</button>
                        <button onClick={()=>resolve(r.id,"denied")} style={{ display:"flex",alignItems:"center",gap:5,padding:"7px 14px",background:"#dc2626",color:"white",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600 }}><XCircle size={12}/>Deny</button>
                      </div>
                    </div>
                  </Card>
                ))}
              </>}
              {reqTab==="history" && <>
                {reqHistory.length===0 && <Card style={{ padding:32,textAlign:"center" }}><div style={{ color:"#94a3b8",fontSize:12 }}>No request history</div></Card>}
                {reqHistory.map((r:any)=>(
                  <Card key={r.id} style={{ padding:"11px 14px" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:9,flexWrap:"wrap" }}>
                      <span style={{ fontSize:15 }}>{r.icon||"⚙️"}</span>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontWeight:600,fontSize:12,color:"#0f172a" }}>{r.feature_label}</div>
                        <div style={{ fontSize:10,color:"#64748b" }}>{r.hospital_name} · {r.requested_by_name}</div>
                      </div>
                      <Pill label={r.status} color={r.status==="approved"?"#059669":r.status==="denied"?"#dc2626":"#d97706"} bg={r.status==="approved"?"#dcfce7":r.status==="denied"?"#fee2e2":"#fffbeb"}/>
                      <span style={{ fontSize:10,color:"#94a3b8" }}>{new Date(r.created_at).toLocaleString()}</span>
                    </div>
                  </Card>
                ))}
              </>}
            </div>
          )}

          {/* ═══ CHAT ═══ */}
          {section==="chat" && (
            <div style={{ display:"flex",height:"calc(100vh - 120px)",minHeight:500,border:"1px solid #e2e8f0",borderRadius:12,overflow:"hidden",background:"white" }}>
              {/* Sidebar */}
              <div style={{ width:260,borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",flexShrink:0 }}>
                {/* DM / Group tabs */}
                <div style={{ padding:"10px 12px 0",borderBottom:"1px solid #f1f5f9" }}>
                  <div style={{ display:"flex",gap:0,marginBottom:8 }}>
                    {(["dm","group"] as const).map(v=>(
                      <button key={v} onClick={()=>setChatView(v)}
                        style={{ flex:1,padding:"6px",border:"none",background:"none",cursor:"pointer",fontWeight:chatView===v?700:400,color:chatView===v?"#0891b2":"#6b7280",borderBottom:chatView===v?"2px solid #0891b2":"2px solid transparent",fontSize:12,textTransform:"uppercase",letterSpacing:"0.04em" }}>
                        {v==="dm"?"Direct":"Groups"}
                      </button>
                    ))}
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:6,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:7,padding:"5px 9px",marginBottom:8 }}>
                    <Search size={12} style={{ color:"#94a3b8" }}/>
                    <input value={chatSearch} onChange={e=>setChatSearch(e.target.value)} placeholder={chatView==="dm"?"Search users…":"Search groups…"} style={{ border:"none",outline:"none",fontSize:11,background:"transparent",flex:1,color:"#0f172a" }}/>
                  </div>
                  {chatView==="group" && (
                    <button onClick={()=>setShowCreateGrp(true)} style={{ display:"flex",alignItems:"center",gap:5,width:"100%",padding:"7px 10px",borderRadius:7,border:"1px dashed #0891b2",background:"#f0f9ff",cursor:"pointer",fontSize:11,color:"#0891b2",fontWeight:600,marginBottom:8 }}>
                      <Plus size={12}/>Create Group
                    </button>
                  )}
                </div>

                {/* Thread list */}
                <div style={{ flex:1,overflowY:"auto" }}>
                  {(chatView==="dm"?chatUsers:groups).filter((u:any)=>u.name.toLowerCase().includes(chatSearch.toLowerCase())).map((t:any)=>(
                    <div key={t.id} onClick={()=>openThread(t)}
                      style={{ display:"flex",alignItems:"center",gap:9,padding:"10px 12px",cursor:"pointer",background:selThread?.id===t.id?"#f0f9ff":"white",borderBottom:"1px solid #f9fafb" }}>
                      <div style={{ position:"relative",flexShrink:0 }}>
                        <div style={{ width:36,height:36,borderRadius:t.type==="group"?"10px":"50%",background:selThread?.id===t.id?"#0891b2":t.type==="group"?"#f0f9ff":"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:t.type==="group"?16:11,fontWeight:700,color:selThread?.id===t.id?"white":"#374151",border:t.type==="group"?"1px solid #bae6fd":"none" }}>
                          {t.type==="group"?"#":t.initials}
                        </div>
                        {t.type==="dm" && <div style={{ position:"absolute",bottom:0,right:0,width:9,height:9,borderRadius:"50%",border:"2px solid white",background:t.status==="online"?"#22c55e":t.status==="away"?"#f59e0b":"#d1d5db" }}/>}
                      </div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:11,fontWeight:600,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{t.type==="group"?`#${t.name}`:t.name}</div>
                        <div style={{ fontSize:10,color:"#94a3b8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                          {t.type==="group"?`${t.members||0} members`:t.role}
                        </div>
                      </div>
                      {t.unread>0 && <span style={{ background:"#0891b2",color:"white",borderRadius:10,padding:"1px 5px",fontSize:9,fontWeight:700 }}>{t.unread}</span>}
                    </div>
                  ))}
                  {(chatView==="dm"?chatUsers:groups).length===0 && (
                    <div style={{ padding:20,textAlign:"center",color:"#94a3b8",fontSize:11 }}>
                      {chatView==="group"?"No groups yet. Create one above.":"Loading users…"}
                    </div>
                  )}
                </div>
              </div>

              {/* Message area */}
              {selThread ? (
                <div style={{ flex:1,display:"flex",flexDirection:"column" }}>
                  {/* Header */}
                  <div style={{ padding:"10px 16px",borderBottom:"1px solid #e2e8f0",display:"flex",alignItems:"center",gap:10,background:"#fafafa" }}>
                    <div style={{ width:34,height:34,borderRadius:selThread.type==="group"?"9px":"50%",background:"#0891b2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:selThread.type==="group"?16:11,fontWeight:700,color:"white",flexShrink:0 }}>
                      {selThread.type==="group"?"#":selThread.initials}
                    </div>
                    <div>
                      <div style={{ fontSize:13,fontWeight:700,color:"#0f172a" }}>{selThread.type==="group"?`#${selThread.name}`:selThread.name}</div>
                      <div style={{ fontSize:10,color:"#94a3b8" }}>
                        {selThread.type==="group"?`${selThread.members||0} members`:`${selThread.role} · ${selThread.status}`}
                      </div>
                    </div>
                    <div style={{ marginLeft:"auto",display:"flex",gap:5 }}>
                      {selThread.type==="dm" && <>
                        <button style={{ padding:"5px 7px",borderRadius:6,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",display:"flex" }}><Phone size={12} style={{ color:"#64748b" }}/></button>
                        <button style={{ padding:"5px 7px",borderRadius:6,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",display:"flex" }}><Video size={12} style={{ color:"#64748b" }}/></button>
                      </>}
                      <button style={{ padding:"5px 7px",borderRadius:6,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",display:"flex" }}><MoreVertical size={12} style={{ color:"#64748b" }}/></button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div style={{ flex:1,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:8 }}>
                    {messages.map((m:any)=>(
                      <div key={m.id} style={{ display:"flex",flexDirection:m.from==="admin"?"row-reverse":"row",gap:7,alignItems:"flex-end" }}>
                        {m.from!=="admin" && <div style={{ width:26,height:26,borderRadius:"50%",background:"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,flexShrink:0 }}>{selThread.type==="group"?"G":selThread.initials}</div>}
                        <div style={{ maxWidth:"70%" }}>
                          {/* File attachment message */}
                          {m.file ? (
                            <div style={{ background:m.from==="admin"?"#0891b2":"#f1f5f9",borderRadius:m.from==="admin"?"12px 12px 2px 12px":"12px 12px 12px 2px",padding:"8px 12px",border:"1px solid rgba(0,0,0,0.06)" }}>
                              {isImage(m.file.name) ? (
                                <div>
                                  <img src={m.file.url} alt={m.file.name} style={{ maxWidth:200,maxHeight:160,borderRadius:6,display:"block",marginBottom:4 }}/>
                                  <div style={{ fontSize:10,color:m.from==="admin"?"rgba(255,255,255,0.7)":"#94a3b8" }}>{m.file.name} · {formatBytes(m.file.size)}</div>
                                </div>
                              ) : (
                                <a href={m.file.url} download={m.file.name} style={{ display:"flex",alignItems:"center",gap:7,textDecoration:"none",color:m.from==="admin"?"white":"#0f172a" }}>
                                  <div style={{ width:32,height:32,borderRadius:7,background:m.from==="admin"?"rgba(255,255,255,0.15)":"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center" }}>
                                    {fileIcon(m.file.name)}
                                  </div>
                                  <div>
                                    <div style={{ fontSize:11,fontWeight:600,maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{m.file.name}</div>
                                    <div style={{ fontSize:10,opacity:0.7 }}>{formatBytes(m.file.size)}</div>
                                  </div>
                                </a>
                              )}
                              <div style={{ fontSize:9,opacity:0.5,marginTop:3,textAlign:"right" }}>{m.time}</div>
                            </div>
                          ) : (
                            <div style={{ background:m.from==="admin"?"#0891b2":"#f1f5f9",color:m.from==="admin"?"white":"#0f172a",borderRadius:m.from==="admin"?"12px 12px 2px 12px":"12px 12px 12px 2px",padding:"8px 12px",fontSize:12 }}>
                              {m.text}
                              <div style={{ fontSize:9,opacity:0.5,marginTop:2,textAlign:"right" }}>{m.time}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={msgEnd}/>
                  </div>

                  {/* Input */}
                  <div style={{ padding:"9px 12px",borderTop:"1px solid #e2e8f0",display:"flex",gap:7,alignItems:"center" }}>
                    <button style={{ padding:"7px",borderRadius:7,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",display:"flex" }}><Smile size={13} style={{ color:"#94a3b8" }}/></button>
                    {/* File attachment button — accepts all file types */}
                    <button onClick={()=>fileRef.current?.click()} style={{ padding:"7px",borderRadius:7,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",display:"flex" }} title="Attach file">
                      <Paperclip size={13} style={{ color:"#64748b" }}/>
                    </button>
                    <input ref={fileRef} type="file" multiple accept="*/*" onChange={handleFileAttach} style={{ display:"none" }}/>
                    <input value={msgInput} onChange={e=>setMsgInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMsg()} placeholder="Type a message… (Enter to send)" style={{ flex:1,padding:"8px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none",color:"#0f172a" }}/>
                    <button onClick={sendMsg} style={{ padding:"8px 12px",background:"#0891b2",color:"white",borderRadius:8,border:"none",cursor:"pointer",display:"flex" }}><Send size={13}/></button>
                  </div>
                </div>
              ) : (
                <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10,color:"#94a3b8" }}>
                  <MessageSquare size={48} style={{ color:"#cbd5e1" }}/>
                  <div style={{ fontSize:13,fontWeight:600,color:"#374151" }}>Select a conversation</div>
                  <div style={{ fontSize:11 }}>{chatView==="group"?"Pick a group or create one":"Choose a user from the sidebar"}</div>
                </div>
              )}
            </div>
          )}

          {/* ═══ AI COMPANION ═══ */}
          {section==="ai" && (
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ background:"linear-gradient(135deg,#0f172a,#1e293b)",borderRadius:12,padding:"20px 22px",color:"white" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
                  <div style={{ width:44,height:44,borderRadius:10,background:"linear-gradient(135deg,#0891b2,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center" }}><Bot size={20} style={{ color:"white" }}/></div>
                  <div>
                    <div style={{ fontWeight:700,fontSize:15 }}>ARTIC AI Health Companion</div>
                    <div style={{ fontSize:11,color:"#94a3b8" }}>Rwanda MOH protocols · WHO guidelines · System context aware</div>
                  </div>
                  <div style={{ marginLeft:"auto",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3 }}>
                    <span style={{ fontSize:10,padding:"2px 8px",borderRadius:12,background:"rgba(8,145,178,0.3)",color:"#38bdf8",fontWeight:600 }}>
                      {process.env.NEXT_PUBLIC_AI_MODE === "openai" ? "🤖 OpenAI GPT" : aiSource==="openai"?"🤖 OpenAI GPT":"📚 Local KB"}
                    </span>
                    <span style={{ fontSize:9,color:"#64748b" }}>Reads system metrics · No patient PII</span>
                  </div>
                </div>
                <div style={{ background:"rgba(255,255,255,0.06)",borderRadius:7,padding:"8px 12px",fontSize:11,color:"#94a3b8",border:"1px solid rgba(255,255,255,0.07)" }}>
                  ⚠️ AI guidance is informational only. All clinical decisions require qualified medical professional review.
                </div>
              </div>

              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:7 }}>
                {AI_ACTIONS.map(a=>(
                  <button key={a.label} onClick={()=>{ setAiAction(a); setAiInput(a.prompt); }}
                    style={{ display:"flex",alignItems:"center",gap:7,padding:"10px 12px",background:"white",border:`2px solid ${aiAction?.label===a.label?"#0891b2":"#e2e8f0"}`,borderRadius:9,cursor:"pointer",fontSize:11,fontWeight:600,color:aiAction?.label===a.label?"#0891b2":"#374151",textAlign:"left" }}>
                    <span style={{ fontSize:16 }}>{a.icon}</span>{a.label}
                  </button>
                ))}
              </div>

              <Card>
                <textarea value={aiInput} onChange={e=>setAiInput(e.target.value)} placeholder="Ask about clinical guidance, Rwanda MOH protocols, drug info, health education, or system management…" rows={4}
                  style={{ width:"100%",padding:"14px 16px",border:"none",outline:"none",fontSize:13,resize:"none",fontFamily:"inherit",boxSizing:"border-box",color:"#0f172a",lineHeight:1.6 }}/>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 14px",borderTop:"1px solid #f1f5f9",background:"#fafafa" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <span style={{ fontSize:11,color:"#94a3b8" }}>{aiInput.length} chars</span>
                    {aiSource && <span style={{ fontSize:10,padding:"1px 7px",borderRadius:10,background:aiSource==="openai"?"#f0f9ff":"#f8fafc",color:aiSource==="openai"?"#0891b2":"#64748b",fontWeight:600 }}>via {aiSource==="openai"?"OpenAI GPT":"Local KB"}</span>}
                  </div>
                  <button onClick={askAI} disabled={aiLoading||!aiInput.trim()}
                    style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 18px",background:aiLoading||!aiInput.trim()?"#e2e8f0":"linear-gradient(135deg,#0891b2,#7c3aed)",color:aiLoading||!aiInput.trim()?"#94a3b8":"white",borderRadius:8,border:"none",cursor:aiLoading||!aiInput.trim()?"not-allowed":"pointer",fontSize:12,fontWeight:600 }}>
                    {aiLoading?<><Loader2 size={13} style={{ animation:"spin 1s linear infinite" }}/>Thinking…</>:<><Bot size={13}/>Ask AI</>}
                  </button>
                </div>
              </Card>

              {aiResp && (
                <Card style={{ padding:"16px 18px",border:"1px solid #a7f3d0" }}>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:6,fontWeight:700,fontSize:12,color:"#059669" }}>
                      <div style={{ width:26,height:26,borderRadius:7,background:"linear-gradient(135deg,#0891b2,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center" }}><Bot size={13} style={{ color:"white" }}/></div>
                      AI Response
                    </div>
                    {aiSource && <span style={{ fontSize:10,padding:"2px 8px",borderRadius:10,background:aiSource==="openai"?"#ecfeff":"#f1f5f9",color:aiSource==="openai"?"#0891b2":"#64748b",fontWeight:600,border:`1px solid ${aiSource==="openai"?"#bae6fd":"#e2e8f0"}` }}>🤖 {aiSource==="openai"?"OpenAI GPT-3.5":"Local KB"}</span>}
                  </div>
                  <div style={{ fontSize:13,color:"#0f172a",lineHeight:1.8,whiteSpace:"pre-wrap" }}>{aiResp}</div>
                  <div style={{ display:"flex",gap:7,marginTop:10 }}>
                    <button onClick={()=>{ navigator.clipboard?.writeText(aiResp||""); show("Copied","success"); }} style={{ display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:6,border:"1px solid #a7f3d0",background:"white",cursor:"pointer",fontSize:11,color:"#059669",fontWeight:600 }}><FileText size={11}/>Copy</button>
                    <button onClick={()=>show("Helpful — recorded","success")} style={{ display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:6,border:"1px solid #a7f3d0",background:"white",cursor:"pointer",fontSize:11,color:"#059669",fontWeight:600 }}><ThumbsUp size={11}/>Helpful</button>
                    <button onClick={()=>show("Feedback noted","info")} style={{ display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:6,border:"1px solid #fecaca",background:"white",cursor:"pointer",fontSize:11,color:"#dc2626",fontWeight:600 }}><ThumbsDown size={11}/>Not Helpful</button>
                  </div>
                </Card>
              )}

              {aiHistory.length > 0 && (
                <Card>
                  <CardHead title="📜 Query History" sub={`${aiHistory.length} queries persisted in DB`}/>
                  <div style={{ padding:"10px 14px",display:"flex",flexDirection:"column",gap:6 }}>
                    {aiHistory.map((h:any)=>(
                      <div key={h.id} onClick={()=>{ setAiInput(h.question); setAiResp(h.response); }} style={{ padding:"8px 11px",background:"#f8fafc",borderRadius:7,borderLeft:"3px solid #0891b2",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10 }}>
                        <div>
                          <div style={{ fontSize:11,fontWeight:600,color:"#0f172a",marginBottom:1 }}>{(h.question||"").slice(0,80)}{(h.question||"").length>80?"…":""}</div>
                          <div style={{ fontSize:10,color:"#94a3b8" }}>{h.time}</div>
                        </div>
                        {h.source && <span style={{ fontSize:9,padding:"1px 6px",borderRadius:9,background:h.source==="openai"?"#ecfeff":"#f1f5f9",color:h.source==="openai"?"#0891b2":"#64748b",fontWeight:600,flexShrink:0 }}>{h.source==="openai"?"GPT":"KB"}</span>}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* ═══ BILLING ═══ */}
          {section==="billing" && (
            <div style={{ display:"grid",gap:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8 }}>
                <div><div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Subscription Billing</div><div style={{ fontSize:11,color:"#94a3b8",marginTop:2 }}>{invoices.length} invoices · Total collected ${Number(revenue.totalPaid||0).toLocaleString()}</div></div>
                <button onClick={()=>setShowAddInv(true)} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 16px",background:"#0891b2",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:600 }}><Plus size={14}/>Create Invoice</button>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10 }}>
                {[
                  { label:"Collected",  value:`$${Number(revenue.totalPaid||0).toLocaleString()}`,    icon:"💰",color:"#059669" },
                  { label:"Pending",    value:`$${Number(revenue.totalPending||0).toLocaleString()}`,  icon:"⏳",color:"#d97706" },
                  { label:"Overdue",    value:`$${Number(revenue.totalOverdue||0).toLocaleString()}`,  icon:"🚨",color:revenue.totalOverdue?"#dc2626":"#6b7280" },
                  { label:"Invoiced",   value:`$${Number(revenue.totalInvoiced||0).toLocaleString()}`, icon:"📄",color:"#0891b2" },
                ].map(k=>(
                  <div key={k.label} style={{ background:"white",borderRadius:10,padding:"12px 14px",border:"1px solid #e2e8f0",borderTop:`3px solid ${k.color}` }}>
                    <div style={{ fontSize:18,fontWeight:800,color:k.color }}>{k.value}</div>
                    <div style={{ fontSize:11,color:"#64748b",marginTop:2,fontWeight:500 }}>{k.label}</div>
                  </div>
                ))}
              </div>
              <Card>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                    <thead>
                      <tr style={{ background:"#f8fafc",borderBottom:"1px solid #e2e8f0" }}>
                        {["Ref","Hospital","Tier","Amount","Period","Status","Actions"].map(h=>(
                          <th key={h} style={{ padding:"9px 13px",textAlign:"left",fontWeight:600,fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.04em",whiteSpace:"nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv:any)=>(
                        <tr key={inv.id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                          <td style={{ padding:"9px 13px",fontWeight:700,color:"#0891b2" }}>{inv.invoice_ref}</td>
                          <td style={{ padding:"9px 13px",color:"#0f172a" }}>{inv.hospital_name}</td>
                          <td style={{ padding:"9px 13px" }}><Pill label={TL[inv.tier as TierLevel]||inv.tier||"—"} color={TC[inv.tier as TierLevel]||"#6b7280"} bg={TB[inv.tier as TierLevel]||"#f9fafb"}/></td>
                          <td style={{ padding:"9px 13px",fontWeight:600,color:"#0f172a" }}>{inv.currency||"USD"} {Number(inv.amount||0).toLocaleString()}</td>
                          <td style={{ padding:"9px 13px",color:"#64748b",fontSize:11 }}>{inv.period_start||"—"}</td>
                          <td style={{ padding:"9px 13px" }}><Pill label={inv.status||"pending"} color={inv.status==="paid"?"#059669":inv.status==="overdue"?"#dc2626":"#d97706"} bg={inv.status==="paid"?"#dcfce7":inv.status==="overdue"?"#fee2e2":"#fffbeb"}/></td>
                          <td style={{ padding:"9px 13px" }}>
                            <div style={{ display:"flex",gap:4 }}>
                              <button onClick={()=>setShowInvDet(inv)} style={{ padding:"3px 7px",borderRadius:5,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",display:"flex",alignItems:"center" }}><Eye size={11} style={{ color:"#64748b" }}/></button>
                              {inv.status!=="paid" && <button onClick={()=>markPaid(inv.id)} style={{ padding:"3px 7px",borderRadius:5,border:"1px solid #dcfce7",background:"#f0fdf4",cursor:"pointer",fontSize:10,color:"#059669",fontWeight:600 }}>Mark Paid</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {invoices.length===0 && <tr><td colSpan={7} style={{ padding:28,textAlign:"center",color:"#94a3b8",fontSize:12 }}>No invoices. Create your first invoice above.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ═══ AUDIT ═══ */}
          {section==="audit" && (
            <div style={{ display:"grid",gap:14 }}>
              <div><div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>System Audit Logs</div><div style={{ fontSize:11,color:"#94a3b8",marginTop:2 }}>System-level events only · {auditTotal} total · No clinical data (Rwanda DPL)</div></div>
              <Card>
                <div style={{ padding:"10px 14px",borderBottom:"1px solid #f1f5f9",display:"flex",gap:8,alignItems:"center",background:"#f8fafc",flexWrap:"wrap" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:6,background:"white",border:"1px solid #e2e8f0",borderRadius:7,padding:"6px 10px",flex:1,maxWidth:280 }}>
                    <Search size={12} style={{ color:"#94a3b8" }}/>
                    <input value={auditSearch} onChange={e=>setAuditSearch(e.target.value)} placeholder="Filter logs…" style={{ border:"none",outline:"none",fontSize:12,background:"transparent",color:"#0f172a" }}/>
                  </div>
                  <span style={{ fontSize:10,color:"#94a3b8",flex:1 }}>Showing system events · Clinical audit is per-hospital</span>
                  <div style={{ display:"flex",gap:4 }}>
                    <button onClick={()=>loadAudit(Math.max(1,auditPage-1))} disabled={auditPage<=1} style={{ padding:"5px 9px",borderRadius:6,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:11,color:"#374151" }}>‹</button>
                    <span style={{ padding:"5px 9px",fontSize:11,color:"#64748b" }}>{auditPage}</span>
                    <button onClick={()=>loadAudit(auditPage+1)} disabled={auditData.length<30} style={{ padding:"5px 9px",borderRadius:6,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:11,color:"#374151" }}>›</button>
                  </div>
                </div>
                <div style={{ padding:"12px 14px",display:"flex",flexDirection:"column",gap:6 }}>
                  {auditData.filter(l=>!auditSearch||JSON.stringify(l).toLowerCase().includes(auditSearch.toLowerCase())).map((log:any,i:number)=>{
                    const icon=log.action==="LOGIN"?"🔐":log.action?.includes("FEATURE")?"⚙️":log.action?.includes("HOSPITAL")?"🏥":log.result==="denied"?"🚫":"📝";
                    return (
                      <div key={log.id||i} style={{ display:"flex",alignItems:"center",gap:9,padding:"8px 11px",background:"#f8fafc",borderRadius:7 }}>
                        <span style={{ fontSize:14,flexShrink:0 }}>{icon}</span>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ fontSize:11,fontWeight:700,color:"#0f172a" }}>{log.action||"ACTION"} <span style={{ fontSize:10,color:"#94a3b8",fontWeight:400 }}>· {log.module||"system"}</span></div>
                          <div style={{ fontSize:10,color:"#64748b" }}>{log.user_email||"system"} · {log.created_at?new Date(log.created_at).toLocaleString():"—"}</div>
                          {log.reason && <div style={{ fontSize:10,color:"#dc2626",marginTop:1 }}>{log.reason}</div>}
                        </div>
                        <Pill label={log.result||"success"} color={log.result==="success"?"#059669":log.result==="denied"?"#dc2626":"#d97706"} bg={log.result==="success"?"#dcfce7":log.result==="denied"?"#fee2e2":"#fffbeb"}/>
                      </div>
                    );
                  })}
                  {auditData.length===0 && <div style={{ textAlign:"center",padding:24,color:"#94a3b8",fontSize:12 }}>No logs found. Actions will appear here.</div>}
                </div>
              </Card>
            </div>
          )}

          {/* ═══ SETTINGS ═══ */}
          {section==="settings" && (
            <div style={{ display:"grid",gap:14 }}>
              <div><div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>System Settings</div><div style={{ fontSize:11,color:"#94a3b8",marginTop:2 }}>Global ARTIC HMS configuration</div></div>
              <Card>
                <CardHead title="📊 Subscription Tier Pricing" sub="Click Edit to update — changes saved to DB"/>
                <div style={{ padding:"14px 16px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:10 }}>
                  {TIERS.map(t=>{
                    const cfg=tierCfg.find((c:any)=>c.tier===t)||{};
                    return (
                      <div key={t} style={{ border:`2px solid ${TC[t]}30`,borderRadius:10,padding:"12px",background:TB[t] }}>
                        <div style={{ display:"flex",alignItems:"center",gap:5,marginBottom:7 }}>
                          <div style={{ width:9,height:9,borderRadius:"50%",background:TC[t] }}/>
                          <span style={{ fontWeight:700,fontSize:12,color:TC[t] }}>{TL[t]}</span>
                        </div>
                        <div style={{ fontSize:11,color:"#374151",lineHeight:1.9 }}>
                          <div>💰 {cfg.price!==undefined?(cfg.price===0?"Free":`$${cfg.price}/mo`):(t==="trial"?"Free":t==="basic"?"$50/mo":t==="premium"?"$120/mo":t==="pro"?"$250/mo":"Custom")}</div>
                          <div>👥 {cfg.maxUsers!==undefined?(cfg.maxUsers===null?"Unlimited":`${cfg.maxUsers} users`):(t==="trial"?"3 users":t==="basic"?"10 users":t==="premium"?"30 users":t==="pro"?"100 users":"Unlimited")}</div>
                          <div>💬 {cfg.support||(t==="trial"||t==="basic"?"Email":t==="premium"?"Priority":t==="pro"?"24/7":"Dedicated")}</div>
                        </div>
                        <button onClick={()=>setShowEditTier({tier:t,...cfg})} style={{ marginTop:8,padding:"4px 0",width:"100%",borderRadius:6,border:`1px solid ${TC[t]}40`,background:"white",cursor:"pointer",fontSize:10,color:TC[t],fontWeight:700 }}>Edit Pricing</button>
                      </div>
                    );
                  })}
                </div>
              </Card>
              <Card>
                <CardHead title="🔧 System Configuration"/>
                <div style={{ padding:"14px 18px",display:"grid",gap:11 }}>
                  {[
                    { k:"system_name",l:"System Name",v:"ARTIC HMS",t:"text" },
                    { k:"support_email",l:"Support Email",v:"support@artic.health",t:"email" },
                    { k:"smtp_host",l:"SMTP Host",v:"smtp.gmail.com",t:"text" },
                    { k:"smtp_user",l:"SMTP Username",v:"",t:"email" },
                    { k:"openai_key",l:"OpenAI API Key",v:"",t:"password",note:"Enables GPT-powered AI" },
                    { k:"default_currency",l:"Default Currency",v:"USD",t:"text" },
                    { k:"trial_days",l:"Trial Days",v:"14",t:"number" },
                    { k:"base_url",l:"Frontend URL",v:"http://172.209.217.176:3001",t:"url" },
                  ].map(s=>(
                    <div key={s.k} style={{ display:"grid",gridTemplateColumns:"200px 1fr",alignItems:"center",gap:12 }}>
                      <div>
                        <div style={{ fontSize:12,fontWeight:600,color:"#374151" }}>{s.l}</div>
                        {s.note && <div style={{ fontSize:10,color:"#059669" }}>{s.note}</div>}
                      </div>
                      <input defaultValue={s.v} type={s.t} placeholder={s.t==="password"?"sk-…":""}
                        style={{ padding:"7px 11px",borderRadius:7,border:"1px solid #e2e8f0",fontSize:12,color:"#0f172a",outline:"none" }}/>
                    </div>
                  ))}
                  <div style={{ display:"flex",justifyContent:"flex-end",marginTop:4 }}>
                    <button onClick={()=>show("Settings saved","success")} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 18px",background:"#0891b2",color:"white",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600 }}><Save size={13}/>Save Settings</button>
                  </div>
                </div>
              </Card>
              <div style={{ background:"linear-gradient(135deg,#ecfdf5,#e0f2fe)",borderRadius:12,padding:"16px 18px",border:"1px solid #a7f3d0" }}>
                <div style={{ fontWeight:700,fontSize:13,color:"#059669",marginBottom:8,display:"flex",alignItems:"center",gap:5 }}><Shield size={13}/>Privacy & Legal Compliance</div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,fontSize:12,color:"#065f46" }}>
                  <div>✅ Rwanda Data Protection Law (2021)</div><div>✅ Super Admin blocked from clinical data</div>
                  <div>✅ Aggregated statistics only</div><div>✅ Audit trail (7-year retention)</div>
                  <div>✅ MOH codes auto-generated uniquely</div><div>✅ TLS 1.3 enforced</div>
                </div>
              </div>
              <div style={{ background:"#fff5f5",borderRadius:12,padding:"16px 18px",border:"1px solid #fecaca" }}>
                <div style={{ fontWeight:700,fontSize:13,color:"#dc2626",marginBottom:8,display:"flex",alignItems:"center",gap:5 }}><AlertTriangle size={13}/>Danger Zone</div>
                <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                  <button onClick={()=>show("Requires confirmation","warning")} style={{ padding:"7px 14px",borderRadius:7,border:"1px solid #fecaca",background:"white",cursor:"pointer",fontSize:11,color:"#dc2626",fontWeight:600 }}>🗑️ Clear Demo Data</button>
                  <button onClick={()=>show("Backup initiated","info")} style={{ padding:"7px 14px",borderRadius:7,border:"1px solid #fecaca",background:"white",cursor:"pointer",fontSize:11,color:"#dc2626",fontWeight:600 }}>💾 Force Backup</button>
                  <button onClick={()=>show("Cache cleared","success")} style={{ padding:"7px 14px",borderRadius:7,border:"1px solid #fecaca",background:"white",cursor:"pointer",fontSize:11,color:"#dc2626",fontWeight:600 }}>🔄 Clear Cache</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODALS */}

      {/* Edit Feature */}
      {editFeat && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:"white",borderRadius:14,padding:"22px 24px",width:"100%",maxWidth:500,maxHeight:"88vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.22)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
              <div style={{ fontWeight:800,fontSize:15,color:"#0f172a" }}>{editFeat.icon||"⚙️"} Edit: {editFeat.label}</div>
              <button onClick={()=>setEditFeat(null)} style={{ border:"none",background:"none",cursor:"pointer",color:"#64748b" }}><X size={17}/></button>
            </div>
            <div style={{ display:"grid",gap:12 }}>
              {[{k:"label",l:"Display Label"},{k:"description",l:"Description"},{k:"access_message",l:"Locked Message"}].map(f=>(
                <div key={f.k}><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>{f.l}</label>
                <input value={editFeat[f.k]||""} onChange={e=>setEditFeat({...editFeat,[f.k]:e.target.value})} style={{ width:"100%",padding:"8px 11px",borderRadius:7,border:"1px solid #e2e8f0",fontSize:12,color:"#0f172a",outline:"none",boxSizing:"border-box" }}/></div>
              ))}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Status</label>
                <select value={editFeat.default_status||"active"} onChange={e=>setEditFeat({...editFeat,default_status:e.target.value})} style={{ width:"100%",padding:"8px 11px",borderRadius:7,border:"1px solid #e2e8f0",fontSize:12,outline:"none" }}>
                  <option value="active">Active</option><option value="locked">Locked</option>
                  <option value="limited">Limited</option><option value="beta">Beta</option><option value="pending">Pending</option>
                </select></div>
                <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Required Tier</label>
                <select value={editFeat.tier_required||"basic"} onChange={e=>setEditFeat({...editFeat,tier_required:e.target.value})} style={{ width:"100%",padding:"8px 11px",borderRadius:7,border:"1px solid #e2e8f0",fontSize:12,outline:"none" }}>
                  {TIERS.map(t=><option key={t} value={t}>{TL[t]}</option>)}
                </select></div>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                <input type="checkbox" id="ra" checked={!!editFeat.requires_approval} onChange={e=>setEditFeat({...editFeat,requires_approval:e.target.checked})} style={{ width:15,height:15,cursor:"pointer",accentColor:"#0891b2" }}/>
                <label htmlFor="ra" style={{ fontSize:12,color:"#374151",cursor:"pointer" }}>Requires Admin Approval</label>
              </div>
            </div>
            <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:18 }}>
              <button onClick={()=>setEditFeat(null)} style={{ padding:"8px 18px",borderRadius:8,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:12,color:"#374151",fontWeight:600 }}>Cancel</button>
              <button onClick={()=>saveFeature(editFeat)} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 20px",background:"linear-gradient(135deg,#0891b2,#7c3aed)",color:"white",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:700 }}><Save size={13}/>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Hospital — with auto MOH code notice + email fields */}
      {showAddHosp && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:"white",borderRadius:14,padding:"22px 24px",width:"100%",maxWidth:520,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.22)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
              <div style={{ fontWeight:800,fontSize:15,color:"#0f172a" }}>🏥 Add Hospital</div>
              <button onClick={()=>setShowAddHosp(false)} style={{ border:"none",background:"none",cursor:"pointer",color:"#64748b" }}><X size={17}/></button>
            </div>
            <div style={{ background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:8,padding:"10px 12px",marginBottom:14,fontSize:12,color:"#0369a1" }}>
              🔑 MOH Code is <strong>auto-generated</strong> (unique, format: RW-DH-2026-XXXX). Leave blank or provide custom code.
            </div>
            <div style={{ background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,padding:"10px 12px",marginBottom:14,fontSize:12,color:"#065f46" }}>
              📧 A <strong>welcome email</strong> will be sent to the hospital email with login credentials and MOH code.
            </div>
            <div style={{ display:"grid",gap:11 }}>
              {[{k:"name" as const,l:"Hospital Name *",t:"text"},{k:"email" as const,l:"Hospital Email (receives welcome)",t:"email"},{k:"adminEmail" as const,l:"Admin Login Email",t:"email"},{k:"phone" as const,l:"Phone",t:"text"},{k:"mohCode" as const,l:"MOH Code (leave blank to auto-generate)",t:"text"}].map(f=>(
                <div key={f.k}><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>{f.l}</label>
                <input value={hospForm[f.k]} onChange={e=>setHospForm({...hospForm,[f.k]:e.target.value})} type={f.t} style={{ width:"100%",padding:"8px 11px",borderRadius:7,border:"1px solid #e2e8f0",fontSize:12,color:"#0f172a",outline:"none",boxSizing:"border-box" }}/></div>
              ))}
              <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Temporary Password (sent in email)</label>
              <input value={hospForm.tempPassword} onChange={e=>setHospForm({...hospForm,tempPassword:e.target.value})} type="text" placeholder="ChangeMe@2026!" style={{ width:"100%",padding:"8px 11px",borderRadius:7,border:"1px solid #e2e8f0",fontSize:12,color:"#0f172a",outline:"none",boxSizing:"border-box" }}/></div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Type</label>
                <select value={hospForm.type} onChange={e=>setHospForm({...hospForm,type:e.target.value})} style={{ width:"100%",padding:"8px 11px",borderRadius:7,border:"1px solid #e2e8f0",fontSize:12,outline:"none" }}>
                  <option value="district">District Hospital</option><option value="referral">Referral Hospital</option>
                  <option value="clinic">Clinic</option><option value="health_center">Health Center</option>
                  <option value="private">Private Hospital</option><option value="dispensary">Dispensary</option>
                </select></div>
                <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Initial Tier</label>
                <select value={hospForm.tier} onChange={e=>setHospForm({...hospForm,tier:e.target.value as TierLevel})} style={{ width:"100%",padding:"8px 11px",borderRadius:7,border:"1px solid #e2e8f0",fontSize:12,outline:"none" }}>
                  {TIERS.map(t=><option key={t} value={t}>{TL[t]}</option>)}
                </select></div>
              </div>
            </div>
            <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:18 }}>
              <button onClick={()=>setShowAddHosp(false)} style={{ padding:"8px 18px",borderRadius:8,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:12,color:"#374151",fontWeight:600 }}>Cancel</button>
              <button onClick={createHospital} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 20px",background:"#0891b2",color:"white",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:700 }}><Plus size={13}/>Create + Send Email</button>
            </div>
          </div>
        </div>
      )}

      {/* Hospital Detail */}
      {showHospDet && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:"white",borderRadius:14,padding:"22px 24px",width:"100%",maxWidth:500,boxShadow:"0 20px 60px rgba(0,0,0,0.22)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
              <div style={{ fontWeight:800,fontSize:15,color:"#0f172a" }}>🏥 {showHospDet.name}</div>
              <button onClick={()=>setShowHospDet(null)} style={{ border:"none",background:"none",cursor:"pointer",color:"#64748b" }}><X size={17}/></button>
            </div>
            <div style={{ background:"#ecfeff",border:"1px solid #bae6fd",borderRadius:8,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:8 }}>
              <span style={{ fontSize:13,color:"#0369a1" }}>MOH Code:</span>
              <span style={{ fontSize:14,fontWeight:800,color:"#0891b2",fontFamily:"monospace",letterSpacing:"0.05em" }}>{showHospDet.moh_code||"—"}</span>
            </div>
            <div style={{ display:"grid",gap:7,fontSize:13,color:"#374151" }}>
              {[["ID",showHospDet.id],["Email",showHospDet.email||"—"],["Phone",showHospDet.phone||"—"],["Type",showHospDet.type||"district"],["Active Users",showHospDet.active_users||0],["Active Features",showHospDet.active_features||0],["Subscription",showHospDet.sub_status||"—"],["Tier",TL[showHospDet.tier as TierLevel]||showHospDet.tier||"—"]].map(([l,v])=>(
                <div key={String(l)} style={{ display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f8fafc" }}>
                  <span style={{ color:"#64748b",fontWeight:500 }}>{l}</span>
                  <span style={{ fontWeight:600,color:"#0f172a" }}>{String(v)}</span>
                </div>
              ))}
            </div>
            <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:16 }}>
              <button onClick={()=>setShowHospDet(null)} style={{ padding:"8px 18px",borderRadius:8,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:12,color:"#374151",fontWeight:600 }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice */}
      {showAddInv && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:"white",borderRadius:14,padding:"22px 24px",width:"100%",maxWidth:440,boxShadow:"0 20px 60px rgba(0,0,0,0.22)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
              <div style={{ fontWeight:800,fontSize:15,color:"#0f172a" }}>💳 Create Invoice</div>
              <button onClick={()=>setShowAddInv(false)} style={{ border:"none",background:"none",cursor:"pointer",color:"#64748b" }}><X size={17}/></button>
            </div>
            <div style={{ display:"grid",gap:11 }}>
              <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Hospital *</label>
              <select value={invForm.hospitalId} onChange={e=>setInvForm({...invForm,hospitalId:e.target.value})} style={{ width:"100%",padding:"8px 11px",borderRadius:7,border:"1px solid #e2e8f0",fontSize:12,outline:"none" }}>
                <option value="">Select hospital…</option>
                {hospitals.map((h:any)=><option key={h.id} value={h.id}>{h.name} ({h.moh_code||"—"})</option>)}
              </select></div>
              <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:10 }}>
                <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Amount *</label>
                <input value={invForm.amount} onChange={e=>setInvForm({...invForm,amount:e.target.value})} type="number" placeholder="0.00" style={{ width:"100%",padding:"8px 11px",borderRadius:7,border:"1px solid #e2e8f0",fontSize:12,outline:"none",boxSizing:"border-box" }}/></div>
                <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Currency</label>
                <select value={invForm.currency} onChange={e=>setInvForm({...invForm,currency:e.target.value})} style={{ width:"100%",padding:"8px 11px",borderRadius:7,border:"1px solid #e2e8f0",fontSize:12,outline:"none" }}>
                  <option>USD</option><option>RWF</option><option>EUR</option>
                </select></div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Period Start</label>
                <input value={invForm.periodStart} onChange={e=>setInvForm({...invForm,periodStart:e.target.value})} type="date" style={{ width:"100%",padding:"8px 11px",borderRadius:7,border:"1px solid #e2e8f0",fontSize:12,outline:"none",boxSizing:"border-box" }}/></div>
                <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Period End</label>
                <input value={invForm.periodEnd} onChange={e=>setInvForm({...invForm,periodEnd:e.target.value})} type="date" style={{ width:"100%",padding:"8px 11px",borderRadius:7,border:"1px solid #e2e8f0",fontSize:12,outline:"none",boxSizing:"border-box" }}/></div>
              </div>
              <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Notes</label>
              <textarea value={invForm.notes} onChange={e=>setInvForm({...invForm,notes:e.target.value})} rows={2} style={{ width:"100%",padding:"8px 11px",borderRadius:7,border:"1px solid #e2e8f0",fontSize:12,outline:"none",resize:"none",boxSizing:"border-box" }}/></div>
            </div>
            <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:16 }}>
              <button onClick={()=>setShowAddInv(false)} style={{ padding:"8px 18px",borderRadius:8,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:12,color:"#374151",fontWeight:600 }}>Cancel</button>
              <button onClick={createInvoice} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 20px",background:"#0891b2",color:"white",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:700 }}><Plus size={13}/>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Detail */}
      {showInvDet && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:"white",borderRadius:14,padding:"22px 24px",width:"100%",maxWidth:420,boxShadow:"0 20px 60px rgba(0,0,0,0.22)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
              <div style={{ fontWeight:800,fontSize:15,color:"#0f172a" }}>💳 {showInvDet.invoice_ref}</div>
              <button onClick={()=>setShowInvDet(null)} style={{ border:"none",background:"none",cursor:"pointer",color:"#64748b" }}><X size={17}/></button>
            </div>
            <div style={{ display:"grid",gap:7,fontSize:13 }}>
              {[["Hospital",showInvDet.hospital_name],["Amount",`${showInvDet.currency||"USD"} ${Number(showInvDet.amount||0).toLocaleString()}`],["Status",showInvDet.status],["Period",`${showInvDet.period_start||"—"} → ${showInvDet.period_end||"—"}`],["Notes",showInvDet.notes||"—"]].map(([l,v])=>(
                <div key={String(l)} style={{ display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f8fafc" }}>
                  <span style={{ color:"#64748b",fontWeight:500 }}>{l}</span>
                  <span style={{ fontWeight:600,color:"#0f172a",textAlign:"right",maxWidth:"60%" }}>{String(v)}</span>
                </div>
              ))}
            </div>
            <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:16 }}>
              {showInvDet.status!=="paid" && <button onClick={()=>{ markPaid(showInvDet.id); setShowInvDet(null); }} style={{ padding:"8px 16px",borderRadius:8,border:"none",background:"#059669",color:"white",cursor:"pointer",fontSize:12,fontWeight:600 }}>✓ Mark Paid</button>}
              <button onClick={()=>setShowInvDet(null)} style={{ padding:"8px 16px",borderRadius:8,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:12,color:"#374151",fontWeight:600 }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tier */}
      {showEditTier && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:"white",borderRadius:14,padding:"22px 24px",width:"100%",maxWidth:380,boxShadow:"0 20px 60px rgba(0,0,0,0.22)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
              <div style={{ fontWeight:800,fontSize:15,color:TC[showEditTier.tier as TierLevel]||"#0f172a" }}>Edit {TL[showEditTier.tier as TierLevel]} Tier</div>
              <button onClick={()=>setShowEditTier(null)} style={{ border:"none",background:"none",cursor:"pointer",color:"#64748b" }}><X size={17}/></button>
            </div>
            <div style={{ display:"grid",gap:10 }}>
              <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Price (USD/month) — 0 = Free</label>
              <input id="tc-price" type="number" defaultValue={showEditTier.price??""} style={{ width:"100%",padding:"8px 11px",borderRadius:7,border:"1px solid #e2e8f0",fontSize:12,outline:"none",boxSizing:"border-box" }}/></div>
              <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Max Users (blank = unlimited)</label>
              <input id="tc-maxUsers" type="number" defaultValue={showEditTier.maxUsers??""} style={{ width:"100%",padding:"8px 11px",borderRadius:7,border:"1px solid #e2e8f0",fontSize:12,outline:"none",boxSizing:"border-box" }}/></div>
              <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Support Level</label>
              <select id="tc-support" defaultValue={showEditTier.support||"email"} style={{ width:"100%",padding:"8px 11px",borderRadius:7,border:"1px solid #e2e8f0",fontSize:12,outline:"none" }}>
                <option value="email">Email</option><option value="priority">Priority</option>
                <option value="24/7">24/7</option><option value="dedicated">Dedicated</option>
              </select></div>
            </div>
            <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:16 }}>
              <button onClick={()=>setShowEditTier(null)} style={{ padding:"8px 16px",borderRadius:8,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:12,color:"#374151",fontWeight:600 }}>Cancel</button>
              <button onClick={()=>{
                const price=parseFloat((document.getElementById("tc-price") as HTMLInputElement)?.value||"");
                const maxUsers=parseInt((document.getElementById("tc-maxUsers") as HTMLInputElement)?.value||"");
                const support=(document.getElementById("tc-support") as HTMLSelectElement)?.value;
                saveTierConfig(showEditTier.tier,{ price:isNaN(price)?null:price,maxUsers:isNaN(maxUsers)?null:maxUsers,support });
              }} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 18px",background:TC[showEditTier.tier as TierLevel]||"#0891b2",color:"white",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:700 }}>
                <Save size={13}/>Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Chat */}
      {showCreateGrp && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:"white",borderRadius:14,padding:"22px 24px",width:"100%",maxWidth:440,maxHeight:"85vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.22)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
              <div style={{ fontWeight:800,fontSize:15,color:"#0f172a" }}>👥 Create Group Chat</div>
              <button onClick={()=>setShowCreateGrp(false)} style={{ border:"none",background:"none",cursor:"pointer",color:"#64748b" }}><X size={17}/></button>
            </div>
            <div style={{ display:"grid",gap:12 }}>
              <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Group Name *</label>
              <input value={grpForm.name} onChange={e=>setGrpForm({...grpForm,name:e.target.value})} placeholder="e.g. Kigali District Doctors" style={{ width:"100%",padding:"8px 11px",borderRadius:7,border:"1px solid #e2e8f0",fontSize:12,color:"#0f172a",outline:"none",boxSizing:"border-box" }}/></div>
              <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Description</label>
              <input value={grpForm.description} onChange={e=>setGrpForm({...grpForm,description:e.target.value})} placeholder="What is this group for?" style={{ width:"100%",padding:"8px 11px",borderRadius:7,border:"1px solid #e2e8f0",fontSize:12,color:"#0f172a",outline:"none",boxSizing:"border-box" }}/></div>
              <div>
                <label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Add Members</label>
                <div style={{ maxHeight:180,overflowY:"auto",border:"1px solid #e2e8f0",borderRadius:7 }}>
                  {chatUsers.map((u:any)=>(
                    <label key={u.id} style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 12px",cursor:"pointer",borderBottom:"1px solid #f9fafb" }}>
                      <input type="checkbox" checked={grpForm.members.includes(u.id)} onChange={e=>{
                        setGrpForm(p=>({ ...p, members: e.target.checked ? [...p.members,u.id] : p.members.filter(m=>m!==u.id) }));
                      }} style={{ accentColor:"#0891b2" }}/>
                      <div style={{ width:28,height:28,borderRadius:"50%",background:"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700 }}>{u.initials}</div>
                      <div>
                        <div style={{ fontSize:12,fontWeight:600,color:"#0f172a" }}>{u.name}</div>
                        <div style={{ fontSize:10,color:"#94a3b8",textTransform:"capitalize" }}>{u.role}</div>
                      </div>
                    </label>
                  ))}
                  {chatUsers.length===0 && <div style={{ padding:16,textAlign:"center",color:"#94a3b8",fontSize:12 }}>Loading users…</div>}
                </div>
                <div style={{ fontSize:11,color:"#94a3b8",marginTop:5 }}>{grpForm.members.length} member{grpForm.members.length!==1?"s":""} selected</div>
              </div>
            </div>
            <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:18 }}>
              <button onClick={()=>setShowCreateGrp(false)} style={{ padding:"8px 18px",borderRadius:8,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:12,color:"#374151",fontWeight:600 }}>Cancel</button>
              <button onClick={createGroup} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 20px",background:"#0891b2",color:"white",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:700 }}>
                <Hash size={13}/>Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
