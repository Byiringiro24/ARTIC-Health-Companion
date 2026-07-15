import {
  Activity,
  Ambulance,
  BadgeDollarSign,
  BedDouble,
  BellRing,
  BrainCircuit,
  Building2,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  FileBarChart,
  FileArchive,
  FlaskConical,
  HeartPulse,
  IdCard,
  Landmark,
  LayoutDashboard,
  LockKeyhole,
  Megaphone,
  MessageSquareText,
  Microscope,
  Network,
  PackageSearch,
  Pill,
  QrCode,
  Radio,
  Settings,
  ShieldCheck,
  Stethoscope,
  Syringe,
  Truck,
  UserCog,
  Warehouse,
  Users
} from "lucide-react";
import type {
  AppUser, Appointment, AuditEntry, BedInfo, BloodUnit,
  InventoryItem, Invoice, KPI, LabRequest, ModuleKey,
  NavModule, NotificationItem, Patient, QueueEntry,
  Role, RoleDefinition, StaffMember, SurveillanceItem
} from "@/types/hms";

export const roleDefinitions: Record<Role, RoleDefinition> = {
  "system-admin": {
    label: "System Admin",
    description: "Controls tenants, users, permissions, integrations, backups, audit logs, and security policies.",
    modules: ["overview","admin","patients","appointments","queue","consultations","nursing","pharmacy","laboratory","radiology","inpatient","billing","insurance","inventory","procurement","hr","ambulance","blood-bank","mortuary","assets","telemedicine","notifications","reports","surveillance","interoperability","quality","ai","multi-tenant","audit","settings"],
    permissions: ["manage_users","manage_roles","view_all_facilities","configure_integrations","export_reports","view_audit_logs"]
  },
  "hospital-manager": {
    label: "Hospital Manager",
    description: "Runs facility operations, staffing, KPIs, reports, assets, bed capacity, and emergency readiness.",
    modules: ["overview","queue","inpatient","billing","insurance","inventory","procurement","hr","ambulance","blood-bank","mortuary","assets","notifications","reports","surveillance","quality","audit","settings"],
    permissions: ["view_facility_kpis","approve_reports","manage_assets","view_finance","view_staff_performance"]
  },
  "medical-director": {
    label: "Medical Director",
    description: "Oversees clinical quality, patient safety, standards, audits, and clinical performance.",
    modules: ["overview","patients","consultations","nursing","laboratory","radiology","inpatient","reports","surveillance","quality","ai","audit"],
    permissions: ["view_clinical_kpis","review_clinical_audits","approve_clinical_protocols","monitor_patient_safety"]
  },
  doctor: {
    label: "Doctor",
    description: "Handles consultations, diagnoses, prescriptions, lab and imaging requests, referrals, and follow-ups.",
    modules: ["overview","patients","appointments","queue","consultations","laboratory","radiology","pharmacy","telemedicine","reports"],
    permissions: ["view_assigned_patients","write_clinical_notes","create_prescriptions","request_labs","create_referrals"]
  },
  nurse: {
    label: "Nurse",
    description: "Records vitals, triage, ward rounds, medication administration, consent, and patient education.",
    modules: ["overview","patients","appointments","queue","nursing","inpatient","blood-bank","reports"],
    permissions: ["record_vitals","triage_patients","update_bed_status","capture_consent"]
  },
  pharmacist: {
    label: "Pharmacist",
    description: "Dispenses prescriptions, manages stock, expiry, FEFO, recalls, and controlled medications.",
    modules: ["overview","pharmacy","billing","reports","audit"],
    permissions: ["dispense_medication","manage_drug_stock","verify_prescriptions","scan_barcodes"]
  },
  laboratory: {
    label: "Laboratory Scientist",
    description: "Manages specimen collection, barcodes, result entry, abnormal flags, QC, and critical alerts.",
    modules: ["overview","laboratory","patients","reports","audit"],
    permissions: ["collect_samples","enter_lab_results","release_results","manage_quality_control"]
  },
  radiology: {
    label: "Radiology Staff",
    description: "Schedules imaging, captures findings, attaches reports, and alerts clinicians when results are ready.",
    modules: ["overview","radiology","patients","reports"],
    permissions: ["schedule_imaging","upload_radiology_results","release_imaging_reports"]
  },
  receptionist: {
    label: "Receptionist",
    description: "Registers patients, verifies NID and insurance, books appointments, and manages queues and kiosk check-ins.",
    modules: ["overview","patients","appointments","queue","billing"],
    permissions: ["register_patients","book_appointments","verify_demographics","check_in_patients"]
  },
  accountant: {
    label: "Accountant",
    description: "Manages invoices, claims, payments, reconciliation, revenue reports, and financial controls.",
    modules: ["overview","billing","insurance","reports","audit"],
    permissions: ["create_invoices","process_payments","submit_claims","reconcile_payments"]
  },
  cashier: {
    label: "Cashier",
    description: "Collects payments, prints receipts, and reconciles daily cash and mobile money collections.",
    modules: ["overview","billing","notifications"],
    permissions: ["collect_payments","print_receipts","close_cashier_shift"]
  },
  "insurance-officer": {
    label: "Insurance Officer",
    description: "Verifies payer eligibility, submits claims, tracks approvals, and analyzes rejections.",
    modules: ["overview","insurance","billing","reports","audit"],
    permissions: ["verify_insurance","submit_claims","resolve_rejections"]
  },
  "store-manager": {
    label: "Store Manager",
    description: "Controls stock receiving, transfers, procurement requests, suppliers, and reorder planning.",
    modules: ["overview","inventory","procurement","assets","reports","audit"],
    permissions: ["receive_stock","transfer_stock","approve_stock_issue","create_purchase_request"]
  },
  "hr-manager": {
    label: "HR Manager",
    description: "Manages staff records, attendance, payroll, credentials, training, and workforce reporting.",
    modules: ["overview","hr","notifications","reports","audit","settings"],
    permissions: ["manage_staff","track_attendance","manage_training","view_payroll"]
  },
  "records-officer": {
    label: "Medical Records Officer",
    description: "Manages record filing, document control, archiving, retention, and authorized releases.",
    modules: ["overview","patients","consultations","reports","audit"],
    permissions: ["manage_records","archive_records","release_documents"]
  },
  "quality-officer": {
    label: "Quality Officer",
    description: "Runs clinical audits, accreditation readiness, patient safety, infection control, and satisfaction.",
    modules: ["overview","quality","surveillance","reports","audit","notifications"],
    permissions: ["manage_quality_audits","record_incidents","track_corrective_actions"]
  },
  "data-officer": {
    label: "Data Officer",
    description: "Prepares MOH, PBF, surveillance, analytics, and government submission reports.",
    modules: ["overview","reports","surveillance","interoperability","quality"],
    permissions: ["prepare_moh_reports","submit_pbf_indicators","analyze_facility_data"]
  },
  "ambulance-driver": {
    label: "Ambulance Driver",
    description: "Handles emergency dispatch, vehicle status, location updates, and incident handover.",
    modules: ["overview","ambulance","notifications"],
    permissions: ["update_vehicle_status","view_dispatch","record_handover"]
  },
  patient: {
    label: "Patient",
    description: "Views personal appointments, lab results, prescriptions, invoices, payments, reminders, and secure messages.",
    modules: ["patient-portal","appointments","telemedicine","billing"],
    permissions: ["view_own_record","book_own_appointment","pay_own_invoice","message_provider"]
  }
};

