/**
 * Database connection wrapper backed by PostgreSQL.
 * The rest of the backend uses a tiny synchronous-looking API, but the
 * underlying work is executed through async PostgreSQL queries.
 */

import "dotenv/config";
import { Pool } from "pg";

let pool = null;
let _db = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

function normalizeSql(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/--.*$/gm, "")
    .replace(/\bPRAGMA\b[^;]+;/gi, "")
    .replace(/datetime\('now'\)/gi, "CURRENT_TIMESTAMP")
    .replace(/date\('now'\)/gi, "CURRENT_DATE")
    .trim();
}

function bindQuery(sql, params = []) {
  let index = 0;
  const text = sql.replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });
  return { text, values: params };
}

async function executeQuery(sql, params = []) {
  const { text, values } = bindQuery(normalizeSql(sql), params);
  const client = await getPool().connect();
  try {
    return await client.query(text, values);
  } finally {
    client.release();
  }
}

function createStatement(query) {
  const sql = normalizeSql(query);

  return {
    async get(...params) {
      const result = await executeQuery(sql, params);
      return result.rows[0] ?? undefined;
    },
    async all(...params) {
      const result = await executeQuery(sql, params);
      return result.rows;
    },
    async run(...params) {
      const result = await executeQuery(sql, params);
      return { changes: result.rowCount ?? 0, lastInsertRowid: result.rows[0]?.id ?? null };
    },
  };
}

export function getDb() {
  if (!_db) {
    _db = {
      prepare: (query) => createStatement(query),
      exec: async (sql) => {
        const statements = normalizeSql(sql)
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean);

        for (const statement of statements) {
          await executeQuery(statement);
        }
        return true;
      },
      close: async () => {
        await getPool().end();
        pool = null;
        _db = null;
      },
    };
  }
  return _db;
}

export async function closeDb() {
  if (_db) {
    await _db.close();
  }
}

export default getDb;
