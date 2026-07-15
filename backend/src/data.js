export const roles = {
  "system-admin": {
    label: "System Administrator",
    accessLevel: "Full system access, tenants, users, roles, settings, integrations, backup, audit",
    modules: ["auth", "patients", "appointments", "reception", "emr", "doctor", "nursing", "pharmacy", "laboratory", "radiology", "billing", "insurance", "inventory", "procurement", "hr", "ambulance", "blood-bank", "mortuary", "reports", "notifications", "patient-portal", "interoperability", "security", "quality", "ai", "multi-tenant"]
  },
  "hospital-admin": {
    label: "Hospital Administrator",
    accessLevel: "Hospital-level operations, staff, reports, settings, quality, finance",
    modules: ["patients", "appointments", "reception", "billing", "insurance", "inventory", "procurement", "hr", "reports", "quality", "security"]
  },
  "medical-director": {
    label: "Medical Director",
    accessLevel: "Clinical oversight, quality assurance, audits, patient safety",
    modules: ["emr", "doctor", "nursing", "laboratory", "radiology", "reports", "quality", "surveillance", "ai"]
  },
  doctor: {
    label: "Doctor",
    accessLevel: "Consultations, SOAP notes, prescriptions, orders, referrals, admissions",
    modules: ["patients", "appointments", "emr", "doctor", "laboratory", "radiology", "pharmacy", "telemedicine", "notifications"]
  },
  nurse: {
    label: "Nurse",
    accessLevel: "Vitals, nursing notes, MAR, ward care, triage, shift handover",
    modules: ["patients", "reception", "nursing", "emr", "blood-bank", "notifications"]
  },
  receptionist: {
    label: "Receptionist",
    accessLevel: "Registration, check-in, queues, appointments, insurance verification",
    modules: ["patients", "appointments", "reception", "billing", "notifications"]
  },
  pharmacist: {
    label: "Pharmacist",
    accessLevel: "Drug inventory, dispensing, FEFO, interactions, controlled substances",
    modules: ["pharmacy", "inventory", "billing", "notifications", "quality"]
  },
  "lab-technician": {
    label: "Lab Technician",
    accessLevel: "Specimen workflow, results, critical alerts, QC, reports",
    modules: ["laboratory", "patients", "reports", "notifications", "quality"]
  },
  radiologist: {
    label: "Radiologist",
    accessLevel: "Imaging orders, radiology reports, PACS/DICOM workflows",
    modules: ["radiology", "patients", "reports", "notifications"]
  },
  accountant: {
    label: "Accountant",
    accessLevel: "Invoices, claims, financial reports, reconciliation",
    modules: ["billing", "insurance", "reports", "security"]
  },
  cashier: {
    label: "Cashier",
    accessLevel: "Payment collection, receipts, daily cash reconciliation",
    modules: ["billing", "notifications"]
  },
  "insurance-officer": {
    label: "Insurance Officer",
    accessLevel: "Eligibility checks, claim submission, rejection analysis",
    modules: ["insurance", "billing", "reports"]
  },
  "store-manager": {
    label: "Store Manager",
    accessLevel: "Inventory, supplies, procurement, stock issue and receiving",
    modules: ["inventory", "procurement", "reports"]
  },
  "hr-manager": {
    label: "HR Manager",
    accessLevel: "Staff records, payroll, attendance, credential tracking",
    modules: ["hr", "reports", "notifications"]
  },
  "records-officer": {
    label: "Medical Records Officer",
    accessLevel: "Record filing, document control, archive, retention",
    modules: ["patients", "emr", "reports", "security"]
  },
  "quality-officer": {
    label: "Quality Officer",
    accessLevel: "Audits, patient safety, accreditation, infection control",
    modules: ["quality", "reports", "security", "surveillance"]
  },
  "data-officer": {
    label: "Data Officer",
    accessLevel: "Analytics, MOH reports, PBF, disease surveillance submissions",
    modules: ["reports", "surveillance", "interoperability"]
  },
  "ambulance-driver": {
    label: "Ambulance Driver",
    accessLevel: "Dispatch, vehicle location, incident handover",
    modules: ["ambulance", "notifications"]
  },
  patient: {
    label: "Patient",
    accessLevel: "Own appointments, records, invoices, prescriptions, telemedicine, messages",
    modules: ["patient-portal", "appointments", "billing", "telemedicine", "notifications"]
  }
};

