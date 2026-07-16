/**
 * Migration runner — executes SCHEMA_SQL against the SQLite database.
 * Safe to run multiple times (all statements use CREATE TABLE IF NOT EXISTS).
 */

import "dotenv/config";
import { getDb } from "./connection.js";
import { SCHEMA_SQL } from "./schema.js";

export function runMigrations() {
  const db = getDb();
  try {
    db.exec(SCHEMA_SQL);
    console.log("✅  Database migrations applied successfully");
  } catch (err) {
    console.error("❌  Migration failed:", err.message);
    throw err;
  }
}

// Allow running directly: node src/database/migrate.js
if (process.argv[1].includes("migrate.js")) {
  runMigrations();
  console.log("Migration complete.");
}
