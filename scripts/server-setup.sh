#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# ARTIC Health Companion — Server Setup Script
# Runs on Ubuntu 24.04 alongside the existing ARTIC VMS project
#
# SAFE: Uses ports 4001 (backend) and 3001 (frontend) — VMS keeps 4000/3000
# SAFE: Creates a NEW postgres database artic_hms — VMS fleet_management untouched
# SAFE: Uses the SAME redis with key prefix "hms:" — no collision with VMS keys
#
# Usage:
#   scp scripts/server-setup.sh artic@172.209.217.176:/home/artic/
#   ssh artic@172.209.217.176 "bash server-setup.sh"
# ═══════════════════════════════════════════════════════════════════════════════

set -e  # Exit on any error

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()  { echo -e "${GREEN}[HMS]${NC} $1"; }
warn() { echo -e "${YELLOW}[HMS WARN]${NC} $1"; }
err()  { echo -e "${RED}[HMS ERROR]${NC} $1"; exit 1; }
step() { echo -e "\n${BLUE}══════ $1 ══════${NC}"; }

# ── Config ────────────────────────────────────────────────────────────────────
HMS_DIR="/home/artic/artic-hms"
HMS_BACKEND_PORT=4001
HMS_FRONTEND_PORT=3001
HMS_DB_NAME="artic_hms"
HMS_DB_USER="artic_hms_user"
HMS_DB_PASS="HmsArtic\$2026!$(openssl rand -hex 4)"
HMS_REPO="https://github.com/Byiringiro24/ARTIC-Health-Companion.git"
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "172.209.217.176")

# ──────────────────────────────────────────────────────────────────────────────
step "1. Verify server prerequisites"
# ──────────────────────────────────────────────────────────────────────────────

# Check Node 24+
NODE_VER=$(node --version 2>/dev/null || echo "none")
if [[ "$NODE_VER" < "v24" ]]; then
  log "Installing Node.js 24..."
  curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  log "Node.js $NODE_VER ✓"
fi

# Check PM2
if ! command -v pm2 &>/dev/null; then
  log "Installing PM2..."
  sudo npm install -g pm2
else
  log "PM2 $(pm2 --version) ✓"
fi

# Check Nginx
if ! command -v nginx &>/dev/null; then
  log "Installing Nginx..."
  sudo apt-get install -y nginx
  sudo systemctl enable nginx
else
  log "Nginx ✓"
fi

# Check Docker
if ! command -v docker &>/dev/null; then
  warn "Docker not found — HMS will run directly with PM2 (no Docker needed)"
else
  log "Docker $(docker --version | cut -d' ' -f3 | tr -d ',') ✓"
fi

# Check ports are free
if lsof -i :$HMS_BACKEND_PORT &>/dev/null; then
  warn "Port $HMS_BACKEND_PORT already in use — checking if it's HMS itself..."
  lsof -i :$HMS_BACKEND_PORT || true
fi

# ──────────────────────────────────────────────────────────────────────────────
step "2. Clone / update ARTIC Health Companion"
# ──────────────────────────────────────────────────────────────────────────────

if [ -d "$HMS_DIR/.git" ]; then
  log "Repository already cloned — pulling latest..."
  cd "$HMS_DIR"
  git pull origin main
else
  log "Cloning repository..."
  cd /home/artic
  git clone "$HMS_REPO" artic-hms
  cd artic-hms
fi

# ──────────────────────────────────────────────────────────────────────────────
step "3. Create PostgreSQL database for HMS"
# ──────────────────────────────────────────────────────────────────────────────

# Detect how postgres is running (Docker or native)
PG_CONTAINER=$(docker ps --filter name=postgres --format "{{.Names}}" 2>/dev/null | head -1)

