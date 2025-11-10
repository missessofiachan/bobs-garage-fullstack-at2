/**
 * @author Bob's Garage Team
 * @purpose Rate limiting middleware for API and authentication endpoints
 * @version 2.0.0
 * @description Per-user rate limiting: uses user ID for authenticated users, IP for unauthenticated users
 */

import type { Request } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { JwtPayload } from '../types/global.d.ts';

/**
 * Global rate limiter (legacy - uses IP address)
 * Used for backward compatibility or special cases
 */
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests. Please slow down and try again in a moment.',
  },
});

/**
 * Extract user ID from JWT token without verification (for rate limiting)
 * This is safe because the token will be verified later by requireAuth middleware
 */
function extractUserIdFromToken(req: Request): number | null {
  try {
    const header = String(req.headers.authorization ?? '');
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return null;

    // Decode without verification - we just need the user ID for rate limiting
    // The token will be properly verified later by requireAuth middleware
    const decoded = jwt.decode(token) as JwtPayload | null;
    return decoded?.sub ? Number(decoded.sub) : null;
  } catch {
    return null;
  }
}

/**
 * Per-user rate limiter
 * Uses user ID for authenticated users (extracted from JWT), falls back to IP for unauthenticated users
 * Authenticated users get higher limits than unauthenticated users
 */
export const perUserLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: (req: Request) => {
    // Check if user is authenticated by looking for JWT token
    const userId = extractUserIdFromToken(req);
    // Also check req.user in case auth middleware has already run (for routes that apply auth before rate limit)
    const authenticatedUserId = userId || req.user?.sub;

    // If user is authenticated, use higher limit
    if (authenticatedUserId) {
      return env.RATE_LIMIT_AUTHENTICATED_MAX;
    }
    // Otherwise, use default limit for unauthenticated users
    return env.RATE_LIMIT_MAX;
  },
  // Use user ID as key if authenticated, otherwise use IP
  keyGenerator: (req: Request) => {
    // Try to get user ID from JWT token or from req.user (if auth middleware has run)
    const userId = extractUserIdFromToken(req);
    const authenticatedUserId = userId || req.user?.sub;

    // If user is authenticated, use their user ID as the key
    if (authenticatedUserId) {
      return `user:${authenticatedUserId}`;
    }
    // Fall back to IP address for unauthenticated users (using helper for IPv6 safety)
    // Extract IP from request - ipKeyGenerator expects Request but types are incorrect
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    // Use ipKeyGenerator helper if available, otherwise use extracted IP
    try {
      return (ipKeyGenerator as unknown as (req: Request) => string)(req) || ip;
    } catch {
      return ip;
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests. Please slow down and try again in a moment.',
  },
});

// Separate rate limiter for auth endpoints (stricter, IP-based)
export const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_AUTH_WINDOW_MS,
  max: env.RATE_LIMIT_AUTH_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many login attempts. Please wait a moment before trying again.',
  },
});
