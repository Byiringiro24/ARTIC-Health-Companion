import type { LucideIcon } from "lucide-react";

export type Role =
  | "system-admin"
  | "hospital-manager"
  | "medical-director"
  | "doctor"
  | "nurse"
  | "pharmacist"
  | "laboratory"
  | "radiology"
  | "receptionist"
  | "accountant"
  | "cashier"
  | "insurance-officer"
  | "store-manager"
  | "hr-manager"
  | "records-officer"
  | "quality-officer"
  | "data-officer"
  | "ambulance-driver"
  | "patient";

export type TriageLevel = 1 | 2 | 3 | 4 | 5;
export type AppointmentType = "Consultation" | "Follow-up" | "Emergency" | "Surgery" | "Laboratory" | "Radiology" | "Procedure" | "Telemedicine";
export type PaymentMethod = "Cash" | "MTN MoMo" | "Airtel Money" | "Bank Card" | "Insurance" | "Bank Transfer";
export type InsuranceProvider = "RSSB" | "Mutuelle" | "Private" | "Self-pay" | "International" | "Corporate";
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
export type Gender = "Male" | "Female" | "Other";
export type BedStatus = "Available" | "Occupied" | "Cleaning" | "Maintenance" | "Reserved";
export type DrugCategory = "Antibiotic" | "Antimalarial" | "Antiviral" | "Analgesic" | "Cardiovascular" | "Respiratory" | "Diabetes" | "Psychiatric" | "Hormonal" | "Vaccine" | "IV Fluid" | "Other";
export type LabStatus = "Ordered" | "Collected" | "Received" | "Processing" | "Completed" | "Critical review" | "In progress";
export type ClaimStatus = "Draft" | "Submitted" | "Approved" | "Denied" | "Paid" | "Appeal";
export type NotificationChannel = "SMS" | "Email" | "WhatsApp" | "In-App" | "Push";

export type ModuleKey =
  | "overview"
  | "admin"
  | "patients"
  | "appointments"
  | "queue"
  | "consultations"
  | "nursing"
  | "pharmacy"
  | "laboratory"
  | "radiology"
  | "inpatient"
  | "billing"
  | "insurance"
  | "inventory"
  | "procurement"
  | "hr"
  | "ambulance"
  | "blood-bank"
  | "mortuary"
  | "assets"
  | "telemedicine"
  | "notifications"
  | "reports"
  | "surveillance"
  | "interoperability"
  | "quality"
  | "ai"
  | "multi-tenant"
  | "audit"
  | "patient-portal"
  | "settings";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  department: string;
  facility: string;
  patientId?: string;
};

export type RoleDefinition = {
  label: string;
  description: string;
  modules: ModuleKey[];
  permissions: string[];
};

export type NavModule = {
  key: ModuleKey;
  label: string;
  description: string;
  icon: LucideIcon;
};

export type Patient = {
  id: string;
  mrn: string;
  name: string;
  nid: string;
  age: number;
  dob: string;
  gender: Gender;
  phone: string;
  email?: string;
  address: {
    province: string;
    district: string;
    sector: string;
  };
  insurance: InsuranceProvider;
  insuranceNumber?: string;
  bloodGroup: BloodGroup;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  status: string;
  registeredAt: string;
};

export type Appointment = {
  id: string;
  patientId: string;
  patient: string;
  clinician: string;
  department: string;
  date: string;
  time: string;
  type: AppointmentType;
  status: "Scheduled" | "Checked In" | "In Progress" | "Completed" | "No-Show" | "Cancelled" | "Triage" | "Waiting" | "Admitted";
  queue: string;
  priority: "Routine" | "Urgent" | "Emergency";
  notes?: string;
};

export type VitalSigns = {
  temperature?: number;
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  bloodGlucose?: number;
  weight?: number;
  height?: number;
  painScore?: number;
  recordedAt: string;
  recordedBy: string;
};

export type Diagnosis = {
  icdCode: string;
  description: string;
  type: "Primary" | "Secondary" | "Differential";
  chronic: boolean;
};

