/**
 * @author Bob's Garage Team
 * @purpose User profile controller for getting and updating authenticated user's profile
 * @version 1.0.0
 */

import type { Request, Response } from 'express';
import { z } from 'zod';
import * as userService from '../services/user.service.js';
import type { UpdateProfileRequest } from '../types/requests.js';
import { sendNotFoundError, sendUnauthorizedError } from '../utils/errorResponse.js';
import { handleControllerError } from '../utils/errors.js';
import { getUserIdFromRequest } from '../utils/validation.js';

/**
 * @route GET /api/users/me
 * @description Get the authenticated user's profile information
 * @access Authenticated users only (requires valid JWT token)
 * @param {Request} req - Express request object (must include valid JWT in Authorization header)
 * @param {Response} res - Express response object
 * @returns {Object} 200 - User profile object with id, email, role, active status, and createdAt
 * @returns {Object} 401 - Unauthorized (missing or invalid token)
 * @returns {Object} 404 - User not found
 * @example
 * // Request: GET /api/users/me
 * // Headers: Authorization: Bearer <access_token>
 * // Response:
 * {
 *   "id": 1,
 *   "email": "user@example.com",
 *   "role": "user",
 *   "active": true,
 *   "createdAt": "2024-01-01T00:00:00.000Z"
 * }
 */
export async function getMyProfile(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return sendUnauthorizedError(res);

    const user = await userService.getUserById(userId);
    if (!user) return sendNotFoundError(res, 'User not found');

    res.json(user);
  } catch (err) {
    handleControllerError(err, res);
  }
}

// Update basic profile fields (email optional)
const updateSchema = z.object({
  email: z.string().email().optional(),
  active: z.boolean().optional(),
});

/**
 * @route PUT /api/users/me
 * @description Update the authenticated user's profile (email and active status)
 * @access Authenticated users only (requires valid JWT token)
 * @param {Request} req - Express request object
 * @param {Request.body.email} req.body.email - New email address (optional, must be valid email if provided)
 * @param {Request.body.active} req.body.active - Active status (optional, boolean)
 * @param {Response} res - Express response object
 * @returns {Object} 200 - Updated user profile object
 * @returns {Object} 400 - Validation error
 * @returns {Object} 401 - Unauthorized (missing or invalid token)
 * @returns {Object} 404 - User not found
 * @returns {Object} 409 - Email already in use (conflict)
 * @example
 * // Request: PUT /api/users/me
 * // Headers: Authorization: Bearer <access_token>
 * // Body:
 * {
 *   "email": "newemail@example.com",
 *   "active": true
 * }
 * // Response:
 * {
 *   "id": 1,
 *   "email": "newemail@example.com",
 *   "role": "user",
 *   "active": true
 * }
 */
export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return sendUnauthorizedError(res);

    const parsed = updateSchema.parse(req.body);
    // Filter out undefined values to satisfy exactOptionalPropertyTypes
    const payload: UpdateProfileRequest = {};
    if (parsed.email !== undefined) payload.email = parsed.email;
    if (parsed.active !== undefined) payload.active = parsed.active;

    const user = await userService.updateUserProfile(userId, payload);
    if (!user) return sendNotFoundError(res, 'User not found');

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
