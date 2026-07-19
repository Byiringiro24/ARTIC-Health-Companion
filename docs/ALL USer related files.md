Let me map out all users and their linked files across both frontend and backend.

Now I have the full picture. Here's the complete map of all 18 users and their linked files:

---

## All Users + Linked Files

### 1. 🔐 System Admin (Super Admin)
**Email:** `admin@artic.health` | **Password:** `admin123`

**Frontend:**
- `frontend/app/(dashboard)/admin/page.tsx` — Super Admin portal (all 8 tabs)
- `frontend/components/dashboard/AdminDashboard.tsx` — redirect component
- `frontend/lib/api/hms.ts` → `superAdminApi.*`

**Backend:**
- `backend/src/modules/super-admin/super-admin.service.js`
- `backend/src/modules/super-admin/super-admin.routes.js`
- `backend/src/modules/super-admin/super-admin.controller.js`
- `backend/src/middleware/privacyGuard.js` — blocks clinical data for this role

---

### 2. 🏥 Hospital Manager
**Email:** `manager@artic.health` | **Password:** `manager123`

**Frontend:**
- `frontend/app/(dashboard)/hospital-admin/page.tsx`
- `frontend/app/(dashboard)/hospital-admin/staff/`
- `frontend/app/(dashboard)/hospital-admin/departments/`
- `frontend/app/(dashboard)/hospital-admin/services/`
- `frontend/app/(dashboard)/hospital-admin/settings/`
- `frontend/components/modules/InpatientModule.tsx`
- `frontend/components/modules/BillingModule.tsx`
- `frontend/components/modules/InventoryModule.tsx`
- `frontend/components/modules/ReportsModule.tsx`
- `frontend/components/modules/HRModule.tsx`

**Backend:**
- `backend/src/modules/dashboard/`
- `backend/src/modules/reports/`
- `backend/src/modules/billing/`
- `backend/src/modules/inpatient/`
- `backend/src/modules/inventory/`
- `backend/src/modules/human-resources/`
- `backend/src/modules/users/`

---

### 3. 🩺 Doctor
**Email:** `doctor@artic.health` | **Password:** `doctor123`

**Frontend:**
- `frontend/app/(dashboard)/doctor/page.tsx`
- `frontend/app/(dashboard)/doctor/patients/` — patient list + detail
- `frontend/app/(dashboard)/doctor/appointments/`
- `frontend/app/(dashboard)/doctor/prescriptions/`
- `frontend/app/(dashboard)/doctor/lab-results/`
- `frontend/app/(dashboard)/doctor/radiology-results/`
- `frontend/app/(dashboard)/doctor/schedule/`
- `frontend/app/(dashboard)/doctor/reports/`
- `frontend/app/(dashboard)/dashboard/widgets/DoctorWidgets.tsx`
- `frontend/components/modules/ConsultationModule.tsx`
- `frontend/components/modules/RadiologyModule.tsx`
- `frontend/components/modules/TelemedicineModule.tsx`

**Backend:**
- `backend/src/modules/patients/`
- `backend/src/modules/appointments/`
- `backend/src/modules/medical-records/`
- `backend/src/modules/prescriptions/`
- `backend/src/modules/laboratory/`
- `backend/src/modules/radiology/`
- `backend/src/modules/pharmacy/`
- `backend/src/modules/telemedicine/`
- `backend/src/modules/reports/`

---

### 4. 💉 Nurse
**Email:** `nurse@artic.health` | **Password:** `nurse123`

**Frontend:**
- `frontend/app/(dashboard)/nurse/page.tsx`
- `frontend/app/(dashboard)/nurse/triage/`
- `frontend/app/(dashboard)/nurse/patients/`
- `frontend/app/(dashboard)/nurse/ward/`
- `frontend/app/(dashboard)/nurse/medications/`
- `frontend/app/(dashboard)/nurse/shift-handover/`
- `frontend/app/(dashboard)/nurse/blood-bank/`
- `frontend/app/(dashboard)/nurse/reports/`
- `frontend/components/modules/NursingModule.tsx`
- `frontend/components/modules/BloodBankModule.tsx`
- `frontend/components/modules/InpatientModule.tsx`

**Backend:**
- `backend/src/modules/nursing/` (triage, MAR, handover, consent)
- `backend/src/modules/inpatient/`
- `backend/src/modules/blood-bank/`
- `backend/src/modules/patients/`
- `backend/src/modules/notifications/`

