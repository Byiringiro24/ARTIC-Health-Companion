# ARTIC HEALTH COMPANION — COMPLETE BUILD SPECIFICATION
## Enterprise Hospital Management System for Rwanda & Africa
## Full Production Build — All Modules, All Portals, All Registries

**Version:** 3.0 — Full Production
**Date:** July 2026
**Status:** This document defines everything that must be built for a complete, real-deployable system.

---

# PART 1 — WHAT IS ALREADY BUILT ✅

## Backend API (14 modules working)
| Route | Status |
|-------|--------|
| POST /api/auth/login, /refresh, /logout, /me, /change-password | ✅ Done |
| GET/POST/PATCH/DELETE /api/patients | ✅ Done |
| GET/POST/PATCH /api/appointments + /queue + /check-in | ✅ Done |
| GET/POST /api/medical-records/vitals + /notes + /summary | ✅ Done |
| GET/POST/PATCH /api/laboratory (collect/receive/result/validate) | ✅ Done |
| GET/POST/PATCH /api/pharmacy/prescriptions + /inventory | ✅ Done |
| GET/POST/PATCH /api/billing/invoices + /payment + /reconciliation | ✅ Done |
| GET/POST/PATCH /api/insurance (create/submit/status) | ✅ Done |
| GET/POST/PATCH /api/inventory + /purchase-requests | ✅ Done |
| GET/POST/PATCH /api/radiology (orders + reports) | ✅ Done |
| GET/PATCH /api/notifications (list/read/count) | ✅ Done |
| GET /api/reports (kpis/revenue/weekly/moh/audit) | ✅ Done |
| GET/POST/PATCH/DELETE /api/users + /roles | ✅ Done |
| GET /api/dashboard/kpis + /modules | ✅ Done |

## Frontend (all 31 module UIs exist as interactive demos)
All 31 module components exist. All 19 role dashboards exist.
RBAC sidebar filtering works. Login with real JWT works.

## Security
JWT rotation, bcrypt 12 rounds, account lockout, audit trail — all done.

## Database
PostgreSQL schema with 20+ tables. All clinical tables seeded with demo data.

---

# PART 2 — WHAT MUST BE BUILT (FULL PRODUCTION)

---

## MODULE A — INPATIENT MANAGEMENT & BED SYSTEM
**Priority: 🔴 Critical**

### Backend routes needed:
```
GET    /api/inpatient/beds              — live bed map by ward
POST   /api/inpatient/admit             — admit patient to bed
PATCH  /api/inpatient/beds/:id/status  — update bed status (occupied/cleaning/available)
POST   /api/inpatient/discharge         — discharge patient, generate summary, free bed
GET    /api/inpatient/admissions        — list all current admissions
PATCH  /api/inpatient/transfer          — transfer patient between wards/beds
POST   /api/inpatient/ward-round        — record ward round notes
GET    /api/inpatient/discharge-summary/:patientId — get discharge summary
```

### Database tables needed:
```sql
beds (id, ward, room, bed_number, type, status, hospital_id, tenant_id)
admissions (id, patient_id, bed_id, doctor_id, diagnosis, admitted_at, discharged_at, status)
discharge_summaries (id, admission_id, patient_id, final_diagnosis, medications, follow_up_plan, signed_at)
ward_rounds (id, patient_id, admission_id, doctor_id, notes, vitals_id, created_at)
```

### Frontend connections needed:
- Wire `InpatientModule.tsx` to POST /api/inpatient/admit
- Wire bed map to GET /api/inpatient/beds (live, poll every 30s)
- Wire discharge button to POST /api/inpatient/discharge
- Bed status updates real-time via WebSocket

---

## MODULE B — NURSING & WARD CARE
**Priority: 🔴 Critical**

### Backend routes needed:
```
POST   /api/nursing/triage              — record triage level + vitals + chief complaint
GET    /api/nursing/patients            — nurse's ward patient list
POST   /api/nursing/mar                 — record medication administration (MAR)
GET    /api/nursing/mar/:patientId      — medication administration history
POST   /api/nursing/handover            — shift handover record
GET    /api/nursing/handover/current    — current shift handover notes
POST   /api/nursing/consent             — record patient consent
POST   /api/nursing/fall-risk           — fall risk assessment
POST   /api/nursing/wound               — wound care record
```

### Database tables needed:
```sql
triage_assessments (id, patient_id, appointment_id, triage_level, vitals_id, chief_complaint, nurse_id, created_at)
medication_administration (id, patient_id, prescription_id, drug, dose, route, given_at, given_by, notes)
shift_handovers (id, hospital_id, ward, outgoing_nurse, incoming_nurse, notes, created_at)
patient_consents (id, patient_id, consent_type, signed_at, witness_id, document_url)
fall_risk_assessments (id, patient_id, score, risk_level, interventions, assessed_by, created_at)
```

---

## MODULE C — HUMAN RESOURCES
**Priority: 🔴 Critical**

### Backend routes needed:
```
GET    /api/hr/staff                    — list all staff
POST   /api/hr/staff                    — create staff record
PATCH  /api/hr/staff/:id                — update staff
GET    /api/hr/staff/:id/attendance     — attendance history
POST   /api/hr/attendance               — record attendance (clock in/out)
GET    /api/hr/leave                    — leave requests list
POST   /api/hr/leave                    — submit leave request
PATCH  /api/hr/leave/:id/approve        — approve/reject leave
GET    /api/hr/payroll                  — payroll records
POST   /api/hr/payroll                  — generate payroll
GET    /api/hr/training                 — training records
POST   /api/hr/training                 — record training completion
GET    /api/hr/credentials/:staffId     — license/credential tracker
POST   /api/hr/credentials              — add credential
```

### Database tables needed:
```sql
staff_attendance (id, user_id, date, clock_in, clock_out, hours_worked, status)
leave_requests (id, user_id, leave_type, start_date, end_date, status, approved_by, created_at)
payroll_records (id, user_id, month, basic_salary, allowances, deductions, net_pay, paid_at)
staff_training (id, user_id, course_name, provider, completed_at, expiry_date, certificate_url)
staff_credentials (id, user_id, credential_type, number, issued_at, expiry_date, issuing_body)
```

---

## MODULE D — AMBULANCE & EMERGENCY RESPONSE
**Priority: 🟡 Medium**

