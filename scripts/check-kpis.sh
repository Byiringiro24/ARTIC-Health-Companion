#!/bin/bash
# Detailed KPI error check
TOKEN=$(curl -s -X POST http://localhost:4001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"manager@artic.health","password":"manager123"}' \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('accessToken','FAILED'))")

echo "Token: ${TOKEN:0:30}..."
echo ""
echo "--- reports/kpis (manager) ---"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4001/api/reports/kpis

echo ""
echo "--- reports/revenue ---"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4001/api/reports/revenue

echo ""
echo "--- PM2 backend last 20 lines ---"
pm2 logs artic-hms-backend --lines 20 --nostream 2>&1
