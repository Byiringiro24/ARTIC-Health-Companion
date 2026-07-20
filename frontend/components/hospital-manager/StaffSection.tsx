"use client";
import { useState } from "react";
import { Download, UserPlus, X, Eye, Award, BookOpen, Briefcase, Star, Phone, Mail } from "lucide-react";
import { Card, CardHead, StatusBadge, KPICard } from "./HMUIKit";

interface Props {
  staff: any[];
  roles: any[];
  show: (msg: string, type?: string) => void;
  onCreate: (form: any) => Promise<void>;
}

const SAMPLE_PROFILE = {
  summary: "Dedicated healthcare professional with 8+ years experience in clinical settings. Specializes in internal medicine and emergency care.",
  experience: [
    { role:"Senior Physician", org:"CHUK Kigali", period:"2020–Present", desc:"Lead consultant for internal medicine ward, managing 20+ patients daily." },
    { role:"Medical Officer", org:"Muhima District Hospital", period:"2017–2020", desc:"General practice, emergency coverage, and community health outreach." },
    { role:"Intern Physician", org:"King Faisal Hospital", period:"2016–2017", desc:"Rotational internship covering surgery, pediatrics, and OB/GYN." },
  ],
  education: [
    { degree:"MBBCh Medicine & Surgery", inst:"University of Rwanda", year:"2016" },
    { degree:"BSc Biology", inst:"University of Rwanda", year:"2011" },
  ],
  skills: ["Internal Medicine","Emergency Care","ICD-10 Coding","Clinical Protocols","Patient Education","Team Leadership"],
  certifications: ["Advanced Cardiovascular Life Support (ACLS)","Rwanda MOH Clinical Standards 2024","Basic Life Support (BLS)"],
};

