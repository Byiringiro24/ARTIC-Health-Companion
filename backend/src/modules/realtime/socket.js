/**
 * Real-time WebSocket Server — Socket.IO
 * Handles live queue updates, critical alerts, notifications, chat.
 *
 * Rooms:
 *   hospital:{hospitalId}   — all staff in a hospital
 *   user:{userId}           — a specific user
 *   dept:{departmentId}     — a department
 *   role:{roleName}         — all users with a role (e.g. role:doctor)
 */

import { Server } from "socket.io";
import { verifyAccessToken } from "../../services/jwt.service.js";
import { getDb } from "../../database/connection.js";

let _io = null;

// ── Initialise Socket.IO on the HTTP server ───────────────────────────────────
export function initSocket(httpServer, corsOrigins) {
  _io = new Server(httpServer, {
    cors: {
      origin: corsOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // ── Auth middleware ─────────────────────────────────────────────────────────
  _io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token
        || socket.handshake.headers?.authorization?.replace("Bearer ", "");
      if (!token) return next(new Error("No token provided"));

      const payload = verifyAccessToken(token);
      const db = getDb();
      const user = await db.prepare(`
        SELECT u.id, u.first_name, u.last_name, u.hospital_id, u.department_id,
               r.name as role_name
        FROM users u JOIN roles r ON r.id = u.role_id
        WHERE u.id = ? AND u.is_active = 1 AND u.deleted_at IS NULL
      `).get(payload.sub);

      if (!user) return next(new Error("User not found"));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  // ── Connection handler ──────────────────────────────────────────────────────
  _io.on("connection", (socket) => {
    const { user } = socket;

    // Join rooms
    socket.join(`hospital:${user.hospital_id}`);
    socket.join(`user:${user.id}`);
    if (user.department_id) socket.join(`dept:${user.department_id}`);
    socket.join(`role:${user.role_name}`);

    console.log(`🔌 WS connected: ${user.first_name} ${user.last_name} (${user.role_name})`);

    // ── Client events ─────────────────────────────────────────────────────────
    socket.on("ping", (cb) => { if (typeof cb === "function") cb("pong"); });

    socket.on("queue:subscribe", ({ departmentId }) => {
      if (departmentId) socket.join(`queue:${departmentId}`);
    });

    socket.on("disconnect", () => {
      console.log(`🔌 WS disconnected: ${user.first_name} ${user.last_name}`);
    });
  });

  console.log("✅  Socket.IO server initialised");
  return _io;
}

// ── Emit helpers (called from services) ──────────────────────────────────────

export function getIO() {
  return _io;
}

/** Push critical lab alert to the ordering doctor */
export function emitCriticalAlert(userId, data) {
  _io?.to(`user:${userId}`).emit("critical_alert", {
    type: "critical_alert",
    ...data,
    timestamp: new Date().toISOString(),
  });
}

/** Update the live queue board for a department */
export function emitQueueUpdate(hospitalId, departmentId, data) {
  _io?.to(`hospital:${hospitalId}`).emit("queue_update", {
    departmentId,
    ...data,
    timestamp: new Date().toISOString(),
  });
  if (departmentId) {
    _io?.to(`queue:${departmentId}`).emit("queue_update", { departmentId, ...data });
  }
}

/** New prescription arrived in pharmacy queue */
export function emitNewPrescription(hospitalId, data) {
  _io?.to(`role:pharmacist`).to(`hospital:${hospitalId}`).emit("new_prescription", {
    ...data,
    timestamp: new Date().toISOString(),
  });
}

/** Bed status changed */
export function emitBedUpdate(hospitalId, data) {
  _io?.to(`hospital:${hospitalId}`).emit("bed_update", {
    ...data,
    timestamp: new Date().toISOString(),
  });
}

/** Broadcast in-app notification to a specific user */
export function emitNotification(userId, notification) {
  _io?.to(`user:${userId}`).emit("notification", {
    ...notification,
    timestamp: new Date().toISOString(),
  });
}

/** Emergency alert to all doctors and nurses in a hospital */
export function emitEmergencyAlert(hospitalId, data) {
  ["doctor", "nurse", "medical-director"].forEach((role) => {
    _io?.to(`role:${role}`).to(`hospital:${hospitalId}`).emit("emergency_alert", {
      ...data,
      timestamp: new Date().toISOString(),
    });
  });
}

/** Ambulance location update */
export function emitAmbulanceUpdate(hospitalId, data) {
  _io?.to(`hospital:${hospitalId}`).emit("ambulance_update", data);
}
