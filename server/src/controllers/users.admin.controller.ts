/**
 * @author Bob's Garage Team
 * @purpose Admin user management controller for listing, viewing, creating, updating, and deleting users
 * @version 1.0.0
 */

import type { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../db/models/User.js';
import type { CreateUserRequest, UpdateUserRequest, UserQueryParams } from '../types/requests.js';
import { sendNotFoundError } from '../utils/errorResponse.js';
import { handleControllerError } from '../utils/errors.js';
import { hashPassword } from '../utils/hash.js';
import { calculatePaginationParams } from '../utils/pagination.js';
import { createPaginationResponse } from '../utils/responses.js';
import { findByIdOr404, parseIdParam } from '../utils/validation.js';

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['user', 'admin']).default('user'),
  active: z.boolean().default(true),
});

const updateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: z.enum(['user', 'admin']).optional(),
  active: z.boolean().optional(),
});

/**
 * @route GET /api/admin/users
 * @description List all users with optional filtering and pagination (admin only)
 * @access Admin only (requires authentication and admin role)
 * @param {Request} req - Express request object
 * @param {Request.query.page} req.query.page - Page number (default: 1)
 * @param {Request.query.limit} req.query.limit - Items per page (default: 20, max: 100)
 * @param {Request.query.role} req.query.role - Filter by role (optional: "user" | "admin")
 * @param {Request.query.active} req.query.active - Filter by active status (optional: true | false)
 * @param {Response} res - Express response object
 * @returns {Object} 200 - Paginated list of users
 * @returns {Object} 401 - Unauthorized (missing or invalid token)
 * @returns {Object} 403 - Forbidden (not admin)
 * @example
 * // GET /api/admin/users?page=1&limit=20&role=user&active=true
 * // Response:
 * {
 *   "data": [
 *     {
 *       "id": 1,
 *       "email": "user@example.com",
 *       "role": "user",
 *       "active": true,
 *       "createdAt": "2024-01-01T00:00:00.000Z"
 *     }
 *   ],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 20,
 *     "total": 25,
 *     "pages": 2
 *   }
 * }
 */
export async function listUsers(req: Request, res: Response) {
  try {
    const query = req.query as unknown as UserQueryParams;
    const { page = 1, limit = 20, role, active } = query;

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (typeof active !== 'undefined') where.active = active;

    const { offset, limit: actualLimit } = calculatePaginationParams(page, limit);

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: ['id', 'email', 'role', 'active', 'createdAt'],
      limit: actualLimit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      data: users,
      pagination: createPaginationResponse(Number(page), actualLimit, count),
    });
  } catch (err) {
    handleControllerError(err, res);
  }
}

/**
 * @route GET /api/admin/users/:id
 * @description Get a single user by ID (admin only)
 * @access Admin only (requires authentication and admin role)
 * @param {Request} req - Express request object
 * @param {Request.params.id} req.params.id - User ID (required)
 * @param {Response} res - Express response object
 * @returns {Object} 200 - User object
 * @returns {Object} 400 - Invalid ID format
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (not admin)
 * @returns {Object} 404 - User not found
 */
export async function getUserById(req: Request, res: Response) {
  try {
    const user = await findByIdOr404(req, res, (id) =>
      User.findByPk(id, {
        attributes: ['id', 'email', 'role', 'active', 'createdAt'],
      })
    );
    if (!user) return; // Error response already sent

    res.json(user);
  } catch (err) {
    handleControllerError(err, res);
  }
}

/**
 * @route POST /api/admin/users
 * @description Create a new user (admin only)
 * @access Admin only (requires authentication and admin role)
 * @param {Request} req - Express request object
 * @param {Request.body.email} req.body.email - User email address (required, must be valid email)
 * @param {Request.body.password} req.body.password - User password (required, minimum 8 characters)
 * @param {Request.body.role} req.body.role - User role (optional: "user" | "admin", default: "user")
 * @param {Request.body.active} req.body.active - Active status (optional, default: true)
 * @param {Response} res - Express response object
 * @returns {Object} 201 - Created user object
 * @returns {Object} 400 - Validation error
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (not admin)
 * @returns {Object} 409 - Email already in use
 */
export async function createUser(req: Request, res: Response) {
  try {
    const payload = createSchema.parse(req.body) as CreateUserRequest;
    const passwordHash = await hashPassword(payload.password);
    const user = await User.create({
      email: payload.email,
      passwordHash,
      role: payload.role,
      active: payload.active,
    });
    res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
      active: user.active,
    });
  } catch (err) {
    handleControllerError(err, res, {
      uniqueConstraintMessage: 'Email already in use',
    });
  }
}

/**
 * @route PUT /api/admin/users/:id
 * @description Update a user by ID (admin only)
 * @access Admin only (requires authentication and admin role)
 * @param {Request} req - Express request object
 * @param {Request.params.id} req.params.id - User ID (required)
 * @param {Request.body.email} req.body.email - New email address (optional, must be valid email if provided)
 * @param {Request.body.password} req.body.password - New password (optional, minimum 8 characters if provided)
 * @param {Request.body.role} req.body.role - User role (optional: "user" | "admin")
 * @param {Request.body.active} req.body.active - Active status (optional, boolean)
 * @param {Response} res - Express response object
 * @returns {Object} 200 - Updated user object
 * @returns {Object} 400 - Validation error or invalid ID
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (not admin)
 * @returns {Object} 404 - User not found
 * @returns {Object} 409 - Email already in use
 */
export async function updateUser(req: Request, res: Response) {
  try {
    const id = parseIdParam(req, res);
    if (id === null) return; // Error response already sent

    const payload = updateSchema.parse(req.body) as UpdateUserRequest;
    const user = await User.findByPk(id);
    if (!user) return sendNotFoundError(res);

    if (payload.password) {
      const passwordHash = await hashPassword(payload.password);
      await user.update({ passwordHash });
    }

    await user.update({
      email: payload.email ?? user.email,
      role: payload.role ?? user.role,
      active: payload.active ?? user.active,
    });

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      active: user.active,
    });
  } catch (err) {
    handleControllerError(err, res, {
      uniqueConstraintMessage: 'Email already in use',
    });
  }
}

/**
 * @route DELETE /api/admin/users/:id
 * @description Delete a user by ID (admin only)
 * @access Admin only (requires authentication and admin role)
 * @param {Request} req - Express request object
 * @param {Request.params.id} req.params.id - User ID (required)
 * @param {Response} res - Express response object
 * @returns {void} 204 - User deleted successfully
 * @returns {Object} 400 - Invalid ID format
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (not admin)
 * @returns {Object} 404 - User not found
 */
export async function deleteUser(req: Request, res: Response) {
  try {
    const id = parseIdParam(req, res);
    if (id === null) return; // Error response already sent

    const user = await User.findByPk(id);
    if (!user) return sendNotFoundError(res);

    await user.destroy();
    res.status(204).send();
  } catch (err) {
    handleControllerError(err, res);
  }
}
