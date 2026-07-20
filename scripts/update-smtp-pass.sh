#!/bin/bash
# Update Gmail App Password in ecosystem config and reload PM2
# Usage: bash scripts/update-smtp-pass.sh YOUR_NEW_16CHAR_APP_PASSWORD
#
# After revoking the old password at myaccount.google.com/apppasswords,
# generate a new one and run this script.

set -e
NEW_PASS="${1:-}"

if [ -z "$NEW_PASS" ]; then
  echo "Usage: bash scripts/update-smtp-pass.sh YOUR_16CHAR_APP_PASSWORD"
  echo "Example: bash scripts/update-smtp-pass.sh abcdefghijklmnop"
  exit 1
fi

# Strip spaces if user copied with spaces
NEW_PASS=$(echo "$NEW_PASS" | tr -d ' ')

ECOSYSTEM="/home/artic/artic-hms/backend/ecosystem.config.cjs"
ENV_FILE="/home/artic/artic-hms/backend/.env"

echo "Updating SMTP_PASS in ecosystem config..."
sed -i "s|SMTP_PASS:.*|SMTP_PASS:           \"$NEW_PASS\",|g" "$ECOSYSTEM"

echo "Updating SMTP_PASS in .env..."
sed -i "s|^SMTP_PASS=.*|SMTP_PASS=$NEW_PASS|g" "$ENV_FILE"

echo "Reloading PM2..."
pm2 reload artic-hms-backend

sleep 4

echo ""
echo "=== Verifying email config ==="
pm2 logs artic-hms-backend --lines 10 --nostream 2>&1 | grep -E 'Email|email|SMTP|✅|⚠|ready' | head -5
echo ""
echo "Done. App Password updated successfully."
echo "Test by creating a hospital with an email address in the Super Admin portal."
