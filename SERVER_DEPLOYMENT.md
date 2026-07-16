# ARTIC Health Companion — Server Deployment Guide
# Co-existing with ARTIC VMS on the same Ubuntu server

> **This guide deploys HMS alongside the existing VMS project without any conflicts.**
> VMS keeps ports 3000/4000. HMS uses ports 3001/4001. Same PostgreSQL, same Redis, different DB + key prefix.

---

## Fastest Path From This Workspace

If you want to ship the current local repository to the server without disturbing the existing VMS install, use the deployment helper script:

```powershell
pwsh -File .\scripts\deploy-to-server.ps1 -RemoteHost YOUR_SERVER_IP -RemoteUser artic
```

What this does:
- packages the current repository state into a tarball
- uploads it to a separate remote directory: /home/artic/artic-hms
- extracts it there without touching the existing VMS project files
- runs the server setup script so the new HMS instance uses ports 3001/4001

If you prefer to deploy manually, follow the sections below.

---

## Port Allocation (No Conflicts)

| Service | VMS Project | HMS Project |
|---|---|---|
| Backend API | 4000 | **4001** |
| Frontend | 3000 | **3001** |
| PostgreSQL | 5432 (fleet_management) | **5432 (artic_hms)** — same instance, new DB |
| Redis | 6379 | **6379** — same instance, key prefix `hms:` |
| MQTT | 1883 | not used |
| HTTPS domain | fleet.yourcompany.rw | **hms.yourcompany.rw** |

---

## PART 1 — Prepare the Server (if not already done for VMS)

If the server already has Docker, Node.js, Nginx, and PM2 from the VMS project, **skip this part** and go to Part 2.

```bash
# SSH into server
ssh artic@YOUR_SERVER_IP

# Install Node.js 24 (required for node:sqlite built-in module)
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs
node --version   # must show v24.x.x

# Verify Docker is running
docker --version
docker compose version

# Verify PM2
pm2 --version

# Verify Nginx
sudo nginx -t
```

---

## PART 2 — Create the PostgreSQL Database for HMS

The VMS project already has PostgreSQL running with database `fleet_management`.
Create a **new database and user** for HMS — zero impact on VMS.

```bash
# Connect to the running postgres container (VMS project)
docker exec -it artic-vms-postgres-1 psql -U artic_user -d fleet_management

# Inside psql — create HMS database and user
CREATE DATABASE artic_hms;
CREATE USER artic_hms_user WITH PASSWORD 'HmsArtic$2026_ChangeThis';
GRANT ALL PRIVILEGES ON DATABASE artic_hms TO artic_hms_user;
\q
```

**Verify the new database exists:**
```bash
docker exec artic-vms-postgres-1 psql -U artic_user -c "\l" | grep artic_hms
```

If VMS uses bare PostgreSQL (not Docker), connect with:
```bash
sudo -u postgres psql
CREATE DATABASE artic_hms;
CREATE USER artic_hms_user WITH PASSWORD 'HmsArtic$2026_ChangeThis';
GRANT ALL PRIVILEGES ON DATABASE artic_hms TO artic_hms_user;
\q
```

---

## PART 3 — Deploy the Code

```bash
cd /home/artic

# Clone the HMS repository (separate from VMS directory)
git clone https://github.com/Byiringiro24/ARTIC-Health-Companion.git artic-hms
cd artic-hms
```

Or transfer files from Windows:
```bash
# Run on Windows — copies to server
scp -r "d:\Projectts 2026\ARTIC\Hospital\backend"  artic@YOUR_IP:/home/artic/artic-hms/
scp -r "d:\Projectts 2026\ARTIC\Hospital\frontend" artic@YOUR_IP:/home/artic/artic-hms/
scp -r "d:\Projectts 2026\ARTIC\Hospital\docker"   artic@YOUR_IP:/home/artic/artic-hms/
```

---

## PART 4 — Configure Environment

