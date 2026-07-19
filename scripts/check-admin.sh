#!/bin/bash
# Verify all Super Admin API endpoints - uses full binary paths
CURL=/usr/bin/curl
PY=/usr/bin/python3

TOKEN=$($CURL -s -X POST http://localhost:4001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@artic.health","password":"admin123"}' \
  | $PY -c "import sys,json;print(json.load(sys.stdin).get('accessToken','FAILED'))")

echo "Token: ${TOKEN:0:30}..."
echo ""

check() {
  S=$($CURL -s -o /dev/null -w "%{http_code}" -X $1 \
    -H "Authorization: Bearer $TOKEN" --connect-timeout 5 "http://localhost:4001$2")
  M="OK"; [ "$S" != "200" ] && M="FAIL"
  echo "  $M $S  $1 $2"
}

check GET /api/super-admin/stats
check GET /api/super-admin/features
check GET /api/super-admin/hospitals
check GET /api/super-admin/requests
check GET /api/super-admin/invoices
check GET /api/super-admin/tiers
check GET /api/super-admin/audit
check GET "/api/super-admin/ai/history"
check GET /api/super-admin/chat/users

echo ""
echo "--- AI query test ---"
$CURL -s -X POST http://localhost:4001/api/super-admin/ai/query \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"Rwanda MOH protocol for malaria treatment"}' \
  | $PY -c "import sys,json;d=json.load(sys.stdin);print('OK' if d.get('response') else 'FAIL', str(d.get('response',''))[:120])"
