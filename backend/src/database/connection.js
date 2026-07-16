/**
 * Database connection singleton using Node.js built-in `node:sqlite` module.
 * Available in Node.js 22.5+ (stable in Node 24+).
 * Zero external dependencies — no native build required.
 *
 * API is synchronous, identical to better-sqlite3 for all queries used here.
 */

import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbPath = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.resolve(__dirname, "../../../data/artic_health.db");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

let _db = null;

export function getDb() {
  if (!_db) {
    _db = new DatabaseSync(dbPath);
    _db.exec("PRAGMA journal_mode = WAL");
    _db.exec("PRAGMA foreign_keys = ON");
    _db.exec("PRAGMA synchronous = NORMAL");
    _db.exec("PRAGMA cache_size = 10000");
  }
  return _db;
}

export function closeDb() {
  if (_db) {
    _db.close();
    _db = null;
  }
}

export default getDb;
