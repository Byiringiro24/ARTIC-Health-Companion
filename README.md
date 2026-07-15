# ARTIC Health Companion — Enterprise Hospital Management System

> Enterprise-grade, multi-tenant hospital management platform for Rwanda and Sub-Saharan Africa.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Overview

ARTIC Health Companion is a full-stack, production-ready HMIS covering the complete patient journey — from registration and triage through clinical consultation, pharmacy dispensing, laboratory testing, billing, and discharge — while meeting Rwanda MOH reporting requirements and HL7 FHIR interoperability standards.

**18 role-based workspaces · 30+ modules · Rwanda MOH compliant · HL7 FHIR ready**

---

## Quick Start

### Prerequisites
- Node.js ≥ 20
- npm ≥ 9

### Run Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
# Opens on http://localhost:3000
```

### Run Backend (Node.js REST API)
```bash
cd backend
npm run dev
# API on http://localhost:4000
```

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| System Admin | admin@artic.health | admin123 |
| Doctor | doctor@artic.health | doctor123 |
| Nurse | nurse@artic.health | nurse123 |
| Pharmacist | pharmacy@artic.health | pharmacy123 |
| Lab Scientist | lab@artic.health | lab123 |
| Receptionist | reception@artic.health | front123 |
| Accountant | accounts@artic.health | money123 |
| Patient | patient@artic.health | patient123 |
| Hospital Manager | manager@artic.health | manager123 |

---

## Module Architecture

Each role sees only the modules their permissions allow. All 30+ modules are built as independent React components under `frontend/components/modules/`.

| Module file | Description |
|-------------|-------------|
| `ConsultationModule.tsx` | SOAP notes, vitals, lab/imaging orders, prescriptions, CDS |
| `NursingModule.tsx` | Triage station, MAR, shift handover, ward vitals |
| `PharmacyModule.tsx` | FEFO inventory, dispensing queue, controlled substances |
| `LaboratoryModule.tsx` | Specimen workflow, result entry, QC, critical alerts |
| `RadiologyModule.tsx` | Imaging orders, DICOM/PACS, radiology reports |
| `InpatientModule.tsx` | Bed map, admission/discharge, ward management |
| `BillingModule.tsx` | Invoices, line-item detail, payment recording |
| `InsuranceModule.tsx` | Claims, eligibility verification, RSSB/Mutuelle |
| `InventoryModule.tsx` | Stock management, expiry tracking, reorder alerts |
| `ProcurementModule.tsx` | Purchase requests, suppliers, POs |
| `HRModule.tsx` | Staff directory, attendance, leave management |
| `AmbulanceModule.tsx` | Fleet status, active dispatch, GPS |
| `BloodBankModule.tsx` | Blood stock, donor records, transfusion requests |
| `MortuaryModule.tsx` | Body admission, storage, death certificates |
| `AssetsModule.tsx` | Equipment register, maintenance schedule |
| `TelemedicineModule.tsx` | WebRTC video/voice, remote prescriptions |
| `NotificationsModule.tsx` | SMS/email/WhatsApp, message templates |
| `ReportsModule.tsx` | MOH reports, PBF indicators, revenue charts |
| `SurveillanceModule.tsx` | IDSR, disease trends, outbreak monitoring |
| `InteroperabilityModule.tsx` | FHIR, NID, RSSB, HIE integrations |
| `QualityModule.tsx` | RAAQH readiness, incident register |
| `AIModule.tsx` | CDS, predictive analytics, ICD-10 assistant |
| `MultiTenantModule.tsx` | Hospital network management |
| `AuditModule.tsx` | Full audit trail with user/IP/action |
| `PatientPortal.tsx` | Self-service: appointments, results, bills |
| `SettingsModule.tsx` | Facility configuration, integrations |

---

## Technology Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5
- **Styling:** Custom CSS (no Tailwind — zero flash, fast load)
- **State:** Zustand
- **Charts:** Recharts
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js 20+ (pure stdlib — zero dependencies)
- **API:** REST, port 4000
- **Auth:** Bearer token (ID-based for demo)

---

## Project Structure

```
Hospital/
├── frontend/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Landing page
│   │   ├── login/page.tsx      # Login with 18 demo accounts
│   │   └── dashboard/page.tsx  # Main application shell
│   ├── components/
│   │   ├── DashboardApp.tsx    # App shell + inline modules (Overview, Admin, Patients, Appointments, Queue)
│   │   ├── modules/            # One file per clinical/operational module (26 files)
│   │   └── ui/                 # Shared components (Modal, Toast, DataTable, StatCard, SectionHeader)
│   ├── lib/
│   │   ├── auth.ts             # Session management
│   │   ├── data.ts             # Demo data (patients, appointments, inventory, etc.)
│   │   └── store.ts            # Zustand stores (patients, appointments, inventory, lab, billing, toast)
│   └── types/
│       └── hms.ts              # All TypeScript types and enums
├── backend/
│   └── src/
│       ├── server.js           # REST API server
│       └── data.js             # Server-side seed data
└── README.md
```

---

## Compliance

- Rwanda Ministry of Health (MOH) Guidelines
- Performance-Based Financing (PBF) indicators
- RAAQH Accreditation Standards
- Rwanda Data Protection Law (Law N° 058/2021)
- HL7 FHIR R4 (interface ready)
- ICD-10/11 coding support
- RSSB / Mutuelle insurance integration (demo)

---

## License

MIT © 2026 ARTIC Health
