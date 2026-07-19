# HMS Deploy — ARTIC Health Companion
# Configuration Reference: Local & Production Server

**System:** ARTIC Health Companion (HMS)
**Server:** Ubuntu VPS — `172.209.217.176` (user: `artic`)
**Co-existing with:** ARTIC VMS (Fleet Management) — runs on the same server with no port conflicts
**Date:** July 2026

---

## Port Allocation

| Service         | VMS (existing) | HMS (this project) |
|-----------------|----------------|--------------------|
| Backend API     | 4000           | **4001**           |
| Frontend        | 3000           | **3001**           |
| PostgreSQL      | 5432           | 5433 (Docker)      |
| Redis           | 6379           | 6380 (Docker)      |
| MQTT            | 1883           | not used           |

---

## Part 1 — Local Development

### Repository

```
GitHub:     https://github.com/Byiringiro24/ARTIC-Health-Companion.git
Local path: D:\Projectts 2026\ARTIC\Hospital
```

### Project Structure

```
Hospital/
├── backend/          Node.js Express API (port 4001)
│   ├── src/
│   │   ├── server.js         simple HTTP server (Phase 1 — no DB)
│   │   ├── index.js          full Express server (Phase 2+)
│   │   ├── data.js           in-memory demo data
│   │   └── database/
│   │       ├── migrate.js
│   │       └── seed.js
│   ├── .env                  local env (gitignored)
│   ├── .env.server           production env template (tracked)
│   └── package.json
├── frontend/         Next.js 15 app (port 3001)
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   └── Dockerfile.web
└── .github/workflows/        CI/CD pipelines
```

### Running Locally

**Backend:**
```bash
cd "D:\Projectts 2026\ARTIC\Hospital\backend"
npm install
npm run dev          # node --watch src/index.js  (hot reload)
# or
node src/server.js   # minimal server, no DB required
```
Backend runs on: `http://localhost:4001`

**Frontend:**
```bash
cd "D:\Projectts 2026\ARTIC\Hospital\frontend"
npm install
npm run dev          # next dev
```
Frontend runs on: `http://localhost:3000` (local dev uses default Next.js port)

### Local Backend `.env`

File location: `backend/.env` (gitignored — never committed)

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

---

## Part 2 — Production Server

### Server Details

```
IP:         172.209.217.176
User:       artic
SSH:        ssh artic@172.209.217.176
Project:    /home/artic/artic-hms
Node.js:    v22.23.1
OS:         Ubuntu (with Docker, PM2, Nginx)
```

### Cloud Firewall (Azure NSG — Artic-nsg)

The server sits behind an Azure Network Security Group. These inbound rules must exist:

| Priority | Name              | Port(s)   | Protocol | Action |
|----------|-------------------|-----------|----------|--------|
| (auto)   | SSH               | 22        | TCP      | Allow  |
| (auto)   | HTTP              | 80        | TCP      | Allow  |
| (auto)   | HTTPS             | 443       | TCP      | Allow  |
| (auto)   | VMS-Frontend      | 3000      | TCP      | Allow  |
| (auto)   | VMS-MQTT          | 1883      | TCP      | Allow  |
| **900**  | **Allow-HMS-Ports** | **3001,4001** | **TCP** | **Allow** |

### Ubuntu UFW Firewall (on the server itself)

```bash
sudo ufw status
# Must show:
# 3001/tcp   ALLOW   Anywhere
# 4001/tcp   ALLOW   Anywhere
```

To add if missing:
```bash
sudo ufw allow 3001/tcp
sudo ufw allow 4001/tcp
```

### Code Deployment

The project is deployed via git clone — not SCP:

```bash
# First time
git clone https://github.com/Byiringiro24/ARTIC-Health-Companion.git /home/artic/artic-hms

# Updates
cd /home/artic/artic-hms
git pull origin main
```

### Backend `.env` on the Server

File location: `/home/artic/artic-hms/backend/.env` (gitignored — must be created manually)

