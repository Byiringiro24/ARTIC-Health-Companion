# ARTIC HMS — Full Technical Overview
# Architecture, technologies, and how everything is built

---

## Architecture — The Three Layers

```
┌─────────────────────────────────────────┐
│  FRONTEND — Next.js 15 + React 19        │
│  Port 3001 (server) / 3000 (local)       │
│  Role-based SPA + Next.js App Router     │
└────────────────┬────────────────────────┘
                 │ HTTP REST + WebSocket
┌────────────────▼────────────────────────┐
│  BACKEND — Node.js v22 + Express 5       │
│  Port 4001                               │
│  JWT Auth + RBAC + Socket.IO             │
└───────┬─────────────┬───────────────────┘
        │             │
┌───────▼──────┐ ┌────▼──────────────┐
│ PostgreSQL 16 │ │ Redis 7           │
│ Port 5433     │ │ Port 6380         │
│ (Docker)      │ │ (Docker)          │
└───────────────┘ └───────────────────┘
```

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend Framework | Next.js | 15.5.20 | Pages, routing, SSR |
| UI Library | React | 19.2.7 | Components |
| Language | TypeScript | 5.7.2 | Type safety |
| State Management | Zustand | 4.5.5 | Client-side state |
| Charts | Recharts | 2.15.0 | KPI dashboards |
| Icons | Lucide React | 0.468.0 | All icons |
| WebSocket Client | socket.io-client | 4.8.3 | Real-time updates |
| Backend Runtime | Node.js | v22.23.1 | JavaScript server |
| Backend Framework | Express | 5.1.0 | HTTP API |
| Authentication | jsonwebtoken | 9.0.2 | JWT tokens |
| Password Hashing | bcryptjs | 2.4.3 | bcrypt 12 rounds |
| Database | PostgreSQL | 16 | Primary data store |
| DB Driver | pg (node-postgres) | 8.22.0 | PostgreSQL queries |
| Cache | Redis | 7 | Rate limit, sessions |
| Real-time | Socket.IO | latest | WebSocket server |
| Email | Nodemailer | latest | SMTP email |
| SMS | Africa's Talking | (installed when key added) | Rwanda SMS |
| Process Manager | PM2 | latest | Production process |
| Container | Docker | latest | DB containers |
| Cloud | Azure VM | — | Ubuntu server |
| Firewall | Azure NSG + UFW | — | Port security |
| CI/CD | GitHub Actions | — | Deploy pipeline |

---

## Backend Architecture

### Entry Point Flow
```
src/index.js
  → runMigrations()    creates all tables (idempotent)
  → seed()             inserts demo data (runs once)
  → createServer(app)  Express HTTP server
  → initSocket()       Socket.IO WebSocket server
  → listen(4001)       starts listening
```

### Module Structure
Every module follows the same pattern:
```
modules/
  [module-name]/
    [module].service.js    ← business logic, DB queries
    [module].controller.js ← HTTP layer, calls service
    [module].routes.js     ← Express Router, auth middleware
```

### Authentication Flow
```
POST /api/auth/login
  → bcrypt.compare(password, hash)
  → issueAccessToken()   15min JWT (HS256)
  → issueRefreshToken()  UUID + SHA-256 hash stored in DB
  → return { accessToken, refreshToken, user, modules }

Subsequent requests:
  Authorization: Bearer <accessToken>
  → authenticate middleware
  → verifyAccessToken() → throws if expired
  → fetch live user from DB (catches deactivated accounts)
  → attach req.user + req.user.modules
  → requireModule("pharmacy") → HTTP 403 if not in role
```

### RBAC Enforcement
```
Role → role_modules table → array of module keys
Each route: router.use(requireModule("billing"))
→ checks req.user.modules.includes("billing")
→ HTTP 403 + audit log entry if denied
```

### WebSocket Rooms
```
hospital:{hospitalId}  → all staff in a hospital
user:{userId}          → private to one user
dept:{departmentId}    → department staff
role:{roleName}        → e.g. role:doctor (all doctors)

Events emitted:
  critical_alert      → to user:{doctorId}
  queue_update        → to hospital:{id}
  new_prescription    → to role:pharmacist
  bed_update          → to hospital:{id}
  emergency_alert     → to role:doctor + role:nurse
```

---

## Database Schema (PostgreSQL)

### Core Tables
| Table | Purpose |
|-------|---------|
| tenants | Multi-tenancy root |
| hospitals | Facility records |
| departments | Clinical/admin/support departments |
| roles | 19 system roles |
| role_modules | Module access per role |
| users | Staff accounts (bcrypt, MFA fields, lockout) |
| refresh_tokens | JWT rotation (SHA-256 hashed) |
| audit_logs | Immutable action trail |