export const navModules: Record<ModuleKey, NavModule> = {
  overview: { key: "overview", label: "Dashboard", description: "Live operational overview and alerts", icon: LayoutDashboard },
  admin: { key: "admin", label: "System Admin", description: "Users, roles, facilities, tenants, and permissions", icon: ShieldCheck },
  patients: { key: "patients", label: "Patients", description: "Registration, MRN, NID, QR card, insurance, records", icon: Users },
  appointments: { key: "appointments", label: "Appointments", description: "Smart scheduling, reminders, kiosk, follow-up", icon: CalendarClock },
  queue: { key: "queue", label: "Smart Queue", description: "Priority queue, predicted waits, live calling", icon: BellRing },
  consultations: { key: "consultations", label: "Consultation", description: "Clinical notes, CDS, prescriptions, lab requests", icon: Stethoscope },
  nursing: { key: "nursing", label: "Nursing", description: "Vitals, triage, consent, medication administration", icon: HeartPulse },
  pharmacy: { key: "pharmacy", label: "Pharmacy", description: "eRx, FEFO, stock forecasting, barcode dispensing", icon: Pill },
  laboratory: { key: "laboratory", label: "Laboratory", description: "Specimens, barcodes, results, QC, critical alerts", icon: FlaskConical },
  radiology: { key: "radiology", label: "Radiology", description: "Imaging orders, reports, attachments, result alerts", icon: Radio },
  inpatient: { key: "inpatient", label: "Inpatient & Beds", description: "Admissions, transfers, bed map, discharge planning", icon: BedDouble },
  billing: { key: "billing", label: "Billing", description: "Invoices, payments, receipts, mobile money, balances", icon: BadgeDollarSign },
  insurance: { key: "insurance", label: "Insurance", description: "Eligibility checks, claims, rejection analysis", icon: Landmark },
  inventory: { key: "inventory", label: "Inventory", description: "Stock receiving, issue, transfers, expiry, reorder alerts", icon: Warehouse },
  procurement: { key: "procurement", label: "Procurement", description: "Purchase requests, suppliers, approvals, GRN, contracts", icon: ClipboardList },
  hr: { key: "hr", label: "Human Resources", description: "Staff records, attendance, payroll, licenses, training", icon: UserCog },
  ambulance: { key: "ambulance", label: "Ambulance", description: "Emergency dispatch, GPS location, crew and vehicle management", icon: Truck },
  "blood-bank": { key: "blood-bank", label: "Blood Bank", description: "Collection, testing, storage, compatibility, issue", icon: Syringe },
  mortuary: { key: "mortuary", label: "Mortuary", description: "Body admission, storage, death certificates, release authorization", icon: FileArchive },
  assets: { key: "assets", label: "Assets & IoT", description: "Equipment, RFID, calibration, maintenance, cold chain", icon: PackageSearch },
  telemedicine: { key: "telemedicine", label: "Telemedicine", description: "Video, voice, secure chat, remote prescriptions", icon: MessageSquareText },
  notifications: { key: "notifications", label: "Notifications", description: "SMS, email, WhatsApp, push, secure internal messaging", icon: Megaphone },
  reports: { key: "reports", label: "Reports & KPIs", description: "MOH, PBF, finance, quality, clinical audits", icon: FileBarChart },
  surveillance: { key: "surveillance", label: "Surveillance", description: "Epidemic reporting, outbreak trends, program monitoring", icon: Activity },
  interoperability: { key: "interoperability", label: "Interoperability", description: "FHIR, ICD-10/11, NID, CRVS, RSSB, HIE APIs", icon: IdCard },
  quality: { key: "quality", label: "Quality", description: "RAAQH readiness, clinical audit, incidents, infection control", icon: ClipboardCheck },
  ai: { key: "ai", label: "AI & Analytics", description: "CDS, predictive analytics, voice notes, risk scoring", icon: BrainCircuit },
  "multi-tenant": { key: "multi-tenant", label: "Multi-Tenant", description: "Hospital networks, branches, tenant isolation, central reporting", icon: Network },
  audit: { key: "audit", label: "Audit & Security", description: "Access logs, authorization separation, session controls", icon: LockKeyhole },
  "patient-portal": { key: "patient-portal", label: "My Health Portal", description: "Personal care, results, payments, messages", icon: QrCode },
  settings: { key: "settings", label: "Settings", description: "Facility, localization, notifications, backup policies", icon: Settings }
};

