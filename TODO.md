# 📋 ARTIC Health Companion — TODO: Remaining Phases

> This document tracks what has NOT yet been implemented.
> Each phase is production-ready before moving to the next.
> Currently completed: Phase 1 + 2 + 3 (Foundation, Database, Authentication)

---

## 🔲 What Has to Be Done — Phase 4: Users (Complete)

**Status:** Partial — basic CRUD done. The following is still needed:

- [ ] User profile photo upload (S3/MinIO)
- [ ] Password reset via email (forgot-password flow + email service)
- [ ] Admin: bulk user import from CSV
- [ ] User activity timeline (all actions by user)
- [ ] Two-factor authentication (TOTP setup + verify endpoints)
- [ ] Device management (list active sessions, revoke by device)
- [ ] Email verification on account creation
- [ ] Staff credential tracking (license expiry alerts)
- [ ] Payroll integration fields (bank account, salary grade)

---

## 🔲 What Has to Be Done — Phase 5: Patients (Complete)

**Status:** Partial — basic CRUD done. The following is still needed:

- [ ] Patient photo upload
- [ ] NID/NIDA real-time verification integration (Rwanda NIDA API)
- [ ] Patient QR code generation (PDF card printable)
- [ ] Patient merge (deduplicate records)
- [ ] Bulk patient import from CSV/Excel
- [ ] Patient document attachments (ID scan, consent forms)
- [ ] Patient vitals history endpoint
- [ ] Patient visit history endpoint (all past consultations)
- [ ] Patient timeline (chronological events: visits, labs, billing)
- [ ] Patient portal access (self-service view of own records)
- [ ] Patient consent management

---

## 🔲 What Has to Be Done — Phase 6: Appointments

- [ ] Appointment service (`appointments.service.js`)
- [ ] Appointment controller + routes (`/api/appointments`)
- [ ] Doctor availability/schedule endpoint
- [ ] Queue management endpoints
- [ ] Check-in endpoint (PUT /api/appointments/:id/check-in)
- [ ] Appointment status transitions (scheduled → checked-in → in-progress → completed)
- [ ] Walk-in appointment creation
- [ ] Recurring appointment series
- [ ] Appointment reminder service (SMS/email via background job)
- [ ] Calendar view data endpoint (by doctor, by department, by date)
- [ ] No-show auto-marking (background job)

---

## 🔲 What Has to Be Done — Phase 7: Medical Records (EMR)

- [ ] Medical records service + controller + routes (`/api/medical-records`)
- [ ] SOAP note creation and signed locking
- [ ] Vitals recording endpoint
- [ ] ICD-10/11 code search endpoint
- [ ] Problem list (active, resolved, inactive)
- [ ] Allergy management endpoints
- [ ] Diagnosis history
- [ ] Discharge summary generation
- [ ] Medical record PDF export
- [ ] FHIR R4 Patient/Encounter resource endpoints
- [ ] Clinical note templates (general, ANC, emergency, etc.)

---

## 🔲 What Has to Be Done — Phase 8: Clinical Modules

### 8a — Doctor Workspace
- [ ] Consultation workflow API
- [ ] Lab/radiology order creation from consultation
- [ ] Prescription creation from consultation
- [ ] Referral management
- [ ] Admission order
- [ ] Doctor schedule management

### 8b — Nursing Module
- [ ] Nursing notes CRUD
- [ ] Medication Administration Record (MAR) API
- [ ] Shift handover record
- [ ] Ward round notes
- [ ] Fall risk and pressure ulcer assessments

### 8c — Emergency / Triage
- [ ] Emergency patient registration
- [ ] Triage assessment endpoint
- [ ] Emergency queue prioritisation
- [ ] Critical alert broadcasting (WebSocket)

---

## 🔲 What Has to Be Done — Phase 9: Laboratory

- [ ] Lab test catalogue (test types, reference ranges by age/sex)
- [ ] Lab request creation endpoint
- [ ] Specimen collection + barcode assignment
- [ ] Result entry with critical value detection
- [ ] Result validation workflow (technician → senior verification)
- [ ] Lab report PDF generation
- [ ] Quality control records
- [ ] Critical value alert (WebSocket notification to ordering doctor)
- [ ] Turnaround time monitoring
- [ ] HL7 v2 ORU message parsing (instrument interface)

