/**
 * In-memory rate limiter — pure Node.js, no external dependency.
 * For production deploy behind Nginx/Redis-backed rate limiter.
 */

import { config } from "../config/index.js";

// Map<key, { count, resetAt }>
const store = new Map();

function getKey(req, prefix = "global") {
  return `${prefix}:${req.ip}`;
}

function makeWindow(windowMs) {
  return Date.now() + windowMs;
}

function checkLimit(key, max, windowMs) {
  const now = Date.now();
  let record = store.get(key);

  if (!record || now > record.resetAt) {
    record = { count: 1, resetAt: makeWindow(windowMs) };
    store.set(key, record);
    return { allowed: true, remaining: max - 1, resetAt: record.resetAt };
  }

  record.count++;
  store.set(key, record);

  const remaining = Math.max(0, max - record.count);
  return { allowed: record.count <= max, remaining, resetAt: record.resetAt };
}

// Periodically clean up expired entries
setInterval(() => {
  const now = Date.now();
  for (const [key, rec] of store) {
    if (now > rec.resetAt) store.delete(key);
  }
}, 60_000);

// ── Middleware factory ────────────────────────────────────────────────────────
export function rateLimit({ max, windowMs, prefix = "rl", message = "Too many requests" } = {}) {
  const _max       = max       || config.rateLimit.max;
  const _windowMs  = windowMs  || config.rateLimit.windowMs;

  return (req, res, next) => {
    const key    = getKey(req, prefix);
    const result = checkLimit(key, _max, _windowMs);

    res.setHeader("X-RateLimit-Limit",     _max);
    res.setHeader("X-RateLimit-Remaining", result.remaining);
    res.setHeader("X-RateLimit-Reset",     Math.ceil(result.resetAt / 1000));

    if (!result.allowed) {
      return res.status(429).json({
        success: false,
        code:    "RATE_LIMIT_EXCEEDED",
        message,
        retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
      });
    }
    next();
  };
}

// Pre-built limiters
export const globalLimiter = rateLimit({ prefix: "global" });
export const authLimiter   = rateLimit({ max: config.rateLimit.authMax, prefix: "auth", message: "Too many auth attempts — try again later" });