if [ -n "$PG_CONTAINER" ]; then
  log "PostgreSQL found in Docker container: $PG_CONTAINER"
  
  # Check if artic_hms DB already exists
  DB_EXISTS=$(docker exec "$PG_CONTAINER" psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$HMS_DB_NAME'" 2>/dev/null || \
              docker exec "$PG_CONTAINER" psql -U artic_user -d fleet_management -tAc "SELECT 1 FROM pg_database WHERE datname='$HMS_DB_NAME'" 2>/dev/null || echo "")
  
  if [ "$DB_EXISTS" = "1" ]; then
    log "Database $HMS_DB_NAME already exists ✓"
  else
    log "Creating database $HMS_DB_NAME..."
    # Try with postgres superuser first, fall back to artic_user
    docker exec "$PG_CONTAINER" psql -U postgres -c "CREATE DATABASE $HMS_DB_NAME;" 2>/dev/null || \
    docker exec "$PG_CONTAINER" psql -U artic_user -d fleet_management -c "CREATE DATABASE $HMS_DB_NAME;" || true
    
    docker exec "$PG_CONTAINER" psql -U postgres -c "CREATE USER $HMS_DB_USER WITH PASSWORD '$HMS_DB_PASS';" 2>/dev/null || \
    docker exec "$PG_CONTAINER" psql -U artic_user -d fleet_management -c "DO \$\$ BEGIN CREATE USER $HMS_DB_USER WITH PASSWORD '$HMS_DB_PASS'; EXCEPTION WHEN duplicate_object THEN NULL; END \$\$;" 2>/dev/null || true
    
    docker exec "$PG_CONTAINER" psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $HMS_DB_NAME TO $HMS_DB_USER;" 2>/dev/null || true
    
    log "Database created ✓"
  fi
  
  PG_HOST="localhost"
  # Get the port postgres container exposes
  PG_PORT=$(docker port "$PG_CONTAINER" 5432 2>/dev/null | cut -d: -f2 || echo "5432")
  
else
  log "PostgreSQL running natively"
  PG_HOST="localhost"
  PG_PORT="5432"
  
  sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname='$HMS_DB_NAME';" 2>/dev/null | grep -q 1 || {
    sudo -u postgres psql -c "CREATE DATABASE $HMS_DB_NAME;"
    sudo -u postgres psql -c "CREATE USER $HMS_DB_USER WITH PASSWORD '$HMS_DB_PASS';" 2>/dev/null || true
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $HMS_DB_NAME TO $HMS_DB_USER;"
    log "Native PostgreSQL database created ✓"
  }
fi

# ──────────────────────────────────────────────────────────────────────────────
step "4. Configure backend environment"
# ──────────────────────────────────────────────────────────────────────────────

cd "$HMS_DIR/backend"

# Generate JWT secrets
JWT_ACCESS=$(openssl rand -hex 32)
JWT_REFRESH=$(openssl rand -hex 32)

# Check Redis
REDIS_URL="redis://localhost:6379"
REDIS_CONTAINER=$(docker ps --filter name=redis --format "{{.Names}}" 2>/dev/null | head -1)
if [ -n "$REDIS_CONTAINER" ]; then
  log "Redis found in Docker container: $REDIS_CONTAINER ✓"
else
  log "Using Redis at $REDIS_URL"
fi

cat > .env << EOF
# ARTIC Health Companion — Production Environment
# Generated by server-setup.sh on $(date)
# DO NOT COMMIT THIS FILE

# ── Server ────────────────────────────────────────────────────────────────────
PORT=$HMS_BACKEND_PORT
NODE_ENV=production

# ── Database (SQLite for Phase 1-3, PostgreSQL ready) ─────────────────────────
DATABASE_PATH=./data/artic_health.db
DATABASE_URL=postgresql://${HMS_DB_USER}:${HMS_DB_PASS}@${PG_HOST}:${PG_PORT}/${HMS_DB_NAME}?schema=public&sslmode=disable

# ── JWT ────────────────────────────────────────────────────────────────────────
JWT_ACCESS_SECRET=$JWT_ACCESS
JWT_REFRESH_SECRET=$JWT_REFRESH
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# ── Security ──────────────────────────────────────────────────────────────────
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://${SERVER_IP}:${HMS_FRONTEND_PORT},http://${SERVER_IP}:${HMS_BACKEND_PORT}