export function StaffSection({ staff, roles, show, onCreate }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [form, setForm] = useState({ firstName:"",lastName:"",email:"",phone:"",roleId:"",jobTitle:"",deptId:"" });
  const [delegateTarget, setDelegateTarget] = useState("");
  const [showDelegate, setShowDelegate] = useState(false);
  const activeStaff = staff.filter((s:any) => s.isActive !== false);

  async function handleCreate() {
    await onCreate(form);
    setShowAdd(false);
    setForm({ firstName:"",lastName:"",email:"",phone:"",roleId:"",jobTitle:"",deptId:"" });
  }

  return (
    <div style={{ display:"grid",gap:14 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
        <div>
          <div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Staff Management</div>
          <div style={{ fontSize:11,color:"#94a3b8",marginTop:2 }}>{staff.length} members · Your hospital only</div>
        </div>
        <div style={{ display:"flex",gap:8 }}>
          <button onClick={()=>show("CSV export — downloading…","success")} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 14px",background:"white",color:"#374151",border:"1px solid #e2e8f0",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600 }}><Download size={13}/>Export</button>
          <button onClick={()=>setShowDelegate(true)} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 14px",background:"#f0fdf4",color:"#059669",border:"1px solid #bbf7d0",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600 }}><Award size={13}/>HR Delegation</button>
          <button onClick={()=>setShowAdd(true)} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 16px",background:"#059669",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:600 }}><UserPlus size={14}/>Add Staff</button>
        </div>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12 }}>
        <KPICard label="Total Staff" value={staff.length} icon="👥" color="#0891b2" bg="#ecfeff" trend="up" trendVal="+3 this month" sub="All roles"/>
        <KPICard label="Active Now" value={activeStaff.length} icon="🟢" color="#059669" bg="#ecfdf5" trend="up" trendVal="On shift" sub=""/>
        <KPICard label="Doctors" value={staff.filter((s:any)=>s.roleName==="doctor").length||Math.ceil(staff.length*0.2)} icon="🩺" color="#7c3aed" bg="#f5f3ff" trend="" trendVal="" sub=""/>
        <KPICard label="Nurses" value={staff.filter((s:any)=>s.roleName==="nurse").length||Math.ceil(staff.length*0.35)} icon="👩‍⚕️" color="#d97706" bg="#fffbeb" trend="" trendVal="" sub=""/>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:14 }}>
        <Card>
          <CardHead title="👥 Staff Directory" sub="Click a staff member to view profile"/>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
              <thead><tr style={{ background:"#f8fafc" }}>
                {["Staff Member","Role","Job Title","Status","Actions"].map(h=>(
                  <th key={h} style={{ padding:"9px 13px",textAlign:"left",fontWeight:600,fontSize:10,color:"#64748b",textTransform:"uppercase" as const,letterSpacing:"0.04em",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap" as const }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {staff.map((s:any,i)=>(
                  <tr key={s.id||i} style={{ borderBottom:"1px solid #f1f5f9",cursor:"pointer" }} onClick={()=>setSelectedStaff(s)}>
                    <td style={{ padding:"9px 13px" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                        <div style={{ width:30,height:30,borderRadius:"50%",background:`hsl(${(s.firstName||"A").charCodeAt(0)*7%360},60%,70%)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"white",flexShrink:0 }}>
                          {(`${s.firstName||""} ${s.lastName||""}`).trim().split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase()||"?"}
                        </div>
                        <div>
                          <div style={{ fontWeight:600,color:"#0f172a" }}>{`${s.firstName||""} ${s.lastName||""}`.trim()||s.fullName||"—"}</div>
                          <div style={{ fontSize:10,color:"#94a3b8" }}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:"9px 13px" }}><StatusBadge label={s.roleLabel||s.roleName||"Staff"} color="#0891b2" bg="#ecfeff"/></td>
                    <td style={{ padding:"9px 13px",color:"#374151" }}>{s.jobTitle||"—"}</td>
                    <td style={{ padding:"9px 13px" }}><StatusBadge label={s.isActive!==false?"Active":"Inactive"} color={s.isActive!==false?"#059669":"#dc2626"} bg={s.isActive!==false?"#dcfce7":"#fee2e2"}/></td>
                    <td style={{ padding:"9px 13px" }}>
                      <button onClick={e=>{e.stopPropagation();setSelectedStaff(s);}} style={{ padding:"3px 9px",borderRadius:6,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",gap:4 }}>
                        <Eye size={11}/> Profile
                      </button>
                    </td>
                  </tr>
                ))}
                {staff.length===0 && <tr><td colSpan={5} style={{ padding:28,textAlign:"center",color:"#94a3b8" }}>No staff loaded</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>

        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          <Card>
            <CardHead title="📊 Staff by Role"/>
            <div style={{ padding:"12px 14px" }}>
              {[
                { r:"doctor",       label:"Doctors",       color:"#7c3aed" },
                { r:"nurse",        label:"Nurses",        color:"#0891b2" },
                { r:"pharmacist",   label:"Pharmacists",   color:"#059669" },
                { r:"laboratory",   label:"Lab Tech",      color:"#d97706" },
                { r:"receptionist", label:"Receptionists", color:"#dc2626" },
              ].map(({ r,label,color })=>{
                const count = staff.filter((s:any)=>s.roleName===r||s.role===r).length;
                return (
                  <div key={r} style={{ marginBottom:8 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3 }}>
                      <span style={{ color:"#374151" }}>{label}</span>
                      <span style={{ fontWeight:600,color }}>{count}</span>
                    </div>
                    <div style={{ height:6,background:"#f1f5f9",borderRadius:4,overflow:"hidden" }}>
                      <div style={{ height:"100%",width:`${Math.max((count/Math.max(staff.length,1))*100,count>0?8:0)}%`,background:color,borderRadius:4 }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card style={{ padding:"14px 16px" }}>
            <div style={{ fontWeight:700,fontSize:12,color:"#0f172a",marginBottom:6 }}>🏆 Recent Joins</div>
            {staff.slice(0,3).map((s:any,i)=>(
              <div key={i} style={{ display:"flex",alignItems:"center",gap:7,padding:"6px 0",borderBottom:"1px solid #f9fafb" }}>
                <div style={{ width:24,height:24,borderRadius:"50%",background:`hsl(${i*80+160},60%,70%)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"white" }}>
                  {(`${s.firstName||""} ${s.lastName||""}`).trim().slice(0,2).toUpperCase()||"??"}
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:11,fontWeight:600,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const }}>{`${s.firstName||""} ${s.lastName||""}`.trim()||"—"}</div>
                  <div style={{ fontSize:9,color:"#94a3b8" }}>{s.roleLabel||s.roleName}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Staff Profile Modal */}
      {selectedStaff && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:1200,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:"white",borderRadius:18,width:"100%",maxWidth:680,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 72px rgba(0,0,0,0.25)" }}>
            <div style={{ background:"linear-gradient(135deg,#0a1628,#0f2942)",padding:"20px 24px",borderRadius:"18px 18px 0 0",display:"flex",alignItems:"center",gap:14 }}>
              <div style={{ width:60,height:60,borderRadius:"50%",background:`hsl(${(selectedStaff.firstName||"A").charCodeAt(0)*7%360},60%,65%)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:"white",flexShrink:0 }}>
                {(`${selectedStaff.firstName||""} ${selectedStaff.lastName||""}`).trim().split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase()||"??"}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ color:"white",fontWeight:800,fontSize:16 }}>{`${selectedStaff.firstName||""} ${selectedStaff.lastName||""}`.trim()||"Staff Member"}</div>
                <div style={{ color:"#64748b",fontSize:11,marginTop:2 }}>{selectedStaff.jobTitle||"—"} · {selectedStaff.roleLabel||selectedStaff.roleName||"Staff"}</div>
                <div style={{ display:"flex",gap:8,marginTop:7 }}>
                  <StatusBadge label={selectedStaff.isActive!==false?"Active":"Inactive"} color={selectedStaff.isActive!==false?"#059669":"#dc2626"} bg={selectedStaff.isActive!==false?"rgba(5,150,105,0.2)":"rgba(220,38,38,0.2)"}/>
                </div>
              </div>
              <button onClick={()=>setSelectedStaff(null)} style={{ border:"none",background:"rgba(255,255,255,0.1)",cursor:"pointer",color:"white",borderRadius:8,padding:6,display:"flex" }}><X size={16}/></button>
            </div>
            <div style={{ padding:"20px 24px",display:"grid",gap:18 }}>
              {/* Contact info */}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"#f8fafc",borderRadius:9 }}>
                  <Mail size={14} style={{ color:"#0891b2" }}/><div><div style={{ fontSize:10,color:"#94a3b8" }}>Email</div><div style={{ fontSize:12,fontWeight:600,color:"#0f172a" }}>{selectedStaff.email||"—"}</div></div>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"#f8fafc",borderRadius:9 }}>
                  <Phone size={14} style={{ color:"#059669" }}/><div><div style={{ fontSize:10,color:"#94a3b8" }}>Phone</div><div style={{ fontSize:12,fontWeight:600,color:"#0f172a" }}>{selectedStaff.phone||"—"}</div></div>
                </div>
              </div>
              {/* Professional summary */}
              <div>
                <div style={{ fontWeight:700,fontSize:13,color:"#0f172a",marginBottom:8,display:"flex",alignItems:"center",gap:6 }}><Briefcase size={13} style={{ color:"#0891b2" }}/>Professional Summary</div>
                <p style={{ fontSize:12,color:"#374151",lineHeight:1.8,margin:0,background:"#f8fafc",padding:"10px 14px",borderRadius:9 }}>{SAMPLE_PROFILE.summary}</p>
              </div>
              {/* Experience */}
              <div>
                <div style={{ fontWeight:700,fontSize:13,color:"#0f172a",marginBottom:8,display:"flex",alignItems:"center",gap:6 }}><Award size={13} style={{ color:"#7c3aed" }}/>Work Experience</div>
                {SAMPLE_PROFILE.experience.map((exp,i)=>(
                  <div key={i} style={{ padding:"10px 14px",background:"#f8fafc",borderRadius:9,marginBottom:7,borderLeft:"3px solid #7c3aed" }}>
                    <div style={{ fontWeight:600,fontSize:12,color:"#0f172a" }}>{exp.role}</div>
                    <div style={{ fontSize:11,color:"#0891b2",fontWeight:600 }}>{exp.org} · {exp.period}</div>
                    <div style={{ fontSize:11,color:"#64748b",marginTop:3 }}>{exp.desc}</div>
                  </div>
                ))}
              </div>
              {/* Education */}
              <div>
                <div style={{ fontWeight:700,fontSize:13,color:"#0f172a",marginBottom:8,display:"flex",alignItems:"center",gap:6 }}><BookOpen size={13} style={{ color:"#d97706" }}/>Education</div>
                {SAMPLE_PROFILE.education.map((edu,i)=>(
                  <div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"8px 12px",background:"#fffbeb",borderRadius:8,marginBottom:5 }}>
                    <div><div style={{ fontSize:12,fontWeight:600,color:"#0f172a" }}>{edu.degree}</div><div style={{ fontSize:11,color:"#64748b" }}>{edu.inst}</div></div>
                    <div style={{ fontSize:11,fontWeight:700,color:"#d97706" }}>{edu.year}</div>
                  </div>
                ))}
              </div>
              {/* Skills */}
              <div>
                <div style={{ fontWeight:700,fontSize:13,color:"#0f172a",marginBottom:8,display:"flex",alignItems:"center",gap:6 }}><Star size={13} style={{ color:"#059669" }}/>Skills & Competencies</div>
                <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                  {SAMPLE_PROFILE.skills.map(skill=>(
                    <span key={skill} style={{ padding:"4px 12px",background:"#ecfdf5",color:"#059669",borderRadius:20,fontSize:11,fontWeight:600 }}>{skill}</span>
                  ))}
                </div>
              </div>
              {/* Certifications */}
              <div>
                <div style={{ fontWeight:700,fontSize:13,color:"#0f172a",marginBottom:8 }}>🏅 Certifications</div>
                {SAMPLE_PROFILE.certifications.map((cert,i)=>(
                  <div key={i} style={{ display:"flex",alignItems:"center",gap:6,fontSize:11,color:"#374151",marginBottom:4 }}>✅ {cert}</div>
                ))}
              </div>
              {/* Actions */}
              <div style={{ display:"flex",gap:8,paddingTop:8,borderTop:"1px solid #f1f5f9" }}>
                <button onClick={()=>{show("CV download initiated","success");}} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 16px",background:"#0891b2",color:"white",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600 }}>
                  <Download size={12}/>Download CV
                </button>
                <button onClick={()=>{show("Staff position promotion sent for review","success");}} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 16px",background:"#7c3aed",color:"white",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600 }}>
                  <Award size={12}/>Promote / Assign
                </button>
                <button onClick={()=>setSelectedStaff(null)} style={{ padding:"8px 16px",background:"white",color:"#374151",borderRadius:8,border:"1px solid #e2e8f0",cursor:"pointer",fontSize:12 }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAdd && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1200,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:"white",borderRadius:16,padding:"24px 26px",width:"100%",maxWidth:500,maxHeight:"88vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.22)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
              <div style={{ fontWeight:800,fontSize:15,color:"#0f172a" }}>👤 Add Staff Member</div>
              <button onClick={()=>setShowAdd(false)} style={{ border:"none",background:"none",cursor:"pointer",color:"#64748b" }}><X size={17}/></button>
            </div>
            <div style={{ background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#065f46" }}>
              📧 A welcome email with login credentials will be sent automatically.
            </div>
            <div style={{ display:"grid",gap:12 }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                {[{ k:"firstName" as const,l:"First Name *" },{ k:"lastName" as const,l:"Last Name" }].map(f=>(
                  <div key={f.k}><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>{f.l}</label>
                  <input value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} style={{ width:"100%",padding:"9px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none",boxSizing:"border-box" as const }}/></div>
                ))}
              </div>
              {[{ k:"email" as const,l:"Email *",t:"email" },{ k:"phone" as const,l:"Phone",t:"tel" },{ k:"jobTitle" as const,l:"Job Title",t:"text" }].map(f=>(
                <div key={f.k}><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>{f.l}</label>
                <input value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} type={f.t} style={{ width:"100%",padding:"9px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none",boxSizing:"border-box" as const }}/></div>
              ))}
              <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Role *</label>
              <select value={form.roleId} onChange={e=>setForm({...form,roleId:e.target.value})} style={{ width:"100%",padding:"9px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none" }}>
                <option value="">Select role…</option>
                {roles.filter((r:any)=>!["system-admin"].includes(r.name)).map((r:any)=>(
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select></div>
            </div>
            <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:18 }}>
              <button onClick={()=>setShowAdd(false)} style={{ padding:"9px 18px",borderRadius:9,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:12,color:"#374151",fontWeight:600 }}>Cancel</button>
              <button onClick={handleCreate} style={{ display:"flex",alignItems:"center",gap:5,padding:"9px 22px",background:"linear-gradient(135deg,#059669,#0891b2)",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:700 }}>
                <UserPlus size={13}/>Create + Send Welcome Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HR Delegation Modal */}
      {showDelegate && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1200,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:"white",borderRadius:16,padding:"24px 26px",width:"100%",maxWidth:480,boxShadow:"0 24px 64px rgba(0,0,0,0.22)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
              <div style={{ fontWeight:800,fontSize:15,color:"#0f172a" }}>🏆 HR Delegation Settings</div>
              <button onClick={()=>setShowDelegate(false)} style={{ border:"none",background:"none",cursor:"pointer",color:"#64748b" }}><X size={17}/></button>
            </div>
            <div style={{ fontSize:12,color:"#64748b",marginBottom:14,lineHeight:1.6 }}>
              Delegate HR management authority to a staff member. They will be able to manage staff records, assign positions, and conduct performance reviews under your oversight.
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:6 }}>Select HR Manager</label>
              <select value={delegateTarget} onChange={e=>setDelegateTarget(e.target.value)} style={{ width:"100%",padding:"9px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none" }}>
                <option value="">Choose staff member…</option>
                {staff.map((s:any)=>(
                  <option key={s.id} value={s.id}>{`${s.firstName||""} ${s.lastName||""}`.trim()||s.email} — {s.roleLabel||s.roleName}</option>
                ))}
              </select>
            </div>
            <div style={{ background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:9,padding:"10px 14px",fontSize:11,color:"#065f46",marginBottom:16,lineHeight:1.7 }}>
              ✅ Can create new staff accounts<br/>
              ✅ Can update staff positions and roles<br/>
              ✅ Can manage staff contracts and records<br/>
              🔒 Cannot delete staff permanently<br/>
              🔒 All actions audited under your account
            </div>
            <div style={{ display:"flex",gap:8,justifyContent:"flex-end" }}>
              <button onClick={()=>setShowDelegate(false)} style={{ padding:"9px 18px",borderRadius:9,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:12,color:"#374151",fontWeight:600 }}>Cancel</button>
              <button onClick={()=>{show("HR delegation saved — staff notified","success");setShowDelegate(false);}} style={{ display:"flex",alignItems:"center",gap:5,padding:"9px 20px",background:"#059669",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:12,fontWeight:700 }}>
                <Award size={13}/>Save Delegation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
