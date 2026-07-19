# ARTIC HMS — Server Deployment Guide
# How to deploy and maintain on the production server

---

## Server Details

| Item | Value |
|------|-------|
| IP Address | 172.209.217.176 |
| SSH User | artic |
| OS | Ubuntu (Azure VM) |
| Node.js | v22.23.1 |
| Project Path | /home/artic/artic-hms |
| Frontend URL | http://172.209.217.176:3001 |
| Backend URL | http://172.209.217.176:4001 |

**Co-existing project (DO NOT TOUCH):**
| Item | Value |
|------|-------|
| VMS Backend | port 4000 |
| VMS Frontend | port 3000 |

---

## Azure NSG (Cloud Firewall) — Required Rules

These rules must exist in the Azure portal under **Artic-nsg**:

| Priority | Name | Port | Action |
|----------|------|------|--------|
| 310 | Allow-Frontend-3000 | 3000 | Allow (VMS) |
| 320 | Allow-Backend-5000 | 5000 | Allow (VMS) |
| 900 | Allow-HMS-Frontend | 3001 | Allow |
| 950 | Allow-HMS-Backend | 4001 | Allow |
| 1000 | default-allow-ssh | 22 | Allow |
| 1010 | Allow-MQTT-1883 | 1883 | Allow (VMS) |

---

## First-Time Deployment (New Server)

### 1. Connect to server
```bash
ssh artic@172.209.217.176
```

### 2. Install required software (if not already installed)
```bash
# Node.js v22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node --version   # must show v22.x.x

# PM2
sudo npm install -g pm2

# Docker (if not installed)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker artic
newgrp docker

# Git (usually pre-installed)
git --version
```

### 3. Clone the repository
```bash
cd /home/artic
git clone https://github.com/Byiringiro24/ARTIC-Health-Companion.git artic-hms
cd artic-hms
```

### 4. Start HMS databases
```bash
cd /home/artic/artic-hms/docker
docker compose up -d hms-postgres hms-redis
sleep 10

# Verify
docker ps | grep hms
# Should show: artic-hms-postgres   5433->5432
#              artic-hms-redis       6380->6379
```

### 5. Open firewall ports (Ubuntu UFW)
```bash
sudo ufw allow 3001/tcp
sudo ufw allow 4001/tcp
sudo ufw status | grep -E "3001|4001"
```

### 6. Run the setup script
```bash
cd /home/artic/artic-hms
bash scripts/server-setup.sh
```

This script automatically:
- Copies `.env.server` → `.env`
- Installs dependencies
- Starts backend with PM2 (`src/index.js`)
- Builds frontend and starts with PM2
- Runs a full endpoint verification

---

## Routine Update Procedure

Every time code changes are pushed to GitHub:

```bash
ssh artic@172.209.217.176
cd /home/artic/artic-hms
git pull origin main
bash scripts/server-setup.sh
```

Or manually:
```bash
cd /home/artic/artic-hms
git pull origin main

# Restart backend
cd backend
npm install --omit=dev
pm2 restart artic-hms-backend

# Rebuild and restart frontend
cd ../frontend
npm install
NEXT_PUBLIC_API_URL=http://172.209.217.176:4001 npm run build
pm2 restart artic-hms-frontend
```

---

## PM2 Commands (Process Manager)

```bash
# Status of all processes
pm2 status

# Logs
pm2 logs artic-hms-backend --lines 50
pm2 logs artic-hms-frontend --lines 50

# Restart
pm2 restart artic-hms-backend
pm2 restart artic-hms-frontend

# Stop
pm2 stop artic-hms-backend

# Auto-restart on server reboot
pm2 startup          # follow printed command
pm2 save

# Expected process list:
# 0  vms-backend        online  ← VMS (DO NOT TOUCH)
# 2  vms-frontend       online  ← VMS (DO NOT TOUCH)
# 4  artic-hms-backend  online  ← HMS backend (port 4001)
# 7  artic-hms-frontend online  ← HMS frontend (port 3001)
```

---

## Backend .env on Server

File: `/home/artic/artic-hms/backend/.env`

```env
PORT=4001
NODE_ENV=production
DATABASE_URL=postgresql://Byiringiro:Artic%25242026@localhost:5433/artic_hms?sslmode=disable
JWT_ACCESS_SECRET=artic-production-jwt-secret-min-32-chars-2026
JWT_REFRESH_SECRET=artic-production-refresh-secret-2026
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://172.209.217.176:3001,http://localhost:3001
REDIS_URL=redis://localhost:6380
REDIS_PREFIX=hms:
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=200
AUTH_RATE_LIMIT_MAX=10
DEFAULT_FACILITY=Kigali District Hospital
DEFAULT_TIMEZONE=Africa/Kigali
DEFAULT_CURRENCY=RWF
FRONTEND_URL=http://172.209.217.176:3001
```

**Note:** This file is gitignored — it must be recreated manually or via `bash scripts/server-setup.sh`.

---

## Verify Everything Is Working

```bash
# 1. Check health
curl http://localhost:4001/health
# Expected: {"status":"ok","version":"2.0.0","database":"ok"}

# 2. Test login
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@artic.health","password":"doctor123"}'
# Expected: {"accessToken":"eyJ...","user":{...}}

# 3. Verify frontend
curl -I http://localhost:3001
# Expected: HTTP/1.1 200 OK

# 4. Check VMS is untouched
curl http://localhost:4000/health
# Must still work
```

---

## Troubleshooting on Server

**Login not working / 404 on new endpoints:**
```bash
# Check which file PM2 is running
pm2 describe artic-hms-backend | grep script
# Must show: src/index.js  (NOT src/server.js)

# If it shows server.js — restart correctly:
pm2 delete artic-hms-backend
cd /home/artic/artic-hms/backend
pm2 start src/index.js --name artic-hms-backend \
  --node-args="--env-file=/home/artic/artic-hms/backend/.env"
pm2 save
```

**Database connection error:**
```bash
# Check postgres container
docker ps | grep hms-postgres
# Restart if needed
docker start artic-hms-postgres
```

**Port 4001 not accessible from outside:**
```bash
# Check UFW
sudo ufw status | grep 4001
# If missing:
sudo ufw allow 4001/tcp

# Also check Azure NSG in portal — port 4001 must have Allow rule
```

**Out of memory:**
```bash
free -h          # check RAM
pm2 monit        # live memory monitor
```
