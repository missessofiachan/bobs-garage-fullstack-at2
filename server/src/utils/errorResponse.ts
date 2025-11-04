/**
 * @file errorResponse.ts
 * @author Bob's Garage Team
 * @description Structured error response utilities
 * @version 1.0.0
 * @since 1.0.0
 */

import type { Response } from "express";

/**
 * Standard error response structure
 */
export interface ErrorResponse {
	error: {
		code: string;
		message: string;
		requestId?: string;
		timestamp: string;
		path?: string;
		details?: unknown;
	};
}

/**
 * Error codes enum
 */
export enum ErrorCode {
	VALIDATION_ERROR = "VALIDATION_ERROR",
	NOT_FOUND = "NOT_FOUND",
	UNAUTHORIZED = "UNAUTHORIZED",
	FORBIDDEN = "FORBIDDEN",
	CONFLICT = "CONFLICT",
	INTERNAL_ERROR = "INTERNAL_ERROR",
	DATABASE_ERROR = "DATABASE_ERROR",
	RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
}

/**
 * Send a structured error response
 */
export function sendErrorResponse(
	res: Response,
	statusCode: number,
	code: ErrorCode,
	message: string,
	details?: unknown,
): void {
	const requestId = res.getHeader("X-Request-ID") as string | undefined;
	const errorResponse: ErrorResponse = {
		error: {
			code,
			message,
			requestId,
			timestamp: new Date().toISOString(),
			path: res.req?.path,
			...(details && { details }),
		},
	};

	res.status(statusCode).json(errorResponse);
}

/**
 * Send a validation error response
 */
export function sendValidationError(res: Response, message: string, details?: unknown): void {
	sendErrorResponse(res, 400, ErrorCode.VALIDATION_ERROR, message, details);
}

/**
 * Send a not found error response
 */
export function sendNotFoundError(res: Response, message: string = "Resource not found"): void {
	sendErrorResponse(res, 404, ErrorCode.NOT_FOUND, message);
}

/**
 * Send an unauthorized error response
 */
export function sendUnauthorizedError(res: Response, message: string = "Unauthorized"): void {
	sendErrorResponse(res, 401, ErrorCode.UNAUTHORIZED, message);
}

/**
 * Send a forbidden error response
 */
export function sendForbiddenError(res: Response, message: string = "Forbidden"): void {
	sendErrorResponse(res, 403, ErrorCode.FORBIDDEN, message);
}

/**
 * Send a conflict error response
 */
export function sendConflictError(res: Response, message: string = "Conflict"): void {
	sendErrorResponse(res, 409, ErrorCode.CONFLICT, message);
}

/**
 * Send an internal server error response
 */
export function sendInternalError(res: Response, message: string = "Internal server error"): void {
	sendErrorResponse(res, 500, ErrorCode.INTERNAL_ERROR, message);
}

/**
 * Send a database error response
 */
export function sendDatabaseError(res: Response, message: string = "Database error"): void {
	sendErrorResponse(res, 500, ErrorCode.DATABASE_ERROR, message);
}
