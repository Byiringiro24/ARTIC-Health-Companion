#!/bin/bash
# One-command deploy — run this INSIDE the server after SSH'ing in
# Usage: bash /home/artic/artic-hms/scripts/quick-deploy.sh

set -e
cd /home/artic/artic-hms

echo "📥 Pulling latest..."
git pull origin main

echo "📦 Installing frontend deps..."
cd frontend
npm install --legacy-peer-deps 2>/dev/null || npm install

echo "🔨 Building Next.js..."
npm run build

echo "🔄 Restarting PM2..."
cd /home/artic/artic-hms
pm2 restart artic-hms-frontend --update-env 2>/dev/null || pm2 start ecosystem.config.cjs --only artic-hms-frontend
pm2 restart artic-hms-backend  --update-env 2>/dev/null || pm2 start ecosystem.config.cjs --only artic-hms-backend

sleep 3
echo ""
echo "📊 Status:"
pm2 list

echo ""
echo "🌐 Health:"
curl -s -o /dev/null -w "Backend  4001: %{http_code}\n" http://localhost:4001/api/health
curl -s -o /dev/null -w "Frontend 3001: %{http_code}\n" http://localhost:3001

echo ""
echo "✅ Deploy complete → http://172.209.217.176:3001"
