import { createServer } from "node:http";
import { URL } from "node:url";
import { appointments, auditLogs, kpis, modules, patients, roles, users } from "./data.js";

const port = Number(process.env.PORT || 4000);

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization"
  });
  response.end(JSON.stringify(payload, null, 2));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function getBearerUser(request) {
  const header = request.headers.authorization || "";
  const token = header.replace("Bearer ", "");
  return users.find((user) => user.id === token || user.email === token) || null;
}

function visibleModulesFor(user) {
  if (!user) {
    return [];
  }
  const role = roles[user.role];
  return modules.filter((module) => role.modules.includes(module.key));
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);

  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  try {
    if (url.pathname === "/health") {
      sendJson(response, 200, { status: "ok", service: "ARTIC Health Companion Backend", version: "0.1.0" });
      return;
    }

    if (url.pathname === "/api/auth/login" && request.method === "POST") {
      const body = await readBody(request);
      const user = users.find((item) => item.email.toLowerCase() === String(body.email || "").toLowerCase() && item.password === body.password);
      if (!user) {
        sendJson(response, 401, { error: "Invalid credentials" });
        return;
      }
      const { password, ...safeUser } = user;
      sendJson(response, 200, { user: safeUser, token: user.id, role: roles[user.role], modules: visibleModulesFor(user) });
      return;
    }

    if (url.pathname === "/api/roles") {
      sendJson(response, 200, roles);
      return;
    }

    if (url.pathname === "/api/modules") {
      const role = url.searchParams.get("role");
      if (role && roles[role]) {
        sendJson(response, 200, modules.filter((module) => roles[role].modules.includes(module.key)));
        return;
      }
      sendJson(response, 200, modules);
      return;
    }

    if (url.pathname === "/api/me") {
      const user = getBearerUser(request);
      if (!user) {
        sendJson(response, 401, { error: "Missing or invalid bearer token" });
        return;
      }
      const { password, ...safeUser } = user;
      sendJson(response, 200, { user: safeUser, role: roles[user.role], modules: visibleModulesFor(user) });
      return;
    }

    if (url.pathname === "/api/patients") {
      const user = getBearerUser(request);
      if (user?.role === "patient") {
        sendJson(response, 200, patients.filter((patient) => patient.id === user.patientId));
        return;
      }
      sendJson(response, 200, patients);
      return;
    }

    if (url.pathname === "/api/appointments") {
      const user = getBearerUser(request);
      if (user?.role === "patient") {
        sendJson(response, 200, appointments.filter((appointment) => appointment.patientId === user.patientId));
        return;
      }
      sendJson(response, 200, appointments);
      return;
    }

    if (url.pathname === "/api/dashboard") {
      const user = getBearerUser(request);
      sendJson(response, 200, {
        kpis,
        queue: appointments,
        modules: visibleModulesFor(user),
        compliance: ["MOH reporting", "PBF indicators", "FHIR/ICD-10 readiness", "Rwanda Data Protection Law alignment"]
      });
      return;
    }

    if (url.pathname === "/api/audit") {
      sendJson(response, 200, auditLogs);
      return;
    }

    sendJson(response, 404, { error: "Route not found", routes: ["/health", "/api/auth/login", "/api/roles", "/api/modules", "/api/me", "/api/patients", "/api/appointments", "/api/dashboard", "/api/audit"] });
  } catch (error) {
    sendJson(response, 500, { error: "Internal server error", detail: error.message });
  }
});

server.listen(port, () => {
  console.log(`ARTIC Health Companion backend listening on http://localhost:${port}`);
});
