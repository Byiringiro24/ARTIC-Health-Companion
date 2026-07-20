#!/bin/bash
echo "=== Recent backend errors (last 50 lines, filtered) ==="
tail -50 /home/artic/.pm2/logs/artic-hms-backend-error.log | grep -v "routine\|detail\|hint\|schema\|table\|column\|dataType\|constraint\|file:\|line:\|length:\|severity:\|internalQ\|where:\|position:\|internalP" | grep -E "Error|error|FAIL|42[0-9]|message:" | head -20
echo ""
echo "=== Super Admin API test ==="
TOKEN=$(/usr/bin/curl -s -X POST http://localhost:4001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@artic.health","password":"admin123"}' \
  | /usr/bin/python3 -c "import sys,json;print(json.load(sys.stdin).get('accessToken',''))")
for EP in /api/super-admin/stats /api/super-admin/features /api/super-admin/hospitals /api/super-admin/tiers /api/super-admin/audit /api/super-admin/ai/history; do
  S=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" --connect-timeout 5 "http://localhost:4001$EP")
  M="OK"; [ "$S" != "200" ] && M="FAIL"
  echo "  $M $S  $EP"
done
