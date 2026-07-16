# ✅ ARTIC Health Companion — COMPLETED WORK LOG

> Last updated: 2026-07-16
> Server: http://localhost:4000 (new API) | http://localhost:4000 (legacy fallback)

---

## ✅ COMPLETED: Phase 1 — Project Foundation

### What was built
- **Express application** (`backend/src/app.js`) — production-grade HTTP server with:
  - Helmet (security headers)
  - CORS (configurable origins)
  - Morgan (request logging)
  - Cookie parser (HttpOnly refresh token cookies)
  - Global rate limiting (in-memory, 100 req/min default)
  - Global error handler with operational vs unexpected error distinction
  - 404 handler
  - Graceful shutdown (SIGTERM/SIGINT)

- **Entry point** (`backend/src/index.js`) — bootstraps migrations → seed → server start

- **Configuration** (`backend/src/config/index.js`) — centralised typed config from `.env`

- **Environment** (`backend/.env`) — all secrets and config externally managed:
  - PORT=4000
  - JWT_ACCESS_SECRET / JWT_REFRESH_SECRET
  - BCRYPT_ROUNDS=12
  - CORS_ORIGIN
  - Rate limit settings

- **Middleware layer**:
  - `errorHandler.js` — AppError, ValidationError, AuthError, ForbiddenError, NotFoundError, ConflictError classes + asyncHandler wrapper
  - `rateLimiter.js` — pure in-memory rate limiter, no Redis dependency yet (swap for Redis-backed in Phase 9)
  - `validate.js` — declarative request validation middleware
  - `auth.js` — JWT authenticate, authorize(roles), requireModule, auditLog middleware

- **Mobile app scaffold** (`app/`) — 69 stub files created for React Native / Expo:
  - Full folder structure: screens, navigation, hooks, services, store, types, theme, utils
  - `api.ts` — Axios client with auto-refresh interceptor
  - `auth.service.ts` — login, logout, getMe, changePassword, getStoredUser

---

## ✅ COMPLETED: Phase 2 — Database

### What was built
- **Engine**: Node.js built-in `node:sqlite` (Node 24+) — zero native build, zero external deps, production-compatible, swap to PostgreSQL via pg adapter in production
- **Schema** (`backend/src/database/schema.js`) — complete SQLite schema:
  - `tenants` — multi-tenancy root
  - `hospitals` — hospital facilities per tenant
  - `departments` — clinical and admin departments
  - `roles` — 19 system roles
  - `permissions` — granular permission definitions
  - `role_permissions` — role ↔ permission mapping
  - `role_modules` — which modules each role can access
  - `users` — staff accounts with full security fields
  - `refresh_tokens` — JWT refresh token rotation with hashing
  - `audit_logs` — 7-column immutable audit trail
  - `patients` — full patient demographics, insurance, medical history
  - `appointments` — scheduling, queue, status tracking
  - All tables have: `id` (TEXT/UUID), `created_at`, `updated_at`, `deleted_at` (soft delete), `tenant_id`, foreign keys, indexes

- **Migration runner** (`backend/src/database/migrate.js`) — idempotent, safe to run multiple times

- **Seed** (`backend/src/database/seed.js`) — seeds:
  - 1 tenant (ARTIC Health Rwanda)
  - 1 hospital (Kigali District Hospital)
  - 16 departments
  - 19 roles with full module access lists
  - 18 demo staff users (bcrypt-hashed passwords)
  - 5 demo patients with realistic Rwandan data

### Database file location
```
data/artic_health.db   (auto-created on first run)
```

---

## ✅ COMPLETED: Phase 3 — Authentication

### What was built
- **JWT Service** (`backend/src/services/jwt.service.js`):
  - `issueAccessToken()` — 15min JWT signed with HS256
  - `issueRefreshToken()` — UUID + random bytes, SHA-256 hashed in DB
  - `saveRefreshToken()` — persisted with expiry, IP, user-agent
  - `consumeRefreshToken()` — single-use rotation (invalidate on use)
  - `revokeToken()` / `revokeAllUserTokens()` — logout single/all devices
  - `verifyAccessToken()` — throws typed AuthError on expiry or tamper

