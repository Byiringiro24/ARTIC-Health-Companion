/**
 * ARTIC Health Companion — Backend Entry Point
 * Starts the Express server after running migrations and seeding demo data.
 */

import "dotenv/config";
import app from "./app.js";
import { runMigrations } from "./database/migrate.js";
import { seed } from "./database/seed.js";
import { closeDb } from "./database/connection.js";
import { config } from "./config/index.js";

async function bootstrap() {
  // ── 1. Run database migrations (idempotent) ──────────────────────────────
  await runMigrations();

  // ── 2. Seed demo data on first run ────────────────────────────────────────
  try { await seed(); } catch (e) {
    // Seed errors are non-fatal (data may already exist)
    if (!e.message?.includes("UNIQUE")) console.warn("Seed warning:", e.message);
  }

  // ── 3. Start HTTP server ──────────────────────────────────────────────────
  const server = app.listen(config.port, () => {
    console.log("");
    console.log("╔══════════════════════════════════════════════════════════════╗");
    console.log("║  ARTIC Health Companion API — Phase 1+2+3                   ║");
    console.log(`║  Running on http://localhost:${config.port}                         ║`);
    console.log(`║  Environment: ${config.nodeEnv.padEnd(45)}║`);
    console.log("╠══════════════════════════════════════════════════════════════╣");
    console.log("║  Endpoints:                                                  ║");
    console.log(`║    GET  http://localhost:${config.port}/health                        ║`);
    console.log(`║    POST http://localhost:${config.port}/api/auth/login                ║`);
    console.log(`║    GET  http://localhost:${config.port}/api/auth/me                   ║`);
    console.log(`║    GET  http://localhost:${config.port}/api/patients                  ║`);
    console.log(`║    GET  http://localhost:${config.port}/api/users                     ║`);
    console.log(`║    GET  http://localhost:${config.port}/api/dashboard/kpis            ║`);
    console.log("╚══════════════════════════════════════════════════════════════╝");
    console.log("");
  });

  // ── 4. Graceful shutdown ──────────────────────────────────────────────────
  const shutdown = (signal) => {
    console.log(`\n${signal} received — shutting down gracefully…`);
    server.close(() => {
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