export type ClinicalNote = {
  id: string;
  patientId: string;
  visitId: string;
  doctorId: string;
  doctorName: string;
  type: "General" | "Emergency" | "Admission" | "Discharge" | "Pre-op" | "Post-op" | "Referral" | "ANC";
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  vitals?: VitalSigns;
  diagnoses: Diagnosis[];
  date: string;
  signed: boolean;
};

export type Prescription = {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  status: "Active" | "Dispensed" | "Expired" | "Cancelled";
  items: PrescriptionItem[];
};

export type PrescriptionItem = {
  drug: string;
  genericName: string;
  dosage: string;
  route: "Oral" | "IV" | "IM" | "SC" | "Topical" | "Inhaled" | "Sublingual";
  frequency: "OD" | "BID" | "TID" | "QID" | "PRN" | "Stat" | "Weekly";
  duration: string;
  quantity: number;
  instructions: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  genericName?: string;
  category: DrugCategory | string;
  batch: string;
  manufacturer?: string;
  expiry: string;
  quantity: number;
  reorderLevel: number;
  unitCost?: number;
  sellingPrice?: number;
  location: string;
  controlled: boolean;
};

export type LabRequest = {
  id: string;
  patientId: string;
  patient: string;
  orderedBy: string;
  test: string;
  testPanel: string;
  sample: string;
  barcode?: string;
  status: LabStatus;
  urgency: "Routine" | "Urgent" | "Stat";
  orderedAt: string;
  collectedAt?: string;
  resultAt?: string;
  turnaround: string;
  result?: string;
  unit?: string;
  referenceRange?: string;
  flag?: string;
  technician?: string;
};

export type Invoice = {
  number: string;
  patientId?: string;
  patient: string;
  payer: InsuranceProvider | string;
  amount: number;
  paid: number;
  status: "Paid" | "Partially Paid" | "Unpaid" | "Insurance";
  claimStatus: ClaimStatus | string;
  date: string;
  items: InvoiceItem[];
  paymentMethod?: PaymentMethod;
};

export type InvoiceItem = {
  service: string;
  category: string;
  quantity: number;
  unitPrice: number;
  total: number;
  insuranceCover?: number;
  patientCopay?: number;
};

export type BedInfo = {
  id: string;
  ward: string;
  room: string;
  bedNumber: string;
  type: "Standard" | "ICU" | "Isolation" | "Maternity" | "Paediatric";
  status: BedStatus;
  patientId?: string;
  patientName?: string;
  admittedAt?: string;
  attendingDoctor?: string;
};

export type StaffMember = {
  id: string;
  employeeId: string;
  name: string;
  role: Role;
  department: string;
  qualification: string;
  registrationNumber?: string;
  phone: string;
  email: string;
  status: "Active" | "On Leave" | "Terminated";
  joinedAt: string;
};

export type BloodUnit = {
  id: string;
  bloodGroup: BloodGroup;
  component: "Whole Blood" | "Packed RBC" | "Platelets" | "Fresh Frozen Plasma" | "Cryoprecipitate";
  units: number;
  collectedAt: string;
  expiryDate: string;
  donorId?: string;
  status: "Available" | "Reserved" | "Expired" | "Issued";
};

export type AuditEntry = {
  time: string;
  user: string;
  action: string;
  module: string;
  resource?: string;
  result: "Allowed" | "Denied" | "Success" | "Failed";
  ip?: string;
};

export type KPI = {
  label: string;
  value: string;
  trend: string;
  tone: "good" | "warn" | "danger";
  target?: string;
};

export type SurveillanceItem = {
  disease: string;
  cases: number;
  change: string;
  deadline: string;
  trend: number[];
};

export type NotificationItem = {
  id: string;
  type: "info" | "warning" | "danger" | "success";
  title: string;
  message: string;
  channel: NotificationChannel;
  recipient: string;
  sentAt: string;
  status: "Delivered" | "Pending" | "Failed";
};

export type QueueEntry = {
  token: string;
  patientId: string;
  patientName: string;
  department: string;
  priority: "Routine" | "Urgent" | "Emergency";
  waitMinutes: number;
  status: "Waiting" | "Calling" | "In Progress" | "Completed";
  triageLevel?: TriageLevel;
};
