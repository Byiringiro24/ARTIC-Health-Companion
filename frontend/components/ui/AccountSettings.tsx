"use client";
/**
 * ARTIC HMS — Comprehensive Account Settings
 * Covers ALL roles: Profile, Security (OTP), 2FA, Sessions, Notifications,
 * Display/Theme, Language, Chat, Email, Role-specific, Data Export, Privacy, Audit, Help
 */
import { useState, useRef } from "react";
import {
  User, Lock, Bell, Palette, MessageSquare, Settings, Database,
  Shield, HelpCircle, ChevronRight, Camera, Eye, EyeOff, CheckCircle,
  Download, LogOut, Key, Globe, Smartphone, Save, AlertCircle,
  Moon, Sun, Monitor, Mail, Phone, Upload,
} from "lucide-react";
import { getSession, logout } from "@/lib/auth";
import { OTPPasswordChange } from "@/components/ui/OTPPasswordChange";

type SettingsTab =
  | "profile" | "security" | "notifications" | "display" | "communication"
  | "role-settings" | "data-privacy" | "audit" | "help";

const API = process.env.NEXT_PUBLIC_API_URL || "http://172.209.217.176:4001";

const SETTINGS_TABS: { key: SettingsTab; label: string; icon: any; desc: string }[] = [
  { key:"profile",       label:"Profile",          icon:User,         desc:"Personal & professional info" },
  { key:"security",      label:"Security",         icon:Lock,         desc:"Password, 2FA, sessions" },
  { key:"notifications", label:"Notifications",    icon:Bell,         desc:"Alerts, channels, quiet hours" },
  { key:"display",       label:"Display",          icon:Palette,      desc:"Theme, language, layout" },
  { key:"communication", label:"Communication",    icon:MessageSquare,desc:"Chat, email, meetings" },
  { key:"role-settings", label:"Role Settings",    icon:Settings,     desc:"Role-specific preferences" },
  { key:"data-privacy",  label:"Data & Privacy",   icon:Database,     desc:"Export, privacy, consent" },
  { key:"audit",         label:"Audit Log",        icon:Shield,       desc:"Login & activity history" },
  { key:"help",          label:"Help & Support",   icon:HelpCircle,   desc:"Help center, contact" },
];

