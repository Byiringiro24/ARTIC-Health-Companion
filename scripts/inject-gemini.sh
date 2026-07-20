#!/bin/bash
# Inject Gemini key into ecosystem config using Python (avoids sed escaping issues)
ECOSYSTEM="/home/artic/artic-hms/backend/ecosystem.config.cjs"
GEMINI_KEY="AIzaSyAb8RN6LKirr2MOJn-0iybuUApe_Bj-GdsjKfA2icv76L7H85kA"

/usr/bin/python3 -c "
import sys
key = '$GEMINI_KEY'
with open('$ECOSYSTEM', 'r') as f:
    content = f.read()
# Replace placeholder
content = content.replace('REPLACE_WITH_NEW_GEMINI_KEY', key)
# Also handle if already set to old value
with open('$ECOSYSTEM', 'w') as f:
    f.write(content)
print('Gemini key injected into ecosystem config')
"

# Update .env too
ENV_FILE="/home/artic/artic-hms/backend/.env"
if grep -q "^GEMINI_API_KEY=" "$ENV_FILE"; then
  /usr/bin/python3 -c "
import re
with open('$ENV_FILE', 'r') as f:
    content = f.read()
content = re.sub(r'^GEMINI_API_KEY=.*', 'GEMINI_API_KEY=$GEMINI_KEY', content, flags=re.MULTILINE)
with open('$ENV_FILE', 'w') as f:
    f.write(content)
print('Gemini key updated in .env')
"
else
  echo "" >> "$ENV_FILE"
  echo "GEMINI_API_KEY=$GEMINI_KEY" >> "$ENV_FILE"
  echo "Gemini key appended to .env"
fi

# Restart backend
cd /home/artic/artic-hms/backend
pm2 delete artic-hms-backend 2>/dev/null || true
pm2 start /home/artic/artic-hms/backend/ecosystem.config.cjs
pm2 save

sleep 8

echo ""
echo "=== Backend health ==="
/usr/bin/curl -s http://localhost:4001/health

echo ""
echo "=== Testing AI endpoint ==="
TOKEN=$(/usr/bin/curl -s -X POST http://localhost:4001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@artic.health","password":"admin123"}' \
  | /usr/bin/python3 -c "import sys,json;print(json.load(sys.stdin).get('accessToken','FAILED'))" 2>/dev/null)
echo "Token: ${TOKEN:0:20}..."

AI_RESULT=$(/usr/bin/curl -s -X POST http://localhost:4001/api/super-admin/ai/query \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"query":"Rwanda malaria treatment"}')
echo "AI response: $AI_RESULT" | head -c 300
