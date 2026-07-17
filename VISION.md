# ARTIC Health Companion — System Vision
# This is the authoritative source of what this system must become.

See: **HMS Master Document.md** for the complete specification.

## What we are building

A fully operational hospital management system where:

1. **Patients** can register online (or be registered at the hospital), get a permanent MRN,
   book appointments, view their own records, pay bills, and do telemedicine.

2. **Every staff role** sees exactly their modules — no more, no less.
   Login as a doctor → get doctor modules.
   Login as a cashier → get billing only.

3. **The patient journey is automated end to end:**
   - Registration → MRN generated, QR card printed
   - Appointment → SMS reminder sent automatically
   - Triage → vitals recorded, critical values alert the doctor instantly
   - Consultation → SOAP note, ICD code, prescription to pharmacy in 10 seconds
   - Lab order → specimen tracked by barcode, critical result SMS in 2 minutes
   - Billing → invoice auto-generated from every service, insurance split calculated
   - Payment → MTN MoMo callback marks invoice paid and issues receipt
   - Discharge → summary generated, follow-up booked, bed freed

4. **User creation is hierarchical:**
   - Super Admin creates Hospital Manager
   - Hospital Manager creates all staff
   - HR Manager creates staff (if given permission)
   - Patients self-register or are registered by receptionist/doctor

5. **AI assists at every step:**
   - Doctor gets diagnosis suggestions and drug interaction alerts
   - Pharmacist gets interaction checks before dispensing
   - Admin gets bed occupancy and revenue forecasts
   - Public website has an AI health assistant

## Current State (Phase 1 — Live on server)
- Frontend: Next.js dashboard with role-based navigation
- Backend: Simple Node.js HTTP server with in-memory demo data
- 18 demo user accounts, 5 demo patients, sample invoices and lab results
- Running at: http://172.209.217.176:3001

## What needs to be built (see TODO.md for full list)
Phases 6–20: Real database operations, appointment scheduling, EMR, pharmacy,
lab, billing, insurance, notifications, AI, mobile app, and full deployment.

## Non-negotiables
- NID is the master key — no duplicate patient records ever
- Every action is logged in the audit trail
- No patient ever sees another patient's data
- Critical lab values must alert the doctor within 2 minutes
- Insurance split must be calculated automatically on every billable service
- Rwanda MOH HMIS reports must be generated correctly
