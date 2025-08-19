// Authentication middleware: verify JWT and attach decoded payload to req.user
import type { Request, Response, NextFunction } from 'express';
import type { JwtPayload } from '../types/global.d.ts';
import { verifyToken } from '../utils/jwt.js';

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
    // eslint-disable-next-line no-console
    console.warn('Failed to verify token', (err as Error).message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = req.user as JwtPayload | undefined;
  if (!user) return res.status(401).json({ message: 'Missing authentication' });
  if (user.role !== 'admin') return res.status(403).json({ message: 'Forbidden: admin only' });
  return next();
}
