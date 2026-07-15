# ARTIC Health Companion Backend

Node.js API service for the HMS platform.

## Run

```bash
npm run dev:backend
```

## Main Endpoints

- `GET /health`
- `POST /api/auth/login`
- `GET /api/roles`
- `GET /api/modules`
- `GET /api/modules?role=doctor`
- `GET /api/me` with `Authorization: Bearer u-003`
- `GET /api/patients`
- `GET /api/appointments`
- `GET /api/dashboard`
- `GET /api/audit`

This backend is intentionally dependency-light for the first scaffold. It is ready to evolve into a NestJS service with PostgreSQL, Prisma, JWT refresh tokens, Redis, Socket.IO, and OpenAPI documentation.
