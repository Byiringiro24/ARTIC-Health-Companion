# 🏥 ARTIC HEALTH COMPANION — COMPLETE MASTER DOCUMENT
## *Enterprise Hospital Management System for Rwanda & Africa*

---

# 📋 EXECUTIVE SUMMARY

**System:** ARTIC Health Companion (Hospital Management System)
**Version:** Phase 1 (Live) + Phase 2/3 (Planned)
**Facility:** Kigali District Hospital (Demo) — Rwanda
**Live URL:** http://172.209.217.176:3001

ARTIC HMS is an enterprise hospital management platform built for Rwanda and Sub-Saharan Africa.
It covers the complete patient journey: **registration → appointment → triage → consultation →
pharmacy → laboratory → billing → discharge**, with full RBAC, audit trails, and MOH compliance.

The platform has **19 user roles**, **30+ functional modules**, and **5 demo patients**.
Access is strictly controlled — every user sees only the modules their role permits.

---

# 🏗️ PART 1: HOW THE SYSTEM WORKS — THE COMPLETE PATIENT JOURNEY

---

## 1. Patient Registration

### How It Happens

**Option A: Self-Registration (Patient Creates Account)**
1. Patient visits the hospital website
2. Clicks "Register" or "Create Account"
3. Fills in personal details:
   - Full name, date of birth, gender
   - National ID (NID) — this is the master key
   - Phone number and email
   - Address, emergency contact
   - Insurance provider and number
4. Creates a username and password
5. System searches for duplicates by NID, phone, or name+DOB
6. If found: "You already have an account! Please log in."
7. If not found: System generates a unique MRN (e.g., MRN-2026-0001)
8. Account created with MRN linked to NID
9. Welcome email and SMS sent with MRN and login details
10. Patient can now book appointments, view records, and pay bills

**Option B: Receptionist Registration (At Hospital)**
1. Patient walks into the hospital
2. Receptionist asks for National ID
3. Receptionist enters NID into the system
4. System searches the national patient registry
5. **If found:** Existing record is used — NO DUPLICATE is created
6. Receptionist updates any outdated information (phone, address, insurance)
7. **If not found:** Receptionist registers the patient as new
8. System generates a unique MRN
9. Patient is now registered and can receive care

**Option C: Doctor Registration (During Consultation)**
1. Patient arrives without prior registration
2. Doctor enters patient details during consultation
3. System checks for duplicates by NID
4. If not found, MRN is generated
5. Patient is registered and consultation begins

**Option D: Emergency Registration (No ID)**
1. Patient arrives unconscious — no identification
2. Emergency team treats the patient immediately
3. Nurse or doctor creates an "Emergency Registration"
4. System creates a temporary MRN (e.g., TEMP-2026-001)
5. Patient is treated (life-saving care is priority)
6. Later, when patient is conscious, they provide NID
7. System links the temporary record to the permanent record
8. All emergency treatments are added to the permanent file

### The MRN — Patient's Forever ID

**What is MRN?**
Medical Record Number — a unique identifier assigned to every patient.
- Format: MRN-YYYY-XXXXX (e.g., MRN-2026-0001)
- Stays with the patient for life
- Works across ALL hospitals in the system
- Never duplicated

**How MRN is Used:**
- Patient search by MRN
- Appointment booking reference
- Prescription reference
- Lab result reference
- Billing reference
- Patient portal login (alternative to email)

---

## 2. Appointment & Queue

### How Appointments Are Made

**Option A: Patient Books Online (Self-Service)**
1. Patient logs into the portal
2. Selects service type (consultation, follow-up, telemedicine)
3. Chooses department and doctor
4. Picks available date and time from calendar
5. Confirms booking
6. System sends confirmation SMS and email
7. Reminder sent 24 hours before appointment
8. Reminder sent 1 hour before appointment

**Option B: Receptionist Books**
1. Patient calls or visits the hospital
2. Receptionist checks doctor availability
3. Receptionist books the appointment
4. Patient receives confirmation SMS/email

**Option C: Walk-In (No Appointment)**
1. Patient arrives without appointment
2. Receptionist registers patient as walk-in
3. Patient is added to the queue

### Check-In Process

**Step 1: Patient Arrives**
Patient goes to reception or self-service kiosk

**Step 2: Identification**
Patient presents National ID, QR card, or MRN
System instantly finds the patient

**Step 3: Check-In**
Receptionist confirms the patient
System assigns a queue number (e.g., IM-014)
Patient appears on the live queue board
Status changes from "Scheduled" to "Checked-In"

