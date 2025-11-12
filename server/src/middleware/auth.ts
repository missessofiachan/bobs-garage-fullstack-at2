/**
 * @file auth.ts
 * @author Bob's Garage Team
 * @description Express middleware for JWT token verification and role-based authorization.
 *              Provides requireAuth and requireAdmin middleware functions for protecting routes.
 * @version 1.0.0
 * @since 1.0.0
 */

// Authentication middleware: verify JWT and attach decoded payload to req.user
import type { NextFunction, Request, Response } from 'express';
import type { JwtPayload } from '../types/global.d.ts';
import { verifyToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';

/**
 * Middleware to require authentication for a route
 * Verifies JWT token from Authorization header and attaches payload to req.user
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns 401 if token is missing or invalid, otherwise calls next()
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = String(req.headers.authorization ?? '');
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const payload = verifyToken<JwtPayload>(token);
    // Attach typed payload to the request
    req.user = payload;
    return next();
  } catch (err) {
    // Log the error minimally; don't leak sensitive details to clients
    logger.warn(`Failed to verify token: ${err instanceof Error ? err.message : String(err)}`);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Middleware to require admin role for a route
 * Must be used after requireAuth middleware
 *
 * @param req - Express request object (must have req.user from requireAuth)
 * @param res - Express response object
 * @param next - Express next function
 * @returns 401 if not authenticated, 403 if not admin, otherwise calls next()
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = req.user as JwtPayload | undefined;
  if (!user) return res.status(401).json({ message: 'Missing authentication' });
  if (user.role !== 'admin') return res.status(403).json({ message: 'Forbidden: admin only' });
  return next();
}