### Clinical Tables
| Table | Purpose |
|-------|---------|
| patients | Demographics, NID, insurance, allergies |
| appointments | Scheduling, queue, triage |
| vitals | Vital signs recordings |
| clinical_notes | SOAP notes (signed/locked) |
| lab_requests | Specimen workflow, results |
| radiology_orders | Imaging orders and reports |
| prescriptions | e-prescriptions |
| drug_catalogue | Drug master |
| drug_inventory | Stock by batch (FEFO) |
| dispensing_log | Dispensing records |

### Financial Tables
| Table | Purpose |
|-------|---------|
| invoices | Patient invoices |
| invoice_items | Line items |
| payments | Payment records |
| insurance_claims | RSSB/Mutuelle claims |
| service_tariffs | Pricing catalogue |

### Operations Tables
| Table | Purpose |
|-------|---------|
| beds | Ward bed map |
| admissions | Inpatient admissions |
| discharge_summaries | Discharge documents |
| inventory_items | Store inventory |
| purchase_requests | Procurement workflow |
| notifications | In-app notifications |

### Registry Tables
| Table | Purpose |
|-------|---------|
| birth_registrations | Birth certificates |
| death_registrations | Death certificates |
| vaccine_catalogue | Rwanda EPI schedule |
| immunization_records | Vaccination history |
| pregnancies | ANC pregnancies |
| anc_visits | ANC visit records |
| family_planning_clients | FP program |

---

## Frontend Architecture

### Routing Structure
```
app/
  (auth)/          — login, register, forgot-password
  (dashboard)/     — all role-based pages
    doctor/        — doctor workspace
    nurse/         — nursing workspace
    pharmacist/    — pharmacy workspace
    laboratory/    — lab workspace
    patient-portal/ — patient self-service
    accountant/    — finance
    receptionist/  — front desk
    ...
  (public)/        — landing page, about, services
  dashboard/       — redirect to SPA (DashboardApp)
```

### State Management (Zustand)
```typescript
usePatientStore()      — patients list + fetch + create
useAppointmentStore()  — appointments + check-in
useLabStore()          — lab requests + results
useBillingStore()      — invoices + payments
useInventoryStore()    — drug inventory
useNotificationStore() — notifications + unread count
useKPIStore()          — live KPI dashboard data
useToast()             — toast notifications
```

### API Client
```typescript
// frontend/lib/api/hms.ts
patientsApi.list()
appointmentsApi.create()
labApi.enterResult()
pharmacyApi.dispense()
billingApi.recordPayment()
inpatientApi.admit()
nursingApi.triage()
vaccinationApi.administer()
birthsApi.register()
```

---

## Security Implementation

| Feature | Implementation |
|---------|---------------|
| JWT Access Token | 15 min expiry, HS256, issuer/audience validation |
| JWT Refresh Token | 7 day, single-use rotation, SHA-256 hashed in DB |
| Password Storage | bcrypt, 12 rounds, never in plaintext |
| Account Lockout | 5 failed attempts → 10 min lock |
| Audit Trail | Every request logged: user, IP, module, action, result |
| Rate Limiting | 200 req/min global, 10 req/min auth endpoints |
| CORS | Whitelist of allowed origins only |
| RBAC | Module-level guard on every route |
| HTTPS | Azure NSG + Nginx (when domain is added) |

---

## API Endpoints (Complete List)

### Working now (v2.0.0)
```
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/change-password

GET/POST/PATCH/DELETE  /api/users
GET/POST/PATCH/DELETE  /api/patients
GET/POST/PATCH         /api/appointments + /queue + /check-in
GET/POST/PATCH         /api/medical-records/vitals + /notes + /summary
GET/POST/PATCH         /api/laboratory + /collect + /receive + /result + /validate
GET/POST/PATCH         /api/pharmacy/prescriptions + /inventory + /dispense
GET/POST               /api/billing/invoices + /payment + /reconciliation
GET/POST/PATCH         /api/insurance + /submit + /status
GET/POST/PATCH         /api/inventory + /purchase-requests
GET/POST/PATCH         /api/radiology + /report
GET/PATCH              /api/notifications + /read
GET                    /api/reports/kpis + /revenue + /moh + /audit
GET/POST/PATCH         /api/inpatient/beds + /admissions + /admit + /discharge + /transfer
POST/GET               /api/nursing/triage + /mar + /handover + /consent
GET/POST               /api/registry/vaccinations + /administer + /due-today
GET/POST               /api/registry/births
GET/POST               /api/registry/deaths
GET                    /api/dashboard/kpis + /modules
```

---

## Deployment Stack

```
Azure VM (Ubuntu)
  └── UFW Firewall (ports 3001, 4001)
  └── Azure NSG (ports 3001, 4001)
  └── PM2 (4 processes)
       ├── vms-backend   (port 4000)  ← existing VMS
       ├── vms-frontend  (port 3000)  ← existing VMS
       ├── artic-hms-backend  (port 4001)  ← HMS
       └── artic-hms-frontend (port 3001)  ← HMS
  └── Docker
       ├── artic-hms-postgres  (port 5433)
       └── artic-hms-redis     (port 6380)
```
