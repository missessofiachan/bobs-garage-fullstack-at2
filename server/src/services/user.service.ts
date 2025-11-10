/**
 * @file user.service.ts
 * @author Bob's Garage Team
 * @description Service layer for business logic related to user profiles
 * @version 1.0.0
 * @since 1.0.0
 */

import { User } from '../db/models/User.js';
import type { UpdateProfileRequest } from '../types/requests.js';

/**
 * Get user profile by ID
 */
export async function getUserById(id: number): Promise<User | null> {
  return await User.findByPk(id, {
    attributes: ['id', 'email', 'role', 'active', 'createdAt'],
  });
}

/**
 * Update user profile by ID
 */
export async function updateUserProfile(
  id: number,
  data: UpdateProfileRequest
): Promise<User | null> {
  const user = await User.findByPk(id);
  if (!user) {
    return null;
  }

  await user.update(data);
  return user;
}
