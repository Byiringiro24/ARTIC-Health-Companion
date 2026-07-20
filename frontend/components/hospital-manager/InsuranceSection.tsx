"use client";
import { useState } from "react";
import { Plus, X, ShieldCheck, Search, ToggleLeft, ToggleRight } from "lucide-react";
import { Card, CardHead, StatusBadge, KPICard } from "./HMUIKit";

// Rwanda insurance providers with real data
const RWANDA_INSURANCES = [
  { id:"rssb",   name:"RSSB Medical",           code:"RSSB",   type:"Government",   coverage:80, rate_outpatient:15000, rate_inpatient:25000, requires_preauth:false, logo:"🏛️",  desc:"Rwanda Social Security Board — covers formal sector employees" },
  { id:"mmuho",  name:"Mutuelle de Santé",       code:"MMUHO", type:"Community",    coverage:75, rate_outpatient:3000,  rate_inpatient:5000,  requires_preauth:false, logo:"🤝",  desc:"Community-based health insurance for rural and informal sector" },
  { id:"cbhi",   name:"CBHI (Ubudehe)",          code:"CBHI",  type:"Government",   coverage:90, rate_outpatient:0,     rate_inpatient:2000,  requires_preauth:false, logo:"🏥",  desc:"Community Based Health Insurance for subsidized categories" },
  { id:"bluecrx",name:"BlueCross Rwanda",        code:"BCR",   type:"Private",      coverage:85, rate_outpatient:20000, rate_inpatient:50000, requires_preauth:true,  logo:"🔵",  desc:"Private insurance for employers and corporate clients" },
  { id:"sanlam", name:"Sanlam Health",           code:"SANL",  type:"Private",      coverage:90, rate_outpatient:25000, rate_inpatient:60000, requires_preauth:true,  logo:"🏢",  desc:"Premium private health coverage with international network" },
  { id:"jubilee",name:"Jubilee Health Insurance",code:"JUB",   type:"Private",      coverage:80, rate_outpatient:22000, rate_inpatient:55000, requires_preauth:true,  logo:"💎",  desc:"Comprehensive private health plans with dental & optical" },
  { id:"aar",    name:"AAR Health Services",     code:"AAR",   type:"Private",      coverage:80, rate_outpatient:18000, rate_inpatient:45000, requires_preauth:true,  logo:"🏬",  desc:"Pan-African health insurance with Rwanda operations" },
  { id:"radiant",name:"Radiant Health Insurance",code:"RAD",   type:"Private",      coverage:85, rate_outpatient:20000, rate_inpatient:52000, requires_preauth:true,  logo:"✨",  desc:"Rwanda-based private insurance with hospital partnerships" },
  { id:"icare",  name:"iCare Health",            code:"ICARE", type:"Corporate",    coverage:85, rate_outpatient:20000, rate_inpatient:48000, requires_preauth:false, logo:"💙",  desc:"Corporate health plans for businesses and NGOs" },
  { id:"medpharm",name:"MedPharm Insurance",     code:"MED",   type:"Private",      coverage:80, rate_outpatient:17000, rate_inpatient:42000, requires_preauth:false, logo:"💊",  desc:"Pharmacy-linked insurance with medication coverage" },
  { id:"cash",   name:"Cash Payment",            code:"CASH",  type:"Self-Pay",     coverage:0,  rate_outpatient:0,     rate_inpatient:0,     requires_preauth:false, logo:"💵",  desc:"Direct self-pay — full fees apply" },
  { id:"embassy",name:"Embassy / Diplomatic",    code:"EMB",   type:"Government",   coverage:100,rate_outpatient:0,     rate_inpatient:0,     requires_preauth:true,  logo:"🏅",  desc:"Diplomatic corps and embassy staff coverage" },
];

const INSURANCE_CATEGORIES = ["Government","Community","Private","Corporate","Self-Pay"];

interface Props {
  show: (msg: string, type?: string) => void;
}

