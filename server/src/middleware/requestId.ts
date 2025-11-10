/**
 * @file requestId.ts
 * @author Bob's Garage Team
 * @description Request ID middleware for request tracing and debugging
 * @version 1.0.0
 * @since 1.0.0
 */

import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

/**
 * Extend Express Request type to include requestId
 */
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

/**
 * Middleware to add a unique request ID to each request
 * The ID is included in response headers and logs for easier tracing
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Use existing X-Request-ID header if present, otherwise generate a new UUID
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();

  // Attach to request object for use in controllers/logging
  req.requestId = requestId;

  // Include in response header for client tracing
  res.setHeader('X-Request-ID', requestId);

  next();
}
