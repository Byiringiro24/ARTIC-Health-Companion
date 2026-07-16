/**
 * ARTIC Health Companion — Database connection
 *
 * Uses better-sqlite3 (synchronous, embedded).
 * In production swap this module for a pg (PostgreSQL) pool —
 * the rest of the codebase will not change.
 */

import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";
import "dotenv/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Ensure the data directory exists
const dbPath = resolve(process.cwd(), process.env.DATABASE_PATH ?? "./data/artic_health.db");
mkdirSync(dirname(dbPath), { recursive: true });

const db = new Database(dbPath, {
  // verbose: process.env.NODE_ENV === "development" ? console.log : undefined,
});

// Performance pragmas
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("synchronous = NORMAL");
db.pragma("cache_size = -64000");   // 64 MB cache
db.pragma("temp_store = MEMORY");

/**
 * Run the SQL schema file (idempotent — CREATE TABLE IF NOT EXISTS).
 */
export function initSchema() {
  const schemaPath = resolve(__dirname, "schema.sql");
  const sql = readFileSync(schemaPath, "utf8");
  // Split on statement separator and run each statement
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));
  for (const stmt of statements) {
    try {
      db.exec(stmt + ";");
    } catch {
      // Ignore harmless "already exists" errors
    }
  }
}

export default db;