**Step 4: Queue Management**
- Priority levels: Routine, Urgent, Emergency
- Emergency patients are escalated to the top
- Estimated wait time is calculated automatically
- Patient can see their position in the queue
- Nurse is notified when patient is in queue

---

## 3. Triage (Nurse)

### What Happens During Triage
1. **Patient Called:** Nurse calls the patient from the queue
2. **Vitals Recording:**
   - Temperature, Blood Pressure, Heart Rate
   - Respiratory Rate, Oxygen Saturation (SpO2)
   - Weight, Height, Pain Score (1-10)
   - Blood Glucose (if needed)
3. **Triage Level Assignment:**
   - Level 1: Emergent/Resuscitation — Immediate life-threatening
   - Level 2: Urgent — Needs attention within 10-15 minutes
   - Level 3: Less Urgent — Can wait 30-60 minutes
   - Level 4: Non-Urgent — Can wait 1-2 hours
   - Level 5: Minor — Can wait 2+ hours
4. **Chief Complaint:** Patient's main reason for visit
5. **Allergy Check:** Any known allergies? Flagged in red
6. **Alerts:**
   - If any vital is outside normal range, alert is triggered
   - Critical vitals: immediate SMS + in-app alert to doctor
   - Emergency patients are escalated to the top of the queue

---

## 4. Consultation (Doctor)

### The Doctor's Consultation Workflow

**Step 1: Open Consultation Queue**
Doctor logs in, sees dashboard — waiting patients, pending lab results, alerts.

**Step 2: View Patient Medical Record**
- Complete patient demographics
- Medical history (all past visits, diagnoses, treatments)
- Allergies (displayed prominently in red)
- Current medications, active problems list
- Vital signs (last 5 recordings), lab results, radiology reports

**Step 3: SOAP Notes**
- **S**ubjective: Patient's reported symptoms
- **O**bjective: Physical exam findings, vitals
- **A**ssessment: Diagnosis, differential diagnoses
- **P**lan: Treatment, tests, follow-up

**Step 4: Diagnosis (ICD-10/11 Coding)**
Doctor searches and selects ICD-10/11 code — required before finalising consultation.

**Step 5: Prescription Writing**
- Doctor searches medication by name
- Drug interaction check fires automatically
- Allergy check fires automatically
- Doctor signs prescription electronically
- Prescription sent to pharmacy dispensing queue within 10 seconds

**Step 6: Lab Test Ordering**
Doctor selects test panel, sets urgency (Routine/Urgent/Stat)
→ Order sent instantly to Laboratory queue

**Step 7: Radiology/Imaging Ordering**
Doctor selects imaging type and body part
→ Order routed to Radiology queue with clinical indication

**Step 8: Referral / Admission**
- Internal referral: to another department
- External referral: to another hospital
- Admission order: triggers bed assignment workflow + nursing notification

**Step 9: Complete Consultation**
Doctor digitally signs. Automated actions:
- Billing notified → invoice generated
- Pharmacy notified → prescriptions sent
- Laboratory notified → tests ordered
- Patient notified → consultation complete

---

## 5. Pharmacy (Pharmacist)

**Step 1:** View pending prescriptions in dispensing queue
**Step 2:** Verify prescription — doctor signature, patient name, drug, dosage
**Step 3:** Check stock availability; suggest alternatives if out of stock
**Step 4:** Dispense using FEFO (First Expired, First Out) policy
- Controlled substances: second pharmacist sign-off required
- Inventory automatically deducted
- Dispensing label generated
**Step 5:** Billing line item created automatically; insurance split calculated
**Step 6:** Patient counselled on dosage, side effects, storage
**Step 7:** Patient notified via SMS/email — "Prescription ready for pickup"

---

## 6. Laboratory (Lab Scientist)

**Step 1:** View pending tests sorted by urgency (Stat, Urgent, Routine)
**Step 2:** Collect specimen, apply barcode label, record sample type and time
**Step 3:** Scan barcode at lab reception → status: "Received"
**Step 4:** Process test on equipment
**Step 5:** Enter results — value, unit, reference range, flag (Normal/High/Low/Critical)
- **Critical results:** Immediate SMS + in-app alert to ordering doctor within 2 minutes
**Step 6:** Senior technician validates and authorises — results only visible to doctor after this step
**Step 7:** QC sample failure blocks result release for the entire run
**Step 8:** Results appear in patient EMR; PDF report downloadable

