# ARTIC HMS — Documents Index
# Where to find everything

---

## Quick Reference

| Document | File | When to use |
|----------|------|-------------|
| **Fix Login Issue** | `docs/FIX-LOGIN-ISSUE.md` | Login not working on server |
| **Local Dev Guide** | `docs/1-LOCAL-DEVELOPMENT.md` | Running locally on Windows |
| **Server Guide** | `docs/2-SERVER-DEPLOYMENT.md` | Deploying / updating the server |
| **User Guide** | `docs/3-USER-GUIDE.md` | Using the system (all users) |
| **Technical Overview** | `docs/4-TECHNICAL-OVERVIEW.md` | How the system is built |
| **Project Roadmap** | `docs/5-PROJECT-ROADMAP.md` | What still needs to be built |
| **Mobile App Plan** | `docs/6-MOBILE-APP-PLAN.md` | React Native app plan |
| **HMS Master Document** | `HMS Master Document.md` | Complete system specification |
| **Build Specification** | `ARTIC HMS — COMPLETE BUILD SPECIFICATION.md` | All modules + registries spec |

---

## Live URLs

| What | URL |
|------|-----|
| HMS Frontend | http://172.209.217.176:3001 |
| HMS API Health | http://172.209.217.176:4001/health |
| VMS Frontend | http://172.209.217.176:3000 |
| GitHub | https://github.com/Byiringiro24/ARTIC-Health-Companion |

---

## Key Commands Summary

### Local
```bash
# Start databases
cd docker && docker compose up -d

# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Login at: http://localhost:3000
```

### Server
```bash
# Deploy latest code
ssh artic@172.209.217.176
cd /home/artic/artic-hms
git pull && bash scripts/server-setup.sh

# Quick restart (no rebuild)
pm2 restart artic-hms-backend
pm2 restart artic-hms-frontend

# Check logs
pm2 logs artic-hms-backend --lines 50
```

### GitHub
```bash
# Push changes
git add -A
git commit -m "description"
git push origin main
```
