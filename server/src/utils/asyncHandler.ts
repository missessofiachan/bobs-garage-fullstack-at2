/**
 * @author Bob's Garage Team
 * @purpose Async handler wrapper for Express controllers to catch errors
 * @version 1.0.0
 */

import type { NextFunction, Request, Response } from 'express';

/**
 * Wrapper for async Express route handlers to automatically catch errors
 * Prevents need for try-catch blocks in every async controller function
 *
 * @param fn - Async Express route handler function
 * @returns Wrapped function that catches errors and passes them to Express error handler
 */
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export default asyncHandler;