export const demoUsers: AppUser[] = [
  { id: "u-001", name: "Aline Uwase", email: "admin@artic.health", password: "admin123", role: "system-admin", department: "Platform", facility: "ARTIC National Cloud" },
  { id: "u-002", name: "Jean Habimana", email: "manager@artic.health", password: "manager123", role: "hospital-manager", department: "Executive Office", facility: "Kigali District Hospital" },
  { id: "u-003", name: "Dr. Grace Mukamana", email: "doctor@artic.health", password: "doctor123", role: "doctor", department: "Internal Medicine", facility: "Kigali District Hospital" },
  { id: "u-004", name: "Nurse Eric Niyonsenga", email: "nurse@artic.health", password: "nurse123", role: "nurse", department: "Emergency", facility: "Kigali District Hospital" },
  { id: "u-005", name: "Pharm. Diane Ingabire", email: "pharmacy@artic.health", password: "pharmacy123", role: "pharmacist", department: "Pharmacy", facility: "Kigali District Hospital" },
  { id: "u-006", name: "Lab Scientist Patrick", email: "lab@artic.health", password: "lab123", role: "laboratory", department: "Laboratory", facility: "Kigali District Hospital" },
  { id: "u-007", name: "Radiographer Chantal", email: "radiology@artic.health", password: "radio123", role: "radiology", department: "Radiology", facility: "Kigali District Hospital" },
  { id: "u-008", name: "Reception Lead Olive", email: "reception@artic.health", password: "front123", role: "receptionist", department: "Front Desk", facility: "Kigali District Hospital" },
  { id: "u-009", name: "Accountant Emmanuel", email: "accounts@artic.health", password: "money123", role: "accountant", department: "Finance", facility: "Kigali District Hospital" },
  { id: "u-010", name: "Claudine Mutesi", email: "patient@artic.health", password: "patient123", role: "patient", department: "Patient", facility: "Kigali District Hospital", patientId: "p-001" },
  { id: "u-011", name: "Dr. Yves Rukundo", email: "director@artic.health", password: "director123", role: "medical-director", department: "Clinical Governance", facility: "Kigali District Hospital" },
  { id: "u-012", name: "Cashier Bella", email: "cashier@artic.health", password: "cashier123", role: "cashier", department: "Cash Office", facility: "Kigali District Hospital" },
  { id: "u-013", name: "Claims Officer Nadia", email: "insurance@artic.health", password: "claim123", role: "insurance-officer", department: "Insurance", facility: "Kigali District Hospital" },
  { id: "u-014", name: "Store Manager Bosco", email: "store@artic.health", password: "store123", role: "store-manager", department: "Stores", facility: "Kigali District Hospital" },
  { id: "u-015", name: "HR Manager Sandrine", email: "hr@artic.health", password: "hr123", role: "hr-manager", department: "Human Resources", facility: "Kigali District Hospital" },
  { id: "u-016", name: "Quality Officer Alice", email: "quality@artic.health", password: "quality123", role: "quality-officer", department: "Quality", facility: "Kigali District Hospital" },
  { id: "u-017", name: "Data Officer Kevin", email: "data@artic.health", password: "data123", role: "data-officer", department: "HMIS Data", facility: "Kigali District Hospital" },
  { id: "u-018", name: "Ambulance Driver Theoneste", email: "ambulance@artic.health", password: "drive123", role: "ambulance-driver", department: "Emergency Transport", facility: "Kigali District Hospital" }
];