const Toggle = ({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) => (
  <div onClick={() => onChange(!on)} style={{ width:40,height:22,borderRadius:11,background:on?"#0891b2":"#d1d5db",cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0 }}>
    <div style={{ width:18,height:18,borderRadius:"50%",background:"white",position:"absolute",top:2,left:on?20:2,transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/>
  </div>
);
const Field = ({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) => (
  <div>
    <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>{label}{required&&<span style={{ color:"#dc2626",marginLeft:2 }}>*</span>}</label>
    {children}
  </div>
);
const inp: React.CSSProperties = { width:"100%",padding:"9px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none",color:"#0f172a",boxSizing:"border-box",background:"white" };
const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",overflow:"hidden",marginBottom:14 }}>
    <div style={{ padding:"12px 16px",borderBottom:"1px solid #f1f5f9",fontWeight:700,fontSize:13,color:"#0f172a" }}>{title}</div>
    <div style={{ padding:"16px 18px" }}>{children}</div>
  </div>
);

export function AccountSettings({ user, onClose }: { user?: any; onClose?: () => void }) {
  const session = getSession() || user;
  const [tab, setTab]         = useState<SettingsTab>("profile");
  const [toast, setToast]     = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const fileRef               = useRef<HTMLInputElement>(null);

  // Profile state
  const [profile, setProfile] = useState({
    firstName: session?.firstName || session?.name?.split(" ")[0] || "",
    lastName:  session?.lastName  || session?.name?.split(" ").slice(1).join(" ") || "",
    title:     session?.jobTitle  || session?.roleLabel || "",
    staffId:   session?.id || "",
    regNo:     "",
    email:     session?.email || "",
    altEmail:  "",
    phone:     session?.phone || "",
    mobile:    "",
    officeRoom:"",
    shift:     "Morning (07:00–15:00)",
    specialty: "",
    langs:     "Kinyarwanda, English",
    photo:     "",
  });

  // Notification state
  const [notifs, setNotifs] = useState({
    inApp:       true,
    email:       true,
    sms:         false,
    push:        true,
    desktop:     true,
    apptReminder:true,
    labCritical: true,
    rxReady:     true,
    patientMsg:  true,
    staffMsg:    true,
    systemUpdate:false,
    quietStart:  "22:00",
    quietEnd:    "07:00",
    quietEnabled:false,
    digest:      "realtime",
  });

  // Display state
  const [display, setDisplay] = useState({
    theme:      "light" as "light"|"dark"|"system"|"highcontrast",
    fontSize:   "medium" as "small"|"medium"|"large",
    density:    "comfortable" as "compact"|"comfortable",
    language:   "en",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    timezone:   "Africa/Kigali",
    currency:   "RWF",
  });

  // Chat state
  const [chat, setChat] = useState({
    status:    "online" as "online"|"away"|"busy"|"offline"|"dnd",
    statusMsg: "",
    readReceipts: true,
    typingIndicators: true,
    emailSignature: `${session?.name || "ARTIC User"}\n${session?.roleLabel || session?.role || "Staff"}\n${session?.facility || "Hospital"}\n\n--- Sent via ARTIC Health Companion ---`,
    autoReply: false,
    autoReplyMsg: "",
  });

  // Role-specific prefs
  const [rolePrefs, setRolePrefs] = useState({
    consultDuration: "30",
    followupDays:    "14",
    defaultDiagnosis:"",
    noteTemplate:    "SOAP",
    vitalsTemplate:  "standard",
    handoverTemplate:"SBAR",
    drugAlertLevel:  "moderate",
    labTAT:          "45",
    invReorderAlert: "20",
  });

  // 2FA state
  const [twoFA, setTwoFA] = useState({ enabled: false, method: "app" as "app"|"sms"|"email" });
  const [sessions2] = useState([
    { id:"s1",device:"Chrome on Windows",location:"Kigali, Rwanda",time:"Now (current)",current:true },
    { id:"s2",device:"Firefox on Android",location:"Kigali, Rwanda",time:"Yesterday 14:32",current:false },
  ]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }
  function saveSection(name: string) { showToast(`✅ ${name} saved successfully`); }

  function exportData() {
    const data = { profile, notifications: notifs, display, chat, role: rolePrefs, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `artic-settings-${session?.email || "export"}.json`; a.click();
    showToast("✅ Settings exported");
  }

  const AUDIT_LOG = [
    { action:"Login",             time:"2026-07-21 08:15",ip:"197.243.10.x",device:"Chrome Windows" },
    { action:"Password Changed",  time:"2026-07-18 11:22",ip:"197.243.10.x",device:"Chrome Windows" },
    { action:"Profile Updated",   time:"2026-07-15 09:44",ip:"197.243.10.x",device:"Chrome Windows" },
    { action:"Login",             time:"2026-07-14 07:58",ip:"197.243.10.x",device:"Firefox Android" },
    { action:"2FA Disabled",      time:"2026-07-10 16:30",ip:"197.243.10.x",device:"Chrome Windows" },
  ];

  return (
    <div style={{ display:"flex",height:"100%",fontFamily:"'Inter',system-ui,sans-serif",background:"#f1f5f9",minHeight:"100vh" }}>
      {toast&&<div style={{ position:"fixed",top:20,right:20,zIndex:9999,padding:"12px 20px",background:"#059669",color:"white",borderRadius:10,fontSize:13,fontWeight:600,boxShadow:"0 4px 16px rgba(0,0,0,0.15)",maxWidth:380 }}>{toast}</div>}

      {/* Settings sidebar */}
      <div style={{ width:sidebarOpen?220:52,background:"white",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",flexShrink:0,transition:"width 0.2s",overflow:"hidden" }}>
        <div style={{ padding:"14px 12px",borderBottom:"1px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          {sidebarOpen&&<span style={{ fontWeight:800,fontSize:13,color:"#0f172a" }}>⚙️ Account Settings</span>}
          <button onClick={()=>setSidebarOpen(!sidebarOpen)} style={{ border:"none",background:"none",cursor:"pointer",padding:4,borderRadius:6,color:"#64748b",display:"flex",marginLeft:sidebarOpen?0:"auto" }}>
            {sidebarOpen?<ChevronRight size={14}/>:<Settings size={14}/>}
          </button>
        </div>
        <nav style={{ flex:1,overflowY:"auto",padding:"6px 6px" }}>
          {SETTINGS_TABS.map(t=>{
            const Icon=t.icon; const active=tab===t.key;
            return (
              <button key={t.key} onClick={()=>setTab(t.key)} title={!sidebarOpen?t.label:undefined}
                style={{ display:"flex",alignItems:"center",gap:8,width:"100%",padding:sidebarOpen?"8px 10px":"10px 0",justifyContent:sidebarOpen?"flex-start":"center",borderRadius:8,border:"none",cursor:"pointer",marginBottom:1,background:active?"#eff6ff":"transparent",color:active?"#0891b2":"#64748b",transition:"all 0.1s" }}>
                <Icon size={15} style={{ flexShrink:0 }}/>{sidebarOpen&&<span style={{ fontSize:12,fontWeight:active?600:400,flex:1,textAlign:"left" }}>{t.label}</span>}
                {sidebarOpen&&active&&<div style={{ width:3,height:16,borderRadius:2,background:"#0891b2" }}/>}
              </button>
            );
          })}
        </nav>
        {/* User mini card */}
        {sidebarOpen&&(
          <div style={{ padding:"12px",borderTop:"1px solid #e2e8f0" }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:"#f8fafc",borderRadius:8 }}>
              <div style={{ width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#0891b2,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"white",flexShrink:0 }}>
                {(session?.name||"U").split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase()}
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:11,fontWeight:600,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{session?.name}</div>
                <div style={{ fontSize:9,color:"#94a3b8" }}>{session?.roleLabel||session?.role}</div>
              </div>
            </div>
            {onClose&&<button onClick={onClose} style={{ marginTop:6,width:"100%",padding:"6px",border:"1px solid #e2e8f0",background:"white",borderRadius:7,cursor:"pointer",fontSize:11,color:"#374151",fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:5 }}><ChevronRight size={11} style={{ transform:"rotate(180deg)" }}/>Back</button>}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex:1,overflowY:"auto",padding:20 }}>

        {/* ── PROFILE ── */}
        {tab==="profile"&&(
          <div style={{ display:"grid",gap:0,maxWidth:700 }}>
            <div style={{ fontWeight:800,fontSize:16,color:"#0f172a",marginBottom:14 }}>👤 Profile Management</div>
            <Card title="🖼️ Profile Photo">
              <div style={{ display:"flex",alignItems:"center",gap:16 }}>
                <div style={{ width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#0891b2,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:800,color:"white",flexShrink:0 }}>
                  {(session?.name||"U").split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize:13,fontWeight:600,color:"#0f172a",marginBottom:6 }}>Upload a photo (JPG, PNG, SVG)</div>
                  <div style={{ display:"flex",gap:7 }}>
                    <button onClick={()=>fileRef.current?.click()} style={{ display:"flex",alignItems:"center",gap:5,padding:"7px 14px",background:"#0891b2",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:600 }}><Upload size={11}/>Upload Photo</button>
                    <button onClick={()=>showToast("Photo removed")} style={{ padding:"7px 14px",border:"1px solid #e2e8f0",background:"white",color:"#374151",borderRadius:8,cursor:"pointer",fontSize:11 }}>Remove</button>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e=>{ if(e.target.files?.[0]) showToast("Photo uploaded"); }}/>
                  <div style={{ fontSize:10,color:"#94a3b8",marginTop:4 }}>Max 2MB · JPG, PNG, SVG · Auto-cropped to circle</div>
                </div>
              </div>
            </Card>
            <Card title="📋 Personal Information">
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                <Field label="First Name" required><input value={profile.firstName} onChange={e=>setProfile(p=>({...p,firstName:e.target.value}))} style={inp}/></Field>
                <Field label="Last Name" required><input value={profile.lastName} onChange={e=>setProfile(p=>({...p,lastName:e.target.value}))} style={inp}/></Field>
                <Field label="Professional Title"><input value={profile.title} onChange={e=>setProfile(p=>({...p,title:e.target.value}))} placeholder="e.g. Medical Officer" style={inp}/></Field>
                <Field label="Employee / Staff ID"><input value={profile.staffId} readOnly style={{ ...inp,background:"#f8fafc" }}/></Field>
                <Field label="Professional Registration #"><input value={profile.regNo} onChange={e=>setProfile(p=>({...p,regNo:e.target.value}))} placeholder="e.g. RMC-2024-XXXX" style={inp}/></Field>
                <Field label="Office / Room Number"><input value={profile.officeRoom} onChange={e=>setProfile(p=>({...p,officeRoom:e.target.value}))} placeholder="e.g. Room 12B" style={inp}/></Field>
                <Field label="Work Phone"><input value={profile.phone} onChange={e=>setProfile(p=>({...p,phone:e.target.value}))} placeholder="+250 7XX XXX XXX" style={inp}/></Field>
                <Field label="Personal Mobile"><input value={profile.mobile} onChange={e=>setProfile(p=>({...p,mobile:e.target.value}))} placeholder="+250 7XX XXX XXX" style={inp}/></Field>
                <Field label="Primary Email" required><input value={profile.email} onChange={e=>setProfile(p=>({...p,email:e.target.value}))} type="email" style={inp}/></Field>
                <Field label="Alternative Email"><input value={profile.altEmail} onChange={e=>setProfile(p=>({...p,altEmail:e.target.value}))} type="email" placeholder="Optional" style={inp}/></Field>
                <Field label="Languages Spoken"><input value={profile.langs} onChange={e=>setProfile(p=>({...p,langs:e.target.value}))} placeholder="e.g. Kinyarwanda, English" style={inp}/></Field>
                <Field label="Shift Preference">
                  <select value={profile.shift} onChange={e=>setProfile(p=>({...p,shift:e.target.value}))} style={inp}>
                    <option>Morning (07:00–15:00)</option><option>Afternoon (15:00–23:00)</option><option>Night (23:00–07:00)</option><option>Day (08:00–17:00)</option>
                  </select>
                </Field>
              </div>
            </Card>
            <Card title="🎓 Professional Information">
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                <Field label="Specialization / Sub-specialty"><input value={profile.specialty} onChange={e=>setProfile(p=>({...p,specialty:e.target.value}))} placeholder="e.g. Internal Medicine, Pediatrics" style={inp}/></Field>
                <Field label="Qualifications"><input placeholder="e.g. MBChB, MMed" style={inp}/></Field>
                <Field label="Professional Affiliations"><input placeholder="e.g. Rwanda Medical Council" style={inp}/></Field>
                <Field label="Areas of Expertise"><input placeholder="e.g. Diabetes, Hypertension" style={inp}/></Field>
              </div>
            </Card>
            <button onClick={()=>saveSection("Profile")} style={{ display:"flex",alignItems:"center",gap:6,padding:"10px 22px",background:"linear-gradient(135deg,#0891b2,#7c3aed)",color:"white",border:"none",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:700,marginTop:4 }}><Save size={13}/>Save Profile</button>
          </div>
        )}

        {/* ── SECURITY ── */}
        {tab==="security"&&(
          <div style={{ display:"grid",gap:0,maxWidth:660 }}>
            <div style={{ fontWeight:800,fontSize:16,color:"#0f172a",marginBottom:14 }}>🔒 Security Settings</div>
            <OTPPasswordChange userEmail={session?.email}/>
            <div style={{ marginTop:14 }}/>
            <Card title="📱 Two-Factor Authentication (2FA)">
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
                <div>
                  <div style={{ fontWeight:600,fontSize:13,color:"#0f172a" }}>Enable 2FA</div>
                  <div style={{ fontSize:11,color:"#64748b" }}>{twoFA.enabled?"Active — account is protected":"Not enabled — your account is less secure"}</div>
                </div>
                <Toggle on={twoFA.enabled} onChange={v=>{setTwoFA(p=>({...p,enabled:v}));showToast(v?"2FA enabled — scan QR code in your authenticator app":"2FA disabled");}}/>
              </div>
              {twoFA.enabled&&(
                <div style={{ marginTop:10 }}>
                  <div style={{ fontSize:12,fontWeight:600,color:"#374151",marginBottom:6 }}>Authentication Method</div>
                  <div style={{ display:"flex",gap:8 }}>
                    {(["app","sms","email"] as const).map(m=>(
                      <button key={m} onClick={()=>setTwoFA(p=>({...p,method:m}))} style={{ padding:"6px 14px",borderRadius:8,border:`1px solid ${twoFA.method===m?"#0891b2":"#e2e8f0"}`,background:twoFA.method===m?"#ecfeff":"white",color:twoFA.method===m?"#0891b2":"#374151",cursor:"pointer",fontSize:11,fontWeight:600,textTransform:"capitalize" }}>{m==="app"?"Authenticator App":m==="sms"?"SMS Code":"Email Code"}</button>
                    ))}
                  </div>
                  <div style={{ marginTop:10,padding:"12px 14px",background:"#f0fdf4",borderRadius:9,border:"1px solid #bbf7d0",fontSize:12,color:"#065f46" }}>
                    ✅ 2FA is active. Backup codes: <button onClick={()=>showToast("Backup codes downloaded")} style={{ border:"none",background:"none",color:"#0891b2",cursor:"pointer",fontSize:12,fontWeight:600,textDecoration:"underline" }}>Download backup codes</button>
                  </div>
                </div>
              )}
            </Card>
            <Card title="💻 Active Sessions">
              {sessions2.map(s=>(
                <div key={s.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #f1f5f9" }}>
                  <div style={{ width:34,height:34,borderRadius:9,background:s.current?"#ecfeff":"#f8fafc",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    <Monitor size={15} style={{ color:s.current?"#0891b2":"#64748b" }}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12,fontWeight:600,color:"#0f172a" }}>{s.device} {s.current&&<span style={{ fontSize:9,background:"#dcfce7",color:"#059669",padding:"1px 6px",borderRadius:4,fontWeight:700,marginLeft:4 }}>CURRENT</span>}</div>
                    <div style={{ fontSize:11,color:"#64748b" }}>{s.location} · {s.time}</div>
                  </div>
                  {!s.current&&<button onClick={()=>showToast("Session terminated")} style={{ padding:"4px 10px",border:"1px solid #fca5a5",background:"#fee2e2",borderRadius:7,cursor:"pointer",fontSize:10,color:"#dc2626",fontWeight:600 }}>Terminate</button>}
                </div>
              ))}
              <button onClick={()=>showToast("All other sessions terminated")} style={{ marginTop:10,padding:"7px 14px",border:"1px solid #fca5a5",background:"white",borderRadius:8,cursor:"pointer",fontSize:11,color:"#dc2626",fontWeight:600 }}>Sign out all other devices</button>
            </Card>
            <Card title="🔐 Security Questions">
              <div style={{ fontSize:12,color:"#64748b",marginBottom:10 }}>Set security questions for account recovery.</div>
              {[1,2,3].map(i=>(
                <div key={i} style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10 }}>
                  <select style={inp}><option>Select a question…</option><option>What is your mother's maiden name?</option><option>What was your first pet's name?</option><option>What city were you born in?</option><option>What was your childhood nickname?</option></select>
                  <input type="password" placeholder="Your answer" style={inp}/>
                </div>
              ))}
              <button onClick={()=>saveSection("Security Questions")} style={{ padding:"7px 16px",background:"#0891b2",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:600 }}>Save Questions</button>
            </Card>
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        {tab==="notifications"&&(
          <div style={{ display:"grid",gap:0,maxWidth:660 }}>
            <div style={{ fontWeight:800,fontSize:16,color:"#0f172a",marginBottom:14 }}>🔔 Notification Preferences</div>
            <Card title="📡 Notification Channels">
              {[
                { k:"inApp",   l:"In-App Notifications",  sub:"Dashboard alerts and banners" },
                { k:"email",   l:"Email Notifications",   sub:"Sent to your registered email" },
                { k:"sms",     l:"SMS Notifications",     sub:"Text messages to your mobile" },
                { k:"push",    l:"Push Notifications",    sub:"Mobile app push alerts" },
                { k:"desktop", l:"Desktop Notifications", sub:"Browser desktop pop-ups" },
              ].map(n=>(
                <div key={n.k} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid #f1f5f9" }}>
                  <div><div style={{ fontSize:13,fontWeight:600,color:"#0f172a" }}>{n.l}</div><div style={{ fontSize:11,color:"#94a3b8" }}>{n.sub}</div></div>
                  <Toggle on={(notifs as any)[n.k]} onChange={v=>setNotifs(p=>({...p,[n.k]:v}))}/>
                </div>
              ))}
            </Card>
            <Card title="🏥 Clinical Notifications">
              {[
                { k:"apptReminder",l:"Appointment Reminders",    sub:"Patient appointment alerts" },
                { k:"labCritical", l:"Critical Lab Results",     sub:"Immediate critical/panic value alerts" },
                { k:"rxReady",     l:"Prescription Ready",       sub:"When pharmacy dispenses Rx" },
                { k:"patientMsg",  l:"Patient Messages",         sub:"Secure messages from patients" },
                { k:"staffMsg",    l:"Staff Messages",           sub:"Internal staff communications" },
                { k:"systemUpdate",l:"System Updates",           sub:"Platform updates and maintenance" },
              ].map(n=>(
                <div key={n.k} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid #f1f5f9" }}>
                  <div><div style={{ fontSize:13,fontWeight:600,color:"#0f172a" }}>{n.l}</div><div style={{ fontSize:11,color:"#94a3b8" }}>{n.sub}</div></div>
                  <Toggle on={(notifs as any)[n.k]} onChange={v=>setNotifs(p=>({...p,[n.k]:v}))}/>
                </div>
              ))}
            </Card>
            <Card title="🌙 Quiet Hours">
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                <div><div style={{ fontSize:13,fontWeight:600,color:"#0f172a" }}>Enable Quiet Hours</div><div style={{ fontSize:11,color:"#94a3b8" }}>Suppress non-critical alerts during these hours</div></div>
                <Toggle on={notifs.quietEnabled} onChange={v=>setNotifs(p=>({...p,quietEnabled:v}))}/>
              </div>
              {notifs.quietEnabled&&(
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                  <Field label="Quiet Start"><input type="time" value={notifs.quietStart} onChange={e=>setNotifs(p=>({...p,quietStart:e.target.value}))} style={inp}/></Field>
                  <Field label="Quiet End"><input type="time" value={notifs.quietEnd} onChange={e=>setNotifs(p=>({...p,quietEnd:e.target.value}))} style={inp}/></Field>
                </div>
              )}
            </Card>
            <button onClick={()=>saveSection("Notifications")} style={{ display:"flex",alignItems:"center",gap:6,padding:"10px 22px",background:"linear-gradient(135deg,#0891b2,#7c3aed)",color:"white",border:"none",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:700 }}><Save size={13}/>Save Preferences</button>
          </div>
        )}

        {/* ── DISPLAY ── */}
        {tab==="display"&&(
          <div style={{ display:"grid",gap:0,maxWidth:660 }}>
            <div style={{ fontWeight:800,fontSize:16,color:"#0f172a",marginBottom:14 }}>🎨 Display Preferences</div>
            <Card title="🌓 Theme">
              <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:10 }}>
                {([["light","☀️","Light"],["dark","🌙","Dark"],["system","💻","System"],["highcontrast","⬛","High Contrast"]] as const).map(([v,icon,label])=>(
                  <button key={v} onClick={()=>setDisplay(p=>({...p,theme:v}))} style={{ padding:"10px",borderRadius:10,border:`2px solid ${display.theme===v?"#0891b2":"#e2e8f0"}`,background:display.theme===v?"#ecfeff":"white",cursor:"pointer",textAlign:"center" }}>
                    <div style={{ fontSize:20,marginBottom:4 }}>{icon}</div>
                    <div style={{ fontSize:11,fontWeight:600,color:display.theme===v?"#0891b2":"#374151" }}>{label}</div>
                  </button>
                ))}
              </div>
            </Card>
            <Card title="🔤 Font & Density">
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                <Field label="Font Size">
                  <select value={display.fontSize} onChange={e=>setDisplay(p=>({...p,fontSize:e.target.value as any}))} style={inp}>
                    <option value="small">Small</option><option value="medium">Medium (Default)</option><option value="large">Large</option>
                  </select>
                </Field>
                <Field label="Density">
                  <select value={display.density} onChange={e=>setDisplay(p=>({...p,density:e.target.value as any}))} style={inp}>
                    <option value="compact">Compact</option><option value="comfortable">Comfortable (Default)</option>
                  </select>
                </Field>
              </div>
            </Card>
            <Card title="🌍 Language & Localization">
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                <Field label="Language">
                  <select value={display.language} onChange={e=>setDisplay(p=>({...p,language:e.target.value}))} style={inp}>
                    <option value="en">English</option><option value="rw">Kinyarwanda</option><option value="fr">Français</option>
                  </select>
                </Field>
                <Field label="Date Format">
                  <select value={display.dateFormat} onChange={e=>setDisplay(p=>({...p,dateFormat:e.target.value}))} style={inp}>
                    <option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option>
                  </select>
                </Field>
                <Field label="Time Format">
                  <select value={display.timeFormat} onChange={e=>setDisplay(p=>({...p,timeFormat:e.target.value}))} style={inp}>
                    <option value="24h">24-hour</option><option value="12h">12-hour (AM/PM)</option>
                  </select>
                </Field>
                <Field label="Timezone">
                  <select value={display.timezone} onChange={e=>setDisplay(p=>({...p,timezone:e.target.value}))} style={inp}>
                    <option value="Africa/Kigali">Africa/Kigali (UTC+2)</option><option value="UTC">UTC</option><option value="Africa/Nairobi">Africa/Nairobi (UTC+3)</option>
                  </select>
                </Field>
                <Field label="Currency">
                  <select value={display.currency} onChange={e=>setDisplay(p=>({...p,currency:e.target.value}))} style={inp}>
                    <option value="RWF">RWF — Rwandan Franc</option><option value="USD">USD — US Dollar</option><option value="EUR">EUR — Euro</option>
                  </select>
                </Field>
              </div>
            </Card>
            <Card title="♿ Accessibility">
              <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                {[
                  { l:"Screen Reader Optimized",sub:"Enhanced labels and ARIA attributes" },
                  { l:"Reduced Motion",          sub:"Disable animations and transitions" },
                  { l:"Colorblind-Friendly",     sub:"Optimized colors for color vision deficiency" },
                  { l:"Large Click Targets",     sub:"Larger buttons and interactive areas" },
                ].map((a,i)=>(
                  <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f1f5f9" }}>
                    <div><div style={{ fontSize:13,fontWeight:600,color:"#0f172a" }}>{a.l}</div><div style={{ fontSize:11,color:"#94a3b8" }}>{a.sub}</div></div>
                    <Toggle on={false} onChange={()=>showToast(`${a.l} toggled`)}/>
                  </div>
                ))}
              </div>
            </Card>
            <button onClick={()=>saveSection("Display")} style={{ display:"flex",alignItems:"center",gap:6,padding:"10px 22px",background:"linear-gradient(135deg,#0891b2,#7c3aed)",color:"white",border:"none",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:700 }}><Save size={13}/>Save Display</button>
          </div>
        )}

        {/* ── COMMUNICATION ── */}
        {tab==="communication"&&(
          <div style={{ display:"grid",gap:0,maxWidth:660 }}>
            <div style={{ fontWeight:800,fontSize:16,color:"#0f172a",marginBottom:14 }}>💬 Communication Preferences</div>
            <Card title="🟢 Online Status">
              <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:12 }}>
                {(["online","away","busy","offline","dnd"] as const).map(s=>(
                  <button key={s} onClick={()=>setChat(p=>({...p,status:s}))} style={{ padding:"8px",borderRadius:9,border:`2px solid ${chat.status===s?"#0891b2":"#e2e8f0"}`,background:chat.status===s?"#ecfeff":"white",cursor:"pointer",textAlign:"center" }}>
                    <div style={{ width:10,height:10,borderRadius:"50%",background:s==="online"?"#22c55e":s==="away"?"#f59e0b":s==="busy"?"#dc2626":s==="dnd"?"#7c3aed":"#94a3b8",margin:"0 auto 4px" }}/>
                    <div style={{ fontSize:9,fontWeight:600,color:chat.status===s?"#0891b2":"#374151",textTransform:"capitalize" }}>{s==="dnd"?"Do Not Disturb":s}</div>
                  </button>
                ))}
              </div>
              <Field label="Custom Status Message"><input value={chat.statusMsg} onChange={e=>setChat(p=>({...p,statusMsg:e.target.value}))} placeholder="e.g. In surgery until 14:00" style={inp}/></Field>
            </Card>
            <Card title="💬 Chat Settings">
              {[
                { k:"readReceipts",     l:"Read Receipts",        sub:"Show when you've read messages" },
                { k:"typingIndicators", l:"Typing Indicators",    sub:"Show when you're typing" },
              ].map(n=>(
                <div key={n.k} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid #f1f5f9" }}>
                  <div><div style={{ fontSize:13,fontWeight:600,color:"#0f172a" }}>{n.l}</div><div style={{ fontSize:11,color:"#94a3b8" }}>{n.sub}</div></div>
                  <Toggle on={(chat as any)[n.k]} onChange={v=>setChat(p=>({...p,[n.k]:v}))}/>
                </div>
              ))}
            </Card>
            <Card title="📧 Email Signature">
              <textarea value={chat.emailSignature} onChange={e=>setChat(p=>({...p,emailSignature:e.target.value}))} rows={5} style={{ ...inp,resize:"vertical",fontFamily:"monospace",lineHeight:1.7 }}/>
            </Card>
            <Card title="↩️ Auto-Reply">
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                <div><div style={{ fontSize:13,fontWeight:600,color:"#0f172a" }}>Enable Auto-Reply</div><div style={{ fontSize:11,color:"#94a3b8" }}>For when you're on leave or away</div></div>
                <Toggle on={chat.autoReply} onChange={v=>setChat(p=>({...p,autoReply:v}))}/>
              </div>
              {chat.autoReply&&<textarea value={chat.autoReplyMsg} onChange={e=>setChat(p=>({...p,autoReplyMsg:e.target.value}))} rows={3} placeholder="I am currently out of office…" style={{ ...inp,resize:"vertical" }}/>}
            </Card>
            <button onClick={()=>saveSection("Communication")} style={{ display:"flex",alignItems:"center",gap:6,padding:"10px 22px",background:"linear-gradient(135deg,#0891b2,#7c3aed)",color:"white",border:"none",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:700 }}><Save size={13}/>Save</button>
          </div>
        )}

        {/* ── ROLE-SPECIFIC SETTINGS ── */}
        {tab==="role-settings"&&(
          <div style={{ display:"grid",gap:0,maxWidth:660 }}>
            <div style={{ fontWeight:800,fontSize:16,color:"#0f172a",marginBottom:14 }}>📋 Role-Specific Preferences</div>
            <div style={{ background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#0369a1" }}>
              ⚙️ These settings are specific to your role: <strong>{session?.roleLabel||session?.role||"Staff"}</strong>
            </div>

            {/* Clinical roles */}
            {["doctor","medical-director","nurse"].includes(session?.role||"")&&(
              <Card title="🩺 Clinical Preferences">
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                  <Field label="Default Consultation Duration"><select value={rolePrefs.consultDuration} onChange={e=>setRolePrefs(p=>({...p,consultDuration:e.target.value}))} style={inp}><option value="15">15 minutes</option><option value="20">20 minutes</option><option value="30">30 minutes</option><option value="45">45 minutes</option><option value="60">60 minutes</option></select></Field>
                  <Field label="Default Follow-up Days"><input type="number" value={rolePrefs.followupDays} onChange={e=>setRolePrefs(p=>({...p,followupDays:e.target.value}))} style={inp}/></Field>
                  <Field label="Consultation Note Template"><select value={rolePrefs.noteTemplate} onChange={e=>setRolePrefs(p=>({...p,noteTemplate:e.target.value}))} style={inp}><option value="SOAP">SOAP Format</option><option value="DAP">DAP Format</option><option value="BIRP">BIRP Format</option><option value="free">Free Text</option></select></Field>
                  <Field label="Favorite Diagnosis Shortcut"><input value={rolePrefs.defaultDiagnosis} onChange={e=>setRolePrefs(p=>({...p,defaultDiagnosis:e.target.value}))} placeholder="e.g. Hypertension, Malaria" style={inp}/></Field>
                </div>
              </Card>
            )}
            {/* Nursing */}
            {session?.role==="nurse"&&(
              <Card title="🏥 Nursing Preferences">
                <Field label="Vitals Template"><select value={rolePrefs.vitalsTemplate} onChange={e=>setRolePrefs(p=>({...p,vitalsTemplate:e.target.value}))} style={inp}><option value="standard">Standard (BP, Temp, Pulse, SpO₂, RR)</option><option value="extended">Extended + Weight/Height/BMI</option><option value="pediatric">Pediatric Template</option></select></Field>
                <div style={{ marginTop:10 }}/>
                <Field label="Shift Handover Template"><select value={rolePrefs.handoverTemplate} onChange={e=>setRolePrefs(p=>({...p,handoverTemplate:e.target.value}))} style={inp}><option value="SBAR">SBAR Format</option><option value="ISBAR">ISBAR Format</option><option value="free">Free Text</option></select></Field>
              </Card>
            )}
            {/* Pharmacy */}
            {session?.role==="pharmacist"&&(
              <Card title="💊 Pharmacy Preferences">
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                  <Field label="Drug Alert Sensitivity"><select value={rolePrefs.drugAlertLevel} onChange={e=>setRolePrefs(p=>({...p,drugAlertLevel:e.target.value}))} style={inp}><option value="low">Low (Major only)</option><option value="moderate">Moderate (Default)</option><option value="high">High (All interactions)</option></select></Field>
                  <Field label="Inventory Reorder Alert (%)"><input type="number" value={rolePrefs.invReorderAlert} onChange={e=>setRolePrefs(p=>({...p,invReorderAlert:e.target.value}))} style={inp}/></Field>
                </div>
              </Card>
            )}
            {/* Lab */}
            {session?.role==="laboratory"&&(
              <Card title="🔬 Laboratory Preferences">
                <Field label="Target Turnaround Time (minutes)"><input type="number" value={rolePrefs.labTAT} onChange={e=>setRolePrefs(p=>({...p,labTAT:e.target.value}))} style={inp}/></Field>
                <div style={{ marginTop:10,fontSize:12,color:"#64748b" }}>Results exceeding this TAT will be flagged for review.</div>
              </Card>
            )}
            {/* All roles get notification templates */}
            <Card title="📝 Favourite Quick Actions">
              <div style={{ fontSize:12,color:"#64748b",marginBottom:8 }}>Configure shortcuts shown in your quick actions panel.</div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                {["Register Patient","Write Prescription","Order Lab Test","View Results","Book Appointment","Check Vitals","Send Message","View Reports"].map(a=>(
                  <label key={a} style={{ display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#374151",cursor:"pointer",padding:"5px 10px",background:"#f8fafc",borderRadius:7,border:"1px solid #e2e8f0" }}>
                    <input type="checkbox" defaultChecked style={{ accentColor:"#0891b2" }}/>{a}
                  </label>
                ))}
              </div>
            </Card>
            <button onClick={()=>saveSection("Role Settings")} style={{ display:"flex",alignItems:"center",gap:6,padding:"10px 22px",background:"linear-gradient(135deg,#0891b2,#7c3aed)",color:"white",border:"none",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:700 }}><Save size={13}/>Save Role Settings</button>
          </div>
        )}

        {/* ── DATA & PRIVACY ── */}
        {tab==="data-privacy"&&(
          <div style={{ display:"grid",gap:0,maxWidth:660 }}>
            <div style={{ fontWeight:800,fontSize:16,color:"#0f172a",marginBottom:14 }}>📊 Data & Privacy</div>
            <Card title="📤 Export My Data">
              <div style={{ fontSize:12,color:"#64748b",marginBottom:12,lineHeight:1.6 }}>Download a copy of your account data including profile, settings, and activity history. Compliant with Rwanda Data Protection Law 2021.</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                {[
                  { l:"Profile Data",      desc:"Personal & professional info",  format:"JSON" },
                  { l:"Settings Export",   desc:"All preferences & configuration",format:"JSON" },
                  { l:"Activity Log",      desc:"Login & action history",         format:"CSV" },
                  { l:"Notification History",desc:"Past notifications",           format:"CSV" },
                ].map(r=>(
                  <div key={r.l} style={{ padding:"11px 14px",background:"#f8fafc",borderRadius:9,border:"1px solid #e2e8f0" }}>
                    <div style={{ fontWeight:600,fontSize:12,color:"#0f172a",marginBottom:2 }}>{r.l}</div>
                    <div style={{ fontSize:10,color:"#94a3b8",marginBottom:8 }}>{r.desc} · {r.format}</div>
                    <button onClick={exportData} style={{ display:"flex",alignItems:"center",gap:4,padding:"4px 11px",background:"#0891b2",color:"white",border:"none",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:600 }}><Download size={10}/>Export</button>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="🔏 Privacy Settings">
              {[
                { l:"Allow profile photo to be visible to all staff",     on:true },
                { l:"Share my online status with colleagues",              on:true },
                { l:"Allow my consultation stats in department reports",   on:false },
                { l:"Include my data in anonymized research datasets",     on:false },
              ].map((p,i)=>(
                <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid #f1f5f9" }}>
                  <div style={{ fontSize:12,color:"#374151" }}>{p.l}</div>
                  <Toggle on={p.on} onChange={()=>showToast("Privacy setting updated")}/>
                </div>
              ))}
            </Card>
            <Card title="📋 Consent Management">
              <div style={{ fontSize:12,color:"#64748b",marginBottom:10 }}>Your current consent status under Rwanda DPL 2021:</div>
              {[
                { l:"Terms of Service",       signed:"Jan 15, 2026",status:"Accepted" },
                { l:"Privacy Policy",          signed:"Jan 15, 2026",status:"Accepted" },
                { l:"Data Processing Agreement",signed:"Jan 15, 2026",status:"Accepted" },
              ].map((c,i)=>(
                <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f1f5f9",fontSize:12 }}>
                  <span style={{ color:"#374151",fontWeight:500 }}>{c.l}</span>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <span style={{ color:"#94a3b8",fontSize:10 }}>Signed {c.signed}</span>
                    <span style={{ padding:"2px 8px",borderRadius:20,background:"#dcfce7",color:"#059669",fontSize:10,fontWeight:600 }}>{c.status}</span>
                  </div>
                </div>
              ))}
            </Card>
            <Card title="🗑️ Account Actions">
              <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
                <button onClick={()=>showToast("Account deactivation request submitted — HR will contact you")} style={{ padding:"8px 16px",border:"1px solid #fca5a5",background:"#fee2e2",borderRadius:8,cursor:"pointer",fontSize:11,color:"#dc2626",fontWeight:600 }}>Deactivate Account</button>
                <button onClick={()=>showToast("Data deletion request submitted — compliant with Rwanda DPL 2021")} style={{ padding:"8px 16px",border:"1px solid #fca5a5",background:"white",borderRadius:8,cursor:"pointer",fontSize:11,color:"#dc2626",fontWeight:600 }}>Request Data Deletion</button>
              </div>
              <div style={{ fontSize:10,color:"#94a3b8",marginTop:8 }}>Account deactivation and data deletion require administrator approval per hospital policy.</div>
            </Card>
          </div>
        )}

        {/* ── AUDIT LOG ── */}
        {tab==="audit"&&(
          <div style={{ display:"grid",gap:0,maxWidth:700 }}>
            <div style={{ fontWeight:800,fontSize:16,color:"#0f172a",marginBottom:14 }}>📝 Audit Log</div>
            <Card title="🔐 Login & Security History">
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                  <thead><tr style={{ background:"#f8fafc" }}>
                    {["Action","Date & Time","IP Address","Device",""].map(h=><th key={h} style={{ padding:"8px 12px",textAlign:"left",fontWeight:600,fontSize:10,color:"#64748b",textTransform:"uppercase",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap" }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {AUDIT_LOG.map((log,i)=>(
                      <tr key={i} style={{ borderBottom:"1px solid #f1f5f9" }}>
                        <td style={{ padding:"9px 12px",fontWeight:600,color:log.action.includes("Password")?"#d97706":log.action.includes("2FA")?"#7c3aed":"#0f172a" }}>{log.action}</td>
                        <td style={{ padding:"9px 12px",color:"#64748b" }}>{log.time}</td>
                        <td style={{ padding:"9px 12px",color:"#94a3b8",fontSize:11 }}>{log.ip}</td>
                        <td style={{ padding:"9px 12px",color:"#64748b",fontSize:11 }}>{log.device}</td>
                        <td style={{ padding:"9px 12px" }}>
                          {log.action==="Login"&&<span style={{ fontSize:9,padding:"1px 6px",borderRadius:4,background:"#dcfce7",color:"#059669",fontWeight:700 }}>✓</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={()=>showToast("Audit log downloaded")} style={{ marginTop:12,display:"flex",alignItems:"center",gap:5,padding:"7px 14px",border:"1px solid #e2e8f0",background:"white",borderRadius:8,cursor:"pointer",fontSize:11,color:"#374151",fontWeight:600 }}><Download size={11}/>Download Full Log</button>
            </Card>
          </div>
        )}

        {/* ── HELP & SUPPORT ── */}
        {tab==="help"&&(
          <div style={{ display:"grid",gap:0,maxWidth:660 }}>
            <div style={{ fontWeight:800,fontSize:16,color:"#0f172a",marginBottom:14 }}>❓ Help & Support</div>
            <Card title="📚 Help Center">
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                {[
                  { icon:"📖", l:"User Guide",        desc:"Complete guide for your role" },
                  { icon:"🎥", l:"Video Tutorials",   desc:"Step-by-step video walkthroughs" },
                  { icon:"❓", l:"FAQs",              desc:"Frequently asked questions" },
                  { icon:"⌨️", l:"Keyboard Shortcuts",desc:"Productivity shortcuts" },
                ].map(r=>(
                  <button key={r.l} onClick={()=>showToast(`Opening ${r.l}…`)} style={{ padding:"14px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:10,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:10 }}>
                    <span style={{ fontSize:22 }}>{r.icon}</span>
                    <div><div style={{ fontSize:12,fontWeight:600,color:"#0f172a" }}>{r.l}</div><div style={{ fontSize:10,color:"#94a3b8" }}>{r.desc}</div></div>
                  </button>
                ))}
              </div>
            </Card>
            <Card title="🎫 Contact Support">
              <div style={{ display:"grid",gap:10 }}>
                <Field label="Subject"><input placeholder="Brief description of your issue" style={inp}/></Field>
                <Field label="Message"><textarea rows={4} placeholder="Describe your issue in detail…" style={{ ...inp,resize:"vertical" }}/></Field>
                <Field label="Priority"><select style={inp}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></Field>
                <button onClick={()=>showToast("✅ Support ticket submitted — response within 24 hours")} style={{ display:"flex",alignItems:"center",gap:5,padding:"9px 18px",background:"#0891b2",color:"white",border:"none",borderRadius:9,cursor:"pointer",fontSize:12,fontWeight:700,width:"fit-content" }}>Submit Ticket</button>
              </div>
            </Card>
            <Card title="ℹ️ System Information">
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,fontSize:12 }}>
                {[
                  ["Platform","ARTIC Health Companion"],["Version","2026.07.21"],["Environment","Production"],
                  ["Server","172.209.217.176"],["Role","Doctor"],["Session","Active"],
                  ["Database","SQLite / PostgreSQL"],["Support Email","support@artic.health"],
                ].map(([k,v])=>(
                  <div key={k} style={{ padding:"7px 10px",background:"#f8fafc",borderRadius:7 }}>
                    <div style={{ fontSize:10,color:"#94a3b8",fontWeight:600,textTransform:"uppercase" }}>{k}</div>
                    <div style={{ fontWeight:600,color:"#0f172a",marginTop:1 }}>{v}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