---

## 7. Billing & Payment (Accountant / Cashier)

**Step 1: Auto Invoice Generation**
Every clinical service auto-creates an invoice line item (consultation, lab, pharmacy, radiology, room).

**Step 2: Insurance Split**
Insurance coverage calculated automatically.
Patient co-pay calculated and displayed.

**Step 3: Payment Collection**

*At Hospital (Cashier):*
Patient visits cashier → invoice displayed → pays Cash/Card/Mobile Money → receipt printed

*Online (Patient Portal):*
Patient logs in → views bills → clicks "Pay Now" → pays via Mobile Money or Card

*Mobile Money Flow:*
1. Patient receives SMS with paybill number
2. Enters business number and MRN/Invoice number
3. Confirms with PIN
4. System receives callback → verifies signature → updates invoice → issues receipt

**Step 4: Insurance Claim Submission**
Claim auto-created with ICD-10 codes and charges
→ Submitted to RSSB/Mutuelle
→ Tracked: Draft → Submitted → Approved → Paid / Denied

**Step 5: Daily Reconciliation**
Cashier closes shift → counts cash → compares with system records → reports discrepancies

---

## 8. Discharge & Follow-up

1. Doctor documents discharge summary (final ICD diagnosis, medications, follow-up plan)
2. Discharge summary signed electronically
3. Final bill generated; patient pays remaining balance
4. Bed vacated and status updated to "Available"
5. Follow-up appointment scheduled
6. Patient receives SMS with follow-up date and next appointment reminder

---

# 👥 PART 2: USER CREATION HIERARCHY

## The Hierarchy

```
SUPER ADMINISTRATOR
        ↓
  HOSPITAL MANAGER
        ↓
 ┌──────┼──────────┐
 ↓      ↓          ↓
HR    DEPT HEADS  ALL STAFF
MGR   (limited)   (direct)
```

## Who Creates Who

| Creator | Can Create |
|---------|-----------|
| Super Admin | Hospital Manager |
| Hospital Manager | ALL roles (HR Manager, Medical Director, all staff) |
| HR Manager | All staff roles (if given permission by Hospital Manager) |
| Department Head | Staff within their department only (if given permission) |
| HR Manager | Cannot create another HR Manager or Hospital Manager |

## Patient Account Creation

| Method | Who Creates | Duplicate Check |
|--------|-------------|-----------------|
| Self-Registration | Patient (online) | NID, Phone, Name+DOB |
| Reception Registration | Receptionist | NID first |
| Doctor Registration | Doctor | NID first |
| Emergency Registration | Nurse/Doctor | Temporary MRN, later linked |

---

# 📊 PART 3: COMPLETE MODULE LIST

| # | Module | Description |
|---|--------|-------------|
| 1 | Dashboard | Live KPI overview: bed occupancy, average wait time, lab TAT, claim rate |
| 2 | System Admin | Users, roles, tenants, facilities, integrations, backups, security policies |
| 3 | Patients | Registration, MRN, NID, QR card, insurance, medical/social/family history |
| 4 | Appointments | Smart scheduling, recurring visits, doctor availability, reminders |
| 5 | Smart Queue | Priority queue, triage escalation, predicted wait times, live calling board |
| 6 | Consultation | SOAP notes, ICD-10/11 coding, CDS, e-prescriptions, lab/imaging orders |
| 7 | Nursing | Vitals charting, triage, medication administration records (MAR), consent |
| 8 | Pharmacy | eRx dispensing, FEFO, drug interactions, controlled substances, stock alerts |
| 9 | Laboratory | Specimen tracking, barcodes, results, critical alerts, QC, analyser import |
| 10 | Radiology | Imaging orders, DICOM/PACS-ready, reports, result alerts |
| 11 | Inpatient & Beds | Admissions, transfers, live bed map, discharge planning |
| 12 | Billing | Smart invoices, mobile money, receipts, co-payment splits, reconciliation |
| 13 | Insurance | RSSB/Mutuelle eligibility, claim submission, rejection analysis |
| 14 | Inventory | Stock receiving, issue, transfers, expiry tracking, reorder alerts |
| 15 | Procurement | Purchase requests, suppliers, approval workflows, GRN, contracts |
| 16 | Human Resources | Staff records, attendance, payroll, licenses, training logs |
| 17 | Ambulance | Emergency dispatch, GPS tracking, crew assignment, vehicle maintenance |
| 18 | Blood Bank | Donors, blood stock, crossmatch, transfusion traceability |
| 19 | Mortuary | Body admission, storage, death certificates, release authorization |
| 20 | Assets & IoT | Equipment registers, RFID, calibration, cold chain monitoring |
| 21 | Telemedicine | Video, voice, secure chat, remote e-prescriptions, consent |
| 22 | Notifications | SMS, email, WhatsApp, in-app push, secure internal messaging |
| 23 | Reports & KPIs | MOH HMIS, PBF indicators, finance, clinical, quality dashboards |
| 24 | Surveillance | Epidemic reporting, outbreak trends, MOH weekly epi reports |
| 25 | Interoperability | FHIR R4, ICD-10/11, NID/NIDA, RSSB API, HIE integration |
| 26 | Quality | RAAQH accreditation, clinical audits, patient safety, infection control |
| 27 | AI & Analytics | Clinical decision support, predictive analytics, voice-to-text notes |
| 28 | Multi-Tenant | Hospital networks, branch isolation, central reporting |
| 29 | Audit & Security | Immutable access logs, session controls, authorization separation |
| 30 | My Health Portal | Patient self-service: appointments, results, prescriptions, payments |
| 31 | Settings | Facility config, localization, notification policies, backup settings |