### Backend routes needed:
```
GET    /api/ambulance/vehicles          — list ambulances + status
PATCH  /api/ambulance/vehicles/:id/status — update vehicle status + GPS
POST   /api/ambulance/dispatch          — create dispatch record
GET    /api/ambulance/dispatch/active   — active dispatches
PATCH  /api/ambulance/dispatch/:id      — update dispatch (en-route/at-scene/returning)
POST   /api/ambulance/handover          — record patient handover on arrival
GET    /api/ambulance/history           — dispatch history
POST   /api/ambulance/maintenance       — log maintenance
```

### Database tables needed:
```sql
ambulances (id, vehicle_number, type, status, driver_id, last_location, hospital_id)
dispatches (id, ambulance_id, driver_id, patient_name, pickup_location, destination, status, dispatched_at)
ambulance_handovers (id, dispatch_id, patient_id, handover_notes, receiving_nurse_id, created_at)
vehicle_maintenance (id, ambulance_id, type, description, cost, performed_at, next_due)
```

---

## MODULE E — BLOOD BANK
**Priority: 🟡 Medium**

### Backend routes needed:
```
GET    /api/blood-bank/stock            — blood units inventory by group
POST   /api/blood-bank/receive          — receive blood donation
GET    /api/blood-bank/donors           — donor registry
POST   /api/blood-bank/donors           — register donor
POST   /api/blood-bank/crossmatch       — crossmatch request
POST   /api/blood-bank/issue            — issue blood to patient
GET    /api/blood-bank/transfusions     — transfusion records
```

### Database tables needed:
```sql
blood_donors (id, name, nid, blood_group, phone, last_donation_date, eligible_from, hospital_id)
blood_units (id, blood_group, component, units, collected_at, expiry_date, donor_id, status, hospital_id)
crossmatch_requests (id, patient_id, blood_group, units_needed, ordered_by, status, created_at)
transfusions (id, patient_id, blood_unit_id, administered_by, started_at, completed_at, reaction_noted)
```

---

## MODULE F — MORTUARY
**Priority: 🟡 Medium**

### Backend routes needed:
```
GET    /api/mortuary/bodies             — bodies in storage
POST   /api/mortuary/admit              — admit body
PATCH  /api/mortuary/bodies/:id         — update storage info
POST   /api/mortuary/death-certificate  — generate death certificate
POST   /api/mortuary/release            — authorize body release
GET    /api/mortuary/certificates       — list death certificates
```

### Database tables needed:
```sql
mortuary_records (id, patient_id, name, dob, date_of_death, cause_of_death, admitted_at, storage_unit, status, hospital_id)
death_certificates (id, mortuary_record_id, certificate_number, cause_of_death, signed_by, issued_at, nida_submitted)
body_releases (id, mortuary_record_id, released_to, relationship, id_number, authorized_by, released_at)
```

---

---

## MODULE G — QUALITY MANAGEMENT
**Priority: 🟡 Medium**

### Backend routes needed:
```
GET    /api/quality/audits              — clinical audit list
POST   /api/quality/audits              — create audit
PATCH  /api/quality/audits/:id          — update audit findings
POST   /api/quality/incidents           — report patient safety incident
GET    /api/quality/incidents           — incident list
POST   /api/quality/capa                — corrective action plan
PATCH  /api/quality/capa/:id            — update CAPA status
GET    /api/quality/raaqh               — RAAQH accreditation checklist
PATCH  /api/quality/raaqh/:id           — update accreditation item
POST   /api/quality/infection-control   — infection control record
GET    /api/quality/satisfaction        — patient satisfaction surveys
POST   /api/quality/satisfaction        — submit survey response
```

---

## MODULE H — DISEASE SURVEILLANCE
**Priority: 🟡 Medium**

### Backend routes needed:
```
GET    /api/surveillance/diseases       — notifiable disease list
POST   /api/surveillance/report         — report case
GET    /api/surveillance/cases          — case list with trends
GET    /api/surveillance/idsr           — IDSR weekly report data
POST   /api/surveillance/submit-moh     — submit MOH IDSR report
GET    /api/surveillance/outbreaks      — active outbreak alerts
```

### Database tables needed:
```sql
disease_cases (id, disease_code, patient_id, hospital_id, reported_at, outcome, reporter_id)
surveillance_reports (id, week, year, hospital_id, data_json, submitted_at, submitted_by)
outbreak_alerts (id, disease, location, case_count, alert_level, created_at, resolved_at)
```

---

## MODULE I — PATIENT PORTAL (SELF-SERVICE)
**Priority: 🔴 Critical**

### Backend routes needed:
```
GET    /api/portal/me                   — patient own profile
PATCH  /api/portal/me                   — update own profile
GET    /api/portal/appointments         — patient own appointments
POST   /api/portal/appointments         — book own appointment
DELETE /api/portal/appointments/:id     — cancel own appointment
GET    /api/portal/results              — patient lab + radiology results
GET    /api/portal/prescriptions        — active prescriptions
GET    /api/portal/invoices             — own billing invoices
POST   /api/portal/invoices/:id/pay     — pay invoice (mobile money)
GET    /api/portal/messages             — secure messages from care team
POST   /api/portal/messages             — send message to care team
GET    /api/portal/health-summary       — health timeline
```

---

## MODULE J — TELEMEDICINE
**Priority: 🟡 Medium**

### Backend routes needed:
```
POST   /api/telemedicine/session        — create video session (Jitsi/Whereby token)
GET    /api/telemedicine/sessions       — list sessions
PATCH  /api/telemedicine/sessions/:id   — update session status
POST   /api/telemedicine/notes/:sessionId — save consultation note from video call
POST   /api/telemedicine/prescription/:sessionId — issue remote prescription
```

### Implementation note:
Use Jitsi Meet (self-hosted or cloud) or Daily.co API. No WebRTC build needed — embed the iframe.

---

## MODULE K — REAL-TIME ENGINE (WebSocket)
**Priority: 🔴 Critical — Required by 8+ modules**

### What needs Socket.IO:
- Live queue board updates (patient called, status changed)
- Critical lab result instant push to doctor
- Emergency alert broadcasting
- Ambulance GPS location updates
- Bed status changes (ward nurses see real-time)
- New prescription arriving in pharmacy queue
- Chat messages delivery

