/**
 * Auth Controller — handles HTTP requests for authentication endpoints.
 * All business logic is in auth.service.js
 */

import * as authService from "./auth.service.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const meta = { ip: req.ip, userAgent: req.headers["user-agent"] };

  const result = await authService.login(email, password, meta);

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
    path:     "/api/auth/refresh",
  });

  res.json({
    success:      true,
    accessToken:  result.accessToken,
    refreshToken: result.refreshToken, // also in body for mobile clients
    user:         result.user,
  });
});

// POST /api/auth/refresh
export const refresh = asyncHandler(async (req, res) => {
  const rawToken = req.body.refreshToken || req.cookies?.refreshToken;
  const meta     = { ip: req.ip, userAgent: req.headers["user-agent"] };

  const result = await authService.refresh(rawToken, meta);

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge:   7 * 24 * 60 * 60 * 1000,
    path:     "/api/auth/refresh",
  });

  res.json({
    success:      true,
    accessToken:  result.accessToken,
    refreshToken: result.refreshToken,
    user:         result.user,
  });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  const rawToken = req.body.refreshToken || req.cookies?.refreshToken;
  await authService.logout(rawToken);

  res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
  res.json({ success: true, message: "Logged out successfully" });
});

// POST /api/auth/logout-all
export const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAll(req.user.id);
  res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
  res.json({ success: true, message: "Logged out from all devices" });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.json({ success: true, user });
});

// POST /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, currentPassword, newPassword);
  res.json({ success: true, message: "Password changed successfully. Please log in again." });
});
