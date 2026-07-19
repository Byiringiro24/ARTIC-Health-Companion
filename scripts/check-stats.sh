#!/bin/bash
CURL=/usr/bin/curl
PY=/usr/bin/python3
TOKEN=$($CURL -s -X POST http://localhost:4001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@artic.health","password":"admin123"}' \
  | $PY -c "import sys,json;print(json.load(sys.stdin).get('accessToken',''))")
echo "=== Stats Response ==="
$CURL -s -H "Authorization: Bearer $TOKEN" http://localhost:4001/api/super-admin/stats
echo ""
echo "=== Backend error log (last 10) ==="
pm2 logs artic-hms-backend --lines 10 --nostream 2>&1 | grep "Error\|error\|500" | tail -5