### Backend implementation:
```javascript
// backend/src/realtime/socket.js
import { Server } from "socket.io";
export function initSocket(httpServer) {
  const io = new Server(httpServer, { cors: { origin: CORS_ORIGIN } });
  io.use(socketAuthMiddleware);  // JWT verify on connect
  io.on("connection", (socket) => {
    socket.join(`hospital:${socket.user.hospitalId}`);
    socket.join(`user:${socket.user.id}`);
    if (socket.user.departmentId) socket.join(`dept:${socket.user.departmentId}`);
  });
  return io;
}

// Emit helpers (called from services)
export function emitCriticalAlert(io, userId, data) {
  io.to(`user:${userId}`).emit("critical_alert", data);
}
export function emitQueueUpdate(io, hospitalId, data) {
  io.to(`hospital:${hospitalId}`).emit("queue_update", data);
}
```

### Package needed: `npm install socket.io`

---

## MODULE L — SMS & EMAIL NOTIFICATIONS
**Priority: 🔴 Critical**

### Package installations needed:
```bash
npm install @africastalking/africastalking  # SMS via Africa's Talking
npm install nodemailer                       # Email
npm install bull                             # Background job queue (Redis-backed)
```

### Backend service:
```javascript
// backend/src/services/sms.service.js
// backend/src/services/email.service.js
// backend/src/services/notification.dispatcher.js
```

### Triggers to implement:
| Event | SMS | Email | In-App |
|-------|-----|-------|--------|
| Appointment booked | ✅ | ✅ | ✅ |
| Appointment reminder (24h before) | ✅ | ✅ | ✅ |
| Lab critical result | ✅ | — | ✅ |
| Prescription ready | ✅ | — | ✅ |
| Invoice generated | ✅ | ✅ | ✅ |
| Payment confirmed | ✅ | ✅ | ✅ |
| Insurance claim rejected | — | ✅ | ✅ |
| Password reset | — | ✅ | — |
| Low stock alert | — | — | ✅ |

---

---

# PART 3 — HEALTH REGISTRIES (NEW — Rwanda MOH Compliance)

These are the civil and public health registration portals required by Rwanda law and MOH.

---

## REGISTRY 1 — BIRTH REGISTRATION (Uburayire bw'Inzaduko)
**Legal basis:** Rwanda Law N°32/2016 on Civil Registration. All births must be registered with NIDA within 30 days.

### What it does:
- Records every birth that occurs in the facility
- Generates a Birth Notification document (used to get NID)
- Submits to Rwanda Civil Registration (CRVS)
- Creates a patient record for the newborn automatically
- Links newborn to mother's patient record
- Tracks birth outcome (live birth, stillbirth, maternal death)

### Backend routes:
```
POST   /api/registry/births             — register birth
GET    /api/registry/births             — list births (filterable by date, outcome)
GET    /api/registry/births/:id         — birth record detail
POST   /api/registry/births/:id/notify  — submit CRVS notification
GET    /api/registry/births/stats       — monthly birth statistics
```

### Database table:
```sql
birth_registrations (
  id, hospital_id, mother_patient_id, newborn_patient_id,
  birth_date, birth_time, delivery_mode,  -- normal/C-section/assisted
  gestational_weeks, birth_weight_grams, birth_length_cm,
  apgar_score_1min, apgar_score_5min,
  birth_outcome,   -- live_birth | stillbirth | neonatal_death
  sex, multiple_birth, birth_order,  -- for twins: 1st, 2nd
  complications, attendant_id,       -- midwife/doctor who delivered
  crvs_reference, crvs_submitted_at,
  certificate_number, issued_at,
  created_at, created_by
)
```

### Frontend:
- Maternity module: "Register Birth" form
- Auto-creates newborn patient record with MRN
- Prints Birth Notification certificate
- Midwife dashboard shows births today

---

## REGISTRY 2 — DEATH REGISTRATION (Uburayire bw'Urupfu)
**Legal basis:** Rwanda Civil Registration. Death certificate required before burial permit.

### What it does:
- Issues death certificates for in-hospital deaths
- Records cause of death with ICD-10 code
- Handles stillbirth and neonatal death certificates
- Submits to NIDA (notifies NID deactivation)
- Generates burial permit reference
- Updates patient record status to "deceased"

### Backend routes:
```
POST   /api/registry/deaths             — register death
GET    /api/registry/deaths             — list deaths
GET    /api/registry/deaths/:id         — death record detail
POST   /api/registry/deaths/:id/certificate — issue death certificate
POST   /api/registry/deaths/:id/crvs    — submit to CRVS/NIDA
GET    /api/registry/deaths/stats       — mortality statistics
```

### Database table:
```sql
death_registrations (
  id, hospital_id, patient_id,
  date_of_death, time_of_death,
  place_of_death,  -- hospital | home | other
  primary_cause_icd, contributing_cause_icd,
  manner_of_death,  -- natural | accident | suicide | homicide | unknown
  certifying_doctor_id,
  certificate_number, issued_at,
  nida_notified, nida_notification_at,
  crvs_reference, crvs_submitted_at,
  burial_permit_number,
  autopsy_required, autopsy_done,
  created_at
)
```

---

## REGISTRY 3 — VACCINATION REGISTRY (Uburayire bw'Inkingo)
**Rwanda EPI — Expanded Programme on Immunization**

### What it does:
- Full Rwanda immunization schedule (BCG, Polio, DTP-HepB-Hib, Rotavirus, PCV, Measles, HPV, etc.)
- Tracks every vaccine dose given to every patient (especially children)
- Generates immunization card (printable + QR code)
- Sends SMS reminders for upcoming vaccines
- Tracks defaulters (missed vaccines)
- Reports to MOH HMIS vaccination indicators
- School-entry vaccine verification
- COVID-19 vaccination tracking
- Adult vaccines (Tetanus, Yellow Fever, Hepatitis B)

### Backend routes:
```
GET    /api/vaccines/schedule            — Rwanda EPI schedule (by age)
GET    /api/vaccines/patient/:patientId  — patient immunization history
POST   /api/vaccines/administer          — record vaccine given
POST   /api/vaccines/adverse-event       — report adverse event (AEFI)
GET    /api/vaccines/due-today           — patients due for vaccines today
GET    /api/vaccines/defaulters          — patients who missed vaccines
GET    /api/vaccines/stock               — vaccine cold chain inventory
POST   /api/vaccines/stock/receive       — receive vaccine shipment
GET    /api/vaccines/reports/coverage    — coverage by antigen/age/district
POST   /api/vaccines/card/:patientId     — generate immunization card (PDF)
```

