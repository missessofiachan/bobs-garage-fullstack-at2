import type { Request, Response } from 'express';
import { z } from 'zod';
import type { UpdateProfileRequest } from '../types/requests.js';
import { User } from '../db/models/User.js';
import {
  handleControllerError,
  sendUnauthorized,
  sendNotFound,
} from '../utils/errors.js';
import { getUserIdFromRequest } from '../utils/validation.js';

// Return the authenticated user's profile
export async function getMyProfile(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return sendUnauthorized(res);

    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'role', 'active', 'createdAt'],
    });
    if (!user) return sendNotFound(res, 'User not found');

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

export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return sendUnauthorized(res);

    const payload = updateSchema.parse(req.body);
    const user = await User.findByPk(userId);
    if (!user) return sendNotFound(res, 'User not found');

    await user.update(payload);
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
