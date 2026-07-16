"use client";

import { FormEvent, useMemo, useState } from "react";
import { ShieldCheck, Stethoscope } from "lucide-react";
import { usePatientStore, useToast } from "@/lib/store";
import type { InsuranceProvider, Patient } from "@/types/hms";
import { apiFetch } from "@/lib/api/client";
import { getSession } from "@/lib/auth";

const conditions = ["Hypertension", "Diabetes", "Asthma", "Tuberculosis", "HIV/AIDS", "Heart Disease", "Kidney Disease", "Epilepsy", "Cancer", "Mental Illness"];
const familyConditions = ["Diabetes", "Hypertension", "Cancer", "Heart Disease", "Tuberculosis", "HIV/AIDS", "Mental Illness"];
const investigations = ["Complete Blood Count (CBC)", "Malaria Test", "Urinalysis", "Blood Glucose", "Pregnancy Test", "HIV Test", "X-ray", "Ultrasound", "ECG"];
const initialState: Record<string, string | boolean> = {
  mrn: `MRN-${Math.floor(100000 + Math.random() * 900000)}`, date: new Date().toISOString().slice(0, 10), firstName: "", lastName: "", gender: "Male", dob: "", age: "", maritalStatus: "Single", nationality: "Rwanda", occupation: "", nid: "",
  address: "", district: "", sector: "", cell: "", village: "", phone: "", email: "", emergencyName: "", emergencyRelationship: "", emergencyPhone: "",
  insuranceProvider: "Mutuelle", insuranceNumber: "", insuranceCoverage: "Community-Based Health Insurance (Mutuelle)", insuranceOther: "", chiefComplaint: "", symptoms: "", duration: "", previousTreatment: "",
  previousHospitalization: "No", hospitalizationDetails: "", previousSurgery: "No", surgeryDetails: "", currentMedications: "", noKnownDrugAllergy: false, drugAllergies: "", foodAllergies: "", otherAllergies: "",
  familyOther: "", smoking: "Never", alcohol: "No", drugUse: "No", socialOccupation: "", temperature: "", systolicBP: "", diastolicBP: "", pulseRate: "", respiratoryRate: "", oxygenSaturation: "", weight: "", height: "", bmi: "",
  generalAppearance: "", heent: "", cardiovascular: "", respiratory: "", abdomen: "", musculoskeletal: "", neurological: "", skin: "", otherFindings: "", investigationOther: "", investigationResults: "", primaryDiagnosis: "", secondaryDiagnosis: "", icd10: "",
  prescribedMedications: "", procedures: "", healthEducation: "", nextAppointment: "", specialInstructions: "", referral: "No", referralFacility: "", referralReason: "", clinicianName: "", professionalTitle: "", clinicianSignature: "", clinicianDate: new Date().toISOString().slice(0, 10), consentName: "", consentSignature: "", consentDate: new Date().toISOString().slice(0, 10),
};

