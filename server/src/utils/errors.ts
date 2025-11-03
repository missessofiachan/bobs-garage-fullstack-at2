/**
 * @author Bob's Garage Team
 * @purpose Shared error handling utilities for controllers
 * @version 1.0.0
 */

import type { Response } from 'express';
import { z } from 'zod';
import { logger } from './logger.js';

/**
 * Check if error is a Sequelize unique constraint error
 */
export function isUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'name' in err &&
    (err as any).name === 'SequelizeUniqueConstraintError'
  );
}

/**
 * Handle common controller errors and send appropriate response
 */
export function handleControllerError(
  err: unknown,
  res: Response,
  options?: {
    uniqueConstraintMessage?: string;
    developmentErrorDetails?: boolean;
  },
): boolean {
  // Handle Zod validation errors
  if (err instanceof z.ZodError) {
    res.status(400).json({
      message: 'Validation error',
      errors: err.issues,
    });
    return true;
  }

  // Handle Sequelize unique constraint errors
  if (isUniqueConstraintError(err)) {
    const message =
      options?.uniqueConstraintMessage || 'Duplicate entry';
    res.status(409).json({ message });
    return true;
  }

  // Handle generic errors - log with structured logging
  logger.error(
    `Controller error: ${err instanceof Error ? err.message : String(err)}`,
  );
  
  if (options?.developmentErrorDetails && process.env.NODE_ENV === 'development') {
    res.status(500).json({
      message: 'Internal server error',
      error: String((err as any)?.message ?? err),
    });
  } else {
    res.status(500).json({ message: 'Internal server error' });
  }
  
  return true;
}

/**
 * Send a 500 internal server error response
 */
export function sendInternalError(res: Response): void {
  res.status(500).json({ message: 'Internal server error' });
}

/**
 * Send a 400 bad request response with a message
 */
export function sendBadRequest(res: Response, message: string): void {
  res.status(400).json({ message });
}

/**
 * Send a 404 not found response
 */
export function sendNotFound(res: Response, message: string = 'Not found'): void {
  res.status(404).json({ message });
}

/**
 * Send a 401 unauthorized response
 */
export function sendUnauthorized(res: Response, message: string = 'Unauthorized'): void {
  res.status(401).json({ message });
}

/**
 * Send a 409 conflict response
 */
export function sendConflict(res: Response, message: string = 'Conflict'): void {
  res.status(409).json({ message });
}

