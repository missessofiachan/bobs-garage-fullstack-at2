/**
 * @author Bob's Garage Team
 * @purpose JWT token signing, verification, and decoding utilities
 * @version 1.0.0
 */

import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Sign an access token with JWT
 *
 * @param payload - The payload object to encode in the token
 * @returns Signed JWT access token string
 */
export function signAccessToken(payload: object) {
  // cast to any to satisfy current @types/jsonwebtoken overloads
  return jwt.sign(payload as any, env.JWT_SECRET as any, { expiresIn: env.JWT_EXPIRES_IN } as any);
}

/**
 * Sign a refresh token with JWT
 * Uses separate secret if configured, otherwise falls back to JWT_SECRET
 *
 * @param payload - The payload object to encode in the token
 * @returns Signed JWT refresh token string
 */
export function signRefreshToken(payload: object) {
  // Use separate secret if configured, otherwise fall back to JWT_SECRET
  const secret = env.JWT_REFRESH_SECRET || env.JWT_SECRET;
  return jwt.sign(payload as any, secret as any, { expiresIn: env.REFRESH_EXPIRES_IN } as any);
}

/**
 * Verify and decode an access token
 *
 * @param token - The JWT token string to verify
 * @returns Decoded token payload as type T
 * @throws Error if token is invalid or expired
 */
export function verifyToken<T>(token: string) {
  return jwt.verify(token as any, env.JWT_SECRET as any) as T;
}

/**
 * Verify and decode a refresh token
 * Uses separate secret if configured, otherwise falls back to JWT_SECRET
 *
 * @param token - The JWT refresh token string to verify
 * @returns Decoded token payload as type T
 * @throws Error if token is invalid or expired
 */
export function verifyRefreshToken<T>(token: string) {
  // Use separate secret if configured, otherwise fall back to JWT_SECRET
  const secret = env.JWT_REFRESH_SECRET || env.JWT_SECRET;
  return jwt.verify(token as any, secret as any) as T;
}
