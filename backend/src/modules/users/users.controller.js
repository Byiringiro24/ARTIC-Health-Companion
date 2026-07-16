import * as usersService from "./users.service.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

// GET /api/users
export const list = asyncHandler(async (req, res) => {
  const { page, limit, search, roleId, hospitalId, departmentId, isActive } = req.query;
  const result = await usersService.getUsers({
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 20,
    search, roleId, hospitalId, departmentId,
    isActive: isActive !== undefined ? isActive === "true" : undefined,
  });
  res.json({ success: true, ...result });
});

// GET /api/users/:id
export const getOne = asyncHandler(async (req, res) => {
  const user = await usersService.getUserById(req.params.id);
  res.json({ success: true, user });
});

// POST /api/users
export const create = asyncHandler(async (req, res) => {
  const user = await usersService.createUser(
    { ...req.body, tenantId: req.user.tenantId, hospitalId: req.user.hospitalId },
    req.user.id
  );
  res.status(201).json({ success: true, user });
});

// PATCH /api/users/:id
export const update = asyncHandler(async (req, res) => {
  const user = await usersService.updateUser(req.params.id, req.body, req.user.id);
  res.json({ success: true, user });
});

// DELETE /api/users/:id
export const remove = asyncHandler(async (req, res) => {
  await usersService.deleteUser(req.params.id, req.user.id);
  res.json({ success: true, message: "User deleted" });
});

// GET /api/users/roles
export const roles = asyncHandler(async (req, res) => {
  const data = await usersService.getRoles();
  res.json({ success: true, roles: data });
});