export const modules = [
  { key: "auth", name: "Authentication & RBAC", category: "Platform", features: ["MFA", "JWT refresh rotation", "session timeout", "field-level permissions", "device tracking"] },
  { key: "patients", name: "Patient Management", category: "Core", features: ["NID", "MRN", "QR card", "biometrics-ready", "insurance profile", "medical/social/family history"] },
  { key: "appointments", name: "Appointment Management", category: "Core", features: ["self-booking", "walk-ins", "recurring visits", "doctor availability", "reminders"] },
  { key: "reception", name: "Reception & Patient Flow", category: "Core", features: ["check-in", "kiosk", "triage routing", "queue display", "patient status tracking"] },
  { key: "emr", name: "Electronic Medical Records", category: "Clinical", features: ["SOAP notes", "vitals", "ICD-10/11", "problem list", "discharge summaries"] },
  { key: "doctor", name: "Doctor Workspace", category: "Clinical", features: ["consultation workflow", "orders", "e-prescription", "referrals", "digital signatures"] },
  { key: "nursing", name: "Nursing & Ward Care", category: "Clinical", features: ["vitals charting", "MAR", "shift handover", "bed management", "fall risk"] },
  { key: "pharmacy", name: "Pharmacy Management", category: "Clinical Services", features: ["drug database", "FEFO", "dispensing", "interaction checks", "controlled drugs"] },
  { key: "laboratory", name: "Laboratory", category: "Clinical Services", features: ["barcoded samples", "result entry", "critical alerts", "QC", "instrument interface"] },
  { key: "radiology", name: "Radiology", category: "Clinical Services", features: ["imaging orders", "reports", "DICOM/PACS-ready", "result alerts"] },
  { key: "billing", name: "Billing & Cashier", category: "Finance", features: ["smart invoices", "receipts", "mobile money", "reconciliation", "discount controls"] },
  { key: "insurance", name: "Insurance & Claims", category: "Finance", features: ["RSSB/Mutuelle verification", "claims", "rejections", "payment reconciliation"] },
  { key: "inventory", name: "Inventory & Store", category: "Operations", features: ["stock receiving", "issue", "transfer", "expiry", "reorder alerts"] },
  { key: "procurement", name: "Procurement", category: "Operations", features: ["purchase requests", "suppliers", "approvals", "GRN", "contracts"] },
  { key: "hr", name: "Human Resources", category: "Operations", features: ["staff records", "attendance", "payroll", "licenses", "training"] },
  { key: "ambulance", name: "Ambulance & Emergency Response", category: "Emergency", features: ["dispatch", "GPS tracking", "crew assignment", "vehicle maintenance"] },
  { key: "blood-bank", name: "Blood Bank", category: "Clinical Services", features: ["donors", "blood stock", "crossmatch", "transfusion traceability"] },
  { key: "mortuary", name: "Mortuary", category: "Operations", features: ["body admission", "storage", "death certificates", "release authorization"] },
  { key: "reports", name: "Reports & Analytics", category: "Compliance", features: ["MOH", "PBF", "finance", "clinical", "KPI dashboards"] },
  { key: "surveillance", name: "Disease Surveillance", category: "Compliance", features: ["immediate alerts", "weekly epi reports", "outbreak trends", "program monitoring"] },
  { key: "notifications", name: "Notifications & Communication", category: "Engagement", features: ["SMS", "email", "WhatsApp", "push", "secure messaging"] },
  { key: "patient-portal", name: "Patient Portal", category: "Patient", features: ["appointments", "results", "prescriptions", "payments", "secure chat"] },
  { key: "telemedicine", name: "Telemedicine", category: "Patient", features: ["video", "voice", "chat", "remote eRx", "consent"] },
  { key: "interoperability", name: "Integration & Interoperability", category: "Platform", features: ["FHIR", "HIE", "NID/CRVS", "insurance APIs", "payment gateways"] },
  { key: "security", name: "Security & Compliance", category: "Platform", features: ["encryption", "audit trail", "CSRF/XSS protections", "rate limiting", "privacy rights"] },
  { key: "quality", name: "Quality Management", category: "Compliance", features: ["RAAQH readiness", "clinical audit", "patient safety", "infection control", "satisfaction"] },
  { key: "ai", name: "AI & Advanced Features", category: "Advanced", features: ["CDS", "diagnosis suggestions", "drug demand forecast", "voice notes", "risk scoring"] },
  { key: "multi-tenant", name: "Multi-Tenant Scalability", category: "Platform", features: ["tenant isolation", "branch settings", "central reporting", "horizontal scaling"] }
];