```bash
cd /home/artic/artic-hms/backend
cat > .env << 'EOF'
PORT=4001
NODE_ENV=production
CORS_ORIGIN=http://172.209.217.176:3001
DEFAULT_FACILITY=Kigali District Hospital
DEFAULT_TIMEZONE=Africa/Kigali
DEFAULT_CURRENCY=RWF
EOF
```

### Starting the Backend with PM2

The backend uses Node.js `--env-file` to load the `.env` (required on Node v20+):

```bash
cd /home/artic/artic-hms/backend
npm install
pm2 delete artic-hms-backend   # remove any old instance
pm2 start src/server.js --name artic-hms-backend \
  --node-args="--env-file=/home/artic/artic-hms/backend/.env"
pm2 save
```

Verify:
```bash
curl http://localhost:4001/health
# {"status":"ok","service":"ARTIC Health Companion Backend","version":"0.1.0"}
```

### Starting the Frontend with PM2

```bash
cd /home/artic/artic-hms/frontend
npm install
npm run build
pm2 delete artic-hms-frontend   # remove any old instance
pm2 start npm --name artic-hms-frontend --env production -- start -- -p 3001
pm2 save
```

Verify:
```bash
curl -I http://localhost:3001
# HTTP/1.1 200 OK
```

### PM2 Process List (all 4 processes)

```
│ id │ name                │ status │
│ 0  │ vms-backend         │ online │   ← existing VMS — untouched
│ 2  │ vms-frontend        │ online │   ← existing VMS — untouched
│ 4  │ artic-hms-backend   │ online │   ← HMS backend  (port 4001)
│ 7  │ artic-hms-frontend  │ online │   ← HMS frontend (port 3001)
```

### Live URLs

| What          | URL                                    |
|---------------|----------------------------------------|
| HMS Frontend  | http://172.209.217.176:3001            |
| HMS API       | http://172.209.217.176:4001            |
| HMS Health    | http://172.209.217.176:4001/health     |
| VMS Frontend  | http://172.209.217.176:3000            |
| VMS API       | http://172.209.217.176:4000            |

---

## Part 3 — Update Procedure

```bash
ssh artic@172.209.217.176
cd /home/artic/artic-hms

# Pull latest code
git pull origin main

# Restart backend
pm2 restart artic-hms-backend

# Rebuild and restart frontend (only needed if frontend files changed)
cd frontend
npm install
npm run build
pm2 restart artic-hms-frontend
```

---

## Part 4 — Useful Commands on the Server

```bash
# Check all processes
pm2 status

# Live logs
pm2 logs artic-hms-backend --lines 50
pm2 logs artic-hms-frontend --lines 50

# Check what's listening on HMS ports
ss -tlnp | grep -E "3001|4001"

# Test backend health
curl http://localhost:4001/health

# Test frontend
curl -I http://localhost:3001
```

---

## Part 5 — Docker (optional — HMS databases)

If you want dedicated PostgreSQL and Redis for HMS (instead of sharing with VMS):

```bash
cd /home/artic/artic-hms/docker
docker compose up -d hms-postgres hms-redis
```

This starts:
- PostgreSQL on host port `5433` (container port 5432) — DB: `artic_hms`, user: `Byiringiro`
- Redis on host port `6380` (container port 6379)

Then update the backend `.env`:
```env
DATABASE_URL=postgresql://Byiringiro:Artic%242026@localhost:5433/artic_hms?sslmode=disable
REDIS_URL=redis://localhost:6380
```

---

## Notes

- The backend `src/server.js` is a minimal in-memory HTTP server (Phase 1). It requires no database or Redis — just `PORT` in the environment.
- The full Express backend (`src/index.js`) requires PostgreSQL and Redis and is used for Phase 2+.
- The `.env` file is gitignored on both local and server. It must be created manually on each environment.
- The `.env.server` file in the repo is the production template — copy it to `.env` and fill in real values.
