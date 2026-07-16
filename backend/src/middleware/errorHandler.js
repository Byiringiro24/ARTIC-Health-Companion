/**
 * Global Express error handler.
 * Catches all errors thrown/passed to next() throughout the app.
 */

import { config } from "../config/index.js";

// ── Custom application error ──────────────────────────────────────────────────
export class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code       = code;
    this.isOperational = true;
  }
}

export class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 422, "VALIDATION_ERROR");
    this.errors = errors;
  }
}

export class AuthError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, "CONFLICT");
  }
}

// ── Error handler middleware ───────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const code       = err.code       || "INTERNAL_ERROR";

  // Log unexpected errors in full
  if (!err.isOperational) {
    console.error("💥  Unexpected error:", err);
  }

  const body = {
    success: false,
    code,
    message: err.message || "An unexpected error occurred",
    ...(err.errors ? { errors: err.errors } : {}),
    ...(config.isDev && !err.isOperational ? { stack: err.stack } : {}),
  };

  res.status(statusCode).json(body);
}

// ── 404 handler ──────────────────────────────────────────────────────────────
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    code: "ROUTE_NOT_FOUND",
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

// ── Async wrapper — eliminates try/catch in every controller ─────────────────
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