# ── Redis (shared with VMS, different key prefix) ─────────────────────────────
REDIS_URL=$REDIS_URL
REDIS_PREFIX=hms:

# ── Rate limiting ─────────────────────────────────────────────────────────────
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=200
AUTH_RATE_LIMIT_MAX=10

# ── Facility ──────────────────────────────────────────────────────────────────
DEFAULT_FACILITY=Kigali District Hospital
DEFAULT_TIMEZONE=Africa/Kigali
DEFAULT_CURRENCY=RWF
EOF

log "Backend .env created ✓"

# ──────────────────────────────────────────────────────────────────────────────
step "5. Install backend dependencies and start"
# ──────────────────────────────────────────────────────────────────────────────

cd "$HMS_DIR/backend"
npm install --omit=dev

# Stop existing PM2 process if running
pm2 delete artic-hms-backend 2>/dev/null || true

# Start backend
pm2 start src/index.js \
  --name artic-hms-backend \
  --env production \
  --log /home/artic/logs/hms-backend.log \
  --error /home/artic/logs/hms-backend-error.log

log "Backend started on port $HMS_BACKEND_PORT ✓"

# Wait for startup
sleep 4

# Health check
HEALTH=$(curl -sf "http://localhost:$HMS_BACKEND_PORT/health" | grep -o '"status":"ok"' || echo "")
if [ -n "$HEALTH" ]; then
  log "Backend health check PASSED ✓"
else
  warn "Backend health check failed — checking logs..."
  pm2 logs artic-hms-backend --lines 20 --nostream
fi

# ──────────────────────────────────────────────────────────────────────────────
step "6. Build and start frontend"
# ──────────────────────────────────────────────────────────────────────────────

mkdir -p /home/artic/logs

cd "$HMS_DIR/frontend"
npm install

# Build with correct API URL
NEXT_PUBLIC_API_URL="http://${SERVER_IP}:${HMS_BACKEND_PORT}" npm run build

# Stop existing PM2 process if running
pm2 delete artic-hms-frontend 2>/dev/null || true

# Start frontend on port 3001
PORT=$HMS_FRONTEND_PORT pm2 start npm \
  --name artic-hms-frontend \
  -- start \
  --log /home/artic/logs/hms-frontend.log

log "Frontend started on port $HMS_FRONTEND_PORT ✓"
sleep 3

# ──────────────────────────────────────────────────────────────────────────────
step "7. Configure Nginx"
# ──────────────────────────────────────────────────────────────────────────────

# Check if HMS nginx config already exists
if [ -f /etc/nginx/sites-enabled/artic-hms ]; then
  warn "HMS Nginx config already exists — skipping"
else
  # Add rate limit zone to nginx.conf if not present
  if ! sudo grep -q "hms_api" /etc/nginx/nginx.conf; then
    sudo sed -i '/http {/a\    limit_req_zone $binary_remote_addr zone=hms_api:10m rate=10r\/s;' /etc/nginx/nginx.conf
  fi

  # Create nginx site config for direct IP access (no domain needed)
  sudo tee /etc/nginx/sites-available/artic-hms > /dev/null << NGINXEOF
# ARTIC Health Companion — Nginx config
# HMS Frontend: port 3001 | HMS Backend: port 4001
# Does NOT touch VMS config (ports 3000/4000)

server {
    listen 80;
    server_name ${SERVER_IP} _;

    # Redirect root to HMS or VMS selector (optional)
    location = / {
        return 302 /hms/;
    }

    # HMS Frontend (under /hms/ path prefix)
    location /hms/ {
        proxy_pass         http://127.0.0.1:${HMS_FRONTEND_PORT}/;
        proxy_http_version 1.1;
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_read_timeout 60;
    }

    # HMS Backend API
    location /hms-api/ {
        rewrite ^/hms-api/(.*) /\$1 break;
        proxy_pass         http://127.0.0.1:${HMS_BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_read_timeout 30;
        limit_req zone=hms_api burst=20 nodelay;
    }

    # HMS health check
    location = /hms-health {
        proxy_pass http://127.0.0.1:${HMS_BACKEND_PORT}/health;
        access_log off;
    }
}
NGINXEOF

  sudo ln -sf /etc/nginx/sites-available/artic-hms /etc/nginx/sites-enabled/artic-hms

  # Test and reload (VMS completely unaffected — reload is zero-downtime)
  sudo nginx -t && sudo systemctl reload nginx
  log "Nginx configured ✓"