### Database tables:
```sql
vaccine_catalogue (id, name, antigen, doses_required, schedule_weeks, minimum_interval_days, storage_temp, is_active)
immunization_records (
  id, patient_id, hospital_id,
  vaccine_id, dose_number,   -- 1st, 2nd, 3rd dose
  batch_number, manufacturer,
  administered_at, administered_by,
  site, route,               -- IM/SC/oral
  next_dose_due,
  adverse_event_noted, adverse_event_details
)
vaccine_stock (id, hospital_id, vaccine_id, batch_number, quantity, expiry_date, storage_unit, received_at)
aefi_reports (id, immunization_id, patient_id, event_description, severity, outcome, reported_at)
```

### Rwanda EPI Schedule (pre-seeded):
| Vaccine | When Given |
|---------|-----------|
| BCG + Polio 0 | At birth |
| DTP-HepB-Hib 1 + Polio 1 + PCV 1 + Rota 1 | 6 weeks |
| DTP-HepB-Hib 2 + Polio 2 + PCV 2 + Rota 2 | 10 weeks |
| DTP-HepB-Hib 3 + Polio 3 + PCV 3 | 14 weeks |
| Measles + Yellow Fever + Malaria (RTS,S) | 9 months |
| Measles 2nd | 15 months |
| HPV dose 1 | Girls age 12 |
| HPV dose 2 | 6 months later |
| Tetanus Toxoid | Pregnant women (TT1–TT5) |

---

## REGISTRY 4 — ANTENATAL CARE REGISTER (Ubusobanuro bw'Inda)
**Rwanda FANC — Focused Antenatal Care Protocol**

### What it does:
- Tracks all ANC visits (minimum 8 recommended by WHO/Rwanda protocol)
- Screens for pre-eclampsia, gestational diabetes, HIV, syphilis, malaria
- Records fetal growth, fetal position, fetal heartbeat
- Issues Maternal Health Booklet (Carnet de Santé de la Mère)
- Plans delivery location (home/health center/hospital)
- Tracks high-risk pregnancies
- Reports to MOH HMIS ANC coverage indicators

### Backend routes:
```
GET    /api/anc/patients                — pregnant women list
POST   /api/anc/register                — register pregnancy
GET    /api/anc/:id                     — pregnancy record
POST   /api/anc/:id/visit               — record ANC visit
GET    /api/anc/:id/visits              — visit history
PATCH  /api/anc/:id/risk                — update risk classification
POST   /api/anc/:id/delivery-plan       — record delivery plan
GET    /api/anc/reports/coverage        — ANC coverage report
GET    /api/anc/reports/high-risk       — high risk pregnancies list
```

### Database tables:
```sql
pregnancies (
  id, patient_id, hospital_id,
  lmp_date, edd,           -- last menstrual period, expected delivery date
  gestational_age_weeks,
  gravida, para,           -- obstetric history
  risk_level,              -- low | medium | high
  hiv_status, syphilis_status, malaria_result,
  blood_group_confirmed, rhesus,
  delivery_plan,           -- hospital | health_center | home
  outcome,                 -- delivered | miscarriage | stillbirth | ectopic
  registered_at, registered_by
)
anc_visits (
  id, pregnancy_id, visit_number, visit_date,
  gestational_weeks, weight, bp_systolic, bp_diastolic,
  fundal_height, fetal_position, fetal_heart_rate,
  urine_protein, urine_glucose, hemoglobin,
  tetanus_given, iron_folic_given, itn_given,
  counselling_topics, next_visit_date,
  midwife_id, notes
)
```

---

## REGISTRY 5 — POSTNATAL CARE REGISTER (Ibyorezo byo Gutera Inzira Amashyaka)
**Rwanda PNC Protocol — Minimum 4 visits after delivery**

### What it does:
- Tracks mother and newborn health after delivery (6h, 6 days, 6 weeks, 6 months)
- Records breastfeeding status, cord care, newborn screening
- Tracks postnatal depression screening (Edinburgh scale)
- Family planning counselling and method chosen
- Kangaroo Mother Care for low-birth-weight babies
- Automatic link to immunization schedule for newborn

### Backend routes:
```
POST   /api/postnatal/register          — register postnatal patient (from birth)
POST   /api/postnatal/:id/visit         — record PNC visit
GET    /api/postnatal/:id/visits        — PNC visit history
GET    /api/postnatal/overdue           — women who missed PNC visits
GET    /api/postnatal/reports           — PNC coverage report
```

### Database table:
```sql
postnatal_records (
  id, patient_id, birth_registration_id, hospital_id,
  delivery_date, discharge_date,
  breastfeeding_status, family_planning_method,
  postnatal_depression_score, kmc_enrolled,
  created_at
)
pnc_visits (
  id, postnatal_id, visit_number, visit_date,
  mother_bp, mother_weight, mother_uterus_status,
  lochia_status, perineum_healing, wound_healing,
  newborn_weight, newborn_temp, cord_status,
  newborn_feeding, immunizations_given,
  counselling_topics, midwife_id, notes
)
```

---

## REGISTRY 6 — CHILD HEALTH REGISTER (Ibyorezo by'Ubuzima bw'Abana)
**Rwanda Child Health Policy + IMCI (Integrated Management of Childhood Illness)**

### What it does:
- Growth monitoring for children under 5 (weight-for-age, height-for-age, MUAC)
- Malnutrition screening and treatment (SAM/MAM)
- Vitamin A supplementation tracking
- Deworming records
- IMCI case management (pneumonia, diarrhea, malaria, malnutrition)
- Child development milestones tracking
- School health records
- Generates Road to Health chart (growth curve)

### Backend routes:
```
GET    /api/child-health/patients       — children under 5 list
POST   /api/child-health/growth         — record growth measurement
GET    /api/child-health/growth/:patientId — growth history + z-scores
POST   /api/child-health/nutrition      — MUAC + nutritional assessment
GET    /api/child-health/malnourished   — SAM/MAM patients list
POST   /api/child-health/vitamin-a      — record Vitamin A dose
POST   /api/child-health/deworming      — record deworming
GET    /api/child-health/chart/:patientId — WHO growth chart data
POST   /api/child-health/milestones     — record developmental milestone
GET    /api/child-health/reports        — under-5 health statistics
```