export function PatientRegistrationForm() {
  const [form, setForm] = useState(initialState);
  const addPatient = usePatientStore((state) => state.add);
  const { show } = useToast();
  const chronicConditions = useMemo(() => conditions.filter((item) => form[`condition-${item}`] === true), [form]);
  const allergies = useMemo(() => [form.drugAllergies, form.foodAllergies, form.otherAllergies].filter((item): item is string => typeof item === "string" && item.trim().length > 0), [form]);

  const set = (field: string, value: string | boolean) => setForm((current) => ({ ...current, [field]: value }));
  const value = (field: string) => String(form[field] ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const insurance = (value("insuranceProvider") === "Cash Payment" ? "Self-pay" : value("insuranceProvider")) as InsuranceProvider;
    const patient: Patient = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`,
      mrn: value("mrn") || `MRN-${Date.now()}`, name: `${value("firstName")} ${value("lastName")}`.trim(), nid: value("nid"), age: Number(value("age") || 0), dob: value("dob"), gender: value("gender") as Patient["gender"], phone: value("phone"), email: value("email"),
      address: { province: "Kigali", district: value("district"), sector: value("sector") }, insurance, insuranceNumber: value("insuranceNumber"), bloodGroup: "O+", allergies: form.noKnownDrugAllergy ? [] : allergies, chronicConditions, currentMedications: value("currentMedications").split("\n").map((item) => item.trim()).filter(Boolean),
      emergencyContact: { name: value("emergencyName"), relationship: value("emergencyRelationship"), phone: value("emergencyPhone") }, status: "Registered", registeredAt: new Date().toISOString(),
    };
    const session = getSession();
    if (!session?.accessToken) {
      show("Please sign in again before registering a patient.", "error");
      return;
    }

    try {
      const medicalHistory = {
        chiefComplaint: value("chiefComplaint"), symptoms: value("symptoms"), duration: value("duration"), previousTreatment: value("previousTreatment"),
        previousHospitalization: value("previousHospitalization"), hospitalizationDetails: value("hospitalizationDetails"), previousSurgery: value("previousSurgery"), surgeryDetails: value("surgeryDetails"),
        vitalSigns: { temperature: value("temperature"), systolicBP: value("systolicBP"), diastolicBP: value("diastolicBP"), pulseRate: value("pulseRate"), respiratoryRate: value("respiratoryRate"), oxygenSaturation: value("oxygenSaturation"), weight: value("weight"), height: value("height"), bmi: value("bmi") },
        physicalExamination: { generalAppearance: value("generalAppearance"), heent: value("heent"), cardiovascular: value("cardiovascular"), respiratory: value("respiratory"), abdomen: value("abdomen"), musculoskeletal: value("musculoskeletal"), neurological: value("neurological"), skin: value("skin"), otherFindings: value("otherFindings") },
        investigations: investigations.filter((item) => form[`investigation-${item}`] === true), investigationOther: value("investigationOther"), investigationResults: value("investigationResults"),
        diagnosis: { primary: value("primaryDiagnosis"), secondary: value("secondaryDiagnosis"), icd10: value("icd10") }, treatmentPlan: { medications: value("prescribedMedications"), procedures: value("procedures"), healthEducation: value("healthEducation") },
        followUp: { nextAppointment: value("nextAppointment"), specialInstructions: value("specialInstructions"), referral: value("referral"), facility: value("referralFacility"), reason: value("referralReason") },
        provider: { name: value("clinicianName"), title: value("professionalTitle"), signature: value("clinicianSignature"), date: value("clinicianDate") }, consent: { name: value("consentName"), signature: value("consentSignature"), date: value("consentDate") },
      };
      await apiFetch("/api/patients", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.accessToken}` },
        body: JSON.stringify({
          firstName: value("firstName"), lastName: value("lastName"), nationalId: value("nid"), dateOfBirth: value("dob"), gender: value("gender"), maritalStatus: value("maritalStatus"), nationality: value("nationality"), occupation: value("occupation"), phone: value("phone"), email: value("email"),
          address: { address: value("address"), district: value("district"), sector: value("sector"), cell: value("cell"), village: value("village") }, emergencyContact: patient.emergencyContact,
          insuranceProvider: insurance, insuranceNumber: value("insuranceNumber"), insuranceType: value("insuranceCoverage"), allergies: patient.allergies, chronicConditions, currentMedications: patient.currentMedications,
          medicalHistory: JSON.stringify(medicalHistory), familyHistory: JSON.stringify({ conditions: familyConditions.filter((item) => form[`family-${item}`] === true), other: value("familyOther") }), socialHistory: { smoking: value("smoking"), alcohol: value("alcohol"), drugUse: value("drugUse"), occupation: value("socialOccupation") },
        }),
      });
      addPatient(patient);
      show(`Patient ${patient.name} registered successfully`, "success");
      setForm({ ...initialState, mrn: `MRN-${Math.floor(100000 + Math.random() * 900000)}`, date: new Date().toISOString().slice(0, 10) });
    } catch (error) {
      show(error instanceof Error ? error.message : "Unable to register the patient. Please try again.", "error");
    }
  }

  return <form onSubmit={handleSubmit} style={{ display: "grid", gap: 20 }}>
    <Section title="A. Patient Identification"><Grid><Field label="Patient ID / Medical Record Number" field="mrn" required /><Field label="Date" field="date" type="date" /><Field label="First Name" field="firstName" required /><Field label="Last Name" field="lastName" required /><Select label="Gender" field="gender" options={["Male", "Female", "Other"]} /><Field label="Date of Birth" field="dob" type="date" /><Field label="Age (years)" field="age" type="number" /><Select label="Marital Status" field="maritalStatus" options={["Single", "Married", "Divorced", "Widowed"]} /><Field label="Nationality" field="nationality" /><Field label="Occupation" field="occupation" /><Field label="National ID / Passport Number" field="nid" /></Grid></Section>
    <Section title="B. Contact Information"><Grid><Field label="Address" field="address" /><Field label="District" field="district" /><Field label="Sector" field="sector" /><Field label="Cell" field="cell" /><Field label="Village" field="village" /><Field label="Telephone Number" field="phone" required /><Field label="Email" field="email" type="email" /></Grid><h4>Emergency Contact</h4><Grid><Field label="Name" field="emergencyName" /><Field label="Relationship" field="emergencyRelationship" /><Field label="Telephone" field="emergencyPhone" /></Grid></Section>
    <Section title="C. Insurance Information"><Grid><Select label="Insurance Provider" field="insuranceProvider" options={["Mutuelle", "RSSB", "Private", "Cash Payment", "Other"]} /><Field label="Membership Number" field="insuranceNumber" /><Select label="Insurance Coverage" field="insuranceCoverage" options={["Community-Based Health Insurance (Mutuelle)", "RSSB", "Private Insurance", "Cash Payment", "Other"]} /><Field label="Other coverage details" field="insuranceOther" /></Grid></Section>
    <Section title="D. Chief Complaint"><Area label="Reason for today’s visit" field="chiefComplaint" /></Section>
    <Section title="E. History of Present Illness"><Area label="Symptoms" field="symptoms" /><Grid><Field label="Duration" field="duration" /><Field label="Previous treatment" field="previousTreatment" /></Grid></Section>
    <Section title="F. Past Medical History"><Checks title="Medical conditions" items={conditions} prefix="condition-" /><Field label="Other condition" field="condition-other" /><Grid><Select label="Previous hospitalization" field="previousHospitalization" options={["No", "Yes"]} /><Field label="Hospitalization details" field="hospitalizationDetails" /><Select label="Previous surgery" field="previousSurgery" options={["No", "Yes"]} /><Field label="Surgery details" field="surgeryDetails" /></Grid></Section>
    <Section title="G. Medication History"><Area label="Current medications (one per line: medication — dose — frequency)" field="currentMedications" /></Section>
    <Section title="H. Allergies"><Checkbox label="No known drug allergy" field="noKnownDrugAllergy" /><Grid><Field label="Drug allergies" field="drugAllergies" /><Field label="Food allergies" field="foodAllergies" /><Field label="Other allergies" field="otherAllergies" /></Grid></Section>
    <Section title="I. Family History"><Checks title="Family conditions" items={familyConditions} prefix="family-" /><Field label="Other family history" field="familyOther" /></Section>
    <Section title="J. Social History"><Grid><Select label="Smoking" field="smoking" options={["Never", "Former", "Current"]} /><Select label="Alcohol" field="alcohol" options={["No", "Occasionally", "Frequently"]} /><Select label="Drug Use" field="drugUse" options={["No", "Yes"]} /><Field label="Occupation" field="socialOccupation" /></Grid></Section>
    <Section title="K. Vital Signs"><Grid><Field label="Temperature (°C)" field="temperature" type="number" /><Field label="Blood pressure — systolic" field="systolicBP" type="number" /><Field label="Blood pressure — diastolic" field="diastolicBP" type="number" /><Field label="Pulse rate (bpm)" field="pulseRate" type="number" /><Field label="Respiratory rate (breaths/min)" field="respiratoryRate" type="number" /><Field label="Oxygen saturation (%)" field="oxygenSaturation" type="number" /><Field label="Weight (kg)" field="weight" type="number" /><Field label="Height (cm)" field="height" type="number" /><Field label="BMI (kg/m²)" field="bmi" type="number" /></Grid></Section>
    <Section title="L. Physical Examination"><Grid>{[["General Appearance","generalAppearance"],["HEENT","heent"],["Cardiovascular","cardiovascular"],["Respiratory","respiratory"],["Abdomen","abdomen"],["Musculoskeletal","musculoskeletal"],["Neurological","neurological"],["Skin","skin"],["Other Findings","otherFindings"]].map(([label, field]) => <Area key={field} label={label} field={field} />)}</Grid></Section>
    <Section title="M. Laboratory / Investigations Requested"><Checks title="Requested investigations" items={investigations} prefix="investigation-" /><Field label="Other investigation" field="investigationOther" /><Area label="Results" field="investigationResults" /></Section>
    <Section title="N. Diagnosis"><Grid><Field label="Primary diagnosis" field="primaryDiagnosis" /><Field label="Secondary diagnosis" field="secondaryDiagnosis" /><Field label="ICD-10 Code" field="icd10" /></Grid></Section>
    <Section title="O. Treatment Plan"><Area label="Medications prescribed (one per line: drug — dose — frequency — duration)" field="prescribedMedications" /><Area label="Procedures performed" field="procedures" /><Area label="Health education provided" field="healthEducation" /></Section>
    <Section title="P. Follow-up"><Grid><Field label="Next appointment date" field="nextAppointment" type="date" /><Select label="Referral" field="referral" options={["No", "Yes"]} /><Field label="Facility referred to" field="referralFacility" /><Field label="Referral reason" field="referralReason" /></Grid><Area label="Special instructions" field="specialInstructions" /></Section>
    <Section title="Q. Healthcare Provider Information"><Grid><Field label="Clinician name" field="clinicianName" /><Field label="Professional title" field="professionalTitle" /><Field label="Signature" field="clinicianSignature" /><Field label="Date" field="clinicianDate" type="date" /></Grid></Section>
    <Section title="R. Patient Consent"><p className="muted">I certify that the information provided is accurate to the best of my knowledge and consent to examination, investigation, and treatment as recommended by the healthcare provider.</p><Grid><Field label="Patient name" field="consentName" /><Field label="Patient signature / thumbprint" field="consentSignature" /><Field label="Date" field="consentDate" type="date" /></Grid></Section>
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}><button type="submit" className="button"><Stethoscope size={16} /> Register patient and save record</button><span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#027c8e", fontWeight: 700 }}><ShieldCheck size={16} /> Secure clinical record</span></div>
  </form>;

  function Field({ label, field, type = "text", required = false }: { label: string; field: string; type?: string; required?: boolean }) { return <label style={labelStyle}><span>{label}</span><input required={required} type={type} value={value(field)} onChange={(e) => set(field, e.target.value)} style={inputStyle} /></label>; }
  function Select({ label, field, options }: { label: string; field: string; options: string[] }) { return <label style={labelStyle}><span>{label}</span><select value={value(field)} onChange={(e) => set(field, e.target.value)} style={inputStyle}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }
  function Area({ label, field }: { label: string; field: string }) { return <label style={labelStyle}><span>{label}</span><textarea value={value(field)} onChange={(e) => set(field, e.target.value)} style={{ ...inputStyle, minHeight: 78 }} /></label>; }
  function Checkbox({ label, field }: { label: string; field: string }) { return <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}><input type="checkbox" checked={form[field] === true} onChange={(e) => set(field, e.target.checked)} /> {label}</label>; }
  function Checks({ title, items, prefix }: { title: string; items: string[]; prefix: string }) { return <fieldset style={fieldsetStyle}><legend>{title}</legend><div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>{items.map((item) => <Checkbox key={item} label={item} field={`${prefix}${item}`} />)}</div></fieldset>; }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="panel" style={{ padding: 20, display: "grid", gap: 14 }}><h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2>{children}</section>; }
function Grid({ children }: { children: React.ReactNode }) { return <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>{children}</div>; }
const labelStyle: React.CSSProperties = { display: "grid", gap: 6, fontSize: 13, fontWeight: 700 };
const inputStyle: React.CSSProperties = { border: "1px solid #d7e1e7", borderRadius: 10, padding: "10px 12px", fontSize: 14, background: "#fcfeff", width: "100%" };
const fieldsetStyle: React.CSSProperties = { border: "1px solid #d7e1e7", borderRadius: 10, padding: 14, margin: 0 };
