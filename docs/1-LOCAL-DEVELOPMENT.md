# ARTIC HMS — Local Development Guide
# How to run the project on your Windows machine

---

## Prerequisites

Install these first:

| Tool | Version | Download |
|------|---------|---------|
| Node.js | v22+ | https://nodejs.org |
| Docker Desktop | Latest | https://docker.com |
| Git | Latest | https://git-scm.com |
| VS Code | Latest | https://code.visualstudio.com |

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/Byiringiro24/ARTIC-Health-Companion.git
cd ARTIC-Health-Companion
```

Or on Windows:
```
D:\Projectts 2026\ARTIC\Hospital\
```

---

## Step 2 — Start the Databases (Docker)

```bash
cd docker
docker compose up -d hms-postgres hms-redis
```

This starts:
- **PostgreSQL** on port `5433` — database `artic_hms`, user `Byiringiro`
- **Redis** on port `6380`

Verify:
```bash
docker ps
# Should show: artic-hms-postgres   RUNNING   0.0.0.0:5433->5432/tcp
#              artic-hms-redis       RUNNING   0.0.0.0:6380->6379/tcp
```

---

## Step 3 — Configure Backend

```bash
cd backend
```

Create `.env` file (copy from template and adjust):
```bash
copy .env.server .env
```

Or create manually — the minimum required:
```env
PORT=4001
NODE_ENV=development
DATABASE_URL=postgresql://Byiringiro:Artic%25242026@localhost:5433/artic_hms?sslmode=disable
JWT_ACCESS_SECRET=artic-production-jwt-secret-min-32-chars-2026
JWT_REFRESH_SECRET=artic-production-refresh-secret-2026
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:3001,http://localhost:3000
REDIS_URL=redis://localhost:6380
REDIS_PREFIX=hms:
DEFAULT_FACILITY=Kigali District Hospital
DEFAULT_TIMEZONE=Africa/Kigali
DEFAULT_CURRENCY=RWF
```

**Important note on the password:**
The Docker container password is literally `Artic%242026` (with percent sign).
In the DATABASE_URL it must be double-encoded as `Artic%25242026`.

---

## Step 4 — Install Backend Dependencies

```bash
cd backend
npm install
```

---

## Step 5 — Start the Backend

```bash
# Full backend (Express + PostgreSQL + WebSocket)
npm run dev
# This runs: node --watch src/index.js

# OR minimal in-memory server (no DB needed):
npm run dev:legacy
# This runs: node --watch src/server.js
```

Backend runs at: `http://localhost:4001`

**Verify it's working:**
```bash
curl http://localhost:4001/health
# Expected: {"status":"ok","version":"2.0.0","database":"ok"}

curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@artic.health","password":"doctor123"}'
# Expected: {"accessToken":"eyJ...","user":{...}}
```

---

## Step 6 — Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

## Step 7 — Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend runs at: `http://localhost:3000`

**Note:** Local dev uses port 3000 by default (Next.js default).
The frontend `.env.local` already points to `http://localhost:4001` for the backend.

---

## Step 8 — Log In

Open `http://localhost:3000` in your browser.

| Email | Password | Role |
|-------|----------|------|
| admin@artic.health | admin123 | System Admin (all access) |
| doctor@artic.health | doctor123 | Doctor |
| nurse@artic.health | nurse123 | Nurse |
| pharmacy@artic.health | pharmacy123 | Pharmacist |
| lab@artic.health | lab123 | Lab Scientist |
| radiology@artic.health | radio123 | Radiologist |
| reception@artic.health | front123 | Receptionist |
| accounts@artic.health | money123 | Accountant |
| cashier@artic.health | cashier123 | Cashier |
| insurance@artic.health | claim123 | Insurance Officer |
| store@artic.health | store123 | Store Manager |
| hr@artic.health | hr123 | HR Manager |
| quality@artic.health | quality123 | Quality Officer |
| data@artic.health | data123 | Data Officer |
| ambulance@artic.health | drive123 | Ambulance Driver |
| patient@artic.health | patient123 | Patient |
| manager@artic.health | manager123 | Hospital Manager |
| director@artic.health | director123 | Medical Director |

---

## Common Commands

```bash
# Reset the database (drop all tables + reseed)
cd backend
docker exec artic-hms-postgres psql -U Byiringiro -d artic_hms -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run dev   # migrations + seed run automatically on startup

# View backend logs
cd backend && npm run dev

# View database contents
docker exec -it artic-hms-postgres psql -U Byiringiro -d artic_hms
\dt          # list tables
SELECT * FROM users;
\q           # quit

# Stop all Docker containers
docker compose down

# Rebuild Docker containers from scratch
docker compose down -v   # also removes data volumes
docker compose up -d
```

---

## Troubleshooting

**Login not working:**
- Make sure backend is running on port 4001 (`npm run dev` in `/backend`)
- Make sure `src/index.js` is running, NOT `src/server.js`
- Check `.env` exists in `/backend` with correct DATABASE_URL

**Database connection refused:**
- Run `docker ps` — confirm `artic-hms-postgres` is running
- Run `docker compose up -d` in `/docker` to start it

**Frontend can't reach backend:**
- Check `/frontend/.env.local` contains `NEXT_PUBLIC_API_URL=http://localhost:4001`
- Confirm backend is running: `curl http://localhost:4001/health`

**Port already in use:**
```bash
# Find what's using port 4001
netstat -ano | findstr :4001
# Kill that process
taskkill /PID <pid> /F
```
