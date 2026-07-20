#!/bin/bash
echo "=== Service Status ==="
/usr/bin/curl -s http://localhost:4001/health | /usr/bin/python3 -c "import sys,json;d=json.load(sys.stdin);print('Backend:',d.get('version','?'),d.get('status','?'))"
echo "Frontend: $(/usr/bin/curl -s -o /dev/null -w '%{http_code}' http://localhost:3001)"
pm2 list | grep -E "artic-hms|online|stopped"

echo ""
echo "=== New Endpoints Test ==="
TOKEN=$(/usr/bin/curl -s -X POST http://localhost:4001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"manager@artic.health","password":"manager123"}' \
  | /usr/bin/python3 -c "import sys,json;print(json.load(sys.stdin).get('accessToken','FAILED'))")
echo "Manager token: ${TOKEN:0:20}..."

# Test AI with Gemini
AI_RESP=$(/usr/bin/curl -s -X POST http://localhost:4001/api/super-admin/ai/query \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"query":"What is Rwanda malaria treatment protocol?"}' \
  | /usr/bin/python3 -c "import sys,json;d=json.load(sys.stdin);print('Source:',d.get('source','?'),'|',str(d.get('response',''))[:100])")
echo "AI: $AI_RESP"

# Test OTP endpoint
OTP_RESP=$(/usr/bin/curl -s -o /dev/null -w '%{http_code}' -X POST http://localhost:4001/api/auth/request-otp \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"currentPassword":"manager123"}')
echo "OTP endpoint: $OTP_RESP (200=OK)"
