"use client";
import { useEffect, useState, useCallback } from "react";
import { superAdminApi } from "@/lib/api/hms";
import { useToast } from "@/lib/store";
import {
  LayoutDashboard, Settings, Building2, Users, CreditCard,
  FileBarChart, ShieldCheck, ToggleLeft, ToggleRight,
  CheckCircle, XCircle, Clock, Plus, RefreshCw, ExternalLink,
  Lock, Unlock, AlertTriangle, ChevronDown, ChevronRight,
} from "lucide-react";

type Tab = "dashboard"|"features"|"hospitals"|"requests"|"billing"|"audit"|"settings";

const TIERS = ["trial","basic","premium","pro","enterprise"] as const;
const TIER_COLORS: Record<string,string> = {
  trial:"#9ca3af", basic:"#027c8e", premium:"#5b5fc7", pro:"#0f9f6e", enterprise:"#b7791f"
};
const STATUS_COLORS: Record<string,string> = {
  active:"#0f9f6e", locked:"#c23b22", limited:"#b7791f", beta:"#5b5fc7", pending:"#9ca3af"
};

const PORTAL_LINKS = [
  { label:"Hospital Portal", url:"http://172.209.217.176:3001/login?role=hospital-manager", color:"#027c8e", icon:"ðŸ¥" },
  { label:"Doctor Portal",   url:"http://172.209.217.176:3001/login?role=doctor",           color:"#0f9f6e", icon:"ðŸ‘¨â€âš•ï¸" },
  { label:"Nurse Portal",    url:"http://172.209.217.176:3001/login?role=nurse",             color:"#5b5fc7", icon:"ðŸ‘©â€âš•ï¸" },
  { label:"Pharmacy Portal", url:"http://172.209.217.176:3001/login?role=pharmacist",        color:"#b7791f", icon:"ðŸ’Š" },
  { label:"Lab Portal",      url:"http://172.209.217.176:3001/login?role=laboratory",        color:"#c23b22", icon:"ðŸ”¬" },
  { label:"Patient Portal",  url:"http://172.209.217.176:3001/login?role=patient",           color:"#027c8e", icon:"ðŸ‘¤" },
  { label:"API Health",      url:"http://172.209.217.176:4001/health",                       color:"#374151", icon:"âš¡" },
];