---

### 5. 💊 Pharmacist
**Email:** `pharmacy@artic.health` | **Password:** `pharmacy123`

**Frontend:**
- `frontend/app/(dashboard)/pharmacist/page.tsx`
- `frontend/app/(dashboard)/pharmacist/prescriptions/`
- `frontend/app/(dashboard)/pharmacist/drugs/`
- `frontend/app/(dashboard)/pharmacist/inventory/`
- `frontend/app/(dashboard)/pharmacist/reports/`
- `frontend/components/modules/PharmacyModule.tsx`

**Backend:**
- `backend/src/modules/pharmacy/`
- `backend/src/modules/prescriptions/`
- `backend/src/modules/billing/`
- `backend/src/modules/reports/`

---

### 6. 🔬 Laboratory Scientist
**Email:** `lab@artic.health` | **Password:** `lab123`

**Frontend:**
- `frontend/app/(dashboard)/laboratory/page.tsx`
- `frontend/app/(dashboard)/laboratory/tests/`
- `frontend/app/(dashboard)/laboratory/quality-control/`
- `frontend/app/(dashboard)/laboratory/reports/`
- `frontend/components/modules/LaboratoryModule.tsx`

**Backend:**
- `backend/src/modules/laboratory/`
- `backend/src/modules/patients/`
- `backend/src/modules/reports/`

---

### 7. 📡 Radiology Staff
**Email:** `radiology@artic.health` | **Password:** `radio123`

**Frontend:**
- `frontend/app/(dashboard)/dashboard/` (general dashboard)
- `frontend/components/modules/RadiologyModule.tsx`

**Backend:**
- `backend/src/modules/radiology/`
- `backend/src/modules/patients/`
- `backend/src/modules/reports/`

---

### 8. 🖥️ Receptionist
**Email:** `reception@artic.health` | **Password:** `front123`

**Frontend:**
- `frontend/app/(dashboard)/receptionist/page.tsx`
- `frontend/app/(dashboard)/receptionist/patients/` — register + search
- `frontend/app/(dashboard)/receptionist/appointments/`
- `frontend/app/(dashboard)/receptionist/queue/`

**Backend:**
- `backend/src/modules/patients/`
- `backend/src/modules/appointments/`
- `backend/src/modules/billing/`

---

### 9. 💰 Accountant
**Email:** `accounts@artic.health` | **Password:** `money123`

**Frontend:**
- `frontend/app/(dashboard)/accountant/page.tsx`
- `frontend/app/(dashboard)/accountant/billing/`
- `frontend/app/(dashboard)/accountant/insurance/`
- `frontend/app/(dashboard)/accountant/payments/`
- `frontend/app/(dashboard)/accountant/reports/`
- `frontend/components/modules/BillingModule.tsx`
- `frontend/components/modules/InsuranceModule.tsx`

**Backend:**
- `backend/src/modules/billing/`
- `backend/src/modules/insurance/`
- `backend/src/modules/reports/`

---

### 10. 💵 Cashier
**Email:** `cashier@artic.health` | **Password:** `cashier123`

**Frontend:**
- `frontend/app/(dashboard)/accountant/` (shared with accountant — limited view)
- `frontend/components/modules/BillingModule.tsx`

**Backend:**
- `backend/src/modules/billing/`
- `backend/src/modules/notifications/`

---

### 11. 🏦 Insurance Officer
**Email:** `insurance@artic.health` | **Password:** `claim123`

**Frontend:**
- `frontend/app/(dashboard)/accountant/insurance/` (shared route)
- `frontend/components/modules/InsuranceModule.tsx`

**Backend:**
- `backend/src/modules/insurance/`
- `backend/src/modules/billing/`
- `backend/src/modules/reports/`

---

### 12. 📦 Store Manager
**Email:** `store@artic.health` | **Password:** `store123`

**Frontend:**
- `frontend/app/(dashboard)/store-manager/page.tsx`
- `frontend/app/(dashboard)/store-manager/inventory/`
- `frontend/app/(dashboard)/store-manager/purchase-orders/`
- `frontend/app/(dashboard)/store-manager/suppliers/`
- `frontend/components/modules/InventoryModule.tsx`
- `frontend/components/modules/ProcurementModule.tsx`
- `frontend/components/modules/AssetsModule.tsx`

**Backend:**
- `backend/src/modules/inventory/`
- `backend/src/modules/reports/`

