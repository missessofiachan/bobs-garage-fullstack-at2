/**
 * @author Bob's Garage Team
 * @purpose Error handling utilities for controllers and common error responses
 * @version 1.0.0
 */

import type { Response } from 'express';
import { z } from 'zod';
import {
  ErrorCode,
  sendConflictError,
  sendErrorResponse,
  sendInternalError,
  sendValidationError,
} from './errorResponse.js';
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
  }
): boolean {
  // Handle Zod validation errors
  if (err instanceof z.ZodError) {
    sendValidationError(res, 'Validation error', err.issues);
    return true;
  }

  // Handle Sequelize unique constraint errors
  if (isUniqueConstraintError(err)) {
    const message = options?.uniqueConstraintMessage || 'Duplicate entry';
    sendConflictError(res, message);
    return true;
  }

  // Handle generic errors - log with structured logging
  const requestId = res.getHeader('X-Request-ID') as string | undefined;
  logger.error(
    `Controller error [${requestId || 'unknown'}]: ${err instanceof Error ? err.message : String(err)}`
  );

  if (options?.developmentErrorDetails && process.env.NODE_ENV === 'development') {
    sendErrorResponse(
      res,
      500,
      ErrorCode.INTERNAL_ERROR,
      'Internal server error',
      String((err as any)?.message ?? err)
    );
  } else {
    sendInternalError(res);
  }

  return true;
}