fi

# ──────────────────────────────────────────────────────────────────────────────
step "8. Save PM2 and configure auto-start"
# ──────────────────────────────────────────────────────────────────────────────

pm2 save
log "PM2 processes saved ✓"

# ──────────────────────────────────────────────────────────────────────────────
step "9. Open firewall ports"
# ──────────────────────────────────────────────────────────────────────────────

sudo ufw allow $HMS_BACKEND_PORT/tcp comment "HMS Backend API" 2>/dev/null || true
sudo ufw allow $HMS_FRONTEND_PORT/tcp comment "HMS Frontend" 2>/dev/null || true
log "Firewall ports opened ✓"

# ──────────────────────────────────────────────────────────────────────────────
step "10. Final verification"
# ──────────────────────────────────────────────────────────────────────────────

echo ""
pm2 list
echo ""

# Test HMS endpoints
log "Testing HMS API..."
HEALTH=$(curl -sf "http://localhost:$HMS_BACKEND_PORT/health")
echo "  Health: $HEALTH"

LOGIN=$(curl -sf -X POST "http://localhost:$HMS_BACKEND_PORT/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@artic.health","password":"doctor123"}')
if echo "$LOGIN" | grep -q '"success":true'; then
  log "Login endpoint PASSED ✓"
  TOKEN=$(echo "$LOGIN" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
  
  PATIENTS=$(curl -sf "http://localhost:$HMS_BACKEND_PORT/api/patients" \
    -H "Authorization: Bearer $TOKEN")
  if echo "$PATIENTS" | grep -q '"success":true'; then
    TOTAL=$(echo "$PATIENTS" | grep -o '"total":[0-9]*' | cut -d: -f2)
    log "Patients endpoint PASSED — $TOTAL patients ✓"
  fi
else
  warn "Login endpoint check failed — review logs: pm2 logs artic-hms-backend"
fi

# Verify VMS is still running
echo ""
log "Verifying VMS is unaffected..."
VMS_HEALTH=$(curl -sf "http://localhost:4000/health" 2>/dev/null || echo "not-running")
if echo "$VMS_HEALTH" | grep -q "ok"; then
  log "VMS backend still running on port 4000 ✓"
else
  warn "VMS backend not responding on port 4000 (may not be running or on different port)"
fi

# ──────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ARTIC Health Companion — Deployed Successfully!             ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Backend API:  http://${SERVER_IP}:${HMS_BACKEND_PORT}                  ║${NC}"
echo -e "${GREEN}║  Frontend:     http://${SERVER_IP}:${HMS_FRONTEND_PORT}                  ║${NC}"
echo -e "${GREEN}║  Health:       http://${SERVER_IP}:${HMS_BACKEND_PORT}/health             ║${NC}"
echo -e "${GREEN}║                                                              ║${NC}"
echo -e "${GREEN}║  VMS Backend:  http://${SERVER_IP}:4000  (unchanged)         ║${NC}"
echo -e "${GREEN}║  VMS Frontend: http://${SERVER_IP}:3000  (unchanged)         ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Demo login: doctor@artic.health / doctor123                ║${NC}"
echo -e "${GREEN}║  Admin:      admin@artic.health  / admin123                 ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════════════╣${NC}"
echo -e "${YELLOW}║  IMPORTANT — Save these credentials:                        ║${NC}"
echo -e "${YELLOW}║  DB Password: $HMS_DB_PASS      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
log "Setup complete. Check logs: pm2 logs artic-hms-backend"
