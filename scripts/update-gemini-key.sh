#!/bin/bash
# Update Gemini API key in ecosystem config and reload PM2
# Usage: bash scripts/update-gemini-key.sh YOUR_NEW_GEMINI_KEY
# Get a new key at: https://aistudio.google.com/app/apikey

set -e
NEW_KEY="${1:-}"
if [ -z "$NEW_KEY" ]; then
  echo "Usage: bash scripts/update-gemini-key.sh YOUR_NEW_GEMINI_KEY"
  exit 1
fi

ECOSYSTEM="/home/artic/artic-hms/backend/ecosystem.config.cjs"
ENV_FILE="/home/artic/artic-hms/backend/.env"

echo "Updating GEMINI_API_KEY in ecosystem config..."
sed -i "s|GEMINI_API_KEY:.*|GEMINI_API_KEY: \"$NEW_KEY\",|g" "$ECOSYSTEM"

echo "Updating GEMINI_API_KEY in .env..."
sed -i "s|^GEMINI_API_KEY=.*|GEMINI_API_KEY=$NEW_KEY|g" "$ENV_FILE"

echo "Reloading PM2..."
pm2 reload artic-hms-backend

sleep 4
echo "Testing AI endpoint..."
TOKEN=$(/usr/bin/curl -s -X POST http://localhost:4001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@artic.health","password":"admin123"}' \
  | /usr/bin/python3 -c "import sys,json;print(json.load(sys.stdin).get('accessToken',''))")

RESULT=$(/usr/bin/curl -s -X POST http://localhost:4001/api/super-admin/ai/query \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"query":"What is Rwanda MOH malaria treatment protocol?"}' \
  | /usr/bin/python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('source','?'),'|',str(d.get('response',''))[:80])")

echo "AI response: $RESULT"
echo ""
echo "Done. Gemini key updated successfully."