export const patients: Patient[] = [
  {
    id: "p-001", mrn: "MRN-2026-0001", name: "Claudine Mutesi", nid: "1199880000000001",
    age: 34, dob: "1992-03-15", gender: "Female", phone: "+250 788 100 001", email: "claudine@email.rw",
    address: { province: "Kigali", district: "Gasabo", sector: "Kimironko" },
    insurance: "RSSB", insuranceNumber: "RSSB-00123456",
    bloodGroup: "O+", allergies: ["Penicillin"], chronicConditions: ["Hypertension"],
    currentMedications: ["Amlodipine 5mg OD", "Hydrochlorothiazide 25mg OD"],
    emergencyContact: { name: "Jean Mutesi", relationship: "Husband", phone: "+250 788 200 001" },
    status: "Active follow-up", registeredAt: "2026-01-10"
  },
  {
    id: "p-002", mrn: "MRN-2026-0002", name: "Samuel Ndayisaba", nid: "1199770000000002",
    age: 8, dob: "2018-07-22", gender: "Male", phone: "+250 788 100 002",
    address: { province: "Kigali", district: "Kicukiro", sector: "Niboye" },
    insurance: "Mutuelle", insuranceNumber: "MUT-789012",
    bloodGroup: "A+", allergies: [], chronicConditions: ["Asthma"],
    currentMedications: ["Salbutamol inhaler PRN"],
    emergencyContact: { name: "Marie Ndayisaba", relationship: "Mother", phone: "+250 788 200 002" },
    status: "In clinic", registeredAt: "2026-02-05"
  },
  {
    id: "p-003", mrn: "MRN-2026-0003", name: "Esperance Kayitesi", nid: "1199660000000003",
    age: 61, dob: "1965-11-08", gender: "Female", phone: "+250 788 100 003",
    address: { province: "Eastern", district: "Rwamagana", sector: "Kigabiro" },
    insurance: "Private", insuranceNumber: "PRIV-334455",
    bloodGroup: "B-", allergies: ["Sulfa"], chronicConditions: ["Type 2 Diabetes", "Hypertension"],
    currentMedications: ["Metformin 500mg BID", "Glibenclamide 5mg OD", "Amlodipine 10mg OD"],
    emergencyContact: { name: "Pierre Kayitesi", relationship: "Son", phone: "+250 788 200 003" },
    status: "Admitted", registeredAt: "2025-11-20"
  },
  {
    id: "p-004", mrn: "MRN-2026-0004", name: "Patrick Mugenzi", nid: "1199550000000004",
    age: 44, dob: "1982-05-30", gender: "Male", phone: "+250 788 100 004",
    address: { province: "Northern", district: "Musanze", sector: "Muhoza" },
    insurance: "RSSB", insuranceNumber: "RSSB-00567890",
    bloodGroup: "AB+", allergies: ["Latex"], chronicConditions: [],
    currentMedications: [],
    emergencyContact: { name: "Beatrice Mugenzi", relationship: "Wife", phone: "+250 788 200 004" },
    status: "Emergency triage", registeredAt: "2026-07-15"
  },
  {
    id: "p-005", mrn: "MRN-2026-0005", name: "Vestine Uwimana", nid: "1200010000000005",
    age: 28, dob: "1998-01-14", gender: "Female", phone: "+250 788 100 005",
    address: { province: "Southern", district: "Huye", sector: "Ngoma" },
    insurance: "Mutuelle", insuranceNumber: "MUT-112233",
    bloodGroup: "A-", allergies: [], chronicConditions: [],
    currentMedications: [],
    emergencyContact: { name: "Joseph Uwimana", relationship: "Father", phone: "+250 788 200 005" },
    status: "ANC visit", registeredAt: "2026-05-20"
  }
];