### Database tables:
```sql
growth_records (
  id, patient_id, hospital_id,
  measured_at, age_months,
  weight_kg, height_cm, head_circ_cm, muac_cm,
  weight_for_age_z, height_for_age_z, weight_for_height_z,
  nutritional_status,  -- normal | at_risk | MAM | SAM
  measured_by
)
child_interventions (
  id, patient_id, intervention_type,  -- vitamin_a | deworming | therapeutic_feeding
  given_at, dose, batch, given_by, next_due
)
developmental_milestones (
  id, patient_id, age_months, milestone, achieved, assessed_by, notes
)
```

---

## REGISTRY 7 — FAMILY PLANNING REGISTER (Ibyorezo by'Imbanzirizamirimo)
**Rwanda Family Planning Program**

### What it does:
- Tracks all family planning clients
- Records method chosen (pill, injection, IUD, implant, condom, sterilization)
- Schedules follow-up visits
- Tracks method changes and discontinuations
- Couple Years of Protection (CYP) calculations for MOH reporting
- Unmet need tracking
- Adolescent-friendly services tracking

### Backend routes:
```
POST   /api/family-planning/enroll      — enroll new client
GET    /api/family-planning/clients     — client list
POST   /api/family-planning/:id/visit   — record FP visit / method given
PATCH  /api/family-planning/:id/method  — change method
PATCH  /api/family-planning/:id/discontinue — discontinue (reason required)
GET    /api/family-planning/due         — clients due for resupply
GET    /api/family-planning/reports/cyp — CYP report for MOH
```

### Database table:
```sql
family_planning_clients (
  id, patient_id, hospital_id,
  enrollment_date, counselled_by,
  current_method, method_start_date,
  number_of_children, reason_for_fp,
  status  -- active | discontinued | transferred
)
fp_visits (
  id, client_id, visit_date, method_given, quantity,
  side_effects_reported, bp, weight, provider_id, next_visit
)
```

---

## REGISTRY 8 — HIV/AIDS PROGRAM REGISTER (Ibyorezo bya ODA / VIH)
**Rwanda PMTCT + ART Program — linked to Tracnet**

### What it does:
- HIV testing and counselling (HTC) records
- PMTCT (Prevention of Mother-to-Child Transmission) tracking
- ART (Antiretroviral Therapy) patient register
- CD4 count and viral load tracking
- Adherence counselling records
- Drug pickup schedule
- TB/HIV co-infection tracking
- Discordant couple tracking
- Generates Tracnet-compatible export

### Backend routes:
```
POST   /api/hiv/test                    — record HIV test result
GET    /api/hiv/patients                — HIV-positive patients (restricted access)
POST   /api/hiv/:id/art-start           — start ART record
POST   /api/hiv/:id/visit               — ART follow-up visit
GET    /api/hiv/:id/viral-load          — viral load history
POST   /api/hiv/pmtct                   — PMTCT enrollment
GET    /api/hiv/pmtct/list              — PMTCT patients
GET    /api/hiv/reports/art             — ART cohort report
GET    /api/hiv/reports/tracnet         — Tracnet export format
POST   /api/hiv/drug-pickup/:id         — record drug pickup
GET    /api/hiv/defaulters              — patients who missed appointments
```

### Database tables:
```sql
hiv_tests (id, patient_id, test_date, result, counsellor_id, linked_to_care, hospital_id)
art_patients (
  id, patient_id, hospital_id,
  art_start_date, art_number, who_stage,
  regimen, cd4_at_start, vl_at_start,
  pmtct_enrolled, tb_status,
  status  -- active | transferred | died | ltfu | stopped
)
art_visits (
  id, art_patient_id, visit_date, cd4_count, viral_load,
  adherence_score, weight, who_stage, regimen_change,
  next_pickup_date, counsellor_id, clinician_id
)
drug_pickups (id, art_patient_id, pickup_date, days_supply, pharmacist_id, next_due)
```

---

## REGISTRY 9 — TUBERCULOSIS REGISTER (Ibyorezo bya Igituntu)
**Rwanda NTP — National Tuberculosis Program**

### What it does:
- TB case registration and unique TB number
- TB diagnosis type (Pulmonary/Extra-pulmonary, Drug-sensitive/MDR-TB)
- DOT (Directly Observed Therapy) treatment tracking
- Monthly sputum monitoring
- Treatment outcome recording (cured, completed, failed, died, LTFU)
- TB/HIV co-infection management
- Contact tracing records
- Generates NTP quarterly reports

### Backend routes:
```
POST   /api/tb/register                 — register TB patient
GET    /api/tb/patients                 — TB patient list
POST   /api/tb/:id/dot-visit            — record DOT visit
POST   /api/tb/:id/sputum              — record sputum result
PATCH  /api/tb/:id/outcome              — record treatment outcome
POST   /api/tb/:id/contact              — add contact trace
GET    /api/tb/reports/cohort           — quarterly cohort report
```

---

## REGISTRY 10 — MALARIA SURVEILLANCE (Ibyorezo bya Malariya)
**Rwanda NMCP — National Malaria Control Program**

### What it does:
- All RDT and microscopy results tracked
- Malaria treatment records (ACT prescription + completion)
- Malaria in pregnancy (MIP) tracking
- ITN (insecticide-treated net) distribution records
- Malaria case reporting to district health office
- Outbreak detection algorithm

### Backend routes:
```
GET    /api/malaria/cases               — malaria case list
POST   /api/malaria/test                — record malaria test
POST   /api/malaria/treat               — record treatment
GET    /api/malaria/pregnancy           — malaria in pregnancy cases
POST   /api/malaria/itn                 — ITN distribution record
GET    /api/malaria/reports             — weekly malaria report
```

---

---

# PART 4 — SECURITY GAPS TO FIX

## FIX 1 — requireModule() on all routes
Every API route must check the user has module access. Current gap: only `/api/patients` has it.

```javascript
// Add to every route file:
router.use(requireModule("laboratory"));   // in laboratory.routes.js
router.use(requireModule("pharmacy"));     // in pharmacy.routes.js
router.use(requireModule("billing"));      // in billing.routes.js
// etc.
```

## FIX 2 — User Creation Hierarchy Enforcement
In `users.service.js` createUser(), add target role validation:

```javascript
// Hospital Manager CANNOT create system-admin
if (caller.role === "hospital-manager" && targetRole === "system-admin") {
  throw new ForbiddenError("Hospital Manager cannot create System Admin");
}
// HR Manager CANNOT create Hospital Manager or System Admin
if (caller.role === "hr-manager" && ["system-admin","hospital-manager"].includes(targetRole)) {
  throw new ForbiddenError("HR Manager cannot create that role");
}
```

## FIX 3 — MFA Implementation
```bash
npm install otplib qrcode   # TOTP
```
Routes to add:
```
POST  /api/auth/mfa/setup    — generate TOTP secret + QR code
POST  /api/auth/mfa/verify   — verify TOTP code to activate MFA
POST  /api/auth/mfa/disable  — disable MFA
POST  /api/auth/mfa/validate — validate TOTP on login (step 2)
```

## FIX 4 — Emergency Registration (TEMP-MRN)
Add to patients service:
```javascript
export async function createEmergencyPatient(data, createdBy, tenantId, hospitalId) {
  const tempMrn = `TEMP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  // Create minimal patient record, mark as emergency=true
  // Later linkEmergencyRecord(tempId, realPatientData) when ID is available
}
```

## FIX 5 — Lock Duration (30 min → 10 min per spec)
In `auth.service.js`: change `LOCK_MINUTES = 30` to `LOCK_MINUTES = 10`

---

# PART 5 — AI FEATURES TO BUILD

## AI-1 — Clinical Decision Support (Rule-based + OpenAI)
```
POST /api/ai/cds              — symptom + vitals → suggested diagnoses
POST /api/ai/drug-check       — drug list + patient → interaction alerts
POST /api/ai/icd-suggest      — clinical note text → ICD-10 code suggestions
POST /api/ai/lab-interpret    — lab result + reference range → interpretation
POST /api/ai/risk-score       — patient data → readmission risk 0–100%
```

**Implementation**: Use OpenAI GPT-4o with a medical system prompt, Rwanda-specific drug interaction database (WHO EML), and Rwanda EPI protocol data as context.

```bash
npm install openai
```

## AI-2 — Predictive Analytics (Rule-based)
```
GET  /api/ai/predictions/beds      — bed occupancy forecast (next 7 days)
GET  /api/ai/predictions/drugs     — drug demand forecast (next 30 days)
GET  /api/ai/predictions/no-shows  — appointment no-show probability
GET  /api/ai/predictions/outbreak  — disease outbreak early warning
```

**Implementation**: Statistical models using historical appointment, lab, and admission data from the database. No external AI needed.

## AI-3 — Voice-to-Text Notes
```
POST /api/ai/transcribe      — audio blob → clinical note text
```
**Implementation**: Use OpenAI Whisper API or browser-native `SpeechRecognition` for free.

## AI-4 — Public AI Health Assistant
A chatbot on the public website that answers health questions.
**Implementation**: Embed a GPT-4o assistant with a Rwanda health knowledge base as a RAG document set.

---

# PART 6 — COMPLETE BACKEND FOLDER STRUCTURE

```
backend/src/
├── app.js                              ✅ done (all routes registered)
├── index.js                            ✅ done
├── config/
│   └── index.js                        ✅ done
├── database/
│   ├── connection.js                   ✅ done
│   ├── migrate.js                      ✅ done
│   ├── schema.js                       ✅ done (needs new tables added)
│   └── seed.js                         ✅ done (needs registry seed data)
├── middleware/
│   ├── auth.js                         ✅ done (needs requireModule fix)
│   ├── errorHandler.js                 ✅ done
│   ├── rateLimiter.js                  ✅ done
│   └── validate.js                     ✅ done
├── services/
│   ├── jwt.service.js                  ✅ done
│   ├── sms.service.js                  ❌ missing
│   ├── email.service.js                ❌ missing
│   ├── notification.dispatcher.js      ❌ missing
│   └── pdf.service.js                  ❌ missing (for certificates/receipts)
├── realtime/
│   └── socket.js                       ❌ missing (WebSocket server)
├── modules/
│   ├── auth/                           ✅ done
│   ├── users/                          ✅ done
│   ├── patients/                       ✅ done
│   ├── appointments/                   ✅ done
│   ├── medical-records/                ✅ done
│   ├── laboratory/                     ✅ done
│   ├── pharmacy/                       ✅ done
│   ├── billing/                        ✅ done
│   ├── insurance/                      ✅ done
│   ├── inventory/                      ✅ done
│   ├── radiology/                      ✅ done
│   ├── notifications/                  ✅ done
│   ├── reports/                        ✅ done
│   ├── dashboard/                      ✅ done
│   ├── inpatient/                      ❌ missing
│   ├── nursing/                        ❌ missing
│   ├── human-resources/                ❌ missing
│   ├── ambulance/                      ❌ missing
│   ├── blood-bank/                     ❌ missing
│   ├── mortuary/                       ❌ missing
│   ├── quality/                        ❌ missing
│   ├── surveillance/                   ❌ missing
│   ├── patient-portal/                 ❌ missing
│   ├── telemedicine/                   ❌ missing
│   ├── ai/                             ❌ missing (empty stub exists)
│   ├── settings/                       ❌ missing
│   └── registries/
│       ├── births/                     ❌ missing
│       ├── deaths/                     ❌ missing
│       ├── vaccination/                ❌ missing
│       ├── antenatal/                  ❌ missing
│       ├── postnatal/                  ❌ missing
│       ├── child-health/               ❌ missing
│       ├── family-planning/            ❌ missing
│       ├── hiv/                        ❌ missing
│       ├── tuberculosis/               ❌ missing
│       └── malaria/                    ❌ missing
```

---

# PART 7 — COMPLETE FRONTEND FOLDER STRUCTURE

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx              ✅ done
│   │   ├── register/page.tsx           ✅ done (needs wire to API)
│   │   ├── forgot-password/page.tsx    ✅ done (needs wire to API)
│   │   ├── reset-password/page.tsx     ✅ done (needs wire to API)
│   │   ├── verify-2fa/page.tsx         ✅ done (needs MFA backend)
│   │   └── layout.tsx                  ✅ done
│   ├── (dashboard)/
│   │   └── layout.tsx + page.tsx       ✅ done
│   └── page.tsx (public home)          ✅ done
├── components/
│   ├── DashboardApp.tsx                ✅ done (real API hydration)
│   ├── dashboard/                      ✅ 19 role dashboards done
│   ├── modules/                        (31 modules)
│   │   ├── ConsultationModule.tsx      ✅ done
│   │   ├── PharmacyModule.tsx          ✅ done
│   │   ├── LaboratoryModule.tsx        ✅ done
│   │   ├── BillingModule.tsx           ✅ done
│   │   ├── InsuranceModule.tsx         ✅ done
│   │   ├── InventoryModule.tsx         ✅ done
│   │   ├── RadiologyModule.tsx         ✅ done
│   │   ├── NotificationsModule.tsx     ✅ done
│   │   ├── ReportsModule.tsx           ✅ done
│   │   ├── AuditModule.tsx             ✅ done
│   │   ├── InpatientModule.tsx         ⚠️ UI exists, no API wire
│   │   ├── NursingModule.tsx           ⚠️ UI exists, no API wire
│   │   ├── HRModule.tsx                ⚠️ UI exists, no API wire
│   │   ├── AmbulanceModule.tsx         ⚠️ UI exists, no API wire
│   │   ├── BloodBankModule.tsx         ⚠️ UI exists, no API wire
│   │   ├── MortuaryModule.tsx          ⚠️ UI exists, no API wire
│   │   ├── QualityModule.tsx           ⚠️ UI exists, no API wire
│   │   ├── SurveillanceModule.tsx      ⚠️ UI exists, no API wire
│   │   ├── AIModule.tsx                ⚠️ UI exists, all hardcoded
│   │   ├── TelemedicineModule.tsx      ⚠️ UI exists, no WebRTC
│   │   ├── PatientPortal.tsx           ⚠️ UI exists, no API wire
│   │   └── SettingsModule.tsx          ⚠️ UI exists, no API wire
│   └── registries/                     ❌ all missing
│       ├── BirthRegistration.tsx
│       ├── DeathRegistration.tsx
│       ├── VaccinationCard.tsx
│       ├── ANCVisitForm.tsx
│       ├── PNCVisitForm.tsx
│       ├── ChildGrowthChart.tsx
│       ├── FamilyPlanningCard.tsx
│       ├── HIVRegister.tsx
│       ├── TBRegister.tsx
│       └── MalariaReport.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts                   ✅ done
│   │   └── hms.ts                      ✅ done (needs registry endpoints)
│   ├── store.ts                        ✅ done
│   ├── auth.ts                         ✅ done
│   └── data.ts                         ✅ done
└── types/
    └── hms.ts                          ✅ done (needs registry types added)
```

