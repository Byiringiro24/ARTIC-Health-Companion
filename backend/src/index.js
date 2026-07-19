/**
 * ARTIC Health Companion — Backend Entry Point v2.0
 * Next.js + React (frontend) + Node.js/Express (backend) + Socket.IO (real-time)
 */

import "dotenv/config";
import { createServer } from "node:http";
import app from "./app.js";
import { runMigrations } from "./database/migrate.js";
import { seed } from "./database/seed.js";
import { closeDb } from "./database/connection.js";
import { config } from "./config/index.js";
import { initSocket } from "./modules/realtime/socket.js";
import { seedFeatureFlags } from "./modules/super-admin/super-admin.service.js";

async function bootstrap() {
  // ── 1. Run database migrations (idempotent) ──────────────────────────────
  await runMigrations();

  // ── 2. Seed demo data on first run ────────────────────────────────────────
  try { await seed(); } catch (e) {
    if (!e.message?.includes("UNIQUE")) console.warn("Seed warning:", e.message);
  }
  try { await seedFeatureFlags(); } catch (e) {
    console.warn("Feature flag seed warning:", e.message);
  }

  // ── 3. Create HTTP server + Socket.IO ────────────────────────────────────
  const httpServer = createServer(app);
  initSocket(httpServer, config.cors.origin);

  httpServer.listen(config.port, () => {
    console.log("");
    console.log("╔══════════════════════════════════════════════════════════════╗");
    console.log("║  ARTIC Health Companion — Full HMS v2.0                     ║");
    console.log(`║  API:       http://localhost:${config.port}                         ║`);
    console.log(`║  WebSocket: ws://localhost:${config.port}                           ║`);
    console.log(`║  Env: ${config.nodeEnv.padEnd(54)}║`);
    console.log("╠══════════════════════════════════════════════════════════════╣");
    console.log("║  Stack: Next.js + React (frontend) | Node.js (backend)      ║");
    console.log("║  DB: PostgreSQL 16 | Cache: Redis 7 | WS: Socket.IO         ║");
    console.log("╚══════════════════════════════════════════════════════════════╝");
    console.log("");
  });

  // ── 4. Graceful shutdown ──────────────────────────────────────────────────
  const shutdown = (signal) => {
    console.log(`\n${signal} received — shutting down gracefully…`);
    httpServer.close(() => {
      closeDb();
      console.log("✅  Server closed");
      process.exit(0);
    });
    setTimeout(() => { console.error("Forced shutdown after timeout"); process.exit(1); }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));
  process.on("uncaughtException",  (err) => { console.error("Uncaught exception:", err); });
  process.on("unhandledRejection", (err) => { console.error("Unhandled rejection:", err); });
}

bootstrap().catch((err) => {
  console.error("Bootstrap failed:", err);
  process.exit(1);
});
