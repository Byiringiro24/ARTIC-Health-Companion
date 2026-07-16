/**
 * Migration runner — executes SCHEMA_SQL against the PostgreSQL database.
 */

import "dotenv/config";
import { getDb } from "./connection.js";
import { SCHEMA_SQL } from "./schema.js";

export async function runMigrations() {
  const db = getDb();
  try {
    await db.exec(SCHEMA_SQL);
    console.log("✅  Database migrations applied successfully");
  } catch (err) {
    console.error("❌  Migration failed:", err.message);
    throw err;
  }
}

// Allow running directly: node src/database/migrate.js
if (process.argv[1]?.includes("migrate.js")) {
  await runMigrations();
  console.log("Migration complete.");
}