---

# 👤 PART 4: EVERY ROLE — FULL ACCESS BREAKDOWN

## 1. System Administrator
**Demo:** admin@artic.health / admin123 | **Scope:** Full system, all facilities, all tenants

**Modules:** ALL 31

**Can do:**
- Create, edit, deactivate any user across all facilities; role changes revoke all active sessions immediately
- Configure tenants, hospitals, departments, integrations (RSSB, MTN MoMo, SMS, FHIR)
- Set security policies: password rules, MFA, session timeout, device tracking
- View complete audit trail system-wide; monitor security logs
- Run and export any report from any facility
- Manage backups, data retention, and multi-tenant console

**Cannot do:** Write clinical notes, prescribe, dispense, enter lab results

---

## 2. Hospital Manager
**Demo:** manager@artic.health / manager123 | **Scope:** Facility-level operations

**Modules:** Dashboard, Queue, Inpatient & Beds, Billing, Insurance, Inventory, Procurement, HR, Ambulance, Blood Bank, Mortuary, Assets, Notifications, Reports, Surveillance, Quality, Audit, Settings

**Can do:**
- Create and manage ALL staff accounts for their facility; grant HR Manager staff-creation permission
- View live dashboard: bed occupancy, queue status, revenue, staff on duty
- Approve procurement requests and purchase orders
- View financial reports, outstanding invoices, insurance claim summaries
- Manage staff attendance, scheduling, HR records
- Review quality audits and corrective action plans
- Configure facility settings, service tariffs, notification policies
- Oversee ambulance dispatch and fleet status
- Facility-level audit logs only (cannot access other facilities)

**Cannot do:** Write clinical notes, prescribe, dispense, enter lab results, access other facilities

---

## 3. Medical Director
**Demo:** director@artic.health / director123 | **Scope:** Clinical governance

**Modules:** Dashboard, Patients, Consultation, Nursing, Laboratory, Radiology, Inpatient, Reports, Surveillance, Quality, AI, Audit

**Can do:**
- Review all clinical notes and patient records across the facility
- Monitor clinical KPIs: diagnosis accuracy, treatment outcomes, complication rates
- Run and approve clinical audit reports; sign off on clinical protocols
- Access AI analytics: risk scoring, disease trends, outcome predictions
- Monitor disease surveillance; review lab/radiology performance and TAT
- Review patient safety incidents, medication errors, infection control data

**Cannot do:** Create prescriptions, dispense drugs, process payments, manage HR, configure system

---

## 4. Doctor
**Demo:** doctor@artic.health / doctor123 | **Scope:** Full consultation workflow

**Modules:** Dashboard, Patients, Appointments, Queue, Consultation, Laboratory, Radiology, Pharmacy, Telemedicine, Reports

**Can do:**
- View consultation queue with priority flags and estimated wait times
- Open full patient EMR: history, vitals, notes, active medications, allergies
- Write, save, and digitally sign SOAP notes with ICD-10/11 coding
- Order lab tests (instantly routed to lab queue)
- Order radiology imaging (routed to radiology queue with clinical indication)
- Issue e-prescriptions (sent to pharmacy queue within 10 seconds)
- Receive drug-drug and drug-allergy interaction alerts before saving
- Create referrals (internal or external) and inpatient admission orders
- Conduct telemedicine video/voice consultations