export const appointments: Appointment[] = [
  { id: "a-001", patientId: "p-001", patient: "Claudine Mutesi", clinician: "Dr. Grace Mukamana", department: "Internal Medicine", date: "2026-07-15", time: "08:30", type: "Follow-up", status: "Checked In", queue: "IM-014", priority: "Routine" },
  { id: "a-002", patientId: "p-004", patient: "Patrick Mugenzi", clinician: "Emergency Team", department: "Emergency", date: "2026-07-15", time: "Now", type: "Emergency", status: "Triage", queue: "ER-001", priority: "Emergency" },
  { id: "a-003", patientId: "p-002", patient: "Samuel Ndayisaba", clinician: "Dr. Grace Mukamana", department: "Pediatrics", date: "2026-07-15", time: "09:10", type: "Consultation", status: "Waiting", queue: "PD-006", priority: "Urgent" },
  { id: "a-004", patientId: "p-003", patient: "Esperance Kayitesi", clinician: "Dr. Yves Rukundo", department: "Medical Ward", date: "2026-07-15", time: "10:00", type: "Follow-up", status: "Admitted", queue: "WARD", priority: "Urgent" },
  { id: "a-005", patientId: "p-005", patient: "Vestine Uwimana", clinician: "Midwife Agnès", department: "Maternity", date: "2026-07-15", time: "11:00", type: "Consultation", status: "Scheduled", queue: "MAT-003", priority: "Routine" }
];

export const queueEntries: QueueEntry[] = [
  { token: "ER-001", patientId: "p-004", patientName: "Patrick Mugenzi", department: "Emergency", priority: "Emergency", waitMinutes: 0, status: "In Progress", triageLevel: 1 },
  { token: "PD-006", patientId: "p-002", patientName: "Samuel Ndayisaba", department: "Pediatrics", priority: "Urgent", waitMinutes: 12, status: "Waiting", triageLevel: 2 },
  { token: "IM-014", patientId: "p-001", patientName: "Claudine Mutesi", department: "Internal Medicine", priority: "Routine", waitMinutes: 18, status: "Waiting", triageLevel: 3 },
  { token: "MAT-003", patientId: "p-005", patientName: "Vestine Uwimana", department: "Maternity", priority: "Routine", waitMinutes: 35, status: "Waiting", triageLevel: 4 }
];

export const inventory: InventoryItem[] = [
  { id: "i-001", name: "Amoxicillin 500mg", genericName: "Amoxicillin", category: "Antibiotic", batch: "AMX-2602", manufacturer: "Cipla Ltd", expiry: "2026-11-30", quantity: 420, reorderLevel: 300, unitCost: 85, sellingPrice: 120, location: "Pharmacy Store A", controlled: false },
  { id: "i-002", name: "Insulin Glargine 100U/mL", genericName: "Insulin Glargine", category: "Diabetes", batch: "INS-2604", manufacturer: "Sanofi", expiry: "2026-09-12", quantity: 36, reorderLevel: 50, unitCost: 4200, sellingPrice: 5500, location: "2–8°C Refrigerator", controlled: false },
  { id: "i-003", name: "Malaria RDT", genericName: "RDT Kit", category: "Other", batch: "MRDT-2601", manufacturer: "SD BIOLINE", expiry: "2027-01-19", quantity: 1900, reorderLevel: 700, unitCost: 320, sellingPrice: 450, location: "Laboratory", controlled: false },
  { id: "i-004", name: "Artemether-Lumefantrine 80/480mg", genericName: "Artemether-Lumefantrine", category: "Antimalarial", batch: "ACT-2603", manufacturer: "Novartis", expiry: "2027-03-01", quantity: 245, reorderLevel: 150, unitCost: 1800, sellingPrice: 2500, location: "Pharmacy Store A", controlled: false },
  { id: "i-005", name: "Morphine 10mg/mL Injection", genericName: "Morphine Sulfate", category: "Analgesic", batch: "MOR-2601", manufacturer: "Hameln", expiry: "2026-08-15", quantity: 18, reorderLevel: 20, unitCost: 3500, sellingPrice: 5000, location: "Controlled Cabinet", controlled: true },
  { id: "i-006", name: "Metformin 500mg", genericName: "Metformin HCl", category: "Diabetes", batch: "MET-2602", manufacturer: "Cipla Ltd", expiry: "2027-05-20", quantity: 680, reorderLevel: 400, unitCost: 55, sellingPrice: 80, location: "Pharmacy Store B", controlled: false },
  { id: "i-007", name: "IV Normal Saline 500mL", genericName: "Sodium Chloride 0.9%", category: "IV Fluid", batch: "NS-2605", manufacturer: "B.Braun", expiry: "2027-02-10", quantity: 92, reorderLevel: 50, unitCost: 1200, sellingPrice: 1500, location: "Store Room 2", controlled: false },
  { id: "i-008", name: "BCG Vaccine", genericName: "BCG (Bacillus Calmette-Guérin)", category: "Vaccine", batch: "BCG-2601", manufacturer: "SERUM Institute", expiry: "2026-10-01", quantity: 210, reorderLevel: 100, unitCost: 800, sellingPrice: 0, location: "Vaccine Fridge 4°C", controlled: false }
];

