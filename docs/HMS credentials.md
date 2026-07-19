# HMS Credentials — ARTIC Health Companion
# All access credentials for development, demo, and infrastructure

> Keep this file secure. Do NOT commit to Git or share publicly.
> The `.env` files and this document should be stored in a password manager.

---

## Application Login — Demo Accounts

All accounts are seeded automatically when running `npm run setup` in the backend.
Base URL: `http://172.209.217.176:3001` (production) or `http://localhost:3001` (local)

### Login endpoint
```
POST /api/auth/login
Body: { "email": "...", "password": "..." }
```

### Staff Accounts

| Role                  | Email                        | Password      | Name                  | Department        |
|-----------------------|------------------------------|---------------|-----------------------|-------------------|
| System Administrator  | admin@artic.health           | admin123      | Aline Uwase           | IT & Platform     |
| Hospital Manager      | manager@artic.health         | manager123    | Jean Habimana         | Executive Office  |
| Medical Director      | director@artic.health        | director123   | Yves Rukundo          | Executive Office  |
| Doctor                | doctor@artic.health          | doctor123     | Dr. Grace Mukamana    | Internal Medicine |
| Nurse                 | nurse@artic.health           | nurse123      | Eric Niyonsenga       | Emergency         |
| Pharmacist            | pharmacy@artic.health        | pharmacy123   | Diane Ingabire        | Pharmacy          |
| Lab Technician        | lab@artic.health             | lab123        | Patrick Mugabo        | Laboratory        |
| Radiologist           | radiology@artic.health       | radio123      | Chantal Uwimana       | Radiology         |
| Receptionist          | reception@artic.health       | front123      | Olive Mukazana        | Front Desk        |
| Accountant            | accounts@artic.health        | money123      | Emmanuel Nzeyimana    | Finance           |
| Cashier               | cashier@artic.health         | cashier123    | Bella Ingabire        | Finance           |
| Insurance Officer     | insurance@artic.health       | claim123      | Nadia Kamana          | Finance           |
| Store Manager         | store@artic.health           | store123      | Bosco Tuyishime       | Stores            |
| HR Manager            | hr@artic.health              | hr123         | Sandrine Uwera        | Human Resources   |
| Quality Officer       | quality@artic.health         | quality123    | Alice Nizeyimana      | Quality           |
| Data Officer          | data@artic.health            | data123       | Kevin Iradukunda      | IT & Platform     |
| Ambulance Driver      | ambulance@artic.health       | drive123      | Theoneste Habimana    | Emergency         |
| Patient               | patient@artic.health         | patient123    | Claudine Mutesi       | —                 |

### Demo Patients (no login — accessed through staff accounts)

| MRN             | Name              | NID                 | DOB        | Insurance       | Blood | Conditions              |
|-----------------|-------------------|---------------------|------------|-----------------|-------|-------------------------|
| MRN-2026-0001   | Claudine Mutesi   | 1199880000000001    | 1992-03-15 | RSSB-00123456   | O+    | Hypertension            |
| MRN-2026-0002   | Samuel Ndayisaba  | 1199770000000002    | 2018-07-22 | MUT-789012      | A+    | Asthma                  |
| MRN-2026-0003   | Esperance Kayitesi| 1199660000000003    | 1965-11-08 | PRIV-334455     | B-    | Diabetes, Hypertension  |
| MRN-2026-0004   | Patrick Mugenzi   | 1199550000000004    | 1982-05-30 | RSSB-00567890   | AB+   | —                       |
| MRN-2026-0005   | Vestine Uwimana   | 1200010000000005    | 1998-01-14 | MUT-112233      | A-    | —                       |

---

## Server SSH Access

| What         | Value                      |
|--------------|----------------------------|
| Host         | 172.209.217.176            |
| User         | artic                      |
| SSH command  | `ssh artic@172.209.217.176` |
| Project path | /home/artic/artic-hms      |

---

## Backend Environment Variables

### Local (`backend/.env`)

```env
PORT=4001
NODE_ENV=production
DATABASE_URL=postgresql://Byiringiro:Artic%242026@localhost:5433/artic_hms?schema=public&sslmode=disable
JWT_ACCESS_SECRET=artic-production-jwt-secret-min-32-chars-2026
JWT_REFRESH_SECRET=artic-production-refresh-secret-2026
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:3001,http://localhost:4001
REDIS_URL=redis://localhost:6379
REDIS_PREFIX=hms:
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=200
AUTH_RATE_LIMIT_MAX=10
DEFAULT_FACILITY=Kigali District Hospital
DEFAULT_TIMEZONE=Africa/Kigali
DEFAULT_CURRENCY=RWF
```

### Production server (`/home/artic/artic-hms/backend/.env`)

```env
PORT=4001
NODE_ENV=production
CORS_ORIGIN=http://172.209.217.176:3001
DEFAULT_FACILITY=Kigali District Hospital
DEFAULT_TIMEZONE=Africa/Kigali
DEFAULT_CURRENCY=RWF
```

> Note: The production server currently runs `src/server.js` (Phase 1 — in-memory, no DB).
> When upgrading to the full Express backend (`src/index.js`), add DATABASE_URL, REDIS_URL,
> JWT_ACCESS_SECRET, and JWT_REFRESH_SECRET with strong generated values:
> `openssl rand -hex 32`

---

## Database — HMS PostgreSQL (Docker)

| Field    | Value                           |
|----------|---------------------------------|
| Host     | localhost                       |
| Port     | 5433 (host) → 5432 (container)  |
| Database | artic_hms                       |
| User     | Byiringiro                      |
| Password | Artic$2026                      |
| URL      | `postgresql://Byiringiro:Artic%242026@localhost:5433/artic_hms?sslmode=disable` |

Connect:
```bash
docker exec -it artic-hms-postgres psql -U Byiringiro -d artic_hms
```

---

## Database — VMS PostgreSQL (existing, DO NOT modify)

| Field    | Value                      |
|----------|----------------------------|
| Port     | 5432                       |
| Database | fleet_management           |
| User     | artic_user                 |
| Password | Artic$2026                 |

---

## Redis

| Instance    | Host      | Port |
|-------------|-----------|------|
| VMS Redis   | localhost | 6379 |
| HMS Redis   | localhost | 6380 |

HMS keys use prefix `hms:` to avoid collision with VMS keys on the same instance.

---

## GitHub Repository

| Field       | Value                                                        |
|-------------|--------------------------------------------------------------|
| Remote      | https://github.com/Byiringiro24/ARTIC-Health-Companion.git  |
| SSH remote  | git@github.com:Byiringiro24/ARTIC-Health-Companion.git      |
| Branch      | main                                                         |

---

## Azure Cloud (NSG Rule Added)

| Rule Name        | Priority | Ports     | Action |
|------------------|----------|-----------|--------|
| Allow-HMS-Ports  | 900      | 3001,4001 | Allow  |

Azure portal: portal.azure.com → Network Security Groups → Artic-nsg → Inbound rules

---

## PM2 Process Names

| Name                  | Port | What              |
|-----------------------|------|-------------------|
| vms-backend           | 4000 | VMS API           |
| vms-frontend          | 3000 | VMS Next.js       |
| artic-hms-backend     | 4001 | HMS API           |
| artic-hms-frontend    | 3001 | HMS Next.js       |