export const users = [
  { id: "u-001", name: "Aline Uwase", email: "admin@artic.health", password: "admin123", role: "system-admin", department: "Platform", facility: "ARTIC National Cloud" },
  { id: "u-002", name: "Jean Habimana", email: "manager@artic.health", password: "manager123", role: "hospital-admin", department: "Executive Office", facility: "Kigali District Hospital" },
  { id: "u-003", name: "Dr. Grace Mukamana", email: "doctor@artic.health", password: "doctor123", role: "doctor", department: "Internal Medicine", facility: "Kigali District Hospital" },
  { id: "u-004", name: "Nurse Eric Niyonsenga", email: "nurse@artic.health", password: "nurse123", role: "nurse", department: "Emergency", facility: "Kigali District Hospital" },
  { id: "u-005", name: "Pharm. Diane Ingabire", email: "pharmacy@artic.health", password: "pharmacy123", role: "pharmacist", department: "Pharmacy", facility: "Kigali District Hospital" },
  { id: "u-006", name: "Lab Scientist Patrick", email: "lab@artic.health", password: "lab123", role: "lab-technician", department: "Laboratory", facility: "Kigali District Hospital" },
  { id: "u-007", name: "Claudine Mutesi", email: "patient@artic.health", password: "patient123", role: "patient", department: "Patient", facility: "Kigali District Hospital", patientId: "p-001" }
];

export const patients = [
  { id: "p-001", mrn: "MRN-2026-0001", name: "Claudine Mutesi", nid: "1199880000000001", age: 34, gender: "Female", phone: "+250 788 100 001", insurance: "RSSB verified", bloodGroup: "O+", allergies: ["Penicillin"], status: "Active follow-up" },
  { id: "p-002", mrn: "MRN-2026-0002", name: "Samuel Ndayisaba", nid: "1199770000000002", age: 8, gender: "Male", phone: "+250 788 100 002", insurance: "Mutuelle verified", bloodGroup: "A+", allergies: ["None"], status: "In clinic" },
  { id: "p-003", mrn: "MRN-2026-0003", name: "Esperance Kayitesi", nid: "1199660000000003", age: 61, gender: "Female", phone: "+250 788 100 003", insurance: "Private pending", bloodGroup: "B-", allergies: ["Sulfa"], status: "Admitted" }
];

export const appointments = [
  { id: "a-001", patientId: "p-001", patient: "Claudine Mutesi", clinician: "Dr. Grace Mukamana", department: "Internal Medicine", time: "08:30", status: "Checked in", queue: "IM-014", priority: "Routine" },
  { id: "a-002", patientId: "p-002", patient: "Samuel Ndayisaba", clinician: "Dr. Grace Mukamana", department: "Pediatrics", time: "09:10", status: "Waiting", queue: "PD-006", priority: "Urgent" },
  { id: "a-003", patientId: "p-003", patient: "Esperance Kayitesi", clinician: "Ward Round", department: "Medical Ward", time: "10:00", status: "Admitted", queue: "WARD", priority: "Urgent" }
];

export const kpis = [
  { label: "Average wait time", value: "24 min", target: "< 30 min" },
  { label: "Bed occupancy", value: "82%", target: "70-85%" },
  { label: "Lab turnaround", value: "2.6 hrs", target: "< 4 hrs" },
  { label: "Claim approval", value: "91%", target: "> 85%" }
];

export const auditLogs = [
  { time: "15:24", user: "Dr. Grace Mukamana", action: "Viewed assigned patient", module: "emr", result: "Allowed" },
  { time: "15:18", user: "Accountant Emmanuel", action: "Submitted claim", module: "billing", result: "Allowed" },
  { time: "15:11", user: "Reception Lead Olive", action: "Attempted clinical notes", module: "doctor", result: "Denied" }
];