**Cannot do:** Dispense drugs, enter lab results, process payments, manage users

---

## 5. Nurse
**Demo:** nurse@artic.health / nurse123 | **Scope:** Patient assessment, ward care

**Modules:** Dashboard, Patients, Appointments, Queue, Nursing, Inpatient, Blood Bank, Reports

**Can do:**
- Perform triage, assign triage levels 1–5
- Record all vital signs; out-of-range values auto-flagged with doctor alert
- Record nursing notes, shift handover summaries
- Update medication administration records (MAR)
- Manage patient consent forms
- Monitor inpatient ward status; escalate concerns
- View blood bank inventory; initiate transfusion requests
- Check patients in and update queue status

**Cannot do:** Prescribe, diagnose, process billing, manage users

---

## 6. Pharmacist
**Demo:** pharmacy@artic.health / pharmacy123 | **Scope:** Drug inventory and dispensing

**Modules:** Dashboard, Pharmacy, Billing, Reports, Audit

**Can do:**
- View and process all pending e-prescriptions from dispensing queue
- Check drug-drug, drug-allergy, and drug-disease interaction alerts before dispensing
- Dispense medications using FEFO (earliest expiry first) policy
- Controlled substances: second pharmacist sign-off required; full log maintained
- Manage drug master database, receive new stock batches
- Low-stock and near-expiry alerts for proactive reordering
- Billing line items created automatically on dispensing
- Generate daily dispensing summaries and controlled substance reports

**Cannot do:** Write clinical notes, see full EMR, process financial reports, manage users

---

## 7. Laboratory Scientist
**Demo:** lab@artic.health / lab123 | **Scope:** Specimen lifecycle management

**Modules:** Dashboard, Laboratory, Patients, Reports, Audit

**Can do:**
- See all pending specimen orders from lab queue
- Collect specimens, apply barcode labels, record sample type and time
- Scan barcodes to receive specimens; status updated to "Received"
- Enter structured results: value, unit, reference range, flag (Normal/High/Low/Critical)
- Critical results: auto SMS + in-app alert to ordering doctor within 2 minutes
- Validate and authorise results — doctor sees results only after authorisation
- QC failure blocks result release for the entire run
- Generate specimen collection manifests for ward nurses

**Cannot do:** Prescribe, dispense, write clinical notes, process billing, manage users

---

## 8. Radiology Staff
**Demo:** radiology@artic.health / radio123 | **Scope:** Imaging orders and reports

**Modules:** Dashboard, Radiology, Patients, Reports

**Can do:**
- View all pending imaging orders (X-ray, ultrasound, CT, MRI)
- Schedule imaging sessions; upload reports and attach DICOM files
- Send result-ready alerts to ordering doctors
- Generate radiology workload and turnaround time reports

**Cannot do:** Prescribe, dispense, enter lab results, write clinical notes, bill, manage users

---

## 9. Receptionist
**Demo:** reception@artic.health / front123 | **Scope:** Registration and check-in

**Modules:** Dashboard, Patients, Appointments, Queue, Billing

**Can do:**
- Register new patients; duplicate NID detection prevents double registration
- Generate and print patient QR cards
- Check patients in by QR code, MRN, or NID
- Book, reschedule, and cancel appointments
- Manage live queue board and patient routing
- Verify insurance coverage at check-in
- Create basic billing entries for walk-in services
- Operate self-service kiosk check-in

**Cannot do:** Write clinical notes, prescribe, access reports, manage users

---

## 10. Accountant
**Demo:** accounts@artic.health / money123 | **Scope:** Revenue cycle and financial reporting

**Modules:** Dashboard, Billing, Insurance, Reports, Audit

**Can do:**
- Create and manage patient invoices
- Process payments (Cash, MTN MoMo, Airtel Money, Bank Card, Insurance)
- Submit insurance claims to RSSB and Mutuelle; track claim status
- Handle rejected claims: record reason, flag for review, resubmit
- Apply discounts/waivers (requires supervisor authorisation, logged in audit)
- Run daily cash reconciliation reports
- View accounts receivable ageing (0–30, 31–60, 61–90, 91+ days)

**Cannot do:** Write clinical notes, access EMR, manage users, configure system

---

## 11. Cashier
**Demo:** cashier@artic.health / cashier123 | **Scope:** Payment collection only

