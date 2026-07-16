/**
 * ARTIC HMS API test — pure Node.js, no external deps
 */

const BASE = "http://localhost:4001";
let pass = 0; let fail = 0;

async function req(method, path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(`${BASE}${path}`, opts);
  const data = await r.json().catch(() => ({}));
  return { status: r.status, data };
}

async function test(label, fn) {
  try {
    const result = await fn();
    if (result) {
      console.log(`  ✅ PASS  ${label}`);
      pass++;
    } else {
      console.log(`  ❌ FAIL  ${label}`);
      fail++;
    }
  } catch (e) {
    console.log(`  ❌ FAIL  ${label} — ${e.message}`);
    fail++;
  }
}

console.log("\n╔══════════════════════════════════════════════╗");
console.log("║  ARTIC HMS — Full API Verification           ║");
console.log("╚══════════════════════════════════════════════╝\n");

// ── Health ────────────────────────────────────────────────────────────────────
await test("GET /health", async () => {
  const { status, data } = await req("GET", "/health");
  console.log(`         db=${data.database}  env=${data.environment}  version=${data.version}`);
  return status === 200 && data.status === "ok" && data.database === "ok";
});

// ── Login (doctor) ────────────────────────────────────────────────────────────
let tok = null;
await test("POST /api/auth/login (doctor)", async () => {
  const { status, data } = await req("POST", "/api/auth/login", { email: "doctor@artic.health", password: "doctor123" });
  if (data.accessToken) tok = data.accessToken;
  console.log(`         role=${data.user?.roleName}  modules=${data.user?.modules?.length}`);
  return status === 200 && !!data.accessToken;
});

// ── Login (admin) ─────────────────────────────────────────────────────────────
let atk = null;
await test("POST /api/auth/login (admin)", async () => {
  const { status, data } = await req("POST", "/api/auth/login", { email: "admin@artic.health", password: "admin123" });
  if (data.accessToken) atk = data.accessToken;
  console.log(`         role=${data.user?.roleName}`);
  return status === 200 && !!data.accessToken;
});

// ── Login (nurse) ─────────────────────────────────────────────────────────────
await test("POST /api/auth/login (nurse)", async () => {
  const { status, data } = await req("POST", "/api/auth/login", { email: "nurse@artic.health", password: "nurse123" });
  console.log(`         role=${data.user?.roleName}  modules=${data.user?.modules?.length}`);
  return status === 200 && data.user?.roleName === "nurse";
});

// ── Wrong creds ───────────────────────────────────────────────────────────────
await test("POST /api/auth/login (wrong password → 401)", async () => {
  const { status } = await req("POST", "/api/auth/login", { email: "doctor@artic.health", password: "WRONG" });
  return status === 401;
});

// ── Me ────────────────────────────────────────────────────────────────────────
await test("GET /api/auth/me", async () => {
  const { status, data } = await req("GET", "/api/auth/me", null, tok);
  console.log(`         ${data.user?.firstName} ${data.user?.lastName}`);
  return status === 200 && !!data.user?.email;
});

// ── Unauthenticated ───────────────────────────────────────────────────────────
await test("GET /api/patients (no token → 401)", async () => {
  const { status } = await req("GET", "/api/patients");
  return status === 401;
});

// ── Patients list ─────────────────────────────────────────────────────────────
await test("GET /api/patients", async () => {
  const { status, data } = await req("GET", "/api/patients", null, tok);
  console.log(`         total=${data.meta?.total}  pages=${data.meta?.totalPages}`);
  return status === 200 && data.meta?.total >= 5;
});

// ── Patient by MRN ────────────────────────────────────────────────────────────
await test("GET /api/patients/mrn/MRN-2026-0001", async () => {
  const { status, data } = await req("GET", "/api/patients/mrn/MRN-2026-0001", null, tok);
  console.log(`         ${data.patient?.fullName}  blood=${data.patient?.bloodGroup}  insurance=${data.patient?.insuranceProvider}`);
  return status === 200 && data.patient?.mrn === "MRN-2026-0001";
});

// ── Patient by NID ────────────────────────────────────────────────────────────
await test("GET /api/patients/nid/1199880000000001", async () => {
  const { status, data } = await req("GET", "/api/patients/nid/1199880000000001", null, tok);
  console.log(`         ${data.patient?.fullName}`);
  return status === 200 && !!data.patient?.mrn;
});

// ── Patient search ────────────────────────────────────────────────────────────
await test("GET /api/patients?search=Samuel", async () => {
  const { status, data } = await req("GET", "/api/patients?search=Samuel", null, tok);
  console.log(`         found=${data.meta?.total} result(s)`);
  return status === 200 && data.meta?.total >= 1;
});

// ── Create patient ────────────────────────────────────────────────────────────
await test("POST /api/patients (create new)", async () => {
  const { status, data } = await req("POST", "/api/patients", {
    firstName: "Test", lastName: "Patient", dateOfBirth: "1990-01-01",
    gender: "Male", phone: "+250 788 999 001", nationalId: "199000TEST0001",
    bloodGroup: "A+", insuranceProvider: "RSSB", insuranceNumber: "TEST-001",
    allergies: ["Aspirin"], chronicConditions: ["None"],
    emergencyContact: { name: "Test EC", relationship: "Spouse", phone: "+250 788 999 002" }
  }, tok);
  if (data.patient) console.log(`         created MRN=${data.patient.mrn}`);
  return status === 201 && !!data.patient?.mrn;
});

// ── Users list ────────────────────────────────────────────────────────────────
await test("GET /api/users (admin)", async () => {
  const { status, data } = await req("GET", "/api/users", null, atk);
  console.log(`         total=${data.meta?.total}`);
  return status === 200 && data.meta?.total >= 18;
});

// ── Roles ─────────────────────────────────────────────────────────────────────
await test("GET /api/users/roles", async () => {
  const { status, data } = await req("GET", "/api/users/roles", null, tok);
  console.log(`         count=${data.roles?.length}`);
  return status === 200 && data.roles?.length >= 19;
});

// ── Dashboard KPIs ────────────────────────────────────────────────────────────
await test("GET /api/dashboard/kpis", async () => {
  const { status, data } = await req("GET", "/api/dashboard/kpis", null, tok);
  if (data.kpis) data.kpis.forEach(k => console.log(`         ${k.label}: ${k.value}`));
  return status === 200 && Array.isArray(data.kpis) && data.kpis.length === 4;
});

// ── Dashboard modules ─────────────────────────────────────────────────────────
await test("GET /api/dashboard/modules", async () => {
  const { status, data } = await req("GET", "/api/dashboard/modules", null, tok);
  console.log(`         modules=${data.modules?.length}`);
  return status === 200 && Array.isArray(data.modules);
});

// ── Legacy API ────────────────────────────────────────────────────────────────
await test("GET /api/roles (legacy compat)", async () => {
  const { status, data } = await req("GET", "/api/roles");
  const count = Object.keys(data).length;
  console.log(`         legacy roles count=${count}`);
  return status === 200 && count >= 10;
});

await test("GET /api/appointments (legacy compat)", async () => {
  const { status, data } = await req("GET", "/api/appointments");
  console.log(`         appointments=${data.length}`);
  return status === 200 && Array.isArray(data);
});

// ── Summary ───────────────────────────────────────────────────────────────────
const total = pass + fail;
console.log(`\n╔══════════════════════════════════════════════╗`);
console.log(`║  Results: ${String(pass).padEnd(3)} PASSED  ${String(fail).padEnd(3)} FAILED  (${total} total)  ║`);
console.log(`╚══════════════════════════════════════════════╝\n`);

if (fail > 0) process.exit(1);
