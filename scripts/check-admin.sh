#!/bin/bash
# Verify all Super Admin API endpoints
TOKEN=$(curl -s -X POST http://localhost:4001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@artic.health","password":"admin123"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin).get('accessToken','FAILED'))")

echo "Token: ${TOKEN:0:30}..."
echo ""

for EP in \
  "GET /api/super-admin/stats" \
  "GET /api/super-admin/features" \
  "GET /api/super-admin/hospitals" \
  "GET /api/super-admin/requests" \
  "GET /api/super-admin/invoices" \
  "GET /api/super-admin/tiers" \
  "GET /api/super-admin/audit" \
  "GET /api/super-admin/ai/history" \
  "GET /api/super-admin/chat/users"; do
  METHOD=$(echo $EP | cut -d' ' -f1)
  PATH=$(echo $EP | cut -d' ' -f2)
  S=$(curl -s -o /dev/null -w "%{http_code}" -X $METHOD \
    -H "Authorization: Bearer $TOKEN" --connect-timeout 5 "http://localhost:4001$PATH")
  M="OK"; [ "$S" != "200" ] && M="FAIL"
  echo "  $M $S  $METHOD $PATH"
done

echo ""
echo "--- POST /api/super-admin/ai/query ---"
curl -s -X POST http://localhost:4001/api/super-admin/ai/query \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"Rwanda MOH protocol for malaria treatment"}' | head -c 300
echo ""
