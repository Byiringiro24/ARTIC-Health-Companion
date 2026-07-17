# ARTIC Health Companion — System Guide
# How the System Works & What Every User Can Access

**System:** ARTIC Health Companion (HMS)
**Version:** Phase 1 (live) + Phase 2/3 (planned)
**Facility:** Kigali District Hospital (demo) — Rwanda
**Live URL:** http://172.209.217.176:3001

---

## Overview

ARTIC HMS is an enterprise hospital management platform built for Rwanda and Sub-Saharan Africa.
It covers the complete patient journey: registration → appointment → triage → consultation →
pharmacy → laboratory → billing → discharge, with full RBAC, audit trails, and MOH compliance.

The platform has 19 user roles, 30+ functional modules, and 5 demo patients.
Access is strictly controlled — every user sees only the modules their role permits.

---

## How the System Works — The Patient Journey

### 1. Registration (Receptionist)
A patient arrives at the facility. The receptionist opens the Patients module and registers:
- Full name, date of birth, gender, phone, NID (National ID), address
- Insurance provider: RSSB, Mutuelle, Private, or Self-pay
- Emergency contact, blood group, allergies, chronic conditions

The system assigns a unique MRN (e.g. `MRN-2026-0001`) and generates a QR card.
Duplicate NID detection prevents double registration.

### 2. Appointment & Queue (Receptionist / Patient)
- Appointments can be booked by the receptionist or self-booked via the patient portal
- On arrival, the patient scans their QR code or enters their MRN to check in
- The system issues a queue token (e.g. `IM-014`) and displays the patient on the live queue board
- Priority is set: Routine / Urgent / Emergency
- Estimated wait time is calculated automatically

### 3. Triage (Nurse)
The nurse opens the Nursing module:
- Records triage level (1–5), vital signs (BP, temp, HR, SpO2, weight, pain score)
- Emergency patients are escalated to the top of the queue instantly
- Alerts fire if any vital is outside the normal range

### 4. Consultation (Doctor)
The doctor opens their consultation queue. For each patient:
- Views the full EMR: problem list, active medications, allergies, last 5 vitals, last 3 notes
- Writes a SOAP note (Subjective / Objective / Assessment / Plan)
- Selects an ICD-10/11 diagnosis code
- Orders lab tests → routed instantly to the Laboratory queue
- Orders imaging → routed to the Radiology queue
- Issues an e-prescription → sent to the Pharmacy dispensing queue within 10 seconds
- Creates referrals or admission orders if needed
- Drug-drug interaction and drug-allergy alerts fire before saving

### 5. Pharmacy (Pharmacist)
The pharmacist sees all pending prescriptions:
- Verifies and dispenses using FEFO (first expired, first out) policy
- Controlled drugs require a second pharmacist sign-off
- Stock automatically deducted; low-stock alerts fire at reorder level
- Billing line item created automatically for each dispensed drug

### 6. Laboratory (Lab Scientist)
The lab sees all pending specimen requests:
- Barcoded specimens are tracked from collection → reception → processing → result
- Results entered as structured values with reference ranges and flags (Normal / High / Critical)
- Critical results trigger immediate SMS + in-app alert to the ordering doctor (within 2 minutes)
- QC failure blocks result release for the affected run

### 7. Billing (Accountant / Cashier)
Every clinical service auto-generates an invoice line item:
- Insurance split calculated per tariff (e.g. RSSB covers 80%, patient pays 20%)
- Payment methods: Cash, MTN MoMo, Airtel Money, Bank Card, Insurance
- Receipt issued on full payment
- Insurance claims submitted to RSSB/Mutuelle; rejections flagged for insurance officer review
- Daily cash reconciliation report available

### 8. Discharge / Follow-up
- Doctor creates a discharge summary with final ICD diagnosis, medications, follow-up date
- Patient portal notified with next appointment and prescriptions
- Record permanently available in the EMR timeline

---

## All Modules — What They Do

