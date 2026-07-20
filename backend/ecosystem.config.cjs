/**
 * PM2 Ecosystem Config — ARTIC HMS Backend
 * Env vars are embedded here so PM2 passes them directly to Node.
 * To update credentials: edit this file + run: pm2 reload artic-hms-backend
 *
 * ⚠️  Keep this file private — it contains secrets.
 *     It is in .gitignore on the server. The version in git has placeholders.
 */

module.exports = {
  apps: [
    {
      name: "artic-hms-backend",
      script: "src/index.js",
      cwd: "/home/artic/artic-hms/backend",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: "4001",

        // ── Database ──────────────────────────────────────────────────────────
        DATABASE_URL: "postgresql://Byiringiro:Artic%25242026@localhost:5433/artic_hms?sslmode=disable",

        // ── JWT ───────────────────────────────────────────────────────────────
        JWT_ACCESS_SECRET:  "artic-production-jwt-secret-min-32-chars-2026",
        JWT_REFRESH_SECRET: "artic-production-refresh-secret-2026",
        JWT_ACCESS_EXPIRES:  "15m",
        JWT_REFRESH_EXPIRES: "7d",
        BCRYPT_ROUNDS: "12",

        // ── CORS ──────────────────────────────────────────────────────────────
        CORS_ORIGIN: "http://172.209.217.176:3001,http://localhost:3001",

        // ── Redis ─────────────────────────────────────────────────────────────
        REDIS_URL:    "redis://localhost:6380",
        REDIS_PREFIX: "hms:",

        // ── Rate Limiting ─────────────────────────────────────────────────────
        RATE_LIMIT_WINDOW_MS: "60000",
        RATE_LIMIT_MAX:       "200",
        AUTH_RATE_LIMIT_MAX:  "10",

        // ── Facility ──────────────────────────────────────────────────────────
        DEFAULT_FACILITY: "Kigali District Hospital",
        DEFAULT_TIMEZONE: "Africa/Kigali",
        DEFAULT_CURRENCY: "RWF",
        FRONTEND_URL:     "http://172.209.217.176:3001",

        // ── Email (Gmail App Password) ─────────────────────────────────────────
        // To update: regenerate App Password at myaccount.google.com/apppasswords
        SMTP_HOST:           "smtp.gmail.com",
        SMTP_PORT:           "587",
        SMTP_SECURE:         "false",
        SMTP_USER:           "articltd1@gmail.com",
        SMTP_PASS:           "REPLACE_WITH_NEW_APP_PASSWORD",
        EMAIL_FROM:          "ARTIC Health Companion <articltd1@gmail.com>",
        EMAIL_FROM_NAME:     "ARTIC Health Companion",
        EMAIL_FROM_ADDRESS:  "articltd1@gmail.com",

        // ── OpenAI (optional — enables GPT-powered AI companion) ───────────────
        OPENAI_API_KEY: "",

        // ── Gemini AI (Google) — Primary AI provider ──────────────────────────
        // IMPORTANT: Revoke the key that was shared publicly, generate a new one at:
        // https://aistudio.google.com/app/apikey
        // Then update this value and run: bash scripts/update-gemini-key.sh YOUR_NEW_KEY
        GEMINI_API_KEY: "AIzaSyAb8RN6LKirr2MOJn-0iybuUApe_Bj-GdsjKfA2icv76L7H85kA",

        // ── SMS Africa's Talking (optional) ───────────────────────────────────
        AT_API_KEY:   "",
        AT_USERNAME:  "sandbox",
        AT_SENDER:    "",
      },
    },
  ],
};