---

## 🔲 What Has to Be Done — Phase 10: Radiology

- [ ] Imaging order endpoint
- [ ] Radiology report creation
- [ ] DICOM worklist (stub + interface)
- [ ] Report signing workflow
- [ ] Image attachment storage (S3)
- [ ] Result notification to requesting doctor

---

## 🔲 What Has to Be Done — Phase 11: Pharmacy

- [ ] Drug catalogue endpoint (search, add, update)
- [ ] Inventory receiving (batch, expiry, FEFO tracking)
- [ ] Prescription dispensing endpoint (stock deduction)
- [ ] Drug interaction check endpoint
- [ ] Controlled substance log
- [ ] Expiry alert background job
- [ ] Low stock alert background job
- [ ] Pharmacy dispensing queue (real-time WebSocket)

---

## 🔲 What Has to Be Done — Phase 12: Billing

- [ ] Service tariff catalogue
- [ ] Invoice auto-generation on service rendered
- [ ] Payment recording (cash, mobile money, bank, insurance)
- [ ] Insurance co-payment calculation
- [ ] Receipt PDF generation
- [ ] Daily cash reconciliation report
- [ ] Revenue analytics endpoints
- [ ] Mobile money callback handler (MTN MoMo, Airtel)
- [ ] Accounts receivable aging report

---

## 🔲 What Has to Be Done — Phase 13: Insurance

- [ ] Insurance provider catalogue
- [ ] Eligibility verification endpoint (RSSB/Mutuelle stub)
- [ ] Claim submission endpoint
- [ ] Claim status tracking
- [ ] Claim rejection handling and appeal
- [ ] Insurance claim batch export
- [ ] Preauthorisation management

---

## 🔲 What Has to Be Done — Phase 14: Inventory & Procurement

- [ ] Inventory item catalogue CRUD
- [ ] Stock batch receiving
- [ ] Stock issue to department
- [ ] Stock transfer between locations
- [ ] Stock count / reconciliation
- [ ] Reorder alert background job
- [ ] Purchase request workflow
- [ ] Purchase order management
- [ ] Goods receipt note
- [ ] Supplier management CRUD
- [ ] Tender management

---

## 🔲 What Has to Be Done — Phase 15: Workflow Engine

- [ ] Workflow definition schema (nodes, edges, conditions)
- [ ] Workflow builder API (create, version, publish, rollback)
- [ ] Workflow execution engine (state machine)
- [ ] Patient flow automation (registration → triage → doctor → lab → pharmacy → cashier)
- [ ] Configurable per-hospital workflows
- [ ] SLA monitoring and escalation
- [ ] Workflow analytics (bottleneck detection)
- [ ] Visual workflow builder frontend page (drag-and-drop)

---

## 🔲 What Has to Be Done — Phase 16: AI Platform

- [ ] AI service foundation (model router, prompt manager)
- [ ] Clinical Decision Support engine
  - Symptom-to-diagnosis suggestion (rule-based + AI)
  - Drug interaction checker (database + AI)
  - ICD-10/11 code suggestion
  - Dosage calculator
- [ ] Lab result interpretation AI
- [ ] Predictive analytics models:
  - Patient readmission risk
  - Bed occupancy forecast
  - Drug demand forecast
  - Disease outbreak early warning
- [ ] AI chat assistant (RAG on hospital knowledge base)
- [ ] Voice-to-text clinical documentation
- [ ] Medical report generation
- [ ] Explainability layer (confidence scores, reasoning)
- [ ] Human approval workflow for AI recommendations
- [ ] AI feedback loop (doctor accepts/rejects → model training signal)

---

## 🔲 What Has to Be Done — Phase 17: Reporting

- [ ] Report generation service (PDF via puppeteer/pdfkit, Excel via exceljs)
- [ ] MOH HMIS monthly report (Form A–H)
- [ ] PBF indicator report
- [ ] IDSR disease surveillance report
- [ ] Financial reports (income statement, revenue by department)
- [ ] Clinical reports (morbidity, mortality, ANC coverage)
- [ ] Scheduled report delivery (email/cron)
- [ ] Export endpoints for all modules (CSV, Excel, PDF)
- [ ] Custom report builder

---