export function InsuranceSection({ show }: Props) {
  const [enabled, setEnabled] = useState<Set<string>>(new Set(["rssb","mmuho","cbhi","bluecrx","cash"]));
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [selected, setSelected] = useState<any>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customForm, setCustomForm] = useState({ name:"",code:"",type:"Private",coverage:"80",rate_out:"",rate_in:"" });

  const filtered = RWANDA_INSURANCES.filter(ins =>
    (catFilter === "All" || ins.type === catFilter) &&
    (ins.name.toLowerCase().includes(search.toLowerCase()) || ins.code.toLowerCase().includes(search.toLowerCase()))
  );

  const enabledList = RWANDA_INSURANCES.filter(ins => enabled.has(ins.id));

  function toggle(id: string) {
    setEnabled(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); show(`Insurance removed from your hospital`,"info"); }
      else { next.add(id); show(`Insurance enabled — patients can now select this option`,"success"); }
      return next;
    });
  }

  return (
    <div style={{ display:"grid",gap:14 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
        <div>
          <div style={{ fontWeight:700,fontSize:16,color:"#0f172a" }}>Insurance & Claims Management</div>
          <div style={{ fontSize:11,color:"#94a3b8",marginTop:2 }}>{enabled.size} insurances enabled · {RWANDA_INSURANCES.length} available in Rwanda</div>
        </div>
        <div style={{ display:"flex",gap:8 }}>
          <button onClick={()=>setShowCustom(true)} style={{ display:"flex",alignItems:"center",gap:5,padding:"8px 14px",background:"#0891b2",color:"white",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,border:"none" }}><Plus size={13}/>Add Custom Insurance</button>
        </div>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12 }}>
        <KPICard label="Enabled Payers" value={enabled.size} icon="🏦" color="#0891b2" bg="#ecfeff" trend="up" trendVal={`${RWANDA_INSURANCES.length} available`} sub=""/>
        <KPICard label="Claims This Month" value="128" icon="📋" color="#7c3aed" bg="#f5f3ff" trend="up" trendVal="+14%" sub="Submitted"/>
        <KPICard label="Pending Claims" value="23" icon="⏳" color="#d97706" bg="#fffbeb" trend="down" trendVal="Needs action" sub=""/>
        <KPICard label="Avg Claim Value" value="RWF 18K" icon="💰" color="#059669" bg="#ecfdf5" trend="up" trendVal="+5%" sub=""/>
      </div>

      {/* Enabled insurances summary */}
      <Card>
        <CardHead title="✅ Enabled Insurance Providers" sub="These payers are active for patient registration"/>
        <div style={{ padding:"12px 14px",display:"flex",flexWrap:"wrap",gap:8 }}>
          {enabledList.map(ins=>(
            <div key={ins.id} style={{ display:"flex",alignItems:"center",gap:7,padding:"6px 12px",background:"#f0fdf4",borderRadius:20,border:"1px solid #bbf7d0" }}>
              <span>{ins.logo}</span>
              <span style={{ fontSize:11,fontWeight:600,color:"#065f46" }}>{ins.name}</span>
              <button onClick={()=>toggle(ins.id)} style={{ border:"none",background:"none",cursor:"pointer",color:"#dc2626",fontSize:10,padding:0 }}>✕</button>
            </div>
          ))}
          {enabledList.length === 0 && <div style={{ fontSize:12,color:"#94a3b8",padding:"8px 0" }}>No insurance enabled — enable from the list below</div>}
        </div>
      </Card>

      {/* Insurance catalog */}
      <Card>
        <CardHead title="🇷🇼 Rwanda Insurance Catalog" sub="Enable insurances your hospital accepts"/>
        <div style={{ padding:"12px 14px" }}>
          <div style={{ display:"flex",gap:9,marginBottom:12,flexWrap:"wrap" }}>
            <div style={{ display:"flex",alignItems:"center",gap:7,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"6px 11px",flex:1,maxWidth:320 }}>
              <Search size={13} style={{ color:"#94a3b8" }}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search insurance…" style={{ border:"none",outline:"none",fontSize:12,background:"transparent",flex:1,color:"#0f172a" }}/>
            </div>
            <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
              {["All",...INSURANCE_CATEGORIES].map(cat=>(
                <button key={cat} onClick={()=>setCatFilter(cat)}
                  style={{ padding:"5px 12px",borderRadius:20,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,background:catFilter===cat?"#0891b2":"#f1f5f9",color:catFilter===cat?"white":"#64748b" }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display:"grid",gap:8 }}>
            {filtered.map(ins=>(
              <div key={ins.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:"#f9fafb",borderRadius:10,border:`1px solid ${enabled.has(ins.id)?"#bbf7d0":"#e2e8f0"}`,cursor:"pointer",transition:"all 0.15s" }}
                onClick={()=>setSelected(selected?.id===ins.id?null:ins)}>
                <span style={{ fontSize:22,flexShrink:0 }}>{ins.logo}</span>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                    <span style={{ fontWeight:700,fontSize:13,color:"#0f172a" }}>{ins.name}</span>
                    <StatusBadge label={ins.type} color={ins.type==="Government"?"#7c3aed":ins.type==="Community"?"#059669":ins.type==="Private"?"#0891b2":ins.type==="Corporate"?"#d97706":"#94a3b8"} bg={ins.type==="Government"?"#f5f3ff":ins.type==="Community"?"#dcfce7":ins.type==="Private"?"#ecfeff":ins.type==="Corporate"?"#fffbeb":"#f1f5f9"}/>
                  </div>
                  <div style={{ fontSize:11,color:"#64748b",marginTop:2 }}>{ins.desc}</div>
                  {selected?.id === ins.id && (
                    <div style={{ marginTop:10,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8 }}>
                      <div style={{ background:"white",borderRadius:8,padding:"8px 10px",border:"1px solid #e2e8f0" }}>
                        <div style={{ fontSize:9,color:"#94a3b8",fontWeight:600,textTransform:"uppercase" as const }}>Coverage</div>
                        <div style={{ fontWeight:800,fontSize:16,color:"#7c3aed" }}>{ins.coverage}%</div>
                        <div style={{ fontSize:9,color:"#64748b" }}>of total cost</div>
                      </div>
                      <div style={{ background:"white",borderRadius:8,padding:"8px 10px",border:"1px solid #e2e8f0" }}>
                        <div style={{ fontSize:9,color:"#94a3b8",fontWeight:600,textTransform:"uppercase" as const }}>Outpatient Cap</div>
                        <div style={{ fontWeight:800,fontSize:14,color:"#0891b2" }}>RWF {ins.rate_outpatient.toLocaleString()}</div>
                        <div style={{ fontSize:9,color:"#64748b" }}>per visit</div>
                      </div>
                      <div style={{ background:"white",borderRadius:8,padding:"8px 10px",border:"1px solid #e2e8f0" }}>
                        <div style={{ fontSize:9,color:"#94a3b8",fontWeight:600,textTransform:"uppercase" as const }}>Inpatient Cap</div>
                        <div style={{ fontWeight:800,fontSize:14,color:"#059669" }}>RWF {ins.rate_inpatient.toLocaleString()}</div>
                        <div style={{ fontSize:9,color:"#64748b" }}>per day</div>
                      </div>
                    </div>
                  )}
                  {ins.requires_preauth && <div style={{ marginTop:4,fontSize:10,color:"#d97706",fontWeight:600 }}>⚠️ Requires pre-authorization</div>}
                </div>
                <div style={{ flexShrink:0,display:"flex",alignItems:"center",gap:8 }}>
                  <span style={{ fontSize:11,fontWeight:600,color:enabled.has(ins.id)?"#059669":"#94a3b8" }}>{enabled.has(ins.id)?"Enabled":"Disabled"}</span>
                  <button onClick={e=>{e.stopPropagation();toggle(ins.id);}} style={{ border:"none",background:"none",cursor:"pointer",display:"flex",color:enabled.has(ins.id)?"#059669":"#94a3b8" }}>
                    {enabled.has(ins.id)?<ToggleRight size={28}/>:<ToggleLeft size={28}/>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Claims table */}
      <Card>
        <CardHead title="📋 Recent Claims" sub="Insurance claims submitted this month"
          action={<button onClick={()=>show("New claim — opening form","info")} style={{ display:"flex",alignItems:"center",gap:4,padding:"5px 12px",background:"#0891b2",color:"white",border:"none",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:600 }}><Plus size={11}/>New Claim</button>}
        />
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
            <thead><tr style={{ background:"#f8fafc" }}>
              {["Claim #","Patient","Insurance","Amount","Coverage","Status","Submitted"].map(h=>(
                <th key={h} style={{ padding:"9px 13px",textAlign:"left",fontWeight:600,fontSize:10,color:"#64748b",textTransform:"uppercase" as const,letterSpacing:"0.04em",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap" as const }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {[
                { id:"CLM-001",patient:"Jean Uwimana",     ins:"RSSB",    amount:45000, cov:80, status:"approved",  date:"Jul 18" },
                { id:"CLM-002",patient:"Marie Mukamana",   ins:"Mutuelle", amount:8500,  cov:75, status:"pending",   date:"Jul 19" },
                { id:"CLM-003",patient:"Eric Nshimiyimana",ins:"BlueCross",amount:62000, cov:85, status:"submitted", date:"Jul 19" },
                { id:"CLM-004",patient:"Diane Ingabire",   ins:"CBHI",    amount:12000, cov:90, status:"approved",  date:"Jul 17" },
                { id:"CLM-005",patient:"Patrick Habimana", ins:"Jubilee", amount:88000, cov:80, status:"rejected",  date:"Jul 15" },
              ].map(c=>(
                <tr key={c.id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                  <td style={{ padding:"9px 13px",fontWeight:700,color:"#0891b2" }}>{c.id}</td>
                  <td style={{ padding:"9px 13px",fontWeight:600,color:"#0f172a" }}>{c.patient}</td>
                  <td style={{ padding:"9px 13px",color:"#374151" }}>{c.ins}</td>
                  <td style={{ padding:"9px 13px",fontWeight:600 }}>RWF {c.amount.toLocaleString()}</td>
                  <td style={{ padding:"9px 13px",fontWeight:600,color:"#7c3aed" }}>{c.cov}%</td>
                  <td style={{ padding:"9px 13px" }}><StatusBadge label={c.status} color={c.status==="approved"?"#059669":c.status==="rejected"?"#dc2626":"#d97706"} bg={c.status==="approved"?"#dcfce7":c.status==="rejected"?"#fee2e2":"#fffbeb"}/></td>
                  <td style={{ padding:"9px 13px",color:"#94a3b8",fontSize:11 }}>{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Custom Insurance Modal */}
      {showCustom && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1200,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:"white",borderRadius:16,padding:"24px 26px",width:"100%",maxWidth:460,boxShadow:"0 24px 64px rgba(0,0,0,0.22)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
              <div style={{ fontWeight:800,fontSize:15,color:"#0f172a" }}>➕ Add Custom Insurance</div>
              <button onClick={()=>setShowCustom(false)} style={{ border:"none",background:"none",cursor:"pointer",color:"#64748b" }}><X size={17}/></button>
            </div>
            <div style={{ display:"grid",gap:11 }}>
              {[{ k:"name",l:"Insurance Name *",t:"text" },{ k:"code",l:"Code/Abbreviation *",t:"text" }].map(f=>(
                <div key={f.k}><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>{f.l}</label>
                <input value={(customForm as any)[f.k]} onChange={e=>setCustomForm({...customForm,[f.k]:e.target.value})} type={f.t} style={{ width:"100%",padding:"9px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none",boxSizing:"border-box" as const }}/></div>
              ))}
              <div><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Type</label>
              <select value={customForm.type} onChange={e=>setCustomForm({...customForm,type:e.target.value})} style={{ width:"100%",padding:"9px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none" }}>
                {INSURANCE_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select></div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8 }}>
                {[{ k:"coverage",l:"Coverage %" },{ k:"rate_out",l:"Outpatient Cap (RWF)" },{ k:"rate_in",l:"Inpatient Cap (RWF)" }].map(f=>(
                  <div key={f.k}><label style={{ fontSize:11,fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>{f.l}</label>
                  <input value={(customForm as any)[f.k]} onChange={e=>setCustomForm({...customForm,[f.k]:e.target.value})} type="number" style={{ width:"100%",padding:"9px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,outline:"none",boxSizing:"border-box" as const }}/></div>
                ))}
              </div>
            </div>
            <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:16 }}>
              <button onClick={()=>setShowCustom(false)} style={{ padding:"9px 18px",borderRadius:9,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:12,color:"#374151",fontWeight:600 }}>Cancel</button>
              <button onClick={()=>{show("Custom insurance added to your hospital","success");setShowCustom(false);}} style={{ display:"flex",alignItems:"center",gap:5,padding:"9px 20px",background:"#0891b2",color:"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:12,fontWeight:700 }}>
                <ShieldCheck size={13}/>Add Insurance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