- **Auth Service** (`backend/src/modules/auth/auth.service.js`):
  - Login — email/password, brute-force lockout (5 attempts → 30min lock), last-login timestamp
  - Refresh — token rotation, user re-validation
  - Logout — single token revocation
  - Logout All — all device revocation
  - Me — current user profile + modules
  - Change Password — current password verification, strength check, all tokens revoked after change

- **Auth Controller** (`backend/src/modules/auth/auth.controller.js`) — clean HTTP layer, delegates to service
- **Auth Routes** (`backend/src/modules/auth/auth.routes.js`):

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/login | Public | Login, returns access+refresh tokens |
| POST | /api/auth/refresh | Public | Rotate refresh token |
| POST | /api/auth/logout | Public | Revoke refresh token |
| POST | /api/auth/logout-all | Protected | Logout all devices |
| GET | /api/auth/me | Protected | Current user + modules |
| POST | /api/auth/change-password | Protected | Change own password |

- **Auth Middleware** (`backend/src/middleware/auth.js`):
  - `authenticate` — verifies JWT, fetches live user from DB, attaches `req.user`
  - `authorize(...roles)` — role-name guard
  - `requireModule(key)` — module-access guard
  - `auditLog(action, module)` — non-blocking audit trail on response finish

---

## ✅ COMPLETED: Users Module (Phase 4 — partial)

### Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /api/users/roles | Protected | List all roles with modules |
| GET | /api/users | Protected | List users (paginated, filterable) |
| GET | /api/users/:id | Protected | Get user by ID |
| POST | /api/users | Admin/Manager/HR | Create user |
| PATCH | /api/users/:id | Admin/Manager/HR | Update user |
| DELETE | /api/users/:id | Admin only | Soft delete user |

---

## ✅ COMPLETED: Patients Module (Phase 5 — partial)

### Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /api/patients | Protected | List patients (paginated, searchable) |
| GET | /api/patients/mrn/:mrn | Protected | Get by Medical Record Number |
| GET | /api/patients/nid/:nid | Protected | Get by National ID |
| GET | /api/patients/:id | Protected | Get by UUID |
| POST | /api/patients | Protected | Register new patient (auto MRN) |
| PATCH | /api/patients/:id | Protected | Update patient |
| DELETE | /api/patients/:id | Protected | Soft delete patient |

---

## ✅ COMPLETED: Dashboard Module

### Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /api/dashboard/kpis | Protected | Live KPIs from database |
| GET | /api/dashboard/modules | Protected | User's accessible modules |

---

## ✅ COMPLETED: Frontend (all 30+ modules as single-page app)

- All 30+ module components in `frontend/components/modules/`
- RBAC — 19 roles, each sees only their permitted modules
- Working forms: patient registration, appointment booking, consultation SOAP, pharmacy dispensing, lab result entry, billing, settings
- Zustand state management for patients, appointments, inventory, lab, billing, toast
- Charts: revenue area chart, pie chart, bar chart, line chart (Recharts)
- Toast notifications with types: success/error/warning/info
- Modal dialogs throughout
- Sidebar collapse toggle
- Notification center with badge counter
- Production build passing: `npm run build` → exit 0

---

## ✅ COMPLETED: Project Structure

- Full scaffold: 378+ files across frontend, backend, app (mobile), docker, infra
- `.gitignore` — excludes node_modules, .next, .env, .kiro
- `README.md` — project documentation with demo credentials
- Committed and pushed to: `github.com/Byiringiro24/ARTIC-Health-Companion`

---

## ✅ VERIFIED ENDPOINTS (live test results)

```
GET  /health                      → 200 { status: "ok", database: "ok" }
POST /api/auth/login              → 200 { accessToken, refreshToken, user, modules }
GET  /api/auth/me                 → 200 { user with role + modules }
GET  /api/patients                → 200 { data: [5 patients], meta: { total: 5 } }
GET  /api/users                   → 200 { data: [18 users], meta: { total: 18 } }
GET  /api/users/roles             → 200 { roles: [19 roles with modules] }
GET  /api/dashboard/kpis          → 200 { kpis: [4 KPIs] }
GET  /api/dashboard/modules       → 200 { modules: [...] }
```