## 🔲 What Has to Be Done — Phase 18: Notifications

- [ ] Notification service with provider abstraction
- [ ] SMS integration (Africa's Talking)
- [ ] Email integration (Nodemailer/SendGrid)
- [ ] WhatsApp Business API integration
- [ ] Real-time in-app notifications (WebSocket / Server-Sent Events)
- [ ] Push notifications (for mobile app)
- [ ] Notification templates (multilingual: EN/FR/RW)
- [ ] Notification preferences per user
- [ ] Appointment reminder scheduler (BullMQ jobs)
- [ ] Critical alert escalation (lab critical values, emergency)

---

## 🔲 What Has to Be Done — Phase 19: Mobile App

**Status:** Scaffold created (69 files). The following needs real implementation:

- [ ] Install dependencies (`npm install` in `/app`)
- [ ] Navigation setup (React Navigation stack/tab)
- [ ] Login screen with form validation
- [ ] Dashboard screen with live KPIs from API
- [ ] Patient list and detail screens
- [ ] Appointment booking screen
- [ ] Consultation screen (vitals entry, SOAP notes)
- [ ] Lab results viewer
- [ ] Pharmacy dispensing screen (for pharmacist role)
- [ ] Billing screen (invoice view, payment)
- [ ] Notifications screen
- [ ] Profile / change password screen
- [ ] Biometric authentication (expo-local-authentication)
- [ ] Offline mode (queue actions for sync)
- [ ] Push notification setup (expo-notifications)
- [ ] App Store / Play Store build configuration

---

## 🔲 What Has to Be Done — Phase 20: Deployment & DevOps

- [ ] Dockerfile for backend (multi-stage, non-root user)
- [ ] Dockerfile for frontend (Next.js standalone output)
- [ ] `docker-compose.yml` — full stack (backend + frontend + nginx)
- [ ] Nginx configuration (reverse proxy, SSL termination, gzip)
- [ ] GitHub Actions CI/CD pipeline (test → build → push to registry → deploy)
- [ ] Kubernetes manifests (deployment, service, ingress, configmap, secrets)
- [ ] Terraform infrastructure (AWS/GCP/Azure or bare metal)
- [ ] PostgreSQL migration (swap SQLite → PostgreSQL for production)
- [ ] Redis integration (session store, BullMQ queues, rate limiting)
- [ ] S3/MinIO file storage setup
- [ ] Prometheus + Grafana monitoring
- [ ] Centralised logging (ELK stack or Loki)
- [ ] Automated backups with point-in-time recovery
- [ ] SSL/TLS certificates (Let's Encrypt)
- [ ] Environment secrets management (vault or cloud secrets manager)
- [ ] Load testing and performance benchmarks

---

## 🔲 Additional Cross-Cutting Concerns (All Phases)

- [ ] WebSocket server (real-time queue updates, critical alerts, live dashboards)
- [ ] BullMQ job queues (reminders, reports, notifications, sync)
- [ ] Redis caching layer (patient lookups, drug catalogue, role permissions)
- [ ] Full-text search (PostgreSQL FTS or Elasticsearch for patient/drug search)
- [ ] Multi-language support (English, French, Kinyarwanda)
- [ ] FHIR R4 full resource implementation (Patient, Encounter, Observation, etc.)
- [ ] Rwanda NIDA NID verification real API
- [ ] RSSB insurance real API integration
- [ ] Comprehensive test suite (unit + integration + e2e)
- [ ] API documentation (Swagger/OpenAPI auto-generated)
- [ ] Frontend: complete all stub pages with real content
- [ ] Frontend: connect all pages to real API (replace demo data)
- [ ] Frontend: Tailwind CSS + shadcn/ui migration (currently custom CSS)

---

## 🏃 Recommended Next Session Order

1. **Phase 6** — Appointments (most-used after patients, needed for full flow)
2. **Phase 7** — Medical Records / EMR (clinical core)
3. **Phase 11** — Pharmacy (high daily usage)
4. **Phase 12** — Billing (revenue critical)
5. **Phase 9** — Laboratory
6. **Phase 18** — Notifications (foundation for all other phases)
7. **Phase 17** — Reporting
8. **Phase 15** — Workflow Engine
9. **Phase 16** — AI Platform
10. **Phase 20** — Deployment
