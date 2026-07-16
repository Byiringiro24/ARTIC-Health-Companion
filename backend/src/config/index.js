/**
 * Centralised configuration — reads from .env and exports typed config object.
 * All other modules import from here, never from process.env directly.
 */

export const config = {
  port:       parseInt(process.env.PORT || "4000", 10),
  nodeEnv:    process.env.NODE_ENV || "development",
  isDev:      (process.env.NODE_ENV || "development") === "development",

  db: {
    path: process.env.DATABASE_PATH || "./data/artic_health.db",
  },

  jwt: {
    accessSecret:  process.env.JWT_ACCESS_SECRET  || "artic_access_secret_CHANGE_ME",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "artic_refresh_secret_CHANGE_ME",
    accessExpires: process.env.JWT_ACCESS_EXPIRES  || "15m",
    refreshExpires:process.env.JWT_REFRESH_EXPIRES || "7d",
  },

  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS || "12", 10),
  },

  cors: {
    origin: (process.env.CORS_ORIGIN || "http://localhost:3000").split(",").map(s => s.trim()),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10),
    max:      parseInt(process.env.RATE_LIMIT_MAX        || "100",   10),
    authMax:  parseInt(process.env.AUTH_RATE_LIMIT_MAX   || "10",    10),
  },

  facility: {
    name:     process.env.DEFAULT_FACILITY || "Kigali District Hospital",
    timezone: process.env.DEFAULT_TIMEZONE || "Africa/Kigali",
    currency: process.env.DEFAULT_CURRENCY || "RWF",
  },
};
