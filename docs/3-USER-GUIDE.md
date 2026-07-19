# ARTIC Health Companion — User Guide
# Everything you need to use the system

**Live URL:** http://172.209.217.176:3001

---

## How to Log In

1. Open `http://172.209.217.176:3001` in your browser
2. Enter your email and password
3. You are taken to your role dashboard automatically

---

## All User Accounts & Passwords

| Role | Email | Password |
|------|-------|----------|
| System Administrator | admin@artic.health | admin123 |
| Hospital Manager | manager@artic.health | manager123 |
| Medical Director | director@artic.health | director123 |
| Doctor | doctor@artic.health | doctor123 |
| Nurse | nurse@artic.health | nurse123 |
| Pharmacist | pharmacy@artic.health | pharmacy123 |
| Lab Scientist | lab@artic.health | lab123 |
| Radiologist | radiology@artic.health | radio123 |
| Receptionist | reception@artic.health | front123 |
| Accountant | accounts@artic.health | money123 |
| Cashier | cashier@artic.health | cashier123 |
| Insurance Officer | insurance@artic.health | claim123 |
| Store Manager | store@artic.health | store123 |
| HR Manager | hr@artic.health | hr123 |
| Quality Officer | quality@artic.health | quality123 |
| Data Officer | data@artic.health | data123 |
| Ambulance Driver | ambulance@artic.health | drive123 |
| Patient (Claudine) | patient@artic.health | patient123 |

---

## How to Change Your Password

1. Log in to your account
2. Click your name in the top right
3. Select **Change Password**
4. Enter your current password
5. Enter your new password (minimum 8 characters)
6. Click **Save**

All your active sessions will be logged out after changing password — log in again with the new password.

---

## What Each Role Can Do

### System Administrator (admin@artic.health)
Sees everything. Can:
- Create and manage all user accounts
- View complete audit trail
- Configure hospital settings and integrations
- Run reports from any facility

### Hospital Manager (manager@artic.health)
Runs the facility. Can:
- Create all staff accounts
- View live KPI dashboard
- Approve procurement and manage HR
- View financial reports

### Doctor (doctor@artic.health)
Full consultation workflow:
- View consultation queue
- Write SOAP notes with ICD-10/11 coding
- Send prescriptions to pharmacy (appears within 10 seconds)
- Order lab tests and imaging
- Create referrals and admission orders

### Nurse (nurse@artic.health)
Patient care:
- Triage patients (level 1–5)
- Record vital signs (BP, temperature, HR, SpO2, weight)
- Administer medications (MAR)
- Shift handover notes
- Bed management

### Pharmacist (pharmacy@artic.health)
Drug management:
- See pending prescriptions from doctors
- Dispense medications (FEFO policy)
- Manage drug inventory
- Receive new stock

### Lab Scientist (lab@artic.health)
Laboratory workflow:
- View pending test orders
- Collect specimens and assign barcodes
- Enter results with reference ranges
- Critical results automatically alert the doctor

### Receptionist (reception@artic.health)
Front desk:
- Register new patients (NID duplicate check)
- Book appointments
- Check patients in (QR code or MRN)
- Manage live queue

### Accountant (accounts@artic.health)
Finance:
- Create and manage invoices
- Submit insurance claims to RSSB/Mutuelle
- Process payments (Cash, MTN MoMo, Airtel Money, Card)
- Daily reconciliation reports

### Patient (patient@artic.health)
Personal health portal:
- View own appointments
- See lab results and prescriptions
- Pay bills
- Access medical records

---

## Demo Patients

| MRN | Name | Insurance | Status |
|-----|------|-----------|--------|
| MRN-2026-0001 | Claudine Mutesi | RSSB | Active follow-up |
| MRN-2026-0002 | Samuel Ndayisaba | Mutuelle | In clinic |
| MRN-2026-0003 | Esperance Kayitesi | Private | Admitted |
| MRN-2026-0004 | Patrick Mugenzi | RSSB | Emergency |
| MRN-2026-0005 | Vestine Uwimana | Mutuelle | ANC visit |

---

## Key Features — How They Work

### Patient Registration
- Receptionist enters NID → system checks for duplicates
- If not found: MRN generated (e.g. MRN-2026-0001)
- QR card can be printed

### Appointment Booking
- Receptionist books appointment for patient
- Patient receives SMS confirmation (when SMS is configured)
- System assigns queue number automatically

### Consultation (Doctor)
1. Doctor opens their queue
2. Clicks patient → sees full EMR, allergies, vitals, medications
3. Writes SOAP note → saves with ICD code
4. Issues prescription → appears in pharmacy queue in 10 seconds
5. Orders lab test → appears in lab queue instantly

### Triage (Nurse)
1. Nurse opens **Triage** page
2. Searches patient by name/MRN
3. Selects triage level 1–5
4. Records vital signs
5. Saves → patient escalated in queue if Level 1 or 2

### Laboratory
1. Lab sees pending orders sorted by urgency
2. Collects specimen → barcode assigned
3. Enters result with reference range
4. Critical results → auto-alert sent to doctor within 2 minutes

### Pharmacy Dispensing
1. Pharmacist sees pending prescriptions
2. Verifies drug interactions and allergies
3. Dispenses with FEFO (earliest expiry first)
4. Stock automatically deducted

### Billing & Payment
1. Invoice auto-generated for every service
2. Insurance split calculated (RSSB covers 85%, patient pays 15%)
3. Patient pays via Cash / MTN MoMo / Airtel / Card
4. Receipt issued automatically

---

## Navigation Tips

- The **sidebar** shows only your permitted modules
- Click the **☰** button to collapse/expand the sidebar
- Use the **search bar** at the top to find patients, invoices, results
- The **bell icon** shows unread notifications with a red badge
- Click your **role name** in the sidebar to see your access level

---

## Getting Help

If login fails:
- Make sure you're using the correct email (e.g. `doctor@artic.health`)
- Passwords are case-sensitive
- If account is locked (5 failed attempts), wait 10 minutes or contact admin

If a feature is not visible:
- Your role may not have access to that module
- Contact the System Admin to check your permissions
