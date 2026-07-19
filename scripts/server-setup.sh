#!/bin/bash
# ARTIC HMS Server Setup Script v2.0
# Run on the server: bash scripts/server-setup.sh
set -e
cd /home/artic/artic-hms
echo "=== ARTIC HMS Server Setup v2.0 ==="

echo "1. Pulling latest code..."
git pull origin main

echo "2. Checking Docker containers..."
if ! docker ps | grep -q "artic-hms-postgres"; then
  cd docker && docker compose up -d hms-postgres hms-redis && cd ..
  sleep 10
else
  echo "   postgres: running"
fi
docker ps | grep -q "artic-hms-redis" || (cd docker && docker compose up -d hms-redis && cd ..)

echo "3. Writing backend/.env..."
cp /home/artic/artic-hms/backend/.env.server /home/artic/artic-hms/backend/.env
# Strip Windows CRLF line endings that break 'source'
sed -i 's/\r//' /home/artic/artic-hms/backend/.env

echo "4. Installing backend dependencies..."
cd /home/artic/artic-hms/backend && npm install --omit=dev --silent

echo "5. Restarting backend..."
pm2 delete artic-hms-backend 2>/dev/null || true
# Source the .env file so PM2 inherits all environment variables
set -a
source /home/artic/artic-hms/backend/.env
set +a
pm2 start src/index.js --name artic-hms-backend
pm2 save

echo "6. Building and starting frontend..."
cd /home/artic/artic-hms/frontend
npm install --silent
# .env.production already contains NEXT_PUBLIC_API_URL=http://172.209.217.176:4001
# but we pass it explicitly here too in case the file is missing
NEXT_PUBLIC_API_URL=http://172.209.217.176:4001 npm run build
pm2 delete artic-hms-frontend 2>/dev/null || true
pm2 start npm --name artic-hms-frontend -- start -- -p 3001
pm2 save

echo "7. Opening firewall..."
sudo ufw allow 4001/tcp 2>/dev/null || true
sudo ufw allow 3001/tcp 2>/dev/null || true

echo "8. Waiting for startup..."
sleep 12

echo ""
echo "=== VERIFICATION ==="
VMS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 http://localhost:4000/health 2>/dev/null || echo "N/A")
echo "VMS (4000): $VMS  <- must remain unaffected"

HMS=$(curl -s --connect-timeout 5 http://localhost:4001/health 2>/dev/null)
if echo "$HMS" | grep -q '"version":"2.0.0"'; then
  echo "HMS (4001): v2.0.0 OK"
elif echo "$HMS" | grep -q '"status":"ok"'; then
  echo "HMS (4001): OK ($(echo $HMS | python3 -c 'import sys,json;print(json.load(sys.stdin).get("version","?"))' 2>/dev/null))"
else
  echo "HMS (4001): FAILED - run: pm2 logs artic-hms-backend --lines 30"
fi

FRONT=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 http://localhost:3001 2>/dev/null)
echo "Frontend (3001): $FRONT"

echo ""
pm2 list

echo ""
echo "=== ENDPOINT TEST ==="
TOKEN=$(curl -s -X POST http://localhost:4001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"doctor@artic.health","password":"doctor123"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin).get('accessToken',''))" 2>/dev/null)

MANAGER_TOKEN=$(curl -s -X POST http://localhost:4001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"manager@artic.health","password":"manager123"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin).get('accessToken',''))" 2>/dev/null)

NURSE_TOKEN=$(curl -s -X POST http://localhost:4001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"nurse@artic.health","password":"nurse123"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin).get('accessToken',''))" 2>/dev/null)

for EP in /api/appointments /api/appointments/queue /api/laboratory /api/pharmacy/prescriptions /api/inventory /api/radiology /api/notifications "/api/registry/vaccinations/catalogue" "/api/registry/births" "/api/medical-records/summary/p-001"; do
  S=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" --connect-timeout 5 "http://localhost:4001$EP" 2>/dev/null)
  M="OK"; [ "$S" != "200" ] && M="FAIL"
  echo "  $M $S  $EP (doctor)"
done

for EP in /api/billing/invoices /api/insurance /api/reports/kpis /api/reports/revenue; do
  S=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $MANAGER_TOKEN" --connect-timeout 5 "http://localhost:4001$EP" 2>/dev/null)
  M="OK"; [ "$S" != "200" ] && M="FAIL"
  echo "  $M $S  $EP (manager)"
done

for EP in /api/inpatient/beds /api/nursing/triage; do
  S=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $NURSE_TOKEN" --connect-timeout 5 "http://localhost:4001$EP" 2>/dev/null)
  M="OK"; [ "$S" != "200" ] && M="FAIL"
  echo "  $M $S  $EP (nurse)"
done

echo ""
echo "Done. Frontend: http://172.209.217.176:3001"