export const labRequests: LabRequest[] = [
  { id: "L-4401", patientId: "p-004", patient: "Patrick Mugenzi", orderedBy: "Dr. Grace Mukamana", test: "Full Blood Count", testPanel: "Hematology", sample: "EDTA Blood", barcode: "SP-9901", status: "Critical review", urgency: "Stat", orderedAt: "2026-07-15 07:45", collectedAt: "2026-07-15 07:52", turnaround: "18 min", result: "7.2", unit: "g/dL", referenceRange: "12–16 g/dL", flag: "Hemoglobin low — CRITICAL", technician: "Lab Scientist Patrick" },
  { id: "L-4402", patientId: "p-003", patient: "Esperance Kayitesi", orderedBy: "Dr. Yves Rukundo", test: "HbA1c", testPanel: "Biochemistry", sample: "EDTA Blood", barcode: "SP-9902", status: "Completed", urgency: "Routine", orderedAt: "2026-07-14 09:00", collectedAt: "2026-07-14 09:10", resultAt: "2026-07-14 10:52", turnaround: "42 min", result: "9.1", unit: "%", referenceRange: "< 7%", flag: "High", technician: "Lab Scientist Patrick" },
  { id: "L-4403", patientId: "p-002", patient: "Samuel Ndayisaba", orderedBy: "Dr. Grace Mukamana", test: "Malaria RDT", testPanel: "Parasitology", sample: "Finger-prick Blood", barcode: "SP-9903", status: "In progress", urgency: "Urgent", orderedAt: "2026-07-15 08:45", collectedAt: "2026-07-15 08:50", turnaround: "9 min", technician: "Lab Scientist Patrick" },
  { id: "L-4404", patientId: "p-001", patient: "Claudine Mutesi", orderedBy: "Dr. Grace Mukamana", test: "Renal Function", testPanel: "Biochemistry", sample: "Serum", barcode: "SP-9904", status: "Ordered", urgency: "Routine", orderedAt: "2026-07-15 08:35", turnaround: "—" }
];

export const invoices: Invoice[] = [
  {
    number: "INV-2026-1101", patientId: "p-001", patient: "Claudine Mutesi", payer: "RSSB",
    amount: 34200, paid: 17100, status: "Partially Paid", claimStatus: "Submitted",
    date: "2026-07-15", paymentMethod: "MTN MoMo",
    items: [
      { service: "Specialist Consultation", category: "Consultation", quantity: 1, unitPrice: 12000, total: 12000, insuranceCover: 6000, patientCopay: 6000 },
      { service: "Renal Function Panel", category: "Laboratory", quantity: 1, unitPrice: 8200, total: 8200, insuranceCover: 4100, patientCopay: 4100 },
      { service: "Amlodipine 5mg x 30", category: "Pharmacy", quantity: 30, unitPrice: 80, total: 2400, insuranceCover: 1200, patientCopay: 1200 },
      { service: "BP Monitoring", category: "Nursing", quantity: 1, unitPrice: 3600, total: 3600, insuranceCover: 1800, patientCopay: 1800 }
    ]
  },
  {
    number: "INV-2026-1102", patientId: "p-002", patient: "Samuel Ndayisaba", payer: "Mutuelle",
    amount: 12800, paid: 0, status: "Unpaid", claimStatus: "Draft",
    date: "2026-07-15",
    items: [
      { service: "General Consultation", category: "Consultation", quantity: 1, unitPrice: 6000, total: 6000, insuranceCover: 5400, patientCopay: 600 },
      { service: "Malaria RDT", category: "Laboratory", quantity: 1, unitPrice: 450, total: 450, insuranceCover: 405, patientCopay: 45 },
      { service: "ACT 6-dose course", category: "Pharmacy", quantity: 1, unitPrice: 2500, total: 2500, insuranceCover: 2250, patientCopay: 250 }
    ]
  },
  {
    number: "INV-2026-1103", patientId: "p-003", patient: "Esperance Kayitesi", payer: "Private",
    amount: 186500, paid: 186500, status: "Paid", claimStatus: "Approved",
    date: "2026-07-14", paymentMethod: "Bank Card",
    items: [
      { service: "Inpatient Day (Private Room)", category: "Inpatient", quantity: 3, unitPrice: 45000, total: 135000 },
      { service: "HbA1c Test", category: "Laboratory", quantity: 1, unitPrice: 8200, total: 8200 },
      { service: "Diabetes Medications x 30 days", category: "Pharmacy", quantity: 1, unitPrice: 18300, total: 18300 },
      { service: "Specialist Consultation x 2", category: "Consultation", quantity: 2, unitPrice: 12500, total: 25000 }
    ]
  }
];

