#!/bin/bash
# Test email SMTP connection and send a test email
CURL=/usr/bin/curl
PY=/usr/bin/python3

TOKEN=$($CURL -s -X POST http://localhost:4001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@artic.health","password":"admin123"}' \
  | $PY -c "import sys,json;print(json.load(sys.stdin).get('accessToken',''))")

echo "=== Email config check ==="
echo "SMTP_HOST: $SMTP_HOST"
echo "SMTP_USER: $SMTP_USER"
echo "SMTP_PASS set: $([ -n '$SMTP_PASS' ] && echo YES || echo NO)"

echo ""
echo "=== Backend email log (last 15 lines) ==="
pm2 logs artic-hms-backend --lines 15 --nostream 2>&1 | grep -i "email\|smtp\|EAUTH\|✅\|⚠️\|Error" | tail -10

echo ""
echo "=== Test password reset email via API ==="
$CURL -s -X POST http://localhost:4001/api/auth/forgot-password \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@artic.health"}' | $PY -c "import sys,json;d=json.load(sys.stdin);print('Result:',d)"
