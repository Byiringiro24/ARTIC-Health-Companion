# Login Not Working — Fix

## Root Cause
The server PM2 process was started pointing to `src/server.js` (old in-memory server)
instead of `src/index.js` (full Express + PostgreSQL backend).

`src/server.js` uses user.id as the bearer token.
`src/index.js` uses real JWT tokens.
The frontend now expects real JWT → login fails.

## Fix (run on server)

```bash
ssh artic@172.209.217.176
cd /home/artic/artic-hms
git pull origin main
bash scripts/server-setup.sh
```

## Verify

```bash
curl http://localhost:4001/health
# Must show: "version":"2.0.0"

curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@artic.health","password":"doctor123"}'
# Must return: { "accessToken": "eyJ..." }
```

## All working credentials after fix

| Email | Password | Role |
|-------|----------|------|
| admin@artic.health | admin123 | System Admin |
| doctor@artic.health | doctor123 | Doctor |
| nurse@artic.health | nurse123 | Nurse |
| pharmacy@artic.health | pharmacy123 | Pharmacist |
| lab@artic.health | lab123 | Lab Scientist |
| reception@artic.health | front123 | Receptionist |
| accounts@artic.health | money123 | Accountant |
| patient@artic.health | patient123 | Patient |