export const beds: BedInfo[] = [
  { id: "b-001", ward: "ICU", room: "ICU-1", bedNumber: "ICU-1A", type: "ICU", status: "Occupied", patientId: "p-004", patientName: "Patrick Mugenzi", admittedAt: "2026-07-15 08:00", attendingDoctor: "Dr. Grace Mukamana" },
  { id: "b-002", ward: "ICU", room: "ICU-1", bedNumber: "ICU-1B", type: "ICU", status: "Available" },
  { id: "b-003", ward: "ICU", room: "ICU-2", bedNumber: "ICU-2A", type: "ICU", status: "Occupied", patientName: "Unknown patient", admittedAt: "2026-07-14" },
  { id: "b-004", ward: "Medical Ward", room: "MW-101", bedNumber: "MW-101A", type: "Standard", status: "Occupied", patientId: "p-003", patientName: "Esperance Kayitesi", admittedAt: "2026-07-12", attendingDoctor: "Dr. Yves Rukundo" },
  { id: "b-005", ward: "Medical Ward", room: "MW-101", bedNumber: "MW-101B", type: "Standard", status: "Available" },
  { id: "b-006", ward: "Medical Ward", room: "MW-102", bedNumber: "MW-102A", type: "Standard", status: "Cleaning" },
  { id: "b-007", ward: "Maternity", room: "MAT-201", bedNumber: "MAT-201A", type: "Maternity", status: "Available" },
  { id: "b-008", ward: "Maternity", room: "MAT-201", bedNumber: "MAT-201B", type: "Maternity", status: "Occupied", patientId: "p-005", patientName: "Vestine Uwimana", admittedAt: "2026-07-15" },
  { id: "b-009", ward: "Isolation", room: "ISO-301", bedNumber: "ISO-301A", type: "Isolation", status: "Available" },
  { id: "b-010", ward: "Paediatric", room: "PD-401", bedNumber: "PD-401A", type: "Paediatric", status: "Occupied", patientId: "p-002", patientName: "Samuel Ndayisaba", admittedAt: "2026-07-15" }
];

export const bloodUnits: BloodUnit[] = [
  { id: "bu-001", bloodGroup: "O+", component: "Packed RBC", units: 18, collectedAt: "2026-07-10", expiryDate: "2026-08-07", status: "Available" },
  { id: "bu-002", bloodGroup: "A+", component: "Packed RBC", units: 12, collectedAt: "2026-07-08", expiryDate: "2026-08-05", status: "Available" },
  { id: "bu-003", bloodGroup: "B-", component: "Packed RBC", units: 4, collectedAt: "2026-07-05", expiryDate: "2026-08-02", status: "Available" },
  { id: "bu-004", bloodGroup: "AB+", component: "Fresh Frozen Plasma", units: 7, collectedAt: "2026-06-20", expiryDate: "2026-12-20", status: "Available" },
  { id: "bu-005", bloodGroup: "O-", component: "Platelets", units: 2, collectedAt: "2026-07-13", expiryDate: "2026-07-18", status: "Available" }
];

export const staff: StaffMember[] = [
  { id: "s-001", employeeId: "EMP-001", name: "Dr. Grace Mukamana", role: "doctor", department: "Internal Medicine", qualification: "MBChB, MMed", registrationNumber: "RMB-2019-0042", phone: "+250 788 300 001", email: "doctor@artic.health", status: "Active", joinedAt: "2019-03-01" },
  { id: "s-002", employeeId: "EMP-002", name: "Dr. Yves Rukundo", role: "medical-director", department: "Clinical Governance", qualification: "MBChB, MMed, FCPS", registrationNumber: "RMB-2015-0018", phone: "+250 788 300 002", email: "director@artic.health", status: "Active", joinedAt: "2015-06-15" },
  { id: "s-003", employeeId: "EMP-003", name: "Nurse Eric Niyonsenga", role: "nurse", department: "Emergency", qualification: "BSc Nursing", registrationNumber: "RNB-2021-0156", phone: "+250 788 300 003", email: "nurse@artic.health", status: "Active", joinedAt: "2021-01-15" },
  { id: "s-004", employeeId: "EMP-004", name: "Pharm. Diane Ingabire", role: "pharmacist", department: "Pharmacy", qualification: "BPharm", registrationNumber: "RPB-2020-0089", phone: "+250 788 300 004", email: "pharmacy@artic.health", status: "Active", joinedAt: "2020-09-01" },
  { id: "s-005", employeeId: "EMP-005", name: "Lab Scientist Patrick", role: "laboratory", department: "Laboratory", qualification: "BSc Medical Lab Sciences", registrationNumber: "RMLB-2022-0034", phone: "+250 788 300 005", email: "lab@artic.health", status: "Active", joinedAt: "2022-02-01" }
];

