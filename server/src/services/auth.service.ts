/**
 * @author Bob's Garage Team
 * @purpose Authentication service - business logic for auth operations
 * @version 1.0.0
 */

import { User } from '../db/models/User.js';
import type { JwtPayload } from '../types/global.d.ts';
import { hashPassword, verifyPassword } from '../utils/hash.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';

/**
 * Register a new user
 * The first user to register will be automatically assigned the admin role
 */
export async function registerUser(email: string, password: string) {
  const passwordHash = await hashPassword(password);

  // Check if this is the first user to register
  const userCount = await User.count();
  const role = userCount === 0 ? 'admin' : 'user';

  const user = await User.create({ email, passwordHash, role });
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

/**
 * Login user and generate tokens
 */
export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return null;
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    return null;
  }

  const access = signAccessToken({ sub: user.id, role: user.role });
  const refresh = signRefreshToken({ sub: user.id, role: user.role });

  return {
    access,
    refresh,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string) {
  try {
    const payload = verifyRefreshToken<JwtPayload>(refreshToken);
    const access = signAccessToken({ sub: payload.sub, role: payload.role });
    return access;
  } catch (err) {
    logger.warn(
      `Failed to verify refresh token: ${err instanceof Error ? err.message : String(err)}`
    );
    throw new Error('Invalid or expired refresh token');
  }
}
