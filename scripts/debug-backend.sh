#!/bin/bash
echo "=== PM2 error log (last 30 lines) ==="
tail -30 /home/artic/.pm2/logs/artic-hms-backend-error.log 2>/dev/null

echo ""
echo "=== PM2 out log (last 20 lines) ==="
tail -20 /home/artic/.pm2/logs/artic-hms-backend-out.log 2>/dev/null

echo ""
echo "=== Port check ==="
ss -tlnp 2>/dev/null | grep 4001 || netstat -tlnp 2>/dev/null | grep 4001 || echo "Port 4001 not listening"

echo ""
echo "=== Check for syntax errors ==="
cd /home/artic/artic-hms/backend
node --check src/modules/super-admin/super-admin.service.js 2>&1 | head -10
node --check src/modules/auth/auth.service.js 2>&1 | head -10