| Module | Description |
|--------|-------------|
| Dashboard (overview) | Live KPI overview: bed occupancy, average wait time, lab TAT, claim rate |
| System Admin | Users, roles, tenants, facilities, integrations, backups, security policies |
| Patients | Registration, MRN, NID, QR card, insurance, medical/social/family history |
| Appointments | Smart scheduling, recurring visits, doctor availability, reminders |
| Smart Queue | Priority queue, triage escalation, predicted wait times, live calling board |
| Consultation | SOAP notes, ICD-10/11 coding, CDS, e-prescriptions, lab/imaging orders |
| Nursing | Vitals charting, triage, medication administration records (MAR), consent |
| Pharmacy | eRx dispensing, FEFO, drug interactions, controlled substances, stock alerts |
| Laboratory | Specimen tracking, barcodes, results, critical alerts, QC, analyser import |
| Radiology | Imaging orders, DICOM/PACS-ready, reports, result alerts |
| Inpatient & Beds | Admissions, transfers, live bed map, discharge planning |
| Billing | Smart invoices, mobile money, receipts, co-payment splits, reconciliation |
| Insurance | RSSB/Mutuelle eligibility, claim submission, rejection analysis |
| Inventory | Stock receiving, issue, transfers, expiry tracking, reorder alerts |
| Procurement | Purchase requests, suppliers, approval workflows, GRN, contracts |
| Human Resources | Staff records, attendance, payroll, licenses, training logs |
| Ambulance | Emergency dispatch, GPS tracking, crew assignment, vehicle maintenance |
| Blood Bank | Donors, blood stock, crossmatch, transfusion traceability |
| Mortuary | Body admission, storage, death certificates, release authorization |
| Assets & IoT | Equipment registers, RFID, calibration, cold chain monitoring |
| Telemedicine | Video, voice, secure chat, remote e-prescriptions, consent |
| Notifications | SMS, email, WhatsApp, in-app push, secure internal messaging |
| Reports & KPIs | MOH HMIS, PBF indicators, finance, clinical, quality dashboards |
| Surveillance | Epidemic reporting, outbreak trends, MOH weekly epi reports |
| Interoperability | FHIR R4, ICD-10/11, NID/NIDA, RSSB API, HIE integration |
| Quality | RAAQH accreditation, clinical audits, patient safety, infection control |
| AI & Analytics | Clinical decision support, predictive analytics, voice-to-text notes |
| Multi-Tenant | Hospital networks, branch isolation, central reporting |
| Audit & Security | Immutable access logs, session controls, authorization separation |
| My Health Portal | Patient self-service: appointments, results, prescriptions, payments |
| Settings | Facility config, localization, notification policies, backup settings |


---

## Every Role — Full Access Breakdown

### 1. System Administrator
**Demo account:** admin@artic.health / admin123
**Scope:** Full system — all modules, all facilities, all tenants

Modules accessible: ALL 31 modules