---

### 13. 👔 HR Manager
**Email:** `hr@artic.health` | **Password:** `hr123`

**Frontend:**
- `frontend/app/(dashboard)/dashboard/` (general dashboard)
- `frontend/components/modules/HRModule.tsx`
- `frontend/components/modules/SettingsModule.tsx`

**Backend:**
- `backend/src/modules/human-resources/`
- `backend/src/modules/users/`
- `backend/src/modules/notifications/`
- `backend/src/modules/reports/`

---

### 14. ✅ Quality Officer
**Email:** `quality@artic.health` | **Password:** `quality123`

**Frontend:**
- `frontend/app/(dashboard)/dashboard/` (general dashboard)
- `frontend/components/modules/QualityModule.tsx`
- `frontend/components/modules/SurveillanceModule.tsx`

**Backend:**
- `backend/src/modules/quality/`
- `backend/src/modules/surveillance/`
- `backend/src/modules/reports/`

---

### 15. 📊 Data Officer (HMIS)
**Email:** `data@artic.health` | **Password:** `data123`

**Frontend:**
- `frontend/app/(dashboard)/dashboard/` (general dashboard)
- `frontend/components/modules/ReportsModule.tsx`
- `frontend/components/modules/SurveillanceModule.tsx`
- `frontend/components/modules/InteroperabilityModule.tsx`

**Backend:**
- `backend/src/modules/reports/`
- `backend/src/modules/surveillance/`
- `backend/src/modules/integrations/`

---

### 16. 🚑 Ambulance Driver
**Email:** `ambulance@artic.health` | **Password:** `drive123`

**Frontend:**
- `frontend/app/(dashboard)/dashboard/` (general dashboard)
- `frontend/components/modules/AmbulanceModule.tsx`

**Backend:**
- `backend/src/modules/ambulance/`
- `backend/src/modules/notifications/`

---

### 17. 🔬 Medical Director
**Email:** `director@artic.health` | **Password:** `director123`

**Frontend:**
- `frontend/app/(dashboard)/dashboard/` (general dashboard)
- `frontend/components/modules/ConsultationModule.tsx`
- `frontend/components/modules/ReportsModule.tsx`
- `frontend/components/modules/SurveillanceModule.tsx`
- `frontend/components/modules/QualityModule.tsx`
- `frontend/components/modules/AIModule.tsx`

**Backend:**
- `backend/src/modules/medical-records/`
- `backend/src/modules/laboratory/`
- `backend/src/modules/radiology/`
- `backend/src/modules/inpatient/`
- `backend/src/modules/reports/`
- `backend/src/modules/surveillance/`
- `backend/src/modules/ai/`

---

### 18. 👤 Patient (Portal)
**Email:** `patient@artic.health` | **Password:** `patient123`

**Frontend:**
- `frontend/app/(dashboard)/patient-portal/page.tsx`
- `frontend/app/(dashboard)/patient-portal/appointments/`
- `frontend/app/(dashboard)/patient-portal/medical-records/`
- `frontend/app/(dashboard)/patient-portal/prescriptions/`
- `frontend/app/(dashboard)/patient-portal/lab-results/`
- `frontend/app/(dashboard)/patient-portal/billing/`
- `frontend/app/(dashboard)/patient-portal/profile/`
- `frontend/app/(dashboard)/patient-portal/telemedicine/`
- `frontend/components/modules/PatientPortal.tsx`

**Backend:**
- `backend/src/modules/patient-portal/`
- `backend/src/modules/appointments/`
- `backend/src/modules/billing/`
- `backend/src/modules/telemedicine/`

---

### Shared files (all users)

| File | Purpose |
|---|---|
| `frontend/app/(auth)/login/page.tsx` | Login — all users |
| `frontend/app/(dashboard)/layout.tsx` | Dashboard shell |
| `frontend/middleware.ts` | Route protection |
| `frontend/lib/auth.ts` | Session management |
| `frontend/lib/api/hms.ts` | All API calls |
| `frontend/lib/store.ts` | Toast/global state |
| `backend/src/middleware/auth.js` | JWT + `requireModule` |
| `backend/src/middleware/privacyGuard.js` | Super Admin privacy |
| `backend/src/modules/auth/` | Login, logout, refresh |
| `backend/src/modules/notifications/` | All roles |
| `backend/src/database/seed.js` | All demo accounts |