export const auditLogs: AuditEntry[] = [
  { time: "15:24", user: "Dr. Grace Mukamana", action: "Viewed patient clinical record", module: "consultations", resource: "p-001", result: "Allowed", ip: "10.0.1.12" },
  { time: "15:22", user: "Lab Scientist Patrick", action: "Released critical lab result L-4401", module: "laboratory", resource: "L-4401", result: "Success", ip: "10.0.1.18" },
  { time: "15:18", user: "Accountant Emmanuel", action: "Submitted insurance claim INV-2026-1101", module: "billing", resource: "INV-2026-1101", result: "Allowed", ip: "10.0.1.20" },
  { time: "15:11", user: "Reception Lead Olive", action: "Attempted to access clinical notes", module: "consultations", resource: "p-003", result: "Denied", ip: "10.0.1.8" },
  { time: "15:02", user: "System", action: "Automated backup completed", module: "system", result: "Success" },
  { time: "14:55", user: "Pharm. Diane Ingabire", action: "Dispensed controlled substance MOR-2601", module: "pharmacy", resource: "p-004", result: "Success", ip: "10.0.1.15" },
  { time: "14:30", user: "Dr. Yves Rukundo", action: "Signed discharge summary for p-003", module: "consultations", resource: "p-003", result: "Success", ip: "10.0.1.11" }
];

export const kpis: KPI[] = [
  { label: "Waiting patients", value: "42", trend: "↓ 18 min avg wait", tone: "good", target: "< 30 min" },
  { label: "Bed occupancy", value: "82%", trend: "14 beds available", tone: "warn", target: "70–85%" },
  { label: "Revenue today", value: "RWF 8.7M", trend: "Claims approval 91%", tone: "good", target: "> 90%" },
  { label: "Critical alerts", value: "6", trend: "2 labs, 1 ICU, 3 stock", tone: "danger" }
];

export const surveillance: SurveillanceItem[] = [
  { disease: "Malaria", cases: 28, change: "+12%", deadline: "Weekly report due Friday", trend: [18, 21, 22, 25, 24, 26, 28] },
  { disease: "Tuberculosis", cases: 4, change: "Stable", deadline: "Monthly cohort report", trend: [3, 4, 4, 3, 4, 4, 4] },
  { disease: "Cholera", cases: 0, change: "No alerts", deadline: "Immediate if suspected", trend: [0, 0, 0, 0, 0, 0, 0] },
  { disease: "COVID-19", cases: 3, change: "−4%", deadline: "Weekly surveillance", trend: [8, 7, 6, 5, 4, 4, 3] }
];

export const notifications: NotificationItem[] = [
  { id: "n-001", type: "danger", title: "Critical Lab Result", message: "Patrick Mugenzi — Hemoglobin 7.2 g/dL. Immediate clinical review required.", channel: "In-App", recipient: "Dr. Grace Mukamana", sentAt: "2026-07-15 15:22", status: "Delivered" },
  { id: "n-002", type: "warning", title: "Low Stock Alert", message: "Insulin Glargine stock at 36 units — below reorder level of 50.", channel: "In-App", recipient: "Store Manager Bosco", sentAt: "2026-07-15 14:00", status: "Delivered" },
  { id: "n-003", type: "info", title: "Appointment Reminder", message: "Claudine Mutesi — Follow-up with Dr. Mukamana tomorrow at 08:30.", channel: "SMS", recipient: "+250 788 100 001", sentAt: "2026-07-14 08:00", status: "Delivered" },
  { id: "n-004", type: "success", title: "Insurance Claim Approved", message: "Claim INV-2026-1103 for Esperance Kayitesi approved. RWF 168,500 to be reimbursed.", channel: "Email", recipient: "accounts@artic.health", sentAt: "2026-07-15 10:30", status: "Delivered" }
];

export const revenueByDepartment = [
  { department: "Consultation", revenue: 2400000 },
  { department: "Pharmacy", revenue: 1850000 },
  { department: "Laboratory", revenue: 1200000 },
  { department: "Inpatient", revenue: 2100000 },
  { department: "Radiology", revenue: 650000 },
  { department: "Emergency", revenue: 500000 }
];

export const weeklyRevenue = [
  { day: "Mon", revenue: 7200000 },
  { day: "Tue", revenue: 8100000 },
  { day: "Wed", revenue: 6900000 },
  { day: "Thu", revenue: 8700000 },
  { day: "Fri", revenue: 9200000 },
  { day: "Sat", revenue: 5400000 },
  { day: "Sun", revenue: 3100000 }
];

export const patientTimeline = [
  "NID and RSSB eligibility verified through interoperability gateway",
  "Vitals recorded: BP 148/92, pulse 84, O2 98%",
  "CDS warning: Penicillin allergy flagged before prescribing",
  "Lab result released to patient portal and doctor dashboard",
  "Follow-up reminder scheduled by SMS and in-app notification"
];