What they can do:
- Create, edit, and deactivate any user account across all facilities
- Assign and change roles; changes immediately revoke all active sessions
- Configure tenants, hospitals, departments, and branch settings
- Set up integrations (RSSB API, MTN MoMo, Africa's Talking SMS, FHIR HIE)
- View complete audit trail for every user action system-wide
- Configure security policies: password rules, MFA enforcement, session timeout
- Run and export any report from any facility
- Manage backups and data retention policies
- Access the multi-tenant console for network-wide reporting

---

### 2. Hospital Manager
**Demo account:** manager@artic.health / manager123
**Scope:** Facility-level operations, finance, HR, quality, assets

Modules: Dashboard, Queue, Inpatient & Beds, Billing, Insurance, Inventory,
         Procurement, HR, Ambulance, Blood Bank, Mortuary, Assets,
         Notifications, Reports, Surveillance, Quality, Audit, Settings

What they can do:
- View live operational dashboard: bed occupancy, queue status, revenue, staff on duty
- Monitor and manage inpatient ward capacity and bed assignments
- Approve procurement requests and purchase orders
- View financial reports, outstanding invoices, and insurance claim summaries
- Manage staff attendance, scheduling, and HR records
- Review quality audit results and corrective action plans
- Access facility-level audit logs (cannot access other facilities)
- Configure facility settings, service tariffs, and notification policies
- Oversee ambulance dispatch and fleet status

Cannot do: write clinical notes, dispense drugs, enter lab results, prescribe

---

### 3. Medical Director
**Demo account:** director@artic.health / director123
**Scope:** Clinical governance, quality assurance, patient safety

Modules: Dashboard, Patients, Consultation, Nursing, Laboratory, Radiology,
         Inpatient, Reports, Surveillance, Quality, AI, Audit

What they can do:
- Review all clinical notes and patient records across the facility
- Monitor clinical KPIs: diagnosis accuracy, treatment outcomes, complication rates
- Run and approve clinical audit reports
- Review and sign off on clinical protocols and care pathways
- Access AI-assisted analytics: risk scoring, disease trends, outcome predictions
- Monitor disease surveillance and outbreak indicators
- Review lab and radiology performance including turnaround times
- Access quality management: RAAQH accreditation readiness, incident reports

Cannot do: create prescriptions, dispense drugs, process payments, manage HR

---

### 4. Doctor
**Demo account:** doctor@artic.health / doctor123
**Scope:** Full consultation workflow for assigned patients

Modules: Dashboard, Patients, Appointments, Queue, Consultation, Laboratory,
         Radiology, Pharmacy, Telemedicine, Reports

What they can do:
- View their consultation queue with priority flags and estimated wait
- Open any patient's full EMR: history, vitals, notes, active medications, allergies
- Write, save, and digitally sign SOAP notes with ICD-10/11 coding
- Order lab tests → instantly creates specimen request in lab queue
- Order radiology imaging → routed to radiology queue with clinical indication
- Issue e-prescriptions → sent to pharmacy dispensing queue in real time
- Receive drug-drug and drug-allergy interaction alerts before saving
- Create referrals to other clinicians or facilities
- Issue inpatient admission orders → triggers bed assignment workflow
- Conduct telemedicine video/voice consultations
- View their own patients' reports and outcomes

Cannot do: dispense drugs, enter lab results, process payments, manage users

---

### 5. Nurse
**Demo account:** nurse@artic.health / nurse123
**Scope:** Patient assessment, ward care, medication administration

Modules: Dashboard, Patients, Appointments, Queue, Nursing, Inpatient,
         Blood Bank, Reports

What they can do:
- Perform triage and assign triage levels 1–5
- Record all vital signs (BP, temperature, HR, SpO2, weight, height, pain score)
- Vital signs out-of-range automatically flagged and alert sent to doctor
- Record nursing notes and shift handover summaries
- Update medication administration records (MAR)
- Manage patient consent forms
- Monitor inpatient ward status and escalate concerns
- View blood bank inventory and initiate transfusion requests
- Check patients in and update queue status

Cannot do: write prescriptions, diagnose, process billing, manage users

---

### 6. Pharmacist
**Demo account:** pharmacy@artic.health / pharmacy123
**Scope:** Drug inventory, dispensing, medication safety

Modules: Dashboard, Pharmacy, Billing, Reports, Audit

What they can do:
- View all pending e-prescriptions from the dispensing queue
- Verify prescriptions and check against patient allergies and current medications
- Dispense medications using FEFO (earliest expiry first) policy
- Controlled substances: requires second pharmacist sign-off, full log maintained
- Drug-drug and drug-allergy interaction alerts shown before dispensing
- Manage drug master database: generic names, dosage forms, reorder levels
- Receive new stock batches: batch number, expiry, supplier, unit cost, location
- Low-stock and near-expiry alerts for proactive reordering
- Billing line items created automatically on dispensing
- Generate daily dispensing summaries and controlled substance reports

Cannot do: write clinical notes, see full EMR, process financial reports

---

### 7. Laboratory Scientist
**Demo account:** lab@artic.health / lab123
**Scope:** Full specimen lifecycle management

Modules: Dashboard, Laboratory, Patients, Reports, Audit

What they can do:
- See all pending specimen orders from the lab queue
- Record specimen collection: sample type, barcode label, collection time
- Scan barcodes to receive specimens at laboratory reception
- Enter structured test results: value, unit, reference range, flag (Normal/High/Critical)
- Critical result alerts auto-sent to ordering doctor via SMS + in-app within 2 minutes
- Validate and authorise results — results visible to doctor only after authorisation
- Run quality control samples; QC failure blocks result release for the entire run
- Generate specimen collection manifests for ward nurses
- View lab performance dashboard: turnaround times, pending tests, TAT compliance

Cannot do: prescribe, dispense, write clinical notes, process billing

---

### 8. Radiology Staff
**Demo account:** radiology@artic.health / radio123
**Scope:** Imaging orders and reports

Modules: Dashboard, Radiology, Patients, Reports

What they can do:
- View all pending imaging orders (X-ray, ultrasound, CT, MRI)
- Schedule imaging sessions with modality type and clinical indication
- Upload imaging reports and attach DICOM files
- Send result-ready alerts to ordering doctors
- View patient demographic information linked to each order
- Generate radiology workload and turnaround reports

Cannot do: prescribe, dispense, enter lab results, write clinical notes, bill

---

### 9. Receptionist
**Demo account:** reception@artic.health / front123
**Scope:** Patient registration, check-in, appointment management

Modules: Dashboard, Patients, Appointments, Queue, Billing

What they can do:
- Register new patients with full demographics, NID, and insurance
- Duplicate NID detection prevents double registration
- Generate and print patient QR cards
- Check patients in by scanning QR code, MRN, or NID
- Book, reschedule, and cancel appointments
- Manage the live queue board and patient routing
- Verify insurance coverage at check-in
- Create basic billing entries for walk-in services
- Operate the self-service kiosk check-in flow

Cannot do: write clinical notes, prescribe, process full billing, access reports

---

### 10. Accountant
**Demo account:** accounts@artic.health / money123
**Scope:** Revenue cycle, claims, financial reporting

Modules: Dashboard, Billing, Insurance, Reports, Audit

What they can do:
- Create and manage patient invoices
- Process payments (Cash, MTN MoMo, Airtel Money, Bank Card, Insurance)
- Submit insurance claims to RSSB and Mutuelle
- Track claim status: Draft → Submitted → Approved → Paid / Denied
- Handle rejected claims: record reason, flag for review, resubmit
- Run daily cash reconciliation reports
- View accounts receivable ageing (0–30, 31–60, 61–90, 91+ days)
- Apply discounts/waivers (requires supervisor authorisation, logged in audit)
- Generate financial summaries and revenue reports

Cannot do: write clinical notes, access EMR, manage users, configure system

---

### 11. Cashier
**Demo account:** cashier@artic.health / cashier123
**Scope:** Payment collection only

Modules: Dashboard, Billing, Notifications

What they can do:
- Collect payments at the cash desk: Cash, MTN MoMo, Airtel Money, Bank Card
- View and update invoice payment status
- Print official receipts for completed payments
- Close and reconcile their daily cashier shift
- Receive notifications about payment callbacks (mobile money)

Cannot do: create invoices, submit claims, access reports, write clinical notes

---

### 12. Insurance Officer
**Demo account:** insurance@artic.health / claim123
**Scope:** Insurance eligibility, claims, rejection management

Modules: Dashboard, Insurance, Billing, Reports, Audit

What they can do:
- Verify patient insurance eligibility (RSSB, Mutuelle, Private)
- Submit structured insurance claims to payers
- Track claim status and payment timelines
- Analyze claim rejection patterns and resubmit corrected claims
- Generate insurance reconciliation and rejection analysis reports
- View audit trail for all claim submissions

Cannot do: write clinical notes, collect cash, dispense drugs, manage users

---

### 13. Store Manager
**Demo account:** store@artic.health / store123
**Scope:** Inventory, procurement, asset management

Modules: Dashboard, Inventory, Procurement, Assets, Reports, Audit

What they can do:
- Receive new stock and record batch details, expiry, supplier, location
- Issue stock to departments and pharmacy
- Process inter-departmental stock transfers
- Create purchase requests and track approval workflow
- Manage supplier contracts and GRN (Goods Received Notes)
- Set and monitor reorder levels; receive low-stock and near-expiry alerts
- Track and maintain facility assets and equipment
- Generate stock valuation, consumption, and procurement reports

Cannot do: dispense prescriptions, write clinical notes, process billing

---

### 14. HR Manager
**Demo account:** hr@artic.health / hr123
**Scope:** Workforce management

Modules: Dashboard, HR, Notifications, Reports, Audit, Settings

What they can do:
- Maintain staff personal records: qualifications, licenses, registration numbers
- Track attendance and leave management
- Process payroll and track salary records
- Manage training schedules and compliance tracking
- Receive alerts for expiring staff licenses or certifications
- Generate workforce reports: staffing levels, turnover, absenteeism
- Configure HR-related notification policies

Cannot do: write clinical notes, access patient records, process billing

---

### 15. Quality Officer
**Demo account:** quality@artic.health / quality123
**Scope:** Clinical quality, safety, accreditation

Modules: Dashboard, Quality, Surveillance, Reports, Audit, Notifications

What they can do:
- Run clinical audits against defined standards
- Record patient safety incidents and near-misses
- Track corrective and preventive actions (CAPA)
- Monitor RAAQH (Rwanda Agency for Accreditation) readiness checklist
- Manage infection control monitoring and reporting
- Track patient satisfaction survey results
- Monitor disease surveillance data and generate outbreak alerts
- Send quality-related notifications to clinical staff

Cannot do: prescribe, dispense, access full EMR, process billing

---

### 16. Data Officer
**Demo account:** data@artic.health / data123
**Scope:** HMIS reporting, analytics, government submissions

Modules: Dashboard, Reports, Surveillance, Interoperability, Quality

What they can do:
- Prepare and submit MOH HMIS monthly and quarterly reports
- Track PBF (Performance-Based Financing) indicators and submit returns
- Prepare weekly epi (epidemiology) surveillance reports
- Generate analytical dashboards: disease burden, service utilisation, outcomes
- Export data in FHIR R4 format for HIE (Health Information Exchange)
- Monitor data quality and completeness indicators

Cannot do: write clinical notes, prescribe, process billing, manage users

---

### 17. Ambulance Driver
**Demo account:** ambulance@artic.health / drive123
**Scope:** Emergency transport operations

Modules: Dashboard, Ambulance, Notifications

What they can do:
- View emergency dispatch assignments
- Update vehicle status (Available, Dispatched, At Scene, Returning, Maintenance)
- Update GPS location during active dispatch
- Record incident handover details on arrival at hospital
- Receive and acknowledge dispatch notifications

Cannot do: access patient records, write clinical notes, process billing

---

### 18. Patient
**Demo account:** patient@artic.health / patient123 (linked to Claudine Mutesi, MRN-2026-0001)
**Scope:** Own health records only

Modules: My Health Portal, Appointments, Telemedicine, Billing

What they can do:
- View personal upcoming and past appointments
- Book new appointments with available doctors
- View their own lab results, diagnoses, and discharge summaries
- View active prescriptions and medication list
- View and pay their own invoices (MTN MoMo, Airtel Money, Bank Card)
- Download receipts for completed payments
- Join telemedicine video or voice consultations
- Send secure messages to their care team
- Receive appointment reminders via SMS, email, or WhatsApp

Cannot do: see any other patient's data, access clinical workflows, manage users


---

## Demo Patients

| MRN | Name | Age | Insurance | Status | Key Conditions |
|-----|------|-----|-----------|--------|----------------|
| MRN-2026-0001 | Claudine Mutesi | 34, F | RSSB | Active follow-up | Hypertension |
| MRN-2026-0002 | Samuel Ndayisaba | 8, M | Mutuelle | In clinic | Asthma |
| MRN-2026-0003 | Esperance Kayitesi | 61, F | Private | Admitted (Medical Ward) | Diabetes, Hypertension |
| MRN-2026-0004 | Patrick Mugenzi | 44, M | RSSB | Emergency triage (ICU) | Trauma |
| MRN-2026-0005 | Vestine Uwimana | 28, F | Mutuelle | ANC visit | Pregnancy |

---

## Security & Compliance

- **Authentication:** JWT access token (15 min expiry) + rotating refresh token (7 days)
- **Passwords:** bcrypt hashed, work factor 12 — never stored or transmitted in plaintext
- **RBAC:** Every API request checks the user's role against the requested module; HTTP 403 + audit log entry on denial
- **Audit trail:** Every login, logout, failed attempt, data access, and modification is recorded with timestamp, user ID, IP address, and user-agent
- **Session timeout:** 30 minutes of inactivity terminates the session
- **Account lockout:** 5 failed login attempts in 10 minutes locks the account
- **MFA:** TOTP or SMS OTP supported for all roles
- **Data protection:** Compliant with Rwanda Data Protection Law (Law N° 058/2021)
- **Field-level access:** Restricted fields are redacted from API responses for roles without permission

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, Zustand, Recharts |
| Backend (Phase 1) | Node.js v22, plain HTTP server (`src/server.js`), in-memory data |
| Backend (Phase 2+) | Express.js 5, bcryptjs, jsonwebtoken, helmet, morgan, cors |
| Database (Phase 2+) | PostgreSQL 16 (Docker, port 5433), SQLite for local dev |
| Cache | Redis 7 (Docker, port 6380), key prefix `hms:` |
| Process Manager | PM2 |
| Containerisation | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Infrastructure | Azure VM, Nginx reverse proxy, UFW + Azure NSG firewall |
| Notifications | Africa's Talking (SMS), Nodemailer (email), Socket.IO (real-time) |
| Standards | FHIR R4, ICD-10/11, HL7 v2, RSSB API, NIDA NID API |

---

## Delivery Phases

### Phase 1 — Foundation (current)
Authentication, Patient Management, Appointments, Reception, EMR,
Doctor Workspace, Pharmacy, Laboratory, Billing, Reports, Notifications,
Security & Audit, System Administration

### Phase 2 — Expanded Clinical
Nursing & Ward Care, Radiology, Inpatient Management, Emergency Department,
Maternity & Child Health, Inventory & Supply Chain, Blood Bank, Mortuary,
Insurance & Claims, Patient Portal, Telemedicine

### Phase 3 — Advanced Operations
Human Resources, Facility & Asset Management, Ambulance & Emergency Response,
Quality Management, Disease Surveillance, FHIR/HIE Interoperability,
AI & Clinical Decision Support, Multi-Tenant Scalability

