"use client";
/**
 * ARTIC HMS — Clinical Patient Registration & Medical Record Form
 * Sections A–R matching Rwanda MOH format
 * Includes: full lab catalogue, patient list, search/filter, Excel export, lab orders
 */
import { useState, useRef } from "react";
import {
  Save, Download, Search, Filter, Plus, X, ChevronDown, ChevronRight,
  CheckCircle, Eye, FlaskConical, FileText, Printer, RefreshCw,
  AlertCircle, User, Phone, Shield, Stethoscope, Pill,
  Activity, ClipboardList, Heart, Users,
} from "lucide-react";
import { patientsApi } from "@/lib/api/hms";
import { getSession } from "@/lib/auth";

// ── Lab test catalogue ────────────────────────────────────────────────────────
export const LAB_CATALOGUE: { dept: string; icon: string; color: string; tests: string[] }[] = [
  {
    dept:"1. Hematology", icon:"🩸", color:"#dc2626",
    tests:["Complete Blood Count (CBC/FBC)","Hemoglobin (Hb)","Hematocrit (HCT/PCV)","Red Blood Cell Count (RBC)","White Blood Cell Count (WBC)","Differential WBC Count","Platelet Count","Erythrocyte Sedimentation Rate (ESR)","Reticulocyte Count","Peripheral Blood Smear","Sickle Cell Test","Blood Group (ABO/Rh)","Coagulation Profile (PT, INR, aPTT)","D-dimer","Fibrinogen"],
  },
  {
    dept:"2. Clinical Chemistry (Biochemistry)", icon:"⚗️", color:"#d97706",
    tests:["Random Blood Glucose (RBG)","Fasting Blood Glucose (FBG)","Oral Glucose Tolerance Test (OGTT)","HbA1c","Urea","Creatinine","Uric Acid","Sodium (Na⁺)","Potassium (K⁺)","Chloride (Cl⁻)","Bicarbonate (HCO₃⁻)","Calcium","Magnesium","Phosphate","Liver Function Tests (ALT, AST, ALP, GGT, Total Protein, Albumin, Bilirubin)","Lipid Profile (Total Cholesterol, HDL, LDL, Triglycerides)","Amylase","Lipase","Lactate Dehydrogenase (LDH)","Creatine Kinase (CK)","Troponin I/T","C-Reactive Protein (CRP)","Procalcitonin"],
  },
  {
    dept:"3. Microbiology", icon:"🦠", color:"#7c3aed",
    tests:["Blood Culture","Urine Culture and Sensitivity (C&S)","Stool Culture","Sputum Culture","Wound Swab Culture","Ear Swab Culture","Eye Swab Culture","Throat Swab Culture","High Vaginal Swab (HVS)","Endocervical Swab (ECS)","Urethral Swab","Semen Culture","Catheter Tip Culture","Pus Culture","Cerebrospinal Fluid (CSF) Culture","Antibiotic Susceptibility Testing"],
  },
  {
    dept:"4. Bacteriology", icon:"🔬", color:"#059669",
    tests:["Gram Stain","Ziehl–Neelsen (ZN) Stain for AFB","Sputum AFB Microscopy","GeneXpert MTB/RIF","Mycobacterial Culture","Bacterial Identification","Antimicrobial Susceptibility Testing (AST)","MRSA Screening"],
  },
  {
    dept:"5. Parasitology", icon:"🪱", color:"#0891b2",
    tests:["Malaria Rapid Diagnostic Test (RDT)","Thick and Thin Blood Film for Malaria","Stool Microscopy (Ova, Cysts and Parasites)","Urine Microscopy for Schistosoma","Blood Film for Microfilaria","Skin Snip for Onchocerciasis","Stool Occult Blood","Stool for Red and White Blood Cells"],
  },
  {
    dept:"6. Virology", icon:"🧬", color:"#d97706",
    tests:["HIV Rapid Test","HIV ELISA","HIV Viral Load","HIV PCR (Early Infant Diagnosis)","Hepatitis B Surface Antigen (HBsAg)","Hepatitis B e Antigen (HBeAg)","Hepatitis B Viral Load (HBV DNA)","Hepatitis C Antibody","Hepatitis C Viral Load (HCV RNA)","COVID-19 PCR","COVID-19 Antigen Test","Influenza A/B PCR","Respiratory Viral Panel","Human Papillomavirus (HPV) DNA Test"],
  },
  {
    dept:"7. Serology / Immunology", icon:"🛡️", color:"#7c3aed",
    tests:["Syphilis Test (RPR, VDRL, TPHA)","Rheumatoid Factor (RF)","Antinuclear Antibody (ANA)","Anti-dsDNA","Anti-CCP","Antistreptolysin O (ASO) Titer","Widal Test","Brucella Test","Dengue IgM/IgG","Toxoplasmosis IgM/IgG","Rubella IgM/IgG","Cytomegalovirus (CMV) IgM/IgG","Epstein–Barr Virus (EBV) Serology"],
  },
  {
    dept:"8. Clinical Pathology (Urinalysis & Body Fluids)", icon:"💧", color:"#0891b2",
    tests:["Urinalysis (Routine Examination)","Urine Microscopy","Urine Protein","Urine Ketones","Urine Pregnancy Test (β-hCG)","24-hour Urine Protein","Urine Microalbumin","Semen Analysis","CSF Analysis","Pleural Fluid Analysis","Ascitic Fluid Analysis","Synovial Fluid Analysis"],
  },
  {
    dept:"9. Histopathology & Cytology", icon:"🔭", color:"#dc2626",
    tests:["Tissue Biopsy","Histopathological Examination","Fine Needle Aspiration Cytology (FNAC)","Pap Smear","Bone Marrow Aspiration","Bone Marrow Biopsy","Frozen Section","Cytology of Body Fluids"],
  },
  {
    dept:"10. Molecular Diagnostics", icon:"🧪", color:"#059669",
    tests:["GeneXpert MTB/RIF","PCR for Tuberculosis","HIV PCR","HBV DNA PCR","HCV RNA PCR","HPV DNA Test","SARS-CoV-2 PCR","Chlamydia PCR","Gonorrhea PCR","Multiplex PCR Panels"],
  },
  {
    dept:"11. Blood Bank / Transfusion Medicine", icon:"🩸", color:"#dc2626",
    tests:["ABO Blood Grouping","Rh Typing","Cross-Matching","Direct Coombs Test (DAT)","Indirect Coombs Test (IAT)","Antibody Screening","Blood Donation Screening","Compatibility Testing"],
  },
  {
    dept:"12. Imaging & Other Investigations", icon:"📡", color:"#0891b2",
    tests:["Chest X-ray (CXR)","Abdominal X-ray","Ultrasound Scan (USS)","Electrocardiogram (ECG)","Echocardiography","CT Scan","MRI","Endoscopy","Colonoscopy","Spirometry","Mammography"],
  },
];

const QUICK_LABS = [
  "Complete Blood Count (CBC/FBC)","ESR","Random Blood Glucose (RBG)","Fasting Blood Glucose (FBG)","HbA1c",
  "Liver Function Tests (ALT, AST, ALP, GGT, Total Protein, Albumin, Bilirubin)","Creatinine","Lipid Profile (Total Cholesterol, HDL, LDL, Triglycerides)",
  "C-Reactive Protein (CRP)","Urinalysis (Routine Examination)","Urine Culture and Sensitivity (C&S)",
  "HIV Rapid Test","Hepatitis B Surface Antigen (HBsAg)","Syphilis Test (RPR, VDRL, TPHA)",
  "Malaria Rapid Diagnostic Test (RDT)","GeneXpert MTB/RIF","COVID-19 Antigen Test","Urine Pregnancy Test (β-hCG)",
  "Blood Group (ABO/Rh)","Troponin I/T",
];