**Modules:** Dashboard, Billing, Notifications

**Can do:**
- Collect payments: Cash, MTN MoMo, Airtel Money, Bank Card
- View and update invoice payment status
- Print official receipts for completed payments
- Close and reconcile daily cashier shift
- Receive mobile money payment callback notifications

**Cannot do:** Create invoices, submit claims, access reports, write clinical notes, manage users

---

## 12. Insurance Officer
**Demo:** insurance@artic.health / claim123 | **Scope:** Insurance eligibility and claims

**Modules:** Dashboard, Insurance, Billing, Reports, Audit

**Can do:**
- Verify patient insurance eligibility (RSSB, Mutuelle, Private)
- Submit structured insurance claims to payers
- Track claim status and payment timelines
- Analyse rejection patterns and resubmit corrected claims
- Generate insurance reconciliation and rejection analysis reports

**Cannot do:** Write clinical notes, collect cash, dispense drugs, manage users

---

## 13. Store Manager
**Demo:** store@artic.health / store123 | **Scope:** Inventory, procurement, assets

**Modules:** Dashboard, Inventory, Procurement, Assets, Reports, Audit

**Can do:**
- Receive new stock: batch details, expiry, supplier, location
- Issue stock to departments and pharmacy; process inter-departmental transfers
- Create purchase requests and track approval workflow
- Manage supplier contracts and Goods Received Notes (GRN)
- Set and monitor reorder levels; receive low-stock and near-expiry alerts
- Track and maintain facility assets and equipment

**Cannot do:** Dispense prescriptions, write clinical notes, process billing, manage users

---

## 14. HR Manager
**Demo:** hr@artic.health / hr123 | **Scope:** Workforce management

**Modules:** Dashboard, HR, Notifications, Reports, Audit, Settings

**Can do:**
- Maintain staff records: qualifications, licenses, registration numbers
- Track attendance and leave management
- Process payroll and track salary records
- Manage training schedules and compliance tracking
- Create staff accounts if given permission by Hospital Manager
- Receive alerts for expiring staff licenses
- Generate workforce reports: staffing levels, turnover, absenteeism

**Cannot do:** Write clinical notes, access patient records, process billing, create Hospital Manager accounts

---

## 15. Quality Officer
**Demo:** quality@artic.health / quality123 | **Scope:** Clinical quality and accreditation

**Modules:** Dashboard, Quality, Surveillance, Reports, Audit, Notifications

**Can do:**
- Run clinical audits against defined standards
- Record patient safety incidents and near-misses
- Track corrective and preventive actions (CAPA)
- Monitor RAAQH accreditation readiness checklist
- Manage infection control monitoring and reporting
- Monitor disease surveillance; generate outbreak alerts
- Track patient satisfaction survey results

**Cannot do:** Prescribe, dispense, access full EMR, process billing, manage users

---

## 16. Data Officer
**Demo:** data@artic.health / data123 | **Scope:** HMIS and government reporting

**Modules:** Dashboard, Reports, Surveillance, Interoperability, Quality

**Can do:**
- Prepare and submit MOH HMIS monthly/quarterly reports
- Track and submit PBF (Performance-Based Financing) indicators
- Prepare weekly epi (epidemiology) surveillance reports
- Generate analytics dashboards: disease burden, service utilisation, outcomes
- Export data in FHIR R4 format for HIE (Health Information Exchange)
- Monitor data quality and completeness indicators

**Cannot do:** Write clinical notes, prescribe, process billing, manage users

---

## 17. Ambulance Driver
**Demo:** ambulance@artic.health / drive123 | **Scope:** Emergency transport

**Modules:** Dashboard, Ambulance, Notifications

**Can do:**
- View emergency dispatch assignments
- Update vehicle status (Available, Dispatched, At Scene, Returning, Maintenance)
- Update GPS location during active dispatch
- Record incident handover details on arrival
- Receive and acknowledge dispatch notifications

**Cannot do:** Access patient records, write clinical notes, process billing, manage users

---

## 18. Patient
**Demo:** patient@artic.health / patient123 | **Linked to:** Claudine Mutesi, MRN-2026-0001

**Modules:** My Health Portal, Appointments, Telemedicine, Billing

**Can do:**
- View and book personal appointments with available doctors
- View own lab results, diagnoses, and discharge summaries
- View active prescriptions and medication list
- View and pay own invoices (MTN MoMo, Airtel Money, Bank Card)
- Download receipts for completed payments
- Join telemedicine video or voice consultations
- Send secure messages to care team
- Receive appointment reminders via SMS, email, or WhatsApp

