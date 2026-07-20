import { Router } from "express";
import * as ctrl from "./auth.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { validate, loginSchema, refreshSchema, changePasswordSchema } from "../../middleware/validate.js";
import { authLimiter } from "../../middleware/rateLimiter.js";

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user, return access + refresh tokens
 * @access  Public
 */
router.post("/login",   authLimiter, validate(loginSchema),   ctrl.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Exchange refresh token for new access token (rotation)
 * @access  Public (requires valid refresh token)
 */
router.post("/refresh", validate(refreshSchema), ctrl.refresh);

/**
 * @route   POST /api/auth/logout
 * @desc    Revoke refresh token, clear cookie
 * @access  Public
 */
router.post("/logout", ctrl.logout);

/**
 * @route   POST /api/auth/logout-all
 * @desc    Revoke ALL refresh tokens for current user
 * @access  Protected
 */
router.post("/logout-all", authenticate, ctrl.logoutAll);

/**
 * @route   GET /api/auth/me
 * @desc    Return current authenticated user profile + modules
 * @access  Protected
 */
router.get("/me", authenticate, ctrl.me);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change own password
 * @access  Protected
 */
router.post("/change-password", authenticate, validate(changePasswordSchema), ctrl.changePassword);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post("/forgot-password", authLimiter, ctrl.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token from email
 * @access  Public
 */
router.post("/reset-password", authLimiter, ctrl.resetPassword);

export default router;
