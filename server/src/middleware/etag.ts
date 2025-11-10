/**
 * @file etag.ts
 * @author Bob's Garage Team
 * @description ETag middleware for conditional requests and cache validation
 * @version 1.0.0
 * @since 1.0.0
 */

import crypto from 'node:crypto';
import type { Express, NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';

/**
 * Generates ETag from response body
 */
function generateETag(body: unknown): string {
  const str = typeof body === 'string' ? body : JSON.stringify(body);
  return `"${crypto.createHash('md5').update(str).digest('hex')}"`;
}

/**
 * Middleware to handle ETag for GET requests
 */
function etagMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (req.method !== 'GET') {
    next();
    return;
  }

  // Store original methods
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  // Override json to add ETag
  res.json = (body: unknown) => {
    const etag = generateETag(body);
    res.setHeader('ETag', etag);

    // Check if client sent If-None-Match header
    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch === etag) {
      return res.status(304).end();
    }

    return originalJson(body);
  };

  // Override send to add ETag for non-JSON responses
  res.send = (body: unknown) => {
    if (typeof body === 'object' && body !== null) {
      const etag = generateETag(body);
      res.setHeader('ETag', etag);

      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch === etag) {
        return res.status(304).end();
      }
    }

    return originalSend(body);
  };

  next();
}

/**
 * Applies ETag middleware to the Express app for conditional requests
 * This allows clients to use If-None-Match headers to avoid unnecessary data transfer
 */
export function applyETag(app: Express): void {
  if (!env.CACHE_ENABLED) {
    return;
  }

  app.use(etagMiddleware);
}