---

---

# PART 8 — DATABASE TABLES STILL NEEDED

All tables below must be added to `backend/src/database/schema.js`:

```sql
-- Inpatient
beds
admissions
discharge_summaries
ward_rounds

-- Nursing
triage_assessments
medication_administration
shift_handovers
patient_consents
fall_risk_assessments

-- HR
staff_attendance
leave_requests
payroll_records
staff_training
staff_credentials

-- Ambulance
ambulances
dispatches
ambulance_handovers
vehicle_maintenance

-- Blood Bank
blood_donors
blood_units
crossmatch_requests
transfusions

-- Mortuary
mortuary_records
death_certificates
body_releases

-- Quality
clinical_audits
patient_safety_incidents
capa_records
raaqh_checklist
infection_control_records
satisfaction_surveys

-- Surveillance
disease_cases
surveillance_reports
outbreak_alerts

-- Registries
birth_registrations
death_registrations  (extends mortuary)
pregnancies
anc_visits
postnatal_records
pnc_visits
vaccine_catalogue
immunization_records
vaccine_stock
aefi_reports
family_planning_clients
fp_visits
growth_records
child_interventions
developmental_milestones
hiv_tests
art_patients
art_visits
drug_pickups
tb_patients
tb_dot_visits
tb_contacts
malaria_cases
malaria_treatments
itn_distribution

-- Telemedicine
telemedicine_sessions

-- AI / Analytics
ai_cds_requests
ai_drug_checks
```

---

# PART 9 — COMPLETE ROLE LIST & WHAT EACH CAN ACCESS

## New roles to add for registries:

| New Role | Modules |
|----------|---------|
| midwife | nursing, antenatal, postnatal, births, child-health, vaccination |
| community-health-worker | vaccination, antenatal, child-health, family-planning, surveillance |
| nutrition-officer | child-health, reports, surveillance |
| hiv-counsellor | hiv, patients, notifications |
| tb-officer | tuberculosis, laboratory, patients, reports |
| epidemiologist | surveillance, reports, interoperability |
| biomedical-engineer | assets, inventory, reports |
| records-officer | patients, consultations, reports, audit |

---

# PART 10 — MOBILE APP (React Native / Expo)

The `/app` folder has 69 scaffold files. These screens need real implementation:

## Phase 1 — Most urgent for field workers:
```
LoginScreen                 — real JWT auth
DashboardScreen             — KPIs from API
PatientListScreen           — search by NID/MRN
PatientDetailScreen         — full patient summary
AppointmentBookingScreen    — book appointment
VaccinationScreen           — record vaccine given (offline-first)
BirthRegistrationScreen     — register birth (offline-first)
VitalsEntryScreen           — record vitals for nurse
LabResultsScreen            — view lab results
NotificationsScreen         — real-time alerts
```

## Offline-first requirement:
Community Health Workers (CHWs) operate in areas with poor connectivity.
- Use AsyncStorage / SQLite for offline queue
- Sync when connectivity restored
- Conflict resolution: server wins on merge

## Push notifications:
```bash
npm install expo-notifications
```
Critical lab results, appointment reminders, outbreak alerts.

---

# PART 11 — COMPLETE BUILD PRIORITY ORDER

## Sprint 1 (Build now — core clinical):
1. Inpatient + Beds backend routes + DB tables
2. Nursing triage + MAR backend routes
3. requireModule() added to all routes
4. WebSocket server (Socket.IO)
5. Discharge workflow (complete patient journey)

## Sprint 2 (Complete the journey):
6. SMS via Africa's Talking (appointment reminders, critical alerts)
7. Email via Nodemailer (password reset, receipts)
8. Patient Portal backend routes
9. HR module backend routes
10. Emergency registration (TEMP-MRN)

## Sprint 3 (Rwanda registries):
11. Birth Registration + death certificates
12. Vaccination Registry + EPI schedule seed
13. ANC Register
14. PNC Register

## Sprint 4 (Public health programs):
15. Child Health + growth charts
16. Family Planning Register
17. HIV/ART Register
18. TB Register
19. Malaria Surveillance

