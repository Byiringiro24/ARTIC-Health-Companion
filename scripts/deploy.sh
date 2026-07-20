#!/bin/bash
# ── ARTIC HMS — Deploy Script ──────────────────────────────────────────────────
set -e

PROJECT_DIR="/home/artic/artic-hms"
FRONTEND_DIR="$PROJECT_DIR/frontend"
BACKEND_DIR="$PROJECT_DIR/backend"

echo "🚀 ARTIC HMS Deploy — $(date)"
echo "================================================"

cd "$PROJECT_DIR"

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# ── FRONTEND BUILD ─────────────────────────────────────────────────────────────
echo ""
echo "🔨 Building frontend..."
cd "$FRONTEND_DIR"

# Install any new dependencies
npm install --legacy-peer-deps 2>/dev/null || npm install

# Build Next.js
npm run build

echo "✅ Frontend build complete"

# ── BACKEND RESTART ────────────────────────────────────────────────────────────
echo ""
echo "🔄 Restarting backend..."
cd "$BACKEND_DIR"

# Reload env vars from .env.server if it exists
if [ -f ".env.server" ]; then
  echo "  Loading .env.server..."
  set -a
  source .env.server
  set +a
fi

# Restart via PM2
pm2 restart artic-hms-backend --update-env 2>/dev/null || pm2 start ecosystem.config.cjs

echo "✅ Backend restarted"

# ── FRONTEND RESTART ───────────────────────────────────────────────────────────
echo ""
echo "🔄 Restarting frontend..."
pm2 restart artic-hms-frontend --update-env 2>/dev/null || pm2 start ecosystem.config.cjs

echo "✅ Frontend restarted"

# ── STATUS ─────────────────────────────────────────────────────────────────────
echo ""
echo "📊 PM2 Process Status:"
pm2 list

echo ""
echo "🌐 Health Checks:"
sleep 3
curl -s -o /dev/null -w "Backend  (4001): HTTP %{http_code}\n" http://localhost:4001/api/health || echo "Backend: not responding yet"
curl -s -o /dev/null -w "Frontend (3001): HTTP %{http_code}\n" http://localhost:3001 || echo "Frontend: not responding yet"

echo ""
echo "================================================"
echo "✅ Deploy complete! http://172.209.217.176:3001"
