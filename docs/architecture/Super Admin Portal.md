# Super Admin — Complete Reference
# What Super Admin Controls, Sees, and Must NEVER See

---

## Role Definition

Super Admin = **System Operator** — NOT a clinical user.

They control the platform infrastructure. They do NOT provide care, cannot see individual patient data, and are not a medical professional.

---

## What Super Admin CAN Do ✅

| Area | Actions |
|------|---------|
| Feature Flags | Enable/disable any feature, set tier requirements, manage locks |
| Hospital Management | Create hospitals, assign subscription tiers, bulk-configure features |
| Access Requests | Review and approve/deny feature access requests from hospitals |
| Subscription Billing | Create invoices, track payments, manage subscription tiers |
| System Settings | Configure security policies, trial periods, feature defaults |
| Technical Audit | View technical audit logs (user, action, IP — NOT clinical content) |

---

## What Super Admin CAN See ✅ (Aggregated Only)

| Data | Example |
|------|---------|
| Total patient count | "1,245 patients registered at Hospital X" |
| Hospital-level stats | "47 active hospitals, 12,847 total users" |
| Feature usage | "Health Literacy AI used 8,200 times this month" |
| System performance | "API response 120ms, 99.98% uptime" |
| Subscription revenue | "Total MRR: $124,500" |
| Pending requests | "12 pending feature access requests" |
| Technical audit logs | "User login at 14:30 from IP 192.168.1.1" |

---

## What Super Admin MUST NEVER See ❌

| Prohibited Data | Why | Rwanda Law |
|----------------|-----|-----------|
| Individual patient names | Personal health information | DPL 2021, Art. 4 |
| Diagnoses / medical conditions | Protected health data | DPL 2021, Art. 8 |
| Lab results | Clinical patient data | MOH Guidelines |
| Doctor's SOAP notes | Doctor-patient confidentiality | Medical Ethics |
| Prescriptions (individual) | Reveals health status | DPL 2021 |
| Patient billing details | Personal financial data | DPL 2021, Art. 12 |
| Patient NID / National ID | Identity data | DPL 2021, Art. 6 |
| Conversations/messages | Private clinical communication | DPL 2021 |
| Staff salaries / HR records | Hospital HR data | Labor Law |
| Individual staff profiles | Private employment data | DPL 2021 |

---

## Technical Enforcement

### Backend Privacy Guard (`middleware/privacyGuard.js`)
Applied globally to all `/api/*` routes. When `role = system-admin`:

```
BLOCKED routes:
  /api/patients/:id             → 403 Forbidden
  /api/medical-records/*        → 403 Forbidden
  /api/laboratory/*             → 403 Forbidden
  /api/pharmacy/prescriptions/* → 403 Forbidden
  /api/nursing/*                → 403 Forbidden
  /api/billing/invoices/:id     → 403 Forbidden
  /api/insurance/*              → 403 Forbidden
  /api/radiology/*              → 403 Forbidden

ALLOWED routes:
  /api/super-admin/*   → Full access (feature flags, hospitals)
  /api/reports/kpis    → Aggregated KPIs
  /api/dashboard/*     → Aggregated dashboard stats
  /api/users/*         → User counts (not clinical data)
  /api/auth/*          → Authentication
```

### What Super Admin Gets on `/api/patients` (GET)
Instead of patient list, returns:
```json
{
  "note": "Aggregated data only — Super Admin cannot see individual patient records per Rwanda Data Protection Law",
  "totalPatients": 1245,
  "byHospital": [
    { "hospital_name": "Kigali District Hospital", "patient_count": 1245 }
  ]
}
```

### Audit Trail
Every blocked attempt is logged in `audit_logs`:
```
action: ACCESS_DENIED
module: privacy-guard
result: denied
reason: Super Admin attempted to access clinical data
```

---

## Data Access Matrix

| Data | Super Admin | Hospital Manager | Doctor | Nurse | Patient |
|------|-------------|-----------------|--------|-------|---------|
| Patient count (aggregated) | ✅ | ✅ | ✅ | ✅ | ❌ |
| Individual patient record | ❌ | ❌ | ✅ | ✅ | ✅ own |
| Clinical notes | ❌ | ❌ | ✅ | ✅ | ✅ own |
| Lab results | ❌ | ❌ | ✅ | ✅ | ✅ own |
| Prescriptions | ❌ | ❌ | ✅ | ✅ | ✅ own |
| Patient billing (individual) | ❌ | ❌ | ❌ | ❌ | ✅ own |
| Hospital revenue (total) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Feature flags | ✅ | ❌ | ❌ | ❌ | ❌ |
| Subscription status | ✅ | ✅ | ❌ | ❌ | ❌ |
| Technical audit logs | ✅ | ✅ own hospital | ❌ | ❌ | ❌ |
| Staff count per hospital | ✅ | ✅ | ❌ | ❌ | ❌ |
| Individual staff profile | ❌ | ✅ own hospital | ❌ | ❌ | ❌ |
| System settings | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Legal Basis (Rwanda)

| Law | Requirement |
|-----|-------------|
| Rwanda Data Protection Law — Law No 058/2021 | Personal data only accessible to authorised personnel with legitimate purpose |
| MOH Clinical Guidelines | Patient records accessible only to clinical staff providing care |
| Medical Ethics (RMC) | Doctor-patient confidentiality binding on all parties |
| RAAQH Standards | Patient safety and privacy are accreditation requirements |

---

## Violation Consequences

| Violation | Consequence |
|-----------|-------------|
| Accessing patient clinical data | Immediate suspension + legal investigation |
| Viewing individual patient records | Criminal prosecution under DPL 2021 |
| Sharing patient data | Criminal prosecution, civil liability |
| Accidental exposure | Mandatory incident report + retraining |

---

## Super Admin Portal URL

`http://172.209.217.176:3001/dashboard` → login as `admin@artic.health`

The portal shows only system-level data. No clinical patient data ever appears.