## Sprint 5 (Advanced features):
20. AI Clinical Decision Support (OpenAI integration)
21. AI Drug Interaction Checker
22. FHIR R4 export endpoints
23. Quality Management backend
24. Disease Surveillance + MOH IDSR reports
25. Ambulance dispatch + GPS

## Sprint 6 (Mobile + production):
26. React Native app — 10 key screens
27. Offline sync for CHWs
28. MFA (TOTP)
29. PDF generation (receipts, certificates, cards)
30. Full MOH HMIS report automation

---

# PART 12 — TECHNOLOGY STACK (COMPLETE)

| Layer | Technology | Status |
|-------|-----------|--------|
| Frontend | Next.js 15, React 19, TypeScript, Zustand, Recharts | ✅ Running |
| Backend | Node.js v22, Express 5, PostgreSQL 16 | ✅ Running |
| Database | PostgreSQL 16 (Docker port 5433) | ✅ Running |
| Cache | Redis 7 (Docker port 6380) | ✅ Running |
| Real-time | Socket.IO | ❌ Not installed |
| SMS | Africa's Talking API | ❌ Not installed |
| Email | Nodemailer | ❌ Not installed |
| PDF Generation | pdfkit or puppeteer | ❌ Not installed |
| AI/LLM | OpenAI GPT-4o + Whisper | ❌ Not installed |
| Mobile | React Native + Expo | ⚠️ Scaffold only |
| Auth (MFA) | otplib + qrcode | ❌ Not installed |
| FHIR | @medplum/fhirtypes | ❌ Not installed |
| Process Manager | PM2 | ✅ Running on server |
| CI/CD | GitHub Actions | ✅ Configured |
| Cloud | Azure VM + NSG | ✅ Running |
| Monitoring | PM2 + (Grafana planned) | ⚠️ Partial |

---

# PART 13 — API ENDPOINT COMPLETE LIST (TARGET STATE)

```
Auth:          /api/auth/*          (6 routes)       ✅
Users:         /api/users/*         (6 routes)       ✅
Patients:      /api/patients/*      (7 routes)       ✅
Appointments:  /api/appointments/*  (8 routes)       ✅
Medical Records:/api/medical-records/* (8 routes)    ✅
Laboratory:    /api/laboratory/*    (7 routes)       ✅
Pharmacy:      /api/pharmacy/*      (7 routes)       ✅
Billing:       /api/billing/*       (5 routes)       ✅
Insurance:     /api/insurance/*     (5 routes)       ✅
Inventory:     /api/inventory/*     (10 routes)      ✅
Radiology:     /api/radiology/*     (4 routes)       ✅
Notifications: /api/notifications/* (4 routes)       ✅
Reports:       /api/reports/*       (5 routes)       ✅
Dashboard:     /api/dashboard/*     (2 routes)       ✅
Inpatient:     /api/inpatient/*     (8 routes)       ❌
Nursing:       /api/nursing/*       (9 routes)       ❌
HR:            /api/hr/*            (12 routes)      ❌
Ambulance:     /api/ambulance/*     (8 routes)       ❌
Blood Bank:    /api/blood-bank/*    (7 routes)       ❌
Mortuary:      /api/mortuary/*      (6 routes)       ❌
Quality:       /api/quality/*       (12 routes)      ❌
Surveillance:  /api/surveillance/*  (6 routes)       ❌
Portal:        /api/portal/*        (11 routes)      ❌
Telemedicine:  /api/telemedicine/*  (5 routes)       ❌
AI:            /api/ai/*            (7 routes)       ❌
Settings:      /api/settings/*      (4 routes)       ❌
Registry/Births:        /api/registry/births/*       ❌
Registry/Deaths:        /api/registry/deaths/*       ❌
Vaccination:            /api/vaccines/*              ❌
ANC:                    /api/anc/*                   ❌
Postnatal:              /api/postnatal/*             ❌
Child Health:           /api/child-health/*          ❌
Family Planning:        /api/family-planning/*       ❌
HIV/ART:                /api/hiv/*                   ❌
Tuberculosis:           /api/tb/*                    ❌
Malaria:                /api/malaria/*               ❌
```

**Total routes built: ~90 of ~300 planned**

---

# SUMMARY TABLE

| Area | Status |
|------|--------|
| Authentication + JWT | ✅ Complete |
| Patient Management | ✅ Complete |
| Appointments + Queue | ✅ Complete |
| EMR / SOAP Notes | ✅ Complete |
| Laboratory | ✅ Complete |
| Pharmacy | ✅ Complete |
| Billing + Payments | ✅ Complete |
| Insurance Claims | ✅ Complete |
| Inventory + Procurement | ✅ Complete |
| Radiology | ✅ Complete |
| Notifications (in-app) | ✅ Complete |
| Reports + KPIs | ✅ Complete |
| All 31 Frontend UIs | ✅ Complete (demo data) |
| All 19 Role Dashboards | ✅ Complete |
| RBAC Enforcement | ⚠️ Partial (fix requireModule) |
| Inpatient + Beds | ❌ Missing |
| Nursing + Triage | ❌ Missing |
| Human Resources | ❌ Missing |
| Ambulance | ❌ Missing |
| Blood Bank | ❌ Missing |
| Mortuary | ❌ Missing |
| Quality Management | ❌ Missing |
| Disease Surveillance | ❌ Missing |
| Patient Portal API | ❌ Missing |
| Telemedicine | ❌ Missing |
| Real-time (WebSocket) | ❌ Missing |
| SMS / Email delivery | ❌ Missing |
| MFA (TOTP) | ❌ Missing |
| PDF Generation | ❌ Missing |
| Birth Registration | ❌ Missing |
| Death Registration | ❌ Missing |
| Vaccination Registry | ❌ Missing |
| ANC Register | ❌ Missing |
| Postnatal Register | ❌ Missing |
| Child Health Register | ❌ Missing |
| Family Planning | ❌ Missing |
| HIV/ART Register | ❌ Missing |
| TB Register | ❌ Missing |
| Malaria Surveillance | ❌ Missing |
| AI Clinical Decision Support | ❌ Missing |
| Mobile App (React Native) | ❌ Missing |
| FHIR R4 Interoperability | ❌ Missing |

---

*ARTIC Health Companion — Built for Rwanda. Ready for Africa.*
*This specification is the single source of truth for all remaining development.*
*Last updated: July 2026*