```bash
cd /home/artic/artic-hms/backend

# Copy the server env template
cp .env.server .env

# Edit with real values
nano .env
```

**Required changes in `.env`:**
```bash
# Generate TWO separate secrets
openssl rand -hex 32   # copy as JWT_ACCESS_SECRET
openssl rand -hex 32   # copy as JWT_REFRESH_SECRET
```

Full `.env` for production:
```
PORT=4001
NODE_ENV=production
DATABASE_PATH=./data/artic_health.db
JWT_ACCESS_SECRET=<output of openssl rand -hex 32>
JWT_REFRESH_SECRET=<different output of openssl rand -hex 32>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://hms.yourcompany.rw
REDIS_URL=redis://localhost:6379
REDIS_PREFIX=hms:
DEFAULT_FACILITY=Kigali District Hospital
DEFAULT_TIMEZONE=Africa/Kigali
DEFAULT_CURRENCY=RWF
```

If you plan to use PostgreSQL and Redis on the same host, an example production `.env` (matching this repo's docker-compose defaults) is:

```
DATABASE_URL=postgresql://Byiringiro:Artic%242026@localhost:5433/artic_hms?schema=public&sslmode=disable
REDIS_URL=redis://localhost:6380
PORT=4001
NODE_ENV=production
JWT_ACCESS_SECRET=<your generated secret>
JWT_REFRESH_SECRET=<your generated secret>
```

This setup maps the HMS Postgres container to host port `5433` and Redis to `6380` to avoid conflicts with other services running on `5432`/`6379`.

> **Note:** HMS uses SQLite by default (`data/artic_health.db`) — no PostgreSQL config needed for Phase 1.
> When you're ready for PostgreSQL (Phase 20), add: `DATABASE_URL=postgresql://artic_hms_user:...`

---

## PART 5 — Install Dependencies and Start Backend

```bash
cd /home/artic/artic-hms/backend

# Install dependencies
npm install

# Start with PM2 on port 4001
pm2 start src/index.js --name artic-hms-backend --env production
pm2 save

# Verify it started
pm2 status
pm2 logs artic-hms-backend --lines 30
```

**Expected output:**
```
✅  Database migrations applied successfully
🌱  Seeding database…
✅  Seed complete — demo users and patients inserted
║  ARTIC Health Companion API — Phase 1+2+3
║  Running on http://localhost:4001
```

**Test the API:**
```bash
curl http://localhost:4001/health
# Expected: {"status":"ok","service":"ARTIC Health Companion API","database":"ok"}

curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@artic.health","password":"doctor123"}'
# Expected: {"success":true,"accessToken":"...","user":{...}}
```

---

## PART 6 — Build and Start Frontend

```bash
cd /home/artic/artic-hms/frontend

# Install dependencies
npm install

# Build production bundle
NEXT_PUBLIC_API_URL=http://localhost:4001 npm run build

# Start on port 3001
PORT=3001 pm2 start npm --name artic-hms-frontend -- start
pm2 save
```

Verify:
```bash
pm2 status
curl -I http://localhost:3001
# Expected: HTTP/1.1 200 OK
```

---

## PART 7 — Configure Nginx (NEW server block, VMS untouched)

```bash
# Copy the HMS nginx config
sudo cp /home/artic/artic-hms/docker/nginx.conf /etc/nginx/sites-available/artic-hms

# Edit: replace hms.yourcompany.rw with your actual domain or IP
sudo nano /etc/nginx/sites-available/artic-hms

# For IP-only access (no domain yet), replace the server block with:
# server {
#     listen 3001;
#     ...frontend proxy...
# }
# (skip and just use direct port access for now)

# Enable
sudo ln -s /etc/nginx/sites-available/artic-hms /etc/nginx/sites-enabled/

# Add rate limit zone to nginx.conf http block (if not already there)
sudo grep -q "hms_api" /etc/nginx/nginx.conf || \
  sudo sed -i 's/http {/http {\n    limit_req_zone $binary_remote_addr zone=hms_api:10m rate=10r\/s;/' /etc/nginx/nginx.conf

# Test config
sudo nginx -t

# Reload (VMS keeps running — nginx reload is zero-downtime)
sudo systemctl reload nginx
```

**Get SSL (after DNS is pointed to this server):**
```bash
sudo certbot --nginx -d hms.yourcompany.rw
sudo certbot renew --dry-run   # test auto-renewal
```

---

## PART 8 — PM2 Auto-Start on Boot

```bash
pm2 startup    # follow the printed command
pm2 save

# Verify both projects are saved
pm2 list
# Should show: artic-backend (VMS), artic-frontend (VMS), artic-hms-backend, artic-hms-frontend
```

---

## PART 9 — Add HMS Backup to Existing Cron

```bash
sudo nano /etc/cron.daily/backup-artic
```

Add these lines at the bottom of the existing backup script:
```bash
# ── HMS SQLite backup ──────────────────────────────────────────────────────────
HMS_DB=/home/artic/artic-hms/backend/data/artic_health.db
if [ -f "$HMS_DB" ]; then
  cp "$HMS_DB" "$BACKUP_DIR/artic_hms_$DATE.db"
  gzip "$BACKUP_DIR/artic_hms_$DATE.db"
  echo "HMS SQLite backup: artic_hms_$DATE.db.gz"
fi
```

---

## PART 10 — Open Firewall Port (if needed)

Port 3001 and 4001 are only needed if you want **direct access** without Nginx reverse proxy.
If Nginx is configured with a domain, **only 80/443 need to be open**.

```bash
# Only if you want direct port access (testing without domain)
sudo ufw allow 3001   # HMS frontend direct
sudo ufw allow 4001   # HMS backend direct
sudo ufw status
```

---

## PART 11 — Verify Full Stack

```bash
# Test all 4 PM2 processes running
pm2 status

# Test VMS still works (should be completely unaffected)
curl http://localhost:4000/health
curl http://localhost:3000

# Test HMS
curl http://localhost:4001/health
curl http://localhost:3001

# Test HMS via Nginx domain
curl https://hms.yourcompany.rw/health
```

---

## PART 12 — Security Checklist

- [ ] JWT secrets are 64+ character random strings (not the example values)
- [ ] PostgreSQL HMS user password is strong and unique
- [ ] NODE_ENV=production
- [ ] CORS_ORIGIN set to exact frontend domain
- [ ] `.env` not committed to Git (in .gitignore)
- [ ] All demo passwords changed in production seed (or seed disabled)
- [ ] HTTPS enabled
- [ ] PM2 startup registered (services restart after reboot)
- [ ] Backup script includes HMS SQLite file

---

## Quick Reference

| What | VMS | HMS |
|---|---|---|
| Backend start | `pm2 restart artic-backend` | `pm2 restart artic-hms-backend` |
| Frontend start | `pm2 restart artic-frontend` | `pm2 restart artic-hms-frontend` |
| Backend logs | `pm2 logs artic-backend` | `pm2 logs artic-hms-backend` |
| Frontend logs | `pm2 logs artic-frontend` | `pm2 logs artic-hms-frontend` |
| Backend port | 4000 | **4001** |
| Frontend port | 3000 | **3001** |
| Database | fleet_management | artic_health.db (SQLite) |
| Nginx config | /etc/nginx/sites-available/artic-vms | /etc/nginx/sites-available/artic-hms |
| Code directory | /home/artic/artic-vms | /home/artic/artic-hms |

---

## Update Procedure

```bash
cd /home/artic/artic-hms
git pull

# Update backend
cd backend
npm install
pm2 restart artic-hms-backend

# Update frontend
cd ../frontend
npm install
npm run build
pm2 restart artic-hms-frontend
```