**Cannot do:** See any other patient's data, access clinical workflows, manage users


---

# 📱 PART 5: DEMO PATIENTS

| MRN | Name | Age | Insurance | Status | Key Conditions |
|-----|------|-----|-----------|--------|----------------|
| MRN-2026-0001 | Claudine Mutesi | 34, F | RSSB | Active follow-up | Hypertension |
| MRN-2026-0002 | Samuel Ndayisaba | 8, M | Mutuelle | In clinic | Asthma |
| MRN-2026-0003 | Esperance Kayitesi | 61, F | Private | Admitted (Medical Ward) | Diabetes, Hypertension |
| MRN-2026-0004 | Patrick Mugenzi | 44, M | RSSB | Emergency triage (ICU) | Trauma |
| MRN-2026-0005 | Vestine Uwimana | 28, F | Mutuelle | ANC visit | Pregnancy |

---

# 💬 PART 6: CHAT & MESSAGING SYSTEM

## One-on-One Chat Permissions

| Role | Can Chat With |
|------|---------------|
| Super Admin | Everyone |
| Hospital Manager | Everyone in their hospital |
| Doctor | Assigned patients, nurses, pharmacists, lab techs, radiologists, admin |
| Nurse | Assigned patients, doctors, pharmacists, lab techs, admin |
| Pharmacist | Doctors, nurses, patients (with active prescription), admin |
| Lab Technician | Doctors, nurses, admin |
| Accountant | Patients (billing queries only), admin |
| Receptionist | Patients, doctors, admin |
| Patient | Assigned doctor, support, billing team |

## Group Chat Types

| Type | Created By | Members |
|------|-----------|---------|
| Department Group | Department Head, Admin | Department staff |
| Case Group | Doctor, Admin | Care team for a patient |
| Emergency Group | Admin, Emergency Team Lead | Emergency response team |
| Project Group | Any user | Invited users |

## Emergency Messaging

| Alert | Sender | Receiver | Action |
|-------|--------|----------|--------|
| Emergency Alert | Doctor, Nurse, Admin | Emergency team | Push + SMS immediately |
| Code Blue | Nurse, Doctor | ICU team | Immediate alert + location |
| Trauma Alert | Emergency team | Surgery team | Immediate alert + patient info |
| Patient Crisis | Nurse, Doctor | Assigned doctor | Alert + patient details |

## Security Features
- End-to-end encryption on all messages
- Message recall within 5 minutes
- Block and report user
- Read receipts (optional)
- File sharing: images, documents, PDFs

---

# 🤖 PART 7: AI FEATURES

## AI Health Assistant (Public Website)

| Feature | Free | Subscribed |
|---------|------|-----------|
| Questions per session | 2 | Unlimited |
| Symptom checking | ❌ | ✅ |
| Health recommendations | ❌ | ✅ |
| Personalized health tips | ❌ | ✅ |
| Hospital and appointment guidance | ✅ | ✅ |

## AI Clinical Decision Support (Doctors)

| Feature | Description |
|---------|-------------|
| Diagnosis Suggestions | Suggests possible diagnoses based on symptoms and vitals |
| Treatment Recommendations | Evidence-based treatment options |
| Drug Interaction Alerts | Flags dangerous drug combinations |
| Allergy Alerts | Warns if patient is allergic to prescribed drug |
| Lab Interpretation | Suggests interpretations for lab result patterns |
| Readmission Risk | Calculates risk of patient readmission |
| Clinical Guidelines | Shows relevant clinical guidelines for the diagnosis |

## AI Drug Interaction (Pharmacists)

| Feature | Description |
|---------|-------------|
| Drug-Drug Interactions | Checks interactions between all active medications |
| Drug-Food Interactions | Alerts for food and dietary interactions |
| Drug-Allergy Interactions | Checks patient allergies against new drugs |
| Drug-Disease Interactions | Checks if drug is safe given the patient's conditions |
| Dosage Verification | Verifies dosage is appropriate for age and weight |
| Alternative Suggestions | Suggests alternatives if interaction is found |

## AI Predictive Analytics (Administrators)

