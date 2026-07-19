#!/bin/bash
# Quick endpoint diagnostic script
TOKEN=$(curl -s -X POST http://localhost:4001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"doctor@artic.health","password":"doctor123"}' \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('accessToken',''))" 2>/dev/null)

echo "Token acquired: ${TOKEN:0:20}..."

echo ""
echo "--- billing/invoices ---"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4001/api/billing/invoices | head -c 300

echo ""
echo "--- inpatient/beds ---"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4001/api/inpatient/beds | head -c 300

echo ""
echo "--- nursing/triage ---"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4001/api/nursing/triage | head -c 300

echo ""
echo "--- reports/kpis ---"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4001/api/reports/kpis | head -c 500

echo ""
echo "--- doctor role token ---"
TOKEN2=$(curl -s -X POST http://localhost:4001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"doctor@artic.health","password":"doctor123"}' \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('role',''),'|',d.get('user',{}).get('role',''))" 2>/dev/null)
echo "Role info: $TOKEN2"
