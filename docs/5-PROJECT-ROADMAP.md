# ARTIC HMS — Full Project Roadmap
# Everything that must be built until the project is done

---

## Current Status (July 2026)

### ✅ DONE — Backend API
| Module | Routes | DB Tables |
|--------|--------|-----------|
| Auth (JWT, bcrypt, lockout, refresh rotation) | ✅ 6 routes | ✅ users, refresh_tokens, audit_logs |
| Users (CRUD, roles, soft delete) | ✅ 6 routes | ✅ users, roles, role_modules |
| Patients (NID dedup, MRN, search) | ✅ 7 routes | ✅ patients |
| Appointments (queue, check-in, priority) | ✅ 8 routes | ✅ appointments |
| Medical Records (SOAP, vitals, sign/lock) | ✅ 8 routes | ✅ vitals, clinical_notes |
| Laboratory (full lifecycle, critical alerts) | ✅ 7 routes | ✅ lab_requests |
| Pharmacy (Rx, FEFO, controlled drugs) | ✅ 7 routes | ✅ prescriptions, drug_inventory |
| Billing (invoices, payments, insurance split) | ✅ 5 routes | ✅ invoices, invoice_items, payments |
| Insurance Claims (submit, track, reject) | ✅ 5 routes | ✅ insurance_claims |
| Inventory (stock, PR, approval) | ✅ 10 routes | ✅ inventory_items, stock_movements |
| Radiology (orders, reports) | ✅ 4 routes | ✅ radiology_orders |
| Notifications (in-app, mark read) | ✅ 4 routes | ✅ notifications |
| Reports (KPIs, revenue, MOH, audit) | ✅ 5 routes | ✅ (queries across tables) |
| Inpatient (beds, admit, discharge, transfer) | ✅ 8 routes | ✅ beds, admissions, discharge_summaries |
| Nursing (triage, MAR, handover, consent) | ✅ 7 routes | ✅ triage_assessments, medication_administration |
| Vaccination Registry (Rwanda EPI) | ✅ 6 routes | ✅ vaccine_catalogue, immunization_records |
| Birth Registration | ✅ 4 routes | ✅ birth_registrations |
| Death Registration | ✅ 4 routes | ✅ death_registrations |
| WebSocket (Socket.IO) | ✅ Rooms + events | — |
| SMS Service (Africa's Talking) | ✅ Built (needs API key) | — |
| Email Service (Nodemailer) | ✅ Built (needs SMTP) | — |
| Notification Dispatcher | ✅ Built | — |
| Dashboard KPIs | ✅ 2 routes | — |

### ✅ DONE — Frontend
- All 31 module UIs (interactive, demo data → real API hydration on login)
- All 19 role dashboards
- RBAC sidebar (each role sees only permitted modules)
- Login with real JWT (fallback to demo users)
- Doctor consultation page — real SOAP, Rx, Lab orders
- Nurse triage page — real vitals + triage assessment
- Patient portal page — real appointments, bills, results
- WebSocket hook (socket.io-client, auto-connect on login)
- Next.js middleware (route-level RBAC)

---

## Sprint 2 — What to Build Next

### Priority 1 — Critical for daily hospital use

**HR Module backend**
```
GET/POST    /api/hr/staff
GET/POST    /api/hr/attendance
GET/POST    /api/hr/leave + /approve
GET/POST    /api/hr/payroll
GET/POST    /api/hr/credentials
```
Tables: `staff_attendance`, `leave_requests`, `payroll_records`, `staff_credentials`

**Ambulance Module backend**
```
GET/POST    /api/ambulance/vehicles
PATCH       /api/ambulance/vehicles/:id/status
POST        /api/ambulance/dispatch
GET/PATCH   /api/ambulance/dispatch/:id
POST        /api/ambulance/handover
```
Tables: `ambulances`, `dispatches`

**Blood Bank backend**
```
GET/POST    /api/blood-bank/stock
GET/POST    /api/blood-bank/donors
POST        /api/blood-bank/crossmatch
POST        /api/blood-bank/issue
GET         /api/blood-bank/transfusions
```
Tables: `blood_donors`, `blood_units`, `transfusions`

**Patient Portal backend** (dedicated endpoints for patient self-service)
```
GET/PATCH   /api/portal/me
GET/POST    /api/portal/appointments
DELETE      /api/portal/appointments/:id
GET         /api/portal/results
GET         /api/portal/prescriptions
GET/POST    /api/portal/invoices + /pay
GET/POST    /api/portal/messages
```

---

### Priority 2 — Public health registries

**ANC Register backend**
```
GET/POST    /api/anc
POST        /api/anc/:id/visit
GET         /api/anc/:id/visits
GET         /api/anc/high-risk
GET         /api/anc/reports/coverage
```
Tables: `pregnancies`, `anc_visits` (already in schema)

**Postnatal Register backend**
```
POST        /api/postnatal/register
POST        /api/postnatal/:id/visit
GET         /api/postnatal/overdue
```
Tables: `postnatal_records`, `pnc_visits` (already in schema)

**Child Health Register**
```
POST        /api/child-health/growth
GET         /api/child-health/growth/:patientId
GET         /api/child-health/chart/:patientId
POST        /api/child-health/nutrition
GET         /api/child-health/malnourished
```
Tables: `growth_records`, `child_interventions` (already in schema)

**Family Planning Register**
```
POST        /api/family-planning/enroll
POST        /api/family-planning/:id/visit
GET         /api/family-planning/due
GET         /api/family-planning/reports/cyp
```
Tables: `family_planning_clients`, `fp_visits` (already in schema)

---

### Priority 3 — Clinical completeness

**Quality Management**
```
GET/POST    /api/quality/audits
GET/POST    /api/quality/incidents
GET/POST    /api/quality/capa
GET/PATCH   /api/quality/raaqh
POST        /api/quality/satisfaction
```

**Disease Surveillance**
```
GET/POST    /api/surveillance/cases
GET         /api/surveillance/idsr
POST        /api/surveillance/submit-moh
GET         /api/surveillance/outbreaks
```

**HIV/ART Register**
```
POST        /api/hiv/test
GET/POST    /api/hiv/patients + /art-start + /visit
POST        /api/hiv/drug-pickup
GET         /api/hiv/defaulters
GET         /api/hiv/reports/tracnet
```

**TB Register**
```
POST        /api/tb/register
POST        /api/tb/:id/dot-visit
POST        /api/tb/:id/sputum
PATCH       /api/tb/:id/outcome
```

---

### Priority 4 — Advanced features

**AI Clinical Decision Support**
```bash
npm install openai
```
```
POST /api/ai/cds           — symptoms → diagnoses
POST /api/ai/drug-check    — drug list → interactions
POST /api/ai/icd-suggest   — text → ICD codes
POST /api/ai/lab-interpret — result → interpretation
POST /api/ai/transcribe    — audio → clinical notes
```

**PDF Generation**
```bash
npm install pdfkit
```
- Patient QR card PDF
- Invoice receipt PDF
- Birth certificate PDF
- Death certificate PDF
- Immunization card PDF
- Discharge summary PDF

**MFA (Two-Factor Authentication)**
```bash
npm install otplib qrcode
```
```
POST /api/auth/mfa/setup    — generate TOTP QR
POST /api/auth/mfa/verify   — activate MFA
POST /api/auth/mfa/validate — verify TOTP on login
```

**FHIR R4 Interoperability**
```
GET /api/fhir/Patient/:id
GET /api/fhir/Encounter/:id
GET /api/fhir/Observation/:id
POST /api/fhir/Bundle        — FHIR export
```

---

## Sprint 3 — Infrastructure & Polish

**Background Jobs (Bull queues)**
```bash
npm install bull
```
- Appointment reminders (24h before, 2h before)
- Lab result notifications
- Low stock alerts
- Expired drug alerts
- No-show auto-marking

**Telemedicine**
- Integrate Jitsi Meet (free, self-hosted)
- Session creation endpoint
- Embed iframe in frontend

**Mobile App** — see doc 6

**Swagger/OpenAPI docs**
```bash
npm install swagger-jsdoc swagger-ui-express
```

**Test suite**
```bash
npm install --save-dev vitest supertest
```

---

## Completion Tracker

| Area | % Complete |
|------|-----------|
| Authentication & Security | 90% (MFA missing) |
| Patient Management | 85% (QR card, photo upload missing) |
| Appointments & Queue | 90% |
| EMR / Consultation | 80% (discharge summary, templates missing) |
| Pharmacy | 80% |
| Laboratory | 85% |
| Billing & Finance | 80% (receipts PDF, mobile money callback missing) |
| Insurance Claims | 75% |
| Inventory & Procurement | 75% |
| Radiology | 70% |
| Inpatient & Beds | 75% |
| Nursing | 75% |
| Notifications (in-app) | 90% |
| Notifications (SMS/Email) | 30% (built, needs API keys) |
| WebSocket / Real-time | 80% (needs testing in production) |
| Birth Registration | 80% |
| Death Registration | 80% |
| Vaccination Registry | 85% |
| ANC Register | 30% (schema only) |
| Postnatal Register | 20% (schema only) |
| Child Health | 20% (schema only) |
| Family Planning | 20% (schema only) |
| HIV/ART Register | 0% |
| TB Register | 0% |
| Malaria Surveillance | 0% |
| Quality Management | 0% |
| Disease Surveillance | 0% |
| AI Features | 0% |
| HR Module | 0% |
| Ambulance | 0% |
| Blood Bank | 0% |
| Telemedicine | 5% (UI only) |
| PDF Generation | 0% |
| MFA | 0% |
| FHIR R4 | 0% |
| Mobile App | 10% (scaffold only) |
| **OVERALL** | **~55%** |
