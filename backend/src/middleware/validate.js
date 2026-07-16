/**
 * Request body/query/params validation middleware.
 * Schemas are plain objects: { field: { required, type, minLength, maxLength, pattern, enum } }
 */

import { ValidationError } from "./errorHandler.js";

// ── Simple validator ───────────────────────────────────────────────────────────
export function validate(schema, source = "body") {
  return (req, res, next) => {
    const data   = req[source] || {};
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];
      const empty = value === undefined || value === null || value === "";

      if (rules.required && empty) {
        errors.push({ field, message: `${field} is required` });
        continue;
      }
      if (empty) continue;

      if (rules.type === "email") {
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(String(value))) errors.push({ field, message: `${field} must be a valid email` });
      }

      if (rules.type === "string" && typeof value !== "string") {
        errors.push({ field, message: `${field} must be a string` });
        continue;
      }

      if (rules.minLength && String(value).length < rules.minLength) {
        errors.push({ field, message: `${field} must be at least ${rules.minLength} characters` });
      }

      if (rules.maxLength && String(value).length > rules.maxLength) {
        errors.push({ field, message: `${field} must be at most ${rules.maxLength} characters` });
      }

      if (rules.pattern && !rules.pattern.test(String(value))) {
        errors.push({ field, message: rules.patternMessage || `${field} format is invalid` });
      }

      if (rules.enum && !rules.enum.includes(value)) {
        errors.push({ field, message: `${field} must be one of: ${rules.enum.join(", ")}` });
      }
    }

    if (errors.length) return next(new ValidationError("Validation failed", errors));
    next();
  };
}

// ── Common schemas ─────────────────────────────────────────────────────────────
export const loginSchema = {
  email:    { required: true, type: "email" },
  password: { required: true, type: "string", minLength: 6 },
};

export const refreshSchema = {
  refreshToken: { required: true, type: "string" },
};

export const changePasswordSchema = {
  currentPassword: { required: true, type: "string", minLength: 6 },
  newPassword:     { required: true, type: "string", minLength: 8 },
};
