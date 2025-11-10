/**
 * @author Bob's Garage Team
 * @purpose Morgan middleware for HTTP request logging with file output
 * @version 1.0.0
 */

import type { Request, Response } from 'express';
import morgan from 'morgan';
import { apiLogger } from '../config/winston.js';

/**
 * Create a Morgan stream that writes to Winston API logger
 */
const stream = {
  write: (message: string) => {
    // Remove trailing newline from morgan output
    apiLogger.info(message.trim());
  },
};

/**
 * Custom morgan token for request ID
 */
morgan.token('id', (req: Request) => (req as any).id ?? '-');

/**
 * Custom morgan token for user email if authenticated
 */
morgan.token('user', (req: Request) => {
  const user = (req as any).user;
  return user?.email ?? '-';
});

/**
 * Morgan middleware configured with combined format and file stream
 * Format: :remote-addr - :user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
 */
export const morganMiddleware = morgan(
  ':remote-addr - :user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
  {
    stream,
    skip: (req: Request, _res: Response) => {
      // Skip health checks and static file requests in production
      if (req.path === '/health' || req.path.startsWith('/uploads/')) {
        return true;
      }
      return false;
    },
  }
);