| Feature | Description |
|---------|-------------|
| Bed Occupancy Prediction | Predicts bed availability 7 days ahead |
| Drug Demand Prediction | Forecasts medication needs by department |
| Staffing Optimization | Suggests optimal staffing levels by shift |
| Revenue Forecasting | Predicts future revenue trends |
| Patient Volume Prediction | Forecasts patient arrivals by day and department |
| Disease Outbreak Prediction | Alerts for potential outbreak patterns |
| No-Show Prediction | Predicts appointment no-shows for proactive rebooking |

## AI Voice Features (All Clinical Staff)

| Feature | Description |
|---------|-------------|
| Voice-to-Text Notes | Converts speech to structured clinical notes |
| Voice Commands | Control system with voice |
| Language Translation | Translates notes to Kinyarwanda, French, English |

## AI Medical Coding

| Feature | Description |
|---------|-------------|
| ICD-10/11 Suggestion | Suggests ICD codes from clinical note content |
| Code Validation | Validates codes are correct for the diagnosis |
| Coding Error Detection | Flags potential coding errors before submission |

---

# 🔒 PART 8: SECURITY & COMPLIANCE

| Feature | Detail |
|---------|--------|
| Authentication | JWT access token (15 min) + rotating refresh token (7 days) |
| Passwords | bcrypt hashed, work factor 12 — never stored or transmitted in plaintext |
| RBAC | Every API request checks role against module; HTTP 403 + audit log on denial |
| Audit Trail | Every login, logout, failed attempt, data access, and modification logged with timestamp, user ID, IP, user-agent |
| Session Timeout | 30 minutes of inactivity terminates session |
| Account Lockout | 5 failed login attempts in 10 minutes locks account; unlock email sent |
| MFA | TOTP or SMS OTP supported for all roles |
| Field-Level Access | Restricted fields redacted from API responses for roles without permission |
| Data Protection | Rwanda Data Protection Law (Law N° 058/2021) compliant |
| Device Tracking | New device login triggers additional verification step |

---

# 🛠️ PART 9: TECHNOLOGY STACK

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, Zustand, Recharts |
| Backend (Phase 1) | Node.js v22, plain HTTP server (src/server.js), in-memory data |
| Backend (Phase 2+) | Express.js 5, bcryptjs, jsonwebtoken, helmet, morgan, cors |
| Database | PostgreSQL 16 (Docker, port 5433), SQLite for local dev |
| Cache | Redis 7 (Docker, port 6380), key prefix `hms:` |
| Process Manager | PM2 |
| Containerisation | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Infrastructure | Azure VM, Nginx reverse proxy, UFW + Azure NSG firewall |
| Notifications | Africa's Talking (SMS), Nodemailer (email), Socket.IO (real-time) |
| Standards | FHIR R4, ICD-10/11, HL7 v2, RSSB API, NIDA NID API |

---

# 🚀 PART 10: DELIVERY PHASES

## Phase 1 — Foundation (Current — Live)
Authentication & RBAC, Patient Management, Appointment Scheduling,
Reception & Patient Flow, EMR, Doctor Workspace, Pharmacy Management,
Laboratory Management, Billing & Finance, Reports & Analytics,
Notifications, Security & Audit, System Administration

## Phase 2 — Expanded Clinical
Nursing & Ward Care, Radiology/Imaging, Inpatient Management,
Emergency Department, Maternity & Child Health, Inventory & Supply Chain,
Blood Bank, Mortuary, Insurance & Claims, Patient Portal, Telemedicine

## Phase 3 — Advanced Operations
Human Resources, Facility & Asset Management, Ambulance & Emergency Response,
Quality Management, Disease Surveillance, FHIR/HIE Interoperability,
AI & Clinical Decision Support, Multi-Tenant Scalability

---

# ✅ CONCLUSION — KEY PRINCIPLES

1. **One Patient, One MRN** — The MRN stays with the patient for life across all facilities
2. **NID is the Master Key** — All patient searches use NID to prevent duplicates
3. **No Duplicate Records** — System always checks NID before creating new records
4. **Role-Based Access** — Every user sees only what their role permits; denials are logged
5. **Audit Everything** — Every action is logged for security, compliance, and clinical safety
6. **Insurance First** — Every service auto-calculates the insurance split before billing the patient
7. **Critical Alerts Fire Immediately** — Lab critical results, emergency triage, and vital sign alerts have zero tolerance for delay
8. **Offline-Ready** — Core workflows (triage, vitals, basic registration) function on low-connectivity devices

---

*"Everyone sees what they need to see, and only what they need to see."*

---
*ARTIC Health Companion — Built for Rwanda. Ready for Africa.*
*Last updated: July 2026*
