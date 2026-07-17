#!/bin/bash
# â”€â”€â”€ ARTIC HMS â€” Server Setup Script â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# Run this once on the server after git clone / git pull
# Usage: bash scripts/server-setup.sh
# Safe to run multiple times.

set -e
cd /home/artic/artic-hms

echo "=== ARTIC HMS Server Setup ==="
echo ""

# â”€â”€ 1. Check Docker containers (postgres + redis) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo "1. Checking HMS Docker containers..."
if ! docker ps | grep -q "artic-hms-postgres"; then
  echo "   Starting HMS databases..."
  cd docker && docker compose up -d hms-postgres hms-redis && cd ..
  echo "   Waiting 10s for postgres to initialise..."
  sleep 10
else
  echo "   postgres: running âœ“"
fi
if ! docker ps | grep -q "artic-hms-redis"; then
  echo "   Starting HMS redis..."
  cd docker && docker compose up -d hms-redis && cd ..
else
  echo "   redis: running âœ“"
fi

# â”€â”€ 2. Verify postgres connectivity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo ""
echo "2. Verifying PostgreSQL..."
docker exec artic-hms-postgres psql -U Byiringiro -d artic_hms -c "SELECT 1 as ok;" -t 2>/dev/null \
  && echo "   PostgreSQL: connected âœ“" \
  || echo "   WARNING: PostgreSQL connection failed â€” check container"

# â”€â”€ 3. Write backend .env â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo ""
echo "3. Writing backend/.env..."
cat > /home/artic/artic-hms/backend/.env << 'ENVEOF'
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
ENVEOF
echo "   .env written âœ“"

# â”€â”€ 4. Install backend dependencies â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo ""
echo "4. Installing backend dependencies..."
cd /home/artic/artic-hms/backend
npm install --omit=dev --silent
echo "   npm install âœ“"

# â”€â”€ 5. Start/restart backend with PM2 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo ""
echo "5. Starting backend with PM2..."
pm2 delete artic-hms-backend 2>/dev/null || true
pm2 start src/index.js \
  --name artic-hms-backend \
  --node-args="--env-file=/home/artic/artic-hms/backend/.env"
pm2 save
echo "   PM2 backend started âœ“"

# â”€â”€ 6. Build and start frontend â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo ""
echo "6. Building frontend..."
cd /home/artic/artic-hms/frontend
npm install --silent
NEXT_PUBLIC_API_URL=http://172.209.217.176:4001 npm run build
pm2 delete artic-hms-frontend 2>/dev/null || true
pm2 start npm --name artic-hms-frontend -- start -- -p 3001
pm2 save
echo "   Frontend started âœ“"

# â”€â”€ 7. UFW firewall â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo ""
echo "7. Checking firewall..."
sudo ufw allow 4001/tcp 2>/dev/null && echo "   ufw 4001 added âœ“" || echo "   ufw 4001 already open âœ“"
sudo ufw allow 3001/tcp 2>/dev/null && echo "   ufw 3001 added âœ“" || echo "   ufw 3001 already open âœ“"

# â”€â”€ 8. Wait and verify â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo ""
echo "8. Waiting 8s for startup..."
sleep 8

echo ""
echo "=== Verification ==="
echo ""

# VMS â€” must still work
VMS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 http://localhost:4000/health 2>/dev/null || echo "ERR")
echo "VMS backend  (4000): $VMS_STATUS  â† must be 200, must NOT be affected"

# HMS
HMS_HEALTH=$(curl -s --connect-timeout 5 http://localhost:4001/health 2>/dev/null)
if echo "$HMS_HEALTH" | grep -q '"version":"2.0.0"'; then
  echo "HMS backend  (4001): 200 â€” version 2.0.0 âœ“ FULL HMS ACTIVE"
  echo "HMS phase: $(echo $HMS_HEALTH | python3 -c 'import sys,json; print(json.load(sys.stdin).get("phase","?")[:60])' 2>/dev/null)"
elif echo "$HMS_HEALTH" | grep -q '"status":"ok"'; then
  echo "HMS backend  (4001): 200 â€” $(echo $HMS_HEALTH | python3 -c 'import sys,json; d=json.load(sys.stdin); print("v"+d.get("version","?")+" db="+d.get("database","?"))' 2>/dev/null)"
else
  echo "HMS backend  (4001): FAILED â€” $HMS_HEALTH"
fi

HMS_FRONT=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 http://localhost:3001 2>/dev/null || echo "ERR")
echo "HMS frontend (3001): $HMS_FRONT"

echo ""
echo "=== PM2 Status ==="
pm2 list

echo ""
echo "=== All endpoints ==="
TOKEN=$(curl -s -X POST http://localhost:4001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"doctor@artic.health","password":"doctor123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('accessToken',''))" 2>/dev/null)

for EP in /api/appointments /api/laboratory /api/pharmacy/prescriptions /api/billing/invoices /api/insurance /api/inventory /api/radiology /api/notifications /api/reports/kpis /api/medical-records/summary/p-001; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" --connect-timeout 5 http://localhost:4001$EP 2>/dev/null)
  MARK="âœ“"
  [ "$STATUS" != "200" ] && MARK="âœ—"
  echo "  $MARK $STATUS  $EP"
done

echo ""
echo "Setup complete."
echo "Frontend: http://172.209.217.176:3001"
echo "Backend:  http://172.209.217.176:4001/health"