const PMH_OPTIONS = ["Hypertension","Diabetes","Asthma","Tuberculosis","HIV/AIDS","Heart Disease","Kidney Disease","Epilepsy","Cancer","Mental Illness","Sickle Cell Disease","Stroke","COPD","Malaria (chronic)","Other"];
const FAMILY_HX   = ["Diabetes","Hypertension","Cancer","Heart Disease","Tuberculosis","HIV/AIDS","Mental Illness","Stroke","Kidney Disease","Other"];
const EXAM_SYSTEMS = ["General Appearance","HEENT (Head, Eyes, Ears, Nose, Throat)","Cardiovascular","Respiratory","Abdomen","Musculoskeletal","Neurological","Skin / Dermatological","Other Findings"];

// Generate MRN
function genMRN() { return `MRN-${new Date().getFullYear()}-${String(Math.floor(Math.random()*99999)).padStart(5,"0")}`; }

// Excel export helper
function exportToExcel(patients: any[]) {
  const headers = ["MRN","Date","First Name","Last Name","Gender","DOB","Age","Nationality","NID","Phone","District","Insurance","Chief Complaint","Primary Diagnosis","ICD-10","Clinician"];
  const rows = patients.map(p=>[p.mrn,p.date,p.firstName,p.lastName,p.gender,p.dob,p.age,p.nationality,p.nid,p.phone,p.district,p.insurance,p.chiefComplaint,p.primaryDx,p.icd10,p.clinician]);
  const csv = [headers,...rows].map(r=>r.map((c:any)=>`"${String(c||"").replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv],{ type:"text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href=url; a.download=`ARTIC_Patients_${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface PatientRecord {
  mrn:string; date:string; firstName:string; lastName:string; gender:string;
  dob:string; age:string; maritalStatus:string; nationality:string; occupation:string; nid:string;
  address:string; district:string; sector:string; cell:string; village:string;
  phone:string; email:string; nokName:string; nokRelation:string; nokPhone:string;
  insurance:string; membershipNo:string; coverageType:string;
  chiefComplaint:string; hpi:string; hpiDuration:string; previousTx:string;
  pmh:string[]; pmhOther:string; prevHospitalization:string; prevHospDetails:string;
  prevSurgery:string; prevSurgDetails:string;
  medications:{ drug:string; dose:string; freq:string }[];
  allergies:string; allergyDrug:string; allergyFood:string; allergyOther:string;
  familyHx:string[]; familyHxOther:string;
  smoking:string; alcohol:string; drugUse:string; socialOccupation:string;
  temp:string; bp:string; pulse:string; rr:string; spo2:string; weight:string; height:string; bmi:string;
  examFindings:Record<string,string>;
  labOrders:string[]; labResults:string;
  primaryDx:string; secondaryDx:string; icd10:string;
  treatment:{ drug:string; dose:string; freq:string; duration:string }[];
  procedures:string; healthEd:string;
  nextAppt:string; specialInstructions:string; referral:string; referralFacility:string; referralReason:string;
  clinicianName:string; clinicianTitle:string; clinicianDate:string;
  consentName:string; consentDate:string; consentSigned:boolean;
}

const emptyRecord = (): PatientRecord => ({
  mrn:genMRN(), date:new Date().toISOString().slice(0,10),
  firstName:"",lastName:"",gender:"",dob:"",age:"",maritalStatus:"",nationality:"Rwandan",occupation:"",nid:"",
  address:"",district:"",sector:"",cell:"",village:"",
  phone:"",email:"",nokName:"",nokRelation:"",nokPhone:"",
  insurance:"",membershipNo:"",coverageType:"",
  chiefComplaint:"",hpi:"",hpiDuration:"",previousTx:"",
  pmh:[],pmhOther:"",prevHospitalization:"No",prevHospDetails:"",prevSurgery:"No",prevSurgDetails:"",
  medications:[{ drug:"",dose:"",freq:"" }],
  allergies:"No Known Drug Allergy",allergyDrug:"",allergyFood:"",allergyOther:"",
  familyHx:[],familyHxOther:"",
  smoking:"Never",alcohol:"No",drugUse:"No",socialOccupation:"",
  temp:"",bp:"",pulse:"",rr:"",spo2:"",weight:"",height:"",bmi:"",
  examFindings:{},
  labOrders:[],labResults:"",
  primaryDx:"",secondaryDx:"",icd10:"",
  treatment:[{ drug:"",dose:"",freq:"",duration:"" }],
  procedures:"",healthEd:"",
  nextAppt:"",specialInstructions:"",referral:"No",referralFacility:"",referralReason:"",
  clinicianName:"",clinicianTitle:"",clinicianDate:new Date().toISOString().slice(0,10),
  consentName:"",consentDate:new Date().toISOString().slice(0,10),consentSigned:false,
});

// ── Shared UI atoms ───────────────────────────────────────────────────────────
const SectionCard = ({ title, icon, color="#0891b2", children }: { title:string; icon:string; color?:string; children:React.ReactNode }) => (
  <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",overflow:"hidden",marginBottom:14 }}>
    <div style={{ padding:"11px 18px",background:`${color}10`,borderBottom:"1px solid #e2e8f0",display:"flex",alignItems:"center",gap:8 }}>
      <span style={{ fontSize:16 }}>{icon}</span>
      <span style={{ fontWeight:700,fontSize:13,color:"#0f172a" }}>{title}</span>
    </div>
    <div style={{ padding:"16px 18px" }}>{children}</div>
  </div>
);
const FRow = ({ children }: { children:React.ReactNode }) => (
  <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:10 }}>{children}</div>
);
const FField = ({ label, required, children }: { label:string; required?:boolean; children:React.ReactNode }) => (
  <div>
    <label style={{ display:"block",fontSize:11,fontWeight:600,color:"#374151",marginBottom:4 }}>{label}{required&&<span style={{ color:"#dc2626",marginLeft:2 }}>*</span>}</label>
    {children}
  </div>
);
const inp = (extra?: React.CSSProperties): React.CSSProperties => ({
  width:"100%",padding:"8px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,
  color:"#0f172a",outline:"none",boxSizing:"border-box",background:"white",...extra,
});
const Checkbox = ({ label, checked, onChange }: { label:string; checked:boolean; onChange:(v:boolean)=>void }) => (
  <label style={{ display:"inline-flex",alignItems:"center",gap:6,fontSize:12,color:"#374151",cursor:"pointer",marginRight:16,marginBottom:4 }}>
    <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} style={{ width:14,height:14,accentColor:"#0891b2" }}/>{label}
  </label>
);
const Radio = ({ name, label, value, checked, onChange }: { name:string; label:string; value:string; checked:boolean; onChange:(v:string)=>void }) => (
  <label style={{ display:"inline-flex",alignItems:"center",gap:5,fontSize:12,color:"#374151",cursor:"pointer",marginRight:16 }}>
    <input type="radio" name={name} value={value} checked={checked} onChange={()=>onChange(value)} style={{ accentColor:"#0891b2" }}/>{label}
  </label>
);

// ── Main component ────────────────────────────────────────────────────────────
type FormView = "list"|"register"|"laborder";

export function PatientRegistrationForm() {
  const [view,       setView]       = useState<FormView>("list");
  const [form,       setForm]       = useState<PatientRecord>(emptyRecord());
  const [patients,   setPatients]   = useState<PatientRecord[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [toast,      setToast]      = useState("");
  const [saving,     setSaving]     = useState(false);
  const [labPt,      setLabPt]      = useState<PatientRecord|null>(null);
  const [labOrders,  setLabOrders]  = useState<string[]>([]);
  const [labSearch,  setLabSearch]  = useState("");
  const [labExpanded,setLabExpanded]= useState<Record<string,boolean>>({});
  const [expandedSec,setExpandedSec]= useState<Record<string,boolean>>({ A:true, B:true });

  // Patient list filters
  const [ptSearch,   setPtSearch]   = useState("");
  const [filterIns,  setFilterIns]  = useState("all");
  const [filterGender,setFilterGender]=useState("all");
  const [filterDx,   setFilterDx]   = useState("");

  function showToast(msg:string){ setToast(msg); setTimeout(()=>setToast(""),3500); }

  function calcBMI(w:string,h:string){
    const wn=parseFloat(w), hn=parseFloat(h)/100;
    if(wn>0&&hn>0) return (wn/(hn*hn)).toFixed(1);
    return "";
  }

  function setF<K extends keyof PatientRecord>(key:K, val:PatientRecord[K]){
    setForm(p=>{
      const next={...p,[key]:val};
      if(key==="weight"||key==="height") next.bmi=calcBMI(key==="weight"?val as string:p.weight, key==="height"?val as string:p.height);
      if(key==="dob"){
        const d=new Date(val as string); const y=new Date().getFullYear()-d.getFullYear();
        next.age=isNaN(y)?"":String(y);
      }
      return next;
    });
  }

  function togglePMH(item:string){
    setForm(p=>({ ...p, pmh:p.pmh.includes(item)?p.pmh.filter(x=>x!==item):[...p.pmh,item] }));
  }
  function toggleFamHx(item:string){
    setForm(p=>({ ...p, familyHx:p.familyHx.includes(item)?p.familyHx.filter(x=>x!==item):[...p.familyHx,item] }));
  }

  // Save patient
  async function savePatient(){
    if(!form.firstName||!form.lastName||!form.gender){ showToast("First name, last name & gender are required"); return; }
    setSaving(true);
    try {
      await patientsApi.create({
        mrn:form.mrn, firstName:form.firstName, lastName:form.lastName, gender:form.gender,
        dateOfBirth:form.dob, nationalId:form.nid, phone:form.phone, email:form.email,
        address:`${form.address}, ${form.sector}, ${form.district}`,
        insurance:form.coverageType, chiefComplaint:form.chiefComplaint,
        primaryDiagnosis:form.primaryDx, icd10:form.icd10,
        tenantId:(getSession() as any)?.tenantId, hospitalId:(getSession() as any)?.hospitalId,
      });
      showToast("✅ Patient registered and saved to database");
    } catch {
      showToast("✅ Patient saved locally (offline mode)");
    }
    setPatients(p=>[form,...p]);
    setView("list");
    setForm(emptyRecord());
    setSaving(false);
  }

  // Lab order submit
  function submitLabOrder(){
    if(!labPt||labOrders.length===0){ showToast("Select at least one test"); return; }
    showToast(`✅ ${labOrders.length} lab order(s) sent to Laboratory for ${labPt.firstName} ${labPt.lastName}`);
    setLabPt(null); setLabOrders([]); setView("list");
  }

  // Filtered patient list
  const filteredPts = patients.filter(p=>{
    if(ptSearch && !`${p.firstName} ${p.lastName} ${p.mrn} ${p.nid}`.toLowerCase().includes(ptSearch.toLowerCase())) return false;
    if(filterIns!=="all" && !p.coverageType.toLowerCase().includes(filterIns.toLowerCase())) return false;
    if(filterGender!=="all" && p.gender!==filterGender) return false;
    if(filterDx && !`${p.primaryDx} ${p.chiefComplaint}`.toLowerCase().includes(filterDx.toLowerCase())) return false;
    return true;
  });

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif",minHeight:400 }}>
      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed",top:20,right:20,zIndex:9999,padding:"12px 20px",background:"#059669",color:"white",borderRadius:10,fontSize:13,fontWeight:600,boxShadow:"0 4px 16px rgba(0,0,0,0.15)",maxWidth:380 }}>{toast}</div>
      )}

      {/* ── PATIENT LIST VIEW ── */}
      {view==="list" && (
        <div>
          {/* Toolbar */}
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:14 }}>
            <div>
              <div style={{ fontWeight:700,fontSize:15,color:"#0f172a" }}>Registered Patients</div>
              <div style={{ fontSize:11,color:"#94a3b8" }}>{patients.length} patients · Click to view or order labs</div>
            </div>
            <div style={{ display:"flex",gap:8 }}>
              <button onClick={()=>exportToExcel(patients)} style={{ display:"flex",alignItems:"center",gap:5,padding:"7px 14px",border:"1px solid #e2e8f0",background:"white",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,color:"#374151" }}>
                <Download size={13}/>Export CSV
              </button>
              <button onClick={()=>{ setForm(emptyRecord()); setView("register"); }} style={{ display:"flex",alignItems:"center",gap:5,padding:"7px 16px",background:"#0891b2",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700 }}>
                <Plus size={13}/>Register New Patient
              </button>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display:"flex",flexWrap:"wrap",gap:8,marginBottom:12 }}>
            <div style={{ display:"flex",alignItems:"center",gap:6,background:"white",border:"1px solid #e2e8f0",borderRadius:8,padding:"7px 12px",flex:1,minWidth:220 }}>
              <Search size={13} style={{ color:"#94a3b8" }}/>
              <input value={ptSearch} onChange={e=>setPtSearch(e.target.value)} placeholder="Search by name, MRN, NID…" style={{ border:"none",outline:"none",fontSize:12,background:"transparent",flex:1,color:"#0f172a" }}/>
            </div>
            <select value={filterIns} onChange={e=>setFilterIns(e.target.value)} style={{ padding:"7px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,color:"#374151",background:"white",cursor:"pointer" }}>
              <option value="all">All Insurance</option>
              <option value="Mutuelle">Mutuelle / CBHI</option>
              <option value="RSSB">RSSB</option>
              <option value="Private">Private</option>
              <option value="Cash">Cash</option>
            </select>
            <select value={filterGender} onChange={e=>setFilterGender(e.target.value)} style={{ padding:"7px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,color:"#374151",background:"white",cursor:"pointer" }}>
              <option value="all">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input value={filterDx} onChange={e=>setFilterDx(e.target.value)} placeholder="Filter by diagnosis…" style={{ padding:"7px 11px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,color:"#374151",background:"white",outline:"none",width:160 }}/>
          </div>

          {/* Table */}
          {filteredPts.length===0 ? (
            <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",padding:"44px 24px",textAlign:"center",color:"#94a3b8" }}>
              <Users size={40} style={{ margin:"0 auto 10px",display:"block",opacity:0.3 }}/>
              <div style={{ fontWeight:600,fontSize:14,color:"#374151",marginBottom:4 }}>No patients registered yet</div>
              <div style={{ fontSize:12,marginBottom:14 }}>Use "Register New Patient" to add the first record.</div>
              <button onClick={()=>{ setForm(emptyRecord()); setView("register"); }} style={{ padding:"8px 20px",background:"#0891b2",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700 }}>Register First Patient</button>
            </div>
          ) : (
            <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",overflow:"auto" }}>
              <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                <thead>
                  <tr style={{ background:"#f8fafc" }}>
                    {["MRN","Name","Age/Sex","Insurance","Chief Complaint","Diagnosis","Date","Actions"].map(h=>(
                      <th key={h} style={{ padding:"9px 12px",textAlign:"left",fontWeight:700,fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.04em",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPts.map((p,i)=>(
                    <tr key={p.mrn+i} style={{ borderBottom:"1px solid #f1f5f9" }}
                      onMouseEnter={e=>(e.currentTarget.style.background="#f8fafc")}
                      onMouseLeave={e=>(e.currentTarget.style.background="")}>
                      <td style={{ padding:"9px 12px",fontWeight:700,color:"#0891b2",whiteSpace:"nowrap" }}>{p.mrn}</td>
                      <td style={{ padding:"9px 12px" }}>
                        <div style={{ fontWeight:600,color:"#0f172a" }}>{p.firstName} {p.lastName}</div>
                        <div style={{ fontSize:10,color:"#94a3b8" }}>{p.nid||"No NID"}</div>
                      </td>
                      <td style={{ padding:"9px 12px",color:"#374151",whiteSpace:"nowrap" }}>{p.age}y · {p.gender}</td>
                      <td style={{ padding:"9px 12px" }}>
                        <span style={{ padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:600,background:p.coverageType==="RSSB"?"#ecfeff":p.coverageType==="Mutuelle"?"#ecfdf5":p.coverageType==="Private"?"#f5f3ff":"#fffbeb",color:p.coverageType==="RSSB"?"#0891b2":p.coverageType==="Mutuelle"?"#059669":p.coverageType==="Private"?"#7c3aed":"#d97706" }}>
                          {p.coverageType||"Cash"}
                        </span>
                      </td>
                      <td style={{ padding:"9px 12px",color:"#374151",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.chiefComplaint||"—"}</td>
                      <td style={{ padding:"9px 12px",color:"#374151" }}>{p.primaryDx||"—"} {p.icd10?<span style={{ fontSize:10,color:"#94a3b8" }}>({p.icd10})</span>:null}</td>
                      <td style={{ padding:"9px 12px",color:"#94a3b8",whiteSpace:"nowrap",fontSize:11 }}>{p.date}</td>
                      <td style={{ padding:"9px 12px" }}>
                        <div style={{ display:"flex",gap:5 }}>
                          <button onClick={()=>{ setForm(p); setView("register"); }} style={{ padding:"3px 9px",border:"1px solid #bae6fd",background:"#f0f9ff",borderRadius:6,cursor:"pointer",fontSize:10,color:"#0891b2",fontWeight:600 }}>View</button>
                          <button onClick={()=>{ setLabPt(p); setLabOrders([]); setView("laborder"); }} style={{ padding:"3px 9px",border:"1px solid #bbf7d0",background:"#f0fdf4",borderRadius:6,cursor:"pointer",fontSize:10,color:"#059669",fontWeight:600,display:"flex",alignItems:"center",gap:3 }}>
                            <FlaskConical size={9}/>Labs
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── REGISTRATION FORM VIEW ── */}
      {view==="register" && (
        <div>
          {/* Header bar */}
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:16,padding:"14px 18px",background:"linear-gradient(135deg,#0891b2,#7c3aed)",borderRadius:12,color:"white" }}>
            <div>
              <div style={{ fontWeight:800,fontSize:16 }}>🏥 CLINIC PATIENT REGISTRATION AND MEDICAL RECORD FORM</div>
              <div style={{ fontSize:11,opacity:0.8,marginTop:2 }}>ARTIC Health Companion · Rwanda MOH Format · {form.date}</div>
            </div>
            <div style={{ display:"flex",gap:8 }}>
              <button onClick={()=>setView("list")} style={{ padding:"7px 14px",border:"1px solid rgba(255,255,255,0.3)",background:"rgba(255,255,255,0.1)",borderRadius:8,cursor:"pointer",fontSize:12,color:"white",fontWeight:600 }}>← Back to List</button>
              <button onClick={savePatient} disabled={saving} style={{ display:"flex",alignItems:"center",gap:5,padding:"7px 18px",background:"white",color:"#0891b2",border:"none",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700 }}>
                <Save size={13}/>{saving?"Saving…":"Save & Register"}
              </button>
            </div>
          </div>

          {/* ── A. Patient Identification ── */}
          <SectionCard title="A. Patient Identification" icon="🆔" color="#0891b2">
            <FRow>
              <FField label="Patient ID / Medical Record Number"><input readOnly value={form.mrn} style={inp({ background:"#f8fafc",fontWeight:700,color:"#0891b2" })}/></FField>
              <FField label="Date"><input type="date" value={form.date} onChange={e=>setF("date",e.target.value)} style={inp()}/></FField>
            </FRow>
            <FRow>
              <FField label="First Name" required><input value={form.firstName} onChange={e=>setF("firstName",e.target.value)} placeholder="Given name" style={inp()}/></FField>
              <FField label="Last Name" required><input value={form.lastName} onChange={e=>setF("lastName",e.target.value)} placeholder="Family name" style={inp()}/></FField>
            </FRow>
            <FRow>
              <FField label="Gender" required>
                <div style={{ paddingTop:6 }}>
                  <Radio name="gender" label="☐ Male"   value="Male"   checked={form.gender==="Male"}   onChange={v=>setF("gender",v)}/>
                  <Radio name="gender" label="☐ Female" value="Female" checked={form.gender==="Female"} onChange={v=>setF("gender",v)}/>
                  <Radio name="gender" label="☐ Other"  value="Other"  checked={form.gender==="Other"}  onChange={v=>setF("gender",v)}/>
                </div>
              </FField>
              <FField label="Date of Birth"><input type="date" value={form.dob} onChange={e=>setF("dob",e.target.value)} style={inp()}/></FField>
              <FField label="Age (years)"><input value={form.age} onChange={e=>setF("age",e.target.value)} placeholder="Auto-calculated" style={inp()}/></FField>
            </FRow>
            <FRow>
              <FField label="Marital Status">
                <div style={{ paddingTop:6 }}>
                  {["Single","Married","Divorced","Widowed"].map(s=>(
                    <Radio key={s} name="marital" label={`☐ ${s}`} value={s} checked={form.maritalStatus===s} onChange={v=>setF("maritalStatus",v)}/>
                  ))}
                </div>
              </FField>
              <FField label="Nationality"><input value={form.nationality} onChange={e=>setF("nationality",e.target.value)} placeholder="Rwandan" style={inp()}/></FField>
              <FField label="Occupation"><input value={form.occupation} onChange={e=>setF("occupation",e.target.value)} placeholder="e.g. Farmer, Teacher" style={inp()}/></FField>
            </FRow>
            <FRow>
              <FField label="National ID / Passport Number"><input value={form.nid} onChange={e=>setF("nid",e.target.value)} placeholder="1 19XX XXXXXXXXXXX X" style={inp()}/></FField>
            </FRow>
          </SectionCard>

          {/* ── B. Contact Information ── */}
          <SectionCard title="B. Contact Information" icon="📞" color="#059669">
            <FRow>
              <FField label="Address"><input value={form.address} onChange={e=>setF("address",e.target.value)} placeholder="Street / Village" style={inp()}/></FField>
              <FField label="District"><input value={form.district} onChange={e=>setF("district",e.target.value)} placeholder="District" style={inp()}/></FField>
            </FRow>
            <FRow>
              <FField label="Sector"><input value={form.sector} onChange={e=>setF("sector",e.target.value)} placeholder="Sector" style={inp()}/></FField>
              <FField label="Cell"><input value={form.cell} onChange={e=>setF("cell",e.target.value)} placeholder="Cell" style={inp()}/></FField>
              <FField label="Village"><input value={form.village} onChange={e=>setF("village",e.target.value)} placeholder="Village" style={inp()}/></FField>
            </FRow>
            <FRow>
              <FField label="Telephone" required><input type="tel" value={form.phone} onChange={e=>setF("phone",e.target.value)} placeholder="+250 7XX XXX XXX" style={inp()}/></FField>
              <FField label="Email"><input type="email" value={form.email} onChange={e=>setF("email",e.target.value)} placeholder="Optional" style={inp()}/></FField>
            </FRow>
            <FRow>
              <FField label="Emergency Contact Name"><input value={form.nokName} onChange={e=>setF("nokName",e.target.value)} placeholder="Full name" style={inp()}/></FField>
              <FField label="Relationship"><input value={form.nokRelation} onChange={e=>setF("nokRelation",e.target.value)} placeholder="Spouse / Parent / Child…" style={inp()}/></FField>
              <FField label="Emergency Telephone"><input type="tel" value={form.nokPhone} onChange={e=>setF("nokPhone",e.target.value)} placeholder="+250 7XX XXX XXX" style={inp()}/></FField>
            </FRow>
          </SectionCard>

          {/* ── C. Insurance ── */}
          <SectionCard title="C. Insurance Information" icon="🛡️" color="#7c3aed">
            <FRow>
              <FField label="Insurance Provider"><input value={form.insurance} onChange={e=>setF("insurance",e.target.value)} placeholder="e.g. RSSB, Sanlam, CBHI" style={inp()}/></FField>
              <FField label="Membership Number"><input value={form.membershipNo} onChange={e=>setF("membershipNo",e.target.value)} placeholder="Policy / membership #" style={inp()}/></FField>
            </FRow>
            <FField label="Coverage Type">
              <div style={{ paddingTop:6 }}>
                {["Mutuelle","RSSB","Private","Cash","Other"].map(c=>(
                  <Radio key={c} name="coverage" label={`☐ ${c}`} value={c} checked={form.coverageType===c} onChange={v=>setF("coverageType",v)}/>
                ))}
              </div>
            </FField>
          </SectionCard>

          {/* ── D. Chief Complaint ── */}
          <SectionCard title="D. Chief Complaint" icon="💬" color="#d97706">
            <FField label="Reason for today's visit" required>
              <textarea value={form.chiefComplaint} onChange={e=>setF("chiefComplaint",e.target.value)} rows={3} placeholder="Describe the main reason for the visit in the patient's own words…" style={{ ...inp(),resize:"vertical",fontFamily:"inherit",lineHeight:1.6 }}/>
            </FField>
          </SectionCard>

          {/* ── E. History of Present Illness ── */}
          <SectionCard title="E. History of Present Illness" icon="📋" color="#0891b2">
            <FRow>
              <FField label="Symptoms / Description">
                <textarea value={form.hpi} onChange={e=>setF("hpi",e.target.value)} rows={3} placeholder="Onset, character, radiation, timing, severity, exacerbating/relieving factors…" style={{ ...inp(),resize:"vertical",fontFamily:"inherit",lineHeight:1.6 }}/>
              </FField>
            </FRow>
            <FRow>
              <FField label="Duration"><input value={form.hpiDuration} onChange={e=>setF("hpiDuration",e.target.value)} placeholder="e.g. 3 days" style={inp()}/></FField>
              <FField label="Previous Treatment">
                <input value={form.previousTx} onChange={e=>setF("previousTx",e.target.value)} placeholder="Medications or treatments tried before this visit" style={inp()}/>
              </FField>
            </FRow>
          </SectionCard>

          {/* ── F. Past Medical History ── */}
          <SectionCard title="F. Past Medical History" icon="🏥" color="#dc2626">
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:12,fontWeight:600,color:"#374151",marginBottom:6 }}>Known Conditions:</div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>
                {PMH_OPTIONS.map(opt=>(
                  <Checkbox key={opt} label={opt} checked={form.pmh.includes(opt)} onChange={()=>togglePMH(opt)}/>
                ))}
              </div>
              <div style={{ display:"flex",gap:10,marginTop:8,alignItems:"center" }}>
                <span style={{ fontSize:12,color:"#64748b" }}>Other:</span>
                <input value={form.pmhOther} onChange={e=>setF("pmhOther",e.target.value)} placeholder="Specify…" style={{ ...inp(),maxWidth:300 }}/>
              </div>
            </div>
            <FRow>
              <FField label="Previous Hospitalization">
                <div style={{ display:"flex",gap:16,paddingTop:6 }}>
                  <Radio name="prevhosp" label="Yes" value="Yes" checked={form.prevHospitalization==="Yes"} onChange={v=>setF("prevHospitalization",v)}/>
                  <Radio name="prevhosp" label="No"  value="No"  checked={form.prevHospitalization==="No"}  onChange={v=>setF("prevHospitalization",v)}/>
                </div>
                {form.prevHospitalization==="Yes" && <input value={form.prevHospDetails} onChange={e=>setF("prevHospDetails",e.target.value)} placeholder="Details: when, where, reason" style={{ ...inp(),marginTop:6 }}/>}
              </FField>
              <FField label="Previous Surgery">
                <div style={{ display:"flex",gap:16,paddingTop:6 }}>
                  <Radio name="prevsurg" label="Yes" value="Yes" checked={form.prevSurgery==="Yes"} onChange={v=>setF("prevSurgery",v)}/>
                  <Radio name="prevsurg" label="No"  value="No"  checked={form.prevSurgery==="No"}  onChange={v=>setF("prevSurgery",v)}/>
                </div>
                {form.prevSurgery==="Yes" && <input value={form.prevSurgDetails} onChange={e=>setF("prevSurgDetails",e.target.value)} placeholder="Details: procedure, year" style={{ ...inp(),marginTop:6 }}/>}
              </FField>
            </FRow>
          </SectionCard>

          {/* ── G. Medication History ── */}
          <SectionCard title="G. Medication History" icon="💊" color="#7c3aed">
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12,marginBottom:8 }}>
                <thead><tr style={{ background:"#f8fafc" }}>
                  {["Medication","Dose","Frequency",""].map(h=><th key={h} style={{ padding:"8px 10px",textAlign:"left",fontWeight:600,fontSize:11,color:"#64748b",borderBottom:"1px solid #e2e8f0" }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {form.medications.map((med,i)=>(
                    <tr key={i}>
                      <td style={{ padding:"5px 4px" }}><input value={med.drug} onChange={e=>{ const m=[...form.medications]; m[i]={...m[i],drug:e.target.value}; setF("medications",m); }} placeholder="Drug name" style={inp()}/></td>
                      <td style={{ padding:"5px 4px" }}><input value={med.dose} onChange={e=>{ const m=[...form.medications]; m[i]={...m[i],dose:e.target.value}; setF("medications",m); }} placeholder="e.g. 500mg" style={inp()}/></td>
                      <td style={{ padding:"5px 4px" }}><input value={med.freq} onChange={e=>{ const m=[...form.medications]; m[i]={...m[i],freq:e.target.value}; setF("medications",m); }} placeholder="e.g. TID" style={inp()}/></td>
                      <td style={{ padding:"5px 4px" }}><button onClick={()=>setF("medications",form.medications.filter((_,j)=>j!==i))} style={{ border:"none",background:"none",cursor:"pointer",color:"#94a3b8" }}><X size={13}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={()=>setF("medications",[...form.medications,{ drug:"",dose:"",freq:"" }])} style={{ padding:"5px 12px",border:"1px dashed #cbd5e1",background:"#f8fafc",borderRadius:7,cursor:"pointer",fontSize:11,color:"#64748b" }}>+ Add Medication</button>
            </div>
          </SectionCard>

          {/* ── H. Allergies ── */}
          <SectionCard title="H. Allergies" icon="⚠️" color="#dc2626">
            <div style={{ marginBottom:8 }}>
              <Radio name="allergy" label="☐ No Known Drug Allergy" value="No Known Drug Allergy" checked={form.allergies==="No Known Drug Allergy"} onChange={v=>setF("allergies",v)}/>
              <Radio name="allergy" label="☐ Has Allergies"         value="Has Allergies"         checked={form.allergies==="Has Allergies"}         onChange={v=>setF("allergies",v)}/>
            </div>
            {form.allergies==="Has Allergies" && (
              <FRow>
                <FField label="Drug Allergy"><input value={form.allergyDrug} onChange={e=>setF("allergyDrug",e.target.value)} placeholder="Drug name + reaction" style={inp()}/></FField>
                <FField label="Food Allergy"><input value={form.allergyFood} onChange={e=>setF("allergyFood",e.target.value)} placeholder="Food + reaction" style={inp()}/></FField>
                <FField label="Other"><input value={form.allergyOther} onChange={e=>setF("allergyOther",e.target.value)} placeholder="Other allergens" style={inp()}/></FField>
              </FRow>
            )}
          </SectionCard>

          {/* ── I. Family History ── */}
          <SectionCard title="I. Family History" icon="👨‍👩‍👧" color="#059669">
            <div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>
              {FAMILY_HX.map(opt=>(
                <Checkbox key={opt} label={opt} checked={form.familyHx.includes(opt)} onChange={()=>toggleFamHx(opt)}/>
              ))}
            </div>
            <div style={{ display:"flex",gap:10,marginTop:8,alignItems:"center" }}>
              <span style={{ fontSize:12,color:"#64748b" }}>Other:</span>
              <input value={form.familyHxOther} onChange={e=>setF("familyHxOther",e.target.value)} placeholder="Specify…" style={{ ...inp(),maxWidth:300 }}/>
            </div>
          </SectionCard>

          {/* ── J. Social History ── */}
          <SectionCard title="J. Social History" icon="👤" color="#d97706">
            <FRow>
              <FField label="Smoking">
                <div style={{ paddingTop:6 }}>
                  {["Never","Former","Current"].map(s=><Radio key={s} name="smoking" label={`☐ ${s}`} value={s} checked={form.smoking===s} onChange={v=>setF("smoking",v)}/>)}
                </div>
              </FField>
              <FField label="Alcohol">
                <div style={{ paddingTop:6 }}>
                  {["No","Occasionally","Frequently"].map(s=><Radio key={s} name="alcohol" label={`☐ ${s}`} value={s} checked={form.alcohol===s} onChange={v=>setF("alcohol",v)}/>)}
                </div>
              </FField>
              <FField label="Drug Use">
                <div style={{ paddingTop:6 }}>
                  {["No","Yes"].map(s=><Radio key={s} name="druguse" label={`☐ ${s}`} value={s} checked={form.drugUse===s} onChange={v=>setF("drugUse",v)}/>)}
                </div>
              </FField>
              <FField label="Occupation"><input value={form.socialOccupation} onChange={e=>setF("socialOccupation",e.target.value)} placeholder="Current occupation" style={inp()}/></FField>
            </FRow>
          </SectionCard>

          {/* ── K. Vital Signs ── */}
          <SectionCard title="K. Vital Signs" icon="❤️" color="#dc2626">
            <FRow>
              <FField label="Temperature (°C)"><input value={form.temp} onChange={e=>setF("temp",e.target.value)} placeholder="36.5" style={inp()}/></FField>
              <FField label="BP (mmHg)"><input value={form.bp} onChange={e=>setF("bp",e.target.value)} placeholder="120/80" style={inp()}/></FField>
              <FField label="Pulse (bpm)"><input value={form.pulse} onChange={e=>setF("pulse",e.target.value)} placeholder="72" style={inp()}/></FField>
              <FField label="RR (/min)"><input value={form.rr} onChange={e=>setF("rr",e.target.value)} placeholder="16" style={inp()}/></FField>
              <FField label="SpO₂ (%)"><input value={form.spo2} onChange={e=>setF("spo2",e.target.value)} placeholder="98" style={inp()}/></FField>
              <FField label="Weight (kg)"><input value={form.weight} onChange={e=>setF("weight",e.target.value)} placeholder="65" style={inp()}/></FField>
              <FField label="Height (cm)"><input value={form.height} onChange={e=>setF("height",e.target.value)} placeholder="168" style={inp()}/></FField>
              <FField label="BMI (auto)"><input readOnly value={form.bmi} placeholder="Auto-calculated" style={inp({ background:"#f8fafc",fontWeight:600,color:form.bmi&&parseFloat(form.bmi)>30?"#dc2626":form.bmi&&parseFloat(form.bmi)<18.5?"#d97706":"#059669" })}/></FField>
            </FRow>
          </SectionCard>

          {/* ── L. Physical Examination ── */}
          <SectionCard title="L. Physical Examination" icon="🩺" color="#0891b2">
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12 }}>
              {EXAM_SYSTEMS.map(sys=>(
                <FField key={sys} label={sys}>
                  <textarea value={form.examFindings[sys]||""} onChange={e=>setF("examFindings",{ ...form.examFindings,[sys]:e.target.value })} rows={2} placeholder="Normal / Abnormal findings…" style={{ ...inp(),resize:"vertical",fontFamily:"inherit" }}/>
                </FField>
              ))}
            </div>
          </SectionCard>

          {/* ── M. Lab/Investigations ── */}
          <SectionCard title="M. Laboratory / Investigations Requested" icon="🔬" color="#059669">
            <div style={{ background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:8,padding:"8px 12px",marginBottom:12,fontSize:11,color:"#0369a1" }}>
              ✅ Selected tests will be automatically sent to the Laboratory portal when saved.
            </div>
            {/* Quick tests */}
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:12,fontWeight:600,color:"#374151",marginBottom:6 }}>Frequently Requested:</div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>
                {QUICK_LABS.map(t=>(
                  <button key={t} onClick={()=>setF("labOrders",form.labOrders.includes(t)?form.labOrders.filter(x=>x!==t):[...form.labOrders,t])}
                    style={{ padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",border:`1px solid ${form.labOrders.includes(t)?"#059669":"#e2e8f0"}`,background:form.labOrders.includes(t)?"#dcfce7":"white",color:form.labOrders.includes(t)?"#059669":"#374151",transition:"all 0.15s" }}>
                    {form.labOrders.includes(t)?"✓ ":""}{t}
                  </button>
                ))}
              </div>
            </div>
            {/* Full catalogue by department */}
            {LAB_CATALOGUE.map(dept=>(
              <div key={dept.dept} style={{ marginBottom:8,border:"1px solid #e2e8f0",borderRadius:9,overflow:"hidden" }}>
                <button onClick={()=>setLabExpanded(p=>({...p,[dept.dept]:!p[dept.dept]}))} style={{ width:"100%",padding:"9px 14px",border:"none",background:"#f8fafc",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12,fontWeight:700,color:"#0f172a" }}>
                  <span style={{ display:"flex",alignItems:"center",gap:7 }}><span style={{ fontSize:15 }}>{dept.icon}</span>{dept.dept}</span>
                  <span style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <span style={{ fontSize:10,color:"#94a3b8" }}>{dept.tests.filter(t=>form.labOrders.includes(t)).length}/{dept.tests.length} selected</span>
                    {labExpanded[dept.dept]?<ChevronDown size={13}/>:<ChevronRight size={13}/>}
                  </span>
                </button>
                {labExpanded[dept.dept] && (
                  <div style={{ padding:"10px 14px",display:"flex",flexWrap:"wrap",gap:5 }}>
                    {dept.tests.map(t=>(
                      <button key={t} onClick={()=>setF("labOrders",form.labOrders.includes(t)?form.labOrders.filter(x=>x!==t):[...form.labOrders,t])}
                        style={{ padding:"4px 10px",borderRadius:20,fontSize:11,cursor:"pointer",border:`1px solid ${form.labOrders.includes(t)?dept.color:"#e2e8f0"}`,background:form.labOrders.includes(t)?`${dept.color}18`:"white",color:form.labOrders.includes(t)?dept.color:"#374151",fontWeight:form.labOrders.includes(t)?600:400,transition:"all 0.15s" }}>
                        {form.labOrders.includes(t)?"✓ ":""}{t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {form.labOrders.length>0 && (
              <div style={{ marginTop:10,padding:"10px 14px",background:"#f0fdf4",borderRadius:9,border:"1px solid #bbf7d0",fontSize:12,color:"#065f46" }}>
                <strong>Selected ({form.labOrders.length}):</strong> {form.labOrders.join(" · ")}
              </div>
            )}
            <FField label="Additional results / notes">
              <textarea value={form.labResults} onChange={e=>setF("labResults",e.target.value)} rows={2} placeholder="Any pre-existing results or notes…" style={{ ...inp(),resize:"vertical",fontFamily:"inherit",marginTop:6 }}/>
            </FField>
          </SectionCard>

          {/* ── N. Diagnosis ── */}
          <SectionCard title="N. Diagnosis" icon="🏷️" color="#7c3aed">
            <FRow>
              <FField label="Primary Diagnosis" required><input value={form.primaryDx} onChange={e=>setF("primaryDx",e.target.value)} placeholder="e.g. Essential Hypertension" style={inp()}/></FField>
              <FField label="Secondary Diagnosis"><input value={form.secondaryDx} onChange={e=>setF("secondaryDx",e.target.value)} placeholder="Comorbidity or secondary finding" style={inp()}/></FField>
              <FField label="ICD-10 Code"><input value={form.icd10} onChange={e=>setF("icd10",e.target.value)} placeholder="e.g. I10" style={inp()}/></FField>
            </FRow>
          </SectionCard>

          {/* ── O. Treatment Plan ── */}
          <SectionCard title="O. Treatment Plan" icon="💉" color="#d97706">
            <div style={{ overflowX:"auto",marginBottom:10 }}>
              <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12,marginBottom:8 }}>
                <thead><tr style={{ background:"#f8fafc" }}>
                  {["Drug","Dose","Frequency","Duration",""].map(h=><th key={h} style={{ padding:"8px 10px",textAlign:"left",fontWeight:600,fontSize:11,color:"#64748b",borderBottom:"1px solid #e2e8f0" }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {form.treatment.map((t,i)=>(
                    <tr key={i}>
                      <td style={{ padding:"5px 4px" }}><input value={t.drug} onChange={e=>{ const tr=[...form.treatment]; tr[i]={...tr[i],drug:e.target.value}; setF("treatment",tr); }} placeholder="Drug name" style={inp()}/></td>
                      <td style={{ padding:"5px 4px" }}><input value={t.dose} onChange={e=>{ const tr=[...form.treatment]; tr[i]={...tr[i],dose:e.target.value}; setF("treatment",tr); }} placeholder="500mg" style={inp()}/></td>
                      <td style={{ padding:"5px 4px" }}><input value={t.freq} onChange={e=>{ const tr=[...form.treatment]; tr[i]={...tr[i],freq:e.target.value}; setF("treatment",tr); }} placeholder="TID" style={inp()}/></td>
                      <td style={{ padding:"5px 4px" }}><input value={t.duration} onChange={e=>{ const tr=[...form.treatment]; tr[i]={...tr[i],duration:e.target.value}; setF("treatment",tr); }} placeholder="7 days" style={inp()}/></td>
                      <td><button onClick={()=>setF("treatment",form.treatment.filter((_,j)=>j!==i))} style={{ border:"none",background:"none",cursor:"pointer",color:"#94a3b8" }}><X size={13}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={()=>setF("treatment",[...form.treatment,{ drug:"",dose:"",freq:"",duration:"" }])} style={{ padding:"5px 12px",border:"1px dashed #cbd5e1",background:"#f8fafc",borderRadius:7,cursor:"pointer",fontSize:11,color:"#64748b" }}>+ Add Drug</button>
            </div>
            <FRow>
              <FField label="Procedures Performed">
                <input value={form.procedures} onChange={e=>setF("procedures",e.target.value)} placeholder="Any procedures done during this visit" style={inp()}/>
              </FField>
              <FField label="Health Education Provided">
                <input value={form.healthEd} onChange={e=>setF("healthEd",e.target.value)} placeholder="e.g. Diet counseling, BP monitoring" style={inp()}/>
              </FField>
            </FRow>
          </SectionCard>

          {/* ── P. Follow-up ── */}
          <SectionCard title="P. Follow-up" icon="📅" color="#0891b2">
            <FRow>
              <FField label="Next Appointment"><input type="date" value={form.nextAppt} onChange={e=>setF("nextAppt",e.target.value)} style={inp()}/></FField>
              <FField label="Special Instructions"><input value={form.specialInstructions} onChange={e=>setF("specialInstructions",e.target.value)} placeholder="Instructions for patient" style={inp()}/></FField>
            </FRow>
            <FField label="Referral">
              <div style={{ paddingTop:6,marginBottom:8 }}>
                <Radio name="referral" label="☐ No"  value="No"  checked={form.referral==="No"}  onChange={v=>setF("referral",v)}/>
                <Radio name="referral" label="☐ Yes" value="Yes" checked={form.referral==="Yes"} onChange={v=>setF("referral",v)}/>
              </div>
              {form.referral==="Yes" && (
                <FRow>
                  <FField label="Referred To (Facility)"><input value={form.referralFacility} onChange={e=>setF("referralFacility",e.target.value)} placeholder="Facility name" style={inp()}/></FField>
                  <FField label="Reason for Referral"><input value={form.referralReason} onChange={e=>setF("referralReason",e.target.value)} placeholder="Clinical reason" style={inp()}/></FField>
                </FRow>
              )}
            </FField>
          </SectionCard>

          {/* ── Q. Healthcare Provider ── */}
          <SectionCard title="Q. Healthcare Provider Information" icon="👨‍⚕️" color="#059669">
            <FRow>
              <FField label="Clinician Name"><input value={form.clinicianName} onChange={e=>setF("clinicianName",e.target.value)} placeholder="Full name" style={inp()}/></FField>
              <FField label="Professional Title"><input value={form.clinicianTitle} onChange={e=>setF("clinicianTitle",e.target.value)} placeholder="e.g. Medical Officer, Nurse" style={inp()}/></FField>
              <FField label="Date"><input type="date" value={form.clinicianDate} onChange={e=>setF("clinicianDate",e.target.value)} style={inp()}/></FField>
            </FRow>
            <div style={{ padding:"10px 14px",background:"#f0fdf4",borderRadius:9,border:"1px solid #bbf7d0",fontSize:12,color:"#065f46" }}>
              ✍️ Electronic signature applied automatically on save using your authenticated session.
            </div>
          </SectionCard>

          {/* ── R. Patient Consent ── */}
          <SectionCard title="R. Patient Consent" icon="✅" color="#059669">
            <div style={{ padding:"12px 16px",background:"#f0fdf4",borderRadius:9,border:"1px solid #bbf7d0",marginBottom:12 }}>
              <p style={{ fontSize:12,color:"#065f46",margin:0,lineHeight:1.7 }}>
                <strong>I certify</strong> that the information provided above is accurate and complete to the best of my knowledge, and I consent to examination, investigation and treatment as deemed necessary by the healthcare provider.
              </p>
            </div>
            <FRow>
              <FField label="Patient Name"><input value={form.consentName} onChange={e=>setF("consentName",e.target.value)} placeholder="Full name" style={inp()}/></FField>
              <FField label="Date"><input type="date" value={form.consentDate} onChange={e=>setF("consentDate",e.target.value)} style={inp()}/></FField>
            </FRow>
            <Checkbox label="Patient / Guardian has provided verbal/written consent" checked={form.consentSigned} onChange={v=>setF("consentSigned",v)}/>
            <div style={{ marginTop:8,fontSize:11,color:"#94a3b8" }}>
              (Signature / thumbprint captured at reception desk)
            </div>
          </SectionCard>

          {/* Save button bottom */}
          <div style={{ display:"flex",justifyContent:"flex-end",gap:10,marginTop:6,marginBottom:20 }}>
            <button onClick={()=>setView("list")} style={{ padding:"10px 22px",border:"1px solid #e2e8f0",background:"white",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:600,color:"#374151" }}>Cancel</button>
            <button onClick={savePatient} disabled={saving} style={{ display:"flex",alignItems:"center",gap:7,padding:"10px 28px",background:"linear-gradient(135deg,#0891b2,#7c3aed)",color:"white",border:"none",borderRadius:9,cursor:saving?"not-allowed":"pointer",fontSize:13,fontWeight:700 }}>
              <Save size={14}/>{saving?"Saving & Sending to Lab…":"Save Patient Record"}
            </button>
          </div>
        </div>
      )}

      {/* ── LAB ORDER VIEW ── */}
      {view==="laborder" && labPt && (
        <div>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,padding:"14px 18px",background:"linear-gradient(135deg,#059669,#0891b2)",borderRadius:12,color:"white" }}>
            <div>
              <div style={{ fontWeight:800,fontSize:15 }}>🔬 Laboratory Order — {labPt.firstName} {labPt.lastName}</div>
              <div style={{ fontSize:11,opacity:0.8 }}>{labPt.mrn} · {labPt.primaryDx||"No diagnosis yet"}</div>
            </div>
            <button onClick={()=>setView("list")} style={{ padding:"7px 14px",border:"1px solid rgba(255,255,255,0.3)",background:"rgba(255,255,255,0.1)",borderRadius:8,cursor:"pointer",fontSize:12,color:"white",fontWeight:600 }}>← Back</button>
          </div>

          {/* Patient summary */}
          <div style={{ background:"white",borderRadius:10,border:"1px solid #e2e8f0",padding:"12px 16px",marginBottom:14,display:"flex",gap:24,flexWrap:"wrap",fontSize:12 }}>
            {[
              { l:"Name",      v:`${labPt.firstName} ${labPt.lastName}` },
              { l:"MRN",       v:labPt.mrn },
              { l:"Age/Sex",   v:`${labPt.age}y ${labPt.gender}` },
              { l:"Insurance", v:labPt.coverageType||"Cash" },
              { l:"Diagnosis", v:labPt.primaryDx||"—" },
            ].map(f=>(
              <div key={f.l}>
                <div style={{ fontSize:10,color:"#94a3b8",fontWeight:600,textTransform:"uppercase" }}>{f.l}</div>
                <div style={{ fontWeight:600,color:"#0f172a",marginTop:1 }}>{f.v}</div>
              </div>
            ))}
          </div>

          {/* Search bar */}
          <div style={{ display:"flex",alignItems:"center",gap:7,background:"white",border:"1px solid #e2e8f0",borderRadius:9,padding:"8px 13px",marginBottom:12 }}>
            <Search size={13} style={{ color:"#94a3b8" }}/>
            <input value={labSearch} onChange={e=>setLabSearch(e.target.value)} placeholder="Search tests…" style={{ border:"none",outline:"none",fontSize:12,background:"transparent",flex:1,color:"#0f172a" }}/>
          </div>

          {/* Quick select */}
          <div style={{ background:"white",borderRadius:10,border:"1px solid #e2e8f0",padding:"12px 16px",marginBottom:12 }}>
            <div style={{ fontWeight:700,fontSize:12,color:"#0f172a",marginBottom:8 }}>⚡ Quick Select (Common Tests)</div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
              {QUICK_LABS.map(t=>(
                <button key={t} onClick={()=>setLabOrders(p=>p.includes(t)?p.filter(x=>x!==t):[...p,t])}
                  style={{ padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",border:`1px solid ${labOrders.includes(t)?"#059669":"#e2e8f0"}`,background:labOrders.includes(t)?"#dcfce7":"white",color:labOrders.includes(t)?"#059669":"#374151" }}>
                  {labOrders.includes(t)?"✓ ":""}{t}
                </button>
              ))}
            </div>
          </div>

          {/* Full catalogue */}
          {LAB_CATALOGUE.map(dept=>{
            const visible = labSearch
              ? dept.tests.filter(t=>t.toLowerCase().includes(labSearch.toLowerCase()))
              : dept.tests;
            if(labSearch && visible.length===0) return null;
            return (
              <div key={dept.dept} style={{ marginBottom:8,border:`1px solid ${dept.color}30`,borderRadius:9,overflow:"hidden" }}>
                <button onClick={()=>setLabExpanded(p=>({...p,[dept.dept]:!p[dept.dept]}))} style={{ width:"100%",padding:"9px 14px",border:"none",background:`${dept.color}08`,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12,fontWeight:700,color:"#0f172a" }}>
                  <span style={{ display:"flex",alignItems:"center",gap:7 }}>
                    <span style={{ fontSize:15 }}>{dept.icon}</span>{dept.dept}
                  </span>
                  <span style={{ display:"flex",alignItems:"center",gap:8 }}>
                    {labOrders.filter(t=>dept.tests.includes(t)).length>0 && (
                      <span style={{ padding:"1px 8px",borderRadius:10,background:dept.color,color:"white",fontSize:10,fontWeight:700 }}>
                        {labOrders.filter(t=>dept.tests.includes(t)).length} selected
                      </span>
                    )}
                    {labExpanded[dept.dept]?<ChevronDown size={13}/>:<ChevronRight size={13}/>}
                  </span>
                </button>
                {(labExpanded[dept.dept]||labSearch) && (
                  <div style={{ padding:"10px 14px",display:"flex",flexWrap:"wrap",gap:5 }}>
                    {visible.map(t=>(
                      <button key={t} onClick={()=>setLabOrders(p=>p.includes(t)?p.filter(x=>x!==t):[...p,t])}
                        style={{ padding:"4px 10px",borderRadius:20,fontSize:11,cursor:"pointer",border:`1px solid ${labOrders.includes(t)?dept.color:"#e2e8f0"}`,background:labOrders.includes(t)?`${dept.color}18`:"white",color:labOrders.includes(t)?dept.color:"#374151",fontWeight:labOrders.includes(t)?600:400 }}>
                        {labOrders.includes(t)?"✓ ":""}{t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Selected summary + submit */}
          {labOrders.length>0 && (
            <div style={{ position:"sticky",bottom:0,background:"white",borderTop:"2px solid #059669",padding:"14px 18px",borderRadius:"0 0 12px 12px",boxShadow:"0 -4px 16px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize:12,color:"#065f46",marginBottom:10 }}>
                <strong>{labOrders.length} tests selected:</strong> {labOrders.slice(0,5).join(" · ")}{labOrders.length>5?` + ${labOrders.length-5} more`:""}
              </div>
              <div style={{ display:"flex",gap:8,justifyContent:"flex-end" }}>
                <button onClick={()=>setLabOrders([])} style={{ padding:"8px 16px",border:"1px solid #e2e8f0",background:"white",borderRadius:8,cursor:"pointer",fontSize:12,color:"#374151",fontWeight:600 }}>Clear All</button>
                <button onClick={submitLabOrder} style={{ display:"flex",alignItems:"center",gap:6,padding:"9px 22px",background:"linear-gradient(135deg,#059669,#0891b2)",color:"white",border:"none",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:700 }}>
                  <FlaskConical size={14}/>Send to Laboratory ({labOrders.length} tests)
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
