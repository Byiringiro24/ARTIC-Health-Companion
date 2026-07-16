# Running ARTIC Health Companion locally

This guide starts the full Hospital Management System locally: Next.js frontend,
Express API, PostgreSQL, and Redis.

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- Docker Desktop with Docker Compose v2

Verify the tools:

```powershell
node --version
npm --version
docker --version
docker compose version
```

## Option 1: Docker (recommended)

From the repository root:

```powershell
docker compose -f docker/docker-compose.yml up -d --build
docker compose -f docker/docker-compose.yml ps
```

Open these services:

| Service | Address |
| --- | --- |
| Web application | http://localhost:3001 |
| API health check | http://localhost:4001/health |
| PostgreSQL | localhost:5433 |
| Redis | localhost:6380 |

Check logs and health:

```powershell
docker compose -f docker/docker-compose.yml logs -f hms-backend hms-frontend
docker compose -f docker/docker-compose.yml exec -T hms-postgres psql -U Byiringiro -d artic_hms -c "SELECT COUNT(*) FROM patients;"
```

Stop the local stack:

```powershell
docker compose -f docker/docker-compose.yml down
```

To also remove local Docker database data (this permanently deletes local data):

```powershell
docker compose -f docker/docker-compose.yml down -v
```

## Option 2: Run frontend and backend directly

Install workspace dependencies once:

```powershell
npm.cmd install
```

Start PostgreSQL and Redis first using Docker:

```powershell
docker compose -f docker/docker-compose.yml up -d hms-postgres hms-redis
```

Create `backend/.env` from `backend/.env.example` and set the local database URL
to the Docker PostgreSQL instance. Do not commit this file.

```env
PORT=4001
NODE_ENV=development
DATABASE_URL=postgresql://YOUR_POSTGRES_USER:YOUR_POSTGRES_PASSWORD@localhost:5433/artic_hms?sslmode=disable
CORS_ORIGIN=http://localhost:3001,http://localhost:3000
```

In one terminal, run the API:

```powershell
npm.cmd run dev:backend
```

In a second terminal, run the web app:

```powershell
npm.cmd run dev:frontend
```

The native Next.js development server is available at http://localhost:3000.

## Validation commands

```powershell
npm.cmd --workspace frontend exec tsc -- --noEmit
npm.cmd run build
node test_api.mjs
```

`test_api.mjs` expects the API on port `4001`. Do not run it against shared or
production data because it creates a test patient.

## Environment-variable notes

- `NEXT_PUBLIC_API_URL` is used by the Docker frontend build.
- `NEXT_PUBLIC_API_BASE_URL` is supported for older local setups.
- Never commit real `.env` files, database dumps, production passwords, or JWT
  secrets. Use the tracked `.env.example` files as templates.