export default function SuperAdminPage() {
  const [tab, setTab]             = useState<Tab>("dashboard");
  const [stats, setStats]         = useState<any>(null);
  const [features, setFeatures]   = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [requests, setRequests]   = useState<any[]>([]);
  const [invoices, setInvoices]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(false);
  const [expandedCat, setExpandedCat] = useState<string|null>("Core");
  const { show } = useToast();

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, f, h, r, i]: any[] = await Promise.all([
        superAdminApi.stats(),
        superAdminApi.listFeatures(),
        superAdminApi.listHospitals(),
        superAdminApi.listRequests({ status: "pending" }),
        superAdminApi.listInvoices(),
      ]);
      setStats(s);
      setFeatures(Array.isArray(f) ? f : []);
      setHospitals((h as any)?.data ?? (Array.isArray(h) ? h : []));
      setRequests(Array.isArray(r) ? r : []);
      setInvoices(Array.isArray(i) ? i : []);
    } catch (e: any) { show(e.message || "Failed to load", "error"); }
    finally { setLoading(false); }
  }, [show]);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function toggleFeature(f: any) {
    const newStatus = f.default_status === "active" ? "locked" : "active";
    try {
      await superAdminApi.updateFeature(f.id, { defaultStatus: newStatus });
      show(`${f.label} set to ${newStatus}`, newStatus === "active" ? "success" : "warning");
      loadAll();
    } catch { show("Failed to update feature", "error"); }
  }

  async function resolveRequest(id: string, decision: "approved"|"denied") {
    try {
      await superAdminApi.resolveRequest(id, decision, `${decision} by system admin`);
      show(`Request ${decision}`, decision === "approved" ? "success" : "info");
      loadAll();
    } catch { show("Failed to resolve request", "error"); }
  }

  const tabs: { key: Tab; label: string; icon: any; badge?: number }[] = [
    { key:"dashboard", label:"Dashboard",        icon:LayoutDashboard },
    { key:"features",  label:"Feature Control",  icon:Settings },
    { key:"hospitals", label:"Hospitals",         icon:Building2 },
    { key:"requests",  label:"Access Requests",  icon:Clock, badge: requests.length },
    { key:"billing",   label:"Billing",           icon:CreditCard },
    { key:"audit",     label:"Audit & Reports",   icon:FileBarChart },
    { key:"settings",  label:"System Settings",   icon:ShieldCheck },
  ];

  const featuresByCategory = features.reduce((acc: any, f: any) => {
    if (!acc[f.category]) acc[f.category] = [];
    acc[f.category].push(f);
    return acc;
  }, {});

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Portal Quick Links */}
      <div style={{ background:"linear-gradient(135deg,#1e293b,#334155)", borderRadius:14, padding:"16px 20px" }}>
        <div style={{ color:"#94a3b8", fontSize:11, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>Quick Access â€” All Portals</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {PORTAL_LINKS.map(l => (
            <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer"
              style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", background:"rgba(255,255,255,0.08)", borderRadius:8, color:"white", textDecoration:"none", fontSize:13, border:"1px solid rgba(255,255,255,0.1)" }}>
              <span>{l.icon}</span>{l.label}<ExternalLink size={11} />
            </a>
          ))}
        </div>
      </div>

      {/* Tab navigation */}
      <div style={{ display:"flex", gap:4, borderBottom:"2px solid var(--line,#e5)", overflowX:"auto" }}>
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 16px", border:"none", background:"none", cursor:"pointer", fontWeight:tab===t.key?700:400, borderBottom:tab===t.key?"2px solid #027c8e":"2px solid transparent", color:tab===t.key?"#027c8e":"inherit", whiteSpace:"nowrap", position:"relative" }}>
              <Icon size={15} />{t.label}
              {t.badge && t.badge > 0 ? <span style={{ background:"#c23b22", color:"white", borderRadius:10, padding:"1px 6px", fontSize:10, fontWeight:700 }}>{t.badge}</span> : null}
            </button>
          );
        })}
        <button onClick={loadAll} disabled={loading} style={{ marginLeft:"auto", border:"none", background:"none", cursor:"pointer", padding:"10px 14px", color:"#6b7280" }}>
          <RefreshCw size={15} style={{ animation:loading?"spin 1s linear infinite":"none" }} />
        </button>
      </div>

      {/* â”€â”€ DASHBOARD TAB â”€â”€ */}
      {tab === "dashboard" && (
        <div style={{ display:"grid", gap:16 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:12 }}>
            {[
              { label:"Total Hospitals",   value:stats?.totalHospitals||0,    icon:"ðŸ¥", color:"#027c8e" },
              { label:"Active Users",      value:stats?.activeUsers||0,       icon:"ðŸ‘¥", color:"#0f9f6e" },
              { label:"Total Patients",    value:stats?.totalPatients||0,     icon:"ðŸ¥", color:"#5b5fc7" },
              { label:"Pending Requests",  value:stats?.pendingRequests||0,   icon:"â³", color:stats?.pendingRequests>0?"#c23b22":"#9ca3af" },
              { label:"Active Features",   value:stats?.activeFeatures||0,    icon:"âš™ï¸", color:"#b7791f" },
            ].map(k => (
              <div key={k.label} style={{ background:"white", border:`1px solid var(--line,#e5)`, borderLeft:`4px solid ${k.color}`, borderRadius:12, padding:"16px 18px" }}>
                <div style={{ fontSize:22, marginBottom:6 }}>{k.icon}</div>
                <div style={{ fontSize:26, fontWeight:700, color:k.color }}>{k.value}</div>
                <div style={{ fontSize:12, color:"#9ca3af" }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Hospitals by tier */}
          <section style={{ background:"white", border:"1px solid var(--line,#e5)", borderRadius:12, padding:16 }}>
            <h3 style={{ margin:"0 0 12px", fontSize:15, fontWeight:700 }}>Hospitals by Subscription Tier</h3>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              {(stats?.hospitalsByTier || []).map((t: any) => (
                <div key={t.tier} style={{ padding:"8px 16px", background:TIER_COLORS[t.tier]+"15", border:`1px solid ${TIER_COLORS[t.tier]}40`, borderRadius:10, fontSize:13 }}>
                  <span style={{ fontWeight:700, color:TIER_COLORS[t.tier], textTransform:"capitalize" }}>{t.tier}</span>
                  <span style={{ marginLeft:8, color:"#374151" }}>{t.count} hospitals</span>
                </div>
              ))}
              {(!stats?.hospitalsByTier?.length) && <span style={{ color:"#9ca3af", fontSize:13 }}>Loading tier dataâ€¦</span>}
            </div>
          </section>

          {/* Pending requests preview */}
          {requests.length > 0 && (
            <section style={{ background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:12, padding:16 }}>
              <h3 style={{ margin:"0 0 12px", fontSize:15, fontWeight:700, color:"#b7791f" }}>
                â³ {requests.length} Pending Access Request{requests.length>1?"s":""}
              </h3>
              {requests.slice(0,3).map((r:any) => (
                <div key={r.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #fed7aa", fontSize:13 }}>
                  <div>
                    <strong>{r.feature_label}</strong>
                    <span style={{ color:"#6b7280", marginLeft:8 }}>â€” {r.hospital_name} ({r.requested_by_name})</span>
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={()=>resolveRequest(r.id,"approved")} style={{ padding:"4px 12px", background:"#0f9f6e", color:"white", border:"none", borderRadius:6, cursor:"pointer", fontSize:12 }}>Approve</button>
                    <button onClick={()=>resolveRequest(r.id,"denied")}   style={{ padding:"4px 12px", background:"#c23b22", color:"white", border:"none", borderRadius:6, cursor:"pointer", fontSize:12 }}>Deny</button>
                  </div>
                </div>
              ))}
              {requests.length > 3 && <button onClick={()=>setTab("requests")} style={{ marginTop:8, fontSize:12, color:"#b7791f", border:"none", background:"none", cursor:"pointer" }}>View all {requests.length} requests â†’</button>}
            </section>
          )}
        </div>
      )}

      {/* â”€â”€ FEATURES TAB â”€â”€ */}
      {tab === "features" && (
        <div style={{ display:"grid", gap:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <h2 style={{ margin:0, fontSize:17, fontWeight:700 }}>Feature Control Center</h2>
            <span style={{ fontSize:13, color:"#6b7280" }}>{features.length} total features</span>
          </div>
          {Object.entries(featuresByCategory).map(([cat, feats]: any) => (
            <section key={cat} style={{ background:"white", border:"1px solid var(--line,#e5)", borderRadius:12, overflow:"hidden" }}>
              <button onClick={()=>setExpandedCat(expandedCat===cat?null:cat)}
                style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", border:"none", background:"#f8fafc", cursor:"pointer", fontWeight:700, fontSize:14 }}>
                <span>{cat} ({(feats as any[]).length})</span>
                {expandedCat===cat ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
              </button>
              {expandedCat===cat && (
                <div>
                  {(feats as any[]).map((f:any) => (
                    <div key={f.id} style={{ display:"grid", gridTemplateColumns:"40px 1fr 100px 100px 120px", alignItems:"center", gap:12, padding:"10px 16px", borderTop:"1px solid var(--line,#e5)", fontSize:13 }}>
                      <span style={{ fontSize:20 }}>{f.icon||"âš™ï¸"}</span>
                      <div>
                        <div style={{ fontWeight:600 }}>{f.label}</div>
                        <div style={{ color:"#9ca3af", fontSize:11 }}>{f.description || f.name}</div>
                      </div>
                      <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:(STATUS_COLORS[f.default_status]||"#9ca3af")+"15", color:STATUS_COLORS[f.default_status]||"#9ca3af", textTransform:"capitalize" }}>
                        {f.default_status === "active" ? "âœ…" : f.default_status === "locked" ? "ðŸ”’" : "âš ï¸"} {f.default_status}
                      </span>
                      <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, background:TIER_COLORS[f.tier_required]+"15", color:TIER_COLORS[f.tier_required], fontWeight:600, textTransform:"capitalize" }}>
                        {f.tier_required}
                      </span>
                      <button onClick={()=>toggleFeature(f)}
                        style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:8, border:"1px solid var(--line,#e5)", background:"white", cursor:"pointer", fontSize:12 }}>
                        {f.default_status === "active"
                          ? <><ToggleRight size={16} color="#0f9f6e"/> Disable</>
                          : <><ToggleLeft  size={16} color="#c23b22"/> Enable</>}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {/* â”€â”€ HOSPITALS TAB â”€â”€ */}
      {tab === "hospitals" && (
        <div style={{ display:"grid", gap:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <h2 style={{ margin:0, fontSize:17, fontWeight:700 }}>Hospital & Tenant Management</h2>
            <span style={{ fontSize:13, color:"#6b7280" }}>{hospitals.length} hospitals</span>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ background:"#f8fafc", textAlign:"left" }}>
                  {["Hospital","Tier","Status","Users","Active Features","Actions"].map(h => (
                    <th key={h} style={{ padding:"10px 14px", borderBottom:"2px solid var(--line,#e5)", fontWeight:600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hospitals.map((h:any) => (
                  <tr key={h.id} style={{ borderBottom:"1px solid var(--line,#e5)" }}>
                    <td style={{ padding:"10px 14px" }}>
                      <div style={{ fontWeight:600 }}>{h.name}</div>
                      <div style={{ color:"#9ca3af", fontSize:11 }}>{h.id}</div>
                    </td>
                    <td style={{ padding:"10px 14px" }}>
                      <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:TIER_COLORS[h.tier||"trial"]+"15", color:TIER_COLORS[h.tier||"trial"], textTransform:"capitalize" }}>
                        {h.tier||"trial"}
                      </span>
                    </td>
                    <td style={{ padding:"10px 14px" }}>
                      <span style={{ color:h.is_active?"#0f9f6e":"#c23b22", fontWeight:600, fontSize:12 }}>
                        {h.is_active ? "âœ… Active" : "ðŸ”’ Inactive"}
                      </span>
                    </td>
                    <td style={{ padding:"10px 14px", textAlign:"center" }}>{h.active_users||0}</td>
                    <td style={{ padding:"10px 14px", textAlign:"center" }}>{h.active_features||0}</td>
                    <td style={{ padding:"10px 14px" }}>
                      <div style={{ display:"flex", gap:6 }}>
                        {TIERS.map(tier => (
                          <button key={tier} onClick={async()=>{
                            try { await superAdminApi.setTierFeatures(h.id, tier); show(`${h.name} set to ${tier}`, "success"); loadAll(); }
                            catch { show("Failed","error"); }
                          }} style={{ padding:"3px 8px", fontSize:11, borderRadius:6, border:"1px solid var(--line,#e5)", background:h.tier===tier?TIER_COLORS[tier]:"white", color:h.tier===tier?"white":TIER_COLORS[tier], cursor:"pointer", fontWeight:h.tier===tier?700:400 }}>
                            {tier}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {hospitals.length === 0 && <tr><td colSpan={6} style={{ padding:32, textAlign:"center", color:"#9ca3af" }}>No hospitals registered</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* â”€â”€ REQUESTS TAB â”€â”€ */}
      {tab === "requests" && (
        <div style={{ display:"grid", gap:12 }}>
          <h2 style={{ margin:0, fontSize:17, fontWeight:700 }}>Access Requests ({requests.length} pending)</h2>
          {requests.length === 0 && <div style={{ padding:32, textAlign:"center", color:"#9ca3af", background:"white", borderRadius:12, border:"1px solid var(--line,#e5)" }}>No pending requests</div>}
          {requests.map((r:any) => (
            <div key={r.id} style={{ background:"white", border:"1px solid var(--line,#e5)", borderRadius:12, padding:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:15 }}>{r.feature_label} <span style={{ fontSize:18 }}>{r.icon}</span></div>
                  <div style={{ fontSize:13, color:"#6b7280", marginTop:2 }}>
                    <strong>{r.hospital_name}</strong> Â· Requested by {r.requested_by_name} ({r.job_title||"Staff"})
                  </div>
                  <div style={{ fontSize:13, color:"#374151", marginTop:6, padding:"8px 12px", background:"#f8fafc", borderRadius:8, maxWidth:600 }}>
                    "{r.reason || 'No reason provided'}"
                  </div>
                  <div style={{ fontSize:11, color:"#9ca3af", marginTop:6 }}>
                    Submitted {r.created_at?.slice(0,10)}
                  </div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>resolveRequest(r.id,"approved")}
                    style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 18px", background:"#0f9f6e", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600 }}>
                    <CheckCircle size={15}/> Approve
                  </button>
                  <button onClick={()=>resolveRequest(r.id,"denied")}
                    style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 18px", background:"#c23b22", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600 }}>
                    <XCircle size={15}/> Deny
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* â”€â”€ BILLING TAB â”€â”€ */}
      {tab === "billing" && (
        <div style={{ display:"grid", gap:12 }}>
          <h2 style={{ margin:0, fontSize:17, fontWeight:700 }}>Subscription Billing</h2>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ background:"#f8fafc" }}>
                  {["Invoice Ref","Hospital","Amount","Status","Period","Actions"].map(h=>(
                    <th key={h} style={{ padding:"10px 14px", borderBottom:"2px solid var(--line,#e5)", fontWeight:600, textAlign:"left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((i:any)=>(
                  <tr key={i.id} style={{ borderBottom:"1px solid var(--line,#e5)" }}>
                    <td style={{ padding:"10px 14px", fontFamily:"monospace", fontSize:12 }}>{i.invoice_ref}</td>
                    <td style={{ padding:"10px 14px" }}>{i.hospital_name}</td>
                    <td style={{ padding:"10px 14px", fontWeight:700 }}>{i.currency} {i.amount?.toLocaleString()}</td>
                    <td style={{ padding:"10px 14px" }}>
                      <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600,
                        background:i.status==="paid"?"#d1fae5":i.status==="pending"?"#fef3c7":"#fee2e2",
                        color:i.status==="paid"?"#065f46":i.status==="pending"?"#92400e":"#991b1b" }}>
                        {i.status}
                      </span>
                    </td>
                    <td style={{ padding:"10px 14px", fontSize:11, color:"#6b7280" }}>{i.period_start?.slice(0,10)} â€“ {i.period_end?.slice(0,10)}</td>
                    <td style={{ padding:"10px 14px" }}>
                      {i.status === "pending" && (
                        <button style={{ padding:"4px 12px", fontSize:11, background:"#027c8e", color:"white", border:"none", borderRadius:6, cursor:"pointer" }}>
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && <tr><td colSpan={6} style={{ padding:32, textAlign:"center", color:"#9ca3af" }}>No invoices</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* â”€â”€ AUDIT TAB â”€â”€ */}
      {tab === "audit" && (
        <div style={{ padding:24, background:"white", borderRadius:12, border:"1px solid var(--line,#e5)", textAlign:"center", color:"#6b7280" }}>
          <FileBarChart size={40} style={{ opacity:.3, margin:"0 auto 12px" }} />
          <div style={{ fontSize:15, fontWeight:600 }}>Audit logs available via Reports module</div>
          <div style={{ fontSize:13, marginTop:6 }}>Full audit trail is in: Reports â†’ Audit Log</div>
        </div>
      )}

      {/* â”€â”€ SETTINGS TAB â”€â”€ */}
      {tab === "settings" && (
        <div style={{ display:"grid", gap:12 }}>
          <h2 style={{ margin:0, fontSize:17, fontWeight:700 }}>System Settings</h2>
          {[
            { label:"System Name", value:"ARTIC Health Companion", editable:false },
            { label:"Version", value:"v2.0.0", editable:false },
            { label:"Environment", value:"Production", editable:false },
            { label:"Default Tier for New Hospitals", value:"trial", editable:true },
            { label:"Trial Period (days)", value:"14", editable:true },
            { label:"Account Lockout (attempts)", value:"5", editable:true },
            { label:"Session Timeout (minutes)", value:"30", editable:true },
          ].map(s => (
            <div key={s.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", background:"white", border:"1px solid var(--line,#e5)", borderRadius:10, fontSize:13 }}>
              <span style={{ color:"#374151", fontWeight:500 }}>{s.label}</span>
              {s.editable
                ? <input defaultValue={s.value} style={{ padding:"5px 10px", borderRadius:6, border:"1px solid var(--line,#e5)", fontSize:13, width:120 }} />
                : <span style={{ color:"#9ca3af" }}>{s.value}</span>}
            </div>
          ))}
          <div style={{ padding:"12px 16px", background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:10, fontSize:13, color:"#92400e" }}>
            âš ï¸ System settings changes take effect immediately and affect all hospitals.
          </div>
        </div>
      )}
    </div>
  );
}
